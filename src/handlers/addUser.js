import { createUsersTableIfNotExists } from './createUsersTableIfNotExists.js';
import { headers } from '../config.js'; // 引入请求头配置

export async function addUser(request, env) {
  await createUsersTableIfNotExists(env); // 确保表存在
  try {
    const userData = await request.json();
    console.log("Received user data:", userData);

    const { email, nickName, password } = userData;

    if (!email || !nickName || !password) {
      return new Response(JSON.stringify({ 
        error: '缺少注册信息' 
      }), { status: 400, headers });
    }

    // 检查用户是否已存在
    const { results } = await env.DB.prepare(
      "SELECT * FROM Users WHERE email = ? OR nickName = ?"
    ).bind(email, nickName).all();

    if (results.length > 0) {
      // 用户已存在，返回错误信息
      console.log("User already exists with email or nickName");
      return new Response(JSON.stringify({ 
        error: '用户已存在' 
      }), { status: 409, headers });
    }

    // 用户不存在，创建新用户
    console.log("Creating new user");
    const result = await env.DB.prepare(
      `INSERT INTO Users (email, nickName, password, avatarUrl, joinDate, booksRead, meetingsAttended) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      email,
      nickName,
      password,
      userData.avatarUrl || '',
      new Date().toISOString(),
      0,
      0
    ).run();

    if (result.success) {
      const newUser = {
        id: result.lastRowId,
        email: email,
        nickName: nickName,
        avatarUrl: userData.avatarUrl || '',
        joinDate: new Date().toISOString(),
        booksRead: 0,
        meetingsAttended: 0
      };
      console.log("New user created:", newUser);
      return new Response(JSON.stringify(newUser), {
        headers
      });
    } else {
      throw new Error("Failed to create new user");
    }
  } catch (error) {
    console.error("Error in addUser:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}