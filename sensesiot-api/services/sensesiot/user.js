import { sensesiotV2 } from "../../database/mongodb.js";
import { getSensesiotUsedCredits } from "./credits.js";

const initCredits = 1000;

export async function getSensesiotUserInfo(uid) {
  const usersCol = sensesiotV2.collection("users");
  let userInfo = await usersCol.findOne({ uid });
  if (!userInfo) {
    userInfo = {
      uid,
      credits: initCredits,
      preferences: {},
      activePackages: [],
      createTime: new Date(),
      lastestUpdateTime: new Date(),
    };
    const { insertedId } = await usersCol.insertOne(userInfo);
    // eslint-disable-next-line no-underscore-dangle
    userInfo._id = insertedId;
  }

  if (!userInfo) {
    throw new Error("No User Info");
  }

  userInfo.usedCredits = await getSensesiotUsedCredits(uid);
  return userInfo;
}

export async function getSensesiotUserCurrentCredit(uid) {
  const userInfo = getSensesiotUserInfo(uid);
  return userInfo.credits;
}

export async function updateSensesiotUserInfo(uid, data) {
  const usersCol = sensesiotV2.collection("users");
  const { value } = await usersCol.findOneAndUpdate(
    { uid },
    {
      $set: { ...data, lastestUpdateTime: new Date() },
    },
    { returnDocument: "after" }
  );
  return value;
}

export async function updateSensesiotPreferences(uid, preferences = {}) {
  await updateSensesiotUserInfo(uid, {
    preferences,
  });
}

export default Object.freeze({
  getSensesiotUserInfo,
  updateSensesiotUserInfo,
  updateSensesiotPreferences,
  getSensesiotUserCurrentCredit,
});
