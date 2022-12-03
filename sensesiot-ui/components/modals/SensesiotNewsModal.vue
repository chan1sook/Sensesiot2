<template>
  <b-modal
    :id="id"
    centered
    title="News"
    size="lg"
    no-stacking
    ok-only
    @ok="onClose"
    @cancel="onClose"
  >
    <b-carousel
      id="carousel-1"
      controls
      indicators
      background="#ababab"
      img-width="1024"
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
                width="1024"
                height="400"
                :src="currentNews.publicImgUrl"
                :alt="currentNews.name"
                :title="currentNews.description || currentNews.name"
                style="object-fit: cover"
              />
            </a>
            <img
              v-else
              class="d-block w-100"
              width="1024"
              height="400"
              :src="currentNews.publicImgUrl"
              :alt="currentNews.name"
              :title="currentNews.description || currentNews.name"
              style="object-fit: cover"
            />
          </template>
        </b-carousel-slide>
      </template>
      <b-carousel-slide
        v-else
        caption="No News"
        img-src="https://picsum.photos/1024/480/?image=24"
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
    skipPopupToday: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      skip: false,
    }
  },
  watch: {
    skipPopupToday: {
      immediate: true,
      handler(value) {
        this.skip = value
      },
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
