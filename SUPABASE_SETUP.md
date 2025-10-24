# Supabase Storage 配置指南

## 🚨 重要：必须配置 Storage 策略才能上传图片

### 步骤 1：登录 Supabase 控制台

1. 访问 [supabase.com](https://supabase.com)
2. 登录你的账号
3. 选择你的项目：`zfpnrvxduvtckrnwghia`

### 步骤 2：创建 Storage 桶

1. 在左侧菜单点击 **Storage**
2. 点击 **Create a new bucket**
3. 桶名称：`game-gallery`
4. 勾选 **Public bucket** (允许公开访问)
5. 点击 **Create bucket**

### 步骤 3：配置 Storage 策略

1. 在左侧菜单点击 **SQL Editor**
2. 点击 **New query**
3. 复制并粘贴以下 SQL 代码：

```sql
-- 1. 确保 game-gallery 桶存在且为公开
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-gallery', 'game-gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. 允许已认证用户上传文件
CREATE POLICY "Allow authenticated users to upload to game-gallery" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'game-gallery' AND 
  auth.role() = 'authenticated'
);

-- 3. 允许所有人查看文件（公开访问）
CREATE POLICY "Allow public access to game-gallery" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'game-gallery');

-- 4. 允许用户更新自己的文件
CREATE POLICY "Allow users to update own files in game-gallery" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'game-gallery' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 允许用户删除自己的文件
CREATE POLICY "Allow users to delete own files in game-gallery" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'game-gallery' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

4. 点击 **Run** 执行 SQL

### 步骤 4：验证配置

1. 回到 **Storage** 页面
2. 确认 `game-gallery` 桶已创建
3. 桶应该显示为 **Public**

### 步骤 5：测试上传

现在重新访问你的网站：`https://gameweb-po34.vercel.app/`

1. 登录账号
2. 创建新游戏
3. 上传图片
4. 提交游戏

## 🔍 故障排除

### 如果仍然出现 RLS 错误：

1. **检查用户是否已登录**
   - 确保在上传前已经登录
   - 检查浏览器控制台是否有认证错误

2. **检查策略是否正确创建**
   - 在 Supabase 控制台 → Authentication → Policies
   - 确认 storage.objects 表有相应策略

3. **重新创建策略**（如果需要）
   ```sql
   -- 删除现有策略
   DROP POLICY IF EXISTS "Allow authenticated users to upload to game-gallery" ON storage.objects;
   DROP POLICY IF EXISTS "Allow public access to game-gallery" ON storage.objects;
   
   -- 重新创建策略
   CREATE POLICY "game_gallery_upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'game-gallery');
   
   CREATE POLICY "game_gallery_select" ON storage.objects
   FOR SELECT USING (bucket_id = 'game-gallery');
   ```

### 如果桶不存在：

```sql
-- 手动创建桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-gallery', 
  'game-gallery', 
  true, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);
```

## ✅ 成功标志

配置成功后，你应该看到：
- 图片成功上传到 Supabase Storage
- `games` 表中的 `cover_url` 字段有正确的 URL
- `game_images` 表中有图集记录
- 图片在网站上正常显示

## 📞 需要帮助？

如果配置过程中遇到问题，请提供：
1. 具体的错误信息
2. Supabase 控制台的截图
3. 浏览器控制台的错误日志