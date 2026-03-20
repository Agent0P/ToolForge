import { useState } from "react";

/* ── Google Fonts ── */
export const injectFonts = () => {
  if (document.getElementById("tf-fonts")) return;
  const l = document.createElement("link");
  l.id = "tf-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
  document.head.appendChild(l);
};

/* ── Global CSS injection ── */
export const injectStyles = () => {
  if (document.getElementById("tf-styles")) return;
  const s = document.createElement("style");
  s.id = "tf-styles";
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; scroll-behavior: smooth; }
    ::selection { background: rgba(240,90,40,0.15); color: #0d0d12; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d4d0c8; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: #b8b4ac; }

    /* Keyframes */
    @keyframes tf-fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes tf-fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes tf-pop {
      0%   { transform: scale(0.94); opacity: 0; }
      65%  { transform: scale(1.02); opacity: 1; }
      100% { transform: scale(1);    opacity: 1; }
    }
    @keyframes tf-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    @keyframes tf-pulse-soft {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.6; }
    }
    @keyframes tf-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes tf-gradient-shift {
      0%   { background-position: 0%   50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0%   50%; }
    }
    @keyframes tf-float {
      0%, 100% { transform: translateY(0px);  }
      50%       { transform: translateY(-4px); }
    }

    /* Animation helpers */
    .tf-fade-up  { animation: tf-fadeUp  0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
    .tf-fade-in  { animation: tf-fadeIn  0.2s ease forwards; }
    .tf-pop      { animation: tf-pop     0.32s cubic-bezier(0.16,1,0.3,1) forwards; }

    /* Staggered children */
    .tf-stagger > *:nth-child(1)  { animation-delay:  0ms;  }
    .tf-stagger > *:nth-child(2)  { animation-delay: 45ms;  }
    .tf-stagger > *:nth-child(3)  { animation-delay: 90ms;  }
    .tf-stagger > *:nth-child(4)  { animation-delay: 135ms; }
    .tf-stagger > *:nth-child(5)  { animation-delay: 180ms; }
    .tf-stagger > *:nth-child(6)  { animation-delay: 225ms; }
    .tf-stagger > *:nth-child(7)  { animation-delay: 270ms; }
    .tf-stagger > *:nth-child(8)  { animation-delay: 315ms; }
    .tf-stagger > *:nth-child(n+9){ animation-delay: 350ms; }

    /* Tool cards */
    .tf-tool-card {
      transition: transform 0.22s cubic-bezier(0.34,1.4,0.64,1),
                  box-shadow 0.22s ease,
                  border-color 0.15s ease,
                  background 0.15s ease;
      will-change: transform;
      position: relative;
      overflow: hidden;
    }
    .tf-tool-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0));
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      border-radius: inherit;
    }
    .tf-tool-card:hover {
      transform: translateY(-5px) scale(1.01);
      box-shadow: 0 12px 36px rgba(15,15,13,0.11), 0 3px 10px rgba(15,15,13,0.07);
    }
    .tf-tool-card:hover::before { opacity: 1; }
    .tf-tool-card:active { transform: translateY(-2px) scale(0.99); }

    /* Buttons */
    .tf-btn { transition: all 0.15s ease; user-select: none; }
    .tf-btn:hover  { filter: brightness(1.06); }
    .tf-btn:active { transform: scale(0.97); }

    /* Accent gradient button */
    .tf-btn-accent {
      background: linear-gradient(135deg, #f26030, #e03d10) !important;
      box-shadow: 0 2px 14px rgba(240,90,40,0.32) !important;
      transition: all 0.2s ease !important;
    }
    .tf-btn-accent:hover {
      box-shadow: 0 5px 22px rgba(240,90,40,0.48) !important;
      transform: translateY(-1px) !important;
      filter: brightness(1.05) !important;
    }
    .tf-btn-accent:active { transform: scale(0.97) !important; }

    /* Inputs */
    .tf-input { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
    .tf-input:focus {
      border-color: #f05a28 !important;
      box-shadow: 0 0 0 3px rgba(240,90,40,0.13) !important;
      outline: none !important;
    }

    /* Glass nav */
    .tf-glass {
      backdrop-filter: blur(16px) saturate(200%);
      -webkit-backdrop-filter: blur(16px) saturate(200%);
      background: rgba(255,255,255,0.88) !important;
    }

    /* AI badge */
    .tf-ai-badge {
      animation: tf-pulse-soft 3.5s ease infinite;
    }

    /* Gradient text */
    .tf-gradient-text {
      background: linear-gradient(135deg, #f05a28, #e03d10);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Hero gradient bg */
    .tf-hero-bg {
      background: linear-gradient(135deg, #fff8f5 0%, #f7f5f0 40%, #f3f0ff 100%);
    }

    /* Shimmer skeleton */
    .tf-shimmer {
      background: linear-gradient(90deg, #ede9e2 25%, #e4e0d8 50%, #ede9e2 75%);
      background-size: 600px 100%;
      animation: tf-shimmer 1.6s ease infinite;
      border-radius: 8px;
    }

    /* Upgrade banner */
    .tf-upgrade-banner {
      background: linear-gradient(90deg, #d97706, #f05a28, #e03d10);
      background-size: 200% 200%;
      animation: tf-gradient-shift 5s ease infinite;
    }

    /* Category color tops on cards */
    .tf-card-top-writing  { background: linear-gradient(90deg, #f05a28, #fb923c); }
    .tf-card-top-calc     { background: linear-gradient(90deg, #2563eb, #60a5fa); }
    .tf-card-top-planning { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
    .tf-card-top-utils    { background: linear-gradient(90deg, #0d9488, #2dd4bf); }

    /* Sidebar active item */
    .tf-sidebar-active {
      background: linear-gradient(135deg, #fff1ec, #fde8d8) !important;
      border-left: 3px solid #f05a28 !important;
    }

    /* Category section header */
    .tf-cat-section-header {
      background: linear-gradient(90deg, var(--cat-color-dim, #f7f5f0), transparent);
    }

    /* Result card glow */
    .tf-result-glow {
      box-shadow: 0 4px 20px rgba(240,90,40,0.12);
    }

    /* Floating widget */
    .tf-widget {
      box-shadow: 0 8px 40px rgba(0,0,0,0.14), 0 2px 12px rgba(0,0,0,0.08);
      backdrop-filter: blur(8px);
    }

    /* Game banner */
    .tf-game-banner {
      background: linear-gradient(135deg, #4f46e5, #7c3aed, #9333ea);
      background-size: 200% 200%;
      animation: tf-gradient-shift 6s ease infinite;
      box-shadow: 0 6px 24px rgba(79,70,229,0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .tf-game-banner:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 32px rgba(79,70,229,0.45);
    }

    /* Stat cards in hero */
    .tf-stat-card {
      transition: transform 0.2s ease;
    }
    .tf-stat-card:hover { transform: translateY(-2px); }

    /* Mobile hero */
    .tf-mobile-hero {
      background: linear-gradient(135deg, #fff8f5 0%, #f7f5f0 60%, #f0f0ff 100%);
    }

    /* Desktop hero strip */
    .tf-desktop-hero {
      background: linear-gradient(90deg, #fff8f5, #f7f5f0 50%, #f5f0ff);
    }

    /* Smooth toggle */
    .tf-toggle-knob {
      transition: left 0.2s cubic-bezier(0.34,1.4,0.64,1) !important;
    }
  `;
  document.head.appendChild(s);
};

/* ── Color tokens ── */
export const T = {
  bg:        "#f7f5f0",
  ink:       "#0d0d12",
  muted:     "#78716c",
  border:    "#e7e5df",
  card:      "#ffffff",
  accent:    "#f05a28",
  accentDim: "#fff1ec",
  green:     "#16a34a",
  greenDim:  "#f0fdf4",
  blue:      "#2563eb",
  blueDim:   "#eff6ff",
  purple:    "#7c3aed",
  purpleDim: "#f5f3ff",
  teal:      "#0d9488",
  tealDim:   "#f0fdf9",
  gold:      "#d97706",
  goldDim:   "#fffbeb",
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
  border:`1px solid ${T.border}`, fontSize:13,
  fontFamily:"DM Sans, sans-serif", color:T.ink,
  background:"white", outline:"none", width:"100%", boxSizing:"border-box",
};

export const addBtnStyle = {
  padding:"8px 14px", borderRadius:9,
  border:`1.5px dashed ${T.border}`, background:"transparent",
  color:T.muted, fontSize:12, fontFamily:"DM Sans, sans-serif",
  cursor:"pointer", marginBottom:12, width:"100%",
  transition:"border-color 0.15s, color 0.15s",
};

export function NumInput({ val, set }) {
  return <input type="number" value={val} onChange={e => set(e.target.value)} className="tf-input" style={inputStyle} />;
}

export function Row({ label, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:11, color:T.muted, marginBottom:5, fontFamily:"DM Sans, sans-serif", letterSpacing:0.4, fontWeight:500, textTransform:"uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

export function Result({ label, value, color = T.accent }) {
  return (
    <div className="tf-result-glow tf-pop" style={{ marginTop:16, padding:"18px 20px", borderRadius:14, background:`linear-gradient(135deg, ${color}12, ${color}06)`, border:`1.5px solid ${color}30`, textAlign:"center" }}>
      <div style={{ fontSize:11, color:T.muted, marginBottom:5, fontFamily:"DM Sans, sans-serif", letterSpacing:0.4, textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:30, fontWeight:800, color, fontFamily:"Syne, sans-serif", letterSpacing:-0.5 }}>{value}</div>
    </div>
  );
}

export function MiniResult({ label, value }) {
  return (
    <div style={{ padding:"13px 10px", borderRadius:11, background:T.bg, border:`1px solid ${T.border}`, textAlign:"center", transition:"transform 0.15s ease" }}>
      <div style={{ fontSize:10, color:T.muted, marginBottom:4, fontFamily:"DM Sans, sans-serif", letterSpacing:0.4, textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:19, fontWeight:700, color:T.ink, fontFamily:"Syne, sans-serif" }}>{value}</div>
    </div>
  );
}

export function Tip({ children }) {
  return (
    <div style={{ marginTop:12, padding:"10px 13px", borderRadius:10, background:`linear-gradient(135deg, ${T.greenDim}, #e7fef0)`, border:`1px solid #a7f3c0`, fontSize:12, color:T.green, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>
      💡 {children}
    </div>
  );
}

export function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="tf-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      style={{ marginTop:10, width:"100%", padding:"10px 0", borderRadius:10, border:`1.5px solid ${copied ? T.green : T.border}`, background:copied ? T.greenDim : "white", color:copied ? T.green : T.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:600, cursor:"pointer", transition:"all 0.2s", letterSpacing:0.3 }}>
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
      style={{ background:"none", border:"none", fontSize:11, color:T.muted, cursor:"pointer", fontFamily:"DM Sans, sans-serif", textDecoration:"underline", padding:0, marginTop:6, display:"block", transition:"color 0.15s" }}>
      Already purchased? Restore access →
    </button>
  );

  return (
    <div className="tf-pop" style={{ marginTop:8, padding:14, borderRadius:12, background:"white", border:`1px solid ${T.border}`, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize:11, color:T.muted, marginBottom:6, fontFamily:"DM Sans, sans-serif" }}>Enter the email you used to purchase:</div>
      <div style={{ display:"flex", gap:6 }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && restore()} placeholder="your@email.com" className="tf-input" style={{ ...inputStyle, fontSize:12 }} />
        <button onClick={restore} disabled={loading || !email.trim()} className="tf-btn"
          style={{ padding:"8px 13px", borderRadius:9, border:"none", background:T.accent, color:"white", fontSize:11, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
          {loading ? "…" : "Restore"}
        </button>
      </div>
      {err && <div style={{ fontSize:11, color:"#dc2626", marginTop:6, fontFamily:"DM Sans, sans-serif" }}>{err}</div>}
    </div>
  );
}

export function CurrencyPicker({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="tf-input"
      style={{ ...inputStyle, marginBottom:14, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:T.accent, borderColor:`${T.accent}60` }}>
      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
    </select>
  );
}
