<template>
  <b-modal
    :id="id"
    centered
    title="Delete Dashboard"
    no-stacking
    ok-variant="danger"
    @ok="onOk"
  >
    <div class="mt-2">
      Do you need to delete Dashboard
      <i>{{ dashboardData.name || dashboardData._id }}</i>
    </div>

    <div class="mt-2">
      <div class="text-center">
        <b class="text-success">Claim: </b>
        <span>
          {{ creditInfo.current - creditInfo.predit }}
        </span>
        <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
      </div>
      <div class="text-center">
        <b>Remain: </b>
        {{ creditInfo.max - creditInfo.predit }}
        <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DeleteSensesiotDashboardModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    dashboardData: {
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
  methods: {
    onOk() {
      this.$emit('ok')
    },
  },
}
</script>

<style></style>
