// Public one-document sync contract tests. No Firebase SDK, network, or course data.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const source = fs.readFileSync(path.join(__dirname, 'public-progress.js'), 'utf8');
const window = {
  firebase: {
    firestore: { FieldValue: { serverTimestamp: () => 'SERVER_TIME' } },
    auth: { GoogleAuthProvider: function GoogleAuthProvider() {} }
  }
};
new Function('window', source)(window);
const Public = window.PREP_PUBLIC_PROGRESS;

assert.strictEqual(Public.MAX_PAYLOAD_BYTES, 131072, 'public document size is bounded');
assert.strictEqual(Public.MAX_DRAFT_BYTES, 4096, 'individual synced drafts are bounded');
assert.strictEqual(source.includes('onSnapshot'), false, 'public adapter never opens a continuous listener');
assert.strictEqual(Public.create({ enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }).enabled, false, 'lookalike Firebase config without the public purpose discriminator is disabled');
const shell = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');
assert(shell.includes('/*__PUBLIC_PROGRESS__*/'), 'shell has a separately injectable public adapter marker');
assert(shell.includes('cloudClient.writeBatch(C.meta.id, cloudBaselineState, desired)'), 'public shell writes one transaction batch');
assert(shell.includes('publicFirstDirtyAt + 5000') && shell.includes('publicLastSaveAt + 60000'), 'public shell delays and rate-limits background writes');
assert(shell.includes("document.visibilityState !== 'visible'") && shell.includes('Date.now() - publicLastRefreshAt < 60000'), 'public shell refreshes only on foreground/online at most once a minute');

const local = { topics: { topic: { learn: { one: true }, checks: { one: 2 }, acts: { exercise: { status: 'pass', self: true, lastAnswer: 'draft', attempts: 3, last: { verdict: 'pass' } } } } } };
const projected = Public.projectProgress(local);
assert.strictEqual(projected.topics.topic.acts.exercise.lastAnswer, 'draft', 'bounded drafts sync');
assert.strictEqual(projected.topics.topic.acts.exercise.attempts, undefined, 'attempt history remains local');
assert.strictEqual(projected.topics.topic.acts.exercise.last, undefined, 'grading history remains local');
assert.throws(() => Public.projectProgress({ topics: { topic: { connect: { lastAnswer: 'x'.repeat(4097) } } } }), /under 4 KiB/, 'oversized draft is rejected, never truncated');
assert.throws(() => Public.decodePayload({ schemaVersion: 1, payload: 'x'.repeat(Public.MAX_PAYLOAD_BYTES + 1) }), /exceeds/, 'oversized remote payload fails closed');
assert.deepStrictEqual(Public.projectProgress({ topics: { topic: { learn: { bad: 'true', good: true }, reads: { bad: 1, good: false }, checks: { negative: -1, fraction: 1.5, text: '2', infinite: Infinity, good: 2 } } } }), { topics: { topic: { learn: { good: true }, reads: { good: false }, checks: { good: 2 } } } }, 'untrusted progress scalar types cannot create completed or locked UI state');

const baseline = { topics: { topic: { learn: { local: false, same: false } } } };
const desired = { topics: { topic: { learn: { local: true, same: true } } } };
const remote = { topics: { topic: { learn: { local: false, same: false, otherDevice: true } } } };
const merged = Public.mergeChanges(baseline, desired, remote).state;
assert.deepStrictEqual(merged.topics.topic.learn, { local: true, same: true, otherDevice: true }, 'local diff merges onto fresh remote fields');
assert.notStrictEqual(Public.cacheKey('course', 'account-a'), Public.cacheKey('course', 'account-b'), 'account caches are isolated');

