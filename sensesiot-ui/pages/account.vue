<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'user']" fixed-width />
          Account Info
        </h2>
        <div class="d-flex flex-row flex-wrap align-items-center my-2">
          <b-avatar :src="profilePicture" class="mr-1"></b-avatar>
          <span>{{ userDisplayName }}</span>
        </div>
        <template v-if="$store.getters.role !== 'guest'">
          <div class="my-2"><b>UID:</b> {{ authUser.uid }}</div>
          <div class="my-2"><b>Email:</b> {{ authUser.email }}</div>
          <div class="my-2"><b>Role:</b> {{ formatRole(authUser.role) }}</div>
          <div class="d-flex flex-row flex-wrap align-items-center my-2">
            <b class="mr-1">Coins:</b>
            <span class="mr-auto">{{ authUser.coins }}</span>
            <b-button variant="success" size="sm" href="/shop">
              <font-awesome-icon :icon="['fas', 'coins']" fixed-width />
              Buy More
            </b-button>
            <b-button size="sm" href="/redeem">
              <font-awesome-icon
                :icon="['fas', 'fa-ticket-simple']"
                fixed-width
              />
              Redeem
            </b-button>
          </div>
          <div class="my-2">
            <b>Lastest Login:</b>
            {{ formatDateTime(authUser.lastestLoginTime) }}
          </div>
          <div class="my-2 text-center">
            <b-button href="/transaction-history">Transaction History</b-button>
          </div>
          <div class="my-2 text-center">
            <b-overlay :show="logoutLoading">
              <b-button variant="danger" @click="logout">Logout</b-button>
            </b-overlay>
          </div>
        </template>
      </sensesiot-content-container>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
import { formatDateTime } from '~/utils/datetime'

export default {
  name: 'AccountInfoPage',
  middleware: ['auth'],
  data() {
    return {
      logoutLoading: false,
    }
  },
  computed: {
    authUser() {
      return this.$store.state.authUser
    },
    userDisplayName() {
      if (this.authUser) {
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
      if (this.authUser) {
        return this.authUser.photoURL
      }

      return ''
    },
  },
  methods: {
    formatRole(role) {
      if (typeof role !== 'string' || role.length === 0) {
        return role
      }
      const firstLetter = role.charAt(0).toUpperCase()
      return firstLetter + role.substring(1)
    },
    formatDateTime,
    async logout() {
      this.logoutLoading = true
      await this.$store.dispatch('logout')
      this.logoutLoading = false
    },
  },
}
</script>
