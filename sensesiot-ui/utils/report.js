import dayjs from 'dayjs'
import { generateGradientObject } from './gradient'
import { getSupportMarkdownDescription } from './utils'

export const timeFrameOptions = [
  { text: 'Day', value: 'day' },
  { text: 'Week', value: 'week' },
  { text: 'Month', value: 'month' },
  { text: 'Quarter-Year', value: 'quarter' },
  { text: 'Year', value: 'year' },
]

export function getDefaultReportData() {
  return {
    name: 'New Report',
    title: 'The Report',
    theme: 'default',
    publicAccess: false,
    widgets: [],
  }
}

export const reportWidgetsDescription = [
  {
    name: 'label',
    icon: ['fas', 'a'],
    label: 'Label',
    description:
      '## Label\n\nSimple Label for show infomation.\n\n' +
      '### Supports\n\n- [Markdown](https://www.markdownguide.org/basic-syntax)\n' +
      '- [FontAwesome 6](https://fontawesome.com/) free icon.',
  },
  {
    name: 'chart',
    icon: ['fas', 'chart-area'],
    label: 'Chart',
    description:
      '## Chart\n\nComplex Chart for show timeseries data.\n\n' +
      '### Supports\n\n- Bar Chart\n- Line Chart',
  },
]

const MAX_CHART_COUNT = 3

function generateChartDataOption(n = 5) {
  const result = {}
  for (let i = 1; i <= n; i++) {
    result[`chartType${i}`] = 'line'
    result[`fgColors${i}`] = generateGradientObject({
      colors: ['#999999', '#999999'],
    })
    result[`useThemeFgColor${i}`] = true
    result[`bgColors${i}`] = generateGradientObject({
      colors: ['#CCCCCC', '#CCCCCC'],
    })
    result[`useThemeBgColor${i}`] = true
    result[`labelColor${i}`] = '#000000'
    result[`useThemeLabelColor${i}`] = true
    result[`datasetName${i}`] = `Data${i}`
    result[`dataDevice${i}`] = ''
    result[`dataSlot${i}`] = i
  }
  return result
}

export function getDefaultReportWidgetData(type = 'label') {
  switch (type) {
    case 'label':
      return {
        content:
          '# Label\n\n Support **Markdown** and **FontAwesome 6** ::fas fa-face-grin-wide::',
      }
    case 'chart':
      return {
        title: '::fas fa-chart-area:: Chart',
        dataDateType: 'adjustable',
        dataDateStart: Date.now(),
        dataDateOffset: 0,
        dataDateOffsetUnit: 'day',
        timeframe: 'day',
        xAxisLabel: '',
        yAxisLabel: '',
        yAxisAuto: true,
        yAxisMin: 0,
        yAxisMax: 100,
        datasetCount: 1,
        ...generateChartDataOption(MAX_CHART_COUNT),
      }
    default:
      return {}
  }
}

function generateChartDataParams(n = 5) {
  const result = []
  for (let i = 1; i <= n; i++) {
    result.push(
      {
        field: `chartType${i}`,
        label: `Dataset ${i}: Chart Type`,
        type: 'select',
        options: [
          {
            text: 'Line (Default)',
            value: 'line',
          },
          {
            text: 'Bar',
            value: 'bar',
          },
          {
            text: 'Area',
            value: 'area',
          },
        ],
        showIfFieldOp: ['datasetCount', '>=', i],
      },
      {
        field: `useThemeFgColor${i}`,
        label: `Dataset ${i}: Chart Color`,
        choiceLabel: 'Use Theme Color',
        type: 'checkbox',
        showIfFieldOp: ['datasetCount', '>=', i],
      },
      {
        field: `fgColors${i}`,
        label: `Dataset ${i}: Custom Chart Color`,
        type: 'gradient',
        hideIfFieldTrue: `useThemeFgColor${i}`,
        showIfFieldOp: ['datasetCount', '>=', i],
      },
      {
        field: `useThemeBgColor${i}`,
        label: `Dataset ${i}: Border Color Dataset`,
        choiceLabel: 'Use Theme Color',
        type: 'checkbox',
        showIfFieldOp: ['datasetCount', '>=', i],
      },
      {
        field: `bgColors${i}`,
        label: `Dataset ${i}: Custom Border Color`,
        type: 'gradient',
        hideIfFieldTrue: `useThemeBgColor${i}`,
        showIfFieldOp: ['datasetCount', '>=', i],
      },
      {
        field: `dataDevice${i}`,
        label: `Dataset ${i}: Select Device`,
        type: 'device',
        showIfFieldOp: ['datasetCount', '>=', i],
      },
      {
        field: `dataSlot${i}`,
        label: `Dataset ${i}: Slot`,
        type: 'number',
        showIfFieldOp: ['datasetCount', '>=', i],
      }
    )
  }
  return result
}

