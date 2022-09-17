<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'fa-ticket-simple']" fixed-width />
          Redeem Code Admin
        </h2>
        <div class="d-flex flex-row justify-center my-2 mt-4">
          <b-button
            class="mx-auto"
            variant="success"
            @click="showCreateRedeemCodesModal"
          >
            <font-awesome-icon :icon="['fas', 'fa-plus']" />
            Generate Redeem Code
          </b-button>
        </div>
        <b-card v-for="code of redeemCodes" :key="code._id" class="my-2">
          <b-card-title>{{ code.name }} </b-card-title>
          <b-card-sub-title>
            <b-badge :variant="isExpired(code) ? 'danger' : 'success'">
              {{ isExpired(code) ? 'Expired' : 'Active' }}
            </b-badge>
          </b-card-sub-title>
          <div class="my-2">
            <template v-if="code.description">
              {{ code.description }}
            </template>
            <em v-else> No Descriptions </em>
          </div>
          <div class="d-flex flex-wrap flex-row my-2" style="gap: 0.5em">
            <div>
              <b>Assigned:</b>
              {{ code.codesInfo.assigned }} /
              {{ code.codesInfo.total }}
            </div>
            <div>
              <b>Used:</b> {{ code.codesInfo.used }} /
              {{ code.codesInfo.total }}
            </div>
          </div>
          <div class="my-2">
            <template v-if="code.setExpired">
              <b>Expired:</b> {{ formatDate(code.expiredDate) }}
            </template>
            <em v-else> No Expired </em>
          </div>
          <h5 class="my-2">Redeem Code Values</h5>
          <div class="my-2">
            <span
              v-for="({ key, value, label }, i) of redeemValueArr(
                code.redeemValue
              )"
              :key="key"
            >
              <span v-if="i > 0">,</span>
              <b>{{ label }}:</b>
              {{ value }}
            </span>
          </div>
          <div class="mt-4 d-flex flex-row flex-wrap" style="gap: 0.5em">
            <b-button
              variant="success"
              :href="`/admin/redeem-code/${code._id}/view`"
            >
              <font-awesome-icon :icon="['fas', 'fa-ticket-simple']" />
              View Codes
            </b-button>
            <b-button
              variant="warning"
              :href="`/admin/redeem-code/${code._id}/edit`"
              class="ml-auto"
            >
              <font-awesome-icon :icon="['fas', 'fa-pencil']" />
              Edit
            </b-button>
            <b-button variant="danger" @click="showDeleteRedeemCodeModal(code)">
              <font-awesome-icon :icon="['fas', 'fa-trash']" />
              Remove
            </b-button>
          </div>
        </b-card>
        <b-card v-if="redeemCodes.length === 0" class="my-2">No Codes</b-card>
      </sensesiot-content-container>
    </b-container>
    <generate-sensesiot-redeem-code-modal
      id="modal-create-redeem-code"
      :redeem-code-data="modalRedeemCodeData"
      @ok="createRedeemCode"
    ></generate-sensesiot-redeem-code-modal>
    <delete-sensesiot-redeem-code-modal
      id="modal-delete-redeem-code"
      :redeem-code="modalRedeemCodeData"
      @ok="deleteRedeemCode"
    ></delete-sensesiot-redeem-code-modal>
  </sensesiot-base-container>
</template>

<script>
import dayjs from 'dayjs'
import GenerateSensesiotRedeemCodeModal from '~/components/modals/GenerateSensesiotRedeemCodeModal.vue'
import DeleteSensesiotRedeemCodeModal from '~/components/modals/DeleteSensesiotRedeemCodeModal.vue'
import {
  sortRedeemCodes,
  redeemValueArr,
  getDefaultRedeemCodeData,
} from '~/utils/redeem-codes'

export default {
  name: 'RedeemCodesAdminPage',
  components: {
    GenerateSensesiotRedeemCodeModal,
    DeleteSensesiotRedeemCodeModal,
  },
  middleware: ['authDev'],
  async asyncData({ $axios, error }) {
    try {
      const { redeemCodes } = await $axios.$get('/api/redeem-codes')
      redeemCodes.sort(sortRedeemCodes)
      return {
        redeemCodes,
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get redeem codes info",
      })
    }
  },
  data() {
    return {
      redeemCodes: [],
      modalRedeemCodeData: getDefaultRedeemCodeData(),
    }
  },
  methods: {
    showCreateRedeemCodesModal() {
      this.modalRedeemCodeData = getDefaultRedeemCodeData()

      this.$bvModal.show('modal-create-redeem-code')
    },
    formatDate(date) {
      return dayjs(date).format('D MMMM YYYY HH:mm')
    },
    isExpired(redeemCodes) {
      return (
        redeemCodes.setExpired &&
        dayjs(redeemCodes.expiredDate).diff(new Date()) < 0
      )
    },
    redeemValueArr,
    async createRedeemCode(redeemCode) {
      try {
        const { redeemCode: newRedeemCode } = await this.$axios.$post(
          '/api/redeem-codes/generate',
          redeemCode
        )
        newRedeemCode.codesInfo = {
          assigned: newRedeemCode.codes.reduce((prev, current) => {
            if (current.assigned) {
              return prev + 1
            }
            return prev
          }, 0),
          used: newRedeemCode.codes.reduce((prev, current) => {
            if (current.used) {
              return prev + 1
            }
            return prev
          }, 0),
          total: newRedeemCode.codes.length,
        }
        delete newRedeemCode.codes

        this.redeemCodes.push(newRedeemCode)
        this.redeemCodes.sort(sortRedeemCodes)

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
    showDeleteRedeemCodeModal(redeemCode) {
      this.modalRedeemCodeData = JSON.parse(JSON.stringify(redeemCode))
      this.$bvModal.show('modal-delete-redeem-code')
    },
    async deleteRedeemCode(redeemId) {
      if (!redeemId) {
        return
      }

      try {
        await this.$axios.$post(`/api/redeem-code/delete/${redeemId}`)

        const oldRedeemCodeIndex = this.redeemCodes.findIndex(
          (ele) => ele._id === redeemId
        )
        if (oldRedeemCodeIndex !== -1) {
          this.redeemCodes.splice(oldRedeemCodeIndex, 1)
        }
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
  },
}
</script>
