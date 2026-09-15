// Executes selected public-mode shell functions in a synthetic lexical harness.
// This intentionally tests behavior, not source-marker presence or Firebase.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const shell = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');
const publicWindow = { firebase: { firestore: { FieldValue: { serverTimestamp() { return 'now'; } } }, auth: { GoogleAuthProvider: function () {} } } };
new Function('window', fs.readFileSync(path.join(__dirname, 'public-progress.js'), 'utf8'))(publicWindow);
const Public = publicWindow.PREP_PUBLIC_PROGRESS;
function functionSource(name) {
  const start = shell.indexOf('function ' + name + '(');
  assert(start >= 0, 'missing shell function ' + name);
  const brace = shell.indexOf('{', start); let depth = 0;
  for (let i = brace; i < shell.length; i++) {
    if (shell[i] === '{') depth++;
    else if (shell[i] === '}' && --depth === 0) return shell.slice(start, i + 1);
  }
  throw new Error('unterminated shell function ' + name);
}
function runFunction(name, context) {
  return new Function('context', 'with (context) { return (' + functionSource(name) + '); }')(context);
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

async function testDraftOnlySave() {
  const timers = []; const sync = [];
  const context = {
    draftTimer: null, cloudUid: 'u', publicMode: true, cloudDirty: false, cloudRevision: 0, guestPersistenceFailed: false,
    state: { topics: {} }, accountKey: 'account', LS_KEY: 'guest',
    clearTimeout() {}, setTimeout(fn) { timers.push(fn); return timers.length; },
    saveState(key, value) { assert.strictEqual(key, 'account'); assert.strictEqual(value, context.state); return true; }, window: { navigator: { onLine: true } },
    setSync(...args) { sync.push(args); }, scheduleCloudSave() { context.scheduled = (context.scheduled || 0) + 1; }
  };
  runFunction('persistDraft', context)('topic');
  assert.strictEqual(context.cloudDirty, true, 'draft-only edit is immediately dirty');
  assert.strictEqual(context.cloudRevision, 1, 'draft edit advances the revision fence');
  assert.deepStrictEqual(sync[0], ['pending', 'draft saved here; syncing']);
  timers[0]();
  assert.strictEqual(context.scheduled, 1, 'draft debounce schedules a public save');
}

async function testOfflineSignoutIsBounded() {
  const messages = [];
  const context = {
    cloudClient: {}, publicMode: true, cloudDirty: true, localPersistenceFailed: true, cloudDrain: { request() { throw new Error('must not flush offline'); } },
    window: { navigator: { onLine: false } }, setSync(...args) { messages.push(args); }, confirm() { return false; }, exportProgress() { throw new Error('declined backup must not export'); }, Promise
  };
  context.publicBackupAndSignOut = runFunction('publicBackupAndSignOut', context);
  const result = await runFunction('signOutCloud', context)();
  assert.strictEqual(result, false, 'offline sign-out refuses rather than recursively draining');
  assert.match(messages[0][1], /offline/);
  assert.strictEqual(/is saved in this browser/.test(messages[0][1]), false, 'storage failure is never described as durable during sign-out');
}

async function testStaleRefreshCannotRollbackEdit() {
  const read = deferred(); let renders = 0;
  const context = {
    publicMode: true, cloudUid: 'u', cloudBaselineState: { topics: {} }, cloudDirty: false,
    cloudGeneration: 1, cloudRevision: 1, publicLastRefreshAt: 0,
    cloudDrain: { isRunning() { return false; } }, Date: { now() { return 120000; } },
    window: { navigator: { onLine: true } }, C: { meta: { id: 'course' } },
    cloudClient: { read() { return read.promise; } },
    progressApi: { projectProgress(value) { return value; }, mergeProgress() { throw new Error('stale read must not merge'); } },
    saveState() { throw new Error('stale read must not save'); }, renderPreservingTextFocus() { renders++; }, scheduleCloudSave() {}, setSync() {}
  };
  runFunction('refreshPublicProgress', context)();
  context.cloudRevision = 2; // a local edit happened while the read was in flight
  read.resolve({ topics: { remote: true } }); await Promise.resolve(); await Promise.resolve();
  assert.strictEqual(renders, 0, 'stale foreground response cannot rerender over newer local progress');
}

async function testTransactionRerendersCurrentState() {
  let renderCount = 0; const write = deferred(); let postRenderEdit;
  const context = {
    cloudClient: { writeBatch() { return write.promise; } },
    cloudUid: 'u', cloudBaselineState: { topics: { topic: { learn: { before: false } } } }, cloudDirty: true,
    cloudGeneration: 1, cloudRevision: 1, publicMode: true, guestPersistenceFailed: false, C: { meta: { id: 'course' }, },
    window: { navigator: { onLine: true } },
    progressApi: Public,
    state: { topics: { topic: { learn: { before: true } } } }, accountKey: 'account', baselineKey: 'baseline',
    saveState() {}, renderPreservingTextFocus() { renderCount++; postRenderEdit = function () { context.state.topics.topic.learn.afterRender = true; }; }, Date: { now() { return 1; } },
    publicLastSaveAt: 0, publicFirstDirtyAt: 1, publicRetryDelay: 1000, setSync() {}, scheduleCloudSave() { context.rescheduled = (context.rescheduled || 0) + 1; }, schedulePublicRetry() {}, Promise
  };
  const flush = runFunction('flushCloudBatch', context)();
  context.state.topics.topic.learn.duringWrite = true; context.cloudRevision = 2;
  write.resolve({ topics: { topic: { learn: { remote: true, before: true } } } }); await flush;
  assert.strictEqual(renderCount, 1, 'successful transaction replaces and rerenders the active state object');
  assert.deepStrictEqual(context.state.topics.topic.learn, { remote: true, before: true, duringWrite: true }, 'transaction result keeps a later in-flight edit and remote field');
  assert.strictEqual(context.cloudDirty, true, 'later edit remains dirty after earlier transaction acknowledgement');
  assert.strictEqual(context.rescheduled, 1, 'later edit is scheduled for its own transaction');
  postRenderEdit();
  assert.strictEqual(context.state.topics.topic.learn.afterRender, true, 'post-rerender handlers target the replacement state object');
}

async function testInitialHydrationKeepsEditMadeDuringRead() {
  const read = deferred(); let renderedWith;
  const cached = null;
  const edited = { topics: { topic: { learn: { duringRead: true } } } };
  const context = {
    cloudUid: null, cloudGeneration: 0, cloudBaselineState: null, draftTimer: null, guestState: { topics: {} }, state: { topics: {} }, cloudRevision: 0, LS_KEY: 'guest', guestPersistenceFailed: false,
    accountKey: null, baselineKey: null, privateInitialRoute: null, publicMode: true, hydrationPromise: null, hydrateCloud: null,
    accountStartResolve: null, C: { meta: { id: 'course' } }, migrateButton: {}, saveButton: {},
    clearTimeout() {}, cloneState(value) { return JSON.parse(JSON.stringify(value)); }, saveState() {}, accountStateKey() { return 'account'; }, accountBaseKey() { return 'base'; },
    readState(key) { return key === 'account' ? cached : null; }, emptyState() { return { topics: {} }; }, renderAll() {}, setSync() {},
    cloudClient: { read() { return read.promise; }, getContext() { return { uid: 'u' }; } },
    renderAccountState(records, receivedCached, receivedBase) { renderedWith = Public.mergeProgress(receivedBase, receivedCached, records); }, hasProgress() { return false; }, settlePrivateReady() {}
  };
  runFunction('beginAccount', context)({ uid: 'u' });
  context.state = edited; context.cloudRevision = 1; // user toggled a mark while server read was pending
  read.resolve({ topics: { topic: { learn: { remoteBeforeRead: true } } } }); await Promise.resolve(); await Promise.resolve();
  assert.deepStrictEqual(renderedWith.topics.topic.learn, { remoteBeforeRead: true, duringRead: true }, 'initial hydration retains remote progress and the current edit, not its stale pre-read cache');
}

async function testHydrationWithoutBaselineKeepsCachedProgress() {
  const read = deferred(); let renderedWith;
  const cached = { topics: { topic: { learn: { cachedBeforeReopen: true } } } };
  const context = {
    cloudUid: null, cloudGeneration: 0, cloudBaselineState: null, draftTimer: null, guestState: { topics: {} }, state: { topics: {} }, cloudRevision: 0, LS_KEY: 'guest', guestPersistenceFailed: false,
    accountKey: null, baselineKey: null, privateInitialRoute: null, publicMode: true, hydrationPromise: null, hydrateCloud: null,
    accountStartResolve: null, C: { meta: { id: 'course' } }, migrateButton: {}, saveButton: {},
    clearTimeout() {}, cloneState(value) { return JSON.parse(JSON.stringify(value)); }, saveState() {}, accountStateKey() { return 'account'; }, accountBaseKey() { return 'base'; },
    readState(key) { return key === 'account' ? cached : null; }, emptyState() { return { topics: {} }; }, renderAll() {}, setSync() {}, scheduleCloudSave() {},
    cloudClient: { read() { return read.promise; }, getContext() { return { uid: 'u' }; } },
    renderAccountState(records, receivedCached, receivedBase) { renderedWith = Public.mergeProgress(receivedBase, receivedCached, records); }, hasProgress() { return false; }, settlePrivateReady() {}
  };
  runFunction('beginAccount', context)({ uid: 'u' });
  read.resolve({ topics: { topic: { learn: { remoteBeforeReopen: true } } } }); await Promise.resolve(); await Promise.resolve();
  assert.deepStrictEqual(renderedWith.topics.topic.learn, { remoteBeforeReopen: true, cachedBeforeReopen: true }, 'a missing baseline treats cached progress as a local diff and preserves it alongside remote data');
}

async function testGuestWriteFailureSurvivesAccountCacheWrites() {
  const context = {
    cloudUid: null, cloudGeneration: 0, cloudBaselineState: null, draftTimer: null, guestState: { topics: {} }, state: { topics: { topic: { learn: { unsavedGuestEdit: true } } } }, cloudRevision: 0, LS_KEY: 'guest',
    accountKey: null, baselineKey: null, privateInitialRoute: null, publicMode: true, hydrationPromise: null, hydrateCloud: null, guestPersistenceFailed: false, localPersistenceFailed: false,
    publicHydrationRetryCount: 0, publicHydrationRetryDelay: 1000, accountStartResolve: null, C: { meta: { id: 'course' } }, migrateButton: {}, saveButton: {},
    clearTimeout() {}, cloneState(value) { return JSON.parse(JSON.stringify(value)); }, saveState(key) { return key !== 'guest'; }, accountStateKey() { return 'account'; }, accountBaseKey() { return 'base'; },
    readState() { return null; }, emptyState() { return { topics: {} }; }, renderAll() {}, setSync() {}, scheduleCloudSave() {}, retryPublicHydration() {},
    cloudClient: { read() { return new Promise(() => {}); }, getContext() { return { uid: 'u' }; } }, renderAccountState() {}, hasProgress() { return false; }, settlePrivateReady() {}
  };
  runFunction('beginAccount', context)({ uid: 'u' });
  assert.strictEqual(context.guestPersistenceFailed, true, 'failed guest-state write is retained separately from account-cache writes');
  assert.strictEqual(context.localPersistenceFailed, true, 'successful empty account cache writes cannot mask an unsaved guest edit');
}

async function testCleanHydrationShowsGuestDurabilityWarning() {
  const statuses = [];
  const context = {
    publicMode: true, cloudDirty: false, cloudBaselineState: null, state: { topics: {} }, baselineKey: 'baseline', accountKey: 'account', localPersistenceFailed: true, guestPersistenceFailed: true,
    progressApi: Public, remoteState(records) { return records; }, saveState() { return true; }, renderPreservingTextFocus() {}, scheduleCloudSave() { throw new Error('clean hydration must not save'); }, setSync(...args) { statuses.push(args); }
  };
  runFunction('renderAccountState', context)({ topics: {} }, { topics: {} }, { topics: {} });
  assert.match(statuses[0][1], /not saved in this browser/, 'clean account hydration retains the unsaved guest-progress warning');
}

async function testHydrationFailureRecoversAndKeepsEdit() {
  const first = deferred(), second = deferred(), timers = []; let reads = 0;
  const context = {
    cloudUid: null, cloudGeneration: 0, cloudBaselineState: null, cloudDirty: false, draftTimer: null, guestState: { topics: {} }, state: { topics: {} }, cloudRevision: 0, LS_KEY: 'guest', guestPersistenceFailed: false,
    accountKey: null, baselineKey: null, privateInitialRoute: null, publicMode: true, hydrationPromise: null, hydrateCloud: null, publicHydrationRetryDelay: 1000, saveTimer: {},
    accountStartResolve: null, C: { meta: { id: 'course' } }, migrateButton: {}, saveButton: { hidden: true }, window: { navigator: { onLine: true } }, Date: { now() { return 1; } },
    clearTimeout() {}, setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; }, cloneState(value) { return JSON.parse(JSON.stringify(value)); }, saveState() { return true; }, accountStateKey() { return 'account'; }, accountBaseKey() { return 'base'; },
    readState() { return null; }, emptyState() { return { topics: {} }; }, renderAll() {}, setSync() {}, scheduleCloudSave() { context.recoveryScheduled = (context.recoveryScheduled || 0) + 1; },
    cloudClient: { read() { return (++reads === 1 ? first : second).promise; }, getContext() { return { uid: 'u' }; } },
    renderAccountState(records, current, base) { context.cloudBaselineState = records; context.state = Public.mergeProgress(base, current, records); }, hasProgress() { return false; }, settlePrivateReady() {}
  };
  context.retryPublicHydration = runFunction('retryPublicHydration', context);
  runFunction('beginAccount', context)({ uid: 'u' });
  first.reject(new Error('temporary read failure')); await Promise.resolve(); await Promise.resolve();
  context.state = { topics: { topic: { learn: { localDuringFailure: true } } } }; context.cloudRevision = 1; context.cloudDirty = true;
  assert.strictEqual(timers[0].delay, 1000, 'failed hydration schedules bounded retry');
  timers[0].fn(); second.resolve({ topics: { topic: { learn: { remoteBeforeRecovery: true } } } }); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.deepStrictEqual(context.state.topics.topic.learn, { remoteBeforeRecovery: true, localDuringFailure: true }, 'recovered hydration merges remote progress with edits made after failure');
  assert.ok(context.cloudBaselineState, 'recovery establishes a write baseline');
  assert.strictEqual(context.saveButton.hidden, false, 'Save now becomes available after recovered hydration');
}

