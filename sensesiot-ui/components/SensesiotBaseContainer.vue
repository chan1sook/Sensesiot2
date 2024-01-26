<template>
  <div class="d-flex flex-column screen-container">
    <b-navbar toggleable="md" type="light" variant="light" class="shadow-1">
      <b-navbar-brand class="d-inline-flex align-items-center gap-2" href="/">
        <img src="/icon.png" height="24" />
        <span class="font-weight-bold">SENSES</span>
        <span class="font-weight-bold text-sm">V1.0</span>
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
              <b-dropdown-item href="https://github.com/chan1sook/SensesiotProtocolLib" target="_blank"
                rel="noopener noreferrer">
                Get Firmware
              </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item href="/sensesiot/shop"> Shops </b-dropdown-item>
            </b-nav-item-dropdown>
            <template v-if="isManager">
              <b-nav-item href="/ads">Ads</b-nav-item>
            </template>
            <template v-if="isDev">
              <b-nav-item-dropdown right>
                <template #button-content> Dev Menu </template>
                <b-dropdown-item href="/admin/user-stats">
                  User Stats
                </b-dropdown-item>
                <b-dropdown-item href="/admin/news">
                  Manage News
                </b-dropdown-item>
                <b-dropdown-item href="/admin/redeem-code">
                  Redeem Code
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </template>
            <b-nav-item href="https://learn.sensesiot.net/"> Wiki </b-nav-item>
            <b-nav-item-dropdown right>
              <template #button-content>
                <b-avatar size="sm" :src="profilePicture" class="mr-1"></b-avatar>
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
                  <b-avatar size="sm" :src="profilePicture" class="mr-1"></b-avatar>
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
              <b-dropdown-item href="/redeem"> Redeem Code </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item @click="refreshShowNewsPopup">
                News
              </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item href="/account"> Account Info </b-dropdown-item>
              <b-overlay :show="logoutLoading">
                <b-dropdown-item-button variant="danger" @click="logout">
                  Logout
                </b-dropdown-item-button>
              </b-overlay>
            </b-nav-item-dropdown>
          </template>
          <template v-if="!isLogin">
            <b-nav-item href="https://learn.sensesiot.net/"> Wiki </b-nav-item>
            <b-nav-item href="/login">Login</b-nav-item>
          </template>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <slot></slot>
    <sensesiot-news-modal id="modal-news" :news="news" :offset="newsOffset" :avaliable="avaliableNews"
      :skip-popup-today="skipPopupToday" @close="closeNews">
    </sensesiot-news-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import SensesiotNewsModal from '~/components/modals/SensesiotNewsModal.vue'
import { formatSensesiotCredit } from '~/utils/sensesiot-credits'
import { sortNews } from '~/utils/news'

export default {
  components: {
    SensesiotNewsModal
  },
  data() {
    return {
      logoutLoading: false,
      avaliableNews: false,
      skipPopupToday: false,
      news: [],
      newsOffset: 0
    }
  },
  computed: {
    isLogin() {
      return this.$store.getters.role !== 'guest'
    },
    isManager() {
      return ['developer', 'adsmanager'].includes(this.$store.getters.role)
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
    }
  },
  mounted() {
    this.triggerShowNews()
  },
  methods: {
    formatSensesiotCredit,
    async triggerShowNews() {
      if (this.$route.path === '/' && window.localStorage) {
        const rawNewsInfo = window.localStorage.getItem('sensesiot-news')
        const newsInfo = {
          skipShowBefore: Date.now(),
          lastestNews: null,
          offset: 0
        }

        if (rawNewsInfo) {
          Object.assign(newsInfo, JSON.parse(rawNewsInfo))
        }

        this.skipPopupToday = Date.now() < newsInfo.skipShowBefore
        this.newsOffset = newsInfo.offset

        if (Date.now() >= newsInfo.skipShowBefore) {
          await this.fetchNews()

          if (
            this.news.length > 0 &&
            newsInfo.lastestNews === this.news[0]._id
          ) {
            this.newsOffset = (this.newsOffset + 1) % this.news.length
          } else {
            this.newsOffset = 0
          }

          if (this.news.length > 0) {
            this.$bvModal.show('modal-news')
          }
        }
      }
    },
    async refreshShowNewsPopup() {
      await this.fetchNews()
      this.$bvModal.show('modal-news')
    },
    async fetchNews() {
      try {
        const { news } = await this.$axios.$get(
          '/api/news?onlyPublish&limit=10'
        )
        news.sort(sortNews)
        this.news = news
        this.avaliableNews = true
      } catch (err) {
        console.error(err)
        this.avaliableNews = false
      }
    },
    async logout() {
      this.logoutLoading = true
      await this.$store.dispatch('logout')
      this.logoutLoading = false
    },
    closeNews(skipPopupToday) {
      this.skipPopupToday = skipPopupToday

      if (!window.localStorage) {
        return
      }
      const newsInfo = {
        skipShowBefore: Date.now(),
        lastestNews: this.news[0] ? this.news[0]._id : null,
        offset: this.newsOffset || 0
      }
      if (skipPopupToday) {
        newsInfo.skipShowBefore = dayjs()
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .add(1, 'day')
          .valueOf()
      }
      window.localStorage.setItem('sensesiot-news', JSON.stringify(newsInfo))
    }
  }
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

.text-sm {
  font-size: 0.875rem;
  /* 14px */
  line-height: 1.25rem;
  /* 20px */
}
</style>
