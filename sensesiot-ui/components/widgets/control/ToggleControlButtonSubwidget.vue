<template>
  <div class="control toggle" :class="{ disabled }">
    <div class="toggle-body" :style="controlBgStyle" @click="onClick">
      <div class="toggle-fill" :state="actualState" :style="controlFgStyle">
        <div class="toggle-knob" :style="controlKnobStyle">
          <div class="toggle-text" :style="controlValueStyle">
            {{ statePretty }}
          </div>
        </div>
      </div>
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
      default: 'off',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    controlFgStyle() {
      const styles = {}

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
    actualState() {
      if (['on', 'off'].includes(this.state)) {
        return this.state
      }
      return 'off'
    },
    statePretty() {
      if (this.actualState === 'on') {
        return 'On'
      } else if (this.actualState === 'off') {
        return 'Off'
      }

      return 'Off'
    },
  },
  methods: {
    onClick() {
      const nextState = this.actualState === 'on' ? 'off' : 'on'
      this.$emit('change', nextState)
    },
  },
}
</script>

<style scoped>
/** Toggle */
.control.toggle .toggle-body {
  width: 100%;

  height: 4em;
  border-radius: 9999px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;

  background-color: #cccccc;
  background-color: var(--color-light2, #cccccc);
}

.control.toggle .toggle-fill {
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

.control.toggle .toggle-fill[state='on'] {
  width: 100%;
}

.control.toggle .toggle-knob {
  height: 85%;
  margin-left: 0.33em;
  margin-right: 0;
  aspect-ratio: 1;

  opacity: 0.8;

  transition-property: opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  border-radius: 50%;
  background-color: #666666;
  background-color: var(--color-dark, #666666);
}

.control.toggle .toggle-fill[state='on'] .toggle-knob {
  margin-left: auto;
  margin-right: 0.33em;
}

.control.toggle:not([disabled]) .toggle-knob:hover {
  opacity: 1;
}

.control.toggle .toggle-text {
  color: #f8f9fa;
  color: var(--widget-text-dark-color, #f8f9fa);
}
</style>
