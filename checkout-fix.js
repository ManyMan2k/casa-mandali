/*
 * checkout-fix.js
 * Faz o seletor de variação + botão COMPRAR AGORA funcionarem sem depender da
 * hidratação do React (o site é uma exportação estática espelhada cujo bootstrap
 * client-side não inicializa). Lê window.__CHECKOUT_CONFIG__ injetado em cada
 * página de produto e envia o cliente para /api/checkout com a variação correta.
 */
(function () {
  "use strict";

  var cfg = window.__CHECKOUT_CONFIG__;
  if (!cfg || !cfg.variants || !cfg.variants.length) return;

  var hasAssembly = !!(cfg.assemblyOptions && cfg.assemblyOptions.length);

  var state = {
    variant: cfg.defaultVariant || cfg.variants[0].value,
    assembly: cfg.defaultAssembly || (hasAssembly ? cfg.assemblyOptions[0].value : null),
    qty: 1
  };

  function getVariant() {
    for (var i = 0; i < cfg.variants.length; i++) {
      if (cfg.variants[i].value === state.variant) return cfg.variants[i];
    }
    return cfg.variants[0];
  }

  function checkoutUrl() {
    var v = getVariant();
    if (!v) return "";
    var url = hasAssembly
      ? (v.checkoutUrls && v.checkoutUrls[state.assembly]) || ""
      : v.checkoutUrl || "";
    url = ("" + url).trim();
    // Trava de segurança: nunca enviar o cliente para o domínio da loja original.
    if (!url || url.indexOf("montiermoveis.com") !== -1) return "";
    return url;
  }

  // ---------- quantidade ----------
  var qtyDisplays = [];
  function updateQty() {
    for (var i = 0; i < qtyDisplays.length; i++) qtyDisplays[i].textContent = String(state.qty);
  }
  function setQty(n) {
    state.qty = Math.max(1, n);
    updateQty();
  }
  function wireSteppers() {
    var minusIcons = document.querySelectorAll("svg.lucide-minus");
    for (var i = 0; i < minusIcons.length; i++) {
      var minusBtn = minusIcons[i].closest("button");
      if (!minusBtn) continue;

      // Sobe até o menor ancestral que contenha o botão "+" E o número exibido.
      var container = minusBtn.parentElement, guard = 0, numLeaf = null;
      while (container && guard < 8) {
        var hasPlus = container.querySelector("svg.lucide-plus");
        numLeaf = null;
        var cand = container.querySelectorAll("div,span");
        for (var j = 0; j < cand.length; j++) {
          if (!cand[j].children.length && /^\d+$/.test((cand[j].textContent || "").trim())) {
            numLeaf = cand[j];
            break;
          }
        }
        if (hasPlus && numLeaf) break;
        container = container.parentElement;
        guard++;
      }
      if (!container) continue;
      var plusIcon = container.querySelector("svg.lucide-plus");
      var plusBtn = plusIcon ? plusIcon.closest("button") : null;
      if (!plusBtn) continue;

      if (numLeaf && qtyDisplays.indexOf(numLeaf) === -1) qtyDisplays.push(numLeaf);

      minusBtn.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation(); setQty(state.qty - 1);
      }, true);
      plusBtn.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation(); setQty(state.qty + 1);
      }, true);
    }
    updateQty();
  }

  // ---------- montagem (desmontada/montada) ----------
  var asmNameToValue = {};
  if (hasAssembly) {
    for (var a = 0; a < cfg.assemblyOptions.length; a++) {
      asmNameToValue[(cfg.assemblyOptions[a].name || "").trim().toLowerCase()] = cfg.assemblyOptions[a].value;
    }
  }
  var asmButtons = [];
  function updateAssemblyVisual() {
    for (var i = 0; i < asmButtons.length; i++) {
      var b = asmButtons[i];
      var val = asmNameToValue[(b.textContent || "").trim().toLowerCase()];
      if (val === state.assembly) {
        b.style.borderColor = "#28A745";
        b.style.backgroundColor = "#ecfdf5";
        b.style.color = "#0A0B20";
      } else {
        b.style.borderColor = "rgba(10,11,32,0.1)";
        b.style.backgroundColor = "#ffffff";
      }
    }
  }
  function wireAssembly() {
    if (!hasAssembly) return;
    var btns = document.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || "").trim().toLowerCase();
      if (Object.prototype.hasOwnProperty.call(asmNameToValue, t)) {
        asmButtons.push(btns[i]);
        (function (b) {
          b.addEventListener("click", function (e) {
            e.preventDefault(); e.stopPropagation();
            state.assembly = asmNameToValue[(b.textContent || "").trim().toLowerCase()];
            updateAssemblyVisual();
          }, true);
        })(btns[i]);
      }
    }
    updateAssemblyVisual();
  }

  // ---------- cor ----------
  function wireColor() {
    var sel = document.getElementById("product-variant");
    if (!sel) return;
    if (sel.value) state.variant = sel.value;
    sel.addEventListener("change", function () { state.variant = sel.value; });
  }

  // ---------- comprar ----------
  function wireBuy() {
    var btns = document.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      if (/comprar agora/i.test(btns[i].textContent || "")) {
        btns[i].addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          var url = checkoutUrl();
          if (!url) { window.alert("Esta opção está indisponível no momento."); return; }
          var sep = url.indexOf("?") > -1 ? "&" : "?";
          window.location.href = url + sep + "quantity=" + state.qty;
        }, true);
      }
    }
  }

  // ---------- calcular frete (CEP via ViaCEP, frete grátis fixo) ----------
  function escapeHtml(s) {
    return ("" + s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function wireFrete() {
    var btns = document.querySelectorAll("button");
    var btn = null;
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].textContent || "").trim().toLowerCase() === "consultar") { btn = btns[i]; break; }
    }
    if (!btn) return;

    // sobe até a linha (flex) que contém o input do CEP, depois pega o card pai
    var row = btn, guard = 0;
    while (row && guard < 6) {
      if (row.querySelector && row.querySelector("input")) break;
      row = row.parentElement; guard++;
    }
    if (!row) return;
    var input = row.querySelector('input[type="text"]') || row.querySelector("input");
    if (!input) return;
    // card = container "Calcule o frete" (resultado vai abaixo da linha input+botão)
    var card = row.parentElement || row;

    function render(data, errMsg) {
      var old = card.querySelector("[data-frete-result]");
      if (old) old.parentNode.removeChild(old);
      var wrap = document.createElement("div");
      wrap.setAttribute("data-frete-result", "");
      wrap.style.marginTop = "16px";
      if (errMsg) {
        wrap.innerHTML =
          '<div style="border-radius:8px;background:#fff;padding:12px;font-size:14px;color:#b91c1c;">' +
          escapeHtml(errMsg) + "</div>";
      } else {
        var parts = [];
        if (data.logradouro) parts.push(data.logradouro);
        if (data.bairro) parts.push(data.bairro);
        var line = parts.join(", ");
        var loc = (data.localidade || "") + (data.uf ? " - " + data.uf : "");
        var endereco = line ? line + " - " + loc : loc;
        wrap.style.display = "flex";
        wrap.style.flexDirection = "column";
        wrap.style.gap = "12px";
        wrap.innerHTML =
          '<div style="display:flex;align-items:flex-start;gap:8px;border-radius:8px;background:#fff;padding:12px;font-size:14px;color:rgba(10,11,32,0.75);">' +
            '<span style="flex-shrink:0;display:inline-flex;margin-top:1px;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#28A745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></span>' +
            "<span>" + escapeHtml(endereco) + "</span>" +
          "</div>" +
          '<div style="border-radius:8px;background:#0A0B20;padding:12px;">' +
            '<p style="margin:0;font-weight:800;color:#28A745;font-size:14px;">Frete Grátis - 5 a 8 dias</p>' +
            '<p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);">Envio em até 24hrs após aprovação do pagamento.</p>' +
          "</div>";
      }
      card.appendChild(wrap);
    }

    function consultar() {
      var cep = (input.value || "").replace(/\D/g, "");
      if (cep.length !== 8) { render(null, "Digite um CEP válido (8 dígitos)."); return; }
      var oldText = btn.textContent;
      btn.textContent = "Consultando...";
      btn.disabled = true;
      fetch("https://viacep.com.br/ws/" + cep + "/json/")
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.erro) render(null, "CEP não encontrado. Verifique e tente novamente.");
          else render(data, null);
        })
        .catch(function () { render(null, "Não foi possível consultar o CEP agora."); })
        .then(function () { btn.textContent = oldText; btn.disabled = false; });
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation(); consultar();
    }, true);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); consultar(); }
    });
  }

  function init() {
    wireColor();
    wireAssembly();
    wireSteppers();
    wireBuy();
    wireFrete();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