async function testPermanentHydrationFailureStopsIdleRetries() {
  const timers = []; let reads = 0;
  const context = {
    cloudUid: null, cloudGeneration: 0, cloudBaselineState: null, cloudDirty: false, draftTimer: null, guestState: { topics: {} }, state: { topics: {} }, cloudRevision: 0, LS_KEY: 'guest', guestPersistenceFailed: false,
    accountKey: null, baselineKey: null, privateInitialRoute: null, publicMode: true, hydrationPromise: null, hydrateCloud: null, publicHydrationRetryDelay: 1000, publicHydrationRetryCount: 0, saveTimer: {},
    accountStartResolve: null, C: { meta: { id: 'course' } }, migrateButton: {}, saveButton: { hidden: true }, window: { navigator: { onLine: true } },
    clearTimeout() {}, setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; }, cloneState(value) { return JSON.parse(JSON.stringify(value)); }, saveState() { return true; }, accountStateKey() { return 'account'; }, accountBaseKey() { return 'base'; },
    readState() { return null; }, emptyState() { return { topics: {} }; }, renderAll() {}, setSync() {}, scheduleCloudSave() {},
    cloudClient: { read() { reads++; return Promise.reject(new Error('permanent read failure')); }, getContext() { return { uid: 'u' }; } }, renderAccountState() { throw new Error('permanent failure must not render'); }, hasProgress() { return false; }, settlePrivateReady() {}
  };
  context.retryPublicHydration = runFunction('retryPublicHydration', context);
  runFunction('beginAccount', context)({ uid: 'u' });
  await Promise.resolve(); await Promise.resolve();
  for (let i = 0; i < 3; i++) { assert.strictEqual(timers.length, i + 1, 'each bounded retry is scheduled once'); timers[i].fn(); await Promise.resolve(); await Promise.resolve(); }
  assert.strictEqual(reads, 4, 'initial read plus the bounded automatic retry budget run');
  assert.strictEqual(timers.length, 3, 'permanent hydration failure does not poll while idle');
  assert.strictEqual(context.saveButton.hidden, false, 'the visitor can explicitly retry via Save now after bounded failure');
}

