<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <b-jumbotron class="shadow-2">
        <template #header>
          <b-img
            src="~/assets/senses-logo.png"
            fluid
            alt="SENSES"
            class="mb-4 senses-logo"
          ></b-img>
        </template>
        <template #lead>
          <b style="color: rgb(61, 115, 99)">Internet of things</b> platform
          tower digital twin technology.
        </template>
        <p class="mt-2 lead">
          Customization controllable dashboard and report for
          <b style="color: rgb(148, 94, 1)"> Internet of Things device. </b>
        </p>
        <b-button
          variant="success"
          :href="isLogin ? '/sensesiot/dashboard' : '/login'"
        >
          Get Started
        </b-button>
        <b-button
          href="https://github.com/chan1sook/SensesiotProtocolLib"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Firmware
        </b-button>
      </b-jumbotron>
      <b-jumbotron class="shadow-2">
        <h2 class="text-center mb-4">What is "SENSES"</h2>
        <p class="lead text-center mb-1">
          The best Internet of Things platform for Data logger, Customization
          dashboard and Device social sharing.
        </p>
        <p class="lead text-center mb-4">
          We provided a IoT system solution for industrial work and professional
          using.
        </p>
        <b-row>
          <b-col md class="text-center">
            <font-awesome-icon
              :icon="['fas', 'industry']"
              class="icon-feature mb-2"
              fixed-width
            />
            <p class="font-weight-bold mb-2">Industry connected</p>
            <p>
              Compatible with industry device. MODBUS, RS485, RS232 and more.
            </p>
          </b-col>
          <b-col md class="text-center">
            <font-awesome-icon
              :icon="['fas', 'chart-area']"
              class="icon-feature mb-2"
              fixed-width
            />
            <p class="font-weight-bold mb-2">Drag & Drop dashboard</p>
            <p>
              Design and custom your dashboard with many widgets. Drag/Drop
              style.
            </p>
          </b-col>
          <b-col md class="text-center">
            <font-awesome-icon
              :icon="['fas', 'paper-plane']"
              class="icon-feature mb-2"
              fixed-width
            />
            <p class="font-weight-bold mb-2">API</p>
            <p>Quick interface your service with our API.</p>
          </b-col>
          <b-col md class="text-center">
            <font-awesome-icon
              :icon="['fas', 'share-alt']"
              class="icon-feature mb-2"
              fixed-width
            />
            <p class="font-weight-bold mb-2">Share your Device or Dashbaord</p>
            <p>Available sharing device and dashboard to your team.</p>
          </b-col>
        </b-row>
      </b-jumbotron>
      <b-jumbotron class="shadow-2">
        <h2 class="text-center mb-4">Contact</h2>
        <p class="lead text-center mb-4">
          Lets get in touch. Send us a message
        </p>
        <p>
          <font-awesome-icon
            :icon="['fas', 'map-marker']"
            class="mr-2 icon-list-start"
            fixed-width
          />
          Logisenses Co.,Ltd. 88/5-2, Tambon Khlong Song, Amphoe Khlong Luang,
          Pathumthani, 12120
        </p>
        <p>
          <a
            href="https://www.facebook.com/SensesIoT/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <font-awesome-icon
              :icon="['fab', 'facebook']"
              class="mr-2 icon-list-start"
              fixed-width
            />
            Senses Facebook Page
          </a>
        </p>
        <p>
          <a
            href="https://www.facebook.com/senses.open"
            target="_blank"
            rel="noopener noreferrer"
          >
            <font-awesome-icon
              :icon="['fab', 'facebook']"
              class="mr-2 icon-list-start"
              fixed-width
            />
            Senses Open Facebook Page
          </a>
        </p>
      </b-jumbotron>
    </b-container>
    <div class="px4 py-2 text-center bg-dark text-light shadow-1">
      &copy;&nbsp;Copyright {{ currentYear }} | SENSES Innovation
    </div>
  </sensesiot-base-container>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {}
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
    isLogin() {
      return this.$store.getters.role !== 'guest'
    },
  },
}
</script>

<style scoped>
.icon-feature {
  font-size: 3em;
}
.senses-logo {
  max-width: 300px;
}

.icon-list-start {
  font-size: 2em;
  vertical-align: middle;
}

a {
  text-decoration: none;
}
</style>
