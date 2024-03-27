<template>
  <sensesiot-base-container>
    <div class="p-4 dashboard" :class="[theme, editMode ? 'editing' : '']" style="flex-grow: 1" :style="themeStyle">
      <b-button-toolbar class="position-fixed dashboard-toolbar-top">
        <b-input-group prepend="Dashboard" style="flex-grow: 1">
          <b-select v-model="selectedDashboardId" :options="dashboardOptions" :disabled="editMode">
            <b-form-select-option v-if="selectedDashboardId === null" :value="null" disabled>
              -- No Dashboard --
            </b-form-select-option>
          </b-select>

          <b-input-group-append>
            <b-button v-if="!editMode" variant="success" @click="showCreateDashboardModal">
              <font-awesome-icon :icon="['fas', 'plus']" fixed-width />

              <span class="d-none d-lg-inline">Create</span>
            </b-button>
            <b-button v-else variant="danger" @click="showDeleteDashboardModal">
              <font-awesome-icon :icon="['fas', 'trash']" fixed-width />
              <span class="d-none d-lg-inline">Delete</span>
            </b-button>
          </b-input-group-append>
        </b-input-group>

        <b-button v-if="!editMode && selectedDashboardId !== null" variant="primary" @click="toEditMode">
          <font-awesome-icon :icon="['fas', 'pencil']" fixed-width />

          <span class="d-none d-lg-inline">Edit</span>
        </b-button>

        <template v-else-if="editMode">
          <b-button-group>
            <b-button variant="warning" @click="showEditDashboardModal">
              <font-awesome-icon :icon="['fas', 'cog']" fixed-width />
              <span class="d-none d-lg-inline">Setting</span>
            </b-button>
            <b-button variant="success" @click="editDashboard">
              <font-awesome-icon :icon="['fas', 'save']" fixed-width />
              <span class="d-none d-lg-inline">Save</span>
            </b-button>
            <b-button variant="secondary" @click="confirmCancel">
              <font-awesome-icon :icon="['fas', 'history']" fixed-width />
              <span class="d-none d-lg-inline">Cancel</span>
            </b-button>
          </b-button-group>

          <b-button variant="primary" @click="showAddWidgetModal">
            <font-awesome-icon :icon="['fas', 'plus']" fixed-width />
            New Widget
          </b-button>
        </template>

        <b-button v-if="!editMode" @click="showShareLinkDashboardModal">
          <font-awesome-icon :icon="['fas', 'share']" fixed-width />
          <span class="d-none d-lg-inline"> Share</span>
        </b-button>
      </b-button-toolbar>
      <dashboard-gridstack-container style="margin-top: 3em" :widgets="editMode
      ? editDashboardData.widgets
      : selectedDashboard
        ? selectedDashboard.widgets
        : []
      " :theme="theme" :editing="editMode" :data-function="getWidgetData" @pushControl="onPushControl"
        @change="onWidgetChange" @editWidget="onEditWidget" @removeWidget="onRemoveWidget"
        @exportData="onExportData"></dashboard-gridstack-container>
    </div>
    <create-sensesiot-dashboard-modal id="modal-create-dashboard" :dashboard-data="modalDashboardData"
      :credit-info="creditInfo" @ok="createDashboard">
    </create-sensesiot-dashboard-modal>
    <edit-sensesiot-dashboard-modal id="modal-edit-dashboard" :dashboard-data="modalDashboardData"
      @ok="applyToEditDashboardData">
    </edit-sensesiot-dashboard-modal>
    <delete-sensesiot-dashboard-modal id="modal-delete-dashboard" :dashboard-data="modalDashboardData"
      :credit-info="creditInfo" @ok="deleteDashboard">
    </delete-sensesiot-dashboard-modal>
    <share-link-sensesiot-dashboard-modal id="modal-share-link-dashboard" :dashboard-data="modalDashboardData">
    </share-link-sensesiot-dashboard-modal>
    <add-sensesiot-widget-modal id="modal-new-widget" :credit-info="creditInfo" :credit-costs="creditCosts"
      @ok="addWidget">
    </add-sensesiot-widget-modal>
    <config-sensesiot-widget-modal id="modal-edit-widget" :widget="editWidgetData" :devices="devices"
      @ok="applyEditWidget">
    </config-sensesiot-widget-modal>
  </sensesiot-base-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

