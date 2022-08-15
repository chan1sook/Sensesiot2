<template>
  <div class="overflow-auto" style="height: 100vh">
    <vue-scroll>
      <Nuxt />
    </vue-scroll>
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
}
</script>

<style>
.shadow-1 {
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
.shadow-2 {
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}
</style>
