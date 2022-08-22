<template>
  <b-modal
    :id="id"
    centered
    size="xl"
    title="Edit Widget"
    no-stacking
    no-enforce-focus
    no-close-on-esc
    no-close-on-backdrop
    scrollable
    @ok="onOk"
  >
    <b-form-group
      v-for="(param, i) of widgetParams"
      v-show="isShowParam(param)"
      :key="i"
      :label="param.label || param.field"
      label-class="font-weight-bold"
    >
      <template v-if="param.description" #description>
        <vue-markdown :source="param.description"></vue-markdown>
      </template>
      <b-input
        v-if="param.type === 'text'"
        v-model="widgetData[param.field]"
        :type="param.type"
        :required="param.required"
      ></b-input>
      <b-input
        v-else-if="param.type === 'number'"
        v-model="widgetData[param.field]"
        :type="param.type"
        :required="param.required"
      ></b-input>
      <b-textarea
        v-else-if="param.type === 'textarea'"
        v-model="widgetData[param.field]"
        :rows="param.rows"
        :required="param.required"
      ></b-textarea>
      <b-select
        v-else-if="param.type === 'select'"
        v-model="widgetData[param.field]"
        :options="param.options"
        :required="param.required"
      >
      </b-select>
      <js-color
        v-else-if="param.type === 'color'"
        v-model="widgetData[param.field]"
      ></js-color>
      <gradient-picker
        v-else-if="param.type === 'gradient'"
        v-model="widgetData[param.field]"
      ></gradient-picker>
      <b-form-checkbox
        v-else-if="param.type === 'checkbox'"
        v-model="widgetData[param.field]"
        :value="true"
        :unchecked-value="false"
      >
        {{ param.choiceLabel || param.label || param.field }}
      </b-form-checkbox>
      <vue-blockly
        v-else-if="param.type === 'blockly'"
        v-model="widgetData[param.field]"
        :options="param.options"
        style="height: 400px"
      >
      </vue-blockly>
      <div v-else>
        Unknown for config parameter <b>{{ param.field }}</b> with type
        <b>{{ param.type }}</b>
      </div>
    </b-form-group>
    <div v-if="widgetParams.length === 0">
      No config for Widget type <b>{{ widget.type }}</b>
    </div>
  </b-modal>
</template>

<script>
import { getConfigableWidgetParams } from '~/utils/dashboard'

export default {
  name: 'ConfigSensesiotWidgetModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    widget: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      widgetData: {
        type: '',
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      },
    }
  },
  computed: {
    widgetParams() {
      return getConfigableWidgetParams(this.widget.type)
    },
  },
  watch: {
    widget: {
      immediate: true,
      handler(value) {
        this.widgetData = JSON.parse(JSON.stringify(value))
      },
    },
  },
  methods: {
    isShowParam(param) {
      if (!param.hideIfFieldTrue) {
        return true
      }

      const hideIfFieldTrue = Boolean(this.widgetData[param.hideIfFieldTrue])
      return !hideIfFieldTrue
    },
    onOk() {
      this.$emit('ok', JSON.parse(JSON.stringify(this.widgetData)))
    },
  },
}
</script>
