<template>
  <div class="layout">
    <header class="header">
      <div class="brand">
        <img class="logo" :src="logo" alt="Cyberpunk Logo" />
        <div class="brand-text">
          <h1 class="nggc-title">NGGC</h1>
          <span class="brand-sub">Next-Gen Game Community</span>
        </div>
      </div>
      <nav class="nav">
        <router-link class="nav-card" to="/">
          <span class="nav-title">游戏目录</span>
          <span class="nav-sub">浏览与跳转详情</span>
        </router-link>
        <router-link class="nav-card" to="/forum">
          <span class="nav-title">论坛</span>
          <span class="nav-sub">浏览帖子与交流</span>
        </router-link>
        <router-link class="nav-card" to="/rank">
          <span class="nav-title">排行榜</span>
          <span class="nav-sub">按评分/价格排序</span>
        </router-link>
      </nav>
      <div class="header-tools">
        <template v-if="$route.path==='/'">
          <input class="input search" v-model="store.searchGame" placeholder="搜索游戏名称或公司" />
          <button class="search-btn" @click="searchAction" aria-label="搜索">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/></svg>
          </button>
        </template>
        <template v-else-if="$route.path.startsWith('/forum')">
          <input class="input search" v-model="store.searchForum" placeholder="搜索作者或标题" />
          <button class="search-btn" @click="searchAction" aria-label="搜索">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/></svg>
          </button>
        </template>
      </div>
      <div class="user-actions">
        <template v-if="user">
          <span class="user-name">你好，{{ user.name }}</span>
          <!-- 审核员按钮 -->
          <router-link v-if="user.is_moderator" class="btn small moderator-btn" to="/moderation">
            审核
          </router-link>
          <!-- 私信按钮 -->
          <router-link class="btn small messages-btn" to="/messages">
            私信
            <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
          </router-link>
          <router-link class="btn small" to="/profile">个人中心</router-link>
        </template>
        <template v-else>
          <button class="btn small test-btn" @click="loginAsModerator">测试审核员</button>
          <router-link class="nav-card small" to="/auth">
            <span class="nav-title">登录</span>
            <span class="nav-sub">进入个人中心</span>
          </router-link>
        </template>
      </div>
    </header>
    <main class="main">
      <router-view :key="$route.fullPath" />
    </main>
    <footer class="footer">
      <small>© 2025 游戏论坛. 仅用于演示，数据保存在浏览器。</small>
    </footer>
  </div>
</template>

<script setup>
import logo from './assets/cyberpunk-logo.svg';
import { computed, ref, onMounted, watch } from 'vue';
import { store, loadDataFromSupabase, createTestModerator } from './store';
import { supabase } from './supabase';

const user = computed(() => store.user);
const unreadCount = ref(0);
// 主题切换（赛博朋克风）
const theme = ref(localStorage.getItem('theme') || 'dark');
const themeLabel = computed(() => theme.value === 'dark' ? '赛博亮' : '赛博暗');
const themeClass = computed(() => theme.value === 'dark' ? 'theme-dark' : 'theme-light');
function applyTheme(){
  const cls = theme.value === 'dark' ? 'theme-dark' : 'theme-light';
  document.documentElement.classList.remove('theme-dark','theme-light');
  document.documentElement.classList.add(cls);
  localStorage.setItem('theme', theme.value);
}
function toggleTheme(){ theme.value = theme.value === 'dark' ? 'light' : 'dark'; applyTheme(); }
applyTheme();

// 登录为测试审核员
function loginAsModerator() {
  createTestModerator();
  alert('已登录为测试审核员！现在可以删除游戏和帖子。');
}

// 获取未读消息数
async function loadUnreadCount() {
  if (!user.value?.id) {
    unreadCount.value = 0;
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('receiver_id', user.value.id)
      .eq('is_read', false);

    if (!error) {
      unreadCount.value = data?.length || 0;
    }
  } catch (error) {
    console.error('获取未读消息数失败:', error);
  }
}

// 监听用户登录状态变化
watch(user, async (newUser) => {
  if (newUser) {
    await loadUnreadCount();
    // 设置定时器定期更新未读消息数
    setInterval(loadUnreadCount, 30000); // 每30秒更新一次
  } else {
    unreadCount.value = 0;
  }
}, { immediate: true });

// 应用启动时加载数据
onMounted(async () => {
  applyTheme();
  // 从 Supabase 加载数据
  await loadDataFromSupabase();
});
// 全局布局，仅路由切换
</script>

