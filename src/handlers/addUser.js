import { createUsersTableIfNotExists } from './createUsersTableIfNotExists.js';
import { headers } from '../config.js'; // 引入请求头配置

export async function addUser(request, env) {
  await createUsersTableIfNotExists(env); // 确保表存在
  try {
    const userData = await request.json();
    console.log("Received user data:", userData);

    // 检查用户是否已存在
    const { results } = await env.DB.prepare(
      "SELECT * FROM Users WHERE openid = ?"
    ).bind(userData.openid).all();

    if (results.length > 0) {
      // 用户已存在，返回现有用户信息
      console.log("User already exists, returning existing user data");
      return new Response(JSON.stringify(results[0]), {
        headers
      });
    }

    // 用户不存在，创建新用户
    console.log("Creating new user");
    const result = await env.DB.prepare(
      `INSERT INTO Users (openid, nickName, avatarUrl, joinDate, booksRead, meetingsAttended) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      userData.openid,
      userData.nickName || 'New User',
      userData.avatarUrl || '',
      new Date().toISOString(),
      0,
      0
    ).run();

    if (result.success) {
      const newUser = {
        id: result.lastRowId,
        openid: userData.openid,
        nickName: userData.nickName || 'New User',
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