async function testCleanHydrationStartsSaveWindowAtFirstEdit() {
  const timers = [], statuses = []; let now = 100000, scheduled = 0;
  const context = {
    publicMode: true, cloudDirty: false, cloudBaselineState: null, state: { topics: {} }, baselineKey: 'baseline', accountKey: 'account', localPersistenceFailed: false, guestPersistenceFailed: false,
    progressApi: Public, remoteState(records) { return records; }, saveState() { return true; }, renderPreservingTextFocus() { context.state.topics.materializedByRender = { said: false, connect: { status: 'none' } }; }, scheduleCloudSave() { scheduled++; },
    cloudClient: {}, cloudUid: 'u', publicFirstDirtyAt: 0, publicLastSaveAt: 0, window: { navigator: { onLine: true } }, Date: { now() { return now; } }, saveTimer: {},
    setSync(...args) { statuses.push(args); }, clearTimeout() {}, setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; }
  };
  runFunction('renderAccountState', context)({ topics: {} }, { topics: {} }, { topics: {} });
  assert.strictEqual(scheduled, 0, 'clean hydration creates no pending save');
  assert.strictEqual(context.cloudDirty, false, 'clean hydration does not mark state dirty');
  assert.deepStrictEqual(statuses[0], ['on'], 'clean hydration reports the acknowledged account state without writing');
  context.state = { topics: { topic: { learn: { firstRealEdit: true } } } }; now = 104000;
  runFunction('scheduleCloudSave', context)();
  assert.strictEqual(context.publicFirstDirtyAt, 104000, 'first real edit, not hydration, starts the batching window');
  assert.strictEqual(timers[0].delay, 5000, 'first edit at t=4s cannot flush before t=9s');
}

