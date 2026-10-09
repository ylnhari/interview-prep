"""Execute the actual displayed Python/SQL rather than another implementation."""
import html
import json
from pathlib import Path
import re
import sqlite3
import subprocess
import unittest

ROOT = Path(__file__).resolve().parent.parent
LOADER = """const fs=require('fs'),vm=require('vm');let s={window:{}};vm.createContext(s);
['library.js','llm-systems.js','sd-data.js','zz-interview-practice.js','zzz-audit-coding.js'].forEach(f=>vm.runInContext(fs.readFileSync('core/'+f,'utf8'),s));
console.log(JSON.stringify(s.window.PREP_CORE['coding-drills']));"""


class DisplayedReferences(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.topic = json.loads(subprocess.check_output(['node', '-e', LOADER], cwd=ROOT, text=True))
        cls.activities = {a['id']: a for a in cls.topic['activities']}

    def source(self, activity):
        return html.unescape(re.search(r'<pre><code>(.*?)</code></pre>', self.activities[activity]['model'], re.S)[1])

    def test_feature_contract(self):
        scope = {}
        exec(self.source('cdr-a1'), scope)
        f = scope['FeatureComputer'](10, 20)
        self.assertEqual(f.query('a', 0), dict(count=0, sum=0, mean=None, variance=None))
        self.assertEqual(f.add('one', 'a', 1, 2, 1), 'accepted')
        self.assertEqual(f.add('two', 'b', 0, 8, 2), 'accepted')  # global event-time reversal
        self.assertEqual(f.add('one', 'a', 1, 2, 3), 'duplicate')
        self.assertEqual(f.query('a', 3)['variance'], None)
        self.assertEqual(f.add('three', 'a', 2, 4, 3), 'accepted')
        self.assertEqual(f.query('a', 3)['variance'], 2)
        self.assertEqual(f.add('one', 'a', 1, 6, 4, 1), 'revised')
        self.assertEqual(f.query('a', 4)['sum'], 10)
        self.assertEqual(f.add('one', 'a', 1, 99, 5, 0), 'duplicate')
        self.assertEqual(f.add('late', 'a', -5, 7, 5), 'late')  # exact excluded lower bound
        self.assertEqual(f.query('a', 11)['count'], 1)
        self.assertEqual(f.query('a', 25)['count'], 0)  # idle expiry
        self.assertEqual(f.records, {})
        with self.assertRaises(ValueError):
            f.add('nan', 'a', 26, float('nan'), 26)
        with self.assertRaises(ValueError):
            f.query('a', 24)

    def test_sql_time_availability_and_ties(self):
        db = sqlite3.connect(':memory:')
        db.executescript('CREATE TABLE events(event_id TEXT PRIMARY KEY,customer_id TEXT,event_ts INTEGER,available_ts INTEGER,amount REAL,event_type TEXT); CREATE TABLE decisions(decision_id TEXT PRIMARY KEY,customer_id TEXT,prediction_ts INTEGER);')
        db.executemany('INSERT INTO events VALUES (?,?,?,?,?,?)', [
            ('a','x',0,0,1,'click'), ('b','x',3600,3600,2,'click'),
            ('c','x',3600,4000,8,'click'), ('d','x',3599,5000,16,'click'),
            ('e','x',3601,3601,None,'click')])
        db.executemany('INSERT INTO decisions VALUES (?,?,?)', [('d1','x',3600),('d2','x',7200),('empty','z',3600)])
        with self.assertRaises(sqlite3.IntegrityError):
            db.execute('INSERT INTO events VALUES (?,?,?,?,?,?)', ('a','x',0,0,99,'click'))
        statements = [s.strip() for s in self.source('cdr-a4').split(';') if s.strip()]
        self.assertEqual(db.execute(statements[0]).fetchall(), [('x','e')])
        self.assertEqual(db.execute(statements[1]).fetchall(), [('a',1),('b',27),('c',27),('d',17),('e',27)])
        self.assertEqual(db.execute(statements[2]).fetchall(), [('d1',1,1.0),('d2',3,10.0),('empty',0,0)])
        db.execute('DELETE FROM events')
        self.assertEqual(db.execute(statements[0]).fetchall(), [])
        self.assertEqual(db.execute(statements[1]).fetchall(), [])
        self.assertEqual(db.execute(statements[2]).fetchall(), [('d1',0,0),('d2',0,0),('empty',0,0)])

    def test_semantic_diagnostic_links(self):
        sections = {s['id']: s for s in self.topic['learn']}
        body = sections['cdr-diagnostic']['body']
        self.assertIn('#coding-drills/cdr-f4">SQL', body)
        self.assertIn('#coding-drills/cdr-testing-explanation">testing/explanation', body)
        self.assertIn('independent expected result', sections['cdr-testing-explanation']['body'])

    def test_top_k_displayed_merge(self):
        scope = {}
        exec(self.source('cdr-a2'), scope)
        top = scope['top_k_per_key']
        rows = [('x', 3, 'a', {}), ('x', 3, 'b', {}), ('x', 1, 'c', {}), ('y', 5, 'd', {})]
        expected = top(rows, 1)
        self.assertEqual(expected['x'][0][1], 'b')
        partial = [top(rows[:2], 1), top(rows[2:], 1)]
        merged = [(key, score, event_id, payload) for shard in partial
                  for key, values in shard.items() for score, event_id, payload in values]
        self.assertEqual(top(merged, 1), expected)
        self.assertEqual(top([], 3), {})
        self.assertEqual(top(rows, 0), {})
        with self.assertRaises(ValueError):
            top([('x', float('nan'), 'a', {})], 1)

    def displayed_logistic_scope(self):
        # This older answer uses one <code> line per <li>; execute those lines.
        lines = re.findall(r'<li><code>(.*?)</code></li>', self.activities['cdr-a3']['model'], re.S)
        scope = {}
        exec('\n'.join(html.unescape(x) for x in lines), scope)
        return scope

    def test_displayed_sigmoid_standalone(self):
        scope = self.displayed_logistic_scope()
        self.assertEqual(scope['sigmoid'](0), 0.5)
        self.assertEqual(scope['sigmoid'](-1000), 0)
        self.assertEqual(scope['sigmoid'](1000), 1)

    def test_displayed_train_standalone(self):
        scope = self.displayed_logistic_scope()
        weights, bias = scope['train']([[-1], [1]], [0, 1], epochs=1)
        self.assertEqual(len(weights), 1)
        self.assertGreater(weights[0], 0)
        self.assertTrue(isinstance(bias, float))

    def test_displayed_logistic_functions(self):
        scope = self.displayed_logistic_scope()
        self.assertEqual(scope['prec_rec'](2, 1, 1), (2/3, 2/3))
        self.assertEqual(scope['confusion']([0, 1, 1], [0.2, 0.8, 0.3], 0.5), (1, 0, 1, 1))
        weights, bias = scope['train']([[-2],[-1],[1],[2]], [0,0,1,1], epochs=100)
        self.assertGreater(weights[0], 0)
        self.assertLess(scope['sigmoid'](-weights[0]+bias), 0.5)
        self.assertGreater(scope['sigmoid'](weights[0]+bias), 0.5)


if __name__ == '__main__':
    unittest.main()
