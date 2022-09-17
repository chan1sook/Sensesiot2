export default async function eatCurrentDatetime(astInfo) {
  const { ast } = astInfo;

  if (ast.type !== "current_datetime") {
    throw new Error(`Not current_datetime Block (${ast.type})`);
  }

  return new Date();
}
