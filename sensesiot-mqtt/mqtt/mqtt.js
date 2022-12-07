import "colors";

import EventEmitter from "events";
import net from "net";
import aedes from "aedes";
import aedesPersistenceMongoDB from "aedes-persistence-mongodb";
import mqemitterRedis from "mqemitter-redis";

import { error, log } from "../utils/logging.js";
import { aedesdb } from "../database/mongodb.js";
import bindAedesEvents from "./events.js";
import authenticate from "./authenticate.js";
import authorizePublish from "./authorize-publish.js";
import authorizeSubscribe from "./authorize-subscribe.js";

function mqttDefaultCallback(port = 4000) {
  log(["Start at port ", `${port}`.green], { name: "MQTT Broker" });
}

export default function startMqttService(
  port = 4001,
  { callback = mqttDefaultCallback, eventEmitter = new EventEmitter() } = {
    callback: mqttDefaultCallback,
    eventEmitter: new EventEmitter(),
  }
) {
  const clients = [];

  const aedesServer = aedes.Server({
    persistence: aedesPersistenceMongoDB({
      db: aedesdb,
      ttl: {
        packets: 300,
        subscriptions: 300,
      },
    }),
    mq: mqemitterRedis(),
    authenticate,
    authorizePublish: (...args) => {
      authorizePublish(...args, eventEmitter);
    },
    authorizeSubscribe,
  });

  bindAedesEvents(aedesServer, {
    clients,
  });

  eventEmitter.on("publishMqttApi", ({ topic, payload }) => {
    aedesServer.publish({
      cmd: "publish",
      topic,
      payload,
    });
  });
  eventEmitter.on("error", (err) => {
    error(err.message, { name: "eventEmitter" });
  });

  const server = net.createServer(aedesServer.handle);
  server.listen(port, () => {
    callback(port);
  });
  server.on("error", (err) => {
    error(err.message, { name: "MQTTServer" });
  });

  return server;
}
