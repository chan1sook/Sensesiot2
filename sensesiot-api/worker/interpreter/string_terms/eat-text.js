export default async function eatText(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text") {
    throw new Error(`Not text Block (${ast.type})`);
  }

  const { TEXT } = ast.fields;

  return TEXT;
}
