import { headers } from '../config.js';

export async function handleToggleUserMeeting(request, env) {
  try {
    const url = new URL(request.url);
    const meetingId = url.pathname.split('/toggle')[0].split('/').pop();
    const userId = url.searchParams.get('userId');

    // 验证参数
    if (!meetingId || isNaN(meetingId)) {
      return new Response(JSON.stringify({
        error: '无效的会议ID'
      }), { status: 400, headers });
    }

    if (!userId) {
      return new Response(JSON.stringify({
        error: '缺少用户ID'
      }), { status: 400, headers });
    }

    // 检查会议是否存在
    const { results: meetingResults } = await env.DB.prepare(`
      SELECT * FROM Meetings WHERE id = ?
    `).bind(meetingId).all();

    if (!meetingResults || meetingResults.length === 0) {
      return new Response(JSON.stringify({
        error: '会议不存在'
      }), { status: 404, headers });
    }

    // 检查用户的会议记录
    const { results: userMeetingRecord } = await env.DB.prepare(`
      SELECT id, status FROM UserMeetings 
      WHERE userId = ? AND meetingId = ?
    `).bind(userId, meetingId).all();

    let newStatus;
    let action;
    const batch = [];

    if (!userMeetingRecord || userMeetingRecord.length === 0) {
      // 没有记录，创建新记录（报名）
      batch.push(env.DB.prepare(`
        INSERT INTO UserMeetings (userId, meetingId, status) 
        VALUES (?, ?, '已报名')
      `).bind(userId, meetingId));

      batch.push(env.DB.prepare(`
        UPDATE Users 
        SET meetingsAttended = meetingsAttended + 1 
        WHERE id = ?
      `).bind(userId));

      newStatus = '已报名';
      action = 'join';
    } else {
      // 有记录，切换状态
      const currentStatus = userMeetingRecord[0].status;
      newStatus = currentStatus === '已报名' ? '已取消' : '已报名';
      action = newStatus === '已报名' ? 'join' : 'cancel';

      batch.push(env.DB.prepare(`
        UPDATE UserMeetings 
        SET status = ?
        WHERE userId = ? AND meetingId = ?
      `).bind(newStatus, userId, meetingId));

      // 更新用户的参会计数
      if (newStatus === '已报名') {
        batch.push(env.DB.prepare(`
          UPDATE Users 
          SET meetingsAttended = meetingsAttended + 1 
          WHERE id = ?
        `).bind(userId));
      } else {
        batch.push(env.DB.prepare(`
          UPDATE Users 
          SET meetingsAttended = CASE 
            WHEN meetingsAttended > 0 THEN meetingsAttended - 1 
            ELSE 0 
          END
          WHERE id = ?
        `).bind(userId));
      }
    }

    // 执行事务
    await env.DB.batch(batch);

    // 获取最新的报名人数
    const { results: signupCountResult } = await env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM UserMeetings 
      WHERE meetingId = ? AND status = '已报名'
    `).bind(meetingId).all();

    return new Response(JSON.stringify({
      message: action === 'join' ? '成功参与会议' : '已取消参与会议',
      id: meetingId,
      action: action,
      signupCount: signupCountResult[0].count,
      status: newStatus
    }), { headers });

  } catch (error) {
    console.error('Error toggling meeting participation:', error);
    return new Response(JSON.stringify({
      error: '操作失败',
      details: error.message
    }), { status: 500, headers });
  }
}
