<template>
  <div ref="gridstack" class="grid-stack">
    <template v-if="ready">
      <template v-for="widget of widgets">
        <label-sensesiot-widget
          v-if="widget.type === 'label'"
          ref="widgets"
          :key="`widget-label-${widget._id}`"
          :widget="widget"
          :theme="theme"
          :gridstack="gridstack"
          :editing="editing"
          @edit="editWidget"
          @remove="removeWidget"
        />
        <gauge-sensesiot-widget
          v-else-if="widget.type === 'gauge'"
          ref="widgets"
          :key="`widget-gauge-${widget._id}`"
          :widget="widget"
          :theme="theme"
          :value="dataFunction(widget)"
          :gridstack="gridstack"
          :editing="editing"
          @edit="editWidget"
          @remove="removeWidget"
        />
        <chart-sensesiot-widget
          v-else-if="widget.type === 'chart'"
          ref="widgets"
          :key="`widget-chart-${widget._id}`"
          :widget="widget"
          :theme="theme"
          :value="dataFunction(widget)"
          :gridstack="gridstack"
          :editing="editing"
          @edit="editWidget"
          @remove="removeWidget"
        />
        <control-sensesiot-widget
          v-else-if="widget.type === 'control'"
          ref="widgets"
          :key="`widget-control-${widget._id}`"
          :widget="widget"
          :theme="theme"
          :state="dataFunction(widget)"
          :gridstack="gridstack"
          :editing="editing"
          :no-control="noControl"
          @control="pushControl"
          @edit="editWidget"
          @remove="removeWidget"
        />
        <condition-sensesiot-widget
          v-else-if="widget.type === 'condition'"
          ref="widgets"
          :key="`widget-condition-${widget._id}`"
          :widget="widget"
          :theme="theme"
          :gridstack="gridstack"
          :editing="editing"
          @edit="editWidget"
          @remove="removeWidget"
        />
        <default-sensesiot-widget
          v-else
          :key="`widget-${widget._id}`"
          ref="widgets"
          :widget="widget"
          :theme="theme"
          :gridstack="gridstack"
          :editing="editing"
          @edit="editWidget"
          @remove="removeWidget"
        />
      </template>
    </template>
  </div>
</template>

<script>
import 'gridstack/dist/gridstack.min.css'

import DefaultSensesiotWidget from '~/components/widgets/DefaultSensesiotWidget.vue'
import GaugeSensesiotWidget from '~/components/widgets/GaugeSensesiotWidget.vue'
import LabelSensesiotWidget from '~/components/widgets/LabelSensesiotWidget.vue'
import ChartSensesiotWidget from '~/components/widgets/ChartSensesiotWidget.vue'
import ControlSensesiotWidget from '~/components/widgets/ControlSensesiotWidget.vue'
import ConditionSensesiotWidget from '~/components/widgets/ConditionSensesiotWidget.vue'

export default {
  name: 'DashboardGridstackContainer',
  components: {
    DefaultSensesiotWidget,
    GaugeSensesiotWidget,
    LabelSensesiotWidget,
    ChartSensesiotWidget,
    ControlSensesiotWidget,
    ConditionSensesiotWidget,
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
    noControl: {
      type: Boolean,
      default: false,
    },
    dataFunction: {
      type: Function,
      default(widget) {
        let length
        switch (widget.type) {
          case 'gauge':
            return Math.round(Math.random() * 1000) / 1000
          case 'chart':
            length = Number.isInteger(this.widget.xAxisDuration)
              ? Math.floor(this.widget.xAxisDuration / 60000)
              : 15

            return new Array(length).fill(undefined).map((ele, i) => {
              return {
                x: new Date(Date.now() + (i - length) * 60000),
                y: Math.round(Math.random() * 100),
              }
            })
          case 'control':
            if (widget.controlType === 'toggle') {
              return Math.random() > 0.5 ? 'on' : 'off'
            } else if (widget.controlType === 'range') {
              return Math.round(Math.random() * 100).toString()
            }
            return ''
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
  watch: {
    widgets(value) {
      this.ready = false
      const oldGridstack = this.gridstack
      if (oldGridstack) {
        oldGridstack.removeAll(false)
      }

      this.$nextTick(() => {
        const { GridStack } = require('gridstack')
        this.initGridstack(GridStack)
      })
    },
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
        { float: true, oneColumnSize: 600, oneColumnModeDomSort: true },
        this.$refs.gridstack
      )
      this.gridstack.on('change', this.onChange)
      this.gridstack.on('resize', this.onResize)

      window.addEventListener('resize', this.onResize)
      this.ready = true
    },
    getData() {
      const gridSave = this.gridstack.save(false)

      return gridSave
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

<style></style>
