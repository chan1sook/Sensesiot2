<template>
  <b-modal
    :id="id"
    centered
    title="Create Dashboard"
    no-stacking
    :ok-disabled="!isDashboardDataValid"
    @ok="onOk"
  >
    <b-form-group label="Dashboard Name">
      <b-input v-model="modalDashboardData.name" type="text"></b-input>
    </b-form-group>
    <b-form-group label="Dashboard Access">
      <b-select v-model="modalDashboardData.publicAccess">
        <b-select-option :value="true">Public</b-select-option>
        <b-select-option :value="false">Private</b-select-option>
      </b-select>
    </b-form-group>
    <b-form-group label="Theme">
      <b-select
        v-model="modalDashboardData.theme"
        :options="sensesiotThemeOptions"
      >
      </b-select>
    </b-form-group>
    <div class="mt-2">
      <div v-if="creditInfo.predit > creditInfo.current" class="text-center">
        <b class="text-danger">Cost: </b>
        <span>
          {{ creditInfo.predit - creditInfo.current }}
        </span>
        <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
      </div>
      <div v-else class="text-center">
        <b>First Dashboard is Free!</b>
      </div>
      <div v-if="creditInfo.max >= creditInfo.predit" class="text-center">
        <b>Remain: </b>
        {{ creditInfo.max - creditInfo.predit }}
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
    </div>
  </b-modal>
</template>

<script>
import { sensesiotThemeOptions } from '~/utils/dashboard'

export default {
  name: 'CreateSensesiotDashboardModal',
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
  data() {
    return {
      modalDashboardData: {
        name: '',
        publicAccess: false,
        theme: 'default',
      },
    }
  },
  computed: {
    isDashboardDataValid() {
      return this.modalDashboardData.name !== ''
    },
    sensesiotThemeOptions() {
      return sensesiotThemeOptions
    },
  },
  watch: {
    dashboardData: {
      immediate: true,
      handler(value) {
        this.modalDashboardData = JSON.parse(JSON.stringify(value))
      },
    },
  },
  methods: {
    onOk() {
      this.$emit('ok', JSON.parse(JSON.stringify(this.modalDashboardData)))
    },
  },
}
</script>

<style></style>
