<template>
  <input ref="color" class="jscolor-picker" />
</template>

<script>
import JSColor from '@eastdesire/jscolor'

export default {
  props: {
    value: {
      type: String,
      default: '#FFFFFF',
    },
    options: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      picker: null,
    }
  },
  watch: {
    value(value) {
      this.picker?.fromString(value)
    },
    options(value) {
      this.picker?.options(value)
    },
  },
  mounted() {
    this.picker = new JSColor(this.$refs.color, {
      ...this.options,
      onChange: this.onChange,
    })
    this.picker.fromString(this.value)
  },
  methods: {
    onChange() {
      this.$emit('input', this.picker?.toString())
    },
  },
}
</script>

<style scope>
input.jscolor-picker {
  width: 100%;
  border-radius: 4px;
  padding: 0.25em 0;
  border: 1px solid #ced4da;
}
</style>
