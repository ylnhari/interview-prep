/* Chunking lab: an interactive explorer beside the RAG chunking lesson (raa-f2).
   It splits one small fixture document with eight strategies, colours each
   chunk in place, and checks whether a question's evidence lands in one
   self-contained chunk. Pure functions are exported for tests. No requests,
   timers, external effects or progress writes. ES5. */
(function (root) {
  'use strict';

  // ---- fixture -------------------------------------------------------------
  // kind: h = heading, s = sentence, r = table row. ref = unit the pronoun needs.
  var UNITS = [
    { id: 0, sec: 'travel', kind: 'h', level: 1, text: 'Expense policy', topic: 'heading' },
    { id: 1, sec: 'travel', kind: 'h', level: 2, text: 'Travel', topic: 'heading' },
    { id: 2, sec: 'travel', kind: 's', text: 'Employees book economy class for flights under six hours.', topic: 'flight class' },
    { id: 3, sec: 'travel', kind: 's', text: 'Business class is allowed on longer flights with manager approval.', topic: 'flight class' },
    { id: 4, sec: 'travel', kind: 's', text: 'It must be requested before the trip is booked.', topic: 'flight class', ref: 3, pronoun: 'It' },
    { id: 5, sec: 'travel', kind: 's', text: 'Hotels must be booked through the travel portal.', topic: 'hotels' },
    { id: 6, sec: 'meals', kind: 'h', level: 2, text: 'Meals', topic: 'heading' },
    { id: 7, sec: 'meals', kind: 'r', text: 'City | Daily limit', topic: 'meal limits' },
    { id: 8, sec: 'meals', kind: 'r', text: 'London | 60 GBP', topic: 'meal limits' },
    { id: 9, sec: 'meals', kind: 'r', text: 'Mumbai | 3,000 INR', topic: 'meal limits' },
    { id: 10, sec: 'meals', kind: 's', text: 'Receipts are required for any meal above the daily limit.', topic: 'meal limits' },
    { id: 11, sec: 'exceptions', kind: 'h', level: 2, text: 'Exceptions', topic: 'heading' },
    { id: 12, sec: 'exceptions', kind: 's', text: 'The finance director can approve exceptions to this policy.', topic: 'exceptions' },
    { id: 13, sec: 'exceptions', kind: 's', text: 'They must be recorded in the expense system within 30 days.', topic: 'exceptions', ref: 12, pronoun: 'They' }
  ];
  var SECTION_TITLE = { travel: 'Travel', meals: 'Meals', exceptions: 'Exceptions' };
  // Hand-written stand-ins for what a model would write in contextual retrieval.
  var CONTEXT_NOTE = {
    travel: 'From the company expense policy, Travel section: which flight class employees may book, when business class needs approval, and how hotels are booked.',
    meals: 'From the company expense policy, Meals section: a table of daily meal limits by city, and the receipt rule.',
    exceptions: 'From the company expense policy, Exceptions section: who approves policy exceptions and the deadline for recording them.'
  };
  // Hand-written stand-ins for model-extracted propositions, keyed by source unit.
  var PROPOSITIONS = [
    { from: [2], text: 'Employees book economy class for flights under six hours.' },
    { from: [3], text: 'Business class is allowed on flights of six hours or more with manager approval.' },
    { from: [4], text: 'Business class must be requested before the trip is booked.' },
    { from: [5], text: 'Hotels must be booked through the travel portal.' },
    { from: [7, 8], text: 'The daily meal limit in London is 60 GBP.' },
    { from: [7, 9], text: 'The daily meal limit in Mumbai is 3,000 INR.' },
    { from: [10], text: 'Receipts are required for any meal above the daily meal limit.' },
    { from: [12], text: 'The finance director can approve exceptions to the expense policy.' },
    { from: [13], text: 'Approved expense-policy exceptions must be recorded in the expense system within 30 days.' }
  ];
  var QUERIES = [
    { id: 'business', text: 'Is business class allowed, and when must it be requested?', need: [3, 4], props: [1, 2] },
    { id: 'mumbai', text: 'What is the daily meal limit in Mumbai?', need: [7, 9], props: [5] },
    { id: 'exception', text: 'How soon must an approved exception be recorded?', need: [12, 13], props: [8] }
  ];
  var STRATEGIES = [
    ['fixed', 'Fixed-size + overlap'], ['recursive', 'Recursive'], ['structural', 'Structural'], ['semantic', 'Semantic'],
    ['parent', 'Parent-child'], ['contextual', 'Contextual retrieval'], ['late', 'Late chunking'], ['proposition', 'Proposition']
  ];
  var EXPLAIN = {
    fixed: ['Cuts every N words and slides forward by N minus the overlap.', 'Cheapest and predictable. Watch it cut through sentences and the meal table.'],
    recursive: ['Splits on paragraph, then sentence, then word, only as far as needed to fit the limit; then merges small neighbours back up to the limit.', 'A common default for prose. It respects sentences but not meaning, and may merge two sections into one chunk.'],
    structural: ['One chunk per heading section, with the heading path kept as metadata; a long section is split by sentence and each piece keeps its heading.', 'Never cuts the table. Best when the document has real structure.'],
    semantic: ['Starts a new chunk where neighbouring sentences change topic.', 'In a real system the topic change is detected as a jump in embedding distance between neighbouring sentences; here each sentence carries a hand-labelled topic to stand in for that calculation.'],
    parent: ['Each sentence or table row is a small child chunk used for matching; its parent is the whole section, which is what the model reads.', 'Precise matching without starving the model of context. Costs storage, not model calls.'],
    contextual: ['Recursive chunks, each with a short model-written note added before embedding and keyword indexing.', 'The notes below are hand-written examples of what a model would produce. Helps a chunk that has lost its subject get found.'],
    late: ['Recursive chunk boundaries, but each chunk vector is pooled from a pass over the whole document.', 'The vector for a chunk starting "It must be requested" has seen the sentence about business class. The text the model reads is unchanged.'],
    proposition: ['A model rewrites the text into short, self-contained facts, with pronouns replaced by what they refer to.', 'The propositions below are hand-written examples. Precise, but expensive to build and must be checked against the source.']
  };

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
  function structural(size) {
    size = Math.max(4, size | 0);
    var out = [];
    sections().forEach(function (s) {
      var path = 'Expense policy > ' + SECTION_TITLE[s.sec], r = rangeOfUnits(s.ids);
      if (wordCount(r) <= size) { out.push(chunkFromRange(r, { heading: path })); return; }
      var cur = null;
      sentencePieces(s.ids).forEach(function (p) {
        var pr = rangeOfUnits(p), isTable = UNITS[p[p.length - 1]].kind === 'r';
        if (cur && (isTable && cur.table || wordCount([cur.r[0], pr[1]]) <= size)) { cur.r[1] = pr[1]; return; }
        if (cur) out.push(chunkFromRange(cur.r, { heading: path }));
        cur = { r: [pr[0], pr[1]], table: isTable };
      });
      if (cur) out.push(chunkFromRange(cur.r, { heading: path }));
    });
    return out;
  }
  function semantic() {
    var out = [], cur = null, pending = [];
    UNITS.forEach(function (u) {
      if (u.kind === 'h') { pending.push(u.id); return; }
      if (!cur || cur.topic !== u.topic) {
        if (cur) out.push(cur);
        cur = { topic: u.topic, ids: pending.concat([u.id]) };
      } else cur.ids = cur.ids.concat(pending, [u.id]);
      pending = [];
    });
    if (cur) out.push(cur);
    return out.map(function (c) { return chunkFromRange(rangeOfUnits(c.ids), { topic: c.topic }); });
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
  function contextual(size) {
    return recursive(size).map(function (c) {
      var secs = [];
      c.units.forEach(function (id) { if (secs.indexOf(UNITS[id].sec) < 0) secs.push(UNITS[id].sec); });
      c.meta.note = secs.map(function (s) { return CONTEXT_NOTE[s]; }).join(' ');
      return c;
    });
  }
  function late(size) {
    return recursive(size).map(function (c) {
      var refs = [];
      c.units.forEach(function (id) { var u = UNITS[id]; if (u.ref !== undefined && c.units.indexOf(u.ref) < 0) refs.push(u); });
      c.meta.late = refs.map(function (u) { return '"' + u.pronoun + '" in this chunk refers to: ' + UNITS[u.ref].text; });
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
  function run(strategy, size, overlap) {
    switch (strategy) {
      case 'fixed': return fixed(size, overlap);
      case 'recursive': return recursive(size);
      case 'structural': return structural(size);
      case 'semantic': return semantic();
      case 'parent': return parentChild();
      case 'contextual': return contextual(size);
      case 'late': return late(size);
      case 'proposition': return proposition();
    }
    return [];
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
  function assess(strategy, chunks, query) {
    var need = query.need;
    if (strategy === 'proposition') {
      var hitIdx = query.props.slice(), hits = hitIdx.map(function (i) { return chunks[i]; });
      return { level: hits.length === 1 ? 'good' : 'warn', chunks: hitIdx,
        text: hits.length === 1 ? 'One self-contained proposition answers the question.'
          : 'Each needed fact is its own self-contained proposition, with names filled in. Retrieval must return all ' + hits.length + ' of them (chunks ' + hitIdx.map(function (i) { return i + 1; }).join(' and ') + ').' };
    }
    if (strategy === 'parent') {
      var children = chunks.filter(function (c) { return touches(c.range, need); });
      var parent = children.length ? children[0].meta.parent : null;
      var ok = parent && covers(parent, need);
      return { level: ok ? 'good' : 'warn', chunks: children.map(function (c) { return chunks.indexOf(c); }),
        text: ok ? 'Search matches a small child chunk, then the model receives its whole parent section (' + children[0].meta.parentTitle + '), which holds all the evidence.'
          : 'The matching children belong to different parents; the model would need more than one section.' };
    }
    var whole = chunks.filter(function (c) { return covers(c.range, need); });
    var touched = chunks.filter(function (c) { return touches(c.range, need); }).map(function (c) { return chunks.indexOf(c); });
    if (whole.length) {
      var c = whole[0];
      return { level: 'good', chunks: [chunks.indexOf(c)], text: 'All the evidence is inside chunk ' + (chunks.indexOf(c) + 1) + ', with every pronoun\'s referent present.' };
    }
    var dang = [];
    touched.forEach(function (i) { dang = dang.concat(dangling(chunks[i]).map(function (id) { return { chunk: i, unit: id }; })); });
    var msg = 'The evidence is split across chunks ' + touched.map(function (i) { return i + 1; }).join(' and ') + '. A search may return only one piece.';
    if (dang.length) {
      var d = dang[0], u = UNITS[d.unit];
      msg += ' Chunk ' + (d.chunk + 1) + ' starts with "' + u.pronoun + '" but not the sentence it refers to.';
      if (strategy === 'contextual') msg += ' The added note names the section, which helps search find it, but the chunk text still lacks the referent.';
      else if (strategy === 'late') msg += ' Late chunking lets that chunk\'s vector reflect the earlier sentence, so search can find it, but the model still reads the chunk text alone.';
    }
    if (strategy === 'fixed' || strategy === 'recursive') {
      var cut = touched.some(function (i) { var r = chunks[i].range; return need.some(function (id) { var ur = unitRange(id); return (r[0] > ur[0] && r[0] < ur[1]) || (r[1] > ur[0] && r[1] < ur[1]); }); });
      if (cut) msg += ' A boundary falls inside a needed sentence or table row.';
    }
    return { level: dang.length && strategy !== 'late' && strategy !== 'contextual' ? 'bad' : 'warn', chunks: touched, text: msg };
  }

  // ---- view -----------------------------------------------------------------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function css(id) {
    var p = '#' + id;
    return '<style>' + p + '{color:var(--ink);font:14px/1.5 var(--font-body);max-width:100%;overflow-wrap:anywhere;margin:16px 0;padding:16px;border:1px solid var(--border-strong);border-radius:12px;background:var(--surface)}' +
      p + ' *{box-sizing:border-box;min-width:0}' + p + ' h4{font-size:19px;margin:0 0 6px}' + p + ' p{margin:6px 0}' +
      p + ' .cl-strats{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}' +
      p + ' button{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--border-strong);border-radius:999px;padding:6px 12px;min-height:40px;cursor:pointer}' +
      p + ' button[aria-pressed="true"]{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}' +
      p + ' button:focus-visible,' + p + ' select:focus-visible,' + p + ' input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}' +
      p + ' .cl-controls{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:end;margin:8px 0 12px}' +
      p + ' label{display:grid;gap:4px;font-weight:600;font-size:13px;flex:1 1 180px}' +
      p + ' select{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--border-strong);border-radius:8px;min-height:40px;padding:4px 8px}' +
      p + ' input[type=range]{width:100%;accent-color:var(--accent)}' +
      p + ' .cl-how{padding:10px 12px;border-left:4px solid var(--accent);background:var(--accent-weak);border-radius:0 8px 8px 0}' +
      p + ' .cl-doc{margin:12px 0;padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);line-height:2.1}' +
      p + ' .cl-line{display:block}' + p + ' .cl-h1{font-weight:700;font-size:16px}' + p + ' .cl-h2{font-weight:700}' + p + ' .cl-row{font-family:var(--font-mono);font-size:13px}' +
      p + ' .cl-w{padding:2px 1px;border-bottom:3px solid transparent}' +
      p + ' .c0{background:var(--accent-weak);border-bottom-color:var(--accent)}' + p + ' .c1{background:var(--good-weak);border-bottom-color:var(--good)}' +
      p + ' .c2{background:var(--warning-weak);border-bottom-color:var(--warning)}' + p + ' .c3{background:var(--danger-weak);border-bottom-color:var(--danger)}' +
      p + ' .cl-ov{outline:2px dashed var(--ink-dim);outline-offset:-1px}' + p + ' .cl-ev{font-weight:700}' +
      p + ' .cl-tag{font:600 11px/1 var(--font-mono);color:var(--ink-dim);margin-right:2px;vertical-align:2px}' +
      p + ' .cl-verdict{padding:10px 12px;border-radius:8px;margin:12px 0;border:1px solid var(--border-strong)}' +
      p + ' .cl-good{background:var(--good-weak);border-color:var(--good)}' + p + ' .cl-warn{background:var(--warning-weak);border-color:var(--warning)}' + p + ' .cl-bad{background:var(--danger-weak);border-color:var(--danger)}' +
      p + ' .cl-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:10px}' +
      p + ' .cl-card{padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);border-top-width:4px}' +
      p + ' .cl-card.k0{border-top-color:var(--accent)}' + p + ' .cl-card.k1{border-top-color:var(--good)}' + p + ' .cl-card.k2{border-top-color:var(--warning)}' + p + ' .cl-card.k3{border-top-color:var(--danger)}' +
      p + ' .cl-card.hit{box-shadow:0 0 0 2px var(--ink)}' +
      p + ' .cl-card b{font-size:13px}' + p + ' .cl-meta{display:block;color:var(--ink-dim);font-size:13px;margin-top:4px}' +
      p + ' .cl-note{display:block;margin-top:6px;padding:6px 8px;border-radius:6px;background:var(--surface-2);font-style:italic;font-size:13px}' +
      p + ' .cl-small{color:var(--ink-dim);font-size:13px}' +
      '</style>';
  }
  function docMarkup(chunks, strategy, evidence) {
    var owner = [], count = [];
    var display = strategy === 'proposition' ? [] : chunks;
    display.forEach(function (c, i) { for (var w = c.range[0]; w < c.range[1]; w++) { if (owner[w] === undefined) owner[w] = i; count[w] = (count[w] || 0) + 1; } });
    if (strategy === 'proposition') chunks.forEach(function (c, i) { c.units.forEach(function (id) { var r = unitRange(id); for (var w = r[0]; w < r[1]; w++) if (owner[w] === undefined) owner[w] = i; }); });
    var startTag = {};
    display.forEach(function (c, i) { startTag[c.range[0]] = (startTag[c.range[0]] || []).concat([i + 1]); });
    return UNITS.map(function (u) {
      var r = unitRange(u.id), cls = u.kind === 'h' ? 'cl-h' + u.level : u.kind === 'r' ? 'cl-row' : '';
      var inner = '';
      for (var w = r[0]; w < r[1]; w++) {
        var tag = startTag[w] ? '<span class="cl-tag" aria-hidden="true">[' + startTag[w].join(',') + ']</span>' : '';
        var k = owner[w] === undefined ? '' : ' c' + (owner[w] % 4);
        var ov = count[w] > 1 ? ' cl-ov' : '';
        var ev = evidence.indexOf(u.id) >= 0 ? ' cl-ev' : '';
        inner += tag + '<span class="cl-w' + k + ov + ev + '">' + esc(WD.words[w].w) + '</span> ';
      }
      return '<span class="cl-line ' + cls + '">' + inner + '</span>';
    }).join('');
  }
  function textOf(r) { return WD.words.slice(r[0], r[1]).map(function (x) { return x.w; }).join(' '); }
  function cardsMarkup(chunks, strategy, hits) {
    return chunks.map(function (c, i) {
      var m = c.meta, body;
      if (strategy === 'proposition') body = esc(m.prop) + '<span class="cl-meta">From: ' + esc(c.units.map(function (id) { return UNITS[id].text; }).join(' / ')) + '</span>';
      else {
        body = esc(textOf(c.range));
        if (m.heading) body += '<span class="cl-meta">Heading path: ' + esc(m.heading) + '</span>';
        if (m.topic) body += '<span class="cl-meta">Topic: ' + esc(m.topic) + '</span>';
        if (m.parent) body += '<span class="cl-meta">Parent sent to the model: whole ' + esc(m.parentTitle) + ' section (' + wordCount(m.parent) + ' words)</span>';
        if (m.note) body = '<span class="cl-note">Added note: ' + esc(m.note) + '</span>' + body;
        if (m.late && m.late.length) body += '<span class="cl-meta">Vector context: ' + esc(m.late.join(' ')) + '</span>';
      }
      var size = strategy === 'proposition' ? m.prop.split(/\s+/).length : wordCount(c.range);
      return '<div class="cl-card k' + (i % 4) + (hits.indexOf(i) >= 0 ? ' hit' : '') + '"><b>Chunk ' + (i + 1) + ' · ' + size + ' words' + (hits.indexOf(i) >= 0 ? ' · holds evidence' : '') + '</b><br>' + body + '</div>';
    }).join('');
  }

  function mountChunkLab(sec) {
    if (sec.querySelector('.chunk-lab')) return;
    var id = 'chunk-lab-raa-f2', panel = document.createElement('section');
    panel.id = id; panel.className = 'chunk-lab ai-experiment'; panel.setAttribute('aria-labelledby', id + '-title');
    panel.innerHTML = css(id) +
      '<h4 id="' + id + '-title">Chunking lab: split the same document eight ways</h4>' +
      '<p>Pick a strategy and a question. Each colour is one chunk; a number in brackets marks where a chunk starts; dashed outlines are words repeated by overlap; <b>bold</b> words are the evidence the question needs. Sizes are counted in words to keep the arithmetic visible; real systems count tokens. This exercise does not mark course progress.</p>' +
      '<div class="cl-strats" role="group" aria-label="Chunking strategy">' + STRATEGIES.map(function (s, i) { return '<button type="button" data-s="' + s[0] + '" aria-pressed="' + (i === 0) + '">' + esc(s[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="cl-controls">' +
      '<label for="' + id + '-q">Question<select id="' + id + '-q">' + QUERIES.map(function (q) { return '<option value="' + q.id + '">' + esc(q.text) + '</option>'; }).join('') + '</select></label>' +
      '<label for="' + id + '-size">Chunk size limit: <span data-size-out>20</span> words<input id="' + id + '-size" type="range" min="6" max="40" value="20"></label>' +
      '<label for="' + id + '-ov">Overlap: <span data-ov-out>4</span> words<input id="' + id + '-ov" type="range" min="0" max="10" value="4"></label>' +
      '</div>' +
      '<div class="cl-how" data-how></div>' +
      '<div class="cl-doc" data-doc aria-label="Fixture document coloured by chunk"></div>' +
      '<div class="cl-verdict" data-verdict role="status" aria-live="polite"></div>' +
      '<div class="cl-cards" data-cards></div>' +
      '<p class="cl-small">The policy, notes and propositions are a small fictional fixture. Chunk sizes, boundaries and the evidence check are computed live; the semantic topics, contextual notes and propositions are hand-written stand-ins for model output.</p>';
    var visual = sec.querySelector('.cviz'), teaching = sec.querySelector('.teaching');
    if (visual) sec.insertBefore(panel, visual); else sec.insertBefore(panel, teaching || null);
    var state = { s: 'fixed' };
    var q = panel.querySelector('#' + id + '-q'), size = panel.querySelector('#' + id + '-size'), ov = panel.querySelector('#' + id + '-ov');
    function draw() {
      var n = +size.value, o = +ov.value, query = QUERIES.filter(function (x) { return x.id === q.value; })[0];
      panel.querySelector('[data-size-out]').textContent = n;
      panel.querySelector('[data-ov-out]').textContent = o;
      var usesSize = ['fixed', 'recursive', 'structural', 'contextual', 'late'].indexOf(state.s) >= 0;
      size.disabled = !usesSize; ov.disabled = state.s !== 'fixed';
      var chunks = run(state.s, n, o), verdict = assess(state.s, chunks, query);
      var ex = EXPLAIN[state.s];
      panel.querySelector('[data-how]').innerHTML = '<b>How it splits.</b> ' + esc(ex[0]) + ' ' + esc(ex[1]) + (usesSize ? '' : ' <span class="cl-small">(The size slider does not apply.)</span>');
      panel.querySelector('[data-doc]').innerHTML = docMarkup(chunks, state.s, query.need);
      var v = panel.querySelector('[data-verdict]');
      v.className = 'cl-verdict cl-' + verdict.level;
      v.innerHTML = '<b>' + chunks.length + ' chunks.</b> ' + esc(verdict.text);
      panel.querySelector('[data-cards]').innerHTML = cardsMarkup(chunks, state.s, verdict.chunks);
    }
    [].forEach.call(panel.querySelectorAll('[data-s]'), function (b) {
      b.addEventListener('click', function () {
        state.s = b.getAttribute('data-s');
        [].forEach.call(panel.querySelectorAll('[data-s]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        draw();
      });
    });
    [q, size, ov].forEach(function (el) { el.addEventListener('input', draw); el.addEventListener('change', draw); });
    draw();
  }

  root.PREP_CHUNK_LAB = { units: UNITS, queries: QUERIES, words: WD.words, run: run, assess: assess, mount: mountChunkLab };

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