import CreateSensesiotDashboardModal from '~/components/modals/CreateSensesiotDashboardModal.vue'
import EditSensesiotDashboardModal from '~/components/modals/EditSensesiotDashboardModal.vue'
import DeleteSensesiotDashboardModal from '~/components/modals/DeleteSensesiotDashboardModal.vue'
import ShareLinkSensesiotDashboardModal from '~/components/modals/ShareLinkSensesiotDashboardModal.vue'
import AddSensesiotWidgetModal from '~/components/modals/AddSensesiotWidgetModal.vue'
import ConfigSensesiotWidgetModal from '~/components/modals/ConfigSensesiotWidgetModal.vue'

import SocketIOMixin from '~/mixins/socketio.js'

import {
  getDefaultDashboardData,
  preditNextGridPosition,
  getDefaultWidgetData,
  getWidgetData,
  onSioMqtt,
  onUpdateWidget
} from '~/utils/dashboard'
import { getThemeSetting } from '~/utils/theme'
import { preditCredits, getCostableWidgets } from '~/utils/utils'

export default {
  name: 'DashboardPage',
  components: {
    CreateSensesiotDashboardModal,
    EditSensesiotDashboardModal,
    DeleteSensesiotDashboardModal,
    ShareLinkSensesiotDashboardModal,
    AddSensesiotWidgetModal,
    ConfigSensesiotWidgetModal
  },
  mixins: [SocketIOMixin],
  middleware: ['auth'],
  async asyncData({ $axios, store, error }) {
    try {
      const { dashboards } = await $axios.$get('/api/sensesiot/dashboards')

      const preferences = store.state.authUser.sensesiot.preferences
      let selectedDashboard = preferences
        ? dashboards.find((ele) => ele._id === preferences.lastOpenedDashboard)
        : null

      if (!selectedDashboard && dashboards.length > 0) {
        selectedDashboard = dashboards[0]
      }

      for (const dashboard of dashboards) {
        for (const widget of dashboard.widgets) {
          const defaultWidgetData = getDefaultWidgetData(widget.type)
          Object.assign(defaultWidgetData, widget)
          Object.assign(widget, defaultWidgetData)
        }
      }

      return {
        selectedDashboardId: selectedDashboard ? selectedDashboard._id : null,
        dashboards
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get dashboard data"
      })
    }
  },
  data() {
    return {
      selectedDashboardId: null,
      dashboards: [],
      dashboardData: [],
      dashboardDataId: 0,
      devices: [],
      editMode: false,
      creditInfo: {},
      creditCosts: {},
      editDashboardData: {},
      editWidgetData: {},
      modalDashboardData: {}
    }
  },
  computed: {
    dashboardOptions() {
      return this.dashboards.map((dashboard) => ({
        text: dashboard.name || dashboard._id,
        value: dashboard._id
      }))
    },
    selectedDashboard() {
      if (!this.selectedDashboardId) {
        return null
      }
      const dashboardInfo = this.dashboards.find(
        (ele) => ele._id === this.selectedDashboardId
      )
      return dashboardInfo || null
    },
    theme() {
      let target = this.selectedDashboard
      if (this.editMode) {
        target = this.editDashboardData
      }

      if (!target) {
        return 'default'
      }
      return target.theme || 'default'
    },
    themeStyle() {
      return getThemeSetting(this.theme)
    },
    isModalDashboardDataValid() {
      return this.modalDashboardData.name !== ''
    },
    isEditDashboardDataValid() {
      return this.editDashboardData.name !== ''
    }
  },
  watch: {
    selectedDashboardId(value) {
      this.$store.dispatch('updateSensesiotPreferences', {
        lastOpenedDashboard: value
      })

      this.refreshDashboardData()
    }
  },
  mounted() {
    window.addEventListener('beforeunload', this.onBeforeUnload)
    this.refreshDashboardData()
    this.socketio.on('mqtt', this.onSioMqtt)
    this.socketio.on('updateWidget', this.onUpdateWidget)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.onBeforeUnload)
    this.socketio.off('mqtt')
    this.socketio.off('updateWidget')
  },
  methods: {
    onSioMqtt(data) {
      onSioMqtt(this.dashboardData, data)
    },
    onUpdateWidget(data) {
      onUpdateWidget(this.dashboards, data)

      this.$forceUpdate()
    },
    async refreshDashboardData() {
      if (this.selectedDashboardId) {
        this.dashboardDataId += 1
        const fetchId = this.dashboardDataId

        const dashboardid = this.selectedDashboardId
        const { dashboardData } = await this.$axios.$get(
          `/api/sensesiot/dashboard-data/${dashboardid}`
        )

        if (
          dashboardid === this.selectedDashboardId &&
          fetchId === this.dashboardDataId
        ) {
          this.dashboardData = dashboardData
        }
      }
    },
    getWidgetData(widget) {
      return getWidgetData(this.dashboardData, widget)
    },
    onPushControl(metadata) {
      this.socketio.emit('controlDevice', {
        deviceKey: metadata.controlDevice,
        slot: metadata.controlSlot,
        data: metadata.state
      })
    },
    async getDevices() {
      const { devices } = await this.$axios.$get('/api/sensesiot/devices')
      return devices
    },
    preditCredits(additionList = {}) {
      return preditCredits(this.$axios, additionList)
    },
    async showCreateDashboardModal() {
      const { creditInfo } = await this.preditCredits({ dashboard: 1 })
      this.creditInfo = creditInfo
      this.modalDashboardData = getDefaultDashboardData()
      this.$bvModal.show('modal-create-dashboard')
    },
    async createDashboard(dashboardData) {
      if (this.editMode) {
        return
      }

      try {
        const { dashboard: newDashboard } = await this.$axios.$post(
          '/api/sensesiot/dashboard/add',
          dashboardData
        )
        this.dashboards.push(newDashboard)
        if (this.selectedDashboardId === null) {
          this.selectedDashboardId = newDashboard._id
        }
        this.$store.dispatch('getUserData')
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
          title: 'Error'
        })
      }
    },
    toEditMode() {
      this.editMode = true

      this.editDashboardData = {
        ...getDefaultDashboardData(),
        ...JSON.parse(JSON.stringify(this.selectedDashboard))
      }
    },
    showEditDashboardModal() {
      this.modalDashboardData = {
        ...getDefaultDashboardData(),
        ...JSON.parse(JSON.stringify(this.editDashboardData))
      }
      this.$bvModal.show('modal-edit-dashboard')
    },
    applyToEditDashboardData(dashboardData) {
      this.editDashboardData = {
        ...this.editDashboardData,
        ...JSON.parse(JSON.stringify(dashboardData))
      }
    },
    async showEditWidgetModal(widget) {
      this.editWidgetData = JSON.parse(JSON.stringify(widget))
      this.devices = await this.getDevices()
      this.$bvModal.show('modal-edit-widget')
    },
    applyEditWidget(widgetData) {
      const index = this.editDashboardData.widgets.findIndex(
        (ele) => ele._id === widgetData._id
      )
      if (index !== -1) {
        this.editDashboardData.widgets.splice(index, 1, widgetData)
      }
    },
    onWidgetChange(data) {
      this.editDashboardData.widgets = data
    },
    onEditWidget(id) {
      const targetWidget = this.editDashboardData.widgets.find(
        (ele) => ele._id === id
      )

      if (targetWidget) {
        this.showEditWidgetModal(targetWidget)
      }
    },
    onRemoveWidget(id) {
      const index = this.editDashboardData.widgets.findIndex(
        (ele) => ele._id === id
      )
      if (index !== -1) {
        this.editDashboardData.widgets.splice(index, 1)
      }
    },
    onExportData(exportParams) {
      const url = `/api/sensesiot/dashboard-export/${this.selectedDashboardId}/${exportParams._id}/${exportParams.type}`
      const link = window.document.createElement("a");
      window.document.body.append(link);
      link.href = url;
      link.download = true;
      link.click();
      link.remove();
    },
    async showAddWidgetModal() {
      const selectedCostableWidgets = getCostableWidgets(
        this.selectedDashboard.widgets
      )
      const widgetTypesDiff = selectedCostableWidgets.reduce(
        (prev, current) => {
          if (prev[current.type]) {
            prev[current.type] -= 1
          } else {
            prev[current.type] = -1
          }
          return prev
        },
        {}
      )

      const editedCostableWidgets = getCostableWidgets(
        this.editDashboardData.widgets
      )
      editedCostableWidgets.reduce((prev, current) => {
        if (prev[current.type]) {
          prev[current.type] += 1
        } else {
          prev[current.type] = 1
        }
        return prev
      }, widgetTypesDiff)

      const { costs, creditInfo } = await this.preditCredits({
        widgets: widgetTypesDiff
      })

      this.creditInfo = creditInfo
      this.creditCosts = costs
      this.$bvModal.show('modal-new-widget')
    },
    addWidget(type = 'default') {
      const { x, y } = preditNextGridPosition(this.editDashboardData.widgets)
      const newWidgetData = {
        _id: uuidv4(),
        type,
        x,
        y,
        w: 1,
        h: 1,
        ...getDefaultWidgetData(type)
      }

      this.editDashboardData.widgets.push(newWidgetData)
    },
    async editDashboard() {
      if (
        !this.editMode ||
        !this.isEditDashboardDataValid ||
        !this.editDashboardData._id
      ) {
        return
      }

      try {
        const dashboardId = this.editDashboardData._id
        const editData = {
          ...this.editDashboardData
        }
        delete editData._id
        for (const widget of editData.widgets) {
          if (widget._id.startsWith('widget-')) {
            delete widget._id
          }
        }

        const { dashboard: updatedDashboard } = await this.$axios.$post(
          `/api/sensesiot/dashboard/edit/${dashboardId}`,
          editData
        )

        const oldDashboardIndex = this.dashboards.findIndex(
          (ele) => ele._id === dashboardId
        )
        if (oldDashboardIndex !== -1) {
          this.dashboards.splice(oldDashboardIndex, 1, updatedDashboard)
        }
        this.editMode = false

        this.$store.dispatch('getUserData')

        this.refreshDashboardData()
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
          title: 'Error'
        })
      }
    },
    async showDeleteDashboardModal() {
      const costableWidgets = getCostableWidgets(this.selectedDashboard.widgets)
      const widgetTypes = costableWidgets.reduce((prev, current) => {
        if (prev[current.type]) {
          prev[current.type] -= 1
        } else {
          prev[current.type] = -1
        }
        return prev
      }, {})

      const { creditInfo } = await this.preditCredits({
        widgets: widgetTypes,
        dashboard: -1
      })
      this.creditInfo = creditInfo
      this.$bvModal.show('modal-delete-dashboard')
    },
    async deleteDashboard() {
      if (!this.editMode || !this.editDashboardData._id) {
        return
      }

      try {
        const dashboardId = this.editDashboardData._id

        await this.$axios.$post(
          `/api/sensesiot/dashboard/delete/${dashboardId}`
        )

        const oldDashboardIndex = this.dashboards.findIndex(
          (ele) => ele._id === dashboardId
        )
        if (oldDashboardIndex !== -1) {
          this.dashboards.splice(oldDashboardIndex, 1)
        }

        const selectedDashboard =
          oldDashboardIndex > 0
            ? this.dashboards[oldDashboardIndex - 1]
            : this.dashboards[0]
        this.selectedDashboardId = selectedDashboard
          ? selectedDashboard._id
          : null

        this.editMode = false

        this.$store.dispatch('getUserData')
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
          title: 'Error'
        })
      }
    },
    showShareLinkDashboardModal() {
      this.modalDashboardData = {
        ...getDefaultDashboardData(),
        ...JSON.parse(JSON.stringify(this.selectedDashboard))
      }
      this.$bvModal.show('modal-share-link-dashboard')
    },
    async confirmCancel() {
      const msgBoxResult = await this.$bvModal.msgBoxConfirm(
        'Do you want to cancel editing?',
        {
          title: 'Confirm',
          okVariant: 'danger',
          okTitle: 'Yes',
          cancelTitle: 'No',
          hideHeaderClose: false,
          centered: true
        }
      )

      if (msgBoxResult === true) {
        this.editMode = false
      }
    },
    onBeforeUnload(ev) {
      if (this.editMode) {
        ev.preventDefault()
        return 'Are you sure you want to exit?'
      }
    }
  }
}
</script>

<style scoped>
.dashboard-toolbar-top {
  left: 1em;
  right: 1em;
  gap: 0.5em;
  z-index: 100;
}

.editing {
  background-image: repeating-linear-gradient(-45deg,
      transparent,
      transparent 12px,
      rgba(128, 128, 128, 0.3) 12px,
      rgba(128, 128, 128, 0.3) 24px);
  background-attachment: fixed;
}

.dashboard {
  background-color: #eeeeee;
  background-color: var(--dashboard-bg-color, #eeeeee);
}
</style>
