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
    <div class="mt-2">
      <i v-if="!dashboardData.publicAccess">
        Please change to Public to allow access dashboard.
      </i>
      <span
        v-else
        class="d-inline-flex flex-row align-items-center"
        style="gap: 0.5em"
      >
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
          <template v-if="copied">Copied</template
          ><template v-else>Copy Link</template>
        </b-button>
      </span>
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
      copyId: 0,
      copied: false,
    }
  },
  beforeDestroy() {
    clearTimeout(this.copyId)
  },
  methods: {
    async copyLink() {
      const url = new URL(
        `/sensesiot/dashboard/${this.dashboardData._id}`,
        document.baseURI
      )

      try {
        await navigator.clipboard.writeText(url.href)
        this.copied = true
        clearTimeout(this.copyId)
        this.copyId = setTimeout(() => {
          this.copied = false
        }, 5000)
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>

<style></style>
