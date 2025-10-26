<template>
  <div class="messages-container">
    <div class="messages-header">
      <h2>私信中心</h2>
      <div class="message-stats">
        <span class="unread-count" v-if="unreadCount > 0">
          {{ unreadCount }} 条未读消息
        </span>
      </div>
    </div>

    <div class="messages-content">
      <!-- 会话列表 -->
      <div class="conversations-panel">
        <h3>会话列表</h3>
        <div class="conversation-list">
          <div 
            v-for="conversation in conversations" 
            :key="conversation.id"
            class="conversation-item"
            :class="{ active: selectedConversation?.id === conversation.id }"
            @click="selectConversation(conversation)"
          >
            <div class="conversation-avatar">
              {{ getOtherUser(conversation).username?.charAt(0) || '?' }}
            </div>
            <div class="conversation-info">
              <div class="conversation-name">
                {{ getOtherUser(conversation).username || '未知用户' }}
              </div>
              <div class="conversation-preview">
                {{ conversation.lastMessage?.content || '暂无消息' }}
              </div>
              <div class="conversation-time">
                {{ formatTime(conversation.last_message_at) }}
              </div>
            </div>
            <div class="conversation-badge" v-if="getUnreadCount(conversation) > 0">
              {{ getUnreadCount(conversation) }}
            </div>
          </div>
        </div>

        <!-- 系统消息 -->
        <div class="system-messages" v-if="systemMessages.length > 0">
          <h4>系统消息</h4>
          <div 
            v-for="message in systemMessages" 
            :key="message.id"
            class="system-message-item"
            :class="{ unread: !message.is_read }"
            @click="markAsRead(message)"
          >
            <div class="system-message-icon">
              <span v-if="message.message_type === 'moderation'">⚖️</span>
              <span v-else>📢</span>
            </div>
            <div class="system-message-content">
              <div class="system-message-text">{{ message.content }}</div>
              <div class="system-message-time">{{ formatTime(message.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息详情 -->
      <div class="messages-panel">
        <div v-if="selectedConversation" class="chat-container">
          <div class="chat-header">
            <h3>与 {{ getOtherUser(selectedConversation).username }} 的对话</h3>
          </div>
          
          <div class="chat-messages" ref="messagesContainer">
            <div 
              v-for="message in currentMessages" 
              :key="message.id"
              class="message-item"
              :class="{ 
                'own-message': message.sender_id === store.user?.id,
                'system-message': message.message_type !== 'user'
              }"
            >
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.created_at) }}</div>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <form @submit.prevent="sendMessage" class="message-form">
              <input 
                v-model="newMessage" 
                class="input message-input" 
                placeholder="输入消息..." 
                :disabled="isSending"
                required
              />
              <button 
                type="submit" 
                class="btn send-btn"
                :disabled="isSending || !newMessage.trim()"
              >
                {{ isSending ? '发送中...' : '发送' }}
              </button>
            </form>
          </div>
        </div>

        <div v-else class="no-conversation">
          <div class="no-conversation-content">
            <h3>选择一个会话开始聊天</h3>
            <p>从左侧选择一个会话，或查看系统消息</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { store } from '../store';
import { supabase } from '../supabase';

const conversations = ref([]);
const systemMessages = ref([]);
const selectedConversation = ref(null);
const currentMessages = ref([]);
const newMessage = ref('');
const isSending = ref(false);
const unreadCount = ref(0);
const messagesContainer = ref(null);

// 获取会话列表
async function loadConversations() {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:user1_id(id, username),
        user2:user2_id(id, username),
        lastMessage:last_message_id(content, created_at)
      `)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('加载会话失败:', error);
      return;
    }

    conversations.value = data || [];
  } catch (error) {
    console.error('加载会话时出错:', error);
  }
}

// 获取系统消息
async function loadSystemMessages() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', store.user?.id)
      .in('message_type', ['system', 'moderation'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('加载系统消息失败:', error);
      return;
    }

    systemMessages.value = data || [];
  } catch (error) {
    console.error('加载系统消息时出错:', error);
  }
}

// 获取未读消息数
async function loadUnreadCount() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('receiver_id', store.user?.id)
      .eq('is_read', false);

    if (error) {
      console.error('获取未读消息数失败:', error);
      return;
    }

    unreadCount.value = data?.length || 0;
  } catch (error) {
    console.error('获取未读消息数时出错:', error);
  }
}

// 选择会话
async function selectConversation(conversation) {
  selectedConversation.value = conversation;
  await loadMessages(conversation);
  await markConversationAsRead(conversation);
}

// 加载会话消息
async function loadMessages(conversation) {
  try {
    const otherUser = getOtherUser(conversation);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${store.user?.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${store.user?.id})`)
      .eq('message_type', 'user')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('加载消息失败:', error);
      return;
    }

    currentMessages.value = data || [];
    
    // 滚动到底部
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  } catch (error) {
    console.error('加载消息时出错:', error);
  }
}

