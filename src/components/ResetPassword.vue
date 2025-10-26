<template>
  <section class="reset-wrap">
    <div class="reset-card">
      <div class="content">
        <h2>重置密码</h2>
        
        <div v-if="!isValidSession" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>重置链接无效或已过期</h3>
          <p>请重新申请密码重置邮件。</p>
          <router-link class="btn" to="/auth">返回登录</router-link>
        </div>
        
        <form v-else class="grid" @submit.prevent="onSubmit">
          <div class="info">
            <p>请输入您的新密码。</p>
          </div>
          
          <label>
            新密码
            <input 
              v-model="newPassword" 
              class="input" 
              type="password" 
              placeholder="请输入新密码（至少6位）" 
              required 
            />
          </label>
          
          <label>
            确认新密码
            <input 
              v-model="confirmPassword" 
              class="input" 
              type="password" 
              placeholder="再次输入新密码" 
              required 
            />
          </label>
          
          <div class="actions">
            <button class="btn" type="submit" :disabled="isLoading">
              {{ isLoading ? '重置中...' : '重置密码' }}
            </button>
            <router-link class="btn secondary" to="/auth">返回登录</router-link>
          </div>
        </form>
        
        <div v-if="message" :class="['message', messageType]">{{ message }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { resetPassword } from '../store';
import { supabase } from '../supabase';

const router = useRouter();
const route = useRoute();

const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const messageType = ref('');
const isLoading = ref(false);
const isValidSession = ref(false);

onMounted(async () => {
  // 检查是否有有效的重置会话
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session && session.user) {
    isValidSession.value = true;
  } else {
    // 尝试从 URL 参数中获取访问令牌
    const accessToken = route.query.access_token;
    const refreshToken = route.query.refresh_token;
    
    if (accessToken && refreshToken) {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error('设置会话失败:', error);
        } else {
          isValidSession.value = true;
        }
      } catch (error) {
        console.error('处理重置令牌时出错:', error);
      }
    }
  }
});

function showMessage(text, type = 'error') {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
    messageType.value = '';
  }, 5000);
}

async function onSubmit() {
  if (!newPassword.value.trim()) {
    showMessage('请输入新密码');
    return;
  }
  
  if (newPassword.value.length < 6) {
    showMessage('密码至少需要6位');
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    showMessage('两次输入的密码不一致');
    return;
  }
  
  isLoading.value = true;
  
  try {
    await resetPassword(newPassword.value);
    showMessage('密码重置成功！正在跳转到登录页面...', 'success');
    
    setTimeout(() => {
      router.push('/auth');
    }, 2000);
  } catch (error) {
    console.error('重置密码错误:', error);
    showMessage(error.message || '重置密码失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.reset-wrap {
  min-height: calc(100vh - 120px);
  display: grid; 
  place-items: center;
  background: radial-gradient(80% 80% at 50% 20%, rgba(2,6,23,0.9), rgba(15,23,42,1));
  padding: 20px;
}

.reset-card {
  width: 480px; 
  max-width: 92vw;
  background: #0b1020; 
  border: 1px solid var(--border); 
  border-radius: 14px;
  box-shadow: 0 26px 60px rgba(0,0,0,0.5);
  padding: 32px;
}

.content h2 { 
  margin: 0 0 24px; 
  text-align: center;
  color: var(--text);
}

.error-state {
  text-align: center;
  padding: 20px 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #ef4444;
  margin: 0 0 12px;
}

.error-state p {
  color: var(--muted);
  margin: 0 0 24px;
}

.info {
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.info p {
  margin: 0;
  color: var(--text);
  font-size: 14px;
  line-height: 1.5;
}

.grid { 
  gap: 16px; 
}

.actions { 
  display: flex; 
  gap: 12px; 
  margin-top: 8px; 
}

.message {
  padding: 12px; 
  border-radius: 8px; 
  margin-top: 16px; 
  font-size: 14px;
  text-align: center;
}

.message.success {
  background: rgba(34, 197, 94, 0.1); 
  border: 1px solid rgba(34, 197, 94, 0.3); 
  color: #22c55e;
}

.message.error {
  background: rgba(239, 68, 68, 0.1); 
  border: 1px solid rgba(239, 68, 68, 0.3); 
  color: #ef4444;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

label {
  display: block;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
}

.input {
  width: 100%;
  margin-top: 6px;
  padding: 12px;
  background: #0a0f1c;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.25);
}
</style>