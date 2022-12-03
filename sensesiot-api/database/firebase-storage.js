import "colors";
import path from "path";
import { storage } from "../firebase/firebase-admin.js";

import { dbNameOf } from "../utils/dbname.js";

export const bucketname = dbNameOf("sensesiot");
export function sensesiotBucket() {
  return storage().bucket(bucketname);
}
export function pathJoinBucket(...args) {
  return path.join(...args).replace(/\\/g, "/");
}

export default Object.freeze({
  bucketname,
  sensesiotBucket,
  pathJoinBucket,
});
