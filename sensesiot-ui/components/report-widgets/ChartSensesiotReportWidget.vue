<template>
  <sensesiot-report-widget-container
    :widget="widget"
    :theme="theme"
    :gridstack="gridstack"
    :editing="editing"
    :min-w="1"
    :min-h="3"
    @edit="editWidget"
    @remove="removeWidget"
  >
    <div
      class="p-2 d-flex flex-column"
      style="gap: 0.5em; position: absolute; height: 100%; width: 100%"
    >
      <vue-markdown
        v-if="widget.title"
        inline
        :source="widget.title || 'Chart'"
        class="text-center font-weight-bold"
        style="font-size: 1.25em"
      ></vue-markdown>
      <b-input-group v-if="reportMode" prepend="Date">
        <b-datepicker
          boundary="viewport"
          :value="currentDate"
          value-as-date
          no-flip
          :disabled="widget.dataDateType !== 'adjustable'"
          @input="
            $emit('adjustDate', {
              date: $event,
              _id: widget._id,
            })
          "
        ></b-datepicker>
      </b-input-group>
      <div ref="baseContainer" style="flex-grow: 1; min-height: 200px">
        <mixed-chart
          ref="chartContainer"
          class="mx-auto"
          :style="chartBaseStyle"
          :chart-options="chartOptions"
          :chart-data="chartData"
          :chart-id="chartId"
          :width="width"
          :height="height"
        ></mixed-chart>
      </div>
    </div>
  </sensesiot-report-widget-container>
</template>

<script>
import { v4 as uuid } from 'uuid'
import chroma from 'chroma-js'
import { th } from 'date-fns/locale'
import dayjs from 'dayjs'

import DefaultSensesiotReportWidget from './DefaultSensesiotReportWidget.vue'
import MixedChart from '~/components/charts/MixedChart.vue'

import { getThemeSetting } from '~/utils/theme'
import { getColorIfValid } from '~/utils/gradient'

