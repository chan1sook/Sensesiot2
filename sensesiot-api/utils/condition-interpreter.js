async function eatRoot(ast) {
  if (ast.type !== "condition_event") {
    throw new Error("Not condition_event Block");
  }

  console.log(ast);
}

export default async function interpreteConditionBlockly(blocks) {
  const {
    blocks: { blocks: rootBlocks },
  } = blocks;
  if (Array.isArray(rootBlocks) && rootBlocks.length > 0) {
    await eatRoot(rootBlocks[0]);
  }
}
