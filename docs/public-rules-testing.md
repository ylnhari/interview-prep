# Public progress rules testing

The rules test is emulator-only and uses a `demo-*` Firebase project ID. It
does not contact Firebase accounts or production databases.

Install Node 20+ and Java 21, then run:

```sh
npm ci
npm run test:public-rules
```

The script starts only the Firestore emulator on loopback (`127.0.0.1:8080`),
runs `test/public-rules.test.cjs`, and shuts the emulator down. The Firestore
emulator requires a Java runtime; CI should provision Java before this command.
The emulator hub and logging service are also pinned to loopback in
`firebase.json`; the emulator UI is disabled. Do not deploy rules as part of a
Pages or content build.

The synthetic tests cover verified Google authentication, exact UID reads and
writes, server timestamps, the 131072-byte UTF-8 payload boundary, exact field
shape and types, unauthenticated/unverified/non-Google users, cross-user access,
collection listing, deletion, and unmatched paths.

References: [Firebase rules unit tests](https://firebase.google.com/docs/rules/unit-tests)
and [Firestore field validation](https://firebase.google.com/docs/firestore/security/rules-fields).
