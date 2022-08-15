export const state = () => ({
  authUser: null,
})

export const getters = {
  role(state) {
    if (!state.authUser || !state.authUser.role) {
      return 'guest'
    }

    return state.authUser.role
  },
}

export const mutations = {
  SET_USER(state, authUser) {
    state.authUser = authUser
  },
}

export const actions = {
  async nuxtServerInit({ dispatch, commit }, { $axios }) {
    const { userData } = await $axios.$get('/api/user')

    if (userData.role !== 'guest') {
      const { userInfo: sensesiot } = await $axios.$get('/api/sensesiot/user')
      userData.sensesiot = sensesiot
    }

    commit('SET_USER', userData)
  },
  async getUserData({ commit }) {
    const { userData } = await this.$axios.$get('/api/user')

    if (userData.role !== 'guest') {
      const { userInfo: sensesiot } = await this.$axios.$get(
        '/api/sensesiot/user'
      )
      userData.sensesiot = sensesiot
    }

    commit('SET_USER', userData)
  },
  async updateSensesiotPreferences({ state, dispatch }, newPreferences) {
    if (!state.authUser) {
      return
    }

    let preferences = state.authUser.sensesiot
      ? state.authUser.sensesiot.preferences
      : {}
    preferences = { ...preferences, ...newPreferences }

    await this.$axios.$post(
      '/api/sensesiot/user/update-preferences',
      preferences
    )

    await dispatch('getUserData')
  },
  async logout({ dispatch, commit }) {
    try {
      await this.$axios.$post('/api/logout')
      commit('SET_USER', null)
      this.$router.push('/')
    } catch (error) {
      let errorCode = 'client/error'
      if (error.response) {
        errorCode = 'server/error'
      }

      let errorMessage = error.message
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message
      }

      this.$bvModal.msgBoxOk(`[${errorCode}] : ${errorMessage}`, {
        title: 'Error',
      })
    }
  },
}
