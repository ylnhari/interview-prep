/* ml-foundations-c diagrams: deep learning mechanics and hands-on MLOps tooling. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  V['neuron-layer'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += T(24, 20, 'one neuron', { a: 'start', s: 12, w: 1 });
    b += T(400, 20, 'a layer: neurons run in parallel', { a: 'start', s: 12, w: 1 });
    b += LN(380, 30, 380, 190, { d: '3 4' });
    var ys = [50, 85, 120];
    for (i = 0; i < 3; i++) {
      b += T(28, ys[i] + 4, 'x' + (i + 1), { a: 'end', s: 10, c: 'var(--ink-dim)' });
      b += DT(38, ys[i], 3, { f: 'var(--ink-dim)' });
      b += AP(u, 'M42 ' + ys[i] + 'L152 85', { c: 'var(--ink-dim)', w: 1.1, m: 'none' });
      b += T(72, ys[i] - 10 + i * 8, 'w' + (i + 1), { s: 9, c: 'var(--accent)' });
    }
    b += F('M42 50L152 85M42 85L152 85M42 120L152 85');
    b += DT(168, 85, 20, { f: 'var(--surface-2)', sk: 'var(--border)' });
    b += T(168, 89, 'sum+b', { s: 9, w: 1 });
    b += A(u, 190, 85, 214, 85);
    b += B(216, 66, 60, 38, 'f(z)', { ts: 12 });
    b += A(u, 278, 85, 320, 85, { c: 'var(--accent)', m: 'aa' });
    b += F('M278 85L320 85');
    b += DT(330, 85, 4, { f: 'var(--accent)' });
    b += T(346, 89, 'y', { a: 'start', s: 11 });
    b += T(190, 165, 'weight, sum, bias, then a non-linearity', { s: 10, c: 'var(--ink-dim)', a: 'middle' });

    var iy = [46, 85, 124], ny = [46, 85, 124], nx = 560, ix = 420, n;
    for (i = 0; i < 3; i++) { b += DT(ix, iy[i], 3, { f: 'var(--ink-dim)' }); }
    var lines = '';
    for (n = 0; n < 3; n++) { for (i = 0; i < 3; i++) { lines += 'M' + ix + ' ' + iy[i] + 'L' + (nx - 18) + ' ' + ny[n] + ' '; } }
    b += AP(u, lines, { c: 'var(--border)', w: 0.8, m: 'none' });
    for (n = 0; n < 3; n++) {
      b += DT(nx, ny[n], 16, { f: 'var(--surface-2)', sk: 'var(--border)' });
      b += T(nx, ny[n] + 4, 'f', { s: 11, w: 1 });
      b += A(u, nx + 16, ny[n], nx + 60, ny[n], { c: 'var(--accent)', m: 'aa' });
      b += T(nx + 74, ny[n] + 4, 'y' + (n + 1), { a: 'start', s: 10 });
    }
    b += F('M' + ix + ' 85L' + (nx - 18) + ' 46M' + ix + ' 85L' + (nx - 18) + ' 85M' + ix + ' 85L' + (nx - 18) + ' 124');
    return S(204, b);
  };
  C['neuron-layer'] = 'A neuron multiplies every input by a learned <b>weight</b>, adds a <b>bias</b>, and passes the sum through an <b>activation function</b>. A layer runs many neurons on the same inputs at once; stacking layers is what makes it a network.';

  V['backprop-two-layer'] = function (u) {
    var b = D(u, 'ar aa ad');
    b += HD('backprop through a tiny 2-layer net', 'x = [1.0, 2.0], target y = 1');
    b += B(24, 60, 130, 40, 'input~x1=1.0, x2=2.0', { ts: 10 });
    b += B(196, 50, 150, 60, 'hidden~A: z=-0.2 to a=0 (dead)~B: z=0.9 to a=0.90', { ts: 9 });
    b += B(388, 60, 150, 40, 'output~z=-0.07, y-hat=0.48', { ts: 10 });
    b += B(580, 60, 150, 40, 'loss~L = 0.73 (cross-entropy)', { ts: 9 });
    b += A(u, 154, 80, 192, 80, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 346, 80, 384, 80, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 538, 80, 576, 80, { c: 'var(--accent)', m: 'aa' });
    b += F('M154 80L192 80M346 80L384 80M538 80L576 80');
    b += T(400, 44, 'forward pass', { s: 10, c: 'var(--accent)', a: 'middle' });
    b += A(u, 576, 140, 392, 140, { c: 'var(--danger)', m: 'ad' });
    b += A(u, 384, 140, 200, 140, { c: 'var(--danger)', m: 'ad' });
    b += A(u, 192, 140, 30, 140, { c: 'var(--danger)', m: 'ad' });
    b += T(486, 130, 'dL/dz_out = y-hat - y = -0.52', { s: 9, c: 'var(--danger)', a: 'middle' });
    b += T(290, 130, 'dL/da_B=0.16, dL/da_A=0', { s: 9, c: 'var(--danger)', a: 'middle' });
    b += T(112, 130, 'dW_B=[0.16,0.31], dW_A=0', { s: 9, c: 'var(--danger)', a: 'middle' });
    b += T(400, 160, 'backward pass', { s: 10, c: 'var(--danger)', a: 'middle' });
    b += T(400, 198, 'ReLU has a derivative of 0 for z below 0, so no gradient reaches A this step: a dead unit stops learning', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(216, b);
  };
  C['backprop-two-layer'] = 'The seed of every gradient in this tiny net is <b>y-hat minus y</b> at the output; it is scaled and passed backward layer by layer, and a ReLU unit that fired negative this step gets a gradient of exactly zero.';

  V['norm-layers'] = function (u) {
    var b = D(u, 'ar'), panels = [
      { x: 40, title: 'BatchNorm', sub: 'normalize each feature~down the batch', use: 'CNNs; needs a real batch', axis: 'col' },
      { x: 300, title: 'LayerNorm', sub: 'normalize each example~across its features', use: 'transformers, RNNs; batch of 1 is fine', axis: 'row' },
      { x: 560, title: 'RMSNorm', sub: 'like LayerNorm, skips~the mean-centring step', use: 'most current large language models', axis: 'row' }
    ], p, r, c, cell = 16;
    for (p = 0; p < panels.length; p++) {
      var px = panels[p].x;
      b += T(px + 32, 22, panels[p].title, { s: 12, w: 1, a: 'middle' });
      b += ML(px + 32, 42, panels[p].sub, { ts: 9, tc: 'var(--ink-dim)', tc2: 'var(--ink-dim)' });
      for (r = 0; r < 4; r++) {
        for (c = 0; c < 4; c++) {
          var gx = px + c * cell, gy = 68 + r * cell;
          var hi = panels[p].axis === 'col' ? (c === 1) : (r === 1);
          b += R(gx, gy, cell - 2, cell - 2, { f: hi ? 'var(--accent)' : 'var(--surface-2)', sk: 'var(--border)', cls: hi ? 'v-pulse' : undefined });
        }
      }
      b += T(px + 32, 152, panels[p].use, { s: 9, c: 'var(--ink-dim)', a: 'middle' });
    }
    b += T(380, 192, 'the highlighted cells are normalized together (RMSNorm: scale only, no mean subtraction)', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(208, b);
  };
  C['norm-layers'] = 'The three normalisers differ only in which axis they average over: BatchNorm goes down the batch for one feature, LayerNorm and RMSNorm go across the features of one example.';

  V['lr-schedule'] = function (u) {
    var b = D(u, 'ar'), i, pts = '', x0 = 60, x1 = 700, y0 = 156, yTop = 46, warm = 15, total = 100, n = 40;
    b += HD('warm-up, then cosine decay');
    b += LN(x0, y0, x1, y0);
    b += LN(x0, y0, x0, 30);
    b += T(x0 - 8, 34, 'lr', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += T((x0 + x1) / 2, 178, 'training step', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    for (i = 0; i <= n; i++) {
      var s = total * i / n, lr;
      if (s <= warm) { lr = s / warm; } else {
        var t = (s - warm) / (total - warm);
        lr = 0.5 * (1 + Math.cos(Math.PI * t));
      }
      var x = x0 + (x1 - x0) * s / total, y = y0 - lr * (y0 - yTop);
      pts += Math.round(x) + ',' + Math.round(y) + ' ';
    }
    b += PL(pts, { c: 'var(--accent)', w: 2 });
    var wx = x0 + (x1 - x0) * warm / total;
    b += LN(wx, y0, wx, yTop, { d: '3 3' });
    b += T(x0 + 30, 40, 'warm-up', { s: 10, c: 'var(--accent)' });
    b += T((wx + x1) / 2, 40, 'cosine decay', { s: 10, c: 'var(--accent)' });
    b += DT(wx, yTop, 4, { f: 'var(--accent)', cls: 'v-pulse' });
    b += T(400, 200, 'weight decay shrinks every weight a little each step; gradient clipping caps a spike before it lands', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(214, b);
  };
  C['lr-schedule'] = 'The learning rate ramps up during <b>warm-up</b>, while Adam’s early gradient estimates are still unreliable, then rides a <b>cosine curve</b> back down as training settles.';

  V['conv-receptive-field'] = function (u) {
    var b = D(u, 'ar');
    b += HD('receptive field: how far back one output cell can see');
    var rows = [
      { y: 30, n: 4, x0: 160, label: 'deepest layer' },
      { y: 90, n: 6, x0: 90, label: 'middle layer' },
      { y: 150, n: 8, x0: 20, label: 'input image' }
    ], hi = [[2], [1, 2, 3], [0, 1, 2, 3, 4]], r, c;
    var poly = (rows[0].x0 + hi[0][0] * 70) + ',' + (rows[0].y + 28) + ' ' + (rows[0].x0 + (hi[0][0] + 1) * 70) + ',' + (rows[0].y + 28) + ' ' +
      (rows[2].x0 + (hi[2][hi[2].length - 1] + 1) * 70) + ',' + rows[2].y + ' ' + (rows[2].x0 + hi[2][0] * 70) + ',' + rows[2].y;
    b += PG(poly, { f: 'var(--accent-weak)' });
    for (r = 0; r < rows.length; r++) {
      for (c = 0; c < rows[r].n; c++) {
        var isHi = hi[r].indexOf(c) !== -1;
        b += R(rows[r].x0 + c * 70, rows[r].y, 64, 26, { f: isHi ? 'var(--accent)' : 'var(--surface-2)', sk: 'var(--border)', cls: (isHi && r === 0) ? 'v-pulse' : undefined });
      }
      b += T(rows[r].x0 + rows[r].n * 70 + 12, rows[r].y + 17, rows[r].label, { a: 'start', s: 9, c: 'var(--ink-dim)' });
    }
    b += T(380, 202, 'stride and pooling shrink the map; stacking layers grows what one late cell has seen', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(214, b);
  };
  C['conv-receptive-field'] = 'Two stacked 3x3 convolutions already give one output cell a 5x5 view of the original image, at a fraction of one 5x5 convolution’s parameters.';

  V['attention-heads'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += HD('multi-head attention', 'softmax(QK^T / sqrt(d_k)) V, run h times in parallel');
    b += B(24, 40, 60, 34, 'Q', { ts: 11 });
    b += B(24, 84, 60, 34, 'K', { ts: 11 });
    b += B(24, 128, 60, 34, 'V', { ts: 11 });
    var hy = [30, 84, 138];
    for (i = 0; i < 3; i++) {
      b += AP(u, 'M84 57L200 ' + (hy[i] + 17), { c: 'var(--ink-dim)', w: 1, m: 'none' });
      b += AP(u, 'M84 101L200 ' + (hy[i] + 17), { c: 'var(--ink-dim)', w: 1, m: 'none' });
      b += AP(u, 'M84 145L200 ' + (hy[i] + 17), { c: 'var(--ink-dim)', w: 1, m: 'none' });
      b += B(202, hy[i], 150, 34, 'head ' + (i + 1) + '~softmax(QK^T/sqrt dk)V', { ts: 9 });
      b += A(u, 354, hy[i] + 17, 420, hy[i] + 17, { c: 'var(--accent)', m: 'aa' });
    }
    b += F('M354 47L420 47M354 101L420 101M354 155L420 155');
    b += B(424, 76, 90, 40, 'concat', { ts: 10 });
    b += A(u, 516, 96, 560, 96, { c: 'var(--accent)', m: 'aa' });
    b += B(562, 76, 90, 40, 'linear', { ts: 10 });
    b += A(u, 654, 96, 700, 96, { c: 'var(--accent)', m: 'aa' });
    b += F('M654 96L700 96');
    b += T(716, 100, 'out', { a: 'start', s: 10 });
    b += T(380, 200, 'each head learns its own Q/K/V projection, so different heads attend to different relationships', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(214, b);
  };
  C['attention-heads'] = 'Every head compares queries against keys to weight the values, in parallel, with its own learned projections; the heads are concatenated and mixed by one more learned layer.';

  V['encoder-decoder-vs-decoder'] = function (u) {
    var b = D(u, 'ar aa');
    b += T(24, 20, 'encoder-decoder (e.g. T5)', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'decoder-only (e.g. GPT-style)', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 190, { d: '3 4' });
    b += B(30, 50, 140, 44, 'encoder~bidirectional self-attention', { ts: 9 });
    b += B(210, 50, 140, 44, 'decoder~masked self-attention', { ts: 9 });
    b += AP(u, 'M170 72L206 72', { c: 'var(--accent)', m: 'aa' });
    b += T(188, 62, 'cross-attn', { s: 8, c: 'var(--accent)', a: 'middle' });
    b += F('M170 72L206 72');
    b += A(u, 280, 116, 280, 140, { c: 'var(--accent)', m: 'aa' });
    b += T(280, 156, 'output tokens, one at a time', { s: 9, c: 'var(--ink-dim)', a: 'middle' });
    b += B(440, 50, 260, 44, 'decoder stack~causal (masked) self-attention only', { ts: 9 });
    b += A(u, 570, 94, 570, 140, { c: 'var(--accent)', m: 'aa' });
    b += F('M570 94L570 140');
    b += T(570, 156, 'each token attends only to earlier ones', { s: 9, c: 'var(--ink-dim)', a: 'middle' });
    b += T(400, 190, 'both stacks repeat the same attention block; the difference is what each position is allowed to see', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(204, b);
  };
  C['encoder-decoder-vs-decoder'] = 'An encoder-decoder splits reading (bidirectional) from writing (causal, plus cross-attention on the encoder); a decoder-only model does both with one causal stack.';

  V['dvc-pipeline'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('DVC: pointers in Git, bytes in a remote');
    b += B(24, 40, 130, 44, 'Git repo~.dvc pointer files', { ts: 10 });
    b += B(200, 40, 130, 44, 'prepare', { ts: 10 });
    b += B(360, 40, 130, 44, 'train', { ts: 10 });
    b += B(520, 40, 130, 44, 'evaluate', { ts: 10 });
    b += A(u, 154, 62, 196, 62, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 330, 62, 356, 62, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 490, 62, 516, 62, { c: 'var(--accent)', m: 'aa' });
    b += F('M154 62L196 62M330 62L356 62M490 62L516 62');
    b += T(400, 24, 'stages declared in dvc.yaml, run with dvc repro', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    b += CY(180, 118, 200, 50, 'remote storage~S3-style bucket', { ts: 10 });
    b += AP(u, 'M265 84V116', { c: 'var(--ink-dim)', d: '4 4', m: 'none' });
    b += AP(u, 'M425 84V116', { c: 'var(--ink-dim)', d: '4 4', m: 'none' });
    b += AP(u, 'M585 84V116', { c: 'var(--ink-dim)', d: '4 4', m: 'none' });
    b += T(400, 195, 'dvc push / dvc pull move the actual data and model bytes; git only ever holds a hash', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(208, b);
  };
  C['dvc-pipeline'] = 'Git tracks a small hash pointer; the real data and model bytes live in a remote bucket, moved only by <b>dvc push</b> and <b>dvc pull</b>.';

  V['mlflow-registry'] = function (u) {
    var b = D(u, 'ar aa ag'), i;
    b += HD('MLflow: track runs, promote a version');
    b += B(24, 40, 170, 70, 'training run~params, metrics,~artifacts logged', { ts: 10 });
    b += A(u, 198, 75, 240, 75, { c: 'var(--accent)', m: 'aa' });
    b += F('M198 75L240 75');
    b += B(244, 40, 150, 70, 'tracking server~one row per run', { ts: 10 });
    b += A(u, 398, 75, 440, 75, { c: 'var(--accent)', m: 'aa' });
    b += T(420, 60, 'register', { s: 9, c: 'var(--accent)', a: 'middle' });
    var vy = [40, 90, 140], stages = ['v1: Archived', 'v2: Production', 'v3: Staging (candidate)'], cols = ['var(--surface-3)', 'var(--good)', 'var(--warning)'];
    for (i = 0; i < 3; i++) { b += B(444, vy[i], 200, 34, stages[i], { ts: 9, f: cols[i] }); }
    b += AP(u, 'M549 157C630 157 630 105 549 105', { c: 'var(--good)', m: 'ag', d: '5 4' });
    b += T(646, 130, 'promote', { s: 9, c: 'var(--good)' });
    b += T(400, 200, 'promoting v3 to Production and archiving v2 is one auditable step, not a file copied by hand', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(212, b);
  };
  C['mlflow-registry'] = 'Every run logs its params, metrics and artifacts; promoting a registered version to Production (and archiving the old one) is a recorded action, not a manual file swap.';

  V['fastapi-serving'] = function (u) {
    var b = D(u, 'ar aa ad');
    b += HD('a FastAPI inference endpoint');
    b += B(24, 70, 100, 40, 'client', { ts: 10 });
    b += A(u, 126, 90, 166, 90, { c: 'var(--accent)', m: 'aa' });
    b += B(170, 60, 150, 60, 'request model~Pydantic validates', { ts: 9 });
    b += A(u, 322, 90, 362, 90, { c: 'var(--accent)', m: 'aa' });
    b += B(366, 60, 130, 60, 'batcher~collects for a few ms', { ts: 9 });
    b += A(u, 498, 90, 538, 90, { c: 'var(--accent)', m: 'aa' });
    b += B(542, 60, 110, 60, 'model~inference call', { ts: 9 });
    b += A(u, 652, 90, 692, 90, { c: 'var(--accent)', m: 'aa' });
    b += F('M126 90L166 90M322 90L362 90M498 90L538 90M652 90L692 90');
    b += T(716, 94, 'response', { a: 'start', s: 9, c: 'var(--ink-dim)' });
    b += AP(u, 'M607 60V26H80V70', { c: 'var(--danger)', d: '4 4', m: 'ad' });
    b += T(350, 20, 'a failed validation returns 422 immediately, before any batch or model call', { s: 9, c: 'var(--danger)', a: 'middle' });
    b += B(200, 150, 160, 36, 'GET /healthz~liveness and readiness', { ts: 9, f: 'var(--surface-3)' });
    b += T(400, 205, 'a timeout wraps the model call itself, so one slow batch never hangs every client waiting on the endpoint', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(218, b);
  };
  C['fastapi-serving'] = 'A Pydantic request model rejects a bad request with a 422 before any model code runs; a batcher groups what is left for the GPU, and a timeout wraps only the model call.';

  V['k8s-ml-service'] = function (u) {
    var b = D(u, 'ar aa aw'), i;
    b += HD('a minimal ML service on Kubernetes');
    b += B(24, 70, 100, 40, 'Ingress', { ts: 10 });
    b += A(u, 126, 90, 166, 90, { c: 'var(--accent)', m: 'aa' });
    b += B(170, 70, 100, 40, 'Service', { ts: 10 });
    b += A(u, 272, 90, 312, 90, { c: 'var(--accent)', m: 'aa' });
    b += F('M126 90L166 90M272 90L312 90');
    var px = [316, 400, 484];
    for (i = 0; i < 3; i++) { b += B(px[i], 70, 76, 40, 'Pod~GPU node', { ts: 9, f: i === 2 ? 'var(--surface-3)' : 'var(--surface-2)' }); }
    b += B(600, 46, 130, 40, 'HPA~watches queue depth', { ts: 9 });
    b += AP(u, 'M600 66C560 66 500 42 460 66', { c: 'var(--warning)', m: 'aw', d: '4 4' });
    b += T(600, 28, 'scales replicas up or down', { s: 9, c: 'var(--warning)', a: 'middle' });
    b += B(316, 140, 244, 34, 'resources: requests and limits~cpu, memory, nvidia.com/gpu', { ts: 9 });
    b += T(400, 200, 'a GPU node pool is tainted so only GPU pods land there; requests reserve capacity, limits cap it', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(214, b);
  };
  C['k8s-ml-service'] = 'Ingress and Service front a Deployment’s Pods on a GPU node pool; the HPA watches a load metric and changes the replica count.';

  V['ci-cd-ml'] = function (u) {
    var b = D(u, 'ar aa ag ad');
    b += HD('CI/CD for a model, not just code');
    b += B(20, 70, 100, 40, 'commit', { ts: 10 });
    b += A(u, 122, 90, 158, 90, { c: 'var(--accent)', m: 'aa' });
    b += B(162, 60, 140, 60, 'CI~unit tests + data validation', { ts: 9 });
    b += A(u, 304, 90, 340, 90, { c: 'var(--accent)', m: 'aa' });
    b += B(344, 60, 130, 60, 'train or build~image + model', { ts: 9 });
    b += A(u, 476, 90, 512, 90, { c: 'var(--accent)', m: 'aa' });
    b += B(516, 60, 120, 60, 'registry~new candidate version', { ts: 9 });
    b += A(u, 638, 90, 674, 90, { c: 'var(--good)', m: 'ag' });
    b += F('M122 90L158 90M304 90L340 90M476 90L512 90M638 90L674 90');
    b += B(560, 150, 150, 36, 'GitOps CD~ArgoCD / Flux reconciles', { ts: 9 });
    b += AP(u, 'M600 150V126H460V90', { c: 'var(--good)', m: 'ag', d: '4 4' });
    b += T(400, 30, 'a failing data-validation check blocks here, before anything trains', { s: 9, c: 'var(--danger)', a: 'middle' });
    b += AP(u, 'M232 60V30', { c: 'var(--danger)', d: '3 3', m: 'ad' });
    b += T(400, 205, 'the pipeline promotes a versioned model artefact; the cluster is reconciled to match, not pushed to by hand', { s: 10, c: 'var(--ink-dim)', a: 'middle' });
    return S(220, b);
  };
  C['ci-cd-ml'] = 'CI blocks on a failing data-validation check before anything trains; a passing candidate becomes a registry version, and GitOps reconciles the cluster to whatever the registry now says.';

}(typeof window !== 'undefined' ? window : this));
