<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <sensesiot-content-container>
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'fa-newspaper']" fixed-width />
          News
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
          <b-button variant="success" @click="showCreateNewsModal">
            <font-awesome-icon :icon="['fas', 'fa-plus']" />
            Create News
          </b-button>
        </div>
        <div
          class="d-flex flex-row flex-wrap align-items-center"
          style="gap: 0.5em"
        >
          <b-button
            variant="primary"
            title="First page"
            :disabled="page === 1"
            @click="setPage(1)"
          >
            <font-awesome-icon :icon="['fas', 'fa-angles-left']" />
          </b-button>
          <b-button
            variant="primary"
            title="Prev page"
            :disabled="page === 1"
            @click="setPage(page - 1)"
          >
            <font-awesome-icon :icon="['fas', 'fa-angle-left']" />
          </b-button>
          <div class="flex-fill text-center">
            Page: {{ page }} / {{ totalPages }}
          </div>
          <b-button
            variant="primary"
            title="Next page"
            :disabled="page === totalPages"
            @click="setPage(page + 1)"
          >
            <font-awesome-icon :icon="['fas', 'fa-angle-right']" />
          </b-button>
          <b-button
            variant="primary"
            title="Last page"
            :disabled="page === totalPages"
            @click="setPage(totalPages)"
          >
            <font-awesome-icon :icon="['fas', 'fa-angles-right']" />
          </b-button>
          <b-button @click="popupSetPage"> Go to... </b-button>
        </div>
        <b-card
          v-for="currentNews of filterNewsPage"
          :key="currentNews._id"
          class="my-2"
        >
          <b-card-title>{{ currentNews.name }} </b-card-title>
          <b-card-sub-title>
            <b-badge
              :variant="isPublish(currentNews) ? 'success' : 'secondary'"
            >
              {{ isPublish(currentNews) ? 'Published' : 'Private' }}
            </b-badge>
          </b-card-sub-title>
          <b-card-text class="d-flex flex-row flex-wrap my-2">
            <b-img
              :src="currentNews.publicImgUrl"
              height="200"
              :alt="currentNews.description || currentNews.name"
              class="mx-auto"
            ></b-img>
          </b-card-text>
          <b-card-text>
            Link to:
            <a
              v-if="currentNews.link"
              :href="currentNews.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ currentNews.link }}
              <font-awesome-icon
                :icon="['fas', 'arrow-up-right-from-square']"
              />
            </a>
            <em v-else>NONE</em>
          </b-card-text>
          <b-card-text
            class="mt-4 d-flex flex-row flex-wrap"
            style="gap: 0.5em"
          >
            <b-button
              variant="warning"
              :href="`/admin/news/${currentNews._id}/edit`"
            >
              <font-awesome-icon :icon="['fas', 'fa-pencil']" />
              Edit
            </b-button>
            <b-button
              variant="danger"
              @click="showDeleteNewsModal(currentNews)"
            >
              <font-awesome-icon :icon="['fas', 'fa-trash']" />
              Remove
            </b-button>
          </b-card-text>
        </b-card>
        <b-card v-if="news.length === 0" class="my-2">No News</b-card>
      </sensesiot-content-container>
    </b-container>
    <add-sensesiot-news-modal
      id="modal-create-news"
      :news-data="modalNewsData"
      @ok="createNews"
    ></add-sensesiot-news-modal>
    <delete-sensesiot-news-modal
      id="modal-delete-news"
      :news="modalNewsData"
      @ok="deleteNews"
    ></delete-sensesiot-news-modal>
  </sensesiot-base-container>
</template>

<script>
import AddSensesiotNewsModal from '~/components/modals/AddSensesiotNewsModal.vue'
import DeleteSensesiotNewsModal from '~/components/modals/DeleteSensesiotNewsModal.vue'
import { sortNews, getDefaultNewsData } from '~/utils/news'

export default {
  name: 'NewsAdminPage',
  components: {
    AddSensesiotNewsModal,
    DeleteSensesiotNewsModal,
  },
  middleware: ['authDev'],
  async asyncData({ $axios, error }) {
    try {
      const { news } = await $axios.$get('/api/news')
      news.sort(sortNews)
      return {
        news,
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get user stats info",
      })
    }
  },
  data() {
    return {
      news: [],
      modalNewsData: getDefaultNewsData(),
      filters: {
        published: 'all',
      },
      page: 1,
      itemPerPage: 10,
    }
  },
  computed: {
    filterPublishedOptions() {
      return [
        {
          text: 'All',
          value: 'all',
        },
        {
          text: 'Published',
          value: 'published',
        },
        {
          text: 'Private',
          value: 'private',
        },
      ]
    },
    totalPages() {
      return Math.max(1, Math.floor(this.filterNews.length / this.itemPerPage))
    },
    filterNews() {
      return this.news.filter((ele) => {
        if (
          this.filters.published === 'all' ||
          (this.filters.published === 'published' && ele.published) ||
          (this.filters.published === 'private' && !ele.published)
        ) {
          return true
        }

        return false
      })
    },
    filterNewsPage() {
      return this.filterNews.slice(
        this.itemPerPage * (this.page - 1),
        this.itemPerPage * this.page
      )
    },
  },
  methods: {
    popupSetPage() {
      const input = prompt(`Enter page (1 - ${this.totalPages})`)
      if (input) {
        const nthPage = parseInt(input, 10)
        if (Number.isInteger(nthPage) && nthPage > 0) {
          this.setPage(nthPage)
        }
      }
    },
    setPage(page) {
      this.page = Math.max(Math.min(page, this.totalPages), 1)
    },
    isPublish(news) {
      return news.published
    },
    showCreateNewsModal() {
      this.modalNewsData = getDefaultNewsData()

      this.$bvModal.show('modal-create-news')
    },
    async createNews(news) {
      try {
        // replaceTo
        const addData = new FormData()
        const keys = Object.keys(news)
        for (const key of keys) {
          addData.append(key, news[key])
        }

        const { news: newNews } = await this.$axios.$post(
          '/api/news/add',
          addData
        )

        this.news.unshift(newNews)
        this.news.sort(sortNews)

        this.$store.dispatch('getUserData')
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
    showDeleteNewsModal(news) {
      this.modalNewsData = JSON.parse(JSON.stringify(news))
      this.$bvModal.show('modal-delete-news')
    },
    async deleteNews(newsId) {
      if (!newsId) {
        return
      }

      try {
        await this.$axios.$post(`/api/news/delete/${newsId}`)

        const oldNewsIndex = this.news.findIndex((ele) => ele._id === newsId)
        if (oldNewsIndex !== -1) {
          this.news.splice(oldNewsIndex, 1)
        }
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
  },
}
</script>
