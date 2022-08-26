import BullQueue from "bull";

export const mainRoutineQueue = new BullQueue("mainRoutineQueue");
export const dashboardQueue = new BullQueue("dashboardQueue");
export const widgetQueue = new BullQueue("widgetQueue");

export default Object.freeze({
  mainRoutineQueue,
  dashboardQueue,
  widgetQueue,
});
