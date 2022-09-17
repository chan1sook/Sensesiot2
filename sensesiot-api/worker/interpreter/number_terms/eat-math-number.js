export default async function eatMathNumber(astInfo) {
  const { ast } = astInfo;
  if (ast.type !== "math_number") {
    throw new Error(`Not math_number Block (${ast.type})`);
  }

  return ast.fields.NUM;
}
