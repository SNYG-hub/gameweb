-- ================================
-- 修复审核按钮和评论问题
-- ================================

-- 1. 设置测试用户为审核员（请替换为实际的用户ID或邮箱）
-- 方法一：通过用户ID设置
-- UPDATE public.profiles SET is_moderator = true WHERE id = '你的用户UUID';

-- 方法二：通过邮箱查找用户并设置为审核员
-- UPDATE public.profiles SET is_moderator = true 
-- WHERE id = (SELECT id FROM auth.users WHERE email = '你的邮箱@example.com');

-- 方法三：设置第一个注册的用户为审核员（仅用于测试）
UPDATE public.profiles SET is_moderator = true 
WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);

-- 2. 确保所有现有内容都是已审核状态（向后兼容）
UPDATE public.games SET status = 'approved' WHERE status IS NULL OR status = 'pending';
UPDATE public.posts SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- 3. 检查并修复评论表的 RLS 策略
-- 删除可能有问题的策略
DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_auth" ON public.comments;
DROP POLICY IF EXISTS "comments_update_owner" ON public.comments;

-- 重新创建评论策略
CREATE POLICY "comments_select_public" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_auth" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "comments_update_owner" ON public.comments
  FOR UPDATE USING (author_id = auth.uid());

-- 4. 确保帖子和游戏的查看策略正确
-- 删除可能有问题的策略
DROP POLICY IF EXISTS "games_select_public" ON public.games;
DROP POLICY IF EXISTS "posts_select_public" ON public.posts;

-- 重新创建策略，允许查看已审核的内容，创建者可以查看自己的内容，审核员可以查看所有内容
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

-- 5. 显示修复结果
SELECT '修复完成，当前审核员:' AS info;
SELECT id, name, is_moderator FROM public.profiles WHERE is_moderator = true;

SELECT '当前帖子状态:' AS info;
SELECT status, COUNT(*) as count FROM public.posts GROUP BY status;

SELECT '当前游戏状态:' AS info;
SELECT status, COUNT(*) as count FROM public.games GROUP BY status;