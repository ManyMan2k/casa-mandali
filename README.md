# Montier Móveis — Site Completo Minerado

**Data:** 2026-06-20
**URL origem:** https://montiermoveis.com
**Produto-foco:** Sapateira 3 Portas Madeira (`/products/sapateira-3-portas-madeira`)
**Stack:** Next.js (App Router) + Vercel + Zedy Checkout + UTMify

---

## 📦 O que foi baixado (13 MB)

```
montiermoveis.com/
├── index.html                       # Home
├── produtos.html                    # Listagem de produtos
├── sobre-nos.html                   # Institucional
├── products/ (13 páginas de produto) # Todas as páginas de produto
│   ├── sapateira-3-portas-madeira.html   ← PRODUTO-FOCO
│   ├── varal-retratil-max-aco-inox-6-metros.html
│   ├── massageador-pescoco-8-pontos-aquecimento.html
│   ├── cadeira-ergonomica-relax-diretor-tokyo-escritorio.html
│   ├── escrivaninha-135cm-gaveteiro-suspenso-f5-office.html
│   ├── cristaleira-retro-53cm-led-porta-vidro-4-prateleiras-mdf.html
│   ├── painel-ripado-decorativo-mdf-134x250-dalla-costa.html
│   ├── rack-com-painel-180cm-4-portas-pes-metal.html
│   ├── painel-com-rack-140cm-led-porta-correr-mdf.html
│   ├── painel-home-theater-180-ripado-100-mdf.html
│   ├── balcao-aparador-industrial-89cm-2-portas-mdf.html
│   ├── balcao-buffet-bar-multiuso-2-portas-tela-sintetica.html
│   └── estante-sala-prateleiras-2-gavetas-dalla-costa-100-mdf.html
├── (páginas institucionais)
│   ├── politicas-de-privacidade.html
│   ├── politicas-de-reembolso.html
│   ├── politica-de-envio.html
│   ├── termos-e-condicoes.html
│   ├── trocas-e-devolucoes.html
│   ├── aviso-legal.html
├── products/{slug}/*.webp           # 81 imagens de produto + reviews
├── products/massageador/massador.mp4 # Vídeo do produto
├── _next/static/chunks/*.js (13)    # Bundle JS Next.js
├── _next/static/media/*.woff2       # Fontes
├── hero.webp, heromobile.webp, sala.webp, logodaloja.webp
├── (ícones de pagamento) visa, master, amex, elo, hipercard, dinners
└── _hidden/                         # robots/sitemap/ads (todos 404)
```

---

## 🔑 INTEGRAÇÃO ZEDY CHECKOUT (o coração do pedido)

### Padrão de URL de checkout

```
https://seguro.montiermoveis.com/api/public/shopify?product={PRODUCT_ID}&store=31824
```

| Parâmetro | Valor | Significado |
|-----------|-------|-------------|
| Domínio checkout | `seguro.montiermoveis.com` | Subdomínio dedicado (Zedy white-label) |
| Endpoint | `/api/public/shopify` | API pública Zedy de criação de checkout |
| `store` | `31824` | ID da loja no Zedy |
| `product` | ex: `3182469579426` | ID do produto/variação (Shopify-style) |

### Como funciona

1. Cada **variação** do produto (cor × montada/desmontada) tem um `checkoutUrl` próprio
2. O frontend monta o objeto `checkoutUrls: { desmontada: "...", montada: "..." }` por variação
3. Ao clicar em comprar → redireciona pro `seguro.montiermoveis.com` (Zedy renderiza o checkout)

### Estrutura de dados da variação (extraída do HTML)

```json
{
  "value": "branco",
  "image": "/products/sapateira/sapateira-branco.webp",
  "checkoutUrls": {
    "desmontada": "https://seguro.montiermoveis.com/api/public/shopify?product=3182469579426&store=31824",
    "montada":    "https://seguro.montiermoveis.com/api/public/shopify?product=31824565381..&store=31824"
  }
}
```

## 💰 Produto-foco: Sapateira 3 Portas Madeira

| Dado | Valor |
|------|-------|
| Preço | **R$ 187,90** |
| Parcelado | 6x de R$ 31,32 |
| Variações | 7 cores (branco, marrom, preto, cinza, creme, madeira) × 2 (montada/desmontada) |
| Imagens | 10 fotos produto + 4 reviews + 1 medidas |
| Checkout | Zedy via `seguro.montiermoveis.com` |

---

## 🧩 Stack técnica confirmada

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js (App Router, RSC, Turbopack) |
| Hosting | Vercel (`server: Vercel`, `x-nextjs-prerender`) |
| Checkout | **Zedy** (white-label em `seguro.{domínio}`) |
| Tracking | UTMify (pixel Google via `window.googlePixelId`) |
| Pagamento | Cartão (visa/master/amex/elo/hipercard/dinners) + provável PIX |
| Imagens | WebP otimizado (Next/Image) |

---

## 📝 Observações estratégicas

- **Modelo:** loja de móveis dropship/nacional com checkout transparente Zedy white-label (`seguro.` no próprio domínio = mais confiança que checkout externo genérico).
- **UTMify igual ao teu setup:** usam o mesmo `pixel-google.js` + `window.googlePixelId` que tu usa nas tuas landings — operador BR do mesmo ecossistema.
- **WAF no checkout:** proteção anti-scraping/anti-clonagem no subdomínio de pagamento. Sinal de operação madura (não é amador).
- **Catálogo amplo:** 13 produtos (móveis MDF + massageador + varal) — mix de móveis pesados e produtos de impulso.
