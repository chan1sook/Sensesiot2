import { ObjectId } from "mongodb";
import { sensesiotV2 } from "../../database/mongodb.js";

export const dashboardWidgetCost = {
  label: 10,
  gauge: 25,
  chart: 50,
  control: 75,
  condition: 250,
  others: 50,
};
export const dashboardCreditCost = 500;
export const deviceCreditCost = 100;
export const reportWidgetCost = {
  label: 10,
  chart: 100,
  others: 50,
};
export const reportCreditCost = 500;

async function getUsedResourceInfo(uid) {
  const dashboardCol = sensesiotV2.collection("dashboards");
  const deviceCol = sensesiotV2.collection("devices");
  const reportCol = sensesiotV2.collection("reports");

  const [dashboards, devices, reports] = await Promise.all([
    dashboardCol.find({ uid }).toArray(),
    deviceCol.find({ uid }).toArray(),
    reportCol.find({ uid }).toArray(),
  ]);

  const dashboardsLength = dashboards.length;

  const widgetsLength = dashboards.reduce((prev, current) => {
    const widgetTypes = current.widgets.map((ele) => ele.type);
    const result = { ...prev };
    for (let i = 0; i < widgetTypes.length; i += 1) {
      const widgetType = widgetTypes[i];
      if (typeof prev[widgetType] === "number") {
        result[widgetType] += 1;
      } else {
        result[widgetType] = 1;
      }
    }

    return result;
  }, {});

  const devicesLength = devices.length;
  const reportsLength = reports.length;
  const reportWidgetsLength = reports.reduce((prev, current) => {
    const widgetTypes = current.widgets.map((ele) => ele.type);
    const result = { ...prev };
    for (let i = 0; i < widgetTypes.length; i += 1) {
      const widgetType = widgetTypes[i];
      if (typeof prev[widgetType] === "number") {
        result[widgetType] += 1;
      } else {
        result[widgetType] = 1;
      }
    }

    return result;
  }, {});

  return {
    dashboardsLength,
    widgetsLength,
    devicesLength,
    reportsLength,
    reportWidgetsLength,
  };
}

function computeUsedCredits({
  dashboardsLength = 0,
  widgetsLength = {},
  devicesLength = 0,
  reportsLength = 0,
  reportWidgetsLength = {},
} = {}) {
  let credits = 0;

  if (Number.isInteger(dashboardsLength)) {
    credits +=
      dashboardsLength > 1 ? (dashboardsLength - 1) * dashboardCreditCost : 0;
  }

  if (widgetsLength && typeof widgetsLength === "object") {
    const keys = Object.keys(widgetsLength);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const baseCost = dashboardWidgetCost[key] || dashboardWidgetCost.others;
      credits += baseCost * widgetsLength[key];
    }
  }

  if (Number.isInteger(devicesLength)) {
    credits += devicesLength > 1 ? (devicesLength - 1) * deviceCreditCost : 0;
  }

  if (Number.isInteger(reportsLength)) {
    credits += reportsLength > 1 ? (reportsLength - 1) * reportCreditCost : 0;
  }

  if (reportWidgetsLength && typeof reportWidgetsLength === "object") {
    const keys = Object.keys(reportWidgetsLength);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const baseCost = reportWidgetCost[key] || reportWidgetCost.others;
      credits += baseCost * reportWidgetsLength[key];
    }
  }

  return credits;
}

export async function getSensesiotUsedCredits(uid) {
  const resourceInfo = await getUsedResourceInfo(uid);
  return computeUsedCredits(resourceInfo);
}

