import pLimit from "p-limit";

import { sensesiotV2 } from "../../database/mongodb.js";

function getFetchTypeByWidget(widget) {
  switch (widget.type) {
    case "gauge":
      return "data1";
    case "chart":
      return "data+";
    case "control":
      return "control1";
    default:
      return "";
  }
}

function findFetchDataOf({ fetchType, deviceKey, slot }, fetchLists = []) {
  return fetchLists.find(
    (ele) =>
      ele.fetchType === fetchType &&
      ele.deviceKey === deviceKey &&
      ele.slot === slot
  );
}

export function fetchSensesiotDataByFetchDataOf({
  fetchType,
  deviceKey,
  slot,
  anchorToday = Date.now(),
}) {
  const dataCol = sensesiotV2.collection("data");
  const controlCol = sensesiotV2.collection("control");
  switch (fetchType) {
    case "data1":
      return dataCol
        .find(
          {
            deviceKey,
            slot,
            ts: {
              $lte: new Date(anchorToday),
            },
          },
          { limit: 1, sort: { ts: -1 } }
        )
        .toArray();
    case "data+":
      return dataCol
        .find(
          {
            deviceKey,
            slot,
            ts: {
              $gte: new Date(anchorToday - 60 * 60 * 1000),
              $lte: new Date(anchorToday),
            },
          },
          { sort: { ts: 1 } }
        )
        .toArray();
    case "control1":
      return controlCol
        .find(
          {
            deviceKey,
            slot,
            ts: {
              $lte: new Date(anchorToday),
            },
          },
          { limit: 1, sort: { ts: -1 } }
        )
        .toArray();
    default:
      return new Promise((resolve) => {
        resolve([]);
      });
  }
}

export async function fetchSensesiotDataByWidgets(widgets = []) {
  const queryPLimit = pLimit(20);
  const fetchLists = [];
  const anchorToday = Date.now();

  for (let i = 0; i < widgets.length; i += 1) {
    const widget = widgets[i];
    const fetchType = getFetchTypeByWidget(widget);

    if (fetchType !== "") {
      const deviceKey = widget.dataDevice || widget.controlDevice;
      const slot = widget.dataSlot || widget.controlSlot;

      if (deviceKey && (typeof slot === "string" || Number.isInteger(slot))) {
        const fetchObj = {
          fetchType,
          deviceKey,
          slot: `${slot}`,
          anchorToday,
        };

        const oldFetchObj = findFetchDataOf(fetchObj, fetchLists);
        if (!oldFetchObj) {
          fetchLists.push(fetchObj);
        }
      }
    }
  }

  const dbPromises = fetchLists.map((ele) =>
    fetchSensesiotDataByFetchDataOf(ele)
  );

  const results = await Promise.all(
    dbPromises.map((ele) => queryPLimit(() => ele))
  );

  for (let i = 0; i < fetchLists.length; i += 1) {
    const fetchObj = fetchLists[i];
    fetchObj.data = results[i];
  }

  return fetchLists;
}

export default Object.freeze({
  fetchSensesiotDataByWidgets,
  fetchSensesiotDataByFetchDataOf,
});
