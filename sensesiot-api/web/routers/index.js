import { Router } from "express";

import userRouter from "./user.js";
import shopRouter from "./shop.js";
import redeemRouter from "./redeem.js";

const router = Router();

router.use(userRouter);
router.use(shopRouter);
router.use(redeemRouter);
router.get("/", (req, res) => {
  res.status(200).send("OK");
});

export default router;
