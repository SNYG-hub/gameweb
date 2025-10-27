-- ================================
-- 完整修复脚本 - 解决审核按钮和评论问题
-- ================================

-- 1. 首先检查当前数据库状态
SELECT 'Step 1: 检查数据库状态' AS step;

-- 检查 profiles 表是否有 is_moderator 字段
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_moderator';

-- 检查 comments 表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'comments'
ORDER BY ordinal_position;

-- 2. 确保所有必要的字段存在
SELECT 'Step 2: 添加缺失字段' AS step;

-- 为 profiles 表添加 is_moderator 字段（如果不存在）
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_moderator boolean DEFAULT false;

-- 3. 设置审核员（请根据实际情况修改）
SELECT 'Step 3: 设置审核员' AS step;

-- 方法1: 设置第一个用户为审核员（测试用）
UPDATE public.profiles SET is_moderator = true 
WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);

-- 方法2: 通过邮箱设置审核员（请替换为实际邮箱）
-- UPDATE public.profiles SET is_moderator = true 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- 4. 修复内容状态（确保现有内容可见）
SELECT 'Step 4: 修复内容状态' AS step;

-- 为现有游戏和帖子设置为已审核状态
UPDATE public.games SET status = 'approved' WHERE status IS NULL OR status = 'pending';
UPDATE public.posts SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- 5. 重新创建 RLS 策略
SELECT 'Step 5: 重新创建 RLS 策略' AS step;

-- 删除现有策略
DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_auth" ON public.comments;
DROP POLICY IF EXISTS "comments_update_owner" ON public.comments;
DROP POLICY IF EXISTS "games_select_public" ON public.games;
DROP POLICY IF EXISTS "posts_select_public" ON public.posts;

-- 重新创建评论策略（确保所有人都能看到评论）
CREATE POLICY "comments_select_public" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_auth" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "comments_update_owner" ON public.comments
  FOR UPDATE USING (author_id = auth.uid());

-- 重新创建内容策略（已审核的内容对所有人可见，创建者和审核员可以看到所有内容）
CREATE POLICY "games_select_public" ON public.games
  FOR SELECT USING (
    status = 'approved' OR 
    creator = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );

CREATE POLICY "posts_select_public" ON public.posts
  FOR SELECT USING (
    status = 'approved' OR 
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );

-- 6. 创建刷新用户会话的函数
SELECT 'Step 6: 创建辅助函数' AS step;

CREATE OR REPLACE FUNCTION refresh_user_session()
RETURNS text AS $$
BEGIN
  -- 这个函数用于提醒前端刷新用户会话
  RETURN '请重新登录以获取最新的用户权限';
END;
$$ LANGUAGE plpgsql;

-- 7. 显示修复结果
SELECT 'Step 7: 显示修复结果' AS step;

-- 显示当前审核员
SELECT 'Current moderators:' AS info, id, name, is_moderator, created_at 
FROM public.profiles WHERE is_moderator = true;

-- 显示内容状态统计
SELECT 'Games status:' AS info, status, COUNT(*) as count 
FROM public.games GROUP BY status;

SELECT 'Posts status:' AS info, status, COUNT(*) as count 
FROM public.posts GROUP BY status;

-- 显示评论统计
SELECT 'Comments count:' AS info, COUNT(*) as total_comments 
FROM public.comments;

-- 显示策略状态
SELECT 'Active policies:' AS info, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('profiles', 'games', 'posts', 'comments')
ORDER BY tablename, policyname;

SELECT 'Fix completed successfully!' AS result;