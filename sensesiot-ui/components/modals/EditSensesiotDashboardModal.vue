<template>
  <b-modal
    :id="id"
    centered
    title="Edit Dashboard"
    no-stacking
    no-close-on-esc
    no-close-on-backdrop
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
  </b-modal>
</template>

<script>
import { sensesiotThemeOptions } from '~/utils/theme'
export default {
  name: 'EditSensesiotDashboardModal',
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
