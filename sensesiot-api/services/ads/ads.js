import { ObjectId } from "mongodb";
import { getVideo } from "@fabricio-191/youtube";
import { sensesiotAds } from "../../database/mongodb.js";
// eslint-disable-next-line import/no-cycle
import { reclaimVideoQuota } from "./credits.js";

export async function validateYtLink(str) {
  const { ID, URL, duration } = await getVideo(str);
  return {
    ID,
    URL,
    duration: duration.number,
  };
}

export async function getSensesiotAdsByUser(uid) {
  const adsCol = sensesiotAds.collection("ads");
  const adsDocs = await adsCol.find({ uid }).sort({ createTime: -1 }).toArray();
  const result = adsDocs.map((ele) => ({
    ...ele,
  }));

  return result;
}

export async function getSensesiotAdsById(adsId) {
  const adsCol = sensesiotAds.collection("ads");
  const adsDoc = await adsCol.findOne({ _id: ObjectId(adsId) }).toArray();
  return adsDoc;
}

export async function getRandomWatchableAds() {
  const adsCol = sensesiotAds.collection("ads");
  const [ads] = await adsCol
    .aggregate([
      {
        $match: {
          remainQuota: { $gt: 0 },
          published: true,
        },
      },
      { $sample: { size: 1 } },
    ])
    .toArray();

  if (!ads) {
    throw new Error("No Ads Found");
  }

  return ads;
}

export async function createSensesiotAds({
  uid = "",
  name = "",
  description = "",
  ytVidUrl = "",
  ytVidId = "",
  durationSec = 0,
  published = false,
}) {
  const adsCol = sensesiotAds.collection("ads");
  const today = new Date();

  const data = {
    uid,
    name,
    description,
    ytVidId,
    ytVidUrl,
    durationSec,
    visitedCount: 0,
    remainQuota: 0,
    published,
    createTime: today,
    lastestUpdateTime: today,
  };

  const { insertedId } = await adsCol.insertOne(data);
  return {
    _id: insertedId,
    ...data,
  };
}

export async function updateSensesiotAds(adsId, data) {
  const adsCol = sensesiotAds.collection("ads");
  const { value } = await adsCol.findOneAndUpdate(
    {
      _id: ObjectId(adsId),
    },
    {
      $set: { ...data, lastestUpdateTime: new Date() },
    },
    { returnDocument: "after" }
  );

  if (!value) {
    throw new Error("Forbidden");
  }

  return value;
}

export async function removeSensesiotAds(adsId) {
  await reclaimVideoQuota(adsId);

  const adsCol = sensesiotAds.collection("ads");
  return adsCol.findOneAndDelete({
    _id: ObjectId(adsId),
  });
}

export default Object.freeze({
  getSensesiotAdsByUser,
  getSensesiotAdsById,
  getRandomWatchableAds,
  createSensesiotAds,
  updateSensesiotAds,
  removeSensesiotAds,
});
