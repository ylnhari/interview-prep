/* Generic learn-then-solve algorithm curriculum. Existing IDs and quizzes stay intact. */
(function (root) {
  'use strict';
  var chapter = root.PREP_CORE['coding-drills'];
  var book = 'https://runestone.academy/ns/books/published/pythonds3/';
  var guide = 'https://usaco.guide/';
  // Learning pages and problem statements were read on this date; submission
  // access and paid editorials are not required by the course.
  var checkedAt = '2026-10-11';
  var lessons = [
    {
      id: 'cdr-arrays-hashing', title: 'Arrays, hashing and prefix sums',
      mechanism: 'A hash map stores information about earlier elements so a later element can find its partner. For range sums, let prefix[i] be the sum before index i: sum over [left, right) is prefix[right] - prefix[left]. Counting earlier prefixes equal to current_sum - target handles negative values, where a sum-based sliding window can fail. Initialize the empty prefix count to one; query before inserting the current prefix.',
      sources: [['Runestone: hashing', book + 'SortSearch/Hashing.html', 'Compare collision handling and expected lookup costs.'], ['USACO Guide: prefix sums', guide + 'silver/prefix-sums', 'Trace the empty prefix and range boundaries.']],
      problems: [['Two Sum', 'two-sum'], ['Subarray Sum Equals K', 'subarray-sum-equals-k']],
      test: 'Test duplicate values, all zeros and a negative value. For [1, -1, 1] with target 1, the count is 3.',
      hint: 'Two Sum needs previously seen values and their indices. The follow-up counts prefix frequencies, not just whether a prefix exists. Both use expected O(n) time and O(n) extra space under ordinary hash-table assumptions.',
      question: 'Why must a prefix-frequency solution start with count[0] = 1?', correct: 'It counts valid subarrays starting at the first element.', distractors: ['It forces every subarray to have length one.', 'It removes negative values.']
    },
    {
      id: 'cdr-two-pointers', title: 'Two pointers and sliding windows',
      mechanism: 'On a sorted array, a pair sum below the target permits moving the left pointer forward; a sum above it permits moving the right pointer backward. A contiguous window uses different reasoning: expand its right edge and shrink its left edge while a declared condition permits it. For a minimum positive-sum window, record a valid length before shrinking. Positivity makes the sum change monotonically; arbitrary negative values invalidate that argument.',
      sources: [['USACO Guide: two pointers', guide + 'silver/two-pointers', 'Compare pointers at opposite ends with a moving contiguous window.']],
      problems: [['Two Sum II - Input Array Is Sorted', 'two-sum-ii-input-array-is-sorted'], ['Minimum Size Subarray Sum', 'minimum-size-subarray-sum']],
      test: 'Test a pair at the ends, repeated values and a target no window reaches. State whether returned indices are one-based.',
      hint: 'Each pointer advances at most n times. The pair search and positive-sum window take O(n) time and O(1) extra space. Do not sort a problem that requires original positions without retaining their mapping.',
      question: 'Which property supports shrinking a minimum-sum window in this practice problem?', correct: 'All array values are positive.', distractors: ['The array may contain arbitrary negative values.', 'The array is already a heap.']
    },
    {
      id: 'cdr-binary-search', title: 'Binary search and boundary contracts',
      mechanism: 'Binary search discards half a sorted search interval using a comparison that rules out that half. Choose one interval convention and keep it throughout. For a lower bound with [left, right), every position before left is too small and every position at or after right is large enough. Stop when left equals right; this also represents insertion at the end. Searching an answer space additionally requires a feasibility test that changes from false to true only once.',
      sources: [['Runestone: binary search', book + 'SortSearch/TheBinarySearch.html', 'Trace interval reduction, then implement using indices rather than recursive slices.']],
      problems: [['Binary Search', 'binary-search'], ['Search Insert Position', 'search-insert-position']],
      test: 'Test an empty helper input, one element, absent targets and insertion before the first or after the last element.',
      hint: 'Compare the midpoint, then update a boundary so the interval strictly shrinks. An iterative index-based search takes O(log n) time and O(1) extra space; copying slices changes that space cost.',
      question: 'What prevents a binary-search loop from running forever?', correct: 'Every nonterminal iteration strictly shrinks the search interval.', distractors: ['The midpoint is always zero.', 'The target must be present.']
    },
    {
      id: 'cdr-intervals-greedy', title: 'Sorting, intervals and greedy proofs',
      mechanism: 'Sorting by start time puts overlapping intervals next to one another: merge into the current interval while the next start is within its end. Selecting the maximum number of non-overlapping intervals is a different task: choose the next compatible interval with the earliest finish. An exchange argument replaces a later-finishing first choice without reducing the remaining choices. Declare endpoint semantics: Merge Intervals joins touching closed intervals; Non-overlapping Intervals permits touching endpoints.',
      sources: [['Runestone: merge sort', book + 'SortSearch/TheMergeSort.html', 'Understand comparison sorting and its O(n log n) running time.'], ['USACO Guide: greedy sorting', guide + 'silver/greedy-sorting', 'Read the earliest-finish proof and counterexamples to other greedy rules.']],
      problems: [['Merge Intervals', 'merge-intervals'], ['Non-overlapping Intervals', 'non-overlapping-intervals']],
      test: 'Test nested intervals, identical intervals and [1, 2] next to [2, 3]. Explain why the two tasks treat that boundary differently.',
      hint: 'Sort by start to merge, by finish to retain the largest compatible subset. Minimum removals equals the input count minus the retained count. Sorting dominates at O(n log n); output and sorting workspace depend on the implementation.',
      question: 'Which ordering supports maximum-cardinality interval scheduling?', correct: 'Earliest finish among compatible intervals.', distractors: ['Earliest start is always optimal.', 'Longest interval first is always optimal.']
    },
    {
      id: 'cdr-stacks', title: 'Stacks and monotonic stacks',
      mechanism: 'A stack matches a closing delimiter with the most recent unmatched opening delimiter. A monotonic stack instead retains unresolved candidates in an ordered sequence. For warmer temperatures, store indices whose answer is still unknown; a strictly warmer day resolves and pops colder days. Equal temperatures are not warmer. Each index is pushed and popped at most once, giving O(n) total time even though a single iteration can pop many entries.',
      sources: [['Runestone: balanced parentheses', book + 'BasicDS/SimpleBalancedParentheses.html', 'Follow the unmatched-opening invariant.'], ['USACO Guide: monotonic stacks', guide + 'gold/stacks', 'Trace which unresolved candidates survive each new value.']],
      problems: [['Valid Parentheses', 'valid-parentheses'], ['Daily Temperatures', 'daily-temperatures']],
      test: 'Test a closing delimiter with an empty stack, mismatched types and equal or decreasing temperatures.',
      hint: 'Reject an unmatched closing delimiter and require an empty stack at the end. For temperatures, the difference of indices is the waiting time; unresolved entries retain zero. Both use O(n) worst-case extra space.',
      question: 'Why is the warmer-temperature stack algorithm O(n) overall?', correct: 'Each index enters and leaves the stack at most once.', distractors: ['Every iteration pops exactly one item.', 'The input is sorted first.']
    },
    {
      id: 'cdr-linked-lists', title: 'Linked lists and fast/slow pointers',
      mechanism: 'A linked list exposes references rather than constant-time indexed access. To reverse it, save the next node before redirecting the current reference to the previous node. Losing that saved reference loses access to the remaining list. Cycle detection uses a slow pointer moving one edge and a fast pointer moving two; once both are inside a cycle their relative position changes by one per step, so they eventually meet.',
      sources: [['Runestone: linked lists', book + 'BasicDS/ImplementinganUnorderedListLinkedLists.html', 'Trace node references and updates before writing pointer code.']],
      problems: [['Reverse Linked List', 'reverse-linked-list'], ['Linked List Cycle', 'linked-list-cycle']],
      test: 'Test an empty list, one node and a self-cycle. State whether your function mutates the original list.',
      hint: 'Reverse with previous/current/saved-next references. For cycle detection compare node identity, not equal stored values, and check fast and fast.next before advancing. Both take O(n) time and O(1) extra space.',
      question: 'Which comparison detects a meeting in cycle detection?', correct: 'The pointers reference the same node.', distractors: ['The nodes merely store equal values.', 'The list has two nodes.']
    },
    {
      id: 'cdr-heaps', title: 'Heaps, selection and merging sorted streams',
      mechanism: 'A min-heap exposes the smallest retained item. For the k largest values, keep at most k values and discard the smallest when capacity is exceeded; its root is then the kth largest. Merging sorted lists needs a different heap: retain the next item from each nonempty list, emit the smallest and advance only that list. Include a unique tie field when payload objects cannot be compared.',
      sources: [['Python documentation: heapq', 'https://docs.python.org/3/library/heapq.html', 'Read heap invariants, bounded selection, merging and priority-queue tie handling.']],
      problems: [['Kth Largest Element in an Array', 'kth-largest-element-in-an-array'], ['Merge k Sorted Lists', 'merge-k-sorted-lists']],
      test: 'Test equal priorities, k=1 and empty input lists. Kth largest counts duplicates; it is not kth distinct.',
      hint: 'Selection takes O(n log k) time and O(k) extra space using a bounded heap. Merging N total nodes from k lists takes O(N log k) time and O(k) heap space, excluding the output.',
      question: 'In a size-k min-heap retaining the largest values, what is the root?', correct: 'The smallest retained value, which is the kth largest seen.', distractors: ['The largest value in the input.', 'The kth distinct value regardless of duplicates.']
    },
    {
      id: 'cdr-trees', title: 'Binary trees, traversal and search-tree bounds',
      mechanism: 'A tree traversal visits each node in a defined order. Maximum depth combines the depths of both children: an empty tree has depth zero, and a nonempty tree has one plus their maximum. A binary search tree requires every descendant to obey bounds inherited from ancestors; checking only each node against its immediate children misses violations farther down. An inorder traversal produces increasing values when the strict search-tree contract holds.',
      sources: [['Runestone: tree traversals', book + 'Trees/TreeTraversals.html', 'Compare preorder, inorder and postorder, and the information returned by a recursive call.']],
      problems: [['Maximum Depth of Binary Tree', 'maximum-depth-of-binary-tree'], ['Validate Binary Search Tree', 'validate-binary-search-tree']],
      test: 'Test a chain, duplicate keys and a descendant that satisfies its parent but violates an ancestor bound.',
      hint: 'Carry strict lower and upper bounds through validation. Both tasks visit O(n) nodes. Recursive traversal uses O(h) stack space for height h, which can be n; an explicit stack avoids interpreter recursion limits.',
      question: 'Why can comparing a node only with its children miss an invalid search tree?', correct: 'A deeper descendant can violate an ancestor bound.', distractors: ['Every binary tree is already ordered.', 'Only leaf values matter.']
    },
    {
      id: 'cdr-graphs-ordering', title: 'Graph traversal, grids and dependency order',
      mechanism: 'An adjacency list records a vertex\'s neighbors; a grid can generate neighbors without building that list. Breadth-first or depth-first traversal groups reachable land cells into an island. Directed prerequisites require cycle detection or topological ordering: repeatedly remove vertices with zero incoming prerequisites and decrement their dependents. If fewer than all vertices are removed, a cycle remains. Connectivity and dependency order use different graph contracts.',
      sources: [['Runestone: breadth-first search', book + 'Graphs/ImplementingBreadthFirstSearch.html', 'Follow visited marking and the queue.'], ['Runestone: topological sorting', book + 'Graphs/TopologicalSorting.html', 'Understand why prerequisite ordering needs a directed graph without cycles.']],
      problems: [['Number of Islands', 'number-of-islands'], ['Course Schedule', 'course-schedule']],
      test: 'Test disconnected components, isolated vertices, diagonal-only grid contact and a directed cycle.',
      hint: 'Mark cells when scheduled so they are not counted twice. For prerequisites, count processed vertices after removing zero-indegree vertices. Graph traversal is O(V+E); grid traversal is O(rows times columns), with worst-case linear visited/queue space.',
      question: 'A prerequisite graph has vertices left after all zero-indegree vertices are removed. What follows?', correct: 'The remaining dependencies contain a directed cycle.', distractors: ['The graph must be disconnected but acyclic.', 'Every remaining vertex is ready to execute.']
    },
    {
      id: 'cdr-union-find', title: 'Union-find and incremental connectivity',
      mechanism: 'Union-find represents disjoint components by a parent forest. find returns the component representative; union joins two different representatives. Path compression shortens future find operations, and union by size attaches the smaller tree to the larger. An undirected edge connecting vertices already in the same component closes a cycle. This structure answers connectivity, not shortest paths, and ordinary union-find does not support deleting an edge.',
      sources: [['USACO Guide: disjoint set union', guide + 'gold/dsu', 'Read component representatives, path compression and union by size.']],
      problems: [['Redundant Connection', 'redundant-connection'], ['Accounts Merge', 'accounts-merge']],
      test: 'Test a repeated union, a cycle-closing edge and accounts sharing an email indirectly. Equal names alone do not establish identity.',
      hint: 'Initialize every item as its own component. Redundant Connection detects equal roots before union. Accounts Merge joins shared emails, then groups and sorts output. With both optimizations, operations have near-constant amortized cost; sorting merged output adds its own cost.',
      question: 'What does an undirected edge between vertices with the same representative imply?', correct: 'A path already connects them, so the new edge closes a cycle.', distractors: ['Their shortest distance is zero.', 'Their component must contain every vertex.']
    },
    {
      id: 'cdr-shortest-paths', title: 'Weighted shortest paths and path objectives',
      mechanism: 'Breadth-first search minimizes edge count when edge costs are equal. With nonnegative weights, Dijkstra\'s algorithm processes the smallest tentative distance from a priority queue and relaxes edges when a better route is found. Skip stale heap entries. Path With Minimum Effort changes the objective: a route costs its largest height difference, so extending it uses max(current_effort, edge_difference), rather than adding weights. The path objective determines the update.',
      sources: [['Runestone: Dijkstra\'s algorithm', book + 'Graphs/DijkstrasAlgorithm.html', 'Trace tentative distances, edge relaxation and the nonnegative-weight condition.']],
      problems: [['Network Delay Time', 'network-delay-time'], ['Path With Minimum Effort', 'path-with-minimum-effort']],
      test: 'Test an unreachable vertex, a route improved after discovery and a longer route with smaller maximum effort.',
      hint: 'Network Delay Time returns the maximum shortest distance if every vertex is reachable, otherwise -1. The follow-up uses the max-based update. A lazy binary-heap graph implementation has O((V+E) log(V+E)) time and O(V+E) worst-case auxiliary space.',
      question: 'How is the effort of an extended route computed in Path With Minimum Effort?', correct: 'Take the maximum of the route effort and the new edge difference.', distractors: ['Always add all edge differences.', 'Count the number of visited cells only.']
    },
    {
      id: 'cdr-backtracking', title: 'Recursion, backtracking and pruning',
      mechanism: 'Backtracking explores a choice, recurses on the remaining choices, then restores the state before exploring another choice. For subsets, advance the starting index so each element is chosen at most once. For Combination Sum, the same candidate may be reused: keep its index when recursing, and use a nondecreasing choice order to avoid permutation duplicates. With positive candidates, a remaining target below zero can be pruned.',
      sources: [['Runestone: exploring a maze', book + 'Recursion/ExploringaMaze.html', 'Trace recursive exploration, stopping conditions and rejected branches; then apply choose/explore/undo to combinations.']],
      problems: [['Subsets', 'subsets'], ['Combination Sum', 'combination-sum']],
      test: 'Test the empty subset, impossible targets and candidate reuse. Copy a completed result before later mutations change it.',
      hint: 'Store a copy of the path at the required stopping condition and undo every append. Subsets produces 2^n outputs, with O(n times 2^n) output-writing cost. Combination search depends on the target and candidates; it is not generally polynomial.',
      question: 'Why must a stored subset be copied from the working path?', correct: 'Later backtracking mutates the working path.', distractors: ['Copying removes all exponential work.', 'Recursion cannot store arrays.']
    },
    {
      id: 'cdr-dynamic-programming', title: 'Dynamic programming: states before transitions',
      mechanism: 'Dynamic programming stores answers to repeated subproblems. Define what each state means, its base cases and the order that makes dependencies available. For stairs, ways[i] counts ways to reach step i and combines the preceding one- and two-step states. For minimum coins, dp[amount] is the fewest coins achieving that exact amount; initialize zero to zero and other states as unreachable. Taking the largest available coin is not generally optimal.',
      sources: [['Runestone: dynamic programming', book + 'Recursion/DynamicProgramming.html', 'Compare repeated recursion, cached subproblems and bottom-up coin-change tables.']],
      problems: [['Climbing Stairs', 'climbing-stairs'], ['Coin Change', 'coin-change']],
      test: 'Test small stair counts, amount zero, an unreachable amount and coins [1, 3, 4] for amount 6: the optimum uses two 3s.',
      hint: 'Stair counting takes O(n) time and can keep only two previous states. Coin Change takes O(amount times number of denominations) time and O(amount) space for a standard table. It minimizes coin count, not the number of combinations.',
      question: 'What does dp[a] mean in the minimum-coin formulation?', correct: 'The fewest coins needed to achieve exactly amount a.', distractors: ['The number of coin orderings for amount a.', 'The largest coin no greater than a.']
    },
    {
      id: 'cdr-tries', title: 'Tries and prefix-guided string search',
      mechanism: 'A trie stores a string one character per edge, sharing nodes for common prefixes. A terminal marker distinguishes a complete word from a prefix. Insert, exact search and prefix search take O(L) transitions for length L, assuming constant-time child lookup. Combining a trie with board backtracking rejects paths that cannot begin any requested word. Restore visited cells after a branch, and avoid reporting the same word repeatedly.',
      sources: [['CP-Algorithms: construction of the trie', 'https://cp-algorithms.com/string/aho_corasick.html#construction-of-the-trie', 'Read only Construction of the trie first; failure links and the later multi-pattern automaton are optional advanced material.']],
      problems: [['Implement Trie (Prefix Tree)', 'implement-trie-prefix-tree'], ['Word Search II', 'word-search-ii']],
      test: 'Insert apple, then distinguish searching app from testing whether app is a prefix. On a board, prevent reusing one cell within the same word.',
      hint: 'Use a children map and a separate terminal flag. Word Search II combines the trie with <a href="#coding-drills/cdr-backtracking">backtracking</a>; prefix pruning reduces exploration but does not remove exponential worst-case board search.',
      question: 'After inserting only apple, what should exact search for app return?', correct: 'False, even though app is a valid prefix.', distractors: ['True because every prefix is a word.', 'True only when the trie uses a hash map.']
    },
    {
      id: 'cdr-bits', title: 'Bit operations and compact state',
      mechanism: 'Bitwise exclusive OR (XOR) cancels equal integer values: x XOR x is zero, and x XOR zero is x. If exactly one value appears once and every other value appears twice, combining all values isolates the single one. For nonnegative integer i, clearing its lowest set bit gives i & (i-1), so count[i] = count[i & (i-1)] + 1. Declare integer width and signed-value assumptions before transferring bit tricks between languages.',
      sources: [['CP-Algorithms: bit manipulation', 'https://cp-algorithms.com/algebra/bit-manipulation.html', 'Read XOR identities, bit masks and clearing a set bit; distinguish fixed-width examples from Python integers.']],
      problems: [['Single Number', 'single-number'], ['Counting Bits', 'counting-bits']],
      test: 'Test zero, paired duplicates and a power of two. Python integers have arbitrary precision; do not assume a fixed machine width.',
      hint: 'Fold XOR for Single Number, using O(n) operations and O(1) accumulator variables under a bounded-integer model. Counting Bits builds all results from zero through n in O(n) operations and O(n) output space; arbitrary-precision operation costs also depend on bit length.',
      question: 'Which input contract makes a simple XOR fold isolate the unique value?', correct: 'One value occurs once and every other value occurs twice.', distractors: ['Any number of values can occur once.', 'Every other value can occur any odd number of times.']
    }
  ];
  function link(label, url) { return '<a href="' + url + '">' + label + '</a>'; }
  chapter.learn[0].body += '<ul><li><b>Prefix sum</b> - a cumulative total before an index, used to subtract a range total.</li><li><b>Lower bound</b> - the first position whose value is at least a target.</li><li><b>Greedy choice and exchange argument</b> - choose one locally preferred option, then prove it can replace a choice in an optimal solution without making that solution worse.</li><li><b>Monotonic stack</b> - a stack retaining candidates in increasing or decreasing order.</li><li><b>Node identity</b> - the same referenced object, not merely an equal stored value.</li><li><b>Traversal and inorder</b> - visiting tree nodes in an order; inorder visits left subtree, node, then right subtree.</li><li><b>Adjacency list</b> - each graph vertex\'s neighbors; V counts vertices and E counts edges.</li><li><b>Indegree and topological order</b> - incoming-edge count and an order placing each prerequisite before its dependent.</li><li><b>Union-find</b> - a parent forest joining disjoint components; path compression shortens parent chains and union by size attaches the smaller component.</li><li><b>Relaxation</b> - improving a tentative path cost using a newly considered edge.</li><li><b>Backtracking and pruning</b> - explore and undo a choice; stop a branch that cannot produce a valid result.</li><li><b>Trie and terminal marker</b> - a character-edge prefix tree and a flag marking a complete word.</li><li><b>Bitwise XOR and set bit</b> - exclusive OR compares corresponding bits; a set bit has value one.</li></ul>';
  var starter = chapter.learn.find(function (s) { return s.id === 'cdr-f1'; });
  starter.title = 'Six starter patterns, with pseudocode models';
  starter.body += '<p>Choose a topic from <a href="#coding-drills/cdr-arrays-hashing">arrays and hashing</a> through <a href="#coding-drills/cdr-bits">bit operations</a> when you need a fuller explanation and paired practice. Read the learning resource, solve the starter without its editorial, then attempt the follow-up and explain the invariant, complexity and edge cases. Learning pages and problem statements checked 2026-10-11; LeetCode submissions may require sign-in and some editorials may require payment. The linked statements can also be solved locally.</p>';
  lessons.forEach(function (lesson) {
    var learn = lesson.sources.map(function (s) { return link(s[0], s[1]) + ': ' + s[2]; }).join(' ');
    var solve = lesson.problems.map(function (p, i) { return (i ? 'Then: ' : 'Start: ') + link(p[0], 'https://leetcode.com/problems/' + p[1] + '/'); }).join('. ');
    chapter.learn.push({id: lesson.id, part: 'field', title: lesson.title,
      body: '<p>' + lesson.mechanism + '</p><p><b>Learn.</b> ' + learn + '</p><p><b>Solve.</b> ' + solve + '.</p><p><b>Test and explain.</b> ' + lesson.test + '</p>',
      deeper: '<p>' + lesson.hint + '</p>',
      check: {question: lesson.question, options: [lesson.correct].concat(lesson.distractors), answer: 0, explain: lesson.correct + ' ' + lesson.hint},
      resourceCheckedAt: checkedAt
    });
  });
}(typeof window !== 'undefined' ? window : this));
