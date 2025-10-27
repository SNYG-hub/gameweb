# 数据库部署指南

## 部署顺序

### 1. 全新部署（新数据库）
如果您是第一次部署数据库，请按以下顺序执行：

```sql
-- 1. 创建基础表结构和策略
\i database.sql

-- 2. 设置私信系统和审核机制
\i message-system-setup.sql

-- 3. 设置密码重置功能
\i password-reset-setup.sql

-- 4. 设置存储策略（如果需要）
\i storage-policies.sql
```

### 2. 现有数据库升级
如果您已有数据库需要升级，请按以下顺序执行：

```sql
-- 1. 先执行升级脚本
\i database-upgrade.sql

-- 2. 然后设置私信系统和审核机制
\i message-system-setup.sql

-- 3. 设置密码重置功能
\i password-reset-setup.sql

-- 4. 设置存储策略（如果需要）
\i storage-policies.sql
```

### 3. 重复执行或修复错误
如果需要重复执行脚本或修复错误：

```sql
-- 1. 先清理已存在的对象
\i cleanup-existing-objects.sql

-- 2. 然后重新执行需要的脚本
\i message-system-setup.sql
\i password-reset-setup.sql
```

## 部署后配置

### 1. 设置审核员
部署完成后，需要手动设置审核员：

```sql
-- 将特定用户设置为审核员
UPDATE public.profiles SET is_moderator = true WHERE id = '用户UUID';

-- 或者通过邮箱查找用户
UPDATE public.profiles SET is_moderator = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

### 2. Supabase 控制台配置

#### 邮件模板配置
1. 登录 Supabase 控制台
2. 进入 Authentication → Email Templates
3. 配置以下模板：
   - **Confirm signup**: 用户注册确认邮件
   - **Reset Password**: 密码重置邮件
   - **Magic Link**: 魔法链接登录邮件

#### URL 配置
1. 进入 Authentication → URL Configuration
2. 添加重定向 URL：
   - 生产环境：`https://your-domain.com/reset-password`
   - 开发环境：`http://localhost:5173/reset-password`

#### 存储配置（如果使用文件上传）
1. 进入 Storage
2. 创建存储桶：
   - `avatars`: 用户头像
   - `game-covers`: 游戏封面
   - `game-images`: 游戏截图
   - `post-images`: 帖子图片

## 常见问题解决

### 1. "column does not exist" 错误
如果遇到字段不存在的错误，请确保：
- 先执行 `database-upgrade.sql`（现有数据库）
- 或者重新执行完整的 `database.sql`（新数据库）

### 2. "policy already exists" 或其他对象已存在错误
如果遇到策略、触发器或其他对象已存在的错误：

**方法一：使用清理脚本**
```sql
-- 先执行清理脚本
\i cleanup-existing-objects.sql
-- 然后重新执行相关脚本
```

**方法二：手动删除冲突对象**
```sql
-- 删除冲突的策略
DROP POLICY IF EXISTS "策略名称" ON 表名;
-- 删除冲突的触发器
DROP TRIGGER IF EXISTS "触发器名称" ON 表名;
```

### 3. 安全的重复执行
所有 SQL 脚本现在都支持安全的重复执行：
- 策略创建前会先删除已存在的策略
- 函数使用 `CREATE OR REPLACE`
- 触发器创建前会先删除已存在的触发器
- 表和字段使用 `IF NOT EXISTS`

### 3. SQL 语法错误
如果遇到语法错误（如 "syntax error at or near 'ORDER'"）：

**常见问题：**
- PostgreSQL 的 UPDATE 语句不支持直接使用 ORDER BY 和 LIMIT
- 需要使用子查询来实现相同功能

**解决方法：**
```sql
-- 错误的语法
UPDATE table SET col = value WHERE condition ORDER BY col LIMIT 1;

-- 正确的语法
UPDATE table SET col = value 
WHERE id = (
  SELECT id FROM table 
  WHERE condition 
  ORDER BY col LIMIT 1
);
```

### 4. 权限问题
确保执行 SQL 的用户具有以下权限：
- CREATE TABLE
- ALTER TABLE
- CREATE POLICY
- CREATE FUNCTION
- CREATE TRIGGER

## 验证部署

部署完成后，可以执行以下查询验证：

```sql
-- 1. 检查表结构
\d public.profiles
\d public.games
\d public.posts
\d public.messages

-- 2. 检查策略
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- 3. 检查函数
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- 4. 测试审核员权限
SELECT * FROM public.profiles WHERE is_moderator = true;
```

## 注意事项

1. **备份数据**：升级前请务必备份现有数据
2. **测试环境**：建议先在测试环境验证所有脚本
3. **权限管理**：审核员权限需要谨慎分配
4. **监控日志**：部署后监控应用日志确保功能正常

## 回滚方案

如果需要回滚，可以：

1. 恢复数据库备份
2. 或者手动删除新增的字段和表：

```sql
-- 删除新增字段
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_moderator;
ALTER TABLE public.games DROP COLUMN IF EXISTS status;
ALTER TABLE public.games DROP COLUMN IF EXISTS reviewed_by;
ALTER TABLE public.games DROP COLUMN IF EXISTS reviewed_at;
ALTER TABLE public.games DROP COLUMN IF EXISTS rejection_reason;
-- ... 其他字段

-- 删除新增表
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.moderation_queue CASCADE;
DROP TABLE IF EXISTS public.password_reset_logs CASCADE;
```