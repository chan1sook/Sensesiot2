/* eslint-disable no-underscore-dangle */
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import pLimit from "p-limit";

import { sensesiotV2 } from "../../database/mongodb.js";
import { ASAPFn } from "../../utils/data-transform.js";

dayjs.extend(utc);
dayjs.extend(timezone);

function getFetchTypeByReportWidget(widget) {
  switch (widget.type) {
    case "chart":
      return `data+`;
    default:
      return "";
  }
}

function findReportFetchDataOf(
  { fetchType, deviceKey, slot, startDate, duration },
  fetchLists = []
) {
  return fetchLists.find(
    (ele) =>
      ele.fetchType === fetchType &&
      ele.deviceKey === deviceKey &&
      ele.slot === slot &&
      ele.startDate === startDate &&
      ele.duration === duration
  );
}

function getSubtractUnit(dataDateOffset, dataDateOffsetUnit) {
  switch (dataDateOffsetUnit) {
    case "day":
      return [dataDateOffset, "day"];
    case "week":
      return [dataDateOffset, "week"];
    case "month":
      return [dataDateOffset, "month"];
    case "quarter":
      return [dataDateOffset * 3, "month"];
    case "year":
      return [dataDateOffset, "year"];
    default:
      return [1, "day"];
  }
}

function getReportDateConfig(widget, adjustmentTs = Date.now()) {
  const {
    timeframe,
    dataDateType,
    dataDateStart,
    dataDateOffset,
    dataDateOffsetUnit,
  } = widget;

  let startDate = dayjs();
  switch (dataDateType) {
    case "fixed":
      startDate = dayjs(dataDateStart);
      break;
    case "relative":
      startDate = dayjs().subtract(
        ...getSubtractUnit(dataDateOffset, dataDateOffsetUnit)
      );
      break;
    case "adjustable":
      startDate = dayjs(adjustmentTs);
      break;
    default:
      break;
  }

  startDate = startDate
    .tz("Asia/Bangkok")
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0);
  let endDate;

  switch (timeframe) {
    case "day":
      endDate = startDate.add(1, "day");
      break;
    case "week":
      endDate = startDate.add(1, "week");
      break;
    case "month":
      endDate = startDate.add(1, "month");
      break;
    case "quarter":
      endDate = startDate.add(3, "month");
      break;
    case "year":
      endDate = startDate.add(1, "year");
      break;
    default:
      endDate = startDate.add(1, "day");
  }

  return {
    startDate: startDate.valueOf(),
    duration: endDate.diff(startDate),
  };
}

export function fetchSensesiotDataByReportFetchDataOf({
  fetchType,
  deviceKey,
  slot,
  startDate,
  duration,
}) {
  const dataCol = sensesiotV2.collection("data");
  switch (fetchType) {
    case "data+":
      return dataCol
        .find(
          {
            deviceKey,
            slot,
            ts: {
              $gte: new Date(startDate),
              $lte: new Date(startDate + duration),
            },
          },
          { sort: { ts: 1 } }
        )
        .toArray();
    default:
      return new Promise((resolve) => {
        resolve([]);
      });
  }
}

export async function fetchSensesiotDataByReportWidgets(
  reportWidgets = [],
  options = {}
) {
  const queryPLimit = pLimit(20);
  const fetchLists = [];

  for (let i = 0; i < reportWidgets.length; i += 1) {
    const widget = reportWidgets[i];
    if (widget.type === "chart") {
      const { datasetCount } = widget;
      const fetchType = getFetchTypeByReportWidget(widget);
      let adjustmentTs = new Date();
      if (options && options.adjustmentDates) {
        const ts = options.adjustmentDates[widget._id];
        if (ts) {
          adjustmentTs = ts;
        }
      }

      const { startDate, duration } = getReportDateConfig(widget, adjustmentTs);

      for (let j = 1; j <= datasetCount; j += 1) {
        const deviceKey = widget[`dataDevice${datasetCount}`];
        const slot = widget[`dataSlot${datasetCount}`];

        const fetchObj = {
          fetchType,
          deviceKey,
          slot: `${slot}`,
          startDate,
          duration,
          target: [],
        };

        const oldFetchObj = findReportFetchDataOf(fetchObj, fetchLists);

        if (!oldFetchObj) {
          fetchObj.target = [
            {
              _id: widget._id,
              i: j,
            },
          ];
          fetchLists.push(fetchObj);
        } else {
          oldFetchObj.target.push({
            _id: widget._id,
            i: j,
          });
        }
      }
    }
  }

  const dbPromises = fetchLists.map(async (ele) => {
    const result = await fetchSensesiotDataByReportFetchDataOf(ele);
    if (ele.fetchType === "data+") {
      return ASAPFn(result, 200);
    }

    return result;
  });

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
  fetchSensesiotDataByReportFetchDataOf,
  fetchSensesiotDataByReportWidgets,
});
