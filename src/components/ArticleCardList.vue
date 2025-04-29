<script setup>
import "material-icons/iconfont/material-icons.css";
import { ref, watch } from "vue";
import {
  formatDate,
  formatWordCount,
  formatReadTime,
  calcDescription,
} from "../functions";

const props = defineProps(["blogs"]);

function formatWordCountAndReadTime(contentLength) {
  return (
    formatWordCount(contentLength) + "    |    " + formatReadTime(contentLength)
  );
}

const pageSize = 8;
const curPageRef = ref(1);
const blogsRef = ref([]);
const numBlog = props.blogs.length;
const numPage = Math.ceil(numBlog / pageSize);

async function updatePage(curPage, numPage, pageSize, numBlog) {
  const _curPage = curPage <= numPage ? curPage : numPage;
  const startIdx = (_curPage - 1) * pageSize;
  let blogList = [];
  for (let i = startIdx; i < Math.min(numBlog, startIdx + pageSize); i++) {
    blogList.push(props.blogs[i]);
  }
  return blogList;
}

watch(
  () => curPageRef.value,
  async (newVal, oldVal) => {
    blogsRef.value = await updatePage(newVal, numPage, pageSize, numBlog);
  }
);

blogsRef.value = await updatePage(1, numPage, pageSize, numBlog);
</script>

<template>
  <div class="article-card-list">
    <div class="card-list">
      <div v-for="blog in blogsRef" class="blog-card card-bg">
        <div class="text-info">
          <a :href="'/blog/' + blog.id">
            <p class="title deco-left">{{ blog.data.title }}</p>
          </a>
          <div class="meta-data row-start">
            <span class="material-icons-sharp">calendar_today</span>
            <div class="pub-date">{{ formatDate(blog.data.pubDate) }}</div>
            <span class="material-icons-sharp">book</span>
            <a :href="'/archive/' + blog.data.category" class="cat">{{
              blog.data.category
            }}</a>
            <div class="tag-box row-start">
              <span class="material-icons-sharp">tag</span>
              <div class="tag row-start">
                <div
                  class="tag-item row-start"
                  v-for="(tag, idx) in blog.data.tags"
                >
                  <a :href="'/archive/tag-' + tag" class="tag-name">{{
                    tag
                  }}</a>
                  <div class="sep" v-if="idx + 1 != blog.data.tags.length">
                    &ensp;/&ensp;
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="content">{{ calcDescription(blog) }}</div>
          <div class="count">
            {{ formatWordCountAndReadTime(blog.body.length) }}
          </div>
        </div>
        <div class="cover"></div>
      </div>
    </div>
    <div class="paginate">
      <div
        class="nav-btn"
        :style="{ visibility: curPageRef == 1 ? 'hidden' : 'visible' }"
      >
        <span class="material-icons-sharp nav-span" @click="curPageRef--"
          >navigate_before</span
        >
      </div>
      <div class="nav-btn nav-cur">{{ curPageRef }}</div>
      <div
        class="nav-btn"
        :style="{ visibility: curPageRef == numPage ? 'hidden' : 'visible' }"
      >
        <span class="material-icons-sharp nav-span" @click="curPageRef++"
          >navigate_next</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../styles/card.css";

.article-card-list {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.card-list {
  display: grid;
  width: 100%;
}

.title:hover {
  color: var(--primary-color);
  transform: translateX(0.5em);
  transition: all 0.1s;
}

.content {
  margin: 0 0 1rem;
  line-height: 1.5rem;
}

.count {
  white-space: pre;
  color: #a0a0a0;
  font-size: 0.9rem;
}

.paginate {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-bottom: 1rem;
}

.nav-cur {
  line-height: 2.5rem;
  font-weight: bold;
  text-align: center;
  color: #ffffff;
  background-color: var(--primary-color);
}

.nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 0.4rem;
}

.nav-span {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  line-height: 2.5rem;
  text-align: center;
  color: #e0e0e0;
  background-color: #ffffff;
  cursor: pointer;
}
</style>
