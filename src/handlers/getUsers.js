import { headers } from '../config.js';

export async function handleGetUsers(request, env) {
  try {
    console.log('Fetching all users from database');
    
    // 移除 lastLoginDate 字段
    const { results } = await env.DB.prepare(`
      SELECT id, nickName, avatarUrl, joinDate, 
             booksRead, meetingsAttended 
      FROM Users
    `).all();

    console.log('Found users:', results.length);

    return new Response(JSON.stringify(results), {
      headers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({
      error: '获取用户列表失败',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
