<template>
  <b-modal
    :id="id"
    centered
    title="Edit Device"
    no-stacking
    no-close-on-esc
    no-close-on-backdrop
    :ok-disabled="!isDeviceDataValid"
    @ok="onOk"
  >
    <b-form-group label="Device Key">
      <b-input
        type="text"
        disabled
        :value="modalDeviceData.deviceKey"
      ></b-input>
    </b-form-group>
    <b-form-group label="Device Name">
      <b-input v-model="modalDeviceData.name" type="text"></b-input>
    </b-form-group>
    <b-form-group label="Device Model Name">
      <b-input v-model="modalDeviceData.model" type="text"></b-input>
    </b-form-group>
  </b-modal>
</template>

<script>
export default {
  name: 'EditSensesiotDeviceModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    deviceData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      modalDeviceData: {
        name: '',
        model: '',
      },
    }
  },
  computed: {
    isDeviceDataValid() {
      return this.modalDeviceData.name !== ''
    },
  },
  watch: {
    deviceData: {
      immediate: true,
      handler(value) {
        this.modalDeviceData = JSON.parse(JSON.stringify(value))
      },
    },
  },
  methods: {
    onOk() {
      this.$emit('ok', JSON.parse(JSON.stringify(this.modalDeviceData)))
    },
  },
}
</script>

<style></style>
