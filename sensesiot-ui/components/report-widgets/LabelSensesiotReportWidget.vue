<template>
  <sensesiot-report-widget-container
    :widget="widget"
    :theme="theme"
    :gridstack="gridstack"
    :editing="editing"
    :min-w="1"
    :min-h="1"
    @edit="editWidget"
    @remove="removeWidget"
  >
    <vue-markdown class="p-2" :source="widget.content || ''"></vue-markdown>
  </sensesiot-report-widget-container>
</template>

<script>
import DefaultSensesiotReportWidget from './DefaultSensesiotReportWidget.vue'

export default {
  name: 'LabelSensesiotReportWidget',
  extends: DefaultSensesiotReportWidget,
}
</script>
