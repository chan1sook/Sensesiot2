<template>
  <BarChartComponent
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :plugins="plugins"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="height"
  />
</template>

<script>
import { Bar } from 'vue-chartjs/legacy'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LinearScale,
  TimeScale,
  TimeSeriesScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LinearScale,
  TimeScale,
  TimeSeriesScale
)

export default {
  name: 'BarChart',
  components: { BarChartComponent: Bar },
  props: {
    chartData: {
      type: Object,
      default: () => {},
    },
    chartOptions: {
      type: Object,
      default: () => {},
    },
    chartId: {
      type: String,
      default: 'chart-' + Date.now(),
    },
    datasetIdKey: {
      type: String,
      default: 'label',
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      default: '',
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
