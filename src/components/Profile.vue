<template>
  <section class="panel">
    <div class="header-row">
      <h2>个人中心</h2>
      <div class="actions">
        <router-link v-if="user" class="btn messages-btn" to="/messages">
          📨 私信中心
        </router-link>
        <button v-if="user" class="btn secondary" @click="logout">退出登录</button>
        <router-link v-else class="btn" to="/auth">去登录</router-link>
      </div>
    </div>

    <div v-if="user" class="profile">
      <div class="hero">
        <div class="banner"></div>
        <div class="hero-row">
          <label class="avatar-wrap" title="点击更换头像">
            <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
            <div v-else class="avatar-fallback">{{ user.name?.[0]?.toUpperCase() || 'U' }}</div>
            <input type="file" accept="image/*" @change="onPickAvatar" hidden />
          </label>
          <div class="hero-meta">
            <div class="name">{{ user.name }}</div>
            <div class="counts">
              <router-link class="count-link" to="/profile/followers">粉丝 {{ followersCount }}</router-link>
              <router-link class="count-link" to="/profile/following">关注 {{ followingCount }}</router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="tabs">
        <button :class="['tab', tab==='posts' && 'active']" @click="tab='posts'">我发布的帖子</button>
        <button :class="['tab', tab==='games' && 'active']" @click="tab='games'">我发布的游戏</button>
      </div>
      <div class="me">
        <label class="avatar-wrap" title="点击更换头像">
          <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
          <div v-else class="avatar-fallback">{{ user.name?.[0]?.toUpperCase() || 'U' }}</div>
          <input type="file" accept="image/*" @change="onPickAvatar" hidden />
        </label>
        <div class="meta">
          <div class="name">{{ user.name }}</div>
          <div class="counts">
            <span>关注 {{ followingCount }}</span>
            <span>粉丝 {{ followersCount }}</span>
          </div>
        </div>
      </div>


      <div class="content-wrap">
        <div v-if="tab==='posts'" class="feed">
          <article v-for="p in myPosts" :key="p.id" class="post">
            <div class="post-head">
              <label class="avatar-wrap mini">
                <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
                <div v-else class="avatar-fallback">{{ user.name?.[0]?.toUpperCase() || 'U' }}</div>
              </label>
              <div class="meta">
                <div class="name">{{ user.name }}</div>
                <div class="sub">{{ new Date(p.createdAt).toLocaleDateString() }}</div>
              </div>
            </div>
            <div class="post-body">
              <h3 class="post-title">{{ p.title }}</h3>
              <p class="post-content">{{ p.content }}</p>
            </div>
            <div class="post-actions">
              <span class="badge">赞 {{ p.likes || 0 }}</span>
              <router-link class="btn small" :to="`/forum/post/${p.id}`">查看详情</router-link>
            </div>
          </article>
          <div v-if="myPosts.length===0" class="empty">暂无发布的帖子</div>
        </div>
        <div v-else class="feed">
          <article v-for="g in myGames" :key="g.id" class="post">
            <div class="post-head">
              <label class="avatar-wrap mini">
                <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
                <div v-else class="avatar-fallback">{{ user.name?.[0]?.toUpperCase() || 'U' }}</div>
              </label>
              <div class="meta">
                <div class="name">{{ user.name }}</div>
                <div class="sub">{{ new Date(g.createdAt).toLocaleDateString() }}</div>
              </div>
            </div>
            <div class="post-body">
              <h3 class="post-title">{{ g.title }}</h3>
              <p class="post-content muted">{{ g.company }}</p>
            </div>
            <div class="post-actions">
              <router-link class="btn small" :to="`/game/${g.id}`">查看详情</router-link>
            </div>
          </article>
          <div v-if="myGames.length===0" class="empty">暂无发布的游戏</div>
        </div>
      </div>
    </div>

    <div v-else class="empty">未登录，请先登录。</div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { store, signOut, followersOf, followingOf, updateAvatar, followUser, unfollowUser, isFollowing as _isFollowing } from '../store';

const router = useRouter();
const user = computed(() => store.user);

const followersList = computed(() => followersOf(user.value?.name));
const followingList = computed(() => followingOf(user.value?.name));
const followersCount = computed(() => followersList.value.length);
const followingCount = computed(() => followingList.value.length);
const myGames = computed(() => (store.games || []).filter(g => g.creator === user.value?.name));
const myPosts = computed(() => (store.posts || []).filter(p => p.author === user.value?.name));
const tab = ref('posts');

function logout() {
  signOut();
  router.push('/');
}

function onPickAvatar(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => updateAvatar(reader.result);
  reader.readAsDataURL(file);
}

function follow(name) { followUser(name); }
function unfollow(name) { unfollowUser(name); }
function isFollowing(name) { return _isFollowing(name); }
</script>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; }
.profile { display: grid; gap: 16px; }
.hero { background:#0a0f1c; border-radius:12px; overflow:hidden; }
.banner { height: 120px; background: url('https://picsum.photos/seed/profilebanner/1200/300') center/cover no-repeat; filter: saturate(1.1) contrast(1.05); }
.hero-row { display:flex; align-items:center; gap:16px; padding:12px; }
.me { display: none; }
.avatar-wrap { width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 1px solid var(--border); cursor: pointer; display: grid; place-items: center; background:#0b1020; }
.avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
.avatar-fallback { width: 100%; height: 100%; display: grid; place-items: center; background:#0a0f1c; color:#9aa4b2; font-size: 36px; }
.meta .name, .hero-meta .name { font-size: 20px; font-weight: 700; }
.meta .counts, .hero-meta .counts { color: var(--muted); display: flex; gap: 16px; }

.tabs { display:flex; gap:28px; border-bottom:1px solid var(--border); margin-top: 8px; padding: 12px 0; justify-content:center; }
.tab { background:#0b1020; border:1px solid var(--border); padding:16px 32px; border-radius:10px; cursor:pointer; font-size:16px; }
.tab.active { border-color: var(--primary); color:#fff; }

.content-wrap{ width: 100%; max-width: min(1400px, 92vw); margin: 20px auto; padding: 0 12px; }
.feed{ display: grid; grid-template-columns: repeat(1, minmax(0, 780px)); justify-content: center; column-gap: 24px; row-gap: 20px; }
.post{ width: 100%; border:1px solid var(--border); border-radius:10px; background:#0b1020; overflow:hidden; min-height:33vh; display:flex; flex-direction:column; }
.post-head{ display:flex; align-items:center; gap:12px; padding:14px; border-bottom:1px solid var(--border); }
.avatar-wrap.mini{ width:40px; height:40px; }
.avatar-wrap.mini .avatar-fallback{ font-size:16px; }
.post-body{ padding:14px; display:grid; gap:8px; flex:1; }
.post-title{ margin:0; font-size:18px; }
.post-content{ margin:0; color:#cbd5e1; }
.post-content.muted{ color:#94a3b8; }
.post-actions{ display:flex; align-items:center; gap:12px; padding:14px; border-top:1px solid var(--border); }
.badge{ background:#0f766e; color:#d1fae5; border-radius:999px; padding:2px 8px; font-size:12px; }

@media (max-width: 1024px) {
  .feed{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .content-wrap{ margin: 12px; max-width: 100%; }
  .feed{ grid-template-columns: 1fr; }
}
</style>