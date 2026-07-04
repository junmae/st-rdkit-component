const j = ":host,:root,#st-rdkit-components-root{color-scheme:light dark;--src-primary: var(--st-primary-color, #ff4b4b);--src-text: var(--text-color, #262730);--src-muted: color-mix(in srgb, var(--src-text) 62%, transparent);--src-bg: var(--background-color, #ffffff);--src-panel: var(--secondary-background-color, #f6f7f9);--src-card-bg: #ffffff;--src-border: color-mix(in srgb, var(--src-text) 28%, transparent);--src-card-border: color-mix(in srgb, var(--src-text) 34%, transparent);--src-error: #b42318}*{box-sizing:border-box}body{margin:0;color:var(--src-text);background:transparent;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}button{font:inherit}.src-panel{width:100%;color:var(--src-text)}.src-mol-svg,.src-detail,.src-grid-panel{display:flex;flex-direction:column;gap:.75rem}.src-mol-header{display:flex;justify-content:space-between;gap:.75rem}.src-title{font-size:1.05rem;font-weight:650;line-height:1.3}.src-id,.src-smiles{color:var(--src-muted);font-size:.82rem;line-height:1.45;overflow-wrap:anywhere}.src-mol-body,.src-detail-svg,.src-card-svg{display:grid;place-items:center;min-height:12rem;border:1px solid var(--src-border, #d0d4dc);border-radius:8px;background:var(--src-bg);overflow:hidden}.src-svg-wrap{width:100%;max-width:100%;display:grid;place-items:center;padding:.6rem}.src-svg-wrap svg{display:block;max-width:100%;height:auto}.src-placeholder,.src-loading{color:var(--src-muted);padding:1rem;text-align:center}.src-error{display:flex;flex-direction:column;gap:.25rem;width:100%;padding:.75rem;color:var(--src-error);background:color-mix(in srgb,var(--src-error) 10%,transparent);border:1px solid color-mix(in srgb,var(--src-error, #b42318) 34%,transparent);border-radius:8px;overflow-wrap:anywhere}.src-actions{display:flex;flex-wrap:wrap;gap:.45rem;align-items:center}.src-button{-webkit-appearance:none;-moz-appearance:none;appearance:none;min-height:2rem;padding:.35rem .7rem;border-radius:6px;border:1px solid var(--src-border, #d0d4dc);color:var(--src-text, #262730);background:var(--src-bg, #ffffff);cursor:pointer}.src-button:hover{border-color:var(--src-primary, #ff4b4b)}.src-button-small{min-height:1.8rem;padding:.25rem .5rem;font-size:.78rem}.src-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(var(--src-grid-card-min-width, 180px),1fr));gap:.75rem;align-items:stretch}.src-card{position:relative;display:flex;min-width:0;flex-direction:column;gap:.55rem;padding:.65rem;border:2px solid var(--src-card-border, #b8bec9);border-radius:8px;background:var(--src-card-bg, #ffffff);cursor:pointer;transition:border-color .12s ease,background-color .12s ease,box-shadow .12s ease,transform .12s ease}.src-card:hover{border-color:color-mix(in srgb,var(--src-primary, #ff4b4b) 55%,var(--src-border, #d0d4dc));background:var(--src-card-bg, #ffffff)}.src-card:focus-visible{outline:3px solid color-mix(in srgb,var(--src-primary, #ff4b4b) 34%,transparent);outline-offset:2px}.src-card.is-selected{border-color:var(--src-primary, #ff4b4b);background:var(--src-card-bg, #ffffff);box-shadow:0 4px 14px color-mix(in srgb,var(--src-primary, #ff4b4b) 10%,transparent)}.src-card-svg{min-height:var(--src-grid-svg-min-height, 8rem);border:0;background:var(--src-bg, #ffffff)}.src-card-title{font-weight:650;line-height:1.3;overflow-wrap:anywhere}.src-card-text{display:flex;min-width:0;flex-direction:column;gap:.25rem}.src-meta,.src-field-list{display:grid;gap:.35rem;margin:0}.src-meta>div,.src-field-list>div{display:grid;grid-template-columns:minmax(4rem,.35fr) minmax(0,1fr);gap:.55rem;min-width:0}.src-meta dt,.src-field-list dt{color:var(--src-muted);font-size:.78rem}.src-meta dd,.src-field-list dd{margin:0;min-width:0;overflow-wrap:anywhere}.src-detail-main{display:grid;grid-template-columns:minmax(14rem,1.1fr) minmax(14rem,.9fr);gap:1rem;align-items:start}.src-detail-svg{min-height:18rem}.src-detail-info{display:flex;min-width:0;flex-direction:column;gap:.75rem}@media (max-width: 640px){.src-grid,.src-detail-main{grid-template-columns:1fr}}";
let L = null;
function A(r) {
  const e = document.querySelector(
    `script[data-rdkit-src="${r}"]`
  );
  return (e == null ? void 0 : e.dataset.loaded) === "true" ? Promise.resolve() : e ? new Promise((t, s) => {
    e.addEventListener("load", () => t(), { once: !0 }), e.addEventListener("error", () => s(new Error(`Failed to load ${r}`)), {
      once: !0
    });
  }) : new Promise((t, s) => {
    const i = document.createElement("script");
    i.src = r, i.async = !0, i.dataset.rdkitSrc = r, i.addEventListener(
      "load",
      () => {
        i.dataset.loaded = "true", t();
      },
      { once: !0 }
    ), i.addEventListener(
      "error",
      () => s(new Error(`Failed to load bundled RDKit.js asset: ${r}`)),
      { once: !0 }
    ), document.head.appendChild(i);
  });
}
function K() {
  return L || (L = (async () => {
    const r = new URL("./RDKit_minimal.js", import.meta.url).toString(), e = new URL("./RDKit_minimal.wasm", import.meta.url).toString();
    if (await A(r), typeof window.initRDKitModule != "function")
      throw new Error(
        "RDKit.js was loaded, but window.initRDKitModule was not found. Check that RDKit_minimal.js matches the expected RDKit.js minimal build."
      );
    return await window.initRDKitModule({
      locateFile: (t) => t.endsWith(".wasm") ? e : t
    });
  })()), L;
}
function V(r) {
  if (!(typeof r != "number" || !Number.isFinite(r) || r <= 0))
    return Math.round(r);
}
function q(r, e, t) {
  if (!e && !t)
    return r;
  const n = new DOMParser().parseFromString(r, "image/svg+xml").querySelector("svg");
  if (!n)
    return r;
  const c = n.getAttribute("width"), d = n.getAttribute("height"), u = e ?? Number.parseFloat(c ?? ""), a = t ?? Number.parseFloat(d ?? "");
  return e && n.setAttribute("width", String(e)), t && n.setAttribute("height", String(t)), !n.hasAttribute("viewBox") && Number.isFinite(u) && Number.isFinite(a) && n.setAttribute("viewBox", `0 0 ${u} ${a}`), new XMLSerializer().serializeToString(n);
}
async function E(r, e = {}) {
  const t = await K();
  let s = null;
  const i = V(e.width), n = V(e.height);
  try {
    if (s = t.get_mol(r), !s)
      throw new Error(`Invalid SMILES: ${r}`);
    const c = i || n ? s.get_svg(i, n) : s.get_svg();
    if (!c)
      throw new Error(`RDKit.js returned an empty SVG for SMILES: ${r}`);
    return q(c, i, n);
  } finally {
    s && s.delete();
  }
}
function g(r) {
  return String(r ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function z(r, e) {
  r.style.minHeight = e.height ? `${e.height}px` : "", r.innerHTML = `
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
  root: r,
  data: e,
  api: t
}) {
  const s = (e.smiles ?? "").trim();
  z(r, e);
  const i = r.querySelector('[data-role="mol-body"]'), n = r.querySelector('[data-role="mol-actions"]');
  if (!(!i || !n)) {
    if (!s) {
      t.setStateValue("status", "idle"), t.setStateValue("error", null), t.setFrameHeight();
      return;
    }
    t.setStateValue("status", "loading"), t.setStateValue("error", null), i.innerHTML = '<div class="src-loading">Loading RDKit.js...</div>', t.setFrameHeight();
    try {
      const c = e.height, d = e.svg_height ?? c, u = e.svg_width ?? d, a = await E(s, {
        width: u,
        height: d
      });
      if (i.innerHTML = `<div class="src-svg-wrap">${a}</div>`, t.setStateValue("status", "ok"), t.setStateValue("error", null), e.enable_export) {
        const m = document.createElement("button");
        m.type = "button", m.className = "src-button", m.textContent = "Export SVG", m.addEventListener("click", () => {
          t.setTriggerValue("action", {
            type: "export_svg",
            smiles: s,
            svg: a
          });
        }), n.replaceChildren(m);
      }
    } catch (c) {
      const d = c instanceof Error ? c.message : "Failed to render molecule.";
      i.innerHTML = `
      <div class="src-error">
        <strong>Invalid SMILES or RDKit.js error</strong>
        <span>${g(d)}</span>
      </div>
    `, t.setStateValue("status", "error"), t.setStateValue("error", d);
    } finally {
      t.setFrameHeight();
    }
  }
}
const P = 500, b = /* @__PURE__ */ new Map();
let y = /* @__PURE__ */ new Set();
function U() {
  return typeof crypto < "u" && typeof crypto.randomUUID == "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function M(r, e) {
  if (!e)
    return "";
  const t = r[e];
  return t == null ? "" : String(t);
}
function G(r, e) {
  for (b.has(r) && b.delete(r), b.set(r, e); b.size > P; ) {
    const t = b.keys().next().value;
    if (t == null)
      break;
    b.delete(t);
  }
}
function W(r, e, t) {
  return `${r}::${e ?? ""}x${t ?? ""}`;
}
async function T(r, e, t) {
  const s = W(r, e, t), i = b.get(s);
  if (i)
    return b.delete(s), b.set(s, i), i;
  const n = await E(r, { width: e, height: t });
  return G(s, n), n;
}
function F(r, e, t, s) {
  const i = [...y];
  e.setStateValue("selected_ids", i), e.setStateValue("selected_id", i[0] ?? null), s && e.setStateValue("event_id", s), t.querySelectorAll("[data-src-card-id]").forEach((c) => {
    const d = c.dataset.srcCardId ?? "", u = y.has(d);
    c.classList.toggle("is-selected", u), c.setAttribute("aria-selected", String(u));
  }), r.selectable === "none" && (e.setStateValue("selected_ids", []), e.setStateValue("selected_id", null));
}
function k(r, e) {
  const t = document.createElement("button");
  return t.type = "button", t.className = "src-button src-button-small", t.textContent = r, t.addEventListener("click", (s) => {
    s.stopPropagation(), e();
  }), t;
}
async function B({
  root: r,
  data: e,
  api: t
}) {
  const s = Array.isArray(e.records) ? e.records : [], i = e.id_col ?? "id", n = e.smiles_col ?? "smiles", c = e.subtitle_cols ?? [], d = new Set(e.actions ?? []), u = e.selectable ?? "single", a = e.svg_width ?? null, m = e.svg_height ?? null, l = [];
  r.style.minHeight = e.height ? `${e.height}px` : "", r.style.setProperty(
    "--src-grid-card-min-width",
    `${Math.max(180, Math.round(a ?? 180))}px`
  ), r.style.setProperty(
    "--src-grid-svg-min-height",
    `${Math.max(128, Math.round(m ?? 128))}px`
  ), r.innerHTML = `
    <section class="src-panel src-grid-panel">
      <div class="src-grid" data-role="grid"></div>
    </section>
  `;
  const h = r.querySelector('[data-role="grid"]');
  if (h) {
    if (s.length === 0) {
      h.innerHTML = '<div class="src-placeholder">No records.</div>', t.setStateValue("errors", []), t.setFrameHeight();
      return;
    }
    for (const S of s) {
      const f = M(S, i), p = M(S, n), R = M(S, e.title_col) || f || p, H = c.map((o) => [o, M(S, o)]).filter(([, o]) => o !== ""), v = document.createElement("article");
      v.className = "src-card", v.dataset.srcCardId = f, v.setAttribute("aria-selected", String(y.has(f))), y.has(f) && v.classList.add("is-selected"), v.innerHTML = `
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
    `, u !== "none" && (v.tabIndex = 0, v.setAttribute("role", u === "multi" ? "checkbox" : "button"), v.addEventListener("click", () => {
        u === "multi" ? y.has(f) ? y.delete(f) : y.add(f) : y = /* @__PURE__ */ new Set([f]), F(e, t, r, U());
      }), v.addEventListener("keydown", (o) => {
        (o.key === "Enter" || o.key === " ") && (o.preventDefault(), v.click());
      }));
      const w = v.querySelector('[data-role="card-actions"]');
      w && (d.has("detail") && w.append(
        k("Detail", () => {
          t.setTriggerValue("action", { type: "detail", id: f });
        })
      ), d.has("copy_smiles") && w.append(
        k("Copy SMILES", () => {
          var o;
          (o = navigator.clipboard) == null || o.writeText(p).catch(() => {
          }), t.setTriggerValue("action", { type: "copy_smiles", id: f, smiles: p });
        })
      ), d.has("export_svg") && w.append(
        k("Export SVG", async () => {
          const o = await T(p, a, m);
          t.setTriggerValue("action", {
            type: "export_svg",
            id: f,
            smiles: p,
            svg: o
          });
        })
      )), h.append(v);
      const x = v.querySelector('[data-role="card-svg"]');
      if (!p) {
        const o = "Missing SMILES.";
        l.push({ id: f, smiles: p, error: o }), x && (x.innerHTML = `<div class="src-error">${g(o)}</div>`);
        continue;
      }
      T(p, a, m).then((o) => {
        x && (x.innerHTML = `<div class="src-svg-wrap">${o}</div>`);
      }).catch((o) => {
        const _ = o instanceof Error ? o.message : "Failed to render molecule.";
        l.push({ id: f, smiles: p, error: _ }), t.setStateValue("errors", l), x && (x.innerHTML = `<div class="src-error">${g(_)}</div>`);
      }).finally(() => t.setFrameHeight());
    }
    t.setStateValue("errors", l), F(e, t, r), t.setFrameHeight();
  }
}
function $(r, e) {
  if (!e)
    return "";
  const t = r[e];
  return t == null ? "" : String(t);
}
function D(r, e) {
  const t = document.createElement("button");
  return t.type = "button", t.className = "src-button", t.textContent = r, t.addEventListener("click", e), t;
}
async function O({
  root: r,
  data: e,
  api: t
}) {
  const s = e.record ?? {}, i = $(s, e.id_col ?? "id"), n = $(s, e.smiles_col ?? "smiles"), c = $(s, e.title_col) || i || "Molecule", d = e.fields ?? [], u = new Set(e.actions ?? []);
  r.style.minHeight = e.height ? `${e.height}px` : "", r.innerHTML = `
    <section class="src-panel src-detail">
      <div class="src-detail-main">
        <div class="src-detail-svg" data-role="detail-svg">
          <div class="src-loading">Loading RDKit.js...</div>
        </div>
        <div class="src-detail-info">
          <div class="src-title">${g(c)}</div>
          ${i ? `<div class="src-id">${g(i)}</div>` : ""}
          <dl class="src-field-list">
            ${d.map(
    (l) => `<div><dt>${g(l)}</dt><dd>${g($(s, l))}</dd></div>`
  ).join("")}
          </dl>
          <div class="src-actions" data-role="detail-actions"></div>
        </div>
      </div>
    </section>
  `, t.setStateValue("selected_id", i || null), t.setStateValue("error", null);
  const a = r.querySelector('[data-role="detail-svg"]'), m = r.querySelector('[data-role="detail-actions"]');
  if (!n) {
    const l = "Missing SMILES.";
    t.setStateValue("error", l), a && (a.innerHTML = `<div class="src-error">${g(l)}</div>`), t.setFrameHeight();
    return;
  }
  try {
    const l = await E(n);
    a && (a.innerHTML = `<div class="src-svg-wrap">${l}</div>`), m && (u.has("copy_smiles") && m.append(
      D("Copy SMILES", () => {
        var h;
        (h = navigator.clipboard) == null || h.writeText(n).catch(() => {
        }), t.setTriggerValue("action", { type: "copy_smiles", id: i, smiles: n });
      })
    ), u.has("export_svg") && m.append(
      D("Export SVG", () => {
        t.setTriggerValue("action", {
          type: "export_svg",
          id: i,
          smiles: n,
          svg: l
        });
      })
    ));
  } catch (l) {
    const h = l instanceof Error ? l.message : "Failed to render molecule.";
    t.setStateValue("error", h), a && (a.innerHTML = `<div class="src-error">${g(h)}</div>`);
  } finally {
    t.setFrameHeight();
  }
}
function I(r) {
  var s;
  const e = (s = r.querySelector) == null ? void 0 : s.call(r, "#st-rdkit-components-root");
  if (e instanceof HTMLElement)
    return e.replaceChildren(), e;
  const t = document.createElement("div");
  return t.id = "st-rdkit-components-root", r.append(t), t;
}
function C(r) {
  var t;
  if ((t = r.querySelector) != null && t.call(r, "#st-rdkit-components-style"))
    return;
  const e = document.createElement("style");
  e.id = "st-rdkit-components-style", e.textContent = j, r.prepend(e);
}
function X(r) {
  return {
    setStateValue(e, t) {
      r.setStateValue(e, t);
    },
    setTriggerValue(e, t) {
      r.setTriggerValue(e, t);
    },
    setFrameHeight() {
    }
  };
}
function J(r) {
  if (!r || typeof r != "object")
    return null;
  const e = r, t = e.data && typeof e.data == "object" ? e.data : e;
  return t.component_type === "mol_svg" || t.component_type === "molecule_grid" || t.component_type === "molecule_detail" ? t : null;
}
async function Q(r, e) {
  C(r.parentElement);
  const t = I(r.parentElement), s = X(r);
  try {
    e.component_type === "mol_svg" ? await N({ root: t, data: e, api: s }) : e.component_type === "molecule_grid" ? await B({ root: t, data: e, api: s }) : e.component_type === "molecule_detail" && await O({ root: t, data: e, api: s });
  } catch (i) {
    const n = i instanceof Error ? i.message : "Failed to render component.";
    t.innerHTML = `<div class="src-error"><strong>st-rdkit-components</strong><span>${n}</span></div>`, s.setFrameHeight();
  }
}
function Y(r) {
  const e = J(r.data);
  if (C(r.parentElement), e)
    Q(r, e);
  else {
    const t = I(r.parentElement);
    t.innerHTML = '<div class="src-placeholder">Waiting for Streamlit data.</div>';
  }
  return () => {
    var s, i;
    const t = (i = (s = r.parentElement).querySelector) == null ? void 0 : i.call(s, "#st-rdkit-components-root");
    t == null || t.remove();
  };
}
export {
  Y as default
};
//# sourceMappingURL=index-CEHxRlv4.js.map
