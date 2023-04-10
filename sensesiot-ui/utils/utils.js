export function truncate(input, length = 16) {
  if (input.length > length) {
    const a = Math.round((length - 2) / 2)
    const b = length - a
    return input.substring(0, a) + '...' + input.substring(input.length - b)
  }

  return input
}

export function getSupportMarkdownDescription(inline = false) {
  return (
    `Support ${
      inline ? 'Inline' : ''
    } [Markdown](https://www.markdownguide.org/basic-syntax)\n` +
    `Insert [FontAwesome](https://fontawesome.com/) free icon with syntax \`::group icon-name::\`\n` +
    `**e.g.** \`::fas fa-a::\` = ::fas fa-a::`
  )
}

export async function preditCredits($axios, additionList = {}) {
  const { creditInfo, costs } = await $axios.$post(
    '/api/sensesiot/credits/predit',
    additionList
  )
  return { creditInfo, costs }
}

export function getCostableWidgets(widgets) {
  return widgets.filter((ele) => !ele.isFree)
}

export default Object.freeze({
  truncate,
  getSupportMarkdownDescription,
  preditCredits,
  getCostableWidgets,
})
