const EXT_TO_MIME = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export async function onRequest(context) {
  const response = await context.next();

  const path = new URL(context.request.url).pathname;
  const atIndex = path.indexOf("@");
  if (atIndex === -1) return response;

  const beforeAt = path.slice(0, atIndex);
  const dotIndex = beforeAt.lastIndexOf(".");
  if (dotIndex === -1) return response;

  const mime = EXT_TO_MIME[beforeAt.slice(dotIndex).toLowerCase()];
  if (!mime) return response;

  const headers = new Headers(response.headers);
  headers.set("Content-Type", mime);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