// 发送消息
async function sendMessage() {
  if (!newMessage.value.trim() || !selectedConversation.value || isSending.value) return;

  const otherUser = getOtherUser(selectedConversation.value);
  isSending.value = true;

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: store.user?.id,
        receiver_id: otherUser.id,
        content: newMessage.value.trim(),
        message_type: 'user'
      }])
      .select()
      .single();

    if (error) {
      console.error('发送消息失败:', error);
      alert('发送消息失败，请稍后重试');
      return;
    }

    // 添加到当前消息列表
    currentMessages.value.push(data);
    newMessage.value = '';

    // 滚动到底部
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });

    // 重新加载会话列表
    await loadConversations();
  } catch (error) {
    console.error('发送消息时出错:', error);
    alert('发送消息失败，请稍后重试');
  } finally {
    isSending.value = false;
  }
}

// 标记消息为已读
async function markAsRead(message) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', message.id);

    if (!error) {
      message.is_read = true;
      await loadUnreadCount();
    }
  } catch (error) {
    console.error('标记消息已读失败:', error);
  }
}

// 标记会话为已读
async function markConversationAsRead(conversation) {
  try {
    const otherUser = getOtherUser(conversation);
    
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', otherUser.id)
      .eq('receiver_id', store.user?.id)
      .eq('is_read', false);

    if (!error) {
      await loadUnreadCount();
      await loadConversations();
    }
  } catch (error) {
    console.error('标记会话已读失败:', error);
  }
}

// 获取对话中的另一个用户
function getOtherUser(conversation) {
  if (conversation.user1?.id === store.user?.id) {
    return conversation.user2;
  }
  return conversation.user1;
}

// 获取会话未读数
function getUnreadCount(conversation) {
  if (conversation.user1?.id === store.user?.id) {
    return conversation.user1_unread_count || 0;
  }
  return conversation.user2_unread_count || 0;
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
  if (store.user) {
    await Promise.all([
      loadConversations(),
      loadSystemMessages(),
      loadUnreadCount()
    ]);
  }
});
</script>

<style scoped>
.messages-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.messages-header h2 {
  margin: 0;
  color: var(--text);
}

.unread-count {
  background: var(--primary);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.messages-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
  height: 600px;
}

.conversations-panel {
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  overflow-y: auto;
}

.conversations-panel h3, .conversations-panel h4 {
  margin: 0 0 16px;
  color: var(--text);
  font-size: 16px;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(15, 23, 42, 0.5);
}

.conversation-item:hover {
  background: rgba(96, 165, 250, 0.1);
  border-color: var(--primary);
}

.conversation-item.active {
  background: rgba(96, 165, 250, 0.2);
  border-color: var(--primary);
}

.conversation-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.conversation-preview {
  font-size: 14px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-time {
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}

.conversation-badge {
  background: #ef4444;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.system-messages {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.system-message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(15, 23, 42, 0.5);
}

.system-message-item.unread {
  background: rgba(96, 165, 250, 0.1);
  border-color: var(--primary);
}

.system-message-item:hover {
  background: rgba(96, 165, 250, 0.15);
}

.system-message-icon {
  font-size: 20px;
  margin-top: 2px;
}

.system-message-content {
  flex: 1;
}

.system-message-text {
  color: var(--text);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.system-message-time {
  font-size: 12px;
  color: var(--muted);
}

.messages-panel {
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.chat-header h3 {
  margin: 0;
  color: var(--text);
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  max-width: 70%;
}

.message-item.own-message {
  align-self: flex-end;
}

.message-item.system-message {
  align-self: center;
  max-width: 90%;
}

.message-content {
  background: rgba(15, 23, 42, 0.8);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.own-message .message-content {
  background: var(--primary);
  color: white;
}

.system-message .message-content {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  text-align: center;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.message-form {
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
}

.send-btn {
  padding: 10px 20px;
  white-space: nowrap;
}

.no-conversation {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.no-conversation-content {
  text-align: center;
  color: var(--muted);
}

.no-conversation-content h3 {
  margin: 0 0 8px;
  color: var(--text);
}

.no-conversation-content p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .messages-content {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .conversations-panel {
    height: 300px;
  }
  
  .messages-panel {
    height: 400px;
  }
}
</style>