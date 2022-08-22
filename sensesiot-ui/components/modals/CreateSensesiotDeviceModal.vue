<template>
  <b-modal
    :id="id"
    centered
    title="Create Device"
    no-stacking
    no-close-on-esc
    no-close-on-backdrop
    :ok-disabled="!isDeviceDataValid"
    @ok="onOk"
  >
    <b-form-group label="Device Key">
      <b-input type="text" disabled value="Will generate when create"></b-input>
    </b-form-group>
    <b-form-group label="Device Name">
      <b-input v-model="modalDeviceData.name" type="text"></b-input>
    </b-form-group>
    <b-form-group label="Device Model Name">
      <b-input v-model="modalDeviceData.model" type="text"></b-input>
    </b-form-group>
    <div class="mt-2">
      <div v-if="creditInfo.predit > creditInfo.current" class="text-center">
        <b class="text-danger">Cost: </b>
        <span>
          {{ creditInfo.predit - creditInfo.current }}
        </span>
        <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
      </div>
      <div v-else class="text-center">
        <b>First Device is Free!</b>
      </div>
      <div v-if="creditInfo.max >= creditInfo.predit" class="text-center">
        <b>Remain: </b>
        {{ creditInfo.max - creditInfo.predit }}
        <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
      </div>
      <template v-else>
        <div class="text-center text-danger">
          <b>Not suffient Credits!</b>
        </div>
        <div class="text-center">
          <em>Your have: </em>
          {{ creditInfo.max - creditInfo.current }}
          <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
        </div>
      </template>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'CreateSensesiotDeviceModal',
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
    creditInfo: {
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
