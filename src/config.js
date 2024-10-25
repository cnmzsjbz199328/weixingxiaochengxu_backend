// CORS 预检请求的响应头
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// 常规请求的响应头
export const headers = {
  ...corsHeaders,
  'Content-Type': 'application/json;charset=UTF-8',
};

// OPTIONS 请求的响应头
export const optionsHeaders = {
  ...corsHeaders,
  'Content-Type': 'text/plain;charset=UTF-8',
  'Content-Length': '0',
};

// 移除不必要的配置
// export const config = {
//   headers,
// };
