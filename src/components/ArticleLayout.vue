<script setup>
import MainLayout from "./MainLayout.vue";
import SideBar from "./SideBar.vue";
import { formatDate, formatWordCount, formatReadTime } from "../functions";
import "material-icons/iconfont/material-icons.css";
import "../styles/articleMd.css";
import { IconCreativeCommons } from "@iconify-prerendered/vue-fa6-brands";
import { SIDEBAR_NAME, SITE_HOSTNAME } from "../consts";

const props = defineProps(["blog"]);
</script>

<template>
  <MainLayout>
    <template v-slot:sidebar>
      <SideBar />
    </template>
    <template v-slot:main>
      <div class="blog-card card-bg">
        <div class="text-info">
          <div class="count-row">
            <span class="material-icons-sharp count-span">article</span>
            <div class="word-count count-text">
              {{ formatWordCount(blog.body.length) }}
            </div>
            <span class="material-icons-sharp count-span">access_time</span>
            <div class="read-time count-text">
              {{ formatReadTime(blog.body.length) }}
            </div>
          </div>
          <p class="title deco-left">{{ blog.data.title }}</p>
          <div class="meta-data row-start">
            <span class="material-icons-sharp">calendar_today</span>
            <div class="pub-date">{{ formatDate(blog.data.pubDate) }}</div>
            <span class="material-icons-sharp">edit_calendar</span>
            <div class="pub-date">
              {{
                formatDate(
                  blog.data.updatedDate
                    ? blog.data.updatedDate
                    : blog.data.pubDate
                )
              }}
            </div>
            <span class="material-icons-sharp">book</span>
            <a :href="'/archive/' + blog.data.category" class="cat">{{
              blog.data.category
              }}</a>
            <div class="tag-box row-start">
              <span class="material-icons-sharp">tag</span>
              <div class="tag row-start">
                <div class="tag-item row-start" v-for="(tag, idx) in blog.data.tags">
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
        </div>
        <div class="article-box">
          <div class="article-content">
            <slot></slot>
          </div>
        </div>
        <div class="license">
          <div class="blog-title">{{ blog.data.title }}</div>
          <div class="blog-link">
            <a :href="'/blog/' + blog.id">{{
              `${SITE_HOSTNAME}/${blog.id}/`
              }}</a>
          </div>
          <div class="author-box">
            <div class="author-title">作者</div>
            <div class="author-title">发布于</div>
            <div class="author-title">许可</div>
            <div class="author-value">{{ SIDEBAR_NAME }}</div>
            <div class="author-value">{{ formatDate(blog.data.pubDate) }}</div>
            <div class="author-value">
              <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>
            </div>
          </div>
          <IconCreativeCommons class="icon-cc" />
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<style scoped>
@import "../styles/card.css";

.title {
  cursor: default;
}

.blog-card {
  flex-flow: column nowrap;
}

@media (max-width: 769px) {
  .blog-card {
    max-width: 100vw;
  }
}

.count-row {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-bottom: 1rem;
}

.count-span {
  font-size: 1rem;
  color: #a0a0a0;
  background-color: #f0f0f0;
}

.count-text {
  color: #a0a0a0;
  font-size: 0.9rem;
  margin: 0 0.6rem 0 0.1rem;
}

.article-box {
  position: relative;
  margin: 3.5rem 0 0;
}

.article-box::before {
  content: "";
  width: 100%;
  height: 0.1rem;
  border-bottom: 0.1rem dotted #d0d0d0;
  position: absolute;
  top: -3rem;
  left: 0;
}

.license {
  position: relative;
  padding: 1rem;
  background-color: #f7f7f7;
  overflow: hidden;
  margin: 1rem 0;
  z-index: -20;
}

.blog-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.blog-link {
  margin-bottom: 0.5rem;
}

.author-box {
  width: max-content;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.author-title {
  margin-bottom: 0.5rem;
  color: #a0a0a0;
}

.license {
  overflow-x: auto;
}

.license a {
  color: var(--primary-color);
}

.icon-cc {
  position: absolute;
  top: -3.8rem;
  right: 2rem;
  /* 8.4rem */
  font-size: 16rem;
  color: #eaeaea;
  z-index: -10;
}
</style>
