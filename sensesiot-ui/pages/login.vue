<template>
  <sensesiot-base-container>
    <b-container class="mt-4 d-flex flex-column" style="flex-grow: 1">
      <b-overlay :show="loading">
        <b-jumbotron class="my-auto shadow-2">
          <h2 class="text-center mb-4">
            <template v-if="registerMode">Register</template>
            <template v-else>Login</template>
          </h2>
          <form @submit.prevent="submitForm">
            <b-form-group
              id="fieldset-email"
              label="Email"
              label-for="input-email"
              :invalid-feedback="invalidEmailFeedback"
              :state="emailFormState"
            >
              <b-form-input
                id="input-email"
                v-model="email"
                type="email"
                :state="emailFormState"
                trim
              ></b-form-input>
            </b-form-group>
            <b-form-group
              id="fieldset-password"
              label="Password"
              label-for="input-password"
              :invalid-feedback="invalidPasswordFeedback"
              :state="passwordFormState"
            >
              <b-form-input
                v-model="password"
                type="password"
                :state="passwordFormState"
                trim
              ></b-form-input>
            </b-form-group>
            <div class="text-center my-2">
              <b-button
                type="submit"
                variant="success"
                :disabled="!isFormValid"
              >
                <template v-if="registerMode">Register</template>
                <template v-else>Login</template>
              </b-button>
            </div>
            <div v-if="!registerMode" class="text-center my-2">
              <google-auth-button @click="googleAuth"></google-auth-button>
            </div>
            <div class="text-center my-2">
              <b-button
                type="button"
                variant="link"
                @click="registerMode = !registerMode"
              >
                <template v-if="registerMode">
                  Already has Account? Login
                </template>
                <template v-else>No Account? Register</template>
              </b-button>
            </div>
          </form>
        </b-jumbotron>
      </b-overlay>
    </b-container>
  </sensesiot-base-container>
</template>

<script>
import isEmail from 'validator/lib/isEmail'

export default {
  name: 'LoginPage',
  middleware({ store, redirect }) {
    const role = store.getters.role
    if (role !== 'guest') {
      return redirect('/')
    }
  },
  data() {
    return {
      loading: false,
      registerMode: false,
      email: '',
      password: ''
    }
  },
  computed: {
    isEmailValid() {
      return isEmail(this.email)
    },
    emailFormState() {
      return this.email === '' ? undefined : this.isEmailValid
    },
    invalidEmailFeedback() {
      return 'Enter email.'
    },
    isPasswordValid() {
      return this.password.length >= 8
    },
    passwordFormState() {
      return this.password === '' ? undefined : this.isPasswordValid
    },
    invalidPasswordFeedback() {
      return 'Too short!'
    },
    isFormValid() {
      return this.isEmailValid && this.isPasswordValid
    }
  },
  methods: {
    async submitForm() {
      if (!this.isFormValid) {
        return
      }

      if (this.registerMode) {
        await this.register()
      } else {
        await this.auth()
      }
    },
    async auth() {
      try {
        this.loading = true

        const userCredential = await this.$fire.auth.signInWithEmailAndPassword(
          this.email,
          this.password
        )
        const user = userCredential.user
        if (!user.emailVerified) {
          const err = new Error('This email not verified')
          err.code = 'auth/email-not-verified'
          throw err
        }

        this.setUserServer(user)
      } catch (error) {
        this.loading = false
        this.handleError(error)
      }
    },
    async googleAuth() {
      if (this.loading) {
        return
      }

      this.loading = true
      try {
        const provider = new this.$fireModule.auth.GoogleAuthProvider()
        this.$fire.auth.useDeviceLanguage()
        const user = await this.$fire.auth.signInWithPopup(provider)
        if (user.credential) {
          this.setUserServer(user.user)
        }
      } catch (err) {
        this.handleError(err)
        this.loading = false
      }
    },
    async setUserServer(user) {
      const token = await user.getIdToken()

      const { userData } = await this.$axios.$post('/api/login', {
        token
      })

      this.$store.commit('SET_USER', userData)

      this.$router.push('/')
    },
    async register() {
      try {
        this.loading = true

        const userCredential =
          await this.$fire.auth.createUserWithEmailAndPassword(
            this.email,
            this.password
          )
        const user = userCredential.user
        user.sendEmailVerification()
        this.$bvModal.msgBoxOk('Email verification sent, Please activate.', {
          title: 'Register'
        })
      } catch (error) {
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },

    handleError(error) {
      let errorCode = 'client/error'
      if (error.response) {
        errorCode = 'server/error'
      } else if (error.code) {
        errorCode = error.code
      }

      if (errorCode === 'auth/email-already-in-use') {
        this.$bvModal.msgBoxOk(
          'The email address is already in use by another account.',
          {
            title: 'Error'
          }
        )
      } else if (
        errorCode === 'auth/user-not-found' ||
        errorCode === 'auth/wrong-password'
      ) {
        this.$bvModal.msgBoxOk('Invalid User/Password', {
          title: 'Error'
        })
      } else if (errorCode === 'auth/email-not-verified') {
        this.$bvModal.msgBoxOk(
          'This email not verified, Please verifiy first',
          {
            title: 'Error'
          }
        )
      } else {
        let errorMessage = error.message
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message
        }

        this.$bvModal.msgBoxOk(`[${errorCode}] : ${errorMessage}`, {
          title: 'Error'
        })
      }
    }
  }
}
</script>
