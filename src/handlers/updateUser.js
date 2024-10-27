import { headers } from '../config.js';

export async function handleUpdateUser(request, env) {
  try {
    const userData = await request.json();
    const { id, nickName, avatarUrl, email } = userData;

    if (!id) {
      return new Response(JSON.stringify({
        error: '缺少用户ID'
      }), { status: 400, headers });
    }

    console.log('Updating user:', userData);

    // 更新用户信息
    const result = await env.DB.prepare(`
      UPDATE Users 
      SET nickName = COALESCE(?, nickName),
          avatarUrl = COALESCE(?, avatarUrl),
          email = COALESCE(?, email)
      WHERE id = ?
      RETURNING *
    `).bind(
      nickName,
      avatarUrl,
      email,
      id
    ).all();

    if (!result.results || result.results.length === 0) {
      return new Response(JSON.stringify({
        error: '用户不存在'
      }), { status: 404, headers });
    }

    // 返回更新后的用户信息
    const updatedUser = {
      id: result.results[0].id,
      nickName: result.results[0].nickName,
      avatarUrl: result.results[0].avatarUrl,
      email: result.results[0].email,
      joinDate: result.results[0].joinDate,
      booksRead: result.results[0].booksRead,
      meetingsAttended: result.results[0].meetingsAttended
    };

    return new Response(JSON.stringify(updatedUser), { headers });

  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({
      error: '更新用户信息失败',
      details: error.message
    }), { status: 500, headers });
  }
}