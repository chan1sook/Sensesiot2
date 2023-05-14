import { ObjectId } from "mongodb";
import { sensesiotAds } from "../../database/mongodb.js";
import { log } from "../../utils/logging.js";
// eslint-disable-next-line import/no-cycle
import { updateSensesiotAds } from "./ads.js";
import { getSensesiotAdUserInfo, updateSensesiotAdUserInfo } from "./user.js";

const baseVideoCreditCostPerMin = 100;

export const costIdentifyNames = Object.freeze({
  videoCreditCostPerMin: "videoCreditCostPerMin",
});

const allCostArray = Object.values(costIdentifyNames);

export async function getCostInfos(names = allCostArray) {
  const costCol = sensesiotAds.collection("costs");
  const costDocs = await costCol.find({ name: { $in: names } }).toArray();

  return costDocs;
}

async function getCostInfo(name) {
  const costDocs = await getCostInfos([name]);

  return costDocs.length > 0 ? costDocs[0] : null;
}

export async function initSensesiotAdsCosts() {
  const costCol = sensesiotAds.collection("costs");

  const videoCreditCostPerMinDoc = await getCostInfo(
    costIdentifyNames.videoCreditCostPerMin
  );

  if (!videoCreditCostPerMinDoc) {
    log("Insert videoCreditCostPerMin", { name: "Init" });
    await costCol.insertOne({
      name: costIdentifyNames.videoCreditCostPerMin,
      cost: baseVideoCreditCostPerMin,
    });
  }
}

export async function addVideoQuota(adsId, quota = 0) {
  const adsCol = sensesiotAds.collection("ads");
  const [ads, baseCost] = await Promise.all([
    adsCol.findOne({
      _id: ObjectId(adsId),
    }),
    getCostInfo(costIdentifyNames.videoCreditCostPerMin),
  ]);

  if (!ads) {
    throw new Error("Ads not Found");
  }

  const userData = await getSensesiotAdUserInfo(ads.uid);
  const actualBaseCostMin =
    Number.isFinite(baseCost) && baseCost > 0 ? baseCost : 0;
  const actualDurationSec =
    Number.isFinite(ads.durationSec) && ads.durationSec > 0
      ? ads.durationSec
      : 0;

  let requiredCredit = actualBaseCostMin * (actualDurationSec / 60) * quota;
  requiredCredit = Math.floor(requiredCredit);

  if (requiredCredit > userData.credits) {
    throw new Error("Insufficient Credits");
  }

  const [result] = await Promise.all([
    updateSensesiotAds(adsId, { remainQuota: ads.remainQuota + quota }),
    updateSensesiotAdUserInfo(ads.uid, {
      credits: userData.credits - requiredCredit,
    }),
  ]);

  return result;
}

export async function reclaimVideoQuota(adsId) {
  const adsCol = sensesiotAds.collection("ads");
  const [ads, baseCost] = await Promise.all([
    adsCol.findOne({
      _id: ObjectId(adsId),
    }),
    getCostInfo(costIdentifyNames.videoCreditCostPerMin),
  ]);

  if (!ads) {
    throw new Error("Ads not Found");
  }

  const userData = await getSensesiotAdUserInfo(ads.uid);
  const reclaimCredit = ads.remainQuota * baseCost * (ads.durationSec / 60);

  const [result] = await Promise.all([
    updateSensesiotAdUserInfo(ads.uid, {
      credits: userData.credits + reclaimCredit,
    }),
    updateSensesiotAds(adsId, { remainQuota: 0 }),
  ]);

  return result;
}

export default Object.freeze({
  getCostInfos,
  initSensesiotAdsCosts,
  addVideoQuota,
  reclaimVideoQuota,
});
