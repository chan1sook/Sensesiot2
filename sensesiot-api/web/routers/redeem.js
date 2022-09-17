import { Router, json } from "express";
import {
  generateRedeemCode,
  getAllRedeemCodes,
  getRedeemCodeById,
  redeemCode,
  removeRedeemCode,
  updateRedeemCodeInfo,
} from "../../services/redeem-code.js";
import { getUserInfo } from "../../services/user.js";

import { error } from "../../utils/logging.js";
import WebError from "../../utils/weberror.js";

const router = Router();

router.get("/redeem-codes", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (userInfo.role !== "developer") {
      throw new WebError("Forbidden", 403);
    }

    const redeemCodes = await getAllRedeemCodes();

    res.status(200).json({
      status: "OK",
      redeemCodes,
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

router.get("/redeem-code/:id", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (userInfo.role !== "developer") {
      throw new WebError("Forbidden", 403);
    }

    const redeemCodeResult = await getRedeemCodeById(req.params.id);

    res.status(200).json({
      status: "OK",
      redeemCode: redeemCodeResult,
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

router.post("/redeem-code/edit/:id", json(), async (req, res) => {
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

    const redeemCodeResult = await updateRedeemCodeInfo(
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: "OK",
      redeemCode: redeemCodeResult,
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

router.post("/redeem-code/delete/:id", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    await removeRedeemCode(req.params.id);

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

router.post("/redeem-codes/generate", json(), async (req, res) => {
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

    const redeemCodeResult = await generateRedeemCode(req.body);

    res.status(200).json({
      status: "OK",
      redeemCode: redeemCodeResult,
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

router.post("/redeem", json(), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    if (!req.body || !req.body.code) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    const redeemValue = await redeemCode(
      req.session.userData.uid,
      req.body.code
    );

    res.status(200).json({
      status: "OK",
      code: req.body.code,
      redeemValue,
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
