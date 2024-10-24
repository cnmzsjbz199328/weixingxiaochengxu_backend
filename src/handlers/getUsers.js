import { createUsersTableIfNotExists } from './createUsersTableIfNotExists.js';
import { headers } from '../config.js'; // 引入请求头配置

export async function getUsers(env) {
  await createUsersTableIfNotExists(env);
  try {
    console.log("Preparing to query the database...");
    const { results } = await env.DB.prepare(
      "SELECT id, openid, nickName, avatarUrl, joinDate, booksRead, meetingsAttended FROM Users ORDER BY id DESC LIMIT 10"
    ).all();
    console.log("Query successful, results:", results);

    return new Response(JSON.stringify({ results }), {
      headers: headers,
    });
  } catch (error) {
    console.error("Error querying the database:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: headers,
    });
  }
}