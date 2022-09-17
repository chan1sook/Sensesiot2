export default async function eatVariablesGet(astInfo) {
  const { ast, type, variables } = astInfo;
  if (ast.type !== "variables_get") {
    throw new Error(`Not variables_get Block (${ast.type})`);
  }

  const { VAR } = ast.fields;
  const targetVariable = variables.find((ele) => ele.id === VAR.id);

  let value;
  if (targetVariable) {
    value = targetVariable.value;
  }

  switch (type) {
    case "number":
      if (typeof value !== "number") {
        throw new Error("Mismatch type");
      }
      break;
    case "string":
      if (typeof value !== "string") {
        throw new Error("Mismatch type");
      }
      break;
    case "logic":
      if (typeof value !== "boolean") {
        throw new Error("Mismatch type");
      }
      break;
    case "datetime":
      if (!(value instanceof Date)) {
        throw new Error("Mismatch type");
      }
      break;
    case "any":
      break;
    default:
      break;
  }
  return value;
}
