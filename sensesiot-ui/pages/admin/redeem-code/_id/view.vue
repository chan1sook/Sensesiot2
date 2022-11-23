<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'fa-ticket-simple']" fixed-width />
          {{ redeemCode.name }}
        </h2>
        <div
          class="mt-4 d-flex flex-row flex-wrap align-center"
          style="gap: 0.5em"
        >
          <b-button href="/admin/redeem-code">
            <font-awesome-icon :icon="['fas', 'fa-arrow-left']" />
            Back
          </b-button>
          <b-button
            variant="warning"
            :href="`/admin/redeem-code/${redeemCode._id}/edit`"
            class="ml-auto"
          >
            <font-awesome-icon :icon="['fas', 'fa-pencil']" />
            Edit
          </b-button>
        </div>
        <div
          class="d-flex flex-wrap flex-row justify-content-center my-2"
          style="gap: 0.5em"
        >
          <div>
            <b>Assigned:</b> {{ assignedCode }} / {{ redeemCode.codes.length }}
          </div>
          <div><b>Used:</b> {{ usedCode }} / {{ redeemCode.codes.length }}</div>
        </div>
        <div class="my-2 d-flex flex-row flex-wrap" style="gap: 0.5em">
          <b-badge
            v-for="(code, i) of redeemCode.codes"
            :key="i"
            :variant="code.used ? 'secondary' : 'success'"
            class="badge-tag"
          >
            <span class="code" @click="copyCode(code)">
              {{ truncate(code.code, 12) }}
            </span>
            <b-form-checkbox
              v-model="code.assigned"
              :value="true"
              :unchecked-value="false"
              @click.stop="updateData"
            >
            </b-form-checkbox>
          </b-badge>
        </div>
      </sensesiot-content-container>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
import { truncate } from '~/utils/utils'
import { sortRedeemCodeInner } from '~/utils/redeem-codes'
export default {
  name: 'RedeemCodesViewCodePage',
  middleware: ['authDev'],
  async asyncData({ $axios, params, error }) {
    try {
      const { redeemCode } = await $axios.$get(`/api/redeem-code/${params.id}`)

      redeemCode.codes.sort(sortRedeemCodeInner)

      return {
        redeemCode,
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
    }
  },
  computed: {
    assignedCode() {
      return this.redeemCode.codes.reduce((prev, current) => {
        if (current.assigned) {
          return prev + 1
        }
        return prev
      }, 0)
    },
    usedCode() {
      return this.redeemCode.codes.reduce((prev, current) => {
        if (current.used) {
          return prev + 1
        }
        return prev
      }, 0)
    },
  },
  methods: {
    truncate,
    async copyCode(code) {
      try {
        await navigator.clipboard.writeText(code.code)
        this.$bvToast.toast('Copied', {
          title: 'Alert',
          autoHideDelay: 5000,
        })
      } catch (err) {
        console.error(err)
      }
    },
    async updateData() {
      try {
        const redeemId = this.redeemCode._id
        const editData = {
          ...this.redeemCode,
        }
        delete editData._id

        const { redeemCode } = await this.$axios.$post(
          `/api/redeem-code/edit/${redeemId}`,
          editData
        )

        this.redeemCode = redeemCode
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

<style scoped>
.badge-tag {
  white-space: nowrap;
}
.badge-tag .code {
  cursor: pointer;
}
.badge-tag .custom-checkbox {
  display: inline-block;
  vertical-align: middle;
}
</style>