async function testAdapter() {
  let authListener;
  const auth = {
    currentUser: { uid: 'account-a' },
    onAuthStateChanged(fn) { authListener = fn; Promise.resolve().then(() => fn(this.currentUser)); return () => {}; },
    signInWithPopup() { throw new Error('popup should not be needed for existing auth'); },
    signOut() { this.currentUser = null; authListener(null); return Promise.resolve(); }
  };
  const documents = new Map(); const paths = []; let transactionCount = 0;
  function refFor(path) {
    return {
      path,
      get() { const value = documents.get(path); return Promise.resolve({ exists: value !== undefined, data: () => value }); }
    };
  }
  const db = {
    collection(name) { return { doc(uid) { return { collection(child) { return { doc(id) { const ref = refFor(name + '/' + uid + '/' + child + '/' + id); paths.push(ref.path); return ref; } }; } }; } }; },
    runTransaction(fn) {
      transactionCount++;
      return fn({ get: ref => ref.get(), set: (ref, value) => documents.set(ref.path, value) });
    }
  };
  const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db });
  let status = null;
  client.onAuthState(event => { status = event.status; });
  assert.strictEqual(authListener, undefined, 'merely showing optional sync UI does not initialize auth/network');
  await client.signIn();
  assert.strictEqual(status, 'authorized', 'existing verified Google user is authorized after explicit activation');
  documents.set('users/account-a/progress/course', {
    schemaVersion: 1,
    payload: JSON.stringify({ topics: { topic: { learn: { otherDevice: true } } } }),
    updatedAt: 'OLD_SERVER_TIME'
  });
  await client.writeBatch('course', baseline, desired);
  assert.strictEqual(paths[0], 'users/account-a/progress/course', 'writes use only the authenticated account course document');
  assert.strictEqual(transactionCount, 1, 'one batch is one Firestore transaction');
  const stored = documents.get(paths[0]);
  assert.deepStrictEqual(Object.keys(stored).sort(), ['payload', 'schemaVersion', 'updatedAt'], 'document has only contract fields');
  assert.strictEqual(stored.schemaVersion, 1);
  assert.strictEqual(stored.updatedAt, 'SERVER_TIME');
  assert.deepStrictEqual(JSON.parse(stored.payload).topics.topic.learn, { local: true, same: true, otherDevice: true }, 'transaction retains a concurrent device field');
  await assert.rejects(client.read('not-course'), /only for the course/, 'client cannot read another collection/document');
  await client.signOut();
  await assert.rejects(client.read('course'), /Sign in/, 'signed-out reads are denied locally');
  client.close();
}

async function testOfflineErrors() {
  let listener;
  const auth = { currentUser: { uid: 'offline-user' }, onAuthStateChanged(fn) { listener = fn; Promise.resolve().then(() => fn(this.currentUser)); return () => {}; } };
  const offline = new Error('offline fixture');
  const db = {
    collection() { return { doc() { return { collection() { return { doc() { return { get() { return Promise.reject(offline); } }; } }; } }; } }; },
    runTransaction() { return Promise.reject(offline); }
  };
  const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db });
  client.onAuthState(() => {}); await client.signIn();
  await assert.rejects(client.read('course'), /offline fixture/, 'offline hydration failure is surfaced to the shell');
  await assert.rejects(client.writeBatch('course', { topics: {} }, { topics: {} }), /offline fixture/, 'offline transaction failure is surfaced without a fallback write');
  assert.strictEqual(listener !== undefined, true);
  client.close();
}

async function testExplicitRestore() {
  let listener, events = 0;
  const auth = { currentUser: { uid: 'returning-user' }, onAuthStateChanged(fn) { listener = fn; Promise.resolve().then(() => fn(this.currentUser)); return () => {}; } };
  const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db: {} });
  client.onAuthState(() => { events++; });
  assert.strictEqual(listener, undefined, 'showing the public guest UI alone does not initialize Firebase');
  await client.restore();
  assert.strictEqual(client.getContext().uid, 'returning-user', 'explicit local opt-in restores a returning signed-in visitor');
  const afterRestore = events;
  await listener({ uid: 'returning-user' });
  assert.strictEqual(events, afterRestore, 'a duplicate same-UID Firebase callback does not reauthorize or reset shell controls');
  client.close();
}

