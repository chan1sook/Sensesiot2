import EventEmitter from "events";

import { createClient } from "redis";

import { getAllSensesiotDashboards } from "../../services/sensesiot/dashboard.js";
import { error, log } from "../../utils/logging.js";
import { mainRoutineQueue, dashboardQueue } from "../queue.js";
import initProcessDashboardQueue from "./get-dashboard.js";
import initProcessWidgetQueue from "./process-widget.js";

export default async function initMainRoutineQueue(
  {
    eventEmitter = new EventEmitter(),
    redisClient = createClient(),
    reset = false,
  } = {
    eventEmitter: new EventEmitter(),
    redisClient: createClient(),
    reset: false,
  }
) {
  mainRoutineQueue.on("active", (v) => {
    log("Start Main Routine", { name: "Worker", tags: [v.id] });
  });

  mainRoutineQueue.on("progress", (v, progress) => {
    log(["Process Main Routine ", `${progress.toFixed(0)}%`], {
      name: "Worker",
      tags: [v.id],
    });
  });

  mainRoutineQueue.on("completed", (v) => {
    log("Complete Main Routine", { name: "Worker", tags: [v.id] });
  });

  mainRoutineQueue.process(async (job, done) => {
    try {
      const dashboards = await getAllSensesiotDashboards();
      for (let i = 0; i < dashboards.length; i += 1) {
        const dashboard = dashboards[i];

        dashboardQueue.add(dashboard, {
          removeOnComplete: true,
          removeOnFail: true,
        });

        job.progress(((i + 1) / dashboards.length) * 100);
      }

      done(null);
    } catch (err) {
      error(err, { name: "Worker" });
      done(err);
    }
  });

  if (reset) {
    await mainRoutineQueue.empty();
  }

  await Promise.all([
    initProcessDashboardQueue({
      eventEmitter,
      redisClient,
      reset,
    }),
    initProcessWidgetQueue({
      eventEmitter,
      redisClient,
      reset,
    }),
  ]);

  return mainRoutineQueue;
}
