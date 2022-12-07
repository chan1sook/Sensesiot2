<template>
  <b-modal
    :id="id"
    centered
    title="News"
    size="lg"
    no-stacking
    ok-only
    @ok="onClose"
    @close="onClose"
  >
    <b-carousel
      id="carousel-1"
      v-model="caroselOffset"
      controls
      indicators
      :interval="5000"
      background="#ababab"
      img-width="766"
      img-height="400"
    >
      <template v-if="avaliable && news.length > 0">
        <b-carousel-slide v-for="currentNews of news" :key="currentNews._id">
          <template #img>
            <a
              v-if="currentNews.link"
              :href="currentNews.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                class="d-block w-100"
                width="766"
                height="400"
                :src="currentNews.publicImgUrl"
                :alt="currentNews.name"
                :title="currentNews.description || currentNews.name"
                style="object-fit: contain"
              />
            </a>
            <img
              v-else
              class="d-block w-100"
              width="766"
              height="400"
              :src="currentNews.publicImgUrl"
              :alt="currentNews.name"
              :title="currentNews.description || currentNews.name"
              style="object-fit: contain"
            />
          </template>
        </b-carousel-slide>
      </template>
      <b-carousel-slide
        v-else
        caption="No News"
        img-src="https://picsum.photos/766/400/?image=24"
      ></b-carousel-slide>
    </b-carousel>
    <div class="mt-2 text-center">
      <b-form-checkbox v-model="skip" :value="true" :unchecked-value="false">
        Skip popup today
      </b-form-checkbox>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'NewsModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    avaliable: {
      type: Boolean,
      default: false,
    },
    news: {
      type: Array,
      default() {
        return []
      },
    },
    offset: {
      type: Number,
      default: 0,
    },
    skipPopupToday: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      skip: false,
      caroselOffset: this.offset,
    }
  },
  watch: {
    skipPopupToday: {
      immediate: true,
      handler(value) {
        this.skip = value
      },
    },
    offset(value) {
      this.caroselOffset = value
    },
  },
  methods: {
    onClose() {
      this.$emit('close', this.skip)
    },
  },
}
</script>

<style></style>
