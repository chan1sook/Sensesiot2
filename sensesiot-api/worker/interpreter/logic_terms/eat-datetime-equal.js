import dayjs from "dayjs";
import eatDatetimeTerm from "../datetime_terms/eat-datetime-term.js";
import eatToken from "../eat-token.js";

function equalDatetime(leftTerm, rightTerm) {
  const leftDayjs = dayjs(leftTerm);
  const leftValue =
    leftDayjs.day() * 60 * 24 + leftDayjs.hour() * 60 + leftDayjs.minute();
  const rightDayjs = dayjs(rightTerm);
  const rightValue =
    rightDayjs.day() * 60 * 24 + rightDayjs.hour() * 60 + rightDayjs.minute();

  return leftValue === rightValue;
}

function equalTime(leftTerm, rightTerm) {
  const leftDayjs = dayjs(leftTerm);
  const leftValue = leftDayjs.hour() * 60 + leftDayjs.minute();
  const rightDayjs = dayjs(rightTerm);
  const rightValue = rightDayjs.hour() * 60 + rightDayjs.minute();

  return leftValue === rightValue;
}
export default async function eatDatetimeEquals(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "datetime_equals") {
    throw new Error(`Not datetime_equals Block (${ast.type})`);
  }

  const { A, B } = ast.inputs;
  const [leftTerm, rightTerm] = await Promise.all([
    eatToken(eatDatetimeTerm, A, astInfo, new Date()),
    eatToken(eatDatetimeTerm, B, astInfo, new Date()),
  ]);

  const { OP } = ast.fields;

  switch (OP) {
    case "EQDATETIME":
      return equalDatetime(leftTerm, rightTerm);
    case "EQTIME":
      return equalTime(leftTerm, rightTerm);
    default:
      throw new Error(`No valid datetime_equals OP ${OP}`);
  }
}
