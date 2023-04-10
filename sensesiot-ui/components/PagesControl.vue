<template>
  <div class="d-flex flex-row flex-wrap align-items-center" style="gap: 0.5em">
    <b-button
      variant="primary"
      title="First page"
      :disabled="value === 1"
      @click="setPage(1)"
    >
      <font-awesome-icon :icon="['fas', 'fa-angles-left']" />
    </b-button>
    <b-button
      variant="primary"
      title="Prev page"
      :disabled="value === 1"
      @click="setPage(value - 1)"
    >
      <font-awesome-icon :icon="['fas', 'fa-angle-left']" />
    </b-button>
    <div class="flex-fill text-center">Page: {{ value }} / {{ total }}</div>
    <b-button
      variant="primary"
      title="Next page"
      :disabled="value === total"
      @click="setPage(page + 1)"
    >
      <font-awesome-icon :icon="['fas', 'fa-angle-right']" />
    </b-button>
    <b-button
      variant="primary"
      title="Last page"
      :disabled="value === total"
      @click="setPage(total)"
    >
      <font-awesome-icon :icon="['fas', 'fa-angles-right']" />
    </b-button>
    <b-button @click="popupSetPage"> Go to... </b-button>
  </div>
</template>

<script>
export default {
  name: 'PageControl',
  props: {
    value: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {}
  },
  methods: {
    setPage(page) {
      this.$emit('change-page', page)
    },
    popupSetPage() {
      const input = prompt(`Enter page (1 - ${this.total})`)
      if (input) {
        const nthPage = parseInt(input, 10)
        if (Number.isInteger(nthPage) && nthPage > 0) {
          this.setPage(nthPage)
        }
      }
    }
  }
}
</script>
