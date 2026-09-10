/* ml-foundations-b diagrams: classical ML models, and evaluation/metrics/model selection. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  /* ---------------------------------------------------------------- sigmoid-threshold */
  V['sigmoid-threshold'] = function (u) {
    var b = D(u, 'ar aa ag ad'), i;
    b += HD('the sigmoid maps a score to a probability', 'p = 1 / (1 + e^-z)');
    b += LN(70, 176, 720, 176);
    b += LN(400, 30, 400, 176, { d: '3 4' });
    b += T(400, 22, 'z = 0 → p = 0.5', { s: 10, c: 'var(--ink-dim)' });
    b += LN(70, 90, 720, 90, { d: '2 4', c: 'var(--ink-dim)' });
    b += T(58, 94, '0.5', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    var pts = [], z;
    for (z = -6; z <= 6.001; z += 0.3) {
      var p = 1 / (1 + Math.exp(-z));
      var x = 400 + z * 52;
      var y = 176 - p * 146;
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    b += PL(pts.join(' '), { c: 'var(--accent)', w: 2.4 });
    b += F('M100 172Q400 172 700 34', { cls: 'v-flow-slow', c: 'var(--accent)', w: 1.4, d: '3 6' });
    var ex = [-3, -0.6, 1.4, 4];
    for (i = 0; i < ex.length; i++) {
      var pz = 1 / (1 + Math.exp(-ex[i]));
      var px = 400 + ex[i] * 52, py = 176 - pz * 146;
      var good = pz >= 0.5;
      b += DT(px, py, 6, { f: good ? 'var(--good)' : 'var(--danger)', cls: 'v-pulse' });
      b += T(px, py - 12, (pz * 100).toFixed(0) + '%', { s: 10, c: good ? 'var(--good)' : 'var(--danger)' });
    }
    b += T(150, 200, 'predict class 0 below the threshold', { s: 10, c: 'var(--danger)' });
    b += T(650, 200, 'predict class 1 above it', { a: 'end', s: 10, c: 'var(--good)' });
    b += T(380, 218, 'moving the threshold off 0.5 trades false positives for false negatives', { s: 10, c: 'var(--ink-dim)' });
    return S(228, b);
  };

  /* ---------------------------------------------------------------- ridge-vs-lasso */
  V['ridge-vs-lasso'] = function (u) {
    var b = D(u, 'ar'), i;
    b += HD('ridge (L2) vs lasso (L1): where the loss contour meets the penalty region');
    var cx1 = 195, cx2 = 555, cy = 120;
    b += T(cx1, 40, 'ridge: circular penalty', { s: 11, w: 1 });
    b += '<ellipse cx="' + cx1 + '" cy="' + cy + '" rx="150" ry="34" fill="none" stroke="var(--border)" stroke-width="1.2" transform="rotate(-18 ' + cx1 + ' ' + cy + ')"/>';
    b += '<ellipse cx="' + cx1 + '" cy="' + cy + '" rx="96" ry="20" fill="none" stroke="var(--border)" stroke-width="1.2" transform="rotate(-18 ' + cx1 + ' ' + cy + ')"/>';
    b += '<circle cx="' + cx1 + '" cy="' + cy + '" r="46" fill="var(--accent-weak)" stroke="var(--accent)" stroke-width="1.4"/>';
    b += DT(cx1 - 6, cy + 10, 5, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(cx1 - 6, cy + 30, 'both weights shrink,~neither hits zero', { s: 9, c: 'var(--good)' });
    b += T(cx2, 40, 'lasso: diamond penalty', { s: 11, w: 1 });
    b += '<ellipse cx="' + cx2 + '" cy="' + cy + '" rx="150" ry="34" fill="none" stroke="var(--border)" stroke-width="1.2" transform="rotate(-18 ' + cx2 + ' ' + cy + ')"/>';
    b += '<ellipse cx="' + cx2 + '" cy="' + cy + '" rx="96" ry="20" fill="none" stroke="var(--border)" stroke-width="1.2" transform="rotate(-18 ' + cx2 + ' ' + cy + ')"/>';
    b += PG((cx2) + ',' + (cy - 46) + ' ' + (cx2 + 46) + ',' + cy + ' ' + cx2 + ',' + (cy + 46) + ' ' + (cx2 - 46) + ',' + cy, { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += DT(cx2, cy - 46, 5, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(cx2 + 60, cy - 46, 'corner hit:~one weight = 0', { s: 9, c: 'var(--good)' });
    b += LN(375, 30, 375, 190, { d: '3 4' });
    b += T(380, 210, 'a sharp corner on the constraint region is what makes lasso zero out coefficients; a circle has no corner', { s: 10, c: 'var(--ink-dim)' });
    return S(224, b);
  };

  /* ---------------------------------------------------------------- calibration-curve */
  V['calibration-curve'] = function (u) {
    var b = D(u, 'ar'), i, inner = '';
    b += HD('reliability diagram', 'predicted probability vs observed frequency');
    b += LN(70, 176, 400, 176);
    b += LN(70, 30, 70, 176);
    b += LN(70, 176, 400, 30, { d: '3 4' });
    b += T(230, 20, 'perfectly calibrated', { s: 10, c: 'var(--ink-dim)' });
    var xs = [100, 160, 220, 280, 340];
    var ysBad = [150, 118, 96, 76, 50];
    var pts = [];
    for (i = 0; i < xs.length; i++) { pts.push(xs[i] + ',' + ysBad[i]); }
    b += PL(pts.join(' '), { c: 'var(--warning)', w: 2.2 });
    for (i = 0; i < xs.length; i++) {
      inner += '<g' + IX(i) + '>' + DT(xs[i], ysBad[i], 5, { f: 'var(--warning)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(300, 100, 'model is overconfident~(curve sags below the diagonal)', { s: 9, c: 'var(--warning)' });
    b += T(235, 196, 'predicted probability →', { s: 10, c: 'var(--ink-dim)' });
    b += B(460, 40, 268, 46, 'Platt scaling~fit a sigmoid on top of the scores', { ts: 11, f: 'var(--surface-2)' });
    b += A(u, 460, 100, 460, 78, { m: 'none' });
    b += B(460, 106, 268, 46, 'isotonic regression~fit any non-decreasing step function', { ts: 11, f: 'var(--surface-2)' });
    b += T(594, 176, 'both are fit on held-out data, never on the training fold', { a: 'middle', s: 10, c: 'var(--ink-dim)' });
    return S(220, b);
  };

  /* ---------------------------------------------------------------- tree-split */
  V['tree-split'] = function (u) {
    var b = D(u, 'ar ag ad'), i;
    b += HD('choosing a split: which cut lowers impurity the most');
    var pts1 = [[30, 130, 1], [42, 150, 1], [55, 118, 1], [70, 160, 1], [80, 100, 0], [95, 140, 1], [108, 90, 0], [120, 70, 0], [135, 110, 0], [148, 60, 0]];
    for (i = 0; i < pts1.length; i++) {
      b += DT(pts1[i][0], pts1[i][1], 5, { f: pts1[i][2] ? 'var(--good)' : 'var(--danger)' });
    }
    b += LN(112, 40, 112, 176, { c: 'var(--accent)', w: 2, cls: 'v-pulse' });
    b += T(112, 34, 'x1 ≤ t ?', { s: 11, w: 1, c: 'var(--accent)' });
    b += T(60, 190, 'left: mostly class 1', { s: 9, c: 'var(--good)' });
    b += T(160, 190, 'right: mostly class 0', { s: 9, c: 'var(--danger)' });
    b += LN(220, 108, 220, 108);
    b += B(280, 46, 130, 40, 'root~Gini = 0.50');
    b += A(u, 345, 88, 320, 118);
    b += A(u, 345, 88, 370, 118);
    b += B(240, 128, 130, 40, 'left~Gini = 0.18', { f: 'var(--good-weak)', sk: 'var(--good)' });
    b += B(390, 128, 130, 40, 'right~Gini = 0.20', { f: 'var(--danger-weak)', sk: 'var(--danger)' });
    b += T(560, 46, 'gain = 0.50 −~weighted(0.18, 0.20)', { s: 10, c: 'var(--ink-dim)' });
    b += B(560, 90, 160, 60, 'the tree tries every~feature and threshold, and~keeps the split with~the largest gain', { ts: 10, f: 'var(--surface-2)' });
    b += T(380, 216, 'a deeper tree keeps splitting until a stopping rule fires -- that stopping rule is what controls overfitting', { s: 10, c: 'var(--ink-dim)' });
    return S(228, b);
  };

  /* ---------------------------------------------------------------- boosting-residuals */
  V['boosting-residuals'] = function (u) {
    var b = D(u, 'ar'), i, j, inner = '';
    b += HD('gradient boosting: each tree fits the previous errors');
    var panelX = [40, 300, 560];
    var titles = ['tree 1~rough fit, big errors', 'tree 2~fits tree 1\'s residuals', 'tree 1+2+…~errors shrink each round'];
    var truthY = [130, 90, 60, 50, 70, 110];
    var fits = [
      [130, 130, 130, 130, 130, 130],
      [128, 100, 70, 62, 82, 108],
      [131, 92, 61, 51, 71, 109]
    ];
    var xs = [0, 34, 68, 102, 136, 170];
    for (i = 0; i < 3; i++) {
      var ox = panelX[i];
      inner += '<g' + IX(i) + '>';
      inner += LN(ox, 150, ox + 180, 150, { c: 'var(--border)' });
      var truthPts = [], fitPts = [];
      for (j = 0; j < xs.length; j++) {
        truthPts.push((ox + 10 + xs[j]) + ',' + truthY[j]);
        fitPts.push((ox + 10 + xs[j]) + ',' + fits[i][j]);
      }
      inner += PL(truthPts.join(' '), { c: 'var(--ink-dim)', w: 1.4, d: '3 3' });
      inner += PL(fitPts.join(' '), { c: 'var(--accent)', w: 2.2 });
      for (j = 0; j < xs.length; j++) {
        var gap = Math.abs(truthY[j] - fits[i][j]);
        if (gap > 3) { inner += LN(ox + 10 + xs[j], truthY[j], ox + 10 + xs[j], fits[i][j], { c: 'var(--danger)', w: 1.2 }); }
      }
      inner += ML(ox + 90, 190, titles[i], { ts: 10 });
      inner += '</g>';
    }
    b += SQ(inner);
    b += T(380, 216, 'each new tree targets what is still wrong; the learning rate scales how much of it gets added', { s: 10, c: 'var(--ink-dim)' });
    return S(226, b);
  };

  /* ---------------------------------------------------------------- svm-margin */
  V['svm-margin'] = function (u) {
    var b = D(u, 'ar ag ad'), i;
    b += HD('maximum margin classifier');
    var good = [[110, 60], [140, 90], [90, 110], [160, 50], [130, 130]];
    var bad = [[420, 150], [460, 120], [500, 170], [440, 190], [380, 180]];
    for (i = 0; i < good.length; i++) { b += DT(good[i][0], good[i][1], 6, { f: 'var(--good)' }); }
    for (i = 0; i < bad.length; i++) { b += DT(bad[i][0], bad[i][1], 6, { f: 'var(--danger)' }); }
    b += AP(u, 'M60 40L560 200', { m: 'none', c: 'var(--ink)', w: 2 });
    b += AP(u, 'M40 68L540 228', { m: 'none', c: 'var(--accent)', w: 1.4, d: '5 5', cls: 'v-pulse' });
    b += AP(u, 'M80 12L580 172', { m: 'none', c: 'var(--accent)', w: 1.4, d: '5 5', cls: 'v-pulse' });
    b += DT(160, 50, 7, { sk: 'var(--accent)', f: 'none', sw: 2 });
    b += DT(130, 130, 7, { sk: 'var(--accent)', f: 'none', sw: 2 });
    b += DT(380, 180, 7, { sk: 'var(--accent)', f: 'none', sw: 2 });
    b += T(560, 40, 'support vectors are circled --~only they set the boundary', { a: 'end', s: 10, c: 'var(--accent)' });
    b += T(120, 210, 'moving any other point does not change the line', { s: 10, c: 'var(--ink-dim)' });
    b += B(600, 60, 130, 100, 'hinge loss:~0 once a point clears~its margin, growing~linearly if it does not', { ts: 10, f: 'var(--surface-2)' });
    return S(228, b);
  };

  /* ---------------------------------------------------------------- kmeans-steps */
  V['kmeans-steps'] = function (u) {
    var b = D(u, 'ar'), i, j, inner = '';
    b += HD('k-means: assign, then update, repeat');
    var pts = [[30, 40], [45, 60], [25, 70], [60, 30], [120, 40], [140, 65], [110, 75], [150, 30], [70, 130], [90, 150], [55, 145], [110, 160]];
    var centroidsInit = [[40, 40], [130, 45], [80, 145]];
    var centroidsFinal = [[40, 50], [130, 47], [82, 146]];
    var groupOf = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];
    var colors = ['var(--accent)', 'var(--good)', 'var(--warning)'];
    var panelX = [30, 300, 570];
    var stepTitle = ['start: pick k random centroids', 'assign each point to its nearest centroid', 'move each centroid to its cluster\'s mean'];
    for (i = 0; i < 3; i++) {
      var ox = panelX[i];
      inner += '<g' + IX(i) + '>';
      for (j = 0; j < pts.length; j++) {
        var c = i === 0 ? 'var(--ink-dim)' : colors[groupOf[j]];
        inner += DT(ox + pts[j][0], 40 + pts[j][1], 4, { f: c });
      }
      var cs = i < 2 ? centroidsInit : centroidsFinal;
      for (j = 0; j < 3; j++) {
        inner += '<rect x="' + (ox + cs[j][0] - 6) + '" y="' + (40 + cs[j][1] - 6) + '" width="12" height="12" fill="' + colors[j] + '" stroke="var(--ink)" stroke-width="1.2"/>';
      }
      inner += ML(ox + 85, 205, stepTitle[i], { ts: 9 });
      inner += '</g>';
    }
    b += SQ(inner);
    b += T(380, 224, 'repeat assign and update until no point changes cluster; pick k with the elbow method or a silhouette score', { s: 10, c: 'var(--ink-dim)' });
    return S(230, b);
  };

  /* ---------------------------------------------------------------- data-split-time */
  V['data-split-time'] = function (u) {
    var b = D(u, 'ar ad');
    b += HD('splitting time-ordered data');
    b += T(24, 42, 'correct', { a: 'start', s: 11, w: 1, c: 'var(--good)' });
    b += B(120, 26, 340, 32, 'train (earlier months)', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += B(462, 26, 120, 32, 'validation', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += B(584, 26, 130, 32, 'test (latest)', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 24, 74, 720, 74, { c: 'var(--ink-dim)' });
    b += T(724, 78, 'time', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += T(24, 112, 'wrong', { a: 'start', s: 11, w: 1, c: 'var(--danger)' });
    var mix = ['var(--good-weak)', 'var(--warning-weak)', 'var(--accent-weak)', 'var(--good-weak)', 'var(--accent-weak)', 'var(--warning-weak)', 'var(--good-weak)', 'var(--accent-weak)'];
    var i, x = 120;
    for (i = 0; i < mix.length; i++) { b += R(x, 96, 78, 30, { f: mix[i], sk: 'var(--border)' }); x += 78; }
    b += AP(u, 'M660 140Q400 176 140 140', { m: 'ad', c: 'var(--danger)', w: 1.6, d: '4 4', cls: 'v-blink' });
    b += T(380, 190, 'a random shuffle scatters future rows into training -- the model "sees the future" it will be asked to predict', { s: 10, c: 'var(--danger)' });
    b += T(380, 210, 'a grouped split keeps every row for one customer, user or entity on the same side of the line', { s: 10, c: 'var(--ink-dim)' });
    return S(226, b);
  };

  /* ---------------------------------------------------------------- confusion-matrix */
  V['confusion-matrix'] = function (u) {
    var b = D(u, 'ar ag ad');
    b += HD('confusion matrix', 'rows = actual, columns = predicted');
    var x0 = 140, y0 = 40, cw = 130, ch = 60;
    b += T(x0 + cw, y0 - 14, 'predicted +', { s: 10, c: 'var(--ink-dim)' });
    b += T(x0 + cw * 2, y0 - 14, 'predicted −', { s: 10, c: 'var(--ink-dim)' });
    b += T(x0 - 14, y0 + ch / 2, 'actual +', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += T(x0 - 14, y0 + ch * 1.5, 'actual −', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += B(x0, y0, cw, ch, 'TP', { f: 'var(--good-weak)', sk: 'var(--good)', ts: 14 });
    b += B(x0 + cw, y0, cw, ch, 'FN', { f: 'var(--danger-weak)', sk: 'var(--danger)', ts: 14 });
    b += B(x0, y0 + ch, cw, ch, 'FP', { f: 'var(--danger-weak)', sk: 'var(--danger)', ts: 14 });
    b += B(x0 + cw, y0 + ch, cw, ch, 'TN', { f: 'var(--good-weak)', sk: 'var(--good)', ts: 14 });
    b += AP(u, 'M' + (x0 + cw / 2) + ' ' + (y0 + ch) + 'V' + (y0 + ch + 30) + 'H' + (x0 + cw / 2 - 90), { m: 'aa', c: 'var(--accent)', cls: 'v-pulse' });
    b += B(440, y0 + 8, 260, 40, 'precision = TP / (TP + FP)', { ts: 12, f: 'var(--surface-2)' });
    b += AP(u, 'M' + (x0 + cw + cw / 2) + ' ' + y0 + 'V' + (y0 - 26) + 'H' + 570, { m: 'aa', c: 'var(--accent)', cls: 'v-pulse' });
    b += B(440, y0 + ch + 12, 260, 40, 'recall = TP / (TP + FN)', { ts: 12, f: 'var(--surface-2)' });
    b += T(380, 210, 'F1 is the harmonic mean of precision and recall -- it punishes a very low value in either one', { s: 10, c: 'var(--ink-dim)' });
    return S(220, b);
  };

  /* ---------------------------------------------------------------- roc-vs-pr */
  V['roc-vs-pr'] = function (u) {
    var b = D(u, 'ar'), i;
    b += HD('ROC curve vs precision-recall curve', 'same model, 0.1% positive rate');
    b += LN(60, 170, 300, 170);
    b += LN(60, 30, 60, 170);
    b += LN(60, 170, 300, 30, { d: '3 4', c: 'var(--ink-dim)' });
    b += T(180, 20, 'ROC', { s: 11, w: 1 });
    b += T(180, 190, 'false positive rate →', { s: 9, c: 'var(--ink-dim)' });
    var rocPts = ['60,170', '90,80', '140,52', '220,36', '300,30'];
    b += PL(rocPts.join(' '), { c: 'var(--accent)', w: 2.2 });
    b += F('M60 170Q140 60 300 30', { cls: 'v-flow-slow', c: 'var(--accent)', w: 1.2, d: '3 5' });
    b += T(100, 130, 'looks strong:~AUC ≈ 0.95', { s: 9, c: 'var(--good)' });
    b += LN(420, 170, 660, 170);
    b += LN(420, 30, 420, 170);
    b += T(540, 20, 'precision-recall', { s: 11, w: 1 });
    b += T(540, 190, 'recall →', { s: 9, c: 'var(--ink-dim)' });
    b += LN(420, 165, 660, 165, { d: '2 4', c: 'var(--danger)' });
    b += T(665, 168, 'baseline ≈ prevalence (0.1%)', { a: 'start', s: 9, c: 'var(--danger)' });
    var prPts = ['420,50', '470,60', '520,80', '580,110', '660,150'];
    b += PL(prPts.join(' '), { c: 'var(--warning)', w: 2.2 });
    b += T(560, 96, 'reveals the~precision collapse~the fraud team~actually feels', { s: 9, c: 'var(--warning)' });
    b += T(380, 216, 'with 999 negatives per positive, a tiny false-positive rate is still thousands of false alarms', { s: 10, c: 'var(--ink-dim)' });
    return S(228, b);
  };

  /* ---------------------------------------------------------------- ab-test-flow */
  V['ab-test-flow'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('an A/B test end to end');
    b += B(24, 74, 110, 44, 'incoming~users');
    b += A(u, 138, 96, 190, 60, { c: 'var(--accent)', m: 'aa' });
    b += F('M138 96L190 60', { cls: 'v-flow' });
    b += A(u, 138, 96, 190, 132, { c: 'var(--good)', m: 'ag' });
    b += F('M138 96L190 132', { cls: 'v-flow' });
    b += B(194, 38, 130, 44, 'A: control~current version');
    b += B(194, 110, 130, 44, 'B: treatment~new version', { f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 328, 60, 380, 96);
    b += A(u, 328, 132, 380, 96);
    b += B(384, 74, 150, 44, 'measure the~guardrail + goal metric');
    b += A(u, 538, 96, 592, 96);
    b += B(596, 60, 150, 80, 'is the difference~bigger than chance,~given the sample size~and the test\'s power?', { ts: 10, f: 'var(--surface-2)' });
    b += DT(560, 96, 5, { f: 'var(--accent)', cls: 'v-move-x', st: DXS(30) });
    b += T(380, 200, 'random assignment is what lets you credit the metric change to the change you shipped, not to who happened to show up', { s: 10, c: 'var(--ink-dim)' });
    return S(216, b);
  };

  C['sigmoid-threshold'] = 'The sigmoid curve turning a raw score into a probability; points above the <b>0.5 threshold</b> are classified positive, below it negative.';
  C['ridge-vs-lasso'] = 'Loss contours meeting a circular ridge penalty versus a diamond lasso penalty -- the diamond\'s <b>corner</b> is what zeroes out a coefficient.';
  C['calibration-curve'] = 'A reliability diagram sagging below the diagonal -- the model is <b>overconfident</b> -- fixed by Platt scaling or isotonic regression.';
  C['tree-split'] = 'Candidate splits are scored by the impurity drop they buy; the tree keeps the one with the <b>largest gain</b>.';
  C['boosting-residuals'] = 'Three rounds of boosting: each new tree targets what the previous ones got wrong, and the <b>gap to the truth shrinks</b> each round.';
  C['svm-margin'] = 'A maximum-margin boundary with its <b>support vectors circled</b> -- only those points determine where the line sits.';
  C['kmeans-steps'] = 'k-means alternating between assigning points to the nearest centroid and <b>moving each centroid</b> to its cluster\'s mean.';
  C['data-split-time'] = 'A correct time-ordered split (train, then validation, then test) above a shuffled split where <b>future rows leak</b> into training.';
  C['confusion-matrix'] = 'The four outcomes of a binary classifier, with precision and recall traced back to the cells that <b>define each one</b>.';
  C['roc-vs-pr'] = 'The same fraud model on an ROC curve (looks excellent) and a precision-recall curve, where the <b>rare positive class</b> tells a harder truth.';
  C['ab-test-flow'] = 'Users randomly split into control and treatment, their guardrail and goal metrics compared against <b>what chance alone would produce</b>.';

}(typeof window !== 'undefined' ? window : this));
