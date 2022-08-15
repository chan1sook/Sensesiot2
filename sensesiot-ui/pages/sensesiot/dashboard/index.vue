<template>
  <sensesiot-base-container>
    <div
      class="p-4 dashboard"
      :class="[theme, editMode ? 'editing' : '']"
      style="flex-grow: 1"
      :style="themeStyle"
    >
      <b-button-toolbar class="position-fixed dashboard-toolbar-top">
        <b-input-group prepend="Dashboard" style="flex-grow: 1">
          <b-select
            v-model="selectedDashboardId"
            :options="dashboardOptions"
            :disabled="editMode"
          >
            <b-form-select-option
              v-if="selectedDashboardId === null"
              :value="null"
              disabled
            >
              -- No Dashboard --
            </b-form-select-option>
          </b-select>

          <b-input-group-append>
            <b-button
              v-if="!editMode"
              variant="success"
              @click="showCreateDashboardModal"
            >
              <font-awesome-icon :icon="['fas', 'plus']" fixed-width />

              <span class="d-sm-none">Create</span>
            </b-button>
            <b-button v-else variant="danger" @click="showDeleteDashboardModal">
              <font-awesome-icon :icon="['fas', 'trash']" fixed-width />
              <span class="d-sm-none">Delete</span>
            </b-button>
          </b-input-group-append>
        </b-input-group>

        <b-button
          v-if="!editMode && selectedDashboardId !== null"
          variant="primary"
          @click="toEditMode"
        >
          <font-awesome-icon :icon="['fas', 'pencil']" fixed-width />

          <span class="d-sm-none">Edit</span>
        </b-button>

        <template v-else-if="editMode">
          <b-button-group>
            <b-button variant="warning" @click="showEditDashboardModal">
              <font-awesome-icon :icon="['fas', 'cog']" fixed-width />
              <span class="d-sm-none">Setting</span>
            </b-button>
            <b-button variant="success" @click="editDashboard">
              <font-awesome-icon :icon="['fas', 'save']" fixed-width />
              <span class="d-sm-none">Save</span>
            </b-button>
            <b-button variant="secondary" @click="editMode = false">
              <font-awesome-icon :icon="['fas', 'history']" fixed-width />
              <span class="d-sm-none">Cancel</span>
            </b-button>
          </b-button-group>

          <b-button variant="primary" @click="showAddWidgetModal">
            <font-awesome-icon :icon="['fas', 'plus']" fixed-width />
            New Widget
          </b-button>
        </template>
      </b-button-toolbar>
      <gridstack-container
        style="margin-top: 3em"
        :widgets="
          editMode
            ? editDashboardData.widgets
            : selectedDashboard
            ? selectedDashboard.widgets
            : []
        "
        :theme="theme"
        :editing="editMode"
        @change="onWidgetChange"
        @editWidget="onEditWidget"
        @removeWidget="onRemoveWidget"
      ></gridstack-container>
    </div>
    <create-sensesiot-dashboard-modal
      id="modal-create-dashboard"
      :dashboard-data="modalDashboardData"
      :credit-info="creditInfo"
      @ok="createDashboard"
    >
    </create-sensesiot-dashboard-modal>
    <edit-sensesiot-dashboard-modal
      id="modal-edit-dashboard"
      :dashboard-data="modalDashboardData"
      @ok="applyToEditDashboardData"
    >
    </edit-sensesiot-dashboard-modal>
    <delete-sensesiot-dashboard-modal
      id="modal-delete-dashboard"
      :dashboard-data="modalDashboardData"
      :credit-info="creditInfo"
      @ok="deleteDashboard"
    >
    </delete-sensesiot-dashboard-modal>
    <add-sensesiot-widget-modal
      id="modal-new-widget"
      :credit-info="creditInfo"
      :credit-costs="creditCosts"
      @ok="addWidget"
    >
    </add-sensesiot-widget-modal>
    <config-sensesiot-widget-modal
      id="modal-edit-widget"
      :widget="editWidgetData"
      @ok="applyEditWidget"
    >
    </config-sensesiot-widget-modal>
  </sensesiot-base-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

