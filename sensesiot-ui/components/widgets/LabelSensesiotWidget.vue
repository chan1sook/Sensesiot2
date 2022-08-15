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
    <vue-markdown class="p-2" :source="widget.content || ''"></vue-markdown>
  </sensesiot-widget-container>
</template>

<script>
import DefaultSensesiotWidget from './DefaultSensesiotWidget.vue'

export default {
  name: 'LabelSensesiotWidget',
  extends: DefaultSensesiotWidget,
}
</script>
