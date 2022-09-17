export default async function eatTextMultiline(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "text_multiline") {
    throw new Error(`Not text_multiline Block (${ast.type})`);
  }

  const { TEXT } = ast.fields;

  return TEXT;
}
