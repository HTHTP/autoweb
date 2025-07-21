<template>
  <div id="app">
    <HomePage />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import HomePage from "./views/HomePage.vue";
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>
