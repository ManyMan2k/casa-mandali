export async function onRequestPost(context) {
  const { request, env } = context;

  const ZEDY_TOKEN = env.ZEDY_TOKEN;
  const ZEDY_STORE_ID = env.ZEDY_STORE_ID;

  if (!ZEDY_TOKEN || !ZEDY_STORE_ID) {
    return new Response(JSON.stringify({ error: "Credenciais não configuradas" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { variantId, quantity = 1 } = body;

  if (!variantId) {
    return new Response(JSON.stringify({ error: "variantId obrigatório" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const zedyRes = await fetch("https://app.zedy.com.br/api/loja/v1/cart/create-checkout", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ZEDY_TOKEN}`,
      "X-Store-Id": ZEDY_STORE_ID,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ items: [{ variantId: Number(variantId), quantity }] }),
  });

  const data = await zedyRes.json();

  if (!zedyRes.ok) {
    return new Response(JSON.stringify({ error: "Erro ao criar checkout", detail: data }), {
      status: zedyRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const checkoutUrl = data.checkout_direct_url || data.checkoutUrl;

  return new Response(JSON.stringify({ checkoutUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
