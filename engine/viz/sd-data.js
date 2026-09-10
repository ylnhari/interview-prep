/* sd-data diagrams: relational databases, and NoSQL/sharding/distributed IDs. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW;

  V['btree-index'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('B-tree index: O(log n) to any row');
    b += B(301, 40, 160, 32, 'root~[41 | 88]', { ts: 11 });
    b += B(124, 102, 180, 30, '[10 | 25]', { ts: 10 });
    b += B(458, 102, 180, 30, '[55 | 70]', { ts: 10 });
    b += B(60, 166, 140, 34, 'leaf~1..24', { ts: 10 });
    b += B(227, 166, 140, 34, 'leaf~25..54', { ts: 10 });
    b += B(394, 166, 140, 34, 'leaf~55..69', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)', cls: 'v-pulse' });
    b += B(561, 166, 140, 34, 'leaf~70..99', { ts: 10 });
    b += A(u, 381, 72, 214, 102, { c: 'var(--border)', m: 'none' });
    b += A(u, 214, 132, 130, 166, { c: 'var(--border)', m: 'none' });
    b += A(u, 214, 132, 297, 166, { c: 'var(--border)', m: 'none' });
    b += A(u, 548, 132, 631, 166, { c: 'var(--border)', m: 'none' });
    b += A(u, 381, 72, 548, 102, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 548, 132, 464, 166, { c: 'var(--accent)', m: 'aa' });
    b += F('M381 72L548 102M548 132L464 166', { c: 'var(--accent)' });
    b += LN(130, 200, 631, 200, { c: 'var(--ink-dim)', d: '3 4' });
    b += F('M130 200H631', { c: 'var(--ink-dim)', d: '4 6', w: 1.6 });
    b += T(380, 213, 'leaf pages are linked in sorted order, which is what makes a range scan fast', { s: 10, c: 'var(--ink-dim)' });
    b += T(700, 84, 'search: key 62', { s: 10, c: 'var(--accent)', a: 'end' });
    b += T(30, 84, '~4-5 hops even at 1B rows', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(222, b);
  };
  C['btree-index'] = 'A B-tree descends from root to leaf in a handful of hops no matter how large the table gets; the <b>highlighted search path</b> shows one lookup, and leaf pages stay linked for fast range scans.';

  V['isolation-anomalies'] = function (u) {
    var b = D(u, 'ar'), i, r, c;
    b += HD('what each isolation level blocks');
    var cols = ['read committed', 'repeatable read', 'serializable'];
    var colx = [300, 460, 620];
    for (i = 0; i < 3; i++) { b += T(colx[i] + 60, 44, cols[i], { s: 10, c: 'var(--ink-dim)' }); }
    var rows = ['dirty read', 'non-repeatable read', 'phantom read'];
    var rowy = [60, 96, 132];
    for (i = 0; i < 3; i++) { b += T(284, rowy[i] + 19, rows[i], { a: 'end', s: 10, c: 'var(--ink-dim)' }); }
    var grid = [[true, true, true], [false, true, true], [false, true, true]];
    var inner = '';
    for (r = 0; r < 3; r++) {
      for (c = 0; c < 3; c++) {
        var ok = grid[r][c];
        inner += '<g' + IX(r * 3 + c) + '>' + R(colx[c], rowy[r], 120, 30, { f: ok ? 'var(--good-weak)' : 'var(--danger-weak)', sk: ok ? 'var(--good)' : 'var(--danger)', r: 5 }) +
          T(colx[c] + 60, rowy[r] + 19, ok ? 'blocked' : 'possible', { s: 10, c: ok ? 'var(--good)' : 'var(--danger)', cls: ok ? '' : 'v-blink' }) + '</g>';
      }
    }
    b += SQ(inner);
    b += T(380, 176, 'a stronger level to the right blocks strictly more anomalies, at the cost of more retries', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 194, 'repeatable read blocks the phantoms above, but can still allow write skew', { s: 10, c: 'var(--ink-dim)' });
    return S(206, b);
  };
  C['isolation-anomalies'] = 'Each column blocks strictly more anomalies than the one before it; the <b>possible</b> cells are where a lost update or a changing result set can still slip through.';

  V['mvcc-versions'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('MVCC: one row, several versions');
    b += B(40, 84, 150, 46, 'v1~xid 100~reclaimable', { ts: 10, f: 'var(--surface-3)' });
    b += B(260, 84, 150, 46, 'v2~xid 140', { ts: 10 });
    b += GROW(B(480, 84, 180, 46, 'v3~xid 180 (newest)', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' }));
    b += A(u, 190, 107, 256, 107, { c: 'var(--ink-dim)' });
    b += A(u, 410, 107, 476, 107, { c: 'var(--ink-dim)' });
    b += T(223, 100, 'update', { s: 9, c: 'var(--ink-dim)' });
    b += T(443, 100, 'update', { s: 9, c: 'var(--ink-dim)' });
    b += B(270, 156, 130, 32, 'T1~snapshot at xid 150', { ts: 9 });
    b += B(500, 156, 140, 32, 'T2~snapshot at xid 190', { ts: 9 });
    b += A(u, 335, 156, 335, 134, { c: 'var(--accent)', d: '4 3', m: 'aa' });
    b += A(u, 570, 156, 570, 134, { c: 'var(--accent)', d: '4 3', m: 'aa' });
    b += T(380, 192, 'T1 keeps reading v2 even after v3 is written; neither transaction blocks the other', { s: 10, c: 'var(--ink-dim)' });
    return S(200, b);
  };
  C['mvcc-versions'] = 'MVCC keeps old row versions around for readers already using them; <b>the newest version</b> appears without blocking a reader still pinned to an older snapshot.';

  V['wal-recovery'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('write-ahead log: log first, data later');
    b += B(20, 38, 100, 40, 'write~request', { ts: 10 });
    b += A(u, 122, 58, 158, 58);
    b += F('M122 58H158');
    b += CY(162, 34, 150, 48, 'WAL~append + fsync', { ts: 10 });
    b += A(u, 314, 58, 366, 58, { c: 'var(--good)', m: 'ag' });
    b += F('M314 58H366', { c: 'var(--good)' });
    b += B(370, 38, 110, 40, 'ack to~client', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += AP(u, 'M237 82V108', { m: 'none', d: '4 4' });
    b += B(162, 112, 150, 40, 'data pages~flushed later', { ts: 10, f: 'var(--surface-3)' });
    b += T(320, 132, 'lazy, any order - the log is already durable', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    b += LN(520, 24, 520, 96, { c: 'var(--warning)', d: '2 3' });
    b += T(520, 16, 'checkpoint', { s: 10, c: 'var(--warning)' });
    b += T(650, 52, 'crash', { s: 13, c: 'var(--danger)', w: 1, cls: 'v-blink' });
    b += DT(628, 58, 5, { f: 'var(--danger)' });
    b += AP(u, 'M628 82C560 130 420 150 300 158', { c: 'var(--accent)', m: 'aa' });
    b += F('M628 82C560 130 420 150 300 158', { c: 'var(--accent)' });
    b += B(80, 160, 220, 44, 'recovery: redo from~checkpoint, then undo open work', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += T(380, 208, 'data pages are a cache of the log; the log is the source of truth', { s: 10, c: 'var(--ink-dim)' });
    return S(214, b);
  };
  C['wal-recovery'] = 'The log is flushed before the data pages are touched; after a <b>crash</b>, recovery replays it forward from the last checkpoint instead of trusting the data files alone.';

  V['read-replicas-lag'] = function (u) {
    var b = D(u, 'ar aa aw');
    b += HD('read replicas: capacity now, staleness later');
    b += CY(20, 66, 130, 60, 'primary~all writes', { ts: 10, f: 'var(--accent-weak)', tf: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M150 80C210 80 210 56 258 56', { m: 'aa', c: 'var(--accent)' });
    b += AP(u, 'M150 112C210 112 210 146 258 146', { m: 'aa', c: 'var(--accent)' });
    b += F('M150 80C210 80 210 56 258 56M150 112C210 112 210 146 258 146');
    b += CY(262, 30, 130, 52, 'replica A', { ts: 10 });
    b += CY(262, 120, 130, 52, 'replica B', { ts: 10 });
    b += R(262, 88, 130, 8, { f: 'var(--surface-3)' });
    b += GROW(R(262, 88, 20, 8, { f: 'var(--good)' }));
    b += T(327, 108, 'lag: 40ms', { s: 9, c: 'var(--good)' });
    b += R(262, 178, 130, 8, { f: 'var(--surface-3)' });
    b += GROW(R(262, 178, 105, 8, { f: 'var(--warning)' }));
    b += T(327, 198, 'lag: 4s and growing', { s: 9, c: 'var(--warning)', cls: 'v-blink' });
    b += B(470, 24, 140, 36, 'normal read', { ts: 10 });
    b += AP(u, 'M470 42C440 42 420 40 396 44', { m: 'aa', c: 'var(--ink-dim)' });
    b += B(470, 108, 160, 44, 'read right after~my own write', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += AP(u, 'M470 130C300 130 180 108 88 96', { m: 'aw', c: 'var(--warning)', d: '4 3' });
    b += T(690, 60, 'pin writes-then-reads to the primary', { s: 10, c: 'var(--ink-dim)', a: 'end' });
    return S(212, b);
  };
  C['read-replicas-lag'] = 'Writes stream to every replica, but <b>the lag bar</b> shows they do not all catch up at the same speed - exactly when a read-your-writes check has to go to the primary instead.';

  V['shard-range-vs-hash'] = function (u) {
    var b = D(u, 'ar aa ad'), i;
    b += T(195, 20, 'range partitioning', { s: 11, w: 1 });
    b += T(575, 20, 'hash partitioning', { s: 11, w: 1 });
    b += LN(385, 14, 385, 200, { d: '3 4' });
    var ranges = ['A - H', 'I - Q', 'R - Z'];
    for (i = 0; i < 3; i++) {
      var hot = i === 2;
      b += CY(20 + i * 118, 60, 104, 52, 'shard ' + (i + 1), { ts: 10, f: hot ? 'var(--danger-weak)' : 'var(--surface-2)', sk: hot ? 'var(--danger)' : 'var(--border)' });
      b += T(72 + i * 118, 128, ranges[i], { s: 10, c: 'var(--ink-dim)' });
    }
    b += AP(u, 'M296 40C296 48 296 52 296 58', { m: 'ad', c: 'var(--danger)' });
    b += F('M296 40C296 48 296 52 296 58', { c: 'var(--danger)', cls: 'v-blink' });
    b += T(296, 32, 'new orders: increasing id', { s: 10, c: 'var(--danger)', a: 'end' });
    b += T(190, 150, 'every new write lands on the top range: one shard is hot', { s: 10, c: 'var(--ink-dim)' });
    b += CY(400, 34, 130, 30, 'hash(key)', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    var dx = [420, 540, 660], inner = '';
    for (i = 0; i < 3; i++) {
      b += CY(dx[i], 96, 100, 52, 'shard ' + (i + 1), { ts: 10 });
      inner += '<g' + IX(i) + '>' + AP(u, 'M465 64C465 78 ' + (dx[i] + 50) + ' 86 ' + (dx[i] + 50) + ' 96', { m: 'aa', c: 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += F('M465 64C465 78 470 86 470 96M465 64C465 78 590 86 590 96M465 64C465 78 710 86 710 96');
    b += T(575, 168, 'keys scatter evenly; no shard owns a range you can scan', { s: 10, c: 'var(--ink-dim)' });
    return S(190, b);
  };
  C['shard-range-vs-hash'] = 'Range partitioning keeps scans fast but lets <b>a monotonic key</b> pile every new write onto one shard; hashing spreads keys evenly and gives up the range scan to do it.';

  V['consistent-hash-ring'] = function (u) {
    var cx = 210, cy = 116, r = 78;
    function pt(deg) { var a = deg * Math.PI / 180; return { x: Math.round((cx + r * Math.cos(a)) * 10) / 10, y: Math.round((cy + r * Math.sin(a)) * 10) / 10 }; }
    var b = D(u, 'ar aa aw'), i, p, vp;
    b += HD('consistent hashing: a ring of hash values');
    b += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--border)" stroke-width="1.4"/>';
    var nodes = [{ deg: -90, name: 'A' }, { deg: 30, name: 'B' }, { deg: 150, name: 'C' }];
    for (i = 0; i < nodes.length; i++) {
      p = pt(nodes[i].deg);
      b += DT(p.x, p.y, 8, { f: 'var(--accent)' });
      b += T(p.x, p.y - 14, 'node ' + nodes[i].name, { s: 10, c: 'var(--accent)', w: 1 });
      vp = pt(nodes[i].deg - 16);
      b += DT(vp.x, vp.y, 4, { f: 'var(--accent)', st: 'opacity:.5' });
      vp = pt(nodes[i].deg + 16);
      b += DT(vp.x, vp.y, 4, { f: 'var(--accent)', st: 'opacity:.5' });
    }
    var key = pt(-20);
    b += DT(key.x, key.y, 5, { f: 'var(--warning)' });
    b += T(key.x + 14, key.y - 6, 'key k', { s: 10, c: 'var(--warning)', a: 'start' });
    var nb = pt(30);
    b += AP(u, 'M' + key.x + ' ' + key.y + 'A ' + r + ' ' + r + ' 0 0 1 ' + nb.x + ' ' + nb.y, { c: 'var(--warning)', m: 'aw', d: '3 4' });
    b += F('M' + key.x + ' ' + key.y + 'A ' + r + ' ' + r + ' 0 0 1 ' + nb.x + ' ' + nb.y, { c: 'var(--warning)' });
    var dnode = pt(90);
    b += GROW(DT(dnode.x, dnode.y, 8, { f: 'var(--good)' }));
    b += T(dnode.x + 4, dnode.y + 20, 'new node D joins', { s: 10, c: 'var(--good)', a: 'start' });
    var bpt = pt(30);
    b += AP(u, 'M' + bpt.x + ' ' + bpt.y + 'A ' + r + ' ' + r + ' 0 0 1 ' + dnode.x + ' ' + dnode.y, { c: 'var(--good)', w: 3, m: 'none' });
    b += T(360, 24, 'only the arc between B and D moves to D', { s: 10, c: 'var(--good)', a: 'start' });
    b += T(360, 44, 'every other node keeps its keys untouched', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    b += T(360, 192, 'hash(key) walks clockwise to the next node', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(212, b);
  };
  C['consistent-hash-ring'] = 'A key walks clockwise to the next node on the ring; when <b>node D joins</b>, only the arc between it and its predecessor moves, and every other node keeps its keys untouched.';

  V['snowflake-id'] = function (u) {
    var b = D(u, 'ar aa'), segs = [
      { w: 16, lab: '1~sign', f: 'var(--surface-3)' },
      { w: 300, lab: '41 bits~timestamp (ms)', f: 'var(--accent-weak)' },
      { w: 140, lab: '10 bits~machine id', f: 'var(--good-weak)' },
      { w: 180, lab: '12 bits~sequence', f: 'var(--warning-weak)' }
    ], x = 60, i;
    b += HD('Snowflake id: 64 bits, packed');
    for (i = 0; i < segs.length; i++) {
      b += B(x, 60, segs[i].w, 50, segs[i].lab, { ts: 10, f: segs[i].f });
      x += segs[i].w;
    }
    b += T(60, 46, 'oldest', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += T(696, 46, 'newest', { s: 9, c: 'var(--ink-dim)', a: 'end' });
    b += AP(u, 'M60 130C200 150 500 150 696 130', { c: 'var(--accent)', m: 'aa' });
    b += F('M60 130C200 150 500 150 696 130', { c: 'var(--accent)' });
    b += T(378, 168, 'a larger timestamp always sorts as a larger id', { s: 10, c: 'var(--ink-dim)' });
    b += T(378, 188, 'clock moves backward: generator must stall, or ids could collide or reorder', { s: 10, c: 'var(--warning)', cls: 'v-blink' });
    return S(200, b);
  };
  C['snowflake-id'] = 'The timestamp is the leading field, so <b>a later id</b> almost always sorts higher than an earlier one - until the clock itself moves backward.';

  V['bloom-filter'] = function (u) {
    var b = D(u, 'ar aa ad'), i;
    b += HD('Bloom filter: k hash functions, one bit array');
    var n = 20, cellw = 32, x0 = 60, y0 = 96;
    var preset = [2, 3, 7, 12, 18];
    for (i = 0; i < n; i++) {
      var on = preset.indexOf(i) !== -1;
      b += R(x0 + i * cellw, y0, cellw - 4, 28, { f: on ? 'var(--accent)' : 'var(--surface-2)', sk: 'var(--border)' });
      b += T(x0 + i * cellw + (cellw - 4) / 2, y0 + 19, on ? '1' : '0', { s: 11, c: on ? 'var(--accent-ink)' : 'var(--ink-dim)' });
    }
    b += B(60, 30, 130, 34, 'insert(x)', { ts: 10 });
    var insertBits = [4, 9, 16], inner = '';
    for (i = 0; i < insertBits.length; i++) {
      var cx = x0 + insertBits[i] * cellw + (cellw - 4) / 2;
      inner += '<g' + IX(i) + '>' + AP(u, 'M125 64C' + Math.round((125 + cx) / 2) + ' 80 ' + cx + ' 88 ' + cx + ' 96', { m: 'aa', c: 'var(--accent)' }) +
        R(x0 + insertBits[i] * cellw, y0, cellw - 4, 28, { f: 'var(--accent)', sk: 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += B(560, 30, 150, 44, 'check(y)~y was never inserted', { ts: 10, f: 'var(--danger-weak)', sk: 'var(--danger)' });
    var checkBits = [2, 9, 12];
    for (i = 0; i < checkBits.length; i++) {
      var cx2 = x0 + checkBits[i] * cellw + (cellw - 4) / 2;
      b += AP(u, 'M600 74C' + Math.round((600 + cx2) / 2) + ' 90 ' + cx2 + ' 90 ' + cx2 + ' 96', { m: 'ad', c: 'var(--danger)', d: '3 3' });
    }
    b += T(636, 156, 'all 3 bits are already 1: reports "maybe present" - a false positive', { s: 10, c: 'var(--danger)', a: 'end' });
    b += T(60, 156, 'any single 0 bit found means "definitely absent" - never a false negative', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(180, b);
  };
  C['bloom-filter'] = 'Checking y finds every one of its <b>k bits already set by other items</b>, so the filter reports "maybe present" even though y was never inserted - a false positive, never a false negative.';

}(typeof window !== 'undefined' ? window : this));
