<template>
  <section class="panel">
    <Carousel :images="carouselImages" />
    <div class="type-wrap">
      <button class="type-scroll ctrl prev" @click="scrollTypes(-1)">‹</button>
      <div class="type-grid" ref="typeGridRef">
        <button
          v-for="t in allTypes"
          :key="t"
          class="type-card"
          :class="{ active: selectedTypes.includes(t) }"
          @click="toggleType(t)"
        >
          <span class="type-name">{{ t }}</span>
        </button>
      </div>
      <div class="type-actions">
        <button class="btn small" @click="clearTypes" :disabled="selectedTypes.length === 0">清除筛选</button>
      </div>
      <button class="type-scroll ctrl next" @click="scrollTypes(1)">›</button>
    </div>
    <h2>游戏目录</h2>
    <p class="muted">点击卡片进入详情页，查看游戏背景、玩法、公司、定价及官网链接。</p>
    <div class="toolbar">
      <router-link class="btn secondary" to="/add">添加游戏</router-link>
    </div>

    <div class="grid cols-3">
      <article v-for="g in filteredGames" :key="g.id" class="card clickable" @click="goGame(g.id)" @keydown.enter="goGame(g.id)" tabindex="0" role="button">
        <div v-if="g.cover" class="cover">
          <img :src="g.cover" :alt="g.title" />
        </div>
        <div class="body">
          <div class="row">
            <h3 class="title">{{ g.title }}</h3>
            <span class="badge">{{ (g.genres && g.genres[0]) || g.genre }}</span>
          </div>
          <p class="company">开发/发行：{{ g.company }}</p>
          <p class="price">定价：¥{{ g.price }}</p>
        </div>
      </article>
    </div>

    <div v-if="store.games.length === 0" class="empty">暂无游戏，快去添加吧！</div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store';
import Carousel from './Carousel.vue';
import { getCarouselImages } from '../utils/imageUtils.js';

const carouselImages = computed(() => {
  // Steam风格的游戏轮播图片
  return [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=800&fit=crop&auto=format&q=90', // 游戏手柄 - ARC Raiders风格
    'https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=1400&h=800&fit=crop&auto=format&q=90', // 战争策略游戏 - Hearts of Iron IV风格
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1400&h=800&fit=crop&auto=format&q=90', // 赛博朋克风格
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&h=800&fit=crop&auto=format&q=90', // 奇幻RPG风格
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&h=800&fit=crop&auto=format&q=90'  // 现代游戏设备
  ];
});

const allTypes = [
  '动作游戏','角色扮演游戏','模拟游戏','策略游戏','休闲游戏','益智游戏',
  '射击游戏','体育游戏','竞速游戏','音乐游戏'
];

const selectedTypes = ref([]);
const filteredGames = computed(() => {
  const q = (store.searchGame || '').trim().toLowerCase();
  const byType = (g) => {
    if (selectedTypes.value.length === 0) return true;
    const gs = Array.isArray(g.genres) ? g.genres : (g.genre ? [g.genre] : []);
    return selectedTypes.value.every(t => gs.includes(t));
  };
  const byText = (g) => {
    if (!q) return true;
    return (g.title?.toLowerCase().includes(q) || g.company?.toLowerCase().includes(q));
  };
  return store.games.filter(g => byType(g) && byText(g));
});
function toggleType(t) {
  const i = selectedTypes.value.indexOf(t);
  if (i >= 0) selectedTypes.value.splice(i, 1);
  else selectedTypes.value.push(t);
}
function clearTypes() { selectedTypes.value = []; }

const typeGridRef = ref(null);
function scrollTypes(dir) {
  const el = typeGridRef.value;
  if (!el) return;
  const amount = el.clientWidth * 0.8;
  el.scrollBy({ left: dir * amount, behavior: 'smooth' });
}
const router = useRouter();
function goGame(id){ router.push(`/game/${id}`); }
onMounted(() => {});
</script>

<style scoped>
h2 { margin: 0 0 8px; text-align: center; }
.muted { color: var(--muted); margin: 0 0 16px; text-align: center; }
.toolbar { margin: 16px 0 16px; display: flex; justify-content: center; }
.cover { 
  width: 100%; 
  height: 180px; 
  background: #0a0f1c; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}
.cover img { 
  max-width: 100%; 
  max-height: 100%; 
  width: auto;
  height: auto;
  object-fit: contain; /* 保持原始比例 */
  transition: transform 0.3s ease;
}
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.title { margin: 0; font-size: 18px; }
.company, .price { margin: 6px 0; color: var(--muted); }
.actions { margin-top: 8px; display: flex; gap: 8px; }
.empty { padding: 20px; text-align: center; color: var(--muted); }
.card { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: #0b1020; box-shadow: 0 8px 20px rgba(0,0,0,0.35); transition: transform .2s ease, box-shadow .2s ease; }
.card.clickable { cursor: pointer; }
.card:hover { transform: translateY(-4px); box-shadow: 0 12px 26px rgba(0,0,0,0.45); }
.card:hover .cover img { 
  transform: scale(1.05);
  filter: saturate(1.08) contrast(1.05); 
}
/* 响应式设计 */
@media (max-width: 1024px) {
  .grid.cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid.cols-3 {
    grid-template-columns: 1fr;
  }
  
  .cover {
    height: 200px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
  }
}

.type-wrap {
  position: relative;
  margin: 12px 0 16px;
}
/* 桌面：栅格，窄屏：横向滚动 */
.type-grid {
  display: grid;
  grid-template-columns: repeat(5, 150px); /* 放大一半 */
  gap: 8px;
  justify-content: center; /* 居中排布 */
  justify-items: stretch;
}
.type-card {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 14px; /* 小一号圆角 */
  background: #0a0f1c;
  color: #e5e7eb;
  padding: 0;
  width: 100%;
  aspect-ratio: 1 / 1;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 6px 14px rgba(0,0,0,0.30);
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.type-card::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(59,130,246,0.35), rgba(59,130,246,0.15));
  mix-blend-mode: screen; /* 半透明覆盖风格 */
}
.type-card:hover { transform: translateY(-3px); box-shadow: 0 14px 26px rgba(0,0,0,0.45); border-color: var(--primary); }
.type-card.active { border-color: var(--accent); }
.type-name {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  font-weight: 700; background: rgba(12,18,30,0.6);
  padding: 4px 8px; border-radius: 10px; font-size: 12px;
}

/* 窄屏：横向滑动轮播 */
@media (max-width: 900px) {
  .type-grid {
    display: grid;
    grid-template-columns: repeat(5, 120px); /* 窄屏相应放大 */
    gap: 8px;
    justify-content: center;
  }
}

/* 控制按钮默认隐藏，仅窄屏显示 */
.type-scroll.ctrl {
  display: none;
  position: absolute;
  top: 50%; transform: translateY(-50%);
  background: rgba(0,0,0,0.35);
  color: #fff; border: none; border-radius: 50%;
  width: 32px; height: 32px; cursor: pointer;
}
.type-scroll.prev { left: -6px; }
.type-scroll.next { right: -6px; }
.type-actions { margin-top: 8px; display: flex; justify-content: center; }
.btn.small { padding: 6px 10px; font-size: 12px; }

</style>