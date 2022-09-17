<template>
  <sensesiot-base-container>
    <div
      class="p-4 dashboard"
      :class="[theme]"
      style="flex-grow: 1"
      :style="themeStyle"
    >
      <b-button-toolbar class="position-fixed dashboard-toolbar-top">
        <b-input-group prepend="Dashboard" style="flex-grow: 1">
          <b-select :value="null" disabled>
            <b-select-option :value="null">{{
              dashboard.name
            }}</b-select-option>
          </b-select>
        </b-input-group>
        <b-button @click="showShareLinkDashboardModal">
          <font-awesome-icon :icon="['fas', 'share']" fixed-width />
          <span class="d-none d-lg-inline"> Share</span>
        </b-button>
      </b-button-toolbar>
      <dashboard-gridstack-container
        style="margin-top: 3em"
        :widgets="dashboard.widgets"
        :data-function="getWidgetData"
        :theme="theme"
        no-control
      ></dashboard-gridstack-container>
    </div>
    <share-link-sensesiot-dashboard-modal
      id="modal-share-link-dashboard"
      :dashboard-data="dashboard"
    >
    </share-link-sensesiot-dashboard-modal>
  </sensesiot-base-container>
</template>

<script>
import { getWidgetData, onSioMqtt, onUpdateWidget } from '~/utils/dashboard'
import SocketIOMixin from '~/mixins/socketio.js'

import ShareLinkSensesiotDashboardModal from '~/components/modals/ShareLinkSensesiotDashboardModal.vue'
import { getThemeSetting } from '~/utils/theme'

export default {
  name: 'PublicDashboardPage',
  components: {
    ShareLinkSensesiotDashboardModal,
  },
  mixins: [SocketIOMixin],
  async asyncData({ $axios, params, error }) {
    try {
      const { dashboard } = await $axios.$get(
        `/api/sensesiot/dashboard/${params.id}`
      )

      return {
        dashboard,
      }
    } catch (err) {
      error({
        statusCode: 403,
        message: 'Forbidden',
      })
    }
  },
  data() {
    return {
      dashboard: {},
      dashboardData: [],
      dashboardDataId: 0,
    }
  },
  computed: {
    theme() {
      const target = this.dashboard

      if (!target) {
        return 'default'
      }
      return target.theme || 'default'
    },
    themeStyle() {
      return getThemeSetting(this.theme)
    },
  },
  mounted() {
    this.refreshDashboardData()

    this.socketio.emit('requestChannel', this.dashboard.uid)
    this.socketio.on('mqtt', this.onSioMqtt)
    this.socketio.on('updateWidget', this.onUpdateWidget)
  },
  beforeDestroy() {
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
      this.dashboardDataId += 1
      const fetchId = this.dashboardDataId

      const dashboardid = this.dashboard._id
      const { dashboardData } = await this.$axios.$get(
        `/api/sensesiot/dashboard-data/${dashboardid}`
      )

      if (
        dashboardid === this.dashboard._id &&
        fetchId === this.dashboardDataId
      ) {
        this.dashboardData = dashboardData
      }
    },
    getWidgetData(widget) {
      return getWidgetData(this.dashboardData, widget)
    },
    showShareLinkDashboardModal() {
      this.$bvModal.show('modal-share-link-dashboard')
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