async function testCleanHydrationNeverClaimsSyncedOverPendingWrite() {
  const statuses = [];
  const context = {
    publicMode: true, cloudDirty: true, cloudBaselineState: null, state: { topics: {} }, baselineKey: 'baseline', accountKey: 'account', localPersistenceFailed: false, guestPersistenceFailed: false,
    progressApi: Public, remoteState(records) { return records; }, saveState() { return true; }, renderPreservingTextFocus() {}, scheduleCloudSave() { throw new Error('clean hydration must not overwrite an existing pending write'); }, setSync(...args) { statuses.push(args); }
  };
  runFunction('renderAccountState', context)({ topics: {} }, { topics: {} }, { topics: {} });
  assert.strictEqual(statuses.some(status => status[0] === 'on'), false, 'a pending write is never represented as synced by clean hydration');
}

async function testRetryBackoffNeedsDirtySignedInState() {
  const timers = [];
  const context = { publicMode: true, cloudUid: 'u', cloudDirty: true, publicRetryDelay: 1000, saveTimer: {}, window: { navigator: { onLine: true } }, clearTimeout() {}, setTimeout(fn, delay) { timers.push({ fn, delay }); return 1; }, cloudDrain: { request() { context.requests = (context.requests || 0) + 1; return Promise.resolve(); } } };
  runFunction('schedulePublicRetry', context)();
  assert.strictEqual(timers[0].delay, 1000, 'failed public save starts bounded retry backoff');
  assert.strictEqual(context.publicRetryDelay, 2000);
  timers[0].fn(); await Promise.resolve();
  assert.strictEqual(context.requests, 1, 'retry drains only while account progress remains dirty');
}

