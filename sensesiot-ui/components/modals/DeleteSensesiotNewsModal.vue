<template>
  <b-modal
    :id="id"
    centered
    title="Delete News/Promotion"
    no-stacking
    ok-variant="danger"
    @ok="onOk"
  >
    <div class="mt-2">
      Do you need to delete News/Promotion
      <i>{{ news.name || news._id }}</i>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DeleteSensesiotNewsModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    news: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  methods: {
    onOk() {
      this.$emit('ok', this.news._id)
    },
  },
}
</script>

<style></style>
