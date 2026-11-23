// Firestore security rules: each person reads and writes only their own document.
// Run with the emulator going (see README.md):  node rules.test.mjs
import fs from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

const env = await initializeTestEnvironment({
  projectId: "demo-amharic",
  firestore: { rules: fs.readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 }
});
const good = { name: "Rob", data: JSON.stringify({ best: { u1: 8 } }), updated: Date.now(), v: 1 };
const alice = env.authenticatedContext("alice").firestore();
const bob = env.authenticatedContext("bob").firestore();
const nobody = env.unauthenticatedContext().firestore();
let n = 0, bad = 0;
const t = async (name, p) => { try { await p; n++; } catch (e) { bad++; console.log("FAIL " + name + ": " + e.message); } };

await t("own document: create", assertSucceeds(setDoc(doc(alice, "users/alice"), good)));
await t("own document: read", assertSucceeds(getDoc(doc(alice, "users/alice"))));
await t("own document: update", assertSucceeds(setDoc(doc(alice, "users/alice"), { ...good, updated: Date.now() + 1 })));
await t("someone else's: read", assertFails(getDoc(doc(bob, "users/alice"))));
await t("someone else's: write", assertFails(setDoc(doc(bob, "users/alice"), good)));
await t("someone else's: delete", assertFails(deleteDoc(doc(bob, "users/alice"))));
await t("signed out: read", assertFails(getDoc(doc(nobody, "users/alice"))));
await t("signed out: write", assertFails(setDoc(doc(nobody, "users/alice"), good)));
await t("listing everyone", assertFails(getDocs(collection(alice, "users"))));
await t("extra fields", assertFails(setDoc(doc(alice, "users/alice"), { ...good, admin: true })));
await t("missing fields", assertFails(setDoc(doc(alice, "users/alice"), { name: "Rob", data: "{}" })));
await t("data must be text", assertFails(setDoc(doc(alice, "users/alice"), { ...good, data: { best: {} } })));
await t("long name", assertFails(setDoc(doc(alice, "users/alice"), { ...good, name: "x".repeat(41) })));
await t("too big", assertFails(setDoc(doc(alice, "users/alice"), { ...good, data: "x".repeat(900001) })));
await t("other collections", assertFails(setDoc(doc(alice, "other/x"), { a: 1 })));
await t("own document: delete", assertSucceeds(deleteDoc(doc(alice, "users/alice"))));
await env.cleanup();
console.log(`rules: ${n} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
