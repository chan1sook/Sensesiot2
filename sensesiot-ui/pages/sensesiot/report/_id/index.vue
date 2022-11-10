<template>
  <sensesiot-base-container>
    <b-container
      class="p-4 report"
      :class="[report.theme]"
      style="flex-grow: 1"
      :style="themeStyle"
    >
      <h2 class="text-center">{{ report.title || report.name }}</h2>
      <b-button-toolbar class="report-toolbar-top d-print-none">
        <b-button variant="success" @click="printPage">
          <font-awesome-icon :icon="['fas', 'fa-print']" />
          <span class="d-none d-sm-inline"> Print</span>
        </b-button>
        <!-- <b-button variant="success" disabled>
          <font-awesome-icon :icon="['fas', 'fa-file-csv']" />
          <span class="d-none d-sm-inline"> Export CSV</span>
        </b-button>
        <b-button variant="primary" disabled>
          <font-awesome-icon :icon="['fas', 'fa-file-pdf']" />
          <span class="d-none d-sm-inline"> Export PDF</span>
        </b-button>
        <b-button disabled>
          <font-awesome-icon :icon="['fas', 'fa-file-excel']" />
          <span class="d-none d-sm-inline"> Export .xlsx</span>
        </b-button> -->
        <b-button
          v-if="isLogin"
          :href="`/sensesiot/report/${report._id}/edit`"
          class="ml-auto"
          variant="warning"
        >
          <font-awesome-icon :icon="['fas', 'fa-pencil']" />
          <span> Edit</span>
        </b-button>
      </b-button-toolbar>
      <report-gridstack-container
        style="margin-top: 3em"
        :widgets="report.widgets"
        report-mode
        :adjustment-dates="adjustmentDates"
        :report-data-function="getReportWidgetData"
        :theme="report.theme"
        @adjustDate="adjustDate"
      ></report-gridstack-container>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
import { getReportWidgetData } from '~/utils/report'
import { getThemeSetting } from '~/utils/theme'

export default {
  name: 'ReportViewPage',
  async asyncData({ $axios, params, error }) {
    try {
      const { report } = await $axios.$get(`/api/sensesiot/report/${params.id}`)

      return {
        report,
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
      report: {},
      reportData: [],
      reportDataId: 0,
      adjustmentDates: {},
    }
  },
  computed: {
    themeStyle() {
      return getThemeSetting(this.report.theme)
    },
    isLogin() {
      return this.$store.getters.role !== 'guest'
    },
  },
  mounted() {
    this.refreshReportData()
  },
  methods: {
    adjustDate({ date, _id }) {
      this.adjustmentDates[_id] = date.getTime()
      this.refreshReportData()
    },
    async refreshReportData() {
      const params = new URLSearchParams({
        adjustmentDates: JSON.stringify(this.adjustmentDates),
      })

      this.reportDataId += 1
      const fetchId = this.reportDataId

      const reportid = this.report._id
      const { reportData } = await this.$axios.$get(
        `/api/sensesiot/report-data/${reportid}?${params.toString()}`
      )

      if (fetchId === this.reportDataId) {
        this.reportData = reportData
      }
    },
    getReportWidgetData(widget) {
      return getReportWidgetData(this.reportData, widget)
    },
    printPage() {
      print()
    },
  },
}
</script>

<style scoped>
.report {
  background-color: #eeeeee;
  background-color: var(--dashboard-bg-color, #eeeeee);
}

.report-toolbar-top {
  gap: 0.5em;
}
</style>
