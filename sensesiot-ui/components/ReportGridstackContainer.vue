<template>
  <div ref="gridstack" class="grid-stack">
    <template v-if="ready">
      <template v-for="widget of widgets">
        <label-sensesiot-report-widget v-if="widget.type === 'label'" ref="widgets" :key="`widget-label-${widget._id}`"
          :widget="widget" :theme="theme" :gridstack="gridstack" :editing="editing" @edit="editWidget"
          @remove="removeWidget" />
        <chart-sensesiot-report-widget v-else-if="widget.type === 'chart'" ref="widgets"
          :key="`widget-chart-${widget._id}`" :widget="widget" :theme="theme" :value="reportDataFunction(widget)"
          :report-mode="reportMode" :gridstack="gridstack" :editing="editing"
          :adjustment-date="getAdjustmentDate(widget)" @edit="editWidget" @remove="removeWidget"
          @adjustDate="$emit('adjustDate', $event)" @exportData="$emit('exportData', $event)" />
        <default-sensesiot-report-widget v-else :key="`widget-${widget._id}`" ref="widgets" :widget="widget"
          :theme="theme" :gridstack="gridstack" :editing="editing" @edit="editWidget" @remove="removeWidget" />
      </template>
    </template>
  </div>
</template>

<script>
import 'gridstack/dist/gridstack.min.css'
import 'gridstack/dist/gridstack-extra.css'

import LabelSensesiotReportWidget from '~/components/report-widgets/LabelSensesiotReportWidget.vue'
import DefaultSensesiotReportWidget from '~/components/report-widgets/DefaultSensesiotReportWidget.vue'
import ChartSensesiotReportWidget from '~/components/report-widgets/ChartSensesiotReportWidget.vue'
import { sampleReportChartData } from '~/utils/report'

export default {
  name: 'ReportGridstackContainer',
  components: {
    LabelSensesiotReportWidget,
    ChartSensesiotReportWidget,
    DefaultSensesiotReportWidget,
  },
  props: {
    widgets: {
      type: Array,
      default() {
        return []
      },
    },
    theme: {
      type: String,
      default: 'default',
    },
    editing: {
      type: Boolean,
      default: false,
    },
    reportMode: {
      type: Boolean,
      default: false,
    },
    adjustmentDates: {
      type: Object,
      default() {
        return {}
      },
    },
    reportDataFunction: {
      type: Function,
      default(widget) {
        switch (widget.type) {
          case 'chart':
            return new Array(widget.datasetCount || 2)
              .fill(undefined)
              .map((ele) => {
                return {
                  data: sampleReportChartData(widget),
                }
              })
        }
      },
    },
  },
  data() {
    return {
      ready: false,
      gridstack: null,
      id: 0,
    }
  },
  mounted() {
    const { GridStack } = require('gridstack')

    this.id = setInterval(() => {
      this.$forceUpdate()
    }, 10000)

    this.initGridstack(GridStack)
  },
  beforeDestroy() {
    clearInterval(this.id)

    window.removeEventListener('resize', this.onResize)

    this.gridstack = null
    this.ready = false
  },
  methods: {
    initGridstack(GridStack) {
      this.gridstack = GridStack.init(
        { column: 1, cellHeight: '200px', disableOneColumnMode: true },
        this.$refs.gridstack
      )
      this.gridstack.on('change', this.onChange)
      this.gridstack.on('resize', this.onResize)

      window.addEventListener('resize', this.onResize)
      this.ready = true
    },
    getData() {
      const gridSave = this.gridstack.save(false)
      const result = gridSave
        .map((ele) => {
          const id = ele.id.replaceAll('gs-widget-', '')
          const targetWidget = this.widgets.find((ele) => ele._id === id)
          if (targetWidget) {
            return {
              ...targetWidget,
              x: ele.x,
              y: ele.y,
              w: ele.w,
              h: ele.h,
            }
          } else {
            return targetWidget
          }
        })
        .filter((ele) => !!ele)
      return result
    },
    getAdjustmentDate(widget) {
      return this.adjustmentDates[widget._id] || new Date()
    },
    onChange() {
      const data = this.getData()
      this.$emit('change', data)
    },
    onResize(ev, el) {
      if (!Array.isArray(this.$refs.widgets)) {
        return
      }

      for (const ref of this.$refs.widgets) {
        if (ref.$el === el && typeof ref.onResize === 'function') {
          ref.onResize()
          break
        }
      }
    },
    editWidget(id) {
      this.$emit('editWidget', id)
    },
    removeWidget(id) {
      this.$emit('removeWidget', id)
    },
    pushControl(metadata) {
      this.$emit('pushControl', metadata)
    },
  },
}
</script>
