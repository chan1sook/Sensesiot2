<template>
  <sensesiot-base-container>
    <b-container class="mt-4 d-flex flex-column" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center">
          <font-awesome-icon :icon="['fas', 'fa-pencil']" fixed-width />
          Edit Report Template
        </h2>
        <b-form-group label="Report Name">
          <b-input v-model="editReportData.name"></b-input>
        </b-form-group>
        <b-form-group label="Report Title">
          <b-input v-model="editReportData.title"></b-input>
        </b-form-group>
        <b-form-group label="Report Access">
          <b-select v-model="editReportData.publicAccess">
            <b-select-option :value="true">Public</b-select-option>
            <b-select-option :value="false">Private</b-select-option>
          </b-select>
        </b-form-group>
        <b-form-group label="Theme">
          <b-select
            v-model="editReportData.theme"
            :options="sensesiotThemeOptions"
          >
          </b-select>
        </b-form-group>
        <div class="d-flex flex-row justify-center my-2 mt-4">
          <b-button
            class="mx-auto"
            variant="success"
            @click="showAddWidgetModal"
          >
            <font-awesome-icon :icon="['fas', 'fa-plus']" />
            Add Widget
          </b-button>
        </div>
        <div :class="[editReportData.theme]" :style="themeStyle">
          <report-gridstack-container
            style="margin-top: 3em"
            :widgets="editReportData.widgets"
            :theme="editReportData.theme"
            editing
            @change="onWidgetChange"
            @editWidget="onEditWidget"
            @removeWidget="onRemoveWidget"
          ></report-gridstack-container>
        </div>
        <div
          class="d-flex flex-row justify-self-center align-items-center my-2 mt-4"
        >
          <b-button class="mx-auto" variant="success" @click="editReport">
            <font-awesome-icon :icon="['fas', 'fa-save']" />
            Save
          </b-button>
          <b-button class="mx-auto" variant="secondary" @click="resetData">
            <font-awesome-icon :icon="['fas', 'fa-history']" />
            Reset
          </b-button>
          <b-button class="mx-auto" variant="danger" href="/sensesiot/report">
            <font-awesome-icon :icon="['fas', 'fa-times']" />
            Cancel
          </b-button>
        </div>
      </sensesiot-content-container>
    </b-container>
    <add-sensesiot-report-widget-modal
      id="modal-new-widget"
      :credit-info="creditInfo"
      :credit-costs="creditCosts"
      @ok="addWidget"
    >
    </add-sensesiot-report-widget-modal>
    <config-sensesiot-widget-modal
      id="modal-edit-widget"
      :widget="editWidgetData"
      :widget-params-fn="getConfigableReportWidgetParams"
      :devices="devices"
      @ok="applyEditWidget"
    >
    </config-sensesiot-widget-modal>
  </sensesiot-base-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

import AddSensesiotReportWidgetModal from '~/components/modals/AddSensesiotReportWidgetModal.vue'
import ConfigSensesiotWidgetModal from '~/components/modals/ConfigSensesiotWidgetModal.vue'