async function testCleanOnlineEventRefreshesWithoutWrite() {
  const context = { cloudUid: 'u', cloudBaselineState: { topics: {} }, publicMode: true, cloudDirty: false, refreshPublicProgress() { context.refreshed = (context.refreshed || 0) + 1; }, scheduleCloudSave() { throw new Error('clean public online event must not write'); } };
  runFunction('handleOnline', context)();
  assert.strictEqual(context.refreshed, 1, 'clean account online event refreshes remote progress');
}

async function testCleanRefreshAppliesRemoteState() {
  const read = deferred(); const saved = [], statuses = [];
  const context = {
    publicMode: true, cloudUid: 'u', cloudBaselineState: { topics: {} }, cloudDirty: false, localPersistenceFailed: true, guestPersistenceFailed: false, cloudGeneration: 1, cloudRevision: 1, publicLastRefreshAt: 0,
    cloudDrain: { isRunning() { return false; } }, Date: { now() { return 120000; } }, window: { navigator: { onLine: true } }, C: { meta: { id: 'course' } },
    cloudClient: { read() { return read.promise; } }, progressApi: Public, state: { topics: {} }, baselineKey: 'baseline', accountKey: 'account',
    saveState(key, value) { saved.push([key, value]); }, renderPreservingTextFocus() { context.rendered = true; }, scheduleCloudSave() { throw new Error('clean refresh must not schedule a write'); }, setSync(...args) { statuses.push(args); }
  };
  runFunction('refreshPublicProgress', context)();
  read.resolve({ topics: { topic: { learn: { remote: true } } } }); await Promise.resolve(); await Promise.resolve();
  assert.strictEqual(context.state.topics.topic.learn.remote, true, 'clean refresh projects another device progress into the UI state');
  assert.strictEqual(context.rendered, true);
  assert.strictEqual(saved.length, 2, 'clean refresh updates only account cache and baseline');
  assert.match(statuses[0][1], /not saved locally/, 'cloud refresh does not erase the browser-durability warning');
}

