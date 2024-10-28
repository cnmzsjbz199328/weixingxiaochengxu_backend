var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/handleFileUpload.js
async function handleFileUpload(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return {
        status: 400,
        body: JSON.stringify({ error: 'No file uploaded' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // 检查文件类型
    if (!file.type) {
      return {
        status: 400,
        body: JSON.stringify({ error: 'File type not detected' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // 使用原始文件名，但确保文件名是安全的
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2Key = `picture/${Date.now()}-${fileName}`;

    // 获取文件数据
    const fileData = await file.arrayBuffer();

    // 上传到 R2
    await env.adelaidereader.put(r2Key, fileData, {
      httpMetadata: {
        contentType: file.type,
      }
    });
    
    // 构建 R2.dev URL
    const r2Url = `https://pub-ecb3f89848ab43e9994824d78aadd3c2.r2.dev/${r2Key}`;
    console.log("File uploaded to R2 with key:", r2Key);

    return {
      status: 200,
      body: JSON.stringify({ 
        message: 'File uploaded successfully', 
        key: r2Key,
        url: r2Url,
        type: file.type,
        size: fileData.byteLength
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      status: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
__name(handleFileUpload, "handleFileUpload");

// src/handleListFiles.js
async function handleListFiles(env) {
  try {
    const list = await env.adelaidereader.list({ prefix: 'picture/' });
    
    const filesWithUrls = list.objects.map(obj => ({
      ...obj,
      url: `https://pub-ecb3f89848ab43e9994824d78aadd3c2.r2.dev/${obj.key}`
    }));

    return {
      status: 200,
      body: JSON.stringify(filesWithUrls),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error("Error listing files:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
__name(handleListFiles, "handleListFiles");

// src/handleDeleteFile.js
async function handleDeleteFile(key, env) {
  try {
    // 确保 key 是完整的路径
    const fullKey = key.startsWith('picture/') ? key : `picture/${key}`;
    
    // 先检查文件是否存在
    const object = await env.adelaidereader.get(fullKey);
    if (!object) {
      return {
        status: 404,
        body: JSON.stringify({ 
          error: 'File not found',
          key: fullKey
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // 执行删除操作
    await env.adelaidereader.delete(fullKey);
    console.log("File deleted from R2 with key:", fullKey);

    return {
      status: 200,
      body: JSON.stringify({ 
        message: 'File deleted successfully',
        key: fullKey
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      status: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        key: key
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
__name(handleDeleteFile, "handleDeleteFile");

// src/corsHeaders.js
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
__name(getCorsHeaders, "getCorsHeaders");

// 允许的文件类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

// 检查文件类型是否允许
function isAllowedFileType(file) {
  return ALLOWED_TYPES.includes(file.type);
}
__name(isAllowedFileType, "isAllowedFileType");

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = getCorsHeaders();

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    let response;
    try {
      if (request.method === "POST" && path === "/api/upload") {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!isAllowedFileType(file)) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid file type', 
              allowedTypes: ALLOWED_TYPES 
            }), 
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        response = await handleFileUpload(request, env);
      } else if (request.method === "GET" && path === "/api/files") {
        response = await handleListFiles(env);
      } else if (request.method === "DELETE" && path.startsWith("/api/files/")) {
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

      return new Response(response.body, {
        status: response.status,
        headers: {
          ...corsHeaders,
          ...response.headers
        }
      });
    } catch (error) {
      console.error("Error:", error);
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

export { src_default as default };