import { preditCredits } from '~/utils/utils'
import {
  getDefaultReportWidgetData,
  preditNextGridReportPosition,
  getConfigableReportWidgetParams,
} from '~/utils/report'
import { getThemeSetting, sensesiotThemeOptions } from '~/utils/theme'
export default {
  name: 'ReportEditPage',
  components: {
    AddSensesiotReportWidgetModal,
    ConfigSensesiotWidgetModal,
  },
  middleware: ['auth'],
  async asyncData({ $axios, params, error }) {
    try {
      const { report } = await $axios.$get(`/api/sensesiot/report/${params.id}`)

      return {
        report,
        editReportData: JSON.parse(JSON.stringify(report)),
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get report data",
      })
    }
  },
  data() {
    return {
      creditInfo: {},
      creditCosts: {},
      report: {},
      reportData: [],
      devices: [],
      editReportData: {},
      editWidgetData: {},
    }
  },
  computed: {
    sensesiotThemeOptions() {
      return sensesiotThemeOptions
    },
    reportTimeFrame() {
      return this.editReportData.timeframe || 'day'
    },
    themeStyle() {
      return getThemeSetting(this.editReportData.theme)
    },
  },
  mounted() {
    window.addEventListener('beforeunload', this.onBeforeUnload)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.onBeforeUnload)
  },
  methods: {
    getConfigableReportWidgetParams,
    preditCredits(additionList = {}) {
      return preditCredits(this.$axios, additionList)
    },
    async getDevices() {
      const { devices } = await this.$axios.$get('/api/sensesiot/devices')
      return devices
    },
    async showAddWidgetModal() {
      const widgetTypesDiff = this.report.widgets.reduce((prev, current) => {
        if (prev[current.type]) {
          prev[current.type] -= 1
        } else {
          prev[current.type] = -1
        }
        return prev
      }, {})

      this.editReportData.widgets.reduce((prev, current) => {
        if (prev[current.type]) {
          prev[current.type] += 1
        } else {
          prev[current.type] = 1
        }
        return prev
      }, widgetTypesDiff)

      const { costs, creditInfo } = await this.preditCredits({
        reportWidgets: widgetTypesDiff,
      })

      this.creditInfo = creditInfo
      this.creditCosts = costs
      this.$bvModal.show('modal-new-widget')
    },
    addWidget(type = 'default') {
      const { x, y } = preditNextGridReportPosition(this.editReportData.widgets)

      const newWidgetData = {
        _id: uuidv4(),
        type,
        x,
        y,
        w: 1,
        h: 1,
        ...getDefaultReportWidgetData(type),
      }

      this.editReportData.widgets.push(newWidgetData)
    },
    onWidgetChange(data) {
      this.editReportData.widgets = data
    },
    onEditWidget(id) {
      const targetWidget = this.editReportData.widgets.find(
        (ele) => ele._id === id
      )

      if (targetWidget) {
        this.showEditWidgetModal(targetWidget)
      }
    },
    async showEditWidgetModal(widget) {
      this.editWidgetData = JSON.parse(JSON.stringify(widget))
      this.devices = await this.getDevices()
      this.$bvModal.show('modal-edit-widget')
    },
    applyEditWidget(widgetData) {
      const index = this.editReportData.widgets.findIndex(
        (ele) => ele._id === widgetData._id
      )
      if (index !== -1) {
        this.editReportData.widgets.splice(index, 1, widgetData)
      }
    },
    onRemoveWidget(id) {
      const index = this.editReportData.widgets.findIndex(
        (ele) => ele._id === id
      )
      if (index !== -1) {
        this.editReportData.widgets.splice(index, 1)
      }
    },
    async editReport() {
      try {
        const reportId = this.editReportData._id
        const editData = {
          ...this.editReportData,
        }
        delete editData._id
        for (const widget of editData.widgets) {
          if (widget._id.startsWith('widget-')) {
            delete widget._id
          }
        }

        const { report: updatedReport } = await this.$axios.$post(
          `/api/sensesiot/report/edit/${reportId}`,
          editData
        )

        this.report = updatedReport
        this.editReportData = JSON.parse(JSON.stringify(updatedReport))

        this.$store.dispatch('getUserData')

        this.$router.push('/sensesiot/report')
      } catch (err) {
        let message = err.message
        if (err.response) {
          console.error(err.response.data)
          if (err.response.data && err.response.data.message) {
            message = err.response.data.message
          }
        } else {
          console.error(err)
        }

        this.$bvModal.msgBoxOk(message, {
          title: 'Error',
        })
      }
    },
    async resetData() {
      const msgBoxResult = await this.$bvModal.msgBoxConfirm(
        'Do you want to reset report data?',
        {
          title: 'Confirm',
          okVariant: 'danger',
          okTitle: 'Yes',
          cancelTitle: 'No',
          hideHeaderClose: false,
          centered: true,
        }
      )

      if (msgBoxResult === true) {
        this.editReportData = JSON.parse(JSON.stringify(this.report))
      }
    },
    onBeforeUnload(ev) {
      ev.preventDefault()
      return 'Are you sure you want to exit?'
    },
  },
}
</script>

<style scoped>
.report {
  background-color: #eeeeee;
  background-color: var(--dashboard-bg-color, #eeeeee);
}
</style>
