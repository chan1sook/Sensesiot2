<template>
  <b-modal
    :id="id"
    centered
    title="Generate Redeem Codes"
    no-stacking
    no-close-on-esc
    no-close-on-backdrop
    :ok-disabled="!isRedeemCodesDataValid"
    @ok="onOk"
  >
    <b-form-group label="Name">
      <b-input v-model="modalRedeemCodeData.name" type="text"></b-input>
    </b-form-group>
    <b-form-group label="Description">
      <b-textarea
        v-model="modalRedeemCodeData.description"
        rows="3"
      ></b-textarea>
    </b-form-group>
    <b-form-group label="Quantity">
      <b-input
        v-model.number="modalRedeemCodeData.quantity"
        type="number"
        min="1"
      ></b-input>
    </b-form-group>
    <b-form-group>
      <b-form-checkbox
        v-model="modalRedeemCodeData.setExpired"
        :value="true"
        :uncheck-value="false"
      >
        Set Expired
      </b-form-checkbox>
    </b-form-group>
    <b-form-group v-if="modalRedeemCodeData.setExpired" label="Expired Time">
      <b-datepicker
        v-model="modalRedeemCodeData.expiredDate"
        value-as-date
      ></b-datepicker>
    </b-form-group>
    <template v-if="modalRedeemCodeData.redeemValue">
      <h5>Redeem Code Values</h5>
      <b-form-group label="Coin(s)">
        <b-input
          v-model.number="modalRedeemCodeData.redeemValue.base"
          type="number"
          min="0"
        ></b-input>
      </b-form-group>
      <b-form-group label="Sensesiot Credit(s)">
        <b-input
          v-model.number="modalRedeemCodeData.redeemValue.sensesiot"
          type="number"
          min="0"
        ></b-input>
      </b-form-group>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'GenerateSensesiotRedeemCodeModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    redeemCodeData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      modalRedeemCodeData: {},
    }
  },
  computed: {
    isRedeemCodesDataValid() {
      return (
        this.modalRedeemCodeData.name !== '' &&
        this.modalRedeemCodeData.quantity > 0 &&
        this.redeemValueValid
      )
    },
    redeemValueValid() {
      const redeemValueKeys = Object.keys(this.modalRedeemCodeData.redeemValue)
      let redeemValueTotal = 0

      for (let i = 0; i < redeemValueKeys.length; i += 1) {
        const redeemKey = redeemValueKeys[i]
        if (
          !Number.isFinite(this.modalRedeemCodeData.redeemValue[redeemKey]) ||
          this.modalRedeemCodeData.redeemValue[redeemKey] < 0
        ) {
          return false
        }
        redeemValueTotal += this.modalRedeemCodeData.redeemValue[redeemKey]
      }

      return redeemValueTotal > 0
    },
  },
  watch: {
    redeemCodeData: {
      immediate: true,
      handler(value) {
        this.modalRedeemCodeData = JSON.parse(JSON.stringify(value))
      },
    },
  },
  methods: {
    onOk() {
      this.$emit('ok', JSON.parse(JSON.stringify(this.modalRedeemCodeData)))
    },
  },
}
</script>

<style></style>