<template>
  <div>
    <div class="gradient-bar" :style="graidentBarStyle"></div>
    <vue-slider
      v-model="stops"
      :min="0"
      :max="100"
      :marks="stops"
      class="mb-4"
      @input="onChange"
    >
    </vue-slider>
    <js-color
      v-for="i of stops.length"
      :key="i"
      v-model="colors[i - 1]"
      @input="onChange"
    ></js-color>
    <div class="my-2 d-flex flex-row">
      <b-button
        type="button"
        size="sm"
        :disabled="stops.length <= 2"
        @click="removeStop"
      >
        <font-awesome-icon :icon="['fas', 'fa-minus']"></font-awesome-icon>
      </b-button>
      <b-button type="button" size="sm" class="ml-auto" @click="addStop">
        <font-awesome-icon :icon="['fas', 'fa-plus']"></font-awesome-icon>
      </b-button>
    </div>
  </div>
</template>

<script>
import chroma from 'chroma-js'
import { generateGradientObject, toGradientColorCss } from '~/utils/gradient'

export default {
  name: 'GardientPicker',
  props: {
    value: {
      type: Object,
      default() {
        return generateGradientObject()
      },
    },
  },
  data() {
    return {
      stops: [0, 100],
      colors: ['#000000', '#FFFFFF'],
    }
  },
  computed: {
    graidentBarStyle() {
      return {
        background: toGradientColorCss({
          type: 'linear',
          colors: this.colors,
          stops: this.stops,
        }),
      }
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.stops = value.stops || [0, 100]
        this.colors = value.colors || ['#000000', '#FFFFFF']
      },
    },
  },
  methods: {
    addStop() {
      const lastestStop = this.stops[this.stops.length - 2]
      const lastestStop2 = this.stops[this.stops.length - 1]
      const lastStop = Math.floor((lastestStop2 + lastestStop) / 2)

      if (lastStop !== lastestStop || lastStop !== lastestStop2) {
        const targetIndex = this.stops.findIndex((stop) => lastStop < stop)
        this.stops.splice(targetIndex, 0, lastStop)
        const chromaScale = chroma.scale(this.colors).domain([0, 100])
        this.colors.splice(targetIndex, 0, chromaScale(lastStop).hex())
        this.onChange()
      }
    },
    removeStop() {
      if (this.stops.length <= 2) {
        return
      }
      this.stops.pop()
      this.colors.pop()
      this.onChange()
    },
    onChange() {
      this.$emit('input', {
        type: 'linear',
        deg: 0,
        pivot: [0, 0],
        colors: JSON.parse(JSON.stringify(this.colors)),
        stops: JSON.parse(JSON.stringify(this.stops)),
      })
    },
  },
}
</script>

<style scoped>
.gradient-bar {
  border: 1px solid #ced4da;
  height: 1em;
  border-radius: 0.5em;
}
</style>
