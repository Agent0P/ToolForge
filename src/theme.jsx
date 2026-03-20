import { useState } from "react";

/* ── Fonts ── */
export const injectFonts = () => {
  if (document.getElementById("tf-fonts")) return;
  const l = document.createElement("link");
  l.id = "tf-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@700;800&display=swap";
  document.head.appendChild(l);
};

/* ── Global CSS ── */
export const injectStyles = () => {
  if (document.getElementById("tf-styles")) return;
  const s = document.createElement("style");
  s.id = "tf-styles";
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    body { font-family: 'Inter', 'DM Sans', sans-serif; }
    ::selection { background: rgba(217,79,8,0.14); }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(15,12,8,0.15); border-radius: 99px; }

    @keyframes tf-fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes tf-pop {
      0%   { opacity: 0; transform: scale(0.95); }
      60%  { opacity: 1; transform: scale(1.02); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes tf-fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes tf-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    @keyframes tf-gradshift {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    @keyframes tf-float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }

    .tf-fade-up { animation: tf-fadeUp 0.28s cubic-bezier(0.16,1,0.3,1) both; }
    .tf-pop     { animation: tf-pop    0.3s  cubic-bezier(0.16,1,0.3,1) both; }
    .tf-fade-in { animation: tf-fadeIn 0.2s ease both; }

    .tf-stagger > *:nth-child(1) { animation-delay:  0ms; }
    .tf-stagger > *:nth-child(2) { animation-delay: 40ms; }
    .tf-stagger > *:nth-child(3) { animation-delay: 80ms; }
    .tf-stagger > *:nth-child(4) { animation-delay:120ms; }
    .tf-stagger > *:nth-child(5) { animation-delay:160ms; }
    .tf-stagger > *:nth-child(6) { animation-delay:200ms; }
    .tf-stagger > *:nth-child(n+7){ animation-delay:240ms; }

    /* ── Tool card ── */
    .tf-card {
      transition: transform 0.22s cubic-bezier(0.34,1.3,0.64,1),
                  box-shadow 0.22s ease, border-color 0.15s ease;
      will-change: transform;
      position: relative; overflow: hidden;
    }
    .tf-card::after {
      content: "";
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
      pointer-events: none;
    }
    .tf-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(15,12,8,0.07), 0 24px 56px rgba(15,12,8,0.12) !important;
      border-color: rgba(15,12,8,0.13) !important;
    }
    .tf-card:active { transform: translateY(-2px); }

    /* ── Inputs ── */
    .tf-input { transition: border-color 0.14s ease, box-shadow 0.14s ease; }
    .tf-input:focus {
      border-color: #d94f08 !important;
      box-shadow: 0 0 0 3px rgba(217,79,8,0.12) !important;
      outline: none !important;
    }
    body.dark .tf-input {
      background: #221f1a !important;
      color: #f2ede6 !important;
      border-color: rgba(242,237,230,0.13) !important;
    }
    body.dark .tf-input::placeholder { color: #504e48 !important; }

    /* ── Buttons ── */
    .tf-btn { transition: all 0.14s ease; }
    .tf-btn:hover  { filter: brightness(1.06); }
    .tf-btn:active { transform: scale(0.97); }

    .tf-cta {
      box-shadow: 0 2px 8px rgba(217,79,8,0.28);
      transition: all 0.15s ease;
    }
    .tf-cta:hover {
      box-shadow: 0 4px 16px rgba(217,79,8,0.38);
      transform: translateY(-1px);
    }
    .tf-cta:active { transform: scale(0.97); box-shadow: none; }

    /* ── Nav glass ── */
    .tf-nav {
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      background: rgba(255,255,255,0.92) !important;
    }
    .tf-nav-dark {
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      background: rgba(26,24,20,0.92) !important;
    }

    /* ── Hero glow spots ── */
    .tf-hero-wrap { position: relative; overflow: hidden; }
    .tf-hero-gl1 {
      position: absolute; top: -80px; right: -60px;
      width: 320px; height: 320px; border-radius: 50%;
      background: radial-gradient(circle, rgba(217,79,8,0.10), transparent 65%);
      pointer-events: none;
    }
    .tf-hero-gl2 {
      position: absolute; bottom: -60px; left: -40px;
      width: 240px; height: 240px; border-radius: 50%;
      background: radial-gradient(circle, rgba(176,107,16,0.09), transparent 65%);
      pointer-events: none;
    }

    /* ── Search focus glow ── */
    .tf-search:focus-within {
      border-color: rgba(217,79,8,0.4) !important;
      box-shadow: 0 0 0 4px rgba(217,79,8,0.08), 0 8px 24px rgba(15,12,8,0.10) !important;
    }

    /* ── Category tab ── */
    .tf-cat-tab {
      transition: all 0.14s ease;
      cursor: pointer;
    }
    .tf-cat-tab:hover:not(.active) { background: rgba(15,12,8,0.04) !important; }

    /* ── Sidebar item ── */
    .tf-side-item { transition: all 0.12s ease; cursor: pointer; }
    .tf-side-item:hover:not(.active) { background: rgba(15,12,8,0.04) !important; }

    /* ── Game banner ── */
    .tf-game {
      background: linear-gradient(135deg, #2d268a, #5b21b6, #7c3aed) !important;
      background-size: 200% 200% !important;
      animation: tf-gradshift 8s ease infinite !important;
      box-shadow: 0 4px 20px rgba(91,33,182,0.26), 0 10px 36px rgba(91,33,182,0.16) !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    }
    .tf-game:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 8px 28px rgba(91,33,182,0.36), 0 16px 48px rgba(91,33,182,0.22) !important;
    }

    /* ── Upgrade banner ── */
    .tf-upgrade {
      background: linear-gradient(90deg, #b85c0a, #d94f08, #c44010) !important;
      background-size: 200% !important;
      animation: tf-gradshift 6s ease infinite !important;
    }

    /* ── Hamburger drawer ── */
    .tf-drawer {
      transform: translateY(-8px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), opacity 0.18s ease;
    }
    .tf-drawer.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Widget ── */
    .tf-widget {
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.07);
    }

    /* ── Result card ── */
    .tf-result { animation: tf-pop 0.3s cubic-bezier(0.16,1,0.3,1) both; }

    /* ── AI badge pulse ── */
    .tf-ai-pulse { animation: tf-float 4s ease infinite; }

    /* Category stripes */
    .tf-stripe-writing  { background: linear-gradient(90deg, #d94f08, #f07040); }
    .tf-stripe-calc     { background: linear-gradient(90deg, #1a5fd4, #4d90f0); }
    .tf-stripe-planning { background: linear-gradient(90deg, #6030d4, #9060f0); }
    .tf-stripe-utils    { background: linear-gradient(90deg, #0a7a70, #20b0a0); }

    /* Eyebrow line */
    .tf-eyebrow::before {
      content: '';
      width: 18px; height: 1.5px;
      background: currentColor;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }

    /* ── Dark mode: all inputs, selects, textareas ── */
    body.dark input { background: #221f1a !important; color: #f2ede6 !important; border-color: rgba(242,237,230,0.13) !important; }
    body.dark select { background: #221f1a !important; color: #f2ede6 !important; border-color: rgba(242,237,230,0.13) !important; }
    body.dark textarea { background: #221f1a !important; color: #f2ede6 !important; border-color: rgba(242,237,230,0.13) !important; }
    body.dark input::placeholder { color: #504e48 !important; }
    body.dark textarea::placeholder { color: #504e48 !important; }
    body.dark option { background: #221f1a; color: #f2ede6; }

    /* ── Dark mode: tool UI components ── */
    body.dark .tf-tool-card { background: #252018 !important; border-color: rgba(242,237,230,0.07) !important; }
    body.dark .tf-mini-result { background: #221f1a !important; border-color: rgba(242,237,230,0.10) !important; }
    body.dark .tf-mini-result > div:last-child { color: #f2ede6 !important; }
    body.dark .tf-mini-result > div:first-child { color: #504e48 !important; }
    body.dark .tf-tip { background: #041509 !important; border-color: rgba(45,202,116,0.18) !important; }
    body.dark .tf-result-glow { box-shadow: 0 4px 20px rgba(240,100,40,0.1); }

    /* ── Dark mode: tool inner cards / white boxes ── */
    body.dark [style*="background: white"],
    body.dark [style*="background:white"],
    body.dark [style*='background: "white"'] { background: #252018 !important; }

    /* ── Dark mode: toggle buttons inside tools ── */
    body.dark button[style*="background: white"],
    body.dark button[style*="background:white"] { background: #252018 !important; color: #8a8780 !important; border-color: rgba(242,237,230,0.10) !important; }
  `;
  document.head.appendChild(s);
};

/* ── Light theme tokens ── */
export const T = {
  bg:        "#f7f5f0",
  bg2:       "#f0ede6",
  bg3:       "#e8e4dc",
  ink:       "#1a1814",
  muted:     "#6b6860",
  hint:      "#a8a49c",
  border:    "rgba(15,12,8,0.07)",
  border2:   "rgba(15,12,8,0.12)",
  card:      "#ffffff",
  accent:    "#d94f08",
  accentDim: "#fff0e8",
  accentBrd: "#ffd4b8",
  gold:      "#b06b10",
  goldDim:   "#fff5e0",
  goldBrd:   "#ffd98a",
  green:     "#1a7f4b",
  greenDim:  "#edfaf4",
  blue:      "#1a5fd4",
  blueDim:   "#edf2ff",
  purple:    "#6030d4",
  purpleDim: "#f0ebff",
  teal:      "#0a7a70",
  tealDim:   "#e4faf8",
  shadowSm:  "0 1px 2px rgba(15,12,8,0.04), 0 2px 8px rgba(15,12,8,0.06)",
  shadow:    "0 2px 4px rgba(15,12,8,0.05), 0 8px 24px rgba(15,12,8,0.08)",
  shadowLg:  "0 4px 8px rgba(15,12,8,0.06), 0 16px 48px rgba(15,12,8,0.12)",
};

/* ── Dark theme tokens ── */
export const D = {
  bg:        "#1a1814",
  bg2:       "#221f1a",
  bg3:       "#2a2620",
  ink:       "#f2ede6",
  muted:     "#8a8780",
  hint:      "#504e48",
  border:    "rgba(242,237,230,0.06)",
  border2:   "rgba(242,237,230,0.11)",
  card:      "#252018",
  accent:    "#f06428",
  accentDim: "#1e0e05",
  accentBrd: "#3d1c08",
  gold:      "#e09040",
  goldDim:   "#1a1000",
  goldBrd:   "#4a2c00",
  green:     "#2dca74",
  greenDim:  "#041509",
  blue:      "#5598ff",
  blueDim:   "#060e20",
  purple:    "#a07bfa",
  purpleDim: "#100828",
  teal:      "#2dd4bf",
  tealDim:   "#031412",
  shadowSm:  "0 1px 2px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
  shadow:    "0 2px 4px rgba(0,0,0,0.3),  0 8px 24px rgba(0,0,0,0.25)",
  shadowLg:  "0 4px 8px rgba(0,0,0,0.35), 0 16px 48px rgba(0,0,0,0.3)",
};

export const CURRENCIES = [
  { code:"USD", symbol:"$",  label:"$ USD" },
  { code:"EUR", symbol:"€",  label:"€ EUR" },
  { code:"GBP", symbol:"£",  label:"£ GBP" },
  { code:"JPY", symbol:"¥",  label:"¥ JPY" },
  { code:"ILS", symbol:"₪",  label:"₪ ILS" },
  { code:"CAD", symbol:"C$", label:"C$ CAD" },
  { code:"AUD", symbol:"A$", label:"A$ AUD" },
  { code:"CHF", symbol:"Fr", label:"Fr CHF" },
  { code:"INR", symbol:"₹",  label:"₹ INR" },
  { code:"BRL", symbol:"R$", label:"R$ BRL" },
];

export const inputStyle = {
  flex:1, padding:"10px 13px", borderRadius:10,
  border:`1px solid ${T.border2}`, fontSize:13,
  fontFamily:"Inter, DM Sans, sans-serif", color:T.ink,
  background:T.card, outline:"none", width:"100%", boxSizing:"border-box",
};

export const addBtnStyle = {
  padding:"9px 14px", borderRadius:9,
  border:`1.5px dashed ${T.border2}`, background:"transparent",
  color:T.muted, fontSize:12, fontFamily:"Inter, DM Sans, sans-serif",
  cursor:"pointer", marginBottom:12, width:"100%",
  transition:"border-color 0.14s, color 0.14s",
};

export function NumInput({ val, set }) {
  return <input type="number" value={val} onChange={e => set(e.target.value)} className="tf-input" style={inputStyle} />;
}

export function Row({ label, children }) {
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ fontSize:10, color:T.hint, marginBottom:5, fontFamily:"Inter, sans-serif", letterSpacing:"0.07em", fontWeight:600, textTransform:"uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

export function Result({ label, value, color = T.accent }) {
  return (
    <div className="tf-result" style={{ marginTop:16, padding:"20px", borderRadius:14, background:`linear-gradient(135deg,${color}10,${color}06)`, border:`1.5px solid ${color}28`, textAlign:"center", boxShadow:`0 4px 20px ${color}14` }}>
      <div style={{ fontSize:10, color:T.hint, marginBottom:5, fontFamily:"Inter, sans-serif", letterSpacing:"0.07em", fontWeight:600, textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:800, color, fontFamily:"Syne, sans-serif", letterSpacing:"-0.5px" }}>{value}</div>
    </div>
  );
}

export function MiniResult({ label, value }) {
  return (
    <div className="tf-mini-result" style={{ padding:"13px 10px", borderRadius:11, background:T.bg, border:`1px solid ${T.border2}`, textAlign:"center" }}>
      <div style={{ fontSize:10, color:T.hint, marginBottom:4, fontFamily:"Inter, sans-serif", letterSpacing:"0.07em", fontWeight:600, textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:19, fontWeight:700, color:T.ink, fontFamily:"Syne, sans-serif" }}>{value}</div>
    </div>
  );
}

export function Tip({ children }) {
  return (
    <div className="tf-tip" style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:T.greenDim, border:`1px solid #a7f3c0`, fontSize:12, color:T.green, fontFamily:"Inter, DM Sans, sans-serif", lineHeight:1.6 }}>
      💡 {children}
    </div>
  );
}

export function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="tf-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      style={{ marginTop:10, width:"100%", padding:"10px 0", borderRadius:10, border:`1.5px solid ${copied ? T.green : T.border2}`, background:copied ? T.greenDim : T.card, color:copied ? T.green : T.muted, fontSize:12, fontFamily:"Inter, Syne, sans-serif", fontWeight:600, cursor:"pointer", transition:"all 0.18s", letterSpacing:"0.02em" }}>
      {copied ? "✓ Copied!" : (label || "Copy")}
    </button>
  );
}

export function RestoreToken({ onRestore }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const restore = async () => {
    if (!email.trim()) return;
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/get-token-by-email", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email: email.trim() }) });
      if (res.ok) {
        const data = await res.json();
        const tokenData = { ...data.tokenData, token: data.token };
        localStorage.setItem("tf_pro_token", JSON.stringify(tokenData));
        onRestore(tokenData); setShow(false);
      } else {
        const d = await res.json(); setErr(d.error || "No account found for this email.");
      }
    } catch { setErr("Could not connect. Please try again."); }
    setLoading(false);
  };

  if (!show) return (
    <button onClick={() => setShow(true)}
      style={{ background:"none", border:"none", fontSize:11, color:T.muted, cursor:"pointer", fontFamily:"Inter, DM Sans, sans-serif", textDecoration:"underline", padding:0, marginTop:6, display:"block" }}>
      Already purchased? Restore access →
    </button>
  );

  return (
    <div className="tf-pop" style={{ marginTop:8, padding:14, borderRadius:12, background:T.card, border:`1px solid ${T.border2}`, boxShadow:T.shadowSm }}>
      <div style={{ fontSize:11, color:T.muted, marginBottom:6, fontFamily:"Inter, DM Sans, sans-serif" }}>Enter the email you used to purchase:</div>
      <div style={{ display:"flex", gap:6 }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && restore()} placeholder="your@email.com" className="tf-input" style={{ ...inputStyle, fontSize:12 }} />
        <button onClick={restore} disabled={loading || !email.trim()} className="tf-btn tf-cta"
          style={{ padding:"8px 14px", borderRadius:9, border:"none", background:T.accent, color:"white", fontSize:11, fontFamily:"Inter, sans-serif", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
          {loading ? "…" : "Restore"}
        </button>
      </div>
      {err && <div style={{ fontSize:11, color:"#dc2626", marginTop:6, fontFamily:"Inter, DM Sans, sans-serif" }}>{err}</div>}
    </div>
  );
}

export function CurrencyPicker({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="tf-input"
      style={{ ...inputStyle, marginBottom:14, fontFamily:"Inter, sans-serif", fontWeight:600, fontSize:12, color:T.accent, borderColor:`${T.accent}50` }}>
      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
    </select>
  );
}
