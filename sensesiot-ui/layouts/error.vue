<template>
  <sensesiot-base-container>
    <b-container class="mt-4 d-flex flex-column" style="flex-grow: 1">
      <b-jumbotron class="my-auto shadow-2 text-center">
        <h2>{{ statusCode }}</h2>
        <div class="mb-2">{{ message }}</div>
        <a href="/">Back to Index</a>
      </b-jumbotron>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
export default {
  name: 'NuxtError',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  computed: {
    statusCode() {
      return (this.error && this.error.statusCode) || 500
    },
    message() {
      return this.error.message || 'Internal Server Error'
    },
  },
}
</script>
