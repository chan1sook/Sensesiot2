<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'fa-arrow-trend-up']" fixed-width />
          User Statistics
        </h2>
        <h4>Total Users</h4>
        <div class="d-flex flex-row flex-wrap" style="gap: 0.5em">
          <div class="font-bold">{{ allUserCounts }}</div>
          <div class="ml-auto">Since: {{ formatDate(sinceDay) }}</div>
        </div>
        <div
          class="d-flex flex-row flex-wrap justify-center my-2 mt-4"
          style="gap: 0.5em"
        >
          <b-select
            v-model="statsMonth"
            :options="monthOptions"
            style="flex-grow: 3; flex-basis: 200px"
          >
          </b-select>
          <b-input
            v-model.number="statsYear"
            type="number"
            style="flex-grow: 1; flex-basis: 100px"
          ></b-input>
          <b-button
            class="ml-auto"
            variant="success"
            style="white-space: nowrap"
            @click="$fetch"
          >
            <font-awesome-icon :icon="['fas', 'fa-sync']" />
            Refresh
          </b-button>
        </div>
        <h4>User Count</h4>
        <div class="d-flex flex-row flex-wrap" style="gap: 0.5em">
          <div class="font-bold">{{ userCounts }}</div>
          <div class="ml-auto">
            {{ formatDate(startDate) }} - {{ formatDate(endDate - 1) }}
          </div>
        </div>
        <line-chart
          ref="chartContainer"
          class="mx-auto"
          :chart-options="chartOptions"
          :chart-data="chartData"
          :height="200"
        ></line-chart>
      </sensesiot-content-container>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
import dayjs from 'dayjs'

import { th as dateFnsLocaleTh } from 'date-fns/locale'
import LineChart from '~/components/widgets/chart/LineChart.vue'

export default {
  name: 'UserStatsAdminPage',
  components: {
    LineChart,
  },
  middleware: ['authDev'],
  async asyncData({ $axios, error }) {
    try {
      const startDate = dayjs()
        .date(1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .valueOf()
      const endDate = dayjs(startDate).add(1, 'month').valueOf()

      const { allUserCounts, userCounts, userLoginStats } = await $axios.$get(
        `/api/login-stats?tsStart=${startDate}&tsEnd=${endDate}`
      )
      return {
        allUserCounts,
        userCounts,
        userLoginStats,
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get user stats info",
      })
    }
  },
  data() {
    return {
      allUserCounts: 0,
      userCounts: 0,
      userLoginStats: [],
      statsMonth: new Date().getMonth(),
      statsYear: new Date().getFullYear(),
    }
  },
  async fetch() {
    try {
      const { allUserCounts, userCounts, userLoginStats } =
        await this.$axios.$get(
          `/api/login-stats?tsStart=${this.startDate}&tsEnd=${this.endDate}`
        )
      this.allUserCounts = allUserCounts
      this.userCounts = userCounts
      this.userLoginStats = userLoginStats
    } catch (err) {
      this.error({
        statusCode: 500,
        message: "Can't get user stats info",
      })
    }
  },
  computed: {
    monthOptions() {
      return new Array(12).fill(undefined).map((ele, i) => {
        return {
          text: dayjs().month(i).format('MMMM'),
          value: i,
        }
      })
    },
    startDate() {
      return dayjs(new Date(this.statsYear, this.statsMonth)).valueOf()
    },
    endDate() {
      return dayjs(this.startDate).add(1, 'month').valueOf()
    },
    sinceDay() {
      return new Date(2022, 10, 25)
    },
    chartData() {
      return {
        datasets: [
          {
            label: 'User count each day',
            borderColor: '#429b46',
            data: this.userLoginStats.map((ele) => {
              return {
                x: new Date(ele.markTs),
                y: ele.count,
              }
            }),
          },
        ],
      }
    },
    chartOptions() {
      return {
        scales: {
          y: {
            min: 0,
          },
          x: {
            type: 'time',
            adapters: {
              date: {
                locale: dateFnsLocaleTh,
              },
            },
            time: {
              tooltipFormat: 'd MMM yyyy HH:mm:ss',
              displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'HH:mm',
                day: 'd MMM',
                month: 'MMM yyyy',
              },
            },
            min: this.startDate,
            max: this.endDate,
          },
        },
        plugins: {
          legend: {
            onClick() {},
          },
        },
      }
    },
  },
  watch: {
    statsMonth() {
      this.$fetch()
    },
    statsYear() {
      this.$fetch()
    },
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format('D MMMM YYYY')
    },
  },
}
</script>
