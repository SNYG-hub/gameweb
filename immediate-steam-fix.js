// 立即修复Steam轮播 - 浏览器控制台执行脚本
console.log('🚀 开始立即修复Steam轮播组件...');

// 强制刷新页面并清除缓存
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
  
  // 强制刷新
  window.location.reload(true);
}

// 直接替换轮播组件HTML
function replaceSteamCarousel() {
  console.log('🎮 直接替换Steam轮播组件...');
  
  const carouselContainer = document.querySelector('.carousel') || 
                           document.querySelector('.steam-carousel') ||
                           document.querySelector('[class*="carousel"]');
  
  if (!carouselContainer) {
    console.error('❌ 未找到轮播容器');
    return;
  }
  
  const steamCarouselHTML = `
    <div class="steam-carousel" style="
      display: flex;
      gap: 16px;
      width: 100%;
      height: 400px;
      background: linear-gradient(135deg, #1e2328 0%, #0f1419 100%);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #2a2d35;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    ">
      <!-- 主显示区域 -->
      <div class="main-display" style="
        flex: 1;
        position: relative;
        display: flex;
        flex-direction: column;
      ">
        <div class="main-image" style="
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #0a0f1c;
        ">
          <img id="steam-main-img" src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=800&fit=crop&auto=format&q=90" 
               alt="游戏截图" style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          ">
          <div class="overlay" style="
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, transparent 0%, transparent 70%, rgba(0, 0, 0, 0.8) 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
          ">
            <button class="nav-btn prev" onclick="steamPrev()" style="
              background: rgba(0, 0, 0, 0.7);
              border: none;
              color: white;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              font-size: 24px;
              cursor: pointer;
              transition: all 0.3s ease;
            ">‹</button>
            <button class="nav-btn next" onclick="steamNext()" style="
              background: rgba(0, 0, 0, 0.7);
              border: none;
              color: white;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              font-size: 24px;
              cursor: pointer;
              transition: all 0.3s ease;
            ">›</button>
          </div>
        </div>
        
        <!-- 游戏信息区域 -->
        <div class="game-info" style="
          padding: 20px;
          background: linear-gradient(135deg, #2a2d35 0%, #1e2328 100%);
          border-top: 1px solid #3a3d45;
        ">
          <h3 style="
            margin: 0 0 8px 0;
            color: #66c0f4;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">精选推荐</h3>
          <p id="steam-game-title" style="
            margin: 0 0 12px 0;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            line-height: 1.2;
          ">ARC Raiders</p>
          <div class="game-meta" style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          ">
            <span class="tag" style="
              background: #4c6b22;
              color: #beee11;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            ">热销商品</span>
            <span id="steam-price" style="
              color: #beee11;
              font-size: 18px;
              font-weight: 700;
            ">¥ 299.00</span>
          </div>
          <button style="
            background: linear-gradient(135deg, #75b022 0%, #588a1b 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">立即预购</button>
        </div>
      </div>
      
      <!-- 右侧预览图 -->
      <div class="preview-panel" style="
        width: 200px;
        padding: 16px;
        background: #1e2328;
        border-left: 1px solid #2a2d35;
      ">
        <div class="preview-grid" style="
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 100%;
        ">
          <div class="preview-item active" onclick="steamGoTo(0)" style="
            flex: 1;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid #beee11;
            transition: all 0.3s ease;
            box-shadow: 0 0 12px rgba(190, 238, 17, 0.4);
          ">
            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=800&fit=crop&auto=format&q=90" 
                 alt="预览图 1" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="preview-item" onclick="steamGoTo(1)" style="
            flex: 1;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
          ">
            <img src="https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=1400&h=800&fit=crop&auto=format&q=90" 
                 alt="预览图 2" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="preview-item" onclick="steamGoTo(2)" style="
            flex: 1;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
          ">
            <img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1400&h=800&fit=crop&auto=format&q=90" 
                 alt="预览图 3" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="preview-item" onclick="steamGoTo(3)" style="
            flex: 1;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
          ">
            <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&h=800&fit=crop&auto=format&q=90" 
                 alt="预览图 4" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="preview-item" onclick="steamGoTo(4)" style="
            flex: 1;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
          ">
            <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&h=800&fit=crop&auto=format&q=90" 
                 alt="预览图 5" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
      </div>
    </div>
  `;
  
  carouselContainer.outerHTML = steamCarouselHTML;
  
  // 添加交互功能
  addSteamCarouselFunctions();
  
  console.log('✅ Steam轮播组件已替换');
}

// 添加Steam轮播交互功能
function addSteamCarouselFunctions() {
  const images = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=800&fit=crop&auto=format&q=90',
    'https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=1400&h=800&fit=crop&auto=format&q=90',
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1400&h=800&fit=crop&auto=format&q=90',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&h=800&fit=crop&auto=format&q=90',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&h=800&fit=crop&auto=format&q=90'
  ];
  
  const gameData = [
    { title: 'ARC Raiders', price: '299.00' },
    { title: 'Hearts of Iron IV', price: '318.00' },
    { title: 'Cyberpunk 2077', price: '298.00' },
    { title: 'The Witcher 3', price: '199.00' },
    { title: 'Elden Ring', price: '398.00' }
  ];
  
  let currentIndex = 0;
  
  window.steamGoTo = function(index) {
    currentIndex = index;
    updateSteamCarousel();
  };
  
  window.steamNext = function() {
    currentIndex = (currentIndex + 1) % images.length;
    updateSteamCarousel();
  };
  
  window.steamPrev = function() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateSteamCarousel();
  };
  
  function updateSteamCarousel() {
    const mainImg = document.getElementById('steam-main-img');
    const gameTitle = document.getElementById('steam-game-title');
    const price = document.getElementById('steam-price');
    const previewItems = document.querySelectorAll('.preview-item');
    
    if (mainImg) mainImg.src = images[currentIndex];
    if (gameTitle) gameTitle.textContent = gameData[currentIndex].title;
    if (price) price.textContent = `¥ ${gameData[currentIndex].price}`;
    
    // 更新预览项状态
    previewItems.forEach((item, index) => {
      if (index === currentIndex) {
        item.style.border = '2px solid #beee11';
        item.style.boxShadow = '0 0 12px rgba(190, 238, 17, 0.4)';
      } else {
        item.style.border = '2px solid transparent';
        item.style.boxShadow = 'none';
      }
    });
  }
  
  // 添加悬停效果
  const mainDisplay = document.querySelector('.main-display');
  const overlay = document.querySelector('.overlay');
  
  if (mainDisplay && overlay) {
    mainDisplay.addEventListener('mouseenter', () => {
      overlay.style.opacity = '1';
    });
    
    mainDisplay.addEventListener('mouseleave', () => {
      overlay.style.opacity = '0';
    });
  }
  
  // 自动播放
  setInterval(() => {
    window.steamNext();
  }, 5000);
  
  console.log('🎮 Steam轮播交互功能已添加');
}

// 执行修复
console.log('选择修复方式:');
console.log('1. 输入 replaceSteamCarousel() - 直接替换轮播组件');
console.log('2. 输入 forceRefresh() - 强制刷新页面');

// 自动尝试替换
setTimeout(() => {
  replaceSteamCarousel();
}, 1000);