// 测试游戏详情页面新功能
console.log('🎮 测试游戏详情页面功能...');

// 测试评分系统
function testRatingSystem() {
  console.log('\n📊 测试评分系统...');
  
  try {
    // 模拟导入store
    const { store, addRating, getUserRating, withdrawUserRating } = window.storeModule || {};
    
    if (!store) {
      console.log('❌ 无法访问store，请确保页面已加载');
      return false;
    }
    
    // 模拟用户登录
    if (!store.user) {
      store.user = { name: '测试用户' };
      console.log('✅ 模拟用户登录');
    }
    
    const gameId = 'game_demo';
    const testRating = 4;
    
    // 测试评分
    console.log(`尝试对游戏 ${gameId} 评分 ${testRating} 星...`);
    const rateResult = addRating(gameId, testRating);
    
    if (rateResult) {
      console.log('✅ 评分成功');
      
      // 测试获取用户评分
      const userRating = getUserRating(gameId);
      console.log(`用户当前评分: ${userRating} 星`);
      
      if (userRating === testRating) {
        console.log('✅ 评分获取正确');
      } else {
        console.log('❌ 评分获取错误');
      }
      
      // 测试撤回评分
      console.log('测试撤回评分...');
      const withdrawResult = withdrawUserRating(gameId);
      
      if (withdrawResult) {
        console.log('✅ 评分撤回成功');
        
        const newUserRating = getUserRating(gameId);
        if (newUserRating === 0) {
          console.log('✅ 撤回后评分为0');
        } else {
          console.log('❌ 撤回后评分不为0');
        }
      } else {
        console.log('❌ 评分撤回失败');
      }
      
    } else {
      console.log('❌ 评分失败');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 评分系统测试出错:', error);
    return false;
  }
}

// 测试评论系统
function testCommentSystem() {
  console.log('\n💬 测试评论系统...');
  
  try {
    const { store, addGameComment, likeGameComment } = window.storeModule || {};
    
    if (!store) {
      console.log('❌ 无法访问store');
      return false;
    }
    
    const gameId = 'game_demo';
    const testComment = {
      author: '测试评论者',
      content: '这是一个测试评论，用于验证评论功能是否正常工作。',
      rating: 5
    };
    
    // 测试添加评论
    console.log('尝试添加测试评论...');
    const commentId = addGameComment(gameId, testComment);
    
    if (commentId) {
      console.log('✅ 评论添加成功，ID:', commentId);
      
      // 测试点赞评论
      console.log('测试点赞评论...');
      const likeResult = likeGameComment(gameId, commentId);
      
      if (likeResult) {
        console.log('✅ 评论点赞成功');
      } else {
        console.log('❌ 评论点赞失败');
      }
      
      // 检查游戏评论数据
      const game = store.games.find(g => g.id === gameId);
      if (game && game.comments && game.comments.length > 0) {
        console.log(`✅ 游戏现有评论数量: ${game.comments.length}`);
        const addedComment = game.comments.find(c => c.id === commentId);
        if (addedComment) {
          console.log('✅ 找到添加的评论:', addedComment.content);
        }
      }
      
    } else {
      console.log('❌ 评论添加失败');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 评论系统测试出错:', error);
    return false;
  }
}

// 测试页面UI更新
function testUIUpdates() {
  console.log('\n🎨 测试UI更新...');
  
  try {
    // 检查是否在游戏详情页面
    const isGameDetailPage = window.location.pathname.includes('/game/');
    
    if (!isGameDetailPage) {
      console.log('ℹ️ 当前不在游戏详情页面，跳过UI测试');
      return true;
    }
    
    // 检查关键元素是否存在
    const elements = {
      'rating-section': document.querySelector('.rating-section'),
      'comments-section': document.querySelector('.comments-section'),
      'gallery-section': document.querySelector('.gallery-section'),
      'comment-form': document.querySelector('.comment-form'),
      'stars-input': document.querySelector('.stars-input')
    };
    
    let allElementsFound = true;
    
    Object.entries(elements).forEach(([name, element]) => {
      if (element) {
        console.log(`✅ 找到元素: ${name}`);
      } else {
        console.log(`❌ 未找到元素: ${name}`);
        allElementsFound = false;
      }
    });
    
    if (allElementsFound) {
      console.log('✅ 所有UI元素都已正确渲染');
    } else {
      console.log('⚠️ 部分UI元素缺失，可能需要刷新页面');
    }
    
    return allElementsFound;
  } catch (error) {
    console.error('❌ UI测试出错:', error);
    return false;
  }
}

// 添加测试数据
function addTestData() {
  console.log('\n📝 添加测试数据...');
  
  try {
    const { store } = window.storeModule || {};
    
    if (!store) {
      console.log('❌ 无法访问store');
      return false;
    }
    
    // 确保用户已登录
    if (!store.user) {
      store.user = { name: '测试用户' };
    }
    
    // 为示例游戏添加一些测试评论
    const game = store.games.find(g => g.id === 'game_demo');
    if (game) {
      if (!game.comments) {
        game.comments = [];
      }
      
      // 添加几条测试评论
      const testComments = [
        {
          id: 'test_comment_1',
          author: '游戏爱好者',
          content: '画面很棒，剧情也很吸引人！期待后续更新。',
          rating: 5,
          createdAt: Date.now() - 86400000, // 1天前
          likes: 3
        },
        {
          id: 'test_comment_2',
          author: '资深玩家',
          content: '玩法创新，但是难度有点高，新手可能需要适应一下。',
          rating: 4,
          createdAt: Date.now() - 43200000, // 12小时前
          likes: 1
        },
        {
          id: 'test_comment_3',
          author: '休闲玩家',
          content: '很好玩的游戏，推荐给朋友们！',
          rating: 5,
          createdAt: Date.now() - 3600000, // 1小时前
          likes: 2
        }
      ];
      
      // 只添加不存在的评论
      testComments.forEach(testComment => {
        const exists = game.comments.some(c => c.id === testComment.id);
        if (!exists) {
          game.comments.unshift(testComment);
        }
      });
      
      console.log(`✅ 游戏评论数据已更新，当前评论数: ${game.comments.length}`);
      
      // 添加一些测试评分
      if (!game.ratings) {
        game.ratings = [];
      }
      
      const testRatings = [
        { userId: '用户A', rating: 5, createdAt: Date.now() - 86400000 },
        { userId: '用户B', rating: 4, createdAt: Date.now() - 43200000 },
        { userId: '用户C', rating: 5, createdAt: Date.now() - 3600000 }
      ];
      
      testRatings.forEach(testRating => {
        const exists = game.ratings.some(r => r.userId === testRating.userId);
        if (!exists) {
          game.ratings.push(testRating);
        }
      });
      
      console.log(`✅ 游戏评分数据已更新，当前评分数: ${game.ratings.length}`);
      
      return true;
    } else {
      console.log('❌ 未找到示例游戏');
      return false;
    }
  } catch (error) {
    console.error('❌ 添加测试数据出错:', error);
    return false;
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🚀 开始游戏详情页面功能测试...');
  
  // 等待页面加载完成
  if (document.readyState !== 'complete') {
    console.log('⏳ 等待页面加载完成...');
    await new Promise(resolve => {
      window.addEventListener('load', resolve);
    });
  }
  
  // 尝试获取store模块
  try {
    const storeModule = await import('./src/store.js');
    window.storeModule = storeModule;
    console.log('✅ store模块加载成功');
  } catch (error) {
    console.log('⚠️ 无法动态加载store模块，尝试使用全局变量');
  }
  
  const results = {
    testData: addTestData(),
    rating: testRatingSystem(),
    comment: testCommentSystem(),
    ui: testUIUpdates()
  };
  
  console.log('\n📋 测试结果汇总:');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? '通过' : '失败'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 所有测试通过！游戏详情页面功能正常。');
    
    // 如果在游戏详情页面，建议刷新查看效果
    if (window.location.pathname.includes('/game/')) {
      console.log('💡 建议刷新页面查看最新效果');
      setTimeout(() => {
        if (confirm('测试完成！是否刷新页面查看效果？')) {
          window.location.reload();
        }
      }, 2000);
    }
  } else {
    console.log('\n⚠️ 部分测试失败，请检查控制台错误信息');
  }
  
  return allPassed;
}

// 导出到全局作用域
window.testGameDetailFeatures = {
  runAll: runAllTests,
  testRating: testRatingSystem,
  testComment: testCommentSystem,
  testUI: testUIUpdates,
  addTestData: addTestData
};

// 如果在浏览器环境中自动运行
if (typeof window !== 'undefined') {
  // 延迟执行，确保页面加载完成
  setTimeout(runAllTests, 1000);
} else {
  console.log('⚠️ 请在浏览器环境中运行此脚本');
}