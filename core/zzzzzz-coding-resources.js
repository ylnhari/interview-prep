/* Curated topic learning destinations; stable lessons, checks and practice links retained. */
(function (root) {
  var chapter = root.PREP_CORE["coding-drills"];
  var pages = {
  "cdr-arrays-hashing": [
    [
      "Arrays",
      "https://www.hello-algo.com/en/chapter_array_and_linkedlist/array/"
    ],
    [
      "Hash tables",
      "https://www.hello-algo.com/en/chapter_hashing/hash_map/"
    ],
    [
      "Collision handling",
      "https://www.hello-algo.com/en/chapter_hashing/hash_collision/"
    ],
    [
      "Prefix sums",
      "https://usaco.guide/silver/prefix-sums?lang=py"
    ],
    [
      "Prefix sums + hash map: worked example",
      "https://neetcode.io/solutions/subarray-sum-equals-k"
    ]
  ],
  "cdr-two-pointers": [
    ["Sliding windows: fixed size", "https://www.hellointerview.com/learn/code/sliding-window/fixed-length"],
    ["Sliding windows: variable size", "https://www.hellointerview.com/learn/code/sliding-window/variable-length"],
    ["Two pointers: separate concept", "https://usaco.guide/silver/two-pointers?lang=py"]
  ],
  "cdr-binary-search": [
    [
      "Binary search",
      "https://www.hello-algo.com/en/chapter_searching/binary_search/"
    ],
    [
      "Binary search duplicate boundaries",
      "https://www.hello-algo.com/en/chapter_searching/binary_search_edge/"
    ]
  ],
  "cdr-intervals-greedy": [
    [
      "Merge sort",
      "https://www.hello-algo.com/en/chapter_sorting/merge_sort/"
    ],
    [
      "Merging intervals: worked example",
      "https://neetcode.io/solutions/merge-intervals"
    ],
    [
      "Greedy interval scheduling",
      "https://usaco.guide/silver/greedy-sorting?lang=py"
    ]
  ],
  "cdr-stacks": [
    [
      "Stack foundations",
      "https://www.hello-algo.com/en/chapter_stack_and_queue/stack/"
    ],
    [
      "Monotonic stack: worked example",
      "https://neetcode.io/solutions/daily-temperatures"
    ]
  ],
  "cdr-linked-lists": [
    [
      "Linked lists",
      "https://www.hello-algo.com/en/chapter_array_and_linkedlist/linked_list/"
    ],
    [
      "Fast/slow pointers: worked example",
      "https://neetcode.io/solutions/linked-list-cycle"
    ]
  ],
  "cdr-heaps": [
    [
      "Heap implementation",
      "https://www.hello-algo.com/en/chapter_heap/heap/"
    ],
    [
      "Building a heap",
      "https://www.hello-algo.com/en/chapter_heap/build_heap/"
    ],
    [
      "Merging sorted lists with a heap: worked example",
      "https://neetcode.io/solutions/merge-k-sorted-lists"
    ]
  ],
  "cdr-trees": [
    [
      "Binary trees",
      "https://www.hello-algo.com/en/chapter_tree/binary_tree/"
    ],
    [
      "Tree traversal",
      "https://www.hello-algo.com/en/chapter_tree/binary_tree_traversal/"
    ],
    [
      "Binary search trees",
      "https://www.hello-algo.com/en/chapter_tree/binary_search_tree/"
    ]
  ],
  "cdr-graphs-ordering": [
    [
      "Graph BFS and DFS",
      "https://www.hello-algo.com/en/chapter_graph/graph_traversal/"
    ],
    [
      "Topological sorting with Python",
      "https://usaco.guide/gold/toposort?lang=py"
    ],
    [
      "Topological-sort visual exploration (optional)",
      "https://visualgo.net/en/dfsbfs"
    ]
  ],
  "cdr-union-find": [
    [
      "Disjoint sets: explanation and animation",
      "https://visualgo.net/en/ufds"
    ],
    [
      "Disjoint sets: Python implementation",
      "https://github.com/stevenhalim/cpbook-code/blob/master/ch2/ourown/unionfind_ds.py"
    ]
  ],
  "cdr-shortest-paths": [
    [
      "Dijkstra: explanation, Python and worked diagrams",
      "https://runestone.academy/ns/books/published/pythonds3/Graphs/DijkstrasAlgorithm.html"
    ],
    [
      "Dijkstra: complexity analysis",
      "https://runestone.academy/ns/books/published/pythonds3/Graphs/AnalysisofDijkstrasAlgorithm.html"
    ]
  ],
  "cdr-backtracking": [
    [
      "Backtracking",
      "https://www.hello-algo.com/en/chapter_backtracking/backtracking_algorithm/"
    ],
    [
      "Permutations: worked implementation and complexity",
      "https://www.hello-algo.com/en/chapter_backtracking/permutations_problem/"
    ]
  ],
  "cdr-dynamic-programming": [
    [
      "Dynamic programming: recursion, memoization and tabulation",
      "https://www.hello-algo.com/en/chapter_dynamic_programming/intro_to_dynamic_programming/"
    ],
    [
      "Dynamic programming solution pipeline",
      "https://www.hello-algo.com/en/chapter_dynamic_programming/dp_solution_pipeline/"
    ]
  ],
  "cdr-tries": [
    [
      "Tries: concepts and diagrams",
      "https://www.interviewcake.com/concept/python/trie"
    ],
    [
      "Trie implementation and complexity: worked example",
      "https://neetcode.io/solutions/implement-trie-prefix-tree"
    ]
  ],
  "cdr-bits": [
    [
      "Python bitwise operations",
      "https://realpython.com/python-bitwise-operators/"
    ],
    [
      "Fixed-width bitmask visualization",
      "https://visualgo.net/en/bitmask"
    ]
  ]
};
  var practice = {
  "cdr-arrays-hashing": [
    "<a href=\"https://leetcode.com/problems/two-sum/\">Two Sum</a>",
    "<a href=\"https://leetcode.com/problems/subarray-sum-equals-k/\">Subarray Sum Equals K</a>"
  ],
  "cdr-two-pointers": [
    "<a href=\"https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/\">Two Sum II - Input Array Is Sorted</a>",
    "<a href=\"https://leetcode.com/problems/minimum-size-subarray-sum/\">Minimum Size Subarray Sum</a>"
  ],
  "cdr-binary-search": [
    "<a href=\"https://leetcode.com/problems/binary-search/\">Binary Search</a>",
    "<a href=\"https://leetcode.com/problems/search-insert-position/\">Search Insert Position</a>"
  ],
  "cdr-intervals-greedy": [
    "<a href=\"https://leetcode.com/problems/merge-intervals/\">Merge Intervals</a>",
    "<a href=\"https://leetcode.com/problems/non-overlapping-intervals/\">Non-overlapping Intervals</a>"
  ],
  "cdr-stacks": [
    "<a href=\"https://leetcode.com/problems/valid-parentheses/\">Valid Parentheses</a>",
    "<a href=\"https://leetcode.com/problems/daily-temperatures/\">Daily Temperatures</a>"
  ],
  "cdr-linked-lists": [
    "<a href=\"https://leetcode.com/problems/reverse-linked-list/\">Reverse Linked List</a>",
    "<a href=\"https://leetcode.com/problems/linked-list-cycle/\">Linked List Cycle</a>"
  ],
  "cdr-heaps": [
    "<a href=\"https://leetcode.com/problems/kth-largest-element-in-an-array/\">Kth Largest Element in an Array</a>",
    "<a href=\"https://leetcode.com/problems/merge-k-sorted-lists/\">Merge k Sorted Lists</a>"
  ],
  "cdr-trees": [
    "<a href=\"https://leetcode.com/problems/maximum-depth-of-binary-tree/\">Maximum Depth of Binary Tree</a>",
    "<a href=\"https://leetcode.com/problems/validate-binary-search-tree/\">Validate Binary Search Tree</a>"
  ],
  "cdr-graphs-ordering": [
    "<a href=\"https://leetcode.com/problems/number-of-islands/\">Number of Islands</a>",
    "<a href=\"https://leetcode.com/problems/course-schedule/\">Course Schedule</a>"
  ],
  "cdr-union-find": [
    "<a href=\"https://leetcode.com/problems/redundant-connection/\">Redundant Connection</a>",
    "<a href=\"https://leetcode.com/problems/accounts-merge/\">Accounts Merge</a>"
  ],
  "cdr-shortest-paths": [
    "<a href=\"https://leetcode.com/problems/network-delay-time/\">Network Delay Time</a>",
    "<a href=\"https://leetcode.com/problems/path-with-minimum-effort/\">Path With Minimum Effort</a>"
  ],
  "cdr-backtracking": [
    "<a href=\"https://leetcode.com/problems/subsets/\">Subsets</a>",
    "<a href=\"https://leetcode.com/problems/combination-sum/\">Combination Sum</a>"
  ],
  "cdr-dynamic-programming": [
    "<a href=\"https://leetcode.com/problems/climbing-stairs/\">Climbing Stairs</a>",
    "<a href=\"https://leetcode.com/problems/coin-change/\">Coin Change</a>"
  ],
  "cdr-tries": [
    "<a href=\"https://leetcode.com/problems/implement-trie-prefix-tree/\">Implement Trie (Prefix Tree)</a>",
    "<a href=\"https://leetcode.com/problems/word-search-ii/\">Word Search II</a>"
  ],
  "cdr-bits": [
    "<a href=\"https://leetcode.com/problems/single-number/\">Single Number</a>",
    "<a href=\"https://leetcode.com/problems/counting-bits/\">Counting Bits</a>"
  ]
};
  Object.keys(pages).forEach(function (id) {
    var lesson = chapter.learn.find(function (s) { return s.id === id; });
    lesson.body = "<ul>" + pages[id].map(function (r) { return '<li><a href="' + r[1] + '">' + r[0] + "</a></li>"; }).join("") + "</ul><p>LeetCode practice:</p><ol>" + practice[id].map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ol>";
    lesson.deeper = null;
  });
  chapter.learn.find(function (s) { return s.id === "cdr-heaps"; }).title = "Heaps and merging sorted lists";
  chapter.learn.find(function (s) { return s.id === "cdr-shortest-paths"; }).title = "Dijkstra’s shortest paths";
}(typeof window !== "undefined" ? window : this));
