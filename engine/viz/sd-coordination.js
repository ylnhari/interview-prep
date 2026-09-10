/* sd-coordination diagrams: caching and distributed systems/coordination. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  /* --------------------------------------------------------------- caching */

  V['cache-aside-flow'] = function (u) {
    var b = D(u, 'ar aa ag aw');
    b += HD('cache-aside: fill on miss, hit next time');
    b += T(380, 40, 'first request for key k (a miss)', { s: 10, c: 'var(--ink-dim)' });
    b += B(20, 48, 150, 46, '1 app asks~for key k', { ts: 10 });
    b += B(210, 48, 150, 46, '2 cache miss~key not found', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += B(400, 48, 150, 46, '3 read origin~(the database)', { ts: 10 });
    b += B(590, 48, 150, 46, '4 write to cache~then return value', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 170, 71, 206, 71);
    b += A(u, 360, 71, 396, 71, { c: 'var(--warning)', m: 'aw' });
    b += A(u, 550, 71, 586, 71);
    b += F('M170 71H206M360 71H396M550 71H586');
    b += T(380, 122, 'next request for key k', { s: 10, c: 'var(--ink-dim)' });
    b += B(20, 140, 150, 46, '5 app asks~for key k', { ts: 10 });
    b += B(590, 140, 150, 46, 'cache HIT~no origin call', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 170, 163, 586, 163, { c: 'var(--good)', m: 'ag' });
    b += F('M170 163H586', { c: 'var(--good)' });
    return S(196, b);
  };
  C['cache-aside-flow'] = 'On a miss the application itself reads the origin and fills the cache; the very next request for the same key is a <b>hit</b> and never reaches the origin at all.';

  V['write-through-vs-behind'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('write-through vs. write-behind');
    b += T(160, 40, 'write-through', { s: 11, w: 1 });
    b += T(560, 40, 'write-behind (write-back)', { s: 11, w: 1 });
    b += LN(380, 34, 380, 208, { c: 'var(--border)', d: '3 4' });
    b += B(50, 52, 140, 38, 'application', { ts: 10 });
    b += B(50, 108, 140, 38, 'cache', { ts: 10 });
    b += B(50, 164, 140, 38, 'origin (DB)', { ts: 10 });
    b += A(u, 120, 90, 120, 106);
    b += F('M120 90V106');
    b += A(u, 120, 146, 120, 162);
    b += F('M120 146V162');
    b += AP(u, 'M50 127H10V71H48', { m: 'ag', c: 'var(--good)' });
    b += T(30, 100, 'ack only after~origin confirms', { s: 9, c: 'var(--good)', a: 'middle' });
    b += B(430, 52, 140, 38, 'application', { ts: 10 });
    b += B(430, 108, 140, 38, 'cache + buffer', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(430, 164, 140, 38, 'origin (DB)', { ts: 10 });
    b += A(u, 500, 90, 500, 106);
    b += F('M500 90V106');
    b += AP(u, 'M430 118H390V64H428', { m: 'ag', c: 'var(--good)' });
    b += T(410, 92, 'ack~immediately', { s: 9, c: 'var(--good)', a: 'middle' });
    b += AP(u, 'M500 146V162', { d: '4 4', c: 'var(--ink-dim)' });
    b += F('M500 146V162', { d: '4 5', c: 'var(--ink-dim)', cls: 'v-flow-slow' });
    b += T(590, 154, 'later,~batched', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += GROW(R(590, 110, 26, 26, { f: 'var(--accent-weak)', sk: 'var(--accent)', r: 4 }));
    b += T(603, 150, 'buffer', { s: 9, c: 'var(--ink-dim)' });
    return S(216, b);
  };
  C['write-through-vs-behind'] = 'Write-through only <b>acknowledges</b> after the origin confirms; write-behind acknowledges immediately and flushes its buffer to the origin later, batched.';

  V['lru-list'] = function (u) {
    var b = D(u, 'ar aa ad');
    b += HD('LRU: hash map + doubly linked list');
    b += B(300, 20, 200, 28, 'hash map~key -> node', { ts: 10, f: 'var(--surface-3)' });
    var nx = [30, 200, 370, 540], ny = 96, nw = 150, nh = 40;
    var labs = ['D~head (MRU)', 'C', 'B', 'A~tail (LRU)'];
    var i;
    for (i = 0; i < 4; i++) {
      b += B(nx[i], ny, nw, nh, labs[i], { ts: 10, f: i === 3 ? 'var(--danger-weak)' : 'var(--surface-2)', sk: i === 3 ? 'var(--danger)' : 'var(--border)' });
    }
    for (i = 0; i < 3; i++) {
      b += A(u, nx[i] + nw, ny + 14, nx[i + 1], ny + 14, { c: 'var(--ink-dim)' });
      b += A(u, nx[i + 1], ny + 28, nx[i] + nw, ny + 28, { c: 'var(--ink-dim)' });
    }
    b += AP(u, 'M400 48V80', { d: '3 4', c: 'var(--ink-dim)', m: 'none' });
    b += AP(u, 'M500 48Q560 70 545 92', { d: '3 4', c: 'var(--ink-dim)', m: 'ar' });
    b += T(430, 60, 'O(1) lookup~straight to the node', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += GROW(AP(u, 'M370 96C300 60 150 60 100 94', { c: 'var(--accent)', m: 'aa', d: '4 4' }));
    b += T(230, 58, 'access C: move to head', { s: 10, c: 'var(--accent)' });
    b += AP(u, 'M690 116H730V150', { c: 'var(--danger)', m: 'ad' });
    b += T(700, 168, 'evict at tail', { s: 10, c: 'var(--danger)', a: 'middle', cls: 'v-blink' });
    return S(190, b);
  };
  C['lru-list'] = 'The hash map jumps straight to a node; a hit moves it to the <b>head</b> in O(1), and eviction always removes the node at the <b>tail</b>.';

  V['cache-stampede'] = function (u) {
    var b = D(u, 'ar aa ad'), i;
    b += HD('cache stampede: one key, many concurrent misses');
    b += B(280, 20, 200, 28, 'key k just expired', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)', cls: 'v-blink' });
    var cx = [40, 220, 400, 580], labs = ['client 1', 'client 2', 'client 3', 'client 4'];
    for (i = 0; i < 4; i++) {
      b += B(cx[i], 60, 130, 34, labs[i], { ts: 10 });
      b += AP(u, 'M' + (cx[i] + 65) + ' 94Q' + (cx[i] + 65) + ' 118 380 128', { c: 'var(--ink-dim)', m: 'none', d: '3 4' });
    }
    b += B(320, 120, 120, 34, 'single-flight:~first one computes', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 380, 154, 380, 176, { c: 'var(--accent)', m: 'aa' });
    b += F('M380 154V176', { c: 'var(--accent)' });
    b += B(300, 180, 160, 32, 'origin (DB): 1 call', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += T(600, 140, 'others wait,~then reuse the result', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += AP(u, 'M440 128Q520 128 560 130', { d: '3 4', c: 'var(--ink-dim)', m: 'ar' });
    return S(224, b);
  };
  C['cache-stampede'] = 'Every concurrent miss for the <b>same key</b> converges on the one call already in progress; only that call reaches the origin, and the rest share its result.';

  /* -------------------------------------------------- distributed systems */

  V['consistency-spectrum'] = function (u) {
    var b = D(u, 'ar');
    b += HD('the consistency spectrum');
    var segs = [
      { lab: 'linearizable', f: 'var(--accent)', c: 'var(--accent-ink)', ex: 'balance check right after a transfer' },
      { lab: 'sequential', f: 'var(--accent-weak)', c: 'var(--ink)', ex: 'a replicated log applied in one order' },
      { lab: 'causal', f: 'var(--surface-3)', c: 'var(--ink)', ex: 'a reply never precedes its comment' },
      { lab: 'read-your-writes /~monotonic reads', f: 'var(--surface-2)', c: 'var(--ink)', ex: 'you always see your own last edit' },
      { lab: 'eventual', f: 'var(--surface)', c: 'var(--ink-dim)', ex: 'replicas agree once writes stop' }
    ];
    var x0 = 30, w = 140, gap = 4, i;
    for (i = 0; i < 5; i++) {
      var x = x0 + i * (w + gap);
      b += R(x, 70, w, 34, { f: segs[i].f, sk: 'var(--border)', r: 5 });
      b += ML(x + w / 2, 87, segs[i].lab, { ts: 10, tc: segs[i].c });
      b += T(x + w / 2, 122, segs[i].ex, { s: 8.5, c: 'var(--ink-dim)' });
    }
    b += AP(u, 'M30 50H710', { c: 'var(--ink-dim)', m: 'none' });
    b += DT(30, 50, 3, { f: 'var(--ink-dim)' });
    b += GROW(DT(30, 50, 4, { f: 'var(--accent)', cls: 'v-move-x', st: DXS(680) }));
    b += T(30, 40, 'stronger, more coordination', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += T(710, 40, 'weaker, less coordination', { s: 9, c: 'var(--ink-dim)', a: 'end' });
    b += T(380, 150, 'every model to the left promises strictly more than every model to its right', { s: 10, c: 'var(--ink-dim)' });
    return S(168, b);
  };
  C['consistency-spectrum'] = 'A dot slides across the spectrum: every model to the <b>left</b> costs more coordination and promises strictly more than the ones to its right.';

  V['quorum-w-r-n'] = function (u) {
    var b = D(u, 'ar aa ag'), i;
    b += HD('quorum: W + R > N guarantees overlap');
    var xs = [80, 220, 360, 500, 640], y = 60, r = 22;
    b += T(360, 40, 'N = 5 replicas', { s: 10, c: 'var(--ink-dim)' });
    for (i = 0; i < 5; i++) {
      var isOverlap = i === 2;
      b += DT(xs[i], y, r, { f: isOverlap ? 'var(--accent)' : 'var(--surface-3)', sk: isOverlap ? 'var(--good)' : 'var(--border)', sw: isOverlap ? 3 : 1.2, cls: isOverlap ? 'v-pulse' : '' });
      b += T(xs[i], y + 4, 'n' + (i + 1), { s: 10, c: isOverlap ? 'var(--accent-ink)' : 'var(--ink)' });
    }
    b += LN(58, 100, 382, 100, { c: 'var(--accent)', w: 2 });
    b += T(220, 116, 'W = 3 write quorum', { s: 10, c: 'var(--accent)' });
    b += LN(338, 130, 662, 130, { c: 'var(--good)', w: 2 });
    b += T(500, 146, 'R = 3 read quorum', { s: 10, c: 'var(--good)' });
    b += T(360, 172, 'n3 sits in both quorums - a read is guaranteed to see the latest write', { s: 10, c: 'var(--ink-dim)' });
    b += T(360, 190, 'W + R = 6 > N = 5', { s: 11, c: 'var(--ink)', w: 1 });
    return S(206, b);
  };
  C['quorum-w-r-n'] = 'Two overlapping brackets of size W and R over N nodes always share at least one node when <b>W + R &gt; N</b>, so a read can never miss the latest write.';

  V['raft-election'] = function (u) {
    var b = D(u, 'ar aa ag'), i;
    var xs = [50, 220, 390, 560, 700], y = 56, r = 22;
    b += HD('Raft: election, then log replication');
    b += T(390, 38, 'phase 1: n2 times out and becomes a candidate', { s: 10, c: 'var(--ink-dim)' });
    for (i = 0; i < 5; i++) {
      b += DT(xs[i], y, r, { f: i === 1 ? 'var(--accent-weak)' : 'var(--surface-3)', sk: i === 1 ? 'var(--accent)' : 'var(--border)', sw: i === 1 ? 2.4 : 1.2 });
      b += T(xs[i], y + 4, 'n' + (i + 1), { s: 10 });
    }
    var votes = '';
    for (i = 0; i < 5; i++) { if (i !== 1) { votes += '<g' + IX(i) + '>' + AP(u, 'M' + xs[1] + ' ' + (y + r) + 'Q' + ((xs[1] + xs[i]) / 2) + ' ' + (y + 46) + ' ' + xs[i] + ' ' + (y + r), { d: '3 4', c: i === 4 ? 'var(--ink-dim)' : 'var(--good)', m: i === 4 ? 'none' : 'ag' }) + '</g>'; } }
    b += SQ(votes);
    b += T(700, 130, 'n5: no reply', { s: 9, c: 'var(--ink-dim)', a: 'end' });
    b += T(390, 142, '3 of 5 votes: majority - n2 becomes leader for this term', { s: 10, c: 'var(--good)' });
    b += DT(220, 56, 24, { f: 'var(--accent)', cls: 'v-pulse' });
    b += T(220, 60, 'n2~LEADER', { s: 9, c: 'var(--accent-ink)' });
    var repl = '';
    for (i = 0; i < 5; i++) { if (i !== 1) { repl += F('M220 80L' + xs[i] + ' 176', { c: 'var(--accent)', w: 1.8 }); } }
    b += repl;
    b += T(390, 196, 'AppendEntries: committed once a majority has the entry in its log', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };
  C['raft-election'] = 'A candidate that wins a <b>majority of votes</b> becomes leader for the term, then replicates every entry until a majority has logged it.';

  V['lamport-clock'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('Lamport clock: happens-before, not real time');
    b += LN(220, 40, 220, 190, { c: 'var(--border)' });
    b += LN(560, 40, 560, 190, { c: 'var(--border)' });
    b += T(220, 30, 'P1', { s: 11, w: 1 });
    b += T(560, 30, 'P2', { s: 11, w: 1 });
    b += DT(220, 66, 5, { f: 'var(--ink-dim)' });
    b += T(240, 70, 't = 1', { s: 10, a: 'start', c: 'var(--ink-dim)' });
    b += DT(220, 110, 5, { f: 'var(--ink-dim)' });
    b += T(240, 114, 't = 2', { s: 10, a: 'start', c: 'var(--ink-dim)' });
    b += DT(220, 150, 6, { f: 'var(--accent)' });
    b += T(240, 154, 't = 3: send message', { s: 10, a: 'start', c: 'var(--accent)' });
    b += DT(560, 90, 5, { f: 'var(--ink-dim)' });
    b += T(540, 94, 't = 1', { s: 10, a: 'end', c: 'var(--ink-dim)' });
    b += F('M226 150L554 176', { c: 'var(--accent)' });
    b += AP(u, 'M226 150L554 176', { c: 'var(--accent)', m: 'aa' });
    b += DT(560, 176, 6, { f: 'var(--good)' });
    b += T(500, 178, 'receive: max(1, 3) + 1 = 4', { s: 10, a: 'end', c: 'var(--good)' });
    b += T(390, 205, 'the send always gets a smaller counter than its receive - but two unrelated events can land on any values', { s: 9.5, c: 'var(--ink-dim)' });
    return S(220, b);
  };
  C['lamport-clock'] = 'On receiving a message, a node sets its counter to <b>max(local, received) + 1</b> - enough to order cause before effect, not enough to prove two events are unrelated.';

  V['fencing-token'] = function (u) {
    var b = D(u, 'ar aa ag ad');
    b += HD('fencing tokens stop a stale lock holder');
    b += B(290, 20, 180, 32, 'lock service~grants leases + tokens', { ts: 10 });
    b += B(30, 92, 150, 40, 'client A', { ts: 10 });
    b += B(580, 92, 150, 40, 'client B', { ts: 10 });
    b += AP(u, 'M300 52Q180 70 105 90', { c: 'var(--ink-dim)', m: 'ar' });
    b += T(180, 66, 'grant, token = 1', { s: 9, c: 'var(--ink-dim)' });
    b += AP(u, 'M470 52Q590 70 655 90', { c: 'var(--good)', m: 'ag' });
    b += T(580, 66, 'lease expires ->~grant, token = 2', { s: 9, c: 'var(--good)' });
    b += T(105, 148, 'paused (long GC)', { s: 9, c: 'var(--warning)', cls: 'v-blink' });
    b += B(290, 168, 180, 34, 'resource: last token seen = 2', { ts: 9.5, f: 'var(--surface-3)' });
    b += AP(u, 'M655 132V166', { c: 'var(--good)', m: 'ag' });
    b += F('M655 132V166', { c: 'var(--good)' });
    b += T(690, 155, 'write,~token = 2~accepted', { s: 8.5, c: 'var(--good)', a: 'start' });
    b += AP(u, 'M105 132V166', { c: 'var(--danger)', m: 'ad', d: '4 4' });
    b += T(60, 155, 'write,~token = 1~rejected', { s: 8.5, c: 'var(--danger)', a: 'end' });
    return S(224, b);
  };
  C['fencing-token'] = 'The resource remembers the highest token it has seen and rejects anything lower - a <b>paused, stale client</b> cannot corrupt state even if it still thinks it holds the lock.';

  V['gossip-spread'] = function (u) {
    var pts = [
      { x: 90, y: 150 }, { x: 240, y: 66 }, { x: 240, y: 194 },
      { x: 400, y: 30 }, { x: 400, y: 150 }, { x: 560, y: 90 },
      { x: 560, y: 194 }, { x: 700, y: 130 }
    ];
    function edge(a, c, i) { return '<g' + IX(i) + '>' + F('M' + pts[a].x + ' ' + pts[a].y + 'L' + pts[c].x + ' ' + pts[c].y, { c: 'var(--accent)', w: 1.6 }) + '</g>'; }
    function node(i, ix) { return '<g' + IX(ix) + '>' + DT(pts[i].x, pts[i].y, 9, { f: 'var(--accent)' }) + '</g>'; }
    var b = D(u, 'ar aa'), i;
    b += HD('gossip: information doubles each round');
    for (i = 0; i < pts.length; i++) { b += DT(pts[i].x, pts[i].y, 9, { f: 'var(--surface-3)', sk: 'var(--border)', sw: 1.2 }); }
    b += DT(pts[0].x, pts[0].y, 10, { f: 'var(--accent)' });
    b += T(pts[0].x, pts[0].y - 16, 'origin', { s: 9, c: 'var(--accent)' });
    b += SQ(edge(0, 1, 0) + edge(0, 2, 0) + node(1, 0) + node(2, 0) +
      edge(1, 3, 1) + edge(2, 4, 1) + edge(0, 7, 1) + node(3, 1) + node(4, 1) + node(7, 1) +
      edge(3, 5, 2) + edge(4, 6, 2) + node(5, 2) + node(6, 2));
    b += T(90, 200, 'round 1: 1 -> 2', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += T(380, 200, 'round 2: 3 -> 6', { s: 9, c: 'var(--ink-dim)' });
    b += T(700, 200, 'round 3: all 8', { s: 9, c: 'var(--ink-dim)', a: 'end' });
    return S(216, b);
  };
  C['gossip-spread'] = 'Each round, every informed node tells a new peer, so the informed set roughly <b>doubles</b> and reaches the whole cluster in a handful of rounds.';

}(typeof window !== 'undefined' ? window : this));
