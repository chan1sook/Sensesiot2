import "colors";

import { MongoClient } from "mongodb";
import { dbNameOf } from "../utils/dbname.js";

import { log, error } from "../utils/logging.js";

const mongodb = new MongoClient("mongodb://localhost:27017");

export const sensesiotBase = mongodb.db(dbNameOf("sensesiotBase"));
export const sensesiotStats = mongodb.db(dbNameOf("sensesiotStats"));
export const sensesiotAds = mongodb.db(dbNameOf("sensesiotAds"));
export const sensesiotV2 = mongodb.db(dbNameOf("sensesiotV2"));

export async function init() {
  try {
    log("Connecting", { name: "MongoDB" });
    await mongodb.connect();
    log("Connected", { name: "MongoDB" });

    // create index if not exists
    const dataCol = sensesiotV2.collection("data");
    const ctrlCol = sensesiotV2.collection("control");
    const dashboardCol = sensesiotV2.collection("dashboards");
    const reportCol = sensesiotV2.collection("reports");
    const usersCol = sensesiotBase.collection("users");
    const transactionCol = sensesiotBase.collection("transactions");

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

    await dashboardCol.createIndex({
      _id: 1,
      uid: 1,
    });
    log("Dashboard Index Created", { name: "MongoDB" });

    await reportCol.createIndex({
      _id: 1,
      uid: 1,
    });
    log("Report Index Created", { name: "MongoDB" });

    await usersCol.createIndex({
      uid: 1,
    });
    log("User Index Created", { name: "MongoDB" });

    await transactionCol.createIndex({
      uid: 1,
      createTime: -1,
    });
    log("Transaction Index Created", { name: "MongoDB" });
  } catch (err) {
    error(err.message, { name: "MongoDB" });
  }
}

export default Object.freeze({
  init,
  sensesiotBase,
  sensesiotStats,
  sensesiotAds,
  sensesiotV2,
});