async function testPrivateImportCannotReachPublicPersistence() {
  let alerts = 0, persists = 0, confirms = 0;
  function Reader() { this.readAsText = () => { this.result = 'private fixture'; this.onload(); }; }
  const context = { privateHost: false, privateReady: true, publicCourse: true, publicMode: false, progressApi: Public, LS_KEY: 'prep-state-course-v1', FileReader: Reader,
    window: { PREP_IO: { parse() { return { key: 'prep-state-private-pack-v1', state: { topics: { private: { acts: { answer: { lastAnswer: 'private' } } } } } }; } } },
    alert() { alerts++; }, confirm() { confirms++; return true; }, exportProgress() { throw new Error('private import must not back up/import'); }, persist() { persists++; }, renderAll() {}, scrollTo() {}
  };
  runFunction('importProgress', context)({}); await Promise.resolve();
  assert.strictEqual(alerts, 1, 'mismatched private export is rejected before import');
  assert.strictEqual(confirms, 0); assert.strictEqual(persists, 0, 'private import cannot enter a public syncable cache');
}

async function testStorageFailureNeverClaimsSaved() {
  const statuses = [];
  const guest = { draftTimer: null, cloudUid: null, publicMode: true, cloudRevision: 0, state: { topics: {} }, accountKey: null, LS_KEY: 'guest', localPersistenceFailed: false, guestPersistenceFailed: false,
    saveState() { return false; }, setSync(...args) { statuses.push(args); }, window: { navigator: { onLine: false } }, clearTimeout() {}, setTimeout() { throw new Error('failed guest persistence must not schedule'); } };
  assert.strictEqual(runFunction('persist', guest)('topic'), false);
  assert.match(statuses[0][1], /not saved/);
  assert.strictEqual(/saved here|Progress saved in this browser/.test(statuses[0][1]), false);
  const offline = Object.assign({}, guest, { cloudUid: 'u', cloudDirty: false, state: { topics: {} } }); const offlineStatuses = []; offline.setSync = (...args) => offlineStatuses.push(args);
  assert.strictEqual(runFunction('persist', offline)('topic'), false);
  assert.match(offlineStatuses[0][1], /not saved/);
  runFunction('handleOffline', offline)();
  assert.match(offlineStatuses[1][1], /not saved/, 'offline event retains the storage-failure warning');
}

