/* eslint-disable no-underscore-dangle */
import { ObjectId } from "mongodb";
import { sensesiotV2 } from "../../database/mongodb.js";
import {
  preditNewCredit,
  preditReplaceDashboardWidgetsCredit,
} from "./credits.js";

export async function getAllSensesiotDashboards() {
  const dashboardCol = sensesiotV2.collection("dashboards");

  const dashboards = await dashboardCol.find({}).toArray();
  return dashboards;
}

export async function getSensesiotDashboardsByUser(uid) {
  const dashboardCol = sensesiotV2.collection("dashboards");

  const dashboards = await dashboardCol.find({ uid }).toArray();
  return dashboards;
}

export async function getSensesiotDashboardById(dashboardId) {
  const dashboardCol = sensesiotV2.collection("dashboards");

  const dashboard = await dashboardCol.findOne({ _id: ObjectId(dashboardId) });
  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  return dashboard;
}

export async function createSensesiotDashboard(
  uid,
  { name = "", theme = "default", publicAccess = false, widgets = [] }
) {
  const { max: maxCredits, predit: preditCredits } = await preditNewCredit(
    uid,
    { dashboard: 1 }
  );

  if (preditCredits > maxCredits) {
    throw new Error("Credits not enough");
  }

  const dashboardCol = sensesiotV2.collection("dashboards");
  const data = {
    uid,
    name,
    widgets,
    theme,
    publicAccess,
    createTime: new Date(),
    lastestUpdateTime: new Date(),
  };

  const { insertedId } = await dashboardCol.insertOne(data);
  return {
    _id: insertedId,
    ...data,
  };
}

export async function updateSensesiotDashboard(uid, dashboardId, data) {
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
    await preditReplaceDashboardWidgetsCredit(uid, dashboardId, widgetsLength);

  if (preditCredits > maxCredits) {
    throw new Error("Credits not enough");
  }

  const dashboardCol = sensesiotV2.collection("dashboards");
  const { value } = await dashboardCol.findOneAndUpdate(
    {
      _id: ObjectId(dashboardId),
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

export async function updateSensesiotWidgetData(uid, data, updatedData) {
  const dashboardCol = sensesiotV2.collection("dashboards");

  const targetDashboard = await dashboardCol.findOne({
    uid,
    "widgets._id": data._id,
  });

  if (!targetDashboard) {
    throw new Error("No Dashboard Found");
  }

  const { widgets } = targetDashboard;
  const targetWidget = widgets.find((ele) => ele._id === data._id);

  if (targetWidget) {
    Object.assign(targetWidget, updatedData);
    await updateSensesiotDashboard(uid, targetDashboard._id, {
      widgets,
    });
  }
}

export function removeSensesiotDashboard(uid, dashboardId) {
  const dashboardCol = sensesiotV2.collection("dashboards");
  return dashboardCol.findOneAndDelete({
    _id: ObjectId(dashboardId),
    uid,
  });
}

export default Object.freeze({
  getAllSensesiotDashboards,
  getSensesiotDashboardsByUser,
  getSensesiotDashboardById,
  createSensesiotDashboard,
  updateSensesiotDashboard,
  updateSensesiotWidgetData,
  removeSensesiotDashboard,
});
