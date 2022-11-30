import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { sensesiotBase, sensesiotStats } from "../database/mongodb.js";
import { log } from "../utils/logging.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function logUserLoginStats(uid) {
  const loginStatsCol = sensesiotStats.collection("login");
  const markTs = dayjs()
    .tz("Asia/Bangkok")
    .minute(0)
    .second(0)
    .millisecond(0)
    .valueOf();
  const count = await loginStatsCol.countDocuments({ uid, markTs });
  if (count === 0) {
    // inserted one
    await loginStatsCol.insertOne({
      uid,
      markTs,
    });
  }
}

export async function getAllUserCounts() {
  const usersCol = sensesiotBase.collection("users");

  return usersCol.countDocuments();
}

export async function getLogUserLoginCountsByTimes(tsStart, tsEnd) {
  const loginStatsCol = sensesiotStats.collection("login");

  const logDocs = await loginStatsCol
    .find({ markTs: { $gte: tsStart, $lte: tsEnd } })
    .toArray();

  const filterLogs = logDocs.filter(
    (ele, i, arr) => arr.findIndex((ele2) => ele.uid === ele2.uid) === i
  );

  return filterLogs.length;
}

export async function getLogUserLoginStatsByTimes(period, { tsStart, tsEnd }) {
  const trimStartTs = dayjs(tsStart).valueOf();
  const trimEndTs = dayjs(tsEnd).valueOf();
  const loginStatsCol = sensesiotStats.collection("login");

  const logDocs = await loginStatsCol
    .find({ markTs: { $gte: tsStart, $lte: tsEnd } })
    .toArray();

  const results = [];
  let duration = 60 * 60 * 1000;
  if (period === "day") {
    duration *= 24;
  }
  for (let markTs = trimStartTs; markTs < trimEndTs; markTs += duration) {
    const filteredTsLogs = logDocs.filter(
      (ele) => ele.markTs >= markTs && ele.markTs < markTs + duration
    );
    const filteredUserLogs = filteredTsLogs.filter(
      (ele, i, arr) => arr.findIndex((ele2) => ele.uid === ele2.uid) === i
    );

    log(
      `Logs of ${markTs} : ${logDocs.length} => ${filteredTsLogs.length} => ${filteredUserLogs.length}`,
      { name: "getLogUserLoginStats" }
    );

    results.push({
      markTs,
      count: filteredUserLogs.length,
    });
  }

  return results;
}

export default Object.freeze({
  logUserLoginStats,
  getAllUserCounts,
  getLogUserLoginCountsByTimes,
  getLogUserLoginStatsByTimes,
});
