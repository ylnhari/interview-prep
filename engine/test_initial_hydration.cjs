// Dependency-free regression for the private renderer's first-hydration rules.
// It exercises the real progress merge helper and structurally verifies the
// shell-only DOM guard/route handoff because this suite has no browser DOM.
// Usage: node engine/test_initial_hydration.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const cloudSource = fs.readFileSync(path.join(__dirname, 'cloud-progress.js'), 'utf8');
const window = {};
new Function('window', cloudSource)(window);
const Cloud = window.PREP_CLOUD;

const remote = {
  topics: {
    'deep-topic': {
      learn: { 'old-section': true }, checks: { 'old-section': 2 },
      acts: { practice: { status: 'pass', self: true } },
      connect: { status: 'retry' }, said: true
    }
  }
};
const hydrated = Cloud.projectProgress(remote);
const merged = Cloud.mergeProgress(hydrated, hydrated, hydrated);
merged.view = 'deep-topic';
assert.deepStrictEqual(merged.topics, hydrated.topics, 'fresh-cache hydration retains every existing remote progress field');
assert.strictEqual(merged.view, 'deep-topic', 'validated URL view is independent of progress fields');
assert.strictEqual(Object.prototype.hasOwnProperty.call(Cloud.projectProgress(merged), 'view'), false, 'route view is never written as cloud progress');

const oldBase = { topics: { 'deep-topic': { learn: { local: false, remote: false } } } };
const staleCache = { topics: { 'deep-topic': { learn: { local: true, remote: false } } } };
const newerRemote = { topics: { 'deep-topic': { learn: { local: false, remote: true } } } };
const reconciled = Cloud.mergeProgress(oldBase, staleCache, newerRemote);
assert.deepStrictEqual(reconciled.topics['deep-topic'].learn, { local: true, remote: true }, 'stale cache keeps its independent local change and the newer independent remote field');

const shell = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');
function ordered(markers, label) {
  let index = -1;
  for (const marker of markers) {
    const next = shell.indexOf(marker, index + 1);
    assert(next > index, label + ': missing/out-of-order marker ' + marker);
    index = next;
  }
}

ordered([
  "var privateHost = window.PREP_PRIVATE === true;",
  "book.inert = true; book.setAttribute('aria-busy', 'true');",
  "['click','input','change'].forEach(function (type) { book.addEventListener(type, privateHydrationGuard, true); });",
  'function renderAll()'
], 'private book is guarded synchronously before its first render');
assert(shell.includes("if (privateHost && !privateReady) privateInitialRoute = { view: state.view, pendingScroll: state.pendingScroll };"), 'validated hash route is captured before hydration');
assert(shell.includes('renderAccountState(records, cloudRevision === hydrationRevision ? cached : state, hydrationBase, initialRoute);'), 'initial hydration uses its start baseline and preserves edits made while the server read is pending');
assert(shell.includes('if (initialRoute && initialRoute.view) merged.view = initialRoute.view;'), 'hydration restores the validated deep-linked view');
assert(shell.includes('hydrateCloud().then(function () { if (publicMode) saveButton.hidden = false; settlePrivateReady(); }, function (error) { settlePrivateReady(error); });'), 'book readiness follows hydration completion');
assert(shell.includes('whenReady: function () { return privateReadyPromise; }'), 'private host can await renderer readiness');

console.log('test_initial_hydration: OK (real merge semantics plus structural DOM guard/route checks; no browser DOM in dependency-free suite)');
