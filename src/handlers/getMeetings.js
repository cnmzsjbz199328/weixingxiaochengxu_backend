import { createMeetingsTableIfNotExists } from './createMeetingsTableIfNotExists.js';
import { headers } from '../config.js'; // 引入请求头配置

export async function getMeetings(env) {
  await createMeetingsTableIfNotExists(env); // 确保表存在
  try {
    console.log("Preparing to query the database...");
    const { results } = await env.DB.prepare(
      "SELECT id, name, date, time, location, createdBy, createdAt, isPublic FROM Meetings ORDER BY id DESC LIMIT 10"
    ).all();
    console.log("Query successful, results:", results);
    
    return new Response(JSON.stringify({ results }), {
      headers: headers, // 使用统一的请求头
    });
  } catch (error) {
    console.error("Error querying the database:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: headers, // 使用统一的请求头
    });
  }
}