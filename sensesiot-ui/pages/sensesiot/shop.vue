<template>
  <sensesiot-base-container>
    <b-container class="mt-4" style="flex-grow: 1">
      <b-jumbotron class="shadow-2">
        <h2 class="text-center mb-4">
          <font-awesome-icon :icon="['fas', 'shop']" fixed-width />
          Credit Shop
        </h2>
        <b-row>
          <b-col v-for="product of products" :key="product._id" md="6">
            <b-card class="d-flex flex-column items-center text-center mb-2">
              <h4 class="mb-2">{{ product.name }}</h4>
              <font-awesome-icon
                :icon="['fas', 'bolt']"
                class="my-4"
                style="font-size: 3em"
                fixed-width
              />
              <div class="mb-1">
                <s
                  v-if="!isPriceEqual(product.originalPrice, product.price)"
                  class="mr-1"
                  style="font-size: 0.8em"
                >
                  <font-awesome-icon
                    :icon="['fas', 'fa-coins']"
                    fixed-width
                  ></font-awesome-icon>
                  {{ formatCurrency(product.originalPrice) }}
                </s>
                <span>
                  <font-awesome-icon
                    :icon="['fas', 'fa-coins']"
                    fixed-width
                  ></font-awesome-icon>
                  {{ formatCurrency(product.price) }}
                </span>
              </div>
              <div>
                <b-button
                  v-b-modal.modal-credit-confirm
                  variant="success"
                  :disabled="!isLogin"
                  @click="selectProduct = product"
                >
                  Buy
                </b-button>
              </div>
            </b-card>
          </b-col>
        </b-row>
      </b-jumbotron>
    </b-container>
    <b-modal
      id="modal-credit-confirm"
      centered
      title="Confirm"
      no-stacking
      ok-variant="success"
      @ok="buyCoin"
    >
      <template v-if="selectProduct">
        <p class="my-2">
          Are you sure about buy <i>[{{ selectProduct.name }}]</i>
        </p>
        <p class="my-2">
          <b>Name:</b>
          <span>{{ selectProduct.name }}</span>
        </p>
        <p class="my-2">
          <b>Price:</b>
          <s
            v-if="
              !isPriceEqual(selectProduct.originalPrice, selectProduct.price)
            "
            class="mr-1"
            style="font-size: 0.8em"
          >
            {{ formatCurrency(selectProduct.originalPrice) }}
          </s>
          <span>
            {{ formatCurrency(selectProduct.price) }}
            <font-awesome-icon
              :icon="['fas', 'fa-coins']"
              fixed-width
            ></font-awesome-icon>
          </span>
        </p>
      </template>
    </b-modal>
    <b-modal
      id="modal-credit-success"
      centered
      title="Success"
      no-stacking
      ok-only
    >
      <template v-if="selectProduct">
        <p class="my-2">You transaction {{ transactionId }} complete!</p>
        <p class="my-2">
          <b>Name:</b>
          <span>{{ selectProduct.name }}</span>
        </p>
        <p class="my-2">
          <b>Price:</b>
          <span>
            {{ formatCurrency(selectProduct.price) }}
            <font-awesome-icon
              :icon="['fas', 'fa-coins']"
              fixed-width
            ></font-awesome-icon>
          </span>
        </p>
      </template>
    </b-modal>
    <b-modal
      id="modal-credit-failed"
      centered
      title="Failed"
      no-stacking
      ok-only
    >
      <template v-if="selectProduct">
        <p class="my-2">
          You transaction {{ transactionId }} failed, please contact admin
        </p>
        <p class="my-2"><b>Cause:</b> {{ errorCause }}</p>
        <p class="my-2">
          <b>Name:</b>
          <span>{{ selectProduct.name }}</span>
        </p>
        <p class="my-2">
          <b>Price:</b>
          <span>
            {{ formatCurrency(selectProduct.price) }}
            <font-awesome-icon
              :icon="['fas', 'fa-coins']"
              fixed-width
            ></font-awesome-icon>
          </span>
        </p>
      </template>
    </b-modal>
  </sensesiot-base-container>
</template>

<script>
import { formatCurrency, isPriceEqual } from '~/utils/price'

export default {
  name: 'SensesiotShopPage',
  middlewares: ['auth'],
  async asyncData({ $axios, error }) {
    try {
      const { products } = await $axios.$get('/api/sensesiot/shop/credits')
      return {
        products,
      }
    } catch (err) {
      error({
        statusCode: 500,
        message: "Can't get shop page",
      })
    }
  },
  data() {
    return {
      products: [],
      selectProduct: null,
      resultTransaction: null,
      errorCause: '',
    }
  },
  computed: {
    role() {
      return this.$store.getters.role
    },
    isLogin() {
      return this.$store.getters.role !== 'guest'
    },
    transactionId() {
      return this.resultTransaction ? `(#${this.resultTransaction._id})` : ''
    },
  },
  methods: {
    isPriceEqual,
    formatCurrency,
    async buyCoin(ev) {
      if (!this.selectProduct) {
        return
      }

      try {
        const { transaction } = await this.$axios.$post(
          '/api/sensesiot/shop/buy',
          {
            productId: this.selectProduct._id,
          }
        )
        this.resultTransaction = transaction
        await this.$store.dispatch('getUserData')
        this.$bvModal.show('modal-credit-success')
      } catch (err) {
        if (err.response) {
          console.error(err.response.data)
          this.errorCause = err.response.data
            ? err.response.data.message
            : err.message
        } else {
          this.errorCause = err.message
          console.error(err)
        }

        this.$bvModal.show('modal-credit-failed')
      }
    },
  },
}
</script>