async function testFailedCloudWriteKeepsStorageWarning() {
  const statuses = []; const network = new Error('network fixture');
  const context = {
    cloudClient: { writeBatch() { return Promise.reject(network); } }, cloudUid: 'u', cloudBaselineState: { topics: { topic: { learn: { a: false } } } }, cloudDirty: true, localPersistenceFailed: true,
    cloudGeneration: 1, cloudRevision: 1, publicMode: true, C: { meta: { id: 'course' } }, window: { navigator: { onLine: true } }, progressApi: Public,
    state: { topics: { topic: { learn: { a: true } } } }, setSync(...args) { statuses.push(args); }, schedulePublicRetry() { context.retried = true; }, Promise
  };
  context.syncFailureMessage = runFunction('syncFailureMessage', context);
  await assert.rejects(runFunction('flushCloudBatch', context)(), /network fixture/);
  assert.strictEqual(/Saved here|saved in this browser/.test(statuses[statuses.length - 1][1]), false, 'cloud failure does not overwrite storage-failure warning with a false durability claim');
  assert.strictEqual(context.retried, true);
}

async function testUndefinedCloudFailureKeepsStorageWarning() {
  const statuses = [];
  const context = {
    cloudClient: { writeBatch() { return Promise.reject(); } }, cloudUid: 'u', cloudBaselineState: { topics: {} }, cloudDirty: true, localPersistenceFailed: true,
    cloudGeneration: 1, cloudRevision: 1, publicMode: true, C: { meta: { id: 'course' } }, window: { navigator: { onLine: true } }, progressApi: Public,
    state: { topics: { topic: { learn: { changed: true } } } }, setSync(...args) { statuses.push(args); }, schedulePublicRetry() {}, Promise
  };
  context.syncFailureMessage = runFunction('syncFailureMessage', context);
  try { await runFunction('flushCloudBatch', context)(); } catch (error) {}
  assert.match(statuses[statuses.length - 1][1], /not saved in this browser/, 'an empty cloud rejection does not claim failed local storage is durable');
  assert.strictEqual(/Saved here|progress saved in this browser/.test(statuses[statuses.length - 1][1]), false);
}

async function testAccountActionFailureNeverClaimsFailedStorageIsDurable() {
  const statuses = [];
  const context = { localPersistenceFailed: true, setSync(...args) { statuses.push(args); } };
  context.syncFailureMessage = runFunction('syncFailureMessage', context);
  assert.match(context.syncFailureMessage(undefined, 'Sign-in failed; progress is still saved here'), /not saved in this browser/, 'undefined sign-in failure remains persistence-aware');
  runFunction('signOutFailure', context)(undefined);
  assert.match(statuses[0][1], /not saved in this browser/, 'undefined sign-out failure remains persistence-aware');
  assert.strictEqual(/saved here|progress is still saved/.test(statuses[0][1]), false);
}

async function testMigrationStorageFailureStaysVisible() {
  const statuses = [];
  const context = {
    cloudUid: 'u', guestState: { topics: { topic: { learn: { guest: true } } } }, cloudGeneration: 1, accountKey: 'account', cloudRevision: 1, cloudDirty: false, localPersistenceFailed: false, guestPersistenceFailed: false,
    hasProgress() { return true; }, confirm() { return true; }, progressApi: Public, cloneState(value) { return JSON.parse(JSON.stringify(value)); }, exportProgress() { return Promise.resolve(true); },
    saveState() { return false; }, state: { topics: {} }, renderAll() {}, scheduleCloudSave() { context.scheduled = true; }, migrateButton: {}, setSync(...args) { statuses.push(args); }, Promise
  };
  runFunction('migrateGuestProgress', context)(); await Promise.resolve(); await Promise.resolve();
  assert.strictEqual(context.localPersistenceFailed, true, 'a failed migration cache write is retained as a durability failure');
  assert.strictEqual(context.scheduled, true, 'the public transaction can still attempt to preserve the compact projection');
  assert.match(statuses[0][1], /not saved in this browser/, 'migration never masks failed local storage as a browser save');
}

