<script setup>
import { IconGithub } from "@iconify-prerendered/vue-fa6-brands";
import { SIDEBAR_NAME, SIDEBAR_DESCRIBE, GITHUB_URL } from "../consts";
import { getCollection } from "astro:content";

const blogs = await getCollection("blog");
const catMap = {};
const tagList = [];

for (const { data } of blogs) {
  if (catMap[data.category]) {
    catMap[data.category]++;
  } else {
    catMap[data.category] = 1;
  }

  for (const tag of data.tags) {
    if (!tagList.includes(tag)) {
      tagList.push(tag);
    }
  }
}

const catArray = [];
for (const [k, v] of Object.entries(catMap)) {
  catArray.push({ name: k, count: v });
}
</script>

<template>
  <div class="sidebar">
    <div class="profile card-bg flex-column">
      <div class="avator-box">
        <img src="/avator.webp" alt="avator" class="avator" />
        <a href="/about"
          ><span class="material-icons-sharp avator-span">contact_page</span></a
        >
      </div>
      <p class="name">{{ SIDEBAR_NAME }}</p>
      <p class="sep"></p>
      <p class="describe">{{ SIDEBAR_DESCRIBE }}</p>
      <div class="link-icons flex-row">
        <a :href="GITHUB_URL">
          <div class="link-item">
            <IconGithub class="link-icon" />
          </div>
        </a>
      </div>
    </div>
    <div class="cat-tag">
      <div class="category card-bg">
        <p class="card-title deco-left">Categories</p>
        <div class="item-list">
          <div v-for="cat in catArray">
            <a :href="'/archive/' + cat.name" class="cat-item flex-row">
              <div class="cat-name">{{ cat.name }}</div>
              <div class="count">{{ cat.count }}</div>
            </a>
          </div>
        </div>
      </div>
      <div class="tags card-bg">
        <p class="card-title deco-left">Tags</p>
        <div class="item-grid">
          <a v-for="tag in tagList" :href="'/archive/tag-' + tag">
            <div class="tag-item btn-base">{{ tag }}</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  height: 100%;
}

.cat-tag {
  position: sticky;
  top: 1rem;
}

.avator {
  width: 16rem;
  margin-bottom: 0.4rem;
}

.avator-span {
  z-index: -10;
  position: absolute;
  top: 0;
  left: 0;
  width: 16rem;
  height: 16rem;
  line-height: 16rem;
  text-align: center;
  font-size: 4rem;
  color: #ffffff00;
}

.avator-box {
  position: relative;
  cursor: pointer;
}

.avator-box:hover {
  .avator-span {
    color: #ffffffff;
    z-index: 10;
    backdrop-filter: brightness(70%);
    transition: all 0.5s;
  }
}

.profile,
.category,
.tags {
  padding: 1rem;
  margin: 0 0 1rem;
}

.name {
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center;
}

.describe {
  color: #808080;
  text-align: center;
  line-height: 1.5rem;
}

.sep {
  padding: 0;
  margin: 0.4rem;
  width: 1.5rem;
  height: 0.3rem;
  background-color: var(--primary-color);
  border-radius: 0.5rem;
}

p {
  margin: 0.4rem;
}

.link-icons {
  margin: 0.4rem 0.4rem 0;
}

.link-item {
  height: 2.9rem;
  background-color: var(--btn-bg);
  padding: 0.4rem;
  margin: 0 0.2rem;
}

.link-item:hover {
  background-color: var(--lighten-color);
  transition: all 0.1s;
}

.link-icon {
  width: 2rem;
  font-size: 2rem;
  color: var(--accent-color);
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.item-list {
  padding: 0.4rem;
}

.cat-item {
  padding: 0.4rem;
}

.cat-item:hover {
  background-color: var(--btn-bg);
  transition: all 0.1s;

  .cat-name {
    transform: translateX(0.5rem);
    transition: all 0.1s;
  }
}

.count {
  padding: 0.4rem;
  width: 2rem;

  text-align: center;
  font-weight: bold;
  color: var(--accent-color);
  background-color: var(--btn-bg);
}

.item-grid {
  padding: 0.4rem;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

.tag-item {
  margin: 0.4rem;
  padding: 0.4rem;
}
</style>