export default {
  name: 'ChartSensesiotReportWidget',
  components: {
    MixedChart,
  },
  extends: DefaultSensesiotReportWidget,
  props: {
    value: {
      type: Array,
      default() {
        return []
      },
    },
    adjustableDate: {
      type: Number,
      default() {
        return Date.now()
      },
    },
    reportMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      aspectRatio: 1.5,
      controlMaxWidth: 200,
      width: 400,
      height: 300,
      minX: Date.now() - 15 * 60 * 1000,
      maxX: Date.now(),
      minY: undefined,
      maxY: undefined,
      refreshId: 0,
    }
  },
  computed: {
    chartBaseStyle() {
      return {
        maxWidth: `${this.controlMaxWidth}px`,
      }
    },
    chartId() {
      return `chart-${uuid()}`
    },
    chartType() {
      return this.widget.chartType || 'line'
    },
    chartData() {
      return {
        datasets: this.value.map((ele, i) => {
          return {
            type: this.getChartType(this.widget, i + 1),
            label: this.getLabelName(this.widget, i + 1),
            backgroundColor: this.getFgColor(this.widget, i + 1, this.theme),
            borderColor: this.getBgColor(this.widget, i + 1, this.theme),
            fill: this.getFill(this.widget, i + 1, this.theme),
            data: ele.data || [],
          }
        }),
      }
    },
    chartOptions() {
      return {
        scales: {
          y: {
            ticks: {
              color: this.getLabelColor(this.widget, this.theme),
            },
            title: {
              display: Boolean(this.widget.yAxisLabel),
              text: this.widget.yAxisLabel || '',
            },
            min: this.minY,
            max: this.maxY,
          },
          x: {
            type: 'time',
            ticks: {
              color: this.getLabelColor(this.widget, this.theme),
            },
            title: {
              display: Boolean(this.widget.xAxisLabel),
              text: this.widget.xAxisLabel || '',
            },
            adapters: {
              date: {
                locale: th,
              },
            },
            time: {
              tooltipFormat: 'd MMM yyyy HH:mm:ss',
              displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'HH:mm',
                day: 'd MMM',
                month: 'MMM yyyy',
              },
            },
            min: this.minX,
            max: this.maxX,
          },
        },
        plugins: {
          legend: {
            onClick() {},
            labels: {
              color: this.getLabelColor(this.widget, this.theme),
            },
          },
        },
      }
    },
    limitX() {
      let minDate
      let maxDate
      switch (this.widget.dataDateType) {
        case 'fixed':
          minDate = dayjs(this.widget.dataDateStart)
          break
        case 'relative':
          minDate = dayjs().subtract(
            this.widget.dataDateOffset,
            this.widget.dataDateOffsetUnit
          )
          break
        case 'adjustable':
        default:
          minDate = dayjs()
          break
      }

      const min = dayjs(minDate)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .valueOf()

      switch (this.widget.timeframe) {
        case 'day':
          maxDate = dayjs(min).add(1, 'day')
          break
        case 'week':
          maxDate = dayjs(min).add(1, 'week')
          break
        case 'month':
          maxDate = dayjs(min).add(1, 'month')
          break
        case 'quarter':
          maxDate = dayjs(min).add(3, 'month')
          break
        case 'year':
          maxDate = dayjs(min).add(1, 'year')
          break
        default:
          maxDate = dayjs(min).add(1, 'day')
      }

      return {
        min,
        max: maxDate.valueOf(),
      }
    },
    dateOffsets() {
      const offsetValue = this.widget.dataDateOffset
      const offsetUnit = this.widget.dataDateOffsetUnit

      switch (offsetUnit) {
        case 'day':
        case 'week':
        case 'month':
        case 'year':
          return [offsetValue, offsetUnit]
        case 'quarter':
          return [offsetValue * 3, 'month']
        default:
          return [1, 'day']
      }
    },
    currentDate() {
      const type = this.widget.dataDateType
      let date = dayjs()
      switch (type) {
        case 'relative':
          date = dayjs().subtract(...this.dateOffsets)
          break
        case 'fixed':
          date = dayjs(this.widget.dataDateStart)
          break
        case 'adjustable':
        default:
          date = dayjs(this.adjustableDate)
          break
      }

      return date.hour(0).minute(0).second(0).millisecond(0).toDate()
    },
  },
  watch: {
    value() {
      this.resetAxis()

      clearInterval(this.refreshId)
      this.refreshId = setInterval(this.resetAxis, 5000)
    },
  },
  mounted() {
    this.resetAxis()

    this.refreshId = setInterval(this.resetAxis, 5000)

    this.resizeChart()
  },
  beforeDestroy() {
    clearInterval(this.refreshId)
  },
  methods: {
    getLabelName(widget, i = 1) {
      return widget[`datasetName${i}`] || 'Data'
    },
    getChartType(widget, i = 1, theme) {
      const chartType = widget[`chartType${i}`]
      if (!chartType || chartType === 'area') {
        return 'line'
      }

      return chartType
    },
    getFgColor(widget, i = 1, theme) {
      if (!widget[`useThemeFgColor${i}`]) {
        return (
          getColorIfValid(widget[`fgColors${i}`], {
            css: false,
            gradientWidth: this.width,
          }) || getThemeSetting(theme)['--color-base']
        )
      }

      return getThemeSetting(theme)['--color-base']
    },
    getBgColor(widget, i = 1, theme) {
      if (!widget[`useThemeBgColor${i}`]) {
        return (
          getColorIfValid(widget[`bgColors${i}`], {
            css: false,
            gradientWidth: this.width,
          }) || getThemeSetting(theme)['--color-dark2']
        )
      }

      return getThemeSetting(theme)['--color-dark2']
    },
    getFill(widget, i = 1, theme) {
      if (this.widget[`chartType${i}`] !== 'area') {
        return false
      }

      return {
        target: 'origin',
      }
    },
    getLabelColor(widget, theme) {
      if (!widget.useThemeLabelColor && chroma.valid(widget.labelColor)) {
        return widget.labelColor
      }

      return getThemeSetting(theme)['--widget-text-color']
    },
    resetAxis() {
      const { min: minX, max: maxX } = this.limitX
      this.minX = minX
      this.maxX = maxX

      this.minY =
        !this.widget.yAxisAuto && Number.isFinite(this.widget.yAxisMin)
          ? this.widget.yAxisMin
          : undefined
      this.maxY =
        !this.widget.yAxisAuto && Number.isFinite(this.widget.yAxisMax)
          ? this.widget.yAxisMax
          : undefined
    },
    resizeChart() {
      if (!this.$refs.chartContainer) {
        return
      }

      const wTarget = this.$refs.baseContainer.clientWidth
      const hTarget = this.$refs.baseContainer.clientHeight
      const rTarget = wTarget / hTarget

      const wSource = this.$refs.chartContainer.$el.clientWidth
      const hSource = this.$refs.chartContainer.$el.clientHeight
      const rSource = wSource / hSource

      if (rTarget > rSource) {
        // constarin height
        this.controlMaxWidth = rSource * hTarget
      } else {
        // constarin width
        this.controlMaxWidth = wTarget
      }

      this.aspectRatio = rTarget
      this.width = wTarget
      this.height = hTarget
    },
    onResize() {
      this.resizeChart()
    },
  },
}
</script>