export function getConfigableReportWidgetParams(
  type = 'label',
  { devices = [] } = {
    devices: [],
  }
) {
  switch (type) {
    case 'label':
      return [
        {
          field: 'content',
          label: 'Content',
          description: getSupportMarkdownDescription(false),
          type: 'textarea',
          rows: 5,
        },
      ]
    case 'chart':
      return [
        {
          field: 'title',
          label: 'Title',
          description: getSupportMarkdownDescription(true),
          type: 'text',
        },
        {
          field: 'dataDateType',
          label: 'Dataset Date Mode',
          type: 'select',
          options: [
            {
              text: 'User-Adjustable (Default)',
              value: 'adjustable',
            },
            {
              text: 'Fixed Date',
              value: 'fixed',
            },
            {
              text: 'Relative',
              value: 'relative',
            },
          ],
        },
        {
          field: 'dataDateStart',
          label: 'Dataset Start Date',
          type: 'date',
          showIfFieldOp: ['dataDateType', '===', 'fixed'],
        },
        {
          field: 'dataDateOffset',
          label: 'Dataset Date Offset',
          type: 'number',
          showIfFieldOp: ['dataDateType', '===', 'relative'],
        },
        {
          field: 'dataDateOffsetUnit',
          label: 'Dataset Date Offset Unit',
          type: 'select',
          options: timeFrameOptions,
          showIfFieldOp: ['dataDateType', '===', 'relative'],
        },
        {
          field: 'timeframe',
          label: 'Timeframe',
          type: 'select',
          options: timeFrameOptions,
        },
        {
          field: 'xAxisLabel',
          label: 'X Axis Label',
          type: 'text',
        },
        {
          field: 'yAxisLabel',
          label: 'Y Axis Label',
          type: 'text',
        },
        {
          field: 'yAxisAuto',
          label: 'Y Axis Auto Scale',
          type: 'checkbox',
        },
        {
          field: 'yAxisMin',
          label: 'Y Axis Min',
          type: 'number',
          hideIfFieldTrue: 'yAxisAuto',
        },
        {
          field: 'yAxisMax',
          label: 'Y Axis Max',
          type: 'number',
          hideIfFieldTrue: 'yAxisAuto',
        },
        {
          field: 'datasetCount',
          label: 'Dataset Count',
          type: 'number',
          min: 1,
          max: 3,
        },
        ...generateChartDataParams(MAX_CHART_COUNT),
        {
          field: 'useThemeLabelColor',
          label: 'Label Color',
          choiceLabel: 'Use Theme Color',
          type: 'checkbox',
        },
        {
          field: 'labelColor',
          label: 'Custom Label Color',
          type: 'color',
          hideIfFieldTrue: 'useThemeLabelColor',
        },
      ]
    default:
      return []
  }
}

export function preditNextGridReportPosition(widgets = []) {
  const widgetXYs = widgets.map(
    (ele) => ele.y + ele.h - 1 + (ele.x + ele.w - 1)
  )
  console.log(
    widgets.map((ele) => ({ x: ele.x, y: ele.y })),
    widgetXYs
  )

  const maxXY = widgetXYs.length > 0 ? Math.max(...widgetXYs) + 1 : 0

  const y = maxXY
  return {
    x: 0,
    y,
  }
}

function findWidgetChartReportData(reportData, widget) {
  const result = []
  for (let i = 1; i <= widget.datasetCount; i++) {
    const target = reportData.find((ele) => {
      return (
        Array.isArray(ele.target) &&
        ele.target.findIndex(
          (ele2) => ele2._id === widget._id && ele2.i === i
        ) !== -1
      )
    })
    if (target) {
      result.push({
        ...target,
        data: target.data.map((ele) => {
          return {
            x: dayjs(ele.ts).toDate(),
            y: ele.metadata.data,
          }
        }),
      })
    } else {
      result.push({
        data: [],
      })
    }
  }

  return result
}

export function getReportWidgetData(reportData, widget) {
  switch (widget.type) {
    case 'chart':
      return findWidgetChartReportData(reportData, widget)
    default:
  }
}

export function sampleReportChartData(widget) {
  let startDate

  switch (widget.dataDateType) {
    case 'fixed':
      startDate = dayjs(widget.dataDateStart)
      break
    case 'relative':
      startDate = dayjs().subtract(
        widget.dataDateOffset,
        widget.dataDateOffsetUnit
      )
      break
    case 'adjustable':
    default:
      startDate = dayjs()
      break
  }

  const normalizeStartDate = dayjs(startDate)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
  let endDate
  let tsDiff = 100
  switch (widget.timeframe) {
    case 'day':
      endDate = normalizeStartDate.add(1, 'day')
      tsDiff = 30 * 60 * 1000 // 30 min
      break
    case 'week':
      endDate = normalizeStartDate.add(1, 'week')
      tsDiff = 6 * 60 * 60 * 1000 // 6 hour
      break
    case 'month':
      endDate = normalizeStartDate.add(1, 'month')
      tsDiff = 24 * 60 * 60 * 1000 // 1 day
      break
    case 'quarter':
      endDate = normalizeStartDate.add(3, 'month')
      tsDiff = 7 * 24 * 60 * 60 * 1000 // 7 day
      break
    case 'year':
      endDate = normalizeStartDate.add(1, 'year')
      tsDiff = 14 * 24 * 60 * 60 * 1000 // 14 day
      break
  }

  const result = []
  for (
    let ts = normalizeStartDate.valueOf();
    ts <= endDate.valueOf();
    ts += tsDiff
  ) {
    result.push({
      x: new Date(ts),
      y: Math.round(Math.random() * 100),
    })
  }

  return result
}

export default Object.freeze({
  timeFrameOptions,
  getDefaultReportData,
  reportWidgetsDescription,
  getDefaultReportWidgetData,
  getConfigableReportWidgetParams,
  preditNextGridReportPosition,
  getReportWidgetData,
  sampleReportChartData,
})
