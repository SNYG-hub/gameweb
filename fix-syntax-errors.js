// 修复语法错误的脚本
console.log('🔧 检查并修复语法错误...');

// 检查页面是否正常加载
function checkPageLoad() {
  console.log('📋 检查页面加载状态...');
  
  try {
    // 检查Vue应用是否正常挂载
    const app = document.querySelector('#app');
    if (!app) {
      console.log('❌ 未找到#app元素');
      return false;
    }
    
    // 检查是否有Vue实例
    const vueApp = app.__vue_app__;
    if (!vueApp) {
      console.log('❌ Vue应用未正常挂载');
      return false;
    }
    
    console.log('✅ Vue应用正常挂载');
    return true;
  } catch (error) {
    console.error('❌ 页面检查出错:', error);
    return false;
  }
}

// 检查控制台错误
function checkConsoleErrors() {
  console.log('🔍 检查控制台错误...');
  
  // 监听错误事件
  let errorCount = 0;
  const originalError = console.error;
  
  console.error = function(...args) {
    errorCount++;
    console.log(`❌ 错误 ${errorCount}:`, ...args);
    originalError.apply(console, args);
  };
  
  // 检查语法错误
  window.addEventListener('error', (event) => {
    console.log('❌ 全局错误:', event.error);
  });
  
  // 检查未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    console.log('❌ 未处理的Promise拒绝:', event.reason);
  });
  
  return errorCount;
}

// 尝试重新加载模块
async function reloadModules() {
  console.log('🔄 尝试重新加载模块...');
  
  try {
    // 清除模块缓存（如果可能）
    if (window.location.search.includes('nocache')) {
      console.log('ℹ️ 已启用无缓存模式');
    } else {
      console.log('💡 建议在URL后添加?nocache=1来禁用缓存');
    }
    
    // 尝试动态导入store模块
    const storeModule = await import('./src/store.js?' + Date.now());
    console.log('✅ store模块重新加载成功');
    
    // 检查关键函数是否存在
    const requiredFunctions = [
      'getGame', 'addRating', 'getUserRating', 
      'withdrawUserRating', 'addGameComment', 'likeGameComment'
    ];
    
    const missingFunctions = requiredFunctions.filter(fn => !storeModule[fn]);
    
    if (missingFunctions.length > 0) {
      console.log('❌ 缺少函数:', missingFunctions);
      return false;
    } else {
      console.log('✅ 所有必需函数都存在');
      return true;
    }
    
  } catch (error) {
    console.error('❌ 模块重新加载失败:', error);
    return false;
  }
}

// 强制刷新页面
function forceRefresh() {
  console.log('🔄 强制刷新页面...');
  
  // 清除所有缓存
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // 清除localStorage（可选）
  // localStorage.clear();
  
  // 强制刷新
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
}

// 主修复流程
async function fixSyntaxErrors() {
  console.log('🚀 开始语法错误修复流程...');
  
  // 1. 检查页面加载
  const pageOk = checkPageLoad();
  
  // 2. 检查控制台错误
  const errorCount = checkConsoleErrors();
  
  // 3. 尝试重新加载模块
  const moduleOk = await reloadModules();
  
  console.log('\n📋 诊断结果:');
  console.log(`页面加载: ${pageOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`控制台错误: ${errorCount === 0 ? '✅ 无错误' : `❌ ${errorCount}个错误`}`);
  console.log(`模块加载: ${moduleOk ? '✅ 正常' : '❌ 异常'}`);
  
  if (!pageOk || !moduleOk) {
    console.log('\n🔄 建议解决方案:');
    console.log('1. 检查开发服务器是否正常运行');
    console.log('2. 检查网络连接');
    console.log('3. 清除浏览器缓存');
    console.log('4. 强制刷新页面');
    
    if (confirm('是否立即强制刷新页面？')) {
      forceRefresh();
    }
  } else {
    console.log('\n✅ 页面状态正常！');
  }
}

// 导出到全局作用域
window.fixSyntaxErrors = fixSyntaxErrors;
window.forceRefresh = forceRefresh;

// 自动运行
if (typeof window !== 'undefined') {
  setTimeout(fixSyntaxErrors, 500);
} else {
  console.log('⚠️ 请在浏览器环境中运行此脚本');
}