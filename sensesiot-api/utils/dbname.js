export function dbNameOf(name) {
  const nodeEnv = process.env.NODE_ENV;
  return nodeEnv === "production"
    ? name
    : `${name}-${nodeEnv || "development"}`;
}

export default Object.freeze({
  dbNameOf,
});
