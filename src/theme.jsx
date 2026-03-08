import { useState } from "react";

/* ── Google Fonts ── */
export const injectFonts = () => {
  if (document.getElementById("tf-fonts")) return;
  const l = document.createElement("link");
  l.id = "tf-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
  document.head.appendChild(l);
};

export const T = {
  bg: "#f7f5f0", ink: "#0f0f0d", muted: "#6b6b5f", border: "#e0ddd6",
  card: "#ffffff", accent: "#e85d04", accentDim: "#fde8d8",
  green: "#16a34a", greenDim: "#dcfce7",
  blue: "#2563eb", blueDim: "#dbeafe",
  purple: "#7c3aed", purpleDim: "#ede9fe",
  teal: "#0d9488", tealDim: "#ccfbf1",
  gold: "#b45309", goldDim: "#fef3c7",
};

export const CURRENCIES = [
  { code: "USD", symbol: "$",   label: "$ USD" },
  { code: "EUR", symbol: "€",   label: "€ EUR" },
  { code: "GBP", symbol: "£",   label: "£ GBP" },
  { code: "JPY", symbol: "¥",   label: "¥ JPY" },
  { code: "ILS", symbol: "₪",   label: "₪ ILS" },
  { code: "CAD", symbol: "C$",  label: "C$ CAD" },
  { code: "AUD", symbol: "A$",  label: "A$ AUD" },
  { code: "CHF", symbol: "Fr",  label: "Fr CHF" },
  { code: "INR", symbol: "₹",   label: "₹ INR" },
  { code: "BRL", symbol: "R$",  label: "R$ BRL" },
];

export const inputStyle = { flex: 1, padding: "9px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.ink, background: "white", outline: "none", width: "100%", boxSizing: "border-box" };
export const addBtnStyle = { padding: "7px 14px", borderRadius: 8, border: `1px dashed ${T.border}`, background: "transparent", color: T.muted, fontSize: 12, fontFamily: "DM Sans, sans-serif", cursor: "pointer", marginBottom: 12, width: "100%" };

export function NumInput({ val, set }) { return <input type="number" value={val} onChange={e => set(e.target.value)} style={inputStyle} />; }
export function Row({ label, children }) { return <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: T.muted, marginBottom: 4, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.3 }}>{label}</div>{children}</div>; }
export function Result({ label, value, color = T.accent }) { return <div style={{ marginTop: 14, padding: 16, borderRadius: 12, background: `linear-gradient(135deg,${T.accentDim},white)`, border: `1px solid ${T.border}`, textAlign: "center" }}><div style={{ fontSize: 11, color: T.muted, marginBottom: 4, fontFamily: "DM Sans, sans-serif" }}>{label}</div><div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "Syne, sans-serif" }}>{value}</div></div>; }
export function MiniResult({ label, value }) { return <div style={{ padding: 12, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}><div style={{ fontSize: 10, color: T.muted, marginBottom: 3, fontFamily: "DM Sans, sans-serif" }}>{label}</div><div style={{ fontSize: 18, fontWeight: 700, color: T.ink, fontFamily: "Syne, sans-serif" }}>{value}</div></div>; }
export function Tip({ children }) { return <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: T.greenDim, border: `1px solid #bbf7d0`, fontSize: 12, color: T.green, fontFamily: "DM Sans, sans-serif", lineHeight: 1.5 }}>💡 {children}</div>; }

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} style={{ marginTop: 8, width: "100%", padding: "9px 0", borderRadius: 9, border: `1px solid ${copied ? T.green : T.border}`, background: copied ? T.greenDim : "white", color: copied ? T.green : T.muted, fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{copied ? "✓ Copied!" : "Copy"}</button>;
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
      const res = await fetch("/api/get-token-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const tokenData = { ...data.tokenData, token: data.token };
        localStorage.setItem("tf_pro_token", JSON.stringify(tokenData));
        onRestore(tokenData);
        setShow(false);
      } else {
        const d = await res.json();
        setErr(d.error || "No account found for this email.");
      }
    } catch { setErr("Could not connect. Please try again."); }
    setLoading(false);
  };

  if (!show) return <button onClick={() => setShow(true)} style={{ background: "none", border: "none", fontSize: 11, color: T.muted, cursor: "pointer", fontFamily: "DM Sans, sans-serif", textDecoration: "underline", padding: 0, marginTop: 6, display: "block" }}>Already purchased? Restore access →</button>;

  return (
    <div style={{ marginTop: 8, padding: 14, borderRadius: 10, background: "white", border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif" }}>Enter the email you used to purchase:</div>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && restore()} placeholder="your@email.com" style={{ ...inputStyle, fontSize: 12 }} />
        <button onClick={restore} disabled={loading || !email.trim()} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: T.accent, color: "white", fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{loading ? "…" : "Restore"}</button>
      </div>
      {err && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 6, fontFamily: "DM Sans, sans-serif" }}>{err}</div>}
    </div>
  );
}

export function CurrencyPicker({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, marginBottom: 14, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: T.accent, borderColor: T.accent }}>
      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
    </select>
  );
}