async function testColdSignInWaitsForInitialAuthState() {
  let listener, settled = false; const events = [];
  const auth = { currentUser: null, onAuthStateChanged(fn) { listener = fn; return () => {}; }, signInWithPopup() { throw new Error('cold click must not open a popup'); } };
  const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db: {} });
  client.onAuthState(event => events.push(event));
  const first = client.signIn().then(() => { settled = true; }, error => { settled = true; return Promise.reject(error); });
  await Promise.resolve(); await Promise.resolve();
  assert.strictEqual(settled, false, 'cold sign-in waits for Firebase initial auth state instead of racing its late callback');
  listener(null);
  await assert.rejects(first, /ready\. Select Sign in to sync once more/);
  assert.strictEqual(events[events.length - 1].status, 'error', 'the cold-load readiness hint is emitted after the initial signed-out callback');
  assert.match(events[events.length - 1].error.message, /Select Sign in to sync once more/);
  client.close();
}

async function testCloseCancelsPendingInitialAuth() {
  async function assertCancelled(method) {
    let listener, unsubscribed = 0;
    const auth = { currentUser: null, onAuthStateChanged(fn) { listener = fn; return () => { unsubscribed++; }; } };
    const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db: {} });
    client.onAuthState(() => {});
    const pending = client[method](); await Promise.resolve(); await Promise.resolve();
    assert.strictEqual(typeof listener, 'function', method + ' registers the initial Firebase callback');
    client.close();
    await assert.rejects(pending, /sync was closed/, method + ' rejects promptly when close wins the initial auth race');
    assert.strictEqual(unsubscribed, 1, 'close unsubscribes the pending initial auth observer');
  }
  await assertCancelled('signIn');
  await assertCancelled('restore');
}

async function testFailedInitialAuthUnsubscribesBeforeRetry() {
  const listeners = [];
  const auth = {
    currentUser: null,
    onAuthStateChanged(success, failure) {
      const listener = { success, failure, active: true };
      listeners.push(listener);
      return () => { listener.active = false; };
    }
  };
  const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db: {} });
  client.onAuthState(() => {});
  const first = client.restore(); await Promise.resolve(); await Promise.resolve();
  listeners[0].failure(new Error('initial auth fixture'));
  await assert.rejects(first, /initial auth fixture/);
  assert.strictEqual(listeners[0].active, false, 'a failed pre-ready observer is unsubscribed before retry');
  const retry = client.restore(); await Promise.resolve(); await Promise.resolve();
  assert.strictEqual(listeners.length, 2, 'retry registers a fresh observer');
  assert.strictEqual(listeners.filter(listener => listener.active).length, 1, 'retry leaves exactly one Firebase auth observer live');
  listeners[1].success(null);
  await retry;
  client.close();
}

async function testSignOutFailureRestoresVerifiedContext() {
  let listener, events = 0;
  const auth = {
    currentUser: { uid: 'still-signed-in' },
    onAuthStateChanged(fn) { listener = fn; Promise.resolve().then(() => fn(this.currentUser)); return () => {}; },
    signOut() { return Promise.reject(new Error('sign-out fixture')); }
  };
  const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db: {} });
  client.onAuthState(() => { events++; }); await client.restore();
  const beforeRejectedSignOut = events;
  await assert.rejects(client.signOut(), /sign-out fixture/);
  assert.strictEqual(client.getContext().uid, 'still-signed-in', 'a rejected sign-out restores the still-verified account context');
  assert.strictEqual(events, beforeRejectedSignOut, 'a rejected sign-out does not emit a redundant authorized event into an already-bound shell');
  assert.strictEqual(listener !== undefined, true); client.close();
}

