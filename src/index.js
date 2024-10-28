import { handleLogin } from './handlers/login.js';
import { handleGetUsers } from './handlers/getUsers.js';
import { handleGetBooks } from './handlers/getBooks.js';
import { handleGetMeetings } from './handlers/getMeetings.js';
import { handleGetUserBooks } from './handlers/getUserBooks.js';
import { handleGetUserMeetings } from './handlers/getUserMeetings.js';
import { addUser } from './handlers/register.js';
import { handleUpdateUser } from './handlers/updateUser.js';
import { addBook } from './handlers/addBook.js';
import { addMeeting } from './handlers/addMeeting.js';
import { headers, corsHeaders, optionsHeaders } from './config.js';
import { handleDeleteBook } from './handlers/deleteBook.js';
import { handleDeleteMeeting } from './handlers/deleteMeeting.js';
import { handleToggleUserMeeting } from './handlers/toggleUserMeeting.js';
import { handleAddComment } from './handlers/addComment.js';
import { handleGetBookComments } from './handlers/getBookComments.js';
import { handleGetBookDetail } from './handlers/getBookDetail.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: optionsHeaders
      });
    }

    try {
      // 首先处理根路径
      if (path === '/' || path === '') {
        return new Response(JSON.stringify({
          message: 'Welcome to Adelaide Reading API',
          endpoints: {
            login: '/api/login',
            register: '/api/register',
            updateUser: '/api/update-user',
            users: '/api/users',
            books: '/api/books',
            meetings: '/api/meetings',
            userBooks: '/api/user/books',
            userMeetings: '/api/user/meetings',
            bookComments: '/api/books/:bookId/comments',
            bookDetail: '/api/books/:bookId'
          }
        }), { headers });
      }

      // 处理动态路由
      const bookCommentsMatch = path.match(/^\/api\/books\/(\d+)\/comments$/);
      if (bookCommentsMatch) {
        return handleGetBookComments(request, env);
      }

      const bookDetailMatch = path.match(/^\/api\/books\/(\d+)$/);
      if (bookDetailMatch) {
        return handleGetBookDetail(request, env);
      }

      // 处理用户会议切换
      if (path.match(/^\/api\/user\/meetings\/\d+\/toggle$/)) {
        if (request.method === 'POST') {
          return handleToggleUserMeeting(request, env);
        }
      }

      // 处理静态路由
      switch (path) {
        case '/api/login':
          return handleLogin(request, env);
        case '/api/register':
          return addUser(request, env);
        case '/api/update-user':
          return handleUpdateUser(request, env);
        case '/api/users':
          return handleGetUsers(request, env);
        case '/api/books':
          if (request.method === 'GET') {
            return handleGetBooks(request, env);
          } else if (request.method === 'POST') {
            return addBook(request, env);
          }
          break;
        case '/api/meetings':
          if (request.method === 'GET') {
            return handleGetMeetings(request, env);
          } else if (request.method === 'POST') {
            return addMeeting(request, env);
          }
          break;
        case '/api/user/books':
        case (path.match(/^\/api\/user\/books\/\d+$/) || {}).input:
          if (request.method === 'GET') {
            return handleGetUserBooks(request, env);
          } else if (request.method === 'DELETE') {
            return handleDeleteBook(request, env);
          }
          break;
        case '/api/user/meetings':
        case (path.match(/^\/api\/user\/meetings\/\d+$/) || {}).input:
          if (request.method === 'GET') {
            return handleGetUserMeetings(request, env);
          } else if (request.method === 'DELETE') {
            return handleDeleteMeeting(request, env);
          }
          break;
        case '/api/books/comment':
          if (request.method === 'POST') {
            return handleAddComment(request, env);
          }
          break;
      }

      // 处理 404
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: '请求的路径不存在',
        availableEndpoints: {
          login: '/api/login',
          register: '/api/register',
          updateUser: '/api/update-user',
          users: '/api/users',
          books: '/api/books',
          meetings: '/api/meetings',
          userBooks: '/api/user/books',
          userMeetings: '/api/user/meetings',
          bookComments: '/api/books/:bookId/comments',
          bookDetail: '/api/books/:bookId'
        }
      }), {
        status: 404,
        headers
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        details: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  }
};
