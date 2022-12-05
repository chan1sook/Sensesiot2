<template>
  <sensesiot-base-container>
    <b-container class="mt-4 d-flex flex-column" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'fa-newspaper']" fixed-width />
          Edit News
        </h2>
        <b-form-group label="Name">
          <b-input v-model="editedNewsData.name" type="text"></b-input>
        </b-form-group>
        <b-form-group label="Alt Description">
          <b-input v-model="editedNewsData.description" type="text"></b-input>
        </b-form-group>
        <b-form-group label="Original Image">
          <b-img
            :src="news.publicImgUrl"
            height="200"
            :alt="news.description || news.name"
          ></b-img>
        </b-form-group>
        <b-form-group label="Replaced Image">
          <b-form-file
            v-model="replacedFile"
            placeholder="Choose a file or drop it here..."
            drop-placeholder="Drop file here..."
          ></b-form-file>
          <b-form-text>Optional; Recommend Size 766x400</b-form-text>
        </b-form-group>
        <b-form-group v-if="imageFileURL" label="Preview Image">
          <b-img :src="imageFileURL" height="200"></b-img>
        </b-form-group>
        <b-form-group label="Image Link">
          <b-input v-model="editedNewsData.link" type="text"></b-input>
          <b-form-text>Optional</b-form-text>
        </b-form-group>
        <b-form-group>
          <b-form-checkbox
            v-model="editedNewsData.published"
            :value="true"
            :uncheck-value="false"
          >
            Published
          </b-form-checkbox>
        </b-form-group>
        <div
          class="d-flex flex-row justify-self-center align-items-center my-2 mt-4"
        >
          <b-button
            class="mx-auto"
            variant="success"
            :disabled="!isNewsDataValid"
            @click="editNewsData"
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
import isURL from 'validator/lib/isURL'

export default {
  name: 'NewsEditPage',
  middleware: ['authDev'],
  async asyncData({ $axios, params, error }) {
    try {
      const { news } = await $axios.$get(`/api/news/${params.id}`)

      return {
        news,
        editedNewsData: JSON.parse(JSON.stringify(news)),
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get news data",
      })
    }
  },
  data() {
    return {
      news: {},
      editedNewsData: {},
      replacedFile: null,
      imageFileURL: null,
    }
  },
  computed: {
    assignedCode() {
      return this.editedNewsData.codes.reduce((prev, current) => {
        if (current.assigned) {
          return prev + 1
        }
        return prev
      }, 0)
    },
    usedCode() {
      return this.editedNewsData.codes.reduce((prev, current) => {
        if (current.used) {
          return prev + 1
        }
        return prev
      }, 0)
    },
    isNewsDataValid() {
      return this.editedNewsData.name !== '' && this.isLinkValid
    },
    isLinkValid() {
      return !this.editedNewsData.link || isURL(this.editedNewsData.link)
    },
  },
  watch: {
    replacedFile(value) {
      if (this.imageFileURL) {
        URL.revokeObjectURL(this.imageFileURL)
      }

      if (value) {
        this.imageFileURL = URL.createObjectURL(value)
      } else {
        this.imageFileURL = null
      }
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
        this.editedNewsData = JSON.parse(JSON.stringify(this.news))
      }
    },
    async editNewsData() {
      if (!this.isNewsDataValid) {
        return
      }
      try {
        const newsId = this.editedNewsData._id
        const editData = new FormData()
        if (this.replacedFile) {
          editData.append('replacedFile', this.replacedFile)
        }

        const keys = Object.keys(this.editedNewsData)
        for (const key of keys) {
          switch (key) {
            case '_id':
            case 'publicImgUrl':
              break
            default:
              editData.append(key, this.editedNewsData[key])
              break
          }
        }

        const { news } = await this.$axios.$post(
          `/api/news/edit/${newsId}`,
          editData
        )

        this.news = news
        this.editedNewsData = JSON.parse(JSON.stringify(news))

        this.$store.dispatch('getUserData')

        this.$router.push('/admin/news')
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
