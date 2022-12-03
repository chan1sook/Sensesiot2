import { Router } from "express";

import userRouter from "./user.js";
import shopRouter from "./shop.js";
import redeemRouter from "./redeem.js";
import newsRouter from "./news.js";
import statsRouter from "./stats.js";

const router = Router();

router.use(userRouter);
router.use(shopRouter);
router.use(redeemRouter);
router.use(newsRouter);
router.use(statsRouter);
router.get("/", (req, res) => {
  res.status(200).send("OK");
});

export default router;
