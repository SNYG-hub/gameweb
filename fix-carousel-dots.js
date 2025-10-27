// 修复轮播图18个圆点问题的脚本

console.log('🔧 开始修复轮播图圆点问题...');

function fixCarouselDots() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) {
    console.error('❌ 未找到轮播容器');
    return;
  }

  // 检查当前状态
  const slides = carousel.querySelectorAll('.slide');
  const dots = carousel.querySelectorAll('.dot');
  
  console.log(`📊 当前幻灯片数量: ${slides.length}`);
  console.log(`📍 当前圆点数量: ${dots.length}`);
  
  // 定义正确的图片（只要5张）
  const correctImages = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop&auto=format&q=80', 
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200&h=600&fit=crop&auto=format&q=80'
  ];

  // 1. 重建轮播轨道
  const track = carousel.querySelector('.track');
  if (track) {
    track.innerHTML = '';
    track.style.width = `${correctImages.length * 100}%`;
    track.style.display = 'flex';
    track.style.height = '100%';
    track.style.transition = 'transform 0.5s ease';
    
    correctImages.forEach((imgSrc, index) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.style.flex = '0 0 100%';
      slide.style.height = '100%';
      slide.style.display = 'flex';
      slide.style.alignItems = 'center';
      slide.style.justifyContent = 'center';
      
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = `轮播图片 ${index + 1}`;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.width = 'auto';
      img.style.height = 'auto';
      img.style.objectFit = 'contain';
      
      slide.appendChild(img);
      track.appendChild(slide);
    });
    
    console.log(`✅ 重建了 ${correctImages.length} 个幻灯片`);
  }

  // 2. 重建圆点指示器
  const dotsContainer = carousel.querySelector('.dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    
    correctImages.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      if (index === 0) dot.classList.add('active');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.background = index === 0 ? '#fff' : 'rgba(255,255,255,0.4)';
      dot.style.border = 'none';
      dot.style.cursor = 'pointer';
      dot.style.transition = 'all 0.3s ease';
      
      dot.addEventListener('click', () => {
        // 更新轨道位置
        track.style.transform = `translateX(-${index * (100 / correctImages.length)}%)`;
        
        // 更新圆点状态
        dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
          d.style.background = i === index ? '#fff' : 'rgba(255,255,255,0.4)';
          d.style.transform = i === index ? 'scale(1.2)' : 'scale(1)';
        });
      });
      
      dotsContainer.appendChild(dot);
    });
    
    console.log(`✅ 重建了 ${correctImages.length} 个圆点`);
  }

  // 3. 修复控制按钮
  const nextBtn = carousel.querySelector('.ctrl.next');
  const prevBtn = carousel.querySelector('.ctrl.prev');
  
  if (nextBtn && prevBtn) {
    let currentIndex = 0;
    
    nextBtn.onclick = () => {
      currentIndex = (currentIndex + 1) % correctImages.length;
      updateCarousel(currentIndex);
    };
    
    prevBtn.onclick = () => {
      currentIndex = (currentIndex - 1 + correctImages.length) % correctImages.length;
      updateCarousel(currentIndex);
    };
    
    function updateCarousel(index) {
      track.style.transform = `translateX(-${index * (100 / correctImages.length)}%)`;
      
      dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
        dot.style.background = i === index ? '#fff' : 'rgba(255,255,255,0.4)';
        dot.style.transform = i === index ? 'scale(1.2)' : 'scale(1)';
      });
    }
    
    console.log('✅ 修复了控制按钮');
  }

  console.log('🎉 轮播图修复完成！');
}

// 运行修复
fixCarouselDots();