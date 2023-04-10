import dayjs from "dayjs";
import { Router } from "express";
import {
  logUserLoginStats,
  getLogUserLoginCountsByTimes,
  getLogUserLoginStatsByTimes,
  getAllUserCounts,
} from "../../services/stats.js";
import { getUserInfo } from "../../services/user.js";

import { error } from "../../utils/logging.js";
import WebError from "../../utils/weberror.js";
import { isDevRole } from "../../utils/roles.js";

const router = Router();

router.use((req, res, next) => {
  if (req.session && req.session.userData) {
    logUserLoginStats(req.session.userData.uid).catch((err) => {
      error(err.message, { name: "DBLogger" });
    });
  }
  next();
});

router.get("/login-stats", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (!isDevRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    const period = req.query.period || "day";
    let tsStart = parseInt(req.query.tsStart, 10);
    let tsEnd = parseInt(req.query.tsEnd, 10);

    if (!Number.isInteger(tsStart)) {
      tsStart = dayjs().hour(0).minute(0).second(0).millisecond(0).valueOf();
    }
    if (!Number.isInteger(tsEnd)) {
      tsEnd = tsStart + 24 * 60 * 60 * 1000;
    }

    const [allUserCounts, userCounts, userLoginStats] = await Promise.all([
      getAllUserCounts(),
      getLogUserLoginCountsByTimes(tsStart, tsEnd),
      getLogUserLoginStatsByTimes(period, {
        tsStart,
        tsEnd,
      }),
    ]);

    res.status(200).json({
      status: "OK",
      allUserCounts,
      userCounts,
      userLoginStats,
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
