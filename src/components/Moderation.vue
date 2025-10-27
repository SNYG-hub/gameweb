<template>
  <div class="moderation-container">
    <div class="moderation-header">
      <h2>内容审核</h2>
      <div class="moderation-stats">
        <span class="pending-count">
          待审核: {{ pendingCount }} 项
        </span>
      </div>
    </div>

    <div class="moderation-tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'pending' }]"
        @click="activeTab = 'pending'"
      >
        待审核 ({{ pendingItems.length }})
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'processed' }]"
        @click="activeTab = 'processed'"
      >
        已处理 ({{ processedItems.length }})
      </button>
    </div>

    <div class="moderation-content">
      <!-- 待审核内容 -->
      <div v-if="activeTab === 'pending'" class="pending-items">
        <div v-if="pendingItems.length === 0" class="empty-state">
          <h3>🎉 暂无待审核内容</h3>
          <p>所有提交的内容都已处理完毕</p>
        </div>

        <div v-else class="items-grid">
          <div 
            v-for="item in pendingItems" 
            :key="item.id"
            class="moderation-item"
          >
            <!-- 游戏审核卡片 -->
            <div v-if="item.content_type === 'game'" class="game-card">
              <div class="card-header">
                <h3>🎮 游戏审核</h3>
                <span class="submission-time">{{ formatTime(item.created_at) }}</span>
              </div>
              
              <div class="game-info" v-if="item.gameData">
                <div class="game-cover" v-if="item.gameData.cover_url">
                  <img :src="item.gameData.cover_url" :alt="item.gameData.title" />
                </div>
                <div class="game-details">
                  <h4>{{ item.gameData.title }}</h4>
                  <p class="game-company">{{ item.gameData.company || '未知开发商' }}</p>
                  <div class="game-genres" v-if="item.gameData.genres">
                    <span 
                      v-for="genre in item.gameData.genres" 
                      :key="genre"
                      class="genre-tag"
                    >
                      {{ genre }}
                    </span>
                  </div>
                  <p class="game-price" v-if="item.gameData.price">
                    ¥{{ item.gameData.price }}
                  </p>
                  <div class="game-description">
                    <p><strong>背景:</strong> {{ item.gameData.background || '无' }}</p>
                    <p><strong>玩法:</strong> {{ item.gameData.gameplay || '无' }}</p>
                  </div>
                </div>
              </div>

              <div class="submitter-info">
                <span class="submitter">提交者: {{ item.submitterData?.name || '未知用户' }}</span>
              </div>

              <div class="moderation-actions">
                <button 
                  class="btn approve-btn"
                  @click="approveContent(item)"
                  :disabled="isProcessing"
                >
                  ✅ 通过
                </button>
                <button 
                  class="btn reject-btn"
                  @click="showRejectModal(item)"
                  :disabled="isProcessing"
                >
                  ❌ 拒绝
                </button>
                <button 
                  class="btn secondary"
                  @click="viewDetails(item)"
                >
                  👁️ 详情
                </button>
              </div>
            </div>

            <!-- 帖子审核卡片 -->
            <div v-else-if="item.content_type === 'post'" class="post-card">
              <div class="card-header">
                <h3>📝 帖子审核</h3>
                <span class="submission-time">{{ formatTime(item.created_at) }}</span>
              </div>
              
              <div class="post-info" v-if="item.postData">
                <h4>{{ item.postData.title }}</h4>
                <p class="post-author">作者: {{ item.postData.author_name || '匿名' }}</p>
                <div class="post-content">
                  {{ item.postData.content }}
                </div>
                <div class="post-images" v-if="item.postData.images && item.postData.images.length > 0">
                  <img 
                    v-for="(image, index) in item.postData.images.slice(0, 3)" 
                    :key="index"
                    :src="image" 
                    :alt="`图片 ${index + 1}`"
                    class="post-image"
                  />
                  <span v-if="item.postData.images.length > 3" class="more-images">
                    +{{ item.postData.images.length - 3 }} 张图片
                  </span>
                </div>
              </div>

              <div class="submitter-info">
                <span class="submitter">提交者: {{ item.submitterData?.name || '未知用户' }}</span>
              </div>

              <div class="moderation-actions">
                <button 
                  class="btn approve-btn"
                  @click="approveContent(item)"
                  :disabled="isProcessing"
                >
                  ✅ 通过
                </button>
                <button 
                  class="btn reject-btn"
                  @click="showRejectModal(item)"
                  :disabled="isProcessing"
                >
                  ❌ 拒绝
                </button>
                <button 
                  class="btn secondary"
                  @click="viewDetails(item)"
                >
                  👁️ 详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 已处理内容 -->
      <div v-if="activeTab === 'processed'" class="processed-items">
        <div v-if="processedItems.length === 0" class="empty-state">
          <h3>📋 暂无已处理内容</h3>
          <p>处理过的内容将在这里显示</p>
        </div>

        <div v-else class="items-list">
          <div 
            v-for="item in processedItems" 
            :key="item.id"
            class="processed-item"
            :class="{ approved: item.status === 'approved', rejected: item.status === 'rejected' }"
          >
            <div class="processed-info">
              <div class="processed-header">
                <span class="content-type">
                  {{ item.content_type === 'game' ? '🎮 游戏' : '📝 帖子' }}
                </span>
                <span class="processed-status">
                  {{ item.status === 'approved' ? '✅ 已通过' : '❌ 已拒绝' }}
                </span>
              </div>
              <div class="processed-title">
                {{ getContentTitle(item) }}
              </div>
              <div class="processed-details">
                <span>提交者: {{ item.submitterData?.name || '未知用户' }}</span>
                <span>处理时间: {{ formatTime(item.moderated_at) }}</span>
              </div>
              <div v-if="item.rejection_reason" class="rejection-reason">
                拒绝原因: {{ item.rejection_reason }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 拒绝原因模态框 -->
    <div v-if="showRejectDialog" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <h3>拒绝内容</h3>
        <p>请说明拒绝的原因：</p>
        <textarea 
          v-model="rejectionReason" 
          class="textarea" 
          rows="4" 
          placeholder="请输入拒绝原因..."
          required
        ></textarea>
        <div class="modal-actions">
          <button class="btn reject-btn" @click="confirmReject" :disabled="!rejectionReason.trim()">
            确认拒绝
          </button>
          <button class="btn secondary" @click="closeRejectModal">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { store } from '../store';
import { supabase } from '../supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('pending');
const pendingItems = ref([]);
const processedItems = ref([]);
const isProcessing = ref(false);
const showRejectDialog = ref(false);
const rejectionReason = ref('');
const currentRejectItem = ref(null);

const pendingCount = computed(() => pendingItems.value.length);

// 加载待审核内容
async function loadPendingItems() {
  try {
    const { data, error } = await supabase
      .from('moderation_queue')
      .select(`
        *,
        submitterData:submitter_id(id, name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('加载待审核内容失败:', error);
      return;
    }

    // 加载关联的内容数据
    for (const item of data || []) {
      if (item.content_type === 'game') {
        const { data: gameData } = await supabase
          .from('games')
          .select('*')
          .eq('id', item.content_id)
          .single();
        item.gameData = gameData;
      } else if (item.content_type === 'post') {
        const { data: postData } = await supabase
          .from('posts')
          .select('*')
          .eq('id', item.content_id)
          .single();
        item.postData = postData;
      }
    }

    pendingItems.value = data || [];
  } catch (error) {
    console.error('加载待审核内容时出错:', error);
  }
}

// 加载已处理内容
async function loadProcessedItems() {
  try {
    const { data, error } = await supabase
      .from('moderation_queue')
      .select(`
        *,
        submitterData:submitter_id(id, name)
      `)
      .in('status', ['approved', 'rejected'])
      .order('moderated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('加载已处理内容失败:', error);
      return;
    }

    // 加载关联的内容数据
    for (const item of data || []) {
      if (item.content_type === 'game') {
        const { data: gameData } = await supabase
          .from('games')
          .select('title')
          .eq('id', item.content_id)
          .single();
        item.gameData = gameData;
      } else if (item.content_type === 'post') {
        const { data: postData } = await supabase
          .from('posts')
          .select('title')
          .eq('id', item.content_id)
          .single();
        item.postData = postData;
      }
    }

    processedItems.value = data || [];
  } catch (error) {
    console.error('加载已处理内容时出错:', error);
  }
}

// 通过内容
async function approveContent(item) {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  
  try {
    const { error } = await supabase
      .from('moderation_queue')
      .update({
        status: 'approved',
        moderator_id: store.user?.id,
        moderated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (error) {
      console.error('审核通过失败:', error);
      alert('审核通过失败，请稍后重试');
      return;
    }

    // 从待审核列表中移除
    pendingItems.value = pendingItems.value.filter(i => i.id !== item.id);
    
    // 重新加载已处理列表
    await loadProcessedItems();
    
    alert('内容已通过审核');
  } catch (error) {
    console.error('审核通过时出错:', error);
    alert('审核通过失败，请稍后重试');
  } finally {
    isProcessing.value = false;
  }
}

// 显示拒绝模态框
function showRejectModal(item) {
  currentRejectItem.value = item;
  rejectionReason.value = '';
  showRejectDialog.value = true;
}

// 关闭拒绝模态框
function closeRejectModal() {
  showRejectDialog.value = false;
  currentRejectItem.value = null;
  rejectionReason.value = '';
}

// 确认拒绝
async function confirmReject() {
  if (!rejectionReason.value.trim() || !currentRejectItem.value || isProcessing.value) return;
  
  isProcessing.value = true;
  
  try {
    const { error } = await supabase
      .from('moderation_queue')
      .update({
        status: 'rejected',
        moderator_id: store.user?.id,
        moderated_at: new Date().toISOString(),
        rejection_reason: rejectionReason.value.trim()
      })
      .eq('id', currentRejectItem.value.id);

    if (error) {
      console.error('审核拒绝失败:', error);
      alert('审核拒绝失败，请稍后重试');
      return;
    }

    // 从待审核列表中移除
    pendingItems.value = pendingItems.value.filter(i => i.id !== currentRejectItem.value.id);
    
    // 重新加载已处理列表
    await loadProcessedItems();
    
    closeRejectModal();
    alert('内容已拒绝，系统消息已发送给提交者');
  } catch (error) {
    console.error('审核拒绝时出错:', error);
    alert('审核拒绝失败，请稍后重试');
  } finally {
    isProcessing.value = false;
  }
}

// 查看详情
function viewDetails(item) {
  if (item.content_type === 'game') {
    router.push(`/game/${item.content_id}`);
  } else if (item.content_type === 'post') {
    router.push(`/forum/post/${item.content_id}`);
  }
}

// 获取内容标题
function getContentTitle(item) {
  if (item.content_type === 'game') {
    return item.gameData?.title || '未知游戏';
  } else if (item.content_type === 'post') {
    return item.postData?.title || '未知帖子';
  }
  return '未知内容';
}

// 格式化时间
function formatTime(timeString) {
  if (!timeString) return '';
  
  const time = new Date(timeString);
  const now = new Date();
  const diff = now - time;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  
  return time.toLocaleDateString();
}

onMounted(async () => {
  // 检查用户是否是审核员
  if (!store.user?.is_moderator) {
    alert('您没有权限访问此页面');
    router.push('/');
    return;
  }
  
  await Promise.all([
    loadPendingItems(),
    loadProcessedItems()
  ]);
});
</script>

<style scoped>
.moderation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.moderation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.moderation-header h2 {
  margin: 0;
  color: var(--text);
}

.pending-count {
  background: #f59e0b;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.moderation-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(96, 165, 250, 0.1);
  border-color: var(--primary);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}

.empty-state h3 {
  margin: 0 0 8px;
  color: var(--text);
}

.empty-state p {
  margin: 0;
}

.items-grid {
  display: grid;
  gap: 20px;
}

.moderation-item {
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.card-header h3 {
  margin: 0;
  color: var(--text);
}

.submission-time {
  font-size: 14px;
  color: var(--muted);
}

.game-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.game-cover {
  width: 120px;
  height: 160px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0f1c;
  border-radius: 8px;
  border: 1px solid var(--border);
  overflow: hidden;
}

.game-cover img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; /* 保持原始比例 */
  border-radius: 6px;
}

.game-details {
  flex: 1;
}

.game-details h4 {
  margin: 0 0 8px;
  color: var(--text);
  font-size: 18px;
}

.game-company {
  color: var(--muted);
  margin: 0 0 12px;
}

.game-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.genre-tag {
  background: rgba(96, 165, 250, 0.2);
  color: var(--primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.game-price {
  color: #10b981;
  font-weight: 600;
  margin: 0 0 12px;
}

.game-description p {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--text);
  line-height: 1.4;
}

.post-info h4 {
  margin: 0 0 8px;
  color: var(--text);
  font-size: 18px;
}

.post-author {
  color: var(--muted);
  margin: 0 0 12px;
  font-size: 14px;
}

.post-content {
  color: var(--text);
  line-height: 1.5;
  margin-bottom: 12px;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-images {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.post-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.more-images {
  font-size: 14px;
  color: var(--muted);
}

.submitter-info {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 6px;
}

.submitter {
  font-size: 14px;
  color: var(--muted);
}

.moderation-actions {
  display: flex;
  gap: 12px;
}

.approve-btn {
  background: #10b981;
  color: white;
}

.approve-btn:hover {
  background: #059669;
}

.reject-btn {
  background: #ef4444;
  color: white;
}

.reject-btn:hover {
  background: #dc2626;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.processed-item {
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.processed-item.approved {
  border-left: 4px solid #10b981;
}

.processed-item.rejected {
  border-left: 4px solid #ef4444;
}

.processed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.content-type {
  font-weight: 600;
  color: var(--text);
}

.processed-status {
  font-size: 14px;
  font-weight: 600;
}

.processed-item.approved .processed-status {
  color: #10b981;
}

.processed-item.rejected .processed-status {
  color: #ef4444;
}

.processed-title {
  font-size: 16px;
  color: var(--text);
  margin-bottom: 8px;
}

.processed-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 8px;
}

.rejection-reason {
  font-size: 14px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #0b1020;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 16px;
  color: var(--text);
}

.modal-content p {
  margin: 0 0 16px;
  color: var(--text);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .moderation-container {
    padding: 16px;
  }
  
  .game-info {
    flex-direction: column;
  }
  
  .game-cover {
    width: 100%;
    height: 200px;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .moderation-actions {
    flex-direction: column;
  }
  
  .processed-details {
    flex-direction: column;
    gap: 4px;
  }
}
</style>