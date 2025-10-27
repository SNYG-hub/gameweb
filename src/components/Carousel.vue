<template>
  <div class="steam-carousel">
    <!-- 主显示区域 -->
    <div class="main-display">
      <div class="main-image">
        <img :src="currentImage" :alt="`游戏截图 ${current + 1}`" />
        <div class="overlay">
          <button class="nav-btn prev" @click="prev" aria-label="上一张">‹</button>
          <button class="nav-btn next" @click="next" aria-label="下一张">›</button>
        </div>
      </div>
      
      <!-- 游戏信息覆盖层 -->
      <div class="game-info-overlay">
        <div class="game-info">
          <h3>精选推荐</h3>
          <p class="game-title">{{ gameTitle }}</p>
          <div class="game-meta">
            <span class="tag">热销商品</span>
            <span class="price">¥ {{ gamePrice }}</span>
          </div>
          <button class="action-btn">立即预购</button>
        </div>
      </div>
    </div>
    
    <!-- 右侧预览图 -->
    <div class="preview-panel">
      <div class="preview-grid">
        <div 
          v-for="(img, idx) in images" 
          :key="idx"
          class="preview-item"
          :class="{ active: idx === current }"
          @click="go(idx)"
        >
          <img :src="img" :alt="`预览图 ${idx + 1}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  images: { type: Array, default: () => [] },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 5000 }
});

const current = ref(0);
let timer = null;

// 当前显示的图片
const currentImage = computed(() => {
  return props.images[current.value] || '';
});

// 游戏信息数据
const gameData = [
  { title: 'ARC Raiders', price: '299.00' },
  { title: 'Hearts of Iron IV', price: '318.00' },
  { title: 'Cyberpunk 2077', price: '298.00' },
  { title: 'The Witcher 3', price: '199.00' },
  { title: 'Elden Ring', price: '398.00' }
];

const gameTitle = computed(() => {
  return gameData[current.value]?.title || '精选游戏';
});

const gamePrice = computed(() => {
  return gameData[current.value]?.price || '299.00';
});

function next() {
  if (props.images.length === 0) return;
  current.value = (current.value + 1) % props.images.length;
}

function prev() {
  if (props.images.length === 0) return;
  current.value = (current.value - 1 + props.images.length) % props.images.length;
}

function go(i) {
  if (props.images.length === 0) return;
  current.value = i;
}

function start() {
  if (!props.autoplay || props.images.length <= 1) return;
  stop();
  timer = setInterval(next, props.interval);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onMounted(() => {
  console.log('Steam轮播组件已挂载，图片数量:', props.images.length);
  start();
});

onBeforeUnmount(stop);

watch(() => props.images, (newImages) => {
  console.log('轮播图片更新:', newImages?.length, '张图片');
  if (newImages && newImages.length > 0) {
    current.value = 0;
    start();
  }
}, { immediate: true });
</script>

<style scoped>
.steam-carousel {
  display: flex;
  gap: 16px;
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #1e2328 0%, #0f1419 100%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2a2d35;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* 主显示区域 */
.main-display {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.main-image {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #0a0f1c;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 70%,
    rgba(0, 0, 0, 0.8) 100%
  );
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.main-display:hover .overlay {
  opacity: 1;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

/* 游戏信息覆盖层 */
.game-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0.3) 80%,
    transparent 100%
  );
  padding: 30px 20px 20px 20px;
  pointer-events: none;
}

.game-info {
  pointer-events: all;
}

.game-info h3 {
  margin: 0 0 8px 0;
  color: #66c0f4;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.game-title {
  margin: 0 0 12px 0;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.game-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.tag {
  background: #4c6b22;
  color: #beee11;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.price {
  color: #beee11;
  font-size: 18px;
  font-weight: 700;
}

.action-btn {
  background: linear-gradient(135deg, #75b022 0%, #588a1b 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn:hover {
  background: linear-gradient(135deg, #83c429 0%, #658f1f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(117, 176, 34, 0.4);
}

/* 右侧预览面板 */
.preview-panel {
  width: 200px;
  padding: 16px;
  background: #1e2328;
  border-left: 1px solid #2a2d35;
}

.preview-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.preview-item {
  flex: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.preview-item:hover {
  border-color: #66c0f4;
  transform: scale(1.05);
}

.preview-item.active {
  border-color: #beee11;
  box-shadow: 0 0 12px rgba(190, 238, 17, 0.4);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.preview-item:hover img {
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .steam-carousel {
    height: 350px;
  }
  
  .preview-panel {
    width: 160px;
  }
  
  .game-title {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .steam-carousel {
    flex-direction: column;
    height: auto;
  }
  
  .main-display {
    height: 300px;
  }
  
  .preview-panel {
    width: 100%;
    height: 120px;
    border-left: none;
    border-top: 1px solid #2a2d35;
  }
  
  .preview-grid {
    flex-direction: row;
    overflow-x: auto;
  }
  
  .preview-item {
    flex: 0 0 100px;
  }
  
  .game-info-overlay {
    padding: 20px 16px 16px 16px;
  }
  
  .game-title {
    font-size: 18px;
  }
}
</style>