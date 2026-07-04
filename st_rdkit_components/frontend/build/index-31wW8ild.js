const j = ":host,:root,#st-rdkit-components-root{color-scheme:light dark;--src-primary: var(--st-primary-color, #ff4b4b);--src-text: var(--text-color, #262730);--src-muted: color-mix(in srgb, var(--src-text) 62%, transparent);--src-bg: var(--background-color, #ffffff);--src-panel: var(--secondary-background-color, #f6f7f9);--src-card-bg: #ffffff;--src-border: color-mix(in srgb, var(--src-text) 28%, transparent);--src-card-border: color-mix(in srgb, var(--src-text) 34%, transparent);--src-error: #b42318}*{box-sizing:border-box}body{margin:0;color:var(--src-text);background:transparent;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}button{font:inherit}.src-panel{width:100%;color:var(--src-text)}.src-mol-svg,.src-detail,.src-grid-panel{display:flex;flex-direction:column;gap:.75rem}.src-mol-header{display:flex;justify-content:space-between;gap:.75rem}.src-title{font-size:1.05rem;font-weight:650;line-height:1.3}.src-id,.src-smiles{color:var(--src-muted);font-size:.82rem;line-height:1.45;overflow-wrap:anywhere}.src-mol-body,.src-detail-svg,.src-card-svg{display:grid;place-items:center;min-height:12rem;border:1px solid var(--src-border, #d0d4dc);border-radius:8px;background:var(--src-bg);overflow:hidden}.src-svg-wrap{width:100%;max-width:100%;display:grid;place-items:center;padding:.6rem}.src-svg-wrap svg{display:block;max-width:100%;height:auto}.src-placeholder,.src-loading{color:var(--src-muted);padding:1rem;text-align:center}.src-error{display:flex;flex-direction:column;gap:.25rem;width:100%;padding:.75rem;color:var(--src-error);background:color-mix(in srgb,var(--src-error) 10%,transparent);border:1px solid color-mix(in srgb,var(--src-error, #b42318) 34%,transparent);border-radius:8px;overflow-wrap:anywhere}.src-actions{display:flex;flex-wrap:wrap;gap:.45rem;align-items:center}.src-button{-webkit-appearance:none;-moz-appearance:none;appearance:none;min-height:2rem;padding:.35rem .7rem;border-radius:6px;border:1px solid var(--src-border, #d0d4dc);color:var(--src-text, #262730);background:var(--src-bg, #ffffff);cursor:pointer}.src-button:hover{border-color:var(--src-primary, #ff4b4b)}.src-button-small{min-height:1.8rem;padding:.25rem .5rem;font-size:.78rem}.src-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(var(--src-grid-card-min-width, 180px),1fr));gap:.75rem;align-items:stretch}.src-card{position:relative;display:flex;min-width:0;flex-direction:column;gap:.55rem;padding:.65rem;border:2px solid var(--src-card-border, #b8bec9);border-radius:8px;background:var(--src-card-bg, #ffffff);cursor:pointer;transition:border-color .12s ease,background-color .12s ease,box-shadow .12s ease,transform .12s ease}.src-card:hover{border-color:color-mix(in srgb,var(--src-primary, #ff4b4b) 55%,var(--src-border, #d0d4dc));background:var(--src-card-bg, #ffffff)}.src-card:focus-visible{outline:3px solid color-mix(in srgb,var(--src-primary, #ff4b4b) 34%,transparent);outline-offset:2px}.src-card.is-selected{border-color:var(--src-primary, #ff4b4b);background:var(--src-card-bg, #ffffff);box-shadow:0 4px 14px color-mix(in srgb,var(--src-primary, #ff4b4b) 10%,transparent)}.src-card-svg{min-height:var(--src-grid-svg-min-height, 8rem);border:0;background:var(--src-bg, #ffffff)}.src-card-title{font-weight:650;line-height:1.3;overflow-wrap:anywhere}.src-card-text{display:flex;min-width:0;flex-direction:column;gap:.25rem}.src-meta,.src-field-list{display:grid;gap:.35rem;margin:0}.src-meta>div,.src-field-list>div{display:grid;grid-template-columns:minmax(4rem,.35fr) minmax(0,1fr);gap:.55rem;min-width:0}.src-meta dt,.src-field-list dt{color:var(--src-muted);font-size:.78rem}.src-meta dd,.src-field-list dd{margin:0;min-width:0;overflow-wrap:anywhere}.src-detail-main{display:grid;grid-template-columns:minmax(14rem,1.1fr) minmax(14rem,.9fr);gap:1rem;align-items:start}.src-detail-svg{min-height:18rem}.src-detail-info{display:flex;min-width:0;flex-direction:column;gap:.75rem}@media (max-width: 640px){.src-grid,.src-detail-main{grid-template-columns:1fr}}";
let k = null;
function A(t) {
  const e = document.querySelector(
    `script[data-rdkit-src="${t}"]`
  );
  return (e == null ? void 0 : e.dataset.loaded) === "true" ? Promise.resolve() : e ? new Promise((r, s) => {
    e.addEventListener("load", () => r(), { once: !0 }), e.addEventListener("error", () => s(new Error(`Failed to load ${t}`)), {
      once: !0
    });
  }) : new Promise((r, s) => {
    const i = document.createElement("script");
    i.src = t, i.async = !0, i.dataset.rdkitSrc = t, i.addEventListener(
      "load",
      () => {
        i.dataset.loaded = "true", r();
      },
      { once: !0 }
    ), i.addEventListener(
      "error",
      () => s(new Error(`Failed to load bundled RDKit.js asset: ${t}`)),
      { once: !0 }
    ), document.head.appendChild(i);
  });
}
function K() {
  return k || (k = (async () => {
    const t = new URL("./RDKit_minimal.js", import.meta.url).toString(), e = new URL("./RDKit_minimal.wasm", import.meta.url).toString();
    if (await A(t), typeof window.initRDKitModule != "function")
      throw new Error(
        "RDKit.js was loaded, but window.initRDKitModule was not found. Check that RDKit_minimal.js matches the expected RDKit.js minimal build."
      );
    return await window.initRDKitModule({
      locateFile: (r) => r.endsWith(".wasm") ? e : r
    });
  })()), k;
}
function T(t) {
  if (!(typeof t != "number" || !Number.isFinite(t) || t <= 0))
    return Math.round(t);
}
function q(t, e, r) {
  if (!e && !r)
    return t;
  const n = new DOMParser().parseFromString(t, "image/svg+xml").querySelector("svg");
  if (!n)
    return t;
  const d = n.getAttribute("width"), c = n.getAttribute("height"), v = e ?? Number.parseFloat(d ?? ""), a = r ?? Number.parseFloat(c ?? "");
  return e && n.setAttribute("width", String(e)), r && n.setAttribute("height", String(r)), !n.hasAttribute("viewBox") && Number.isFinite(v) && Number.isFinite(a) && n.setAttribute("viewBox", `0 0 ${v} ${a}`), new XMLSerializer().serializeToString(n);
}
async function E(t, e = {}) {
  const r = await K();
  let s = null;
  const i = T(e.width), n = T(e.height);
  try {
    if (s = r.get_mol(t), !s)
      throw new Error(`Invalid SMILES: ${t}`);
    const d = i || n ? s.get_svg(i, n) : s.get_svg();
    if (!d)
      throw new Error(`RDKit.js returned an empty SVG for SMILES: ${t}`);
    return q(d, i, n);
  } finally {
    s && s.delete();
  }
}
function g(t) {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function z(t, e) {
  t.style.minHeight = e.height ? `${e.height}px` : "", t.innerHTML = `
    <section class="src-panel src-mol-svg">
      <div class="src-mol-header">
        <div>
          ${e.legend ? `<div class="src-title">${g(e.legend)}</div>` : ""}
          ${e.show_smiles ? `<div class="src-smiles">${g(e.smiles)}</div>` : ""}
        </div>
      </div>
      <div class="src-mol-body" data-role="mol-body">
        <div class="src-placeholder">No SMILES provided.</div>
      </div>
      <div class="src-actions" data-role="mol-actions"></div>
    </section>
  `;
}
async function N({
  root: t,
  data: e,
  api: r
}) {
  const s = (e.smiles ?? "").trim();
  z(t, e);
  const i = t.querySelector('[data-role="mol-body"]'), n = t.querySelector('[data-role="mol-actions"]');
  if (!(!i || !n)) {
    if (!s) {
      r.setStateValue("status", "idle"), r.setStateValue("error", null), r.setFrameHeight();
      return;
    }
    r.setStateValue("status", "loading"), r.setStateValue("error", null), i.innerHTML = '<div class="src-loading">Loading RDKit.js...</div>', r.setFrameHeight();
    try {
      const d = e.height, c = e.svg_height ?? d, v = e.svg_width ?? c, a = await E(s, {
        width: v,
        height: c
      });
      if (i.innerHTML = `<div class="src-svg-wrap">${a}</div>`, r.setStateValue("status", "ok"), r.setStateValue("error", null), e.enable_export) {
        const u = document.createElement("button");
        u.type = "button", u.className = "src-button", u.textContent = "Export SVG", u.addEventListener("click", () => {
          r.setTriggerValue("action", {
            type: "export_svg",
            smiles: s,
            svg: a
          });
        }), n.replaceChildren(u);
      }
    } catch (d) {
      const c = d instanceof Error ? d.message : "Failed to render molecule.";
      i.innerHTML = `
      <div class="src-error">
        <strong>Invalid SMILES or RDKit.js error</strong>
        <span>${g(c)}</span>
      </div>
    `, r.setStateValue("status", "error"), r.setStateValue("error", c);
    } finally {
      r.setFrameHeight();
    }
  }
}
const P = 500, b = /* @__PURE__ */ new Map();
let y = /* @__PURE__ */ new Set();
function M(t, e) {
  if (!e)
    return "";
  const r = t[e];
  return r == null ? "" : String(r);
}
function G(t, e) {
  for (b.has(t) && b.delete(t), b.set(t, e); b.size > P; ) {
    const r = b.keys().next().value;
    if (r == null)
      break;
    b.delete(r);
  }
}
function W(t, e, r) {
  return `${t}::${e ?? ""}x${r ?? ""}`;
}
async function V(t, e, r) {
  const s = W(t, e, r), i = b.get(s);
  if (i)
    return b.delete(s), b.set(s, i), i;
  const n = await E(t, { width: e, height: r });
  return G(s, n), n;
}
function F(t, e, r) {
  const s = [...y];
  e.setStateValue("selected_ids", s), e.setStateValue("selected_id", s[0] ?? null), r.querySelectorAll("[data-src-card-id]").forEach((n) => {
    const d = n.dataset.srcCardId ?? "", c = y.has(d);
    n.classList.toggle("is-selected", c), n.setAttribute("aria-selected", String(c));
  }), t.selectable === "none" && (e.setStateValue("selected_ids", []), e.setStateValue("selected_id", null));
}
function $(t, e) {
  const r = document.createElement("button");
  return r.type = "button", r.className = "src-button src-button-small", r.textContent = t, r.addEventListener("click", (s) => {
    s.stopPropagation(), e();
  }), r;
}
async function B({
  root: t,
  data: e,
  api: r
}) {
  const s = Array.isArray(e.records) ? e.records : [], i = e.id_col ?? "id", n = e.smiles_col ?? "smiles", d = e.subtitle_cols ?? [], c = new Set(e.actions ?? []), v = e.selectable ?? "single", a = e.svg_width ?? null, u = e.svg_height ?? null, l = [];
  t.style.minHeight = e.height ? `${e.height}px` : "", t.style.setProperty(
    "--src-grid-card-min-width",
    `${Math.max(180, Math.round(a ?? 180))}px`
  ), t.style.setProperty(
    "--src-grid-svg-min-height",
    `${Math.max(128, Math.round(u ?? 128))}px`
  ), t.innerHTML = `
    <section class="src-panel src-grid-panel">
      <div class="src-grid" data-role="grid"></div>
    </section>
  `;
  const h = t.querySelector('[data-role="grid"]');
  if (h) {
    if (s.length === 0) {
      h.innerHTML = '<div class="src-placeholder">No records.</div>', r.setStateValue("errors", []), r.setFrameHeight();
      return;
    }
    for (const w of s) {
      const m = M(w, i), p = M(w, n), R = M(w, e.title_col) || m || p, H = d.map((o) => [o, M(w, o)]).filter(([, o]) => o !== ""), f = document.createElement("article");
      f.className = "src-card", f.dataset.srcCardId = m, f.setAttribute("aria-selected", String(y.has(m))), y.has(m) && f.classList.add("is-selected"), f.innerHTML = `
      <div class="src-card-svg" data-role="card-svg">
        <div class="src-loading">Loading...</div>
      </div>
      <div class="src-card-text">
        <div class="src-card-title">${g(R)}</div>
        <div class="src-smiles">${g(p)}</div>
        ${H.length ? `<dl class="src-meta">${H.map(
        ([o, _]) => `<div><dt>${g(o)}</dt><dd>${g(_)}</dd></div>`
      ).join("")}</dl>` : ""}
      </div>
      <div class="src-actions" data-role="card-actions"></div>
    `, v !== "none" && (f.tabIndex = 0, f.setAttribute("role", v === "multi" ? "checkbox" : "button"), f.addEventListener("click", () => {
        v === "multi" ? y.has(m) ? y.delete(m) : y.add(m) : y = /* @__PURE__ */ new Set([m]), F(e, r, t);
      }), f.addEventListener("keydown", (o) => {
        (o.key === "Enter" || o.key === " ") && (o.preventDefault(), f.click());
      }));
      const S = f.querySelector('[data-role="card-actions"]');
      S && (c.has("detail") && S.append(
        $("Detail", () => {
          r.setTriggerValue("action", { type: "detail", id: m });
        })
      ), c.has("copy_smiles") && S.append(
        $("Copy SMILES", () => {
          var o;
          (o = navigator.clipboard) == null || o.writeText(p).catch(() => {
          }), r.setTriggerValue("action", { type: "copy_smiles", id: m, smiles: p });
        })
      ), c.has("export_svg") && S.append(
        $("Export SVG", async () => {
          const o = await V(p, a, u);
          r.setTriggerValue("action", {
            type: "export_svg",
            id: m,
            smiles: p,
            svg: o
          });
        })
      )), h.append(f);
      const x = f.querySelector('[data-role="card-svg"]');
      if (!p) {
        const o = "Missing SMILES.";
        l.push({ id: m, smiles: p, error: o }), x && (x.innerHTML = `<div class="src-error">${g(o)}</div>`);
        continue;
      }
      V(p, a, u).then((o) => {
        x && (x.innerHTML = `<div class="src-svg-wrap">${o}</div>`);
      }).catch((o) => {
        const _ = o instanceof Error ? o.message : "Failed to render molecule.";
        l.push({ id: m, smiles: p, error: _ }), r.setStateValue("errors", l), x && (x.innerHTML = `<div class="src-error">${g(_)}</div>`);
      }).finally(() => r.setFrameHeight());
    }
    r.setStateValue("errors", l), F(e, r, t), r.setFrameHeight();
  }
}
function L(t, e) {
  if (!e)
    return "";
  const r = t[e];
  return r == null ? "" : String(r);
}
function C(t, e) {
  const r = document.createElement("button");
  return r.type = "button", r.className = "src-button", r.textContent = t, r.addEventListener("click", e), r;
}
async function U({
  root: t,
  data: e,
  api: r
}) {
  const s = e.record ?? {}, i = L(s, e.id_col ?? "id"), n = L(s, e.smiles_col ?? "smiles"), d = L(s, e.title_col) || i || "Molecule", c = e.fields ?? [], v = new Set(e.actions ?? []);
  t.style.minHeight = e.height ? `${e.height}px` : "", t.innerHTML = `
    <section class="src-panel src-detail">
      <div class="src-detail-main">
        <div class="src-detail-svg" data-role="detail-svg">
          <div class="src-loading">Loading RDKit.js...</div>
        </div>
        <div class="src-detail-info">
          <div class="src-title">${g(d)}</div>
          ${i ? `<div class="src-id">${g(i)}</div>` : ""}
          <dl class="src-field-list">
            ${c.map(
    (l) => `<div><dt>${g(l)}</dt><dd>${g(L(s, l))}</dd></div>`
  ).join("")}
          </dl>
          <div class="src-actions" data-role="detail-actions"></div>
        </div>
      </div>
    </section>
  `, r.setStateValue("selected_id", i || null), r.setStateValue("error", null);
  const a = t.querySelector('[data-role="detail-svg"]'), u = t.querySelector('[data-role="detail-actions"]');
  if (!n) {
    const l = "Missing SMILES.";
    r.setStateValue("error", l), a && (a.innerHTML = `<div class="src-error">${g(l)}</div>`), r.setFrameHeight();
    return;
  }
  try {
    const l = await E(n);
    a && (a.innerHTML = `<div class="src-svg-wrap">${l}</div>`), u && (v.has("copy_smiles") && u.append(
      C("Copy SMILES", () => {
        var h;
        (h = navigator.clipboard) == null || h.writeText(n).catch(() => {
        }), r.setTriggerValue("action", { type: "copy_smiles", id: i, smiles: n });
      })
    ), v.has("export_svg") && u.append(
      C("Export SVG", () => {
        r.setTriggerValue("action", {
          type: "export_svg",
          id: i,
          smiles: n,
          svg: l
        });
      })
    ));
  } catch (l) {
    const h = l instanceof Error ? l.message : "Failed to render molecule.";
    r.setStateValue("error", h), a && (a.innerHTML = `<div class="src-error">${g(h)}</div>`);
  } finally {
    r.setFrameHeight();
  }
}
function D(t) {
  var s;
  const e = (s = t.querySelector) == null ? void 0 : s.call(t, "#st-rdkit-components-root");
  if (e instanceof HTMLElement)
    return e.replaceChildren(), e;
  const r = document.createElement("div");
  return r.id = "st-rdkit-components-root", t.append(r), r;
}
function I(t) {
  var r;
  if ((r = t.querySelector) != null && r.call(t, "#st-rdkit-components-style"))
    return;
  const e = document.createElement("style");
  e.id = "st-rdkit-components-style", e.textContent = j, t.prepend(e);
}
function O(t) {
  return {
    setStateValue(e, r) {
      t.setStateValue(e, r);
    },
    setTriggerValue(e, r) {
      t.setTriggerValue(e, r);
    },
    setFrameHeight() {
    }
  };
}
function X(t) {
  if (!t || typeof t != "object")
    return null;
  const e = t, r = e.data && typeof e.data == "object" ? e.data : e;
  return r.component_type === "mol_svg" || r.component_type === "molecule_grid" || r.component_type === "molecule_detail" ? r : null;
}
async function J(t, e) {
  I(t.parentElement);
  const r = D(t.parentElement), s = O(t);
  try {
    e.component_type === "mol_svg" ? await N({ root: r, data: e, api: s }) : e.component_type === "molecule_grid" ? await B({ root: r, data: e, api: s }) : e.component_type === "molecule_detail" && await U({ root: r, data: e, api: s });
  } catch (i) {
    const n = i instanceof Error ? i.message : "Failed to render component.";
    r.innerHTML = `<div class="src-error"><strong>st-rdkit-components</strong><span>${n}</span></div>`, s.setFrameHeight();
  }
}
function Q(t) {
  const e = X(t.data);
  if (I(t.parentElement), e)
    J(t, e);
  else {
    const r = D(t.parentElement);
    r.innerHTML = '<div class="src-placeholder">Waiting for Streamlit data.</div>';
  }
  return () => {
    var s, i;
    const r = (i = (s = t.parentElement).querySelector) == null ? void 0 : i.call(s, "#st-rdkit-components-root");
    r == null || r.remove();
  };
}
export {
  Q as default
};
//# sourceMappingURL=index-31wW8ild.js.map
