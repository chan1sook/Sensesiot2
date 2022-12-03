import "colors";

import { MongoClient } from "mongodb";
import { dbNameOf } from "../utils/dbname.js";

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

export const sensesiotBase = mongodb.db(dbNameOf("sensesiotBase"));
export const sensesiotStats = mongodb.db(dbNameOf("sensesiotStats"));
export const sensesiotV2 = mongodb.db(dbNameOf("sensesiotV2"));

export default Object.freeze({
  init,
  sensesiotBase,
  sensesiotStats,
  sensesiotV2,
});
