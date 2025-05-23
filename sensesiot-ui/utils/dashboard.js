import dayjs from 'dayjs'
import {
  getConditionOptions,
  getDefaultConditionBlocks,
} from '../blockly/options'
import { generateGradientObject } from './gradient'
import { getSupportMarkdownDescription } from './utils'

export function getDefaultDashboardData() {
  return {
    name: 'New Dashboard',
    publicAccess: false,
    theme: 'default',
    widgets: [],
  }
}

export function preditNextGridPosition(widgets = []) {
  const widgetXYs = widgets.map(
    (ele) => (ele.y + ele.h - 1) * 12 + (ele.x + ele.w - 1)
  )
  const maxXY = widgetXYs.length > 0 ? Math.max(...widgetXYs) + 1 : 0

  const y = Math.floor(maxXY / 12)
  return {
    x: maxXY - y * 12,
    y,
  }
}

export const widgetsDescription = [
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
    name: 'gauge',
    icon: ['fas', 'gauge'],
    label: 'Gauge',
    description: '# Gauge\n\nSimple Gauge for show value.',
  },
  {
    name: 'chart',
    icon: ['fas', 'chart-area'],
    label: 'Chart',
    description:
      '## Chart\n\nSimple Chart for show timeseries data.\n\n' +
      '### Supports\n\n- Bar Chart\n- Line Chart\n- Area Chart\n\n' +
      'All chart can export data to CSV/Excel',
  },
  {
    name: 'control',
    icon: ['fas', 'toggle-on'],
    label: 'Control',
    description:
      '## Control\n\nSimple Control for control device.\n\n' +
      '### Supports\n\n- Toggle Button\n' +
      '- Push Button\n' +
      '- Volume (Slider)',
  },
  {
    name: 'condition',
    icon: ['fas', 'code-merge'],
    label: 'Condition',
    description:
      '## Condition\n\nProgammable automated switch. Use Blockly\n\n' +
      '### Supports\n\n- Control Device\n' +
      '- LINE Notify',
  },
]

export function getDefaultWidgetData(type = 'label') {
  switch (type) {
    case 'label':
      return {
        w: 4,
        h: 2,
        content:
          '# Label\n\n Support **Markdown** and **FontAwesome 6** ::fas fa-face-grin-wide::',
      }
    case 'gauge':
      return {
        w: 2,
        h: 2,
        title: '::fas fa-gauge:: Gauge',
        unit: '',
        fgColors: generateGradientObject({ colors: ['#999999', '#999999'] }),
        useThemeFgColor: true,
        bgColors: generateGradientObject({ colors: ['#CCCCCC', '#CCCCCC'] }),
        useThemeBgColor: true,
        labelColor: '#000000',
        useThemeLabelColor: true,
        gaugeMin: 0,
        gaugeMax: 100,
        dataDevice: '',
        dataSlot: 1,
      }
    case 'chart':
      return {
        w: 4,
        h: 2,
        title: '::fas fa-chart-area:: Chart',
        chartType: 'line',
        datasetName: 'Data',
        xAxisLabel: '',
        xAxisDuration: 15 * 60 * 1000,
        yAxisLabel: '',
        yAxisAuto: true,
        yAxisMin: 0,
        yAxisMax: 100,
        fgColors: generateGradientObject({ colors: ['#999999', '#999999'] }),
        useThemeFgColor: true,
        bgColors: generateGradientObject({ colors: ['#CCCCCC', '#CCCCCC'] }),
        useThemeBgColor: true,
        labelColor: '#000000',
        useThemeLabelColor: true,
        dataDevice: '',
        dataSlot: 1,
        showExportBtn: false,
      }
    case 'control':
      return {
        w: 2,
        h: 2,
        title: '::fas fa-toggle-on:: Control',
        controlType: 'toggle',
        fgColors: generateGradientObject({ colors: ['#999999', '#999999'] }),
        useThemeFgColor: true,
        bgColors: generateGradientObject({ colors: ['#CCCCCC', '#CCCCCC'] }),
        useThemeBgColor: true,
        knobColors: generateGradientObject({ colors: ['#666666', '#666666'] }),
        useThemeKnobColor: true,
        labelColor: '#000000',
        useThemeLabelColor: true,
        controlDevice: '',
        controlSlot: 1,
        rangeMin: 0,
        rangeMax: 100,
      }
    case 'condition':
      return {
        w: 2,
        h: 2,
        title: '::fas fa-code-merge:: Condition',
        active: false,
        condition: getDefaultConditionBlocks(),
      }
    default:
      return {
        w: 2,
        h: 2,
      }
  }
}

