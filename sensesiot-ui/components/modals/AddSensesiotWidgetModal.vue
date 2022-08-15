<template>
  <b-modal
    :id="id"
    centered
    title="Add Widget"
    no-stacking
    ok-only
    :ok-disabled="
      !selectedWidget || creditRemain(selectedWidget.name, creditInfo) < 0
    "
    @ok="onOk"
  >
    <b-row>
      <b-col class="d-flex flex-column" style="gap: 0.5em">
        <div v-for="widgetData of widgetsDescription" :key="widgetData.name">
          <b-button
            type="button"
            block
            :disabled="widgetData.enabled === false"
            @click="selectedWidgetName = widgetData.name"
          >
            <font-awesome-icon
              v-if="widgetData.icon"
              :icon="widgetData.icon"
              fixed-width
            />
            {{ widgetData.label }}
          </b-button>
        </div></b-col
      >
      <b-col cols="8">
        <template v-if="selectedWidget">
          <vue-markdown :source="selectedWidget.description"></vue-markdown>
          <div v-if="creditCostOf(selectedWidget.name) > 0" class="text-center">
            <b class="text-danger">Cost: </b>
            <span>
              {{ creditCostOf(selectedWidget.name) }}
            </span>
            <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
          </div>
          <div v-else class="text-center">
            <b>The widget is Free!</b>
          </div>

          <div
            v-if="creditRemain(selectedWidget.name, creditInfo) >= 0"
            class="text-center"
          >
            <b>Remain: </b>
            {{ creditRemain(selectedWidget.name, creditInfo) }}
            <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
          </div>
          <template v-else>
            <div class="text-center text-danger">
              <b>Not suffient Credits!</b>
            </div>
            <div class="text-center">
              <em>Your have: </em>
              {{ creditInfo.max - creditInfo.current }}
              <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
            </div>
          </template>
        </template>

        <template v-else> Select Widget </template>
      </b-col>
    </b-row>
  </b-modal>
</template>

<script>
import { widgetsDescription } from '~/utils/dashboard'

export default {
  name: 'AddSensesiotWidgetModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    creditCosts: {
      type: Object,
      default() {
        return {}
      },
    },
    creditInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      selectedWidgetName: null,
    }
  },
  computed: {
    widgetsDescription() {
      return widgetsDescription
    },
    selectedWidget() {
      if (this.selectedWidgetName) {
        const target = this.widgetsDescription.find(
          (ele) => ele.name === this.selectedWidgetName
        )
        return target || null
      }

      return null
    },
  },
  watch: {
    creditInfo() {
      this.$forceUpdate()
    },
  },
  methods: {
    creditCostOf(type) {
      return (
        this.creditCosts.widget[type] || this.creditCosts.widget.others || 0
      )
    },
    creditRemain(type, { predit, max } = {}) {
      const current = predit + this.creditCostOf(type)
      return max - current
    },
    onOk() {
      this.$emit('ok', this.selectedWidgetName)
    },
  },
}
</script>

<style></style>
