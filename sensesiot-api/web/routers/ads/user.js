import { Router } from "express";

import { getUserInfo } from "../../../services/user.js";
import {
  getSensesiotAdUserInfo,
} from "../../../services/ads/user.js";
import WebError from "../../../utils/weberror.js";
import { error } from "../../../utils/logging.js";
import { isAdsManagerRole } from "../../../utils/roles.js";

const router = Router();

router.get("/user", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if(!isAdsManagerRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    const userAdsInfo = await getSensesiotAdUserInfo(req.session.userData.uid);

    res.status(200).json({
      status: "OK",
      userInfo: {
        ...req.session.userData,
        ...userAdsInfo,
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
