import "colors";

import { MongoClient } from "mongodb";

import { log, error } from "../utils/logging.js";

const nodeEnv = process.env.NODE_ENV;
function dbNameOf(name) {
  return nodeEnv === "production"
    ? name
    : `${name}-${nodeEnv || "development"}`;
}

const mongodb = new MongoClient("mongodb://localhost:27017");

export const aedesdb = mongodb.db(dbNameOf("sensesiotAedes"));
export const sensesiotBase = mongodb.db(dbNameOf("sensesiotBase"));
export const sensesiotV2 = mongodb.db(dbNameOf("sensesiotV2"));

export async function init() {
  try {
    log("Connecting", { name: "MongoDB" });
    await mongodb.connect();
    log("Connected", { name: "MongoDB" });

    // create index if not exists
    const dataCol = sensesiotV2.collection("data");
    const ctrlCol = sensesiotV2.collection("control");
    const usersCol = sensesiotBase.collection("users");

    await dataCol.createIndex({
      uid: 1,
      deviceKey: 1,
      ts: -1,
    });
    log("Data Index Created", { name: "MongoDB" });

    await ctrlCol.createIndex({
      uid: 1,
      deviceKey: 1,
      ts: -1,
    });
    log("Ctrl Index Created", { name: "MongoDB" });

    await usersCol.createIndex({
      uid: 1,
    });
    log("User Index Created", { name: "MongoDB" });
  } catch (err) {
    error(err.message, { name: "MongoDB" });
  }
}

export default Object.freeze({
  init,
  aedesdb,
  sensesiotBase,
  sensesiotV2,
});
