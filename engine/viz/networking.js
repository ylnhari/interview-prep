/* networking diagrams: the layer stack, the TCP handshake, HTTP versions, a DNS lookup, and where a round trip goes. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  /* ---------------------------------------------------------- the whole stack */

  V['network-layers'] = function (u) {
    var b = D(u, 'ar aa'), i, y, on;
    var rows = [
      ['7', 'application', 'the message itself - an HTTP request, its method, path and headers', 1],
      ['6', 'presentation', 'how bytes encode the message - character sets, compression, TLS', 0],
      ['5', 'session', 'keeping one conversation open across several exchanges', 0],
      ['4', 'transport', 'an address and a port - a connection (TCP) or a datagram (UDP)', 1],
      ['3', 'network', 'moving packets between IP addresses, router hop by router hop', 1],
      ['2', 'data link', 'one hop over one link - an Ethernet frame, a hardware address', 0],
      ['1', 'physical', 'the signal itself - copper, fibre or radio', 0]
    ];
    b += T(30, 20, 'the seven-layer reference model', { a: 'start', s: 12, w: 1 });
    b += T(576, 20, 'what is really implemented', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += A(u, 18, 34, 18, 206, { c: 'var(--accent)', m: 'aa' });
    b += F('M18 34V206');
    for (i = 0; i < 7; i++) {
      y = 32 + i * 26;
      on = rows[i][3];
      b += B(30, y, 24, 24, rows[i][0], { ts: 11, tw: 1, f: on ? 'var(--accent)' : 'var(--surface-3)', sk: on ? 'var(--accent)' : 'var(--border)', tc: on ? 'var(--accent-ink)' : 'var(--ink-dim)' });
      b += B(58, y, 104, 24, rows[i][1], { ts: 10, f: on ? 'var(--accent-weak)' : 'var(--surface-2)', sk: on ? 'var(--accent)' : 'var(--border)' });
      if (on) { b += DT(167, y + 12, 3, { cls: 'v-pulse' }); }
      b += T(176, y + 16, rows[i][2], { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    }
    b += LN(566, 28, 566, 214, { d: '3 4' });
    b += B(576, 32, 170, 76, 'application~HTTP, gRPC, your API', { ts: 10 });
    b += B(576, 110, 170, 24, 'transport - TCP, UDP', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(576, 136, 170, 24, 'internet - IP', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(576, 162, 170, 50, 'link~Ethernet, Wi-Fi, fibre', { ts: 10 });
    b += T(380, 228, 'a message is wrapped on the way down and unwrapped on the way up; in conversation engineers name only layers 3, 4 and 7', { s: 10, c: 'var(--ink-dim)' });
    return S(232, b);
  };
  C['network-layers'] = 'Seven layers in the reference model, four in what anyone actually builds. Each layer uses the one below and <b>hides its detail</b>, and only layers 3, 4 and 7 get named out loud.';

  /* ---------------------------------------------------------- TCP handshake */

  V['tcp-handshake'] = function (u) {
    var b = D(u, 'ar aa'), i, yy, inner = '';
    var bars = [['TCP alone', 1], ['TCP + TLS 1.3', 2], ['TCP + TLS 1.2', 3], ['QUIC, new', 1], ['QUIC, resumed', 0]];
    b += T(24, 20, 'the handshake before the first byte of data', { a: 'start', s: 12, w: 1 });
    b += B(40, 30, 100, 26, 'client', { ts: 10 });
    b += B(330, 30, 100, 26, 'server', { ts: 10 });
    b += LN(90, 58, 90, 176, { d: '3 4' });
    b += LN(380, 58, 380, 176, { d: '3 4' });
    b += T(235, 74, 'SYN - please open a connection', { s: 9.5, c: 'var(--ink-dim)' });
    b += A(u, 90, 80, 376, 80);
    b += F('M90 80H376');
    b += T(235, 102, 'SYN-ACK - agreed', { s: 9.5, c: 'var(--ink-dim)' });
    b += A(u, 380, 108, 94, 108);
    b += F('M380 108H94');
    b += T(235, 130, 'ACK, and now the request', { s: 9.5, c: 'var(--accent)' });
    b += A(u, 90, 136, 376, 136, { c: 'var(--accent)', m: 'aa' });
    b += F('M90 136H376');
    b += T(235, 158, 'the first byte of the answer', { s: 9.5, c: 'var(--accent)' });
    b += A(u, 380, 164, 94, 164, { c: 'var(--accent)', m: 'aa' });
    b += F('M380 164H94');
    b += LN(26, 80, 26, 136, { c: 'var(--warning)', w: 2, cls: 'v-pulse' });
    b += LN(26, 80, 34, 80, { c: 'var(--warning)', w: 2 });
    b += LN(26, 136, 34, 136, { c: 'var(--warning)', w: 2 });
    b += T(235, 196, 'one whole round trip is spent before the request even leaves', { s: 10, c: 'var(--warning)' });
    b += LN(486, 28, 486, 208, { d: '3 4' });
    b += T(502, 20, 'round trips before your data moves', { a: 'start', s: 11, w: 1 });
    for (i = 0; i < bars.length; i++) {
      yy = 46 + i * 30;
      inner += '<g' + IX(i) + '>'
        + T(502, yy + 12, bars[i][0], { a: 'start', s: 9.5, c: 'var(--ink-dim)' })
        + (bars[i][1] ? R(630, yy, bars[i][1] * 34, 16, { f: 'var(--accent-weak)', sk: 'var(--accent)' }) : R(630, yy, 5, 16, { f: 'var(--good)', sk: 'var(--good)' }))
        + T(bars[i][1] ? 636 + bars[i][1] * 34 : 645, yy + 13, String(bars[i][1]), { a: 'start', s: 10, w: 1 })
        + '</g>';
    }
    b += SQ(inner);
    b += T(502, 202, 'a round trip New York to London is about 56 ms', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    return S(216, b);
  };
  C['tcp-handshake'] = 'TCP spends <b>one full round trip</b> before the request is even sent; TLS adds another, and QUIC folds the two into one.';

  /* ---------------------------------------------------------- HTTP versions */

  V['http-versions'] = function (u) {
    var b = D(u, 'ar aa'), i, j, y;
    b += T(24, 18, 'HTTP/1.1', { a: 'start', s: 11, w: 1 });
    b += T(272, 18, 'HTTP/2', { a: 'start', s: 11, w: 1 });
    b += T(520, 18, 'HTTP/3 over QUIC', { a: 'start', s: 11, w: 1 });
    b += T(24, 34, 'one request at a time', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += T(272, 34, 'three streams, one TCP connection', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += T(520, 34, 'three streams, over UDP', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += LN(256, 26, 256, 188, { d: '3 4' });
    b += LN(504, 26, 504, 188, { d: '3 4' });

    b += LN(24, 100, 244, 100, { d: '2 3' });
    b += B(24, 88, 52, 22, 'req 1', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(80, 88, 96, 22, 'req 2 (slow)', { ts: 9, f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += B(180, 88, 52, 22, 'req 3', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 24, 122, 228, 122, { c: 'var(--accent)', m: 'aa' });
    b += F('M24 122H228', { c: 'var(--accent)', w: 1.6 });
    b += T(24, 136, 'time on one connection', { a: 'start', s: 9, c: 'var(--ink-dim)' });
    b += T(24, 156, 'a slow request blocks everything', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += T(24, 170, 'queued behind it. Browsers dodge', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += T(24, 184, 'it by opening about six connections.', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });

    for (i = 0; i < 3; i++) {
      y = 74 + i * 22;
      b += LN(272, y, 492, y, { d: '2 3' });
      for (j = 0; j < 3; j++) { b += R(274 + j * 40 + i * 12, y - 6, 24, 12, { f: 'var(--accent-weak)', sk: 'var(--accent)' }); }
      b += R(430, y - 6, 56, 12, { f: 'var(--surface-3)' });
    }
    b += LN(422, 62, 422, 128, { c: 'var(--warning)', w: 2, cls: 'v-blink' });
    b += T(422, 56, 'one packet lost', { s: 9, c: 'var(--warning)' });
    b += T(272, 156, 'TCP cannot tell the three streams', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += T(272, 170, 'apart, so all three wait.', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });

    for (i = 0; i < 3; i++) {
      y = 74 + i * 22;
      b += LN(520, y, 740, y, { d: '2 3' });
      for (j = 0; j < 3; j++) { b += R(522 + j * 40 + i * 12, y - 6, 24, 12, { f: 'var(--accent-weak)', sk: 'var(--accent)' }); }
      b += (i === 1 ? R(678, y - 6, 56, 12, { f: 'var(--surface-3)' }) : R(678, y - 6, 56, 12, { f: 'var(--accent-weak)', sk: 'var(--accent)' }));
    }
    b += LN(670, 84, 670, 106, { c: 'var(--warning)', w: 2, cls: 'v-blink' });
    b += T(660, 56, 'one packet lost', { s: 9, c: 'var(--warning)' });
    b += T(520, 156, 'QUIC recovers each stream on its', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    b += T(520, 170, 'own, so only that stream waits.', { a: 'start', s: 9.5, c: 'var(--ink-dim)' });
    return S(200, b);
  };
  C['http-versions'] = 'HTTP/2 removes the queue at the message level but still rides one TCP connection; HTTP/3 moves onto UDP so a lost packet <b>stalls only its own stream</b>.';

  /* ---------------------------------------------------------- DNS lookup */

  V['dns-lookup'] = function (u) {
    var b = D(u, 'ar aa ag'), i, inner = '';
    var hops = [['root~name server', 264], ['.com~name server', 400], ['example.com~name server', 536]];
    b += HD('one name, one address', 'every step keeps a copy until the time to live runs out');
    b += B(14, 66, 92, 40, 'browser', { ts: 10 });
    b += A(u, 106, 86, 126, 86);
    b += F('M106 86H126');
    b += B(130, 66, 108, 40, 'recursive~resolver', { ts: 10, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    for (i = 0; i < hops.length; i++) {
      inner += '<g' + IX(i) + '>' + B(hops[i][1], 32, 124, 40, hops[i][0], { ts: 10 }) + '</g>';
    }
    b += SQ(inner);
    b += AP(u, 'M238 76C252 76 250 52 260 52', { m: 'aa', c: 'var(--accent)' });
    b += F('M238 76C252 76 250 52 260 52');
    b += A(u, 388, 52, 396, 52, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 524, 52, 532, 52, { c: 'var(--accent)', m: 'aa' });
    b += T(322, 88, 'which server knows .com?', { s: 9, c: 'var(--ink-dim)' });
    b += T(458, 88, 'which server knows example.com?', { s: 9, c: 'var(--ink-dim)' });
    b += B(264, 106, 300, 38, 'the address, and how long it may be kept~93.184.216.34, time to live 300 s', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += AP(u, 'M598 72C598 96 584 106 570 118', { m: 'ag', c: 'var(--good)' });
    b += AP(u, 'M264 128H140C120 128 116 116 116 110', { m: 'ag', c: 'var(--good)' });
    b += F('M264 128H140C120 128 116 116 116 110', { c: 'var(--good)' });
    b += T(380, 174, 'the same name asked again inside those 300 seconds is answered from a cache, with no network round trip at all', { s: 10, c: 'var(--ink-dim)' });
    return S(190, b);
  };
  C['dns-lookup'] = 'A name is resolved by walking down from the root, and the answer is then <b>cached everywhere</b> until its time to live expires.';

  /* ---------------------------------------------------------- round-trip budget */

  V['round-trip-budget'] = function (u) {
    var b = D(u, 'ar aa'), i, x = 24;
    var seg = [
      ['DNS~30 ms', 87, 'var(--warning-weak)', 'var(--warning)'],
      ['TCP handshake~56 ms', 162, 'var(--warning-weak)', 'var(--warning)'],
      ['TLS handshake~56 ms', 162, 'var(--warning-weak)', 'var(--warning)'],
      ['request~28 ms', 81, 'var(--accent-weak)', 'var(--accent)'],
      ['server~30 ms', 87, 'var(--surface-3)', 'var(--border)'],
      ['answer~28 ms', 81, 'var(--accent-weak)', 'var(--accent)']
    ];
    b += T(24, 20, 'one request from New York to London, 228 ms', { a: 'start', s: 12, w: 1 });
    for (i = 0; i < seg.length; i++) {
      b += B(x, 34, seg[i][1] - 3, 34, seg[i][0], { ts: 9.5, f: seg[i][2], sk: seg[i][3], r: 3 });
      x += seg[i][1];
    }
    b += F('M24 74H684', { c: 'var(--accent)', w: 1.6 });
    b += T(24, 104, 'the same connection reused, 86 ms', { a: 'start', s: 12, w: 1 });
    b += B(24, 118, 78, 34, 'request~28 ms', { ts: 9.5, f: 'var(--accent-weak)', sk: 'var(--accent)', r: 3 });
    b += B(105, 118, 84, 34, 'server~30 ms', { ts: 9.5, f: 'var(--surface-3)', r: 3 });
    b += B(192, 118, 78, 34, 'answer~28 ms', { ts: 9.5, f: 'var(--accent-weak)', sk: 'var(--accent)', r: 3 });
    b += B(282, 118, 200, 34, 'keep-alive saves 142 ms', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)', r: 3, cls: 'v-pulse' });
    b += T(24, 176, 'light in fibre covers about 200,000 km a second; New York to London is 5,585 km, so 56 ms is the floor for one round trip', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += T(24, 194, 'inside one data centre a round trip is about 0.5 ms, which is why a chatty design is cheap there and expensive across an ocean', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    return S(206, b);
  };
  C['round-trip-budget'] = 'Handshakes, not the server, dominate a first request across an ocean; <b>reusing the connection</b> removes all three of them.';
}(typeof window !== 'undefined' ? window : this));