<style>
:root {
  --bg: #0e1428;        /* 页面背景：更深的蓝黑 */
  --nav: #0b1330;       /* 顶部导航：最深蓝 */
  --panel: #101935;     /* 主面板：中深蓝 */
  --panel2: #0d1833;    /* 次面板：略深 */
  --border: #1b2a4a;    /* 边框：深蓝 */
  --text: #e6f0ff;      /* 文本：偏冷的浅色 */
  --muted: #9bb0c8;     /* 次级文字 */
  --primary: #3ea6ff;   /* 亮蓝 */
  --accent: #34d399;    /* 绿色，用于次级按钮 */
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,"Noto Sans","PingFang SC","Microsoft YaHei","Hiragino Sans GB","WenQuanYi Micro Hei",sans-serif; }

/* 微博风格页面的全局样式 - 使用原始深色背景 */
.weibo-layout, .weibo-forum {
  background: var(--bg) !important;
}

.layout:has(.weibo-layout) .main,
.layout:has(.weibo-forum) .main {
  background: var(--bg);
  padding: 0;
}
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }

.layout { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; }
.header { border-bottom: 1px solid var(--border); background: var(--nav); padding: 12px 16px; display: flex; align-items: center; gap: 16px; box-shadow: inset 0 -1px 0 rgba(255,255,255,0.03); }
.header h1 { margin: 0; font-size: 20px; }
.logo { width: 32px; height: 32px; filter: drop-shadow(0 0 6px rgba(0,229,255,0.6)) drop-shadow(0 0 10px rgba(255,0,170,0.35)); }
.brand { display: flex; align-items: center; gap: 10px; }
.brand-text { display: grid; line-height: 1; }
.header-tools { margin-left: 12px; display: flex; align-items: center; gap: 8px; }
.input.search { width: 320px; background: var(--panel2); border-color: #243a63; }
.search-btn { background: #1a2a4a; color: #cfe7ff; border: 1px solid #243a63; border-radius: 6px; width: 36px; height: 32px; display: grid; place-items: center; cursor: pointer; }
.search-btn:hover { background: #203256; border-color: var(--primary); }
.user-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.user-name { color: var(--muted); }
.nggc-title {
  margin: 0;
  font-size: 22px;
  background: linear-gradient(90deg,#00e5ff,#ff00aa,#8ef511);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 8px rgba(96,165,250,0.4), 0 0 12px rgba(255,0,170,0.25);
}
.brand-sub { color: var(--muted); font-size: 12px; }
/* 主题下的输入和卡片底色继承变量 */
.input, .textarea, .select, .card { background: var(--panel); }
.nav { display: grid; grid-template-columns: repeat(3, minmax(140px, 1fr)); gap: 12px; }
.main { padding: 16px; }
.footer { border-top: 1px solid var(--border); background: var(--panel); padding: 12px 16px; text-align: center; color: var(--muted); }

.nav-card {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--panel), var(--panel2));
  color: var(--text);
  text-decoration: none;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.nav-card.small { grid-auto-flow: row; padding: 8px 10px; }
.nav-card.small .nav-title { font-size: 14px; }
.nav-card.small .nav-sub { font-size: 11px; }
.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0,0,0,0.4);
  border-color: var(--primary);
}
.nav-title { font-weight: 600; }
.nav-sub { color: var(--muted); font-size: 12px; }

.panel { background: linear-gradient(180deg, var(--panel), var(--panel2)); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
.input, .textarea, .select {
  width: 100%; background: #0b1020; color: var(--text);
  border: 1px solid var(--border); border-radius: 6px; padding: 10px; outline: none;
}
.input:focus, .textarea:focus, .select:focus { border-color: var(--primary); }
.btn { background: var(--primary); color: #06142a; border: none; padding: 10px 14px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.btn.secondary { background: var(--accent); }
.btn:hover:not(:disabled) { filter: brightness(1.05); }
.btn:disabled { 
  background: #6b7280; 
  cursor: not-allowed; 
  opacity: 0.7; 
  filter: none;
}
.btn.small { padding: 6px 10px; font-size: 12px; }
.btn.toggle-theme { background: transparent; color: var(--text); border: 1px solid var(--border); padding: 8px 12px; border-radius: 999px; box-shadow: 0 0 10px rgba(0,229,255,.35), 0 0 10px rgba(255,0,170,.25) inset; }
.btn.toggle-theme:hover { border-color: var(--primary); box-shadow: 0 0 12px rgba(0,229,255,.45), 0 0 12px rgba(255,0,170,.35) inset; }

/* 私信和审核按钮样式 */
.messages-btn {
  position: relative;
}

.unread-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1.2;
}

.moderator-btn {
  background: #f59e0b;
  color: white;
}

.moderator-btn:hover {
  background: #d97706;
}

.test-btn {
  background: #10b981;
  color: white;
  border: none;
}

.test-btn:hover {
  background: #059669;
}
.grid { display: grid; gap: 12px; }
.grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 768px) { .grid.cols-2, .grid.cols-3 { grid-template-columns: 1fr; } }
.card { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--panel); }
.card .body { padding: 12px; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #0f766e; color: #d1fae5; font-size: 12px; }
</style>