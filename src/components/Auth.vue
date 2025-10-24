<template>
  <section class="login-wrap">
    <div class="login-card">
      <div class="left">
        <h2>{{ isRegister ? '注册' : '登录' }}</h2>
        
        <!-- 切换登录/注册 -->
        <div class="mode-toggle">
          <button :class="['mode-btn', !isRegister && 'active']" @click="switchToLogin">登录</button>
          <button :class="['mode-btn', isRegister && 'active']" @click="switchToRegister">注册</button>
        </div>

        <form class="grid" @submit.prevent="onSubmit">
          <!-- 注册时显示用户名输入 -->
          <label v-if="isRegister">
            用户名
            <input v-model="registerUsername" class="input" placeholder="设置您的用户名" required />
          </label>
          
          <!-- 注册时显示邮箱输入 -->
          <label v-if="isRegister">
            邮箱
            <input v-model="registerEmail" class="input" type="email" placeholder="you@example.com" required />
          </label>
          
          <!-- 登录时显示邮箱输入 -->
          <label v-if="!isRegister">
            邮箱
            <input v-model="email" class="input" type="email" placeholder="you@example.com" required />
          </label>
          
          <label>
            密码
            <input v-model="password" class="input" type="password" :placeholder="isRegister ? '设置密码（至少6位）' : '请输入密码'" required />
          </label>
          
          <!-- 注册时显示确认密码 -->
          <label v-if="isRegister">
            确认密码
            <input v-model="confirmPassword" class="input" type="password" placeholder="再次输入密码" required />
          </label>
          
          <label class="remember" v-if="!isRegister">
            <input type="checkbox" v-model="remember" />
            记住我
          </label>
          
          <div class="actions">
            <button class="btn" type="submit">{{ isRegister ? '注册' : '登录' }}</button>
            <router-link class="btn secondary" to="/">返回首页</router-link>
          </div>
        </form>
        
        <div v-if="message" :class="['message', messageType]">{{ message }}</div>
        
        <small class="help">{{ isRegister ? '已有账号？' : '还没有账号？' }} 
          <a href="#" @click.prevent="isRegister = !isRegister">{{ isRegister ? '立即登录' : '立即注册' }}</a>
        </small>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signIn, signUp } from '../store';

const router = useRouter();
const isRegister = ref(false);
const email = ref('');
const password = ref('');
const remember = ref(true);
const registerUsername = ref('');
const registerEmail = ref('');
const confirmPassword = ref('');
const message = ref('');
const messageType = ref(''); // 'success' | 'error'

function switchToLogin() {
  isRegister.value = false;
  clearForm();
  clearMessage();
}

function switchToRegister() {
  isRegister.value = true;
  clearForm();
  clearMessage();
}

function clearForm() {
  email.value = '';
  username.value = '';
  password.value = '';
  registerUsername.value = '';
  registerEmail.value = '';
  confirmPassword.value = '';
}

function clearMessage() {
  message.value = '';
  messageType.value = '';
}

function showMessage(text, type = 'error') {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    clearMessage();
  }, 3000);
}

async function onSubmit() {
  if (isRegister.value) {
    // 注册逻辑
    if (!registerUsername.value.trim()) {
      showMessage('请输入用户名');
      return;
    }
    if (registerUsername.value.trim().length < 3) {
      showMessage('用户名至少需要3个字符');
      return;
    }
    if (!registerEmail.value.trim() || !registerEmail.value.includes('@')) {
      showMessage('请输入有效的邮箱地址');
      return;
    }
    if (!password.value.trim() || password.value.length < 6) {
      showMessage('密码至少需要6位');
      return;
    }
    if (password.value !== confirmPassword.value) {
      showMessage('两次输入的密码不一致');
      return;
    }
    
    try {
      const ok = await signUp({
        username: registerUsername.value.trim(),
        email: registerEmail.value.trim(),
        password: password.value
      });
      
      if (ok) {
        showMessage('注册成功！正在跳转到个人中心...', 'success');
        setTimeout(() => router.push('/profile'), 1000);
      } else {
        showMessage('注册失败，用户名或邮箱可能已被使用');
      }
    } catch (error) {
      console.error('注册错误:', error);
      showMessage('注册过程中出现错误，请稍后重试');
    }
  } else {
    // 登录逻辑 - 只使用邮箱登录
    if (!email.value.trim() || !email.value.includes('@')) {
      showMessage('请输入有效的邮箱地址');
      return;
    }
    if (!password.value.trim()) {
      showMessage('请输入密码');
      return;
    }
    
    try {
      const ok = await signIn({ email: email.value, password: password.value }, { remember: remember.value });
      if (ok) {
        router.push('/profile');
      } else {
        showMessage('登录失败，请检查邮箱和密码');
      }
    } catch (error) {
      console.error('登录错误:', error);
      showMessage('登录过程中出现错误，请稍后重试');
    }
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: calc(100vh - 120px);
  display: grid; place-items: center;
  background: radial-gradient(80% 80% at 50% 20%, rgba(2,6,23,0.9), rgba(15,23,42,1));
}
.login-card {
  width: 560px; max-width: 92vw;
  display: grid; grid-template-columns: 1fr;
  gap: 20px;
  background: #0b1020; border: 1px solid var(--border); border-radius: 14px;
  box-shadow: 0 26px 60px rgba(0,0,0,0.5);
  padding: 20px;
}
.left h2 { margin: 0 0 12px; }

.mode-toggle {
  display: flex; gap: 8px; margin-bottom: 16px;
  background: #0a0f1c; border: 1px solid var(--border); border-radius: 8px; padding: 4px;
}
.mode-btn {
  flex: 1; background: transparent; border: none; color: var(--text); 
  padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.mode-btn.active {
  background: var(--primary); color: #06142a; font-weight: 600;
}

.tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.tab { background: #0a0f1c; border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 8px; cursor: pointer; }
.tab.active { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(96,165,250,0.25) inset; }

.grid { gap: 10px; }
.actions { display: flex; gap: 8px; margin-top: 8px; }

.message {
  padding: 10px; border-radius: 6px; margin-top: 12px; font-size: 14px;
}
.message.success {
  background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e;
}
.message.error {
  background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444;
}

.help { display: block; color: var(--muted); margin-top: 8px; }
.help a {
  color: var(--primary); text-decoration: none;
}
.help a:hover {
  text-decoration: underline;
}
</style>