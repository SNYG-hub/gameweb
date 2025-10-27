// Steam风格轮播组件测试脚本
console.log('🎮 开始测试Steam风格轮播组件...');

// 测试图片加载
const testImages = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=1400&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1400&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&h=800&fit=crop&auto=format&q=90'
];

function testImageLoading() {
  console.log('📸 测试图片加载...');
  
  testImages.forEach((url, index) => {
    const img = new Image();
    img.onload = () => {
      console.log(`✅ 图片 ${index + 1} 加载成功: ${url.substring(0, 50)}...`);
    };
    img.onerror = () => {
      console.error(`❌ 图片 ${index + 1} 加载失败: ${url.substring(0, 50)}...`);
    };
    img.src = url;
  });
}

function checkCarouselComponent() {
  console.log('🔍 检查轮播组件...');
  
  // 检查轮播容器
  const carousel = document.querySelector('.steam-carousel');
  if (carousel) {
    console.log('✅ Steam轮播容器找到');
    
    // 检查主显示区域
    const mainDisplay = carousel.querySelector('.main-display');
    if (mainDisplay) {
      console.log('✅ 主显示区域找到');
    } else {
      console.error('❌ 主显示区域未找到');
    }
    
    // 检查预览面板
    const previewPanel = carousel.querySelector('.preview-panel');
    if (previewPanel) {
      console.log('✅ 预览面板找到');
      
      const previewItems = previewPanel.querySelectorAll('.preview-item');
      console.log(`📊 预览项数量: ${previewItems.length}`);
    } else {
      console.error('❌ 预览面板未找到');
    }
    
    // 检查导航按钮
    const navBtns = carousel.querySelectorAll('.nav-btn');
    console.log(`🎮 导航按钮数量: ${navBtns.length}`);
    
  } else {
    console.error('❌ Steam轮播容器未找到，可能组件未正确渲染');
  }
}

function simulateUserInteraction() {
  console.log('👆 模拟用户交互...');
  
  const carousel = document.querySelector('.steam-carousel');
  if (!carousel) {
    console.error('❌ 无法进行交互测试，轮播组件未找到');
    return;
  }
  
  // 测试预览项点击
  const previewItems = carousel.querySelectorAll('.preview-item');
  if (previewItems.length > 0) {
    console.log('🖱️ 测试预览项点击...');
    previewItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        console.log(`📸 点击了预览项 ${index + 1}`);
      });
    });
  }
  
  // 测试导航按钮
  const nextBtn = carousel.querySelector('.nav-btn.next');
  const prevBtn = carousel.querySelector('.nav-btn.prev');
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      console.log('➡️ 点击了下一张按钮');
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      console.log('⬅️ 点击了上一张按钮');
    });
  }
}

// 运行测试
testImageLoading();

// 等待DOM加载完成后检查组件
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      checkCarouselComponent();
      simulateUserInteraction();
    }, 1000);
  });
} else {
  setTimeout(() => {
    checkCarouselComponent();
    simulateUserInteraction();
  }, 1000);
}

console.log('🎯 Steam轮播测试脚本已启动，请查看控制台输出');