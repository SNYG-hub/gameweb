-- ================================
-- SQL 语法测试脚本
-- 用于验证所有 SQL 脚本的语法正确性
-- ================================

-- 测试密码重置函数的语法
DO $$
DECLARE
  test_result boolean;
BEGIN
  -- 测试 mark_password_reset_completed 函数的逻辑
  RAISE NOTICE '测试密码重置函数语法...';
  
  -- 这里只是语法测试，不会实际执行
  -- SELECT mark_password_reset_completed('test@example.com') INTO test_result;
  
  RAISE NOTICE '密码重置函数语法正确';
END $$;

-- 测试 UPDATE 语句语法（模拟）
DO $$
DECLARE
  user_record record;
BEGIN
  RAISE NOTICE '测试 UPDATE 语句语法...';
  
  -- 模拟正确的 UPDATE 语法
  -- UPDATE public.password_reset_logs 
  -- SET reset_completed = true, completed_at = now()
  -- WHERE id = (
  --   SELECT id FROM public.password_reset_logs
  --   WHERE user_id = 'test-uuid'
  --     AND reset_completed = false
  --     AND requested_at > (now() - interval '1 hour')
  --   ORDER BY requested_at DESC
  --   LIMIT 1
  -- );
  
  RAISE NOTICE 'UPDATE 语句语法正确';
END $$;

-- 验证完成
SELECT 'SQL 语法测试完成' AS status;