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
        <font-awesome-icon :icon="['fas', 'fa-history']" class="text-center" />
        <font-awesome-icon :icon="['fas', 'fa-bell']" class="text-center" />
        <b class="text-center">Message</b>

        <template
          v-if="
            widget.active &&
            Array.isArray(widget.logs) &&
            widget.logs.length > 0
          "
        >
          <template v-for="(log, i) of widget.logs">
            <div
              :key="`ts-${i}`"
              :class="{
                'text-danger': log.isError,
              }"
              class="text-nowrap"
            >
              {{ dateTimePretty(log.ts) }}
            </div>
            <font-awesome-icon
              v-if="log.isError"
              :key="`status-err-${i}`"
              v-b-tooltip.hover
              :icon="['fas', 'fa-circle-exclamation']"
              title="Error"
              class="text-danger text-center"
            /><font-awesome-icon
              v-else
              :key="`status-info-${i}`"
              v-b-tooltip.hover
              :icon="['fas', 'fa-info']"
              title="Info"
              class="text-center"
            />
            <div
              :key="`msg-${i}`"
              :class="{
                'text-danger': log.isError,
              }"
            >
              {{ log.message }}
            </div>
          </template>
        </template>
        <template v-else-if="widget.active">
          <div class="font-italic text-nowrap">
            {{ dateTimePretty(new Date()) }}
          </div>
          <font-awesome-icon
            v-b-tooltip.hover
            :icon="['fas', 'fa-warning']"
            title="Warning"
            class="text-center"
          />
          <div class="font-italic">No Logs</div> </template
        ><template v-else>
          <div class="font-italic text-nowrap">
            {{ dateTimePretty(new Date()) }}
          </div>
          <font-awesome-icon
            v-b-tooltip.hover
            :icon="['fas', 'fa-warning']"
            title="Warning"
            class="text-center"
          />
          <div class="font-italic">Widget Not Active</div>
        </template>
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
  methods: {
    dateTimePretty(time) {
      if (typeof time !== 'number' && !time) {
        return '-'
      }
      return dayjs(time).format('YY-MM-DD HH:mm')
    },
  },
}
</script>

<style scoped>
.condition-grid {
  display: grid;
  gap: 0.5em 1em;
  grid-template-columns: auto min-content auto;
}
</style>
