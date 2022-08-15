import chroma from 'chroma-js'
export function generateGradientObject({
  colors = ['#000000', '#FFFFFF'],
} = {}) {
  return {
    type: 'linear',
    deg: 0,
    pivot: [0, 0],
    colors: colors || ['#000000', '#FFFFFF'],
    stops: [0, 100],
  }
}

export function isGradientObject(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.colors) &&
    Array.isArray(obj.stops)
  )
}

export function toGradientColorCss(obj, { gradientReverse = false } = {}) {
  if (!isGradientObject(obj)) {
    return ''
  }

  if (obj.type === 'linear') {
    const gradientStr = obj.stops
      .map((stop, i) => {
        return `${obj.colors[i]} ${stop}%`
      })
      .join(',')
    return `linear-gradient(${
      gradientReverse ? 'to left' : 'to right'
    },${gradientStr})`
  }

  // TODO care others type
  return ''
}

export function toGradientColor(obj, { gradientWidth = 400 } = {}) {
  if (!isGradientObject(obj)) {
    return null
  }

  if (obj.type === 'linear') {
    const canvas = document.createElement('canvas')
    const gradient = canvas
      .getContext('2d')
      .createLinearGradient(0, 0, gradientWidth || 400, 0)
    for (let i = 0; i < obj.stops.length; i++) {
      const stop = obj.stops[i]
      gradient.addColorStop(stop / 100, obj.colors[i])
    }
    return gradient
  }

  // TODO care others type
  return null
}

export function getColorIfValid(color, options = { css: true }) {
  if (isGradientObject(color)) {
    return options && options.css
      ? toGradientColorCss(color, options)
      : toGradientColor(color, options)
  }

  if (chroma.valid(color)) {
    return color
  }
}

export default Object.freeze({
  generateGradientObject,
  isGradientObject,
  toGradientColorCss,
  toGradientColor,
  getColorIfValid,
})
