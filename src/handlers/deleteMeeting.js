import { headers } from '../config.js';

export async function handleDeleteMeeting(request, env) {
  try {
    const url = new URL(request.url);
    const meetingId = url.pathname.split('/').pop();
    // 确保 meetingId 是数字
    if (!meetingId || isNaN(meetingId)) {
      return new Response(JSON.stringify({
        error: '无效的会议ID'
      }), { status: 400, headers });
    }
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({
        error: '缺少必要参数'
      }), { status: 400, headers });
    }

    // 先检查会议是否存在且属于该用户
    const { results } = await env.DB.prepare(`
      SELECT * FROM Meetings 
      WHERE id = ? AND createdBy = ?
    `).bind(meetingId, userId).all();

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({
        error: '未找到会议或无权限删除'
      }), { status: 404, headers });
    }

    // 执行删除操作
    await env.DB.prepare(`
      DELETE FROM Meetings 
      WHERE id = ? AND createdBy = ?
    `).bind(meetingId, userId).run();

    return new Response(JSON.stringify({
      message: '会议删除成功',
      id: meetingId
    }), { headers });

  } catch (error) {
    console.error('Error deleting meeting:', error);
    return new Response(JSON.stringify({
      error: '删除会议失败',
      details: error.message
    }), { status: 500, headers });
  }
}
