import { headers } from '../config.js';

export async function handleGetBookComments(request, env) {
  try {
    const url = new URL(request.url);
    const bookId = url.pathname.match(/\/api\/books\/(\d+)\/comments/)[1];

    if (!bookId || isNaN(bookId)) {
      return new Response(JSON.stringify({
        error: '无效的书籍ID'
      }), { status: 400, headers });
    }

    // 检查书籍是否存在
    const { results: bookExists } = await env.DB.prepare(`
      SELECT id FROM Books WHERE id = ?
    `).bind(bookId).all();

    if (!bookExists || bookExists.length === 0) {
      return new Response(JSON.stringify({
        error: '书籍不存在'
      }), { status: 404, headers });
    }

    // 获取书籍的所有评论，包括评论者信息
    const { results } = await env.DB.prepare(`
      SELECT 
        Comments.id,
        Comments.content,
        Comments.createdAt,
        Comments.userId,
        Users.nickName as userNickName,
        Users.avatarUrl as userAvatarUrl
      FROM Comments
      LEFT JOIN Users ON Comments.userId = Users.id
      WHERE Comments.bookId = ?
      ORDER BY Comments.createdAt DESC
    `).bind(bookId).all();

    return new Response(JSON.stringify({
      bookId: bookId,
      comments: results
    }), { headers });

  } catch (error) {
    console.error('Error fetching book comments:', error);
    return new Response(JSON.stringify({
      error: '获取评论失败',
      details: error.message
    }), { status: 500, headers });
  }
}
