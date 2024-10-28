import { headers } from '../config.js';

export async function handleAddComment(request, env) {
  try {
    const commentData = await request.json();
    const { userId, bookId, content } = commentData;

    // 验证参数
    if (!userId || !bookId || !content) {
      return new Response(JSON.stringify({
        error: '缺少必要参数'
      }), { status: 400, headers });
    }

    // 检查书籍是否存在
    const { results: bookResults } = await env.DB.prepare(`
      SELECT * FROM Books WHERE id = ?
    `).bind(bookId).all();

    if (!bookResults || bookResults.length === 0) {
      return new Response(JSON.stringify({
        error: '书籍不存在'
      }), { status: 404, headers });
    }

    // 检查用户是否已经为这本书增加过阅读计数
    const { results: firstCommentCheck } = await env.DB.prepare(`
      SELECT * FROM Comments 
      WHERE userId = ? AND bookId = ?
      ORDER BY createdAt ASC
      LIMIT 1
    `).bind(userId, bookId).all();

    // 开始数据库事务
    const batch = [];

    // 添加评论
    batch.push(env.DB.prepare(`
      INSERT INTO Comments (userId, bookId, content, createdAt) 
      VALUES (?, ?, ?, datetime('now'))
    `).bind(userId, bookId, content));

    // 更新书籍的评论计数
    batch.push(env.DB.prepare(`
      UPDATE Books 
      SET commentCount = commentCount + 1 
      WHERE id = ?
    `).bind(bookId));

    // 只有在这是用户对这本书的第一条评论时，才增加阅读计数
    if (!firstCommentCheck || firstCommentCheck.length === 0) {
      batch.push(env.DB.prepare(`
        UPDATE Users 
        SET booksRead = booksRead + 1 
        WHERE id = ?
      `).bind(userId));
    }

    await env.DB.batch(batch);

    return new Response(JSON.stringify({
      message: '评论添加成功',
      bookId,
      userId,
      isFirstComment: !firstCommentCheck || firstCommentCheck.length === 0
    }), { headers });

  } catch (error) {
    console.error('Error adding comment:', error);
    return new Response(JSON.stringify({
      error: '添加评论失败',
      details: error.message
    }), { status: 500, headers });
  }
}
