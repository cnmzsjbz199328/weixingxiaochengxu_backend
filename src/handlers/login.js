import { headers, corsHeaders } from '../config.js'; // 引入请求头配置

export async function handleLogin(request, env) {
  // OPTIONS 请求交给 index.js 统一处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // 添加环境变量检查
    console.log('Environment check:', {
      hasDB: !!env.DB,
      dbType: typeof env.DB,
    });

    const { emailOrNickName, password } = await request.json();
    
    if (!emailOrNickName || !password) {
      return new Response(JSON.stringify({ 
        error: '缺少登录信息' 
      }), { status: 400, headers });
    }

    try {
      // 查找用户
      console.log('Querying database for user with email or nickName:', emailOrNickName);
      const { results } = await env.DB.prepare(
        "SELECT * FROM Users WHERE (email = ? OR nickName = ?) AND password = ?"
      ).bind(emailOrNickName, emailOrNickName, password).all();

      console.log('Database query results:', results);

      let user;
      if (results.length === 0) {
        return new Response(JSON.stringify({ 
          error: '用户不存在或密码错误' 
        }), { status: 401, headers });
      } else {
        user = results[0];
      }

      // 返回安全的用户信息
      const safeUser = {
        id: user.id,
        nickName: user.nickName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        joinDate: user.joinDate,
        booksRead: user.booksRead,
        meetingsAttended: user.meetingsAttended
      };

      return new Response(JSON.stringify(safeUser), { headers });

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
    
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({ 
      error: '服务器内部错误',
      details: error.message
    }), { status: 500, headers });
  }
}