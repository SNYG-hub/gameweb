-- ================================
-- 清理已存在的数据库对象
-- 在重新执行 SQL 脚本之前运行此脚本
-- ================================

-- 1. 删除所有相关的 RLS 策略
DROP POLICY IF EXISTS "messages_select_participants" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_sender" ON public.messages;
DROP POLICY IF EXISTS "messages_update_receiver" ON public.messages;
DROP POLICY IF EXISTS "conversations_select_participants" ON public.conversations;
DROP POLICY IF EXISTS "conversations_manage_participants" ON public.conversations;
DROP POLICY IF EXISTS "moderation_queue_select_moderators" ON public.moderation_queue;
DROP POLICY IF EXISTS "moderation_queue_update_moderators" ON public.moderation_queue;
DROP POLICY IF EXISTS "password_reset_logs_admin_only" ON public.password_reset_logs;
DROP POLICY IF EXISTS "games_select_public" ON public.games;
DROP POLICY IF EXISTS "posts_select_public" ON public.posts;

-- 2. 删除触发器
DROP TRIGGER IF EXISTS moderation_decision_trigger ON public.moderation_queue;
DROP TRIGGER IF EXISTS new_message_trigger ON public.messages;

-- 3. 删除函数（如果需要重新创建）
-- 注意：由于使用了 CREATE OR REPLACE，通常不需要删除函数
-- 但如果遇到函数签名冲突，可以取消注释以下行：
-- DROP FUNCTION IF EXISTS send_system_message(uuid, text, text, text, uuid);
-- DROP FUNCTION IF EXISTS handle_moderation_decision();
-- DROP FUNCTION IF EXISTS update_conversation(uuid, uuid, uuid);
-- DROP FUNCTION IF EXISTS handle_new_message();
-- DROP FUNCTION IF EXISTS get_unread_message_count(uuid);
-- DROP FUNCTION IF EXISTS log_password_reset_request(text, inet, text);
-- DROP FUNCTION IF EXISTS mark_password_reset_completed(text);
-- DROP FUNCTION IF EXISTS cleanup_old_password_reset_logs();

-- 4. 提示信息
SELECT 'cleanup completed' AS status;