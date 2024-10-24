import { getBooks } from './handlers/getBooks.js';
import { addBook } from './handlers/addBook.js';
import { getUsers } from './handlers/getUsers.js';
import { addUser } from './handlers/addUser.js';
import { getMeetings } from './handlers/getMeetings.js'; // 引入处理会议请求的函数
import { handleOptions } from './handlers/handleOptions.js';
import { handleLogin } from './handlers/login.js'; // 引入处理登录请求的函数
import { headers } from './config.js'; // 引入请求头配置

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    console.log(`Received request: ${request.method} ${url.pathname}`);

    if (url.pathname === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    // Handle root path by providing some basic information
    if (url.pathname === "/") {
      console.log("Handling root path");
      return new Response("Welcome to the Adelaide Reading API! Use /api/books, /api/users, or /api/meetings to interact with the data.", {
        headers: headers,
      });
    }

    // Match /api/books or /api/books/ to allow more flexible URL paths
    if (url.pathname.match(/^\/api\/books(\/)?$/)) {
      if (request.method === "OPTIONS") {
        return handleOptions(request);
      } else if (request.method === "GET") {
        return await getBooks(env);
      } else if (request.method === "POST") {
        return await addBook(request, env);
      }
    }

    // Match /api/users or /api/users/ to allow more flexible URL paths
    if (url.pathname.match(/^\/api\/users(\/)?$/)) {
      if (request.method === "OPTIONS") {
        return handleOptions(request);
      } else if (request.method === "GET") {
        return await getUsers(env);
      } else if (request.method === "POST") {
        return await addUser(request, env);
      }
    }

    // Match /api/meetings or /api/meetings/ to allow more flexible URL paths
    if (url.pathname.match(/^\/api\/meetings(\/)?$/)) {
      if (request.method === "OPTIONS") {
        return handleOptions(request);
      } else if (request.method === "GET") {
        return await getMeetings(env);
      }
    }

    console.log("Path not found, returning 404");
    return new Response("Not Found", { status: 404, headers: { "Connection": "keep-alive" } });
  }
};