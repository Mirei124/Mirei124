<script setup>
import "material-icons/iconfont/material-icons.css";
</script>

<template>
  <div class="header flex-row card-bg">
    <div class="left flex-row hover-base">
      <span class="material-icons-sharp icon-home">article</span>
      <a href="/">Connor's Blog</a>
    </div>
    <nav class="flex-row">
      <a href="/" class="hover-base">主页</a>
      <a href="/archive" class="hover-base">归档</a>
      <a href="/about" class="hover-base">关于</a>
    </nav>
    <div class="right flex-row">
      <button>
        <span class="material-icons-sharp hover-base">search</span>
      </button>
      <button>
        <span class="material-icons-outlined hover-base">wb_sunny</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.header {
  min-height: 4rem;
  padding: 0 1rem;
}

.left {
  color: var(--primary-color);
  position: relative;
}

a {
  font-weight: bold;
  font-size: 1.2rem;
  position: relative;
}

span {
  font-size: 2rem;
  padding: 0.2rem;
  position: relative;
  margin: 0 0.2rem;
}

a {
  padding: 0.4rem;
  margin: 0.2rem;
}

button {
  padding: 0;
  background-color: inherit;
  border: none;
}
</style>
