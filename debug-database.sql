-- ================================
-- 数据库调试脚本
-- 用于检查审核按钮和评论问题
-- ================================

-- 1. 检查用户表结构和数据
SELECT 'profiles 表结构:' AS info;
\d public.profiles;

SELECT 'profiles 表数据:' AS info;
SELECT id, name, is_moderator, created_at FROM public.profiles LIMIT 5;

-- 2. 检查评论表结构和数据
SELECT 'comments 表结构:' AS info;
\d public.comments;

SELECT 'comments 表数据:' AS info;
SELECT id, post_id, author_name, content, created_at FROM public.comments LIMIT 10;

-- 3. 检查帖子表结构和数据
SELECT 'posts 表结构:' AS info;
\d public.posts;

SELECT 'posts 表数据:' AS info;
SELECT id, title, author_name, status, created_at FROM public.posts LIMIT 5;

-- 4. 检查 RLS 策略
SELECT 'RLS 策略:' AS info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('profiles', 'comments', 'posts')
ORDER BY tablename, policyname;

-- 5. 检查是否有审核员
SELECT '审核员列表:' AS info;
SELECT id, name, is_moderator FROM public.profiles WHERE is_moderator = true;

-- 6. 检查评论和帖子的关联
SELECT '帖子和评论关联:' AS info;
SELECT 
  p.id as post_id,
  p.title,
  p.author_name as post_author,
  COUNT(c.id) as comment_count
FROM public.posts p
LEFT JOIN public.comments c ON p.id = c.post_id
GROUP BY p.id, p.title, p.author_name
ORDER BY p.created_at DESC
LIMIT 5;