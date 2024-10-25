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

    const { code } = await request.json();
    
    if (!code) {
      return new Response(JSON.stringify({ 
        error: '缺少登录码' 
      }), { status: 400, headers });
    }

    let openid;
    
    // 测试模式：如果 code 以 'mock_' 开头，使用模拟数据
    if (code.startsWith('mock_')) {
      openid = code;
      console.log('Using mock openid:', openid);
    } else {
      // 正式环境：请求微信 API
      const WECHAT_APPID = env.WECHAT_APPID;
      const WECHAT_SECRET = env.WECHAT_SECRET;
      
      const wxResponse = await fetch(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`
      );
      
      const wxData = await wxResponse.json();
      
      if (wxData.errcode) {
        console.error("微信API错误:", wxData.errmsg);
        return new Response(JSON.stringify({ 
          error: '微信登录验证失败' 
        }), { status: 401, headers });
      }
      
      openid = wxData.openid;
    }

    try {
      // 查找用户
      console.log('Querying database for user with openid:', openid);
      const { results } = await env.DB.prepare(
        "SELECT * FROM Users WHERE openid = ?"
      ).bind(openid).all();

      console.log('Database query results:', results);

      let user;
      if (results.length === 0) {
        // 创建新用户
        console.log("Creating new user for openid:", openid);
        const result = await env.DB.prepare(
          `INSERT INTO Users (
            openid, nickName, avatarUrl, joinDate, 
            booksRead, meetingsAttended
          ) VALUES (?, ?, ?, datetime('now'), 0, 0)`
        ).bind(
          openid,
          '新用户',
          ''
        ).run();

        console.log('Insert result:', result);

        if (!result.success) {
          throw new Error('Failed to create user: ' + JSON.stringify(result));
        }

        user = {
          id: result.lastRowId,
          openid: openid,
          nickName: '新用户',
          avatarUrl: '',
          joinDate: new Date().toISOString(),
          booksRead: 0,
          meetingsAttended: 0
        };
      } else {
        user = results[0];
      }

      // 返回安全的用户信息
      const safeUser = {
        id: user.id,
        nickName: user.nickName,
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
