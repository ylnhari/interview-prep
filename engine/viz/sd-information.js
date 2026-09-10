/* sd-information diagrams: search and retrieval, counting and sketches, realtime and feeds. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  V['inverted-index'] = function (u) {
    var b = D(u, 'ar aa'), i, terms = [['cat', 'doc 1, doc 3'], ['dog', 'doc 2'], ['ran', 'doc 2, doc 3'], ['sat', 'doc 1']], inner = '';
    b += HD('tokenize documents into an inverted index');
    b += B(16, 40, 150, 34, 'doc 1~"the cat sat"');
    b += B(16, 82, 150, 34, 'doc 2~"a dog ran"');
    b += B(16, 124, 150, 34, 'doc 3~"the cat ran"');
    b += AP(u, 'M166 57C200 57 200 90 216 90', { c: 'var(--ink-dim)' });
    b += AP(u, 'M166 99H216');
    b += AP(u, 'M166 141C200 141 200 108 216 108', { c: 'var(--ink-dim)' });
    b += B(220, 76, 130, 50, 'tokenize~drop stop words, stem', { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 350, 101, 392, 101, { c: 'var(--accent)', m: 'aa' });
    b += F('M350 101H392');
    for (i = 0; i < terms.length; i++) {
      inner += '<g' + IX(i) + '>' + B(396, 34 + i * 40, 190, 32, terms[i][0] + '~' + terms[i][1], { ts: 11 }) + '</g>';
    }
    b += SQ(inner);
    b += T(300, 200, 'each posting can also store positions, for phrase queries like "cat sat"', { s: 10, c: 'var(--ink-dim)' });
    return S(214, b);
  };
  C['inverted-index'] = 'Tokenizing turns each document into terms; the <b>inverted index</b> flips that into one posting list per term.';

  V['bm25-scoring'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('BM25 score for one query term', 'summed across every matching term');
    b += B(14, 36, 226, 58, 'IDF(t) = 4.60~rare: seen in 100 of 10,000 docs');
    b += B(266, 36, 226, 58, 'term frequency~f = 3, k1 = 1.2, saturates repeats');
    b += B(518, 36, 226, 58, 'length norm~|D| = 200 vs avgdl = 250, b = 0.75');
    b += AP(u, 'M127 94C127 130 250 130 372 138', { c: 'var(--ink-dim)' });
    b += AP(u, 'M379 94V138');
    b += AP(u, 'M631 94C631 130 500 130 388 138', { c: 'var(--ink-dim)' });
    b += T(379, 152, '×', { s: 16, w: 1 });
    b += A(u, 379, 158, 379, 186, { c: 'var(--accent)', m: 'aa' });
    b += F('M379 158V186');
    b += B(304, 190, 150, 34, 'score = 7.55', { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    return S(232, b);
  };
  C['bm25-scoring'] = 'BM25 multiplies a rarity weight by a saturating term-frequency ratio adjusted for <b>document length</b>.';

  V['query-pipeline'] = function (u) {
    var b = D(u, 'ar aa'), i, steps = ['raw query~"pyhton tutrial"', 'spell correction~"python tutorial"', 'synonym expansion~+ "guide", "how-to"', 'intent~informational', 'rewritten query~sent to retrieval'], inner = '';
    b += HD('the query understanding pipeline');
    for (i = 0; i < steps.length; i++) {
      var x = 10 + i * 150;
      inner += '<g' + IX(i) + '>' + B(x, 70, 136, 60, steps[i], { ts: 10 }) + '</g>';
      if (i > 0) {
        b += A(u, x - 14, 100, x + 4, 100, { c: 'var(--accent)', m: 'aa' });
        b += F('M' + (x - 14) + ' 100H' + (x + 4));
      }
    }
    b += SQ(inner);
    b += T(380, 154, 'each step can also fail open: skip a step it is not confident about, rather than guess', { s: 10, c: 'var(--ink-dim)' });
    return S(174, b);
  };
  C['query-pipeline'] = 'A typed query is corrected, expanded and classified before it becomes the query that actually <b>reaches retrieval</b>.';

  V['hybrid-rank-fusion'] = function (u) {
    var b = D(u, 'ar aa ag'), bm25 = ['doc B', 'doc A', 'doc D', 'doc C'], vec = ['doc A', 'doc D', 'doc C', 'doc B'], i;
    b += HD('reciprocal rank fusion', 'k = 60');
    b += T(90, 34, 'BM25 ranking', { s: 11, w: 1 });
    b += T(270, 34, 'vector ranking', { s: 11, w: 1 });
    for (i = 0; i < 4; i++) {
      var y = 46 + i * 32, hitB = bm25[i] === 'doc D', hitV = vec[i] === 'doc D';
      b += B(20, y, 140, 26, 'rank ' + (i + 1) + ': ' + bm25[i], { ts: 10, f: hitB ? 'var(--good-weak)' : 'var(--surface-2)', sk: hitB ? 'var(--good)' : 'var(--border)' });
      b += B(200, y, 140, 26, 'rank ' + (i + 1) + ': ' + vec[i], { ts: 10, f: hitV ? 'var(--good-weak)' : 'var(--surface-2)', sk: hitV ? 'var(--good)' : 'var(--border)' });
    }
    b += AP(u, 'M160 110C300 110 300 96 396 96', { c: 'var(--good)', d: '4 4' });
    b += AP(u, 'M340 78C370 78 370 96 396 96', { c: 'var(--good)', d: '4 4' });
    b += B(400, 70, 170, 66, 'RRF(D) =~1/63 + 1/68~= 0.031', { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 570, 103, 610, 103, { c: 'var(--accent)', m: 'aa' });
    b += F('M570 103H610');
    b += B(614, 82, 130, 42, 'fused #1', { f: 'var(--good-weak)', sk: 'var(--good)', cls: 'v-pulse' });
    b += T(380, 200, 'a document ranked well by both lists beats one ranked #1 by only one', { s: 10, c: 'var(--ink-dim)' });
    return S(214, b);
  };
  C['hybrid-rank-fusion'] = 'Reciprocal rank fusion rewards a document that ranks well on <b>both</b> lists, not just one.';

  V['trie-autocomplete'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('trie: walk the prefix, read cached top-k');
    b += DT(90, 34, 5, { f: 'var(--surface-3)', sk: 'var(--border)' });
    b += A(u, 90, 39, 90, 62, { c: 'var(--accent)', m: 'aa' });
    b += F('M90 39V62');
    b += B(60, 64, 60, 32, "'s'", { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 90, 96, 90, 114, { c: 'var(--accent)', m: 'aa' });
    b += F('M90 96V114');
    b += B(60, 116, 60, 32, "'e'", { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 120, 132, 158, 132, { c: 'var(--ink-dim)', d: '3 4' });
    b += B(160, 116, 90, 32, "'l' -> ...", { f: 'var(--surface-2)', ts: 10 });
    b += A(u, 90, 148, 90, 166, { c: 'var(--accent)', m: 'aa' });
    b += F('M90 148V166');
    b += B(60, 168, 60, 32, "'a'", { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M120 184C220 184 260 150 336 138', { c: 'var(--accent)', m: 'aa' });
    b += B(340, 84, 340, 94, 'top-3 cached for "sea"~1. search (58k/day)~2. seattle (31k/day)~3. seafood (12k/day)', { ts: 11, f: 'var(--surface-3)', sk: 'var(--border)', cls: 'v-pulse' });
    b += T(480, 200, 'counts refresh every few minutes so a trending query rises fast', { s: 10, c: 'var(--ink-dim)' });
    return S(210, b);
  };
  C['trie-autocomplete'] = 'Each prefix node caches its own <b>top-k completions</b>, so a lookup costs one walk down the trie, not a scan.';

  V['time-windows'] = function (u) {
    var b = D(u, 'ar aa ad'), i, inner = '';
    b += HD('tumbling, hopping and sliding windows');
    b += LN(20, 60, 740, 60);
    for (i = 0; i < 4; i++) { inner += '<g' + IX(i) + '>' + R(20 + i * 180, 44, 170, 30, { f: i % 2 ? 'var(--accent-weak)' : 'var(--surface-3)', sk: 'var(--border)' }) + '</g>'; }
    b += SQ(inner);
    b += T(20, 38, 'tumbling: fixed, no overlap', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    var inner2 = '';
    for (i = 0; i < 4; i++) { inner2 += '<g' + IX(i) + '>' + R(20 + i * 100, 96, 220, 24, { f: 'var(--accent-weak)', sk: 'var(--accent)' }) + '</g>'; }
    b += SQ(inner2);
    b += T(20, 90, 'hopping: fixed length, shorter step', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += LN(20, 168, 740, 168);
    b += DT(120, 168, 4, { f: 'var(--good)' });
    b += DT(260, 168, 4, { f: 'var(--good)' });
    b += DT(560, 168, 4, { f: 'var(--danger)', cls: 'v-blink' });
    b += LN(440, 150, 440, 186, { c: 'var(--ink-dim)', d: '3 4' });
    b += T(440, 144, 'watermark', { s: 10, c: 'var(--ink-dim)' });
    b += T(560, 200, 'late event: arrives after its window was declared complete', { s: 10, c: 'var(--danger)' });
    b += T(160, 200, 'on-time events, already counted', { s: 10, c: 'var(--ink-dim)' });
    return S(216, b);
  };
  C['time-windows'] = 'A window buckets events by time; a <b>watermark</b> decides when it is safe to call one done.';

  V['hyperloglog-buckets'] = function (u) {
    var b = D(u, 'ar aa'), i, inner = '';
    b += HD('HyperLogLog: longest run of leading zeros, per bucket');
    b += B(16, 60, 90, 40, 'item');
    b += A(u, 106, 80, 150, 80, { c: 'var(--accent)', m: 'aa' });
    b += F('M106 80H150');
    b += B(154, 58, 190, 44, 'hash(item)~0110 0010111...');
    b += AP(u, 'M300 68C330 68 320 30 360 24', { c: 'var(--ink-dim)' });
    b += B(364, 6, 150, 34, 'bucket = 0110~(bucket 6)', { ts: 10 });
    b += AP(u, 'M300 92C330 92 320 118 360 122', { c: 'var(--ink-dim)' });
    b += B(364, 106, 190, 44, '00101...~2 leading zeros~register candidate = 3', { ts: 10 });
    for (i = 0; i < 12; i++) { inner += '<g' + IX(i) + '>' + B(16 + i * 60, 172, 52, 34, i === 6 ? '6: 3' : (i + ': ' + (i % 4)), { ts: 10, f: i === 6 ? 'var(--accent-weak)' : 'var(--surface-2)', sk: i === 6 ? 'var(--accent)' : 'var(--border)', cls: i === 6 ? 'v-pulse' : '' }) + '</g>'; }
    b += SQ(inner);
    b += T(380, 148, 'registers (one slice of m = 16,384 shown)', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 222, 'standard error = 1.04 / √m = 1.04 / 128 ≈ 0.81%', { s: 10, c: 'var(--ink-dim)' });
    return S(230, b);
  };
  C['hyperloglog-buckets'] = 'Each bucket keeps only the <b>longest run of leading zeros</b> it has seen; a long run means many distinct items.';

  V['count-min-sketch'] = function (u) {
    var b = D(u, 'ar aa'), rows = ['h1', 'h2', 'h3'], cols = [2, 4, 1], vals = [[1, 1, 4, 1, 2], [2, 1, 1, 6, 1], [1, 5, 1, 1, 3]], i, j, inner = '';
    b += HD('Count-Min Sketch: hash every row, answer with the minimum');
    b += B(14, 30, 90, 34, 'item: "cat"');
    for (i = 0; i < 3; i++) {
      b += T(20, 84 + i * 34, rows[i], { a: 'start', s: 10, c: 'var(--ink-dim)' });
      for (j = 0; j < 5; j++) {
        var hit = j === cols[i];
        inner += '<g' + IX(i * 5 + j) + '>' + B(60 + j * 60, 68 + i * 34, 52, 26, String(vals[i][j]), { ts: 11, f: hit ? 'var(--accent-weak)' : 'var(--surface-2)', sk: hit ? 'var(--accent)' : 'var(--border)' }) + '</g>';
      }
    }
    b += SQ(inner);
    b += AP(u, 'M59 43C40 43 40 60 60 81', { c: 'var(--accent)', d: '3 4', m: 'aa' });
    b += AP(u, 'M59 47C30 47 30 100 60 115', { c: 'var(--accent)', d: '3 4', m: 'aa' });
    b += AP(u, 'M59 51C20 51 20 130 60 149', { c: 'var(--accent)', d: '3 4', m: 'aa' });
    b += T(60, 186, 'query("cat") = min(4, 6, 5) = 4', { a: 'start', s: 11, w: 1 });
    b += B(400, 168, 220, 36, 'true count is 4; the other rows are inflated by collisions', { ts: 10, f: 'var(--surface-3)' });
    return S(214, b);
  };
  C['count-min-sketch'] = 'Every row can be inflated by a collision, so the sketch trusts the <b>minimum</b> across all of them.';

  V['tdigest-merge'] = function (u) {
    var b = D(u, 'ar aa ag'), i, inner = '';
    b += HD('merging two t-digests');
    b += T(20, 34, 'digest A', { a: 'start', s: 11, w: 1 });
    var xa = [30, 90, 180, 340, 520, 640, 700, 730];
    for (i = 0; i < xa.length; i++) { inner += '<g' + IX(i) + '>' + DT(xa[i], 56, i < 2 || i > 5 ? 4 : 8, { f: 'var(--accent)' }) + '</g>'; }
    b += SQ(inner);
    b += T(20, 92, 'digest B', { a: 'start', s: 11, w: 1 });
    var xb = [50, 110, 260, 400, 480, 600, 690, 720], inner2 = '';
    for (i = 0; i < xb.length; i++) { inner2 += '<g' + IX(i) + '>' + DT(xb[i], 114, i < 2 || i > 5 ? 4 : 8, { f: 'var(--good)' }) + '</g>'; }
    b += SQ(inner2);
    b += AP(u, 'M400 66C400 140 400 140 400 150', { c: 'var(--ink-dim)', d: '3 4', m: 'none' });
    b += AP(u, 'M400 124C400 140 400 140 400 150', { c: 'var(--ink-dim)', d: '3 4', m: 'none' });
    b += T(400, 148, 'merge: union the centroids, recluster', { s: 10, c: 'var(--ink-dim)' });
    b += LN(20, 176, 740, 176);
    var xm = xa.concat(xb).sort(function (a, c) { return a - c; }), inner3 = '';
    for (i = 0; i < xm.length; i++) { inner3 += '<g' + IX(i) + '>' + DT(xm[i], 176, xm[i] < 90 || xm[i] > 690 ? 4 : 7, { f: 'var(--accent)' }) + '</g>'; }
    b += SQ(inner3);
    b += LN(700, 158, 700, 194, { c: 'var(--danger)', d: '3 4' });
    b += T(700, 200, 'p99 read here: dense cluster of small centroids near the tail', { a: 'end', s: 10, c: 'var(--danger)' });
    return S(216, b);
  };
  C['tdigest-merge'] = 'Centroids are small and dense near the <b>tails</b>; merging two digests is just combining and reclustering centroids.';

  V['polling-vs-websocket'] = function (u) {
    var b = D(u, 'ar aa ad'), i, inner = '';
    b += T(24, 20, 'polling: ask again and again', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'WebSocket: one open connection', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 200, { d: '3 4' });
    b += LN(60, 60, 60, 190);
    b += LN(280, 60, 280, 190);
    var xs = [90, 150, 210];
    for (i = 0; i < xs.length; i++) {
      inner += '<g' + IX(i) + '>' + AP(u, 'M60 ' + (70 + i * 40) + 'H280', { c: 'var(--ink-dim)', m: 'aa' }) + AP(u, 'M280 ' + (86 + i * 40) + 'H60', { c: i === 2 ? 'var(--good)' : 'var(--danger)', d: '3 4', m: 'ad' }) + '</g>';
    }
    b += SQ(inner);
    b += T(30, 70, 'client', { a: 'end', s: 9, c: 'var(--ink-dim)' });
    b += T(310, 70, 'server', { s: 9, c: 'var(--ink-dim)' });
    b += T(170, 200, 'two wasted round trips, one with news', { s: 9, c: 'var(--ink-dim)' });
    b += LN(440, 100, 700, 100, { c: 'var(--accent)', w: 2.4 });
    b += F('M440 100H700');
    b += DT(500, 100, 4, { f: 'var(--good)', cls: 'v-pulse' });
    b += DT(600, 100, 4, { f: 'var(--good)', cls: 'v-pulse' });
    b += DT(650, 100, 4, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(440, 84, 'client', { a: 'start', s: 9, c: 'var(--ink-dim)' });
    b += T(700, 84, 'server', { a: 'end', s: 9, c: 'var(--ink-dim)' });
    b += T(570, 200, 'either side sends, any time, no new handshake', { s: 9, c: 'var(--ink-dim)' });
    return S(212, b);
  };
  C['polling-vs-websocket'] = 'Polling pays for a request even when nothing changed; a WebSocket keeps <b>one connection</b> either side can use any time.';

  V['websocket-fanout'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('cross-server fan-out for a connected client');
    b += B(20, 40, 100, 40, 'user 9~sends a like');
    b += A(u, 122, 60, 168, 60, { c: 'var(--accent)', m: 'aa' });
    b += F('M122 60H168');
    b += B(172, 40, 110, 40, 'server 1');
    b += A(u, 284, 60, 330, 90, { c: 'var(--accent)', m: 'aa' });
    b += F('M284 60C310 60 310 90 330 90');
    b += B(334, 74, 130, 40, 'pub/sub~channel: user 42');
    b += B(334, 130, 150, 34, 'registry: user 42 -> server 3', { ts: 10, f: 'var(--surface-3)' });
    b += A(u, 464, 94, 520, 94, { c: 'var(--good)', m: 'ag' });
    b += F('M464 94H520');
    b += B(524, 74, 110, 40, 'server 3', { f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 579, 114, 579, 150, { c: 'var(--good)', m: 'ag' });
    b += F('M579 114V150');
    b += B(534, 154, 110, 36, 'user 42', { f: 'var(--good-weak)', sk: 'var(--good)', cls: 'v-pulse' });
    b += B(184, 74, 100, 34, 'server 2', { f: 'var(--surface-2)' });
    b += T(380, 210, 'servers 1 and 2 are also subscribed; only the one holding user 42 forwards it', { s: 10, c: 'var(--ink-dim)' });
    return S(224, b);
  };
  C['websocket-fanout'] = 'A publish reaches every subscribed server, but only the one holding the target <b>connection</b> forwards it down a socket.';

  V['notification-pipeline'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('a notification, from event to delivery receipt');
    b += B(14, 70, 110, 46, 'event~order shipped');
    b += A(u, 126, 93, 172, 93, { c: 'var(--accent)', m: 'aa' });
    b += F('M126 93H172');
    b += B(176, 62, 160, 62, 'notification service~check prefs, dedupe');
    b += AP(u, 'M336 78C370 78 370 40 400 34', { c: 'var(--ink-dim)', m: 'aa' });
    b += B(404, 16, 100, 32, 'push', { ts: 10 });
    b += AP(u, 'M336 93H400', { c: 'var(--ink-dim)', m: 'aa' });
    b += B(404, 77, 100, 32, 'email', { ts: 10 });
    b += AP(u, 'M336 108C370 108 370 146 400 152', { c: 'var(--ink-dim)', m: 'aa' });
    b += B(404, 136, 100, 32, 'SMS', { ts: 10 });
    b += SQ('<g' + IX(0) + '>' + F('M504 32H556') + '</g><g' + IX(1) + '>' + F('M504 93H556') + '</g><g' + IX(2) + '>' + F('M504 152H556') + '</g>');
    b += B(560, 16, 110, 32, 'FCM/APNs', { ts: 9, f: 'var(--surface-3)' });
    b += B(560, 77, 110, 32, 'SMTP relay', { ts: 9, f: 'var(--surface-3)' });
    b += B(560, 136, 110, 32, 'SMS gateway', { ts: 9, f: 'var(--surface-3)' });
    b += AP(u, 'M615 48V70', { c: 'var(--good)', d: '3 4', m: 'ag' });
    b += T(680, 210, 'retry with backoff on failure; a delivery receipt updates sent -> delivered -> read', { s: 10, c: 'var(--ink-dim)' });
    return S(224, b);
  };
  C['notification-pipeline'] = 'One event fans out to the channels a user actually wants, each with its own <b>provider and retry</b> path.';

}(typeof window !== 'undefined' ? window : this));
