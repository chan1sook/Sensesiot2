import session from "express-session";
import connectRedis from "connect-redis";

/**
 * @param {import("redis").RedisClientType} redisClient
 */
export default function sessionMiddleware(redisClient) {
  const RedisStore = connectRedis(session);

  return session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.COOKIE_SECRET,
    cookie: { maxAge: 86400000, sameSite: "lax" },
    resave: false,
    saveUninitialized: true,
    rolling: true,
  });
}
