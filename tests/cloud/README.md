# Account tests (Firebase emulators)

These check the optional sign-in and sync (`site/js/cloud.js`) and the database rules (`firestore.rules`)
against Firebase's local emulators, so nothing touches the real Firebase project.

Needs Node 20+ and Java 11+. From this folder:

```
npm install
npx playwright install chromium   # once
npm test
```

- `rules.test.mjs`: each person can read and write only their own document; nothing else is open.
- `browser.test.mjs`: two browser "devices" share one account: creating an account, combining progress on a
  second device, changes passing between them, working offline, and deleting the account. It also checks that
  nothing about accounts shows or loads while `FIREBASE_CONFIG` is `null`.
  Set `SHOTS=<folder>` to save phone-sized screenshots.
