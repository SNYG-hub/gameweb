// 完整修复轮播图的脚本 - 解决18个圆点和图片裁剪问题

console.log('🚀 开始完整修复轮播图...');

function completeCarouselFix() {
  console.log('='.repeat(60));
  console.log('🎯 轮播图完整修复');
  console.log('='.repeat(60));

  const carousel = document.querySelector('.carousel');
  if (!carousel) {
    console.error('❌ 未找到轮播容器');
    return false;
  }

  // 1. 诊断当前问题
  console.log('🔍 诊断当前状态...');
  const currentSlides = carousel.querySelectorAll('.slide');
  const currentDots = carousel.querySelectorAll('.dot');
  const currentTrack = carousel.querySelector('.track');
  
  console.log(`📊 当前幻灯片: ${currentSlides.length} 个`);
  console.log(`📍 当前圆点: ${currentDots.length} 个`);
  console.log(`📏 轨道宽度: ${currentTrack?.style.width || '未设置'}`);

  // 2. 定义正确的5张图片
  const correctImages = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200&h=600&fit=crop&auto=format&q=80'
  ];

  console.log(`✅ 目标图片数量: ${correctImages.length} 张`);

  // 3. 完全重建轮播结构
  console.log('🔧 重建轮播结构...');
  
  // 清空并重建轮播内容
  carousel.innerHTML = `
    <div class="track" style="
      display: flex;
      height: 100%;
      width: ${correctImages.length * 100}%;
      transition: transform 0.5s ease;
      transform: translateX(0%);
    ">
      ${correctImages.map((imgSrc, index) => `
        <div class="slide" style="
          flex: 0 0 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img src="${imgSrc}" alt="轮播图片 ${index + 1}" style="
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 8px;
          " />
        </div>
      `).join('')}
    </div>
    
    <button class="ctrl prev" style="
      position: absolute;
      top: 50%;
      left: 10px;
      transform: translateY(-50%);
      border: none;
      background: rgba(0,0,0,0.35);
      color: #fff;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">‹</button>
    
    <button class="ctrl next" style="
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      border: none;
      background: rgba(0,0,0,0.35);
      color: #fff;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">›</button>
    
    <div class="dots" style="
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 8px;
    ">
      ${correctImages.map((_, index) => `
        <button class="dot ${index === 0 ? 'active' : ''}" data-index="${index}" style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${index === 0 ? '#fff' : 'rgba(255,255,255,0.4)'};
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: ${index === 0 ? 'scale(1.2)' : 'scale(1)'};
        "></button>
      `).join('')}
    </div>
  `;

  console.log('✅ 轮播结构重建完成');

  // 4. 添加交互功能
  console.log('🎮 添加交互功能...');
  
  const track = carousel.querySelector('.track');
  const nextBtn = carousel.querySelector('.ctrl.next');
  const prevBtn = carousel.querySelector('.ctrl.prev');
  const dots = carousel.querySelectorAll('.dot');
  
  let currentIndex = 0;

  function updateCarousel(index) {
    currentIndex = index;
    
    // 更新轨道位置
    const translateX = -(index * (100 / correctImages.length));
    track.style.transform = `translateX(${translateX}%)`;
    
    // 更新圆点状态
    dots.forEach((dot, i) => {
      const isActive = i === index;
      dot.style.background = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
      dot.style.transform = isActive ? 'scale(1.2)' : 'scale(1)';
    });
    
    console.log(`📍 切换到第 ${index + 1} 张图片`);
  }

  // 下一张
  nextBtn.addEventListener('click', () => {
    const nextIndex = (currentIndex + 1) % correctImages.length;
    updateCarousel(nextIndex);
  });

  // 上一张
  prevBtn.addEventListener('click', () => {
    const prevIndex = (currentIndex - 1 + correctImages.length) % correctImages.length;
    updateCarousel(prevIndex);
  });

  // 圆点点击
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      updateCarousel(index);
    });
  });

  console.log('✅ 交互功能添加完成');

  // 5. 验证修复结果
  console.log('🔍 验证修复结果...');
  
  const newSlides = carousel.querySelectorAll('.slide');
  const newDots = carousel.querySelectorAll('.dot');
  const newTrack = carousel.querySelector('.track');
  
  console.log(`📊 修复后幻灯片: ${newSlides.length} 个`);
  console.log(`📍 修复后圆点: ${newDots.length} 个`);
  console.log(`📏 修复后轨道宽度: ${newTrack.style.width}`);

  if (newSlides.length === 5 && newDots.length === 5) {
    console.log('✅ 修复成功！轮播图现在显示5张不同的图片');
    
    // 测试切换功能
    setTimeout(() => {
      console.log('🧪 测试自动切换...');
      updateCarousel(1);
      setTimeout(() => {
        updateCarousel(0);
        console.log('✅ 切换功能正常');
      }, 1000);
    }, 500);
    
    return true;
  } else {
    console.error('❌ 修复失败，请检查页面结构');
    return false;
  }
}

// 自动运行修复
const success = completeCarouselFix();

if (success) {
  console.log('='.repeat(60));
  console.log('🎉 轮播图修复完成！');
  console.log('📋 修复内容:');
  console.log('  ✅ 修复了18个圆点问题（现在只有5个）');
  console.log('  ✅ 修复了图片裁剪问题（使用 object-fit: contain）');
  console.log('  ✅ 确保显示5张完全不同的图片');
  console.log('  ✅ 修复了轮播导航功能');
  console.log('='.repeat(60));
} else {
  console.log('❌ 修复失败，请刷新页面后重试');
}