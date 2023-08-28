import { ObjectId } from "mongodb";
import { sensesiotV2 } from "../../database/mongodb.js";
import { log } from "../../utils/logging.js";

const baseDashboardCost = 50;
const baseReportCost = 100;
const baseDeviceCost = 200;
const defaultDashboardWidgetCost = {
  label: 10,
  gauge: 25,
  chart: 50,
  control: 75,
  condition: 250,
};
const defaultReportWidgetCost = {
  label: 10,
  chart: 100,
};
export const costIdentifyNames = Object.freeze({
  dashboard: "dashboard",
  dashboardWidget: "dashboardWidget",
  ...Object.keys(defaultDashboardWidgetCost).reduce((prev, current) => {
    const key = `dashboardWidget${current[0].toUpperCase()}${current.slice(1)}`;
    Object.assign(prev, {
      [key]: key,
    });
    return prev;
  }, {}),
  device: "device",
  report: "report",
  reportWidget: "reportWidget",
  ...Object.keys(defaultReportWidgetCost).reduce((prev, current) => {
    const key = `reportWidget${current[0].toUpperCase()}${current.slice(1)}`;
    Object.assign(prev, {
      [key]: key,
    });
    return prev;
  }, {}),
});

const allCostArray = Object.values(costIdentifyNames);

export async function getCostInfos(names = allCostArray) {
  const costCol = sensesiotV2.collection("costs");
  const costDocs = await costCol.find({ name: { $in: names } }).toArray();

  return costDocs;
}

async function getCostInfo(name) {
  const costDocs = await getCostInfos([name]);

  return costDocs.length > 0 ? costDocs[0] : null;
}

export function getCostableWidgets(widgets = []) {
  return widgets.filter((ele) => !ele.isFree);
}

export async function initSensesiotCreditCosts() {
  const costCol = sensesiotV2.collection("costs");

  const dashboardCostDoc = await getCostInfo(costIdentifyNames.dashboard);
  if (!dashboardCostDoc) {
    log("Insert dashboardCreditCost", { name: "Init" });
    await costCol.insertOne({
      name: costIdentifyNames.dashboard,
      cost: baseDashboardCost,
    });
  }

  const dashboardWidgetDoc = await getCostInfo(
    costIdentifyNames.dashboardWidget
  );
  if (!dashboardWidgetDoc) {
    log("Insert dashboardWidgetCost", { name: "Init" });
    await costCol.insertOne({
      name: costIdentifyNames.dashboardWidget,
      cost: 50,
    });
  }

  const dashboardWidgetKeys = Object.keys(defaultDashboardWidgetCost);
  for (let i = 0; i < dashboardWidgetKeys.length; i += 1) {
    const key = dashboardWidgetKeys[i];
    const identifyName = `${
      costIdentifyNames.dashboardWidget
    }${key[0].toUpperCase()}${key.slice(1)}`;
    // eslint-disable-next-line no-await-in-loop
    const widgetDoc = await getCostInfo(identifyName);
    if (!widgetDoc) {
      // eslint-disable-next-line no-await-in-loop
      await costCol.insertOne({
        name: identifyName,
        cost: defaultDashboardWidgetCost[key],
      });
    }
  }

  const deviceCostDoc = await getCostInfo(costIdentifyNames.device);
  if (!deviceCostDoc) {
    log("Insert deviceCreditCost", { name: "Init" });
    await costCol.insertOne({
      name: costIdentifyNames.device,
      cost: baseDeviceCost,
    });
  }

  const reportCostDoc = await getCostInfo(costIdentifyNames.report);
  if (!reportCostDoc) {
    log("Insert reportCreditCost", { name: "Init" });
    await costCol.insertOne({
      name: costIdentifyNames.report,
      cost: baseReportCost,
    });
  }

  const reportWidgetDoc = await getCostInfo(costIdentifyNames.reportWidget);
  if (!reportWidgetDoc) {
    log("Insert reportWidget", { name: "Init" });
    await costCol.insertOne({
      name: costIdentifyNames.reportWidget,
      cost: 50,
    });
  }

  const reportWidgetKeys = Object.keys(defaultReportWidgetCost);
  for (let i = 0; i < reportWidgetKeys.length; i += 1) {
    const key = reportWidgetKeys[i];
    const identifyName = `${
      costIdentifyNames.reportWidget
    }${key[0].toUpperCase()}${key.slice(1)}`;
    // eslint-disable-next-line no-await-in-loop
    const widgetDoc = await getCostInfo(identifyName);
    if (!widgetDoc) {
      // eslint-disable-next-line no-await-in-loop
      await costCol.insertOne({
        name: identifyName,
        cost: defaultReportWidgetCost[key],
      });
    }
  }
}

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
    const costableWidgets = getCostableWidgets(current.widgets);
    const widgetTypes = costableWidgets.map((ele) => ele.type);
    const result = { ...prev };
    for (let i = 0; i < widgetTypes.length; i += 1) {
      const widgetType = widgetTypes[i];
      if (typeof result[widgetType] === "number") {
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
    const costableWidgets = getCostableWidgets(current.widgets);
    const widgetTypes = costableWidgets.map((ele) => ele.type);
    const result = { ...prev };
    for (let i = 0; i < widgetTypes.length; i += 1) {
      const widgetType = widgetTypes[i];
      if (typeof result[widgetType] === "number") {
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

function computeUsedCredits(
  creditCosts = [],
  {
    dashboardsLength = 0,
    widgetsLength = {},
    devicesLength = 0,
    reportsLength = 0,
    reportWidgetsLength = {},
  } = {}
) {
  let credits = 0;

  if (Number.isInteger(dashboardsLength)) {
    const dashboardCostDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.dashboard
    );
    const cost = dashboardCostDoc ? dashboardCostDoc.cost : 0;
    credits += dashboardsLength > 1 ? (dashboardsLength - 1) * cost : 0;
  }

  if (widgetsLength && typeof widgetsLength === "object") {
    const keys = Object.keys(widgetsLength);

    const dashboardWidgetCostDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.dashboardWidget
    );
    const otherWidgetCost = dashboardWidgetCostDoc
      ? dashboardWidgetCostDoc.cost
      : 0;

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const fullName = `${
        costIdentifyNames.dashboardWidget
      }${key[0].toUpperCase()}${key.slice(1)}`;

      const widgetCostDoc = creditCosts.find((ele) => ele.name === fullName);

      const baseCost = widgetCostDoc ? widgetCostDoc.cost : otherWidgetCost;
      credits += baseCost * widgetsLength[key];
    }
  }

  if (Number.isInteger(devicesLength)) {
    const deviceCostDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.device
    );
    const cost = deviceCostDoc ? deviceCostDoc.cost : 0;
    credits += devicesLength > 1 ? (devicesLength - 1) * cost : 0;
  }

  if (Number.isInteger(reportsLength)) {
    const reportCostDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.report
    );
    const cost = reportCostDoc ? reportCostDoc.cost : 0;
    credits += reportsLength > 1 ? (reportsLength - 1) * cost : 0;
  }

  if (reportWidgetsLength && typeof reportWidgetsLength === "object") {
    const keys = Object.keys(reportWidgetsLength);

    const reportWidgetCostDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.reportWidget
    );
    const otherWidgetCost = reportWidgetCostDoc ? reportWidgetCostDoc.cost : 0;

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const fullName = `${
        costIdentifyNames.reportWidget
      }${key[0].toUpperCase()}${key.slice(1)}`;

      const widgetCostDoc = creditCosts.find((ele) => ele.name === fullName);
      const baseCost = widgetCostDoc ? widgetCostDoc.cost : otherWidgetCost;
      credits += baseCost * reportWidgetsLength[key];
    }
  }

  return credits;
}