async function testTransactionRetryUsesFreshRemote() {
  let listener; const writes = [];
  const auth = { currentUser: { uid: 'retry-user' }, onAuthStateChanged(fn) { listener = fn; Promise.resolve().then(() => fn(this.currentUser)); return () => {}; } };
  const remotes = [
    { topics: { topic: { learn: { firstAttemptOnly: true } } } },
    { topics: { topic: { learn: { secondAttemptOnly: true } } } }
  ];
  const ref = { path: 'users/retry-user/progress/course' };
  const db = {
    collection() { return { doc() { return { collection() { return { doc() { return ref; } }; } }; } }; },
    runTransaction(fn) {
      let index = 0;
      function transaction() {
        const remote = remotes[index++];
        return { get() { return Promise.resolve({ exists: true, data: () => ({ schemaVersion: 1, payload: JSON.stringify(remote) }) }); }, set(_ref, value) { writes.push(value); } };
      }
      return fn(transaction()).then(() => fn(transaction()));
    }
  };
  const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db });
  client.onAuthState(() => {}); await client.restore();
  const base = { topics: { topic: { learn: { local: false } } } };
  const desired = { topics: { topic: { learn: { local: true } } } };
  const result = await client.writeBatch('course', base, desired);
  assert.deepStrictEqual(base, { topics: { topic: { learn: { local: false } } } }, 'transaction retry never mutates acknowledged baseline');
  assert.deepStrictEqual(desired, { topics: { topic: { learn: { local: true } } } }, 'transaction retry never mutates desired local snapshot');
  assert.deepStrictEqual(result.topics.topic.learn, { local: true, secondAttemptOnly: true }, 'final retry merges the local diff onto its fresh remote read');
  assert.deepStrictEqual(JSON.parse(writes[1].payload).topics.topic.learn, { local: true, secondAttemptOnly: true }, 'final transaction payload is the acknowledged retry result');
  assert.strictEqual(listener !== undefined, true); client.close();
}

async function testSdkLoadFailureCanRetry() {
  const priorDocument = global.document; const scripts = []; let failFirst = true, autoLoad = true;
  const auth = { currentUser: { uid: 'retry-sdk-user' }, onAuthStateChanged(fn) { Promise.resolve().then(() => fn(this.currentUser)); return () => {}; } };
  const db = {}; let activeAuth = auth, activeDb = db;
  window.firebase.apps = [];
  window.firebase.initializeApp = function () { const app = { name: 'interview-prep-public-c', auth() { return activeAuth; }, firestore() { return activeDb; } }; window.firebase.apps.push(app); return app; };
  global.document = {
    querySelector() { return null; },
    createElement() { return { dataset: {}, getAttribute(name) { return this.attributes && this.attributes[name] || null; }, setAttribute() {}, addEventListener() {}, parentNode: null }; },
    head: { appendChild(script) { script.parentNode = this; scripts.push(script); if (autoLoad) Promise.resolve().then(() => { if (failFirst) { failFirst = false; script.onerror(); } else script.onload(); }); }, removeChild(script) { const index = scripts.indexOf(script); if (index >= 0) scripts.splice(index, 1); script.parentNode = null; } }
  };
  try {
    const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } });
    client.onAuthState(() => {});
    await assert.rejects(client.restore(), /Could not load/);
    await client.restore();
    assert.strictEqual(client.getContext().uid, 'retry-sdk-user', 'a transient SDK script failure can be retried without reload');
    assert.strictEqual(scripts.length, 3, 'retry replaces the failed script and completes all SDK loads');
    client.close();
    // Closing during the lazy first script load must stop before Firebase app
    // initialization and observer registration, even when that script later loads.
    scripts.length = 0; autoLoad = false; window.firebase.apps = [];
    let observers = 0;
    activeAuth = { currentUser: null, onAuthStateChanged() { observers++; return () => {}; } }; activeDb = {};
    const closingClient = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } });
    closingClient.onAuthState(() => {});
    const pending = closingClient.signIn(); await Promise.resolve(); await Promise.resolve();
    assert.strictEqual(scripts.length, 1, 'cold sign-in begins only the first deferred SDK script');
    closingClient.close(); scripts[0].onload();
    await assert.rejects(pending, /sync was closed/, 'close during lazy SDK load rejects the pending sign-in');
    assert.strictEqual(observers, 0, 'lazy script completion after close registers no Firebase observer');
    assert.strictEqual(window.firebase.apps.length, 0, 'lazy script completion after close initializes no Firebase app');
  } finally { global.document = priorDocument; }
}

Promise.all([testAdapter(), testOfflineErrors(), testExplicitRestore(), testColdSignInWaitsForInitialAuthState(), testCloseCancelsPendingInitialAuth(), testFailedInitialAuthUnsubscribesBeforeRetry(), testSignOutFailureRestoresVerifiedContext(), testTransactionRetryUsesFreshRemote(), testSdkLoadFailureCanRetry()]).then(() => console.log('test_public_progress: OK'), error => { console.error(error); process.exitCode = 1; });
