<script setup>
import Header from "./Header.vue";
import Footer from "./Footer.vue";
</script>

<template>
  <div class="main-layout">
    <Header />
    <div class="main">
      <div class="main-left">
        <slot name="sidebar"></slot>
      </div>
      <div class="sep"></div>
      <div class="main-center">
        <slot name="main"></slot>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.main-layout {
  display: grid;
  max-width: var(--page-width);
  min-height: 100vh;
  margin: 0;
  background-color: var(--page-bg);
  grid-template-rows: auto 1fr auto;
}

.main-left {
  max-width: var(--side-width);
}

.main-center {
  max-width: var(--main-width);
}

.main {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 4fr;
  margin: 4rem 0 4rem;
}

.sep {
  min-width: 1rem;
}

@media (max-width: 769px) {
  .main {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
  }
}
</style>
