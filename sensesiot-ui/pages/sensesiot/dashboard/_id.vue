<template>
  <div>Public Here</div>
</template>

<script>
export default {
  name: 'PublicDashboardPage',
  asyncData({ $axios, error }) {
    error({
      statusCode: 403,
      message: 'Forbidden',
    })
  },
}
</script>

<style></style>
