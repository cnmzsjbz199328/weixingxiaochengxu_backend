import { headers } from '../config.js';

export function handleOptions(request) {
  return new Response(null, { headers });
}