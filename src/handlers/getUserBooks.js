import { headers } from '../config.js';

export async function handleGetUserBooks(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        error: '缺少用户ID'
      }), { status: 400, headers });
    }

    console.log('Fetching books for user:', userId);
    
    const { results } = await env.DB.prepare(`
      SELECT id, name, author, abstract, 
             createdBy, createdAt, 
             commentCount, isPublic 
      FROM Books 
      WHERE createdBy = ?
      ORDER BY id DESC
    `).bind(userId).all();

    console.log('Found books:', results.length);

    return new Response(JSON.stringify(results), {
      headers
    });

  } catch (error) {
    console.error('Error fetching user books:', error);
    return new Response(JSON.stringify({
      error: '获取用户书籍列表失败',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
