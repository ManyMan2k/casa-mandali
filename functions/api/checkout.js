export async function onRequestGet(context) {
  const { request, env } = context;
  const token = env.ZEDY_TOKEN;
  const storeId = env.ZEDY_STORE_ID;

  if (!token || !storeId) {
    return new Response("Credenciais Zedy não configuradas", { status: 500 });
  }

  const url = new URL(request.url);
  const variantId = url.searchParams.get("variantId");
  const quantity = Number(url.searchParams.get("quantity")) || 1;

  if (!variantId) {
    return new Response("variantId obrigatório", { status: 400 });
  }

  const zedyRes = await fetch("https://app.zedy.com.br/api/loja/v1/cart/create-checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Store-Id": String(storeId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items: [{ variantId: Number(variantId), quantity }] }),
  });

  const data = await zedyRes.json();

  if (!zedyRes.ok) {
    return new Response(`Erro ao criar checkout: ${JSON.stringify(data)}`, { status: zedyRes.status });
  }

  const checkoutUrl = data.checkout_direct_url || data.checkoutUrl;
  if (!checkoutUrl) {
    return new Response("Checkout indisponível", { status: 502 });
  }

  return Response.redirect(checkoutUrl, 302);
}
