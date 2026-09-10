/* sd-operations diagrams: site reliability practices and worked system design cases. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  V['golden-signals'] = function (u) {
    var b = D(u, 'ar aa ad aw'), i, inner = '';
    b += HD('the four golden signals', 'one dashboard, four questions');
    b += B(24, 98, 110, 50, 'service');
    var sigs = [
      { y: 26, lab: 'latency~how long a request takes', k: 'aa', c: 'var(--accent)' },
      { y: 74, lab: 'traffic~how much load is arriving', k: 'aa', c: 'var(--accent)' },
      { y: 122, lab: 'errors~how often it fails', k: 'ad', c: 'var(--danger)' },
      { y: 170, lab: 'saturation~how full a resource is', k: 'aw', c: 'var(--warning)' }
    ];
    for (i = 0; i < sigs.length; i++) {
      var y = sigs[i].y, g = '';
      g += AP(u, 'M134 123C220 123 220 ' + (y + 20) + ' 300 ' + (y + 20), { c: sigs[i].c, m: sigs[i].k });
      g += F('M134 123C220 123 220 ' + (y + 20) + ' 300 ' + (y + 20), { c: sigs[i].c });
      g += B(304, y, 410, 40, sigs[i].lab, { ts: 10, f: 'var(--surface-2)', sk: sigs[i].c });
      inner += '<g' + IX(i) + '>' + g + '</g>';
    }
    b += SQ(inner);
    b += T(380, 224, 'four signals catch almost every failure mode before a user has to report it', { s: 10, c: 'var(--ink-dim)' });
    return S(238, b);
  };
  C['golden-signals'] = 'The four golden signals - <b>latency, traffic, errors, saturation</b> - are the four questions worth an answer on every service dashboard.';

  V['error-budget-burn'] = function (u) {
    var b = D(u, 'ar ad ag'), i, inner = '';
    b += HD('error budget burn: 30-day window, 99.9% SLO');
    b += LN(50, 150, 720, 150, { c: 'var(--border)' });
    b += T(40, 154, '0%', { s: 9, c: 'var(--ink-dim)', a: 'end' });
    b += T(40, 40, '100%', { s: 9, c: 'var(--ink-dim)', a: 'end' });
    b += R(50, 40, 12, 110, { f: 'var(--good-weak)' });
    var steps = [
      { x: 62, h: 20, lab: 'normal~~0.2%/day' },
      { x: 174, h: 55, lab: 'bad deploy~~1x budget/day' },
      { x: 286, h: 92, lab: 'still bad~~3x burn rate', warn: true },
      { x: 398, h: 108, lab: 'rollback~~budget nearly gone', warn: true }
    ];
    for (i = 0; i < steps.length; i++) {
      var s = steps[i], g = '';
      g += R(s.x, 150 - s.h, 100, s.h, { f: s.warn ? 'var(--danger-weak)' : 'var(--accent-weak)' });
      g += T(s.x + 50, 150 - s.h - 8, s.lab.split('~~')[0], { s: 9.5, c: s.warn ? 'var(--danger)' : 'var(--accent)' });
      g += T(s.x + 50, 150 - s.h + 14, s.lab.split('~~')[1], { s: 8.5, c: 'var(--ink-dim)' });
      inner += '<g' + IX(i) + '>' + g + '</g>';
    }
    b += SQ(inner);
    b += LN(400, 30, 400, 150, { c: 'var(--danger)', d: '3 4' });
    b += T(400, 20, 'budget exhausted: freeze releases, fix reliability', { s: 10, c: 'var(--danger)', cls: 'v-blink' });
    b += T(600, 175, '43.2 min of allowed failure this month', { s: 10, c: 'var(--ink-dim)' });
    b += T(150, 175, 'a fast burn empties the budget long before day 30', { s: 10, c: 'var(--ink-dim)' });
    return S(196, b);
  };
  C['error-budget-burn'] = 'A <b>burn rate</b> above 1x spends the month\'s error budget faster than the month allows; a sustained fast burn should page someone well before the budget hits zero.';

  V['expand-contract-migration'] = function (u) {
    var b = D(u, 'ar aa ag'), i, inner = '';
    b += HD('expand and contract: a schema change with no downtime');
    var stages = [
      { lab: 'expand~add new column,~write to both', f: 'var(--accent-weak)', sk: 'var(--accent)' },
      { lab: 'migrate~backfill old rows,~verify parity', f: 'var(--warning-weak)', sk: 'var(--warning)' },
      { lab: 'switch~reads move to~the new column', f: 'var(--accent-weak)', sk: 'var(--accent)' },
      { lab: 'contract~stop writing old,~drop it', f: 'var(--good-weak)', sk: 'var(--good)' }
    ];
    for (i = 0; i < stages.length; i++) {
      var x = 30 + i * 182, g = B(x, 60, 160, 64, stages[i].lab, { ts: 9.5, f: stages[i].f, sk: stages[i].sk });
      if (i > 0) { g += AP(u, 'M' + (x - 22) + ' 92H' + (x - 2), { m: 'aa' }); g += F('M' + (x - 22) + ' 92H' + (x - 2)); }
      inner += '<g' + IX(i) + '>' + g + '</g>';
    }
    b += SQ(inner);
    b += T(380, 150, 'every stage reads and writes correctly on its own - the app never needs a matching deploy', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 170, 'stop at any stage and the system is still consistent', { s: 10, c: 'var(--good)' });
    return S(186, b);
  };
  C['expand-contract-migration'] = 'Expand and contract splits one risky schema change into small, individually safe steps: add the new shape, dual-write, backfill, switch reads, then <b>drop the old shape</b> only once nothing depends on it.';

  V['rpo-rto'] = function (u) {
    var b = D(u, 'ar ad');
    b += HD('RPO and RTO on one timeline');
    b += LN(40, 100, 720, 100, { c: 'var(--border)' });
    b += DT(220, 100, 6, { f: 'var(--good)' });
    b += T(220, 84, 'last backup', { s: 10, c: 'var(--good)' });
    b += DT(420, 100, 6, { f: 'var(--danger)', cls: 'v-blink' });
    b += T(420, 84, 'failure', { s: 10, c: 'var(--danger)' });
    b += DT(600, 100, 6, { f: 'var(--accent)' });
    b += T(600, 84, 'fully restored', { s: 10, c: 'var(--accent)' });
    b += R(220, 112, 200, 16, { f: 'var(--danger-weak)' });
    b += T(320, 124, 'RPO: data you can lose', { s: 9.5, c: 'var(--danger)' });
    b += R(420, 134, 180, 16, { f: 'var(--accent-weak)' });
    b += T(510, 146, 'RTO: time allowed to recover', { s: 9.5, c: 'var(--accent)' });
    b += F('M420 100C480 100 480 100 600 100', { c: 'var(--accent)' });
    b += T(380, 190, 'a smaller RPO needs more frequent backups or replication; a smaller RTO needs a rehearsed failover', { s: 10, c: 'var(--ink-dim)' });
    return S(206, b);
  };
  C['rpo-rto'] = '<b>RPO</b> is measured backward from the failure - how much data a restore may lose; <b>RTO</b> is measured forward - how long the recovery may take.';

  V['token-bucket-sliding'] = function (u) {
    var b = D(u, 'ar aa ad'), i, inner = '';
    b += T(24, 20, 'token bucket: allows a burst', { a: 'start', s: 11, w: 1 });
    b += T(404, 20, 'sliding window: smooths the edge', { a: 'start', s: 11, w: 1 });
    b += LN(384, 30, 384, 206, { d: '3 4' });
    b += CY(120, 40, 130, 60, 'bucket~8 tokens', { ts: 10 });
    b += AP(u, 'M60 30C60 10 100 10 120 30', { m: 'aa', c: 'var(--accent)' });
    b += F('M60 30C60 10 100 10 120 30', { c: 'var(--accent)' });
    b += T(60, 20, 'refill', { s: 9, c: 'var(--accent)' });
    for (i = 0; i < 5; i++) {
      inner += '<g' + IX(i) + '>' + DT(140 + i * 16, 70, 5, { f: i < 3 ? 'var(--good)' : 'var(--danger)', cls: i < 3 ? 'v-pulse' : 'v-blink' }) + '</g>';
    }
    b += SQ(inner);
    b += T(185, 118, 'requests spend a~token each; empty = 429', { ts: 9, c: 'var(--ink-dim)' });
    b += T(185, 150, 'a full bucket lets a~short burst through at once', { ts: 9.5, c: 'var(--ink-dim)' });
    b += R(420, 60, 280, 30, { f: 'var(--surface-3)' });
    b += R(420, 60, 140, 30, { f: 'var(--accent-weak)' });
    b += LN(560, 55, 560, 95, { c: 'var(--warning)', d: '2 3' });
    b += T(560, 46, 'now', { s: 9, c: 'var(--warning)' });
    b += T(490, 105, 'previous window', { s: 9, c: 'var(--ink-dim)' });
    b += T(630, 105, 'current window', { s: 9, c: 'var(--ink-dim)' });
    b += T(560, 150, 'weighted count = current + previous x overlap', { s: 9.5, c: 'var(--ink-dim)' });
    b += T(560, 170, 'no free burst at the window boundary', { s: 9.5, c: 'var(--good)' });
    return S(206, b);
  };
  C['token-bucket-sliding'] = 'A token bucket allows a burst up to its size; a sliding window blends the current and previous window\'s counts so a caller cannot double their rate by <b>timing requests around a window edge</b>.';

  V['tenant-isolation'] = function (u) {
    var b = D(u, 'ar aa ad'), i, inner = '';
    b += HD('three ways to isolate tenants');
    var cols = [
      { lab: 'shared pool~one database,~a tenant_id column', f: 'var(--accent-weak)' },
      { lab: 'shared, capped~one database,~per-tenant quota', f: 'var(--warning-weak)' },
      { lab: 'dedicated~one schema or DB~per tenant', f: 'var(--good-weak)' }
    ];
    for (i = 0; i < cols.length; i++) {
      var x = 40 + i * 240;
      inner += '<g' + IX(i) + '>' + B(x, 40, 200, 60, cols[i].lab, { ts: 9.5, f: cols[i].f }) + '</g>';
    }
    b += SQ(inner);
    b += T(140, 130, 'cheapest; one noisy~tenant can slow everyone', { ts: 9.5, c: 'var(--ink-dim)' });
    b += T(380, 130, 'a quota stops one tenant~from starving the rest', { ts: 9.5, c: 'var(--ink-dim)' });
    b += T(620, 130, 'strongest isolation;~most operational cost', { ts: 9.5, c: 'var(--ink-dim)' });
    b += DT(140, 190, 7, { f: 'var(--danger)', cls: 'v-blink' });
    b += T(160, 194, 'noisy tenant here reaches everyone sharing the pool', { s: 10, c: 'var(--danger)', a: 'start' });
    return S(210, b);
  };
  C['tenant-isolation'] = 'Isolation is a spectrum: a shared pool is cheap but lets one <b>noisy tenant</b> hurt the rest, and a quota or a dedicated store trades cost for a harder blast-radius limit.';

  V['case-rate-limiter'] = function (u) {
    var b = D(u, 'ar aa ad');
    b += HD('where the limiter sits, and what key it uses');
    b += B(24, 84, 90, 46, 'client');
    b += A(u, 118, 107, 158, 107);
    b += F('M118 107H158');
    b += B(162, 70, 130, 76, 'limiter~at the gateway,~before routing', { ts: 9.5, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 296, 107, 336, 107, { c: 'var(--good)', m: 'ag' });
    b += F('M296 107H336', { c: 'var(--good)' });
    b += B(340, 84, 100, 46, 'service');
    b += AP(u, 'M227 70C227 40 227 40 227 20', { m: 'ad', c: 'var(--danger)' });
    b += F('M227 70C227 40 227 40 227 20', { c: 'var(--danger)' });
    b += B(160, 4, 134, 30, '429 over limit', { ts: 9, f: 'var(--danger-weak)', sk: 'var(--danger)' });
    b += CY(500, 70, 150, 60, 'shared counters~one per key,~in Redis', { ts: 9.5 });
    b += AP(u, 'M292 90C350 60 420 60 500 90', { c: 'var(--accent)', m: 'aa' });
    b += F('M292 90C350 60 420 60 500 90', { c: 'var(--accent)' });
    b += T(500, 150, 'key = user id, API key, or IP - never share one counter across users', { s: 10, c: 'var(--ink-dim)' });
    b += T(150, 170, 'every gateway replica checks the same counters, so the limit holds cluster-wide', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(196, b);
  };
  C['case-rate-limiter'] = 'The limiter sits at the edge, before expensive work happens, and checks a counter keyed by <b>caller identity</b> - shared in Redis so every gateway replica enforces the same limit.';

  V['case-news-feed'] = function (u) {
    var b = D(u, 'ar aa aw');
    b += HD('a hybrid feed: push for most, pull for celebrities');
    b += B(30, 30, 110, 34, 'ordinary poster');
    b += AP(u, 'M140 47H186', { m: 'aw' });
    b += F('M140 47H186', { c: 'var(--warning)' });
    b += B(190, 30, 150, 34, 'fan-out on write~into follower inboxes', { ts: 9, f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += B(30, 90, 110, 34, 'celebrity poster');
    b += AP(u, 'M140 107H186', { m: 'aa' });
    b += F('M140 107H186', { c: 'var(--accent)' });
    b += B(190, 90, 150, 34, 'stored once,~not fanned out', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += CY(400, 20, 130, 50, 'per-user~feed inbox', { ts: 9.5 });
    b += A(u, 340, 47, 396, 40, { c: 'var(--warning)', m: 'aw' });
    b += F('M340 47H396', { c: 'var(--warning)' });
    b += GROW(B(560, 70, 160, 60, 'reader opens feed:~merge inbox +~pull celebrity posts', { ts: 9.5, f: 'var(--surface-3)' }));
    b += AP(u, 'M465 45C520 60 520 90 560 100', { c: 'var(--accent)', m: 'aa' });
    b += F('M465 45C520 60 520 90 560 100', { c: 'var(--accent)' });
    b += AP(u, 'M340 107C460 130 500 130 560 110', { c: 'var(--accent)', m: 'aa' });
    b += F('M340 107C460 130 500 130 560 110', { c: 'var(--accent)' });
    b += T(380, 195, 'a million-follower write would be a million writes - so that one poster is pulled at read time instead', { s: 10, c: 'var(--ink-dim)' });
    return S(212, b);
  };
  C['case-news-feed'] = 'Most posts are fanned out to followers\' inboxes on write, so reads stay cheap; a <b>celebrity\'s</b> post is left in place and merged in at read time instead, because fanning it out would be millions of writes for one post.';

  V['case-payments-ledger'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('idempotent charge, double-entry ledger');
    b += B(24, 30, 130, 40, 'charge request~key: idem-882');
    b += A(u, 158, 50, 200, 50);
    b += F('M158 50H200');
    b += B(204, 30, 140, 40, 'seen this key?', { f: 'var(--warning-weak)', sk: 'var(--warning)', ts: 9.5 });
    b += AP(u, 'M274 70C274 90 220 90 220 108', { m: 'ag', c: 'var(--good)' });
    b += F('M274 70C274 90 220 90 220 108', { c: 'var(--good)' });
    b += B(140, 112, 160, 34, 'yes: return the~stored result, no charge', { ts: 9, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += AP(u, 'M344 70C344 90 420 90 420 108', { m: 'aa', c: 'var(--accent)' });
    b += F('M344 70C344 90 420 90 420 108', { c: 'var(--accent)' });
    b += B(340, 112, 160, 34, 'no: charge once,~store the result', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += CY(560, 24, 170, 130, '', { ts: 9 });
    b += T(645, 44, 'ledger', { s: 10, w: 1 });
    b += LN(575, 66, 715, 66, { c: 'var(--border)' });
    b += T(645, 84, 'debit: customer $20', { s: 9, c: 'var(--ink-dim)' });
    b += T(645, 104, 'credit: merchant $20', { s: 9, c: 'var(--ink-dim)' });
    b += T(645, 124, 'every entry balances', { s: 9, c: 'var(--good)' });
    b += AP(u, 'M420 130C480 130 500 90 560 90', { c: 'var(--accent)', m: 'aa' });
    b += F('M420 130C480 130 500 90 560 90', { c: 'var(--accent)' });
    b += T(380, 200, 'reconciliation later replays the ledger against the processor\'s own record of what happened', { s: 10, c: 'var(--ink-dim)' });
    return S(216, b);
  };
  C['case-payments-ledger'] = 'An <b>idempotency key</b> makes a retried charge safe, and every movement of money is written as a balanced double-entry <b>ledger</b> row rather than an in-place balance update, so reconciliation has a full trail to check.';

  V['case-recsys-two-stage'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('two stages: fast and broad, then slow and precise');
    b += B(24, 80, 90, 46, 'user~context');
    b += A(u, 118, 103, 158, 103);
    b += F('M118 103H158');
    b += B(162, 60, 170, 86, 'candidate generation~millions -> ~hundreds', { ts: 9.5, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 336, 103, 376, 103, { c: 'var(--accent)', m: 'aa' });
    b += F('M336 103H376', { c: 'var(--accent)' });
    b += B(380, 60, 170, 86, 'ranking~hundreds -> ~top 10, heavier model', { ts: 9.5, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 554, 103, 594, 103, { c: 'var(--good)', m: 'ag' });
    b += F('M554 103H594', { c: 'var(--good)' });
    b += B(598, 80, 130, 46, 'shown to user');
    b += CY(340, 170, 180, 40, 'feature store~online + offline', { ts: 9 });
    b += AP(u, 'M340 190C300 190 280 150 280 146', { c: 'var(--ink-dim)', d: '3 4', m: 'none' });
    b += AP(u, 'M430 170C440 150 460 130 470 146', { c: 'var(--ink-dim)', d: '3 4', m: 'none' });
    b += T(380, 226, 'the cheap model can afford to look at everything; the expensive model only ever sees the shortlist', { s: 10, c: 'var(--ink-dim)' });
    return S(236, b);
  };
  C['case-recsys-two-stage'] = 'Candidate generation cheaply narrows millions of items to a few hundred; <b>ranking</b> then spends a heavier model\'s budget only on that short list, both stages reading the same feature store.';

  V['case-fraud-stream'] = function (u) {
    var b = D(u, 'ar aa ad');
    b += HD('score in milliseconds, label weeks later');
    b += B(24, 30, 100, 34, 'transaction');
    b += A(u, 128, 47, 164, 47);
    b += F('M128 47H164');
    b += B(168, 20, 150, 54, 'streaming features~last 10 min, last~30 days, this device', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 322, 47, 358, 47, { c: 'var(--accent)', m: 'aa' });
    b += F('M322 47H358', { c: 'var(--accent)' });
    b += B(362, 30, 120, 34, 'score < 100ms', { ts: 9.5, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 486, 47, 522, 47, { c: 'var(--good)', m: 'ag' });
    b += F('M486 47H522', { c: 'var(--good)' });
    b += B(526, 30, 130, 34, 'allow / hold /~decline', { ts: 9 });
    b += LN(60, 100, 700, 100, { c: 'var(--border)' });
    b += DT(80, 100, 5, { f: 'var(--accent)' });
    b += T(80, 90, 'decision made', { s: 9, c: 'var(--accent)' });
    b += DT(600, 100, 5, { f: 'var(--danger)', cls: 'v-blink' });
    b += T(600, 90, 'chargeback label arrives', { s: 9, c: 'var(--danger)' });
    b += AP(u, 'M80 100C300 100 400 100 600 100', { c: 'var(--ink-dim)', d: '4 5', m: 'none' });
    b += T(340, 120, 'weeks of label delay - today\'s "precision" is a proxy until then', { s: 10, c: 'var(--ink-dim)' });
    b += AP(u, 'M600 100C640 60 300 40 168 60', { c: 'var(--warning)', m: 'aw', d: '3 4' });
    b += T(400, 172, 'the mature label eventually retrains the model, long after the decision it judges', { s: 10, c: 'var(--warning)' });
    return S(192, b);
  };
  C['case-fraud-stream'] = 'The score has to happen in <b>milliseconds</b> off freshly streamed features, while the label that says whether it was right arrives weeks later - so day-to-day monitoring runs on proxies, not on ground truth.';

  V['case-llm-chat'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('a chat turn: retrieve, then generate, under a cost and latency budget');
    b += B(24, 84, 90, 46, 'user~message');
    b += A(u, 118, 107, 154, 107);
    b += F('M118 107H154');
    b += CY(158, 88, 130, 42, 'retrieve~top-k chunks', { ts: 9 });
    b += A(u, 292, 107, 328, 107, { c: 'var(--accent)', m: 'aa' });
    b += F('M292 107H328', { c: 'var(--accent)' });
    b += B(332, 74, 150, 66, 'router~cheap model first,~escalate if unsure', { ts: 9, f: 'var(--warning-weak)', sk: 'var(--warning)' });
    b += A(u, 486, 107, 522, 107, { c: 'var(--accent)', m: 'aa' });
    b += F('M486 107H522', { c: 'var(--accent)' });
    b += B(526, 84, 140, 46, 'LLM generates~with citations');
    b += A(u, 596, 130, 596, 160, { c: 'var(--good)', m: 'ag' });
    b += F('M596 130V160', { c: 'var(--good)' });
    b += B(510, 164, 170, 34, 'guardrail: PII + policy check', { ts: 9, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += T(160, 170, 'TTFT: time to first token', { s: 9.5, c: 'var(--ink-dim)', a: 'start' });
    b += T(160, 188, 'TPOT: time per output token', { s: 9.5, c: 'var(--ink-dim)', a: 'start' });
    b += T(160, 206, 'cost tracked per call: retrieval + tokens in + tokens out', { s: 9.5, c: 'var(--ink-dim)', a: 'start' });
    return S(222, b);
  };
  C['case-llm-chat'] = 'A chat turn retrieves grounding chunks, a router sends most turns to a cheap model and escalates the hard ones, and a <b>guardrail</b> checks the output before it reaches the user - each stage adding its own cost and latency.';

}(typeof window !== 'undefined' ? window : this));
