<template>
  <section class="panel">
    <div class="header-row">
      <h2>论坛</h2>
      <router-link class="btn" to="/forum/new">发帖</router-link>
    </div>
    <p class="muted">每个人都可以发帖与评论，支持配图与关注作者。</p>

    <div class="feed">
      <article
        v-for="p in postsFiltered"
        :key="p.id"
        class="card"
        @click="goDetail(p.id)"
      >
        <header class="author-row">
          <img v-if="getAvatar(p.author)" :src="getAvatar(p.author)" class="avatar" />
          <div v-else class="avatar-fallback">{{ p.author?.[0]?.toUpperCase() || 'U' }}</div>
          <div class="a-meta">
            <div class="a-name">{{ p.author }}</div>
            <div class="a-time">{{ formatTime(p.createdAt) }}</div>
          </div>
          <button class="btn follow" @click.stop="toggleFollow(p.author)">{{ isFollowing(p.author) ? '已关注' : '关注' }}</button>
        </header>

        <div class="p-title">{{ p.title }}</div>
        <p class="p-text" :class="{ expanded: isExpanded(p.id) }">
          {{ p.content }}
        </p>
        <div class="p-images" v-if="Array.isArray(p.images) && p.images.length">
          <img v-for="(img,i) in p.images" :key="i" :src="img" />
        </div>
        <div class="p-actions">
          <button class="btn small" @click.stop="toggleExpand(p.id)">{{ isExpanded(p.id) ? '收起' : '展开更多' }}</button>
        </div>
      </article>
    </div>

    <div v-if="store.posts.length === 0" class="empty">暂无帖子，快来发表第一条吧！</div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { store, getAvatarByName, isFollowing as _isFollowing, followUser, unfollowUser } from '../store';

const router = useRouter();
const expandedIds = ref(new Set());
const postsFiltered = computed(() => {
  const q = (store.searchForum || '').trim().toLowerCase();
  if (!q) return store.posts;
  return store.posts.filter(p => (p.author?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q)));
});

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}
function goDetail(id) {
  router.push(`/forum/post/${id}`);
}
function toggleExpand(id) {
  const s = expandedIds.value;
  if (s.has(id)) s.delete(id);
  else s.add(id);
}
function isExpanded(id) {
  return expandedIds.value.has(id);
}
function getAvatar(name){
  return getAvatarByName(name);
}
function isFollowing(name){
  return _isFollowing(name);
}
function toggleFollow(name){
  if (_isFollowing(name)) unfollowUser(name);
  else followUser(name);
}
</script>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.header-row .tools { display: flex; align-items: center; gap: 8px; }
.muted { color: var(--muted); }

/* 竖排信息流 */
.feed { display: grid; gap: 16px; max-width: 680px; margin: 12px auto 0; }
.card { border:1px solid var(--border); background:#0b1020; border-radius:12px; padding:12px; box-shadow:0 6px 16px rgba(0,0,0,0.3); transition: box-shadow .15s ease, transform .15s ease; cursor: pointer; }
.card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,0,0,0.4); border-color: var(--primary); }

.author-row { display:flex; align-items:center; gap:10px; }
.avatar { width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--border); }
.avatar-fallback { width:36px; height:36px; border-radius:50%; background:#0a0f1c; color:#9aa4b2; display:grid; place-items:center; }
.a-meta { display:grid; line-height:1.1; }
.a-name { font-weight:700; }
.a-time { font-size:12px; color:var(--muted); }
.btn.follow { margin-left:auto; padding:6px 10px; font-size:12px; }

.p-title { margin-top:8px; font-size:16px; font-weight:600; }
.p-text { margin-top:6px; color:#cbd5e1; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.p-text.expanded { display:block; -webkit-line-clamp:unset; }

.p-images { margin-top:8px; display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; }
.p-images img { width:100%; height:100px; object-fit:cover; border-radius:8px; border:1px solid var(--border); }

.p-actions { margin-top:8px; display:flex; justify-content:flex-end; }
.btn.small { padding:6px 10px; font-size:12px; }
.empty { padding: 20px; text-align: center; color: var(--muted); }

@media (max-width:768px){
  .feed { max-width: 100%; padding: 0 10px; }
}
</style>