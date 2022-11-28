import { Router, json } from "express";

import { error } from "../../../utils/logging.js";
import WebError from "../../../utils/weberror.js";
import {
  createSensesiotTransaction,
  getSensesiotCreditProducts,
  getSensesiotTransactionRange,
  exchangeSensesiotCredit,
} from "../../../services/sensesiot/shop.js";
import { getUserInfo } from "../../../services/user.js";

const router = Router();

router.get("/shop/credits", async (req, res) => {
  try {
    const creditProducts = await getSensesiotCreditProducts();

    res.status(200).json({
      status: "OK",
      products: creditProducts,
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
    const transaction = await createSensesiotTransaction(
      userInfo.uid,
      req.body.productId,
      "completed"
    );

    if (transaction.product.catergory.includes("credit")) {
      await exchangeSensesiotCredit(
        userInfo.uid,
        parseInt(transaction.product.price.toString(), 10),
        transaction.produexchangeSensesiotCreditct.credits
      );
    }

    res.status(200).json({
      status: "OK",
      transaction,
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

    const transactions = await getSensesiotTransactionRange(
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
