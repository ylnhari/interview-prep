/* streaming-features diagrams: a streaming feature pipeline and the teams either side of it. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, HD = H.HD, DXS = H.DXS;

  V['streaming-feature-pipeline'] = function (u) {
    var THEIRS = { f: 'var(--surface-3)', sk: 'var(--ink-dim)', st: 'stroke-dasharray:4 4', tc: 'var(--ink-dim)', tc2: 'var(--ink-dim)' };
    var THEIRTOPIC = { f: 'var(--surface-3)', sk: 'var(--ink-dim)', st: 'stroke-dasharray:4 4', r: 12, ts: 10, tc: 'var(--ink-dim)', tc2: 'var(--ink-dim)' };
    var MINE = { f: 'var(--accent-weak)', sk: 'var(--accent)' };
    var MYTOPIC = { f: 'var(--accent-weak)', sk: 'var(--accent)', r: 12, ts: 10 };
    var b = D(u, 'ar aa');

    b += HD('streaming feature pipeline: three owners, two handoffs', 'dashed = another team owns it');

    /* ---- upstream: producers and the topic they publish to ---- */
    b += B(20, 56, 88, 40, 'producers~upstream systems', THEIRS);
    b += A(u, 110, 76, 132, 76);
    b += B(136, 56, 102, 40, 'input topic~message broker', THEIRTOPIC);
    b += A(u, 240, 76, 260, 76, { c: 'var(--accent)', m: 'aa' });
    b += LN(250, 100, 250, 107, { c: 'var(--warning)', d: '3 3' });
    b += T(250, 118, 'handoff', { s: 9, c: 'var(--warning)' });

    /* ---- the job you own, and its five stages ---- */
    b += R(264, 38, 296, 74, { f: 'var(--surface)', sk: 'var(--accent)', sw: 1.4, r: 8 });
    b += T(412, 54, 'stream processing job', { s: 11, w: 1 });
    var stage = ['ingest', 'window', 'key', 'batch', 'generate'], i, sx;
    for (i = 0; i < 5; i++) {
      sx = 272 + i * 57;
      b += B(sx, 66, 49, 24, stage[i], { ts: 9, f: 'var(--surface-2)', sk: 'var(--border)', r: 4 });
      if (i < 4) { b += A(u, sx + 49, 78, sx + 55, 78, { m: 'none', c: 'var(--ink-dim)' }); }
    }
    b += LN(272, 102, 549, 102, { c: 'var(--border)', d: '3 4' });

    /* ---- the three topics the job publishes ---- */
    b += B(582, 34, 156, 24, 'logging topic', MYTOPIC);
    b += B(582, 64, 156, 24, 'error topic', MYTOPIC);
    b += B(582, 94, 156, 24, 'features topic', MYTOPIC);
    b += AP(u, 'M560 70H570V46H578', { c: 'var(--accent)', m: 'aa' });
    b += A(u, 560, 76, 578, 76, { c: 'var(--accent)', m: 'aa' });
    b += AP(u, 'M560 82H570V106H578', { c: 'var(--accent)', m: 'aa' });

    /* ---- downstream: a third team loads the store ---- */
    b += AP(u, 'M660 118V142', { d: '4 4' });
    b += DT(660, 130, 3.5, { cls: 'v-pulse' });
    b += T(578, 140, 'handoff: they load it', { s: 9, c: 'var(--warning)', a: 'end' });
    b += CY(596, 146, 128, 48, 'feature store', THEIRS);

    /* ---- the scoring service you also own ---- */
    b += B(300, 150, 150, 44, 'scoring service~model + policy', MINE);
    b += A(u, 594, 172, 454, 172, { c: 'var(--accent)', m: 'aa' });
    b += T(524, 164, 'reads, never writes', { s: 9, c: 'var(--ink-dim)' });
    b += B(96, 150, 120, 44, 'calling service', THEIRS);
    b += A(u, 218, 164, 296, 164);
    b += T(257, 157, 'request', { s: 9, c: 'var(--ink-dim)' });
    b += A(u, 296, 184, 218, 184, { c: 'var(--accent)', m: 'aa' });
    b += T(257, 205, 'score', { s: 9, c: 'var(--ink-dim)' });

    /* ---- what moves ---- */
    b += F('M110 76H132M240 76H260');
    b += F('M272 102H549', { d: '5 7', w: 1.6 });
    b += F('M560 70H570V46H578M560 76H578M560 82H570V106H578');
    b += F('M660 118V142', { cls: 'v-flow-slow' });
    b += DT(594, 172, 4, { cls: 'v-move-x', st: DXS(-140) });

    b += T(380, 218, 'you own the job and the scorer; the topics are the interface, and the store belongs to the team that loads it', { s: 10, c: 'var(--ink-dim)' });
    return S(230, b);
  };

  C['streaming-feature-pipeline'] = 'One job in the middle: it reads a topic another team publishes to and writes three topics of its own, and a third team loads the feature store that the scoring service then <b>reads but never writes</b>. The dashed boxes are the parts you do not own.';
}(typeof window !== 'undefined' ? window : this));
