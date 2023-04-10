<template>
  <sensesiot-base-container>
    <b-container class="mt-4 d-flex flex-column" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center">
          <font-awesome-icon :icon="['fas', 'fa-book']" fixed-width />
          Reports
        </h2>
        <div class="d-flex flex-row justify-center my-2 mt-4">
          <b-button
            class="mx-auto"
            variant="success"
            @click="showCreateReportModal"
          >
            <font-awesome-icon :icon="['fas', 'fa-plus']" />
            Create Report
          </b-button>
        </div>
        <b-card v-for="report of reports" :key="report._id" class="my-2">
          <b-card-title>{{ report.name }} </b-card-title>
          <b-card-sub-title>
            <b-badge
              :variant="getPublicAccess(report) ? 'success' : 'secondary'"
            >
              {{ getPublicAccess(report) ? 'Public' : 'Private' }}
            </b-badge>
          </b-card-sub-title>
          <b-card-text
            class="mt-4 d-flex flex-row flex-wrap"
            style="gap: 0.5em"
          >
            <b-button
              variant="primary"
              :href="`/sensesiot/report/${report._id}`"
              class="mr-auto"
            >
              <font-awesome-icon :icon="['fas', 'fa-search']" />
              Preview
            </b-button>
            <b-button
              variant="warning"
              :href="`/sensesiot/report/${report._id}/edit`"
            >
              <font-awesome-icon :icon="['fas', 'fa-pencil']" />
              Edit
            </b-button>
            <b-button variant="danger" @click="showDeleteReportModal(report)">
              <font-awesome-icon :icon="['fas', 'fa-trash']" />
              Remove
            </b-button>
          </b-card-text>
        </b-card>
        <b-card v-if="reports.length === 0" class="my-2">No Reports</b-card>
      </sensesiot-content-container>
    </b-container>
    <create-sensesiot-report-modal
      id="modal-create-report"
      :report-data="modalReportData"
      :credit-info="creditInfo"
      @ok="createReport"
    ></create-sensesiot-report-modal>
    <delete-sensesiot-report-modal
      id="modal-delete-report"
      :report-data="modalReportData"
      :credit-info="creditInfo"
      @ok="deleteReport"
    ></delete-sensesiot-report-modal>
  </sensesiot-base-container>
</template>

<script>
import CreateSensesiotReportModal from '~/components/modals/CreateSensesiotReportModal.vue'
import DeleteSensesiotReportModal from '~/components/modals/DeleteSensesiotReportModal.vue'

import { getDefaultReportData } from '~/utils/report'
import { preditCredits, getCostableWidgets } from '~/utils/utils'

export default {
  name: 'ReportPage',
  components: {
    CreateSensesiotReportModal,
    DeleteSensesiotReportModal
  },
  middleware: ['auth'],
  async asyncData({ $axios, store, error }) {
    try {
      const { reports } = await $axios.$get('/api/sensesiot/reports')

      return {
        reports
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get report data"
      })
    }
  },
  data() {
    return {
      creditInfo: {},
      reports: [],
      modalReportData: {}
    }
  },
  methods: {
    getPublicAccess(report) {
      const isPublic = (report.options || {}).publicAccess
      return Boolean(isPublic)
    },
    preditCredits(additionList = {}) {
      return preditCredits(this.$axios, additionList)
    },
    async showCreateReportModal() {
      const { creditInfo } = await this.preditCredits({ report: 1 })
      this.creditInfo = creditInfo
      this.modalReportData = getDefaultReportData()
      this.$bvModal.show('modal-create-report')
    },
    async createReport(reportData) {
      try {
        const { report: newReport } = await this.$axios.$post(
          '/api/sensesiot/report/add',
          reportData
        )
        this.reports.push(newReport)
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
    async showDeleteReportModal(reportData) {
      const costableWidgets = getCostableWidgets(reportData.widgets)
      const widgetTypes = costableWidgets.reduce((prev, current) => {
        if (prev[current.type]) {
          prev[current.type] -= 1
        } else {
          prev[current.type] = -1
        }
        return prev
      }, {})

      const { creditInfo } = await this.preditCredits({
        report: -1,
        reportWidgets: widgetTypes
      })
      this.creditInfo = creditInfo
      this.modalReportData = JSON.parse(JSON.stringify(reportData))
      this.$bvModal.show('modal-delete-report')
    },
    async deleteReport(reportId) {
      if (!reportId) {
        return
      }

      try {
        await this.$axios.$post(`/api/sensesiot/report/delete/${reportId}`)

        const oldReportIndex = this.reports.findIndex(
          (ele) => ele._id === reportId
        )
        if (oldReportIndex !== -1) {
          this.reports.splice(oldReportIndex, 1)
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
    }
  }
}
</script>

<style></style>
