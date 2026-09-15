/* rag-architecture: responsive semantic flow for the two paths of RAG. */
(function (root) {
  'use strict';
  var V = root.VIZLIB, C = root.VIZLIB_CAPTIONS;

  /*
   * This is intentionally HTML rather than the usual fixed-viewBox SVG.  Each
   * step remains an ordered-list item at a narrow width, where a compressed
   * 760px drawing would make the operational labels too small to read.
   */
  V['rag-two-paths'] = function (u) {
    var id = u + '-rag-two-paths';
    return '<section id="' + id + '" class="rag-two-paths" aria-labelledby="' + id + '-title">' +
      '<style>' +
      '#' + id + '{box-sizing:border-box;color:var(--ink);font-size:14px;line-height:1.45;max-width:100%;}' +
      '#' + id + ' *{box-sizing:border-box;}' +
      '#' + id + ' h4{color:var(--ink);font-size:17px;line-height:1.25;margin:0 0 4px;}' +
      '#' + id + ' .rag-summary{color:var(--ink-dim);margin:0 0 14px;}' +
      '#' + id + ' .rag-board{align-items:stretch;display:grid;gap:12px;grid-template-columns:minmax(0,1fr) minmax(148px,.38fr) minmax(0,1fr);}' +
      '#' + id + ' .rag-lane{background:var(--surface);border:1px solid var(--border);border-radius:10px;min-width:0;padding:12px;}' +
      '#' + id + ' .rag-lane h5{color:var(--accent-ink);font-size:15px;line-height:1.3;margin:0 0 10px;}' +
      '#' + id + ' ol{counter-reset:rag-step;list-style:none;margin:0;padding:0;}' +
      '#' + id + ' li{background:var(--surface-2);border:1px solid var(--border);border-radius:8px;counter-increment:rag-step;margin:0;min-height:54px;padding:8px 9px 8px 34px;position:relative;}' +
      '#' + id + ' li+li{margin-top:19px;}' +
      '#' + id + ' li:before{background:var(--accent-weak);border-radius:50%;color:var(--accent-ink);content:counter(rag-step);font-size:14px;font-weight:700;height:20px;left:8px;line-height:20px;position:absolute;text-align:center;top:9px;width:20px;}' +
      '#' + id + ' li:not(:last-child):after{border-left:2px solid var(--accent);bottom:-16px;content:"";height:12px;left:18px;position:absolute;}' +
      '#' + id + ' li:not(:last-child) strong:after{border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid var(--accent);bottom:-19px;content:"";left:14px;position:absolute;}' +
      '#' + id + ' strong{color:var(--ink);display:block;font-size:14px;line-height:1.25;}' +
      '#' + id + ' .rag-detail{color:var(--ink-dim);display:block;font-size:14px;margin-top:2px;}' +
      '#' + id + ' .rag-bridge{align-self:center;background:var(--accent-weak);border:1px solid var(--accent);border-radius:10px;color:var(--accent-ink);min-height:94px;padding:12px 9px;position:relative;text-align:center;z-index:0;}' +
      '#' + id + ' .rag-bridge:before{background:var(--border);content:"";height:2px;left:-13px;position:absolute;right:-13px;top:50%;z-index:-1;}' +
      '#' + id + ' .rag-bridge:after{border-bottom:6px solid transparent;border-left:8px solid var(--accent);border-top:6px solid transparent;content:"";position:absolute;right:-14px;top:calc(50% - 5px);}' +
      '#' + id + ' .rag-bridge strong{color:var(--accent-ink);}' +
      '#' + id + ' .rag-bridge span{display:block;font-size:14px;margin-top:4px;}' +
      '#' + id + ' .rag-crosscut{background:var(--surface-3);border:1px solid var(--border);border-radius:9px;color:var(--ink-dim);margin:12px 0 0;padding:10px 12px;}' +
      '#' + id + ' .rag-crosscut strong{color:var(--ink);display:inline;font-size:14px;}' +
      '@media (max-width:640px){#' + id + '{font-size:14px;}#' + id + ' .rag-board{grid-template-columns:minmax(0,1fr);}#' + id + ' .rag-bridge{min-height:auto;padding:10px 12px;}#' + id + ' .rag-bridge:before{height:0;left:50%;right:auto;top:-13px;width:2px;}#' + id + ' .rag-bridge:after{border-bottom:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid var(--accent);left:calc(50% - 5px);right:auto;top:-15px;}#' + id + ' .rag-lane{padding:11px;}#' + id + ' li{min-height:52px;}}' +
      '</style>' +
      '<h4 id="' + id + '-title">Retrieval-augmented generation: two paths</h4>' +
      '<p class="rag-summary">A document update produces a versioned index; a user request can retrieve from it only after the permission check.</p>' +
      '<div class="rag-board">' +
      '<article class="rag-lane" aria-labelledby="' + id + '-offline"><h5 id="' + id + '-offline">Document update (offline)</h5><ol>' +
      '<li><strong>source documents</strong><span class="rag-detail">Ingest the material that may become evidence.</span></li>' +
      '<li><strong>parse / OCR / preserve tables</strong><span class="rag-detail">Keep useful structure while extracting searchable text.</span></li>' +
      '<li><strong>source ID, current version, ACL metadata</strong><span class="rag-detail">Keep identity, freshness, and access-control-list metadata with the content.</span></li>' +
      '<li><strong>chunk</strong><span class="rag-detail">Split content into retrieval-sized evidence units.</span></li>' +
      '<li><strong>Build search indexes</strong><span class="rag-detail">Embeddings for vector search; keyword index for lexical search. Choose either or both for the corpus.</span></li>' +
      '<li><strong>validate, publish index version</strong><span class="rag-detail">Only a checked index version becomes available to requests.</span></li>' +
      '</ol></article>' +
      '<aside class="rag-bridge" aria-label="Data flow from a versioned index to permitted retrieval, with permissions checked per request"><strong>versioned index</strong><span>data flow to permitted retrieval; permissions checked per request</span></aside>' +
      '<article class="rag-lane" aria-labelledby="' + id + '-online"><h5 id="' + id + '-online">User question (online)</h5><ol>' +
      '<li><strong>authenticated request</strong><span class="rag-detail">Identify the requesting user or service.</span></li>' +
      '<li><strong>authorize permitted scope</strong><span class="rag-detail">Enforce ACL metadata before content is retrieved.</span></li>' +
      '<li><strong>retrieve candidates</strong><span class="rag-detail">Lexical/vector retrieval; query rewrite is optional.</span></li>' +
      '<li><strong>rerank (optional)</strong><span class="rag-detail">Spend more work only when it improves the selected evidence.</span></li>' +
      '<li><strong>bounded context / evidence</strong><span class="rag-detail">Limit the evidence sent to the model.</span></li>' +
      '<li><strong>LLM</strong><span class="rag-detail">Generate from the request and permitted evidence.</span></li>' +
      '<li><strong>claim support, citations, abstain</strong><span class="rag-detail">Check support and cite sources; abstain when evidence is insufficient.</span></li>' +
      '<li><strong>answer</strong><span class="rag-detail">Return the checked response.</span></li>' +
      '</ol></article>' +
      '</div>' +
      '<p class="rag-crosscut"><strong>Across both paths:</strong> trace source/index version, retrieval, prompt/model; measure freshness, quality, latency, and cost. A citation must support its claim; its presence is not proof.</p>' +
      '</section>';
  };
  C['rag-two-paths'] = 'A responsive RAG diagram separates the offline <b>document-update path</b> from the online request path. Authorization happens before retrieval, and a published index version is the explicit handoff between them.';
}(typeof window !== 'undefined' ? window : this));
