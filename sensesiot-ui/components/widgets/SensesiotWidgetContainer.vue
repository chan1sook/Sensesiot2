<template>
  <div
    ref="widget"
    class="grid-stack-item grid-stack-item-content pr-2 pb-2"
    v-bind="gridStackAttributes"
    @mouseover="show = true"
    @mouseout="show = false"
    @resize="onResize"
  >
    <div
      class="widget shadow-2 overflow-y-auto position-relative"
      :class="[theme]"
      style="height: 100%"
    >
      <vue-scroll>
        <slot>
          <div class="p-2"><b>Widget Data:</b> {{ widget }}</div>
        </slot>
      </vue-scroll>
      <widget-toolbar
        v-if="editing"
        class="toolbar-bottom"
        :locked="locked"
        @config="editWidget"
        @remove="removeWidget"
        @lock="locked = !locked"
      ></widget-toolbar>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SensesiotWidgetContainer',
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
        return {
          lastest: [],
        }
      },
    },
    editing: {
      type: Boolean,
      default: false,
    },
    minW: {
      type: Number,
      default: 1,
    },
    minH: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      show: false,
      locked: false,
    }
  },
  computed: {
    gridStackAttributes() {
      console.log(!this.editing || this.locked)
      return {
        id: `gs-widget-${this.widget._id}`,
        'gs-id': `gs-widget-${this.widget._id}`,
        'gs-x': this.widget.x || 0,
        'gs-y': this.widget.y || 0,
        'gs-w': this.widget.w || this.minW,
        'gs-h': this.widget.h || this.minH,
        'gs-min-w': this.minW,
        'gs-min-h': this.minH,
        'gs-no-resize': !this.editing || this.locked,
        'gs-no-move': !this.editing || this.locked,
        'gs-locked': this.locked,
      }
    },
  },
  watch: {
    widget() {
      if (this.$refs.widget && this.gridstack) {
        this.gridstack.update(this.$refs.widget, {
          id: `gs-widget-${this.widget._id}`,
          x: this.widget.x || 0,
          y: this.widget.y || 0,
          w: this.widget.w || this.minW,
          h: this.widget.h || this.minH,
        })
      }
    },
    editing() {
      this.setNoMoveResize()
    },
    locked() {
      this.setNoMoveResize()
    },
  },
  mounted() {
    if (this.$refs.widget && this.gridstack) {
      this.gridstack.makeWidget(this.$refs.widget)
    }
  },
  beforeDestroy() {
    if (this.$refs.widget && this.gridstack) {
      this.gridstack.removeWidget(this.$refs.widget)
    }
  },
  methods: {
    editWidget() {
      this.$emit('edit', this.widget._id)
    },
    removeWidget() {
      this.$emit('remove', this.widget._id)
    },
    setNoMoveResize() {
      if (this.$refs.widget && this.gridstack) {
        this.gridstack.update(this.$refs.widget, {
          noResize: !this.editing || this.locked,
          noMove: !this.editing || this.locked,
          locked: this.locked,
        })
      }
    },
    onResize(ev) {
      console.log(ev)
    },
  },
}
</script>

<style scoped>
/* Theme color Defined */
.widget {
  color: #212529;
  color: var(--widget-text-color, #212529);
  border: 1px solid #cccccc;
  border: 1px solid var(--widget-border-color, #cccccc);
  background-color: #eeeeee;
  background-color: var(--widget-bg-color, #eeeeee);
}

.widget > .toolbar-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
}
</style>
