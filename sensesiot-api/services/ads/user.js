import { sensesiotAds } from "../../database/mongodb.js";

const initCredits = 0;

export async function getSensesiotAdUserInfo(uid) {
  const usersCol = sensesiotAds.collection("users");
  let userInfo = await usersCol.findOne({ uid });
  if (!userInfo) {
    userInfo = {
      uid,
      credits: initCredits,
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

  return userInfo;
}

export async function updateSensesiotAdUserInfo(uid, data) {
  const usersCol = sensesiotAds.collection("users");
  const { value } = await usersCol.findOneAndUpdate(
    { uid },
    {
      $set: { ...data, lastestUpdateTime: new Date() },
    },
    { returnDocument: "after" }
  );
  return value;
}

export default Object.freeze({
  getSensesiotAdUserInfo,
  updateSensesiotAdUserInfo,
});
