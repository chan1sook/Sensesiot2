import { sensesiotV2 } from "../../database/mongodb.js";
import { getSensesiotDevice } from "./device.js";

const limitRateMs = 200;

export async function getSensesiotDeviceLastestControlData(
  uid,
  deviceKey,
  slot
) {
  const targetDevice = await getSensesiotDevice(uid, deviceKey);
  if (!targetDevice) {
    throw new Error("Device not found");
  }

  const dataCol = sensesiotV2.collection("control");
  const data = await dataCol.findOne(
    {
      uid,
      deviceKey,
      slot,
    },
    { sort: { ts: -1 } }
  );

  return {
    uid,
    deviceKey,
    slot,
    data: data ? data.metadata.data : null,
    ts: data ? data.ts : null,
  };
}

async function getSensesiotDeviceLastestAnyControlData(uid, deviceKey) {
  const targetDevice = await getSensesiotDevice(uid, deviceKey);
  if (!targetDevice) {
    throw new Error("Device not found");
  }

  const dataCol = sensesiotV2.collection("control");
  const data = await dataCol.findOne(
    {
      uid,
      deviceKey,
    },
    { sort: { ts: -1 } }
  );

  return {
    uid,
    deviceKey,
    slot: data ? data.slot : null,
    data: data ? data.metadata.data : null,
    ts: data ? data.ts : null,
  };
}

export async function insertSensesiotDeviceControlData(
  uid,
  deviceKey,
  slot,
  data
) {
  const targetDevice = await getSensesiotDevice(uid, deviceKey);
  if (!targetDevice) {
    throw new Error("Device not found");
  }

  const dataCol = sensesiotV2.collection("control", {
    timeseries: {
      timeField: "ts",
      metaField: "metadata",
      granularity: "seconds",
    },
  });

  const ts = new Date();

  const outputData = {
    metadata: {
      data,
    },
    uid,
    deviceKey,
    slot,
    ts,
  };

  let limitDataRate = false;
  try {
    const lastestData = await getSensesiotDeviceLastestAnyControlData(
      uid,
      deviceKey
    );
    if (
      !(lastestData.ts instanceof Date) ||
      ts.getTime() - lastestData.ts.getTime() >= limitRateMs
    ) {
      await dataCol.insertOne(outputData);
    } else {
      limitDataRate = true;
    }
  } catch (error) {
    throw new Error("Can't insert control data");
  }

  if (limitDataRate) {
    throw new Error("Limit Data Rate");
  }

  return {
    uid,
    deviceKey,
    slot,
    data,
  };
}

export default Object.freeze({
  getSensesiotDeviceLastestControlData,
  insertSensesiotDeviceControlData,
});
