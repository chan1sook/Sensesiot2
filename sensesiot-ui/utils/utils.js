export function truncate(input, length = 16) {
  if (input.length > length) {
    const a = Math.round((length - 2) / 2)
    const b = length - a
    return input.substring(0, a) + '...' + input.substring(input.length - b)
  }

  return input
}

export default Object.freeze({ truncate })
