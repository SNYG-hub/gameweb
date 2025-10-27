<template>
  <section class="panel" v-if="game">
    <div class="header-row">
      <h2>{{ game.title }}</h2>
      <span v-if="game.genres?.length" class="badges">
        <span class="badge" v-for="t in game.genres" :key="t">{{ t }}</span>
      </span>
      <span v-else class="badge">{{ game.genre }}</span>
    </div>
    
    <div class="grid cols-2">
      <div>
        <p class="muted">公司/工作室：{{ game.company || '未知' }}</p>
        <p>定价：<strong>¥{{ game.price }}</strong></p>
        <p>
          官网：
          <a v-if="game.officialUrl" :href="game.officialUrl" target="_blank" rel="noopener noreferrer">
            {{ game.officialUrl }}
          </a>
          <span v-else class="muted">未提供</span>
        </p>
        <div v-if="game.cover" class="cover">
          <img :src="game.cover" :alt="game.title" />
        </div>
      </div>
      <div>
        <h3>游戏背景</h3>
        <p class="text">{{ game.background || '暂无背景介绍。' }}</p>
        <h3>玩法介绍</h3>
        <p class="text">{{ game.gameplay || '暂无玩法介绍。' }}</p>
      </div>
    </div>

    <!-- 图片画廊轮播 -->
    <div class="gallery-section">
      <h3>图片画廊</h3>
      <Carousel :images="galleryImages" />
    </div>

    <!-- 评分系统 -->
    <div class="rating-section">
      <h3>评分</h3>
      <div class="rating-container">
        <div class="stars-display">
          <div class="stars-row">
            <span class="rating-label">平均：</span>
            <div class="stars-avg">
              <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.round(averageRating) }">★</span>
            </div>
            <span class="rating-text">{{ averageRating.toFixed(1) }} 星 · 共 {{ totalRatings }} 次评分</span>
          </div>
        </div>
        
        <div class="user-rating">
          <div class="rating-input">
            <span class="rating-label">我的评分：</span>
            <div class="stars-input">
              <button
                v-for="n in 5"
                :key="n"
                class="star-btn"
                :class="{ 
                  active: n <= (hover || userRating),
                  'user-rated': userRating > 0 && n <= userRating
                }"
                @mouseenter="hover = n"
                @mouseleave="hover = 0"
                @click="rate(n)"
                :aria-label="`评分 ${n} 星`"
              >★</button>
            </div>
            <button 
              v-if="userRating > 0" 
              class="btn-withdraw" 
              @click="withdrawRating"
              title="撤回评分"
            >
              撤回
            </button>
          </div>
          <div v-if="userRating > 0" class="user-rating-text">
            您已评分：{{ userRating }} 星
          </div>
        </div>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="comments-section">
      <div class="comments-header">
        <h3>评价和评论</h3>
        <span class="comments-count">{{ comments.length }} 条评论</span>
      </div>
      
      <!-- 发表评论 -->
      <div class="comment-form">
        <div class="form-header">
          <div class="user-avatar">
            <div class="avatar-placeholder">{{ newComment.author.charAt(0) || '匿' }}</div>
          </div>
          <div class="form-content">
            <input 
              v-model="newComment.author" 
              class="author-input" 
              placeholder="输入您的昵称"
              maxlength="20"
            />
            <div class="rating-in-comment">
              <span class="comment-rating-label">评分：</span>
              <div class="comment-stars">
                <button
                  v-for="n in 5"
                  :key="n"
                  class="comment-star-btn"
                  :class="{ active: n <= (commentHover || newComment.rating) }"
                  @mouseenter="commentHover = n"
                  @mouseleave="commentHover = 0"
                  @click="newComment.rating = n"
                >★</button>
              </div>
            </div>
          </div>
        </div>
        <textarea 
          v-model="newComment.content" 
          class="comment-textarea" 
          placeholder="写下您的评价..."
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="form-actions">
          <span class="char-count">{{ newComment.content.length }}/500</span>
          <button class="btn-submit" @click="submitComment" :disabled="!canSubmit">
            发表评论
          </button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="comment-avatar">
              <div class="avatar-placeholder">{{ comment.author.charAt(0) }}</div>
            </div>
            <div class="comment-info">
              <div class="comment-author">{{ comment.author }}</div>
              <div class="comment-rating" v-if="comment.rating">
                <span v-for="n in 5" :key="n" class="comment-star" :class="{ filled: n <= comment.rating }">★</span>
              </div>
              <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
            </div>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <button class="action-btn" @click="likeComment(comment.id)">
              <span class="action-icon">👍</span>
              <span>{{ comment.likes || 0 }}</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">💬</span>
              <span>回复</span>
            </button>
          </div>
        </div>
        
        <div v-if="comments.length === 0" class="empty-comments">
          暂无评论，快来发表第一条评价吧！
        </div>
      </div>
    </div>

    <div class="actions">
      <router-link class="btn secondary" to="/">返回目录</router-link>
      <router-link class="btn" to="/forum">去论坛交流</router-link>
    </div>
  </section>

  <section v-else class="panel">
    <h2>未找到该游戏</h2>
    <router-link class="btn" to="/">返回目录</router-link>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { getGame, addRating, getAverageStars, getUserRating, withdrawUserRating, addGameComment, likeGameComment } from '../store';
