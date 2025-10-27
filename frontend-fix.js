// ================================
// 前端修复脚本 - 解决评论显示和审核按钮问题
// 在浏览器控制台中运行此脚本
// ================================

// 1. 检查当前用户状态
console.log('=== 用户状态检查 ===');
console.log('当前用户:', window.store?.user);
console.log('是否为审核员:', window.store?.user?.is_moderator);

// 2. 检查帖子和评论数据
console.log('=== 帖子数据检查 ===');
console.log('帖子总数:', window.store?.posts?.length);
if (window.store?.posts?.length > 0) {
  const firstPost = window.store.posts[0];
  console.log('第一个帖子:', firstPost);
  console.log('第一个帖子的评论:', firstPost.comments);
}

// 3. 强制重新加载数据
async function forceReloadData() {
  console.log('=== 强制重新加载数据 ===');
  
  if (typeof window.loadDataFromSupabase === 'function') {
    try {
      await window.loadDataFromSupabase();
      console.log('数据重新加载完成');
    } catch (error) {
      console.error('重新加载数据失败:', error);
    }
  } else {
    console.log('loadDataFromSupabase 函数不可用');
  }
}

// 4. 刷新用户信息
async function refreshUserInfo() {
  console.log('=== 刷新用户信息 ===');
  
  if (window.supabase && window.store?.user?.id) {
    try {
      const { data: profileData, error } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', window.store.user.id)
        .single();
      
      if (error) {
        console.error('获取用户档案失败:', error);
      } else {
        console.log('最新用户档案:', profileData);
        
        // 更新本地用户信息
        if (window.store?.user) {
          window.store.user.is_moderator = profileData.is_moderator || false;
          console.log('用户信息已更新，is_moderator:', window.store.user.is_moderator);
        }
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  }
}

// 5. 检查评论 RLS 策略
async function checkCommentAccess() {
  console.log('=== 检查评论访问权限 ===');
  
  if (window.supabase) {
    try {
      const { data: comments, error } = await window.supabase
        .from('comments')
        .select('*')
        .limit(5);
      
      if (error) {
        console.error('获取评论失败:', error);
      } else {
        console.log('可访问的评论:', comments);
      }
    } catch (error) {
      console.error('检查评论访问权限失败:', error);
    }
  }
}

// 6. 执行所有修复步骤
async function runAllFixes() {
  console.log('开始执行前端修复...');
  
  await refreshUserInfo();
  await forceReloadData();
  await checkCommentAccess();
  
  console.log('前端修复完成！');
  console.log('如果问题仍然存在，请：');
  console.log('1. 确保已执行数据库修复脚本 (complete-fix.sql)');
  console.log('2. 重新登录账户');
  console.log('3. 刷新页面');
}

// 导出函数到全局作用域
window.frontendFix = {
  forceReloadData,
  refreshUserInfo,
  checkCommentAccess,
  runAllFixes
};

console.log('前端修复脚本已加载！');
console.log('运行 frontendFix.runAllFixes() 来执行所有修复步骤');
console.log('或者单独运行：');
console.log('- frontendFix.refreshUserInfo() - 刷新用户信息');
console.log('- frontendFix.forceReloadData() - 重新加载数据');
console.log('- frontendFix.checkCommentAccess() - 检查评论权限');