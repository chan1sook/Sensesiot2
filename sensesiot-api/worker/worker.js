import "colors";

import EventEmitter from "events";
import { createClient } from "redis";
import { log } from "../utils/logging.js";
import initMainRoutineQueue from "./jobs/main-routine.js";

function workerDefaultCallback() {
  log([`Start Worker`], { name: "Worker" });
}

export default async function startWorkerService(
  {
    callback = workerDefaultCallback,
    eventEmitter = new EventEmitter(),
    redisClient = createClient(),
  } = {
    callback: workerDefaultCallback,
    eventEmitter: new EventEmitter(),
    redisClient: createClient(),
  }
) {
  const queue = await initMainRoutineQueue();
  queue.add({}, { jobId: "1", repeat: { cron: "* * * * *" } });
  callback();
}
