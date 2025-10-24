<template>
  <div class="carousel">
    <div class="track" :style="trackStyle">
      <div class="slide" v-for="(img, idx) in images" :key="idx">
        <img :src="img" alt="" />
      </div>
    </div>
    <button class="ctrl prev" @click="prev" aria-label="上一张">‹</button>
    <button class="ctrl next" @click="next" aria-label="下一张">›</button>
    <div class="dots">
      <button
        v-for="(img, idx) in images"
        :key="idx"
        class="dot"
        :class="{ active: idx === current }"
        @click="go(idx)"
        aria-label="跳转到第 {{ idx + 1 }} 张"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  images: { type: Array, default: () => [] },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 4000 }
});

const current = ref(0);
let timer = null;

const trackStyle = computed(() => ({
  width: `${props.images.length * 100}%`,
  transform: `translateX(-${current.value * (100 / props.images.length)}%)`
}));

function next() {
  current.value = (current.value + 1) % Math.max(props.images.length, 1);
}
function prev() {
  current.value = (current.value - 1 + Math.max(props.images.length, 1)) % Math.max(props.images.length, 1);
}
function go(i) {
  current.value = i % Math.max(props.images.length, 1);
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

onMounted(start);
onBeforeUnmount(stop);
watch(() => props.images, () => {
  current.value = 0;
  start();
});
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  background: #0a0f1c;
  border: 1px solid var(--border);
}
.track {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease;
}
.slide {
  flex: 0 0 100%;
  height: 100%;
}
.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ctrl {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(0,0,0,0.35);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}
.ctrl:hover { background: rgba(0,0,0,0.55); }
.ctrl.prev { left: 10px; }
.ctrl.next { right: 10px; }
.dots {
  position: absolute;
  bottom: 10px;
  left: 0; right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.4);
  border: none; cursor: pointer;
}
.dot.active { background: #fff; }
</style>