import dayjs from "dayjs";
import { Decimal128 } from "mongodb";
import { createASAP } from "downsample";

export function convertDecimal128ToString(doc) {
  const keys = Object.keys(doc);
  const result = {};
  for (let i = 0; i < keys.length; i += 1) {
    const data = doc[keys[i]];

    if (data instanceof Decimal128) {
      result[keys[i]] = data.toString();
    } else {
      result[keys[i]] = doc[keys[i]];
    }
  }

  return result;
}

export const ASAPFn = createASAP({
  x: (data) => dayjs(data.ts).valueOf(),
  y: (data) => data.metadata.data,
  toPoint: (x, y) => ({
    ts: dayjs(x).toDate(),
    metadata: {
      data: y,
    },
  }),
});

export default Object.freeze({
  convertDecimal128ToString,
  ASAPFn,
});