import CreateSensesiotDashboardModal from '~/components/modals/CreateSensesiotDashboardModal.vue'
import EditSensesiotDashboardModal from '~/components/modals/EditSensesiotDashboardModal.vue'
import DeleteSensesiotDashboardModal from '~/components/modals/DeleteSensesiotDashboardModal.vue'
import AddSensesiotWidgetModal from '~/components/modals/AddSensesiotWidgetModal.vue'
import ConfigSensesiotWidgetModal from '~/components/modals/ConfigSensesiotWidgetModal.vue'

import {
  getDefaultDashboardData,
  getThemeSetting,
  preditNextGridPosition,
  getDefaultWidgetData,
} from '~/utils/dashboard'

export default {
  name: 'DashboardPage',
  components: {
    CreateSensesiotDashboardModal,
    EditSensesiotDashboardModal,
    DeleteSensesiotDashboardModal,
    AddSensesiotWidgetModal,
    ConfigSensesiotWidgetModal,
  },
  middlewares: ['auth'],
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

      return {
        selectedDashboardId: selectedDashboard ? selectedDashboard._id : null,
        dashboards,
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get dashboard data",
      })
    }
  },
  data() {
    return {
      selectedDashboardId: null,
      dashboards: [],
      editMode: false,
      creditInfo: {},
      creditCosts: {},
      editDashboardData: {},
      editWidgetData: {},
      modalDashboardData: {},
    }
  },
  computed: {
    dashboardOptions() {
      return this.dashboards.map((dashboard) => ({
        text: dashboard.name || dashboard._id,
        value: dashboard._id,
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
    widgets() {
      let target = this.selectedDashboard
      if (this.editMode) {
        target = this.editDashboardData
      }

      if (!target || !Array.isArray(target.widgets)) {
        return []
      }
      return target.widgets
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
    },
  },
  watch: {
    selectedDashboardId(value) {
      this.$store.dispatch('updateSensesiotPreferences', {
        lastOpenedDashboard: value,
      })
    },
  },
  mounted() {
    window.onbeforeunload = this.onBeforeUnload
  },
  methods: {
    async preditCredits(additionList = {}) {
      const { creditInfo, costs } = await this.$axios.$post(
        '/api/sensesiot/credits/predit',
        additionList
      )
      return { creditInfo, costs }
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
          title: 'Error',
        })
      }
    },
    toEditMode() {
      this.editMode = true

      this.editDashboardData = {
        ...getDefaultDashboardData(),
        ...JSON.parse(JSON.stringify(this.selectedDashboard)),
      }
    },
    showEditDashboardModal() {
      this.modalDashboardData = this.modalDashboardData = {
        ...getDefaultDashboardData(),
        ...JSON.parse(JSON.stringify(this.editDashboardData)),
      }
      this.$bvModal.show('modal-edit-dashboard')
    },
    applyToEditDashboardData(dashboardData) {
      this.editDashboardData = {
        ...this.editDashboardData,
        ...JSON.parse(JSON.stringify(dashboardData)),
      }
    },
    showEditWidgetModal(widget) {
      this.editWidgetData = widget
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
    async showAddWidgetModal() {
      const widgetTypesDiff = this.selectedDashboard.widgets.reduce(
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
      this.editDashboardData.widgets.reduce((prev, current) => {
        if (prev[current.type]) {
          prev[current.type] += 1
        } else {
          prev[current.type] = 1
        }
        return prev
      }, widgetTypesDiff)

      const { costs, creditInfo } = await this.preditCredits({
        widgets: widgetTypesDiff,
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
        ...getDefaultWidgetData(type),
      }

      this.editDashboardData.widgets.push(newWidgetData)
    },
    exitEditMode() {
      this.editMode = false
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
          ...this.editDashboardData,
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
    async showDeleteDashboardModal() {
      const widgets = this.selectedDashboard.widgets.reduce((prev, current) => {
        if (prev[current.type]) {
          prev[current.type] -= 1
        } else {
          prev[current.type] = -1
        }
        return prev
      }, {})

      const { creditInfo } = await this.preditCredits({
        widgets,
        dashboard: -1,
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
          title: 'Error',
        })
      }
    },
    onBeforeUnload(ev) {
      if (this.editMode) {
        ev.preventDefault()
        return 'Are you sure you want to exit?'
      }
    },
  },
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
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 12px,
    rgba(128, 128, 128, 0.3) 12px,
    rgba(128, 128, 128, 0.3) 24px
  );
  background-attachment: fixed;
}

.dashboard {
  background-color: #eeeeee;
  background-color: var(--dashboard-bg-color, #eeeeee);
}
</style>
