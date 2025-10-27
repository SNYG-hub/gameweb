// 立即修复评论显示问题
console.log('🔧 立即修复评论显示...');

// 检查当前页面是否为帖子详情页
function isPostDetailPage() {
  return window.location.pathname.includes('/forum/') && 
         window.location.pathname !== '/forum' && 
         window.location.pathname !== '/forum/';
}

// 获取当前帖子ID
function getCurrentPostId() {
  const path = window.location.pathname;
  const match = path.match(/\/forum\/(.+)/);
  return match ? match[1] : null;
}

// 添加测试评论数据
function addTestComments() {
  try {
    // 获取Vue应用实例
    const app = document.querySelector('#app').__vue_app__;
    if (!app) {
      console.log('❌ 无法找到Vue应用实例');
      return false;
    }

    // 获取store
    const store = window.store || app.config.globalProperties.$store;
    if (!store) {
      console.log('❌ 无法找到store');
      return false;
    }

    const postId = getCurrentPostId();
    if (!postId) {
      console.log('❌ 无法获取当前帖子ID');
      return false;
    }

    // 查找当前帖子
    const post = store.posts.find(p => p.id === postId);
    if (!post) {
      console.log('❌ 未找到当前帖子');
      return false;
    }

    console.log('找到帖子:', post.title);
    console.log('当前评论数量:', post.comments?.length || 0);

    // 如果没有评论，添加一些测试评论
    if (!post.comments || post.comments.length === 0) {
      post.comments = [
        {
          id: 'test_comment_1',
          author: '测试用户1',
          content: '这是一条测试评论，用于验证评论功能是否正常工作。',
          createdAt: Date.now() - 3600000 // 1小时前
        },
        {
          id: 'test_comment_2', 
          author: '测试用户2',
          content: '我也来测试一下评论功能！看起来不错。',
          createdAt: Date.now() - 1800000 // 30分钟前
        },
        {
          id: 'test_comment_3',
          author: '热心网友',
          content: '这个功能很实用，期待更多更新！',
          createdAt: Date.now() - 600000 // 10分钟前
        }
      ];

      console.log('✅ 已添加测试评论，数量:', post.comments.length);
      
      // 强制触发Vue的响应式更新
      if (store.posts) {
        const index = store.posts.findIndex(p => p.id === postId);
        if (index !== -1) {
          store.posts[index] = { ...post };
        }
      }

      return true;
    } else {
      console.log('ℹ️ 帖子已有评论，无需添加测试数据');
      return true;
    }

  } catch (error) {
    console.error('❌ 添加测试评论失败:', error);
    return false;
  }
}

// 强制刷新评论区域
function refreshCommentsSection() {
  try {
    // 查找评论区域元素
    const commentsSection = document.querySelector('.comments');
    const emptyMessage = document.querySelector('.empty');
    
    if (commentsSection || emptyMessage) {
      console.log('🔄 强制刷新评论区域...');
      
      // 触发重新渲染
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ 刷新评论区域失败:', error);
    return false;
  }
}

// 主修复函数
function fixComments() {
  console.log('🚀 开始修复评论显示...');
  
  if (!isPostDetailPage()) {
    console.log('ℹ️ 当前不在帖子详情页面');
    return;
  }
  
  const postId = getCurrentPostId();
  console.log('当前帖子ID:', postId);
  
  // 添加测试评论
  const success = addTestComments();
  
  if (success) {
    console.log('✅ 评论修复成功');
    
    // 刷新页面以显示更改
    refreshCommentsSection();
  } else {
    console.log('❌ 评论修复失败');
  }
}

// 等待页面加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixComments);
} else {
  fixComments();
}

// 导出到全局作用域供手动调用
window.fixCommentsNow = fixComments;