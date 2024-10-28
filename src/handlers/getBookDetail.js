import { headers } from '../config.js';

export async function handleGetBookDetail(request, env) {
  try {
    const url = new URL(request.url);
    const bookId = url.pathname.match(/\/api\/books\/(\d+)$/)[1];
    const userId = url.searchParams.get('userId');

    console.log('Fetching book detail:', { bookId, userId });

    if (!bookId || isNaN(bookId)) {
      return new Response(JSON.stringify({
        error: '无效的书籍ID'
      }), { status: 400, headers });
    }

    // 获取书籍基本信息和评论数量
    const { results: books } = await env.DB.prepare(`
      SELECT 
        b.id,
        b.name,
        b.author,
        b.abstract,
        b.commentCount
      FROM Books b
      WHERE b.id = ?
    `).bind(bookId).all();

    if (!books || books.length === 0) {
      return new Response(JSON.stringify({
        error: '书籍不存在'
      }), { status: 404, headers });
    }

    console.log('Book detail found:', books[0]);

    return new Response(JSON.stringify(books[0]), { headers });

  } catch (error) {
    console.error('Error fetching book detail:', error);
    return new Response(JSON.stringify({
      error: '获取书籍详情失败',
      details: error.message
    }), { status: 500, headers });
  }
}
