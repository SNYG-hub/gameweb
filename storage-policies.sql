-- Supabase Storage 策略配置
-- 需要在 Supabase SQL Editor 中执行这些语句

-- 1. 为 game-gallery 存储桶创建策略

-- 允许已认证用户上传文件
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'game-gallery' AND 
    auth.role() = 'authenticated'
  );

-- 允许所有人查看文件（公开访问）
CREATE POLICY "Allow public access to view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-gallery');

-- 允许文件所有者更新文件
CREATE POLICY "Allow users to update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'game-gallery' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许文件所有者删除文件
CREATE POLICY "Allow users to delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'game-gallery' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. 如果 game-gallery 桶不存在，创建它
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-gallery', 'game-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- 3. 确保桶是公开的（可选，如果需要公开访问）
UPDATE storage.buckets 
SET public = true 
WHERE id = 'game-gallery';

-- 4. 为 post-images 存储桶创建策略

-- 创建 post-images 桶（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 允许已认证用户上传帖子图片
CREATE POLICY "Allow authenticated users to upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );

-- 允许所有人查看帖子图片（公开访问）
CREATE POLICY "Allow public access to post images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

-- 允许用户更新自己的帖子图片
CREATE POLICY "Allow users to update own post images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许用户删除自己的帖子图片
CREATE POLICY "Allow users to delete own post images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );