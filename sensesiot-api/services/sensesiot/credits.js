import { ObjectId } from "mongodb";
import { sensesiotV2 } from "../../database/mongodb.js";

export const widgetCreditCost = {
  label: 10,
  gauge: 25,
  chart: 50,
  control: 75,
  condition: 250,
  others: 50,
};
export const dashboardCreditCost = 500;
export const deviceCreditCost = 100;

async function getUsedResourceInfo(uid) {
  const dashboardCol = sensesiotV2.collection("dashboards");
  const dashboards = await dashboardCol.find({ uid }).toArray();
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

  const deviceCol = sensesiotV2.collection("devices");
  const devices = await deviceCol.find({ uid }).toArray();
  const devicesLength = devices.length;

  return {
    dashboardsLength,
    widgetsLength,
    devicesLength,
  };
}

function computeUsedCredits({
  dashboardsLength = 0,
  widgetsLength = {},
  devicesLength = 0,
} = {}) {
  let credits =
    dashboardsLength > 1 ? (dashboardsLength - 1) * dashboardCreditCost : 0;

  if (widgetsLength && typeof widgetsLength === "object") {
    const keys = Object.keys(widgetsLength);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const baseCost = widgetCreditCost[key] || widgetCreditCost.others;
      credits += baseCost * widgetsLength[key];
    }
  }

  if (Number.isInteger(devicesLength)) {
    credits += devicesLength > 1 ? (devicesLength - 1) * deviceCreditCost : 0;
  }

  return credits;
}

export async function getSensesiotUsedCredits(uid) {
  const resourceInfo = await getUsedResourceInfo(uid);
  return computeUsedCredits(resourceInfo);
}

export async function preditNewCredit(
  uid,
  { dashboard = 0, widgets = {}, device = 0 } = {}
) {
  const usersCol = sensesiotV2.collection("users");
  const userInfo = await usersCol.findOne({ uid });
  const maxCredits = userInfo.credits;

  const resourceInfo = await getUsedResourceInfo(uid);
  const newInfo = JSON.parse(JSON.stringify(resourceInfo));

  newInfo.dashboardsLength += dashboard;

  const keys = Object.keys(widgets);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (typeof newInfo.widgetsLength[key] === "number") {
      newInfo.widgetsLength[key] += widgets[key];
    } else {
      newInfo.widgetsLength[key] = widgets[key];
    }
  }

  newInfo.devicesLength += device;

  const creditInfo = {
    max: maxCredits,
    current: computeUsedCredits(resourceInfo),
    predit: computeUsedCredits(newInfo),
  };

  return creditInfo;
}

export async function preditReplaceWidgetsCredit(
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
  const targetWidget = await dashboardCol.findOne({
    _id: ObjectId(dashboardId),
  });

  for (let i = 0; i < targetWidget.widgets.length; i += 1) {
    const key = targetWidget.widgets[i].type;
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
export default Object.freeze({
  widgetCreditCost,
  dashboardCreditCost,
  deviceCreditCost,
  getSensesiotUsedCredits,
  preditNewCredit,
  preditReplaceWidgetsCredit,
});
