/* sd-foundations diagrams: requirements/capacity planning and APIs/load balancing/communication. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  V['capacity-estimate'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('back-of-envelope: from users to bytes', 'photo-sharing example');
    b += B(14, 66, 130, 50, 'DAU~10,000,000');
    b += A(u, 148, 91, 198, 91, { c: 'var(--accent)', m: 'aa' });
    b += F('M148 91H198');
    b += T(173, 78, 'x actions/day', { s: 10, c: 'var(--ink-dim)' });
    b += B(202, 66, 130, 50, 'avg QPS~230 req/s');
    b += A(u, 336, 91, 386, 91, { c: 'var(--accent)', m: 'aa' });
    b += F('M336 91H386');
    b += T(361, 78, 'x peak factor', { s: 10, c: 'var(--ink-dim)' });
    b += B(390, 66, 130, 50, 'peak QPS~2,300 req/s', { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 524, 91, 574, 91, { c: 'var(--accent)', m: 'aa' });
    b += F('M524 91H574');
    b += T(549, 78, 'x bytes/item', { s: 10, c: 'var(--ink-dim)' });
    b += B(578, 66, 168, 50, 'peak bandwidth~4.6 GB/s', { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += T(380, 148, 'the same three steps size storage: swap bandwidth for bytes x retention', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 168, 'always say the assumption out loud before the arithmetic', { s: 10, c: 'var(--ink-dim)' });
    return S(188, b);
  };
  C['capacity-estimate'] = 'Turn a user count into <b>QPS, storage and bandwidth</b> with the same three multiplications, stated out loud.';

  V['scale-up-vs-out'] = function (u) {
    var b = D(u, 'ar aa'), i, inner = '';
    b += T(24, 20, 'vertical: make one machine bigger', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'horizontal: add more machines', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 182, { d: '3 4' });
    b += B(110, 46, 170, 100, '', { f: 'var(--surface)', sk: 'var(--warning)' });
    b += T(195, 40, 'one machine, a hard ceiling', { s: 10, c: 'var(--warning)' });
    b += GROW(B(148, 74, 94, 48, 'server~bigger CPU/RAM', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' }));
    b += T(195, 162, 'cost rises faster than capacity near the ceiling', { s: 10, c: 'var(--ink-dim)' });
    for (i = 0; i < 4; i++) {
      inner += '<g' + IX(i) + '>' + B(404 + i * 84, 84, 70, 44, 'node ' + (i + 1), { ts: 10, f: i < 2 ? 'var(--surface-2)' : 'var(--accent-weak)', sk: i < 2 ? 'var(--border)' : 'var(--accent)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(576, 62, 'add another, and another', { s: 10, c: 'var(--accent)' });
    b += T(576, 162, 'near-linear cost; coordination cost appears instead', { s: 10, c: 'var(--ink-dim)' });
    return S(190, b);
  };
  C['scale-up-vs-out'] = 'Vertical scaling grows <b>one machine</b> until it hits a ceiling; horizontal scaling adds machines and trades that ceiling for coordination.';

  V['monolith-vs-microservices'] = function (u) {
    var b = D(u, 'ar aa');
    b += T(24, 20, 'monolith: one deployable', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'microservices: several deployables', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 196, { d: '3 4' });
    b += B(40, 44, 300, 108, 'auth~orders~payments~inventory', { ts: 11 });
    b += A(u, 190, 152, 190, 172);
    b += B(60, 176, 260, 30, 'ship as one unit', { ts: 10, f: 'var(--surface-3)' });
    b += B(412, 44, 110, 50, 'auth', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(552, 44, 110, 50, 'orders', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(412, 128, 110, 50, 'payments', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(552, 128, 110, 50, 'inventory', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M522 69H552', { m: 'aa', c: 'var(--accent)' });
    b += F('M522 69H552');
    b += T(537, 60, 'call', { s: 9, c: 'var(--ink-dim)' });
    b += AP(u, 'M567 94L467 128', { m: 'aa', c: 'var(--accent)', d: '4 4' });
    b += F('M567 94L467 128');
    b += T(380, 200, 'each call across services crosses the network and can fail on its own', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };
  C['monolith-vs-microservices'] = 'Splitting a monolith turns an in-process call into a <b>network call</b> that can fail, retry and add latency on its own.';

  V['l4-vs-l7-lb'] = function (u) {
    var b = D(u, 'ar aa');
    b += T(24, 20, 'layer 4: forwards packets', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'layer 7: reads the request', { a: 'start', s: 11, w: 1 });
    b += LN(384, 32, 384, 190, { d: '3 4' });
    b += B(24, 80, 96, 44, 'client');
    b += A(u, 120, 102, 160, 102);
    b += F('M120 102H160');
    b += B(164, 80, 96, 44, 'L4 LB', { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 260, 102, 306, 102, { c: 'var(--accent)', m: 'aa' });
    b += B(310, 80, 90, 44, 'replica');
    b += T(212, 148, 'sees only IP and port', { s: 10, c: 'var(--ink-dim)' });
    b += T(212, 166, 'fast; cannot read the request', { s: 10, c: 'var(--ink-dim)' });
    b += B(404, 80, 90, 44, 'client');
    b += A(u, 498, 102, 538, 102);
    b += B(542, 66, 110, 58, 'L7 LB~reads path, header', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M654 80C690 80 690 44 700 32', { m: 'aa', c: 'var(--accent)' });
    b += F('M654 80C690 80 690 44 700 32');
    b += B(654, 4, 96, 28, '/api -> A', { ts: 9 });
    b += AP(u, 'M654 124C690 124 690 158 700 168', { m: 'aa', c: 'var(--accent)' });
    b += B(654, 160, 96, 28, '/img -> B', { ts: 9 });
    b += T(596, 148, 'can route, retry, terminate TLS', { s: 10, c: 'var(--ink-dim)' });
    b += T(596, 166, 'costs more CPU per request', { s: 10, c: 'var(--ink-dim)' });
    return S(198, b);
  };
  C['l4-vs-l7-lb'] = 'A layer 4 balancer only sees packets; a layer 7 balancer <b>reads the request</b> and can route, retry or terminate TLS at a CPU cost.';

  V['retry-backoff-jitter'] = function (u) {
    var b = D(u, 'ar ad ag'), i, xs = [60, 96, 168, 312, 600], inner = '';
    b += HD('retries with exponential backoff and jitter', 'shaded band = jitter window');
    b += LN(40, 150, 720, 150);
    for (i = 0; i < xs.length; i++) {
      var ok = i === xs.length - 1;
      if (i > 0) {
        b += R(xs[i] - 20, 128, 40, 22, { f: 'var(--warning-weak)' });
        b += AP(u, 'M' + xs[i - 1] + ' 150C' + ((xs[i - 1] + xs[i]) / 2) + ' 110 ' + ((xs[i - 1] + xs[i]) / 2) + ' 110 ' + xs[i] + ' 150', { c: 'var(--ink-dim)', d: '3 4', m: 'none' });
      }
      inner += '<g' + IX(i) + '>' + DT(xs[i], 150, 8, { f: ok ? 'var(--good)' : 'var(--danger)', cls: ok ? 'v-pulse' : 'v-blink' }) + '</g>';
    }
    b += SQ(inner);
    b += T(60, 172, 'try 1', { s: 10, c: 'var(--danger)' });
    b += T(78, 190, 'wait x2', { s: 9, c: 'var(--ink-dim)' });
    b += T(132, 190, 'wait x2', { s: 9, c: 'var(--ink-dim)' });
    b += T(240, 190, 'wait x2', { s: 9, c: 'var(--ink-dim)' });
    b += T(456, 190, 'wait x2', { s: 9, c: 'var(--ink-dim)' });
    b += T(600, 172, 'success', { s: 10, c: 'var(--good)' });
    b += T(380, 210, 'jitter stops many clients from retrying at exactly the same moment', { s: 10, c: 'var(--ink-dim)' });
    return S(222, b);
  };
  C['retry-backoff-jitter'] = 'Backoff doubles the wait after each failure; <b>jitter</b> spreads the exact retry time so clients do not retry in lockstep.';

  V['backpressure'] = function (u) {
    var b = D(u, 'ar aa ad aw');
    b += HD('backpressure: push back before the queue overflows');
    b += B(20, 66, 108, 46, 'producer~200 req/s');
    b += A(u, 128, 82, 176, 82);
    b += F('M128 82H176');
    b += AP(u, 'M176 104H128', { m: 'ad', c: 'var(--danger)', d: '4 4', cls: 'v-blink' });
    b += T(152, 118, 'slow down / 429', { s: 9, c: 'var(--danger)' });
    b += R(180, 46, 220, 92, { f: 'var(--surface-3)', sk: 'var(--border)' });
    b += R(180, 60, 220, 78, { f: 'var(--warning)' });
    b += T(290, 40, 'bounded queue', { s: 10, c: 'var(--ink-dim)' });
    b += T(290, 150, 'near capacity', { s: 10, c: 'var(--warning)' });
    b += A(u, 400, 82, 448, 82, { c: 'var(--accent)', m: 'aa' });
    b += F('M400 82H448');
    b += B(452, 66, 108, 46, 'consumer~50 req/s');
    b += R(560, 174, 160, 10, { f: 'var(--danger-weak)' });
    b += GROW(R(560, 174, 20, 10, { f: 'var(--danger)' }));
    b += T(640, 194, 'unbounded instead: no signal, latency grows silently', { s: 9, c: 'var(--ink-dim)' });
    b += T(380, 210, 'reject or slow the producer before the queue runs unbounded', { s: 10, c: 'var(--ink-dim)' });
    return S(220, b);
  };
  C['backpressure'] = 'A bounded queue tells the producer to <b>slow down or accept a rejection</b> instead of growing without limit.';

  V['tail-latency-hedge'] = function (u) {
    var b = D(u, 'ar ag');
    b += HD('tail latency and hedged requests');
    b += LN(40, 92, 720, 92);
    b += PL('40,88 140,40 220,58 320,74 420,84 520,89 620,91 720,92', { c: 'var(--accent)', w: 1.8 });
    b += LN(140, 30, 140, 92, { c: 'var(--ink-dim)', d: '3 4' });
    b += T(140, 24, 'p50', { s: 10, c: 'var(--ink-dim)' });
    b += LN(620, 30, 620, 92, { c: 'var(--danger)', d: '3 4' });
    b += T(620, 24, 'p99', { s: 10, c: 'var(--danger)' });
    b += R(60, 122, 560, 20, { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += T(30, 136, 'A', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += R(340, 122, 280, 20, { f: 'var(--surface-3)', sk: 'var(--border)' });
    b += T(200, 116, 'original request to replica A', { s: 9, c: 'var(--ink-dim)' });
    b += R(140, 154, 140, 20, { f: 'var(--good-weak)', sk: 'var(--good)' });
    b += T(30, 168, 'B', { a: 'end', s: 10, c: 'var(--ink-dim)' });
    b += T(210, 148, 'hedge to replica B, sent after the p50 wait', { s: 9, c: 'var(--ink-dim)' });
    b += LN(280, 108, 280, 182, { c: 'var(--good)', w: 2 });
    b += DT(280, 108, 5, { f: 'var(--good)', cls: 'v-pulse' });
    b += T(280, 200, 'first response wins; the slower one is cancelled', { s: 10, c: 'var(--good)' });
    return S(216, b);
  };
  C['tail-latency-hedge'] = 'A hedged request starts a second try after the typical wait; the <b>first response back</b> wins and the other is dropped.';

}(typeof window !== 'undefined' ? window : this));
