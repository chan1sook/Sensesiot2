import "./configs/dotenv.js";
import { init as mongodbInit } from "./database/mongodb.js";
import mqttService from "./mqtt/mqtt.js";

mongodbInit();

mqttService(parseInt(process.env.MQTT_PORT, 10), {});
