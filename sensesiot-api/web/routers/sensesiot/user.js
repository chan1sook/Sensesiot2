import { Router, json } from "express";

import {
  getSensesiotUserInfo,
  updateSensesiotPreferences,
} from "../../../services/sensesiot/user.js";
import WebError from "../../../utils/weberror.js";
import { error } from "../../../utils/logging.js";

const router = Router();

router.get("/user", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getSensesiotUserInfo(req.session.userData.uid);

    res.status(200).json({
      status: "OK",
      userInfo: {
        ...req.session.userData,
        ...userInfo,
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

router.post("/user/update-preferences", json(), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await updateSensesiotPreferences(
      req.session.userData.uid,
      req.body
    );

    res.status(200).json({
      status: "OK",
      userInfo: {
        ...req.session.userData,
        ...userInfo,
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
