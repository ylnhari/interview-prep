# Adding chapters and diagrams in separate files

The build inlines `core/library.js` first and then every other `core/*.js` in name order; likewise `engine/viz-lib.js` first and then every `engine/viz/*.js`. Several authors can therefore add material in parallel without editing the two base files.

## A chapter file: `core/<track>.js`

```js
/* <track>: one line on what the file adds. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};
  root.PREP_CORE['<topic-id>'] = { id: '<topic-id>', title: '...', level: 'warning', levelLabel: '...', why: '...',
    learn: [ /* chunks, first one titled Key terms */ ], connect: null, activities: [ /* exercises */ ],
    sayQuestion: null, sayItOutLoud: null };
  // more chapters may follow in the same file
}(typeof window !== 'undefined' ? window : this));
```

Rules are the same as for `core/library.js` (see `content-schema.md`): field-level only, no candidate or employer, plain English, `Key terms` first, every rubric ends with `{{HONESTY}}`, HTML strings in backticks with no `${`, ids unique across every core file. Each chunk may carry `viz: '<diagram-id>'`. Question-bank chapters have an id containing `question-bank`.

Readings for a chapter go in the public course pack, `packs/course/content.js`, under `readings['<topic-id>']` as `[{ l, u, w, m }]` (label, url, why, minutes). Only URLs that resolve; videos are welcome when they explain better than text.

## A diagram file: `engine/viz/<track>.js`

```js
/* <track> diagrams. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS, H = root.VIZLIB_HELPERS;
  var S = H.S, D = H.D, T = H.T, B = H.B, A = H.A, R = H.R, ML = H.ML, CY = H.CY, AP = H.AP, F = H.F, DT = H.DT, LN = H.LN, PG = H.PG, PL = H.PL, HD = H.HD, SQ = H.SQ, IX = H.IX, GROW = H.GROW, DXS = H.DXS;

  V['<diagram-id>'] = function (u) {
    return S(200, D(u, 'ar aa') + B(20, 40, 120, 48, 'Client') + A(u, 140, 64, 220, 64, { cls: 'v-flow' }) + B(220, 40, 120, 48, 'Server'));
  };
  C['<diagram-id>'] = 'One-sentence caption; <b>bold</b> the thing that moves.';
}(typeof window !== 'undefined' ? window : this));
```

Read the helper signatures at the top of `engine/viz-lib.js` and copy the style of two or three existing diagrams before writing one. Constraints: ES5, `viewBox="0 0 760 H"` with H between 160 and 232 (use `S(H, body)`), colours only through CSS variables, every internal id prefixed with `u`, animation only through the shell's classes (`.v-flow .v-flow-slow .v-pulse .v-blink .v-move-x .v-grow .v-fade-seq .v-rotate`), no scripts or external resources. Add each new id to `engine/viz-catalog.md` under a heading for the track.

## Validate

```
python engine/roadmap.py
node engine/check.js dist/course.html
node engine/check.js packs/course/content.js
```

`check.js` reports unknown `viz` references and ids that a group lists but no chapter defines.
