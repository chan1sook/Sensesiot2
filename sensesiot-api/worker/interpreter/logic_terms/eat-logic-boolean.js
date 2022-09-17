export default async function eatLogicBoolean(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "logic_boolean") {
    throw new Error(`Not logic_boolean Block (${ast.type})`);
  }

  const { BOOL } = ast.fields;
  return BOOL === "TRUE";
}
