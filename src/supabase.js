import { createClient } from '@supabase/supabase-js'

// 请替换为你的Supabase项目配置
// 获取方式：登录Supabase控制台 → 选择项目 → Settings → API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase