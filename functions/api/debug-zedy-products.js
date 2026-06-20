export async function onRequestGet(context) {
  const { env } = context;
  const token = env.ZEDY_TOKEN;
  const storeId = env.ZEDY_STORE_ID;

  if (!token || !storeId) {
    return new Response(JSON.stringify({ error: "ZEDY_TOKEN ou ZEDY_STORE_ID não configurados" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch("https://app.zedy.com.br/api/loja/v1/products?page=1&per_page=50", {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Store-Id": String(storeId),
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
