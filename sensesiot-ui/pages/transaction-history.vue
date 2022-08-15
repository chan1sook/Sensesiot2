<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <b-jumbotron class="shadow-2">
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'history']" fixed-width />
          Transaction History
        </h2>
        <div class="d-flex flex-row mb-2">
          <b-button variant="primary" @click="prevMonth">
            <font-awesome-icon :icon="['fas', 'chevron-left']" fixed-width />
          </b-button>
          <span
            v-b-modal.modal-select-monthyear
            class="mx-auto"
            @click="resetNewDateForm"
          >
            {{ formatDateFilter }}
          </span>
          <b-button variant="primary" @click="nextMonth">
            <font-awesome-icon :icon="['fas', 'chevron-right']" fixed-width />
          </b-button>
        </div>
        <div v-if="$fetchState.pending" class="text-center">Loading...</div>
        <template v-else>
          <template v-if="transactions.length > 0">
            <b-card v-for="transaction of transactions" :key="transaction._id">
              <template #header>
                <div class="d-flex flex-row align-items-center">
                  <span class="mr-auto">{{ transaction._id }}</span>
                  <b-badge
                    class="ml-2"
                    :variant="transactionStatusVariant(transaction.status)"
                  >
                    {{ transactionStatusPertty(transaction.status) }}
                  </b-badge>
                </div>
              </template>
              <b-card-title>
                {{ transaction.product.name }}
              </b-card-title>
              <b-card-sub-title>
                {{
                  formatCurrency(
                    transaction.product.price,
                    transaction.product.unit
                  )
                }}
              </b-card-sub-title>
              <b-card-text>
                <b>Create At:</b> {{ formatDateTime(transaction.createTime)
                }}<br />
                <b>Last Update At:</b>
                {{ formatDateTime(transaction.lastUpdateTime) }}
              </b-card-text>
            </b-card>
          </template>
          <div v-else class="text-center">No Transactions</div>
        </template>
      </b-jumbotron>
    </b-container>
    <b-modal
      id="modal-select-monthyear"
      centered
      title="Select Month-Year"
      no-stacking
      @ok="applyNewMonthYear"
    >
      <b-container fluid>
        <b-row>
          <b-col cols="8">
            <b-select v-model="newDateFilter.month" :options="monthOptions">
            </b-select>
          </b-col>
          <b-col cols="4">
            <b-input
              v-model.number="newDateFilter.year"
              type="number"
              step="1"
            ></b-input>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </sensesiot-base-container>
</template>

<script>
import dayjs from 'dayjs'
import { formatDateTime } from '~/utils/datetime'
import { formatCurrency } from '~/utils/price'

export default {
  name: 'TransactionHistoryPage',
  middlewares: ['auth'],
  data() {
    const today = new Date()
    return {
      transactions: [],
      dateFilter: {
        month: today.getMonth(),
        year: today.getFullYear(),
      },
      newDateFilter: {
        month: today.getMonth(),
        year: today.getFullYear(),
      },
    }
  },
  async fetch() {
    const startDateyear = dayjs(
      new Date(this.dateFilter.year, this.dateFilter.month, 1)
    )
    const endDateyear = dayjs(
      new Date(this.dateFilter.year, this.dateFilter.month + 1, 1)
    )

    const { transactions } = await this.$axios.$get(
      `/api/transactions?startTs=${startDateyear.valueOf()}&endTs=${endDateyear.valueOf()}`
    )
    this.transactions = transactions
  },
  computed: {
    formatDateFilter() {
      const dateyear = new Date(this.dateFilter.year, this.dateFilter.month)
      return dayjs(dateyear).format('MMMM YYYY')
    },
    monthOptions() {
      return new Array(12).fill(undefined).map((_, i) => ({
        text: dayjs().month(i).format('MMMM'),
        value: i,
      }))
    },
  },
  watch: {
    dateFilter() {
      this.$fetch()
    },
  },
  methods: {
    resetNewDateForm() {
      this.newDateFilter = {
        ...this.dateFilter,
      }
    },
    applyNewMonthYear() {
      this.dateFilter = {
        ...this.newDateFilter,
      }
    },
    nextMonth() {
      let dateyear = dayjs(
        new Date(this.dateFilter.year, this.dateFilter.month)
      )
      dateyear = dateyear.add(1, 'month')

      this.dateFilter = {
        month: dateyear.month(),
        year: dateyear.year(),
      }
    },
    prevMonth() {
      let dateyear = dayjs(
        new Date(this.dateFilter.year, this.dateFilter.month)
      )
      dateyear = dateyear.subtract(1, 'month')

      this.dateFilter = {
        month: dateyear.month(),
        year: dateyear.year(),
      }
    },
    formatCurrency,
    formatDateTime,
    transactionStatusPertty(status) {
      if (typeof status !== 'string' || status.length === 0) {
        return status
      }

      const firstLetter = status[0].toUpperCase()
      return firstLetter + status.substring(1)
    },
    transactionStatusVariant(status) {
      switch (status) {
        case 'pending':
          return 'primary'
        case 'completed':
          return 'success'
        case 'failed':
        case 'cancel':
          return 'danger'
        default:
          return 'secondary'
      }
    },
  },
}
</script>
