<template>
  <span
    class="d-inline-block google-btn"
    @mouseleave="active = false"
    @mousedown="active = true"
    @mouseup="active = false"
    @click="$emit('click')"
  >
    <b-img
      v-if="active"
      src="~/assets/btn_google_signin_light_pressed_web@2x.png"
      width="191"
    ></b-img>
    <b-img
      v-else
      src="~/assets/btn_google_signin_light_normal_web@2x.png"
      width="191"
    ></b-img>
  </span>
</template>

<script>
export default {
  name: 'GoogleAuthButton',
  data() {
    return {
      active: false,
    }
  },
}
</script>

<style scoped>
.google-btn {
  cursor: pointer;
}
</style>
