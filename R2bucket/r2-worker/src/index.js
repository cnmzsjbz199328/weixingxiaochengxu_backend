import { handleFileUpload } from './handleFileUpload.js';
import { handleListFiles } from './handleListFiles.js';
import { handleDeleteFile } from './handleDeleteFile.js';
import { getCorsHeaders } from './corsHeaders.js';

// 允许的文件类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

// 检查文件类型是否允许
function isAllowedFileType(file) {
    return ALLOWED_TYPES.includes(file.type);
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const corsHeaders = getCorsHeaders();

        // 处理 OPTIONS 预检请求
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        let response;
        try {
            // 根据路径和方法处理请求
            if (request.method === 'POST' && path === '/api/upload') {
                // 直接传递请求给 handleFileUpload，不要在这里解析 formData
                response = await handleFileUpload(request, env);
            } else if (request.method === 'GET' && path === '/api/files') {
                response = await handleListFiles(env);
            } else if (request.method === 'GET' && path.startsWith('/api/files/')) {
                const key = path.split('/').pop();
                const object = await env.adelaidereader.get(key);

                if (object === null) {
                    return new Response(
                        JSON.stringify({ error: 'File not found' }), 
                        {
                            status: 404,
                            headers: {
                                ...corsHeaders,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }

                // 设置适当的响应头
                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('etag', object.httpEtag);
                
                // 添加 CORS 头
                Object.entries(corsHeaders).forEach(([key, value]) => {
                    headers.set(key, value);
                });

                return new Response(object.body, { headers });
            } else if (request.method === 'DELETE' && path.startsWith('/api/files/')) {
                // 提取完整的文件路径
                const key = decodeURIComponent(path.replace('/api/files/', ''));
                if (!key) {
                    return new Response(
                        JSON.stringify({ error: 'Invalid file key' }), 
                        { 
                            status: 400, 
                            headers: {
                                ...corsHeaders,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
                response = await handleDeleteFile(key, env);
            } else {
                return new Response(
                    JSON.stringify({ 
                        error: 'Not found',
                        availableEndpoints: {
                            upload: '/api/upload',
                            list: '/api/files',
                            get: '/api/files/:key',
                            delete: '/api/files/:key'
                        }
                    }), 
                    { 
                        status: 404, 
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            // 确保响应有正确的状态码和内容类型
            const responseBody = response.body;
            const responseStatus = response.status || 200;
            const responseHeaders = {
                ...corsHeaders,
                ...response.headers,
                'Content-Type': 'application/json'
            };

            return new Response(responseBody, {
                status: responseStatus,
                headers: responseHeaders
            });

        } catch (error) {
            console.error('Error:', error);
            return new Response(
                JSON.stringify({ 
                    error: 'Internal Server Error',
                    message: error.message 
                }), 
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
    }
};
