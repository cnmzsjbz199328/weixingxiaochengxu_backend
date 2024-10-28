import { headers } from '../config.js';

export async function handleGetUserMeetings(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        error: '缺少用户ID'
      }), { status: 400, headers });
    }

    console.log('Fetching meetings for user:', userId);
    
    const { results } = await env.DB.prepare(`
      SELECT id, name, date, time, 
             location, createdBy, 
             createdAt, isPublic 
      FROM Meetings 
      WHERE createdBy = ?
      ORDER BY id DESC
    `).bind(userId).all();

    console.log('Found meetings:', results.length);

    return new Response(JSON.stringify(results), {
      headers
    });

  } catch (error) {
    console.error('Error fetching user meetings:', error);
    return new Response(JSON.stringify({
      error: '获取用户会议列表失败',
      details: error.message
    }), {
      status: 500,
      headers
    });
  }
}
