<template>
  <section class="panel" v-if="game">
    <div class="header-row">
      <h2>{{ game.title }}</h2>
      <span v-if="game.genres?.length" class="badges">
        <span class="badge" v-for="t in game.genres" :key="t">{{ t }}</span>
      </span>
      <span v-else class="badge">{{ game.genre }}</span>
    </div>
    <div class="grid cols-2">
      <div>
        <p class="muted">公司/工作室：{{ game.company || '未知' }}</p>
        <p>定价：<strong>¥{{ game.price }}</strong></p>
        <p>
          官网：
          <a v-if="game.officialUrl" :href="game.officialUrl" target="_blank" rel="noopener noreferrer">
            {{ game.officialUrl }}
          </a>
          <span v-else class="muted">未提供</span>
        </p>
        <div v-if="game.cover" class="cover">
          <img :src="game.cover" :alt="game.title" />
        </div>
      </div>
      <div>
        <h3>游戏背景</h3>
        <p class="text">{{ game.background || '暂无背景介绍。' }}</p>
        <h3>玩法介绍</h3>
        <p class="text">{{ game.gameplay || '暂无玩法介绍。' }}</p>
        <h3>图片画廊</h3>
        <Carousel :images="galleryImages" />

        <h3>评分</h3>
        <div class="rating">
          <div class="stars">
            <button
              v-for="n in 5"
              :key="n"
              class="star-btn"
              :class="{ active: n <= hoverOrSelected }"
              @mouseenter="hover = n"
              @mouseleave="hover = 0"
              @click="rate(n)"
              aria-label="评分 {{ n }} 星"
            >★</button>
          </div>
          <div class="meta">平均：{{ avg }} 星 · 共 {{ count }} 次评分</div>
        </div>
      </div>
    </div>

    <div class="actions">
      <router-link class="btn secondary" to="/">返回目录</router-link>
      <router-link class="btn" to="/forum">去论坛交流</router-link>
    </div>
  </section>

  <section v-else class="panel">
    <h2>未找到该游戏</h2>
    <router-link class="btn" to="/">返回目录</router-link>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getGame, addRating, getAverageStars } from '../store';
import Carousel from './Carousel.vue';
import { getGalleryImages } from '../utils/imageUtils.js';

const route = useRoute();
const game = computed(() => getGame(route.params.id));
const galleryImages = computed(() => {
  const g = game.value?.gallery || [];
  
  // 如果有画廊图片，直接返回
  if (g.length > 0) {
    return g;
  }
  
  // 如果没有画廊图片，使用不同主题的游戏相关图片
  const gameId = game.value?.id || 'default';
  const sampleImages = getGalleryImages(gameId);
  
  // 如果有封面图片，将其作为第一张
  if (game.value?.cover) {
    return [game.value.cover, ...sampleImages.slice(1)];
  }
  
  return sampleImages;
});

const hover = ref(0);
const hoverOrSelected = computed(() => hover.value);
const avg = computed(() => getAverageStars(game.value));
const count = computed(() => Array.isArray(game.value?.ratings) ? game.value.ratings.length : 0);

function rate(n) {
  if (!game.value) return;
  addRating(game.value.id, n);
}
</script>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; }
.muted { color: var(--muted); }
.badges { display: flex; gap: 6px; flex-wrap: wrap; }
.cover { 
  margin-top: 12px; 
  width: 100%; 
  min-height: 200px;
  max-height: 350px; 
  background: #0a0f1c; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border: 1px solid var(--border); 
  border-radius: 8px; 
  overflow: hidden;
  aspect-ratio: 3/4; /* 游戏封面通常是竖版比例 */
}
.cover img { 
  max-width: 100%; 
  max-height: 100%; 
  width: auto;
  height: auto;
  object-fit: contain; /* 保持原始比例，不裁剪 */
  border-radius: 6px;
}
.text { white-space: pre-wrap; line-height: 1.7; }
.actions { margin-top: 12px; display: flex; gap: 8px; }
.rating { margin-top: 12px; }
.stars { display: flex; gap: 4px; }
/* 响应式设计 */
@media (max-width: 768px) {
  .grid.cols-2 {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .cover {
    max-height: 280px;
    aspect-ratio: 16/10; /* 移动端使用更宽的比例 */
  }
  
  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .badges {
    align-self: stretch;
  }
}

.star-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 22px;
  cursor: pointer;
  transition: transform .1s ease, color .1s ease;
}
.star-btn:hover { transform: scale(1.1); color: #fbbf24; }
.star-btn.active { color: #f59e0b; }
.meta { color: var(--muted); margin-top: 6px; }
</style>