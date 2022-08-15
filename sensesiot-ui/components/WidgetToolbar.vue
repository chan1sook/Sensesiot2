<template>
  <div class="widget-toolbar p-1">
    <font-awesome-icon
      v-if="!nonConfigable"
      :icon="['fas', 'cog']"
      fixed-width
      @click="$emit('config')"
    />
    <font-awesome-icon
      :icon="['fas', 'trash']"
      fixed-width
      @click="$emit('remove')"
    />
    <font-awesome-icon
      v-if="!unlockable"
      :icon="['fas', locked ? 'lock' : 'lock-open']"
      fixed-width
      @click="$emit('lock', !locked)"
    />
  </div>
</template>

<script>
export default {
  name: 'WidgetToobar',
  props: {
    nonConfigable: {
      type: Boolean,
      default: false,
    },
    unlockable: {
      type: Boolean,
      default: false,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped>
.widget-toolbar {
  font-size: 0.8em;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
  color: gray;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}
.widget-toolbar > * {
  cursor: pointer;
}
.widget-toolbar > *:hover {
  color: black;
}
</style>
