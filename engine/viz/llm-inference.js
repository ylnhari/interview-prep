/* llm-inference: fine-tuning/alignment and inference-engineering diagrams. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, R = H.R, A = H.A, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW;

  /* ---------------------------------------------------------- fine-tuning and alignment */

  V['lora-adapter'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('LoRA: a small trainable path beside the frozen weights');
    b += B(28, 64, 76, 42, 'x', { ts: 12 });
    b += A(u, 104, 85, 156, 85);
    b += B(156, 48, 150, 40, 'W ~ frozen~(all d x d parameters)', { ts: 10 });
    b += A(u, 306, 68, 356, 68);
    b += AP(u, 'M66 106V150H176', { m: 'aa', c: 'var(--accent)' });
    b += F('M66 106V150H176');
    b += B(176, 130, 68, 40, 'A~d x r', { ts: 10, sk: 'var(--accent)', f: 'var(--surface-2)' });
    b += A(u, 244, 150, 288, 150, { c: 'var(--accent)', m: 'aa' });
    b += F('M244 150H288');
    b += B(288, 130, 68, 40, 'B~r x d', { ts: 10, sk: 'var(--accent)', f: 'var(--surface-2)' });
    b += AP(u, 'M356 150V68H372', { m: 'aa', c: 'var(--accent)' });
    b += F('M356 150V68H372');
    b += '<circle cx="388" cy="68" r="16" fill="var(--surface-2)" stroke="var(--accent)" stroke-width="1.4"/>';
    b += T(388, 73, '+', { s: 15, c: 'var(--accent)', w: 1 });
    b += A(u, 404, 68, 448, 68);
    b += B(448, 48, 90, 40, 'h~output', { ts: 10 });
    b += T(232, 118, 'trainable: only A and B', { s: 10, c: 'var(--accent)' });
    b += T(232, 190, 'A and B together are a small fraction of the parameters in W', { s: 10, c: 'var(--ink-dim)' });
    return S(204, b);
  };
  C['lora-adapter'] = 'The base weight <b>W</b> stays frozen; only the low-rank pair <b>A</b> and <b>B</b> train, and their product adds a correction to the output.';

  V['rlhf-pipeline'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('from a base model to an aligned model');
    b += B(20, 44, 110, 44, 'pretrained~model');
    b += A(u, 130, 66, 178, 66);
    b += B(178, 44, 120, 44, 'SFT~instruction data');
    b += F('M130 66H178');
    b += A(u, 298, 66, 596, 66);
    b += F('M298 66H596');
    b += B(596, 44, 144, 44, 'RL policy~(PPO)');
    b += AP(u, 'M255 88V128H395V150', { m: 'aa' });
    b += B(320, 150, 150, 40, 'reward model~preference pairs', { ts: 10 });
    b += AP(u, 'M470 170H660V88', { m: 'aa' });
    b += T(560, 165, 'reward', { s: 9, c: 'var(--ink-dim)' });
    b += AP(u, 'M596 44C520 12 380 12 300 44', { m: 'ar', c: 'var(--ink-dim)', d: '4 4' });
    b += T(448, 14, 'KL penalty keeps the policy close to the SFT model', { s: 9, c: 'var(--ink-dim)' });
    b += AP(u, 'M255 88V196H660V88', { m: 'aa', c: 'var(--good)', d: '4 4' });
    b += T(457, 210, 'DPO: trains directly on preference pairs, no separate reward model or PPO step', { s: 10, c: 'var(--good)' });
    return S(224, b);
  };
  C['rlhf-pipeline'] = 'Supervised fine-tuning, then a reward model, then reinforcement learning with a KL penalty back to the SFT model; the dashed path shows where <b>DPO</b> shortcuts straight to the policy.';

  /* ---------------------------------------------------------- inference engineering */

  V['prefill-vs-decode'] = function (u) {
    var b = D(u, 'ar aa'), i;
    b += HD('one wide pass, then one token at a time');
    b += T(20, 50, 'prefill', { a: 'start', s: 11, w: 1, c: 'var(--accent)' });
    b += B(110, 36, 560, 34, 'every prompt token processed together, one pass');
    b += T(390, 84, 'compute-bound: limited by how fast the chip can multiply', { s: 10, c: 'var(--ink-dim)' });
    b += T(20, 116, 'decode', { a: 'start', s: 11, w: 1, c: 'var(--accent)' });
    var steps = '';
    for (i = 0; i < 7; i++) {
      steps += B(110 + i * 84, 100, 56, 32, 't' + (i + 1), { ts: 10 });
      if (i < 6) { steps += A(u, 166 + i * 84, 116, 194 + i * 84, 116); steps += F('M' + (166 + i * 84) + ' 116H' + (194 + i * 84)); }
    }
    b += steps;
    b += DT(110, 150, 5, { cls: 'v-move-x', st: '--dx: 468px' });
    b += T(390, 168, 'memory-bandwidth-bound: each step re-reads the whole KV cache for one new token', { s: 10, c: 'var(--ink-dim)' });
    return S(184, b);
  };
  C['prefill-vs-decode'] = 'Prefill reads the whole prompt in one parallel, <b>compute-bound</b> pass; decode produces one token per step and is <b>memory-bandwidth-bound</b> because each step still touches the whole cache.';

  V['kv-cache-growth'] = function (u) {
    var b = D(u, 'ar aw'), xs = [100, 190, 280, 370, 460, 550], hs = [15, 28, 45, 65, 90, 112], i, bars = '';
    b += HD('the KV cache grows with every token generated');
    b += LN(60, 45, 700, 45, { c: 'var(--warning)', d: '5 4' });
    b += T(706, 42, 'GPU memory limit', { a: 'end', s: 9, c: 'var(--warning)' });
    b += LN(60, 140, 700, 140, { c: 'var(--border)' });
    for (i = 0; i < xs.length; i++) {
      bars += '<g' + IX(i) + '>' + GROW(R(xs[i], 140 - hs[i], 50, hs[i], { f: i === xs.length - 1 ? 'var(--danger)' : 'var(--accent)' })) + '</g>';
    }
    b += SQ(bars);
    b += T(625, 105, 'new requests~queue here', { s: 9, c: 'var(--danger)' });
    b += T(380, 158, 'tokens generated over the life of the request', { s: 10, c: 'var(--ink-dim)' });
    b += T(380, 188, 'bytes per token = 2 x layers x heads x head_dim x bytes per value', { s: 10, c: 'var(--ink-dim)' });
    return S(200, b);
  };
  C['kv-cache-growth'] = 'Every generated token adds a fixed slice to the KV cache; once the running total meets the memory limit, new requests wait instead of the server slowing down gently.';

  V['continuous-batching'] = function (u) {
    var b = D(u, 'ar aa'), rowY = [50, 84, 118, 152], i, lens = [280, 170, 240, 110];
    b += HD('static batching waits; continuous batching does not', '');
    b += T(190, 34, 'static batching', { s: 11, w: 1 });
    b += LN(370, 30, 370, 176, { c: 'var(--border)' });
    b += T(560, 34, 'continuous batching', { s: 11, w: 1 });
    for (i = 0; i < rowY.length; i++) {
      b += R(30, rowY[i], lens[i], 22, { f: 'var(--accent)' });
      b += R(30 + lens[i], rowY[i], 280 - lens[i], 22, { f: 'var(--surface-3)' });
    }
    b += LN(310, 42, 310, 176, { c: 'var(--ink-dim)', d: '3 3' });
    b += T(310, 190, 'wait for the longest sequence', { s: 9, c: 'var(--ink-dim)' });
    for (i = 0; i < rowY.length; i++) {
      b += R(400, rowY[i], lens[i], 22, { f: 'var(--accent)' });
      b += '<g' + IX(i) + '>' + R(400 + lens[i], rowY[i], 280 - lens[i], 22, { f: 'var(--good)' }) + '</g>';
    }
    b += T(680, 190, 'a finished slot is reused at once', { s: 9, c: 'var(--good)', a: 'end' });
    return S(204, b);
  };
  C['continuous-batching'] = 'Static batching pads every sequence to the length of the slowest one; continuous batching drops a finished sequence out and slides a new one into its slot immediately.';

  V['paged-attention-blocks'] = function (u) {
    var b = D(u, 'ar aa'), i, map = [0, 3, 1, 2], px = [420, 560, 490, 630, 420, 560, 490, 630], py = [50, 50, 110, 110, 170, 170, 170, 170];
    b += HD('the KV cache lives in fixed-size blocks, not one long strip');
    b += T(150, 34, 'logical sequence', { s: 11, w: 1 });
    for (i = 0; i < 4; i++) { b += B(90, 50 + i * 38, 120, 30, 'block ' + i, { ts: 10 }); }
    b += T(570, 34, 'physical block pool', { s: 11, w: 1 });
    var pool = '';
    for (i = 0; i < 8; i++) {
      var free = i === 4 || i === 6;
      pool += R(390 + (i % 4) * 88, 50 + Math.floor(i / 4) * 60, 70, 40, { f: free ? 'var(--surface-3)' : 'var(--accent-weak)', sk: free ? 'var(--border)' : 'var(--accent)' });
    }
    b += pool;
    b += T(390, 176, 'grey = free block', { s: 9, c: 'var(--ink-dim)' });
    var targets = [[425, 65], [513, 65], [601, 65], [513, 125]];
    for (i = 0; i < 4; i++) {
      b += AP(u, 'M210 ' + (65 + i * 38) + 'C300 ' + (65 + i * 38) + ' 300 ' + targets[i][1] + ' ' + targets[i][0] + ' ' + targets[i][1], { m: 'aa', c: 'var(--accent)' });
      if (i < 2) { b += F('M210 ' + (65 + i * 38) + 'C300 ' + (65 + i * 38) + ' 300 ' + targets[i][1] + ' ' + targets[i][0] + ' ' + targets[i][1]); }
    }
    return S(200, b);
  };
  C['paged-attention-blocks'] = 'PagedAttention splits each sequence into fixed-size blocks and scatters them across a shared pool, the way an operating system pages virtual memory, so nothing is wasted between sequences.';

  V['quantization-bits'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('fewer bits per weight, less memory to hold and move');
    b += R(150, 44, 128, 30, { f: 'var(--surface-3)', sk: 'var(--border)' });
    b += T(90, 64, 'FP16', { a: 'end', s: 11, w: 1 });
    b += T(290, 64, '16 bit ~ about 14 GB for a 7B model', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += R(150, 92, 64, 30, { f: 'var(--surface-2)', sk: 'var(--accent)' });
    b += T(90, 112, 'INT8', { a: 'end', s: 11, w: 1 });
    b += T(226, 112, '8 bit ~ about 7 GB', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += R(150, 140, 32, 30, { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += T(90, 160, 'INT4', { a: 'end', s: 11, w: 1 });
    b += T(194, 160, '4 bit (AWQ / GPTQ) ~ about 3.5 GB', { a: 'start', s: 10, c: 'var(--ink-dim)' });
    b += AP(u, 'M64 60V170', { m: 'ar', c: 'var(--ink-dim)', d: '3 3' });
    b += F('M64 60V170');
    return S(190, b);
  };
  C['quantization-bits'] = 'Every halving of the bit width roughly halves the memory a weight takes, which is why INT8 and INT4 formats matter most for the memory-bound decode step.';

  V['speculative-decoding'] = function (u) {
    var b = D(u, 'ar aa ag ad'), i, seq = '';
    b += HD('a small model guesses, the big model checks in one pass');
    b += T(20, 48, 'draft model', { a: 'start', s: 11, w: 1, c: 'var(--accent)' });
    for (i = 0; i < 5; i++) { seq += '<g' + IX(i) + '>' + B(80 + i * 90, 56, 66, 32, 'd' + (i + 1), { ts: 10 }) + '</g>'; }
    b += SQ(seq);
    b += T(20, 128, 'target model', { a: 'start', s: 11, w: 1, c: 'var(--accent)' });
    b += B(80, 110, 450, 34, 'verifies all five candidates in one forward pass', { ts: 10 });
    b += T(113, 168, 'accept', { s: 9, c: 'var(--good)' });
    b += T(203, 168, 'accept', { s: 9, c: 'var(--good)' });
    b += T(293, 168, 'accept', { s: 9, c: 'var(--danger)' });
    b += T(293, 180, '(mismatch)', { s: 8, c: 'var(--danger)' });
    b += B(530, 56, 70, 32, 'new~token', { ts: 9, sk: 'var(--good)', f: 'var(--surface-2)' });
    b += A(u, 350, 72, 528, 72, { c: 'var(--good)', d: '4 4', m: 'ag' });
    b += T(440, 200, 'the model resamples from the first mismatch onward', { s: 10, c: 'var(--ink-dim)' });
    return S(216, b);
  };
  C['speculative-decoding'] = 'The draft model proposes several tokens fast; the target model checks them all in one pass, keeps every token that matches what it would have picked, and resamples from the first mismatch.';

  V['tensor-vs-pipeline-parallel'] = function (u) {
    var b = D(u, 'ar aa');
    b += HD('splitting one matrix vs splitting the layers');
    b += T(180, 34, 'tensor parallel', { s: 11, w: 1 });
    b += LN(380, 30, 380, 200, { c: 'var(--border)' });
    b += T(580, 34, 'pipeline parallel', { s: 11, w: 1 });
    b += B(60, 50, 130, 40, 'GPU 0~half of W');
    b += B(210, 50, 130, 40, 'GPU 1~half of W');
    b += A(u, 125, 90, 190, 132); b += F('M125 90L190 132');
    b += A(u, 275, 90, 210, 132); b += F('M275 90L210 132');
    b += '<circle cx="200" cy="140" r="18" fill="var(--surface-2)" stroke="var(--accent)" stroke-width="1.4"/>';
    b += T(200, 144, 'sum', { s: 9, c: 'var(--accent)' });
    b += T(200, 182, 'both halves compute at once, then combine (all-reduce)', { s: 9, c: 'var(--ink-dim)', a: 'middle' });
    var i, gx = [410, 500, 590, 680];
    for (i = 0; i < 4; i++) { b += B(gx[i], 60, 76, 40, 'GPU ' + i, { ts: 10 }); if (i < 3) { b += A(u, gx[i] + 76, 80, gx[i + 1], 80); } }
    b += F('M486 80H500M576 80H590M666 80H680');
    b += DT(410, 80, 5, { cls: 'v-move-x', st: '--dx: 270px' });
    b += R(486, 108, 20, 10, { f: 'var(--warning)' });
    b += T(496, 132, 'bubble: GPU 0 idles while later stages finish', { s: 9, c: 'var(--warning)', a: 'middle' });
    b += T(590, 165, 'each stage holds a slice of the layers, in order', { s: 9, c: 'var(--ink-dim)', a: 'middle' });
    return S(212, b);
  };
  C['tensor-vs-pipeline-parallel'] = 'Tensor parallelism splits one matrix multiply across GPUs that all work at once and combine; pipeline parallelism gives each GPU a slice of the layers, so a token moves through them in sequence.';

  V['ttft-tpot-timeline'] = function (u) {
    var b = D(u, 'ar aa'), i, ticks = '';
    b += HD('two clocks: time to first token, then time per output token');
    b += LN(40, 100, 720, 100, { c: 'var(--border)' });
    b += R(40, 84, 180, 32, { f: 'var(--accent-weak)', sk: 'var(--accent)' });
    b += T(130, 104, 'prefill', { s: 10 });
    b += AP(u, 'M220 100V60', { m: 'aa' });
    b += T(220, 48, 'first token: TTFT', { s: 10, w: 1, a: 'middle', c: 'var(--accent)' });
    for (i = 0; i < 9; i++) { ticks += LN(240 + i * 54, 90, 240 + i * 54, 110, { c: 'var(--ink-dim)', w: 2 }); }
    b += ticks;
    b += AP(u, 'M240 128H294', { m: 'ar' });
    b += T(267, 144, 'TPOT', { s: 10, a: 'middle', c: 'var(--ink-dim)' });
    b += DT(40, 100, 5, { cls: 'v-move-x', st: '--dx: 680px' });
    b += T(700, 60, 'done', { s: 10, a: 'end', c: 'var(--ink-dim)' });
    return S(168, b);
  };
  C['ttft-tpot-timeline'] = '<b>Time to first token</b> is how long the user waits before anything appears; <b>time per output token</b> is the gap between every token after that.';

}(typeof window !== 'undefined' ? window : this));
