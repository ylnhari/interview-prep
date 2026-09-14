// Pure progress/cloud contract tests. No Firebase SDK, network, or private content.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const source = fs.readFileSync(path.join(__dirname, 'cloud-progress.js'), 'utf8');
const window = {};
new Function('window', source)(window);
const Cloud = window.PREP_CLOUD;

const local = {
  view: 'topic-a',
  topics: {
    'topic-a': {
      learn: { 'section-1': false, 'section-2': true },
      acts: { 'exercise-1': { status: 'pass', lastAnswer: 'draft answer', attempts: 2, last: { verdict: 'pass' }, lastScore: 90 } },
      checks: { 'section-1': 0 }, connect: { status: 'retry', lastAnswer: '' }
    }
  }
};
const flat = Cloud.flatten(local);
assert(Object.keys(flat).length >= 4, 'nested progress fields flatten separately');
assert(Object.values(flat).some(x => x.parts.join('/') === 'topics/topic-a/learn/section-1' && x.value === false), 'explicit uncheck is retained');
assert(Object.values(flat).some(x => x.parts.join('/') === 'topics/topic-a/checks/section-1' && x.value === 0), 'zero answer is retained');
const projected = Cloud.projectProgress(local);
assert.strictEqual(Object.prototype.hasOwnProperty.call(projected.topics['topic-a'].acts['exercise-1'], 'lastAnswer'), false, 'saved answer drafts remain browser-local');
assert.strictEqual(Object.prototype.hasOwnProperty.call(projected.topics['topic-a'].acts['exercise-1'], 'attempts'), false, 'grading attempt counts stay local');
assert.strictEqual(Object.prototype.hasOwnProperty.call(projected.topics['topic-a'].acts['exercise-1'], 'last'), false, 'grading feedback stays local');
assert.strictEqual(Object.prototype.hasOwnProperty.call(projected.topics['topic-a'].acts['exercise-1'], 'lastScore'), false, 'grading scores stay local');
assert.strictEqual(Object.prototype.hasOwnProperty.call(projected.topics['topic-a'].connect, 'lastAnswer'), false, 'empty draft values remain browser-local too');
const projectedFlat = Cloud.flatten(projected);
const records = {};
Object.keys(projectedFlat).forEach(key => { records[key] = { parts: projectedFlat[key].parts, value: projectedFlat[key].value, deleted: false }; });
const rebuilt = Cloud.applyRecords({ topics: {}, whoOpen: true }, records);
assert.deepStrictEqual(rebuilt.topics['topic-a'].learn, { 'section-1': false, 'section-2': true });
assert.strictEqual(Object.prototype.hasOwnProperty.call(rebuilt.topics['topic-a'].acts['exercise-1'], 'lastAnswer'), false, 'cloud records contain no saved answer text');

const topicIdKey = Object.keys(flat).find(key => flat[key].parts.join('/') === 'topics/topic-a/learn/section-2');
const removed = Cloud.applyRecords(rebuilt, { [topicIdKey]: { parts: ['topics', 'topic-a', 'learn', 'section-2'], deleted: true } });
assert(!Object.prototype.hasOwnProperty.call(removed.topics['topic-a'].learn, 'section-2'), 'tombstone removes an explicitly deleted leaf');

const base = { topics: { 'topic-a': { learn: { 'section-1': true, 'section-2': true }, acts: { 'exercise-1': { status: 'none', lastAnswer: 'old' } } } } };
const offline = { topics: { 'topic-a': { learn: { 'section-1': false, 'section-2': true }, acts: { 'exercise-1': { status: 'none', lastAnswer: 'offline draft', attempts: 4, last: { verdict: 'retry' } } } } } };
const online = { topics: { 'topic-a': { learn: { 'section-1': true, 'section-2': false }, acts: { 'exercise-1': { status: 'pass', lastAnswer: 'remote draft' } } } } };
const mergedState = Cloud.mergeProgress(base, offline, online);
const merged = { state: mergedState };
assert.strictEqual(merged.state.topics['topic-a'].learn['section-1'], false, 'offline explicit uncheck wins same-field conflict in local merge');
assert.strictEqual(merged.state.topics['topic-a'].learn['section-2'], false, 'independent remote field change is retained');
assert.strictEqual(merged.state.topics['topic-a'].acts['exercise-1'].status, 'pass', 'independent remote object field is retained');
assert.strictEqual(merged.state.topics['topic-a'].acts['exercise-1'].lastAnswer, 'offline draft', 'offline saved draft wins same-field conflict');
assert.strictEqual(merged.state.topics['topic-a'].acts['exercise-1'].attempts, 4, 'local grading history survives progress sync');
assert.strictEqual(merged.state.topics['topic-a'].acts['exercise-1'].last.verdict, 'retry', 'local grading feedback survives progress sync');

