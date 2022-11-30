<template>
  <sensesiot-base-container>
    <b-container class="mt-4 d-flex flex-column" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'fa-ticket-simple']" fixed-width />
          Edit Redeem Codes
        </h2>
        <b-form-group label="Name">
          <b-input v-model="editRedeemCodeData.name" type="text"></b-input>
        </b-form-group>
        <b-form-group label="Description">
          <b-textarea
            v-model="editRedeemCodeData.description"
            rows="3"
          ></b-textarea>
        </b-form-group>
        <div class="d-flex flex-wrap flex-row my-2" style="gap: 0.5em">
          <div>
            <b>Assigned:</b> {{ assignedCode }} /
            {{ editRedeemCodeData.codes.length }}
          </div>
          <div>
            <b>Used:</b> {{ usedCode }} / {{ editRedeemCodeData.codes.length }}
          </div>
        </div>
        <b-form-group>
          <b-form-checkbox v-model="editRedeemCodeData.setExpired">
            Set Expired
          </b-form-checkbox>
        </b-form-group>
        <b-form-group v-if="editRedeemCodeData.setExpired" label="Expired Time">
          <b-datepicker
            v-model="editRedeemCodeData.expiredDate"
            value-as-date
          ></b-datepicker>
        </b-form-group>
        <template v-if="editRedeemCodeData.redeemValue">
          <h5>Redeem Code Values</h5>
          <b-form-group label="Coin(s)">
            <b-input
              v-model.number="editRedeemCodeData.redeemValue.base"
              type="number"
              min="0"
            ></b-input>
          </b-form-group>
          <b-form-group label="Sensesiot Credit(s)">
            <b-input
              v-model.number="editRedeemCodeData.redeemValue.sensesiot"
              type="number"
              min="0"
            ></b-input>
          </b-form-group>
        </template>
        <div class="d-flex flex-row justify-self-center align-center my-2 mt-4">
          <b-button
            class="mx-auto"
            variant="success"
            :disabled="!isRedeemCodesDataValid"
            @click="editRedeemData"
          >
            <font-awesome-icon :icon="['fas', 'fa-save']" />
            Save
          </b-button>
          <b-button class="mx-auto" variant="secondary" @click="resetData">
            <font-awesome-icon :icon="['fas', 'fa-history']" />
            Reset
          </b-button>
          <b-button class="mx-auto" variant="danger" href="/admin/redeem-code">
            <font-awesome-icon :icon="['fas', 'fa-times']" />
            Cancel
          </b-button>
        </div>
      </sensesiot-content-container>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
export default {
  name: 'RedeemCodesEditPage',
  middleware: ['authDev'],
  async asyncData({ $axios, params, error }) {
    try {
      const { redeemCode } = await $axios.$get(`/api/redeem-code/${params.id}`)

      return {
        redeemCode,
        editRedeemCodeData: JSON.parse(JSON.stringify(redeemCode)),
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get redeem code data",
      })
    }
  },
  data() {
    return {
      redeemCode: {},
      editRedeemCodeData: {},
    }
  },
  computed: {
    assignedCode() {
      return this.editRedeemCodeData.codes.reduce((prev, current) => {
        if (current.assigned) {
          return prev + 1
        }
        return prev
      }, 0)
    },
    usedCode() {
      return this.editRedeemCodeData.codes.reduce((prev, current) => {
        if (current.used) {
          return prev + 1
        }
        return prev
      }, 0)
    },
    isRedeemCodesDataValid() {
      return this.editRedeemCodeData.name !== '' && this.redeemValueValid
    },
    redeemValueValid() {
      const redeemValueKeys = Object.keys(this.editRedeemCodeData.redeemValue)
      let redeemValueTotal = 0

      for (let i = 0; i < redeemValueKeys.length; i += 1) {
        const redeemKey = redeemValueKeys[i]
        if (
          !Number.isFinite(this.editRedeemCodeData.redeemValue[redeemKey]) ||
          this.editRedeemCodeData.redeemValue[redeemKey] < 0
        ) {
          return false
        }
        redeemValueTotal += this.editRedeemCodeData.redeemValue[redeemKey]
      }

      return redeemValueTotal > 0
    },
  },
  mounted() {
    window.addEventListener('beforeunload', this.onBeforeUnload)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.onBeforeUnload)
  },
  methods: {
    async resetData() {
      const msgBoxResult = await this.$bvModal.msgBoxConfirm(
        'Do you want to reset data?',
        {
          title: 'Confirm',
          okVariant: 'danger',
          okTitle: 'Yes',
          cancelTitle: 'No',
          hideHeaderClose: false,
          centered: true,
        }
      )

      if (msgBoxResult === true) {
        this.editRedeemCodeData = JSON.parse(JSON.stringify(this.redeemCode))
      }
    },
    async editRedeemData() {
      if (!this.isRedeemCodesDataValid) {
        return
      }
      try {
        const redeemId = this.editRedeemCodeData._id
        const editData = {
          ...this.editRedeemCodeData,
        }
        delete editData._id
        delete editData.codes

        const { redeemCode } = await this.$axios.$post(
          `/api/redeem-code/edit/${redeemId}`,
          editData
        )

        this.redeemCode = redeemCode
        this.editRedeemCodeData = JSON.parse(JSON.stringify(redeemCode))

        this.$store.dispatch('getUserData')

        this.$router.push('/admin/redeem-code')
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
      ev.preventDefault()
      return 'Are you sure you want to exit?'
    },
  },
}
</script>
