<script setup>
import { SIDEBAR_NAME } from "../consts";
</script>

<template>
  <div class="footer">
    <div class="copyright">
      <p>
        © 2025 {{ SIDEBAR_NAME }}. All Rights Reserved. /
        <a href="/rss.xml">RSS</a>
      </p>
      <p>
        Powered by <a href="https://astro.build/">Astro</a> &
        <a href="https://vuejs.org/">Vue.js</a> &
        <a href="https://github.com/saicaca/fuwari">Fuwari</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.footer {
  display: grid;
  place-content: center;
  margin: 6rem 0 2rem;
}

.copyright {
  position: relative;
  width: max-content;
}

.copyright::before {
  content: "";
  position: absolute;
  width: 150%;
  height: 0.1rem;
  border-bottom: 0.1rem dotted #d0d0d0;
  top: -3rem;
  left: -25%;
}

p {
  text-align: center;
  line-height: 1.25rem;
  margin: 0.25rem;
  color: #808080;
  font-size: 0.9rem;
}

a {
  color: var(--primary-color);
  font-weight: 500;
  font-weight: bold;
}
</style>
