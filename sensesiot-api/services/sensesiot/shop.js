import { Decimal128, ObjectId } from "mongodb";
import { sensesiotV2 } from "../../database/mongodb.js";
import { convertDecimal128ToString } from "../../utils/data-transform.js";
import { log } from "../../utils/logging.js";
import { getUserInfo, updateUserInfo } from "../user.js";
import { getSensesiotUserInfo, updateSensesiotUserInfo } from "./user.js";

export async function initSensesiotCreditProducts() {
  const shopsCol = sensesiotV2.collection("shops");

  const coinProductsCount = await shopsCol.countDocuments({
    catergory: "credit",
  });
  if (coinProductsCount === 0) {
    log("Insert Credit Products", { name: "Init" });
    await shopsCol.insertMany([
      {
        name: "1000 Credits",
        catergory: ["credit"],
        originalPrice: Decimal128("100.00"),
        price: Decimal128("100.00"),
        unit: "Coin",
        credits: 1000,
      },
      {
        name: "2500 Credits",
        catergory: ["credit"],
        originalPrice: Decimal128("250.00"),
        price: Decimal128("240.00"),
        unit: "Coin",
        credits: 2500,
      },
      {
        name: "5000 Credits",
        catergory: ["credit"],
        originalPrice: Decimal128("500.00"),
        price: Decimal128("450.00"),
        unit: "Coin",
        credits: 5000,
      },
      {
        name: "10000 Credits",
        catergory: ["credit"],
        originalPrice: Decimal128("1000.00"),
        price: Decimal128("850.00"),
        unit: "Coin",
        credits: 10000,
      },
    ]);
  }
}

export async function getSensesiotCreditProducts() {
  const shopsCol = sensesiotV2.collection("shops");
  const coinProducts = await shopsCol
    .find({
      catergory: "credit",
    })
    .toArray();

  return coinProducts.map((ele) => convertDecimal128ToString(ele));
}

export async function createSensesiotTransaction(
  uid,
  productId,
  status = "pending"
) {
  const shopsCol = sensesiotV2.collection("shops");
  const productDoc = await shopsCol.findOne({
    _id: ObjectId(productId),
  });

  if (!productDoc) {
    throw new Error("Product not found");
  }

  const transactionCol = sensesiotV2.collection("transactions");
  const transactionInfo = {
    uid,
    status,
    product: productDoc,
    createTime: new Date(),
    lastUpdateTime: new Date(),
  };
  const { insertedId } = await transactionCol.insertOne(transactionInfo);
  return {
    _id: insertedId,
    ...transactionInfo,
  };
}

export async function getSensesiotTransactionRange(uid, startTs, endTs) {
  const transactionCol = sensesiotV2.collection("transactions");
  const startDate = new Date(Math.min(startTs, endTs));
  const endDate = new Date(Math.max(startTs, endTs));

  const transactions = await transactionCol
    .find(
      {
        uid,
        createTime: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        sort: {
          lastUpdateTime: -1,
        },
      }
    )
    .toArray();

  return transactions.map((ele) => ({
    ...ele,
    product: convertDecimal128ToString(ele.product),
  }));
}

export async function exchangeSensesiotCredit(
  uid,
  coinAmount = 0,
  creditAmount = 0
) {
  const userInfo = await getUserInfo(uid);
  const sensesiotUserInfo = await getSensesiotUserInfo(uid);

  const remainCoins = userInfo.coins - coinAmount;
  const remainCredits = sensesiotUserInfo.credits + creditAmount;

  if (!Number.isFinite(remainCoins)) {
    throw new Error("CoinAmount is not a Number");
  }

  if (!Number.isFinite(remainCredits)) {
    throw new Error("CreditAmount is not a Number");
  }

  if (remainCoins < 0) {
    throw new Error("Insufficient Coins");
  }

  return Promise.all([
    updateUserInfo(uid, { coins: remainCoins }),
    updateSensesiotUserInfo(uid, {
      credits: remainCredits,
    }),
  ]);
}

export default Object.freeze({
  initSensesiotCreditProducts,
  getSensesiotCreditProducts,
  createSensesiotTransaction,
  getSensesiotTransactionRange,
  exchangeSensesiotCredit,
});
