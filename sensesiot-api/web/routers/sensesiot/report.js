import { Router, json } from "express";

import WebError from "../../../utils/weberror.js";
import { error } from "../../../utils/logging.js";
import {
  createSensesiotReport,
  getSensesiotReportById,
  getSensesiotReportsByUser,
  removeSensesiotReport,
  updateSensesiotReport,
} from "../../../services/sensesiot/report.js";
import { fetchSensesiotDataByReportWidgets } from "../../../services/sensesiot/report-widget.js";

const router = Router();

router.get("/reports", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const reports = await getSensesiotReportsByUser(req.session.userData.uid);

    res.status(200).json({
      status: "OK",
      reports,
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

router.get("/report/:id", async (req, res) => {
  try {
    const report = await getSensesiotReportById(req.params.id);

    if (!report.publicAccess) {
      if (!req.session.userData || report.uid !== req.session.userData.uid) {
        throw new WebError("Forbidden", 403);
      }
    }

    res.status(200).json({
      status: "OK",
      report,
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

router.post("/report/add", json(), async (req, res) => {
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

    const report = await createSensesiotReport(
      req.session.userData.uid,
      req.body
    );

    res.status(200).json({
      status: "OK",
      report,
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

router.post("/report/edit/:id", json(), async (req, res) => {
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

    const report = await updateSensesiotReport(
      req.session.userData.uid,
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: "OK",
      report,
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

router.post("/report/delete/:id", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    await removeSensesiotReport(req.session.userData.uid, req.params.id);

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

// TODO pdf generator
router.get("/report-data/:id/pdf", async (req, res) => {
  try {
    const report = await getSensesiotReportById(req.params.id);

    if (!report.publicAccess) {
      if (!req.session.userData || report.uid !== req.session.userData.uid) {
        throw new WebError("Forbidden", 403);
      }
    }

    const { adjustmentDates } = req.query;

    const reportData = await fetchSensesiotDataByReportWidgets(report.widgets, {
      adjustmentDates: JSON.stringify(adjustmentDates) || {},
    });

    // TODO

    res.status(501).json({
      status: "error",
      message: "Not Implemented",
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

// TODO xlsx generator
router.get("/report-data/:id/xlsx", async (req, res) => {
  try {
    const report = await getSensesiotReportById(req.params.id);

    if (!report.publicAccess) {
      if (!req.session.userData || report.uid !== req.session.userData.uid) {
        throw new WebError("Forbidden", 403);
      }
    }

    const { adjustmentDates } = req.query;

    const reportData = await fetchSensesiotDataByReportWidgets(report.widgets, {
      adjustmentDates: JSON.stringify(adjustmentDates) || {},
    });

    // TODO

    res.status(501).json({
      status: "error",
      message: "Not Implemented",
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

router.get("/report-data/:id", async (req, res) => {
  try {
    const report = await getSensesiotReportById(req.params.id);

    if (!report.publicAccess) {
      if (!req.session.userData || report.uid !== req.session.userData.uid) {
        throw new WebError("Forbidden", 403);
      }
    }

    const { adjustmentDates } = req.query;

    const reportData = await fetchSensesiotDataByReportWidgets(report.widgets, {
      adjustmentDates: JSON.stringify(adjustmentDates) || {},
    });

    res.status(200).json({
      status: "OK",
      reportData,
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

router.get("/report-data/:id/json", (req, res) => {
  res.redirect(`/report-data/${req.params.id}`);
});

export default router;
