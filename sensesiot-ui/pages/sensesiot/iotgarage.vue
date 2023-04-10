<template>
  <sensesiot-base-container>
    <b-container class="mt-4 d-flex flex-column" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center">
          <font-awesome-icon :icon="['fas', 'fa-microchip']" fixed-width />
          IoT Garage
        </h2>
        <h5>Devices</h5>
        <b-button-toolbar style="gap: 0.5em">
          <b-input-group prepend="Search">
            <b-input v-model="keyword" type="search"></b-input>
          </b-input-group>

          <b-button variant="success" @click="showCreateDeviceModal">
            <font-awesome-icon :icon="['fas', 'plus']" fixed-width />
            <span class="d-none d-lg-inline">Add</span>
          </b-button>
        </b-button-toolbar>

        <b-table
          responsive
          striped
          hover
          show-empty
          sticky-header
          bordered
          :items="filterDevices"
          :fields="tableFields"
          class="my-4"
        >
          <template #empty>
            <h4 v-if="devices.length > 0" class="my-4 text-center font-italic">
              No devices matching filter.
            </h4>
            <h4 v-else class="my-4 text-center font-italic">No devices.</h4>
          </template>
          <template #cell(actions)="data">
            <div
              class="d-flex flex-row justify-content-center"
              style="gap: 0.5em"
            >
              <font-awesome-icon
                v-b-tooltip.hover
                :icon="['fas', 'fa-copy']"
                style="cursor: pointer"
                title="Copy Device Key"
                @click="copyDeviceKey(data)"
              ></font-awesome-icon>
              <font-awesome-icon
                v-b-tooltip.hover
                :icon="['fas', 'fa-pencil']"
                style="cursor: pointer"
                title="Edit Device"
                @click="showEditDeviceModal(data)"
              ></font-awesome-icon>
              <font-awesome-icon
                v-b-tooltip.hover
                :icon="['fas', 'fa-trash']"
                style="cursor: pointer"
                title="Delete Device"
                @click="showDeleteDeviceModal(data)"
              ></font-awesome-icon>
            </div>
          </template>
        </b-table>
      </sensesiot-content-container>
    </b-container>
    <create-sensesiot-device-modal
      id="modal-create-device"
      :device-data="modalDeviceData"
      :credit-info="creditInfo"
      @ok="createDevice"
    ></create-sensesiot-device-modal>
    <edit-sensesiot-device-modal
      id="modal-edit-device"
      :device-data="modalDeviceData"
      @ok="editDevice"
    ></edit-sensesiot-device-modal>
    <delete-sensesiot-device-modal
      id="modal-delete-device"
      :device-data="modalDeviceData"
      :credit-info="creditInfo"
      @ok="deleteDevice"
    ></delete-sensesiot-device-modal>
  </sensesiot-base-container>
</template>

<script>
import CreateSensesiotDeviceModal from '~/components/modals/CreateSensesiotDeviceModal.vue'
import EditSensesiotDeviceModal from '~/components/modals/EditSensesiotDeviceModal.vue'
import DeleteSensesiotDeviceModal from '~/components/modals/DeleteSensesiotDeviceModal.vue'

import { getDefaultDeviceData } from '~/utils/device'
import { preditCredits } from '~/utils/utils'

export default {
  name: 'IotGaragePage',
  components: {
    CreateSensesiotDeviceModal,
    EditSensesiotDeviceModal,
    DeleteSensesiotDeviceModal
  },
  middleware: ['auth'],
  async asyncData({ $axios, store, error }) {
    try {
      const { devices } = await $axios.$get('/api/sensesiot/devices')

      return {
        devices
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get device data"
      })
    }
  },
  data() {
    return {
      creditInfo: {},
      keyword: '',
      devices: [],
      modalDeviceData: {
        name: '',
        model: ''
      }
    }
  },
  computed: {
    tableFields() {
      return [
        'deviceKey',
        {
          key: 'name',
          sortable: true
        },
        {
          key: 'model',
          sortable: true
        },
        'lastestUpdateTime',
        'actions'
      ]
    },
    filterDevices() {
      return this.devices.filter(
        (ele) =>
          ele.uid.startsWith(this.keyword) ||
          ele.name.includes(this.keyword) ||
          ele.model.includes(this.keyword)
      )
    }
  },
  methods: {
    preditCredits(additionList = {}) {
      return preditCredits(this.$axios, additionList)
    },
    async showCreateDeviceModal() {
      const { creditInfo } = await this.preditCredits({ device: 1 })
      this.creditInfo = creditInfo
      this.modalDeviceData = getDefaultDeviceData()
      this.$bvModal.show('modal-create-device')
    },
    async createDevice(deviceData) {
      try {
        const { device: newDevice } = await this.$axios.$post(
          '/api/sensesiot/device/add',
          deviceData
        )
        this.devices.push(newDevice)
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
          title: 'Error'
        })
      }
    },
    showEditDeviceModal({ item: deviceData }) {
      this.modalDeviceData = {
        ...getDefaultDeviceData(),
        ...deviceData
      }
      this.$bvModal.show('modal-edit-device')
    },
    async editDevice(deviceData) {
      if (!deviceData._id) {
        return
      }

      try {
        const deviceId = deviceData._id
        const editData = {
          ...deviceData
        }
        delete editData._id

        const { device: editDevice } = await this.$axios.$post(
          `/api/sensesiot/device/edit/${deviceId}`,
          editData
        )
        const index = this.devices.findIndex((ele) => ele._id === deviceId)
        if (index !== -1) {
          this.devices.splice(index, 1, editDevice)
        } else {
          this.devices.push(editDevice)
        }
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
          title: 'Error'
        })
      }
    },
    async showDeleteDeviceModal({ item: deviceData }) {
      this.modalDeviceData = {
        ...getDefaultDeviceData(),
        ...deviceData
      }

      const { creditInfo } = await this.preditCredits({
        device: -1
      })
      this.creditInfo = creditInfo
      this.$bvModal.show('modal-delete-device')
    },
    async deleteDevice(deviceId) {
      if (!deviceId) {
        return
      }

      try {
        await this.$axios.$post(`/api/sensesiot/device/delete/${deviceId}`)
        const index = this.devices.findIndex((ele) => ele._id === deviceId)
        if (index !== -1) {
          this.devices.splice(index, 1)
        }
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
          title: 'Error'
        })
      }
    },
    async copyDeviceKey({ item }) {
      try {
        await navigator.clipboard.writeText(item.deviceKey)
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style></style>
