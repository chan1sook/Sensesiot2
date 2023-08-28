<template>
  <b-modal
    :id="id"
    centered
    title="Add Ads"
    no-stacking
    ok-only
    :ok-disabled="!isAdsDataValid"
    @ok="onOk"
  >
    <b-form-group label="Name">
      <b-input v-model="modalAdsData.name" type="text"></b-input>
    </b-form-group>
    <b-form-group label="Description">
      <b-input v-model="modalAdsData.description" type="text"></b-input>
    </b-form-group>
    <b-form-group label="Youtube Video Id">
      <b-input
        v-model="modalAdsData.ytVidUrl"
        type="text"
        placeholder="eg. https://www.youtube.com/watch?v=..."
        @input="validateYtLink"
        @change="validateYtLink"
      ></b-input>
      <b-form-text id="input-live-help">Required https://</b-form-text>
    </b-form-group>
    <b-form-group>
      <b-form-checkbox
        v-model="modalAdsData.published"
        :value="true"
        :uncheck-value="false"
      >
        Published
      </b-form-checkbox>
    </b-form-group>
  </b-modal>
</template>

<script>
export default {
  name: 'AddSensesiotAdsModal',
  props: {
    id: {
      type: String,
      required: true
    },
    adsData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      modalAdsData: {},
      isLinkValid: false,
      reqId: 0
    }
  },
  computed: {
    isAdsDataValid() {
      return this.modalAdsData.name !== '' && this.isLinkValid
    }
  },
  watch: {
    adsData: {
      immediate: true,
      handler(value) {
        this.modalAdsData = JSON.parse(JSON.stringify(value))
        if (this.modalAdsData) {
          this.validateYtLink(this.modalAdsData.ytVidUrl)
        } else {
          this.isLinkValid = false
        }
      }
    }
  },
  methods: {
    async validateYtLink(link) {
      try {
        this.reqId += 1
        const reqId = this.reqId

        this.isLinkValid = false
        if (!link) {
          return
        }
        await this.$axios.$post(`/api/ads/yt-validate`, {
          link
        })

        if (reqId !== this.reqId) {
          return
        }
        this.isLinkValid = true
      } catch (err) {
        console.error(err)
      }
    },
    onOk() {
      const data = JSON.parse(JSON.stringify(this.modalAdsData))
      this.$emit('ok', data, this.isLinkValid)
    }
  }
}
</script>

<style></style>
