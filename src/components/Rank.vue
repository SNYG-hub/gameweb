<template>
  <section class="panel">
    <div class="header-row">
      <h2>排行榜</h2>
      <div class="controls">
        <label>
          排序依据
          <select class="select" v-model="sortBy">
            <option value="stars">平均星级</option>
            <option value="price">价格</option>
          </select>
        </label>
        <label v-if="sortBy==='price'">
          顺序
          <select class="select" v-model="order">
            <option value="asc">从低到高</option>
            <option value="desc">从高到低</option>
          </select>
        </label>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <span class="filter-label">按类型筛选（可多选）：</span>
        <label v-for="t in allTypes" :key="t" class="chip">
          <input type="checkbox" :value="t" v-model="selectedTypes" />
          <span>{{ t }}</span>
        </label>
        <button class="btn small" @click="clearTypes" :disabled="selectedTypes.length===0">清除类型</button>
      </div>
      <div class="filter-group">
        <span class="filter-label">价格区间：</span>
        <input class="input small" type="number" min="0" v-model.number="priceMin" placeholder="最低价" />
        <input class="input small" type="number" min="0" v-model.number="priceMax" placeholder="最高价" />
        <button class="btn small" @click="clearPrice" :disabled="priceMin===undefined && priceMax===undefined">清除价格</button>
      </div>
    </div>

    <div class="list">
      <article v-for="(g, idx) in ranked" :key="g.id" class="card row-card">
        <div class="rank-num">#{{ idx + 1 }}</div>
        <div class="body">
          <div class="row">
            <h3 class="title">{{ g.title }}</h3>
            <span class="badge">{{ (g.genres && g.genres[0]) || g.genre }}</span>
          </div>
          <p class="company">开发/发行：{{ g.company }}</p>
          <p v-if="sortBy==='stars'">平均星级：{{ g.avg }}（{{ g.count }}次评分）</p>
          <p v-else>价格：¥{{ g.price }}</p>
          <div class="actions">
            <router-link class="btn" :to="`/game/${g.id}`">查看详情</router-link>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { store } from '../store';
import { getAverageStars } from '../store';

const sortBy = ref('stars'); // 'stars' or 'price'
const order = ref('desc');

// 类型筛选
const allTypes = [
  '动作游戏','角色扮演游戏','模拟游戏','策略游戏','休闲游戏','益智游戏',
  '射击游戏','体育游戏','竞速游戏','音乐游戏'
];
const selectedTypes = ref([]);
// 复选框直接通过 v-model 维护 selectedTypes，无需手动切换函数

// 价格区间
const priceMin = ref();
const priceMax = ref();

function clearTypes() { selectedTypes.value = []; }
function clearPrice() { priceMin.value = undefined; priceMax.value = undefined; }

const ranked = computed(() => {
  // 基础数据 + 平均星级/条数
  let base = store.games.map(g => ({
    ...g,
    avg: getAverageStars(g),
    count: Array.isArray(g.ratings) ? g.ratings.length : 0
  }));

  // 类型筛选：至少包含所选集合中的任意一个（并集过滤）
  if (selectedTypes.value.length) {
    base = base.filter(g => {
      const list = Array.isArray(g.genres) ? g.genres : (g.genre ? [g.genre] : []);
      return selectedTypes.value.some(t => list.includes(t));
    });
  }

  // 价格区间筛选
  base = base.filter(g => {
    const p = Number(g.price) || 0;
    const minOk = priceMin.value === undefined || priceMin.value === '' || p >= Number(priceMin.value);
    const maxOk = priceMax.value === undefined || priceMax.value === '' || p <= Number(priceMax.value);
    return minOk && maxOk;
  });

  // 排序
  if (sortBy.value === 'stars') {
    return base.sort((a, b) => b.avg - a.avg || b.count - a.count);
  } else {
    const dir = order.value === 'asc' ? 1 : -1;
    return base.sort((a, b) => dir * (a.price - b.price));
  }
});
</script>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; }
.controls { display: flex; gap: 12px; }

.filters { display: grid; gap: 10px; margin: 12px 0; }
.filter-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-label { color: var(--muted); }
.chip { display: inline-flex; align-items: center; gap: 6px; background: #0b1020; border: 1px solid var(--border); border-radius: 999px; padding: 4px 8px; }
.input.small { max-width: 120px; }

.list { display: grid; gap: 10px; }
.row-card { display: grid; grid-template-columns: 72px 1fr; align-items: stretch; }
.rank-num { display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; color: #93c5fd; background: #0a0f1c; border-right: 1px solid var(--border); }

.card { border: 1px solid var(--border); border-radius: 12px; background: #0b1020; overflow: hidden; }
.card .body { padding: 12px; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.title { margin: 0; font-size: 18px; }
.company { color: var(--muted); }
@media (max-width: 768px) {
  .row-card { grid-template-columns: 56px 1fr; }
  .type-grid { grid-template-columns: repeat(3, minmax(80px, 1fr)); }
}
</style>