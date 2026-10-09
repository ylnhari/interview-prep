"""Run learner-visible attention code and small adversarial metric fixtures."""
import html
import json
import math
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]

def course():
    script = "global.window=global;require('./core/library.js');require('fs').readdirSync('./core').filter(x=>x.endsWith('.js')&&x!=='library.js').sort().forEach(x=>require('./core/'+x));console.log(JSON.stringify(PREP_CORE))"
    return json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True, encoding='utf-8'))

class DisplayedMLFixtures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.content = course()
        activity = next(x for x in cls.content['deep-learning-essentials']['activities'] if x['id'] == 'dle-a3')
        source = html.unescape(re.search(r'<code class="language-python">(.*?)</code>', activity['model'], re.S)[1])
        namespace = {}
        exec(compile(source, 'displayed-dle-a3', 'exec'), namespace)
        cls.attention = staticmethod(namespace['attention'])

    def test_nonsquare_cross_attention(self):
        out = self.attention([[1, 0], [0, 1]], [[1, 0], [0, 1], [0, 0]], [[1, 0, 2, 3], [0, 1, 4, 5], [2, 2, 6, 7]])
        self.assertEqual((len(out), len(out[0])), (2, 4))
        self.assertTrue(all(math.isfinite(x) for row in out for x in row))

    def test_causal_mask_and_fully_masked_row(self):
        out = self.attention([[1], [1]], [[1], [1]], [[2], [10]], [[True, False], [True, True]])
        self.assertEqual(out, [[2.0], [6.0]])
        with self.assertRaisesRegex(ValueError, 'fully masked'):
            self.attention([[1]], [[1]], [[2]], [[False]])

    def test_shape_and_extreme_score(self):
        with self.assertRaises(ValueError):
            self.attention([], [[1]], [[2]])
        with self.assertRaises(ValueError):
            self.attention([[1, 2]], [[1]], [[2]])
        out = self.attention([[10000]], [[10000], [-10000]], [[3], [99]])
        self.assertEqual(out, [[3.0]])

    def test_mask_broadcast_equivalence_and_invalid_shapes(self):
        q, k, v = [[1, 0], [0, 1]], [[1, 0], [0, 1], [0, 0]], [[2], [10], [99]]
        key = [True, True, False]
        expected = self.attention(q, k, v, [key, key])
        self.assertEqual(self.attention(q, k, v, key), expected)
        self.assertEqual(self.attention(q, k, v, [key]), expected)
        for mask in ([True], [[True, False]], [key, key, key],
                     [[True, True, False], [True]], [1, 1, 0],
                     [[[True, True, False]]], 'all'):
            with self.subTest(mask=mask):
                with self.assertRaisesRegex(ValueError, 'mask must be boolean'):
                    self.attention(q, k, v, mask)

    def test_packed_examples_need_attention_boundary(self):
        batch = json.loads((ROOT / 'engine/fixtures/ai-diagnostics.json').read_text(encoding='utf-8'))['batch']
        ids, positions = batch['example_ids'], batch['position_ids']
        size = len(ids)
        # Q/K use the actual reset positions: both examples have identical
        # within-example position representations, but no boundary is implied.
        q = [[float(position), 1.0] for position in positions]
        k = [row[:] for row in q]
        v = [[float(i+1)] for i in range(size)]
        perturbed = [[row[0]+1000 if ids[i] == ids[0] else row[0]] for i,row in enumerate(v)]
        causal = [[j <= i for j in range(size)] for i in range(size)]
        isolated = [[j <= i and ids[j] == ids[i] for j in range(size)] for i in range(size)]
        causal_before = self.attention(q, k, v, causal)
        causal_after = self.attention(q, k, perturbed, causal)
        isolated_before = self.attention(q, k, v, isolated)
        isolated_after = self.attention(q, k, perturbed, isolated)
        second = [i for i,example in enumerate(ids) if example != ids[0]]
        self.assertTrue(second)
        for i in second:
            self.assertGreater(abs(causal_after[i][0]-causal_before[i][0]), 1)
            self.assertEqual(isolated_after[i], isolated_before[i])

    def test_threshold_counterexample_and_auc_ties(self):
        labels = [1, 0, 1]
        self.assertEqual(sum(labels[:2])/2, .5)
        self.assertGreater(sum(labels)/3, .5)
        scores = [.9, .5, .5]
        pairs = [(scores[i], scores[j]) for i,y in enumerate(labels) if y for j,z in enumerate(labels) if not z]
        auc = sum((p > n) + .5*(p == n) for p,n in pairs)/len(pairs)
        self.assertEqual(auc, .75)

    def test_conformal_finite_sample_edge(self):
        source = (ROOT / 'core/library.js').read_text(encoding='utf-8')
        data, _ = json.JSONDecoder().raw_decode(source.split('window.PREP_CORE =', 1)[1].lstrip())
        section = next(x for x in data['forecasting-uq']['learn'] if x['id'] == 'uq-3')
        code = html.unescape(re.search(r'<code class="language-python">(.*?)</code>', section['deeper'], re.S)[1])
        namespace = {}
        exec(compile(code, 'displayed-uq-3', 'exec'), namespace)
        radius = namespace['split_conformal_radius']
        self.assertEqual(radius(list(range(9)), .1), 8)
        self.assertTrue(math.isinf(radius([1, 2, 3, 4], .1)))
        self.assertEqual(radius([4, 1, 3, 2], .4), 3)
        for scores in ([], [math.nan], [-1]):
            with self.assertRaises(ValueError):
                radius(scores, .1)

    def test_loss_average_does_not_identify_predictions(self):
        # True-class probabilities .4 and .625 have product .25.
        loss = -sum(math.log(x) for x in [.4, .625])/2
        self.assertAlmostEqual(loss, math.log(2))
        self.assertNotEqual([.4, .625], [.5, .5])

    def displayed_function(self, topic, section, function):
        lesson = next(x for x in self.content[topic]['learn'] if x['id'] == section)
        code = html.unescape(re.search(r'<code class="language-python">(.*?)</code>', lesson['deeper'], re.S)[1])
        namespace = {}
        exec(compile(code, section, 'exec'), namespace)
        return namespace[function]

    def test_fixed_judged_universe(self):
        ndcg = self.displayed_function('recommendation-systems', 'rec-ranking', 'ndcg')
        judged = {'A': 3, 'B': 1, 'C': 0}
        self.assertAlmostEqual(ndcg(['B'], judged, 1), 1/7)
        self.assertEqual(ndcg(['A'], judged, 1), 1)
        self.assertEqual(ndcg([], judged, 1), 0)
        self.assertEqual(ndcg(['C'], {'C': 0}, 1), 0)
        for returned in (['A', 'A'], ['unknown']):
            with self.assertRaises(ValueError):
                ndcg(returned, judged, 1)

    def test_multiple_comparisons_displayed_arithmetic(self):
        summary = self.displayed_function('experimentation-and-causal-measurement', 'exp-stop', 'false_positive_summary')
        expected, chance = summary(20, .05)
        self.assertEqual(expected, 1)
        self.assertAlmostEqual(chance, .6415140775914581)
        self.assertEqual(summary(0, .05), (0, 0))

if __name__ == '__main__':
    unittest.main()
