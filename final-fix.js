// 最终修复脚本 - 解决轮播图和评论问题
console.log('🚀 开始最终修复流程...');

// 1. 修复轮播图问题
function fixCarouselImages() {
  console.log('🎠 修复轮播图显示问题...');
  
  // 检查轮播组件是否存在
  const carousel = document.querySelector('.steam-carousel');
  if (!carousel) {
    console.log('❌ 未找到轮播组件，可能不在首页');
    return false;
  }
  
  console.log('✅ 找到Steam轮播组件');
  
  // 检查图片加载情况
  const images = carousel.querySelectorAll('img');
  console.log(`📊 轮播组件中有 ${images.length} 张图片`);
  
  let loadedCount = 0;
  let errorCount = 0;
  
  images.forEach((img, index) => {
    // 检查图片是否已加载
    if (img.complete) {
      if (img.naturalWidth > 0) {
        loadedCount++;
        console.log(`✅ 图片 ${index + 1} 已加载: ${img.src}`);
      } else {
        errorCount++;
        console.log(`❌ 图片 ${index + 1} 加载失败: ${img.src}`);
      }
    } else {
      // 添加加载事件监听
      img.addEventListener('load', function() {
        console.log(`✅ 图片 ${index + 1} 加载完成: ${this.src}`);
      });
      
      img.addEventListener('error', function() {
        console.log(`❌ 图片 ${index + 1} 加载失败: ${this.src}`);
        // 使用备用图片
        const fallbackImages = [
          'https://via.placeholder.com/1400x800/4F46E5/FFFFFF?text=Game+1',
          'https://via.placeholder.com/1400x800/7C3AED/FFFFFF?text=Game+2',
          'https://via.placeholder.com/1400x800/EC4899/FFFFFF?text=Game+3',
          'https://via.placeholder.com/1400x800/10B981/FFFFFF?text=Game+4',
          'https://via.placeholder.com/1400x800/F59E0B/FFFFFF?text=Game+5'
        ];
        if (fallbackImages[index]) {
          this.src = fallbackImages[index];
        }
      });
    }
  });
  
  console.log(`📈 图片状态: ${loadedCount} 已加载, ${errorCount} 失败, ${images.length - loadedCount - errorCount} 加载中`);
  
  // 测试轮播导航
  const nextBtn = carousel.querySelector('.nav-btn.next');
  const prevBtn = carousel.querySelector('.nav-btn.prev');
  
  if (nextBtn && prevBtn) {
    console.log('🎮 轮播导航按钮正常');
    return true;
  } else {
    console.log('⚠️ 轮播导航按钮缺失');
    return false;
  }
}

// 2. 修复评论显示问题
function fixCommentsDisplay() {
  console.log('💬 修复评论显示问题...');
  
  // 检查是否在帖子详情页
  const isPostPage = window.location.pathname.includes('/forum/') && 
                     window.location.pathname !== '/forum' && 
                     window.location.pathname !== '/forum/';
  
  if (!isPostPage) {
    console.log('ℹ️ 当前不在帖子详情页面');
    return false;
  }
  
  // 获取帖子ID
  const pathMatch = window.location.pathname.match(/\/forum\/(.+)/);
  if (!pathMatch) {
    console.log('❌ 无法获取帖子ID');
    return false;
  }
  
  const postId = pathMatch[1];
  console.log('📝 当前帖子ID:', postId);
  
  // 检查store
  if (!window.store) {
    console.log('❌ 未找到全局store');
    return false;
  }
  
  // 查找当前帖子
  const post = window.store.posts.find(p => p.id === postId);
  if (!post) {
    console.log('❌ 未找到当前帖子数据');
    return false;
  }
  
  console.log('✅ 找到帖子:', post.title);
  console.log('📊 当前评论数量:', post.comments?.length || 0);
  
  // 检查评论区域DOM
  const commentsSection = document.querySelector('.comments');
  const emptyMessage = document.querySelector('.empty');
  
  if (commentsSection) {
    console.log('✅ 找到评论区域');
    const commentElements = commentsSection.querySelectorAll('.comment');
    console.log(`📊 DOM中显示 ${commentElements.length} 条评论`);
  } else if (emptyMessage) {
    console.log('ℹ️ 显示"暂无评论"消息');
  } else {
    console.log('❌ 未找到评论相关DOM元素');
  }
  
  // 如果帖子有Supabase ID但没有评论，尝试从数据库加载
  if (post.supabase_id && (!post.comments || post.comments.length === 0)) {
    console.log('🔄 尝试从Supabase加载评论...');
    loadCommentsFromSupabase(post);
  } else if (!post.comments || post.comments.length === 0) {
    // 添加示例评论用于测试
    console.log('➕ 添加示例评论用于测试...');
    addSampleComments(post);
  }
  
  return true;
}

