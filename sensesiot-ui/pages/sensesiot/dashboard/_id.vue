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
          <b-select disabled>
            <b-select-option selected>{{ dashboard.name }}</b-select-option>
          </b-select>
        </b-input-group>
        <b-button @click="showShareLinkDashboardModal">
          <font-awesome-icon :icon="['fas', 'share']" fixed-width />
          <span class="d-none d-lg-inline"> Share</span>
        </b-button>
      </b-button-toolbar>
      <gridstack-container
        style="margin-top: 3em"
        :widgets="dashboard.widgets"
        :theme="theme"
        no-control
      ></gridstack-container>
    </div>
    <share-link-sensesiot-dashboard-modal
      id="modal-share-link-dashboard"
      :dashboard-data="dashboard"
    >
    </share-link-sensesiot-dashboard-modal>
  </sensesiot-base-container>
</template>

<script>
import { getThemeSetting } from '~/utils/dashboard'

import ShareLinkSensesiotDashboardModal from '~/components/modals/ShareLinkSensesiotDashboardModal.vue'

export default {
  name: 'PublicDashboardPage',
  components: {
    ShareLinkSensesiotDashboardModal,
  },
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
    }
  },
  computed: {
    theme() {
      let target = this.dashboard
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
  },
  methods: {
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
