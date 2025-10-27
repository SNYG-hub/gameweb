// 图片资源工具函数

// 高质量的游戏主题轮播图片
export const getCarouselImages = () => {
  return [
    // 使用 Unsplash 的游戏相关图片
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop&auto=format', // 游戏手柄
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop&auto=format', // 游戏场景
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&h=600&fit=crop&auto=format', // 电竞
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop&auto=format', // 游戏设备
    'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200&h=600&fit=crop&auto=format'  // 游戏世界
  ];
};

// 游戏画廊示例图片
export const getGalleryImages = (gameId = 'default') => {
  return [
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&h=675&fit=crop&auto=format', // 游戏界面
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&h=675&fit=crop&auto=format', // 游戏角色
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=675&fit=crop&auto=format', // 游戏场景
    'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=675&fit=crop&auto=format'  // 游戏画面
  ];
};

// 备用图片（如果 Unsplash 不可用）
export const getFallbackImages = () => {
  return {
    carousel: [
      'https://via.placeholder.com/1200x600/4F46E5/FFFFFF?text=Game+Banner+1',
      'https://via.placeholder.com/1200x600/7C3AED/FFFFFF?text=Game+Banner+2', 
      'https://via.placeholder.com/1200x600/EC4899/FFFFFF?text=Game+Banner+3',
      'https://via.placeholder.com/1200x600/10B981/FFFFFF?text=Game+Banner+4',
      'https://via.placeholder.com/1200x600/F59E0B/FFFFFF?text=Game+Banner+5'
    ],
    gallery: [
      'https://via.placeholder.com/1200x675/6366F1/FFFFFF?text=Game+Screenshot+1',
      'https://via.placeholder.com/1200x675/8B5CF6/FFFFFF?text=Game+Screenshot+2',
      'https://via.placeholder.com/1200x675/F472B6/FFFFFF?text=Game+Screenshot+3', 
      'https://via.placeholder.com/1200x675/34D399/FFFFFF?text=Game+Screenshot+4'
    ]
  };
};

// 检查图片是否可用
export const checkImageAvailability = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// 获取可用的轮播图片（带备用方案）
export const getAvailableCarouselImages = async () => {
  const primaryImages = getCarouselImages();
  const fallbackImages = getFallbackImages().carousel;
  
  // 简单返回主要图片，如果需要可以添加可用性检查
  return primaryImages;
};

// 获取可用的画廊图片（带备用方案）
export const getAvailableGalleryImages = async (gameId) => {
  const primaryImages = getGalleryImages(gameId);
  const fallbackImages = getFallbackImages().gallery;
  
  // 简单返回主要图片，如果需要可以添加可用性检查
  return primaryImages;
};