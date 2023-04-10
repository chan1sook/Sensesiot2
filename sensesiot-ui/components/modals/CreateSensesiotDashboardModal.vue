<template>
  <b-modal
    :id="id"
    centered
    title="Create Dashboard"
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
    <b-form-group label="Template">
      <b-select v-model="template">
        <b-form-select-option value="empty">Empty</b-form-select-option>
        <b-form-select-option value="exists">
          Public Dashboard Template
        </b-form-select-option>
      </b-select>
    </b-form-group>
    <b-form-group v-if="template === 'exists'" label="Template Dashboard From">
      <b-input
        v-model="templateFrom"
        type="text"
        placeholder="Dashboard Id"
        :state="templateChecked"
      ></b-input>
      <b-form-invalid-feedback>
        Dashboard not exists or not public
      </b-form-invalid-feedback>
    </b-form-group>
    <b-form-checkbox
      v-if="template === 'exists' && templateChecked"
      v-model="templateKeepDeviceSlot"
      :value="true"
      :uncheck-value="false"
      :disabled="!isSameUser"
    >
      Keep Device Slot Config
    </b-form-checkbox>
    <div class="mt-2">
      <div
        v-if="currentCreditInfo.predit > currentCreditInfo.current"
        class="text-center"
      >
        <b class="text-danger">Cost: </b>
        <span>
          {{ currentCreditInfo.predit - currentCreditInfo.current }}
        </span>
        <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
      </div>
      <div v-else class="text-center">
        <b>First Dashboard is Free!</b>
      </div>
      <div
        v-if="currentCreditInfo.max >= currentCreditInfo.predit"
        class="text-center"
      >
        <b>Remain: </b>
        {{ currentCreditInfo.max - currentCreditInfo.predit }}
        <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
      </div>
      <template v-else>
        <div class="text-center text-danger">
          <b>Not suffient Credits!</b>
        </div>
        <div class="text-center">
          <em>Your have: </em>
          {{ currentCreditInfo.max - currentCreditInfo.current }}
          <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
        </div>
      </template>
    </div>
  </b-modal>
</template>

<script>
import { sensesiotThemeOptions } from '~/utils/theme'
import { preditCredits, getCostableWidgets } from '~/utils/utils'

export default {
  name: 'CreateSensesiotDashboardModal',
  props: {
    id: {
      type: String,
      required: true
    },
    dashboardData: {
      type: Object,
      default() {
        return {}
      }
    },
    creditInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      modalDashboardData: {
        name: '',
        publicAccess: false,
        theme: 'default'
      },
      template: 'empty',
      templateFrom: '',
      templateKeepDeviceSlot: false,
      templateChecked: null,
      templateCreditInfo: null,
      templateDashboardData: null
    }
  },
  computed: {
    isDashboardDataValid() {
      return (
        this.modalDashboardData.name !== '' &&
        this.isTemplateValid &&
        this.currentCreditInfo.max >= this.currentCreditInfo.predit
      )
    },
    isTemplateValid() {
      return (
        this.template !== 'exists' ||
        (this.templateFrom !== '' && this.templateChecked)
      )
    },
    isSameUser() {
      return (
        this.$store.getters.role !== 'guest' &&
        this.templateDashboardData.uid === this.$store.state.authUser.uid
      )
    },
    sensesiotThemeOptions() {
      return sensesiotThemeOptions
    },
    currentCreditInfo() {
      if (this.template === 'exists' && this.templateChecked) {
        return this.templateCreditInfo
      }
      return this.creditInfo
    }
  },
  watch: {
    dashboardData: {
      immediate: true,
      handler(value) {
        this.modalDashboardData = JSON.parse(JSON.stringify(value))
        this.template = 'empty'
      }
    },
    template(value) {
      this.templateChecked = null
      this.templateFrom = ''
    },
    templateFrom(value) {
      this.templateChecked = null
      if (value) {
        this.checkTemplatePublic(value)
      }
    }
  },
  methods: {
    async checkTemplatePublic(id) {
      try {
        const { dashboard } = await this.$axios.$get(
          `/api/sensesiot/dashboard/${id}`
        )
        // check credits
        const costableWidgets = getCostableWidgets(dashboard.widgets)
        const widgetTypes = costableWidgets.reduce((prev, current) => {
          if (prev[current.type]) {
            prev[current.type] += 1
          } else {
            prev[current.type] = 1
          }
          return prev
        }, {})
        const { creditInfo } = await preditCredits(this.$axios, {
          dashboard: 1,
          widgets: widgetTypes
        })
        this.templateCreditInfo = creditInfo
        this.templateDashboardData = dashboard
        this.templateChecked = true
      } catch (err) {
        console.error(err)
        this.templateChecked = false
      }
    },
    onOk() {
      const data = JSON.parse(JSON.stringify(this.modalDashboardData))
      if (this.template === 'exists' && this.templateChecked) {
        data.widgets = JSON.parse(
          JSON.stringify(this.templateDashboardData.widgets)
        )
        if (!this.isSameUser || !this.templateKeepDeviceSlot) {
          for (const widget of data.widgets) {
            if (widget.dataSlot !== undefined) {
              widget.dataSlot = 1
            }
            if (widget.dataDevice !== undefined) {
              widget.dataDevice = ''
            }
            if (widget.controlSlot !== undefined) {
              widget.controlSlot = 1
            }
            if (widget.controlDevice !== undefined) {
              widget.controlDevice = ''
            }
          }
        }
      }
      this.$emit('ok', data)
    }
  }
}
</script>

<style></style>
