# Maderno Móveis — Loja (home + oferta da Sapateira)

Projeto com duas páginas:

- **`index.html`** — **Home / vitrine** (estilo montiermoveis): hero, faixa de benefícios,
  grade com os 13 produtos (imagens e preços reais do montier) e rodapé. A Sapateira é
  destacada como "MAIS VENDIDO" e leva à página de oferta.
- **`produto-sapateira.html`** — **Página de oferta** da *Sapateira Fina de Madeira — Com 3 Portas*
  (estrutura madenoxbrasil: hero/galeria com troca de cor → descrição → cores → benefícios →
  "por que tão barato" → reviews → FAQ → CTA → footer → sticky bar). Preço R$ 129,90.

Marca: **Maderno Móveis** · imagens do montiermoveis.

## Como abrir
VS Code → **Go Live** (Live Server), ou:
```bash
cd ~/Documents/OFERTAS/sapateira-fina && python3 -m http.server 8080
```

## ⚠️ Configurar antes de publicar (placeholders)
1. **Checkout** — em `index.html`, troque `https://CHECKOUT-DA-SUA-LOJA.com/checkout` pela URL real (função `goToCheckout`). Os UTMs já são repassados automaticamente.
2. **Pixel UTMify** — troque `COLOQUE_SEU_PIXEL_ID_AQUI` pelo `window.googlePixelId` desta oferta. ⚠️ NÃO reutilize o pixel de outra landing (evento iria pra conta errada).
3. **Marca/Logo** — hoje usa o texto "MÓVEIS PREMIUM" no header e footer. Troque pela sua marca/logo.
4. **Footer** — e-mail, razão social e endereço estão como exemplo.
5. **Preço** — R$ 187,90 (de R$ 374,90, -50%, 6x R$ 31,33). Ajuste se necessário.

## Estrutura
- `index.html` — página completa (HTML + CSS inline + JS inline: galeria, sticky bar, countdown).
- `images/` — 20 imagens da sapateira (produto, cores, medidas, 8 reviews) baixadas do montiermoveis.

## O que foi adaptado do template
- Seletor de veículo → **seletor de cor + montagem**.
- Seção de vídeos (tapete) → **galeria de cores** + descrição com imagens (não havia vídeos).
- Cópia, specs, reviews, FAQ e CTA reescritos para a sapateira.
