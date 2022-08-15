import { Router } from "express";

import userRouter from "./user.js";
import creditsRouter from "./credits.js";
import shopRouter from "./shop.js";
import dashboardRouter from "./dashboard.js";

const router = Router();

const baseRoute = "/sensesiot";

router.use(baseRoute, userRouter);
router.use(baseRoute, creditsRouter);
router.use(baseRoute, shopRouter);
router.use(baseRoute, dashboardRouter);
router.get(baseRoute, (req, res) => {
  res.status(200).send("OK");
});

export default router;
