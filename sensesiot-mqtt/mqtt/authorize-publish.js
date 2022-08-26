import { insertSensesiotDeviceControlData } from "../services/sensesiot/control.js";
import { insertSensesiotDeviceData } from "../services/sensesiot/data.js";
import { log } from "../utils/logging.js";

const $SYS_PREFIX = "$SYS/";

async function handleInsertData(subtopic = "", userData = {}, payload = "") {
  const [deviceKey, slot] = subtopic.split("/");
  const { uid } = userData;

  const data = Number(
    payload instanceof Buffer ? payload.toString("utf8") : payload
  );

  try {
    await insertSensesiotDeviceData(uid, deviceKey, slot, data);
    log(`${data}`, {
      name: "Set Data",
      tags: [`${uid}`, `${deviceKey}`, `${slot}`],
    });
  } catch (error) {
    if (error.message === "Limit Data Rate") {
      return;
    }

    throw error;
  }
}

async function handleInsertControl(subtopic = "", userData = {}, payload = "") {
  const [deviceKey, slot] = subtopic.split("/");
  const { uid } = userData;

  const data = payload instanceof Buffer ? payload.toString("utf8") : payload;

  try {
    await insertSensesiotDeviceControlData(uid, deviceKey, slot, data);
    log(`${data}`, {
      name: "Set Control",
      tags: [`${uid}`, `${deviceKey}`, `${slot}`],
    });
  } catch (error) {
    if (error.message === "Limit Data Rate") {
      return;
    }

    throw error;
  }
}

async function handleInsertControlApi(subtopic = "", payload = "") {
  const [uid, deviceKey, slot] = subtopic.split("/");

  const data = payload instanceof Buffer ? payload.toString("utf8") : payload;

  try {
    await insertSensesiotDeviceControlData(uid, deviceKey, slot, data);
    log(`${data}`, {
      name: "Set Control (API)",
      tags: [`${uid}`, `${deviceKey}`, `${slot}`],
    });
  } catch (error) {
    if (error.message === "Limit Data Rate") {
      return;
    }

    throw error;
  }
}
/**
 * @param {import("aedes").Client} client
 * @param {import("aedes").PublishPacket} packet
 * @param {Error | null | undefined} callback
 * @param {import("events")} eventEmitter
 */
export default async function authorizePublish(
  client,
  packet,
  callback,
  eventEmitter
) {
  try {
    if (packet.topic.startsWith($SYS_PREFIX)) {
      throw new Error(`${$SYS_PREFIX} topic is reserved`);
    }

    if (client.userData) {
      const [topic, ...rest] = packet.topic.split("/");
      switch (topic) {
        case "data":
          await handleInsertData(
            rest.join("/"),
            client.userData,
            packet.payload
          );
          eventEmitter.emit("publishMqttApi", {
            topic: `dataApi/${client.userData.uid}/${rest.join("/")}`,
            payload: packet.payload,
          });
          break;
        case "control":
          await handleInsertControl(
            rest.join("/"),
            client.userData,
            packet.payload
          );
          eventEmitter.emit("publishMqttApi", {
            topic: `controlApi/${client.userData.uid}/${rest.join("/")}`,
            payload: packet.payload,
          });
          break;
        case "controlWeb":
          if (client.userData.role === "api") {
            await handleInsertControlApi(rest.join("/"), packet.payload);

            // TODO fix without deviceid schema
            eventEmitter.emit("publishMqttApi", {
              topic: `control/${rest.slice(1).join("/")}`,
              payload: packet.payload,
            });

            eventEmitter.emit("publishMqttApi", {
              topic: `controlApi/${rest.join("/")}`,
              payload: packet.payload,
            });
          }
          break;
        default:
          throw new Error(`Can't publish topic ${packet.topic}`);
      }

      callback(null);
      return;
    }

    throw new Error(`Can't publish topic ${packet.topic}`);
  } catch (err) {
    callback(err);
  }
}
