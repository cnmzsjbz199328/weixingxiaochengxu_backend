import { createMeetingsTableIfNotExists } from './createMeetingsTableIfNotExists.js';
import { headers } from '../config.js'; // 引入请求头配置

export async function handleGetMeetings(request, env) {
  try {
    await createMeetingsTableIfNotExists(env);
    
    // 获取用户ID参数
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    console.log('Fetching meetings from database', userId ? `for user ${userId}` : 'for anonymous user');
    
    // SQL查询，使用LEFT JOIN来获取用户状态
    const { results: meetings } = await env.DB.prepare(`
      SELECT 
        m.id, 
        m.name, 
        m.date, 
        m.time, 
        m.location, 
        m.createdBy, 
        m.createdAt, 
        m.isPublic,
        (SELECT COUNT(*) 
         FROM UserMeetings um 
         WHERE um.meetingId = m.id 
         AND um.status = '已报名') as signupCount,
        CASE 
          WHEN ? IS NULL THEN NULL
          ELSE (
            SELECT status 
            FROM UserMeetings um 
            WHERE um.meetingId = m.id 
            AND um.userId = ?
          )
        END as userStatus
      FROM Meetings m
      ORDER BY m.id DESC 
      LIMIT 10
    `).bind(userId, userId).all();

    console.log('Found meetings:', meetings.length);

    return new Response(JSON.stringify(meetings), {
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
