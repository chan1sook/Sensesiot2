import { ObjectId } from "mongodb";
import { sensesiotV2 } from "../../database/mongodb.js";
import {
  preditNewCredit,
  preditReplaceReportWidgetsCredit,
} from "./credits.js";

export async function getSensesiotReportsByUser(uid) {
  const reportCol = sensesiotV2.collection("reports");

  const reports = await reportCol.find({ uid }).toArray();
  return reports;
}

export async function getSensesiotReportById(dashboardId) {
  const reportCol = sensesiotV2.collection("reports");

  const report = await reportCol.findOne({ _id: ObjectId(dashboardId) });
  if (!report) {
    throw new Error("Report not found");
  }

  return report;
}

export async function createSensesiotReport(
  uid,
  {
    name = "",
    theme = "default",
    publicAccess = false,
    timeframe = "day",
    widgets = [],
  }
) {
  const { max: maxCredits, predit: preditCredits } = await preditNewCredit(
    uid,
    { report: 1 }
  );

  if (preditCredits > maxCredits) {
    throw new Error("Credits not enough");
  }

  const reportCol = sensesiotV2.collection("reports");
  const data = {
    uid,
    name,
    theme,
    publicAccess,
    timeframe,
    widgets,
  };

  const { insertedId } = await reportCol.insertOne(data);
  return {
    _id: insertedId,
    ...data,
  };
}

export async function updateSensesiotReport(uid, reportId, data) {
  const widgets = Array.isArray(data.widgets) ? data.widgets : [];

  const widgetsLength = widgets.reduce((prev, current) => {
    const result = { ...prev };
    if (result[current.type]) {
      result[current.type] += 1;
    } else {
      result[current.type] = 1;
    }
    return result;
  }, {});

  const { max: maxCredits, predit: preditCredits } =
    await preditReplaceReportWidgetsCredit(uid, reportId, widgetsLength);

  if (preditCredits > maxCredits) {
    throw new Error("Credits not enough");
  }

  const reportCol = sensesiotV2.collection("reports");
  const { value } = await reportCol.findOneAndUpdate(
    {
      _id: ObjectId(reportId),
      uid,
    },
    {
      $set: { ...data, lastestUpdateTime: new Date() },
    },
    { returnDocument: "after" }
  );

  if (!value) {
    throw new Error("Forbidden");
  }

  return value;
}

export function removeSensesiotReport(uid, reportId) {
  const reportCol = sensesiotV2.collection("reports");
  return reportCol.findOneAndDelete({
    _id: ObjectId(reportId),
    uid,
  });
}

export default Object.freeze({
  getSensesiotReportsByUser,
  getSensesiotReportById,
  createSensesiotReport,
  updateSensesiotReport,
  removeSensesiotReport,
});
