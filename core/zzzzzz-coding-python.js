/* Python-first concept teaching. IDs, quizzes and ordered practice remain intact. */
(function (root) {
  'use strict';
  var chapter = root.PREP_CORE['coding-drills'];
  function code(text) { return '<pre><code class="language-python">' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></pre>'; }
  var teaching = {};
  teaching['cdr-arrays-hashing'] = `
<p>A Python <code>list</code> is a resizable array: use an index to retrieve an element. A hash map is Python's <code>dict</code>: use a key to retrieve associated information. Scanning a list of pairs to find a product can take O(n) time; a dictionary avoids writing that scan.</p>
<h2>Keys identify; values describe</h2>
<p>Choose the key from the question you will ask repeatedly. A number-to-index map answers “where did it appear?” A number-to-count map answers “how often?” A <code>set</code> suffices if you only need presence. Assigning an existing dictionary key replaces its value; values may repeat.</p>` + code(`prices = {"pear": 4, "plum": 3}
prices["pear"] = 5              # update; no second pear entry
prices["melon"] = 8             # insert
assert prices["pear"] == 5      # retrieve
assert "plum" in prices        # membership checks keys
assert prices.get("kiwi", 0) == 0  # missing-key default
del prices["plum"]
assert list(prices.items()) == [("pear", 5), ("melon", 8)]

counts = {}
for value in [4, 7, 4, 4]:
    counts[value] = counts.get(value, 0) + 1
assert counts == {4: 3, 7: 1}`) + `
<p><code>d[key]</code> raises <code>KeyError</code> when absent; <code>get</code> or membership handles absence. Keys must be hashable: strings, integers and tuples of hashable items work; lists do not. Equal keys share an entry, so <code>1</code> and <code>True</code> are not independent dictionary keys.</p>
<h2>Hashing and collisions</h2>
<p>A hash function turns a key into an integer used to locate table storage. In a toy ten-bucket table, <code>23 % 10</code> and <code>33 % 10</code> both select bucket 3: a collision. The table resolves collisions and compares actual keys; a hash is not a unique identity. Python's implementation is more sophisticated than this teaching rule.</p>
<p>For ordinary bounded-cost hashing/equality, lookup, membership and deletion average O(1), but may take O(n) in the worst case. Insertions average amortized O(1): occasional O(n) resizes spread across many inserts. Iteration and n entries require O(n) time and O(n) storage respectively. Hashing a newly encountered long string also costs work proportional to its length. A list's indexed access is O(1); membership is O(n), and append is amortized O(1).</p>
<h2>Recognize a lookup or range-sum problem</h2>
<p>“Duplicates,” “frequency,” “group by a property” and “find a pair” suggest remembered keys. In Two Sum, the key is a previously seen number and the value is its index; look for <code>target - current</code> <em>before</em> storing the current element, so it cannot match itself.</p>
<p>A prefix sum stores the total before an index. Subtract two prefixes for a range total. To count target-sum subarrays, remember how often each earlier prefix occurred. This works with negatives, where a positive-sum sliding window fails.</p>` + code(`prefix = [0]
for value in [2, -1, 3]:
    prefix.append(prefix[-1] + value)
assert prefix[3] - prefix[1] == 2  # sum over indices [1, 3)

seen = {0: 1}  # the empty prefix permits a range starting at zero
total = answer = 0
for value in [1, -1, 1]:
    total += value
    answer += seen.get(total - 1, 0)
    seen[total] = seen.get(total, 0) + 1
assert answer == 3`) + `<p>The frequency scan takes expected O(n) time and O(n) extra space; pathological hash collisions can increase time. Do not substitute a set when repeated prefixes must be counted, or overwrite an index when the earliest index is required. <a href="https://docs.python.org/3/tutorial/datastructures.html#dictionaries">Python dictionary operations</a> and the <a href="https://wiki.python.org/moin/TimeComplexity">CPython operation-cost reference</a> give the language details.</p>`;

  teaching['cdr-two-pointers'] = `
<p>Two pointers are indices that summarize what remains to inspect. For a sorted pair-sum search, <code>left</code> starts at the smallest value and <code>right</code> at the largest. If their sum is too small, moving right leftward cannot help; move left forward. If too large, move right backward. The sorting assumption is the reason this elimination is safe.</p>` + code(`values = [1, 3, 4, 8]
left, right, target = 0, len(values) - 1, 7
while left < right:
    pair_sum = values[left] + values[right]
    if pair_sum == target:
        break
    if pair_sum < target:
        left += 1
    else:
        right -= 1
assert (left, right) == (1, 2)`) + `
<h2>A sliding window describes a contiguous range</h2>
<p>Instead of opposite ends, maintain a window <code>[left, right]</code>. Add the incoming value when expanding; remove the outgoing value when shrinking. A fixed-size sum can update without summing each slice again.</p>` + code(`values, width = [2, 1, 5, 1, 3], 3
running = sum(values[:width])
sums = [running]
for right in range(width, len(values)):
    running += values[right] - values[right - width]
    sums.append(running)
assert sums == [8, 7, 9]`) + `
<p>For the shortest positive-valued window reaching a target, expand until valid, record its length, then shrink while it stays valid. Positivity gives monotonic behavior: removing a positive value cannot increase the sum. Arbitrary negative values invalidate that argument; use prefix-sum methods when the contract requires them.</p>
<p>Look for “sorted pair,” “contiguous subarray,” “longest substring” or “at most k distinct.” A substring window usually needs a frequency dictionary plus a validity condition. Each pointer moves at most n times, so these scans take O(n) time. Numeric windows use O(1) auxiliary space; frequency windows need O(number of retained distinct keys). Sorting first adds O(n log n) worst-case time and can lose original indices unless their mapping is retained. Avoid repeated list slicing, which copies the window, and clarify inclusive endpoints and zero- versus one-based answers.</p>`;

  teaching['cdr-binary-search'] = `
<p>Binary search uses a comparison to discard half of a sorted interval. It needs more than a small runtime target: the comparison must prove the discarded half cannot contain the answer. In Python, <code>bisect_left</code> returns the first insertion position before equal values; it does not promise the target exists.</p>` + code(`from bisect import bisect_left, bisect_right
values = [1, 3, 3, 8]
assert bisect_left(values, 3) == 1
assert bisect_right(values, 3) == 3
index = bisect_left(values, 5)
assert index == 3
assert not (index < len(values) and values[index] == 5)`) + `
<h2>Write down the boundary contract</h2>
<p>For a lower bound, use <code>[left, right)</code>: positions before left are too small; positions at or after right are large enough. Comparing the midpoint either advances left past it or moves right onto it. Every iteration shrinks the interval; when equal, the boundaries identify the first qualifying position, possibly len(values).</p>` + code(`def lower_bound(values, target):
    left, right = 0, len(values)
    while left < right:
        middle = (left + right) // 2
        if values[middle] < target:
            left = middle + 1
        else:
            right = middle
    return left

assert lower_bound([], 2) == 0
assert lower_bound([1, 3, 3, 8], 3) == 1
assert lower_bound([1, 3], 9) == 2`) + `
<p>“First/last occurrence,” “insertion position” and “minimum feasible capacity” are recognition cues. For answer-space search, prove feasibility changes in one direction only. Binary search takes O(log n) comparisons and O(1) auxiliary space for this index-based implementation; an expensive feasibility test multiplies that cost. Python <code>insort</code> still needs O(n) insertion because list elements shift. Do not copy recursive slices, mix inclusive/exclusive updates, or index an insertion point equal to n. See the <a href="https://docs.python.org/3/library/bisect.html#performance-notes">bisect performance notes</a>.</p>`;

  teaching['cdr-intervals-greedy'] = `
<p>Sorting creates an order that exposes the next safe decision. Python's <code>sorted(items, key=...)</code> returns a new list; <code>items.sort(key=...)</code> mutates the list and returns None. Use a tuple key to declare tie handling.</p>
<h2>Merging and selecting use different orders</h2>
<p>To merge overlapping closed intervals, sort by start, retain the current merged range, and extend its end while the next start is at most that end. Nested ranges must not shorten the retained end.</p>` + code(`intervals = [(5, 7), (1, 4), (2, 3), (7, 8)]
merged = []
for start, end in sorted(intervals):
    if merged and start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])
assert merged == [[1, 4], [5, 8]]`) + `
<p>To select the largest number of compatible meetings, sort by finish instead. Taking an earliest-finishing compatible meeting leaves at least as much room as a later-finishing alternative. Replacing that alternative proves the greedy choice is safe for this unweighted objective.</p>` + code(`meetings = [(0, 4), (1, 2), (2, 3), (3, 5)]
selected, last_end = [], float("-inf")
for start, end in sorted(meetings, key=lambda pair: pair[1]):
    if start >= last_end:
        selected.append((start, end))
        last_end = end
assert selected == [(1, 2), (2, 3), (3, 5)]`) + `
<p>Look for “merge ranges,” “minimum removals” or “maximum compatible activities.” Declare endpoints: the merge example joins touching closed ranges, while the meeting contract permits one meeting to start when another ends. Python comparison sorting costs O(n log n) worst-case time, followed by an O(n) scan. These examples retain O(n) sorted/output storage; in-place sorting can also use O(n) temporary memory. Earliest finish does not solve weighted scheduling, and a plausible greedy rule needs a proof or a counterexample—not just a successful small test.</p>`;

  teaching['cdr-stacks'] = `
<p>A stack removes the most recently added item first. Python's list supports <code>append</code>, <code>pop()</code> and <code>stack[-1]</code> for the top. Use it when the newest unresolved item must be handled before earlier ones: brackets, nested parsing, undo or depth-first traversal.</p>` + code(`stack = []
stack.append("(")
stack.append("[")
assert stack[-1] == "["
assert stack.pop() == "["
assert stack.pop() == "("`) + `
<p>For bracket matching, store opening symbols; each closing symbol must match the top, and the stack must be empty at the end. Check emptiness before accessing the top. List append is amortized O(1), though a resize can cost O(n); popping at the end is amortized O(1). Removing at index zero shifts elements and is not a stack operation.</p>
<h2>A monotonic stack retains unresolved candidates</h2>
<p>“Next greater,” “nearest smaller” and “days until warmer” suggest an ordered stack. Store indices when the answer needs distance. In the example, each stack index still awaits a strictly warmer day; an incoming warmer value resolves colder entries.</p>` + code(`temperatures = [70, 72, 72, 71, 75]
waiting = [0] * len(temperatures)
unresolved = []
for index, temperature in enumerate(temperatures):
    while unresolved and temperatures[unresolved[-1]] < temperature:
        earlier = unresolved.pop()
        waiting[earlier] = index - earlier
    unresolved.append(index)
assert waiting == [1, 3, 2, 1, 0]`) + `
<p>The loop may pop many items on one iteration, but each index is pushed and popped at most once: O(n) total time, O(n) auxiliary stack space, plus O(n) output. Equal temperatures do not resolve each other. Replacing strict comparison with non-strict comparison changes the question. Keep the stack invariant explicit; a sorted input assumption is not needed here.</p>`;

  teaching['cdr-linked-lists'] = `
<p>A linked list chains node objects through references. Python's built-in list is a resizable array, not a linked list. A node's <code>next</code> points to another node or None; reaching the kth node requires following references rather than indexed lookup.</p>` + code(`class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

head = Node(2, Node(4, Node(6)))
assert head.next.value == 4
# Insert after the head: preserve the old successor.
head.next = Node(3, head.next)
assert head.next.next.value == 4`) + `
<h2>Save a reference before overwriting it</h2>
<p>Reversal redirects every next reference. Save the original successor first, otherwise the remaining chain becomes unreachable through the current node. This mutates the original nodes; callers retaining the old head must use the returned new head.</p>` + code(`def reverse(head):
    previous, current = None, head
    while current is not None:
        successor = current.next
        current.next = previous
        previous, current = current, successor
    return previous

head = reverse(head)
values, current = [], head
while current is not None:
    values.append(current.value)
    current = current.next
assert values == [6, 4, 3, 2]
assert reverse(None) is None

def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

assert not has_cycle(head)
loop = Node(9)
loop.next = loop
assert has_cycle(loop)`) + `
<p>“Reverse links,” “merge sorted chains,” “middle node” and “cycle” signal reference operations. Insertion/deletion at a known node position can take O(1), but finding that position takes O(n). Reversal takes O(n) time and O(1) auxiliary references. Fast/slow cycle detection advances one pointer one edge and the other two; compare node identity with <code>is</code>, not equal values. Check <code>fast is not None and fast.next is not None</code> before advancing. Inside a cycle the relative offset changes by one each step, forcing a meeting. It takes O(n) time and O(1) extra space. Handle empty chains, self-cycles and duplicate values separately.</p>`;

  teaching['cdr-heaps'] = `
<p>A heap maintains just enough order to expose an extremum. Python's <code>heapq</code> operates on a list as a min-heap: <code>heap[0]</code> is the smallest item. The list is not fully sorted; indexed positions beyond zero have no ranking meaning.</p>` + code(`import heapq
heap = [7, 2, 5]
heapq.heapify(heap)
heapq.heappush(heap, 3)
assert heap[0] == 2
assert heapq.heappop(heap) == 2
assert heapq.heappop(heap) == 3`) + `
<h2>Retain the largest k with a min-heap</h2>
<p>The root should be the cheapest retained candidate to evict. Keep at most k values; when a new larger value appears, replace the minimum. The root then identifies the kth largest retained value, counting duplicates.</p>` + code(`def largest_k(values, k):
    if k <= 0:
        return []
    heap = []
    for value in values:
        if len(heap) < k:
            heapq.heappush(heap, value)
        elif value > heap[0]:
            heapq.heapreplace(heap, value)
    return sorted(heap, reverse=True)

assert largest_k([4, 1, 8, 8, 3], 2) == [8, 8]
assert largest_k([], 2) == []`) + `
<p>“Top k,” “next smallest job,” “merge sorted streams” and “running median” are cues. Heapify is O(n); peek is O(1); push/pop are O(log n) heap operations (a list resize can add occasional linear work). For positive k, bounded selection costs O(n log(k+1)) plus O(k log(k+1)) for the displayed sorted result, using O(k) storage. Writing k+1 also covers k=1 without suggesting zero work. Merging N items from k sorted streams retains one head per stream and costs O(N log(k+1)) time and O(k) heap space, excluding output. Use tuples such as <code>(priority, sequence_number, payload)</code> so equal priorities do not force comparison of unorderable payloads. A heap alone neither gives stable ties nor efficient arbitrary-item deletion. The <a href="https://docs.python.org/3/library/heapq.html#priority-queue-implementation-notes">heapq implementation notes</a> explain both.</p>`;

  teaching['cdr-trees'] = `
<p>A binary tree node has at most two children. A binary <em>search</em> tree adds an ordering contract: under a strict-key rule, every left descendant is smaller and every right descendant larger. A generic binary tree need not satisfy it.</p>` + code(`class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

root = TreeNode(4, TreeNode(2), TreeNode(7, TreeNode(5)))

def inorder(root):
    result, stack, current = [], [], root
    while current is not None or stack:
        while current is not None:
            stack.append(current)
            current = current.left
        current = stack.pop()
        result.append(current.value)
        current = current.right
    return result

assert inorder(root) == [2, 4, 5, 7]
assert inorder(None) == []`) + `
<h2>Let the requested result determine traversal order</h2>
<p>Preorder handles a node before children; inorder handles left, node, right; postorder handles children before the node. Depth and subtree totals naturally combine child results after traversal. Breadth-first traversal uses a deque to process levels. These are different orders, not different node types.</p>
<p>“Hierarchy,” “ancestor,” “subtree” and “level” suggest tree traversal. “Sorted tree” may permit ordered search, but the height matters: a balanced BST gives O(log n) search, while a chain gives O(n). Traversing n nodes costs O(n) time. The inorder example retains O(h) stack space for height h, plus O(n) output; h can be n. Breadth-first traversal can retain O(n) nodes at the widest level.</p>
<p>For BST validation, pass ancestor bounds down the tree. A node can satisfy its immediate parent yet violate an earlier ancestor. Decide whether duplicate keys are legal rather than silently using the wrong inequalities. Python recursion depth is finite; an explicit stack avoids interpreter recursion limits on long chains. Do not apply tree traversal without a visited set to a graph that may contain cycles or shared nodes.</p>`;

  teaching['cdr-graphs-ordering'] = `
<p>A graph stores vertices and edges. In Python, an adjacency dictionary maps each vertex to its neighbors; a grid can generate four-direction neighbors without constructing a separate dictionary. State whether edges are directed, whether costs exist, and whether diagonal moves are legal.</p>` + code(`from collections import deque
graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
distance = {"a": 0}
queue = deque(["a"])
while queue:
    node = queue.popleft()
    for neighbor in graph[node]:
        if neighbor not in distance:
            distance[neighbor] = distance[node] + 1
            queue.append(neighbor)
assert distance == {"a": 0, "b": 1, "c": 1, "d": 2}`) + `
<h2>Traversal, shortest hops and prerequisites are different questions</h2>
<p>BFS expands in increasing hop count, giving shortest paths when every edge has equal cost. DFS follows one branch deeply, useful for exploring components. Mark visited when scheduling a vertex, not after processing it, so converging paths do not schedule it repeatedly. Use deque rather than <code>list.pop(0)</code>.</p>
<p>“Islands,” “reachable,” “connected components,” “minimum number of moves” and “prerequisites” are cues. For a grid, explicitly reject out-of-bounds and visited cells; a disconnected graph needs another traversal start for each unseen component.</p>
<p>Prerequisites form a directed graph. Topological ordering places each prerequisite before its dependents. In Kahn's algorithm, count incoming edges, enqueue all zero-indegree vertices, then decrement neighbors when removing a vertex. If fewer than V vertices are removed, a directed cycle prevents a full ordering. Do not use an undirected component test to infer a valid prerequisite order.</p>
<p>With adjacency lists and ordinary constant-cost keyed access, traversal and topological sorting take O(V+E) time and O(V) auxiliary visited/queue/indegree space; the graph itself takes O(V+E) space. A rows-by-columns grid traversal is O(rows × columns) time and can retain that many cells. BFS does not minimize unequal weighted costs; use the next weighted-path lesson. <a href="https://cp-algorithms.com/graph/breadth-first-search.html">BFS shortest-hop reasoning</a> supplies the proof.</p>`;

  teaching['cdr-union-find'] = `
<p>Union-find, also called disjoint set union, tracks which component each item belongs to as connections are added. Python has no dedicated built-in DSU; two lists can store parent references and component sizes. A root represents its component, but its numeric identity has no application meaning.</p>` + code(`class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, node):
        while node != self.parent[node]:
            self.parent[node] = self.parent[self.parent[node]]
            node = self.parent[node]
        return node

    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b:
            return False
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a
        self.size[a] += self.size[b]
        return True

dsu = DSU(5)
assert dsu.union(0, 1)
assert dsu.union(1, 2)
assert dsu.find(0) == dsu.find(2)
assert not dsu.union(2, 0)
assert dsu.find(3) != dsu.find(0)`) + `
<p>Path compression shortens future parent walks. Union by size attaches the smaller component to the larger; updating a non-root's size is meaningless. The implementation uses iterative path halving, avoiding recursive stack growth.</p>
<p>“Connect items over time,” “number of components,” “redundant undirected edge” and “merge accounts” are cues. An undirected edge whose endpoints already share a root closes a cycle. DSU does not provide a shortest path, directed-cycle detection or ordinary edge deletion. Components are an equivalence relation, not a route through the graph.</p>
<p>Initialization and storage are O(n). With size weighting and compression, a sequence of operations has amortized O(α(n)) cost per operation, where α is the inverse Ackermann function: extremely slow-growing, but not mathematically constant. A single operation can still cost O(log n) under size weighting; the amortized bound describes the sequence. If external IDs are sparse strings, map them to dense indices or use parent dictionaries. <a href="https://cp-algorithms.com/data_structures/disjoint_set_union.html#time-complexity">DSU complexity and variants</a> explain the conditions.</p>`;

  teaching['cdr-shortest-paths'] = `
<p>Weighted paths minimize a sum of edge costs, not necessarily the number of edges. Dijkstra repeatedly settles the smallest current tentative distance. That distance is safe to settle because nonnegative edges cannot produce a cheaper later detour.</p>` + code(`import heapq

def shortest_distances(graph, source):
    distance, heap = {source: 0}, [(0, source)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost != distance[node]:
            continue  # an older, superseded tentative distance
        for neighbor, weight in graph[node]:
            if weight < 0:
                raise ValueError("Dijkstra requires nonnegative weights")
            candidate = cost + weight
            if candidate < distance.get(neighbor, float("inf")):
                distance[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))
    return distance

graph = {"a": [("b", 7), ("c", 2)], "b": [], "c": [("b", 1)], "z": []}
assert shortest_distances(graph, "a") == {"a": 0, "c": 2, "b": 3}`) + `
<h2>Relaxation improves an upper bound</h2>
<p>The dictionary contains best costs found so far. Relaxing an edge tests whether <code>distance[node] + weight</code> improves its neighbor. The lazy heap may retain older entries; skip them on removal. Otherwise obsolete entries cause redundant exploration and spoil the intended runtime bound.</p>
<p>Look for “cheapest route,” “minimum travel time” or “network delay.” Equal-cost edges permit BFS; zero/one edges permit a deque-based specialized algorithm; negative edges need a different algorithm. “Minimum effort” may minimize the maximum edge on a path instead of a sum, requiring a different relaxation rule.</p>
<p>This lazy binary-heap version uses O(V+E) storage including the graph and up to O(E) pending entries. A general bound is O((V+E) log(V+E)) heap/comparison work; for ordinary simple sparse graphs it is commonly expressed as O((V+E) log V). The example uses comparable string vertex IDs. Mixed unorderable IDs need a sequence counter in heap tuples. Unreachable vertices are absent, not zero-cost; preserve predecessors if the actual route is required. Assume finite, nonnegative weights and validate that contract at the input boundary. See <a href="https://cp-algorithms.com/graph/dijkstra_sparse.html">lazy-heap Dijkstra and stale entries</a>.</p>`;

  teaching['cdr-backtracking'] = `
<p>Backtracking enumerates choices while keeping only the current partial candidate. Choose an option, recurse, then undo that choice before its sibling. Python lists make the current path convenient, but saving the path itself would alias the same mutable object across results.</p>` + code(`def subsets(values):
    answers, path = [], []
    def visit(start):
        answers.append(path.copy())
        for index in range(start, len(values)):
            path.append(values[index])
            visit(index + 1)
            path.pop()  # restore exactly the state from before the choice
    visit(0)
    return answers

assert subsets([2, 5]) == [[], [2], [2, 5], [5]]
assert subsets([]) == [[]]`) + `
<h2>Prune only when a branch cannot help</h2>
<p>A candidate constraint can stop an impossible branch before exploring it: for positive combination-sum inputs, a partial sum above the target cannot be repaired by adding more positive values. Negatives invalidate that pruning rule. A board search instead prunes out-of-bounds, already-used or wrong-character cells; restore a visited cell after the recursive branch.</p>
<p>“Generate all,” “permutations,” “combinations,” “place pieces” and “word search” are cues. Clarify whether order distinguishes results, whether input values repeat, and whether an item can be reused. This subset example assumes distinct input values and advances the next start index so permutations of one subset are not produced.</p>
<p>There are 2ⁿ subsets; copying them costs O(n·2ⁿ) total time and output storage in the worst case. The recursion/path uses O(n) auxiliary space, excluding output. Permutation output instead grows as n!, so no data structure can make exhaustive output polynomial. Sorting and skipping equal sibling choices can avoid duplicate-value results, but skipping every equal value globally incorrectly removes valid choices. Python recursion limits matter for deep search; testing a small case does not establish scalability.</p>`;

  teaching['cdr-dynamic-programming'] = `
<p>Dynamic programming reuses answers to overlapping subproblems. Start by defining the state in a sentence; then write its base case and transition. Memoization caches recursive calls, while tabulation fills a table in an order that makes dependencies available.</p>
<h2>An exact-amount state avoids ambiguous meanings</h2>
<p>For minimum coins, <code>dp[a]</code> means the fewest coins achieving exactly amount a. Zero needs zero coins; other amounts begin unreachable. Trying a final coin reduces the problem to an earlier exact amount, and unlimited reuse is permitted by this contract.</p>` + code(`def minimum_coins(coins, amount):
    if amount < 0 or any(coin <= 0 for coin in coins):
        raise ValueError("amount must be nonnegative and coins positive")
    unreachable = amount + 1
    dp = [0] + [unreachable] * amount
    for subtotal in range(1, amount + 1):
        for coin in coins:
            if coin <= subtotal:
                dp[subtotal] = min(dp[subtotal], dp[subtotal - coin] + 1)
    return -1 if dp[amount] == unreachable else dp[amount]

assert minimum_coins([1, 3, 4], 6) == 2
assert minimum_coins([2], 3) == -1
assert minimum_coins([], 0) == 0`) + `
<p>“Number of ways,” “minimum cost,” “best score over prefixes” and recurring choices may signal DP. The recurrence must have overlapping subproblems and a state retaining everything future choices need. A graph traversal alone is not automatically DP.</p>
<p>For amount A and C coin types, this table costs O(A·C) time and O(A) space under bounded-cost arithmetic. It is pseudo-polynomial in the numeric amount: A can be huge relative to the number of bits needed to write it. Climbing Stairs has O(n) states and two dependencies, so rolling storage can reduce auxiliary space to O(1) integers; counts grow, so arbitrary-precision bit costs still matter.</p>
<p>Greedily taking the largest coin fails for [1,3,4] and amount 6. Counting combinations, counting ordered sequences and minimizing coin count are different states/transitions. Never initialize unreachable minimization states to zero. Compress storage only after proving update order preserves the dependencies; bounded one-use items and unlimited reuse require different directions. <a href="https://cp-algorithms.com/dynamic_programming/intro-to-dp.html">DP state and recurrence examples</a> expand the reasoning.</p>`;

  teaching['cdr-tries'] = `
<p>A trie shares character paths among strings with common prefixes. Python can represent each node with a children dictionary and a terminal marker. Traversing a path proves a prefix exists; only the marker proves a complete word exists.</p>` + code(`class TrieNode:
    def __init__(self):
        self.children = {}
        self.terminal = False

root = TrieNode()
def insert(word):
    node = root
    for character in word:
        if character not in node.children:
            node.children[character] = TrieNode()
        node = node.children[character]
    node.terminal = True

def follow(text):
    node = root
    for character in text:
        node = node.children.get(character)
        if node is None:
            return None
    return node

insert("apple")
insert("ape")
assert follow("app") is not None       # prefix exists
assert not follow("app").terminal      # exact word does not
assert follow("apple").terminal
assert follow("cat") is None`) + `
<h2>Choose a trie for shared-prefix work</h2>
<p>“Autocomplete,” “starts with,” “dictionary words on a board” and repeated prefix queries are cues. A hash set is simpler for exact-word membership alone. On a board, moving through trie children prunes a path as soon as no dictionary word can begin with it. This still requires backtracking and preventing reuse of one cell in the current path.</p>
<p>Insert, exact search and prefix search use O(L) expected transitions for a string of length L, assuming ordinary constant-cost character dictionary access. Storage is O(total inserted characters) nodes/edges in the worst case, with substantial Python object/dictionary overhead. Listing all completions also costs traversal/output work; it is not merely O(prefix length). Board search can remain exponential despite prefix pruning.</p>
<p>Do not treat every prefix as a word, overwrite a shared child, or confuse an empty children map with a terminal marker. Inserting an empty string marks the root terminal. Decide case normalization and character semantics before insertion; Python iteration visits Unicode code points rather than user-perceived grapheme clusters. Deletion must preserve nodes shared by other words.</p>`;

  teaching['cdr-bits'] = `
<p>Bit operations work on binary digits. In Python, <code>&amp;</code> keeps bits set in both inputs, <code>|</code> keeps bits set in either, <code>^</code> keeps differing bits, and shifts move bit positions. A mask identifies the positions you want to inspect or change.</p>` + code(`READ, WRITE, EXECUTE = 1 << 0, 1 << 1, 1 << 2
permissions = READ | WRITE
assert permissions & READ
permissions &= ~WRITE
assert not (permissions & WRITE)
assert permissions == READ

unique = 0
for value in [6, 2, 6, 4, 2]:
    unique ^= value
assert unique == 4`) + `
<h2>Cancellation and one-bit transitions</h2>
<p>XOR cancels equal values: <code>x ^ x == 0</code> and <code>x ^ 0 == x</code>. Folding XOR isolates one unique value only under the contract that every other value occurs exactly twice. If several values occur once, their XOR need not identify any of them.</p>` + code(`def count_set_bits(value):
    if value < 0:
        raise ValueError("this loop requires a nonnegative integer")
    count = 0
    while value:
        value &= value - 1  # clear the lowest set bit
        count += 1
    return count

assert count_set_bits(0) == 0
assert count_set_bits(13) == 3
assert (13).bit_count() == 3
assert (-1 & ((1 << 8) - 1)) == 255  # explicit eight-bit representation`) + `
<p>“Flags,” “subset mask,” “one unpaired value” and “count set bits” are cues. A mask is compact when the number of states is small; enumerating all masks for n items still gives 2ⁿ possibilities.</p>
<p>Python integers have arbitrary precision. Under a fixed-width machine model, bit operations are constant-cost and the clearing loop performs one iteration per set bit. For a Python integer with b bits, the loop has at most b iterations, with O(b²) a conservative bit-work bound for repeated full-width operations and O(b) auxiliary bit storage. XOR scanning n bounded-width values takes O(n) time and one accumulator; unbounded values change that operation cost.</p>
<p>Python's <code>~x</code> equals <code>-x - 1</code>, not an unsigned fixed-width complement. Apply an explicit width mask when that representation is intended. Negative integers do not terminate this clearing loop, and <code>int.bit_count()</code> counts ones in the absolute value rather than an implicit fixed-width signed representation. See <a href="https://docs.python.org/3/library/stdtypes.html#bitwise-operations-on-integer-types">Python integer bit semantics</a>.</p>`;

  Object.keys(teaching).forEach(function (id) {
    var lesson = chapter.learn.find(function (section) { return section.id === id; });
    if (!lesson) throw new Error('Missing Python concept lesson: ' + id);
    var resources = lesson.body.indexOf('<p><b>Learn.</b>');
    if (resources < 0) throw new Error('Missing retained teaching resources: ' + id);
    lesson.body = teaching[id] + lesson.body.slice(resources);
  });
}(typeof window !== 'undefined' ? window : this));
