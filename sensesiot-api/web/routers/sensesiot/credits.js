import { Router, json } from "express";

import WebError from "../../../utils/weberror.js";
import { error } from "../../../utils/logging.js";
import {
  getCostInfos,
  costIdentifyNames,
  preditNewCredit,
} from "../../../services/sensesiot/credits.js";

const router = Router();

router.post("/credits/predit", json(), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    if (!req.body) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    const creditInfo = await preditNewCredit(
      req.session.userData.uid,
      req.body || {}
    );

    const creditCosts = await getCostInfos();
    const dashboardCostDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.dashboard
    );
    const dashboardWidgetCostDocs = creditCosts.filter((ele) =>
      ele.name.startsWith(costIdentifyNames.dashboardWidget)
    );
    const dashboardWidget = dashboardWidgetCostDocs.reduce((prev, current) => {
      const trimName = current.name
        .replace(costIdentifyNames.dashboardWidget, "")
        .toLowerCase();
      if (trimName) {
        Object.assign(prev, {
          [trimName]: current.cost,
        });
      } else {
        Object.assign(prev, {
          others: current.cost,
        });
      }
      return prev;
    }, {});

    const deviceCostDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.device
    );
    const reportCostDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.report
    );

    const reportWidgetCostDocs = creditCosts.filter((ele) =>
      ele.name.startsWith(costIdentifyNames.reportWidget)
    );
    const reportWidget = reportWidgetCostDocs.reduce((prev, current) => {
      const trimName = current.name
        .replace(costIdentifyNames.reportWidget, "")
        .toLowerCase();
      if (trimName) {
        Object.assign(prev, {
          [trimName]: current.cost,
        });
      } else {
        Object.assign(prev, {
          others: current.cost,
        });
      }
      return prev;
    }, {});

    res.status(200).json({
      status: "OK",
      creditInfo,
      costs: {
        dashboard: dashboardCostDoc ? dashboardCostDoc.cost : 0,
        dashboardWidget,
        device: deviceCostDoc ? deviceCostDoc.cost : 0,
        report: reportCostDoc ? reportCostDoc.cost : 0,
        reportWidget,
      },
    });
  } catch (err) {
    let code = 500;

    if (err instanceof WebError) {
      code = err.code;
    }

    error(err.message, { name: "Web", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      message: err.message,
    });
  }
});

export default router;
