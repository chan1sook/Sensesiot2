import EventEmitter from "events";

import "./configs/dotenv.js";
import { init as mongodbInit } from "./database/mongodb.js";
import { init as firebaseInit } from "./firebase/firebase-admin.js";
import { init as serviceInit } from "./services/init.js";
import startRedisService from "./redis/redis.js";
import startWorkerService from "./worker/worker.js";
import webService from "./web/web.js";
import mqttService from "./mqtt/mqtt.js";

const eventEmitter = new EventEmitter();
mongodbInit();
firebaseInit();
serviceInit();

const redisClient = startRedisService();

webService(parseInt(process.env.WEB_PORT, 10), {
  eventEmitter,
  redisClient,
});

mqttService(parseInt(process.env.MQTT_PORT, 10), {
  eventEmitter,
});

startWorkerService({
  eventEmitter,
});
