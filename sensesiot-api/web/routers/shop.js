import { Router, json } from "express";

import { error } from "../../utils/logging.js";
import WebError from "../../utils/weberror.js";
import {
  createTransaction,
  getCoinProducts,
  getTransactionRange,
  mintCoin,
} from "../../services/shop.js";
import { getUserInfo } from "../../services/user.js";

const router = Router();

router.get("/shop/coins", async (req, res) => {
  try {
    const coinProducts = await getCoinProducts();

    res.status(200).json({
      status: "OK",
      products: coinProducts,
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

router.post("/shop/buy", json(), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    if (!req.body || !req.body.productId) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (userInfo.role === "developer") {
      const transaction = await createTransaction(
        userInfo.uid,
        req.body.productId,
        "completed"
      );

      if (transaction.product.catergory.includes("coin")) {
        await mintCoin(userInfo.uid, transaction.product.coins);
      }

      res.status(200).json({
        status: "OK",
        transaction,
      });

      return;
    }

    throw new WebError("Not Implemented", 501);
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

router.get("/transactions", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    if (!req.query.startTs || !req.query.endTs) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    const startTs = parseInt(req.query.startTs, 10);
    const endTs = parseInt(req.query.endTs, 10);

    const transactions = await getTransactionRange(
      req.session.userData.uid,
      startTs,
      endTs
    );

    res.status(200).json({
      status: "OK",
      transactions,
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
