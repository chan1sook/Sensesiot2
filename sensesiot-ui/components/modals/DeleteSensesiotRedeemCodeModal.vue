<template>
  <b-modal
    :id="id"
    centered
    title="Delete Redeem Code"
    no-stacking
    ok-variant="danger"
    @ok="onOk"
  >
    <div class="mt-2">
      Do you need to delete Redeem Code
      <i>{{ redeemCode.name || redeemCode._id }}</i>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DeleteSensesiotRedeemCodeModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    redeemCode: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  methods: {
    onOk() {
      this.$emit('ok', this.redeemCode._id)
    },
  },
}
</script>

<style></style>
