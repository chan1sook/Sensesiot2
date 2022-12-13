<template>
  <b-modal :id="id" centered title="Share Public Dashboard" no-stacking ok-only>
    <div class="mt-2">
      <b>Dashboard: </b><i>{{ dashboardData.name || dashboardData._id }}</i>
    </div>
    <div class="mt-2">
      <b>Access: </b>
      <template v-if="dashboardData.publicAccess">Public</template>
      <template v-else>Private</template>
    </div>
    <template v-if="dashboardData.publicAccess">
      <div class="mt-2 flex flex-row flex-wrap align-items-center">
        <b>Dashboard Id: </b>
        <i>{{ dashboardData._id }}</i>
        <b-button variant="primary" @click="copyDashboardId">
          <template v-if="copiedDashbaord">Copied</template
          ><template v-else>Copy Id</template>
        </b-button>
      </div>
      <div class="mt-2 flex flex-row flex-wrap align-items-center">
        <b>Link:</b>
        <a
          ref="noopener noreferrer"
          :href="`/sensesiot/dashboard/${dashboardData._id}`"
          target="_blank"
        >
          <font-awesome-icon
            :icon="['fas', 'fa-up-right-from-square']"
          ></font-awesome-icon>
        </a>
        <b-button variant="primary" @click="copyLink">
          <template v-if="copiedLink">Copied</template
          ><template v-else>Copy Link</template>
        </b-button>
      </div>
    </template>
    <div v-else class="mt-2">
      <i> Please change to Public to allow access dashboard. </i>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'ShareLinkSensesiotDeviceModal',
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
      copyLinkId: 0,
      copyDashbaordId: 0,
      copiedLink: false,
      copiedDashbaord: false,
    }
  },
  beforeDestroy() {
    clearTimeout(this.copyLinkId)
    clearTimeout(this.copyDashbaordId)
  },
  methods: {
    async copyLink() {
      const url = new URL(
        `/sensesiot/dashboard/${this.dashboardData._id}`,
        document.baseURI
      )

      try {
        await navigator.clipboard.writeText(url.href)
        this.copiedLink = true
        clearTimeout(this.copyLinkId)
        this.copyLinkId = setTimeout(() => {
          this.copiedLink = false
        }, 5000)
      } catch (err) {
        console.error(err)
      }
    },
    async copyDashboardId() {
      try {
        await navigator.clipboard.writeText(this.dashboardData._id)
        this.copiedDashbaord = true
        clearTimeout(this.copyLinkId)
        this.copyDashbaordId = setTimeout(() => {
          this.copiedDashbaord = false
        }, 5000)
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>

<style></style>