export function getConfigableWidgetParams(
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
    case 'gauge':
      return [
        {
          field: 'title',
          label: 'Title',
          description: getSupportMarkdownDescription(true),
          type: 'text',
        },
        {
          field: 'unit',
          label: 'Unit',
          description: 'Unit Label',
          type: 'text',
        },
        {
          field: 'gaugeMin',
          label: 'Minimum Gauge Value',
          type: 'number',
        },
        {
          field: 'gaugeMax',
          label: 'Maximum Gauge Value',
          type: 'number',
        },
        {
          field: 'useThemeFgColor',
          label: 'Foreground Color',
          choiceLabel: 'Use Theme Color',
          type: 'checkbox',
        },
        {
          field: 'fgColors',
          label: 'Custom Foreground Color',
          type: 'gradient',
          hideIfFieldTrue: 'useThemeFgColor',
        },
        {
          field: 'useThemeBgColor',
          label: 'Background Color',
          choiceLabel: 'Use Theme Color',
          type: 'checkbox',
        },
        {
          field: 'bgColors',
          label: 'Custom Background Color',
          type: 'gradient',
          hideIfFieldTrue: 'useThemeBgColor',
        },
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
        {
          field: 'dataDevice',
          label: 'Select Device',
          type: 'device',
        },
        {
          field: 'dataSlot',
          label: 'Slot',
          type: 'number',
          min: 1,
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
          field: 'chartType',
          label: 'Chart Type',
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
        },
        {
          field: 'datasetName',
          label: 'Dataset Name',
          type: 'text',
        },
        {
          field: 'xAxisLabel',
          label: 'X Axis Label',
          type: 'text',
        },
        {
          field: 'xAxisDuration',
          label: 'X Axis Duration',
          type: 'select',
          options: [
            {
              text: '5 mins',
              value: 5 * 60 * 1000,
            },
            {
              text: '10 mins',
              value: 10 * 60 * 1000,
            },
            {
              text: '15 mins (Default)',
              value: 15 * 60 * 1000,
            },
            {
              text: '30 mins',
              value: 30 * 60 * 1000,
            },
            {
              text: '60 mins',
              value: 60 * 60 * 1000,
            },
          ],
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
          field: 'useThemeFgColor',
          label: 'Chart Color',
          choiceLabel: 'Use Theme Color',
          type: 'checkbox',
        },
        {
          field: 'fgColors',
          label: 'Custom Chart Color',
          type: 'gradient',
          hideIfFieldTrue: 'useThemeFgColor',
        },
        {
          field: 'useThemeBgColor',
          label: 'Border Color',
          choiceLabel: 'Use Theme Color',
          type: 'checkbox',
        },
        {
          field: 'bgColors',
          label: 'Custom Border Color',
          type: 'gradient',
          hideIfFieldTrue: 'useThemeBgColor',
        },
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
        {
          field: 'dataDevice',
          label: 'Select Device',
          type: 'device',
        },
        {
          field: 'dataSlot',
          label: 'Slot',
          type: 'number',
          min: 1,
        },
        {
          field: 'showExportBtn',
          label: 'Export Chart Data Button',
          choiceLabel: 'Show Export Chart Data Button',
          type: 'checkbox',
        },
      ]
    case 'control':
      return [
        {
          field: 'title',
          label: 'Title',
          description: getSupportMarkdownDescription(true),
          type: 'text',
        },
        {
          field: 'controlType',
          label: 'Control Type',
          type: 'select',
          options: [
            {
              text: 'Toggle (Default)',
              value: 'toggle',
            },
            {
              text: 'Push',
              value: 'push',
            },
            {
              text: 'Volume',
              value: 'range',
            },
          ],
        },
        {
          field: 'useThemeFgColor',
          label: 'Foreground Color',
          choiceLabel: 'Use Theme Color',
          type: 'checkbox',
        },
        {
          field: 'fgColors',
          label: 'Custom Foreground Color',
          type: 'gradient',
          hideIfFieldTrue: 'useThemeFgColor',
        },
        {
          field: 'useThemeBgColor',
          label: 'Background Color',
          choiceLabel: 'Use Theme Color',
          type: 'checkbox',
        },
        {
          field: 'bgColors',
          label: 'Custom Background Color',
          type: 'gradient',
          hideIfFieldTrue: 'useThemeBgColor',
        },
        {
          field: 'useThemeKnobColor',
          label: 'Knob Color',
          choiceLabel: 'Use Theme Color',
          type: 'checkbox',
        },
        {
          field: 'knobColors',
          label: 'Custom Knob Color',
          type: 'gradient',
          hideIfFieldTrue: 'useThemeKnobColor',
        },
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
        {
          field: 'controlDevice',
          label: 'Select Device',
          type: 'device',
        },
        {
          field: 'controlSlot',
          label: 'Slot',
          type: 'number',
          min: 1,
        },
        {
          field: 'rangeMin',
          label: 'Slider Min Value',
          type: 'number',
          showIfFieldOp: ['controlType', '===', 'range'],
        },
        {
          field: 'rangeMax',
          label: 'Slider Max Value',
          type: 'number',
          showIfFieldOp: ['controlType', '===', 'range'],
          extraValidation: 'rangeMinMax',
        },
      ]
    case 'condition':
      return [
        {
          field: 'title',
          label: 'Title',
          description: getSupportMarkdownDescription(true),
          type: 'text',
        },
        {
          field: 'active',
          label: 'Active Condition',
          choiceLabel: 'Active Condition',
          type: 'checkbox',
        },
        {
          field: 'condition',
          label: 'Condition',
          type: 'blockly',
          options: getConditionOptions(devices),
        },
      ]
    default:
      return []
  }
}

