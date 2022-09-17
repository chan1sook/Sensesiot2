import { Router, json } from "express";

import WebError from "../../../utils/weberror.js";
import { error } from "../../../utils/logging.js";
import {
  dashboardCreditCost,
  dashboardWidgetCost,
  deviceCreditCost,
  preditNewCredit,
  reportCreditCost,
  reportWidgetCost,
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

    res.status(200).json({
      status: "OK",
      creditInfo,
      costs: {
        dashboard: dashboardCreditCost,
        dashboardWidget: dashboardWidgetCost,
        device: deviceCreditCost,
        report: reportCreditCost,
        reportWidget: reportWidgetCost,
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