export async function getSensesiotUsedCredits(uid) {
  const resourceInfo = await getUsedResourceInfo(uid);
  const creditCostDocs = await getCostInfos();
  return computeUsedCredits(creditCostDocs, resourceInfo);
}

function groupWidgetKeys(info, widgets = {}, groupKey = "widgetsLength") {
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

  const creditCostDocs = await getCostInfos();

  const creditInfo = {
    max: maxCredits,
    current: computeUsedCredits(creditCostDocs, resourceInfo),
    predit: computeUsedCredits(creditCostDocs, newInfo),
  };

  return creditInfo;
}

export async function preditReplaceDashboardWidgetsCredit(
  uid,
  dashboardId,
  widgetsLength = {}
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

  const targetCostableWidgets = getCostableWidgets(targetDashboard.widgets);
  for (let i = 0; i < targetCostableWidgets.length; i += 1) {
    const key = targetCostableWidgets[i].type;
    if (typeof newInfo.widgetsLength[key] === "number") {
      newInfo.widgetsLength[key] -= 1;
    } else {
      newInfo.widgetsLength[key] = -1;
    }
  }

  const keys = Object.keys(widgetsLength);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (typeof newInfo.widgetsLength[key] === "number") {
      newInfo.widgetsLength[key] += widgetsLength[key];
    } else {
      newInfo.widgetsLength[key] = widgetsLength[key];
    }
  }

  const creditCostDocs = await getCostInfos();

  const creditInfo = {
    max: maxCredits,
    current: computeUsedCredits(creditCostDocs, resourceInfo),
    predit: computeUsedCredits(creditCostDocs, newInfo),
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

  const creditCostDocs = await getCostInfos();

  const creditInfo = {
    max: maxCredits,
    current: computeUsedCredits(creditCostDocs, resourceInfo),
    predit: computeUsedCredits(creditCostDocs, newInfo),
  };

  return creditInfo;
}

export default Object.freeze({
  costIdentifyNames,
  getCostInfos,
  getCostableWidgets,
  initSensesiotCreditCosts,
  getSensesiotUsedCredits,
  preditNewCredit,
  preditReplaceDashboardWidgetsCredit,
  preditReplaceReportWidgetsCredit,
});
