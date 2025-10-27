<template>
  <div class="simple-carousel">
    <!-- 主显示区域 -->
    <div class="main-display">
      <div class="main-image">
        <img :src="currentImage" :alt="`游戏截图 ${current + 1}`" />
        <div class="overlay">
          <button class="nav-btn prev" @click="prev" aria-label="上一张">‹</button>
          <button class="nav-btn next" @click="next" aria-label="下一张">›</button>
        </div>
      </div>
      
      <!-- 底部指示器 -->
      <div class="indicators" v-if="images.length > 1">
        <button 
          v-for="(img, idx) in images" 
          :key="idx"
          class="indicator"
          :class="{ active: idx === current }"
          @click="go(idx)"
          :aria-label="`切换到第 ${idx + 1} 张图片`"
        ></button>
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
  console.log('简单轮播组件已挂载，图片数量:', props.images.length);
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
.simple-carousel {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 主显示区域 */
.main-display {
  width: 100%;
  height: 100%;
  position: relative;
}

.main-image {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
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
  background: rgba(0, 0, 0, 0.6);
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
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

/* 底部指示器 */
.indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.indicator.active {
  background: #ffffff;
  transform: scale(1.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .simple-carousel {
    height: 300px;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .indicators {
    bottom: 15px;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
  }
}
</style>