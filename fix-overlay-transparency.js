// 立即修复游戏信息覆盖层透明度问题
console.log('🔧 开始修复游戏信息覆盖层...');

// 强制刷新页面以应用新的CSS
if (typeof window !== 'undefined') {
  // 清除所有缓存
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // 强制重新加载CSS
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    const href = link.href;
    link.href = href + (href.includes('?') ? '&' : '?') + 'v=' + Date.now();
  });
  
  // 延迟刷新页面
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
  
  console.log('✅ 覆盖层透明度修复完成！页面将在1秒后刷新...');
} else {
  console.log('⚠️ 请在浏览器环境中运行此脚本');
}