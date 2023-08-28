import { Router, json } from "express";

import WebError from "../../../utils/weberror.js";
import { error } from "../../../utils/logging.js";
import {
  createSensesiotAds,
  getSensesiotAdsById,
  getSensesiotAdsByUser,
  getRandomWatchableAds,
  updateSensesiotAds,
  removeSensesiotAds,
  validateYtLink,
} from "../../../services/ads/ads.js";
import { isAdsManagerRole } from "../../../utils/roles.js";
import { getUserInfo } from "../../../services/user.js";
import {
  costIdentifyNames,
  getCostInfos,
} from "../../../services/ads/credits.js";

const router = Router();

router.post("/yt-validate", json(), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (!isAdsManagerRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    const data = await validateYtLink(req.body.link);
    res.status(200).json({
      status: "OK",
      ytdata: data,
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

router.post("/credits/costs", json(), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (!isAdsManagerRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    if (!req.body) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    const creditCosts = await getCostInfos([
      costIdentifyNames.videoCreditCostPerMin,
    ]);

    const videoCreditCostPerMinDoc = creditCosts.find(
      (ele) => ele.name === costIdentifyNames.videoCreditCostPerMin
    );

    res.status(200).json({
      status: "OK",
      costs: {
        videoCreditCostPerMin: videoCreditCostPerMinDoc
          ? videoCreditCostPerMinDoc.cost
          : 0,
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

router.get("/random-ads", async (req, res) => {
  try {
    const randomAds = await getRandomWatchableAds();
    res.status(200).json({
      status: "OK",
      ads: randomAds,
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

router.get("/ads", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (!isAdsManagerRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    const ads = await getSensesiotAdsByUser(req.session.userData.uid);

    res.status(200).json({
      status: "OK",
      ads,
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

router.get("/ads/:id", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (!isAdsManagerRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    const adsDoc = await getSensesiotAdsById(req.params.id);
    if (!adsDoc || adsDoc.uid !== req.session.userData.uid) {
      throw new WebError("Forbidden", 403);
    }

    res.status(200).json({
      status: "OK",
      ads: adsDoc,
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

router.post("/ads/add", json(), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (!isAdsManagerRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    if (!req.body) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    let ytVidId;
    let ytVidUrl;
    let durationSec;
    try {
      const ytLinkInfo = await validateYtLink(req.body.ytVidUrl);
      ytVidId = ytLinkInfo.ID;
      ytVidUrl = ytLinkInfo.URL;
      durationSec = ytLinkInfo.duration;
    } catch (err) {
      throw new WebError("Required ytVidUrl", 400);
    }

    const ads = await createSensesiotAds({
      uid: req.session.userData.uid,
      name: req.body.name,
      description: req.body.description || "",
      ytVidId,
      ytVidUrl,
      durationSec,
      published: req.body.published || true,
    });

    res.status(200).json({
      status: "OK",
      ads,
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

router.post("/ads/edit/:id", json(), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (!isAdsManagerRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    if (!req.body) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    const oldAdsDoc = await getSensesiotAdsById(req.params.id);
    if (!oldAdsDoc || oldAdsDoc.uid !== req.session.userData.uid) {
      throw new WebError("Forbidden", 403);
    }

    let { durationSec, ytVidUrl, ytVidId } = oldAdsDoc;
    if (req.body.ytVidUrl && typeof req.body.ytVidUrl === "object") {
      try {
        const ytLinkInfo = await validateYtLink(req.body.ytVidUrl);
        ytVidId = ytLinkInfo.ID;
        ytVidUrl = ytLinkInfo.URL;
        durationSec = ytLinkInfo.duration;
      } catch (err) {
        throw new WebError("Required ytVidId", 400);
      }
    }

    const ads = await updateSensesiotAds(req.params.id, {
      name: req.body.name !== undefined ? req.body.name : oldAdsDoc.name,
      description:
        req.body.description !== undefined
          ? req.body.description
          : oldAdsDoc.description,
      ytVidId,
      ytVidUrl,
      durationSec,
      published:
        req.body.published !== undefined
          ? req.body.published
          : oldAdsDoc.published,
    });

    res.status(200).json({
      status: "OK",
      ads,
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

router.post("/ads/delete/:id", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (!isAdsManagerRole(userInfo.role)) {
      throw new WebError("Forbidden", 403);
    }

    const oldAdsDoc = await getSensesiotAdsById(req.params.id);
    if (!oldAdsDoc || oldAdsDoc.uid !== req.session.userData.uid) {
      throw new WebError("Forbidden", 403);
    }

    await removeSensesiotAds(req.params.id);

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
