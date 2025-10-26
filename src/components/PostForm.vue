<template>
  <section class="panel glass">
    <h2>发布新帖</h2>
    <div class="form-wrap">
      <form class="grid" @submit.prevent="onSubmit">
      <label>
        标题
        <input v-model="form.title" class="input" placeholder="请输入标题" required />
      </label>
      <label>
        作者
        <input v-model="form.author" class="input" placeholder="你的名字（可匿名）" />
      </label>
      <label>
        内容
        <textarea v-model="form.content" class="textarea" rows="6" placeholder="请输入帖子内容" required></textarea>
      </label>
      <label>
        配图（可选，支持多张）
        <input type="file" accept="image/*" multiple @change="onPickImages" />
      </label>
      <div class="img-preview" v-if="form.images.length">
        <img v-for="(img,i) in form.images" :key="i" :src="img" alt="" />
      </div>
      <div class="actions">
        <button 
          class="btn" 
          type="submit" 
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '发布中...' : '发布' }}
        </button>
        <router-link class="btn secondary" to="/forum">返回论坛</router-link>
      </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { addPost } from '../store';
import { useRouter } from 'vue-router';

const router = useRouter();
const isSubmitting = ref(false);
const form = reactive({
  title: '',
  author: '',
  content: '',
  images: []
});

async function onSubmit() {
  if (isSubmitting.value) return; // 防止重复提交
  
  // 基本验证
  if (!form.title.trim()) {
    alert('请输入标题');
    return;
  }
  
  if (!form.content.trim()) {
    alert('请输入内容');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const result = await addPost(form);
    // 使用本地ID进行路由跳转
    router.push(`/forum/post/${result.localId}`);
  } catch (error) {
    console.error('发布帖子失败:', error);
    alert('发布帖子失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
}
function onPickImages(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  const readers = files.map(f => new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(f);
  }));
  Promise.all(readers).then(imgs => {
    form.images = imgs.slice(0, 9); // 最多9图
  });
}
</script>

<style scoped>
h2 { margin: 0 0 8px; }
.grid { gap: 12px; }
label { display: grid; gap: 6px; }
.actions { display: flex; gap: 8px; margin-top: 12px; }
.form-wrap {
  max-width: 420px;
  margin: 0 auto;
}
.grid { gap: 10px; }
.input, .textarea { padding: 8px 10px; }
.img-preview { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; }
.img-preview img { width:100%; height:100px; object-fit: cover; border-radius:8px; border:1px solid var(--border); }

/* 玻璃毛玻璃 + 强阴影 */
.glass {
  background: rgba(17, 24, 39, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(96, 165, 250, 0.25);
  box-shadow: 0 18px 40px rgba(0,0,0,0.55), 0 0 30px rgba(96,165,250,0.25);
  border-radius: 14px;
}
</style>