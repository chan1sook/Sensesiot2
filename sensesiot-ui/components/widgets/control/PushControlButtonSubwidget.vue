<template>
  <div class="control push" :class="{ disabled }">
    <div class="push-body" :style="controlBgStyle">
      <div class="push-fill" :style="controlFgStyle">
        <div
          class="push-knob"
          :style="controlKnobStyle"
          @click="$emit('click')"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { getColorIfValid } from '~/utils/gradient'
export default {
  name: 'PushControlButtonSubwidget',
  props: {
    widget: {
      type: Object,
      default() {
        return {}
      },
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
      const styles = {}

      if (!this.widget.useThemeBgColor) {
        styles.background = getColorIfValid(this.widget.bgColors)
      }

      return styles
    },
    controlKnobStyle() {
      const styles = {
        cursor: this.disabled ? 'default' : 'pointer',
      }

      if (!this.widget.useThemeKnobColor) {
        styles.background = getColorIfValid(this.widget.knobColors)
      }

      return styles
    },
  },
}
</script>

<style scoped>
/** Push */
.control.push .push-body {
  width: 100%;
  position: relative;

  aspect-ratio: 1;
  border-radius: 50%;

  background-color: #aaaaaa;
  background-color: var(--color-light, #aaaaaa);
}

.control.push .push-fill {
  width: 85%;
  position: absolute;
  top: 7.5%;
  left: 7.5%;

  aspect-ratio: 1;
  border-radius: 50%;

  background-color: #cccccc;
  background-color: var(--color-light2, #cccccc);
}

.control.push .push-knob {
  width: 100%;
  position: absolute;
  top: -3.5%;
  left: 0;
  opacity: 0.8;

  aspect-ratio: 1;
  border-radius: 50%;

  transition-property: top opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;

  background-color: #666666;
  background-color: var(--color-dark, #666666);
}

.control.push:not([disabled]) .push-knob:hover {
  opacity: 1;
}

.control.push:not([disabled]) .push-knob:active {
  top: 0%;
}
</style>