function findWidgetData(dashboardData, widget, fetchType) {
  return dashboardData.find(
    (ele) =>
      ele.fetchType === fetchType &&
      ele.deviceKey === widget.dataDevice &&
      ele.slot === `${widget.dataSlot}`
  )
}
function findWidgetControlData(dashboardData, widget, fetchType) {
  return dashboardData.find(
    (ele) =>
      ele.fetchType === fetchType &&
      ele.deviceKey === widget.controlDevice &&
      ele.slot === `${widget.controlSlot}`
  )
}

export function getWidgetData(dashboardData, widget) {
  let targetData
  switch (widget.type) {
    case 'gauge':
      targetData = findWidgetData(dashboardData, widget, 'data1')
      if (
        targetData &&
        Array.isArray(targetData.data) &&
        targetData.data.length > 0
      ) {
        targetData = targetData.data[targetData.data.length - 1]
        if (dayjs().diff(targetData.ts, 'minutes') <= 15) {
          return targetData.metadata.data
        }
      }
      return null
    case 'chart':
      targetData = findWidgetData(dashboardData, widget, 'data+')
      if (targetData && Array.isArray(targetData.data)) {
        return targetData.data.map((ele) => {
          return {
            x: dayjs(ele.ts).toDate(),
            y: ele.metadata.data,
          }
        })
      }
      break
    case 'control':
      targetData = findWidgetControlData(dashboardData, widget, 'control1')
      if (
        targetData &&
        Array.isArray(targetData.data) &&
        targetData.data.length > 0
      ) {
        return targetData.data[targetData.data.length - 1].metadata.data
      }
      break
    default:
  }
}

export function onSioMqtt(dashboardData, data) {
  for (const fetchData of dashboardData) {
    if (
      fetchData.deviceKey === data.deviceKey &&
      fetchData.slot === `${data.slot}`
    ) {
      switch (fetchData.fetchType) {
        case 'data1':
          if (data.type === 'dataApi') {
            fetchData.data.splice(0, fetchData.data.length, {
              metadata: {
                data: parseFloat(data.data),
              },
              deviceKey: data.deviceKey,
              slot: data.slot,
              ts: dayjs().toISOString(),
            })
          }
          break
        case 'data+':
          if (data.type === 'dataApi') {
            fetchData.data.push({
              metadata: {
                data: parseFloat(data.data),
              },
              deviceKey: data.deviceKey,
              slot: data.slot,
              ts: dayjs().toISOString(),
            })
          }
          break
        case 'control1':
          if (data.type === 'controlApi') {
            fetchData.data.splice(0, fetchData.data.length, {
              metadata: {
                data: data.data,
              },
              deviceKey: data.deviceKey,
              slot: data.slot,
              ts: dayjs().toISOString(),
            })
          }
          break
      }
    }
  }
}

export function onUpdateWidget(dashboards, data) {
  for (const dashboard of dashboards) {
    for (const widget of dashboard.widgets) {
      if (widget._id === data.widgetId) {
        Object.assign(widget, data.data)
      }
    }
  }
}

export function checkValidation(type, widgetData) {
  switch (type) {
    case 'rangeMinMax':
      return (
        Number.isFinite(widgetData.rangeMin) &&
        Number.isFinite(widgetData.rangeMax) &&
        widgetData.rangeMax > widgetData.rangeMin
      )
    default:
      return true
  }
}

export default Object.freeze({
  getDefaultDashboardData,
  preditNextGridPosition,
  widgetsDescription,
  getDefaultWidgetData,
  getConfigableWidgetParams,
  getWidgetData,
  onSioMqtt,
  onUpdateWidget,
  checkValidation,
})
