"""Validate the fifteen resource-first coding pages; Python implementations now live at their teaching destinations."""
import json
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parent.parent
LOADER = """const fs=require('fs'),vm=require('vm'),window={};
for(const f of ['library.js',...fs.readdirSync('core').filter(f=>f.endsWith('.js')&&f!=='library.js').sort()])vm.runInNewContext(fs.readFileSync('core/'+f,'utf8'),{window});
console.log(JSON.stringify(window.PREP_CORE['coding-drills'].learn.filter(s=>s.presentation==='learn-solve')));"""

class CodingLearningDestinations(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lessons = json.loads(subprocess.check_output(['node', '-e', LOADER], cwd=ROOT, text=True, encoding='utf-8'))

    def test_clean_learning_links_before_practice(self):
        self.assertEqual(len(self.lessons), 15)
        for lesson in self.lessons:
            with self.subTest(lesson=lesson['id']):
                body = lesson['body']
                self.assertIsNone(lesson['deeper'])
                self.assertNotRegex(body, r'<(pre|code|textarea|details)|Test and explain|Access:|Estimated study budget')
                self.assertLess(body.index('<ul>'), body.index('LeetCode practice:'))
                self.assertEqual(len(re.findall(r'https://leetcode.com/problems/', body)), 2)
                links = re.findall(r'<a href="(https://[^"]+)">([^<]+)</a>', body)
                self.assertGreaterEqual(len(links), 3)
                self.assertTrue(all(label.strip() for _, label in links))
                self.assertTrue(lesson['check']['explain'])

    def test_worked_examples_distinct_from_unsolved_practice(self):
        for lesson in self.lessons:
            for url, label in re.findall(r'<a href="([^"]+)">([^<]+)</a>', lesson['body']):
                if url.startswith('https://neetcode.io/solutions/'):
                    self.assertIn('worked example', label)
                if url.startswith('https://leetcode.com/problems/'):
                    self.assertNotIn('worked example', label)

    def test_precise_algorithm_scope(self):
        by_id = {s['id']: s for s in self.lessons}
        self.assertIn('Dijkstra', by_id['cdr-shortest-paths']['title'])
        self.assertIn('Collision handling', by_id['cdr-arrays-hashing']['body'])
        self.assertIn('Topological sorting with Python', by_id['cdr-graphs-ordering']['body'])
        self.assertIn('Fixed-width bitmask', by_id['cdr-bits']['body'])

if __name__ == '__main__':
    unittest.main()
