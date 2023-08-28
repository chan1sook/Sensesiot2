<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'fa-newspaper']" fixed-width />
          Ads Manager
        </h2>
        <div
          class="d-flex flex-row flex-wrap justify-center my-2 mt-4"
          style="gap: 0.5em"
        >
          <div class="flex-fill" style="flex-basis: 200px">
            <b-select
              v-model="filters.published"
              :options="filterPublishedOptions"
              @change="setPage(1)"
            >
            </b-select>
          </div>
          <div class="flex-fill" style="flex-basis: 200px">
            <b-select
              v-model="filters.active"
              :options="filterActiveOptions"
              @change="setPage(1)"
            >
            </b-select>
          </div>
          <b-button variant="success" @click="showCreateAdsModal">
            <font-awesome-icon :icon="['fas', 'fa-plus']" />
            Create Ads
          </b-button>
        </div>
        <PagesControl
          :value="page"
          :total="totalPages"
          @change-page="setPage"
        ></PagesControl>
        <b-card
          v-for="currentAds of filterAdsPage"
          :key="currentAds._id"
          class="my-2"
        >
          <b-card-title>{{ currentAds.name }}</b-card-title>
          <b-card-sub-title>
            <b-badge :variant="isActive(currentAds) ? 'success' : 'secondary'">
              {{ isActive(currentAds) ? 'Active' : 'Inactive' }}
            </b-badge>
          </b-card-sub-title>
          <lite-youtube
            :videoid="currentAds.ytVidId"
            class="my-2"
          ></lite-youtube>
          <b-card-text>
            Length: {{ formatDuration(currentAds.durationSec) }}
          </b-card-text>
          <b-card-text>
            Cost per Quota: {{ currentAds.costPerQuota }}
          </b-card-text>
          <b-card-text>
            Total Visited Count: {{ currentAds.visitedCount }}
          </b-card-text>
          <b-card-text>
            Remain Quota: {{ currentAds.remainQuota }}
          </b-card-text>
          <b-card-text
            class="mt-4 d-flex flex-row flex-wrap"
            style="gap: 0.5em"
          >
            <b-button variant="success" @click="refillAdsQuota(currentAds)">
              <font-awesome-icon :icon="['fas', 'fa-plus']" />
              Refill Quota
            </b-button>
            <b-button
              variant="warning"
              :href="`/admin/news/${currentAds._id}/edit`"
            >
              <font-awesome-icon :icon="['fas', 'fa-pencil']" />
              Edit
            </b-button>
            <b-button variant="danger" @click="showDeleteNewsModal(currentAds)">
              <font-awesome-icon :icon="['fas', 'fa-trash']" />
              Remove
            </b-button>
          </b-card-text>
        </b-card>
        <b-card v-if="ads.length === 0" class="my-2">No Ads</b-card>
      </sensesiot-content-container>
    </b-container>
    <add-sensesiot-ads-modal
      id="modal-create-ads"
      :ads-data="modalAdsData"
      @ok="createAds"
    ></add-sensesiot-ads-modal>
  </sensesiot-base-container>
</template>

<script>
import PagesControl from '~/components/PagesControl.vue'
import AddSensesiotAdsModal from '~/components/modals/AddSensesiotAdsModal.vue'
import { getDefaultAdsData, sortAds } from '~/utils/ads'

// TODO get credit cost here
export default {
  name: 'AdsManagerPage',
  components: {
    PagesControl,
    AddSensesiotAdsModal
  },
  middleware: ['authManager'],
  async asyncData({ $axios, error }) {
    try {
      const { ads } = await $axios.$get('/api/ads/ads')
      ads.sort(sortAds)
      return {
        ads
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get ads"
      })
    }
  },
  data() {
    return {
      ads: [],
      filters: {
        published: 'all',
        active: 'all'
      },
      modalAdsData: getDefaultAdsData(),
      page: 1,
      itemPerPage: 10
    }
  },
  head: {
    script: [
      {
        src: 'https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@1.5.0/lite-youtube.js',
        type: 'module'
      }
    ]
  },
  computed: {
    filterPublishedOptions() {
      return [
        {
          text: 'All',
          value: 'all'
        },
        {
          text: 'Published',
          value: 'published'
        },
        {
          text: 'Private',
          value: 'private'
        }
      ]
    },
    filterActiveOptions() {
      return [
        {
          text: 'All',
          value: 'all'
        },
        {
          text: 'Active',
          value: 'active'
        },
        {
          text: 'Inactive',
          value: 'inactive'
        }
      ]
    },
    totalPages() {
      return Math.max(1, Math.floor(this.filterAds.length / this.itemPerPage))
    },
    filterAds() {
      return this.ads.filter((ele) => {
        if (
          (this.filters.published !== 'all' &&
            this.filters.published === 'published' &&
            !ele.published) ||
          (this.filters.published === 'private' && ele.published)
        ) {
          return false
        }

        if (
          this.filters.active === 'all' ||
          (this.filters.active === 'active' && this.isActive(ele)) ||
          (this.filters.active === 'inactive' && !this.isActive(ele))
        ) {
          return true
        }

        return false
      })
    },
    filterAdsPage() {
      return this.filterAds.slice(
        this.itemPerPage * (this.page - 1),
        this.itemPerPage * this.page
      )
    }
  },
  mounted() {
    this.syncQuotaCost()
  },
  methods: {
    isActive(ads) {
      return ads.remainQuota > 0
    },
    formatDuration(duration) {
      const min = Math.floor(duration / 60)
      const sec = duration % 60
      let secStr = `${sec}`
      if (sec < 10) {
        secStr = '0' + secStr
      }
      let minStr = `${min}`
      if (min < 10) {
        minStr = '0' + minStr
      }
      return `${minStr}:${secStr}`
    },
    getQuotaCostPerAd(ads) {
      if (this.creditCosts.videoCreditCostPerMin) {
        return
      }
      return 0
    },
    setPage(page) {
      this.page = Math.max(Math.min(page, this.totalPages), 1)
    },
    async syncQuotaCost() {
      try {
        const { costs } = await this.$axios.$post('/api/ads/credits/costs')

        if (Number.isFinite(costs.videoCreditCostPerMin)) {
          for (const ads of this.ads) {
            let cost = costs.videoCreditCostPerMin * (ads.durationSec / 60)
            cost = Math.floor(cost)
            ads.costPerQuota = cost
          }
          this.$forceUpdate()
        }
      } catch (err) {
        console.error(err)
      }
    },
    showCreateAdsModal() {
      this.modalNewsData = getDefaultAdsData()

      this.$bvModal.show('modal-create-ads')
    },
    async createAds(ads) {
      try {
        const { ads: newAds } = await this.$axios.$post('/api/ads/ads/add', ads)

        this.ads.unshift(newAds)
        this.ads.sort(sortAds)

        this.$store.dispatch('getUserData')
        this.syncQuotaCost()
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
    refillAdsQuota(ads) {
      // TODO add Modal
    },
    showDeleteNewsModal(ads) {
      // TODO add Modal
    }
  }
}
</script>
