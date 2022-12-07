<template>
  <div class="control range" :class="{ disabled }">
    <div class="range-knob" :style="controlKnobStyle" :title="rangeTitle">
      <div class="range-text" :style="controlValueStyle">
        {{ statePretty }}
      </div>
    </div>
    <div
      ref="rangeBody"
      class="range-body"
      :style="controlBgStyle"
      @click="onClick"
    >
      <div class="range-fill" :style="controlFgStyle"></div>
    </div>
  </div>
</template>

<script>
import chroma from 'chroma-js'
import { getColorIfValid } from '~/utils/gradient'
export default {
  name: 'ToggleControlButtonSubwidget',
  props: {
    widget: {
      type: Object,
      default() {
        return {}
      },
    },
    state: {
      type: String,
      default: '50',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    controlFgStyle() {
      const styles = {
        width: `${this.percentBarValue}%`,
      }

      if (!this.widget.useThemeFgColor) {
        styles.background = getColorIfValid(this.widget.fgColors, {
          gradientReverse: true,
        })
      }

      return styles
    },
    controlBgStyle() {
      const styles = {
        cursor: this.disabled ? 'default' : 'pointer',
      }

      if (!this.widget.useThemeBgColor) {
        styles.background = getColorIfValid(this.widget.bgColors)
      }

      return styles
    },
    controlKnobStyle() {
      const styles = {}

      if (!this.widget.useThemeKnobColor) {
        styles.background = getColorIfValid(this.widget.knobColors)
      }

      return styles
    },
    controlValueStyle() {
      const styles = {}

      if (
        !this.widget.useThemeLabelColor &&
        chroma.valid(this.widget.labelColor)
      ) {
        styles.color = this.widget.labelColor
      }

      return styles
    },
    rangeMin() {
      if (Number.isFinite(this.widget.rangeMin)) {
        return this.widget.rangeMin
      }

      return 0
    },
    rangeMax() {
      if (Number.isFinite(this.widget.rangeMax)) {
        return this.widget.rangeMax
      }

      return 100
    },
    statePretty() {
      const n = parseInt(this.state, 10)
      if (!Number.isInteger(n) || n < this.rangeMin || n > this.rangeMax) {
        return '-'
      }

      return this.state
    },
    percentBarValue() {
      const n = parseInt(this.state, 10)
      if (!Number.isInteger(n) || n < this.rangeMin || n > this.rangeMax) {
        return 0
      }

      const dPercent = this.rangeMax - this.rangeMin
      const percent = Math.round(((n - this.rangeMin) / dPercent) * 100)
      if (percent < 0) {
        return 0
      } else if (percent > 100) {
        return 100
      }

      return percent
    },
    rangeTitle() {
      return `${this.statePretty} [${this.rangeMin}-${this.rangeMax}]`
    },
  },
  methods: {
    onClick(ev) {
      const x = ev.offsetX
      const width = this.$refs.rangeBody.clientWidth
      const dPercent = this.rangeMax - this.rangeMin
      const value = this.rangeMin + Math.round((x / width) * dPercent)
      this.$emit('change', value.toString())
    },
  },
}
</script>

<style scoped>
/** Volume (Range) */
.control.range {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
}

.control.range .range-body {
  width: 100%;

  height: 4em;
  border-radius: 0 9999px 9999px 0;

  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;

  background-color: #cccccc;
  background-color: var(--color-light2, #cccccc);
}

.control.range .range-fill {
  width: 0;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;

  transition-property: width;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;

  background-color: #aaaaaa;
  background-color: var(--color-light, #aaaaaa);
}

.control.range .range-fill[state='on'] {
  width: 100%;
}

.control.range .range-knob {
  height: 4em;
  aspect-ratio: 0.85;

  opacity: 1;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  border-radius: 9999px 0 0 9999px;
  background-color: #666666;
  background-color: var(--color-dark, #666666);
}

.control.range .range-text {
  color: #f8f9fa;
  color: var(--widget-text-dark-color, #f8f9fa);
}
</style>
