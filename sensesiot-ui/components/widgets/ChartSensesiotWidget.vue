<template>
  <sensesiot-widget-container :widget="widget" :theme="theme" :gridstack="gridstack" :editing="editing" :min-w="3"
    :min-h="1" @edit="editWidget" @remove="removeWidget">
    <div class="p-2 d-flex flex-column" style="gap: 0.5em; position: absolute; height: 100%; width: 100%">
      <vue-markdown v-if="widget.title" inline :source="widget.title || 'Chart'" class="text-center font-weight-bold"
        style="font-size: 1.25em"></vue-markdown>
      <div ref="baseContainer" style="flex-grow: 1; min-height: 200px">
        <bar-chart v-if="chartType === 'bar'" ref="chartContainer" class="mx-auto" :style="chartBaseStyle"
          :chart-options="chartOptions" :chart-data="chartData" :chart-id="chartId" :width="width"
          :height="height"></bar-chart>
        <area-chart v-else-if="chartType === 'area'" ref="chartContainer" class="mx-auto" :style="chartBaseStyle"
          :chart-options="chartOptions" :chart-data="chartData" :chart-id="chartId" :width="width"
          :height="height"></area-chart>
        <line-chart v-else ref="chartContainer" class="mx-auto" :style="chartBaseStyle" :chart-options="chartOptions"
          :chart-data="chartData" :chart-id="chartId" :width="width" :height="height"></line-chart>
      </div>
      <div v-if="widget.showExportBtn" class="d-flex justify-content-end">
        <b-input-group prepend="Export" class="w-auto">
          <b-input-group-append>
            <b-button variant="primary" type="button" :disabled="editing" title="CSV"
              @click="emitExportData(widget._id, 'csv')">
              <font-awesome-icon :icon="['fas', 'fa-file-csv']"></font-awesome-icon>
              CSV
            </b-button>
            <b-button variant="primary" type="button" :disabled="editing" title="XLSX"
              @click="emitExportData(widget._id, 'xlsx')">
              <font-awesome-icon :icon="['fas', 'fa-file-excel']"></font-awesome-icon>
              XLSX
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
    </div>
  </sensesiot-widget-container>
</template>

<script>
import { v4 as uuid } from 'uuid'
import chroma from 'chroma-js'
import { th } from 'date-fns/locale'

import DefaultSensesiotWidget from './DefaultSensesiotWidget.vue'
import BarChart from '~/components/charts/BarChart.vue'
import LineChart from '~/components/charts/LineChart.vue'
import AreaChart from '~/components/charts/AreaChart.vue'

import { getThemeSetting } from '~/utils/theme'
import { getColorIfValid } from '~/utils/gradient'

export default {
  name: 'ChartSensesiotWidget',
  components: {
    BarChart,
    LineChart,
    AreaChart,
  },
  extends: DefaultSensesiotWidget,
  props: {
    value: {
      type: Array,
      default() {
        return []
      },
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
        datasets: [
          {
            label: this.getLabelName(this.widget),
            backgroundColor: this.getFgColor(this.widget, this.theme),
            borderColor: this.getBgColor(this.widget, this.theme),
            fill: this.getFill(this.theme),
            data: this.value,
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
            onClick() { },
            labels: {
              color: this.getLabelColor(this.widget, this.theme),
            },
          },
        },
      }
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
    resetAxis() {
      this.minX = Date.now() - (this.widget.xAxisDuration || 15 * 60 * 1000)
      this.maxX = Date.now()

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
    emitExportData(id, type) {
      this.$emit('exportData', {
        _id: id,
        type,
      })
    }
  },
}
</script>
