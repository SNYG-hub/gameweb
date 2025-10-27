-- ================================
-- 私信系统和审核员机制数据库升级
-- ================================

-- 1. 扩展用户档案表，添加审核员字段
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_moderator boolean DEFAULT false;

-- 2. 创建私信表
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'moderation')),
  related_content_type text CHECK (related_content_type IN ('game', 'post', 'comment')),
  related_content_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 创建私信会话表（用于优化查询）
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_id uuid REFERENCES public.messages(id),
  last_message_at timestamptz DEFAULT now(),
  user1_unread_count int DEFAULT 0,
  user2_unread_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- 4. 创建审核队列表
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('game', 'post')),
  content_id uuid NOT NULL,
  submitter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  moderator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  moderated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON public.conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_moderator ON public.profiles(is_moderator);

-- 6. 启用 RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- 7. 私信系统 RLS 策略
-- 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "messages_select_participants" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_sender" ON public.messages;
DROP POLICY IF EXISTS "messages_update_receiver" ON public.messages;

CREATE POLICY "messages_select_participants" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );

CREATE POLICY "messages_insert_sender" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() OR
    (sender_id IS NULL AND message_type = 'system')
  );

CREATE POLICY "messages_update_receiver" ON public.messages
  FOR UPDATE USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- 8. 会话 RLS 策略
-- 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "conversations_select_participants" ON public.conversations;
DROP POLICY IF EXISTS "conversations_manage_participants" ON public.conversations;

CREATE POLICY "conversations_select_participants" ON public.conversations
  FOR SELECT USING (
    user1_id = auth.uid() OR 
    user2_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );

CREATE POLICY "conversations_manage_participants" ON public.conversations
  FOR ALL USING (
    user1_id = auth.uid() OR 
    user2_id = auth.uid()
  );

-- 9. 审核队列 RLS 策略
-- 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "moderation_queue_select_moderators" ON public.moderation_queue;
DROP POLICY IF EXISTS "moderation_queue_update_moderators" ON public.moderation_queue;

CREATE POLICY "moderation_queue_select_moderators" ON public.moderation_queue
  FOR SELECT USING (
    submitter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );

CREATE POLICY "moderation_queue_update_moderators" ON public.moderation_queue
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );

-- 10. 创建发送系统消息的函数
CREATE OR REPLACE FUNCTION send_system_message(
  receiver_id uuid,
  content text,
  msg_type text DEFAULT 'system',
  related_type text DEFAULT NULL,
  related_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  message_id uuid;
BEGIN
  INSERT INTO public.messages (
    sender_id,
    receiver_id,
    content,
    message_type,
    related_content_type,
    related_content_id,
    created_at
  ) VALUES (
    NULL,
    receiver_id,
    content,
    msg_type,
    related_type,
    related_id,
    now()
  ) RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 创建审核通过/拒绝的触发器函数
CREATE OR REPLACE FUNCTION handle_moderation_decision()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果状态从 pending 变为 approved 或 rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    -- 更新内容状态
    IF NEW.content_type = 'game' THEN
      UPDATE public.games 
      SET status = NEW.status,
          reviewed_by = NEW.moderator_id,
          reviewed_at = now(),
          rejection_reason = NEW.rejection_reason
      WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'post' THEN
      UPDATE public.posts 
      SET status = NEW.status,
          reviewed_by = NEW.moderator_id,
          reviewed_at = now(),
          rejection_reason = NEW.rejection_reason
      WHERE id = NEW.content_id;
    END IF;
    
    -- 发送系统消息给提交者
    IF NEW.status = 'approved' THEN
      PERFORM send_system_message(
        NEW.submitter_id,
        '恭喜！您提交的' || 
        CASE NEW.content_type 
          WHEN 'game' THEN '游戏' 
          WHEN 'post' THEN '帖子' 
        END || '已通过审核并发布。',
        'moderation',
        NEW.content_type,
        NEW.content_id
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM send_system_message(
        NEW.submitter_id,
        '很抱歉，您提交的' || 
        CASE NEW.content_type 
          WHEN 'game' THEN '游戏' 
          WHEN 'post' THEN '帖子' 
        END || '未通过审核。' ||
        CASE WHEN NEW.rejection_reason IS NOT NULL 
          THEN '原因：' || NEW.rejection_reason 
          ELSE '' 
        END,
        'moderation',
        NEW.content_type,
        NEW.content_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. 创建审核决定触发器
DROP TRIGGER IF EXISTS moderation_decision_trigger ON public.moderation_queue;
CREATE TRIGGER moderation_decision_trigger
  AFTER UPDATE ON public.moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION handle_moderation_decision();

-- 13. 创建更新会话的函数
CREATE OR REPLACE FUNCTION update_conversation(
  sender_id uuid,
  receiver_id uuid,
  message_id uuid
)
RETURNS void AS $$
DECLARE
  user1 uuid;
  user2 uuid;
BEGIN
  -- 确保 user1_id < user2_id 以保持一致性
  IF sender_id < receiver_id THEN
    user1 := sender_id;
    user2 := receiver_id;
  ELSE
    user1 := receiver_id;
    user2 := sender_id;
  END IF;
  
  -- 插入或更新会话
  INSERT INTO public.conversations (
    user1_id, user2_id, last_message_id, last_message_at,
    user1_unread_count, user2_unread_count
  ) VALUES (
    user1, user2, message_id, now(),
    CASE WHEN sender_id = user1 THEN 0 ELSE 1 END,
    CASE WHEN sender_id = user2 THEN 0 ELSE 1 END
  )
  ON CONFLICT (user1_id, user2_id) DO UPDATE SET
    last_message_id = message_id,
    last_message_at = now(),
    user1_unread_count = CASE 
      WHEN sender_id = user1 THEN 0 
      ELSE conversations.user1_unread_count + 1 
    END,
    user2_unread_count = CASE 
      WHEN sender_id = user2 THEN 0 
      ELSE conversations.user2_unread_count + 1 
    END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- 14. 创建消息插入触发器
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- 只有用户消息才更新会话
  IF NEW.message_type = 'user' AND NEW.sender_id IS NOT NULL THEN
    PERFORM update_conversation(NEW.sender_id, NEW.receiver_id, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS new_message_trigger ON public.messages;
CREATE TRIGGER new_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_message();

-- 15. 插入一些示例数据（可选）
-- 注意：需要在有用户注册后手动设置审核员
-- UPDATE public.profiles SET is_moderator = true WHERE id = '你的用户ID';

-- 16. 创建获取用户未读消息数的函数
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id uuid)
RETURNS int AS $$
DECLARE
  count int;
BEGIN
  SELECT COUNT(*) INTO count
  FROM public.messages
  WHERE receiver_id = user_id AND is_read = false;
  
  RETURN COALESCE(count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;