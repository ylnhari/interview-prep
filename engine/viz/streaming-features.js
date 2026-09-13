/* streaming-features diagrams: the two clocks on a feature value, and a streaming feature
   pipeline drawn as three owners with two handoffs between them. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, HD = H.HD, DXS = H.DXS;

  /* ------------------------------------------------------------------ the two clocks */

  V['two-timestamps-timeline'] = function (u) {
    var b = D(u, 'ar aa aw ad');
    b += HD('every feature value carries two timestamps', 'one transaction, two clocks');

    /* ---- the world's clock ---- */
    b += T(24, 44, 'EVENT TIME - when it became true', { a: 'start', s: 10.5, w: 1, c: 'var(--accent-ink)' });
    b += LN(24, 58, 736, 58, { c: 'var(--accent)', w: 1.6 });
    b += DT(110, 58, 5);
    b += T(110, 76, '14:32:07', { a: 'start', s: 11, w: 1, c: 'var(--accent-ink)' });
    b += T(110, 90, 'the card is used. The chargeback that arrives six weeks later', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += T(110, 102, 'is stamped with this same moment, not with its arrival date.', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += F('M24 58H736', { d: '4 10', w: 1.6 });

    /* ---- what the training row may use ---- */
    b += R(110, 122, 268, 42, { f: 'var(--good-weak)', sk: 'var(--good)', r: 8 });
    b += T(244, 139, 'the training row uses this', { s: 10.5, w: 1, c: 'var(--good)' });
    b += T(244, 154, 'the value readable at 14:32:11', { s: 9.5, c: 'var(--ink-dim)' });
    b += R(398, 122, 268, 42, { f: 'var(--danger-weak)', sk: 'var(--danger)', r: 8 });
    b += T(532, 139, 'either of these leaks', { s: 10.5, w: 1, c: 'var(--danger)' });
    b += T(532, 154, '14:32:13, or the value as it stands today', { s: 9.5, c: 'var(--ink-dim)' });

    /* ---- the system's clock ---- */
    b += T(24, 198, 'PROCESSING TIME - when the system found out', { a: 'start', s: 10.5, w: 1, c: 'var(--ink-dim)' });
    b += LN(24, 212, 736, 212, { c: 'var(--ink-dim)', w: 1.6, d: '6 4' });
    var marks = [
      [86, '14:31:50', 'the velocity value', 'already in the store', 'var(--good)'],
      [256, '14:32:11', 'the scorer runs and', 'reads that 14:31:50 value', 'var(--accent)'],
      [430, '14:32:13', 'the new value is written,', 'two seconds too late to read', 'var(--warning)'],
      [612, '10 Oct', 'the chargeback arrives;', 'the label finally exists', 'var(--danger)']
    ];
    var i;
    for (i = 0; i < marks.length; i++) {
      b += DT(marks[i][0], 212, 5, { f: marks[i][4] });
      b += T(marks[i][0] - 4, 234, marks[i][1], { a: 'start', s: 11, w: 1, c: marks[i][4] });
      b += T(marks[i][0] - 4, 248, marks[i][2], { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
      b += T(marks[i][0] - 4, 260, marks[i][3], { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    }
    b += LN(530, 204, 530, 220, { c: 'var(--border-strong)', d: '2 3' });
    b += T(530, 199, 'six weeks', { s: 9, c: 'var(--ink-dim)' });

    b += T(380, 286, 'training must respect event time; serving is limited by processing time', { s: 10.5, c: 'var(--ink-dim)' });
    return S(298, b);
  };

  C['two-timestamps-timeline'] = 'One transaction, two clocks. The scorer can only read what was written before it ran, so the training row has to carry that same value - not the one written two seconds later, and not the one the feature holds today.';

  /* ------------------------------------------------- a streaming feature pipeline, by owner */

  V['streaming-feature-pipeline'] = function (u) {
    var OTHER = { f: 'var(--surface-3)', sk: 'var(--ink-dim)', st: 'stroke-dasharray:4 4', tc: 'var(--ink-dim)', tc2: 'var(--ink-dim)' };
    var OTHERTOPIC = { f: 'var(--surface-3)', sk: 'var(--ink-dim)', st: 'stroke-dasharray:4 4', r: 12, ts: 10, tc: 'var(--ink-dim)', tc2: 'var(--ink-dim)' };
    var MINE = { f: 'var(--accent-weak)', sk: 'var(--accent)' };
    var MYTOPIC = { f: 'var(--accent-weak)', sk: 'var(--accent)', r: 12, ts: 10 };
    var b = D(u, 'ar aa');

    b += HD('a streaming feature pipeline: three owners, two handoffs', 'dashed = a different team owns it');

    /* ---- upstream: producers and the topic they publish to ---- */
    b += B(20, 56, 88, 40, 'producer~services', OTHER);
    b += A(u, 110, 76, 132, 76);
    b += B(136, 56, 102, 40, 'input topic~message broker', OTHERTOPIC);
    b += A(u, 240, 76, 260, 76, { c: 'var(--accent)', m: 'aa' });
    b += LN(250, 100, 250, 107, { c: 'var(--warning)', d: '3 3' });
    b += T(250, 118, 'handoff', { s: 9, c: 'var(--warning)' });

    /* ---- the feature job, and its stages ---- */
    b += R(264, 38, 296, 74, { f: 'var(--surface)', sk: 'var(--accent)', sw: 1.4, r: 8 });
    b += T(412, 54, 'feature job', { s: 11, w: 1 });
    var stage = ['read', 'window', 'key', 'aggregate', 'emit'], i, sx;
    for (i = 0; i < 5; i++) {
      sx = 272 + i * 57;
      b += B(sx, 66, 49, 24, stage[i], { ts: 9, f: 'var(--surface-2)', sk: 'var(--border)', r: 4 });
      if (i < 4) { b += A(u, sx + 49, 78, sx + 55, 78, { m: 'none', c: 'var(--ink-dim)' }); }
    }
    b += LN(272, 102, 549, 102, { c: 'var(--border)', d: '3 4' });

    /* ---- the topics the job publishes ---- */
    b += B(582, 34, 156, 24, 'audit log topic', MYTOPIC);
    b += B(582, 64, 156, 24, 'dead-letter topic', MYTOPIC);
    b += B(582, 94, 156, 24, 'feature topic', MYTOPIC);
    b += AP(u, 'M560 70H570V46H578', { c: 'var(--accent)', m: 'aa' });
    b += A(u, 560, 76, 578, 76, { c: 'var(--accent)', m: 'aa' });
    b += AP(u, 'M560 82H570V106H578', { c: 'var(--accent)', m: 'aa' });

    /* ---- downstream: a platform team loads the store ---- */
    b += AP(u, 'M660 118V142', { d: '4 4' });
    b += DT(660, 130, 3.5, { cls: 'v-pulse' });
    b += T(578, 140, 'handoff: they load it', { s: 9, c: 'var(--warning)', a: 'end' });
    b += CY(596, 146, 128, 48, 'feature store', OTHER);

    /* ---- the scoring service ---- */
    b += B(300, 150, 150, 44, 'scoring service~model + policy', MINE);
    b += A(u, 594, 172, 454, 172, { c: 'var(--accent)', m: 'aa' });
    b += T(524, 164, 'reads, never writes', { s: 9, c: 'var(--ink-dim)' });
    b += B(96, 150, 120, 44, 'calling service', OTHER);
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

    b += T(380, 218, 'the topics are the contract between the three teams, and nobody reaches across a handoff', { s: 10, c: 'var(--ink-dim)' });
    return S(230, b);
  };

  C['streaming-feature-pipeline'] = 'The common shape: producer services publish to a topic, one job turns that stream into features and publishes them, a platform team loads the store, and the scoring service <b>reads the store but never writes to it</b>. Solid boxes are one team; dashed boxes belong to the teams on either side. Knowing where the handoffs are is what lets you say which failures are yours to fix.';
}(typeof window !== 'undefined' ? window : this));
