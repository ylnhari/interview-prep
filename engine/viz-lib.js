/* viz-lib.js -- animated concept diagrams. ES5, self-contained, no external resources.
   window.VIZLIB[id](uid) -> inline <svg> string.  window.VIZLIB_CAPTIONS[id] -> caption.
   Colours come only from CSS variables; every internal id is prefixed with uid. */
(function (root) {
  'use strict';

  var V = {};

  /* ------------------------------------------------------------------ helpers */

  function S(h, body) {
    return '<svg viewBox="0 0 760 ' + h + '" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;font-family:inherit">' + body + '</svg>';
  }

  var MK = {
    ar: 'var(--ink-dim)',
    aa: 'var(--accent)',
    ag: 'var(--good)',
    ad: 'var(--danger)',
    aw: 'var(--warning)'
  };

  function mk(u, k) {
    return '<marker id="' + u + '-' + k + '" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="' + MK[k] + '"/></marker>';
  }

  function D(u, kinds, extra) {
    var k = (kinds || 'ar').split(' '), s = '<defs>', i;
    for (i = 0; i < k.length; i++) { if (MK[k[i]]) { s += mk(u, k[i]); } }
    return s + (extra || '') + '</defs>';
  }

  function cls(o) { return o.cls ? ' class="' + o.cls + '"' : ''; }
  function sty(o) { return o.st ? ' style="' + o.st + '"' : ''; }

  function T(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + (o.s || 11) + '" fill="' + (o.c || 'var(--ink)') + '" text-anchor="' + (o.a || 'middle') + '"' + (o.w ? ' font-weight="600"' : '') + cls(o) + sty(o) + '>' + s + '</text>';
  }

  /* multi-line centred label; lines separated by "/" is avoided, we use "~" */
  function ML(cx, cy, lab, o) {
    if (lab === undefined || lab === null || lab === '') { return ''; }
    o = o || {};
    var fs = o.ts || 11, arr = String(lab).split('~'), lh = fs + 2.5, s = '', i;
    var y0 = cy - (arr.length - 1) * lh / 2 + fs * 0.35;
    for (i = 0; i < arr.length; i++) {
      s += T(cx, Math.round((y0 + i * lh) * 10) / 10, arr[i], {
        s: i === 0 ? fs : Math.max(10, fs - 1),
        c: i === 0 ? (o.tc || 'var(--ink)') : (o.tc2 || 'var(--ink-dim)'),
        w: o.tw
      });
    }
    return s;
  }

  function B(x, y, w, h, lab, o) {
    o = o || {};
    return '<g' + cls(o) + sty(o) + '><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r === undefined ? 6 : o.r) + '" fill="' + (o.f || 'var(--surface-2)') + '" stroke="' + (o.sk || 'var(--border)') + '" stroke-width="' + (o.sw || 1.2) + '"/>' + ML(x + w / 2, y + h / 2, lab, o) + '</g>';
  }

  function R(x, y, w, h, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r === undefined ? 3 : o.r) + '" fill="' + (o.f || 'var(--surface-2)') + '"' + (o.sk ? ' stroke="' + o.sk + '" stroke-width="' + (o.sw || 1.2) + '"' : '') + cls(o) + sty(o) + '/>';
  }

  function CY(x, y, w, h, lab, o) {
    o = o || {};
    var ry = o.ry || 7, sk = o.sk || 'var(--border)';
    var s = '<g' + cls(o) + sty(o) + '>';
    s += '<path d="M' + x + ' ' + (y + ry) + 'V' + (y + h - ry) + 'A' + (w / 2) + ' ' + ry + ' 0 0 0 ' + (x + w) + ' ' + (y + h - ry) + 'V' + (y + ry) + 'Z" fill="' + (o.f || 'var(--surface-3)') + '" stroke="' + sk + '" stroke-width="1.2"/>';
    s += '<ellipse cx="' + (x + w / 2) + '" cy="' + (y + ry) + '" rx="' + (w / 2) + '" ry="' + ry + '" fill="' + (o.tf || 'var(--surface-2)') + '" stroke="' + sk + '" stroke-width="1.2"/>';
    s += ML(x + w / 2, y + ry + (h - ry) / 2 + 2, lab, o) + '</g>';
    return s;
  }

  function A(u, x1, y1, x2, y2, o) {
    o = o || {};
    var m = o.m === 'none' ? '' : ' marker-end="url(#' + u + '-' + (o.m || 'ar') + ')"';
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.c || 'var(--ink-dim)') + '" stroke-width="' + (o.w || 1.4) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + cls(o) + sty(o) + m + '/>';
  }

  function AP(u, d, o) {
    o = o || {};
    var m = o.m === 'none' ? '' : ' marker-end="url(#' + u + '-' + (o.m || 'ar') + ')"';
    return '<path d="' + d + '" fill="none" stroke="' + (o.c || 'var(--ink-dim)') + '" stroke-width="' + (o.w || 1.4) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + cls(o) + sty(o) + m + '/>';
  }

  /* animated dashed flow along a path */
  function F(d, o) {
    o = o || {};
    return '<path d="' + d + '" fill="none" stroke="' + (o.c || 'var(--accent)') + '" stroke-width="' + (o.w || 2.2) + '" stroke-dasharray="' + (o.d || '5 8') + '" stroke-linecap="round" class="' + (o.cls || 'v-flow') + '"/>';
  }

  function DT(x, y, r, o) {
    o = o || {};
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (o.f || 'var(--accent)') + '"' + (o.sk ? ' stroke="' + o.sk + '" stroke-width="1.2"' : '') + cls(o) + sty(o) + '/>';
  }

  function LN(x1, y1, x2, y2, o) {
    o = o || {};
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.c || 'var(--border)') + '" stroke-width="' + (o.w || 1) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + cls(o) + sty(o) + '/>';
  }

  function PG(pts, o) {
    o = o || {};
    return '<polygon points="' + pts + '" fill="' + (o.f || 'var(--accent-weak)') + '"' + (o.sk ? ' stroke="' + o.sk + '" stroke-width="' + (o.sw || 1) + '"' : '') + cls(o) + sty(o) + '/>';
  }

  function PL(pts, o) {
    o = o || {};
    return '<polyline points="' + pts + '" fill="none" stroke="' + (o.c || 'var(--ink-dim)') + '" stroke-width="' + (o.w || 1.6) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + cls(o) + sty(o) + '/>';
  }

  function HD(t, right) {
    return T(24, 20, t, { a: 'start', s: 12, w: 1 }) + (right ? T(736, 20, right, { a: 'end', s: 10, c: 'var(--ink-dim)' }) : '');
  }

  function SQ(inner) { return '<g class="v-fade-seq">' + inner + '</g>'; }
  function IX(i) { return ' style="--i: ' + i + '"'; }
  function GROW(inner) { return '<g class="v-grow" style="transform-box:fill-box">' + inner + '</g>'; }
  function DXS(dx) { return '--dx: ' + dx + 'px'; }

  /* ------------------------------------------------------- 1. loops and decisions */

  V['flow-forecast-optimize-act'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('forecast to action loop');
    b += B(40, 48, 140, 46, 'forecast~what will happen');
    b += B(220, 48, 140, 46, 'optimize~what to do');
    b += B(400, 48, 140, 46, 'act~commit decision');
    b += B(580, 48, 140, 46, 'observe~what happened');
    b += A(u, 182, 71, 216, 71);
    b += A(u, 362, 71, 396, 71);
    b += A(u, 542, 71, 576, 71);
    b += AP(u, 'M650 96V130H110V98', { m: 'aa', c: 'var(--accent)' });
    b += F('M182 71H216M362 71H396M542 71H576');
    b += DT(640, 130, 5, { cls: 'v-move-x', st: DXS(-520) });
    b += T(380, 148, 'outcomes feed the next forecast', { s: 10, c: 'var(--ink-dim)' });
    return S(160, b);
  };

  V['closed-loop'] = function (u) {
    var b = D(u, 'ar aa ad');
    b += HD('closed-loop control');
    b += T(24, 78, 'setpoint', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += A(u, 76, 74, 116, 74);
    b += '<circle cx="133" cy="74" r="15" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.2"/>';
    b += T(127, 71, '+', { s: 10, c: 'var(--ink-dim)' });
    b += T(140, 82, '-', { s: 10, c: 'var(--ink-dim)' });
    b += A(u, 150, 74, 194, 74, { c: 'var(--danger)', m: 'ad' });
    b += T(172, 62, 'error', { s: 10, c: 'var(--danger)', cls: 'v-pulse' });
    b += B(198, 52, 132, 44, 'controller~policy or MPC');
    b += A(u, 332, 74, 376, 74);
    b += T(354, 62, 'action', { s: 10, c: 'var(--ink-dim)' });
    b += B(380, 52, 132, 44, 'plant~the real system');
    b += A(u, 514, 74, 692, 74);
    b += T(736, 78, 'output', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += DT(600, 74, 4.5, { cls: 'v-pulse' });
    b += B(392, 124, 124, 34, 'sensor / metric', { ts: 10 });
    b += AP(u, 'M600 78V141H520', { d: '4 4' });
    b += AP(u, 'M390 141H133V92', { m: 'aa', c: 'var(--accent)' });
    b += F('M390 141H133V92');
    b += T(380, 174, 'the measured output changes the next action', { s: 10, c: 'var(--ink-dim)' });
    return S(186, b);
  };

  V['open-vs-closed-loop'] = function (u) {
    var b = D(u, 'ar ag');
    b += T(24, 20, 'open loop', { a: 'start', s: 12, w: 1 });
    b += T(400, 20, 'closed loop', { a: 'start', s: 12, w: 1 });
    b += LN(380, 30, 380, 176, { d: '3 4' });
    b += B(28, 48, 84, 36, 'plan');
    b += A(u, 114, 66, 142, 66);
    b += B(146, 48, 84, 36, 'execute');
    b += A(u, 232, 66, 268, 66, { d: '4 4' });
    b += B(272, 48, 78, 36, 'result', { f: 'var(--surface-3)' });
    b += T(190, 100, 'nothing is measured', { s: 10, c: 'var(--ink-dim)' });
    b += GROW(PG('34,164 350,164 350,116', { f: 'var(--warning-weak)', sk: 'var(--warning)' }));
    b += T(250, 156, 'drift grows unchecked', { s: 10, c: 'var(--warning)' });
    b += B(398, 48, 84, 36, 'plan');
    b += A(u, 484, 66, 508, 66);
    b += B(512, 48, 84, 36, 'execute');
    b += A(u, 598, 66, 622, 66);
    b += B(626, 48, 84, 36, 'measure');
    b += AP(u, 'M668 86V112H440V90', { c: 'var(--good)', m: 'ag' });
    b += F('M668 86V112H440V90', { c: 'var(--good)' });
    b += T(560, 128, 'correct on every cycle', { s: 10, c: 'var(--good)' });
    b += R(440, 140, 240, 10, { f: 'var(--good-weak)' });
    b += R(440, 140, 30, 10, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(560, 164, 'error stays bounded', { s: 10, c: 'var(--ink-dim)' });
    return S(184, b);
  };

  V['receding-horizon'] = function (u) {
    var b = D(u, 'ar aa'), r, i, x, y, inner = '';
    b += HD('receding horizon', 're-plan every cycle');
    var rows = ['cycle t', 'cycle t+1', 'cycle t+2'];
    for (r = 0; r < 3; r++) {
      y = 44 + r * 42;
      var g = T(136, y + 16, rows[r], { a: 'end', s: 10, c: 'var(--ink-dim)' });
      for (i = 0; i < 8; i++) {
        x = 148 + i * 66;
        var inWin = i >= r && i < r + 5;
        g += R(x, y, 62, 22, { f: i === r ? 'var(--accent)' : (inWin ? 'var(--accent-weak)' : 'var(--surface-2)'), sk: 'var(--border)' });
      }
      g += T(179 + r * 66, y + 15, 'commit', { s: 10, c: 'var(--accent-ink)' });
      inner += '<g' + IX(r) + '>' + g + '</g>';
    }
    b += SQ(inner);
    b += A(u, 148, 176, 200, 176, { c: 'var(--accent)', m: 'aa' });
    b += T(214, 180, 'the window slides; only the first slot is committed, the rest is a plan', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    return S(190, b);
  };

  V['mdp-loop'] = function (u) {
    var b = D(u, 'ar aa aw');
    b += HD('Markov decision process');
    b += B(96, 58, 160, 52, 'agent~policy pi(a, s)');
    b += B(504, 58, 160, 52, 'environment~transition P');
    b += AP(u, 'M258 74H500', { m: 'aa', c: 'var(--accent)' });
    b += T(380, 66, 'action a', { s: 10, c: 'var(--accent)' });
    b += F('M258 74H500');
    b += AP(u, 'M502 98H260', { m: 'ar' });
    b += T(380, 112, 'next state', { s: 10, c: 'var(--ink-dim)' });
    b += AP(u, 'M600 114V148H176V114', { m: 'aw', c: 'var(--warning)', d: '5 5' });
    b += T(388, 166, 'reward can arrive many steps later', { s: 10, c: 'var(--warning)', cls: 'v-blink' });
    return S(180, b);
  };

  V['bandit-vs-rl'] = function (u) {
    var b = D(u, 'ar ag aa'), i, inner = '';
    b += T(24, 20, 'bandit: one decision, fast feedback', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'RL: a chain of states, delayed return', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 182, { d: '3 4' });
    b += B(26, 74, 70, 38, 'context');
    var arms = ['arm A', 'arm B', 'arm C'];
    for (i = 0; i < 3; i++) {
      var yy = 48 + i * 42;
      inner += '<g' + IX(i) + '>' + A(u, 98, 93, 142, yy + 15) +
        B(146, yy, 76, 30, arms[i], { ts: 10, f: i === 1 ? 'var(--accent-weak)' : 'var(--surface-2)' }) +
        A(u, 224, yy + 15, 258, yy + 15, { c: 'var(--good)', m: 'ag' }) +
        T(300, yy + 19, 'reward now', { s: 10, c: 'var(--good)' }) + '</g>';
    }
    b += SQ(inner);
    var st = ['s1', 's2', 's3', 'end'];
    for (i = 0; i < 4; i++) {
      b += B(404 + i * 84, 74, 60, 34, st[i], { f: i === 3 ? 'var(--surface-3)' : 'var(--surface-2)' });
      if (i < 3) { b += A(u, 466 + i * 84, 91, 486 + i * 84, 91); }
    }
    b += F('M466 91H486M550 91H570M634 91H654');
    b += AP(u, 'M686 110V146H434V110', { m: 'aa', c: 'var(--accent)', d: '5 5' });
    b += T(560, 164, 'return credited back over the whole chain', { s: 10, c: 'var(--accent)' });
    return S(190, b);
  };

  /* ------------------------------------------------------------- 2. optimization */

  V['assignment-matrix'] = function (u) {
    var b = D(u, 'ar'), r, c, inner = '';
    b += HD('assignment under capacity');
    var eng = ['eng 1', 'eng 2', 'eng 3', 'eng 4', 'eng 5'];
    var pick = [1, 3, 1, 4];
    for (c = 0; c < 5; c++) { b += T(178 + c * 104, 44, eng[c], { s: 10, c: 'var(--ink-dim)' }); }
    for (r = 0; r < 4; r++) {
      b += T(126, 68 + r * 28, 'ticket ' + (r + 1), { a: 'end', s: 10, c: 'var(--ink-dim)' });
      for (c = 0; c < 5; c++) {
        b += R(136 + c * 104, 52 + r * 28, 84, 22, { f: 'var(--surface-2)', sk: 'var(--border)' });
      }
      inner += '<g' + IX(r) + '>' + R(136 + pick[r] * 104, 52 + r * 28, 84, 22, { f: 'var(--accent)', sk: 'var(--accent)' }) +
        T(178 + pick[r] * 104, 68 + r * 28, '1', { s: 11, c: 'var(--accent-ink)' }) + '</g>';
    }
    b += SQ(inner);
    for (c = 0; c < 5; c++) {
      var load = [0, 2, 0, 1, 1][c];
      b += R(136 + c * 104, 176, 84, 12, { f: 'var(--surface-3)' });
      if (load) { b += GROW(R(136 + c * 104, 176, 40 * load, 12, { f: load > 1 ? 'var(--warning)' : 'var(--good)' })); }
    }
    b += T(126, 186, 'capacity', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += T(380, 206, 'one engineer per ticket, no column over its capacity bar', { s: 10, c: 'var(--ink-dim)' });
    return S(216, b);
  };

  V['vrp-routes'] = function (u) {
    var b = D(u, 'ar'), i;
    b += HD('vehicle routing with time windows');
    b += B(30, 92, 68, 40, 'depot', { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    var routes = [
      '98,104 190,60 300,74 410,52 520,70',
      '98,112 200,120 320,116 448,124 560,110',
      '98,124 180,168 300,176 430,168 548,178'
    ];
    var cols = ['var(--accent)', 'var(--good)', 'var(--warning)'];
    var inner = '';
    for (i = 0; i < 3; i++) {
      inner += '<g' + IX(i) + '>' + PL(routes[i], { c: cols[i], w: 1.8 }) + '</g>';
    }
    b += SQ(inner);
    b += F('M98 112L200 120L320 116L448 124L560 110', { c: 'var(--good)', cls: 'v-flow-slow' });
    var stops = [[190, 60], [300, 74], [410, 52], [520, 70], [200, 120], [320, 116], [448, 124], [560, 110], [180, 168], [300, 176], [430, 168], [548, 178]];
    for (i = 0; i < stops.length; i++) { b += DT(stops[i][0], stops[i][1], 4, { f: 'var(--surface)', sk: 'var(--ink-dim)' }); }
    b += B(596, 44, 132, 30, '09:00 - 11:00', { ts: 10, f: 'var(--surface-3)', r: 15 });
    b += B(596, 104, 132, 30, '11:00 - 14:00', { ts: 10, f: 'var(--surface-3)', r: 15 });
    b += B(596, 164, 132, 30, '14:00 - 17:00', { ts: 10, f: 'var(--surface-3)', r: 15 });
    b += T(280, 208, 'routes are built one vehicle at a time and must respect each stop time window', { s: 10, c: 'var(--ink-dim)' });
    return S(220, b);
  };

  V['exact-vs-metaheuristic-landscape'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('exact solver vs metaheuristic');
    var curve = 'M50 78C110 40 130 150 190 132S280 42 340 96S430 168 500 140S610 60 660 118S710 150 720 146';
    b += AP(u, curve, { m: 'none', c: 'var(--ink-dim)', w: 1.8 });
    b += LN(50, 166, 730, 166);
    b += T(390, 182, 'solution space', { s: 10, c: 'var(--ink-dim)' });
    b += LN(50, 150, 730, 150, { c: 'var(--accent)', d: '6 5' });
    b += T(58, 144, 'proven bound (exact)', { a: 'start', s: 10, c: 'var(--accent)' });
    b += DT(500, 140, 5.5, { f: 'var(--accent)' });
    b += T(500, 118, 'optimum', { s: 10, c: 'var(--accent)' });
    b += DT(190, 132, 5.5, { f: 'var(--warning)', cls: 'v-move-x', st: DXS(310) });
    b += T(190, 46, 'search escapes local dips', { s: 10, c: 'var(--warning)' });
    b += T(736, 20, 'good enough, fast', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    return S(196, b);
  };

  V['simulated-annealing-temperature'] = function (u) {
    var b = D(u, 'ar'), i, inner = '';
    b += HD('simulated annealing: cooling schedule');
    b += AP(u, 'M60 52C180 54 240 108 340 116S520 132 720 136', { m: 'none', c: 'var(--warning)', w: 2 });
    b += T(64, 46, 'temperature', { a: 'start', s: 10, c: 'var(--warning)' });
    b += LN(60, 140, 730, 140);
    b += T(60, 156, 'hot: worse moves accepted', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += T(730, 156, 'cold: only improvements', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    for (i = 0; i < 12; i++) {
      var accept = i < 5 || (i < 8 && i % 2 === 0);
      inner += '<g' + IX(i) + '>' + DT(78 + i * 56, 178, 6, { f: accept ? 'var(--good)' : 'var(--danger-weak)', sk: accept ? 'var(--good)' : 'var(--danger)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(150, 200, 'accept worse', { s: 10, c: 'var(--good)' });
    b += T(600, 200, 'reject worse', { s: 10, c: 'var(--danger)' });
    return S(212, b);
  };

  V['hard-vs-soft-constraint'] = function (u) {
    var b = D(u, 'ar ad aw');
    b += T(24, 20, 'hard constraint: a wall', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'soft constraint: a price', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 190, { d: '3 4' });
    b += R(292, 46, 12, 104, { f: 'var(--danger)', r: 2 });
    b += T(298, 166, 'infeasible beyond here', { s: 10, c: 'var(--danger)' });
    b += DT(60, 98, 8, { f: 'var(--accent)', cls: 'v-move-x', st: DXS(215) });
    b += A(u, 74, 98, 280, 98, { c: 'var(--ink-dim)', d: '4 4' });
    b += T(150, 78, 'solution stops', { s: 10, c: 'var(--ink-dim)' });
    b += T(180, 186, 'no solution may cross it', { s: 10, c: 'var(--ink-dim)' });
    b += LN(596, 46, 596, 150, { c: 'var(--warning)', w: 3, d: '6 5' });
    b += T(600, 166, 'target, crossable', { s: 10, c: 'var(--warning)' });
    b += DT(430, 98, 8, { f: 'var(--accent)', cls: 'v-move-x', st: DXS(215) });
    b += A(u, 444, 98, 690, 98, { c: 'var(--ink-dim)', d: '4 4' });
    b += T(500, 78, 'crossing is allowed', { s: 10, c: 'var(--ink-dim)' });
    b += R(430, 168, 250, 12, { f: 'var(--warning-weak)' });
    b += GROW(R(430, 168, 150, 12, { f: 'var(--warning)' }));
    b += T(556, 192, 'penalty cost rises with the violation', { s: 10, c: 'var(--ink-dim)' });
    return S(200, b);
  };

  V['optimality-gap'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += HD('optimality gap', 'best found vs proven bound');
    b += LN(70, 160, 720, 160);
    b += LN(70, 40, 70, 160);
    b += PG('90,66 240,86 400,100 560,108 700,112 700,140 560,138 400,134 240,124 90,150', { f: 'var(--accent-weak)' });
    b += PL('90,66 240,86 400,100 560,108 700,112', { c: 'var(--accent)', w: 2 });
    b += PL('90,150 240,124 400,134 560,138 700,140', { c: 'var(--good)', w: 2, d: '5 4' });
    b += T(96, 58, 'best found', { a: 'start', s: 10, c: 'var(--accent)' });
    b += T(96, 166, 'proven bound', { a: 'start', s: 10, c: 'var(--good)' });
    b += A(u, 160, 78, 160, 138, { c: 'var(--ink-dim)', m: 'none' });
    b += A(u, 160, 138, 160, 78, { c: 'var(--ink-dim)', m: 'none' });
    b += T(200, 112, 'gap', { s: 10, c: 'var(--ink-dim)' });
    b += B(600, 44, 122, 30, 'gap 2%', { ts: 11, f: 'var(--good-weak)', sk: 'var(--good)', cls: 'v-pulse', r: 15 });
    b += T(400, 180, 'stop when the gap is small enough, not when it is zero', { s: 10, c: 'var(--ink-dim)' });
    return S(192, b);
  };

  /* ------------------------------------------ 3. forecasting and statistics */

  V['quantile-band-forecast'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('quantile forecast', 'p10 / p50 / p90');
    b += LN(50, 168, 730, 168);
    b += PL('60,120 110,104 160,126 210,96 260,112 310,88 360,100', { c: 'var(--ink)', w: 2 });
    b += T(180, 60, 'history', { s: 10, c: 'var(--ink-dim)' });
    b += LN(360, 40, 360, 168, { c: 'var(--border)', d: '4 4' });
    b += T(360, 184, 'now', { s: 10, c: 'var(--ink-dim)' });
    b += GROW(PG('360,100 480,74 600,58 720,46 720,150 600,138 480,120 360,100', { f: 'var(--accent-weak)' }));
    b += PL('360,100 480,96 600,90 720,86', { c: 'var(--accent)', w: 2, d: '5 4' });
    b += T(736, 42, 'p90', { a: 'end', s: 10, c: 'var(--accent)' });
    b += T(736, 90, 'p50', { a: 'end', s: 10, c: 'var(--accent)' });
    b += T(736, 162, 'p10', { a: 'end', s: 10, c: 'var(--accent)' });
    b += T(300, 196, 'the band widens with the horizon: plan against a range, not a number', { s: 10, c: 'var(--ink-dim)' });
    return S(208, b);
  };

  V['ci-vs-pi-band'] = function (u) {
    var b = D(u, 'ar'), i;
    b += HD('confidence band vs prediction band');
    b += LN(60, 170, 720, 170);
    b += LN(60, 36, 60, 170);
    b += PG('80,50 390,98 700,112 700,180 390,130 80,118', { f: 'var(--accent-weak)' });
    b += PG('80,66 390,107 700,128 700,164 390,121 80,102', { f: 'var(--good-weak)' });
    b += PL('80,84 390,114 700,146', { c: 'var(--ink)', w: 2 });
    var pts = [[120, 96], [180, 88], [240, 116], [300, 100], [360, 126], [420, 112], [480, 138], [540, 124], [600, 150], [660, 136]];
    for (i = 0; i < pts.length; i++) { b += DT(pts[i][0], pts[i][1], 3, { f: 'var(--ink-dim)' }); }
    b += LN(390, 36, 390, 170, { d: '4 4' });
    b += T(390, 30, 'mean of x', { s: 10, c: 'var(--ink-dim)' });
    b += B(556, 40, 168, 26, 'prediction band', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)', r: 13 });
    b += B(556, 72, 168, 26, 'confidence band', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)', r: 13 });
    b += T(320, 192, 'the mean is known far better than the next single observation', { s: 10, c: 'var(--ink-dim)' });
    return S(204, b);
  };

  V['jackknife-refits'] = function (u) {
    var b = D(u, 'ar'), i, inner = '';
    b += HD('jackknife: refit with one point left out');
    b += LN(50, 160, 560, 160);
    var pts = [[80, 130], [140, 118], [200, 122], [260, 100], [320, 106], [380, 84], [440, 90], [500, 70]];
    for (i = 0; i < pts.length; i++) { b += DT(pts[i][0], pts[i][1], 4, { f: 'var(--ink-dim)' }); }
    var fits = ['60,138 540,64', '60,134 540,70', '60,142 540,60', '60,130 540,74'];
    for (i = 0; i < 4; i++) {
      inner += '<g' + IX(i) + '>' + PL(fits[i], { c: 'var(--accent)', w: 1.4 }) + DT(pts[i * 2][0], pts[i * 2][1], 6, { f: 'var(--surface)', sk: 'var(--danger)' }) + '</g>';
    }
    b += SQ(inner);
    b += LN(560, 40, 560, 170, { d: '4 4' });
    b += T(620, 34, 'forecasts', { s: 10, c: 'var(--ink-dim)' });
    var sp = [56, 62, 68, 74, 80, 88];
    for (i = 0; i < sp.length; i++) { b += DT(640, sp[i] * 1.05 + 4, 4, { f: 'var(--accent)' }); }
    b += A(u, 690, 62, 690, 100, { m: 'none' });
    b += A(u, 690, 100, 690, 62, { m: 'none' });
    b += T(700, 86, 'spread', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += T(300, 186, 'the spread of the refits estimates how much one observation moves the answer', { s: 10, c: 'var(--ink-dim)' });
    return S(198, b);
  };

  V['rolling-origin-backtest'] = function (u) {
    var b = D(u, 'ar'), r, inner = '';
    b += HD('rolling-origin backtest');
    var marks = ['hit', 'hit', 'miss', 'hit'];
    for (r = 0; r < 4; r++) {
      var y = 44 + r * 34, wdt = 240 + r * 70;
      var g = T(96, y + 15, 'fold ' + (r + 1), { a: 'end', s: 10, c: 'var(--ink-dim)' });
      g += R(106, y, wdt, 22, { f: 'var(--surface-3)', sk: 'var(--border)' });
      g += T(106 + wdt / 2, y + 15, 'train', { s: 10, c: 'var(--ink-dim)' });
      g += R(110 + wdt, y, 66, 22, { f: 'var(--accent-weak)', sk: 'var(--accent)' });
      g += T(143 + wdt, y + 15, 'test', { s: 10, c: 'var(--accent-ink)' });
      g += T(190 + wdt, y + 15, marks[r], { a: 'start', s: 10, c: marks[r] === 'hit' ? 'var(--good)' : 'var(--danger)' });
      inner += '<g' + IX(r) + '>' + g + '</g>';
    }
    b += SQ(inner);
    b += LN(106, 186, 730, 186);
    b += T(400, 202, 'the origin moves forward; the model never sees data after its own cut', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };

  V['coverage-vs-width'] = function (u) {
    var b = D(u, 'ar'), i;
    b += HD('coverage vs width');
    var narrow = [1, 1, 0, 1, 0, 1, 1, 0];
    for (i = 0; i < 8; i++) {
      var x = 120 + i * 74;
      b += R(x, 52, 10, 30, { f: 'var(--accent-weak)' });
      b += DT(x + 5, narrow[i] ? 67 : 40, 4, { f: narrow[i] ? 'var(--good)' : 'var(--danger)' });
      b += R(x + 34, 106, 10, 62, { f: 'var(--accent-weak)' });
      b += DT(x + 39, 137, 4, { f: 'var(--good)' });
    }
    b += T(110, 70, 'narrow', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += T(110, 142, 'wide', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += R(120, 184, 300, 12, { f: 'var(--surface-3)' });
    b += R(120, 184, 188, 12, { f: 'var(--danger)', cls: 'v-pulse' });
    b += T(430, 194, '62% covered', { a: 'start', s: 10, c: 'var(--danger)' });
    b += R(120, 202, 300, 12, { f: 'var(--surface-3)' });
    b += R(120, 202, 285, 12, { f: 'var(--good)' });
    b += T(430, 212, '95% covered, but wide', { a: 'start', s: 10, c: 'var(--good)' });
    return S(226, b);
  };

  V['driver-regression-fit'] = function (u) {
    var b = D(u, 'ar'), i, inner = '';
    b += HD('driver regression', 'residuals are the story');
    b += LN(60, 176, 720, 176);
    b += LN(60, 40, 60, 176);
    b += T(390, 194, 'driver (for example tickets per active account)', { s: 10, c: 'var(--ink-dim)' });
    b += PL('80,158 700,58', { c: 'var(--accent)', w: 2 });
    var pts = [[140, 136], [210, 138], [280, 116], [350, 118], [420, 94], [490, 100], [560, 76], [630, 74]];
    var fit = [[140, 148], [210, 137], [280, 126], [350, 114], [420, 103], [490, 92], [560, 81], [630, 70]];
    for (i = 0; i < pts.length; i++) {
      inner += '<g' + IX(i % 4) + '>' + LN(pts[i][0], pts[i][1], fit[i][0], fit[i][1], { c: 'var(--warning)', w: 1.6, cls: 'v-pulse' }) + '</g>';
      b += DT(pts[i][0], pts[i][1], 4, { f: 'var(--ink)' });
    }
    b += SQ(inner);
    b += T(688, 50, 'fit', { s: 10, c: 'var(--accent)' });
    b += T(150, 62, 'residual sticks', { a: 'start', s: 10, c: 'var(--warning)' });
    return S(204, b);
  };

  /* ------------------------------------------------- 4. ML platform and data */

  V['ml-lifecycle'] = function (u) {
    var b = D(u, 'ar aa aw');
    b += HD('the model lifecycle');
    var top = [['data', 30], ['features', 178], ['training', 326], ['registry', 474], ['deploy', 622]];
    var i;
    for (i = 0; i < top.length; i++) { b += B(top[i][1], 48, 108, 40, top[i][0]); }
    for (i = 0; i < 4; i++) { b += A(u, 140 + i * 148, 68, 172 + i * 148, 68); }
    b += F('M140 68H172M288 68H320M436 68H468M584 68H616');
    b += AP(u, 'M676 90V118H488V96', { m: 'none', c: 'var(--border)', d: '3 3' });
    b += B(474, 118, 108, 40, 'serve');
    b += B(326, 118, 108, 40, 'monitor', { cls: 'v-pulse', f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += A(u, 470, 138, 440, 138);
    b += AP(u, 'M330 138H200V92', { m: 'aa', c: 'var(--accent)' });
    b += F('M330 138H200V92');
    b += T(190, 128, 'drift and labels', { a: 'end', s: 10, c: 'var(--accent)' });
    b += DT(452, 138, 4.5, { cls: 'v-blink' });
    b += T(380, 180, 'monitoring is what turns a one-off model into a system', { s: 10, c: 'var(--ink-dim)' });
    return S(194, b);
  };

  V['feature-store-two-stores'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('one definition, two stores');
    b += B(28, 92, 150, 52, 'feature definition~written once');
    b += AP(u, 'M180 108H300V66H340', { m: 'aa', c: 'var(--accent)' });
    b += AP(u, 'M180 128H300V172H340', { m: 'aa', c: 'var(--accent)' });
    b += F('M180 108H300V66H340M180 128H300V172H340');
    b += CY(344, 44, 150, 52, 'online store', { ts: 11 });
    b += CY(344, 148, 150, 52, 'offline store', { ts: 11 });
    b += A(u, 498, 68, 548, 68);
    b += A(u, 498, 174, 548, 174);
    b += B(552, 46, 180, 46, 'serving lookup~single key, milliseconds', { ts: 10 });
    b += B(552, 152, 180, 46, 'training set~point-in-time join', { ts: 10 });
    b += T(380, 218, 'the same code fills both, which is what stops training-serving skew', { s: 10, c: 'var(--ink-dim)' });
    return S(230, b);
  };

  V['point-in-time-join'] = function (u) {
    var b = D(u, 'ar ad');
    b += HD('point-in-time correctness');
    b += LN(50, 110, 730, 110, { c: 'var(--ink-dim)', w: 1.6 });
    b += LN(400, 46, 400, 158, { c: 'var(--accent)', w: 2 });
    b += T(400, 40, 'decision time t0', { s: 10, c: 'var(--accent)' });
    b += R(90, 92, 306, 16, { f: 'var(--good-weak)', sk: 'var(--good)' });
    b += T(243, 104, 'features known at or before t0', { s: 10, c: 'var(--ink)' });
    b += LN(600, 96, 600, 124, { c: 'var(--warning)', w: 2 });
    b += T(600, 148, 'label arrives at t0 + H', { s: 10, c: 'var(--warning)' });
    b += R(410, 60, 300, 16, { f: 'var(--danger-weak)', sk: 'var(--danger)' });
    b += T(560, 72, 'anything after t0 is a leak', { s: 10, c: 'var(--danger)' });
    b += AP(u, 'M560 80V96H408', { m: 'ad', c: 'var(--danger)', d: '4 4' });
    b += LN(470, 78, 496, 100, { c: 'var(--danger)', w: 2.4, cls: 'v-blink' });
    b += LN(496, 78, 470, 100, { c: 'var(--danger)', w: 2.4, cls: 'v-blink' });
    b += T(380, 178, 'join every feature as of the decision time, never as of today', { s: 10, c: 'var(--ink-dim)' });
    return S(190, b);
  };

  V['training-serving-skew'] = function (u) {
    var b = D(u, 'ar ad'), i;
    b += HD('training-serving skew');
    b += B(28, 48, 130, 40, 'batch pipeline', { ts: 10 });
    b += B(28, 128, 130, 40, 'online pipeline', { ts: 10 });
    b += A(u, 160, 68, 196, 68);
    b += A(u, 160, 148, 196, 148);
    b += PL('200,68 300,68 400,72 500,80 600,92 700,104', { c: 'var(--good)', w: 2 });
    b += PL('200,148 300,148 400,144 500,136 600,124 700,110', { c: 'var(--warning)', w: 2, d: '5 4' });
    b += PG('600,92 700,104 700,110 600,124', { f: 'var(--danger-weak)' });
    b += T(660, 78, 'same feature, two values', { s: 10, c: 'var(--danger)', cls: 'v-blink', a: 'end' });
    b += T(250, 60, 'training value', { a: 'start', s: 10, c: 'var(--good)' });
    b += T(250, 164, 'serving value', { a: 'start', s: 10, c: 'var(--warning)' });
    b += B(300, 176, 190, 30, 'parity check on live traffic', { ts: 10, f: 'var(--surface-3)', r: 15 });
    b += A(u, 495, 191, 620, 130, { c: 'var(--danger)', m: 'ad', d: '4 4' });
    b += T(140, 196, 'alert on divergence', { a: 'start', s: 10, c: 'var(--danger)' });
    return S(216, b);
  };

  V['label-latency'] = function (u) {
    var b = D(u, 'ar aw'), i, inner = '';
    b += HD('label latency');
    b += LN(50, 150, 730, 150);
    b += T(120, 168, 'today', { s: 10, c: 'var(--ink-dim)' });
    b += T(560, 168, 'three weeks later', { s: 10, c: 'var(--ink-dim)' });
    for (i = 0; i < 5; i++) {
      inner += '<g' + IX(i) + '>' + DT(96 + i * 26, 62, 5, { f: 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(120, 42, 'events happen now', { s: 10, c: 'var(--accent)' });
    b += AP(u, 'M96 76C200 130 420 130 540 92', { m: 'aw', c: 'var(--warning)', d: '6 5' });
    b += F('M96 76C200 130 420 130 540 92', { c: 'var(--warning)', cls: 'v-flow-slow' });
    b += DT(560, 62, 5, { f: 'var(--warning)' });
    b += DT(586, 62, 5, { f: 'var(--warning)' });
    b += DT(612, 62, 5, { f: 'var(--warning)' });
    b += T(600, 42, 'labels land here', { s: 10, c: 'var(--warning)' });
    b += R(120, 128, 440, 12, { f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += T(340, 138, 'gap: you cannot score today what you cannot label yet', { s: 10, c: 'var(--ink)' });
    b += T(380, 190, 'use leading proxies while the real labels mature', { s: 10, c: 'var(--ink-dim)' });
    return S(202, b);
  };

  V['data-contract-validation'] = function (u) {
    var b = D(u, 'ar ag ad'), i, inner = '';
    b += HD('data contract as a gate');
    b += B(28, 84, 118, 44, 'producer');
    b += A(u, 148, 106, 292, 106);
    b += F('M148 106H292', { c: 'var(--good)' });
    b += B(296, 60, 96, 92, 'schema~gate', { f: 'var(--surface-3)', ts: 11 });
    b += A(u, 394, 106, 540, 106, { c: 'var(--good)', m: 'ag' });
    b += B(544, 84, 188, 44, 'warehouse / feature store', { ts: 10 });
    for (i = 0; i < 4; i++) {
      inner += '<g' + IX(i) + '>' + R(180 + i * 26, 98, 18, 16, { f: 'var(--good-weak)', sk: 'var(--good)' }) + '</g>';
    }
    b += SQ(inner);
    b += AP(u, 'M296 132C250 168 190 172 150 168', { m: 'ad', c: 'var(--danger)' });
    b += R(150, 158, 18, 16, { f: 'var(--danger-weak)', sk: 'var(--danger)', cls: 'v-blink' });
    b += T(300, 186, 'a row that breaks the contract bounces back to the producer', { s: 10, c: 'var(--danger)' });
    b += T(640, 152, 'types, ranges, nulls, keys', { s: 10, c: 'var(--ink-dim)' });
    return S(200, b);
  };

  V['gitops-loop'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('GitOps: the repo is the desired state');
    b += CY(28, 52, 130, 56, 'Git repo', { ts: 11 });
    b += A(u, 162, 80, 208, 80);
    b += B(212, 56, 118, 48, 'CI~build, test');
    b += A(u, 334, 80, 380, 80);
    b += B(384, 56, 130, 48, 'CD controller~reconcile');
    b += A(u, 518, 80, 564, 80, { c: 'var(--good)', m: 'ag' });
    b += B(568, 56, 164, 48, 'cluster~running state');
    b += F('M162 80H208M334 80H380');
    b += AP(u, 'M650 108V142H452V108', { m: 'aa', c: 'var(--accent)' });
    b += F('M650 108V142H452V108');
    b += T(560, 158, 'observed state', { s: 10, c: 'var(--accent)' });
    b += B(180, 128, 230, 34, 'drift detected, cluster pulled back', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)', cls: 'v-pulse', r: 17 });
    b += T(380, 186, 'nothing is applied by hand; the controller keeps closing the difference', { s: 10, c: 'var(--ink-dim)' });
    return S(198, b);
  };

  /* ----------------------------------------------------- 5. serving and scale */

  V['latency-budget-bar'] = function (u) {
    var b = D(u, 'ar ad'), i, x = 60;
    b += HD('latency budget', 'p99 must fit inside');
    var segs = [['gateway', 70, 'var(--surface-3)'], ['features', 150, 'var(--accent-weak)'], ['model', 210, 'var(--accent)'], ['post', 90, 'var(--surface-3)']];
    for (i = 0; i < segs.length; i++) {
      b += R(x, 60, segs[i][1], 40, { f: segs[i][2], sk: 'var(--border)' });
      b += T(x + segs[i][1] / 2, 84, segs[i][0], { s: 10, c: i === 2 ? 'var(--accent-ink)' : 'var(--ink)' });
      x += segs[i][1];
    }
    b += R(x, 60, 640 - (x - 60), 40, { f: 'var(--good-weak)', sk: 'var(--good)', cls: 'v-pulse' });
    b += T(x + (640 - (x - 60)) / 2, 84, 'headroom', { s: 10, c: 'var(--ink)' });
    b += LN(60, 108, 700, 108);
    b += T(60, 126, '0 ms', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += T(700, 126, '250 ms budget', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += LN(580, 44, 580, 116, { c: 'var(--danger)', w: 2 });
    b += T(580, 38, 'p99 today', { s: 10, c: 'var(--danger)' });
    b += T(380, 158, 'every hop spends the same budget; the model is only one slice of it', { s: 10, c: 'var(--ink-dim)' });
    return S(172, b);
  };

  V['load-balancer-replicas'] = function (u) {
    var b = D(u, 'ar ag ad'), i;
    b += HD('load balancer and health checks');
    b += B(24, 88, 96, 42, 'clients');
    b += A(u, 122, 109, 168, 109);
    b += F('M122 109H168');
    b += B(172, 82, 108, 54, 'load~balancer', { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    var ys = [46, 96, 146];
    var names = ['replica A', 'replica B', 'replica C'];
    for (i = 0; i < 3; i++) {
      var dead = i === 1;
      b += AP(u, 'M282 109C330 109 340 ' + (ys[i] + 20) + ' 388 ' + (ys[i] + 20), { m: dead ? 'ad' : 'ag', c: dead ? 'var(--danger)' : 'var(--good)', d: dead ? '4 4' : '' });
      b += B(392, ys[i], 150, 40, names[i], { f: dead ? 'var(--danger-weak)' : 'var(--surface-2)', sk: dead ? 'var(--danger)' : 'var(--border)', tc: dead ? 'var(--ink-dim)' : 'var(--ink)', cls: dead ? 'v-blink' : '' });
      b += DT(560, ys[i] + 20, 6, { f: dead ? 'var(--danger)' : 'var(--good)' });
      b += T(576, ys[i] + 24, dead ? 'health check failing' : 'healthy', { a: 'start', s: 10, c: dead ? 'var(--danger)' : 'var(--ink-dim)' });
    }
    b += F('M282 109C330 109 340 66 388 66', { c: 'var(--good)' });
    b += T(380, 210, 'the unhealthy replica is drained and its share moves to the others', { s: 10, c: 'var(--ink-dim)' });
    return S(222, b);
  };

  V['autoscaling-queue'] = function (u) {
    var b = D(u, 'ar aa'), i, inner = '';
    b += HD('autoscaling on queue depth');
    b += LN(60, 130, 420, 130);
    b += PL('70,120 130,72 190,54 250,60 310,86 370,112 410,120', { c: 'var(--accent)', w: 2 });
    b += T(190, 44, 'queue depth', { s: 10, c: 'var(--accent)' });
    b += LN(60, 76, 420, 76, { c: 'var(--warning)', d: '5 4' });
    b += T(66, 70, 'scale-up threshold', { a: 'start', s: 10, c: 'var(--warning)' });
    b += T(240, 148, 'time', { s: 10, c: 'var(--ink-dim)' });
    b += LN(450, 40, 450, 160, { d: '3 4' });
    for (i = 0; i < 5; i++) {
      inner += '<g' + IX(i) + '>' + B(480 + (i % 3) * 90, 56 + Math.floor(i / 3) * 52, 78, 40, 'pod', { ts: 10, f: i < 2 ? 'var(--surface-2)' : 'var(--accent-weak)', sk: i < 2 ? 'var(--border)' : 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(600, 40, 'replicas added', { s: 10, c: 'var(--accent)' });
    b += T(600, 164, 'depth falls back under the threshold', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 186, 'scale on the backlog, not on CPU, when work is queued', { s: 10, c: 'var(--ink-dim)' });
    return S(198, b);
  };

  V['request-batching'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += HD('request batching');
    for (i = 0; i < 5; i++) {
      b += B(24, 44 + i * 30, 82, 24, 'req', { ts: 10, r: 12 });
      b += AP(u, 'M108 ' + (56 + i * 30) + 'C150 ' + (56 + i * 30) + ' 160 118 200 118', { m: 'none', c: 'var(--border)' });
    }
    b += F('M108 56C150 56 160 118 200 118M108 116C150 116 160 118 200 118M108 176C150 176 160 118 200 118');
    b += B(204, 92, 108, 52, 'batcher~10 ms window', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 314, 118, 366, 118, { c: 'var(--accent)', m: 'aa' });
    b += B(370, 92, 132, 52, 'model~one forward pass', { ts: 10 });
    for (i = 0; i < 5; i++) {
      b += AP(u, 'M504 118C548 118 560 ' + (56 + i * 30) + ' 606 ' + (56 + i * 30), { m: 'none', c: 'var(--border)' });
      b += B(610, 44 + i * 30, 96, 24, 'result', { ts: 10, r: 12 });
    }
    b += F('M504 118C548 118 560 56 606 56M504 118C548 118 560 176 606 176', { cls: 'v-flow-slow' });
    b += T(380, 206, 'higher GPU utilisation, at the cost of the batching window in latency', { s: 10, c: 'var(--ink-dim)' });
    return S(218, b);
  };

  V['caching-read-through'] = function (u) {
    var b = D(u, 'ar ag ad');
    b += HD('read-through cache');
    b += B(24, 84, 92, 44, 'client');
    b += A(u, 118, 106, 176, 106);
    b += F('M118 106H176');
    b += CY(180, 76, 130, 62, 'cache', { ts: 11, f: 'var(--accent-weak)', tf: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M312 96C360 96 372 60 420 60', { m: 'ad', c: 'var(--danger)', d: '4 4' });
    b += T(366, 48, 'miss', { s: 10, c: 'var(--danger)' });
    b += CY(424, 40, 130, 62, 'database', { ts: 11 });
    b += AP(u, 'M424 92C376 106 372 118 312 122', { m: 'ar' });
    b += T(388, 130, 'fill', { s: 10, c: 'var(--ink-dim)' });
    b += AP(u, 'M180 122C150 140 130 142 118 130', { m: 'ag', c: 'var(--good)' });
    b += T(596, 74, 'later reads: hit', { s: 10, c: 'var(--good)' });
    b += B(578, 92, 148, 40, 'hits 1 842', { ts: 11, f: 'var(--good-weak)', sk: 'var(--good)', cls: 'v-pulse' });
    b += T(380, 176, 'the cache, not the caller, knows how to load a missing key', { s: 10, c: 'var(--ink-dim)' });
    return S(188, b);
  };

  V['caching-write-through'] = function (u) {
    var b = D(u, 'ar aa aw');
    b += T(24, 20, 'write-through', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'write-back', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 190, { d: '3 4' });
    b += B(24, 90, 74, 40, 'writer');
    b += A(u, 100, 110, 142, 110);
    b += CY(146, 82, 100, 56, 'cache', { ts: 10, f: 'var(--accent-weak)', tf: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 248, 110, 288, 110, { c: 'var(--accent)', m: 'aa' });
    b += CY(292, 82, 82, 56, 'DB', { ts: 10 });
    b += F('M100 110H142M248 110H288');
    b += T(200, 168, 'both written before the ack', { s: 10, c: 'var(--ink-dim)' });
    b += T(200, 186, 'safe, slower writes', { s: 10, c: 'var(--good)' });
    b += B(400, 90, 74, 40, 'writer');
    b += A(u, 476, 110, 518, 110);
    b += CY(522, 82, 100, 56, 'cache', { ts: 10, f: 'var(--accent-weak)', tf: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M624 110H664', { m: 'aw', c: 'var(--warning)', d: '5 4' });
    b += CY(668, 82, 64, 56, 'DB', { ts: 10 });
    b += R(522, 146, 100, 10, { f: 'var(--warning-weak)' });
    b += GROW(R(522, 146, 68, 10, { f: 'var(--warning)' }));
    b += T(572, 176, 'buffer, flushed in batches', { s: 10, c: 'var(--warning)' });
    b += T(572, 192, 'fast writes, data at risk', { s: 10, c: 'var(--ink-dim)' });
    return S(202, b);
  };

  V['cache-invalidation-ttl'] = function (u) {
    var b = D(u, 'ar ad ag');
    b += HD('TTL and invalidation');
    b += B(30, 60, 150, 46, 'cached value~key: user 42');
    b += R(30, 118, 300, 14, { f: 'var(--surface-3)' });
    b += R(30, 118, 210, 14, { f: 'var(--warning)' });
    b += R(30, 114, 6, 22, { f: 'var(--ink)', cls: 'v-move-x', st: DXS(290) });
    b += T(180, 150, 'age approaching the TTL', { s: 10, c: 'var(--warning)' });
    b += LN(330, 106, 330, 144, { c: 'var(--danger)', w: 2 });
    b += T(330, 160, 'TTL expires', { s: 10, c: 'var(--danger)' });
    b += A(u, 340, 125, 392, 125, { c: 'var(--danger)', m: 'ad' });
    b += B(396, 104, 128, 42, 'entry evicted', { ts: 10, f: 'var(--danger-weak)', sk: 'var(--danger)', cls: 'v-blink' });
    b += AP(u, 'M460 100V72H540', { m: 'ar' });
    b += CY(544, 44, 128, 56, 'source of truth', { ts: 10 });
        b += A(u, 528, 125, 584, 125, { c: 'var(--good)', m: 'ag' });
    b += B(588, 104, 140, 42, 'refetched, fresh', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += T(380, 186, 'a short TTL trades freshness against load; explicit invalidation is the sharp tool', { s: 10, c: 'var(--ink-dim)' });
    return S(198, b);
  };

  V['cdn-edge'] = function (u) {
    var b = D(u, 'ar ag'), i;
    b += HD('CDN edges protect the origin');
    var ys = [46, 100, 154];
    var regions = ['Europe', 'India', 'US east'];
    for (i = 0; i < 3; i++) {
      b += B(24, ys[i], 96, 38, 'users', { ts: 10 });
      b += T(72, ys[i] + 52, regions[i], { s: 10, c: 'var(--ink-dim)' });
      b += A(u, 122, ys[i] + 19, 176, ys[i] + 19, { c: 'var(--good)', m: 'ag' });
      b += B(180, ys[i], 118, 38, 'edge cache', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
      b += AP(u, 'M300 ' + (ys[i] + 19) + 'C380 ' + (ys[i] + 19) + ' 400 100 470 100', { m: 'none', c: 'var(--border)', d: '4 4' });
    }
    b += F('M122 65H176M122 119H176M122 173H176', { c: 'var(--good)' });
    b += B(474, 78, 136, 44, 'origin', { f: 'var(--surface-3)' });
    b += T(542, 140, 'only misses reach it', { s: 10, c: 'var(--ink-dim)' });
    b += B(628, 78, 104, 44, 'few requests', { ts: 10, cls: 'v-pulse' });
    b += T(380, 206, 'most bytes are served near the user; the origin sees a small fraction', { s: 10, c: 'var(--ink-dim)' });
    return S(218, b);
  };

  V['message-queue-async'] = function (u) {
    var b = D(u, 'ar aa'), i, inner = '';
    b += HD('queue decouples producer from consumers');
    b += B(24, 82, 106, 46, 'producer');
    b += A(u, 132, 105, 176, 105);
    b += F('M132 105H176');
    b += R(180, 76, 260, 58, { f: 'var(--surface-3)', sk: 'var(--border)', r: 6 });
    for (i = 0; i < 7; i++) {
      b += R(190 + i * 34, 88, 26, 34, { f: i < 4 ? 'var(--accent)' : 'var(--accent-weak)' });
    }
    b += T(310, 152, 'backlog shrinks as consumers are added', { s: 10, c: 'var(--ink-dim)' });
    b += A(u, 444, 105, 492, 105, { c: 'var(--accent)', m: 'aa' });
    for (i = 0; i < 3; i++) {
      inner += '<g' + IX(i) + '>' + B(496, 44 + i * 50, 148, 40, 'consumer ' + (i + 1), { ts: 10 }) + '</g>';
    }
    b += SQ(inner);
    b += AP(u, 'M444 105C466 105 470 64 492 64', { m: 'none', c: 'var(--border)' });
    b += AP(u, 'M444 105C466 105 470 164 492 164', { m: 'none', c: 'var(--border)' });
    b += B(658, 82, 76, 42, 'at-least~once', { ts: 10, f: 'var(--surface-3)' });
    b += T(380, 202, 'a spike becomes depth in the queue instead of errors at the producer', { s: 10, c: 'var(--ink-dim)' });
    return S(214, b);
  };

  V['db-replication-sharding'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += T(24, 20, 'replication: copies for reads', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'sharding: split by key range', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 196, { d: '3 4' });
    b += CY(28, 46, 130, 58, 'primary', { ts: 11, f: 'var(--accent-weak)', tf: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += T(93, 118, 'all writes', { s: 10, c: 'var(--accent)' });
    for (i = 0; i < 2; i++) {
      b += AP(u, 'M158 76C210 76 214 ' + (74 + i * 62) + ' 236 ' + (74 + i * 62), { m: 'aa', c: 'var(--accent)' });
      b += CY(240, (74 + i * 62) - 26, 116, 52, 'replica', { ts: 10 });
    }
    b += F('M158 76C210 76 214 74 236 74M158 76C210 76 214 136 236 136');
    b += T(298, 176, 'reads fan out', { s: 10, c: 'var(--ink-dim)' });
    b += T(298, 192, 'lag: reads can be stale', { s: 10, c: 'var(--warning)', cls: 'v-blink' });
    b += B(404, 46, 122, 34, 'router', { ts: 10 });
    var ranges = ['keys a to h', 'keys i to q', 'keys r to z'];
    for (i = 0; i < 3; i++) {
      b += AP(u, 'M465 82C465 100 ' + (452 + i * 106) + ' 100 ' + (462 + i * 106) + ' 116', { m: 'none', c: 'var(--border)' });
      b += CY(404 + i * 106, 118, 96, 56, 'shard ' + (i + 1), { ts: 10 });
      b += T(452 + i * 106, 190, ranges[i], { s: 10, c: 'var(--ink-dim)' });
    }
    return S(204, b);
  };

  V['idempotency-key'] = function (u) {
    var b = D(u, 'ar ag ad');
    b += HD('idempotency key');
    b += B(24, 46, 116, 38, 'request~key k7', { ts: 10 });
    b += A(u, 142, 65, 196, 65);
    b += F('M142 65H196');
    b += B(200, 44, 122, 42, 'service');
    b += A(u, 324, 65, 380, 65, { c: 'var(--good)', m: 'ag' });
    b += CY(384, 38, 128, 54, 'write once', { ts: 10, f: 'var(--good-weak)', tf: 'var(--good-weak)', sk: 'var(--good)' });
    b += B(24, 126, 116, 38, 'retry~same key k7', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)', cls: 'v-blink' });
    b += A(u, 142, 145, 196, 145, { c: 'var(--warning)' });
    b += A(u, 261, 92, 261, 122, { m: 'none', c: 'var(--border)', d: '3 3' });
    b += B(200, 124, 122, 42, 'service');
    b += CY(384, 118, 128, 54, 'key seen', { ts: 10, f: 'var(--surface-3)' });
    b += A(u, 324, 145, 380, 145, { d: '4 4' });
    b += AP(u, 'M512 145H600', { m: 'ag', c: 'var(--good)' });
    b += B(604, 124, 128, 42, 'stored result', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += LN(430, 176, 466, 200, { c: 'var(--danger)', w: 2.4 });
    b += LN(466, 176, 430, 200, { c: 'var(--danger)', w: 2.4 });
    b += T(480, 194, 'no second write', { a: 'start', s: 10, c: 'var(--danger)' });
    b += T(140, 194, 'the key, not the payload, decides', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };

  V['rate-limiter-token-bucket'] = function (u) {
    var b = D(u, 'ar ag ad'), i, inner = '';
    b += HD('token bucket');
    b += AP(u, 'M60 46C120 46 130 74 176 74', { m: 'ar' });
    b += T(60, 40, 'refill 100 per second', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += F('M60 46C120 46 130 74 176 74', { cls: 'v-flow-slow' });
    b += R(180, 56, 130, 84, { f: 'var(--surface-3)', sk: 'var(--border)', r: 6 });
    for (i = 0; i < 6; i++) {
      inner += '<g' + IX(i) + '>' + DT(200 + (i % 3) * 38, 96 + Math.floor(i / 3) * 32, 9, { f: 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(245, 158, 'bucket of tokens', { s: 10, c: 'var(--ink-dim)' });
    b += B(24, 96, 116, 40, 'requests', { ts: 10 });
    b += A(u, 142, 116, 176, 116);
    b += AP(u, 'M312 84C360 84 372 66 420 66', { m: 'ag', c: 'var(--good)' });
    b += B(424, 46, 160, 40, 'served: token taken', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += AP(u, 'M312 116C360 116 372 146 420 146', { m: 'ad', c: 'var(--danger)', d: '4 4' });
    b += B(424, 126, 160, 40, 'rejected: 429', { ts: 10, f: 'var(--danger-weak)', sk: 'var(--danger)', cls: 'v-blink' });
    b += T(660, 66, 'burst allowed', { s: 10, c: 'var(--good)' });
    b += T(660, 146, 'above the rate', { s: 10, c: 'var(--danger)' });
    b += T(380, 190, 'the bucket size is the burst you tolerate; the refill is the sustained rate', { s: 10, c: 'var(--ink-dim)' });
    return S(202, b);
  };

  V['circuit-breaker-states'] = function (u) {
    var b = D(u, 'ar ag ad aw');
    b += HD('circuit breaker');
    b += B(50, 70, 150, 56, 'closed~calls pass through', { ts: 11, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += B(306, 70, 150, 56, 'open~fail fast, no calls', { ts: 11, f: 'var(--danger-weak)', sk: 'var(--danger)' });
    b += B(562, 70, 150, 56, 'half-open~let one probe in', { ts: 11, f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += A(u, 204, 88, 300, 88, { c: 'var(--danger)', m: 'ad' });
    b += T(252, 78, 'error rate high', { s: 10, c: 'var(--danger)' });
    b += A(u, 460, 88, 556, 88, { c: 'var(--warning)', m: 'aw' });
    b += T(508, 78, 'after a cool-off', { s: 10, c: 'var(--warning)' });
    b += AP(u, 'M636 130V178H126V130', { m: 'ag', c: 'var(--good)' });
    b += F('M636 130V178H126V130', { c: 'var(--good)' });
    b += T(380, 194, 'probe succeeds: close again', { s: 10, c: 'var(--good)' });
    b += AP(u, 'M600 130C566 148 420 148 386 130', { m: 'ad', c: 'var(--danger)', d: '4 4' });
    b += T(490, 165, 'probe fails: reopen', { s: 10, c: 'var(--danger)', cls: 'v-blink' });
    b += DT(126, 88, 5, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(380, 214, 'the breaker protects the caller, not the failing dependency', { s: 10, c: 'var(--ink-dim)' });
    return S(226, b);
  };

  V['multi-region-failover'] = function (u) {
    var b = D(u, 'ar ag ad');
    b += HD('multi-region failover');
    b += B(302, 44, 156, 40, 'global router / DNS', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M340 86C300 100 260 100 216 112', { m: 'ad', c: 'var(--danger)', d: '4 4' });
    b += AP(u, 'M420 86C460 100 500 100 546 112', { m: 'ag', c: 'var(--good)' });
    b += F('M420 86C460 100 500 100 546 112', { c: 'var(--good)' });
    b += R(40, 108, 300, 92, { f: 'var(--danger-weak)', sk: 'var(--danger)', r: 8 });
    b += T(190, 128, 'region A: unhealthy', { s: 11, c: 'var(--danger)', cls: 'v-blink' });
    b += B(60, 140, 120, 44, 'service', { ts: 10, tc: 'var(--ink-dim)' });
    b += CY(198, 138, 122, 50, 'replica', { ts: 10 });
    b += R(420, 108, 300, 92, { f: 'var(--good-weak)', sk: 'var(--good)', r: 8 });
    b += T(570, 128, 'region B: taking all traffic', { s: 11, c: 'var(--good)' });
    b += B(440, 140, 120, 44, 'service', { ts: 10 });
    b += CY(578, 138, 122, 50, 'primary', { ts: 10 });
    b += T(380, 220, 'failover is only real if the data path and the runbook are both tested', { s: 10, c: 'var(--ink-dim)' });
    return S(232, b);
  };

  V['scale-test-3x'] = function (u) {
    var b = D(u, 'ar ad'), i, inner = '';
    b += HD('scale test at three times peak');
    b += LN(70, 160, 720, 160);
    b += LN(70, 40, 70, 160);
    b += LN(70, 122, 720, 122, { c: 'var(--accent)', d: '5 4' });
    b += T(76, 116, 'expected peak', { a: 'start', s: 10, c: 'var(--accent)' });
    b += LN(70, 62, 720, 62, { c: 'var(--danger)', d: '5 4' });
    b += T(76, 56, 'p99 latency budget', { a: 'start', s: 10, c: 'var(--danger)' });
    var hs = [26, 46, 68, 92];
    for (i = 0; i < 4; i++) {
      inner += '<g' + IX(i) + '>' + R(200 + i * 120, 160 - hs[i], 80, hs[i], { f: i === 3 ? 'var(--danger-weak)' : 'var(--accent-weak)', sk: i === 3 ? 'var(--danger)' : 'var(--accent)' }) +
        T(240 + i * 120, 176, ['1x', '1.5x', '2x', '3x'][i], { s: 10, c: 'var(--ink-dim)' }) + '</g>';
    }
    b += SQ(inner);
    b += DT(600, 62, 6, { f: 'var(--danger)', cls: 'v-pulse' });
    b += T(640, 46, 'breaks here', { s: 10, c: 'var(--danger)' });
    b += T(380, 198, 'the point of the test is to find the first thing that bends, before the season does', { s: 10, c: 'var(--ink-dim)' });
    return S(210, b);
  };

  V['degrade-to-fallback'] = function (u) {
    var b = D(u, 'ar ag ad');
    b += HD('degrade to a fallback');
    b += B(24, 88, 100, 44, 'request');
    b += A(u, 126, 110, 176, 110);
    b += F('M126 110H176');
    b += B(180, 84, 110, 52, 'switch~on error or~timeout', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M292 96C340 96 350 58 398 58', { m: 'ad', c: 'var(--danger)', d: '4 4' });
    b += B(402, 38, 170, 42, 'model service', { ts: 10, f: 'var(--danger-weak)', sk: 'var(--danger)', tc: 'var(--ink-dim)', cls: 'v-blink' });
    b += LN(470, 44, 504, 74, { c: 'var(--danger)', w: 2.2 });
    b += LN(504, 44, 470, 74, { c: 'var(--danger)', w: 2.2 });
    b += AP(u, 'M292 124C340 124 350 160 398 160', { m: 'ag', c: 'var(--good)' });
    b += F('M292 124C340 124 350 160 398 160', { c: 'var(--good)' });
    b += B(402, 140, 170, 42, 'rules or cached answer', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 576, 160, 626, 160, { c: 'var(--good)', m: 'ag' });
    b += B(630, 140, 102, 42, 'response', { ts: 10 });
    b += ML(660, 104, 'worse answer,~still an answer', { ts: 10, tc: 'var(--ink-dim)', tc2: 'var(--ink-dim)' });
    b += T(380, 204, 'decide the degraded behaviour in advance, and alert on how often it fires', { s: 10, c: 'var(--ink-dim)' });
    return S(216, b);
  };

  /* -------------------------------------------------- 6. reliability and ops */

  V['canary-rollout'] = function (u) {
    var b = D(u, 'ar ag'), i, inner = '';
    b += HD('canary rollout');
    var steps = ['1%', '5%', '25%', '100%'];
    var wid = [10, 34, 96, 300];
    for (i = 0; i < 4; i++) {
      var y = 44 + i * 34;
      var g = T(96, y + 15, steps[i], { a: 'end', s: 10, c: 'var(--ink-dim)' });
      g += R(106, y, 300, 22, { f: 'var(--surface-3)' });
      g += R(106, y, wid[i], 22, { f: 'var(--accent)' });
      g += DT(438, y + 11, 6, { f: 'var(--good)' });
      g += T(452, y + 15, 'metrics gate passed', { a: 'start', s: 10, c: 'var(--good)' });
      inner += '<g' + IX(i) + '>' + g + '</g>';
    }
    b += SQ(inner);
    b += T(256, 194, 'traffic on the new version', { s: 10, c: 'var(--accent)' });
    b += T(560, 194, 'error rate, latency, business metric', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 214, 'each step is a decision point, and every step can go backwards', { s: 10, c: 'var(--ink-dim)' });
    return S(226, b);
  };

  V['blue-green-swap'] = function (u) {
    var b = D(u, 'ar ag');
    b += HD('blue-green deployment');
    b += B(24, 92, 100, 44, 'traffic');
    b += A(u, 126, 114, 176, 114);
    b += F('M126 114H176');
    b += B(180, 90, 104, 48, 'router', { ts: 11, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M286 102C340 102 350 62 400 62', { m: 'ag', c: 'var(--good)' });
    b += F('M286 102C340 102 350 62 400 62', { c: 'var(--good)' });
    b += B(404, 42, 220, 42, 'green: version n+1', { ts: 11, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += AP(u, 'M286 126C340 126 350 166 400 166', { m: 'none', c: 'var(--border)', d: '4 4' });
    b += B(404, 146, 220, 42, 'blue: version n, kept warm', { ts: 10, f: 'var(--surface-3)' });
    b += T(672, 64, 'live', { s: 10, c: 'var(--good)' });
    b += T(672, 168, 'idle', { s: 10, c: 'var(--ink-dim)' });
    b += DT(340, 114, 6, { f: 'var(--accent)', cls: 'v-pulse' });
    b += T(380, 212, 'the rollback is one router flip, because the old version is still running', { s: 10, c: 'var(--ink-dim)' });
    return S(224, b);
  };

  V['shadow-traffic'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('shadow traffic');
    b += B(24, 76, 100, 44, 'requests');
    b += A(u, 126, 98, 176, 98);
    b += F('M126 98H176');
    b += B(180, 74, 96, 48, 'mirror', { ts: 11, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 278, 88, 336, 88);
    b += B(340, 66, 170, 44, 'live model', { ts: 11 });
    b += A(u, 512, 88, 566, 88);
    b += B(570, 66, 162, 44, 'user sees this', { ts: 11, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += AP(u, 'M278 112C310 112 312 152 336 152', { m: 'aa', c: 'var(--accent)', d: '5 4' });
    b += F('M278 112C310 112 312 152 336 152', { cls: 'v-flow-slow' });
    b += B(340, 130, 170, 44, 'shadow model', { ts: 11, f: 'var(--surface-3)' });
    b += AP(u, 'M512 152H566', { m: 'none', c: 'var(--border)', d: '4 4' });
    b += B(570, 130, 162, 44, 'logged only', { ts: 11, f: 'var(--surface-3)', tc: 'var(--ink-dim)' });
    b += LN(636, 182, 668, 206, { c: 'var(--danger)', w: 2.2 });
    b += LN(668, 182, 636, 206, { c: 'var(--danger)', w: 2.2 });
    b += T(620, 202, 'no user impact', { a: 'end', s: 10, c: 'var(--danger)' });
    b += T(300, 202, 'real traffic, real load, zero blast radius', { s: 10, c: 'var(--ink-dim)' });
    return S(216, b);
  };

  V['drift-monitor'] = function (u) {
    var b = D(u, 'ar aw');
    b += HD('drift monitoring');
    b += LN(50, 150, 480, 150);
    b += AP(u, 'M70 150C120 150 130 62 190 62S250 150 300 150', { m: 'none', c: 'var(--ink-dim)', w: 1.8 });
    b += T(190, 50, 'training distribution', { s: 10, c: 'var(--ink-dim)' });
    b += AP(u, 'M240 150C290 150 300 74 360 74S420 150 470 150', { m: 'none', c: 'var(--warning)', w: 2 });
    b += T(392, 62, 'live distribution', { s: 10, c: 'var(--warning)' });
    b += A(u, 190, 162, 330, 162, { c: 'var(--warning)', m: 'aw', cls: 'v-pulse' });
    b += T(340, 166, 'shift', { a: 'start', s: 10, c: 'var(--warning)' });
    b += R(510, 52, 220, 40, { f: 'var(--surface-2)', sk: 'var(--border)', r: 6 });
    b += T(620, 76, 'PSI 0.31', { s: 12, c: 'var(--warning)' });
    b += T(620, 42, 'drift score', { s: 10, c: 'var(--ink-dim)' });
    b += LN(510, 104, 730, 104, { c: 'var(--danger)', d: '5 4' });
    b += T(620, 120, 'alert threshold 0.20', { s: 10, c: 'var(--danger)' });
    b += A(u, 620, 130, 620, 148, { c: 'var(--warning)', m: 'aw' });
    b += B(534, 150, 172, 38, 'retrain triggered', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)', cls: 'v-blink' });
    b += T(320, 192, 'input drift is a warning; falling business metrics are the real signal', { s: 10, c: 'var(--ink-dim)' });
    return S(204, b);
  };

  V['rollback-path'] = function (u) {
    var b = D(u, 'ar ag ad'), i;
    b += HD('rollback is a pointer move');
    for (i = 0; i < 4; i++) {
      b += B(60 + i * 170, 58, 140, 44, 'v' + (i + 1), { ts: 12, f: i === 3 ? 'var(--danger-weak)' : 'var(--surface-2)', sk: i === 3 ? 'var(--danger)' : 'var(--border)' });
      if (i < 3) { b += A(u, 202 + i * 170, 80, 226 + i * 170, 80); }
    }
    b += T(640, 40, 'bad release', { s: 10, c: 'var(--danger)', cls: 'v-blink' });
    b += LN(60, 122, 700, 122, { c: 'var(--border)' });
    b += AP(u, 'M640 138H300', { m: 'ag', c: 'var(--good)', w: 2 });
    b += F('M640 138H300', { c: 'var(--good)' });
    b += T(470, 158, 'traffic pointer moves back in one step', { s: 10, c: 'var(--good)' });
    b += DT(300, 122, 7, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(300, 178, 'v3 serving again', { s: 10, c: 'var(--good)' });
    b += T(380, 200, 'data migrations are the part that does not roll back; plan them forward-compatible', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };

  V['two-dashboards'] = function (u) {
    var b = D(u, 'ar'), i;
    b += T(24, 20, 'system health', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'decision quality', { a: 'start', s: 11, w: 1 });
    b += R(24, 30, 340, 160, { f: 'var(--surface-2)', sk: 'var(--border)', r: 8 });
    b += R(396, 30, 340, 160, { f: 'var(--surface-2)', sk: 'var(--border)', r: 8 });
    var sys = ['uptime 99.98%', 'p99 140 ms', 'error rate 0.02%', 'queue depth 12'];
    for (i = 0; i < 4; i++) {
      b += R(40, 46 + i * 36, 308, 28, { f: 'var(--good-weak)', sk: 'var(--good)' });
      b += T(56, 65 + i * 36, sys[i], { a: 'start', s: 10, c: 'var(--ink)' });
      b += DT(330, 60 + i * 36, 5, { f: 'var(--good)' });
    }
    var dec = ['forecast bias +9%', 'acceptance rate falling', 'SLA breaches up', 'override rate 31%'];
    var st = ['var(--warning)', 'var(--danger)', 'var(--danger)', 'var(--warning)'];
    var wk = ['var(--warning-weak)', 'var(--danger-weak)', 'var(--danger-weak)', 'var(--warning-weak)'];
    for (i = 0; i < 4; i++) {
      b += R(412, 46 + i * 36, 308, 28, { f: wk[i], sk: st[i], cls: i === 1 ? 'v-blink' : '' });
      b += T(428, 65 + i * 36, dec[i], { a: 'start', s: 10, c: 'var(--ink)' });
      b += DT(702, 60 + i * 36, 5, { f: st[i] });
    }
    b += T(380, 210, 'everything can be green and the decisions can still be getting worse', { s: 10, c: 'var(--ink-dim)' });
    return S(222, b);
  };

  V['incident-scenario-spine'] = function (u) {
    var b = D(u, 'ar aa'), i;
    var st = ['clarify', 'contain', 'diagnose', 'fix', 'prevent'];
    var sub = ['scope and impact', 'stop the bleeding', 'find the cause', 'ship the change', 'make it not recur'];
    b += HD('incident answer spine');
    b += LN(60, 96, 706, 96, { c: 'var(--border)', w: 2 });
    for (i = 0; i < 5; i++) {
      b += B(52 + i * 136, 60, 120, 44, st[i], { ts: 11, f: i === 0 ? 'var(--accent-weak)' : 'var(--surface-2)', sk: i === 0 ? 'var(--accent)' : 'var(--border)' });
      b += T(112 + i * 136, 130, sub[i], { s: 10, c: 'var(--ink-dim)' });
      if (i < 4) { b += A(u, 174 + i * 136, 82, 186 + i * 136, 82); }
    }
    b += DT(112, 150, 7, { f: 'var(--accent)', cls: 'v-move-x', st: DXS(544) });
    b += T(380, 178, 'say which step you are on before you answer; it is the structure interviewers score', { s: 10, c: 'var(--ink-dim)' });
    return S(190, b);
  };

  /* ------------------------------------------------------------------ 7. GenAI */

  V['rag-pipeline'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('retrieval-augmented generation');
    b += B(24, 46, 82, 42, 'query', { ts: 10 });
    b += A(u, 108, 67, 134, 67);
    b += B(138, 46, 82, 42, 'embed', { ts: 10 });
    b += A(u, 222, 67, 248, 67);
    b += CY(252, 40, 126, 54, 'vector index', { ts: 10 });
    b += F('M108 67H134M222 67H248');
    b += A(u, 380, 67, 406, 67, { c: 'var(--accent)', m: 'aa' });
    b += B(410, 46, 96, 42, 'top-k~chunks', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 508, 67, 534, 67);
    b += B(538, 46, 92, 42, 'prompt', { ts: 10 });
    b += A(u, 584, 90, 584, 104, { c: 'var(--accent)', m: 'aa' });
    b += B(538, 108, 92, 42, 'LLM', { ts: 11, f: 'var(--surface-3)' });
    b += A(u, 534, 129, 342, 129);
    b += F('M534 129H342', { cls: 'v-flow-slow' });
    b += B(196, 108, 140, 42, 'answer', { ts: 11 });
    b += A(u, 266, 152, 266, 164);
    b += B(150, 168, 232, 38, 'citations to the chunks', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)', cls: 'v-pulse' });
    b += T(560, 180, 'grounded on what was retrieved', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 218, 'the retrieved chunks are the evidence, and the citations are the audit trail', { s: 10, c: 'var(--ink-dim)' });
    return S(230, b);
  };

  V['vector-similarity'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += HD('nearest neighbours by cosine similarity');
    b += LN(70, 190, 420, 190);
    b += LN(70, 44, 70, 190);
    var near = [[210, 96], [246, 118], [180, 128]];
    var far = [[330, 70], [366, 150], [130, 68], [300, 172], [396, 106], [150, 172]];
    for (i = 0; i < far.length; i++) { b += DT(far[i][0], far[i][1], 4.5, { f: 'var(--ink-dim)' }); }
    var inner = '';
    for (i = 0; i < near.length; i++) {
      b += LN(70, 190, near[i][0], near[i][1], { c: 'var(--accent)', d: '3 3' });
      inner += '<g' + IX(i) + '>' + DT(near[i][0], near[i][1], 7, { f: 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += LN(70, 190, 226, 108, { c: 'var(--good)', w: 2 });
    b += DT(226, 108, 7, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(240, 96, 'query', { a: 'start', s: 10, c: 'var(--good)' });
    b += AP(u, 'M126 158A70 70 0 0 1 148 138', { m: 'none', c: 'var(--warning)', w: 2 });
    b += T(150, 168, 'small angle = similar', { a: 'start', s: 10, c: 'var(--warning)' });
    b += B(470, 60, 250, 34, 'top 3 by cosine', { ts: 11, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(470, 102, 250, 34, 'distance is direction, not size', { ts: 10, f: 'var(--surface-3)' });
    b += B(470, 144, 250, 34, 'ANN index trades recall for speed', { ts: 10, f: 'var(--surface-3)' });
    return S(206, b);
  };

  V['llm-serving-batching'] = function (u) {
    var b = D(u, 'ar aa'), i, inner = '';
    b += HD('continuous batching and the KV cache');
    b += B(24, 78, 96, 44, 'arrivals', { ts: 10 });
    b += A(u, 122, 100, 168, 100);
    b += F('M122 100H168');
    b += R(172, 46, 330, 132, { f: 'var(--surface-2)', sk: 'var(--border)', r: 8 });
    b += T(337, 40, 'KV cache slots', { s: 10, c: 'var(--ink-dim)' });
    var fill = [1, 1, 1, 0, 1, 1, 0, 0];
    for (i = 0; i < 8; i++) {
      var x = 186 + (i % 4) * 78, y = 60 + Math.floor(i / 4) * 62;
      b += R(x, y, 68, 48, { f: 'var(--surface-3)', sk: 'var(--border)' });
      if (fill[i]) {
        inner += '<g' + IX(i) + '>' + R(x + 4, y + 4, 60, 40, { f: 'var(--accent-weak)', sk: 'var(--accent)' }) + T(x + 34, y + 28, 'seq ' + (i + 1), { s: 10, c: 'var(--accent-ink)' }) + '</g>';
      } else {
        b += T(x + 34, y + 28, 'free', { s: 10, c: 'var(--ink-dim)' });
      }
    }
    b += SQ(inner);
    b += A(u, 506, 100, 552, 100, { c: 'var(--accent)', m: 'aa' });
    b += B(556, 78, 176, 44, 'one decode step~for every live sequence', { ts: 10 });
    b += T(644, 152, 'a finished sequence frees its slot', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 200, 'throughput comes from keeping slots busy; memory, not FLOPs, is usually the limit', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };

  V['guardrails-io'] = function (u) {
    var b = D(u, 'ar ag ad');
    b += HD('guardrails on both sides of the model');
    b += B(20, 78, 88, 46, 'user input', { ts: 10 });
    b += A(u, 110, 101, 146, 101);
    b += B(150, 70, 126, 62, 'input filter~PII, injection', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 278, 101, 314, 101, { c: 'var(--good)', m: 'ag' });
    b += F('M110 101H146M278 101H314', { c: 'var(--good)' });
    b += B(318, 78, 124, 46, 'model', { ts: 11, f: 'var(--surface-3)' });
    b += A(u, 444, 101, 480, 101);
    b += B(484, 70, 130, 62, 'output filter~policy, grounding', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 616, 101, 652, 101, { c: 'var(--good)', m: 'ag' });
    b += B(656, 78, 84, 46, 'response', { ts: 10 });
    b += B(150, 148, 126, 34, 'email redacted', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)', cls: 'v-blink' });
    b += A(u, 213, 146, 213, 136, { c: 'var(--warning)', m: 'none' });
    b += B(484, 148, 130, 34, 'unsafe answer blocked', { ts: 10, f: 'var(--danger-weak)', sk: 'var(--danger)', cls: 'v-blink' });
    b += A(u, 549, 146, 549, 136, { c: 'var(--danger)', m: 'none' });
    b += T(380, 202, 'log every trigger: the filters are a product surface, not just a safety net', { s: 10, c: 'var(--ink-dim)' });
    return S(214, b);
  };

  /* -------------------------------------------------------- 8. interview and meta */

  V['craft-demo-clock'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += HD('a 60 minute craft demo');
    var segs = [['intro', 100, 'var(--surface-3)'], ['case study', 380, 'var(--accent)'], ['their questions', 180, 'var(--accent-weak)']];
    var x = 60;
    for (i = 0; i < segs.length; i++) {
      b += R(x, 60, segs[i][1], 46, { f: segs[i][2], sk: 'var(--border)' });
      b += T(x + segs[i][1] / 2, 88, segs[i][0], { s: 11, c: i === 1 ? 'var(--accent-ink)' : 'var(--ink)' });
      x += segs[i][1];
    }
    b += LN(60, 116, 720, 116);
    for (i = 0; i <= 6; i++) {
      b += LN(60 + i * 110, 116, 60 + i * 110, 122);
      b += T(60 + i * 110, 136, (i * 10) + '', { s: 10, c: 'var(--ink-dim)' });
    }
    b += R(66, 50, 4, 68, { f: 'var(--danger)', cls: 'v-move-x', st: DXS(640) });
    b += T(380, 162, 'minutes', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 182, 'the case study is most of the hour: one problem, end to end, with numbers', { s: 10, c: 'var(--ink-dim)' });
    return S(194, b);
  };

  V['hlding-boxes'] = function (u) {
    var b = D(u, 'ar'), i, inner = '';
    b += HD('a high-level design, drawn in order');
    b += R(24, 32, 712, 130, { f: 'var(--surface)', sk: 'var(--border)', r: 8, sw: 1 });
    var nodes = [['client', 40, 76], ['load balancer', 160, 76], ['services', 306, 76], ['cache', 452, 44], ['database', 452, 108], ['queue', 598, 76]];
    for (i = 0; i < nodes.length; i++) {
      var g = B(nodes[i][1], nodes[i][2], 108, 42, nodes[i][0], { ts: 10 });
      if (i > 0 && i < 3) { g += A(u, nodes[i][1] - 12, nodes[i][2] + 21, nodes[i][1] - 2, nodes[i][2] + 21); }
      if (i === 3) { g += A(u, 416, 88, 448, 68); }
      if (i === 4) { g += A(u, 416, 100, 448, 126); }
      if (i === 5) { g += A(u, 562, 129, 594, 100); }
      inner += '<g' + IX(i) + '>' + g + '</g>';
    }
    b += SQ(inner);
    b += T(380, 182, 'entry point, then the work, then state, then the async path', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 200, 'name the bottleneck before you add a box', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };

  V['gcp-aws-mapping'] = function (u) {
    var b = D(u, 'ar'), i, inner = '';
    b += T(150, 22, 'GCP', { s: 12, w: 1 });
    b += T(610, 22, 'AWS', { s: 12, w: 1 });
    var g = ['GKE', 'BigQuery', 'Pub/Sub', 'Vertex AI', 'Cloud Run'];
    var a = ['EKS', 'Redshift', 'SNS + SQS', 'SageMaker', 'Fargate'];
    for (i = 0; i < 5; i++) {
      var y = 36 + i * 32;
      b += B(60, y, 180, 26, g[i], { ts: 10 });
      b += B(520, y, 180, 26, a[i], { ts: 10 });
      inner += '<g' + IX(i) + '>' + LN(244, y + 13, 516, y + 13, { c: 'var(--accent)', w: 1.8 }) + DT(380, y + 13, 4, { f: 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(380, 216, 'the mapping is close enough to talk with, and never exact in the details', { s: 10, c: 'var(--ink-dim)' });
    return S(228, b);
  };

  V['api-performance-tricks'] = function (u) {
    var b = D(u, 'ar'), i, inner = '';
    b += HD('seven API performance levers');
    var items = ['caching', 'connection pool', 'avoid N+1', 'pagination', 'faster JSON', 'compress payload', 'async logging'];
    for (i = 0; i < 7; i++) {
      var x = 24 + (i % 4) * 182, y = 40 + Math.floor(i / 4) * 76;
      inner += '<g' + IX(i) + '>' + B(x, y, 168, 60, items[i], { ts: 11, f: 'var(--accent-weak)', sk: 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += B(570, 116, 168, 60, 'measure first', { ts: 11, f: 'var(--surface-3)', cls: 'v-pulse' });
    b += T(380, 200, 'each one moves a different bottleneck; applying all seven blindly moves none', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };

  V['n-plus-one'] = function (u) {
    var b = D(u, 'ar ad ag'), i, inner = '';
    b += T(24, 20, 'N + 1 queries', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'one joined query', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 200, { d: '3 4' });
    b += B(24, 96, 92, 40, 'handler', { ts: 10 });
    b += A(u, 118, 116, 156, 116, { c: 'var(--danger)', m: 'ad' });
    b += B(160, 96, 92, 40, 'list query', { ts: 10 });
    for (i = 0; i < 5; i++) {
      inner += '<g' + IX(i) + '>' + AP(u, 'M254 116C282 116 286 ' + (48 + i * 30) + ' 302 ' + (48 + i * 30), { m: 'ad', c: 'var(--danger)' }) +
        R(306, (48 + i * 30) - 11, 60, 22, { f: 'var(--danger-weak)', sk: 'var(--danger)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(336, 194, 'one round trip per row', { s: 10, c: 'var(--danger)' });
    b += B(404, 96, 92, 40, 'handler', { ts: 10 });
    b += A(u, 498, 116, 540, 116, { c: 'var(--good)', m: 'ag' });
    b += F('M498 116H540', { c: 'var(--good)' });
    b += B(544, 96, 108, 40, 'join', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 654, 116, 686, 116, { c: 'var(--good)', m: 'ag' });
    b += CY(688, 90, 48, 52, 'DB', { ts: 10 });
    b += T(560, 168, 'one round trip', { s: 10, c: 'var(--good)' });
    b += T(560, 186, 'the work moves to the database, which is built for it', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };

  V['connection-pool'] = function (u) {
    var b = D(u, 'ar aa aw'), i;
    b += HD('connection pool');
    for (i = 0; i < 5; i++) {
      b += B(24, 40 + i * 34, 96, 26, 'client ' + (i + 1), { ts: 10, r: 13 });
      b += AP(u, 'M122 ' + (53 + i * 34) + 'C170 ' + (53 + i * 34) + ' 180 108 220 108', { m: 'none', c: 'var(--border)' });
    }
    b += F('M122 53C170 53 180 108 220 108M122 155C170 155 180 108 220 108');
    b += R(224, 62, 150, 92, { f: 'var(--surface-3)', sk: 'var(--border)', r: 6 });
    b += T(299, 56, 'pool of 4', { s: 10, c: 'var(--ink-dim)' });
    for (i = 0; i < 4; i++) {
      b += R(238 + (i % 2) * 66, 76 + Math.floor(i / 2) * 42, 56, 30, { f: i < 3 ? 'var(--accent)' : 'var(--surface-2)', sk: 'var(--border)' });
    }
    b += T(299, 174, '3 busy, 1 free', { s: 10, c: 'var(--ink-dim)' });
    b += A(u, 376, 108, 428, 108, { c: 'var(--accent)', m: 'aa' });
    b += CY(432, 80, 128, 56, 'database', { ts: 10 });
    b += B(586, 46, 150, 40, 'no TCP or TLS~handshake per call', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += B(586, 130, 150, 40, 'waiters queue~when all are busy', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)', cls: 'v-blink' });
    b += T(380, 200, 'the pool size caps concurrency at the database, which is usually the point', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };

  V['pagination-cursor'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += HD('cursor pagination');
    for (i = 0; i < 18; i++) {
      b += R(60 + i * 37, 60, 30, 44, { f: 'var(--surface-2)', sk: 'var(--border)' });
    }
    b += T(390, 124, 'ordered result set', { s: 10, c: 'var(--ink-dim)' });
    b += R(56, 52, 190, 60, { f: 'var(--accent-weak)', sk: 'var(--accent)', cls: 'v-move-x', st: DXS(440) });
    b += T(150, 44, 'page window', { s: 10, c: 'var(--accent)' });
    b += B(60, 146, 190, 40, 'cursor: last id seen', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 254, 166, 296, 166, { c: 'var(--accent)', m: 'aa' });
    b += B(300, 146, 200, 40, 'next page starts after it', { ts: 10 });
    b += B(520, 146, 216, 40, 'stable under inserts', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += T(380, 206, 'offset pagination re-reads and skips rows, and shifts when the data changes', { s: 10, c: 'var(--ink-dim)' });
    return S(218, b);
  };

  V['async-logging'] = function (u) {
    var b = D(u, 'ar aa'), i, inner = '';
    b += HD('async logging');
    b += B(24, 84, 110, 46, 'request~thread', { ts: 10 });
    b += A(u, 136, 107, 180, 107, { c: 'var(--accent)', m: 'aa' });
    b += F('M136 107H180');
    b += R(184, 78, 190, 58, { f: 'var(--surface-3)', sk: 'var(--border)', r: 6 });
    b += T(279, 70, 'in-memory ring buffer', { s: 10, c: 'var(--ink-dim)' });
    for (i = 0; i < 6; i++) {
      inner += '<g' + IX(i) + '>' + R(194 + i * 30, 90, 22, 34, { f: 'var(--accent-weak)', sk: 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(279, 156, 'the request returns immediately', { s: 10, c: 'var(--good)' });
    b += AP(u, 'M376 107H452', { m: 'ar', d: '5 4' });
    b += T(414, 96, 'flush', { s: 10, c: 'var(--ink-dim)' });
    b += B(456, 84, 122, 46, 'writer~background', { ts: 10 });
    b += A(u, 580, 107, 616, 107);
    b += CY(620, 80, 116, 54, 'log sink', { ts: 10 });
    b += F('M376 107H452', { cls: 'v-flow-slow' });
    b += B(456, 148, 280, 34, 'a full buffer drops lines, by design', { ts: 10, f: 'var(--warning-weak)', sk: 'var(--warning)', cls: 'v-blink' });
    b += T(380, 202, 'logging stops being on the request path, at the cost of losing the newest lines on a crash', { s: 10, c: 'var(--ink-dim)' });
    return S(214, b);
  };

  /* ------------------------------------------------------------------ captions */

  var C = {
    'flow-forecast-optimize-act': 'A decision system is a <b>loop</b>: forecast what happens, optimize what to do, act, then feed the observed outcome back into the next forecast.',
    'closed-loop': 'A controller only works when the <b>measured output</b> is fed back and turned into an error that changes the next action.',
    'open-vs-closed-loop': 'Without measurement, error accumulates silently; with a feedback path the same plan stays <b>bounded</b>.',
    'receding-horizon': 'Plan over a long horizon but <b>commit only the first slot</b>, then re-plan as new information lands.',
    'mdp-loop': 'In an MDP the agent picks an action, the environment returns the next state, and the <b>reward can arrive many steps later</b>.',
    'bandit-vs-rl': 'A bandit is one decision with fast feedback; RL is a <b>chain of states</b> where credit has to be assigned backwards.',
    'assignment-matrix': 'Assignment picks one owner per item subject to <b>per-owner capacity</b> — a constraint problem, not a ranking problem.',
    'vrp-routes': 'Vehicle routing builds a route per vehicle so that every stop is visited inside its <b>time window</b>.',
    'exact-vs-metaheuristic-landscape': 'An exact solver gives a <b>proven bound</b>; a metaheuristic wanders out of local dips and gives a good answer quickly.',
    'simulated-annealing-temperature': 'Annealing accepts worse moves while it is hot, then <b>cools</b> until only improvements are taken.',
    'hard-vs-soft-constraint': 'A hard constraint is a wall no solution may cross; a soft constraint is a <b>price</b> the objective pays for crossing it.',
    'optimality-gap': 'The honest quality claim is the <b>gap</b> between the best solution found and the proven bound, not the objective value alone.',
    'quantile-band-forecast': 'A quantile forecast gives p10 / p50 / p90, and the band <b>widens with the horizon</b> — plan against the range.',
    'ci-vs-pi-band': 'A confidence band covers the <b>mean response</b>; a prediction band covers the <b>next single observation</b> and is always wider.',
    'jackknife-refits': 'Refitting with one observation left out at a time shows how much a <b>single point</b> moves the forecast.',
    'rolling-origin-backtest': 'A rolling-origin backtest moves the cut forward fold by fold, so the model is never scored on data it could have seen.',
    'coverage-vs-width': 'An interval is only useful if it is both <b>calibrated</b> (covers at the stated rate) and narrow enough to act on.',
    'driver-regression-fit': 'A driver model is judged by its <b>residuals</b>: what the drivers fail to explain is where the next feature lives.',
    'ml-lifecycle': 'Data, features, training, registry, deploy, serve, monitor — the <b>monitoring arc back to features</b> is what makes it a system.',
    'feature-store-two-stores': 'One feature definition is materialised twice: an <b>online store</b> for request-time lookups and an <b>offline store</b> for training.',
    'point-in-time-join': 'Every feature must be joined <b>as of the decision time</b>; anything from after t0 is leakage that inflates offline scores.',
    'training-serving-skew': 'When training and serving compute the same feature by different code paths, the values drift — a <b>parity check</b> on live traffic catches it.',
    'label-latency': 'When labels arrive weeks after the event, today cannot be scored yet; use <b>leading proxies</b> while the real labels mature.',
    'data-contract-validation': 'A data contract is a gate: conforming rows pass, and a bad row <b>bounces back to the producer</b> instead of poisoning the store.',
    'gitops-loop': 'In GitOps the repository is the desired state and a controller continuously <b>reconciles</b> the cluster back to it.',
    'latency-budget-bar': 'A latency budget is spent by every hop; the model is one slice, and the <b>headroom</b> is what absorbs a bad day.',
    'load-balancer-replicas': 'Health checks let the load balancer <b>drain</b> an unhealthy replica and move its share to the others.',
    'autoscaling-queue': 'When work is queued, scale on <b>backlog depth</b> rather than CPU, and expect a lag before the new replicas help.',
    'request-batching': 'Batching many small requests into one forward pass raises utilisation, paying the <b>batching window</b> in latency.',
    'caching-read-through': 'In a read-through cache the cache itself loads a missing key, so callers never learn the loading path.',
    'caching-write-through': 'Write-through acks only after both stores are written; write-back acks early and <b>risks the buffer</b> to be fast.',
    'cache-invalidation-ttl': 'A TTL trades freshness for load; explicit invalidation is the sharper tool when the source of truth changes.',
    'cdn-edge': 'CDN edges serve most bytes near the user, so the <b>origin only sees misses</b>.',
    'message-queue-async': 'A queue turns a traffic spike into <b>depth</b> instead of errors, and consumers can be scaled independently of the producer.',
    'db-replication-sharding': 'Replication adds read copies at the cost of <b>lag</b>; sharding splits the key space to add write capacity.',
    'idempotency-key': 'An idempotency key lets a retry return the <b>stored result</b> instead of writing twice.',
    'rate-limiter-token-bucket': 'A token bucket allows a burst equal to the bucket size while holding the <b>sustained rate</b> at the refill rate.',
    'circuit-breaker-states': 'A breaker goes closed to open on errors, half-open after a cool-off, and back to closed only if the probe succeeds — it protects the <b>caller</b>.',
    'multi-region-failover': 'Failover only exists if the router, the data path, and the runbook have all been <b>exercised</b> together.',
    'scale-test-3x': 'Testing at three times expected peak finds the first component that bends, before the season does.',
    'degrade-to-fallback': 'Decide the degraded answer in advance — rules or a cached result — and <b>alert on how often it fires</b>.',
    'canary-rollout': 'A canary raises traffic in steps with a <b>metrics gate</b> at each one, and every step can be reversed.',
    'blue-green-swap': 'Two full environments make the rollback a single router flip, because the previous version is still running.',
    'shadow-traffic': 'Shadow traffic exercises a new model on real load with <b>zero blast radius</b>, because its output is only logged.',
    'drift-monitor': 'Input drift is an early warning; the decision to retrain should still be anchored on the <b>business metric</b>.',
    'rollback-path': 'A rollback is a pointer move — except for data migrations, which is why they must be written forward-compatible.',
    'two-dashboards': 'System health and <b>decision quality</b> are two different dashboards; everything can be green while the decisions get worse.',
    'incident-scenario-spine': 'Clarify, contain, diagnose, fix, prevent — naming the step you are on is the structure interviewers actually score.',
    'rag-pipeline': 'RAG grounds the model on retrieved chunks, and the <b>citations</b> are the audit trail back to the source.',
    'vector-similarity': 'Cosine similarity ranks by <b>direction, not magnitude</b>; an approximate index trades a little recall for a lot of speed.',
    'llm-serving-batching': 'Continuous batching keeps <b>KV-cache slots</b> busy and frees each one the moment its sequence finishes; memory is usually the limit.',
    'guardrails-io': 'Guardrails sit on both sides of the model — input filtering and output policy — and every trigger should be logged.',
    'craft-demo-clock': 'A craft demo is mostly one case study end to end, with a short intro and real time reserved for <b>their questions</b>.',
    'hlding-boxes': 'A high-level design is drawn in order: entry point, then the work, then state, then the async path — and each box needs a reason.',
    'gcp-aws-mapping': 'Managed services map roughly across clouds; the mapping is good enough to talk with and never exact in the details.',
    'api-performance-tricks': 'Caching, pooling, avoiding N+1, pagination, faster serialization, compression, async logging — each moves a <b>different</b> bottleneck.',
    'n-plus-one': 'N+1 pays a round trip per row; one join moves the work to the database, which is built for it.',
    'connection-pool': 'A connection pool removes the handshake per call and <b>caps concurrency</b> at the database, which is usually the point.',
    'pagination-cursor': 'Cursor pagination continues from the last id seen, so it stays <b>stable</b> when rows are inserted mid-scan.',
    'async-logging': 'Async logging takes the write off the request path, at the cost of losing the newest buffered lines on a crash.'
  };

  root.VIZLIB = V;
  root.VIZLIB_CAPTIONS = C;

}(typeof window !== 'undefined' ? window : this));
