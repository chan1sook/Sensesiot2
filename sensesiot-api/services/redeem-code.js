import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { ObjectId } from "mongodb";
import objectHash from "object-hash";
import { sensesiotBase } from "../database/mongodb.js";
import { exchangeSensesiotCredit } from "./sensesiot/shop.js";
import { mintCoin } from "./shop.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function getAllRedeemCodes() {
  const redeemCol = sensesiotBase.collection("redeem-codes");
  const redeemCodes = await redeemCol.find({}).toArray();

  const result = redeemCodes.map((ele) => {
    const newData = { ...ele };
    newData.codesInfo = {
      total: newData.codes.length,
      assigned: newData.codes.reduce((prev, current) => {
        if (current.assigned) {
          return prev + 1;
        }
        return prev;
      }, 0),
      used: newData.codes.reduce((prev, current) => {
        if (current.used) {
          return prev + 1;
        }
        return prev;
      }, 0),
    };
    delete newData.codes;
    return newData;
  });

  result.sort((a, b) => {
    if (a.setExpired !== b.setExpired) {
      return !a.setExpired ? -1 : 1;
    }

    return dayjs(a.expiredDate).valueOf() - dayjs(b.expiredDate).valueOf();
  });

  return result;
}

export async function getRedeemCodeById(redeemId) {
  const redeemCol = sensesiotBase.collection("redeem-codes");
  const redeemCodes = await redeemCol.findOne({
    _id: ObjectId(redeemId),
  });

  if (!redeemCodes) {
    throw new Error("No Redeem Code Found");
  }

  redeemCodes.codes.sort((a, b) => {
    if (a.used !== b.used) {
      return !a.used ? -1 : 1;
    }

    return a.code.localeCompare(b.code);
  });

  return redeemCodes;
}

export async function generateRedeemCode({
  name,
  description,
  quantity = 100,
  setExpired = false,
  expiredDate = new Date(),
  redeemValue = {
    base: 0,
    sensesiot: 0,
  },
}) {
  const redeemCol = sensesiotBase.collection("redeem-codes");
  const today = new Date();

  if (quantity <= 0) {
    throw new Error("quantity > 0");
  }

  const redeemValueKeys = Object.keys(redeemValue);
  let redeemValueTotal = 0;

  for (let i = 0; i < redeemValueKeys.length; i += 1) {
    const redeemKey = redeemValueKeys[i];
    if (
      !Number.isFinite(redeemValue[redeemKey]) ||
      redeemValue[redeemKey] < 0
    ) {
      throw new Error(`redeemValue["${redeemKey}"] >= 0`);
    }
    redeemValueTotal += redeemValue[redeemKey];
  }
  if (redeemValueTotal <= 0) {
    throw new Error("Total of redeemValue unit not 0");
  }
  const codes = new Array(quantity).fill(undefined).map((ele, i) => ({
    code: objectHash({
      name,
      i,
      today,
    }),
    assigned: false,
    used: false,
  }));

  const inseredData = {
    name,
    description,
    codes,
    setExpired,
    expiredDate: expiredDate
      ? dayjs(expiredDate)
          .tz("Asia/Bangkok")
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .toDate()
      : null,
    redeemValue,
    createTime: today,
    lastUpdateTime: today,
  };

  const { insertedId } = await redeemCol.insertOne(inseredData);

  return {
    _id: insertedId,
    ...inseredData,
  };
}

function normalizeData(data) {
  return {
    ...data,
    expiredDate: data.expiredDate
      ? dayjs(data.expiredDate)
          .tz("Asia/Bangkok")
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .toDate()
      : null,
  };
}

export async function updateRedeemCodeInfo(redeemId, data) {
  const redeemCol = sensesiotBase.collection("redeem-codes");
  const { value } = await redeemCol.findOneAndUpdate(
    { _id: ObjectId(redeemId) },
    {
      $set: { ...normalizeData(data), lastestUpdateTime: new Date() },
    },
    { returnDocument: "after" }
  );

  return value;
}

export async function redeemCode(uid, code) {
  const redeemCol = sensesiotBase.collection("redeem-codes");
  const today = new Date();

  const redeemCodes = await redeemCol.findOne({
    $and: [
      {
        "codes.code": code,
        "codes.used": false,
      },
      {
        $or: [{ setExpired: false }, { expiredDate: { $gte: today } }],
      },
    ],
  });

  if (!redeemCodes) {
    throw new Error("Invalid Code");
  }

  const { _id, redeemValue, codes } = redeemCodes;
  const target = codes.find((ele) => ele.code === code);
  target.used = true;

  const actions = [
    updateRedeemCodeInfo(_id, {
      codes,
    }),
  ];

  if (redeemValue && typeof redeemValue === "object") {
    if (Number.isFinite(redeemValue.base) && redeemValue.base > 0) {
      actions.push(mintCoin(uid, redeemValue.base));
    }

    if (Number.isFinite(redeemValue.sensesiot) && redeemValue.sensesiot > 0) {
      actions.push(exchangeSensesiotCredit(uid, redeemValue.sensesiot, 0));
    }
  }

  await Promise.all(actions);

  return redeemValue;
}

export function removeRedeemCode(redeemId) {
  const redeemCol = sensesiotBase.collection("redeem-codes");
  return redeemCol.findOneAndDelete({
    _id: ObjectId(redeemId),
  });
}

export default Object.freeze({
  generateRedeemCode,
  redeemCode,
  getAllRedeemCodes,
  getRedeemCodeById,
  removeRedeemCode,
});
