<template>
  <sensesiot-widget-container
    :widget="widget"
    :theme="theme"
    :gridstack="gridstack"
    :editing="editing"
    :min-w="3"
    :min-h="1"
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
      <div ref="baseContainer" style="flex-grow: 1; min-height: 200px">
        <bar-chart
          v-if="chartType === 'bar'"
          ref="chartContainer"
          class="mx-auto"
          :style="chartBaseStyle"
          :chart-options="chartOptions"
          :chart-data="chartData"
          :chart-id="chartId"
          :width="width"
          :height="height"
        ></bar-chart>
        <area-chart
          v-else-if="chartType === 'area'"
          ref="chartContainer"
          class="mx-auto"
          :style="chartBaseStyle"
          :chart-options="chartOptions"
          :chart-data="chartData"
          :chart-id="chartId"
          :width="width"
          :height="height"
        ></area-chart>
        <line-chart
          v-else
          ref="chartContainer"
          class="mx-auto"
          :style="chartBaseStyle"
          :chart-options="chartOptions"
          :chart-data="chartData"
          :chart-id="chartId"
          :width="width"
          :height="height"
        ></line-chart>
      </div>
    </div>
  </sensesiot-widget-container>
</template>

<script>
import { v4 as uuid } from 'uuid'
import chroma from 'chroma-js'
import { th } from 'date-fns/locale'

import DefaultSensesiotWidget from './DefaultSensesiotWidget.vue'
import BarChart from './chart/BarChart.vue'
import LineChart from './chart/LineChart.vue'
import AreaChart from './chart/AreaChart.vue'

import { getThemeSetting } from '~/utils/dashboard'
import { getColorIfValid } from '~/utils/gradient'

export default {
  name: 'ChartSensesiotWidget',
  components: {
    BarChart,
    LineChart,
    AreaChart,
  },
  extends: DefaultSensesiotWidget,
  data() {
    return {
      aspectRatio: 1.5,
      controlMaxWidth: 200,
      width: 400,
      height: 300,
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
        datasets: [
          {
            label: this.getLabelName(this.widget),
            backgroundColor: this.getFgColor(this.widget, this.theme),
            borderColor: this.getBgColor(this.widget, this.theme),
            fill: this.getFill(this.theme),
            data: this.actualData,
          },
        ],
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
            ...this.limitY,
          },
          x: {
            type: 'timeseries',
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
            ...this.limitX,
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
      return {
        min: Date.now() - (this.widget.xAxisDuration || 15 * 60 * 1000),
        max: Date.now(),
      }
    },
    limitY() {
      return {
        min:
          !this.widget.yAxisAuto && Number.isFinite(this.widget.yAxisMin)
            ? this.widget.yAxisMin
            : undefined,
        max:
          !this.widget.yAxisAuto && Number.isFinite(this.widget.yAxisMax)
            ? this.widget.yAxisMax
            : undefined,
      }
    },
    actualData() {
      const length = this.widget.xAxisDuration
        ? Math.floor(this.widget.xAxisDuration / 60000)
        : 15
      return new Array(length).fill(undefined).map((ele, i) => {
        return {
          x: new Date(Date.now() + (i - length) * 60000),
          y: Math.round(Math.random() * 100),
        }
      })
    },
  },
  mounted() {
    this.resizeChart()
  },
  methods: {
    getLabelName(widget) {
      return widget.datasetName || 'Data'
    },
    getFgColor(widget, theme) {
      if (!widget.useThemeFgColor) {
        return (
          getColorIfValid(widget.fgColors, {
            css: false,
            gradientWidth: this.width,
          }) || getThemeSetting(theme)['--color-base']
        )
      }

      return getThemeSetting(theme)['--color-base']
    },
    getBgColor(widget, theme) {
      if (!widget.useThemeBgColor) {
        return (
          getColorIfValid(widget.bgColors, {
            css: false,
            gradientWidth: this.width,
          }) || getThemeSetting(theme)['--color-dark2']
        )
      }

      return getThemeSetting(theme)['--color-dark2']
    },
    getFill(theme) {
      if (this.chartType !== 'area') {
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
