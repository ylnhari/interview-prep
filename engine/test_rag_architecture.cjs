// Contract test for the self-contained responsive RAG architecture visual.
// Usage: node engine/test_rag_architecture.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const source = fs.readFileSync(path.join(__dirname, 'viz', 'rag-architecture.js'), 'utf8');
const window = { VIZLIB: {}, VIZLIB_CAPTIONS: {} };
new Function('window', source)(window);

assert.strictEqual(typeof window.VIZLIB['rag-two-paths'], 'function', 'diagram factory is registered');
assert(window.VIZLIB_CAPTIONS['rag-two-paths'], 'diagram has a caption');

const one = window.VIZLIB['rag-two-paths']('unitRagOne');
const two = window.VIZLIB['rag-two-paths']('unitRagTwo');
assert(one.includes('id="unitRagOne-rag-two-paths"'), 'first instance owns its scoped root id');
assert(two.includes('id="unitRagTwo-rag-two-paths"'), 'second instance owns its scoped root id');
assert(one.includes('#unitRagOne-rag-two-paths') && !one.includes('#unitRagTwo-rag-two-paths'), 'first instance styles do not leak into the second');
assert(two.includes('#unitRagTwo-rag-two-paths') && !two.includes('#unitRagOne-rag-two-paths'), 'second instance styles do not leak into the first');

[
  'Document update (offline)', 'source documents', 'parse / OCR / preserve tables',
  'source ID, current version, ACL metadata', 'chunk', 'Build search indexes',
  'validate, publish index version', 'User question (online)', 'authenticated request',
  'authorize permitted scope', 'retrieve candidates', 'rerank (optional)',
  'bounded context / evidence', 'LLM', 'claim support, citations, abstain', 'answer',
  'Embeddings for vector search; keyword index for lexical search.',
  'versioned index', 'permissions checked per request', 'data flow to permitted retrieval',
  'trace source/index version, retrieval, prompt/model',
  'measure freshness, quality, latency, and cost'
].forEach((label) => assert(one.includes(label), 'missing required label: ' + label));
assert(!one.includes('embed + lexical/vector index'), 'embedding is not presented as mandatory for lexical-only retrieval');

assert(one.includes('<article') && one.includes('<ol>') && one.includes('aria-label'), 'all diagram meaning is available in semantic HTML');
assert(one.includes('@media (max-width:640px)') && one.includes('grid-template-columns:minmax(0,1fr);'), 'narrow view stacks readable steps');
assert(one.includes('font-size:14px'), 'step labels remain at least 14px');
assert(!/<script\b|\b(?:src|href)\s*=|https?:\/\//i.test(one), 'rendered diagram has no script or external request');
assert(!/#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b|\brgba?\(|\bhsl[a]?\(/i.test(source), 'diagram has no hardcoded palette');
assert(!/engine\/shell|fetch\(|XMLHttpRequest|addEventListener/i.test(source), 'diagram does not depend on shell edits, controls, or network code');

console.log('test_rag_architecture: OK (isolated responsive semantic RAG visual)');
