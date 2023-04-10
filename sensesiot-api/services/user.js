import { auth } from "../firebase/firebase-admin.js";
import { sensesiotBase } from "../database/mongodb.js";
import { log } from "../utils/logging.js";
import { DEVELOPER_ROLE, USER_ROLE, GUEST_ROLE } from "../utils/roles.js";
import devuserUids from "../firebase/devuseruid.js";

const initCoins = 0;

export async function initDevUsers() {
  const usersCol = sensesiotBase.collection("users");
  const devUsersCount = await usersCol.countDocuments({ role: DEVELOPER_ROLE });
  if (devUsersCount === 0) {
    log("Insert Dev Users", { name: "Init" });
    await usersCol.insertMany(
      devuserUids.map((uid) => ({
        uid,
        role: DEVELOPER_ROLE,
        coins: initCoins,
        firstLoginTime: null,
        lastestLoginTime: null,
      }))
    );
  }
}

export async function decodeFirebaseAuthToken(token) {
  const decodedToken = await auth().verifyIdToken(token, true);

  const userData = await auth().getUser(decodedToken.uid);
  const { uid, displayName, email, photoURL } = userData;

  return {
    uid,
    email,
    displayName,
    photoURL,
  };
}

export async function getUserInfo(uid) {
  const usersCol = sensesiotBase.collection("users");
  let userInfo = await usersCol.findOne({ uid });
  if (!userInfo) {
    userInfo = {
      uid,
      role: USER_ROLE,
      coins: initCoins,
      createTime: new Date(),
      lastestUpdateTime: new Date(),
      lastestLoginTime: null,
    };
    const { insertedId } = await usersCol.insertOne(userInfo);
    // eslint-disable-next-line no-underscore-dangle
    userInfo._id = insertedId;
  }

  if (!userInfo) {
    return {
      role: GUEST_ROLE,
    };
  }

  return userInfo;
}

export async function updateUserInfo(uid, data) {
  const usersCol = sensesiotBase.collection("users");
  const { value } = await usersCol.findOneAndUpdate(
    { uid },
    {
      $set: { ...data, lastestUpdateTime: new Date() },
    },
    { returnDocument: "after" }
  );

  return value;
}

export async function updateUserLoginTime(uid) {
  return updateUserInfo(uid, {
    lastestLoginTime: new Date(),
  });
}

export default Object.freeze({
  initDevUsers,
  decodeFirebaseAuthToken,
  getUserInfo,
  updateUserInfo,
  updateUserLoginTime,
});
