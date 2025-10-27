// 轮播图测试脚本
// 在浏览器控制台中运行此脚本来测试轮播图功能

console.log('🎮 轮播图测试脚本');

// 检查轮播图片数据
function checkCarouselImages() {
  console.log('📸 检查轮播图片数据...');
  
  // 获取 Vue 应用实例（如果可用）
  const app = document.querySelector('#app').__vue__;
  if (!app) {
    console.error('❌ 无法找到 Vue 应用实例');
    return;
  }
  
  // 检查 store 中的游戏数据
  if (typeof store !== 'undefined') {
    console.log('🎯 游戏数量:', store.games.length);
    
    const gameCovers = store.games.map(g => g.cover).filter(Boolean);
    console.log('🖼️ 游戏封面数量:', gameCovers.length);
    console.log('📋 游戏封面列表:', gameCovers);
    
    // 检查轮播图片是否不同
    const uniqueImages = [...new Set(gameCovers)];
    console.log('🔄 唯一图片数量:', uniqueImages.length);
    
    if (uniqueImages.length === gameCovers.length) {
      console.log('✅ 所有轮播图片都是唯一的');
    } else {
      console.log('⚠️ 发现重复的轮播图片');
    }
  } else {
    console.error('❌ store 未定义');
  }
}

// 检查轮播组件状态
function checkCarouselComponent() {
  console.log('🎠 检查轮播组件...');
  
  const carousel = document.querySelector('.carousel');
  if (!carousel) {
    console.error('❌ 未找到轮播组件');
    return;
  }
  
  const slides = carousel.querySelectorAll('.slide');
  console.log('📊 轮播图片数量:', slides.length);
  
  const images = carousel.querySelectorAll('.slide img');
  const imageSrcs = Array.from(images).map(img => img.src);
  
  console.log('🖼️ 图片源列表:');
  imageSrcs.forEach((src, index) => {
    console.log(`  ${index + 1}. ${src}`);
  });
  
  // 检查是否有重复图片
  const uniqueSrcs = [...new Set(imageSrcs)];
  if (uniqueSrcs.length === imageSrcs.length) {
    console.log('✅ 所有轮播图片源都是唯一的');
  } else {
    console.log('⚠️ 发现重复的图片源');
    console.log('🔍 重复的图片:', imageSrcs.filter((src, index) => imageSrcs.indexOf(src) !== index));
  }
}

// 模拟轮播切换
function testCarouselNavigation() {
  console.log('🎮 测试轮播导航...');
  
  const nextBtn = document.querySelector('.carousel .ctrl.next');
  const prevBtn = document.querySelector('.carousel .ctrl.prev');
  
  if (!nextBtn || !prevBtn) {
    console.error('❌ 未找到轮播控制按钮');
    return;
  }
  
  console.log('▶️ 模拟点击下一张...');
  nextBtn.click();
  
  setTimeout(() => {
    console.log('◀️ 模拟点击上一张...');
    prevBtn.click();
    console.log('✅ 轮播导航测试完成');
  }, 1000);
}

// 检查图片加载状态
function checkImageLoadStatus() {
  console.log('📡 检查图片加载状态...');
  
  const images = document.querySelectorAll('.carousel img');
  let loadedCount = 0;
  let errorCount = 0;
  
  images.forEach((img, index) => {
    if (img.complete) {
      if (img.naturalWidth > 0) {
        loadedCount++;
        console.log(`✅ 图片 ${index + 1} 加载成功: ${img.src}`);
      } else {
        errorCount++;
        console.log(`❌ 图片 ${index + 1} 加载失败: ${img.src}`);
      }
    } else {
      console.log(`⏳ 图片 ${index + 1} 正在加载: ${img.src}`);
    }
  });
  
  console.log(`📊 加载统计: ${loadedCount} 成功, ${errorCount} 失败, ${images.length - loadedCount - errorCount} 加载中`);
}

// 运行所有测试
function runAllTests() {
  console.log('🚀 开始轮播图完整测试...');
  console.log('='.repeat(50));
  
  checkCarouselImages();
  console.log('-'.repeat(30));
  
  checkCarouselComponent();
  console.log('-'.repeat(30));
  
  checkImageLoadStatus();
  console.log('-'.repeat(30));
  
  testCarouselNavigation();
  
  console.log('='.repeat(50));
  console.log('✨ 轮播图测试完成！');
}

// 导出测试函数
if (typeof window !== 'undefined') {
  window.checkCarouselImages = checkCarouselImages;
  window.checkCarouselComponent = checkCarouselComponent;
  window.testCarouselNavigation = testCarouselNavigation;
  window.checkImageLoadStatus = checkImageLoadStatus;
  window.runAllTests = runAllTests;
}

// 使用说明
console.log('📖 使用方法:');
console.log('- 检查轮播数据: checkCarouselImages()');
console.log('- 检查轮播组件: checkCarouselComponent()');
console.log('- 测试轮播导航: testCarouselNavigation()');
console.log('- 检查图片加载: checkImageLoadStatus()');
console.log('- 运行所有测试: runAllTests()');