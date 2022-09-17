import { Router } from "express";

import userRouter from "./user.js";
import creditsRouter from "./credits.js";
import shopRouter from "./shop.js";
import dashboardRouter from "./dashboard.js";
import deviceRouter from "./device.js";
import reportRouter from "./report.js";

const router = Router();

const baseRoute = "/sensesiot";

router.use(baseRoute, userRouter);
router.use(baseRoute, creditsRouter);
router.use(baseRoute, shopRouter);
router.use(baseRoute, dashboardRouter);
router.use(baseRoute, deviceRouter);
router.use(baseRoute, reportRouter);
router.get(baseRoute, (req, res) => {
  res.status(200).send("OK");
});

export default router;
