-- ================================
-- 数据库升级脚本
-- 为现有数据库添加审核系统相关字段
-- ================================

-- 1. 为 profiles 表添加 is_moderator 字段（如果不存在）
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_moderator boolean DEFAULT false;

-- 2. 为 games 表添加审核相关字段（如果不存在）
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 3. 为 posts 表添加审核相关字段（如果不存在）
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 4. 创建新索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_profiles_moderator ON public.profiles(is_moderator);

-- 5. 更新现有数据：将所有现有内容标记为已审核通过
-- 注意：这是为了保持向后兼容性，现有内容默认为已通过审核
UPDATE public.games SET status = 'approved' WHERE status = 'pending';
UPDATE public.posts SET status = 'approved' WHERE status = 'pending';

-- 6. 删除旧的 RLS 策略并创建新的
DROP POLICY IF EXISTS "games_select_public" ON public.games;
DROP POLICY IF EXISTS "posts_select_public" ON public.posts;

-- 7. 创建新的 RLS 策略
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

-- 8. 提示信息
-- 升级完成后，请手动设置审核员：
-- UPDATE public.profiles SET is_moderator = true WHERE id = '你的用户ID';