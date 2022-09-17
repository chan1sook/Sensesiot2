import dayjs from "dayjs";

const weekdayOptions = ["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT"];
export default async function eatDatetimeOf(astInfo) {
  const { ast } = astInfo;

  if (ast.type !== "datetime_of") {
    throw new Error(`Not datetime_of Block (${ast.type})`);
  }

  const { DAY_OF_WEEK, HOUR, MINUTE } = ast.fields;

  const weekday = weekdayOptions.indexOf(DAY_OF_WEEK);

  if (weekday === -1) {
    throw new Error(`Invalid DAY_OF_WEEK ${DAY_OF_WEEK}`);
  }

  return dayjs().day(weekday).hour(HOUR).minute(MINUTE).toDate();
}
