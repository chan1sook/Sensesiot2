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
    <div class="p-2 d-flex flex-column" style="gap: 0.5em">
      <vue-markdown
        v-if="widget.title"
        inline
        :source="widget.title || 'Condition'"
        class="text-center font-weight-bold"
        style="font-size: 1.25em"
      ></vue-markdown>
      <div class="condition-grid">
        <font-awesome-icon :icon="['fas', 'fa-history']" />
        <div>{{ dateTimePretty(status.lastCheck) }}</div>
        <b>Status</b>
        <div :class="{ 'text-danger': isError, 'font-italic': isDisabled }">
          {{ status.status }}
        </div>
        <b>
          <template v-if="isError">Error</template>
          <template v-else>Message</template>
        </b>
        <div :class="{ 'text-danger': isError, 'font-italic': isDisabled }">
          {{ status.message }}
        </div>
      </div>
    </div>
  </sensesiot-widget-container>
</template>

<script>
import dayjs from 'dayjs'

import DefaultSensesiotWidget from './DefaultSensesiotWidget.vue'

export default {
  name: 'ConditionSensesiotWidget',
  extends: DefaultSensesiotWidget,
  props: {
    status: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    isDisabled() {
      return !this.status.active
    },
    isError() {
      return this.status.active && this.status.status !== 'OK'
    },
  },
  methods: {
    dateTimePretty(time) {
      if (typeof time !== 'number' && !time) {
        return '-'
      }
      return dayjs(time).format('D MMM YYYY HH:mm')
    },
    onChange() {
      this.$emit('toggle')
    },
  },
}
</script>

<style scoped>
.condition-grid {
  display: grid;
  gap: 0.5em;
  grid-template-columns: min-content auto;
}
</style>
