# 问题排查指南

## 问题描述
1. **审核按钮不显示** - 用户看不到审核按钮
2. **评论互相看不到** - 用户只能看到自己的评论，看不到别人的评论

## 解决方案

### 步骤 1: 执行数据库修复
在 Supabase SQL 编辑器中执行以下脚本：

```sql
-- 执行完整修复脚本
\i complete-fix.sql
```

或者手动执行关键修复：

```sql
-- 1. 添加审核员字段
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_moderator boolean DEFAULT false;

-- 2. 设置审核员（替换为实际用户邮箱）
UPDATE public.profiles SET is_moderator = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- 3. 确保现有内容可见
UPDATE public.games SET status = 'approved' WHERE status IS NULL OR status = 'pending';
UPDATE public.posts SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- 4. 重新创建评论策略
DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
CREATE POLICY "comments_select_public" ON public.comments FOR SELECT USING (true);
```

### 步骤 2: 前端修复
1. 打开浏览器开发者工具 (F12)
2. 在控制台中粘贴并执行 `frontend-fix.js` 的内容
3. 运行 `frontendFix.runAllFixes()`

### 步骤 3: 重新登录
1. 退出当前账户
2. 重新登录
3. 检查审核按钮是否显示

### 步骤 4: 测试评论功能
1. 创建一个新帖子
2. 用不同账户添加评论
3. 检查评论是否互相可见

## 验证修复结果

### 检查审核员权限
```sql
SELECT id, name, is_moderator FROM public.profiles WHERE is_moderator = true;
```

### 检查评论策略
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'comments';
```

### 检查内容状态
```sql
SELECT status, COUNT(*) FROM public.posts GROUP BY status;
SELECT status, COUNT(*) FROM public.games GROUP BY status;
```

## 常见问题

### Q: 审核按钮仍然不显示
**A:** 
1. 确保用户的 `is_moderator` 字段为 `true`
2. 重新登录账户
3. 检查浏览器控制台是否有错误

### Q: 评论仍然看不到
**A:**
1. 检查 RLS 策略是否正确创建
2. 确保评论表有数据：`SELECT COUNT(*) FROM public.comments;`
3. 检查前端是否正确加载评论数据

### Q: 新评论不显示
**A:**
1. 检查浏览器控制台错误
2. 确保用户已登录
3. 刷新页面重新加载数据

## 调试工具

### 浏览器控制台命令
```javascript
// 检查当前用户
console.log(window.store?.user);

// 检查帖子数据
console.log(window.store?.posts);

// 重新加载数据
window.loadDataFromSupabase?.();

// 检查评论权限
window.supabase.from('comments').select('*').limit(5);
```

### SQL 调试查询
```sql
-- 检查用户权限
SELECT u.email, p.name, p.is_moderator 
FROM auth.users u 
JOIN public.profiles p ON u.id = p.id;

-- 检查评论数据
SELECT c.*, p.title as post_title 
FROM public.comments c 
JOIN public.posts p ON c.post_id = p.id 
ORDER BY c.created_at DESC LIMIT 10;

-- 检查 RLS 策略
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

## 预防措施

1. **定期备份数据库**
2. **在测试环境先验证修改**
3. **监控应用日志**
4. **保持 RLS 策略简单明确**

## 联系支持

如果问题仍然存在，请提供：
1. 浏览器控制台错误信息
2. 数据库查询结果
3. 用户操作步骤
4. 预期行为 vs 实际行为