import firebaseAdmin from "firebase-admin";

import gAccount from "./gaccount.config.js";

export function init() {
  const app = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(gAccount),
  });
  return app;
}

export function auth() {
  return firebaseAdmin.app().auth();
}

export default Object.freeze({
  init,
  auth,
});
