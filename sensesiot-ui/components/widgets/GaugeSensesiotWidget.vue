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
        :source="widget.title || 'Gauge'"
        class="text-center font-weight-bold"
        style="font-size: 1.25em"
      ></vue-markdown>
      <div
        ref="baseContainer"
        class="d-flex"
        style="flex-grow: 1; min-height: 100px"
      >
        <div ref="gaugeContainer" class="gauge m-auto" :style="gaugeBaseStyle">
          <div class="gauge-body" :style="gaugeBgStyle">
            <div class="gauge-fill" :style="gaugeFgStyle"></div>
            <div class="gauge-cover" :style="gaugeValueStyle">
              {{ valuePretty }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </sensesiot-widget-container>
</template>

<script>
import chroma from 'chroma-js'

import DefaultSensesiotWidget from './DefaultSensesiotWidget.vue'

import { getColorIfValid } from '~/utils/gradient'

export default {
  name: 'GaugeSensesiotWidget',
  extends: DefaultSensesiotWidget,
  props: {
    value: {
      type: Number,
      default: 0.5,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      gaugeMaxWidth: 250,
      valueFontSize: 16,
    }
  },
  computed: {
    gaugeCurrentDeg() {
      let r
      const b = this.max - this.min
      if (!Number.isFinite(b) || b === 0 || !Number.isFinite(this.value)) {
        r = 0
      } else {
        r = (this.value - this.min) / b
      }

      r = Math.min(1, Math.max(r, 0)) * 180
      return `${r.toFixed(4)}deg`
    },
    gaugeBaseStyle() {
      return {
        maxWidth: `${this.gaugeMaxWidth}px`,
      }
    },
    gaugeFgStyle() {
      const styles = {
        transform: `rotate(${this.gaugeCurrentDeg})`,
      }

      if (!this.widget.useThemeFgColor) {
        styles.background = getColorIfValid(this.widget.fgColors, {
          gradientReverse: true,
        })
      }

      return styles
    },
    gaugeBgStyle() {
      const styles = {}

      if (!this.widget.useThemeBgColor) {
        styles.background = getColorIfValid(this.widget.bgColors)
      }

      return styles
    },
    gaugeValueStyle() {
      const styles = {
        fontSize: `${this.valueFontSize}px`,
      }

      if (
        !this.widget.useThemeLabelColor &&
        chroma.valid(this.widget.labelColor)
      ) {
        styles.color = this.widget.labelColor
      }

      return styles
    },
    valuePretty() {
      if (!Number.isFinite(this.value)) {
        return '-'
      }
      const valueStr = this.value.toPrecision(4).replace(/\.?0+$/g, '')
      const unitStr = this.widget.unit ? ` ${this.widget.unit}` : ''
      return valueStr + unitStr
    },
  },
  mounted() {
    this.resizeGauge()
  },
  methods: {
    resizeGauge() {
      const wTarget = this.$refs.baseContainer.clientWidth
      const hTarget = this.$refs.baseContainer.clientHeight
      const rTarget = wTarget / hTarget

      const wSource = this.$refs.gaugeContainer.clientWidth
      const hSource = this.$refs.gaugeContainer.clientHeight
      const rSource = wSource / hSource

      if (rTarget > rSource) {
        // constarin height
        this.gaugeMaxWidth = rSource * hTarget
      } else {
        // constarin width
        this.gaugeMaxWidth = wTarget
      }
      this.valueFontSize = this.gaugeMaxWidth * 0.125
    },
    onResize() {
      this.resizeGauge()
    },
  },
}
</script>

<style scoped>
.gauge {
  width: 100%;
}

.gauge .gauge-body {
  width: 100%;
  height: 0;
  padding-bottom: 50%;

  position: relative;
  border-top-left-radius: 100% 200%;
  border-top-right-radius: 100% 200%;
  overflow: hidden;

  background-color: #cccccc;
  background-color: var(--color-light2, #cccccc);
}

.gauge .gauge-fill {
  position: absolute;
  top: 100%;
  left: 0;
  width: inherit;
  height: 100%;
  transform-origin: center top;
  transform: rotate(0.25turn);
  transition: transform 0.2s ease-out;

  background-color: #999999;
  background-color: var(--color-base, #999999);
}

.gauge .gauge-cover {
  font-size: 32px;

  width: 75%;
  height: 150%;
  border-radius: 50%;
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 25%;
  box-sizing: border-box;

  text-overflow: clip;

  color: #212529;
  color: var(--widget-text-color);
  background-color: #eeeeee;
  background-color: var(--widget-bg-color);
}
</style>
