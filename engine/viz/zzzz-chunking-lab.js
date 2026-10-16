/* Chunking lab: an interactive explorer beside the RAG chunking lesson (raa-f2).
   It splits one fixture policy with nine strategies, draws every cut on the
   unchanged original, shows separately what each strategy adds, rewrites or
   returns, and checks whether a question's evidence lands in one
   self-contained chunk. Pure functions are exported for tests. No requests,
   timers, external effects or progress writes. ES5. */
(function (root) {
  'use strict';

  // ---- fixture -------------------------------------------------------------
  // kind: h = heading, s = sentence, r = table row. ref = unit the pronoun needs.
  // sim = hand-written stand-in for the embedding similarity to the previous
  // sentence or row; semantic splitting cuts where it falls below a threshold.
  var UNITS = [
    { id: 0, sec: 'flights', kind: 'h', level: 1, text: 'Travel and expense policy' },
    { id: 1, sec: 'flights', kind: 'h', level: 2, text: '1. Flights' },
    { id: 2, sec: 'flights', kind: 's', text: 'Employees book economy class for flights under six hours.' },
    { id: 3, sec: 'flights', kind: 's', text: 'Business class is allowed on flights of six hours or longer.', sim: 0.82 },
    { id: 4, sec: 'flights', kind: 's', text: 'It needs written approval from a vice president before booking.', sim: 0.71, ref: 3, pronoun: 'It' },
    { id: 5, sec: 'flights', kind: 's', text: 'Seat upgrades paid with personal loyalty points are always allowed.', sim: 0.58 },
    { id: 6, sec: 'hotels', kind: 'h', level: 2, text: '2. Hotels' },
    { id: 7, sec: 'hotels', kind: 's', text: 'Hotels must be booked through the travel portal.', sim: 0.31 },
    { id: 8, sec: 'hotels', kind: 's', text: 'The nightly cap is 200 USD in New York and 120 USD elsewhere.', sim: 0.74 },
    { id: 9, sec: 'hotels', kind: 's', text: 'Stays above the cap need the same approval as business class.', sim: 0.52 },
    { id: 10, sec: 'meals', kind: 'h', level: 2, text: '3. Meals' },
    { id: 11, sec: 'meals', kind: 's', text: 'Dinner is reimbursable up to 40 USD in US cities.', sim: 0.22 },
    { id: 12, sec: 'meals', kind: 's', text: 'That limit rises to 60 USD on overnight trips.', sim: 0.46, ref: 11, pronoun: 'That' },
    { id: 13, sec: 'meals', kind: 'r', text: 'International city | Daily meal limit', sim: 0.63 },
    { id: 14, sec: 'meals', kind: 'r', text: 'London | 60 GBP', sim: 0.88 },
    { id: 15, sec: 'meals', kind: 'r', text: 'Mumbai | 3,000 INR', sim: 0.9 },
    { id: 16, sec: 'meals', kind: 'r', text: 'Singapore | 90 SGD', sim: 0.89 },
    { id: 17, sec: 'meals', kind: 's', text: 'Receipts are required for any meal above the daily limit.', sim: 0.61 },
    { id: 18, sec: 'ground', kind: 'h', level: 2, text: '4. Ground transport' },
    { id: 19, sec: 'ground', kind: 's', text: 'Airport taxis require a receipt.', sim: 0.34 },
    { id: 20, sec: 'ground', kind: 's', text: 'Ride-share trips are reimbursed at the standard rate.', sim: 0.66 },
    { id: 21, sec: 'ground', kind: 's', text: 'They must be booked through the company account.', sim: 0.55, ref: 20, pronoun: 'They' },
    { id: 22, sec: 'exceptions', kind: 'h', level: 2, text: '5. Exceptions' },
    { id: 23, sec: 'exceptions', kind: 's', text: 'The finance director can approve exceptions to this policy.', sim: 0.18 },
    { id: 24, sec: 'exceptions', kind: 's', text: 'They must be recorded in the expense system within 30 days.', sim: 0.57, ref: 23, pronoun: 'They' },
    { id: 25, sec: 'exceptions', kind: 's', text: 'Unrecorded exceptions are treated as personal expenses.', sim: 0.69 }
  ];
  var DOC_TITLE = 'Travel and expense policy';
  var SECTION_TITLE = { flights: '1. Flights', hotels: '2. Hotels', meals: '3. Meals', ground: '4. Ground transport', exceptions: '5. Exceptions' };
  // Hand-written stand-ins for what a model would write in contextual retrieval.
  var CONTEXT_NOTE = {
    flights: 'From the travel and expense policy, section 1 (Flights): flight class rules, the vice-president approval needed for business class, and loyalty-point upgrades.',
    hotels: 'From the travel and expense policy, section 2 (Hotels): booking through the travel portal, nightly price caps, and approval for stays above the cap.',
    meals: 'From the travel and expense policy, section 3 (Meals): the US dinner limit and its higher overnight limit, daily meal limits for international cities, and the receipt rule.',
    ground: 'From the travel and expense policy, section 4 (Ground transport): airport taxi receipts, and how ride-share trips are reimbursed and booked.',
    exceptions: 'From the travel and expense policy, section 5 (Exceptions): who approves exceptions to the policy and the 30-day deadline for recording them.'
  };
  // Hand-written stand-ins for model-extracted propositions, keyed by source unit.
  var PROPOSITIONS = [
    { from: [2], text: 'Employees book economy class for flights under six hours.' },
    { from: [3], text: 'Business class is allowed on flights of six hours or longer.' },
    { from: [4], text: 'Business class needs written approval from a vice president before booking.' },
    { from: [5], text: 'Seat upgrades paid with personal loyalty points are always allowed.' },
    { from: [7], text: 'Hotels must be booked through the travel portal.' },
    { from: [8], text: 'The nightly hotel cap is 200 USD in New York.' },
    { from: [8], text: 'The nightly hotel cap is 120 USD outside New York.' },
    { from: [9], text: 'Hotel stays above the nightly cap need written approval from a vice president before booking.' },
    { from: [11], text: 'Dinner is reimbursable up to 40 USD in US cities.' },
    { from: [11, 12], text: 'Dinner is reimbursable up to 60 USD on overnight trips.' },
    { from: [13, 14], text: 'The daily meal limit in London is 60 GBP.' },
    { from: [13, 15], text: 'The daily meal limit in Mumbai is 3,000 INR.' },
    { from: [13, 16], text: 'The daily meal limit in Singapore is 90 SGD.' },
    { from: [17], text: 'Receipts are required for any meal above the daily meal limit.' },
    { from: [19], text: 'Airport taxis require a receipt.' },
    { from: [20], text: 'Ride-share trips are reimbursed at the standard rate.' },
    { from: [21], text: 'Ride-share trips must be booked through the company account.' },
    { from: [23], text: 'The finance director can approve exceptions to the expense policy.' },
    { from: [24], text: 'Approved expense-policy exceptions must be recorded in the expense system within 30 days.' },
    { from: [25], text: 'Unrecorded exceptions are treated as personal expenses.' }
  ];
  var QUERIES = [
    { id: 'dinner', text: 'What is the dinner limit on an overnight trip?', need: [11, 12], props: [9] },
    { id: 'business', text: 'Who must approve business class, and when?', need: [3, 4], props: [1, 2] },
    { id: 'mumbai', text: 'What is the daily meal limit in Mumbai?', need: [13, 15], props: [11] },
    { id: 'rideshare', text: 'How must ride-share trips be booked?', need: [20, 21], props: [16] },
    { id: 'exception', text: 'How soon must an approved exception be recorded?', need: [23, 24], props: [18] }
  ];
  var STRATEGIES = [
    ['fixed', 'Fixed-size + overlap'], ['recursive', 'Recursive'], ['sentence', 'Sentence'], ['structural', 'Structure-aware'],
    ['semantic', 'Semantic'], ['parent', 'Parent-child'], ['late', 'Late chunking'], ['contextual', 'Contextual retrieval'], ['proposition', 'Proposition']
  ];
  // How each strategy works, as numbered steps, plus what to watch for.
  var HOW = {
    fixed: [['Count the document in words (real systems count tokens).', 'Cut every N words, wherever that lands.', 'Start the next window N minus overlap words later, so the overlap is repeated.'],
      'Cheapest and predictable. Watch the red cuts land inside sentences and the meal table.'],
    recursive: [['Try the biggest separator first: one chunk per section.', 'If a section is over the limit, split it into sentences; if a sentence is still over, split it into words.', 'Merge small neighbouring pieces back together up to the limit.'],
      'A common default for prose. It respects sentences but not meaning, and the merge step can join the end of one section to the start of the next.'],
    sentence: [['Split at every sentence end; each table row also becomes its own piece.', 'Attach a heading to the sentence that follows it.', 'Do not merge pieces.'],
      'Every chunk is a whole sentence, yet "It", "That" and "They" lose what they point to, and a table row loses its header.'],
    structural: [['Read the document structure: headings, numbered clauses, tables.', 'Make one chunk per section; if a section is over the limit, split it by sentence but never inside the table.', 'Add the heading path to each chunk, as text in front of it here (or as metadata only).'],
      'Best when the document has real structure. The green heading path is text that was not in the chunk before.'],
    semantic: [['Embed every sentence and table row.', 'Compare each one with the one before it (the bar chart below).', 'Cut wherever the similarity falls below the threshold.'],
      'In a real system the similarities come from an embedding model; here they are hand-written stand-ins. Move the threshold and watch the dinner rule and its overnight exception separate.'],
    parent: [['Split each section into small child chunks (one sentence or table row each) and embed only those.', 'Store the parent section that each child came from.', 'At query time, match a child, then hand the model the whole parent.'],
      'Precise matching without starving the model of context. It costs storage and a larger prompt, not extra model calls during indexing.'],
    late: [['Run the whole document through a long-context embedding model once, keeping one vector per token.', 'Draw the chunk boundaries (recursive boundaries here).', 'Average the token vectors inside each chunk span to get that chunk\'s vector.'],
      'The text of each chunk is unchanged. Only its vector changes: the vector of "It needs written approval" was computed while the model could see the business-class sentence.'],
    contextual: [['Split normally (recursive boundaries here).', 'For each chunk, ask a model to write a short note placing it in the whole document.', 'Put the note in front of the chunk before embedding and keyword (BM25) indexing.'],
      'The green notes are new text that was never in the document. They are hand-written stand-ins for model output.'],
    proposition: [['Ask a model to rewrite the document as short, self-contained facts.', 'Replace every pronoun with what it refers to, and turn each table row into a full sentence.', 'Index each fact on its own, keeping a link to its source.'],
      'Red struck words were removed and green words were inserted by the rewrite. Precise, but expensive to build, and every rewrite must be checked against the source.']
  };
  // What each strategy changes compared with plain chunks: [text, changed].
  var CHANGES = {
    fixed: [['Every N words', true], ['Chunk text only', false], ['From the chunk alone', false], ['The chunk', false]],
    recursive: [['Sections, then sentences, then words', true], ['Chunk text only', false], ['From the chunk alone', false], ['The chunk', false]],
    sentence: [['Every sentence or row', true], ['Chunk text only', false], ['From the chunk alone', false], ['The chunk', false]],
    structural: [['Headings and sections', true], ['Heading path + chunk text', true], ['From the chunk and its heading', false], ['The chunk', false]],
    semantic: [['Where meaning shifts', true], ['Chunk text only', false], ['From the chunk alone', false], ['The chunk', false]],
    parent: [['Small children for matching', true], ['Child text only', false], ['From the child alone', false], ['The whole parent section', true]],
    late: [['Recursive boundaries', false], ['Chunk text only', false], ['Whole document read, then averaged per chunk', true], ['The chunk', false]],
    contextual: [['Recursive boundaries', false], ['Model-written note + chunk text', true], ['From the note and the chunk', true], ['The chunk (note optional)', false]],
    proposition: [['One fact per piece', true], ['Rewritten fact', true], ['From the rewritten fact', true], ['The fact, linked to its source', true]]
  };
  var PIPE = ['Where it cuts', 'Text that is embedded', 'How the vector is made', 'What the model reads'];

  // ---- words -----------------------------------------------------------------
  function buildWords() {
    var words = [], starts = [];
    UNITS.forEach(function (u) {
      starts[u.id] = words.length;
      u.text.split(/\s+/).forEach(function (w) { words.push({ w: w, unit: u.id }); });
    });
    starts[UNITS.length] = words.length;
    return { words: words, starts: starts };
  }
  var WD = buildWords();
  function unitRange(id) { return [WD.starts[id], WD.starts[id + 1]]; }
  function rangeOfUnits(ids) { return [WD.starts[ids[0]], WD.starts[ids[ids.length - 1] + 1]]; }
  function wordCount(r) { return r[1] - r[0]; }
  function isUnitStart(w) { return WD.starts.indexOf(w) >= 0; }

  // ---- strategies: each returns [{range:[a,b), units:[...], meta:{...}}] ------
  function chunkFromRange(r, meta) {
    var units = [];
    for (var i = r[0]; i < r[1]; i++) if (units.indexOf(WD.words[i].unit) < 0) units.push(WD.words[i].unit);
    return { range: r, units: units, meta: meta || {} };
  }
  function fixed(size, overlap) {
    size = Math.max(4, size | 0); overlap = Math.max(0, Math.min(size - 1, overlap | 0));
    var out = [], n = WD.words.length, step = size - overlap;
    for (var a = 0; a < n; a += step) {
      out.push(chunkFromRange([a, Math.min(n, a + size)]));
      if (a + size >= n) break;
    }
    return out;
  }
  function sections() {
    var order = [], by = {};
    UNITS.forEach(function (u) { if (!by[u.sec]) { by[u.sec] = []; order.push(u.sec); } by[u.sec].push(u.id); });
    return order.map(function (s) { return { sec: s, ids: by[s] }; });
  }
  // pieces of unit ids: headings attach to the next non-heading unit
  function sentencePieces(ids) {
    var pieces = [], pending = [];
    ids.forEach(function (id) {
      if (UNITS[id].kind === 'h') { pending.push(id); return; }
      pieces.push(pending.concat([id])); pending = [];
    });
    if (pending.length) pieces.push(pending);
    return pieces;
  }
  function splitWords(r, size) {
    var out = [];
    for (var a = r[0]; a < r[1]; a += size) out.push([a, Math.min(r[1], a + size)]);
    return out;
  }
  function recursiveRanges(size) {
    var pieces = [];
    sections().forEach(function (s) {
      var r = rangeOfUnits(s.ids);
      if (wordCount(r) <= size) { pieces.push(r); return; }
      sentencePieces(s.ids).forEach(function (p) {
        var pr = rangeOfUnits(p);
        if (wordCount(pr) <= size) pieces.push(pr); else pieces = pieces.concat(splitWords(pr, size));
      });
    });
    var merged = [];
    pieces.forEach(function (r) {
      var last = merged[merged.length - 1];
      if (last && last[1] === r[0] && wordCount([last[0], r[1]]) <= size) last[1] = r[1];
      else merged.push([r[0], r[1]]);
    });
    return merged;
  }
  function recursive(size) { return recursiveRanges(Math.max(4, size | 0)).map(function (r) { return chunkFromRange(r); }); }
  function sentence() {
    var out = [];
    sections().forEach(function (s) { sentencePieces(s.ids).forEach(function (p) { out.push(chunkFromRange(rangeOfUnits(p))); }); });
    return out;
  }
  function headingPath(sec) { return DOC_TITLE + ' > ' + SECTION_TITLE[sec]; }
  function structural(size) {
    size = Math.max(4, size | 0);
    var out = [];
    sections().forEach(function (s) {
      var path = headingPath(s.sec), r = rangeOfUnits(s.ids);
      if (wordCount(r) <= size) { out.push(chunkFromRange(r, { heading: path })); return; }
      var cur = null;
      sentencePieces(s.ids).forEach(function (p) {
        var pr = rangeOfUnits(p), isTable = UNITS[p[p.length - 1]].kind === 'r';
        if (cur && (isTable && cur.table || wordCount([cur.r[0], pr[1]]) <= size)) { cur.r[1] = pr[1]; cur.table = isTable; return; }
        if (cur) out.push(chunkFromRange(cur.r, { heading: path }));
        cur = { r: [pr[0], pr[1]], table: isTable };
      });
      if (cur) out.push(chunkFromRange(cur.r, { heading: path }));
    });
    return out;
  }
  function semantic(threshold) {
    threshold = typeof threshold === 'number' ? threshold : 0.5;
    var out = [], cur = null, pending = [];
    UNITS.forEach(function (u) {
      if (u.kind === 'h') { pending.push(u.id); return; }
      if (!cur || u.sim < threshold) {
        if (cur) out.push(cur);
        cur = { ids: pending.concat([u.id]), cutSim: cur ? u.sim : null };
      } else cur.ids = cur.ids.concat(pending, [u.id]);
      pending = [];
    });
    if (cur) out.push(cur);
    return out.map(function (c) { return chunkFromRange(rangeOfUnits(c.ids), { cutSim: c.cutSim, threshold: threshold }); });
  }
  function parentChild() {
    var out = [];
    sections().forEach(function (s) {
      var parent = rangeOfUnits(s.ids);
      sentencePieces(s.ids).forEach(function (p) {
        out.push(chunkFromRange(rangeOfUnits(p), { parent: parent, parentTitle: SECTION_TITLE[s.sec] }));
      });
    });
    return out;
  }
  function secsOf(c) {
    var secs = [];
    c.units.forEach(function (id) { if (secs.indexOf(UNITS[id].sec) < 0) secs.push(UNITS[id].sec); });
    return secs;
  }
  function contextual(size) {
    return recursive(size).map(function (c) {
      c.meta.note = secsOf(c).map(function (s) { return CONTEXT_NOTE[s]; }).join(' ');
      return c;
    });
  }
  function late(size) {
    return recursive(size).map(function (c) {
      var refs = [];
      c.units.forEach(function (id) { var u = UNITS[id]; if (u.ref !== undefined && !covers(c.range, [u.ref])) refs.push(u); });
      c.meta.late = refs.map(function (u) { return { pronoun: u.pronoun, referent: UNITS[u.ref].text }; });
      return c;
    });
  }
  function proposition() {
    return PROPOSITIONS.map(function (p) {
      var c = chunkFromRange(rangeOfUnits([Math.min.apply(null, p.from), Math.max.apply(null, p.from)]), { prop: p.text });
      c.units = p.from.slice();
      return c;
    });
  }
  function run(strategy, size, overlap, threshold) {
    switch (strategy) {
      case 'fixed': return fixed(size, overlap);
      case 'recursive': return recursive(size);
      case 'sentence': return sentence();
      case 'structural': return structural(size);
      case 'semantic': return semantic(threshold);
      case 'parent': return parentChild();
      case 'contextual': return contextual(size);
      case 'late': return late(size);
      case 'proposition': return proposition();
    }
    return [];
  }

  // Word-level diff (longest common subsequence) from source text to a rewrite.
  function norm(w) { return w.toLowerCase().replace(/[^a-z0-9,]/g, ''); }
  function diffWords(a, b) {
    a = a.split(/\s+/).filter(function (w) { return w && w !== '|'; }); b = b.split(/\s+/);
    var n = a.length, m = b.length, L = [], i, j;
    for (i = 0; i <= n; i++) { L[i] = []; for (j = 0; j <= m; j++) L[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = norm(a[i]) === norm(b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var out = []; i = 0; j = 0;
    while (i < n && j < m) {
      if (norm(a[i]) === norm(b[j])) { out.push({ op: 'same', w: b[j] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) out.push({ op: 'del', w: a[i++] });
      else out.push({ op: 'add', w: b[j++] });
    }
    while (i < n) out.push({ op: 'del', w: a[i++] });
    while (j < m) out.push({ op: 'add', w: b[j++] });
    return out;
  }

  // ---- evidence check -------------------------------------------------------
  function covers(r, ids) {
    return ids.every(function (id) { var u = unitRange(id); return r[0] <= u[0] && r[1] >= u[1]; });
  }
  function touches(r, ids) {
    return ids.some(function (id) { var u = unitRange(id); return r[0] < u[1] && r[1] > u[0]; });
  }
  function dangling(chunk) {
    return chunk.units.filter(function (id) {
      var u = UNITS[id];
      var first = unitRange(id)[0]; // the fixture's pronouns open their sentence
      return u.ref !== undefined && chunk.range[0] <= first && chunk.range[1] > first && !covers(chunk.range, [u.ref]);
    });
  }
  function nums(list) {
    var n = list.map(function (i) { return i + 1; });
    return n.length < 2 ? String(n[0]) : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
  }
  function assess(strategy, chunks, query) {
    var need = query.need;
    if (strategy === 'proposition') {
      var hitIdx = query.props.slice();
      return { level: hitIdx.length === 1 ? 'good' : 'warn', chunks: hitIdx,
        text: hitIdx.length === 1 ? 'One rewritten, self-contained fact (piece ' + (hitIdx[0] + 1) + ') answers the question.'
          : 'Each needed fact is its own self-contained piece, with names filled in. Retrieval must return all ' + hitIdx.length + ' of them (pieces ' + nums(hitIdx) + ').' };
    }
    if (strategy === 'parent') {
      var children = chunks.filter(function (c) { return touches(c.range, need); });
      var parent = children.length ? children[0].meta.parent : null;
      var ok = parent && covers(parent, need);
      return { level: ok ? 'good' : 'warn', chunks: children.map(function (c) { return chunks.indexOf(c); }),
        text: ok ? 'Search matches a small child (' + nums(children.map(function (c) { return chunks.indexOf(c); })) + '), then the model receives its whole parent section, ' + children[0].meta.parentTitle + ', which holds all the evidence.'
          : 'The matching children belong to different parents; the model would need more than one section.' };
    }
    var whole = chunks.filter(function (c) { return covers(c.range, need); });
    var touched = chunks.filter(function (c) { return touches(c.range, need); }).map(function (c) { return chunks.indexOf(c); });
    if (whole.length) {
      var c = whole[0];
      return { level: 'good', chunks: [chunks.indexOf(c)], text: 'All the evidence is inside chunk ' + (chunks.indexOf(c) + 1) + ', with every pronoun\'s referent present.' };
    }
    var dang = [];
    touched.forEach(function (i) { dang = dang.concat(dangling(chunks[i]).filter(function (id) { return need.indexOf(id) >= 0; }).map(function (id) { return { chunk: i, unit: id }; })); });
    var msg = 'The evidence is split across chunks ' + nums(touched) + '. A search may return only one piece.';
    if (dang.length) {
      var d = dang[0], u = UNITS[d.unit];
      msg += ' Chunk ' + (d.chunk + 1) + ' contains "' + u.pronoun + '" but not the sentence it refers to.';
      if (strategy === 'contextual') msg += ' The added note names the section, which helps search find it, but the chunk text still lacks the referent.';
      else if (strategy === 'late') msg += ' Late chunking lets that chunk\'s vector reflect the earlier sentence, so search can find it, but the model still reads the chunk text alone.';
    }
    if (strategy === 'semantic') {
      var cutAt = touched.slice(1).map(function (i) { return chunks[i].meta.cutSim; });
      if (cutAt.length && cutAt[0] !== null) msg += ' The similarity at that cut is ' + cutAt[0].toFixed(2) + ', below the ' + chunks[0].meta.threshold.toFixed(2) + ' threshold.';
    }
    if (touched.length > 1 && need.some(function (id) { return UNITS[id].kind === 'r'; })) msg += ' The table row is separated from its header row, so the number no longer says what it limits.';
    if (strategy === 'fixed' || strategy === 'recursive') {
      var cut = touched.some(function (i) { var r = chunks[i].range; return need.some(function (id) { var ur = unitRange(id); return (r[0] > ur[0] && r[0] < ur[1]) || (r[1] > ur[0] && r[1] < ur[1]); }); });
      if (cut) msg += ' A boundary falls inside a needed sentence or table row.';
    }
    // Late chunking and contextual notes still help search find the pieces.
    return { level: strategy === 'late' || strategy === 'contextual' ? 'warn' : 'bad', chunks: touched, text: msg };
  }

  // ---- view -----------------------------------------------------------------
  var HUES = ['#2f6fdb', '#d98a00', '#8b4fd1', '#d0447f', '#0f9bb5', '#6b7a90'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function css(id) {
    var p = '#' + id, k = '';
    HUES.forEach(function (h, i) {
      k += p + ' .c' + i + '{background:color-mix(in srgb,' + h + ' 20%,var(--surface));border-bottom-color:' + h + '}' +
        p + ' .b' + i + '{background:' + h + ';color:#fff}' + p + ' .k' + i + '{border-top-color:' + h + '}' + p + ' .seg' + i + '{background:' + h + '}';
    });
    return '<style>' + p + '{color:var(--ink);font:14px/1.5 var(--font-body);max-width:100%;overflow-wrap:anywhere;margin:16px 0;padding:16px;border:1px solid var(--border-strong);border-radius:12px;background:var(--surface)}' +
      p + ' *{box-sizing:border-box;min-width:0}' + p + ' h4{font-size:19px;margin:0 0 6px}' + p + ' h5{font-size:15px;margin:18px 0 6px}' + p + ' p{margin:6px 0}' +
      p + ' .cl-strats{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}' +
      p + ' button{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--border-strong);border-radius:999px;padding:6px 12px;min-height:40px;cursor:pointer}' +
      p + ' button[aria-pressed="true"]{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}' +
      p + ' button:focus-visible,' + p + ' select:focus-visible,' + p + ' input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}' +
      p + ' .cl-controls{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:end;margin:8px 0 12px}' +
      p + ' label{display:grid;gap:4px;font-weight:600;font-size:13px;flex:1 1 200px}' + p + ' label[hidden]{display:none}' +
      p + ' select{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--border-strong);border-radius:8px;min-height:40px;padding:4px 8px}' +
      p + ' input[type=range]{width:100%;accent-color:var(--accent)}' +
      p + ' .cl-legend{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;padding:10px 12px;border:1px dashed var(--border-strong);border-radius:10px;margin:10px 0}' +
      p + ' .cl-legend span{display:inline-flex;gap:6px;align-items:center}' +
      p + ' .cl-how{padding:10px 12px;border-left:4px solid var(--accent);background:var(--accent-weak);border-radius:0 8px 8px 0}' +
      p + ' .cl-how ol{margin:6px 0 6px 20px;padding:0}' + p + ' .cl-how li{margin:2px 0}' +
      p + ' .cl-pipe{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:8px;margin:10px 0;counter-reset:pipe}' +
      p + ' .cl-step{padding:8px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface-2);font-size:13px}' +
      p + ' .cl-step small{display:block;font:600 11px/1.3 var(--font-mono);color:var(--ink-dim);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px}' +
      p + ' .cl-step.on{border:2px solid var(--accent);background:var(--accent-weak)}' + p + ' .cl-step.on small::after{content:" \\00b7 changed";color:var(--accent-ink,var(--accent))}' +
      p + ' .cl-doc{margin:8px 0 12px;padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);line-height:2.3}' +
      p + ' .cl-line{display:block}' + p + ' .cl-h1{font-weight:700;font-size:16px}' + p + ' .cl-h2{font-weight:700}' + p + ' .cl-row{font-family:var(--font-mono);font-size:13px}' +
      p + ' .cl-w{padding:3px 1px;border-bottom:3px solid transparent}' +
      p + ' .cl-ov{background-image:repeating-linear-gradient(135deg,transparent 0 4px,color-mix(in srgb,var(--ink) 18%,transparent) 4px 6px)}' +
      p + ' .cl-ev{font-weight:700;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}' +
      p + ' .cl-badge{display:inline-block;min-width:20px;padding:0 5px;border-radius:999px;font:700 11px/18px var(--font-mono);text-align:center;vertical-align:1px;margin:0 2px}' +
      p + ' .cl-cut{display:inline-block;font:700 12px/1 var(--font-mono);color:var(--ink-dim);border-left:2px solid var(--ink-dim);padding:0 3px 0 4px;margin-left:4px;vertical-align:1px}' +
      p + ' .cl-cut.bad{color:var(--danger);border-left-color:var(--danger)}' +
      p + ' .cl-end{font:700 11px/1 var(--font-mono);color:var(--ink-dim);vertical-align:1px}' +
      p + ' .cl-parent{border:2px solid var(--ink-dim);border-radius:10px;padding:4px 10px 8px;margin:10px 0;position:relative}' +
      p + ' .cl-parent>i{display:block;font:600 11px/1.6 var(--font-mono);font-style:normal;color:var(--ink-dim);text-transform:uppercase}' +
      p + ' .cl-bar{display:flex;height:22px;border-radius:6px;overflow:hidden;margin:4px 0;border:1px solid var(--border)}' +
      p + ' .cl-bar span{display:flex;align-items:center;justify-content:center;color:#fff;font:700 11px/1 var(--font-mono);border-right:1px solid var(--surface);overflow:hidden}' +
      p + ' .cl-enc{background:repeating-linear-gradient(90deg,var(--ink-dim) 0 2px,var(--surface-3,var(--surface-2)) 2px 5px)}' +
      p + ' .cl-cap{font-size:12.5px;color:var(--ink-dim);margin:2px 0 8px}' +
      p + ' .cl-sim{display:flex;align-items:flex-end;gap:3px;height:120px;padding:0 4px;border-bottom:1px solid var(--border-strong);position:relative;margin:6px 0 2px}' +
      p + ' .cl-sim i{flex:1;background:var(--accent);border-radius:3px 3px 0 0;position:relative}' + p + ' .cl-sim i.cut{background:var(--danger)}' +
      p + ' .cl-thr{position:absolute;left:0;right:0;border-top:2px dashed var(--ink);pointer-events:none}' +
      p + ' .cl-thr b{position:absolute;right:0;top:-18px;font:600 11px/1 var(--font-mono);background:var(--surface);padding:1px 3px}' +
      p + ' .cl-simx{display:flex;gap:3px;padding:0 4px;font:10px/1.2 var(--font-mono);color:var(--ink-dim)}' + p + ' .cl-simx span{flex:1;text-align:center}' +
      p + ' .cl-verdict{padding:10px 12px;border-radius:8px;margin:12px 0;border:1px solid var(--border-strong)}' +
      p + ' .cl-good{background:var(--good-weak);border-color:var(--good)}' + p + ' .cl-warn{background:var(--warning-weak);border-color:var(--warning)}' + p + ' .cl-bad{background:var(--danger-weak);border-color:var(--danger)}' +
      p + ' .cl-score{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:6px;margin:8px 0}' +
      p + ' .cl-score button{border-radius:8px;text-align:left;font-size:13px;display:block;width:100%}' + p + ' .cl-score button>span:first-child{font-weight:700;margin-right:6px}' +
      p + ' .cl-score .sg{color:var(--good)}' + p + ' .cl-score .sw{color:var(--warning)}' + p + ' .cl-score .sb{color:var(--danger)}' +
      p + ' .cl-score button[aria-pressed="true"] span{color:inherit}' +
      p + ' .cl-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:10px}' +
      p + ' .cl-card{padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);border-top-width:5px}' +
      p + ' .cl-card.hit{box-shadow:0 0 0 2px var(--ink)}' +
      p + ' .cl-card>b{font-size:13px}' +
      p + ' .cl-part{margin-top:8px;padding:6px 8px;border-radius:6px;font-size:13.5px}' +
      p + ' .cl-part>i{display:block;font:600 10.5px/1.5 var(--font-mono);font-style:normal;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-dim)}' +
      p + ' .cl-orig{background:var(--surface-2);border:1px solid var(--border)}' +
      p + ' .cl-add{background:var(--good-weak);border:1px solid var(--good)}' + p + ' .cl-add>i{color:var(--good)}' +
      p + ' .cl-vec{background:var(--accent-weak);border:1px solid var(--accent)}' + p + ' .cl-vec>i{color:var(--accent)}' +
      p + ' .cl-ret{background:var(--warning-weak);border:1px solid var(--warning)}' +
      p + ' .cl-rep{background-image:repeating-linear-gradient(135deg,transparent 0 4px,color-mix(in srgb,var(--ink) 18%,transparent) 4px 6px)}' +
      p + ' ins{background:var(--good-weak);color:var(--ink);text-decoration:underline 2px var(--good);text-underline-offset:3px;font-weight:600}' +
      p + ' del{background:var(--danger-weak);color:var(--ink-dim);text-decoration:line-through 2px var(--danger)}' +
      p + ' .cl-small{color:var(--ink-dim);font-size:13px}' +
      '.prose h3.cs-h{font-family:var(--font-display);font-size:19px;line-height:1.3;margin:26px 0 6px;padding-top:12px;border-top:1px solid var(--border)}' +
      '.prose h2.cs-g{font-family:var(--font-display);font-size:22px;line-height:1.25;margin:30px 0 8px}' +
      '.prose ul.cs-facts{list-style:none;padding-left:0}.prose ul.cs-facts li{padding-left:12px;border-left:3px solid var(--border-strong);margin:8px 0}' +
      k + '</style>';
  }
  function legend() {
    return '<div class="cl-legend" aria-label="How to read the colours">' +
      '<span><span class="cl-w c0">chunk</span><span class="cl-w c1">bands</span> one colour per chunk</span>' +
      '<span><span class="cl-badge b0">3</span> chunk number where it starts</span>' +
      '<span><span class="cl-cut">&#9986;</span> cut between chunks</span>' +
      '<span><span class="cl-cut bad">&#9986;</span> cut inside a sentence or row</span>' +
      '<span><span class="cl-w cl-ov">hatched</span> repeated in two chunks (overlap)</span>' +
      '<span><span class="cl-ev">underlined</span> evidence the question needs</span>' +
      '<span><ins>green</ins> new text the strategy added</span>' +
      '<span><del>struck</del> words a rewrite removed</span>' +
      '<span><span class="cl-part cl-vec" style="margin:0;padding:0 6px">blue</span> what the vector saw</span>' +
      '</div>';
  }
  function docMarkup(chunks, strategy, evidence, overlap) {
    var owner = [], count = [], isProp = strategy === 'proposition';
    var display = isProp ? [] : chunks;
    display.forEach(function (c, i) { for (var w = c.range[0]; w < c.range[1]; w++) { if (owner[w] === undefined) owner[w] = i; count[w] = (count[w] || 0) + 1; } });
    var startTag = {}, endTag = {};
    if (isProp) chunks.forEach(function (c, i) {
      c.units.forEach(function (id) { var r = unitRange(id); for (var w = r[0]; w < r[1]; w++) if (owner[w] === undefined) owner[w] = i; });
      var s = unitRange(c.units[c.units.length - 1])[0];
      startTag[s] = (startTag[s] || []).concat([i]);
    });
    else display.forEach(function (c, i) {
      startTag[c.range[0]] = (startTag[c.range[0]] || []).concat([i]);
      if (strategy === 'fixed' && overlap > 0 && i < display.length - 1) endTag[c.range[1]] = (endTag[c.range[1]] || []).concat([i]);
    });
    function line(u) {
      var r = unitRange(u.id), cls = u.kind === 'h' ? 'cl-h' + u.level : u.kind === 'r' ? 'cl-row' : '';
      var inner = '';
      for (var w = r[0]; w < r[1]; w++) {
        if (endTag[w]) inner += endTag[w].map(function (i) { return '<span class="cl-end" title="chunk ' + (i + 1) + ' ends">' + (i + 1) + ']</span> '; }).join('');
        if (startTag[w]) {
          if (!isProp && w > 0) inner += isUnitStart(w) ? '<span class="cl-cut" title="cut">&#9986;</span>' : '<span class="cl-cut bad" title="cut inside a sentence or row">&#9986;</span>';
          inner += startTag[w].map(function (i) { return '<span class="cl-badge b' + (i % HUES.length) + '" title="' + (isProp ? 'fact ' : 'chunk ') + (i + 1) + '">' + (i + 1) + '</span>'; }).join('');
        }
        var k = owner[w] === undefined ? '' : ' c' + (owner[w] % HUES.length);
        var ov = count[w] > 1 ? ' cl-ov' : '';
        var ev = evidence.indexOf(u.id) >= 0 ? ' cl-ev' : '';
        inner += '<span class="cl-w' + k + ov + ev + '">' + esc(WD.words[w].w) + '</span> ';
      }
      return '<span class="cl-line ' + cls + '">' + inner + '</span>';
    }
    if (strategy === 'parent') return sections().map(function (s) {
      return '<div class="cl-parent"><i>Parent: ' + esc(SECTION_TITLE[s.sec]) + ' (' + wordCount(rangeOfUnits(s.ids)) + ' words, sent to the model)</i>' + s.ids.map(function (id) { return line(UNITS[id]); }).join('') + '</div>';
    }).join('');
    return UNITS.map(line).join('');
  }
  function textOf(r) { return WD.words.slice(r[0], r[1]).map(function (x) { return x.w; }).join(' '); }
  function sizeOf(c, strategy) { return strategy === 'proposition' ? c.meta.prop.split(/\s+/).length : wordCount(c.range); }
  function sizeBar(chunks, strategy, late) {
    var total = 0;
    chunks.forEach(function (c) { total += sizeOf(c, strategy); });
    var bar = '<div class="cl-bar" role="img" aria-label="' + chunks.length + ' pieces, widths proportional to their length">' + chunks.map(function (c, i) {
      return '<span class="seg' + (i % HUES.length) + '" style="width:' + (100 * sizeOf(c, strategy) / total).toFixed(2) + '%">' + (i + 1) + '</span>';
    }).join('') + '</div>';
    if (late) return '<h5>Two passes</h5><p class="cl-cap">Pass 1: the encoder reads all ' + WD.words.length + ' words together and keeps a vector for every token.</p>' +
      '<div class="cl-bar cl-enc" role="img" aria-label="One encoder pass over the whole document"></div>' +
      '<p class="cl-cap">Pass 2: average the token vectors inside each chunk span. Each chunk vector was computed with the whole document in view.</p>' + bar;
    return '<h5>' + (strategy === 'proposition' ? 'Fact lengths' : 'Chunk sizes') + '</h5>' + bar;
  }
  function simChart(threshold) {
    var content = UNITS.filter(function (u) { return u.kind !== 'h' && u.sim !== undefined; });
    return '<h5>Similarity to the previous sentence</h5><div class="cl-sim" role="img" aria-label="Bar chart: cuts where similarity is below ' + threshold.toFixed(2) + '">' +
      content.map(function (u) { return '<i class="' + (u.sim < threshold ? 'cut' : '') + '" style="height:' + Math.round(u.sim * 100) + '%" title="' + esc(u.text) + ': ' + u.sim.toFixed(2) + '"></i>'; }).join('') +
      '<span class="cl-thr" style="bottom:' + Math.round(threshold * 100) + '%"><b>threshold ' + threshold.toFixed(2) + '</b></span></div>' +
      '<div class="cl-simx" aria-hidden="true">' + content.map(function (u) { return '<span>' + u.id + '</span>'; }).join('') + '</div>' +
      '<p class="cl-cap">One bar per sentence or table row (numbered by position). Red bars fall below the threshold, so a new chunk starts there. Hover a bar to see its sentence.</p>';
  }
  function cardsMarkup(chunks, strategy, hits) {
    return chunks.map(function (c, i) {
      var m = c.meta, body = '', hue = i % HUES.length;
      if (strategy === 'proposition') {
        var src = c.units.map(function (id) { return UNITS[id].text; }).join(' ');
        body += '<div class="cl-part cl-add"><i>Rewritten fact (what is indexed)</i>' + diffWords(src, m.prop).map(function (d) {
          return d.op === 'same' ? esc(d.w) : d.op === 'add' ? '<ins>' + esc(d.w) + '</ins>' : '<del>' + esc(d.w) + '</del>';
        }).join(' ') + '</div>';
        body += '<div class="cl-part cl-orig"><i>Source text (unchanged)</i>' + esc(c.units.map(function (id) { return UNITS[id].text; }).join(' / ')) + '</div>';
      } else {
        if (m.heading) body += '<div class="cl-part cl-add"><i>+ Added: heading path</i><ins>' + esc(m.heading) + '</ins></div>';
        if (m.note) body += '<div class="cl-part cl-add"><i>+ Added: model-written note</i><ins>' + esc(m.note) + '</ins></div>';
        var prev = strategy === 'fixed' && i > 0 ? chunks[i - 1].range[1] : c.range[0], words = '';
        for (var w = c.range[0]; w < c.range[1]; w++) words += (w < prev ? '<span class="cl-rep" title="repeated from the previous chunk">' + esc(WD.words[w].w) + '</span>' : esc(WD.words[w].w)) + ' ';
        body += '<div class="cl-part cl-orig"><i>' + (strategy === 'parent' ? 'Child text (matched by search)' : 'Original text (unchanged)') + '</i>' + words + '</div>';
        if (strategy === 'semantic' && m.cutSim !== null) body += '<p class="cl-small">Starts here because similarity ' + m.cutSim.toFixed(2) + ' is below ' + m.threshold.toFixed(2) + '.</p>';
        if (m.parent) body += '<div class="cl-part cl-ret"><i>&#8627; Returned to the model: parent ' + esc(m.parentTitle) + ' (' + wordCount(m.parent) + ' words)</i>' + esc(textOf(m.parent)) + '</div>';
        if (m.late) body += '<div class="cl-part cl-vec"><i>Vector also reflects</i>' + (m.late.length ? m.late.map(function (x) { return '"' + esc(x.pronoun) + '" points to: ' + esc(x.referent); }).join(' ') : 'the rest of the document; no pronoun here needs it.') + '</div>';
      }
      var hit = hits.indexOf(i) >= 0;
      return '<div class="cl-card k' + hue + (hit ? ' hit' : '') + '"><span class="cl-badge b' + hue + '">' + (i + 1) + '</span> <b>' + (strategy === 'proposition' ? 'Fact ' : 'Chunk ') + (i + 1) + ' &middot; ' + sizeOf(c, strategy) + ' words' + (hit ? ' &middot; holds evidence' : '') + '</b>' + body + '</div>';
    }).join('');
  }
  var USES_SIZE = ['fixed', 'recursive', 'structural', 'contextual', 'late'];

  function mountChunkLab(sec) {
    if (sec.querySelector('.chunk-lab')) return;
    var id = 'chunk-lab-raa-f2', panel = document.createElement('section');
    panel.id = id; panel.className = 'chunk-lab ai-experiment'; panel.setAttribute('aria-labelledby', id + '-title');
    panel.innerHTML = css(id) +
      '<h4 id="' + id + '-title">Chunking lab: one policy, nine strategies</h4>' +
      '<p>Pick a strategy and a question. The document below is always the original text; the strategy only draws its cuts on it. Anything a strategy adds, rewrites or returns is shown separately in the cards. Sizes are counted in words to keep the arithmetic visible; real systems count tokens. This exercise does not mark course progress.</p>' +
      legend() +
      '<div class="cl-strats" role="group" aria-label="Chunking strategy">' + STRATEGIES.map(function (s, i) { return '<button type="button" data-s="' + s[0] + '" aria-pressed="' + (i === 0) + '">' + (i + 1) + '. ' + esc(s[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="cl-controls">' +
      '<label for="' + id + '-q"><span>Question</span><select id="' + id + '-q">' + QUERIES.map(function (q) { return '<option value="' + q.id + '">' + esc(q.text) + '</option>'; }).join('') + '</select></label>' +
      '<label for="' + id + '-size" data-ctl="size"><span>Chunk size limit: <span data-size-out>20</span> words</span><input id="' + id + '-size" type="range" min="6" max="60" value="20"></label>' +
      '<label for="' + id + '-ov" data-ctl="ov"><span>Overlap: <span data-ov-out>4</span> words</span><input id="' + id + '-ov" type="range" min="0" max="12" value="4"></label>' +
      '<label for="' + id + '-thr" data-ctl="thr"><span>Similarity threshold: <span data-thr-out>0.50</span></span><input id="' + id + '-thr" type="range" min="20" max="80" value="50"></label>' +
      '</div>' +
      '<div class="cl-how" data-how></div>' +
      '<h5>What this strategy changes</h5><div class="cl-pipe" data-pipe></div>' +
      '<h5>Original document, with this strategy\'s cuts</h5>' +
      '<div class="cl-doc" data-doc aria-label="Original document coloured by chunk"></div>' +
      '<div data-graph></div>' +
      '<div class="cl-verdict" data-verdict role="status" aria-live="polite"></div>' +
      '<h5>Same question, every strategy</h5><div class="cl-score" data-score role="group" aria-label="Verdict for each strategy"></div>' +
      '<h5>What gets indexed, piece by piece</h5><div class="cl-cards" data-cards></div>' +
      '<p class="cl-small">The policy, similarities, notes and facts are a fictional fixture. Chunk sizes, boundaries and the evidence check are computed live; the similarities, contextual notes and propositions are hand-written stand-ins for model output.</p>';
    var visual = sec.querySelector('.cviz'), teaching = sec.querySelector('.teaching');
    if (visual) sec.insertBefore(panel, visual); else sec.insertBefore(panel, teaching || null);
    var state = { s: 'fixed' };
    var q = panel.querySelector('#' + id + '-q'), size = panel.querySelector('#' + id + '-size'), ov = panel.querySelector('#' + id + '-ov'), thr = panel.querySelector('#' + id + '-thr');
    function pick(s) {
      state.s = s;
      [].forEach.call(panel.querySelectorAll('.cl-strats [data-s]'), function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-s') === s)); });
      draw();
    }
    function draw() {
      var n = +size.value, o = +ov.value, t = +thr.value / 100, query = QUERIES.filter(function (x) { return x.id === q.value; })[0];
      panel.querySelector('[data-size-out]').textContent = n;
      panel.querySelector('[data-ov-out]').textContent = o;
      panel.querySelector('[data-thr-out]').textContent = t.toFixed(2);
      panel.querySelector('[data-ctl="size"]').hidden = USES_SIZE.indexOf(state.s) < 0;
      panel.querySelector('[data-ctl="ov"]').hidden = state.s !== 'fixed';
      panel.querySelector('[data-ctl="thr"]').hidden = state.s !== 'semantic';
      var chunks = run(state.s, n, o, t), verdict = assess(state.s, chunks, query), how = HOW[state.s];
      panel.querySelector('[data-how]').innerHTML = '<b>How it is done</b><ol>' + how[0].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' + esc(how[1]);
      panel.querySelector('[data-pipe]').innerHTML = CHANGES[state.s].map(function (x, i) {
        return '<div class="cl-step' + (x[1] ? ' on' : '') + '"><small>' + (i + 1) + '. ' + esc(PIPE[i]) + '</small>' + esc(x[0]) + '</div>';
      }).join('');
      panel.querySelector('[data-doc]').innerHTML = docMarkup(chunks, state.s, query.need, o);
      panel.querySelector('[data-graph]').innerHTML = (state.s === 'semantic' ? simChart(t) : '') + sizeBar(chunks, state.s, state.s === 'late');
      var v = panel.querySelector('[data-verdict]');
      v.className = 'cl-verdict cl-' + verdict.level;
      v.innerHTML = '<b>' + chunks.length + (state.s === 'proposition' ? ' facts.' : ' chunks.') + '</b> ' + esc(verdict.text);
      panel.querySelector('[data-score]').innerHTML = STRATEGIES.map(function (s, i) {
        var cs = run(s[0], n, o, t), lv = assess(s[0], cs, query).level;
        var mark = lv === 'good' ? ['sg', '&#10003;', 'evidence together'] : lv === 'warn' ? ['sw', '~', 'partly'] : ['sb', '&#10007;', 'split'];
        return '<button type="button" data-pick="' + s[0] + '" aria-pressed="' + (s[0] === state.s) + '"><span class="' + mark[0] + '" aria-hidden="true">' + mark[1] + '</span>' + (i + 1) + '. ' + esc(s[1]) + '<span class="cl-small"> (' + mark[2] + ')</span></button>';
      }).join('');
      panel.querySelector('[data-cards]').innerHTML = cardsMarkup(chunks, state.s, verdict.chunks);
    }
    [].forEach.call(panel.querySelectorAll('.cl-strats [data-s]'), function (b) {
      b.addEventListener('click', function () { pick(b.getAttribute('data-s')); });
    });
    panel.querySelector('[data-score]').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-pick]') : null;
      if (b) pick(b.getAttribute('data-pick'));
    });
    [q, size, ov, thr].forEach(function (el) { el.addEventListener('input', draw); el.addEventListener('change', draw); });
    draw();
  }

  root.PREP_CHUNK_LAB = { units: UNITS, queries: QUERIES, words: WD.words, strategies: STRATEGIES, run: run, assess: assess, diff: diffWords, mount: mountChunkLab };

  // Chain onto the shared public-lesson controller so the shell needs no change.
  var practice = root.PREP_AI_PRACTICE;
  if (practice && typeof practice.mountLesson === 'function') {
    var base = practice.mountLesson;
    practice.mountLesson = function (sec, lessonId) {
      if (lessonId === 'raa-f2') return mountChunkLab(sec);
      return base.apply(this, arguments);
    };
  }
}(typeof window !== 'undefined' ? window : this));
