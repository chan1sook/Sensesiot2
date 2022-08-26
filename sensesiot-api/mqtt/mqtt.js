import "colors";

import EventEmitter from "events";
import mqtt from "mqtt";

import { error, log } from "../utils/logging.js";

function mqttDefaultCallback(port = 4000) {
  log(["Connected at port ", `${port}`.green], { name: "MQTT" });
}

export default function startMqttService(
  port = 4001,
  { callback = mqttDefaultCallback, eventEmitter = new EventEmitter() } = {
    callback: mqttDefaultCallback,
    eventEmitter: new EventEmitter(),
  }
) {
  const mqttClient = mqtt.connect(`mqtt://localhost:${port}`, {
    username: process.env.MQTT_API_USERNAME,
    password: process.env.MQTT_API_PASSWORD,
  });

  mqttClient.on("connect", () => {
    callback(port);
  });
  mqttClient.on("error", (err) => {
    error(err.message, { name: "MQTT" });
  });

  mqttClient.subscribe(["dataApi/#", "controlApi/#"]);

  mqttClient.on("message", (topic, payload) => {
    eventEmitter.emit("receiveMQTT", { topic, payload });
  });

  eventEmitter.on("controlDevice", ({ uid, deviceKey, slot, data }) => {
    mqttClient.publish(`controlWeb/${uid}/${deviceKey}/${slot}`, data);
  });

  return mqttClient;
}
