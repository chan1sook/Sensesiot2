import dotenv from "dotenv";

import { init as mongodbInit } from "./database/mongodb.js";
import mqttService from "./mqtt/mqtt.js";

dotenv.config();

mongodbInit();

mqttService(parseInt(process.env.MQTT_PORT, 10), {});
