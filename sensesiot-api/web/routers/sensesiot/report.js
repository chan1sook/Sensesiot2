/* eslint-disable no-underscore-dangle */
import { Router, json } from "express";
import { stringify as csvStringify } from "csv";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import excel4node from "excel4node";

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

dayjs.extend(utc);
dayjs.extend(timezone);

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

router.get("/report-export/:id/:wid/:type", async (req, res) => {
  try {
    const report = await getSensesiotReportById(req.params.id);

    if (!report.publicAccess) {
      if (!req.session.userData || report.uid !== req.session.userData.uid) {
        throw new WebError("Forbidden", 403);
      }
    }

    const targetWidget = report.widgets.find(
      (ele) => ele._id === req.params.wid && ele.type === "chart"
    );

    if (!targetWidget) {
      throw new WebError("Report Widget not found/valid", 403);
    }

    const { adjustmentDates } = req.query;
    const rawReportData = await fetchSensesiotDataByReportWidgets(
      [targetWidget],
      {
        adjustmentDates: JSON.stringify(adjustmentDates) || {},
      }
    );

    const reportData = (rawReportData[0]?.data || []).map((ele) => ({
      ...(ele.metadata || {}),
      ts: ele.ts,
      dateTime: dayjs(ele.ts).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss"),
    }));

    if (req.params.type === "json") {
      res.status(200).json({
        status: "OK",
        reportData,
      });
    } else if (req.params.type === "csv") {
      const stringifier = csvStringify({
        bom: true,
        header: ["ts", "dateTime", "data"],
        columns: [
          { key: "dateTime", header: "DateTime" },
          { key: "ts", header: "Timestamp" },
          { key: "data", header: "Data" },
        ],
      });
      res.status(200).attachment(`export-${nanoid()}.csv`);
      stringifier.pipe(res);

      for (let i = 0; i < reportData.length; i += 1) {
        stringifier.write(reportData[i]);
      }

      stringifier.end();
    } else if (req.params.type === "xlsx") {
      const wb = new excel4node.Workbook();
      const ws = wb.addWorksheet("Export Chart");

      const headerStyle = wb.createStyle({
        font: {
          bold: true,
          size: 12,
        },
      });
      const dataStyle = wb.createStyle({
        font: { size: 10 },
      });
      const tsDataStyle = wb.createStyle({
        font: { size: 10 },
        numberFormat: "#",
      });

      ws.column(1).setWidth(18);
      ws.column(2).setWidth(18);
      ws.column(3).setWidth(10);

      ws.cell(1, 1).string("Date Time").style(headerStyle);
      ws.cell(1, 2).string("Timestamp").style(headerStyle);
      ws.cell(1, 3).string("Data").style(headerStyle);

      const dataRow = 2;
      for (let i = 0; i < reportData.length; i += 1) {
        ws.cell(dataRow + i, 1)
          .string(reportData[i].dateTime)
          .style(dataStyle);
        ws.cell(dataRow + i, 2)
          .number(dayjs(reportData[i].ts).valueOf())
          .style(tsDataStyle);
        ws.cell(dataRow + i, 3)
          .number(reportData[i].data)
          .style(dataStyle);
      }

      const xlsxBuffer = await wb.writeToBuffer();
      res.status(200).attachment(`export-${nanoid()}.xlsx`).end(xlsxBuffer);
    } else {
      throw new WebError("Invalid Type", 400);
    }
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
