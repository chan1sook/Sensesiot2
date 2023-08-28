import { Router } from "express";

import userRouter from "./user.js";
import adsRouter from "./ads.js";

const router = Router();

const baseRoute = "/ads";

router.use(baseRoute, userRouter);
router.use(baseRoute, adsRouter);

router.get(baseRoute, (req, res) => {
  res.status(200).send("OK");
});

export default router;
