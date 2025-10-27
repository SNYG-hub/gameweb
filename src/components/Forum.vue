<template>
  <div class="weibo-forum">
    <div class="forum-container">
      <div class="forum-header">
        <div class="header-content">
          <h2 class="forum-title">论坛</h2>
          <p class="forum-desc">每个人都可以发帖与评论，支持配图与关注作者</p>
        </div>
        <router-link class="compose-btn" to="/forum/new">
          <span class="compose-icon">✏️</span>
          <span>发帖</span>
        </router-link>
      </div>

      <div class="feed">
        <article
          v-for="p in postsFiltered"
          :key="p.id"
          class="post-card"
          @click="goDetail(p.id)"
        >
          <div class="post-header">
            <div class="author-info">
              <div class="avatar-wrapper">
                <img v-if="getAvatar(p.author)" :src="getAvatar(p.author)" class="avatar" />
                <div v-else class="avatar-fallback">{{ p.author?.[0]?.toUpperCase() || 'U' }}</div>
              </div>
              <div class="author-meta">
                <div class="author-name">{{ p.author }}</div>
                <div class="post-time">{{ formatTime(p.createdAt) }}</div>
              </div>
            </div>
            <div class="post-actions">
              <button class="follow-btn" @click.stop="toggleFollow(p.author)">
                {{ isFollowing(p.author) ? '已关注' : '关注' }}
              </button>
              <button v-if="isModerator" class="delete-btn" @click.stop="deletePost(p.id)" title="删除帖子">
                🗑️
              </button>
            </div>
          </div>

          <div class="post-body">
            <h3 class="post-title">{{ p.title }}</h3>
            <div class="post-content" :class="{ expanded: isExpanded(p.id) }">
              {{ p.content }}
            </div>
            <div class="post-images" v-if="Array.isArray(p.images) && p.images.length">
              <img v-for="(img,i) in p.images" :key="i" :src="img" />
            </div>
            <div class="post-actions" v-if="p.content && p.content.length > 100">
              <button class="expand-btn" @click.stop="toggleExpand(p.id)">
                {{ isExpanded(p.id) ? '收起' : '展开更多' }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-if="store.posts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无帖子，快来发表第一条吧！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { store, getAvatarByName, isFollowing as _isFollowing, followUser, unfollowUser, deletePost as _deletePost } from '../store';

const router = useRouter();
const expandedIds = ref(new Set());
const postsFiltered = computed(() => {
  const q = (store.searchForum || '').trim().toLowerCase();
  if (!q) return store.posts;
  return store.posts.filter(p => (p.author?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q)));
});

// 检查当前用户是否为审核员
const isModerator = computed(() => {
  return store.user?.is_moderator || false;
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
function deletePost(postId) {
  if (confirm('确定要删除这个帖子吗？此操作不可撤销。')) {
    _deletePost(postId);
  }
}
</script>

<style scoped>
/* 微博风格论坛布局 */
.weibo-forum {
  min-height: 100vh;
  background: var(--bg);
  padding: 20px 0;
}

.forum-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 论坛头部 */
.forum-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: var(--panel);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
}

.header-content {
  flex: 1;
}

.forum-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.forum-desc {
  margin: 0;
  color: #8b9dc3;
  font-size: 14px;
}

.compose-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #1d9bf0;
  color: white;
  text-decoration: none;
  border-radius: 24px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.compose-btn:hover {
  background: #1a8cd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 155, 240, 0.3);
}

.compose-icon {
  font-size: 16px;
}

/* 信息流 */
.feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 帖子卡片 */
.post-card {
  background: var(--panel);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: var(--primary);
}

/* 帖子头部 */
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e1e8ed;
}

.avatar-fallback {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.author-meta {
  flex: 1;
  min-width: 0;
}

.author-name {
  font-weight: 600;
  color: var(--text);
  font-size: 15px;
  margin-bottom: 2px;
}

.post-time {
  color: var(--muted);
  font-size: 13px;
}

.follow-btn {
  padding: 6px 16px;
  background: transparent;
  color: #1d9bf0;
  border: 1px solid #1d9bf0;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-btn:hover {
  background: #1d9bf0;
  color: white;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  padding: 4px 8px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
}

/* 帖子内容 */
.post-body {
  padding: 12px 20px 20px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.post-content {
  color: var(--text);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-content.expanded {
  display: block;
  -webkit-line-clamp: unset;
}

/* 帖子图片 */
.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.post-images img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.post-images img:hover {
  transform: scale(1.05);
}

/* 帖子操作 */
.post-actions {
  display: flex;
  justify-content: flex-end;
}

.expand-btn {
  padding: 4px 12px;
  background: transparent;
  color: #1d9bf0;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: #f0f8ff;
  color: #1a8cd8;
}

/* 空状态 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  background: var(--panel);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: var(--muted);
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .forum-container {
    padding: 0 12px;
  }
  
  .forum-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .compose-btn {
    align-self: stretch;
    justify-content: center;
  }
  
  .post-card {
    margin: 0 -4px;
  }
  
  .post-header,
  .post-body {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .post-images {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>