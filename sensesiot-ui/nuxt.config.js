import dotenv from 'dotenv'
import firebaseConfig from './firebase.config'

dotenv.config()

export default {
  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3055,
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'SENSES - Industrial Internet of Things platform',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'SENSES - Industrial Internet of Things platform',
      },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/fontawesome.js',
    '~/plugins/vuescroll.js',
    { src: '~/plugins/vueslider.js', mode: 'client' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/proxy',
    '@nuxtjs/firebase',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    proxy: true,
  },
  proxy: {
    '/api': {
      target: process.env.API_PROXY_SERVER || 'http://localhost:3056',
      ws: true,
      pathRewrite: { '^/api': '' },
    },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      name: 'Sensesiot',
      description: 'Sensesiot Platform',
      author: 'Logisenses',
      lang: 'th',
    },
    importScripts: ['/firebase-auth-sw.js'],
    dev: process.env.NODE_ENV === 'development',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['vue-chartjs'],
  },

  firebase: {
    config: firebaseConfig,
    services: {
      auth: true,
    },
  },
}