assert.strictEqual(Cloud.validProgressLeaf(['topics', 'topic-a', 'acts', 'exercise-1', 'lastAnswer'], 'draft'), false, 'saved answer text is rejected by the adapter allowlist');
assert.strictEqual(Cloud.validProgressLeaf(['topics', 'topic-a', 'acts', 'exercise-1', 'last'], { verdict: 'pass' }), false, 'grading result object is not in the cloud allowlist');
assert.strictEqual(Cloud.validProgressLeaf(['topics', 'topic-a', 'connect', 'attempts'], 2), false, 'attempt count is not in the cloud allowlist');
const accountTicket = Cloud.accountTicket('account-a', 7, 'account-cache-a');
assert.strictEqual(Cloud.matchesAccountTicket(accountTicket, 'account-a', 7, 'account-cache-a'), true);
assert.strictEqual(Cloud.matchesAccountTicket(accountTicket, 'account-b', 8, 'account-cache-b'), false, 'delayed migration cannot target the newly active account');

const beforeContentUpdate = Cloud.flatten({ topics: { 'topic-a': { learn: { 'section-1': true } } } });
const afterContentUpdate = Cloud.flatten({ topics: { 'topic-a': { learn: { 'section-1': true, 'new-section': false } } } });
assert.strictEqual(Cloud.diff(beforeContentUpdate, afterContentUpdate)[Object.keys(Cloud.diff(beforeContentUpdate, afterContentUpdate))[0]].parts.join('/'), 'topics/topic-a/learn/new-section', 'stable ids preserve existing progress and add new sections independently');

assert.notStrictEqual(Cloud.cacheKey('course', 'uid-one'), Cloud.cacheKey('course', 'uid-two'), 'local caches are account-scoped');
const storage = new Map([
  ['prep-state-course-v1', 'guest'],
  [Cloud.cacheKey('course', 'uid-one'), 'account-one'],
  [Cloud.cacheKey('course', 'uid-one') + '-baseline', 'baseline-one'],
  [Cloud.cacheKey('course', 'uid-two'), 'account-two']
]);
Cloud.clearAccountCache({ removeItem: key => storage.delete(key) }, 'course', 'uid-one');
assert.strictEqual(storage.get('prep-state-course-v1'), 'guest', 'signout cleanup preserves guest progress');
assert.strictEqual(storage.has(Cloud.cacheKey('course', 'uid-one')), false, 'signout cleanup removes current account cache');
assert.strictEqual(storage.has(Cloud.cacheKey('course', 'uid-two')), true, 'signout cleanup does not remove another account cache');
assert.strictEqual(Cloud.isAuthorized({ uid: 'owner' }, { enabled: true }, {}), true);
assert.strictEqual(Cloud.isAuthorized(null, { enabled: true }, {}), false, 'anonymous auth never authorizes cloud access');
assert.strictEqual(Cloud.isAuthorized({ uid: 'other' }, { enabled: false }, {}), false, 'missing/disabled owner marker denies cloud access');
assert.strictEqual(Cloud.isAuthorized({ uid: 'other' }, { enabled: true }, { ownerUid: 'fixture-owner' }), false, 'fixture owner mismatch denies access');

const readingChecks = { '0': true, '1': false };
const readingList = [{ u: 'https://example.test/a' }, { u: 'https://example.test/b' }];
assert.strictEqual(Cloud.migrateIndexedReads(readingChecks, readingList), true, 'legacy numeric reading ticks migrate');
assert.deepStrictEqual(readingChecks, { 'https://example.test/a': true, 'https://example.test/b': false }, 'migration preserves checked and explicit unchecked values');
assert.strictEqual(Cloud.migrateIndexedReads(readingChecks, [readingList[1], readingList[0]]), false, 'stable URL keys survive reorder without remigration');

