<template>
  <sensesiot-widget-container
    :widget="widget"
    :theme="theme"
    :gridstack="gridstack"
    :editing="editing"
    :min-w="2"
    :min-h="1"
    @edit="editWidget"
    @remove="removeWidget"
  >
    <div
      class="p-2 d-flex flex-column"
      style="gap: 0.5em; position: absolute; height: 100%; width: 100%"
    >
      <vue-markdown
        v-if="widget.title"
        inline
        :source="widget.title || 'Control'"
        class="text-center font-weight-bold"
        style="font-size: 1.25em"
      ></vue-markdown>
      <div
        ref="baseContainer"
        class="d-flex"
        style="flex-grow: 1; min-height: 100px"
      >
        <push-control-button-subwidget
          v-if="controlType === 'push'"
          ref="controlContainer"
          class="m-auto"
          :widget="widget"
          :style="controlBaseStyle"
          :disabled="editing || noControl"
          @click="onClick"
        >
        </push-control-button-subwidget>
        <range-control-subwidget
          v-else-if="controlType === 'range'"
          ref="controlContainer"
          class="m-auto"
          :widget="widget"
          :state="state"
          :style="controlBaseStyle"
          :disabled="editing || noControl"
          @change="onChange"
        ></range-control-subwidget>
        <toggle-control-button-subwidget
          v-else
          ref="controlContainer"
          class="m-auto"
          :widget="widget"
          :state="state"
          :style="controlBaseStyle"
          :disabled="editing || noControl"
          @change="onChange"
        ></toggle-control-button-subwidget>
      </div>
    </div>
  </sensesiot-widget-container>
</template>

<script>
import DefaultSensesiotWidget from './DefaultSensesiotWidget.vue'
import PushControlButtonSubwidget from './control/PushControlButtonSubwidget.vue'
import RangeControlSubwidget from './control/RangeControlSubwidget.vue'
import ToggleControlButtonSubwidget from './control/ToggleControlButtonSubwidget.vue'

export default {
  name: 'ControlSensesiotWidget',
  components: {
    PushControlButtonSubwidget,
    RangeControlSubwidget,
    ToggleControlButtonSubwidget,
  },
  extends: DefaultSensesiotWidget,
  props: {
    state: {
      type: String,
      default() {
        return 'off'
      },
    },
    noControl: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      controlMaxWidth: 200,
    }
  },
  computed: {
    controlBaseStyle() {
      return {
        maxWidth: `${this.controlMaxWidth}px`,
      }
    },
    controlType() {
      return this.widget.controlType || 'toggle'
    },
  },
  mounted() {
    this.resizeControl()
  },
  methods: {
    onClick() {
      if (!this.editing && !this.noControl) {
        this.$emit('control', {
          id: this.widget._id,
          controlDevice: this.widget.controlDevice,
          controlSlot: this.widget.controlSlot,
          state: '',
        })
      }
    },
    onChange(value) {
      if (!this.editing && !this.noControl) {
        this.$emit('control', {
          id: this.widget._id,
          controlDevice: this.widget.controlDevice,
          controlSlot: this.widget.controlSlot,
          state: value,
        })
      }
    },
    resizeControl() {
      if (!this.$refs.controlContainer) {
        return
      }

      const wTarget = this.$refs.baseContainer.clientWidth
      const hTarget = this.$refs.baseContainer.clientHeight
      const rTarget = wTarget / hTarget

      const wSource = this.$refs.controlContainer.$el.clientWidth
      const hSource = this.$refs.controlContainer.$el.clientHeight
      const rSource = wSource / hSource

      if (rTarget > rSource) {
        // constarin height
        this.controlMaxWidth = rSource * hTarget
      } else {
        // constarin width
        this.controlMaxWidth = wTarget
      }
    },
    onResize() {
      this.resizeControl()
    },
  },
}
</script>

<style scoped>
.control {
  width: 100%;
}
</style>
