// Public-course Firebase progress adapter. It is intentionally separate from
// PREP_CLOUD: this adapter uses one bounded document, no listeners, and is
// loaded only after the visitor opts in to Google sign-in.
(function (root) {
  'use strict';

  var SDK_VERSION = '12.19.0';
  var SCHEMA_VERSION = 1;
  var MAX_PAYLOAD_BYTES = 131072;
  var MAX_DRAFT_BYTES = 4096;
  var own = Object.prototype.hasOwnProperty;

  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function safeKey(key) { return typeof key === 'string' && key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype'; }
  function byteLength(value) {
    var text = String(value);
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
    return unescape(encodeURIComponent(text)).length;
  }
  function validConfig(config) {
    var firebase = config && config.firebase;
    return !!(config && config.purpose === 'public-progress-v1' && config.enabled === true && firebase && firebase.apiKey && firebase.authDomain && firebase.projectId && firebase.appId);
  }
  function safePackId(packId) {
    if (packId !== 'course') throw new Error('Public progress is available only for the course.');
    return packId;
  }
  function booleanMap(value) {
    var result = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
    Object.keys(value).forEach(function (key) {
      var next = value[key];
      if (safeKey(key) && typeof next === 'boolean') result[key] = next;
    });
    return result;
  }
  function choiceMap(value) {
    var result = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
    Object.keys(value).forEach(function (key) {
      var next = value[key];
      if (safeKey(key) && typeof next === 'number' && isFinite(next) && Math.floor(next) === next && next >= 0) result[key] = next;
    });
    return result;
  }
  function checkedDraft(value) {
    if (typeof value !== 'string') return null;
    if (byteLength(value) > MAX_DRAFT_BYTES) throw new Error('An answer draft is too large to sync. Keep each answer under 4 KiB, then save again.');
    return value;
  }
  // The server stores only compact learner-entered progress. Full local state,
  // including grading feedback and attempt history, remains browser-local.
  function projectProgress(state) {
    var out = { topics: {} }, source = state && state.topics || {};
    Object.keys(source).forEach(function (topicId) {
      if (!safeKey(topicId)) return;
      var topic = source[topicId] || {}, projected = {}, acts = {};
      ['learn', 'reads'].forEach(function (field) {
        var scalars = booleanMap(topic[field]);
        if (Object.keys(scalars).length) projected[field] = scalars;
      });
      var checks = choiceMap(topic.checks); if (Object.keys(checks).length) projected.checks = checks;
      if (typeof topic.said === 'boolean') projected.said = topic.said;
      if (topic.connect && typeof topic.connect === 'object') {
        var connect = {};
        if (['none', 'pass', 'retry'].indexOf(topic.connect.status) >= 0) connect.status = topic.connect.status;
        var connectDraft = checkedDraft(topic.connect.lastAnswer);
        if (connectDraft !== null) connect.lastAnswer = connectDraft;
        if (Object.keys(connect).length) projected.connect = connect;
      }
      Object.keys(topic.acts || {}).forEach(function (activityId) {
        if (!safeKey(activityId)) return;
        var activity = topic.acts[activityId] || {}, leaf = {};
        if (['none', 'pass', 'retry'].indexOf(activity.status) >= 0) leaf.status = activity.status;
        if (typeof activity.self === 'boolean') leaf.self = activity.self;
        var draft = checkedDraft(activity.lastAnswer);
        if (draft !== null) leaf.lastAnswer = draft;
        if (Object.keys(leaf).length) acts[activityId] = leaf;
      });
      if (Object.keys(acts).length) projected.acts = acts;
      if (Object.keys(projected).length) out.topics[topicId] = projected;
    });
    return out;
  }
  function pathKey(parts) { return encodeURIComponent(JSON.stringify(parts)); }
  function flatten(value) {
    var out = {};
    function visit(next, parts) {
      if (next && typeof next === 'object' && !Array.isArray(next)) {
        Object.keys(next).forEach(function (key) { if (safeKey(key)) visit(next[key], parts.concat([key])); });
      } else if (parts.length) out[pathKey(parts)] = { parts: parts, value: clone(next) };
    }
    visit(value || {}, []);
    return out;
  }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function diff(base, next) {
    var a = base || {}, b = next || {}, out = {};
    Object.keys(a).concat(Object.keys(b)).filter(function (key, index, all) { return all.indexOf(key) === index; }).forEach(function (key) {
      if (!own.call(a, key) || !own.call(b, key)) out[key] = { parts: (b[key] || a[key]).parts, deleted: !own.call(b, key), value: own.call(b, key) ? clone(b[key].value) : null };
      else if (!same(a[key].value, b[key].value)) out[key] = { parts: b[key].parts, deleted: false, value: clone(b[key].value) };
    });
    return out;
  }
  function setPath(target, parts, value, deleted) {
    if (!Array.isArray(parts) || !parts.length || parts.some(function (part) { return !safeKey(part); })) return;
    var node = target;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]] || typeof node[parts[i]] !== 'object' || Array.isArray(node[parts[i]])) node[parts[i]] = {};
      node = node[parts[i]];
    }
    if (deleted) delete node[parts[parts.length - 1]];
    else node[parts[parts.length - 1]] = clone(value);
  }
  function mergeChanges(base, local, remote) {
    var baseFlat = flatten(base), localFlat = flatten(local), localDiff = diff(baseFlat, localFlat), out = clone(remote || {});
    Object.keys(localDiff).forEach(function (key) { var change = localDiff[key]; setPath(out, change.parts, change.value, change.deleted); });
    return { state: out, localChanges: localDiff };
  }
  function mergeProgress(base, local, remote) {
    var merged = mergeChanges(projectProgress(base), projectProgress(local), projectProgress(remote)).state;
    var out = clone(local || {}), target = out.topics || (out.topics = {}), topics = merged.topics || {};
    Object.keys(target).forEach(function (topicId) {
      var topic = target[topicId] || {};
      delete topic.learn; delete topic.checks; delete topic.reads; delete topic.said;
      if (topic.connect && typeof topic.connect === 'object') { delete topic.connect.status; delete topic.connect.lastAnswer; }
      Object.keys(topic.acts || {}).forEach(function (activityId) {
        var activity = topic.acts[activityId];
        if (!activity || typeof activity !== 'object') { delete topic.acts[activityId]; return; }
        delete activity.status; delete activity.self; delete activity.lastAnswer;
      });
    });
    Object.keys(topics).forEach(function (topicId) {
      var src = topics[topicId] || {}, dest = target[topicId] || (target[topicId] = {});
      ['learn', 'checks', 'reads'].forEach(function (field) { if (src[field]) dest[field] = clone(src[field]); });
      if (typeof src.said === 'boolean') dest.said = src.said;
      if (src.connect) { dest.connect = dest.connect && typeof dest.connect === 'object' ? dest.connect : {}; ['status', 'lastAnswer'].forEach(function (field) { if (src.connect[field] !== undefined) dest.connect[field] = src.connect[field]; }); }
      Object.keys(src.acts || {}).forEach(function (activityId) {
        dest.acts = dest.acts || {}; dest.acts[activityId] = dest.acts[activityId] && typeof dest.acts[activityId] === 'object' ? dest.acts[activityId] : {};
        ['status', 'self', 'lastAnswer'].forEach(function (field) { if (src.acts[activityId][field] !== undefined) dest.acts[activityId][field] = src.acts[activityId][field]; });
      });
    });
    return out;
  }
  function encodePayload(state) {
    var payload = JSON.stringify(projectProgress(state));
    if (byteLength(payload) > MAX_PAYLOAD_BYTES) throw new Error('Synced progress is too large. Export a backup and shorten answer drafts before saving.');
    return payload;
  }
  function decodePayload(doc) {
    if (!doc || doc.schemaVersion === undefined) return { topics: {} };
    if (doc.schemaVersion !== SCHEMA_VERSION || typeof doc.payload !== 'string') throw new Error('Saved public progress has an unsupported format. Your browser copy was kept unchanged.');
    if (byteLength(doc.payload) > MAX_PAYLOAD_BYTES) throw new Error('Saved public progress exceeds the supported size. Your browser copy was kept unchanged.');
    var parsed;
    try { parsed = JSON.parse(doc.payload); } catch (e) { throw new Error('Saved public progress could not be read. Your browser copy was kept unchanged.'); }
    return projectProgress(parsed);
  }
  function cacheKey(packId, uid) { return 'prep-state-' + safePackId(packId) + '-v1-public-account-' + encodeURIComponent(uid); }
  function clearAccountCache(storage, packId, uid) {
    if (!storage || typeof storage.removeItem !== 'function') return;
    var key = cacheKey(packId, uid); storage.removeItem(key); storage.removeItem(key + '-baseline');
  }
  function accountTicket(uid, generation, key) { return { uid: uid, generation: generation, key: key }; }
  function matchesAccountTicket(ticket, uid, generation, key) { return !!ticket && ticket.uid === uid && ticket.generation === generation && ticket.key === key; }
  function migrateIndexedReads(reads, readings) {
    reads = reads && typeof reads === 'object' ? reads : {};
    var changed = false;
    (readings || []).forEach(function (reading, index) {
      if (!reading || typeof reading.u !== 'string' || !reading.u) return;
      var legacy = String(index), stable = reading.u;
      if (own.call(reads, legacy)) { if (!own.call(reads, stable)) reads[stable] = reads[legacy]; delete reads[legacy]; changed = true; }
    });
    return changed;
  }
  function validImportKey(key, expectedKey) { return typeof key === 'string' && key === expectedKey; }
  function createSerialDrain(run) {
    var pending = false, running = null;
    function request() {
      pending = true;
      if (running) return running;
      running = Promise.resolve().then(async function () { while (pending) { pending = false; await run(); } }).finally(function () { running = null; if (pending) request(); });
      return running;
    }
    return { request: request, isRunning: function () { return !!running; } };
  }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var found = document.querySelector('script[data-prep-public-firebase="' + src + '"]');
      if (found && found.getAttribute('data-failed') === 'true') { if (found.parentNode) found.parentNode.removeChild(found); found = null; }
      if (found) { if (found.getAttribute('data-loaded') === 'true') resolve(); else { found.addEventListener('load', resolve, { once: true }); found.addEventListener('error', reject, { once: true }); } return; }
      var script = document.createElement('script'); script.src = src; script.async = true; script.dataset.prepPublicFirebase = src;
      script.onload = function () { script.dataset.loaded = 'true'; resolve(); };
      script.onerror = function () { script.dataset.failed = 'true'; if (script.parentNode) script.parentNode.removeChild(script); reject(new Error('Could not load the optional sync service. Progress is still saved in this browser.')); };
      document.head.appendChild(script);
    });
  }
  function popupMessage(error) {
    if (error && (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request')) return new Error('Google sign-in was blocked by this browser. Allow pop-ups for this site, then try again.');
    return error;
  }
  function create(config, testDeps) {
    var enabled = validConfig(config), auth = null, db = null, app = null, context = null, callback = null, authUnsub = null, readyPromise = null, sdkReady = false, closed = false, authGeneration = 0;
    function emit(status, error, uid) { if (callback) { try { callback({ status: status, context: context, error: error || null, uid: uid || null }); } catch (e) {} } }
    function authorize(user) {
      if (!closed && user && user.uid && context && context.uid === user.uid && auth && auth.currentUser && auth.currentUser.uid === user.uid) return Promise.resolve(context);
      var generation = ++authGeneration;
      context = null;
      if (closed) return Promise.resolve(null);
      if (!user || !user.uid) { emit('signed_out'); return Promise.resolve(null); }
      emit('checking', null, user.uid);
      return Promise.resolve().then(function () {
        if (closed || generation !== authGeneration || !auth || !auth.currentUser || auth.currentUser.uid !== user.uid) return null;
        context = { user: user, uid: user.uid, db: db }; emit('authorized', null, user.uid); return context;
      });
    }
    function ensure() {
      if (!enabled) return Promise.reject(new Error('Public progress sync is not configured.'));
      if (readyPromise) return readyPromise;
      if (testDeps && testDeps.auth && testDeps.db) {
        auth = testDeps.auth; db = testDeps.db;
        authUnsub = auth.onAuthStateChanged(function (user) { authorize(user); }, function (error) { authGeneration++; context = null; emit('error', error); });
        sdkReady = true; readyPromise = Promise.resolve({ auth: auth, db: db }); return readyPromise;
      }
      readyPromise = Promise.resolve()
        .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + SDK_VERSION + '/firebase-app-compat.js'); })
        .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + SDK_VERSION + '/firebase-auth-compat.js'); })
        .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + SDK_VERSION + '/firebase-firestore-compat.js'); })
        .then(function () {
          if (!root.firebase || !root.firebase.initializeApp) throw new Error('The optional sync service did not start. Progress is still saved in this browser.');
          var name = 'interview-prep-public-' + config.firebase.projectId;
          app = root.firebase.apps.filter(function (candidate) { return candidate.name === name; })[0] || root.firebase.initializeApp(config.firebase, name);
          auth = app.auth(); db = app.firestore();
          authUnsub = auth.onAuthStateChanged(function (user) { authorize(user); }, function (error) { authGeneration++; context = null; emit('error', error); });
          sdkReady = true;
          return { auth: auth, db: db };
        });
      readyPromise = readyPromise.catch(function (error) { readyPromise = null; throw error; });
      return readyPromise;
    }
    function requireContext() {
      if (closed || !context || !auth || !auth.currentUser || auth.currentUser.uid !== context.uid) return Promise.reject(new Error('Sign in to save public progress.'));
      return Promise.resolve(context);
    }
    function docRef(ctx, packId) { safePackId(packId); return ctx.db.collection('users').doc(ctx.uid).collection('progress').doc('course'); }
    function readWithContext(ctx, packId) {
      return docRef(ctx, packId).get({ source: 'server' }).then(function (snapshot) { return snapshot && snapshot.exists ? decodePayload(snapshot.data()) : { topics: {} }; });
    }
    return {
      enabled: enabled,
      onAuthState: function (fn) { callback = fn; if (!enabled) emit('disabled'); return function () { if (callback === fn) callback = null; }; },
      // Calling restore is an explicit local opt-in from the shell. Keeping it
      // separate from onAuthState lets first-time guests render without SDK or
      // network work, while returning signed-in visitors reconnect normally.
      restore: function () {
        return ensure().then(function () {
          if (auth.currentUser && auth.currentUser.uid) return authorize(auth.currentUser);
          emit('signed_out'); return null;
        }).catch(function (error) { emit('error', error); throw error; });
      },
      signIn: function () {
        var needsGestureAfterLoad = !sdkReady;
        return ensure().then(function () {
          if (auth.currentUser && auth.currentUser.uid) return authorize(auth.currentUser);
          // Script loading crosses an event boundary, so opening a popup after a
          // cold load is not reliably user-activated. Finish the opt-in load,
          // then let the visitor select the button once more for the popup.
          if (needsGestureAfterLoad) throw new Error('Google sign-in is ready. Select Sign in to sync once more to continue.');
          return auth.signInWithPopup(new root.firebase.auth.GoogleAuthProvider()).then(function (result) { return authorize(result.user); });
        }).catch(function (error) { var message = popupMessage(error); emit('error', message); throw message; });
      },
      signOut: function () {
        return ensure().then(function () {
          var generation = ++authGeneration, prior = context;
          // Block writes while sign-out is in flight, but retain a verified
          // current user if Firebase rejects the request without changing auth.
          context = null;
          return auth.signOut().catch(function (error) {
            if (!closed && generation === authGeneration && prior && auth && auth.currentUser && auth.currentUser.uid === prior.uid) {
              // The shell is already bound to this account. Do not emit a
              // redundant authorized event that would reset its save controls.
              context = prior;
            }
            throw error;
          });
        });
      },
      getContext: function () { return context && auth && auth.currentUser && auth.currentUser.uid === context.uid ? context : null; },
      getUser: function () { return auth && auth.currentUser || null; },
      read: function (packId) { return requireContext().then(function (ctx) { return readWithContext(ctx, packId); }); },
      writeBatch: function (packId, baseline, desired) {
        var local = projectProgress(desired), base = projectProgress(baseline);
        return requireContext().then(function (ctx) {
          var ref = docRef(ctx, packId);
          return ctx.db.runTransaction(function (transaction) {
            return transaction.get(ref).then(function (snapshot) {
              var remote = snapshot && snapshot.exists ? decodePayload(snapshot.data()) : { topics: {} };
              var merged = mergeChanges(base, local, remote).state, payload = encodePayload(merged);
              transaction.set(ref, { schemaVersion: SCHEMA_VERSION, payload: payload, updatedAt: root.firebase.firestore.FieldValue.serverTimestamp() });
              return merged;
            });
          });
        });
      },
      close: function () { closed = true; authGeneration++; context = null; callback = null; sdkReady = false; if (authUnsub) authUnsub(); }
    };
  }
  root.PREP_PUBLIC_PROGRESS = {
    SDK_VERSION: SDK_VERSION, SCHEMA_VERSION: SCHEMA_VERSION, MAX_PAYLOAD_BYTES: MAX_PAYLOAD_BYTES, MAX_DRAFT_BYTES: MAX_DRAFT_BYTES,
    byteLength: byteLength, projectProgress: projectProgress, flatten: flatten, diff: diff, mergeChanges: mergeChanges, mergeProgress: mergeProgress,
    encodePayload: encodePayload, decodePayload: decodePayload, cacheKey: cacheKey, clearAccountCache: clearAccountCache,
    accountTicket: accountTicket, matchesAccountTicket: matchesAccountTicket, migrateIndexedReads: migrateIndexedReads, validImportKey: validImportKey, createSerialDrain: createSerialDrain, create: create
  };
}(typeof window !== 'undefined' ? window : this));
