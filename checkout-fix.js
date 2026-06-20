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

  function init() {
    wireColor();
    wireAssembly();
    wireSteppers();
    wireBuy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
