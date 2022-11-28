import "colors";

import { MongoClient } from "mongodb";

import { log, error } from "../utils/logging.js";

const mongodb = new MongoClient("mongodb://localhost:27017");

export async function init() {
  try {
    log("Connecting", { name: "MongoDB" });
    await mongodb.connect();
    log("Connected", { name: "MongoDB" });
  } catch (err) {
    error(err.message, { name: "MongoDB" });
  }
}

const nodeEnv = process.env.NODE_ENV;
function dbNameOf(name) {
  return nodeEnv === "production"
    ? name
    : `${name}-${nodeEnv || "development"}`;
}
export const sensesiotBase = mongodb.db(dbNameOf("sensesiotBase"));
export const sensesiotStats = mongodb.db(dbNameOf("sensesiotStats"));
export const sensesiotV2 = mongodb.db(dbNameOf("sensesiotV2"));

export default Object.freeze({
  init,
  sensesiotBase,
  sensesiotStats,
  sensesiotV2,
});
