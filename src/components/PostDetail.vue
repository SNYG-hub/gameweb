<template>
  <div class="weibo-layout" v-if="post">
    <div class="main-content">
      <!-- 帖子内容卡片 -->
      <div class="post-card">
        <div class="post-header">
          <div class="author-info">
            <div class="avatar-wrapper">
              <img v-if="getAvatar(post.author)" :src="getAvatar(post.author)" class="avatar" />
              <div v-else class="avatar-fallback">{{ post.author?.[0]?.toUpperCase() || 'U' }}</div>
            </div>
            <div class="author-meta">
              <div class="author-name">{{ post.author }}</div>
              <div class="post-time">{{ formatTime(post.createdAt) }}</div>
            </div>
          </div>
        </div>
        
        <div class="post-body">
          <h2 class="post-title">{{ post.title }}</h2>
          <div class="post-content">{{ post.content }}</div>

          <!-- 帖子图片展示 -->
          <div class="post-images" v-if="post.images && post.images.length > 0">
            <div class="image-grid" :class="getImageGridClass(post.images.length)">
              <div 
                v-for="(image, index) in post.images" 
                :key="index" 
                class="image-item"
                @click="openImageModal(image, index)"
              >
                <img :src="image" :alt="`图片 ${index + 1}`" />
              </div>
            </div>
          </div>

          <div class="post-actions">
            <button class="action-btn like-btn" @click="onLike">
              <span class="action-icon">👍</span>
              <span class="action-text">点赞 {{ post.likes || 0 }}</span>
            </button>
            <button v-if="isModerator" class="action-btn delete-btn" @click="deleteCurrentPost" title="删除帖子">
              <span class="action-icon">🗑️</span>
              <span class="action-text">删除</span>
            </button>
            <router-link class="action-btn back-btn" to="/forum">
              <span class="action-icon">←</span>
              <span class="action-text">返回论坛</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section">
        <div class="comments-header">
          <h3>评论 {{ post.comments?.length || 0 }}</h3>
        </div>
        
        <!-- 发表评论 -->
        <div class="comment-compose">
          <form @submit.prevent="onComment">
            <div class="compose-header">
              <input 
                v-model="comment.author" 
                class="author-input" 
                placeholder="你的昵称（可匿名）" 
              />
            </div>
            <textarea 
              v-model="comment.content" 
              class="compose-textarea" 
              placeholder="写下你的评论..." 
              rows="3" 
              required
            ></textarea>
            <div class="compose-actions">
              <button class="submit-btn" type="submit">发表评论</button>
            </div>
          </form>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <div v-if="post.comments && post.comments.length > 0" class="comments">
            <div class="comment-item" v-for="c in post.comments" :key="c.id">
              <div class="comment-avatar">
                <div class="avatar-fallback">{{ c.author?.[0]?.toUpperCase() || 'U' }}</div>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ c.author }}</span>
                  <span class="comment-time">{{ formatTime(c.createdAt) }}</span>
                </div>
                <div class="comment-text">{{ c.content }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-comments">
            <div class="empty-icon">💬</div>
            <div class="empty-text">暂无评论，来说点什么吧！</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="weibo-layout">
    <div class="main-content">
      <div class="post-card">
        <div class="post-body">
          <h2>未找到该帖子</h2>
          <p>抱歉，您访问的帖子不存在或已被删除。</p>
          <router-link class="action-btn back-btn" to="/forum">
            <span class="action-icon">←</span>
            <span class="action-text">返回论坛</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <!-- 图片模态框 -->
  <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
    <div class="modal-content" @click.stop>
      <button class="close-btn" @click="closeImageModal">&times;</button>
      <img :src="currentImage" :alt="`图片 ${currentImageIndex + 1}`" />
      <div class="image-nav" v-if="post && post.images.length > 1">
        <button 
          class="nav-btn prev" 
          @click="prevImage" 
          :disabled="currentImageIndex === 0"
        >
          &#8249;
        </button>
        <span class="image-counter">{{ currentImageIndex + 1 }} / {{ post.images.length }}</span>
        <button 
          class="nav-btn next" 
          @click="nextImage" 
          :disabled="currentImageIndex === post.images.length - 1"
        >
          &#8250;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPost, addComment, likePost, store, getAvatarByName, deletePost as _deletePost } from '../store';
import { supabase } from '../supabase';

const route = useRoute();
const router = useRouter();
const post = computed(() => {
  const foundPost = getPost(route.params.id);
  // 调试：打印帖子数据
  if (foundPost) {
    console.log('当前帖子数据:', foundPost);
    console.log('帖子图片:', foundPost.images);
    console.log('帖子评论:', foundPost.comments);
    
    // 确保评论数组存在
    if (!Array.isArray(foundPost.comments)) {
      foundPost.comments = [];
    }
    
    // 如果帖子有 Supabase ID，尝试加载完整数据
    if (foundPost.supabase_id) {
      // 检查图片数据
      if (!foundPost.images || foundPost.images.length === 0) {
        console.log('检测到帖子缺少图片数据，尝试重新加载...');
        loadPostImages(foundPost);
      }
      
      // 检查评论数据
      if (foundPost.comments.length === 0) {
        console.log('检测到帖子缺少评论数据，尝试重新加载...');
        loadPostComments(foundPost);
      }
    } else {
      // 如果没有 Supabase ID 且没有评论，添加一些示例评论
      if (foundPost.comments.length === 0) {
        console.log('添加示例评论数据...');
        foundPost.comments = [
          {
            id: 'demo_1',
            author: '游戏爱好者',
            content: '这个游戏看起来很不错！期待试玩。',
            createdAt: Date.now() - 3600000 // 1小时前
          },
          {
            id: 'demo_2',
            author: '资深玩家',
            content: '画面质量很高，希望游戏性也能跟上。',
            createdAt: Date.now() - 1800000 // 30分钟前
          }
        ];
      }
    }
  }
  return foundPost;
});
const comment = reactive({ author: '', content: '' });

// 图片模态框相关
const showImageModal = ref(false);
const currentImage = ref('');
const currentImageIndex = ref(0);

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

function getAvatar(name) {
  return getAvatarByName(name);
}

// 检查当前用户是否为审核员
const isModerator = computed(() => {
  return store.user?.is_moderator || false;
});

// 删除当前帖子
function deleteCurrentPost() {
  if (!post.value) return;
  
  if (confirm('确定要删除这个帖子吗？此操作不可撤销。')) {
    _deletePost(post.value.id);
    // 删除成功后返回论坛页面
    router.push('/forum');
  }
}

// 图片相关函数
function getImageGridClass(imageCount) {
  if (imageCount === 1) return 'single';
  if (imageCount === 2) return 'double';
  if (imageCount <= 4) return 'quad';
  return 'grid';
}

function openImageModal(image, index) {
  currentImage.value = image;
  currentImageIndex.value = index;
  showImageModal.value = true;
  document.body.style.overflow = 'hidden'; // 防止背景滚动
}

function closeImageModal() {
  showImageModal.value = false;
  document.body.style.overflow = ''; // 恢复滚动
}

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
    currentImage.value = post.value.images[currentImageIndex.value];
  }
}