import Carousel from './Carousel.vue';
import { getGalleryImages } from '../utils/imageUtils.js';

const route = useRoute();
const game = computed(() => getGame(route.params.id));

// 图片画廊
const galleryImages = computed(() => {
  const g = game.value?.gallery || [];
  
  if (g.length > 0) {
    return g;
  }
  
  const gameId = game.value?.id || 'default';
  const sampleImages = getGalleryImages(gameId);
  
  if (game.value?.cover) {
    return [game.value.cover, ...sampleImages.slice(1)];
  }
  
  return sampleImages;
});

// 评分系统
const hover = ref(0);
const userRating = computed(() => getUserRating(game.value?.id));
const averageRating = computed(() => getAverageStars(game.value) || 0);
const totalRatings = computed(() => Array.isArray(game.value?.ratings) ? game.value.ratings.length : 0);

function rate(n) {
  if (!game.value) return;
  addRating(game.value.id, n);
}

function withdrawRating() {
  if (!game.value) return;
  withdrawUserRating(game.value.id);
}

// 评论系统
const comments = computed(() => game.value?.comments || []);
const commentHover = ref(0);
const newComment = reactive({
  author: '',
  content: '',
  rating: 0
});

const canSubmit = computed(() => {
  return newComment.content.trim().length > 0 && newComment.author.trim().length > 0;
});

function submitComment() {
  if (!canSubmit.value || !game.value) return;
  
  const commentData = {
    author: newComment.author.trim(),
    content: newComment.content.trim(),
    rating: newComment.rating
  };
  
  addGameComment(game.value.id, commentData);
  
  // 重置表单
  newComment.author = '';
  newComment.content = '';
  newComment.rating = 0;
}

function likeComment(commentId) {
  if (!game.value) return;
  likeGameComment(game.value.id, commentId);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`;
  
  return date.toLocaleDateString();
}
</script>

<style scoped>
.header-row { display: flex; align-items: center; justify-content: space-between; }
.muted { color: var(--muted); }
.badges { display: flex; gap: 6px; flex-wrap: wrap; }
.cover { 
  margin-top: 12px; 
  width: 100%; 
  min-height: 200px;
  max-height: 350px; 
  background: #0a0f1c; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border: 1px solid var(--border); 
  border-radius: 8px; 
  overflow: hidden;
  aspect-ratio: 3/4;
}
.cover img { 
  max-width: 100%; 
  max-height: 100%; 
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 6px;
}
.text { white-space: pre-wrap; line-height: 1.7; }
.actions { margin-top: 24px; display: flex; gap: 8px; }

/* 图片画廊 */
.gallery-section {
  margin: 24px 0;
}

/* 评分系统 */
.rating-section {
  margin: 24px 0;
  padding: 20px;
  background: #0b1020;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.rating-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stars-display {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.stars-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-label {
  color: var(--muted);
  font-size: 14px;
  min-width: 60px;
}

.stars-avg {
  display: flex;
  gap: 2px;
}

.star {
  color: #64748b;
  font-size: 18px;
}

.star.filled {
  color: #f59e0b;
}

.rating-text {
  color: var(--muted);
  font-size: 14px;
}

.user-rating {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stars-input {
  display: flex;
  gap: 4px;
}

.star-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 4px;
}

.star-btn:hover {
  transform: scale(1.1);
  color: #fbbf24;
}

.star-btn.active {
  color: #f59e0b;
}

.star-btn.user-rated {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.btn-withdraw {
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-withdraw:hover {
  background: #b91c1c;
}

.user-rating-text {
  color: #f59e0b;
  font-size: 14px;
  font-weight: 500;
}

/* 评论区 */
.comments-section {
  margin: 24px 0;
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.comments-count {
  color: var(--muted);
  font-size: 14px;
}

/* 评论表单 */
.comment-form {
  background: #0b1020;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.form-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar, .comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.author-input {
  background: #1a1f2e;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: white;
  font-size: 14px;
}

.rating-in-comment {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-rating-label {
  color: var(--muted);
  font-size: 12px;
}

.comment-stars {
  display: flex;
  gap: 2px;
}

.comment-star-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.comment-star-btn:hover,
.comment-star-btn.active {
  color: #f59e0b;
}

.comment-textarea {
  width: 100%;
  background: #1a1f2e;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  color: white;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  color: var(--muted);
  font-size: 12px;
}

.btn-submit {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  background: #374151;
  cursor: not-allowed;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: #0b1020;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}

.comment-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-info {
  flex: 1;
}

.comment-author {
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.comment-rating {
  display: flex;
  gap: 2px;
  margin-bottom: 4px;
}

.comment-star {
  color: #64748b;
  font-size: 14px;
}

.comment-star.filled {
  color: #f59e0b;
}

.comment-time {
  color: var(--muted);
  font-size: 12px;
}

.comment-content {
  color: #e2e8f0;
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.action-icon {
  font-size: 14px;
}

.empty-comments {
  text-align: center;
  color: var(--muted);
  padding: 40px 20px;
  background: #0b1020;
  border: 1px solid var(--border);
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid.cols-2 {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .cover {
    max-height: 280px;
    aspect-ratio: 16/10;
  }
  
  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .badges {
    align-self: stretch;
  }
  
  .stars-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .rating-input {
    flex-wrap: wrap;
  }
  
  .form-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>