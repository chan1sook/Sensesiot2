import { Router } from "express";

import userRouter from "./user.js";
import shopRouter from "./shop.js";

const router = Router();

router.use(userRouter);
router.use(shopRouter);
router.get("/", (req, res) => {
  res.status(200).send("OK");
});

export default router;
