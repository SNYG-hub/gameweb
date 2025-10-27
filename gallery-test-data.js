// 测试画廊功能的示例数据
// 在浏览器控制台中运行此脚本来添加测试游戏

const testGames = [
  {
    id: 'test-game-1',
    title: '测试游戏 1 - 多图画廊',
    company: '测试工作室',
    price: 99,
    genres: ['动作游戏', '冒险游戏'],
    background: '这是一个用于测试画廊功能的游戏，包含多张不同的图片。',
    gameplay: '测试各种画廊显示效果，包括轮播、缩放、响应式布局等。',
    officialUrl: 'https://example.com',
    cover: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&h=675&fit=crop', // 游戏界面
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&h=675&fit=crop', // 游戏角色
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=675&fit=crop', // 游戏场景
      'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=675&fit=crop', // 游戏画面
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=675&fit=crop'  // 游戏手柄
    ],
    ratings: [],
    createdAt: Date.now()
  },
  {
    id: 'test-game-2', 
    title: '测试游戏 2 - 少量图片',
    company: '独立开发者',
    price: 49,
    genres: ['休闲游戏'],
    background: '这个游戏只有少量图片，测试回退逻辑。',
    gameplay: '简单的休闲游戏玩法。',
    officialUrl: 'https://example.com',
    cover: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=600&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=675&fit=crop', // 游戏场景
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&h=675&fit=crop'  // 电竞
    ],
    ratings: [],
    createdAt: Date.now() - 86400000
  },
  {
    id: 'test-game-3',
    title: '测试游戏 3 - 无画廊',
    company: '小型工作室', 
    price: 0,
    genres: ['免费游戏'],
    background: '这个游戏没有画廊图片，只有封面。',
    gameplay: '测试无画廊时的显示效果。',
    officialUrl: 'https://example.com',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=800&fit=crop',
    gallery: [],
    ratings: [],
    createdAt: Date.now() - 172800000
  }
];

// 添加测试数据的函数
function addTestGames() {
  if (typeof store === 'undefined') {
    console.error('store 未定义，请确保在正确的页面运行此脚本');
    return;
  }
  
  testGames.forEach(game => {
    // 检查是否已存在
    const exists = store.games.find(g => g.id === game.id);
    if (!exists) {
      store.games.push(game);
      console.log(`已添加测试游戏: ${game.title}`);
    } else {
      console.log(`测试游戏已存在: ${game.title}`);
    }
  });
  
  console.log('测试数据添加完成！');
  console.log('当前游戏数量:', store.games.length);
}

// 清理测试数据的函数
function removeTestGames() {
  if (typeof store === 'undefined') {
    console.error('store 未定义，请确保在正确的页面运行此脚本');
    return;
  }
  
  const testIds = testGames.map(g => g.id);
  const originalLength = store.games.length;
  
  store.games = store.games.filter(g => !testIds.includes(g.id));
  
  const removedCount = originalLength - store.games.length;
  console.log(`已删除 ${removedCount} 个测试游戏`);
  console.log('当前游戏数量:', store.games.length);
}

// 使用说明
console.log('画廊测试数据脚本已加载');
console.log('使用方法:');
console.log('- 添加测试数据: addTestGames()');
console.log('- 删除测试数据: removeTestGames()');

// 导出函数供使用
if (typeof window !== 'undefined') {
  window.addTestGames = addTestGames;
  window.removeTestGames = removeTestGames;
}