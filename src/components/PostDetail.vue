<template>
  <section class="panel" v-if="post">
    <div class="header-row">
      <h2>{{ post.title }}</h2>
      <span class="meta">作者：{{ post.author }} · {{ formatTime(post.createdAt) }}</span>
    </div>
    <article class="content">{{ post.content }}</article>

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
import { useRoute } from 'vue-router';
import { getPost, addComment, likePost, store } from '../store';
import { supabase } from '../supabase';

const route = useRoute();
const post = computed(() => {
  const foundPost = getPost(route.params.id);
  // 调试：打印帖子数据
  if (foundPost) {
    console.log('当前帖子数据:', foundPost);
    console.log('帖子图片:', foundPost.images);
    console.log('帖子评论:', foundPost.comments);
    
    // 如果帖子有 Supabase ID，尝试加载完整数据
    if (foundPost.supabase_id) {
      // 检查图片数据
      if (!foundPost.images || foundPost.images.length === 0) {
        console.log('检测到帖子缺少图片数据，尝试重新加载...');
        loadPostImages(foundPost);
      }
      
      // 检查评论数据
      if (!foundPost.comments || foundPost.comments.length === 0) {
        console.log('检测到帖子缺少评论数据，尝试重新加载...');
        loadPostComments(foundPost);
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

/* 帖子图片样式 */
.post-images {
  margin: 16px 0;
}

.image-grid {
  display: grid;
  gap: 8px;
  border-radius: 12px;
  overflow: hidden;
}

.image-grid.single {
  grid-template-columns: 1fr;
  max-width: 400px;
}

.image-grid.double {
  grid-template-columns: 1fr 1fr;
  max-width: 500px;
}

.image-grid.quad {
  grid-template-columns: 1fr 1fr;
  max-width: 400px;
}

.image-grid.grid {
  grid-template-columns: repeat(3, 1fr);
  max-width: 450px;
}

.image-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  background: #0b1020;
  border: 1px solid var(--border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.image-grid.single .image-item img {
  height: 250px;
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