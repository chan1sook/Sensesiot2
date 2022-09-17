import EventEmitter from "events";
import express from "express";
import { createServer } from "http";
import { createClient } from "redis";
import { Server as SIOServer } from "socket.io";

import { error, log } from "../utils/logging.js";
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
  const httpServer = createServer(app);
  const sessionMiddleware = session(redisClient);

  app.use(sessionMiddleware);

  app.use((req, res, next) => {
    req.eventEmitter = eventEmitter;
    next();
  });

  app.use(indexRouter);
  app.use(sensesiotRouter);

  const socketIOServer = new SIOServer(httpServer);
  socketIOServer.use((socket, next) =>
    sessionMiddleware(socket.request, {}, next)
  );
  socketIOServer.on("connection", (socket) => {
    const { session: iosession } = socket.request;
    if (iosession && iosession.userData) {
      const { uid } = iosession.userData;
      const room = `channel-${uid}`;
      socket.join(room);
      socket.on("controlDevice", ({ deviceKey, slot, data }) => {
        eventEmitter.emit("controlDevice", {
          uid,
          deviceKey,
          slot,
          data,
        });
      });
    } else {
      socket.on("requestChannel", (uid) => {
        const room = `channel-${uid}`;
        socket.join(room);
      });
    }
  });

  socketIOServer.on("error", (err) => {
    error(err.message, { name: "SocketIO" });
  });

  eventEmitter.on("receiveMQTT", ({ topic, payload }) => {
    const [type, uid, deviceKey, slot] = topic.split("/");

    const data =
      payload instanceof Buffer ? payload.toString("utf-8") : payload;

    socketIOServer.to(`channel-${uid}`).emit("mqtt", {
      type,
      uid,
      deviceKey,
      slot,
      data,
    });
  });

  eventEmitter.on("updateWidget", ({ uid, widgetId, data }) => {
    socketIOServer.to(`channel-${uid}`).emit("updateWidget", {
      widgetId,
      data,
    });
  });

  httpServer.listen(port, () => {
    callback(port);
  });

  return { io: socketIOServer, app };
}
