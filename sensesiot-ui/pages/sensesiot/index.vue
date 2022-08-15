<template>
  <sensesiot-base-container>
    <b-container class="mt-4 d-flex flex-column" style="flex-grow: 1">
      <b-jumbotron class="my-auto shadow-2 text-center">
        <h4>Redirecting...</h4>
      </b-jumbotron>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
export default {
  name: 'DashboardPage',
  middleware({ redirect }) {
    return redirect('/sensesiot/dashboard')
  },
}
</script>

<style></style>
