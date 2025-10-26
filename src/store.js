import { reactive, watch } from 'vue';
import { supabase } from './supabase.js';

const STORAGE_KEY = 'game_forum_store_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function save(state) {
  try {
    // 创建一个轻量级的状态副本，移除大型数据
    const lightState = {
      ...state,
      games: state.games.map(game => ({
        ...game,
        // 如果图片是 base64 数据，则不保存到 localStorage
        cover: game.cover && game.cover.startsWith('data:') ? '' : game.cover,
        gallery: game.gallery ? game.gallery.filter(img => !img.startsWith('data:')) : []
      })),
      posts: state.posts.map(post => ({
        ...post,
        // 移除 base64 图片数据
        images: post.images ? post.images.filter(img => !img.startsWith('data:')) : []
      }))
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lightState));
  } catch (error) {
    console.warn('保存到 localStorage 失败:', error);
    // 如果仍然失败，尝试只保存基本信息
    try {
      const minimalState = {
        user: state.user,
        profiles: state.profiles,
        relations: state.relations,
        searchGame: state.searchGame,
        searchForum: state.searchForum,
        games: state.games.map(g => ({
          id: g.id,
          title: g.title,
          company: g.company,
          price: g.price,
          genres: g.genres,
          creator: g.creator,
          createdAt: g.createdAt,
          supabase_id: g.supabase_id
        })),
        posts: state.posts.map(p => ({
          id: p.id,
          title: p.title,
          author: p.author,
          content: p.content,
          likes: p.likes,
          createdAt: p.createdAt,
          supabase_id: p.supabase_id
        }))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalState));
    } catch (finalError) {
      console.error('无法保存到 localStorage，清除旧数据:', finalError);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

function newId(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

function parseGallery(g) {
  if (!g) return [];
  if (Array.isArray(g)) return g.filter(Boolean);
  return String(g).split(',').map(s => s.trim()).filter(Boolean);
}

function parseGenres(genres, fallback) {
  if (!genres && fallback) return [fallback].filter(Boolean);
  if (Array.isArray(genres)) return genres.filter(Boolean);
  const s = String(genres || '').trim();
  return s ? [s] : [];
}

const defaultState = {
  user: null,
  /* 用户资料与关系 */
  profiles: {},           /* { [name]: { avatar?: string } } */
  relations: {},          /* { [name]: { followers: string[], following: string[] } } */
  /* 全局搜索 */
  searchGame: '',
  searchForum: '',
  games: [
    {
      id: 'game_demo',
      title: '示例游戏：永夜传说',
      company: '星环工作室',
      price: 128,
      genre: '角色扮演',
      genres: ['角色扮演'],
      background: '在永夜笼罩的大陆，玩家踏上寻找曙光的旅途。',
      gameplay: '开放世界探索 + 回合制战斗 + 队伍养成。',
      officialUrl: 'https://example.com/demo-game',
      cover: '',
      gallery: [
        'https://picsum.photos/seed/game1/1200/600',
        'https://picsum.photos/seed/game2/1200/600',
        'https://picsum.photos/seed/game3/1200/600'
      ],
      createdAt: Date.now(),
      ratings: [] // 每条：{ id, stars(1-5), createdAt }
    }
  ],
  posts: [
    {
      id: 'post_demo',
      title: '新人报道：永夜传说初体验',
      author: '小明',
      content: '战斗节奏不错，剧情也挺吸引人。你们都玩到哪了？',
      createdAt: Date.now(),
      likes: 3,
      comments: [
        { id: newId('c'), author: '路人甲', content: '刚打完第一章 Boss！', createdAt: Date.now() }
      ]
    }
  ]
};

/* 数据迁移：兼容旧结构并兜底缺失字段 */
function migrate(data) {
  const base = JSON.parse(JSON.stringify(defaultState));
  const src = data && typeof data === 'object' ? data : {};
  base.user = src.user ?? base.user;

  base.games = Array.isArray(src.games) ? src.games : base.games;
  base.posts = Array.isArray(src.posts) ? src.posts : base.posts;

  base.profiles = src.profiles && typeof src.profiles === 'object' ? src.profiles : {};
  base.relations = src.relations && typeof src.relations === 'object' ? src.relations : {};

  base.games = base.games.map(g => ({
    ...g,
    gallery: parseGallery(g.gallery),
    genres: parseGenres(g.genres, g.genre?.trim() || '未分类')
  }));
  base.posts = base.posts.map(p => ({
    ...p,
    images: Array.isArray(p.images) ? p.images : []
  }));
  return base;
}

const persisted = load();
export const store = reactive(migrate(persisted));

watch(store, (s) => save(s), { deep: true });

// 从 Supabase 加载数据
export async function loadDataFromSupabase() {
  try {
    console.log('开始从 Supabase 加载数据...');
    
    // 加载游戏数据（包含图集）
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select(`
        *,
        profiles:creator(name, avatar_url),
        game_images(image_url, position)
      `)
      .order('created_at', { ascending: false });
    
    if (gamesError) {
      console.error('加载游戏数据失败:', gamesError);
    } else if (gamesData && gamesData.length > 0) {
      // 转换 Supabase 数据格式为本地格式
      const convertedGames = gamesData.map(game => {
        // 处理图集数据
        const gallery = game.game_images 
          ? game.game_images
              .sort((a, b) => a.position - b.position) // 按位置排序
              .map(img => img.image_url)
          : [];
        
        return {
          id: game.id,
          title: game.title,
          company: game.company || '',
          price: game.price || 0,
          genres: game.genres || [],
          background: game.background || '',
          gameplay: game.gameplay || '',
          officialUrl: game.official_url || '',
          cover: game.cover_url || '',
          gallery: gallery, // 从 game_images 表加载的图集
          createdAt: new Date(game.created_at).getTime(),
          creator: game.profiles?.name || '匿名',
          supabase_id: game.id
        };
      });
      
      // 合并到现有游戏数据中，避免重复
      const existingIds = new Set(store.games.map(g => g.supabase_id).filter(Boolean));
      const newGames = convertedGames.filter(g => !existingIds.has(g.id));
      store.games = [...newGames, ...store.games];
      
      console.log(`已加载 ${newGames.length} 个游戏，包含图集数据`);
    }
    
    // 加载帖子数据（包含图片）
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id(name, avatar_url),
        post_images(image_url, position),
        comments(
          *,
          profiles:author_id(name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (postsError) {
      console.error('加载帖子数据失败:', postsError);
    } else if (postsData && postsData.length > 0) {
      // 转换 Supabase 数据格式为本地格式
      const convertedPosts = postsData.map(post => {
        // 处理帖子图片数据
        const images = post.post_images 
          ? post.post_images
              .sort((a, b) => a.position - b.position) // 按位置排序
              .map(img => img.image_url)
          : [];
        
        return {
          id: post.id,
          title: post.title,
          author: post.author_name || post.profiles?.name || '匿名',
          content: post.content || '',
          createdAt: new Date(post.created_at).getTime(),
          likes: post.likes || 0,
          images: images, // 从 post_images 表加载的图片
          comments: (post.comments || []).map(comment => ({
            id: comment.id,
            author: comment.author_name || comment.profiles?.name || '匿名',
            content: comment.content,
            createdAt: new Date(comment.created_at).getTime()
          })),
          supabase_id: post.id
        };
      });
      
      // 合并到现有帖子数据中，避免重复
      const existingPostIds = new Set(store.posts.map(p => p.supabase_id).filter(Boolean));
      const newPosts = convertedPosts.filter(p => !existingPostIds.has(p.id));
      store.posts = [...newPosts, ...store.posts];
      
      console.log(`已加载 ${newPosts.length} 个帖子，包含图片数据`);
    }
    
    console.log('数据加载完成');
    return true;
  } catch (error) {
    console.error('从 Supabase 加载数据时出错:', error);
    return false;
  }
}

// 上传图片到 Supabase Storage
async function uploadImageToStorage(imageDataUrl, fileName, bucket = 'game-gallery') {
  try {
    // 将 base64 转换为 Blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    // 生成简单安全的文件名
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = blob.type.split('/')[1] || 'jpg';
    // 使用简单的文件名格式，避免复杂路径
    const uniqueFileName = `${timestamp}-${randomId}.${fileExtension}`;
    
    console.log('尝试上传文件:', uniqueFileName);
    
    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, blob, {
        contentType: blob.type,
        upsert: false
      });
    
    if (error) {
      console.error('上传图片失败:', error);
      console.error('错误详情:', error.message);
      
      // 如果是 RLS 策略问题，尝试使用用户 ID 作为文件夹
      if (error.message.includes('row-level security policy')) {
        const userId = store.user?.id;
        if (userId) {
          const userFileName = `${userId}/${uniqueFileName}`;
          console.log('尝试使用用户文件夹:', userFileName);
          
          const { data: userData, error: userError } = await supabase.storage
            .from(bucket)
            .upload(userFileName, blob, {
              contentType: blob.type,
              upsert: false
            });
          
          if (userError) {
            console.error('用户文件夹上传也失败:', userError);
            return null;
          }
          
          // 获取公开 URL
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(userFileName);
          
          return urlData.publicUrl;
        }
      }
      
      return null;
    }
    
    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('上传图片过程中出错:', error);
    return null;
  }
}

export async function addGame(game) {
  const id = newId('g');
  const title = game.title?.trim() || '未命名游戏';
  const company = game.company?.trim() || '未知公司';
  const price = Number(game.price) || 0;
  const genre = (game.genre?.trim() || (Array.isArray(game.genres) && game.genres[0]) || '未分类');
  const genres = parseGenres(game.genres, (game.genre?.trim() || '未分类'));
  const background = game.background?.trim() || '';
  const gameplay = game.gameplay?.trim() || '';
  const officialUrl = game.officialUrl?.trim() || '';
  const cover = game.cover?.trim() || '';
  const gallery = parseGallery(game.gallery);
  const creatorName = store.user?.name || '匿名';
  
  let supabaseGameId = null;
  let coverUrl = cover; // 默认使用原始封面
  let galleryUrls = []; // 存储上传后的图片 URL
  
  // 1. 首先保存到本地（不包含大图片数据，避免 localStorage 配额问题）
  const newGame = {
    id,
    title,
    company,
    price,
    genre,
    genres,
    background,
    gameplay,
    officialUrl,
    cover: '', // 暂时为空，等上传后更新
    gallery: [], // 暂时为空，等上传后更新
    createdAt: Date.now(),
    creator: creatorName,
    supabase_id: null
  };
  store.games.unshift(newGame);
  
  // 2. 上传图片到 Supabase Storage
  try {
    // 上传封面图片
    if (cover && cover.startsWith('data:')) {
      console.log('正在上传封面图片...');
      // 使用安全的文件名
      const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      coverUrl = await uploadImageToStorage(cover, `cover_${safeTitle}`, 'game-gallery');
      if (coverUrl) {
        newGame.cover = coverUrl; // 更新本地封面 URL
        console.log('封面上传成功:', coverUrl);
      } else {
        console.warn('封面上传失败，使用默认图片');
      }
    }
    
    // 上传图集图片
    if (gallery && gallery.length > 0) {
      console.log(`正在上传 ${gallery.length} 张图集图片...`);
      for (let i = 0; i < gallery.length; i++) {
        const imageDataUrl = gallery[i];
        if (imageDataUrl && imageDataUrl.startsWith('data:')) {
          // 使用安全的文件名
          const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
          const uploadedUrl = await uploadImageToStorage(imageDataUrl, `gallery_${safeTitle}_${i}`, 'game-gallery');
          if (uploadedUrl) {
            galleryUrls.push(uploadedUrl);
            console.log(`图集 ${i + 1} 上传成功:`, uploadedUrl);
          } else {
            console.warn(`图集 ${i + 1} 上传失败`);
          }
        }
      }
      // 更新本地图集 URL
      if (galleryUrls.length > 0) {
        newGame.gallery = galleryUrls;
        console.log(`成功上传 ${galleryUrls.length} 张图集图片`);
      }
    }
  } catch (error) {
    console.error('上传图片时出错:', error);
  }
  
  // 3. 保存游戏信息到 Supabase
  try {
    const currentUserId = store.user?.id;
    
    const { data, error } = await supabase
      .from('games')
      .insert([
        {
          title: title,
          company: company,
          price: price,
          genres: genres,
          background: background,
          gameplay: gameplay,
          official_url: officialUrl,
          cover_url: coverUrl, // 使用上传后的封面 URL
          creator: currentUserId,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('保存游戏到Supabase失败:', error);
      return { localId: id, supabaseId: null };
    }
    
    console.log('游戏已保存到Supabase:', data);
    
    if (data && data.length > 0) {
      supabaseGameId = data[0].id;
      newGame.supabase_id = supabaseGameId;
      
      // 4. 保存图集到 game_images 表
      if (galleryUrls.length > 0) {
        console.log(`正在保存 ${galleryUrls.length} 张图片到图集表...`);
        const imageRecords = galleryUrls.map((url, index) => ({
          game_id: supabaseGameId,
          image_url: url,
          position: index,
          created_at: new Date().toISOString()
        }));
        
        const { data: imageData, error: imageError } = await supabase
          .from('game_images')
          .insert(imageRecords)
          .select();
        
        if (imageError) {
          console.error('保存图集到数据库失败:', imageError);
        } else {
          console.log('图集已保存到数据库:', imageData);
        }
      }
    }
    
  } catch (error) {
    console.error('保存游戏过程中出错:', error);
  }
  
  return { localId: id, supabaseId: supabaseGameId };
}

export function getGame(id) {
  return store.games.find(g => g.id === id);
}

export function addRating(gameId, stars) {
  const g = getGame(gameId);
  if (!g) return null;
  const s = Math.min(5, Math.max(1, Number(stars) || 0));
  const id = newId('r');
  if (!Array.isArray(g.ratings)) g.ratings = [];
  g.ratings.push({ id, stars: s, createdAt: Date.now() });
  return id;
}

export function getAverageStars(g) {
  const list = Array.isArray(g?.ratings) ? g.ratings : [];
  if (list.length === 0) return 0;
  const sum = list.reduce((acc, x) => acc + (Number(x.stars) || 0), 0);
  return Math.round((sum / list.length) * 10) / 10;
}

export async function addPost(post) {
  const id = newId('p');
  const authorName = post.author?.trim() || store.user?.name || '匿名';
  const title = post.title?.trim() || '无标题';
  const content = post.content?.trim() || '';
  const images = Array.isArray(post.images) ? post.images : [];
  
  let supabasePostId = null;
  let uploadedImageUrls = []; // 存储上传后的图片 URL
  
  // 1. 首先保存到本地（不包含大图片数据）
  const newPost = {
    id,
    title,
    author: authorName,
    content,
    createdAt: Date.now(),
    likes: 0,
    images: [], // 暂时为空，等上传后更新
    comments: [],
    supabase_id: null
  };
  store.posts.unshift(newPost);
  
  // 2. 上传图片到 Supabase Storage
  if (images.length > 0) {
    console.log(`正在上传 ${images.length} 张帖子图片...`);
    for (let i = 0; i < images.length; i++) {
      const imageDataUrl = images[i];
      if (imageDataUrl && imageDataUrl.startsWith('data:')) {
        // 使用安全的文件名
        const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const uploadedUrl = await uploadImageToStorage(imageDataUrl, `post_${safeTitle}_${i}`, 'post-images');
        if (uploadedUrl) {
          uploadedImageUrls.push(uploadedUrl);
          console.log(`帖子图片 ${i + 1} 上传成功:`, uploadedUrl);
        } else {
          console.warn(`帖子图片 ${i + 1} 上传失败`);
        }
      }
    }
    // 更新本地帖子的图片 URL
    if (uploadedImageUrls.length > 0) {
      newPost.images = uploadedImageUrls;
      console.log(`成功上传 ${uploadedImageUrls.length} 张帖子图片`);
    }
  }
  
  // 3. 保存帖子信息到 Supabase
  try {
    const currentUserId = store.user?.id;
    
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: title,
          author_id: currentUserId,
          author_name: authorName,
          content: content,
          likes: 0,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('保存帖子到Supabase失败:', error);
      return { localId: id, supabaseId: null };
    }
    
    console.log('帖子已保存到Supabase:', data);
    
    if (data && data.length > 0) {
      supabasePostId = data[0].id;
      newPost.supabase_id = supabasePostId;
      
      // 4. 保存图片到 post_images 表
      if (uploadedImageUrls.length > 0) {
        console.log(`正在保存 ${uploadedImageUrls.length} 张图片到帖子图片表...`);
        const imageRecords = uploadedImageUrls.map((url, index) => ({
          post_id: supabasePostId,
          image_url: url,
          position: index,
          created_at: new Date().toISOString()
        }));
        
        const { data: imageData, error: imageError } = await supabase
          .from('post_images')
          .insert(imageRecords)
          .select();
        
        if (imageError) {
          console.error('保存帖子图片到数据库失败:', imageError);
        } else {
          console.log('帖子图片已保存到数据库:', imageData);
        }
      }
    }
    
  } catch (error) {
    console.error('保存帖子过程中出错:', error);
  }
  
  // 确保本地数据已更新
  console.log('最终本地帖子数据:', newPost);
  
  return { localId: id, supabaseId: supabasePostId };
}

export function getPost(id) {
  return store.posts.find(p => p.id === id);
}

// 为现有帖子创建Supabase记录（如果不存在）
async function ensurePostHasSupabaseId(post) {
  if (post.supabase_id) {
    return post.supabase_id;
  }
  
  try {
    // 获取当前登录用户的ID
    const currentUserId = store.user?.id;
    
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: post.title,
          author_id: currentUserId,
          author_name: post.author,
          content: post.content,
          likes: post.likes || 0,
          created_at: new Date(post.createdAt).toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('为现有帖子创建Supabase记录失败:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      const supabaseId = data[0].id;
      post.supabase_id = supabaseId;
      console.log('已为现有帖子创建Supabase记录:', supabaseId);
      return supabaseId;
    }
  } catch (error) {
    console.error('为现有帖子创建Supabase记录过程中出错:', error);
  }
  
  return null;
}

export async function addComment(postId, comment) {
  const p = getPost(postId);
  if (!p) return null;
  const id = newId('c');
  const authorName = comment.author?.trim() || store.user?.name || '匿名';
  const content = comment.content?.trim() || '';
  
  // 1. 首先保存到本地
  const newComment = {
    id,
    author: authorName,
    content,
    createdAt: Date.now()
  };
  p.comments.push(newComment);
  
  // 2. 然后尝试保存到 Supabase
  try {
    // 获取当前登录用户的ID
    const currentUserId = store.user?.id;
    
    // 使用帖子的Supabase ID（如果存在）
    let supabasePostId = p.supabase_id;
    
    // 如果没有Supabase ID，尝试为现有帖子创建Supabase记录
    if (!supabasePostId) {
      supabasePostId = await ensurePostHasSupabaseId(p);
      if (!supabasePostId) {
        console.warn('无法为帖子创建Supabase记录，跳过数据库保存');
        return id;
      }
    }
    
    // 检查用户是否已登录（需要author_id）
    if (!currentUserId) {
      console.warn('用户未登录，跳过数据库保存');
      return id;
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: supabasePostId, // 使用Supabase的帖子UUID
          author_id: currentUserId, // 关联到用户ID
          author_name: authorName,  // 保存作者名字快照
          content: content,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('保存评论到Supabase失败:', error);
      // 即使Supabase保存失败，也返回本地ID，保证用户体验
      return id;
    }
    
    console.log('评论已保存到Supabase:', data);
    
  } catch (error) {
    console.error('保存评论过程中出错:', error);
  }
  
  return id;
}

export function likePost(postId) {
  const p = getPost(postId);
  if (!p) return null;
  p.likes = (p.likes || 0) + 1;
  return p.likes;
}

/* 用户状态（本地持久化） */
export function getUser() {
  return store.user || null;
}

// 检查用户名或邮箱是否已存在
async function isUserExists(username, email) {
  try {
    // 检查用户名是否已存在
    if (username) {
      const { data: usernameData, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('name', username)
        .single();
      
      if (usernameData && !usernameError) {
        return true;
      }
    }
    
    // 检查邮箱是否已存在
    if (email) {
      const { data: emailData, error: emailError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (emailData && !emailError) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('检查用户存在性时出错:', error);
    return false;
  }
}

export async function signUp(payload) {
  const username = (payload?.username || '').trim();
  const email = (payload?.email || '').trim();
  const password = (payload?.password || '').trim();
  
  // 基本校验
  if (!username || username.length < 3) {
    return false;
  }
  if (!email || !email.includes('@')) {
    return false;
  }
  if (!password || password.length < 6) {
    return false;
  }
  
  try {
    // 检查用户名或邮箱是否已存在
    const exists = await isUserExists(username, email);
    if (exists) {
      return false;
    }
    
    // 1. 首先在Supabase Auth中创建用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username
        }
      }
    });
    
    if (authError) {
      console.error('Supabase Auth注册失败:', authError);
      return false;
    }
    
    if (!authData.user) {
      return false;
    }
    
    // 2. 在profiles表中创建用户档案
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: username,
          avatar_url: null
          // created_at 字段有默认值，不需要手动设置
        }
      ])
      .select();
    
    if (profileError) {
      console.error('创建用户档案失败:', profileError);
      // 如果档案创建失败，可能需要回滚Auth用户创建
      return false;
    }
    
    // 3. 设置当前登录用户
    store.user = {
      id: authData.user.id,
      name: username,
      username: username,
      email: email,
      createdAt: new Date().toISOString()
    };
    
    // 4. 同时保存到本地profiles
    store.profiles[username] = store.user;
    
    return true;
  } catch (error) {
    console.error('注册过程中出错:', error);
    return false;
  }
}

