const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} = require('firebase/firestore');

const COURSE_PROGRESS = (uid) => `users/${uid}/progress/course`;
const RULES = fs.readFileSync(
  path.join(__dirname, '..', 'firestore.rules'),
  'utf8',
);

let testEnv;

function progressRef(db, uid) {
  return doc(db, COURSE_PROGRESS(uid));
}

function verifiedGoogleDb(uid, tokenOverrides = {}) {
  return testEnv.authenticatedContext(uid, {
    email_verified: true,
    firebase: { sign_in_provider: 'google.com' },
    ...tokenOverrides,
  }).firestore();
}

function validProgress(payload = '{}') {
  return {
    schemaVersion: 1,
    payload,
    updatedAt: serverTimestamp(),
  };
}

async function seedProgress(uid = 'alice', payload = '{}') {
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    await setDoc(progressRef(adminContext.firestore(), uid), {
      schemaVersion: 1,
      payload,
      // Seed data is not a client write; client writes must use request.time.
      updatedAt: Timestamp.fromMillis(0),
    });
  });
}

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-interview-prep-rules',
    firestore: { rules: RULES },
  });
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
});

test.after(async () => {
  await testEnv?.cleanup();
});

test('verified Google users can create and read their exact progress document', async () => {
  const db = verifiedGoogleDb('alice');
  const reference = progressRef(db, 'alice');

  await assertSucceeds(setDoc(reference, validProgress()));
  const snapshot = await assertSucceeds(getDoc(reference));
  assert.equal(snapshot.exists(), true);
  assert.equal(snapshot.data().schemaVersion, 1);
  assert.equal(snapshot.data().payload, '{}');
});

test('verified Google users can update their document with a server timestamp', async () => {
  const db = verifiedGoogleDb('alice');
  await seedProgress();

  await assertSucceeds(setDoc(
    progressRef(db, 'alice'),
    validProgress('{"completed":["topic-1"]}'),
  ));
});

test('authentication must be verified Google at the path UID', async () => {
  const unverifiedGoogle = verifiedGoogleDb('alice', { email_verified: false });
  const passwordUser = verifiedGoogleDb('alice', {
    firebase: { sign_in_provider: 'password' },
  });
  const unauthenticated = testEnv.unauthenticatedContext().firestore();

  await assertFails(setDoc(
    progressRef(unverifiedGoogle, 'alice'),
    validProgress(),
  ));
  await assertFails(setDoc(progressRef(passwordUser, 'alice'), validProgress()));
  await assertFails(setDoc(
    progressRef(unauthenticated, 'alice'),
    validProgress(),
  ));
  await assertFails(getDoc(progressRef(unverifiedGoogle, 'alice')));
});

test('a user cannot read or write another UID', async () => {
  const alice = verifiedGoogleDb('alice');
  await seedProgress('bob');

  await assertFails(getDoc(progressRef(alice, 'bob')));
  await assertFails(setDoc(progressRef(alice, 'bob'), validProgress()));
});

test('collection listing is denied, including the authenticated user collection', async () => {
  const alice = verifiedGoogleDb('alice');
  await seedProgress('alice');

  await assertFails(getDocs(collection(alice, 'users')));
  await assertFails(getDocs(collection(alice, 'users', 'alice', 'progress')));
});

test('deletion is denied even for the owning verified Google user', async () => {
  const alice = verifiedGoogleDb('alice');
  await seedProgress('alice');

  await assertFails(deleteDoc(progressRef(alice, 'alice')));
});

test('only the exact three fields are accepted', async () => {
  const alice = verifiedGoogleDb('alice');
  const withExtraField = { ...validProgress(), extra: true };
  await assertFails(setDoc(progressRef(alice, 'alice'), withExtraField));

  await seedProgress('alice');
  await assertFails(setDoc(
    progressRef(alice, 'alice'),
    { ...validProgress(), extra: 'also denied' },
  ));
});

test('schemaVersion must be integer 1 and payload must be a string', async () => {
  const alice = verifiedGoogleDb('alice');

  await assertFails(setDoc(
    progressRef(alice, 'alice'),
    { ...validProgress(), schemaVersion: 2 },
  ));
  await assertFails(setDoc(
    progressRef(alice, 'alice'),
    { ...validProgress(), schemaVersion: '1' },
  ));
  await assertFails(setDoc(
    progressRef(alice, 'alice'),
    { ...validProgress(), payload: { completed: [] } },
  ));
});

test('payload is bounded by 131072 UTF-8 bytes', async () => {
  const alice = verifiedGoogleDb('alice');
  const exactlyAtLimit = 'a'.repeat(131072);
  const overLimitInUtf8Bytes = '😀'.repeat(32769); // 131076 UTF-8 bytes.

  await assertSucceeds(setDoc(
    progressRef(alice, 'alice'),
    validProgress(exactlyAtLimit),
  ));
  await testEnv.clearFirestore();
  await assertFails(setDoc(
    progressRef(alice, 'alice'),
    validProgress(overLimitInUtf8Bytes),
  ));
});

test('updatedAt is required and must equal the server request time', async () => {
  const alice = verifiedGoogleDb('alice');
  const missingTimestamp = { schemaVersion: 1, payload: '{}' };
  const clientTimestamp = {
    schemaVersion: 1,
    payload: '{}',
    updatedAt: Timestamp.fromMillis(0),
  };

  await assertFails(setDoc(progressRef(alice, 'alice'), missingTimestamp));
  await assertFails(setDoc(progressRef(alice, 'alice'), clientTimestamp));

  await seedProgress('alice');
  await assertFails(setDoc(progressRef(alice, 'alice'), missingTimestamp));
  await assertFails(setDoc(progressRef(alice, 'alice'), clientTimestamp));
});

test('unmatched paths remain denied', async () => {
  const alice = verifiedGoogleDb('alice');
  const otherPath = doc(alice, 'users/alice/profile/doc');
  const siblingProgressPath = doc(alice, 'users/alice/progress/other');

  await assertFails(setDoc(otherPath, { anything: true }));
  await assertFails(setDoc(siblingProgressPath, validProgress()));
});
