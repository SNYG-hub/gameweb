<template>
  <section class="panel" v-if="post">
    <div class="header-row">
      <h2>{{ post.title }}</h2>
      <span class="meta">作者：{{ post.author }} · {{ formatTime(post.createdAt) }}</span>
    </div>
    <article class="content">{{ post.content }}</article>

    <div class="like-row">
      <button class="btn" @click="onLike">👍 点赞 {{ post.likes || 0 }}</button>
    </div>

    <h3>评论（{{ post.comments.length }}）</h3>
    <div class="comments" v-if="post.comments.length">
      <div class="comment" v-for="c in post.comments" :key="c.id">
        <div class="row">
          <strong>{{ c.author }}</strong>
          <span class="meta">{{ formatTime(c.createdAt) }}</span>
        </div>
        <p class="text">{{ c.content }}</p>
      </div>
    </div>
    <div v-else class="empty">暂无评论，来说点什么吧！</div>

    <form class="grid comment-form" @submit.prevent="onComment">
      <label>
        昵称
        <input v-model="comment.author" class="input" placeholder="你的名字（可匿名）" />
      </label>
      <label>
        评论内容
        <textarea v-model="comment.content" class="textarea" rows="3" placeholder="请输入评论内容" required></textarea>
      </label>
      <div class="actions">
        <button class="btn" type="submit">发表评论</button>
        <router-link class="btn secondary" to="/forum">返回论坛</router-link>
      </div>
    </form>
  </section>

  <section v-else class="panel">
    <h2>未找到该帖子</h2>
    <router-link class="btn" to="/forum">返回论坛</router-link>
  </section>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getPost, addComment, likePost } from '../store';

const route = useRoute();
const post = computed(() => getPost(route.params.id));
const comment = reactive({ author: '', content: '' });

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

async function onComment() {
  if (!post.value) return;
  
  // 基本验证
  if (!comment.content.trim()) {
    alert('请输入评论内容');
    return;
  }
  
  try {
    await addComment(post.value.id, comment);
    comment.author = '';
    comment.content = '';
  } catch (error) {
    console.error('发表评论失败:', error);
    alert('发表评论失败，请稍后重试');
  }
}

function onLike() {
  if (!post.value) return;
  likePost(post.value.id);
}
</script>

<style scoped>
.header-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.meta { color: var(--muted); font-size: 12px; }
.content { background: #0b1020; border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 12px; white-space: pre-wrap; line-height: 1.7; }
.like-row { margin-bottom: 12px; }
.comments { display: grid; gap: 10px; margin-bottom: 12px; }
.comment { border: 1px solid var(--border); border-radius: 8px; padding: 10px; background: #0b1020; }
.row { display: flex; align-items: baseline; justify-content: space-between; }
.text { margin: 6px 0 0; }
.empty { color: var(--muted); }
.comment-form { margin-top: 8px; }
.actions { display: flex; gap: 8px; margin-top: 8px; }
</style>