export async function signIn(payload, opts = {}) {
  const email = (payload?.email || '').trim();
  const password = (payload?.password || '').trim();
  
  try {
    // 简单校验：邮箱需含 @；密码非空
    if (!email.includes('@') || !password) return false;
    
    // 使用Supabase Auth进行邮箱登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (authError) {
      console.error('Supabase Auth登录失败:', authError);
      return false;
    }
    
    if (!authData.user) {
      return false;
    }
    
    // 获取用户档案信息
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('获取用户档案失败:', profileError);
      return false;
    }
    
    // 设置当前登录用户
    store.user = {
      id: authData.user.id,
      name: profileData.name,
      email: authData.user.email,
      username: profileData.name,
      avatar_url: profileData.avatar_url,
      createdAt: profileData.created_at
    };
    
    // 保存到本地profiles
    store.profiles[profileData.name] = store.user;
    
    return true;
  } catch (error) {
    console.error('登录过程中出错:', error);
    return false;
  }
}
export function signOut() {
  store.user = null;
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(email) {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('请输入有效的邮箱地址');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error('发送密码重置邮件失败:', error);
      throw new Error(error.message || '发送重置邮件失败');
    }

    return { success: true };
  } catch (error) {
    console.error('发送密码重置邮件时出错:', error);
    throw error;
  }
}

