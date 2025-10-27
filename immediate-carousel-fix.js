// 立即修复轮播图显示问题的脚本
// 在浏览器控制台中运行此脚本，立即看到效果

console.log('🔧 开始立即修复轮播图...');

// 定义完全不同的图片
const newImages = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop&auto=format&q=80', // 游戏手柄
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop&auto=format&q=80', // 游戏场景
  'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&h=600&fit=crop&auto=format&q=80', // 电竞
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop&auto=format&q=80', // 游戏设备
  'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200&h=600&fit=crop&auto=format&q=80'  // 游戏世界
];

// 备用图片（如果 Unsplash 不可用）
const fallbackImages = [
  'https://via.placeholder.com/1200x600/4F46E5/FFFFFF?text=Gaming+Controller',
  'https://via.placeholder.com/1200x600/7C3AED/FFFFFF?text=Game+Scene',
  'https://via.placeholder.com/1200x600/EC4899/FFFFFF?text=Esports',
  'https://via.placeholder.com/1200x600/10B981/FFFFFF?text=Gaming+Setup',
  'https://via.placeholder.com/1200x600/F59E0B/FFFFFF?text=Game+World'
];

function fixCarouselImages() {
  console.log('🎯 查找轮播组件...');
  
  const carousel = document.querySelector('.carousel');
  if (!carousel) {
    console.error('❌ 未找到轮播组件');
    return false;
  }
  
  const slides = carousel.querySelectorAll('.slide');
  console.log(`📊 找到 ${slides.length} 个轮播项`);
  
  if (slides.length === 0) {
    console.error('❌ 轮播组件中没有找到图片');
    return false;
  }
  
  // 替换每个轮播项的图片
  slides.forEach((slide, index) => {
    const img = slide.querySelector('img');
    if (img && newImages[index]) {
      const oldSrc = img.src;
      img.src = newImages[index];
      console.log(`✅ 替换图片 ${index + 1}: ${oldSrc} -> ${newImages[index]}`);
      
      // 添加加载错误处理
      img.onerror = function() {
        console.log(`⚠️ 图片 ${index + 1} 加载失败，使用备用图片`);
        this.src = fallbackImages[index];
      };
    }
  });
  
  console.log('🎉 轮播图片替换完成！');
  return true;
}

function updateCarouselDots() {
  console.log('🔄 更新轮播指示器...');
  
  const dots = document.querySelectorAll('.carousel .dot');
  console.log(`📍 找到 ${dots.length} 个指示器`);
  
  // 确保指示器数量与图片数量匹配
  if (dots.length !== newImages.length) {
    console.log(`⚠️ 指示器数量 (${dots.length}) 与图片数量 (${newImages.length}) 不匹配`);
  }
}

function testCarouselNavigation() {
  console.log('🎮 测试轮播导航功能...');
  
  const nextBtn = document.querySelector('.carousel .ctrl.next');
  const prevBtn = document.querySelector('.carousel .ctrl.prev');
  
  if (!nextBtn || !prevBtn) {
    console.error('❌ 未找到轮播控制按钮');
    return;
  }
  
  console.log('▶️ 测试下一张按钮...');
  nextBtn.click();
  
  setTimeout(() => {
    console.log('◀️ 测试上一张按钮...');
    prevBtn.click();
    console.log('✅ 轮播导航测试完成');
  }, 1000);
}

function forceRefreshCarousel() {
  console.log('🔄 强制刷新轮播组件...');
  
  // 尝试触发 Vue 组件重新渲染
  if (typeof window.Vue !== 'undefined' || typeof window.$nuxt !== 'undefined') {
    console.log('🔧 检测到 Vue，尝试触发重新渲染...');
  }
  
  // 手动触发窗口 resize 事件，可能会触发组件更新
  window.dispatchEvent(new Event('resize'));
  
  setTimeout(() => {
    fixCarouselImages();
  }, 100);
}

// 主要修复函数
function immediateCarouselFix() {
  console.log('🚀 开始立即修复轮播图...');
  console.log('='.repeat(50));
  
  const success = fixCarouselImages();
  
  if (success) {
    updateCarouselDots();
    
    setTimeout(() => {
      testCarouselNavigation();
    }, 500);
    
    console.log('='.repeat(50));
    console.log('✨ 轮播图修复完成！现在应该显示5张完全不同的图片');
    console.log('💡 如果还是显示相同图片，请尝试：');
    console.log('   1. 刷新页面 (F5)');
    console.log('   2. 清除浏览器缓存');
    console.log('   3. 运行 forceRefreshCarousel()');
  } else {
    console.log('❌ 修复失败，请检查页面是否正确加载');
  }
}

// 导出函数
if (typeof window !== 'undefined') {
  window.immediateCarouselFix = immediateCarouselFix;
  window.fixCarouselImages = fixCarouselImages;
  window.forceRefreshCarousel = forceRefreshCarousel;
  window.testCarouselNavigation = testCarouselNavigation;
}

// 使用说明
console.log('📖 立即修复轮播图脚本已加载');
console.log('🎯 运行方法: immediateCarouselFix()');
console.log('🔄 强制刷新: forceRefreshCarousel()');

// 自动运行修复（可选）
// immediateCarouselFix();