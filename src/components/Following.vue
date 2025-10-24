<template>
  <section class="panel">
    <div class="list-wrap">
      <div class="overlay-header">
        <h2 class="title">我的关注</h2>
        <router-link class="back-link" to="/profile">返回个人中心</router-link>
      </div>
      <ul>
        <li v-for="u in followingList" :key="u.id" class="row">
          <img v-if="u.avatar" :src="u.avatar" class="mini" />
          <span class="mini-fallback" v-else>{{ u.name?.[0]?.toUpperCase() }}</span>
          <span class="uname">{{ u.name }}</span>
          <button class="btn small" @click="unfollow(u.name)">取消关注</button>
        </li>
      </ul>
      <div v-if="followingList.length===0" class="empty">暂无关注</div>
    </div>
  </section>
</template>
<script setup>
import { computed } from 'vue';
import { store, followingOf, unfollowUser } from '../store';
const followingList = computed(() => followingOf(store.user?.name));
function unfollow(name){ unfollowUser(name); }
</script>
<style scoped>
.list-wrap{ max-width:920px; margin:24px auto; position:relative; padding-top:40px; }
.overlay-header{ position:absolute; top:0; left:0; right:0; display:flex; align-items:center; justify-content:space-between; padding:0 8px; }
.title{ margin:0; font-size:18px; color:var(--text); }
.back-link{ color:var(--primary); }
ul{ list-style:none; padding:0; margin:0; display:grid; gap:10px; }
.row{ display:grid; grid-template-columns:40px 1fr auto; align-items:center; gap:12px; border:1px solid var(--border); padding:12px; border-radius:8px; background:#0b1020; }
.mini{ width:40px; height:40px; border-radius:50%; object-fit:cover; }
.mini-fallback{ width:40px; height:40px; border-radius:50%; background:#0a0f1c; color:#9aa4b2; display:grid; place-items:center; font-size:14px; }
.uname{ color:#e5e7eb; }
.empty{ color:var(--muted); text-align:center; padding:12px; }
.btn.small{ padding:6px 10px; font-size:12px; }
</style>
