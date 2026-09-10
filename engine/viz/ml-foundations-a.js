/* ml-foundations-a diagrams: the maths of ML, and data/generalisation. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  V['dot-product-similarity'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('dot product and cosine similarity', 'a = (1,2,3)  b = (4,5,6)');
    b += LN(70, 190, 420, 190);
    b += LN(70, 40, 70, 190);
    b += A(u, 70, 190, 330, 90, { c: 'var(--accent)', w: 2.4, m: 'aa' });
    b += T(340, 84, 'a', { a: 'start', s: 12, c: 'var(--accent)', w: 1 });
    b += A(u, 70, 190, 300, 140, { c: 'var(--good)', w: 2.4, m: 'ag' });
    b += T(306, 148, 'b', { a: 'start', s: 12, c: 'var(--good)', w: 1 });
    b += AP(u, 'M170 172A110 110 0 0 1 220 130', { m: 'none', c: 'var(--warning)', w: 1.6, cls: 'v-pulse' });
    b += T(198, 158, 'θ', { s: 12, c: 'var(--warning)', w: 1 });
    b += F('M70 190L330 90', { cls: 'v-flow-slow', c: 'var(--accent)', w: 1.6, d: '4 6' });
    b += B(460, 40, 268, 40, 'dot(a,b) = 4 + 10 + 18 = 32', { ts: 12, f: 'var(--surface-2)' });
    b += B(460, 88, 268, 40, '||a|| ≈ 3.74   ||b|| ≈ 8.78', { ts: 12, f: 'var(--surface-2)' });
    b += B(460, 136, 268, 44, 'cos(θ) = 32 / (3.74·8.78) ≈ 0.97', { ts: 12, f: 'var(--accent-weak)', sk: 'var(--accent)', cls: 'v-pulse' });
    b += T(380, 210, 'cosine ignores length; the dot product alone does not', { s: 10, c: 'var(--ink-dim)' });
    return S(226, b);
  };

  V['gradient-descent-bowl'] = function (u) {
    var b = D(u, 'ar aa'), i, inner = '';
    b += HD('gradient descent', 'θ(t+1) = θ(t) − η·∇L(θ(t))');
    b += AP(u, 'M70 60Q400 210 730 60', { m: 'none', c: 'var(--border)', w: 2 });
    var xs = [110, 195, 275, 350, 415, 470];
    var ys = [70, 105, 133, 155, 170, 178];
    for (i = 0; i < xs.length - 1; i++) {
      inner += '<g' + IX(i) + '>' + A(u, xs[i], ys[i], xs[i + 1], ys[i + 1], { c: 'var(--accent)', w: 1.8, m: 'aa' }) + '</g>';
    }
    for (i = 0; i < xs.length; i++) {
      inner += '<g' + IX(i) + '>' + DT(xs[i], ys[i], i === xs.length - 1 ? 7 : 5, { f: i === xs.length - 1 ? 'var(--good)' : 'var(--accent)', cls: i === xs.length - 1 ? 'v-pulse' : '' }) + '</g>';
    }
    b += SQ(inner);
    b += LN(400, 30, 400, 200, { d: '3 4' });
    b += T(400, 22, 'minimum', { s: 10, c: 'var(--ink-dim)' });
    b += T(150, 44, 'large step: slope is steep here', { s: 10, c: 'var(--ink-dim)' });
    b += T(560, 194, 'tiny steps as the slope flattens', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 222, 'each step moves opposite the gradient; step size shrinks with the slope', { s: 10, c: 'var(--ink-dim)' });
    return S(232, b);
  };

  V['chain-rule-graph'] = function (u) {
    var b = D(u, 'ar aa aw');
    b += HD('backpropagation is the chain rule through a graph');
    b += B(24, 46, 84, 44, 'x', { ts: 12 });
    b += A(u, 108, 68, 148, 68);
    b += F('M108 68H148');
    b += B(152, 46, 100, 44, 'f(x)', { ts: 12 });
    b += A(u, 252, 68, 292, 68);
    b += F('M252 68H292');
    b += B(296, 46, 100, 44, 'g(u)', { ts: 12 });
    b += A(u, 396, 68, 436, 68);
    b += F('M396 68H436');
    b += B(440, 46, 100, 44, 'L', { ts: 13, f: 'var(--surface-3)' });
    b += T(720, 62, 'forward: compute + store', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += A(u, 436, 132, 396, 132, { c: 'var(--warning)', m: 'aw' });
    b += F('M436 132H396', { c: 'var(--warning)', cls: 'v-flow-slow' });
    b += T(416, 150, 'dL/du', { s: 10, c: 'var(--warning)' });
    b += A(u, 292, 132, 252, 132, { c: 'var(--warning)', m: 'aw' });
    b += F('M292 132H252', { c: 'var(--warning)', cls: 'v-flow-slow' });
    b += T(272, 150, 'dL/df · df/dx', { s: 10, c: 'var(--warning)' });
    b += A(u, 148, 132, 108, 132, { c: 'var(--warning)', m: 'aw' });
    b += F('M148 132H108', { c: 'var(--warning)', cls: 'v-flow-slow' });
    b += T(128, 150, 'dL/dx', { s: 10, c: 'var(--warning)' });
    b += T(720, 148, 'backward: multiply local derivatives', { a: 'end', s: 10, c: 'var(--warning)' });
    b += B(24, 178, 232, 40, 'f(x) = (3x+1)² at x=2 → f\' = 42', { ts: 10, f: 'var(--surface-2)' });
    b += T(500, 200, 'one backward pass gives every parameter\'s gradient at once', { s: 10, c: 'var(--ink-dim)' });
    return S(224, b);
  };

  V['softmax-temperature'] = function (u) {
    var b = D(u, 'ar aa'), i, inner = '';
    b += HD('softmax temperature', 'logits (2, 1, 0.1)');
    var t1 = [0.659, 0.242, 0.099];
    var t2 = [0.502, 0.304, 0.194];
    var names = ['class A', 'class B', 'class C'];
    b += T(160, 40, 'T = 1 (sharp)', { s: 11, c: 'var(--accent)' });
    for (i = 0; i < 3; i++) {
      var h = Math.round(t1[i] * 120);
      inner += '<g' + IX(i) + '>' + GROW(R(90 + i * 60, 170 - h, 40, h, { f: 'var(--accent-weak)', sk: 'var(--accent)' })) + T(110 + i * 60, 186, names[i], { s: 9, c: 'var(--ink-dim)' }) + T(110 + i * 60, 164 - h, (t1[i] * 100).toFixed(0) + '%', { s: 10, c: 'var(--accent-ink)' }) + '</g>';
    }
    b += T(560, 40, 'T = 2 (flatter)', { s: 11, c: 'var(--good)' });
    for (i = 0; i < 3; i++) {
      var h2 = Math.round(t2[i] * 120);
      inner += '<g' + IX(i + 3) + '>' + GROW(R(490 + i * 60, 170 - h2, 40, h2, { f: 'var(--good-weak)', sk: 'var(--good)' })) + T(510 + i * 60, 186, names[i], { s: 9, c: 'var(--ink-dim)' }) + T(510 + i * 60, 164 - h2, (t2[i] * 100).toFixed(0) + '%', { s: 10, c: 'var(--good)' }) + '</g>';
    }
    b += SQ(inner);
    b += LN(60, 170, 730, 170);
    b += LN(400, 30, 400, 195, { d: '3 4' });
    b += T(380, 212, 'lower T sharpens toward one class; higher T flattens toward uniform', { s: 10, c: 'var(--ink-dim)' });
    return S(224, b);
  };

  V['cross-entropy-curve'] = function (u) {
    var b = D(u, 'ar'), i;
    b += HD('cross-entropy loss = -ln(p)', 'p = predicted probability of the true class');
    b += LN(70, 180, 700, 180);
    b += LN(70, 30, 70, 180);
    b += T(40, 30, 'loss', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += T(700, 200, 'p → 1', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    var pts = [], p;
    for (p = 0.05; p <= 1.001; p += 0.05) {
      var x = 70 + p * 630;
      var y = 180 + Math.log(p) * 26;
      if (y < 30) y = 30;
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    b += PL(pts.join(' '), { c: 'var(--accent)', w: 2.2 });
    var x08 = 70 + 0.8 * 630, y08 = 180 + Math.log(0.8) * 26;
    var x05 = 70 + 0.5 * 630, y05 = 180 + Math.log(0.5) * 26;
    b += LN(x08, y08, x08, 180, { d: '3 3' });
    b += DT(x08, y08, 6, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(x08, y08 - 12, 'p=0.8, loss≈0.22', { s: 10, c: 'var(--good)' });
    b += LN(x05, y05, x05, 180, { d: '3 3' });
    b += DT(x05, y05, 6, { f: 'var(--warning)', cls: 'v-pulse' });
    b += T(x05 - 10, y05 - 12, 'p=0.5, loss≈0.69 (chance)', { a: 'start', s: 10, c: 'var(--warning)' });
    b += T(380, 216, 'confident and correct costs almost nothing; confident and wrong costs a great deal', { s: 10, c: 'var(--ink-dim)' });
    return S(228, b);
  };

  V['bias-variance-targets'] = function (u) {
    var b = D(u, 'ar'), i, j, inner = '';
    b += HD('bias and variance');
    var cols = [140, 340, 540, 730];
    var labels = ['low bias~low variance', 'low bias~high variance', 'high bias~low variance', 'high bias~high variance'];
    var offsets = [[0, 0], [0, 0], [30, -14], [30, -14]];
    var spreads = [6, 26, 6, 26];
    var cx0 = [110, 310, 510, 700];
    for (i = 0; i < 4; i++) {
      var cx = cx0[i], cy = 96;
      b += '<circle cx="' + cx + '" cy="' + cy + '" r="60" fill="none" stroke="var(--border)" stroke-width="1.2"/>';
      b += '<circle cx="' + cx + '" cy="' + cy + '" r="38" fill="none" stroke="var(--border)" stroke-width="1.2"/>';
      b += '<circle cx="' + cx + '" cy="' + cy + '" r="16" fill="none" stroke="var(--border)" stroke-width="1.2"/>';
      b += DT(cx, cy, 3, { f: 'var(--ink-dim)' });
      var tx = cx + offsets[i][0], ty = cy + offsets[i][1];
      var sp = spreads[i];
      for (j = 0; j < 6; j++) {
        var ang = j * 1.05 + i;
        var rr = (j % 2 === 0 ? 0.4 : 1) * sp;
        var dx = Math.cos(ang) * rr, dy = Math.sin(ang) * rr;
        inner += '<g' + IX(i * 6 + j) + '>' + DT(tx + dx, ty + dy, 4, { f: 'var(--accent)' }) + '</g>';
      }
      b += ML(cx, 176, labels[i], { ts: 10, tc: 'var(--ink)' });
    }
    b += SQ(inner);
    b += T(380, 210, 'variance scatters the hits; bias moves the whole cluster off the centre', { s: 10, c: 'var(--ink-dim)' });
    return S(222, b);
  };

  V['learning-curves'] = function (u) {
    var b = D(u, 'ar');
    b += HD('learning curves', 'error vs training set size');
    b += LN(70, 176, 720, 176);
    b += LN(70, 36, 70, 176);
    b += T(40, 36, 'error', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += T(700, 196, 'more data →', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += PG('120,150 250,120 380,104 510,96 640,92 640,150 510,142 380,132 250,140 120,150', { f: 'var(--warning-weak)' });
    b += PL('120,150 250,120 380,104 510,96 640,92', { c: 'var(--danger)', w: 2 });
    b += PL('120,150 250,140 380,132 510,142 640,150', { c: 'var(--good)', w: 2 });
    b += T(660, 88, 'validation', { a: 'start', s: 10, c: 'var(--danger)' });
    b += T(660, 154, 'training', { a: 'start', s: 10, c: 'var(--good)' });
    b += B(300, 40, 200, 30, 'generalisation gap', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)', cls: 'v-pulse' });
    b += A(u, 380, 70, 400, 100, { c: 'var(--warning)', m: 'none' });
    b += T(380, 216, 'gap narrows with more data only if variance, not bias, is the problem', { s: 10, c: 'var(--ink-dim)' });
    return S(228, b);
  };

  V['leakage-timeline'] = function (u) {
    var b = D(u, 'ar ad');
    b += HD('point-in-time leakage', 'features must precede the decision');
    b += LN(50, 110, 730, 110);
    b += R(50, 96, 380, 28, { f: 'var(--good-weak)', sk: 'var(--good)' });
    b += T(240, 114, 'feature window: known before t0', { s: 10, c: 'var(--good)' });
    b += LN(430, 60, 430, 160, { c: 'var(--ink)', w: 2 });
    b += T(430, 50, 't0: decision time', { s: 11, c: 'var(--ink)', w: 1 });
    b += R(500, 96, 200, 28, { f: 'var(--surface-3)', sk: 'var(--border)' });
    b += T(600, 114, 'label arrives at t0+H', { s: 10, c: 'var(--ink-dim)' });
    b += AP(u, 'M580 96C540 40 460 40 434 62', { m: 'ad', c: 'var(--danger)', w: 2, d: '5 4', cls: 'v-blink' });
    b += T(520, 34, 'leak: using t0+H info as if known at t0', { a: 'start', s: 10, c: 'var(--danger)' });
    b += B(60, 150, 660, 40, 'the same shape catches a leaking test-set statistic, or a feature that is really a proxy for the label', { ts: 10, f: 'var(--surface-2)' });
    b += T(380, 216, 'ask, for every feature: would this value exist yet, in this form, at t0', { s: 10, c: 'var(--ink-dim)' });
    return S(226, b);
  };

  V['distribution-shift'] = function (u) {
    var b = D(u, 'ar'), i, inner = '';
    b += HD('three kinds of distribution shift');
    var panelX = [40, 290, 540];
    var titles = ['covariate shift~P(X) moves', 'label shift~P(Y) moves', 'concept drift~P(Y|X) moves'];
    for (i = 0; i < 3; i++) {
      var x = panelX[i];
      inner += '<g' + IX(i) + '>';
      inner += LN(x + 10, 150, x + 220, 150, { c: 'var(--border)' });
      if (i === 0) {
        inner += PL(x + '20,150 ' + (x + 50) + ',80 ' + (x + 80) + ',150', { c: 'var(--accent)', w: 2 });
        inner += PL(x + '80,150 ' + (x + 110) + ',80 ' + (x + 140) + ',150', { c: 'var(--good)', w: 2, d: '4 3' });
        inner += LN(x + 100, 60, x + 100, 150, { c: 'var(--ink-dim)', d: '3 3' });
        inner += T(x + 40, 70, 'train', { s: 9, c: 'var(--accent)' });
        inner += T(x + 130, 70, 'live', { s: 9, c: 'var(--good)' });
      } else if (i === 1) {
        inner += R(x + 30, 96, 26, 54, { f: 'var(--accent-weak)', sk: 'var(--accent)' });
        inner += R(x + 66, 66, 26, 84, { f: 'var(--accent-weak)', sk: 'var(--accent)' });
        inner += R(x + 116, 66, 26, 84, { f: 'var(--good-weak)', sk: 'var(--good)' });
        inner += R(x + 152, 116, 26, 34, { f: 'var(--good-weak)', sk: 'var(--good)' });
        inner += T(x + 60, 164, 'train mix', { s: 9, c: 'var(--accent)' });
        inner += T(x + 148, 164, 'live mix', { s: 9, c: 'var(--good)' });
      } else {
        inner += PL(x + '20,140 ' + (x + 110) + ',80 ' + (x + 200) + ',140', { c: 'var(--ink-dim)', w: 2 });
        inner += LN(x + 20, 150, x + 200, 100, { c: 'var(--danger)', w: 2, d: '5 3', cls: 'v-pulse' });
        inner += T(x + 60, 60, 'same inputs,~new boundary', { s: 9, c: 'var(--danger)' });
      }
      inner += ML(x + 110, 190, titles[i], { ts: 10 });
      inner += '</g>';
    }
    b += SQ(inner);
    b += T(380, 216, 'covariate and label shift show up in the features or the base rate; concept drift needs fresh labels', { s: 10, c: 'var(--ink-dim)' });
    return S(228, b);
  };

  C['dot-product-similarity'] = 'Two vectors from the origin with the angle between them; the dot product and norms combine into <b>cosine similarity</b>.';
  C['gradient-descent-bowl'] = 'A loss bowl with a ball taking steps downhill, each one <b>shrinking</b> as the slope flattens near the minimum.';
  C['chain-rule-graph'] = 'Forward pass computes and stores values left to right; the backward pass <b>multiplies local derivatives</b> right to left.';
  C['softmax-temperature'] = 'The same logits at two temperatures: low temperature sharpens onto one class, high temperature <b>flattens</b> the bars.';
  C['cross-entropy-curve'] = 'Loss as -ln(p): confident correct predictions cost almost nothing, and the curve <b>shoots up</b> as confidence in the wrong class grows.';
  C['bias-variance-targets'] = 'Four targets: variance scatters the hits around their own centre, and bias <b>drags the whole cluster</b> off the bullseye.';
  C['learning-curves'] = 'Training and validation error against training-set size, with the <b>generalisation gap</b> between them highlighted.';
  C['leakage-timeline'] = 'A decision at t0 with an allowed feature window before it; a dashed arrow shows information from after t0 <b>leaking backward</b>.';
  C['distribution-shift'] = 'Three small panels appearing in sequence: the inputs moving, the label mix moving, and the same inputs meeting a <b>new decision boundary</b>.';

}(typeof window !== 'undefined' ? window : this));
