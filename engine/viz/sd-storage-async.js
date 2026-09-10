/* sd-storage-async diagrams: storage engines, object storage, queues, streams and orchestration. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW;

  V['lsm-tree-levels'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += HD('LSM tree: write path, then compaction across levels');
    b += B(20, 30, 84, 36, 'write', { ts: 10 });
    b += A(u, 104, 48, 140, 48);
    b += F('M104 48H140');
    b += CY(144, 26, 112, 44, 'WAL~append + fsync', { ts: 9 });
    b += A(u, 256, 48, 292, 48, { c: 'var(--accent)', m: 'aa' });
    b += F('M256 48H292', { c: 'var(--accent)' });
    b += B(296, 26, 140, 44, 'memtable~sorted, in RAM', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += T(660, 48, 'flush when full', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += AP(u, 'M366 70V96', { m: 'aa', c: 'var(--accent)' });
    b += F('M366 70V96', { c: 'var(--accent)' });
    b += T(30, 92, 'L0', { s: 10, c: 'var(--ink-dim)', a: 'start', w: 1 });
    b += B(56, 100, 108, 30, 'sstable', { ts: 9 });
    b += B(180, 100, 108, 30, 'sstable', { ts: 9 });
    b += GROW(B(296, 100, 130, 30, 'sstable~newest', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' }));
    var inner = '';
    inner += '<g' + IX(0) + '>' + AP(u, 'M170 130C220 150 260 154 300 162', { m: 'ag', c: 'var(--good)' }) + '</g>';
    inner += '<g' + IX(1) + '>' + AP(u, 'M300 130C330 148 350 154 380 162', { m: 'ag', c: 'var(--good)' }) + '</g>';
    b += SQ(inner);
    b += F('M170 130C220 150 260 154 300 162M300 130C330 148 350 154 380 162', { c: 'var(--good)' });
    b += T(30, 156, 'L1', { s: 10, c: 'var(--ink-dim)', a: 'start', w: 1 });
    b += B(380, 160, 176, 32, 'sstable (larger, no overlap)', { ts: 9 });
    b += B(576, 160, 176, 32, 'sstable (larger, no overlap)', { ts: 9 });
    b += T(380, 206, 'each level is roughly 10x the one above it', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    b += T(380, 224, 'compaction keeps the file count a read must check from growing forever', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(232, b);
  };
  C['lsm-tree-levels'] = 'A write lands in the write-ahead log and the memtable; once the memtable fills it flushes to a new <b>SSTable</b> at level 0, and compaction merges files down into fewer, larger, non-overlapping files at each level below.';

  V['lsm-read-path'] = function (u) {
    var b = D(u, 'ar aa ad ag');
    b += HD('LSM read path: the Bloom filter skips files, the sparse index jumps');
    b += B(20, 24, 118, 32, 'get(key k)', { ts: 10 });
    b += A(u, 138, 40, 174, 40);
    b += F('M138 40H174');
    b += B(178, 24, 130, 32, 'memtable~not found', { ts: 9, f: 'var(--surface-3)' });
    b += AP(u, 'M243 56C243 66 100 74 100 84', { m: 'none' });
    b += F('M243 56C243 66 100 74 100 84');
    b += T(96, 78, 'check SSTables, newest first', { s: 9, c: 'var(--ink-dim)', a: 'end' });
    b += CY(30, 84, 130, 26, 'bloom: definitely not', { ts: 9, f: 'var(--danger-weak)', tf: 'var(--danger-weak)', sk: 'var(--danger)' });
    b += R(30, 122, 130, 30, { f: 'var(--surface-3)', sk: 'var(--border)' });
    b += T(95, 141, 'sstable (skipped)', { s: 9, c: 'var(--ink-dim)' });
    b += AP(u, 'M95 110V122', { m: 'ad', c: 'var(--danger)', d: '3 3' });
    b += CY(300, 84, 130, 26, 'bloom: maybe present', { ts: 9, f: 'var(--accent-weak)', tf: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(300, 122, 130, 30, 'sparse index~jump + scan', { ts: 9 });
    b += A(u, 365, 110, 365, 122, { c: 'var(--accent)', m: 'aa' });
    b += GROW(B(300, 164, 130, 30, 'found: value', { ts: 10, f: 'var(--good-weak)', sk: 'var(--good)' }));
    b += A(u, 365, 152, 365, 164, { c: 'var(--good)', m: 'ag' });
    b += F('M365 152V164', { c: 'var(--good)' });
    b += CY(570, 84, 150, 26, 'not reached', { ts: 9, f: 'var(--surface-2)' });
    b += R(570, 122, 150, 30, { f: 'var(--surface-2)', sk: 'var(--border)' });
    b += T(645, 141, 'oldest sstable', { s: 9, c: 'var(--ink-dim)' });
    b += T(30, 210, 'a "definitely not" file is skipped for free; the search stops the moment a value is found', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(224, b);
  };
  C['lsm-read-path'] = 'Each SSTable has its own <b>Bloom filter</b>: a "definitely not" answer skips the file with no disk read, a "maybe" answer sends the read to the <b>sparse index</b>, and the search stops the moment a value is found.';

  V['btree-vs-lsm'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += T(190, 20, 'B-tree: update in place', { s: 11, w: 1 });
    b += T(570, 20, 'LSM tree: append, compact later', { s: 11, w: 1 });
    b += LN(385, 14, 385, 200, { d: '3 4' });
    b += B(120, 42, 140, 30, 'root', { ts: 9 });
    b += B(60, 92, 110, 30, 'leaf', { ts: 9 });
    b += GROW(B(190, 92, 110, 30, 'leaf~key updated here', { ts: 9, f: 'var(--accent-weak)', sk: 'var(--accent)' }));
    b += A(u, 190, 72, 150, 92, { c: 'var(--border)', m: 'none' });
    b += A(u, 190, 72, 245, 92, { c: 'var(--accent)', m: 'aa' });
    b += F('M190 72L245 92', { c: 'var(--accent)' });
    b += T(190, 148, 'the page holding the key is rewritten on its own disk spot', { s: 10, c: 'var(--ink-dim)' });
    b += T(190, 168, 'random write; a hot key means the same page is rewritten often', { s: 10, c: 'var(--warning)' });
    b += B(430, 42, 110, 30, 'write', { ts: 9 });
    b += A(u, 540, 57, 576, 57, { c: 'var(--accent)', m: 'aa' });
    b += F('M540 57H576', { c: 'var(--accent)' });
    b += B(580, 42, 130, 30, 'append to log + memtable', { ts: 8.5, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += AP(u, 'M645 72V96', { m: 'aa', c: 'var(--accent)' });
    b += F('M645 72V96', { c: 'var(--accent)' });
    b += B(580, 96, 130, 28, 'sstable (new file)', { ts: 8.5 });
    var inner = '<g' + IX(0) + '>' + AP(u, 'M600 124C560 140 520 140 490 150', { m: 'ag', c: 'var(--good)' }) + '</g>';
    b += SQ(inner);
    b += F('M600 124C560 140 520 140 490 150', { c: 'var(--good)' });
    b += T(430, 168, 'background compaction merges files later', { s: 10, c: 'var(--ink-dim)' });
    b += T(430, 148, 'sequential write; the old page is never touched again', { s: 10, c: 'var(--good)' });
    return S(200, b);
  };
  C['btree-vs-lsm'] = 'A B-tree rewrites the existing page holding a key, in place; an LSM tree only ever appends, and reconciles old data later with <b>background compaction</b> instead of a random write.';

  V['object-storage-layers'] = function (u) {
    var b = D(u, 'ar aa ag ad');
    b += HD('object storage: request to durable, erasure-coded bytes');
    b += B(20, 26, 100, 32, 'PUT / GET', { ts: 9 });
    b += A(u, 120, 42, 156, 42);
    b += F('M120 42H156');
    b += B(160, 26, 150, 32, 'metadata service~bucket/key -> location', { ts: 8.5 });
    b += A(u, 310, 42, 346, 42, { c: 'var(--accent)', m: 'aa' });
    b += F('M310 42H346', { c: 'var(--accent)' });
    b += B(350, 26, 170, 32, 'partition manager~map table shards the keyspace', { ts: 8.5, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 520, 42, 556, 42, { c: 'var(--accent)', m: 'aa' });
    b += F('M520 42H556', { c: 'var(--accent)' });
    b += B(560, 26, 176, 32, 'append-only stream layer', { ts: 8.5 });
    b += AP(u, 'M648 58V82', { m: 'aa', c: 'var(--accent)' });
    b += F('M648 58V82', { c: 'var(--accent)' });
    var xs = [420, 520, 620, 720];
    var kinds = ['data', 'data', 'data', 'parity'];
    var i, inner = '';
    for (i = 0; i < 4; i++) {
      inner += '<g' + IX(i) + '>' + R(xs[i] - 40, 86, 76, 40, { f: kinds[i] === 'parity' ? 'var(--warning-weak)' : 'var(--surface-3)', sk: kinds[i] === 'parity' ? 'var(--warning)' : 'var(--border)' }) +
        T(xs[i] - 2, 110, kinds[i], { s: 9, c: kinds[i] === 'parity' ? 'var(--warning)' : 'var(--ink-dim)' }) + '</g>';
    }
    b += SQ(inner);
    b += T(560, 74, 'object split into fragments across nodes and zones', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += DT(340, 106, 6, { f: 'var(--danger)', cls: 'v-blink' });
    b += T(320, 106, 'lost', { s: 9, c: 'var(--danger)', a: 'end' });
    b += AP(u, 'M346 106C370 106 380 110 380 106', { m: 'ad', c: 'var(--danger)', d: '3 3' });
    b += T(380, 150, 'any fragment up to the parity count can be lost and the object still rebuilds', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 170, 'roughly 1.5x the object size in storage, versus 2-3x for full replication', { s: 10, c: 'var(--good)' });
    return S(198, b);
  };
  C['object-storage-layers'] = 'A request passes through a metadata lookup and a partition map before reaching the storage layer, where an object is split into data and <b>parity fragments</b> across nodes so that losing some of them still lets it rebuild.';

  V['queue-vs-stream'] = function (u) {
    var b = D(u, 'ar aa ag');
    b += T(180, 20, 'task queue', { s: 12, w: 1 });
    b += T(570, 20, 'event stream', { s: 12, w: 1 });
    b += LN(385, 14, 385, 210, { d: '3 4' });
    b += B(40, 44, 110, 32, 'producer', { ts: 9 });
    b += A(u, 150, 60, 186, 60, { c: 'var(--accent)', m: 'aa' });
    b += F('M150 60H186', { c: 'var(--accent)' });
    b += CY(190, 40, 140, 40, 'queue', { ts: 9 });
    var inner1 = '<g' + IX(0) + '>' + AP(u, 'M330 60C340 60 340 60 350 60', { m: 'ag', c: 'var(--good)' }) + '</g>';
    b += SQ(inner1);
    b += F('M330 60H354', { c: 'var(--good)' });
    b += GROW(B(358, 44, 110, 32, 'consumer', { ts: 9, f: 'var(--good-weak)', sk: 'var(--good)' }));
    b += T(358, 96, 'taken, then gone: one consumer, once', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += B(40, 130, 110, 30, 'billing', { ts: 9, f: 'var(--surface-3)' });
    b += B(40, 168, 110, 30, 'analytics', { ts: 9, f: 'var(--surface-3)' });
    b += T(30, 122, 'nothing else can read a taken message', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += B(430, 44, 110, 30, 'producer', { ts: 9 });
    b += A(u, 540, 59, 576, 59, { c: 'var(--accent)', m: 'aa' });
    b += F('M540 59H576', { c: 'var(--accent)' });
    b += R(580, 44, 160, 30, { f: 'var(--surface-3)' });
    b += T(605, 63, 'e1', { s: 9, c: 'var(--ink-dim)' });
    b += T(645, 63, 'e2', { s: 9, c: 'var(--ink-dim)' });
    b += T(685, 63, 'e3', { s: 9, c: 'var(--ink-dim)' });
    b += T(500, 34, 'durable, ordered log (kept for retention)', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    var inner2 = '';
    inner2 += '<g' + IX(0) + '>' + AP(u, 'M600 74C560 100 500 110 470 118', { m: 'ag', c: 'var(--good)' }) + '</g>';
    inner2 += '<g' + IX(1) + '>' + AP(u, 'M640 74C610 110 560 150 470 162', { m: 'ag', c: 'var(--good)' }) + '</g>';
    b += SQ(inner2);
    b += F('M600 74C560 100 500 110 470 118M640 74C610 110 560 150 470 162', { c: 'var(--good)' });
    b += B(430, 108, 110, 28, 'group A~billing', { ts: 8.5 });
    b += B(430, 150, 110, 28, 'group B~analytics', { ts: 8.5 });
    b += T(430, 196, 'both groups read all events, each at its own offset', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(210, b);
  };
  C['queue-vs-stream'] = 'In a task queue, one <b>consumer</b> takes a message and it is gone; in an event stream, every event stays in the log so several independent consumer groups can each read it at their own pace.';

  V['consumer-group-offsets'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('one topic, two independent consumer groups');
    var px = [40, 220, 400, 580];
    var i;
    for (i = 0; i < 4; i++) {
      b += R(px[i], 30, 150, 30, { f: 'var(--surface-3)', sk: 'var(--border)' });
      b += T(px[i] + 75, 50, 'partition ' + i, { s: 9, c: 'var(--ink-dim)' });
    }
    var offA = [95, 145, 45, 195];
    for (i = 0; i < 4; i++) {
      b += DT(px[i] + offA[i], 45, 5, { f: 'var(--accent)' });
    }
    b += GROW(DT(px[0] + offA[0], 45, 5, { f: 'var(--accent)' }));
    b += T(30, 96, 'group A (billing): 2 consumers', { s: 10, c: 'var(--accent-ink)', a: 'start', w: 1 });
    b += A(u, 115, 60, 90, 84, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 295, 60, 90, 84, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 475, 60, 300, 84, { c: 'var(--accent)', m: 'aa' });
    b += A(u, 655, 60, 300, 84, { c: 'var(--accent)', m: 'aa' });
    b += B(40, 88, 130, 30, 'consumer A1~partitions 0,1', { ts: 8.5, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += B(250, 88, 130, 30, 'consumer A2~partitions 2,3', { ts: 8.5, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    var offB = [45, 65, 175, 105];
    for (i = 0; i < 4; i++) {
      b += DT(px[i] + offB[i], 45, 5, { f: 'var(--good)' });
    }
    b += T(30, 156, 'group B (analytics): 1 consumer, own offsets', { s: 10, c: 'var(--good)', a: 'start', w: 1 });
    b += A(u, 115, 60, 400, 144, { c: 'var(--good)', m: 'ag', d: '3 3' });
    b += A(u, 655, 60, 400, 144, { c: 'var(--good)', m: 'ag', d: '3 3' });
    b += B(340, 148, 150, 30, 'consumer B1~all 4 partitions', { ts: 8.5, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += T(30, 200, 'group A commits offsets independently of group B; neither affects the other', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(214, b);
  };
  C['consumer-group-offsets'] = 'Each partition is read by exactly one consumer within a group at a time, and each committed <b>offset</b> is scoped to its own group, so two consumer groups read the same topic without affecting each other.';

  V['delivery-guarantees'] = function (u) {
    var b = D(u, 'ar aa ad ag');
    b += HD('at-most-once, at-least-once, and effectively-once');
    b += T(30, 44, 'at-most-once', { s: 10, c: 'var(--ink-dim)', a: 'start', w: 1 });
    b += B(150, 28, 90, 30, 'send', { ts: 9 });
    b += AP(u, 'M240 43C280 43 300 43 330 43', { m: 'none', c: 'var(--danger)', d: '3 3' });
    b += DT(345, 43, 6, { f: 'var(--danger)', cls: 'v-blink' });
    b += T(365, 47, 'dropped, never retried', { s: 9, c: 'var(--danger)', a: 'start' });
    b += T(30, 92, 'at-least-once', { s: 10, c: 'var(--ink-dim)', a: 'start', w: 1 });
    b += B(150, 76, 90, 30, 'send', { ts: 9 });
    b += A(u, 240, 91, 300, 91, { c: 'var(--accent)', m: 'aa' });
    b += F('M240 91H300', { c: 'var(--accent)' });
    b += B(304, 76, 130, 30, 'processed, ack lost', { ts: 8.5 });
    b += AP(u, 'M369 106C369 118 260 118 260 106', { m: 'aa', c: 'var(--warning)', d: '3 3' });
    b += F('M369 106C369 118 260 118 260 106', { c: 'var(--warning)' });
    b += T(310, 132, 'retry: same message processed twice', { s: 9, c: 'var(--warning)', a: 'start' });
    b += T(30, 156, 'effectively-once', { s: 10, c: 'var(--ink-dim)', a: 'start', w: 1 });
    b += B(150, 140, 90, 30, 'duplicate', { ts: 9 });
    b += A(u, 240, 155, 300, 155, { c: 'var(--accent)', m: 'aa' });
    b += F('M240 155H300', { c: 'var(--accent)' });
    b += B(304, 140, 140, 30, 'idempotency key seen before?', { ts: 8.5, f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += A(u, 448, 155, 484, 155, { c: 'var(--good)', m: 'ag' });
    b += F('M448 155H484', { c: 'var(--good)' });
    b += GROW(B(488, 140, 150, 30, 'skip: return stored result', { ts: 8.5, f: 'var(--good-weak)', sk: 'var(--good)' }));
    b += T(30, 200, 'at-least-once plus an idempotent consumer is what "exactly-once" means in practice', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(214, b);
  };
  C['delivery-guarantees'] = 'At-most-once can silently drop a message; at-least-once can silently duplicate one; combining at-least-once delivery with an <b>idempotent consumer</b> makes duplicates harmless, which is what "exactly-once" means in practice.';

  V['dead-letter-queue'] = function (u) {
    var b = D(u, 'ar aa ad');
    b += HD('a poison message, retried, then dead-lettered');
    b += CY(30, 40, 140, 44, 'main queue', { ts: 9 });
    b += A(u, 174, 62, 210, 62, { c: 'var(--accent)', m: 'aa' });
    b += F('M174 62H210', { c: 'var(--accent)' });
    b += B(214, 46, 130, 32, 'consumer', { ts: 9 });
    var attempts = ['attempt 1: fails', 'attempt 2: fails', 'attempt 3: fails'];
    var i, inner = '';
    for (i = 0; i < 3; i++) {
      inner += '<g' + IX(i) + '>' + R(214 + i * 6, 90 + i * 26, 130, 26, { f: 'var(--danger-weak)', sk: 'var(--danger)' }) +
        T(279 + i * 6, 90 + i * 26 + 17, attempts[i], { s: 8.5, c: 'var(--danger)', cls: i === 2 ? 'v-blink' : '' }) + '</g>';
    }
    b += SQ(inner);
    b += AP(u, 'M362 172C420 190 480 190 520 172', { m: 'ad', c: 'var(--danger)' });
    b += F('M362 172C420 190 480 190 520 172', { c: 'var(--danger)' });
    b += B(524, 150, 190, 40, 'dead-letter queue~for a human to inspect', { ts: 9, f: 'var(--danger-weak)', sk: 'var(--danger)' });
    b += T(30, 210, 'other messages behind this one keep moving instead of waiting on it forever', { s: 10, c: 'var(--ink-dim)', a: 'start' });
    return S(224, b);
  };
  C['dead-letter-queue'] = 'A message that fails every retry - a <b>poison message</b> - is moved to a separate dead-letter queue after enough attempts, so it stops blocking everything queued behind it.';

  V['dag-orchestration'] = function (u) {
    var b = D(u, 'ar aa ag aw');
    b += HD('a DAG: dependencies, retries, and a backfill run');
    b += B(30, 30, 100, 32, 'A: extract', { ts: 9, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += A(u, 130, 46, 176, 46, { c: 'var(--good)', m: 'ag' });
    b += F('M130 46H176', { c: 'var(--good)' });
    b += B(180, 10, 110, 32, 'B: transform', { ts: 9, f: 'var(--warning-weak)', sk: 'var(--warning)', cls: 'v-blink' });
    b += B(180, 52, 110, 32, 'C: validate', { ts: 9 });
    b += A(u, 130, 46, 176, 26, { c: 'var(--good)', m: 'ag' });
    b += A(u, 130, 46, 176, 68, { c: 'var(--good)', m: 'ag' });
    b += A(u, 290, 26, 336, 46, { c: 'var(--border)', m: 'none' });
    b += A(u, 290, 68, 336, 46, { c: 'var(--border)', m: 'none' });
    b += B(340, 30, 100, 32, 'D: load', { ts: 9, f: 'var(--surface-3)' });
    b += T(180, 100, 'B failed and is retrying; D waits until A, B and C all succeed', { s: 9.5, c: 'var(--ink-dim)', a: 'start' });
    b += R(20, 122, 700, 46, { f: 'var(--surface-2)', sk: 'var(--border)', r: 8 });
    b += T(40, 140, 'orchestrator', { s: 9, c: 'var(--accent-ink)', a: 'start', w: 1 });
    b += T(40, 158, 'tracks run state per task, retries B automatically, replays the whole run on a backfill', { s: 9, c: 'var(--ink-dim)', a: 'start' });
    b += LN(560, 130, 560, 160, { c: 'var(--border)', d: '2 3' });
    var inner = '<g' + IX(0) + '>' + AP(u, 'M580 145C620 145 640 175 660 190', { m: 'aa', c: 'var(--accent)' }) + '</g>';
    b += SQ(inner);
    b += F('M580 145C620 145 640 175 660 190', { c: 'var(--accent)' });
    b += T(600, 208, 'backfill: re-run day 1 .. day 30 with the fixed logic', { s: 9.5, c: 'var(--accent-ink)', a: 'end' });
    return S(218, b);
  };
  C['dag-orchestration'] = 'The orchestrator tracks each task in the <b>DAG</b>, retries the one that failed, and can <b>backfill</b> by replaying the whole run over a past date range once the logic is fixed.';

  V['fanout-write-vs-read'] = function (u) {
    var b = D(u, 'ar aa aw');
    b += T(170, 20, 'fan-out on write', { s: 11, w: 1 });
    b += T(560, 20, 'fan-out on read', { s: 11, w: 1 });
    b += LN(385, 14, 385, 210, { d: '3 4' });
    b += B(150, 40, 100, 30, 'celebrity~posts', { ts: 9, f: 'var(--warning-weak)', sk: 'var(--warning)' });
    var followers = [ [40, 100], [130, 130], [220, 100], [40, 160], [220, 160] ];
    var i, inner = '';
    for (i = 0; i < followers.length; i++) {
      inner += '<g' + IX(i) + '>' + AP(u, 'M195 70C' + (100 + i * 20) + ' 90 ' + followers[i][0] + ' ' + (followers[i][1] - 10) + ' ' + followers[i][0] + ' ' + followers[i][1], { m: 'aw', c: 'var(--warning)' }) + '</g>';
    }
    b += SQ(inner);
    b += R(20, 190, 260, 10, { f: 'var(--warning-weak)' });
    b += R(20, 190, 220, 10, { f: 'var(--warning)', cls: 'v-blink' });
    b += T(20, 214, 'one post -> a write per follower; huge for a celebrity', { s: 9.5, c: 'var(--warning)', a: 'start' });
    b += B(560, 40, 110, 30, 'anyone posts', { ts: 9 });
    b += AP(u, 'M615 70V96', { m: 'aa', c: 'var(--accent)' });
    b += F('M615 70V96', { c: 'var(--accent)' });
    b += B(560, 100, 110, 30, 'stored once', { ts: 9, f: 'var(--good-weak)', sk: 'var(--good)' });
    b += B(430, 150, 120, 30, 'reader opens feed', { ts: 8.5 });
    b += GROW(B(570, 150, 150, 30, 'merge from everyone followed', { ts: 8.5, f: 'var(--accent-weak)', sk: 'var(--accent)' }));
    b += A(u, 550, 165, 566, 165, { c: 'var(--accent)', m: 'aa' });
    b += F('M550 165H566', { c: 'var(--accent)' });
    b += T(430, 200, 'writes stay cheap; every read pays the merge cost instead', { s: 9.5, c: 'var(--ink-dim)', a: 'start' });
    return S(218, b);
  };
  C['fanout-write-vs-read'] = 'Fan-out on write pushes one post into every follower\'s feed immediately - fast reads, and the <b>celebrity problem</b> when that follower count is huge; fan-out on read defers the work to a merge at read time instead.';

}(typeof window !== 'undefined' ? window : this));
