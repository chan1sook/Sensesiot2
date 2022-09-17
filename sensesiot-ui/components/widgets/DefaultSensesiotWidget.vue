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
  </sensesiot-widget-container>
</template>

<script>
import SensesiotWidgetContainer from './SensesiotWidgetContainer.vue'

export default {
  name: 'DefaultSensesiotWidget',
  components: {
    SensesiotWidgetContainer,
  },
  props: {
    widget: {
      type: Object,
      default: () => {
        return {
          _id: 'widget',
          type: '',
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        }
      },
    },
    theme: {
      type: String,
      default: 'default',
    },
    gridstack: {
      type: Object,
      default: () => {
        return {}
      },
    },
    editing: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    editWidget(value) {
      this.$emit('edit', value)
    },
    removeWidget(value) {
      this.$emit('remove', value)
    },
  },
}
</script>
