import "colors";
import EventEmitter from "events";
import express from "express";
import { createClient } from "redis";

import { log } from "../utils/logging.js";
import session from "./session.js";
import indexRouter from "./routers/index.js";
import sensesiotRouter from "./routers/sensesiot/index.js";

function webDefaultCallback(port = 8080) {
  log([`Start at port `, `${port}`.green], { name: "Web" });
}

export default function startWebService(
  port = 4000,
  {
    callback = webDefaultCallback,
    eventEmitter = new EventEmitter(),
    redisClient = createClient(),
  } = {
    callback: webDefaultCallback,
    eventEmitter: new EventEmitter(),
    redisClient: createClient(),
  }
) {
  const app = express();
  const sessionMiddleware = session(redisClient);

  app.use(sessionMiddleware);

  app.use((req, res, next) => {
    req.eventEmitter = eventEmitter;
    next();
  });

  app.use(indexRouter);
  app.use(sensesiotRouter);

  app.listen(port, () => {
    callback(port);
  });

  return app;
}
