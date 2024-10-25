import { handleLogin } from './handlers/login.js';
import { handleGetUsers } from './handlers/getUsers.js';
import { handleGetBooks } from './handlers/getBooks.js';
import { handleGetMeetings } from './handlers/getMeetings.js';
import { headers, optionsHeaders } from './config.js';

export default {
  async fetch(request, env, ctx) {
    // 解析请求 URL
    const url = new URL(request.url);
    console.log(`Received request: ${request.method} ${url.pathname}`);
    
    // 统一处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: optionsHeaders
      });
    }

    try {
      // 处理根路径
      if (url.pathname === '/' || url.pathname === '') {
        return new Response(JSON.stringify({
          message: 'Welcome to Adelaide Reading API',
          endpoints: {
            login: '/api/login',
            users: '/api/users',
            books: '/api/books',
            meetings: '/api/meetings'
          }
        }), { headers });
      }

      // API 路由处理
      switch(url.pathname) {
        case '/api/login':
          return handleLogin(request, env);
        case '/api/users':
          return handleGetUsers(request, env);
        case '/api/books':
          return handleGetBooks(request, env);
        case '/api/meetings':
          return handleGetMeetings(request, env);
        default:
          return new Response(JSON.stringify({ 
            error: 'Not Found',
            message: '请求的路径不存在',
            availableEndpoints: {
              login: '/api/login',
              users: '/api/users',
              books: '/api/books',
              meetings: '/api/meetings'
            }
          }), {
            status: 404,
            headers
          });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        details: error.message 
      }), {
        status: 500,
        headers
      });
    }
  }
};
