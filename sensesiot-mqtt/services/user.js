import { sensesiotBase } from "../database/mongodb.js";

export async function getUserInfo(uid) {
  const usersCol = sensesiotBase.collection("users");
  const userInfo = await usersCol.findOne({ uid });
  return userInfo;
}

export default Object.freeze({
  getUserInfo,
});
