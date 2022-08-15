import { Router, json } from "express";

import { error } from "../../utils/logging.js";
import WebError from "../../utils/weberror.js";
import {
  decodeFirebaseAuthToken,
  getUserInfo,
  updateUserLoginTime,
} from "../../services/user.js";

const router = Router();

router.post("/login", json(), async (req, res) => {
  try {
    if (!req.body || !req.body.token) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    const userData = await decodeFirebaseAuthToken(req.body.token);
    let userInfo = await getUserInfo(userData.uid);
    userInfo = await updateUserLoginTime(userData.uid);

    req.session.userData = userData;

    res.status(200).json({
      status: "OK",
      userData: {
        ...userData,
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

router.get("/user", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }

    if (req.session.userData) {
      const userInfo = await getUserInfo(req.session.userData.uid);

      res.status(200).json({
        status: "OK",
        userData: {
          ...req.session.userData,
          ...userInfo,
        },
      });
      return;
    }

    res.status(200).json({
      status: "OK",
      userData: {
        role: "guest",
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

router.post("/logout", (req, res) => {
  try {
    delete req.session.userData;

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
