# Supabase Storage 配置指南

## 🚨 重要：必须配置 Storage 策略才能上传图片

### 步骤 1：登录 Supabase 控制台

1. 访问 [supabase.com](https://supabase.com)
2. 登录你的账号
3. 选择你的项目：`zfpnrvxduvtckrnwghia`

### 步骤 2：创建 Storage 桶

1. 在左侧菜单点击 **Storage**
2. 创建游戏图片桶：
   - 点击 **Create a new bucket**
   - 桶名称：`game-gallery`
   - 勾选 **Public bucket** (允许公开访问)
   - 点击 **Create bucket**
3. 创建帖子图片桶：
   - 点击 **Create a new bucket**
   - 桶名称：`post-images`
   - 勾选 **Public bucket** (允许公开访问)
   - 点击 **Create bucket**

### 步骤 3：配置 Storage 策略

1. 在左侧菜单点击 **SQL Editor**
2. 点击 **New query**
3. 复制并粘贴以下 SQL 代码：

```sql
-- 1. 确保游戏图片桶存在且为公开
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-gallery', 'game-gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. 确保帖子图片桶存在且为公开
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. 游戏图片桶策略
CREATE POLICY "Allow authenticated users to upload to game-gallery" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'game-gallery' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to game-gallery" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'game-gallery');

-- 4. 帖子图片桶策略
CREATE POLICY "Allow authenticated users to upload to post-images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'post-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to post-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'post-images');

-- 5. 允许用户管理自己的文件（游戏图片）
CREATE POLICY "Allow users to update own game files" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'game-gallery' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete own game files" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'game-gallery' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. 允许用户管理自己的文件（帖子图片）
CREATE POLICY "Allow users to update own post files" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'post-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete own post files" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'post-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

4. 点击 **Run** 执行 SQL

### 步骤 4：验证配置

1. 回到 **Storage** 页面
2. 确认以下桶已创建：
   - `game-gallery` (游戏图片)
   - `post-images` (帖子图片)
3. 两个桶都应该显示为 **Public**

### 步骤 5：测试上传

现在重新访问你的网站：`https://gameweb-po34.vercel.app/`

1. 登录账号
2. **测试游戏图片上传**：
   - 创建新游戏
   - 上传封面和图集图片
   - 提交游戏
3. **测试帖子图片上传**：
   - 发布新帖
   - 上传配图
   - 提交帖子

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

**游戏图片功能**：
- 游戏图片成功上传到 `game-gallery` 桶
- `games` 表中的 `cover_url` 字段有正确的 URL
- `game_images` 表中有图集记录
- 游戏详情页图片正常显示

**帖子图片功能**：
- 帖子图片成功上传到 `post-images` 桶
- `post_images` 表中有图片记录
- 论坛列表和帖子详情页图片都正常显示
- 跨设备访问时图片同步正常

## 📧 配置邮件功能（忘记密码）

### 步骤 6：配置邮件模板

1. 在左侧菜单点击 **Authentication** → **Email Templates**
2. 配置 **Reset Password** 模板：
   - 确保模板已启用
   - 可以自定义邮件标题和内容
   - 默认模板通常已经可用

### 步骤 7：配置重定向 URL

1. 在 **Authentication** → **URL Configuration** 中
2. **设置 Site URL**：
   ```
   https://gameweb-po34.vercel.app
   ```
3. 在 **Redirect URLs** 部分添加：
   ```
   https://gameweb-po34.vercel.app/reset-password
   http://localhost:5173/reset-password
   ```
4. **重要**：确保删除任何错误的 localhost URL
5. 点击 **Save** 保存配置

### 步骤 8：执行密码重置配置 SQL

1. 在 **SQL Editor** 中执行 `password-reset-setup.sql` 中的代码
2. 这将创建密码重置日志表和相关函数（可选）

### 步骤 9：配置私信系统和审核员机制

1. 在 **SQL Editor** 中执行 `message-system-setup.sql` 中的代码
2. 这将创建以下功能：
   - 私信系统（消息表、会话表）
   - 审核员机制（审核队列表）
   - 自动审核触发器和函数
   - 系统消息发送功能

### 步骤 10：设置审核员账号

1. 注册一个管理员账号
2. 在 **SQL Editor** 中执行以下 SQL，将指定用户设为审核员：
   ```sql
   UPDATE public.profiles 
   SET is_moderator = true 
   WHERE id = '你的用户ID';
   ```
3. 可以在 **Authentication** → **Users** 中查看用户 ID

## 🧪 完整功能测试

配置完成后，请测试以下功能：

### 用户认证功能
1. **注册新账号**：测试邮箱注册流程
2. **登录账号**：使用邮箱和密码登录
3. **忘记密码**：
   - 在登录页面点击"忘记密码？"链接
   - 输入注册邮箱地址
   - 检查邮箱收到重置邮件
4. **重置密码**：
   - 点击邮件中的重置链接
   - 设置新密码
   - 使用新密码登录

### 图片上传功能
1. **游戏图片上传**：
   - 创建新游戏
   - 上传封面和图集图片
   - 提交游戏
2. **帖子图片上传**：
   - 发布新帖
   - 上传配图
   - 提交帖子

### 私信系统功能
1. **发送私信**：
   - 进入私信中心
   - 选择或创建会话
   - 发送消息
2. **查看系统消息**：
   - 审核结果通知
   - 系统公告

### 审核员功能
1. **内容审核**：
   - 审核员登录后可看到"审核"按钮
   - 查看待审核的游戏和帖子
   - 通过或拒绝内容
   - 拒绝时可填写原因
2. **审核结果**：
   - 通过：内容正常显示
   - 拒绝：发送系统消息给提交者

## 📞 需要帮助？

如果配置过程中遇到问题，请提供：
1. 具体的错误信息
2. Supabase 控制台的截图
3. 浏览器控制台的错误日志

### 常见问题

**Q: 收不到重置密码邮件？**
A: 
1. 检查垃圾邮件文件夹
2. 确认邮件模板已启用
3. 检查 Supabase 项目的邮件配置

**Q: 重置链接显示无效？**
A: 
1. 确认重定向 URL 配置正确
2. 检查链接是否已过期（通常24小时有效）
3. 确保访问的是正确的重置页面 URL