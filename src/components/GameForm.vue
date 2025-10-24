<template>
  <section class="panel glass">
    <h2>添加游戏</h2>
    <p class="muted">由客户填写游戏介绍与官网链接，提交后将出现在目录中，详情页可查看全部信息。</p>

    <div class="form-wrap">
      <form class="grid" @submit.prevent="onSubmit">
      <label>
        游戏名称
        <input v-model="form.title" class="input" placeholder="如：永夜传说" required />
      </label>
      <label>
        公司/工作室
        <input v-model="form.company" class="input" placeholder="如：星环工作室" />
      </label>
      <div class="field">
        <div class="label">游戏类型（可多选）</div>
        <div class="genre-grid">
          <label v-for="t in types" :key="t" class="check">
            <input type="checkbox" :value="t" v-model="form.genres" />
            <span>{{ t }}</span>
          </label>
        </div>
      </div>
      <label>
        定价（人民币）
        <input v-model.number="form.price" type="number" min="0" class="input" placeholder="如：128" />
      </label>
      <label>
        游戏背景
        <textarea v-model="form.background" class="textarea" rows="4" placeholder="世界观、故事背景等"></textarea>
      </label>
      <label>
        玩法介绍
        <textarea v-model="form.gameplay" class="textarea" rows="4" placeholder="核心玩法、模式、特色等"></textarea>
      </label>
      <label>
        官网链接
        <input v-model="form.officialUrl" class="input" placeholder="https://..." />
      </label>
      <label>
        封面图片（本地上传）
        <input type="file" accept="image/*" class="input" @change="onCoverChange" />
      </label>
      <label>
        图片画廊（可选择多张）
        <input type="file" multiple accept="image/*" class="input" @change="onGalleryChange" />
      </label>

      <div class="actions">
        <button class="btn" type="submit">提交</button>
        <router-link class="btn secondary" to="/">返回目录</router-link>
      </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue';
import { addGame } from '../store';
import { useRouter } from 'vue-router';

const router = useRouter();
const types = [
  '动作游戏','角色扮演游戏','模拟游戏','策略游戏','休闲游戏','益智游戏',
  '射击游戏','体育游戏','竞速游戏','音乐游戏'
];
const form = reactive({
  title: '',
  company: '',
  genre: '',
  genres: [],
  price: '',
  background: '',
  gameplay: '',
  officialUrl: '',
  cover: '',
  gallery: []
});

async function toDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

async function onCoverChange(e) {
  const file = e.target.files?.[0];
  if (file) {
    form.cover = await toDataURL(file);
  }
}

async function onGalleryChange(e) {
  const files = Array.from(e.target.files || []);
  const urls = [];
  for (const f of files) {
    urls.push(await toDataURL(f));
  }
  form.gallery = urls;
}

async function onSubmit() {
  try {
    const result = await addGame(form);
    // 使用本地ID进行路由跳转
    router.push(`/game/${result.localId}`);
  } catch (error) {
    console.error('添加游戏失败:', error);
    // 可以在这里添加错误提示
  }
}
</script>

<style scoped>
h2 { margin: 0 0 8px; }
.muted { color: var(--muted); margin: 0 0 16px; }
.grid { gap: 12px; }
label { display: grid; gap: 6px; }
.actions { display: flex; gap: 8px; margin-top: 12px; }
.form-wrap {
  max-width: 420px;
  margin: 0 auto;
}
.grid { gap: 10px; }
.input, .textarea { padding: 8px 10px; }

/* 玻璃毛玻璃 + 强阴影 */
.glass {
  background: rgba(17, 24, 39, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(96, 165, 250, 0.25);
  box-shadow: 0 18px 40px rgba(0,0,0,0.55), 0 0 30px rgba(96,165,250,0.25);
  border-radius: 14px;
}
.field { display: grid; gap: 8px; }
.label { color: var(--text); font-weight: 600; }
.genre-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.check { display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid var(--border); border-radius: 8px; background: #0b1020; }
</style>