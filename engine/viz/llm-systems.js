/* llm-systems: diagrams for retrieval/agents and large-scale training chapters. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, R = H.R, A = H.A, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  /* ---------------------------------------------------------- retrieval and agents */

  V['chunk-overlap'] = function (u) {
    var b = D(u, 'ar aa aw'), i, inner = '';
    b += HD('splitting a document into overlapping chunks', 'stride < window size');
    b += B(40, 40, 680, 28, 'source document (continuous text)', { ts: 10 });
    var xs = [40, 190, 340, 490], w = 200, labels = ['chunk 1', 'chunk 2', 'chunk 3', 'chunk 4'];
    for (i = 0; i < 4; i++) { inner += '<g' + IX(i) + '>' + B(xs[i], 104, w, 40, labels[i], { ts: 10, f: 'var(--surface-2)' }) + '</g>'; }
    b += SQ(inner);
    for (i = 0; i < 3; i++) { b += R(xs[i + 1], 104, 50, 40, { f: 'var(--warning-weak)', sk: 'var(--warning)', sw: 1 }); }
    b += A(u, 215, 90, 215, 102, { c: 'var(--warning)', m: 'aw' });
    b += T(215, 84, 'overlap: the next chunk repeats some words', { s: 9, c: 'var(--warning)' });
    b += T(40, 168, 'a fixed-size window slides by less than its own width', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    b += R(40, 176, 200, 20, { f: 'none', sk: 'var(--accent)', sw: 2, cls: 'v-move-x', st: DXS(450) });
    b += T(150, 190, 'window', { s: 9, c: 'var(--accent)' });
    b += T(400, 208, 'without overlap, an answer that spans a chunk boundary loses its context', { s: 10, c: 'var(--ink-dim)' });
    return S(220, b);
  };
  C['chunk-overlap'] = 'A document is cut into fixed-size chunks that share a small <b>overlap</b> with their neighbour, so an idea that falls near a boundary still appears whole in at least one chunk.';

  V['hybrid-retrieval'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('hybrid retrieval: two searches, one fused ranking');
    b += B(20, 80, 90, 40, 'query');
    b += A(u, 110, 92, 148, 52);
    b += F('M110 92L148 52');
    b += A(u, 110, 108, 148, 148);
    b += F('M110 108L148 148');
    b += B(148, 32, 160, 40, 'dense search~(embeddings, meaning)', { ts: 10 });
    b += B(148, 132, 160, 40, 'sparse search~(BM25, exact words)', { ts: 10 });
    b += A(u, 308, 52, 344, 52);
    b += A(u, 308, 152, 344, 152);
    b += B(344, 32, 110, 40, 'ranked list A', { ts: 10, f: 'var(--surface-3)' });
    b += B(344, 132, 110, 40, 'ranked list B', { ts: 10, f: 'var(--surface-3)' });
    b += AP(u, 'M454 52H500V90', { m: 'aa' });
    b += AP(u, 'M454 152H500V112', { m: 'aa' });
    b += B(500, 80, 130, 44, 'fusion~(reciprocal rank fusion)', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 630, 102, 668, 102);
    b += F('M630 102H668');
    b += B(668, 80, 74, 44, 'final~context', { ts: 10 });
    b += T(400, 200, 'reciprocal rank fusion blends two independently ranked lists into one score per document', { s: 10, c: 'var(--ink-dim)' });
    return S(214, b);
  };
  C['hybrid-retrieval'] = 'A <b>dense</b> (embedding) search and a <b>sparse</b> (keyword) search run side by side, and a fusion step combines both rankings, so a query wins on either meaning or exact wording.';

  V['hnsw-layers'] = function (u) {
    var b = D(u, 'ar aa ag'), i;
    b += HD('HNSW: greedy search through a layered graph');
    var rows = [
      { y: 56, xs: [140, 380, 620], label: 'layer 2' },
      { y: 122, xs: [140, 260, 380, 500, 620], label: 'layer 1' },
      { y: 188, xs: [140, 200, 260, 320, 380, 440, 500, 560, 620], label: 'layer 0' }
    ];
    for (i = 0; i < rows.length; i++) {
      var r = rows[i], j;
      b += T(96, r.y + 4, r.label, { a: 'end', s: 10, c: 'var(--ink-dim)' });
      for (j = 0; j < r.xs.length - 1; j++) { b += LN(r.xs[j], r.y, r.xs[j + 1], r.y, { c: 'var(--border)' }); }
      for (j = 0; j < r.xs.length; j++) { b += DT(r.xs[j], r.y, 6, { f: 'var(--surface-2)', sk: 'var(--ink-dim)' }); }
    }
    var path = 'M140 56L380 56L380 122L500 122L500 188L560 188';
    b += AP(u, path, { m: 'aa', c: 'var(--accent)', w: 2.4 });
    b += F(path);
    b += DT(140, 56, 8, { f: 'var(--accent)' });
    b += T(140, 36, 'entry point', { s: 9, c: 'var(--accent)' });
    b += DT(560, 188, 8, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(560, 208, 'nearest neighbour found', { s: 9, c: 'var(--good)' });
    b += T(400, 20, 'top layers are sparse with long links; the search narrows one layer at a time', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(224, b);
  };
  C['hnsw-layers'] = 'The search enters at the top, sparse layer, greedily hops toward the query, then drops one layer down at the same point and keeps narrowing until the bottom, dense layer gives the answer.';

  V['agent-tool-loop'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('the tool-calling loop, with a stopping rule');
    b += B(20, 78, 110, 44, 'user~request');
    b += A(u, 130, 100, 176, 100);
    b += B(176, 70, 150, 52, 'model~reasons, decides');
    b += AP(u, 'M326 84H372V60', { m: 'aa' });
    b += F('M326 84H372V60');
    b += B(372, 30, 150, 42, 'call a tool~(function call)', { ts: 10 });
    b += AP(u, 'M522 51H560V90V116H478', { m: 'ag', c: 'var(--good)' });
    b += F('M522 51H560V90V116H478', { c: 'var(--good)' });
    b += B(342, 118, 150, 42, 'observe~tool result', { ts: 10, f: 'var(--surface-2)' });
    b += AP(u, 'M342 139H300V96', { m: 'aa' });
    b += T(300, 100, 'loop', { s: 9, c: 'var(--ink-dim)' });
    b += A(u, 326, 110, 560, 84, { c: 'var(--ink-dim)', d: '4 4' });
    b += B(560, 70, 150, 44, 'final answer~(stop)', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += R(372, 178, 300, 30, { f: 'var(--surface-3)' });
    b += T(522, 197, 'stopping rule: goal reached, max steps, or budget spent', { s: 9, c: 'var(--ink-dim)' });
    b += AP(u, 'M522 178V150', { m: 'none', d: '3 3' });
    return S(214, b);
  };
  C['agent-tool-loop'] = 'The model decides whether to call a tool, reads the result back, and loops; the <b>stopping rule</b> is what finally sends it to a final answer instead of another step.';

  V['model-router'] = function (u) {
    var b = D(u, 'ar aa ad');
    b += HD('routing a request to the right-sized model');
    b += B(20, 78, 110, 44, 'incoming~request');
    b += A(u, 130, 100, 190, 100);
    b += B(190, 78, 140, 44, 'router~(classify difficulty)');
    b += A(u, 330, 90, 420, 48, { c: 'var(--accent)', m: 'aa' });
    b += F('M330 90L420 48', { c: 'var(--accent)' });
    b += A(u, 330, 100, 420, 100);
    b += A(u, 330, 110, 420, 152, { d: '4 4' });
    b += B(420, 28, 150, 38, 'model A~cheap, fast', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(420, 82, 150, 38, 'model B~balanced', { ts: 10 });
    b += B(420, 136, 150, 38, 'model C~strongest, priciest', { ts: 10 });
    b += AP(u, 'M494 28C560 -4 610 8 606 24', { m: 'ad', c: 'var(--danger)', d: '3 3' });
    b += T(606, 16, 'low confidence: escalate', { s: 9, c: 'var(--danger)', a: 'end' });
    b += T(494, 174, 'the router picks a route each request; a shaky answer can retry on a stronger model', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(196, b);
  };
  C['model-router'] = 'A cheap classifier reads each request and routes most of them to a cheap, fast model; only the harder or lower-confidence ones pay for the strongest model.';

  /* ---------------------------------------------------------- training at scale */

  V['roofline'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('the roofline model: two ceilings, one for each resource');
    b += LN(60, 176, 720, 176);
    b += LN(60, 176, 60, 30);
    var path = 'M60 176L300 46L720 46';
    b += AP(u, path, { c: 'var(--accent)', w: 2.2, m: 'none' });
    b += F(path);
    b += LN(300, 46, 300, 176, { d: '4 4' });
    b += T(300, 190, 'ridge point (~153 FLOP/byte on an A100)', { s: 9, c: 'var(--ink-dim)', a: 'middle' });
    b += T(70, 168, 'memory-bandwidth~limit', { a: 'start', s: 9, c: 'var(--accent)' });
    b += T(500, 38, 'peak compute (FLOPs/s)', { a: 'middle', s: 9, c: 'var(--accent)' });
    b += DT(140, 138, 6, { f: 'var(--warning)' });
    b += T(140, 122, 'elementwise op~memory-bound', { s: 9, c: 'var(--warning)' });
    b += DT(560, 46, 6, { f: 'var(--good)' });
    b += T(560, 30, 'large matmul~compute-bound', { s: 9, c: 'var(--good)' });
    b += T(390, 200, 'arithmetic intensity: FLOPs of compute per byte moved from memory', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(214, b);
  };
  C['roofline'] = 'Every chip has two ceilings: how fast it can compute and how fast it can move bytes. An operation sits under whichever ceiling its <b>arithmetic intensity</b> hits first.';

  V['memory-per-parameter'] = function (u) {
    var b = D(u, 'ar'), rows = [
      { l: 'fp16 param', bytes: 2 }, { l: 'fp16 gradient', bytes: 2 },
      { l: 'fp32 master param', bytes: 4 }, { l: 'fp32 momentum', bytes: 4 }, { l: 'fp32 variance', bytes: 4 }
    ], i, y0 = 36, x0 = 220, scale = 28;
    b += HD('16 bytes per parameter: mixed precision with Adam');
    for (i = 0; i < rows.length; i++) {
      var y = y0 + i * 30, w = rows[i].bytes * scale;
      b += T(210, y + 15, rows[i].l, { a: 'end', s: 10, c: 'var(--ink-dim)' });
      b += R(x0, y, w, 22, { f: i < 2 ? 'var(--accent)' : 'var(--warning)' });
      b += T(x0 + w + 8, y + 15, rows[i].bytes + ' bytes', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    }
    b += LN(x0, y0 - 6, x0, y0 + rows.length * 30 - 8, { d: '3 3' });
    b += T(x0 + 224, y0 + rows.length * 30 + 6, 'total: 16 bytes/param', { s: 12, w: 1, c: 'var(--ink)', cls: 'v-pulse' });
    b += T(390, 210, '7B params x 16 bytes = 112 GB, before any activation memory', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(226, b);
  };
  C['memory-per-parameter'] = 'Every trained parameter costs 16 bytes in mixed-precision Adam training: two small copies used to compute, and three larger fp32 copies the optimiser needs to update it correctly.';

  V['data-parallel-allreduce'] = function (u) {
    var b = D(u, 'ar aa'), i, xs = [40, 220, 400, 580];
    b += HD('data parallelism: same model, different data, synced gradients');
    for (i = 0; i < 4; i++) {
      b += B(xs[i], 34, 140, 42, 'GPU ' + i + '~full model replica', { ts: 10 });
      b += R(xs[i], 96, 140, 28, { f: 'var(--surface-3)' });
      b += T(xs[i] + 70, 114, 'batch shard ' + i, { s: 9, c: 'var(--ink-dim)' });
      b += A(u, xs[i] + 70, 96, xs[i] + 70, 78);
    }
    var ring = 'M110 34C110 8 250 8 250 34M290 34C290 8 430 8 430 34M470 34C470 8 610 8 610 34';
    b += AP(u, ring, { c: 'var(--accent)', m: 'aa', w: 1.8 });
    b += F(ring);
    b += AP(u, 'M650 34C700 34 700 -6 40 -6C-10 -6 -10 30 20 34', { c: 'var(--accent)', m: 'aa', w: 1.8, d: '4 4' });
    b += R(190, 150, 380, 36, { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += T(380, 172, 'gradient all-reduce: every GPU ends with the identical, averaged gradient', { s: 10, c: 'var(--ink)' });
    return S(200, b);
  };
  C['data-parallel-allreduce'] = 'Each replica trains on its own shard of the batch, then a ring <b>all-reduce</b> sums and shares the gradients, so every replica takes the same optimiser step and stays identical.';

  V['zero-sharding'] = function (u) {
    var b = D(u, 'ar'), i, cols = [
      { x: 110, title: 'DDP baseline', shard: [false, false, false] },
      { x: 300, title: 'ZeRO-2', shard: [false, true, true] },
      { x: 490, title: 'ZeRO-3', shard: [true, true, true] }
    ], rowY = [48, 78, 108], rowLabel = ['params', 'gradients', 'optimizer state'], c, r;
    b += HD('ZeRO / FSDP: sharding what used to be replicated');
    for (r = 0; r < 3; r++) { b += T(96, rowY[r] + 15, rowLabel[r], { a: 'end', s: 10, c: 'var(--ink-dim)' }); }
    for (c = 0; c < cols.length; c++) {
      b += T(cols[c].x + 60, 26, cols[c].title, { s: 11, w: 1, a: 'middle' });
      for (r = 0; r < 3; r++) {
        b += R(cols[c].x, rowY[r], 120, 20, { f: 'var(--surface-3)' });
        var w = cols[c].shard[r] ? 30 : 120;
        b += R(cols[c].x, rowY[r], w, 20, { f: 'var(--accent)' });
      }
    }
    b += T(400, 150, 'the shaded strip is what one GPU actually holds; the rest lives on other GPUs', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    b += T(400, 172, 'FSDP gathers a shard just before it is used in the forward or backward pass, then frees it again', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(190, b);
  };
  C['zero-sharding'] = 'ZeRO shards optimiser state, then gradients, then parameters themselves across GPUs one stage at a time; FSDP is the same idea, gathering each shard only when it is needed.';

  V['pipeline-bubbles'] = function (u) {
    var b = D(u, 'ar'), s, i, stages = 4, micro = 4, cw = 40, x0 = 140, rowY = [40, 74, 108, 142], rowH = 26;
    b += HD('pipeline parallelism: bubbles when a stage waits');
    for (s = 0; s < stages; s++) {
      var fSlots = {}, bSlots = {}, k;
      for (k = 0; k < micro; k++) { fSlots[s + k] = k + 1; }
      for (k = 0; k < micro; k++) { bSlots[7 + (stages - 1 - s) + k] = k + 1; }
      var minSlot = s, maxSlot = 7 + (stages - 1 - s) + (micro - 1);
      b += T(90, rowY[s] + 17, 'stage ' + s, { a: 'end', s: 10, c: 'var(--ink-dim)' });
      for (i = minSlot; i <= maxSlot; i++) {
        var cx = x0 + i * cw;
        if (fSlots[i] !== undefined) {
          b += R(cx, rowY[s], cw - 4, rowH, { f: 'var(--accent)' });
          b += T(cx + (cw - 4) / 2, rowY[s] + 17, 'F' + fSlots[i], { s: 9, c: 'var(--accent-ink)' });
        } else if (bSlots[i] !== undefined) {
          b += R(cx, rowY[s], cw - 4, rowH, { f: 'var(--good)' });
          b += T(cx + (cw - 4) / 2, rowY[s] + 17, 'B' + bSlots[i], { s: 9, c: 'var(--accent-ink)' });
        } else {
          b += R(cx, rowY[s], cw - 4, rowH, { f: 'var(--warning-weak)', sk: 'var(--warning)' });
        }
      }
    }
    b += T(400, 190, 'orange cells are bubbles: idle time while a stage waits for work to arrive', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(204, b);
  };
  C['pipeline-bubbles'] = 'Forward microbatches (<b>F</b>) step diagonally through the stages, then backward ones (<b>B</b>) step back; the earliest stage sits idle longest waiting for the round trip, which is the pipeline bubble.';

}(typeof window !== 'undefined' ? window : this));
