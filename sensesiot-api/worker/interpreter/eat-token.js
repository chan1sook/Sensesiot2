export default function eatToken(
  fn = async () => 0,
  ast = null,
  options = {},
  fallbackValue = undefined
) {
  return ast
    ? fn({
        ...options,
        ast: ast.block || ast.shadow,
      })
    : new Promise((resolve) => {
        resolve(fallbackValue);
      });
}
