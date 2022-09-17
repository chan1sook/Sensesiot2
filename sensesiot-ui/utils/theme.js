export const sensesiotThemeOptions = [
  { text: 'SensesIoT (Default)', value: 'default' },
  { text: 'FarmIoT', value: 'farmiot' },
  { text: 'IndustialIoT', value: 'industialiot' },
]

const defaultThemeParams = {
  '--color-base': '#999999',
  '--color-light': '#aaaaaa',
  '--color-light2': '#cccccc',
  '--color-light3': '#eeeeee',
  '--color-dark': '#666666',
  '--color-dark2': '#333333',
  '--color-dark3': '#000000',
  '--dashboard-bg-color': 'var(--color-light3, #eeeeee)',
  '--widget-bg-color': 'var(--color-light3, #eeeeee)',
  '--widget-border-color': 'var(--color-light, #aaaaaa)',
  '--widget-text-color': '#212529',
  '--widget-text-dark-color': '#f8f9fa',
}

export function getThemeSetting(theme = 'default') {
  const themeSetting = {
    ...defaultThemeParams,
  }
  switch (theme) {
    case 'farmiot':
      Object.assign(themeSetting, {
        '--color-base': '#429b46',
        '--color-light': '#64ad62',
        '--color-light2': '#94c58c',
        '--color-light3': '#b8e7b0',
        '--color-dark': '#1a8828',
        '--color-dark2': '#0a6921',
        '--color-dark3': '#094f29',
      })
      break
    case 'industialiot':
      Object.assign(themeSetting, {
        '--color-base': '#5880a2',
        '--color-light': '#83a3be',
        '--color-light2': '#afc6d9',
        '--color-light3': '#dbe9f5',
        '--color-dark': '#5880a2',
        '--color-dark2': '#2c5d87',
        '--color-dark3': '#003a6b',
        '--dashboard-bg-color': 'var(--color-dark3, #000000)',
        '--widget-bg-color': 'var(--color-dark2, #000000)',
        '--widget-border-color': 'var(--color-dark, #666666)',
        '--widget-text-color': '#f8f9fa',
      })
      break
  }

  return themeSetting
}

export default Object.freeze({
  sensesiotThemeOptions,
  getThemeSetting,
})