function groupWidgetKeys(info, widgets, groupKey = "widgetsLength") {
  const newInfo = info;
  const widgetKeys = Object.keys(widgets);
  for (let i = 0; i < widgetKeys.length; i += 1) {
    const key = widgetKeys[i];
    if (typeof newInfo[groupKey][key] === "number") {
      newInfo[groupKey][key] += widgets[key];
    } else {
      newInfo[groupKey][key] = widgets[key];
    }
  }
}
export async function preditNewCredit(
  uid,
  {
    dashboard = 0,
    widgets = {},
    device = 0,
    report = 0,
    reportWidgets = {},
  } = {}
) {
  const usersCol = sensesiotV2.collection("users");
  const userInfo = await usersCol.findOne({ uid });
  const maxCredits = userInfo.credits;

  const resourceInfo = await getUsedResourceInfo(uid);
  const newInfo = JSON.parse(JSON.stringify(resourceInfo));

  newInfo.dashboardsLength += dashboard;

  groupWidgetKeys(newInfo, widgets, "widgetsLength");

  newInfo.devicesLength += device;
  newInfo.reportsLength += report;

  groupWidgetKeys(newInfo, reportWidgets, "reportWidgetsLength");

  const creditInfo = {
    max: maxCredits,
    current: computeUsedCredits(resourceInfo),
    predit: computeUsedCredits(newInfo),
  };

  return creditInfo;
}

export async function preditReplaceDashboardWidgetsCredit(
  uid,
  dashboardId,
  widgets = {}
) {
  const usersCol = sensesiotV2.collection("users");
  const userInfo = await usersCol.findOne({ uid });
  const maxCredits = userInfo.credits;

  const resourceInfo = await getUsedResourceInfo(uid);
  const newInfo = JSON.parse(JSON.stringify(resourceInfo));

  const dashboardCol = sensesiotV2.collection("dashboards");
  const targetDashboard = await dashboardCol.findOne({
    _id: ObjectId(dashboardId),
  });

  for (let i = 0; i < targetDashboard.widgets.length; i += 1) {
    const key = targetDashboard.widgets[i].type;
    if (typeof newInfo.widgetsLength[key] === "number") {
      newInfo.widgetsLength[key] -= 1;
    } else {
      newInfo.widgetsLength[key] = -1;
    }
  }

  const keys = Object.keys(widgets);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (typeof newInfo.widgetsLength[key] === "number") {
      newInfo.widgetsLength[key] += widgets[key];
    } else {
      newInfo.widgetsLength[key] = widgets[key];
    }
  }

  const creditInfo = {
    max: maxCredits,
    current: computeUsedCredits(resourceInfo),
    predit: computeUsedCredits(newInfo),
  };

  return creditInfo;
}

export async function preditReplaceReportWidgetsCredit(
  uid,
  reportId,
  reportWidgets = {}
) {
  const usersCol = sensesiotV2.collection("users");
  const userInfo = await usersCol.findOne({ uid });
  const maxCredits = userInfo.credits;

  const resourceInfo = await getUsedResourceInfo(uid);
  const newInfo = JSON.parse(JSON.stringify(resourceInfo));

  const reportCol = sensesiotV2.collection("reports");
  const targetReport = await reportCol.findOne({
    _id: ObjectId(reportId),
  });

  for (let i = 0; i < targetReport.widgets.length; i += 1) {
    const key = targetReport.widgets[i].type;
    if (typeof newInfo.reportWidgetsLength[key] === "number") {
      newInfo.reportWidgetsLength[key] -= 1;
    } else {
      newInfo.reportWidgetsLength[key] = -1;
    }
  }

  const keys = Object.keys(reportWidgets);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (typeof newInfo.reportWidgetsLength[key] === "number") {
      newInfo.reportWidgetsLength[key] += reportWidgets[key];
    } else {
      newInfo.reportWidgetsLength[key] = reportWidgets[key];
    }
  }

  const creditInfo = {
    max: maxCredits,
    current: computeUsedCredits(resourceInfo),
    predit: computeUsedCredits(newInfo),
  };

  return creditInfo;
}

export default Object.freeze({
  dashboardWidgetCost,
  dashboardCreditCost,
  deviceCreditCost,
  reportCreditCost,
  reportWidgetCost,
  getSensesiotUsedCredits,
  preditNewCredit,
  preditReplaceDashboardWidgetsCredit,
  preditReplaceReportWidgetsCredit,
});