async function testOnlineMissingBaselineSignoutIsBounded() {
  const messages = [];
  const context = { cloudClient: {}, publicMode: true, cloudDirty: true, cloudDrain: { request() { return Promise.resolve(); } }, window: { navigator: { onLine: true } }, setSync(...args) { messages.push(args); }, confirm() { return false; }, Promise };
  context.publicBackupAndSignOut = runFunction('publicBackupAndSignOut', context);
  const result = await runFunction('signOutCloud', context)();
  assert.strictEqual(result, false, 'dirty sign-out with incomplete hydration stops after one flush attempt');
  assert.match(messages[messages.length - 1][1], /not confirmed/);
}

async function testRecoveredBaselineAllowsSignoutFlush() {
  let signedOut = false;
  const context = { cloudClient: { signOut() { signedOut = true; return Promise.resolve(); } }, publicMode: true, cloudUid: 'u', cloudGeneration: 1, accountKey: 'account', cloudRevision: 2, cloudBaselineState: { topics: {} }, cloudDirty: true,
    cloudDrain: { request() { context.cloudDirty = false; return Promise.resolve(); } }, window: { navigator: { onLine: true } }, progressApi: Public, state: { topics: {} }, hasLocalOnlyData() { return false; }, exportProgress() { return Promise.resolve(true); }, confirm() { return true; }, setSync() {}, Promise };
  assert.strictEqual(await runFunction('signOutCloud', context)(), true, 'once recovery establishes a baseline, sign-out flushes and completes');
  assert.strictEqual(signedOut, true);
}

async function testColdPopupRequiresSecondDirectGesture() {
  let listener, popups = 0;
  const auth = { currentUser: null, onAuthStateChanged(fn) { listener = fn; Promise.resolve().then(() => fn(this.currentUser)); return () => {}; }, signInWithPopup() { popups++; this.currentUser = { uid: 'u' }; return Promise.resolve({ user: this.currentUser }); } };
  const client = Public.create({ purpose: 'public-progress-v1', enabled: true, firebase: { apiKey: 'a', authDomain: 'b', projectId: 'c', appId: 'd' } }, { auth, db: {} });
  client.onAuthState(() => {});
  await assert.rejects(client.signIn(), /ready\. Select Sign in to sync once more/, 'cold click loads SDK without a delayed popup');
  assert.strictEqual(popups, 0);
  await client.signIn();
  assert.strictEqual(popups, 1, 'second direct click opens the popup');
  client.close();
}

Promise.all([testDraftOnlySave(), testOfflineSignoutIsBounded(), testStaleRefreshCannotRollbackEdit(), testTransactionRerendersCurrentState(), testInitialHydrationKeepsEditMadeDuringRead(), testHydrationWithoutBaselineKeepsCachedProgress(), testGuestWriteFailureSurvivesAccountCacheWrites(), testCleanHydrationShowsGuestDurabilityWarning(), testHydrationFailureRecoversAndKeepsEdit(), testPermanentHydrationFailureStopsIdleRetries(), testCleanHydrationStartsSaveWindowAtFirstEdit(), testCleanHydrationNeverClaimsSyncedOverPendingWrite(), testRetryBackoffNeedsDirtySignedInState(), testCleanOnlineEventRefreshesWithoutWrite(), testCleanRefreshAppliesRemoteState(), testPrivateImportCannotReachPublicPersistence(), testStorageFailureNeverClaimsSaved(), testFailedCloudWriteKeepsStorageWarning(), testUndefinedCloudFailureKeepsStorageWarning(), testAccountActionFailureNeverClaimsFailedStorageIsDurable(), testMigrationStorageFailureStaysVisible(), testOnlineMissingBaselineSignoutIsBounded(), testRecoveredBaselineAllowsSignoutFlush(), testColdPopupRequiresSecondDirectGesture()])
  .then(() => console.log('test_public_shell_behavior: OK'), error => { console.error(error); process.exitCode = 1; });
