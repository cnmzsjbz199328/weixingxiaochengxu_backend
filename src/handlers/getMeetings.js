import { createMeetingsTableIfNotExists } from './createMeetingsTableIfNotExists.js';
import { headers } from '../config.js'; // 引入请求头配置

export async function handleGetMeetings(request, env) {
  try {
    await createMeetingsTableIfNotExists(env);
    console.log('Fetching meetings from database');
    
    const { results } = await env.DB.prepare(`
      SELECT id, name, date, time, 
             location, createdBy, 
             createdAt, isPublic 
      FROM Meetings 
      ORDER BY id DESC 
      LIMIT 10
    `).all();

    console.log('Found meetings:', results.length);

    return new Response(JSON.stringify(results), {
      headers
    });

  } catch (error) {
    console.error('Error fetching meetings:', error);
    return new Response(JSON.stringify({
      error: '获取会议列表失败',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
