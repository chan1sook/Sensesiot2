<template>
  <div>
    <div ref="blocklyDiv" class="blocklyDiv"></div>
  </div>
</template>

<script>
import Blockly from 'blockly'

export default {
  name: 'VueBlockly',
  props: {
    value: {
      type: Object,
      default() {
        return {}
      },
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
      workspace: null,
      saveEventsType: [
        Blockly.Events.BLOCK_CREATE,
        Blockly.Events.BLOCK_CHANGE,
        Blockly.Events.BLOCK_DELETE,
        Blockly.Events.BLOCK_MOVE,
      ],
    }
  },
  mounted() {
    this.workspace = Blockly.inject(this.$refs.blocklyDiv, this.$props.options)
    this.workspace.addChangeListener(Blockly.Events.disableOrphans)
    this.workspace.addChangeListener(this.autoSave)
    try {
      if (typeof this.value !== 'object') {
        throw new TypeError('Invalid Block Syntax')
      }
      Blockly.serialization.workspaces.load(this.value, this.workspace)
    } catch (error) {
      console.error(error)
      Blockly.serialization.workspaces.load(
        {
          blocks: { languageVersion: 0, blocks: [{ type: 'condition_event' }] },
        },
        this.workspace
      )
    }
    setTimeout(() => {
      Blockly.svgResize(this.workspace)
    }, 50)
  },
  methods: {
    autoSave(event) {
      if (this.saveEventsType.includes(event.type)) {
        const blockData = Blockly.serialization.workspaces.save(this.workspace)
        this.$emit('input', { ...blockData })
      }
    },
  },
}
</script>

<style scoped>
.blocklyDiv {
  height: 100%;
  width: 100%;
  text-align: left;
}
</style>

<style>
svg[display='none'] {
  display: none !important;
}

.blocklyDropDownDiv {
  z-index: 99999;
}

.blocklyDiv .blocklyTreeLabel {
  color: white;
}
</style>
