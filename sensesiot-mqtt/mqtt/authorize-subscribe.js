import { getSensesiotDevice } from "../services/sensesiot/device.js";
import { log } from "../utils/logging.js";

async function handleSubscribeData(subtopic = "", userData = {}) {
  const [deviceKey, slot] = subtopic.split("/");
  const { uid } = userData;

  if (deviceKey === "#") {
    log("Subscribed", {
      name: "Subscribe Data",
      tags: [`${uid}`, "Any", "Any"],
    });
    return;
  }

  const device = await getSensesiotDevice(uid, deviceKey);
  if (!device) {
    throw new Error("Device not found");
  }

  if (slot === "+") {
    log("Subscribed", {
      name: "Subscribe Data",
      tags: [`${uid}`, `${deviceKey}`, "Any"],
    });
  } else {
    log("Subscribed", {
      name: "Subscribe Data",
      tags: [`${uid}`, `${deviceKey}`, `${slot}`],
    });
  }
}

async function handleSubscribeControl(subtopic = "", userData = {}) {
  const [deviceKey, slot] = subtopic.split("/");
  const { uid } = userData;

  if (deviceKey === "#") {
    log("Subscribed", {
      name: "Subscribe Control",
      tags: [`${uid}`, "Any", "Any"],
    });
    return;
  }

  const device = await getSensesiotDevice(uid, deviceKey);
  if (!device) {
    throw new Error("Device not found");
  }

  if (slot === "+") {
    log("Subscribed", {
      name: "Subscribe Control",
      tags: [`${uid}`, `${deviceKey}`, "Any"],
    });
  } else {
    log("Subscribed", {
      name: "Subscribe Control",
      tags: [`${uid}`, `${deviceKey}`, `${slot}`],
    });
  }
}

async function handleSubscribeAPI(topic, userData = {}) {
  if (userData.role !== "api") {
    throw new Error(`Can't subscribe topic ${topic}`);
  }

  const [topic1] = topic.split("/");

  log("Subscribed", {
    name: "Subscribe API",
    tags: [`${topic1}`],
  });
}

/**
 *
 * @param {import("aedes").Client} client
 * @param {import("aedes").Subscription} subscription
 * @param {Error | null} callback
 */
export default async function authorizeSubscribe(
  client,
  subscription,
  callback
) {
  try {
    if (client.userData) {
      const [topic, ...rest] = subscription.topic.split("/");

      switch (topic) {
        case "#":
          break;
        case "data":
          await handleSubscribeData(rest.join("/"), client.userData);
          break;
        case "control":
          await handleSubscribeControl(rest.join("/"), client.userData);
          break;
        case "dataApi":
        case "controlApi":
          await handleSubscribeAPI(subscription.topic, client.userData);
          break;
        default:
          throw new Error(`Can't subscribe topic ${subscription.topic}`);
      }

      callback(null, subscription);
      return;
    }

    throw new Error(`Can't subscribe topic ${subscription.topic}`);
  } catch (error) {
    callback(error, null);
  }
}