const disabled = Cloud.create(null);
let disabledStatus = null;
disabled.onAuthState(event => { disabledStatus = event.status; });
assert.strictEqual(disabled.enabled, false);
assert.strictEqual(disabledStatus, 'disabled', 'no config leaves progress local');
disabled.read('course').then(() => { throw new Error('anonymous read unexpectedly succeeded'); }, error => {
  assert.match(error.message, /not authorized/);
});

async function testRaces() {
  let authListener, authErrorListener;
  const markerWaiters = new Map();
  const auth = {
    currentUser: null,
    onAuthStateChanged(fn, onError) { authListener = fn; authErrorListener = onError; Promise.resolve().then(() => fn(auth.currentUser)); return () => {}; },
    signOut() { auth.currentUser = null; authListener(null); return Promise.resolve(); }
  };
  const db = { doc(path) {
    const uid = path.split('/')[1];
    return { get() { return new Promise(resolve => { const q = markerWaiters.get(uid) || []; q.push(resolve); markerWaiters.set(uid, q); }); } };
  } };
  const client = Cloud.create({ enabled: true, firebase: { apiKey: 'fixture', authDomain: 'fixture', projectId: 'fixture', appId: 'fixture' } }, { auth, db });
  const events = [];
  client.onAuthState(event => events.push(event));
  await new Promise(resolve => setImmediate(resolve));
  function resolveMarker(uid) {
    const waiters = markerWaiters.get(uid) || [];
    assert(waiters.length, 'owner marker read started for ' + uid);
    waiters.shift()({ exists: true, data: () => ({ enabled: true }) });
  }
  auth.currentUser = { uid: 'account-a' }; authListener(auth.currentUser);
  auth.currentUser = { uid: 'account-b' }; authListener(auth.currentUser);
  resolveMarker('account-b'); await new Promise(resolve => setImmediate(resolve));
  resolveMarker('account-a'); await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(client.getContext().uid, 'account-b', 'late A marker result cannot replace current B authorization');
  assert.deepStrictEqual(events.filter(event => event.status === 'authorized').map(event => event.uid), ['account-b'], 'only current identity emits authorized');

  auth.currentUser = { uid: 'account-c' }; authListener(auth.currentUser);
  await new Promise(resolve => setImmediate(resolve));
  const signout = client.signOut();
  await signout;
  resolveMarker('account-c'); await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(client.getContext(), null, 'signout invalidates an in-flight owner-marker read');
  assert.deepStrictEqual(events.filter(event => event.status === 'authorized').map(event => event.uid), ['account-b']);
  auth.currentUser = { uid: 'revoked-account' }; authListener(auth.currentUser);
  await new Promise(resolve => setImmediate(resolve));
  const denied = markerWaiters.get('revoked-account').shift();
  denied({ exists: true, data: () => ({ enabled: false }) });
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(client.getContext(), null, 'disabled owner marker leaves no authorized context');
  assert(events.some(event => event.status === 'not_enabled' && event.uid === 'revoked-account'), 'revocation event identifies only the denied UID for cache cleanup');
  auth.currentUser = { uid: 'error-account' }; authListener(auth.currentUser);
  await new Promise(resolve => setImmediate(resolve));
  authErrorListener(new Error('fixture auth error'));
  const statusesBeforeLateMarker = events.filter(event => event.status === 'authorized').map(event => event.uid);
  resolveMarker('error-account'); await new Promise(resolve => setImmediate(resolve));
  assert.deepStrictEqual(events.filter(event => event.status === 'authorized').map(event => event.uid), statusesBeforeLateMarker, 'auth error invalidates pending authorization results');
  client.close();

  let revision = 1, dirty = true, firstRelease;
  const writes = [];
  let runCount = 0;
  const drain = Cloud.createSerialDrain(async function () {
    const ticket = revision, payload = ticket; runCount++;
    if (runCount === 1) await new Promise(resolve => { firstRelease = resolve; });
    writes.push(payload);
    if (ticket === revision) dirty = false; else dirty = true;
  });
  const first = drain.request();
  await Promise.resolve();
  revision = 2; drain.request();
  firstRelease(); await first;
  assert.deepStrictEqual(writes, [1, 2], 'a newer edit drains after the in-flight snapshot, never concurrently');
  assert.strictEqual(dirty, false, 'dirty clears only after the latest revision drains');
}

testRaces().then(() => console.log('test_cloud_progress: OK'), error => { console.error(error); process.exitCode = 1; });
