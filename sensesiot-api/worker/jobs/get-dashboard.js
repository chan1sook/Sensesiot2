/* eslint-disable no-underscore-dangle */
import { error, log } from "../../utils/logging.js";
import { dashboardQueue, widgetQueue } from "../queue.js";

export default async function initProcessDashboardQueue(
  { reset = false } = {
    reset: false,
  }
) {
  dashboardQueue.on("active", (v) => {
    log("Start Process Dashboard", { name: "Worker", tags: [v.id] });
  });

  dashboardQueue.on("progress", (v, progress) => {
    const dashboard = v.data;
    log(["Process Dashboard", ` ${progress.toFixed(0)}%`], {
      name: "Worker",
      tags: [v.id, dashboard._id],
    });
  });

  dashboardQueue.on("completed", (v) => {
    const dashboard = v.data;
    log("Complete Process Dashboard", {
      name: "Worker",
      tags: [v.id, dashboard._id],
    });
  });

  dashboardQueue.process(async (job, done) => {
    try {
      const dashboardData = job.data;

      if (!Array.isArray(dashboardData.widgets)) {
        done(null);
        return;
      }

      for (let i = 0; i < dashboardData.widgets.length; i += 1) {
        const widget = dashboardData.widgets[i];
        if (widget.type === "condition") {
          widgetQueue.add(
            { ...widget, userUid: dashboardData.uid },
            {
              removeOnComplete: true,
              removeOnFail: true,
            }
          );
        }

        job.progress(((i + 1) * 100) / (dashboardData.widgets.length + 1));
      }

      done(null);
    } catch (err) {
      error(err, { name: "Worker" });
      done(err);
    }
  });

  if (reset) {
    await dashboardQueue.empty();
  }

  return dashboardQueue;
}
