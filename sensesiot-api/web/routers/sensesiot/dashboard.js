import { Router, json } from "express";

import WebError from "../../../utils/weberror.js";
import { error } from "../../../utils/logging.js";
import {
  createSensesiotDashboard,
  getSensesiotDashboardById,
  getSensesiotDashboardsByUser,
  removeSensesiotDashboard,
  updateSensesiotDashboard,
} from "../../../services/sensesiot/dashboard.js";

const router = Router();

router.get("/dashboards", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const dashboards = await getSensesiotDashboardsByUser(
      req.session.userData.uid
    );

    res.status(200).json({
      status: "OK",
      dashboards,
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

router.get("/dashboard/:id", async (req, res) => {
  try {
    const dashboard = await getSensesiotDashboardById(req.params.id);

    if (!dashboard.public) {
      throw new WebError("Forbidden", 403);
    }

    res.status(200).json({
      status: "OK",
      dashboard,
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

router.post("/dashboard/add", json(), async (req, res) => {
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

    const dashboard = await createSensesiotDashboard(
      req.session.userData.uid,
      req.body
    );

    res.status(200).json({
      status: "OK",
      dashboard,
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

router.post("/dashboard/edit/:id", json(), async (req, res) => {
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

    const dashboard = await updateSensesiotDashboard(
      req.session.userData.uid,
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: "OK",
      dashboard,
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

router.post("/dashboard/delete/:id", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    await removeSensesiotDashboard(req.session.userData.uid, req.params.id);

    res.status(200).json({
      status: "OK",
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
