<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'fa-ticket-simple']" fixed-width />
          Redeem Code
        </h2>
        <b-form-group>
          <b-input v-model="code" placeholder="Redeem Code"></b-input>
        </b-form-group>
        <div class="text-center">
          <b-button variant="success" :disabled="!code" @click="redeemCode">
            Redeem
          </b-button>
        </div>
      </sensesiot-content-container>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
import { redeemValueArr } from '~/utils/redeem-codes'
export default {
  name: 'RedeemCodePage',
  middleware: ['auth'],
  data() {
    return {
      code: '',
    }
  },
  methods: {
    async redeemCode() {
      if (!this.code) {
        return
      }

      try {
        const { redeemValue } = await this.$axios.$post('/api/redeem', {
          code: this.code,
        })
        const result = redeemValueArr(redeemValue)
        await this.$store.dispatch('getUserData')

        this.$bvModal.msgBoxOk(
          this.$createElement('div', {}, [
            this.$createElement('div', {}, ['Redeem Successful']),
            this.$createElement('div', {}, [
              this.$createElement('b', {}, ['Get: ']),
              ...result.map((ele, i) => {
                return this.$createElement('span', {}, [
                  i > 0 ? ', ' : '',
                  this.$createElement('b', {}, [`${ele.label}: `]),
                  ele.value,
                ])
              }),
            ]),
          ]),
          {
            title: 'Success',
          }
        )

        this.code = ''
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
