/* eslint-disable no-underscore-dangle */
import EventEmitter from "events";

import interpreteConditionBlockly from "../interpreter/interprete.js";
import { log, error } from "../../utils/logging.js";
import { widgetQueue } from "../queue.js";

export default async function initProcessWidgetQueue(
  { eventEmitter = new EventEmitter(), reset = false } = {
    eventEmitter: new EventEmitter(),
    reset: false,
  }
) {
  widgetQueue.on("active", (v) => {
    log("Start Process Widget", { name: "Worker", tags: [v.id] });
  });

  widgetQueue.on("progress", (v, progress) => {
    const widget = v.data;
    log(["Process Widget", ` ${progress.toFixed(0)}%`], {
      name: "Worker",
      tags: [v.id, widget._id],
    });
  });

  widgetQueue.on("completed", (v) => {
    const widget = v.data;
    log("Complete Process Widget", {
      name: "Worker",
      tags: [v.id, widget._id],
    });
  });

  widgetQueue.process(async (job, done) => {
    try {
      const widgetData = job.data;

      switch (widgetData.type) {
        case "condition":
          await interpreteConditionBlockly({
            condition: widgetData.condition,
            widgetData,
            eventEmitter,
          });
          break;
        default:
          break;
      }

      done(null);
    } catch (err) {
      error(err, { name: "Worker" });
      done(err);
    }
  });

  if (reset) {
    await widgetQueue.empty();
  }
  return widgetQueue;
}
