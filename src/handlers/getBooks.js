import { createBooksTableIfNotExists } from './createBooksTableIfNotExists.js';
import { headers } from '../config.js'; // 引入请求头配置

export async function handleGetBooks(request, env) {
  try {
    await createBooksTableIfNotExists(env);
    console.log('Fetching books from database');
    
    const { results } = await env.DB.prepare(`
      SELECT id, name, author, abstract, 
             createdBy, createdAt, 
             commentCount, isPublic 
      FROM Books 
      ORDER BY commentCount DESC 
      LIMIT 10
    `).all();

    console.log('Found books:', results.length);

    return new Response(JSON.stringify(results), {
      headers
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    return new Response(JSON.stringify({
      error: '获取书籍列表失败',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
