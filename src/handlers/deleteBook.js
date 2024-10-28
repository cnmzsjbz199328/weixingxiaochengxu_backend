import { headers } from '../config.js';

export async function handleDeleteBook(request, env) {
  try {
    const url = new URL(request.url);
    const bookId = url.pathname.split('/').pop();
    const userId = url.searchParams.get('userId');

    // 修改获取 bookId 的方式
    // 确保 bookId 是数字
    if (!bookId || isNaN(bookId)) {
      return new Response(JSON.stringify({
        error: '无效的书籍ID'
      }), { status: 400, headers });
    }

    if (!userId) {
      return new Response(JSON.stringify({
        error: '缺少必要参数'
      }), { status: 400, headers });
    }

    // 先检查书籍是否存在且属于该用户
    const { results } = await env.DB.prepare(`
      SELECT * FROM Books 
      WHERE id = ? AND createdBy = ?
    `).bind(bookId, userId).all();

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({
        error: '未找到书籍或无权限删除'
      }), { status: 404, headers });
    }

    // 执行删除操作
    await env.DB.prepare(`
      DELETE FROM Books 
      WHERE id = ? AND createdBy = ?
    `).bind(bookId, userId).run();

    return new Response(JSON.stringify({
      message: '书籍删除成功',
      id: bookId
    }), { headers });

  } catch (error) {
    console.error('Error deleting book:', error);
    return new Response(JSON.stringify({
      error: '删除书籍失败',
      details: error.message
    }), { status: 500, headers });
  }
}
