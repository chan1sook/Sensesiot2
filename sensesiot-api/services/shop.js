import { Decimal128, ObjectId } from "mongodb";
import { sensesiotBase } from "../database/mongodb.js";
import { convertDecimal128ToString } from "../utils/data-transform.js";
import { log } from "../utils/logging.js";
import { getUserInfo, updateUserInfo } from "./user.js";

export async function initCoinProducts() {
  const shopsCol = sensesiotBase.collection("shops");

  // if (process.env.NODE_ENV === "development") {
  //   await shopsCol.deleteMany({
  //     catergory: "coin",
  //   });
  // }

  const coinProductsCount = await shopsCol.countDocuments({
    catergory: "coin",
  });
  if (coinProductsCount === 0) {
    log("Insert Coin Products", { name: "Init" });
    await shopsCol.insertMany([
      {
        name: "100 Coins",
        catergory: ["coin"],
        originalPrice: Decimal128("100.00"),
        price: Decimal128("100.00"),
        unit: "฿",
        coins: 100,
      },
      {
        name: "250 Coins",
        catergory: ["coin"],
        originalPrice: Decimal128("250.00"),
        price: Decimal128("240.00"),
        unit: "฿",
        coins: 250,
      },
      {
        name: "500 Coins",
        catergory: ["coin"],
        originalPrice: Decimal128("500.00"),
        price: Decimal128("450.00"),
        unit: "฿",
        coins: 500,
      },
      {
        name: "1000 Coins",
        catergory: ["coin"],
        originalPrice: Decimal128("1000.00"),
        price: Decimal128("850.00"),
        unit: "฿",
        coins: 1000,
      },
    ]);
  }
}

export async function getCoinProducts() {
  const shopsCol = sensesiotBase.collection("shops");
  const coinProducts = await shopsCol
    .find({
      catergory: "coin",
    })
    .toArray();

  return coinProducts.map((ele) => convertDecimal128ToString(ele));
}

export async function createTransaction(uid, productId, status = "pending") {
  const shopsCol = sensesiotBase.collection("shops");
  const productDoc = await shopsCol.findOne({
    _id: ObjectId(productId),
  });

  if (!productDoc) {
    throw new Error("Product not found");
  }

  const transactionCol = sensesiotBase.collection("transactions");
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

export async function getTransactionRange(uid, startTs, endTs) {
  const transactionCol = sensesiotBase.collection("transactions");
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

export async function mintCoin(uid, amount = 0) {
  const userInfo = await getUserInfo(uid);
  const remainCoins = userInfo.coins + amount;

  if (!Number.isFinite(remainCoins)) {
    throw new Error("Amount is not a Number");
  }

  return updateUserInfo(uid, { coins: remainCoins });
}

export default Object.freeze({
  initCoinProducts,
  getCoinProducts,
  createTransaction,
  getTransactionRange,
  mintCoin,
});
