import redis from "redis";
import { error, log } from "../utils/logging.js";

function redisDefaultCallback() {
  log(`Connected`, { name: "Redis" });
}
export default function startRedisService(
  { callback = redisDefaultCallback } = { callback: redisDefaultCallback }
) {
  const redisClient = redis.createClient({ legacyMode: true });
  redisClient.on("connect", callback);

  redisClient.on("error", (err) => {
    error(err.message, { name: "Redis" });
  });

  redisClient.connect();

  return redisClient;
}
