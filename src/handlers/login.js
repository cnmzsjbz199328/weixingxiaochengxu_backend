import { headers } from '../config.js'; // 引入请求头配置

const WECHAT_APPID = 'your_wechat_appid';
const WECHAT_SECRET = 'your_wechat_secret';

export async function handleLogin(request, env) {
  const { code, nickName } = await request.json();

  // 向微信服务器请求 openid 和 session_key
  const wxResponse = await fetch(`https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`);
  const wxData = await wxResponse.json();
  console.log("从 WeChat API 获取的数据:", wxData);

  if (wxData.errcode) {
    console.error("从 WeChat API 获取 openid 失败，错误信息:", wxData.errmsg);
    return new Response(JSON.stringify({ error: `Failed to get openid: ${wxData.errmsg}` }), { status: 400, headers });
  }

  const { openid, session_key } = wxData;

  // 在数据库中查找或创建用户
  const { results } = await env.DB.prepare(
    "SELECT * FROM Users WHERE openid = ?"
  ).bind(openid).all();

  let user;
  if (results.length === 0) {
    // 创建新用户
    const result = await env.DB.prepare(
      "INSERT INTO Users (openid, nickName, avatarUrl, joinDate, booksRead, meetingsAttended) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(openid, nickName || 'New User', '', new Date().toISOString(), 0, 0).run();

    if (result.success) {
      user = {
        id: result.lastRowId,
        openid,
        nickName: nickName || 'New User',
        avatarUrl: '',
        joinDate: new Date().toISOString(),
        booksRead: 0,
        meetingsAttended: 0
      };
    } else {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), { status: 500, headers });
    }
  } else {
    user = results[0];
  }

  // 返回用户信息
  return new Response(JSON.stringify(user), {
    headers,
  });
}