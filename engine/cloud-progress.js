// Owner-only Firebase progress adapter. No Firebase SDK is loaded without enabled config.
(function (root) {
  'use strict';

  var SDK_VERSION = '12.19.0';
  var own = Object.prototype.hasOwnProperty;

  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function pathKey(parts) { return encodeURIComponent(JSON.stringify(parts)); }
  function pathFromKey(key) {
    try {
      var parts = JSON.parse(decodeURIComponent(key));
      return Array.isArray(parts) && parts.every(function (p) { return typeof p === 'string' && p !== '__proto__' && p !== 'constructor' && p !== 'prototype'; }) ? parts : null;
    } catch (e) { return null; }
  }
  function flatten(value) {
    var out = {};
    function visit(v, parts) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        Object.keys(v).forEach(function (k) {
          if (k === '__proto__' || k === 'constructor' || k === 'prototype') return;
          visit(v[k], parts.concat([k]));
        });
      } else if (parts.length) out[pathKey(parts)] = { parts: parts, value: clone(v) };
    }
    visit(value, []);
    return out;
  }
  function projectProgress(state) {
    var out = { topics: {} }, source = state && state.topics || {};
    function scalarMap(value) {
      var result = {};
      if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
      Object.keys(value).forEach(function (key) {
        var v = value[key];
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype' && (typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string')) result[key] = v;
      });
      return result;
    }
    Object.keys(source).forEach(function (topicId) {
      if (topicId === '__proto__' || topicId === 'constructor' || topicId === 'prototype') return;
      var topic = source[topicId] || {}, projected = {}, learn = scalarMap(topic.learn), checks = scalarMap(topic.checks), reads = scalarMap(topic.reads), acts = {};
      if (Object.keys(learn).length) projected.learn = learn;
      if (Object.keys(checks).length) projected.checks = checks;
      if (Object.keys(reads).length) projected.reads = reads;
      if (typeof topic.said === 'boolean') projected.said = topic.said;
      if (topic.connect && typeof topic.connect === 'object') {
        var connect = {};
        if (['none', 'pass', 'retry'].indexOf(topic.connect.status) >= 0) connect.status = topic.connect.status;
        if (Object.keys(connect).length) projected.connect = connect;
      }
      Object.keys(topic.acts || {}).forEach(function (activityId) {
        if (activityId === '__proto__' || activityId === 'constructor' || activityId === 'prototype') return;
        var activity = topic.acts[activityId] || {}, leaf = {};
        if (['none', 'pass', 'retry'].indexOf(activity.status) >= 0) leaf.status = activity.status;
        if (typeof activity.self === 'boolean') leaf.self = activity.self;
        if (Object.keys(leaf).length) acts[activityId] = leaf;
      });
      if (Object.keys(acts).length) projected.acts = acts;
      if (Object.keys(projected).length) out.topics[topicId] = projected;
    });
    return out;
  }
  function mergeProgress(base, local, remote) {
    var merged = mergeChanges(projectProgress(base), projectProgress(local), projectProgress(remote)).state;
    var out = clone(local || {}), target = out.topics || (out.topics = {}), projected = merged.topics || {};
    Object.keys(target).forEach(function (topicId) {
      var t = target[topicId] || {};
      delete t.learn; delete t.checks; delete t.reads; delete t.said;
      if (t.connect && typeof t.connect === 'object') delete t.connect.status;
      Object.keys(t.acts || {}).forEach(function (id) {
        if (!t.acts[id] || typeof t.acts[id] !== 'object') { delete t.acts[id]; return; }
        delete t.acts[id].status; delete t.acts[id].self;
      });
    });
    Object.keys(projected).forEach(function (topicId) {
      var src = projected[topicId] || {}, dest = target[topicId] || (target[topicId] = {});
      ['learn', 'checks', 'reads'].forEach(function (field) { if (src[field]) dest[field] = clone(src[field]); });
      if (typeof src.said === 'boolean') dest.said = src.said;
      if (src.connect) { if (!dest.connect || typeof dest.connect !== 'object') dest.connect = {}; if (src.connect.status !== undefined) dest.connect.status = src.connect.status; if (src.connect.lastAnswer !== undefined) dest.connect.lastAnswer = src.connect.lastAnswer; }
      Object.keys(src.acts || {}).forEach(function (id) { dest.acts = dest.acts || {}; if (!dest.acts[id] || typeof dest.acts[id] !== 'object') dest.acts[id] = {}; Object.keys(src.acts[id]).forEach(function (key) { dest.acts[id][key] = src.acts[id][key]; }); });
    });
    return out;
  }
  function validProgressLeaf(parts, value, deleting) {
    if (!Array.isArray(parts) || parts.some(function (p) { return typeof p !== 'string' || !p || p === '__proto__' || p === 'constructor' || p === 'prototype'; })) return false;
    if (parts.length === 4 && parts[0] === 'topics' && ['learn', 'checks', 'reads'].indexOf(parts[2]) >= 0) return deleting || ['boolean', 'number', 'string'].indexOf(typeof value) >= 0;
    if (parts.length === 3 && parts[0] === 'topics' && parts[2] === 'said') return deleting || typeof value === 'boolean';
    if (parts.length === 4 && parts[0] === 'topics' && parts[2] === 'connect' && parts[3] === 'status') return deleting || ['none', 'pass', 'retry'].indexOf(value) >= 0;
    if (parts.length === 5 && parts[0] === 'topics' && parts[2] === 'acts') return deleting || (parts[4] === 'status' ? ['none', 'pass', 'retry'].indexOf(value) >= 0 : parts[4] === 'self' && typeof value === 'boolean');
    return false;
  }
  function createSerialDrain(run) {
    var pending = false, running = null;
    function request() {
      pending = true;
      if (running) return running;
      running = Promise.resolve().then(async function () {
        while (pending) { pending = false; await run(); }
      }).finally(function () { running = null; if (pending) request(); });
      return running;
    }
    return { request: request, isRunning: function () { return !!running; } };
  }
  function accountTicket(uid, generation, key) { return { uid: uid, generation: generation, key: key }; }
  function matchesAccountTicket(ticket, uid, generation, key) { return !!ticket && ticket.uid === uid && ticket.generation === generation && ticket.key === key; }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function diff(base, next) {
    var a = base || {}, b = next || {}, out = {};
    Object.keys(a).concat(Object.keys(b)).filter(function (k, i, all) { return all.indexOf(k) === i; }).forEach(function (k) {
      if (!own.call(a, k) || !own.call(b, k)) out[k] = { parts: (b[k] || a[k]).parts, deleted: !own.call(b, k), value: own.call(b, k) ? clone(b[k].value) : null };
      else if (!same(a[k].value, b[k].value)) out[k] = { parts: b[k].parts, deleted: false, value: clone(b[k].value) };
    });
    return out;
  }
  function setPath(target, parts, value, deleted) {
    if (!Array.isArray(parts) || !parts.length || parts.some(function (p) { return typeof p !== 'string' || p === '__proto__' || p === 'constructor' || p === 'prototype'; })) return;
    var node = target;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]] || typeof node[parts[i]] !== 'object' || Array.isArray(node[parts[i]])) node[parts[i]] = {};
      node = node[parts[i]];
    }
    if (deleted) delete node[parts[parts.length - 1]];
    else node[parts[parts.length - 1]] = clone(value);
  }
  function applyRecords(base, records) {
    var out = clone(base || {});
    Object.keys(records || {}).forEach(function (key) {
      var rec = records[key] || {}, parts = Array.isArray(rec.parts) ? rec.parts : pathFromKey(key);
      if (parts) setPath(out, parts, rec.value, rec.deleted === true);
    });
    return out;
  }
  function mergeChanges(base, local, remote) {
    var b = flatten(base || {}), l = flatten(local || {}), r = flatten(remote || {}), ld = diff(b, l), rd = diff(b, r), out = clone(remote || {});
    Object.keys(ld).forEach(function (key) { setPath(out, ld[key].parts, ld[key].value, ld[key].deleted); });
    return { state: out, localChanges: ld, remoteChanges: rd };
  }
  function cacheKey(packId, uid) { return 'prep-state-' + packId + '-v1-account-' + encodeURIComponent(uid); }
  function clearAccountCache(storage, packId, uid) {
    if (!storage || typeof storage.removeItem !== 'function') return;
    var key = cacheKey(packId, uid);
    storage.removeItem(key); storage.removeItem(key + '-baseline');
  }
  // Reading progress is keyed by the link, not display order. Migrate v1 numeric
  // keys lazily while the old array position still points at its original URL.
  function migrateIndexedReads(reads, readings) {
    reads = reads && typeof reads === 'object' ? reads : {};
    var changed = false;
    (readings || []).forEach(function (reading, index) {
      if (!reading || typeof reading.u !== 'string' || !reading.u) return;
      var legacy = String(index), stable = reading.u;
      if (own.call(reads, legacy)) {
        if (!own.call(reads, stable)) reads[stable] = reads[legacy];
        delete reads[legacy]; changed = true;
      }
    });
    return changed;
  }
  function isAuthorized(user, marker, config) {
    return !!(user && user.uid && marker && marker.enabled === true && !(config && config.ownerUid && config.ownerUid !== user.uid));
  }
  function validConfig(config) {
    return !!(config && config.enabled === true && config.firebase && config.firebase.apiKey && config.firebase.authDomain && config.firebase.projectId && config.firebase.appId);
  }
  function safePackId(id) {
    if (typeof id !== 'string' || !id || id.indexOf('/') >= 0 || id === '.' || id === '..') throw new Error('Invalid progress pack id.');
    return id;
  }
  function safeParts(parts) {
    if (!Array.isArray(parts) || !parts.length || parts.some(function (p) { return typeof p !== 'string' || !p || p === '__proto__' || p === 'constructor' || p === 'prototype'; })) throw new Error('Invalid progress field path.');
    return parts;
  }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var found = document.querySelector('script[data-prep-firebase="' + src + '"]');
      if (found) { if (found.getAttribute('data-loaded') === 'true') resolve(); else { found.addEventListener('load', resolve, { once: true }); found.addEventListener('error', reject, { once: true }); } return; }
      var script = document.createElement('script'); script.src = src; script.async = true; script.dataset.prepFirebase = src;
      script.onload = function () { script.dataset.loaded = 'true'; resolve(); };
      script.onerror = function () { reject(new Error('Could not load Firebase SDK.')); };
      document.head.appendChild(script);
    });
  }
  function create(config, testDeps) {
    var auth = null, db = null, app = null, context = null, state = 'disabled', authUnsub = null, watchers = [], callback = null, readyPromise = null, closed = false;
    var enabled = validConfig(config), authGeneration = 0;
    function emit(next, error, uid) { state = next; if (callback) { try { callback({ status: next, context: context, error: error || null, uid: uid || null }); } catch (e) {} } }
    function ensure() {
      if (!enabled) return Promise.reject(new Error('Cloud progress is not configured.'));
      if (readyPromise) return readyPromise;
      if (testDeps && testDeps.auth && testDeps.db) {
        auth = testDeps.auth; db = testDeps.db;
        authUnsub = auth.onAuthStateChanged(function (user) { authorize(user); }, function (error) { authGeneration++; context = null; stopWatchers(); emit('error', error); });
        readyPromise = Promise.resolve({ auth: auth, db: db }); return readyPromise;
      }
      readyPromise = Promise.resolve()
        .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + SDK_VERSION + '/firebase-app-compat.js'); })
        .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + SDK_VERSION + '/firebase-auth-compat.js'); })
        .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + SDK_VERSION + '/firebase-firestore-compat.js'); })
        .then(function () {
          if (!root.firebase || !root.firebase.initializeApp) throw new Error('Firebase SDK did not initialize.');
          var appName = 'interview-prep-' + config.firebase.projectId;
          app = root.firebase.apps.filter(function (candidate) { return candidate.name === appName; })[0] || root.firebase.initializeApp(config.firebase, appName);
          auth = app.auth(); db = app.firestore();
          authUnsub = auth.onAuthStateChanged(function (user) { authorize(user); }, function (error) { var failedUid = auth && auth.currentUser && auth.currentUser.uid; authGeneration++; context = null; stopWatchers(); emit('error', error, failedUid); });
          return app;
        });
      return readyPromise;
    }
    function stopWatchers() { watchers.splice(0).forEach(function (u) { try { u(); } catch (e) {} }); }
    function authorize(user) {
      var generation = ++authGeneration;
      if (closed) return Promise.resolve(null);
      if (user && context && context.uid === user.uid) return Promise.resolve(context);
      stopWatchers(); context = null;
      if (!user) { emit('signed_out'); return Promise.resolve(null); }
      emit('checking', null, user.uid);
      return db.doc('workspaces/' + user.uid + '/access/owner').get({ source: 'server' }).then(function (snap) {
        if (closed || generation !== authGeneration || !auth || !auth.currentUser || auth.currentUser.uid !== user.uid) return null;
        var marker = snap.exists ? snap.data() : null;
        if (!isAuthorized(user, marker, config)) {
          context = null; emit('not_enabled', null, user.uid); return null;
        }
        context = { user: user, uid: user.uid, db: db };
        emit('authorized', null, user.uid); return context;
      }).catch(function (error) { if (closed || generation !== authGeneration || !auth || !auth.currentUser || auth.currentUser.uid !== user.uid) return null; context = null; emit(error && error.code === 'permission-denied' ? 'not_enabled' : 'error', error, user.uid); return null; });
    }
    function requireContext() {
      if (closed || !context || !auth || !auth.currentUser || auth.currentUser.uid !== context.uid) return Promise.reject(new Error('Cloud account is not authorized.'));
      return Promise.resolve(context);
    }
    function fieldsRef(ctx, packId) { return ctx.db.collection('workspaces').doc(ctx.uid).collection('progress').doc(safePackId(packId)).collection('fields'); }
    return {
      enabled: enabled,
      onAuthState: function (fn) { callback = fn; if (!enabled) { emit('disabled'); return function () { if (callback === fn) callback = null; }; } ensure().catch(function (error) { emit('error', error); }); return function () { if (callback === fn) callback = null; }; },
      signIn: function () { return ensure().then(function () { return auth.signInWithPopup(new root.firebase.auth.GoogleAuthProvider()); }).then(function (result) { return authorize(result.user); }); },
      signOut: function () { return ensure().then(function () { authGeneration++; stopWatchers(); context = null; return auth.signOut(); }); },
      getContext: function () { return context && auth && auth.currentUser && auth.currentUser.uid === context.uid ? context : null; },
      getUser: function () { return auth && auth.currentUser || null; },
      read: function (packId) { return requireContext().then(function (ctx) { return fieldsRef(ctx, packId).get({ source: 'server' }); }).then(function (snap) { var out = {}; snap.forEach(function (doc) { out[doc.id] = doc.data(); }); return out; }); },
      watch: function (packId, fn, onError) {
        return requireContext().then(function (ctx) {
          var unsub = fieldsRef(ctx, packId).onSnapshot(function (snap) { var out = {}; snap.forEach(function (doc) { out[doc.id] = doc.data(); }); fn(out, { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites }); }, function (error) {
            if (error && error.code === 'permission-denied') { var revokedUid = context && context.uid; authGeneration++; context = null; stopWatchers(); emit('not_enabled', error, revokedUid); }
            if (onError) onError(error);
          });
          watchers.push(unsub); return unsub;
        });
      },
      write: function (packId, parts, value) {
        parts = safeParts(parts); if (!validProgressLeaf(parts, value)) return Promise.reject(new Error('Field is outside the progress sync allowlist.')); var key = pathKey(parts);
        return requireContext().then(function (ctx) { return fieldsRef(ctx, packId).doc(key).set({ parts: parts, value: clone(value), deleted: false, updatedAt: root.firebase.firestore.FieldValue.serverTimestamp() }); });
      },
      remove: function (packId, parts) {
        parts = safeParts(parts); if (!validProgressLeaf(parts, null, true)) return Promise.reject(new Error('Field is outside the progress sync allowlist.')); var key = pathKey(parts);
        return requireContext().then(function (ctx) { return fieldsRef(ctx, packId).doc(key).set({ parts: parts, deleted: true, updatedAt: root.firebase.firestore.FieldValue.serverTimestamp() }); });
      },
      close: function () { closed = true; authGeneration++; stopWatchers(); if (authUnsub) authUnsub(); context = null; callback = null; }
    };
  }
  root.PREP_CLOUD = { SDK_VERSION: SDK_VERSION, flatten: flatten, diff: diff, applyRecords: applyRecords, mergeChanges: mergeChanges, projectProgress: projectProgress, mergeProgress: mergeProgress, validProgressLeaf: validProgressLeaf, createSerialDrain: createSerialDrain, accountTicket: accountTicket, matchesAccountTicket: matchesAccountTicket, cacheKey: cacheKey, clearAccountCache: clearAccountCache, migrateIndexedReads: migrateIndexedReads, isAuthorized: isAuthorized, create: create };
}(typeof window !== 'undefined' ? window : this));