// 重置密码
export async function resetPassword(newPassword) {
  try {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('密码至少需要6位');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('重置密码失败:', error);
      throw new Error(error.message || '重置密码失败');
    }

    return { success: true };
  } catch (error) {
    console.error('重置密码时出错:', error);
    throw error;
  }
}

/* 头像与社交关系 */
export function updateAvatar(dataUrl) {
  if (!store.user) return false;
  store.user.avatar = dataUrl;
  const name = store.user.name;
  if (!store.profiles[name]) store.profiles[name] = {};
  store.profiles[name].avatar = dataUrl;
  return true;
}
export function getAvatarByName(name) {
  return store.profiles?.[name]?.avatar || null;
}
function ensureRel(name) {
  if (!store.relations[name]) store.relations[name] = { followers: [], following: [] };
  return store.relations[name];
}
export function isFollowing(targetName) {
  const me = store.user?.name;
  if (!me || !targetName) return false;
  return (ensureRel(me).following).includes(targetName);
}
export function followUser(targetName) {
  const me = store.user?.name;
  if (!me || !targetName || me === targetName) return false;
  const my = ensureRel(me); const his = ensureRel(targetName);
  if (!my.following.includes(targetName)) my.following.push(targetName);
  if (!his.followers.includes(me)) his.followers.push(me);
  return true;
}
export function unfollowUser(targetName) {
  const me = store.user?.name;
  if (!me || !targetName) return false;
  const my = ensureRel(me); const his = ensureRel(targetName);
  my.following = my.following.filter(n => n !== targetName);
  his.followers = his.followers.filter(n => n !== me);
  // 触发响应式
  store.relations = { ...store.relations, [me]: my, [targetName]: his };
  return true;
}
export function followersOf(name) {
  return ensureRel(name).followers.map(n => ({ id: n, name: n, avatar: getAvatarByName(n) }));
}
export function followingOf(name) {
  return ensureRel(name).following.map(n => ({ id: n, name: n, avatar: getAvatarByName(n) }));
}