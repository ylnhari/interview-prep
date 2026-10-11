"""Run the Python actually shown in all fifteen public concept lessons."""
import html
import itertools
import json
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parent.parent
LOADER = """const fs=require('fs'),vm=require('vm'),window={};
for(const f of ['library.js',...fs.readdirSync('core').filter(f=>f.endsWith('.js')&&f!=='library.js').sort()])vm.runInNewContext(fs.readFileSync('core/'+f,'utf8'),{window});
console.log(JSON.stringify(window.PREP_CORE['coding-drills'].learn.filter(s=>s.presentation==='learn-solve')));"""


class PythonConcepts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lessons = json.loads(subprocess.check_output(['node', '-e', LOADER], cwd=ROOT, text=True, encoding='utf-8'))
        cls.scopes = {}
        for lesson in cls.lessons:
            scope = {}
            for snippet in re.findall(r'<pre><code class="language-python">(.*?)</code></pre>', lesson['body'], re.S):
                exec(compile(html.unescape(snippet), lesson['id'], 'exec'), scope)
            cls.scopes[lesson['id']] = scope

    def test_every_concept_has_teaching_before_retained_resources(self):
        self.assertEqual(len(self.lessons), 15)
        for lesson in self.lessons:
            with self.subTest(lesson=lesson['id']):
                body = lesson['body']
                self.assertLess(body.index('language-python'), body.index('<b>Learn.</b>'))
                self.assertGreater(len(re.sub('<[^>]+>', '', body).split()), 190)
                self.assertIn('O(', body)
                self.assertRegex(body, r'(?i)(cue|look for|suggest|signal|recognize)')
                self.assertNotRegex(body, r'<(details|textarea)|Artifact:|Predeclare')
                self.assertEqual(len(re.findall(r'https://leetcode.com/problems/', body)), 2)

    def test_lower_bound_against_independent_count(self):
        lower = self.scopes['cdr-binary-search']['lower_bound']
        for length in range(6):
            for values in itertools.combinations_with_replacement(range(3), length):
                for target in range(-1, 5):
                    self.assertEqual(lower(values, target), sum(value < target for value in values))

    def test_heap_selection_duplicates_and_capacity(self):
        select = self.scopes['cdr-heaps']['largest_k']
        for values in itertools.product(range(-1, 2), repeat=4):
            for k in range(6):
                self.assertEqual(select(values, k), sorted(values, reverse=True)[:k])

    def test_reference_reversal_identity_and_empty(self):
        scope = self.scopes['cdr-linked-lists']
        node, reverse = scope['Node'], scope['reverse']
        tail = node(3)
        middle = node(3, tail)
        head = node(3, middle)
        result = reverse(head)
        self.assertIs(result, tail)
        self.assertIs(result.next, middle)
        self.assertIs(result.next.next, head)
        self.assertIsNone(head.next)
        self.assertIsNone(reverse(None))
        has_cycle = scope['has_cycle']
        self.assertFalse(has_cycle(result))
        head.next = result
        self.assertTrue(has_cycle(result))

    def test_union_find_against_component_sets(self):
        dsu = self.scopes['cdr-union-find']['DSU'](8)
        groups = [{i} for i in range(8)]
        for a, b in [(0, 1), (2, 3), (1, 2), (6, 7), (0, 3), (4, 7), (3, 7)]:
            ga = next(group for group in groups if a in group)
            gb = next(group for group in groups if b in group)
            self.assertEqual(dsu.union(a, b), ga is not gb)
            if ga is not gb:
                ga.update(gb)
                groups.remove(gb)
            for x, y in itertools.product(range(8), repeat=2):
                self.assertEqual(dsu.find(x) == dsu.find(y), any(x in g and y in g for g in groups))

    def test_dijkstra_against_repeated_edge_relaxation(self):
        shortest = self.scopes['cdr-shortest-paths']['shortest_distances']
        edges = [(0, 1, 4), (0, 2, 1), (2, 1, 0), (1, 3, 2), (2, 3, 9), (3, 0, 2)]
        graph = {i: [] for i in range(5)}
        for a, b, weight in edges:
            graph[a].append((b, weight))
        expected = {0: 0}
        for _ in range(4):
            for a, b, weight in edges:
                if a in expected:
                    expected[b] = min(expected.get(b, float('inf')), expected[a] + weight)
        self.assertEqual(shortest(graph, 0), expected)
        with self.assertRaises(ValueError):
            shortest({0: [(1, -1)], 1: []}, 0)

    def test_subsets_are_independent_copies(self):
        subsets = self.scopes['cdr-backtracking']['subsets']
        for size in range(6):
            actual = subsets(list(range(size)))
            expected = {tuple(c) for k in range(size + 1) for c in itertools.combinations(range(size), k)}
            self.assertEqual({tuple(c) for c in actual}, expected)
            self.assertEqual(len({id(c) for c in actual}), len(actual))

    def test_coin_minimum_against_breadth_first_amount_search(self):
        minimum = self.scopes['cdr-dynamic-programming']['minimum_coins']
        for coins in [[], [2], [1, 3, 4], [2, 5], [3, 7]]:
            for amount in range(18):
                frontier, visited, answer = {0}, {0}, -1
                for depth in range(amount + 1):
                    if amount in frontier:
                        answer = depth
                        break
                    frontier = {value + coin for value in frontier for coin in coins if value + coin <= amount} - visited
                    visited.update(frontier)
                self.assertEqual(minimum(coins, amount), answer)
        for coins in [[0], [-1, 2]]:
            with self.assertRaises(ValueError):
                minimum(coins, 3)

    def test_trie_word_prefix_and_empty_distinction(self):
        scope = self.scopes['cdr-tries']
        insert, follow = scope['insert'], scope['follow']
        self.assertFalse(follow('app').terminal)
        insert('app')
        self.assertTrue(follow('app').terminal)
        self.assertTrue(follow('apple').terminal)
        insert('')
        self.assertTrue(follow('').terminal)
        self.assertIsNone(follow('aq'))

    def test_bits_against_binary_representation(self):
        count = self.scopes['cdr-bits']['count_set_bits']
        for value in list(range(256)) + [1 << 200, (1 << 200) - 1]:
            self.assertEqual(count(value), bin(value).count('1'))
        with self.assertRaises(ValueError):
            count(-1)


if __name__ == '__main__':
    unittest.main()
