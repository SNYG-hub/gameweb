-- ================================
-- 密码重置功能数据库配置
-- ================================

-- 1. 确保 Supabase Auth 邮件模板配置正确
-- 注意：以下配置需要在 Supabase 控制台中手动设置

-- 在 Supabase 控制台 → Authentication → Email Templates 中：
-- 1. 选择 "Reset Password" 模板
-- 2. 确保 "Confirm signup" 和 "Reset Password" 模板已启用
-- 3. 可以自定义邮件模板内容

-- 2. 确保重定向 URL 配置正确
-- 在 Supabase 控制台 → Authentication → URL Configuration 中：
-- 添加以下重定向 URL：
-- - https://your-domain.com/reset-password
-- - http://localhost:5173/reset-password (用于本地开发)

-- 3. 可选：创建密码重置日志表（用于审计）
CREATE TABLE IF NOT EXISTS public.password_reset_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  requested_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  reset_completed boolean DEFAULT false,
  completed_at timestamptz
);

-- 4. 启用 RLS
ALTER TABLE public.password_reset_logs ENABLE ROW LEVEL SECURITY;

-- 5. 创建策略 - 只有审核员可以查看重置日志
-- 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "password_reset_logs_admin_only" ON public.password_reset_logs;

CREATE POLICY "password_reset_logs_admin_only" ON public.password_reset_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_user_id ON public.password_reset_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_requested_at ON public.password_reset_logs(requested_at DESC);

-- 7. 创建函数记录密码重置请求
CREATE OR REPLACE FUNCTION log_password_reset_request(
  user_email text,
  request_ip inet DEFAULT NULL,
  request_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  user_record auth.users%ROWTYPE;
  log_id uuid;
BEGIN
  -- 查找用户
  SELECT * INTO user_record FROM auth.users WHERE email = user_email;
  
  IF user_record.id IS NOT NULL THEN
    -- 记录重置请求
    INSERT INTO public.password_reset_logs (
      user_id,
      email,
      ip_address,
      user_agent,
      requested_at
    ) VALUES (
      user_record.id,
      user_email,
      request_ip,
      request_user_agent,
      now()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建函数标记密码重置完成
CREATE OR REPLACE FUNCTION mark_password_reset_completed(
  user_email text
)
RETURNS boolean AS $$
DECLARE
  user_record auth.users%ROWTYPE;
BEGIN
  -- 查找用户
  SELECT * INTO user_record FROM auth.users WHERE email = user_email;
  
  IF user_record.id IS NOT NULL THEN
    -- 更新最近的重置记录
    UPDATE public.password_reset_logs 
    SET 
      reset_completed = true,
      completed_at = now()
    WHERE 
      id = (
        SELECT id FROM public.password_reset_logs
        WHERE user_id = user_record.id 
          AND reset_completed = false
          AND requested_at > (now() - interval '1 hour')
        ORDER BY requested_at DESC
        LIMIT 1
      );
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 创建清理过期重置记录的函数
CREATE OR REPLACE FUNCTION cleanup_old_password_reset_logs()
RETURNS void AS $$
BEGIN
  -- 删除30天前的重置日志
  DELETE FROM public.password_reset_logs 
  WHERE requested_at < (now() - interval '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 可选：创建定时任务清理过期记录
-- 注意：需要安装 pg_cron 扩展
-- SELECT cron.schedule('cleanup-password-reset-logs', '0 2 * * *', 'SELECT cleanup_old_password_reset_logs();');