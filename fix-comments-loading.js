// 修复评论加载问题的脚本
console.log('🔧 开始修复评论加载问题...');

// 检查 Supabase 配置
function checkSupabaseConfig() {
  console.log('📋 检查 Supabase 配置...');
  
  // 检查环境变量
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  
  console.log('Supabase URL:', supabaseUrl || '未配置');
  console.log('Supabase Key:', supabaseKey ? '已配置' : '未配置');
  
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    console.warn('⚠️ Supabase URL 未正确配置');
    return false;
  }
  
  if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
    console.warn('⚠️ Supabase 匿名密钥未正确配置');
    return false;
  }
  
  return true;
}

// 测试 Supabase 连接
async function testSupabaseConnection() {
  try {
    console.log('🔗 测试 Supabase 连接...');
    
    // 动态导入 supabase 客户端
    const { supabase } = await import('./src/supabase.js');
    
    // 测试简单查询
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 连接失败:', error);
      return false;
    }
    
    console.log('✅ Supabase 连接成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase 连接测试出错:', error);
    return false;
  }
}

// 手动加载评论数据
async function loadCommentsManually(postId) {
  try {
    console.log('📝 手动加载评论数据，帖子ID:', postId);
    
    const { supabase } = await import('./src/supabase.js');
    
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:author_id(name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ 加载评论失败:', error);
      return [];
    }
    
    console.log('✅ 成功加载评论:', commentsData);
    return commentsData || [];
  } catch (error) {
    console.error('❌ 加载评论过程中出错:', error);
    return [];
  }
}

// 修复当前页面的评论显示
async function fixCurrentPageComments() {
  try {
    console.log('🔄 修复当前页面评论显示...');
    
    // 获取当前路由信息
    const currentPath = window.location.pathname;
    const postIdMatch = currentPath.match(/\/forum\/(.+)/);
    
    if (!postIdMatch) {
      console.log('ℹ️ 当前不在帖子详情页面');
      return;
    }
    
    const postId = postIdMatch[1];
    console.log('当前帖子ID:', postId);
    
    // 从 store 获取帖子数据
    const { store } = await import('./src/store.js');
    const post = store.posts.find(p => p.id === postId);
    
    if (!post) {
      console.log('❌ 未找到帖子数据');
      return;
    }
    
    console.log('找到帖子:', post.title);
    console.log('当前评论数量:', post.comments?.length || 0);
    
    // 如果有 Supabase ID，尝试加载评论
    if (post.supabase_id) {
      const comments = await loadCommentsManually(post.supabase_id);
      
      if (comments.length > 0) {
        // 更新帖子评论数据
        post.comments = comments.map(comment => ({
          id: comment.id,
          author: comment.author_name || comment.profiles?.name || '匿名',
          content: comment.content,
          createdAt: new Date(comment.created_at).getTime()
        }));
        
        console.log('✅ 评论数据已更新，数量:', post.comments.length);
        
        // 强制刷新页面以显示更新
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.log('ℹ️ 该帖子暂无评论');
      }
    } else {
      console.log('⚠️ 帖子没有 Supabase ID，无法加载远程评论');
    }
    
  } catch (error) {
    console.error('❌ 修复评论显示过程中出错:', error);
  }
}

// 主修复流程
async function main() {
  console.log('🚀 开始评论修复流程...');
  
  // 1. 检查配置
  const configOk = checkSupabaseConfig();
  if (!configOk) {
    console.log('❌ Supabase 配置有问题，请检查环境变量');
    return;
  }
  
  // 2. 测试连接
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    console.log('❌ Supabase 连接失败，请检查网络和配置');
    return;
  }
  
  // 3. 修复当前页面评论
  await fixCurrentPageComments();
  
  console.log('✅ 评论修复流程完成');
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  main().catch(console.error);
} else {
  console.log('⚠️ 请在浏览器环境中运行此脚本');
}

// 导出函数供手动调用
window.fixComments = {
  checkConfig: checkSupabaseConfig,
  testConnection: testSupabaseConnection,
  loadComments: loadCommentsManually,
  fixCurrentPage: fixCurrentPageComments,
  runAll: main
};