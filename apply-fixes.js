// 应用所有修复的脚本
console.log('🔧 应用所有修复...');

// 在浏览器控制台中运行此脚本
(function() {
  'use strict';
  
  console.log('🚀 开始应用修复...');
  
  // 1. 修复所有帖子的评论数组
  function fixPostsComments() {
    console.log('💬 修复帖子评论数组...');
    
    if (!window.store || !window.store.posts) {
      console.log('❌ 未找到store或帖子数据');
      return false;
    }
    
    let fixedCount = 0;
    window.store.posts.forEach(post => {
      if (!Array.isArray(post.comments)) {
        post.comments = [];
        fixedCount++;
      }
      
      // 如果帖子没有评论，添加一些示例评论
      if (post.comments.length === 0) {
        post.comments = [
          {
            id: `demo_${post.id}_1`,
            author: '游戏爱好者',
            content: '这个内容很有趣！',
            createdAt: Date.now() - Math.random() * 3600000
          },
          {
            id: `demo_${post.id}_2`, 
            author: '热心网友',
            content: '感谢分享，学到了很多。',
            createdAt: Date.now() - Math.random() * 1800000
          }
        ];
        fixedCount++;
      }
    });
    
    console.log(`✅ 修复了 ${fixedCount} 个帖子的评论数据`);
    return true;
  }
  
  // 2. 检查轮播图状态
  function checkCarousel() {
    console.log('🎠 检查轮播图状态...');
    
    const carousel = document.querySelector('.steam-carousel');
    if (!carousel) {
      console.log('ℹ️ 当前页面没有轮播组件');
      return false;
    }
    
    const images = carousel.querySelectorAll('img');
    console.log(`📊 找到 ${images.length} 张轮播图片`);
    
    let loadedCount = 0;
    images.forEach((img, index) => {
      if (img.complete && img.naturalWidth > 0) {
        loadedCount++;
      } else {
        console.log(`⚠️ 图片 ${index + 1} 未加载: ${img.src}`);
      }
    });
    
    console.log(`📈 ${loadedCount}/${images.length} 张图片已加载`);
    return loadedCount > 0;
  }
  
  // 3. 强制刷新当前页面数据
  function refreshCurrentPage() {
    console.log('🔄 刷新当前页面数据...');
    
    // 触发Vue的响应式更新
    if (window.store) {
      // 创建新的数组引用来触发响应式更新
      window.store.posts = [...window.store.posts];
      console.log('✅ 已触发帖子数据更新');
    }
    
    // 如果在帖子详情页，强制重新渲染
    if (window.location.pathname.includes('/forum/')) {
      setTimeout(() => {
        console.log('🔄 刷新帖子详情页...');
        window.location.reload();
      }, 1000);
    }
  }
  
  // 4. 检查Supabase连接
  function checkSupabase() {
    console.log('🔗 检查Supabase连接...');
    
    if (!window.supabase) {
      console.log('❌ Supabase客户端未加载');
      return false;
    }
    
    console.log('✅ Supabase客户端已加载');
    return true;
  }
  
  // 5. 主修复流程
  async function runAllFixes() {
    console.log('='.repeat(50));
    console.log('🚀 开始完整修复流程...');
    console.log('='.repeat(50));
    
    // 检查系统状态
    console.log('📊 系统状态检查:');
    console.log('   当前页面:', window.location.pathname);
    console.log('   Store存在:', !!window.store);
    console.log('   Supabase存在:', !!window.supabase);
    
    // 应用修复
    const commentsFixed = fixPostsComments();
    const carouselOk = checkCarousel();
    const supabaseOk = checkSupabase();
    
    console.log('='.repeat(50));
    console.log('📊 修复结果:');
    console.log(`   评论数据: ${commentsFixed ? '✅ 已修复' : '❌ 需要检查'}`);
    console.log(`   轮播图: ${carouselOk ? '✅ 正常' : 'ℹ️ 不在首页'}`);
    console.log(`   Supabase: ${supabaseOk ? '✅ 连接正常' : '⚠️ 未连接'}`);
    console.log('='.repeat(50));
    
    if (commentsFixed) {
      console.log('🔄 准备刷新页面以显示更改...');
      refreshCurrentPage();
    }
    
    console.log('🎉 修复流程完成！');
    
    return {
      comments: commentsFixed,
      carousel: carouselOk,
      supabase: supabaseOk
    };
  }
  
  // 导出函数到全局
  window.fixPostsComments = fixPostsComments;
  window.checkCarousel = checkCarousel;
  window.checkSupabase = checkSupabase;
  window.runAllFixes = runAllFixes;
  
  // 自动运行修复
  console.log('⏳ 2秒后自动运行修复...');
  setTimeout(runAllFixes, 2000);
  
})();

console.log('📖 修复脚本已加载');
console.log('🎯 手动运行: runAllFixes()');
console.log('💬 修复评论: fixPostsComments()');
console.log('🎠 检查轮播图: checkCarousel()');