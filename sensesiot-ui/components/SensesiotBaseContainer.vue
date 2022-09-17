<template>
  <div class="d-flex flex-column screen-container">
    <b-navbar toggleable="md" type="light" variant="light" class="shadow-1">
      <b-navbar-brand class="d-inline-flex align-items-center gap-2" href="#">
        <img src="/icon.png" height="24" />
        <span class="font-weight-bold">SENSES</span>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <template v-if="isLogin">
            <b-nav-item-dropdown right>
              <template #button-content> SensesIoT </template>
              <b-dropdown-item href="/sensesiot/dashboard">
                Dashboard
              </b-dropdown-item>
              <b-dropdown-item href="/sensesiot/iotgarage">
                IoT Garage
              </b-dropdown-item>
              <b-dropdown-item href="/sensesiot/report">
                Report
              </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item href="/sensesiot/shop"> Shops </b-dropdown-item>
            </b-nav-item-dropdown>
            <template v-if="isDev">
              <b-nav-item-dropdown right>
                <template #button-content> Dev Menu </template>
                <b-dropdown-item href="/admin/redeem-code">
                  Redeem Code
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </template>
            <b-nav-item-dropdown right>
              <template #button-content>
                <b-avatar
                  size="sm"
                  :src="profilePicture"
                  class="mr-1"
                ></b-avatar>
                <span v-if="isSensesiotPages">
                  <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
                  {{ formatSensesiotCredit(authUser) }}
                </span>
                <span v-else>
                  <font-awesome-icon :icon="['fas', 'coins']" fixed-width />
                  {{ coins }}
                </span>
              </template>
              <b-dropdown-text>
                <span style="white-space: nowrap">
                  <b-avatar
                    size="sm"
                    :src="profilePicture"
                    class="mr-1"
                  ></b-avatar>
                  <span>{{ userDisplayName }}</span>
                </span>
              </b-dropdown-text>
              <template v-if="isSensesiotPages">
                <b-dropdown-divider></b-dropdown-divider>
                <b-dropdown-text>
                  <span>
                    <font-awesome-icon :icon="['fas', 'bolt']" fixed-width />
                    {{ formatSensesiotCredit(authUser, { withUnit: true }) }}
                  </span>
                </b-dropdown-text>
                <b-dropdown-item href="/sensesiot/shop">
                  More Credits
                </b-dropdown-item>
              </template>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-text>
                <span>
                  <font-awesome-icon :icon="['fas', 'coins']" fixed-width />
                  {{ coinsPretty }}
                </span>
              </b-dropdown-text>
              <b-dropdown-item variant="sucessful" href="/shop">
                Buy More
              </b-dropdown-item>
              <b-dropdown-item href="/redeem"> Redeem Code </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item href="/account"> Account Info </b-dropdown-item>
              <b-overlay :show="logoutLoading">
                <b-dropdown-item-button variant="danger" @click="logout">
                  Logout
                </b-dropdown-item-button>
              </b-overlay>
            </b-nav-item-dropdown>
          </template>
          <template v-else>
            <b-nav-item href="/login">Login</b-nav-item>
          </template>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <slot></slot>
  </div>
</template>

<script>
import { formatSensesiotCredit } from '~/utils/sensesiot-credits'

export default {
  data() {
    return { logoutLoading: false }
  },
  computed: {
    isLogin() {
      return this.$store.getters.role !== 'guest'
    },
    isDev() {
      return this.$store.getters.role === 'developer'
    },
    authUser() {
      return this.$store.state.authUser
    },
    userDisplayName() {
      if (this.isLogin) {
        if (this.authUser.displayName) {
          return this.authUser.displayName
        }

        if (this.authUser.email) {
          return this.authUser.email
        }

        return 'User'
      }

      return 'Guest'
    },
    profilePicture() {
      if (this.isLogin) {
        return this.authUser.photoURL
      }

      return ''
    },
    coins() {
      if (this.isLogin) {
        return this.authUser.coins
      }

      return '-'
    },
    coinsPretty() {
      const coins = this.coins
      if (coins !== '-') {
        if (coins === 1) {
          return `${coins} Coins`
        }

        return `${coins} Coin`
      }

      return coins
    },
    isSensesiotPages() {
      return this.$route.path.startsWith('/sensesiot')
    },
  },
  methods: {
    formatSensesiotCredit,
    async logout() {
      this.logoutLoading = true
      await this.$store.dispatch('logout')
      this.logoutLoading = false
    },
  },
}
</script>

<style scoped>
.screen-container {
  min-height: 100vh;
  background-color: rgb(204, 204, 204);
}
.gap-2 {
  column-gap: 0.5rem;
}
</style>