function nextImage() {
  if (post.value && currentImageIndex.value < post.value.images.length - 1) {
    currentImageIndex.value++;
    currentImage.value = post.value.images[currentImageIndex.value];
  }
}

// 重新加载帖子图片
async function loadPostImages(postData) {
  if (!postData.supabase_id) return;
  
  try {
    console.log('从数据库加载帖子图片:', postData.supabase_id);
    
    // 从 Supabase 加载图片数据
    const { data: imageData, error } = await supabase
      .from('post_images')
      .select('image_url, position')
      .eq('post_id', postData.supabase_id)
      .order('position');
    
    if (error) {
      console.error('加载帖子图片失败:', error);
      return;
    }
    
    if (imageData && imageData.length > 0) {
      const imageUrls = imageData.map(img => img.image_url);
      console.log('成功加载帖子图片:', imageUrls);
      
      // 更新本地帖子数据
      postData.images = imageUrls;
      
      // 强制触发响应式更新
      const postIndex = store.posts.findIndex(p => p.id === postData.id);
      if (postIndex !== -1) {
        store.posts[postIndex] = { ...postData };
      }
    }
  } catch (error) {
    console.error('加载帖子图片过程中出错:', error);
  }
}

// 重新加载帖子评论
async function loadPostComments(postData) {
  if (!postData.supabase_id) return;
  
  try {
    console.log('从数据库加载帖子评论:', postData.supabase_id);
    
    // 从 Supabase 加载评论数据
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:author_id(name, avatar_url)
      `)
      .eq('post_id', postData.supabase_id)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('加载帖子评论失败:', error);
      return;
    }
    
    if (commentsData && commentsData.length > 0) {
      const comments = commentsData.map(comment => ({
        id: comment.id,
        author: comment.author_name || comment.profiles?.name || '匿名',
        content: comment.content,
        createdAt: new Date(comment.created_at).getTime()
      }));
      
      console.log('成功加载帖子评论:', comments);
      
      // 更新本地帖子数据
      postData.comments = comments;
      
      // 强制触发响应式更新
      const postIndex = store.posts.findIndex(p => p.id === postData.id);
      if (postIndex !== -1) {
        store.posts[postIndex] = { ...postData };
      }
    } else {
      console.log('该帖子暂无评论');
      // 确保评论数组存在
      if (!postData.comments) {
        postData.comments = [];
      }
    }
  } catch (error) {
    console.error('加载帖子评论过程中出错:', error);
  }
}
</script>

<style scoped>
/* 微博风格布局 */
.weibo-layout {
  max-width: 680px;
  margin: 0 auto;
  padding: 20px 16px;
  background: var(--bg);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 帖子卡片 */
.post-card {
  background: var(--panel);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid var(--border);
}

.post-header {
  padding: 16px 20px 0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.author-name {
  font-weight: 600;
  color: var(--text);
  font-size: 15px;
}

.post-time {
  color: var(--muted);
  font-size: 13px;
  margin-top: 2px;
}

.post-body {
  padding: 12px 20px 20px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.post-content {
  color: var(--text);
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 16px;
}

.post-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f7f9fa;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  background: #f7f9fa;
  color: #536471;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  background: #e1e8ed;
  color: #333;
}

.like-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn {
  background: #f7f9fa;
  color: #ef4444;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.action-icon {
  font-size: 16px;
}

/* 评论区域 */
.comments-section {
  background: var(--panel);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  overflow: hidden;
}

.comments-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f7f9fa;
}

.comments-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

/* 评论输入框 */
.comment-compose {
  padding: 16px 20px;
  border-bottom: 1px solid #f7f9fa;
}

.compose-header {
  margin-bottom: 12px;
}

.author-input {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 20px;
  font-size: 14px;
  background: #f7f9fa;
  outline: none;
  transition: all 0.2s ease;
}

.author-input:focus {
  border-color: #1d9bf0;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(29, 155, 240, 0.1);
}

.compose-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.compose-textarea:focus {
  border-color: #1d9bf0;
  box-shadow: 0 0 0 2px rgba(29, 155, 240, 0.1);
}

.compose-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.submit-btn {
  padding: 8px 24px;
  background: #1d9bf0;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #1a8cd8;
}

.submit-btn:disabled {
  background: #8b9dc3;
  cursor: not-allowed;
}

/* 评论列表 */
.comments-list {
  max-height: 600px;
  overflow-y: auto;
}

.comments {
  padding: 0;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f7f9fa;
  transition: background-color 0.2s ease;
}

.comment-item:hover {
  background: #f7f9fa;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar .avatar-fallback {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}

.comment-time {
  color: var(--muted);
  font-size: 13px;
}

.comment-text {
  color: var(--text);
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

/* 空状态 */
.empty-comments {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 15px;
}

/* 帖子图片样式 */
.post-images {
  margin: 16px 0;
}

.image-grid {
  display: grid;
  gap: 4px;
  border-radius: 12px;
  overflow: hidden;
}

.image-grid.single {
  grid-template-columns: 1fr;
  max-width: 100%;
}

.image-grid.double {
  grid-template-columns: 1fr 1fr;
  max-width: 100%;
}

.image-grid.quad {
  grid-template-columns: 1fr 1fr;
  max-width: 100%;
}

.image-grid.grid {
  grid-template-columns: repeat(3, 1fr);
  max-width: 100%;
}

.image-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  background: #f7f9fa;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.image-grid.single .image-item img {
  height: 300px;
}

/* 图片模态框样式 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.image-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  color: white;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-counter {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}
</style>