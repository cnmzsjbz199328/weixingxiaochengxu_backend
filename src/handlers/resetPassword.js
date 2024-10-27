import bcrypt from 'bcryptjs'; // 添加 bcrypt 导入
import { headers, corsHeaders } from '../config.js'; // 引入请求头配置

export async function handleResetPassword(request, env) {
  // OPTIONS 请求交给 index.js 统一处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const requestData = await request.json();
    const { email, newPassword } = requestData;

    if (!email || !newPassword) {
      return new Response(JSON.stringify({ 
        error: '缺少邮箱或新密码' 
      }), { status: 400, headers });
    }

    // 检查邮箱是否已经被注册
    console.log('Querying database for user with email:', email);
    const { results } = await env.DB.prepare(
      "SELECT * FROM Users WHERE email = ?"
    ).bind(email).all();

    console.log('Database query results:', results);

    if (results.length === 0) {
      return new Response(JSON.stringify({ 
        error: '用户不存在' 
      }), { status: 404, headers });
    }

    // 对新密码进行哈希加密
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    console.log("Updating password for email:", email);
    const result = await env.DB.prepare(
      "UPDATE Users SET password = ? WHERE email = ?"
    ).bind(hashedPassword, email).run();

    console.log('Update result:', result);

    if (!result.success) {
      throw new Error('Failed to update password: ' + JSON.stringify(result));
    }

    return new Response(JSON.stringify({ message: '密码更新成功' }), { headers });

  } catch (error) {
    console.error('Reset password error:', {
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