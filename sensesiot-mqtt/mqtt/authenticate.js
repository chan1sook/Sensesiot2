import { getSensesiotDeviceKey } from "../services/sensesiot/device.js";
import { getUserInfo } from "../services/user.js";

/**
 * @param {import("aedes").Client} client
 * @param {string} username
 * @param {Buffer} password
 * @param {(error: import("aedes").AuthenticateError | null, success: boolean | null) => void} callback
 */
export default async function authenticate(
  client,
  username,
  password,
  callback
) {
  const aedesClient = client;

  const uid = username;

  try {
    if (
      username === process.env.MQTT_API_USERNAME &&
      password.toString() === process.env.MQTT_API_PASSWORD
    ) {
      aedesClient.userData = {
        role: "api",
      };
      callback(null, true);
      return;
    }

    const deviceInfo = await getSensesiotDeviceKey(uid);
    if (deviceInfo) {
      aedesClient.userData = {
        uid: deviceInfo.uid,
        role: "device",
      };
      callback(null, true);
      return;
    }

    const userInfo = await getUserInfo(uid);
    if (!userInfo || userInfo.role === "guest") {
      throw new Error("Not Authorized");
    }
    aedesClient.userData = {
      uid,
      role: "device",
    };

    callback(null, true);
  } catch (error) {
    callback(error, null);
  }
}