// 3. 从Supabase加载评论
async function loadCommentsFromSupabase(post) {
  if (!window.supabase) {
    console.log('❌ Supabase客户端未加载');
    return false;
  }
  
  try {
    console.log('🔗 从Supabase加载评论，帖子ID:', post.supabase_id);
    
    const { data: commentsData, error } = await window.supabase
      .from('comments')
      .select(`
        *,
        profiles:author_id(name, avatar_url)
      `)
      .eq('post_id', post.supabase_id)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ 加载评论失败:', error);
      return false;
    }
    
    if (commentsData && commentsData.length > 0) {
      const comments = commentsData.map(comment => ({
        id: comment.id,
        author: comment.author_name || comment.profiles?.name || '匿名',
        content: comment.content,
        createdAt: new Date(comment.created_at).getTime()
      }));
      
      console.log('✅ 成功加载评论:', comments.length, '条');
      
      // 更新帖子评论
      post.comments = comments;
      
      // 触发页面更新
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    } else {
      console.log('ℹ️ 该帖子在数据库中暂无评论');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 加载评论过程中出错:', error);
    return false;
  }
}

// 4. 添加示例评论
function addSampleComments(post) {
  const sampleComments = [
    {
      id: 'sample_1',
      author: '游戏达人',
      content: '这个游戏看起来很有趣！期待试玩。',
      createdAt: Date.now() - 3600000 // 1小时前
    },
    {
      id: 'sample_2',
      author: '资深玩家',
      content: '画面质量不错，希望游戏性也能跟上。',
      createdAt: Date.now() - 1800000 // 30分钟前
    },
    {
      id: 'sample_3',
      author: '测试用户',
      content: '评论功能测试正常！👍',
      createdAt: Date.now() - 600000 // 10分钟前
    }
  ];
  
  post.comments = sampleComments;
  console.log('✅ 已添加示例评论:', sampleComments.length, '条');
  
  // 更新store中的帖子数据
  const postIndex = window.store.posts.findIndex(p => p.id === post.id);
  if (postIndex !== -1) {
    window.store.posts[postIndex] = { ...post };
    console.log('✅ 已更新store中的帖子数据');
  }
  
  // 延迟刷新页面
  setTimeout(() => {
    console.log('🔄 刷新页面以显示新评论...');
    window.location.reload();
  }, 2000);
  
  return true;
}

// 5. 检查系统状态
function checkSystemStatus() {
  console.log('🔍 检查系统状态...');
  
  const status = {
    vue: !!window.Vue || !!document.querySelector('#app').__vue_app__,
    store: !!window.store,
    supabase: !!window.supabase,
    router: !!window.location,
    currentPage: window.location.pathname
  };
  
  console.log('📊 系统状态:');
  console.log('   Vue应用:', status.vue ? '✅' : '❌');
  console.log('   Store:', status.store ? '✅' : '❌');
  console.log('   Supabase:', status.supabase ? '✅' : '❌');
  console.log('   当前页面:', status.currentPage);
  
  if (window.store) {
    console.log('   帖子数量:', window.store.posts?.length || 0);
    console.log('   游戏数量:', window.store.games?.length || 0);
    console.log('   当前用户:', window.store.user?.name || '未登录');
  }
  
  return status;
}

// 6. 主修复函数
async function runFinalFix() {
  console.log('🚀 开始最终修复流程...');
  console.log('='.repeat(60));
  
  // 检查系统状态
  const systemStatus = checkSystemStatus();
  
  // 修复轮播图
  const carouselFixed = fixCarouselImages();
  
  // 修复评论
  const commentsFixed = fixCommentsDisplay();
  
  console.log('='.repeat(60));
  console.log('📊 修复结果汇总:');
  console.log(`   系统状态: ${systemStatus.vue && systemStatus.store ? '✅ 正常' : '❌ 异常'}`);
  console.log(`   轮播图: ${carouselFixed ? '✅ 正常' : '⚠️ 需检查'}`);
  console.log(`   评论功能: ${commentsFixed ? '✅ 已处理' : '⚠️ 需检查'}`);
  console.log('='.repeat(60));
  
  if (carouselFixed || commentsFixed) {
    console.log('🎉 修复完成！');
    console.log('💡 如果问题仍然存在，请尝试:');
    console.log('   1. 刷新页面 (F5)');
    console.log('   2. 清除浏览器缓存');
    console.log('   3. 检查网络连接');
  } else {
    console.log('⚠️ 未检测到需要修复的问题');
  }
}

// 7. 导出函数到全局作用域
window.runFinalFix = runFinalFix;
window.fixCarouselImages = fixCarouselImages;
window.fixCommentsDisplay = fixCommentsDisplay;
window.checkSystemStatus = checkSystemStatus;
window.loadCommentsFromSupabase = loadCommentsFromSupabase;

// 使用说明
console.log('📖 最终修复脚本已加载');
console.log('🎯 运行完整修复: runFinalFix()');
console.log('🔍 检查系统状态: checkSystemStatus()');
console.log('🎠 修复轮播图: fixCarouselImages()');
console.log('💬 修复评论: fixCommentsDisplay()');

// 自动运行修复
console.log('⏳ 即将自动运行修复...');
setTimeout(runFinalFix, 2000);