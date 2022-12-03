<template>
  <b-modal
    :id="id"
    centered
    title="Add News/Promotion"
    no-stacking
    ok-only
    :ok-disabled="!isNewsDataValid"
    @ok="onOk"
  >
    <b-form-group label="Name">
      <b-input v-model="modalNewsData.name" type="text"></b-input>
    </b-form-group>
    <b-form-group label="Alt Description">
      <b-input v-model="modalNewsData.description" type="text"></b-input>
    </b-form-group>
    <b-form-group label="Image">
      <b-form-file
        v-model="imageFile"
        placeholder="Choose a file or drop it here..."
        drop-placeholder="Drop file here..."
      ></b-form-file>
      <b-form-text>Recommend Size 1024x480</b-form-text>
    </b-form-group>
    <b-form-group v-if="imageFileURL" label="Preview Image">
      <b-img :src="imageFileURL" height="200"></b-img>
    </b-form-group>
    <b-form-group label="Image Link">
      <b-input v-model="modalNewsData.link" type="text"></b-input>
      <b-form-text>Optional</b-form-text>
    </b-form-group>
    <b-form-group>
      <b-form-checkbox
        v-model="modalNewsData.published"
        :value="true"
        :uncheck-value="false"
      >
        Published
      </b-form-checkbox>
    </b-form-group>
  </b-modal>
</template>

<script>
import isURL from 'validator/lib/isURL'

export default {
  name: 'AddSensesiotNewsModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    newsData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      modalNewsData: {},
      imageFile: null,
      imageFileURL: null,
    }
  },
  computed: {
    isNewsDataValid() {
      return (
        this.modalNewsData.name !== '' && this.imageFile && this.isLinkValid
      )
    },
    isLinkValid() {
      return !this.modalNewsData.link || isURL(this.modalNewsData.link)
    },
  },
  watch: {
    newsData: {
      immediate: true,
      handler(value) {
        this.modalNewsData = JSON.parse(JSON.stringify(value))
      },
    },
    imageFile(value) {
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
  methods: {
    onOk() {
      const data = JSON.parse(JSON.stringify(this.modalNewsData))
      data.imageFile = this.imageFile
      this.$emit('ok', data)
    },
  },
}
</script>

<style></style>
