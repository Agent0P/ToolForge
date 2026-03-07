import { useState, useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

/* ── Google Fonts ── */
const injectFonts = () => {
  if (document.getElementById("tf-fonts")) return;
  const l = document.createElement("link");
  l.id = "tf-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
  document.head.appendChild(l);
};

const T = {
  bg: "#f7f5f0", ink: "#0f0f0d", muted: "#6b6b5f", border: "#e0ddd6",
  card: "#ffffff", accent: "#e85d04", accentDim: "#fde8d8",
  green: "#16a34a", greenDim: "#dcfce7",
  blue: "#2563eb", blueDim: "#dbeafe",
  purple: "#7c3aed", purpleDim: "#ede9fe",
  teal: "#0d9488", tealDim: "#ccfbf1",
  gold: "#b45309", goldDim: "#fef3c7",
};

const CATEGORIES = [
  { id: "writing", label: "Writing & AI", icon: "✍️", color: T.accent, colorDim: T.accentDim, tools: [
    { id: "cover", icon: "📄", name: "Cover Letter Generator", desc: "Tailored AI cover letters in seconds" },
    { id: "linkedin", icon: "🔗", name: "LinkedIn Bio Writer", desc: "Stand out with an AI-crafted bio" },
    { id: "cold", icon: "📧", name: "Cold Email Generator", desc: "Outreach emails that get replies" },
    { id: "proposal", icon: "✍️", name: "Client Proposal Writer", desc: "Win more clients with AI proposals" },
    { id: "invoice", icon: "🧾", name: "Invoice Text Generator", desc: "AI-written professional invoices" },
    { id: "tagline", icon: "✨", name: "Business Tagline Generator", desc: "AI slogans that stick" },
    { id: "essay", icon: "📝", name: "Essay Outline Generator", desc: "AI-structured essay plans" },
    { id: "email", icon: "💌", name: "Marketing Email Writer", desc: "Convert with AI-written emails" },
  ]},
  { id: "calculators", label: "Calculators", icon: "🧮", color: T.blue, colorDim: T.blueDim, tools: [
    { id: "rate", icon: "💰", name: "Hourly Rate Calculator", desc: "Know exactly what to charge" },
    { id: "project", icon: "📅", name: "Project Price Estimator", desc: "Quote any project confidently" },
    { id: "margin", icon: "📈", name: "Profit Margin Calculator", desc: "Price products for profit" },
    { id: "breakeven", icon: "⚖️", name: "Break-Even Calculator", desc: "Find your break-even point fast" },
    { id: "gpa", icon: "📐", name: "GPA Calculator", desc: "Track and project your GPA" },
    { id: "salary", icon: "📊", name: "Salary Negotiation Helper", desc: "Know your worth, negotiate better" },
    { id: "tip", icon: "🍽", name: "Tip & Bill Splitter", desc: "Split any bill instantly" },
    { id: "savings", icon: "🏦", name: "Savings Goal Calculator", desc: "Plan your way to any goal" },
    { id: "bmi", icon: "⚖️", name: "BMI Calculator", desc: "Calculate your Body Mass Index and health range" },
  ]},
  { id: "planning", label: "Planning & Time", icon: "📅", color: T.purple, colorDim: T.purpleDim, tools: [
    { id: "pomodoro", icon: "🍅", name: "Pomodoro Timer", desc: "Focus sessions with automatic break reminders" },
    { id: "deadline", icon: "🗓", name: "Deadline Countdown", desc: "Days, hours, minutes to any date" },
    { id: "study", icon: "⏱", name: "Study Session Planner", desc: "Optimise your revision time" },
    { id: "citation", icon: "📚", name: "Citation Formatter", desc: "APA, MLA, Chicago in one click" },
  ]},
  { id: "utilities", label: "Utilities", icon: "🛠", color: T.teal, colorDim: T.tealDim, tools: [
    { id: "unit", icon: "📏", name: "Unit Converter", desc: "Length, weight, temp & more" },
    { id: "timezone", icon: "🌍", name: "Timezone Converter", desc: "Convert times across the world instantly" },
    { id: "word-counter", icon: "📝", name: "Word Counter", desc: "Words, characters, sentences & reading time" },
    { id: "qr-generator", icon: "📱", name: "QR Code Generator", desc: "Generate a scannable QR code for any link or text" },
  ]},
];

const ALL_TOOLS = CATEGORIES.flatMap(c => c.tools.map(t => ({ ...t, catId: c.id, catColor: c.color, catColorDim: c.colorDim })));
const AI_TOOLS = ["Cover Letter Generator","LinkedIn Bio Writer","Cold Email Generator","Business Tagline Generator","Essay Outline Generator","Client Proposal Writer","Invoice Text Generator","Marketing Email Writer"];

const inputStyle = { flex: 1, padding: "9px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.ink, background: "white", outline: "none", width: "100%", boxSizing: "border-box" };
const addBtnStyle = { padding: "7px 14px", borderRadius: 8, border: `1px dashed ${T.border}`, background: "transparent", color: T.muted, fontSize: 12, fontFamily: "DM Sans, sans-serif", cursor: "pointer", marginBottom: 12, width: "100%" };

function NumInput({ val, set }) { return <input type="number" value={val} onChange={e => set(e.target.value)} style={inputStyle} />; }
function Row({ label, children }) { return <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: T.muted, marginBottom: 4, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.3 }}>{label}</div>{children}</div>; }
function Result({ label, value, color = T.accent }) { return <div style={{ marginTop: 14, padding: 16, borderRadius: 12, background: `linear-gradient(135deg,${T.accentDim},white)`, border: `1px solid ${T.border}`, textAlign: "center" }}><div style={{ fontSize: 11, color: T.muted, marginBottom: 4, fontFamily: "DM Sans, sans-serif" }}>{label}</div><div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "Syne, sans-serif" }}>{value}</div></div>; }
function MiniResult({ label, value }) { return <div style={{ padding: 12, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}><div style={{ fontSize: 10, color: T.muted, marginBottom: 3, fontFamily: "DM Sans, sans-serif" }}>{label}</div><div style={{ fontSize: 18, fontWeight: 700, color: T.ink, fontFamily: "Syne, sans-serif" }}>{value}</div></div>; }
function Tip({ children }) { return <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: T.greenDim, border: `1px solid #bbf7d0`, fontSize: 12, color: T.green, fontFamily: "DM Sans, sans-serif", lineHeight: 1.5 }}>💡 {children}</div>; }

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} style={{ marginTop: 8, width: "100%", padding: "9px 0", borderRadius: 9, border: `1px solid ${copied ? T.green : T.border}`, background: copied ? T.greenDim : "white", color: copied ? T.green : T.muted, fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{copied ? "✓ Copied!" : "Copy"}</button>;
}

function RestoreToken({ onRestore }) {
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


const CURRENCIES = [
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
function CurrencyPicker({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, marginBottom: 14, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: T.accent, borderColor: T.accent }}>
      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
    </select>
  );
}

function RateCalc() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [expenses, setExpenses] = useState(2000); const [salary, setSalary] = useState(4000); const [hours, setHours] = useState(160); const [buffer, setBuffer] = useState(20);
  const rate = ((Number(expenses) + Number(salary)) / Number(hours) * (1 + Number(buffer) / 100)).toFixed(2);
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Monthly Expenses (${sym})`}><NumInput val={expenses} set={setExpenses} /></Row><Row label={`Desired Monthly Take-home (${sym})`}><NumInput val={salary} set={setSalary} /></Row><Row label="Billable Hours / Month"><NumInput val={hours} set={setHours} /></Row><Row label="Buffer / Profit (%)"><NumInput val={buffer} set={setBuffer} /></Row><Result label="Your Minimum Hourly Rate" value={`${sym}${rate}/hr`} /><CopyButton text={`My minimum hourly rate is ${sym}${rate}/hr — ToolForge`} /><Tip>Going below this rate means you're losing money. Add 20–40% more for growth.</Tip></div>;
}

function ProjectEstimator() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [tasks, setTasks] = useState([{ name: "Design", hours: 5 }, { name: "Development", hours: 15 }]); const [rate, setRate] = useState(75);
  const total = tasks.reduce((s, t) => s + Number(t.hours), 0); const price = (total * Number(rate) * 1.15).toFixed(0);
  return <div><CurrencyPicker value={currency} onChange={setCurrency} />{tasks.map((t, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}><input value={t.name} onChange={e => setTasks(ts => ts.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={inputStyle} placeholder="Task name" /><input type="number" value={t.hours} onChange={e => setTasks(ts => ts.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))} style={{ ...inputStyle, width: 80 }} placeholder="hrs" /></div>)}<button onClick={() => setTasks(ts => [...ts, { name: "", hours: 0 }])} style={addBtnStyle}>+ Add Task</button><Row label={`Your Hourly Rate (${sym})`}><NumInput val={rate} set={setRate} /></Row><Result label="Recommended Project Price (incl. 15% buffer)" value={`${sym}${Number(price).toLocaleString()}`} /><CopyButton text={`Project price: ${sym}${Number(price).toLocaleString()} for ${total} hours — ToolForge`} /><Tip>{total} hours estimated. Always add a buffer for revisions.</Tip></div>;
}

function GPACalc() {
  const grades = [["A+",4.3],["A",4.0],["A-",3.7],["B+",3.3],["B",3.0],["B-",2.7],["C+",2.3],["C",2.0],["D",1.0],["F",0]];
  const [courses, setCourses] = useState([{ name: "Math", grade: "A", credits: 3 }, { name: "English", grade: "B+", credits: 3 }]);
  const totalCredits = courses.reduce((s, c) => s + Number(c.credits), 0);
  const gpa = totalCredits ? (courses.reduce((s, c) => s + (grades.find(g => g[0] === c.grade)?.[1] || 0) * Number(c.credits), 0) / totalCredits).toFixed(2) : "0.00";
  return <div>{courses.map((c, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}><input value={c.name} onChange={e => setCourses(cs => cs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={inputStyle} placeholder="Course" /><select value={c.grade} onChange={e => setCourses(cs => cs.map((x, j) => j === i ? { ...x, grade: e.target.value } : x))} style={{ ...inputStyle, width: 75 }}>{grades.map(g => <option key={g[0]}>{g[0]}</option>)}</select><input type="number" value={c.credits} onChange={e => setCourses(cs => cs.map((x, j) => j === i ? { ...x, credits: e.target.value } : x))} style={{ ...inputStyle, width: 60 }} placeholder="cr" /></div>)}<button onClick={() => setCourses(cs => [...cs, { name: "", grade: "B", credits: 3 }])} style={addBtnStyle}>+ Add Course</button><Result label="Your Current GPA" value={gpa} /><CopyButton text={`My GPA is ${gpa} — ToolForge`} /></div>;
}

function TipSplitter() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [bill, setBill] = useState(80); const [tip, setTip] = useState(18); const [people, setPeople] = useState(4);
  const tipAmt = (bill * tip / 100).toFixed(2); const total = (Number(bill) + Number(tipAmt)).toFixed(2); const perPerson = (total / people).toFixed(2);
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Bill Total (${sym})`}><NumInput val={bill} set={setBill} /></Row><Row label="Tip (%)"><div style={{ display: "flex", gap: 6 }}>{[10,15,18,20,25].map(p => <button key={p} onClick={() => setTip(p)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${tip===p?T.accent:T.border}`, background: tip===p?T.accentDim:"white", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans, sans-serif", color: tip===p?T.accent:T.muted }}>{p}%</button>)}</div></Row><Row label="Number of People"><NumInput val={people} set={setPeople} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Tip Amount" value={`${sym}${tipAmt}`} /><MiniResult label="Total Bill" value={`${sym}${total}`} /></div><Result label="Each Person Pays" value={`${sym}${perPerson}`} /><CopyButton text={`Bill split: ${sym}${perPerson} each — ToolForge`} /></div>;
}

function SavingsCalc() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [goal, setGoal] = useState(5000); const [saved, setSaved] = useState(500); const [monthly, setMonthly] = useState(200);
  const months = monthly > 0 ? Math.ceil(Math.max(0, goal - saved) / monthly) : "∞";
  const date = typeof months === "number" ? new Date(Date.now() + months * 30.5 * 864e5).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Never";
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Savings Goal (${sym})`}><NumInput val={goal} set={setGoal} /></Row><Row label={`Already Saved (${sym})`}><NumInput val={saved} set={setSaved} /></Row><Row label={`Monthly Contribution (${sym})`}><NumInput val={monthly} set={setMonthly} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Months Needed" value={months} /><MiniResult label="Years" value={typeof months === "number" ? (months/12).toFixed(1) : "∞"} /></div><Result label="Goal Reached By" value={date} /><CopyButton text={`I'll reach my ${sym}${goal} goal by ${date} — ToolForge`} /></div>;
}

function MarginCalc() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [cost, setCost] = useState(30); const [price, setPrice] = useState(75);
  const profit = (price - cost).toFixed(2); const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : 0; const markup = cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : 0;
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Cost Price (${sym})`}><NumInput val={cost} set={setCost} /></Row><Row label={`Selling Price (${sym})`}><NumInput val={price} set={setPrice} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Profit" value={`${sym}${profit}`} /><MiniResult label="Markup %" value={`${markup}%`} /></div><Result label="Profit Margin" value={`${margin}%`} color={margin >= 40 ? T.green : margin >= 20 ? T.accent : "#dc2626"} /><CopyButton text={`Profit margin: ${margin}% — ToolForge`} /><Tip>{margin >= 40 ? "Excellent margin!" : margin >= 20 ? "Decent margin." : "Low margin — review your pricing."}</Tip></div>;
}

function BreakEvenCalc() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [fixed, setFixed] = useState(3000); const [varCost, setVarCost] = useState(20); const [sellPrice, setSellPrice] = useState(50);
  const contrib = sellPrice - varCost; const units = contrib > 0 ? Math.ceil(fixed / contrib) : "∞"; const revenue = typeof units === "number" ? (units * sellPrice).toFixed(0) : "∞";
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Monthly Fixed Costs (${sym})`}><NumInput val={fixed} set={setFixed} /></Row><Row label={`Variable Cost per Unit (${sym})`}><NumInput val={varCost} set={setVarCost} /></Row><Row label={`Selling Price per Unit (${sym})`}><NumInput val={sellPrice} set={setSellPrice} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Contribution Margin" value={`${sym}${contrib}`} /><MiniResult label="Break-Even Revenue" value={`${sym}${Number(revenue).toLocaleString()}`} /></div><Result label="Units to Break Even" value={typeof units === "number" ? units.toLocaleString() : "∞"} /><CopyButton text={`Break-even: ${units} units — ToolForge`} /><Tip>Sell more than {units} units per month and you're profitable.</Tip></div>;
}

function DeadlineCountdown({ label, setLabel, target, setTarget, pinned, onTogglePin, running, onStart, onStop }) {
  const getDiff = () => new Date(target) - new Date();
  const fmt = () => { const diff = getDiff(); if (diff <= 0) return "Past due!"; const d = Math.floor(diff/864e5); const h = Math.floor((diff%864e5)/36e5); const m = Math.floor((diff%36e5)/6e4); return `${d}d ${h}h ${m}m`; };

  const diff = getDiff();
  const days = diff > 0 ? Math.floor(diff/864e5) : 0;
  const hours = diff > 0 ? Math.floor((diff%864e5)/36e5) : 0;
  const mins = diff > 0 ? Math.floor((diff%36e5)/6e4) : 0;

  return (
    <div>
      <Row label="Event / Deadline Name"><input value={label} onChange={e => setLabel(e.target.value)} style={inputStyle} /></Row>
      <Row label="Target Date"><input type="date" value={target} onChange={e => setTarget(e.target.value)} style={inputStyle} /></Row>
      {diff <= 0 ? <Result label={label} value="Past due!" color="#dc2626" /> : <>
        {running && (
          <div style={{ marginBottom: 12, padding: "12px 14px", background: T.purpleDim, borderRadius: 10, border: `1px solid ${T.purple}44` }}>
            <div style={{ fontSize: 10, color: T.purple, fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: 2 }}>COUNTING DOWN</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.purple, fontFamily: "Syne, sans-serif" }}>{fmt()}</div>
          </div>
        )}
        {!running && <><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}><MiniResult label="Days" value={days} /><MiniResult label="Hours" value={hours} /><MiniResult label="Minutes" value={mins} /></div><Result label={`Until: ${label}`} value={`${days}d ${hours}h ${mins}m`} /></>}
        <CopyButton text={`${days} days until ${label} — ToolForge`} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={running ? onStop : onStart} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: running ? "#fee2e2" : T.purple, color: running ? "#dc2626" : "white", fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
            {running ? "⏹ Stop" : "▶ Start Countdown"}
          </button>
          <button onClick={onTogglePin} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1.5px solid ${pinned ? T.purple : T.border}`, background: pinned ? T.purple : "white", color: pinned ? "white" : T.muted, fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
            {pinned ? "📌 Pinned" : "📌 Pin"}
          </button>
        </div>
      </>}
    </div>
  );
}

function PomodoroTimer({ modes, modeId, secondsLeft, running, pinned, sessions, paused, onStart, onPause, onReset, onSwitchMode, onTogglePin }) {
  const mode = modes.find(m => m.id === modeId);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const total = mode.mins * 60;
  const progress = 1 - secondsLeft / total;
  const circumference = 2 * Math.PI * 54;

  return (
    <div style={{ maxWidth: 360, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {modes.map(m => (
          <button key={m.id} onClick={() => onSwitchMode(m.id)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1.5px solid ${modeId === m.id ? m.color : T.border}`, background: modeId === m.id ? m.colorDim : "white", color: modeId === m.id ? m.color : T.muted, fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <div style={{ position: "relative", width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke={T.border} strokeWidth="8" />
            <circle cx="70" cy="70" r="54" fill="none" stroke={mode.color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "Syne, sans-serif", color: mode.color, lineHeight: 1 }}>{fmt(secondsLeft)}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontFamily: "DM Sans, sans-serif" }}>{mode.label}</div>
          </div>
        </div>
        {sessions > 0 && <div style={{ marginTop: 10, display: "flex", gap: 4 }}>{Array.from({ length: sessions }).map((_, i) => <span key={i} style={{ fontSize: 14 }}>🍅</span>)}</div>}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {!running ? (
          <button onClick={onStart} style={{ flex: 1, padding: "13px 0", background: mode.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, fontFamily: "Syne, sans-serif", cursor: "pointer" }}>
            {paused ? "▶ Resume" : "▶ Start"}
          </button>
        ) : (
          <button onClick={onPause} style={{ flex: 1, padding: "13px 0", background: mode.colorDim, color: mode.color, border: `2px solid ${mode.color}`, borderRadius: 12, fontSize: 15, fontWeight: 800, fontFamily: "Syne, sans-serif", cursor: "pointer" }}>⏸ Pause</button>
        )}
        <button onClick={onReset} style={{ padding: "13px 18px", background: "white", color: T.muted, border: `1.5px solid ${T.border}`, borderRadius: 12, fontSize: 13, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>↺ Reset</button>
        <button onClick={onTogglePin} style={{ padding: "13px 14px", background: pinned ? mode.colorDim : "white", color: pinned ? mode.color : T.muted, border: `1.5px solid ${pinned ? mode.color : T.border}`, borderRadius: 12, fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>📌</button>
      </div>
      {running && <div style={{ padding: "9px 12px", borderRadius: 9, background: mode.colorDim, border: `1px solid ${mode.color}33`, fontSize: 12, color: mode.color, fontFamily: "DM Sans, sans-serif", textAlign: "center" }}>← Go back — timer keeps running in the widget</div>}
    </div>
  );
}

function FloatingWidget({ widgets, removeWidget, activePill, setActivePill, onOpenTool }) {
  const [expanded, setExpanded] = useState(true);
  const [, forceUpdate] = useState(0);
  const tickRef = useRef(null);

  const keys = Object.keys(widgets);

  useEffect(() => {
    tickRef.current = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  useEffect(() => {
    if (keys.length > 0 && (!activePill || !widgets[activePill])) setActivePill(keys[0]);
  }, [widgets]);

  if (keys.length === 0) return null;

  const getDisplay = (w) => {
    if (w.type === "pomodoro") {
      const s = w.secondsLeft || 0;
      return (w.paused ? "⏸ " : "") + String(Math.floor(s/60)).padStart(2,"0") + ":" + String(s%60).padStart(2,"0");
    }
    if (w.type === "deadline") {
      const diff = new Date(w.targetDate) - new Date();
      if (diff <= 0) return "Past due!";
      return `${Math.floor(diff/864e5)}d ${Math.floor((diff%864e5)/36e5)}h ${Math.floor((diff%36e5)/6e4)}m`;
    }
    return "";
  };

  const active = widgets[activePill] || widgets[keys[0]];
  const activeId = widgets[activePill] ? activePill : keys[0];

  return (
    <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 200, maxWidth: 440, width: "calc(100% - 32px)", background: "white", borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "10px 12px" }}>
      {/* Pills row */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {keys.map(id => {
          const w = widgets[id];
          const isActive = id === activeId;
          const display = getDisplay(w);
          return (
            <div key={id} onClick={() => { setActivePill(id); onOpenTool(id); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 99, cursor: "pointer", border: `1.5px solid ${isActive ? w.color : T.border}`, background: isActive ? w.colorDim : T.bg, flex: isActive ? 1 : "0 0 auto", transition: "all 0.2s", minWidth: 0 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{w.icon}</span>
              {isActive && <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div style={{ fontSize: 10, color: w.color, fontFamily: "DM Sans, sans-serif", opacity: 0.8, whiteSpace: "nowrap" }}>{w.sessionLabel || w.label || "Active"}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: w.color, fontFamily: "Syne, sans-serif", whiteSpace: "nowrap" }}>{display}</div>
              </div>}
              {!isActive && <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, fontFamily: "Syne, sans-serif", whiteSpace: "nowrap" }}>{display}</div>}
            </div>
          );
        })}
        {/* Right controls */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, flexShrink: 0 }}>
          {keys.length > 1 && (
            <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", fontSize: 11, color: T.muted, cursor: "pointer", fontFamily: "DM Sans, sans-serif", padding: "4px 6px", borderRadius: 6, whiteSpace: "nowrap" }}>
              {expanded ? "less ▴" : `+${keys.length - 1} more ▾`}
            </button>
          )}
          <button onClick={() => { keys.forEach(id => removeWidget(id)); }} style={{ background: T.bg, border: "none", borderRadius: 8, color: T.muted, fontSize: 13, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      </div>

      {/* Expanded list — only when 2+ widgets */}
      {keys.length > 1 && expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
          {keys.map(id => {
            const w = widgets[id];
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <span style={{ fontSize: 14 }}>{w.icon}</span>
                <div style={{ flex: 1, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: w.color }}>{w.sessionLabel || w.label || w.toolId}</div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: w.color }}>{getDisplay(w)}</div>
                <button onClick={() => removeWidget(id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 13, padding: "0 4px" }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}





function TimezoneConverter() {
  const CITIES = [
    { label: "New York",       tz: "America/New_York",                  region: "Americas" },
    { label: "Los Angeles",    tz: "America/Los_Angeles",               region: "Americas" },
    { label: "Chicago",        tz: "America/Chicago",                   region: "Americas" },
    { label: "Toronto",        tz: "America/Toronto",                   region: "Americas" },
    { label: "Vancouver",      tz: "America/Vancouver",                 region: "Americas" },
    { label: "Mexico City",    tz: "America/Mexico_City",               region: "Americas" },
    { label: "São Paulo",      tz: "America/Sao_Paulo",                 region: "Americas" },
    { label: "Buenos Aires",   tz: "America/Argentina/Buenos_Aires",    region: "Americas" },
    { label: "Bogotá",         tz: "America/Bogota",                    region: "Americas" },
    { label: "Lima",           tz: "America/Lima",                      region: "Americas" },
    { label: "Santiago",       tz: "America/Santiago",                  region: "Americas" },
    { label: "London",         tz: "Europe/London",                     region: "Europe" },
    { label: "Paris",          tz: "Europe/Paris",                      region: "Europe" },
    { label: "Berlin",         tz: "Europe/Berlin",                     region: "Europe" },
    { label: "Madrid",         tz: "Europe/Madrid",                     region: "Europe" },
    { label: "Rome",           tz: "Europe/Rome",                       region: "Europe" },
    { label: "Amsterdam",      tz: "Europe/Amsterdam",                  region: "Europe" },
    { label: "Stockholm",      tz: "Europe/Stockholm",                  region: "Europe" },
    { label: "Warsaw",         tz: "Europe/Warsaw",                     region: "Europe" },
    { label: "Athens",         tz: "Europe/Athens",                     region: "Europe" },
    { label: "Kyiv",           tz: "Europe/Kyiv",                       region: "Europe" },
    { label: "Moscow",         tz: "Europe/Moscow",                     region: "Europe" },
    { label: "Istanbul",       tz: "Europe/Istanbul",                   region: "Europe" },
    { label: "Tel Aviv",       tz: "Asia/Jerusalem",                    region: "Middle East & Africa" },
    { label: "Beirut",         tz: "Asia/Beirut",                       region: "Middle East & Africa" },
    { label: "Dubai",          tz: "Asia/Dubai",                        region: "Middle East & Africa" },
    { label: "Riyadh",         tz: "Asia/Riyadh",                       region: "Middle East & Africa" },
    { label: "Cairo",          tz: "Africa/Cairo",                      region: "Middle East & Africa" },
    { label: "Nairobi",        tz: "Africa/Nairobi",                    region: "Middle East & Africa" },
    { label: "Lagos",          tz: "Africa/Lagos",                      region: "Middle East & Africa" },
    { label: "Johannesburg",   tz: "Africa/Johannesburg",               region: "Middle East & Africa" },
    { label: "Casablanca",     tz: "Africa/Casablanca",                 region: "Middle East & Africa" },
    { label: "Mumbai",         tz: "Asia/Kolkata",                      region: "Asia" },
    { label: "Delhi",          tz: "Asia/Kolkata",                      region: "Asia" },
    { label: "Karachi",        tz: "Asia/Karachi",                      region: "Asia" },
    { label: "Dhaka",          tz: "Asia/Dhaka",                        region: "Asia" },
    { label: "Bangkok",        tz: "Asia/Bangkok",                      region: "Asia" },
    { label: "Singapore",      tz: "Asia/Singapore",                    region: "Asia" },
    { label: "Kuala Lumpur",   tz: "Asia/Kuala_Lumpur",                 region: "Asia" },
    { label: "Jakarta",        tz: "Asia/Jakarta",                      region: "Asia" },
    { label: "Manila",         tz: "Asia/Manila",                       region: "Asia" },
    { label: "Hong Kong",      tz: "Asia/Hong_Kong",                    region: "Asia" },
    { label: "Beijing",        tz: "Asia/Shanghai",                     region: "Asia" },
    { label: "Shanghai",       tz: "Asia/Shanghai",                     region: "Asia" },
    { label: "Tokyo",          tz: "Asia/Tokyo",                        region: "Asia" },
    { label: "Seoul",          tz: "Asia/Seoul",                        region: "Asia" },
    { label: "Sydney",         tz: "Australia/Sydney",                  region: "Oceania" },
    { label: "Melbourne",      tz: "Australia/Melbourne",               region: "Oceania" },
    { label: "Brisbane",       tz: "Australia/Brisbane",                region: "Oceania" },
    { label: "Perth",          tz: "Australia/Perth",                   region: "Oceania" },
    { label: "Auckland",       tz: "Pacific/Auckland",                  region: "Oceania" },
    { label: "Wellington",     tz: "Pacific/Auckland",                  region: "Oceania" },
    { label: "UTC",            tz: "UTC",                               region: "UTC" },
  ];

  const UTC_OFFSETS = [
    { offset: -12,   label: "UTC−12",    regions: "Baker Island, Howland Island" },
    { offset: -11,   label: "UTC−11",    regions: "American Samoa, Niue" },
    { offset: -10,   label: "UTC−10",    regions: "Hawaii, Cook Islands" },
    { offset: -9.5,  label: "UTC−9:30",  regions: "Marquesas Islands" },
    { offset: -9,    label: "UTC−9",     regions: "Alaska, Gambier Islands" },
    { offset: -8,    label: "UTC−8",     regions: "Los Angeles, Vancouver, Tijuana" },
    { offset: -7,    label: "UTC−7",     regions: "Denver, Phoenix, Calgary" },
    { offset: -6,    label: "UTC−6",     regions: "Chicago, Mexico City, Guatemala" },
    { offset: -5,    label: "UTC−5",     regions: "New York, Toronto, Lima, Bogotá" },
    { offset: -4,    label: "UTC−4",     regions: "Santiago, Caracas, Halifax" },
    { offset: -3.5,  label: "UTC−3:30",  regions: "Newfoundland" },
    { offset: -3,    label: "UTC−3",     regions: "São Paulo, Buenos Aires, Montevideo" },
    { offset: -2,    label: "UTC−2",     regions: "South Georgia Island" },
    { offset: -1,    label: "UTC−1",     regions: "Azores, Cape Verde" },
    { offset: 0,     label: "UTC±0",     regions: "London (winter), Dublin, Lisbon, Accra" },
    { offset: 1,     label: "UTC+1",     regions: "Paris, Berlin, Rome, Lagos, Warsaw" },
    { offset: 2,     label: "UTC+2",     regions: "Tel Aviv, Cairo, Athens, Johannesburg" },
    { offset: 3,     label: "UTC+3",     regions: "Moscow, Nairobi, Riyadh, Kuwait" },
    { offset: 3.5,   label: "UTC+3:30",  regions: "Tehran" },
    { offset: 4,     label: "UTC+4",     regions: "Dubai, Baku, Tbilisi, Muscat" },
    { offset: 4.5,   label: "UTC+4:30",  regions: "Kabul" },
    { offset: 5,     label: "UTC+5",     regions: "Karachi, Tashkent, Yekaterinburg" },
    { offset: 5.5,   label: "UTC+5:30",  regions: "Mumbai, New Delhi, Colombo" },
    { offset: 5.75,  label: "UTC+5:45",  regions: "Kathmandu" },
    { offset: 6,     label: "UTC+6",     regions: "Dhaka, Almaty, Omsk" },
    { offset: 6.5,   label: "UTC+6:30",  regions: "Yangon (Myanmar)" },
    { offset: 7,     label: "UTC+7",     regions: "Bangkok, Hanoi, Jakarta, Krasnoyarsk" },
    { offset: 8,     label: "UTC+8",     regions: "Singapore, Beijing, Hong Kong, Perth" },
    { offset: 8.75,  label: "UTC+8:45",  regions: "Eucla (Australia)" },
    { offset: 9,     label: "UTC+9",     regions: "Tokyo, Seoul, Osaka, Yakutsk" },
    { offset: 9.5,   label: "UTC+9:30",  regions: "Adelaide, Darwin" },
    { offset: 10,    label: "UTC+10",    regions: "Sydney, Melbourne, Brisbane, Guam" },
    { offset: 10.5,  label: "UTC+10:30", regions: "Lord Howe Island" },
    { offset: 11,    label: "UTC+11",    regions: "Solomon Islands, Vanuatu, Noumea" },
    { offset: 12,    label: "UTC+12",    regions: "Auckland, Fiji, Kamchatka" },
    { offset: 12.75, label: "UTC+12:45", regions: "Chatham Islands" },
    { offset: 13,    label: "UTC+13",    regions: "Tonga, Samoa, Phoenix Islands" },
    { offset: 14,    label: "UTC+14",    regions: "Line Islands (Kiribati)" },
  ];

  const REGIONS = ["Americas", "Europe", "Middle East & Africa", "Asia", "Oceania", "UTC"];

  const pad = n => String(n).padStart(2, "0");

  const getCurrentTimeInTz = (tz) => {
    try {
      const now = new Date();
      const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
      return `${pad(tzDate.getHours())}:${pad(tzDate.getMinutes())}`;
    } catch { return "00:00"; }
  };

  const [tab, setTab] = useState("cities");
  const [fromZone, setFromZone] = useState("Europe/Berlin");
  const [inputTime, setInputTime] = useState(() => getCurrentTimeInTz("Europe/Berlin"));
  const [use24, setUse24] = useState(false);
  const [myUtcOffset, setMyUtcOffset] = useState(1);

  const handleFromZoneChange = (newTz) => {
    setFromZone(newTz);
    setInputTime(getCurrentTimeInTz(newTz));
  };

  const getOffsetMins = (tz, date) => {
    try {
      const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
      const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
      return (tzDate - utcDate) / 60000;
    } catch { return 0; }
  };

  const convert = (toTz) => {
    try {
      const [h, m] = inputTime.split(":").map(Number);
      const baseDate = new Date();
      baseDate.setHours(h, m, 0, 0);
      const fromOff = getOffsetMins(fromZone, baseDate);
      const toOff = getOffsetMins(toTz, baseDate);
      const utcMs = baseDate.getTime() - fromOff * 60000;
      const targetMs = utcMs + toOff * 60000;
      const d = new Date(targetMs);
      const hours = d.getHours();
      const mins = pad(d.getMinutes());
      const dayDiff = Math.round((toOff - fromOff) / 60 / 24);
      if (use24) return { time: `${pad(hours)}:${mins}`, day: dayDiff };
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return { time: `${h12}:${mins} ${ampm}`, day: dayDiff };
    } catch { return { time: "--:--", day: 0 }; }
  };

  const fromLabel = CITIES.find(z => z.tz === fromZone)?.label || "Selected";

  const diffColor = (diff) => {
    if (diff === 0) return T.teal;
    if (Math.abs(diff) <= 3) return T.green;
    if (Math.abs(diff) <= 6) return T.accent;
    return "#dc2626";
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["cities", "🌆 City Converter"], ["utc", "🌐 UTC Differences"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${tab === id ? T.teal : T.border}`, background: tab === id ? T.tealDim : "white", color: tab === id ? T.teal : T.muted, fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "cities" && (
        <div>
          <Row label="Your timezone">
            <select value={fromZone} onChange={e => handleFromZoneChange(e.target.value)} style={inputStyle}>
              {REGIONS.map(region => (
                <optgroup key={region} label={region}>
                  {CITIES.filter(z => z.region === region).map(z => (
                    <option key={z.label} value={z.tz}>{z.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Row>

          <Row label={`Time in ${fromLabel}`}>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="time" value={inputTime} onChange={e => setInputTime(e.target.value)}
                style={{ ...inputStyle, flex: 1, fontSize: 22, fontFamily: "Syne, sans-serif", fontWeight: 700, color: T.accent, padding: "10px 14px" }} />
              <button onClick={() => setUse24(!use24)}
                style={{ padding: "10px 14px", borderRadius: 9, border: `1px solid ${T.border}`, background: use24 ? T.tealDim : "white", color: use24 ? T.teal : T.muted, fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                {use24 ? "24h" : "12h"}
              </button>
            </div>
          </Row>

          {REGIONS.map(region => {
            const cities = CITIES.filter(z => z.region === region && !(z.tz === fromZone && z.label === fromLabel));
            if (!cities.length) return null;
            return (
              <div key={region} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>{region}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {cities.map(z => {
                    const result = convert(z.tz);
                    const dayLabel = result.day > 0 ? `+${result.day}d` : result.day < 0 ? `${result.day}d` : "";
                    return (
                      <div key={z.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", borderRadius: 9, background: T.bg, border: `1px solid ${T.border}` }}>
                        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: T.ink }}>{z.label}</span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: T.ink }}>{result.time}</span>
                          {dayLabel && <span style={{ fontSize: 10, color: T.accent, fontFamily: "Syne, sans-serif", fontWeight: 700 }}>{dayLabel}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <CopyButton text={CITIES.filter(z => z.label !== fromLabel).map(z => { const r = convert(z.tz); return `${z.label}: ${r.time}`; }).join("\n")} />
        </div>
      )}

      {tab === "utc" && (
        <div>
          <Row label="Your UTC offset">
            <select value={myUtcOffset} onChange={e => setMyUtcOffset(Number(e.target.value))} style={inputStyle}>
              {UTC_OFFSETS.map(u => (
                <option key={u.offset} value={u.offset}>{u.label} — {u.regions}</option>
              ))}
            </select>
          </Row>

          <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>
            Hour difference between you ({UTC_OFFSETS.find(u => u.offset === myUtcOffset)?.label}) and every other timezone:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {UTC_OFFSETS.filter(u => u.offset !== myUtcOffset).map(u => {
              const diff = u.offset - myUtcOffset;
              const sign = diff > 0 ? "+" : "";
              const hrs = Math.floor(Math.abs(diff));
              const mins = Math.round((Math.abs(diff) - hrs) * 60);
              const diffStr = mins ? `${sign}${diff < 0 ? "-" : ""}${hrs}h ${mins}m` : `${sign}${diff}h`;
              return (
                <div key={u.offset} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px 13px", borderRadius: 9, background: "white", border: `1px solid ${T.border}` }}>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: T.ink, marginBottom: 2 }}>{u.label}</div>
                    <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: T.muted }}>{u.regions}</div>
                  </div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, color: diffColor(diff), minWidth: 52, textAlign: "right", paddingTop: 2 }}>
                    {diffStr}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function UnitConverter() {
  const cats = { Length: { units: ["mm","cm","m","km","in","ft","yd","mi"], toBase: { mm:.001,cm:.01,m:1,km:1000,in:.0254,ft:.3048,yd:.9144,mi:1609.34 } }, Weight: { units: ["mg","g","kg","oz","lb"], toBase: { mg:.000001,g:.001,kg:1,oz:.0283495,lb:.453592 } }, Temperature: { units: ["°C","°F","K"], toBase: null }, Volume: { units: ["ml","L","fl oz","cup","gal"], toBase: { ml:.001,L:1,"fl oz":.0295735,cup:.236588,gal:3.78541 } } };
  const [catKey, setCatKey] = useState("Length"); const [fromUnit, setFromUnit] = useState("m"); const [toUnit, setToUnit] = useState("ft"); const [value, setValue] = useState(1);
  const cat = cats[catKey];
  const convert = () => { const v = Number(value); if (catKey === "Temperature") { if (fromUnit===toUnit) return String(v); if (fromUnit==="°C"&&toUnit==="°F") return (v*9/5+32).toFixed(2); if (fromUnit==="°C"&&toUnit==="K") return (v+273.15).toFixed(2); if (fromUnit==="°F"&&toUnit==="°C") return ((v-32)*5/9).toFixed(2); if (fromUnit==="°F"&&toUnit==="K") return ((v-32)*5/9+273.15).toFixed(2); if (fromUnit==="K"&&toUnit==="°C") return (v-273.15).toFixed(2); if (fromUnit==="K"&&toUnit==="°F") return ((v-273.15)*9/5+32).toFixed(2); } return (v*cat.toBase[fromUnit]/cat.toBase[toUnit]).toFixed(6).replace(/\.?0+$/,""); };
  return <div><Row label="Category"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{Object.keys(cats).map(k => <button key={k} onClick={() => { setCatKey(k); setFromUnit(cats[k].units[0]); setToUnit(cats[k].units[1]); }} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${catKey===k?T.accent:T.border}`, background:catKey===k?T.accentDim:"white", color:catKey===k?T.accent:T.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>{k}</button>)}</div></Row><Row label="Value"><NumInput val={value} set={setValue} /></Row><div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"end", marginBottom:10 }}><Row label="From"><select value={fromUnit} onChange={e=>setFromUnit(e.target.value)} style={inputStyle}>{cat.units.map(u=><option key={u}>{u}</option>)}</select></Row><div style={{ fontSize:18, color:T.muted, paddingBottom:4, textAlign:"center" }}>→</div><Row label="To"><select value={toUnit} onChange={e=>setToUnit(e.target.value)} style={inputStyle}>{cat.units.map(u=><option key={u}>{u}</option>)}</select></Row></div><Result label={`${value} ${fromUnit} =`} value={`${convert()} ${toUnit}`} /><CopyButton text={`${value} ${fromUnit} = ${convert()} ${toUnit} — ToolForge`} /></div>;
}

function StudyPlanner() {
  const [subject, setSubject] = useState("Calculus"); const [hours, setHours] = useState(10); const [days, setDays] = useState(5); const [technique, setTech] = useState("pomodoro");
  const techniques = { pomodoro:{label:"Pomodoro (25min on / 5min break)",mins:30}, deep:{label:"Deep Work (90min blocks)",mins:90}, spaced:{label:"Spaced Repetition (30min review)",mins:30} };
  const t = techniques[technique]; const sessions = Math.ceil((hours * 60) / t.mins); const perDay = Math.ceil(sessions / days);
  return <div><Row label="Subject / Topic"><input value={subject} onChange={e=>setSubject(e.target.value)} style={inputStyle} /></Row><Row label="Total Study Hours Needed"><NumInput val={hours} set={setHours} /></Row><Row label="Days Available"><NumInput val={days} set={setDays} /></Row><Row label="Study Technique">{Object.entries(techniques).map(([k,v]) => <div key={k} onClick={()=>setTech(k)} style={{ padding:"9px 12px", borderRadius:8, marginBottom:6, border:`1px solid ${technique===k?T.purple:T.border}`, background:technique===k?T.purpleDim:"white", cursor:"pointer", fontSize:12, color:technique===k?T.purple:T.muted, fontFamily:"DM Sans, sans-serif" }}>{v.label}</div>)}</Row><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}><MiniResult label="Sessions Needed" value={sessions} /><MiniResult label="Per Day" value={perDay} /></div><Result label={`Daily Plan for ${subject}`} value={`${perDay} × ${t.mins}min`} color={T.purple} /><CopyButton text={`Study plan: ${perDay} sessions/day for ${subject} — ToolForge`} /><Tip>Consistency beats cramming.</Tip></div>;
}

function CitationFormatter() {
  const [style, setStyle] = useState("APA"); const [type, setType] = useState("book"); const [author, setAuthor] = useState("Smith, J."); const [title, setTitle] = useState("The Art of Learning"); const [year, setYear] = useState("2023"); const [publisher, setPub] = useState("Penguin Press"); const [url, setUrl] = useState("");
  const cite = () => { if (style==="APA") return type==="website"?`${author} (${year}). ${title}. Retrieved from ${url}`:`${author} (${year}). *${title}*. ${publisher}.`; if (style==="MLA") return type==="website"?`${author} "${title}." ${year}${url ? ", " + url : ""}.`:`${author} *${title}*. ${publisher}, ${year}.`; return type==="website"?`${author} "${title}." Accessed ${year}${url ? ". " + url : ""}.`:`${author} *${title}*. ${publisher}, ${year}.`; };
  return <div><Row label="Citation Style"><div style={{ display:"flex", gap:6 }}>{["APA","MLA","Chicago"].map(s => <button key={s} onClick={()=>setStyle(s)} style={{ flex:1, padding:"7px 0", borderRadius:8, border:`1px solid ${style===s?T.purple:T.border}`, background:style===s?T.purpleDim:"white", color:style===s?T.purple:T.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:600, cursor:"pointer" }}>{s}</button>)}</div></Row><Row label="Source Type"><div style={{ display:"flex", gap:6 }}>{["book","website"].map(tp => <button key={tp} onClick={()=>setType(tp)} style={{ flex:1, padding:"7px 0", borderRadius:8, border:`1px solid ${type===tp?T.purple:T.border}`, background:type===tp?T.purpleDim:"white", color:type===tp?T.purple:T.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>{tp.charAt(0).toUpperCase()+tp.slice(1)}</button>)}</div></Row><Row label="Author (Last, F.)"><input value={author} onChange={e=>setAuthor(e.target.value)} style={inputStyle} /></Row><Row label="Title"><input value={title} onChange={e=>setTitle(e.target.value)} style={inputStyle} /></Row><Row label="Year"><input value={year} onChange={e=>setYear(e.target.value)} style={inputStyle} /></Row>{type==="book"&&<Row label="Publisher"><input value={publisher} onChange={e=>setPub(e.target.value)} style={inputStyle} /></Row>}{type==="website"&&<Row label="URL"><input value={url} onChange={e=>setUrl(e.target.value)} style={inputStyle} placeholder="https://..." /></Row>}<div style={{ marginTop:14, padding:14, borderRadius:10, background:T.purpleDim, border:`1px solid ${T.purple}33`, fontSize:13, color:T.ink, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>{cite()}</div><CopyButton text={cite()} /></div>;
}

function SalaryHelper() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [role, setRole] = useState("Software Engineer"); const [current, setCurrent] = useState(70000); const [experience, setExp] = useState(3); const [location, setLocation] = useState("New York");
  const target = Math.round(current * 1.15 / 1000) * 1000; const stretch = Math.round(current * 1.25 / 1000) * 1000;
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label="Job Title"><input value={role} onChange={e=>setRole(e.target.value)} style={inputStyle} /></Row><Row label={`Current / Offered Salary (${sym})`}><NumInput val={current} set={setCurrent} /></Row><Row label="Years of Experience"><NumInput val={experience} set={setExp} /></Row><Row label="Location"><input value={location} onChange={e=>setLocation(e.target.value)} style={inputStyle} /></Row><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:12 }}><MiniResult label="Target Ask" value={`${sym}${target.toLocaleString()}`} /><MiniResult label="Stretch Goal" value={`${sym}${stretch.toLocaleString()}`} /></div><Result label="Negotiation Range" value={`${sym}${target.toLocaleString()} – ${sym}${stretch.toLocaleString()}`} color={T.blue} /><CopyButton text={`Salary range for ${role}: ${sym}${target.toLocaleString()} – ${sym}${stretch.toLocaleString()} — ToolForge`} /><Tip>Always ask for 15–25% above your target. Companies expect negotiation.</Tip></div>;
}

const GROQ_PROMPTS = {
  "Cover Letter Generator": "You are an expert cover letter writer. Write a concise, compelling cover letter based on the job description provided. Output the letter only, no preamble.",
  "LinkedIn Bio Writer": "You are a LinkedIn profile expert. Write a punchy, professional LinkedIn About section in first person. Max 3 short paragraphs. Output only the bio.",
  "Cold Email Generator": "You are a cold email copywriter. Write a concise cold email. First line: Subject: [subject]. Then the email body. Keep it under 150 words.",
  "Business Tagline Generator": "You are a brand copywriter. Generate 5 punchy, memorable taglines. Output as a numbered list only.",
  "Essay Outline Generator": "You are an academic writing coach. Create a structured essay outline with intro, 3-4 body sections, and conclusion. Output the outline only.",
  "Client Proposal Writer": "You are a freelance consultant. Write a professional project proposal with: Overview, Scope, Timeline, Investment. Output the proposal only.",
  "Invoice Text Generator": "You are an invoicing assistant. Generate clean invoice line items and a payment note. Output invoice text only.",
  "Marketing Email Writer": "You are an email marketer. Write a high-converting marketing email with subject, preview text, body and CTA. Output the email only.",
};

function AIToolPlaceholder({ name, proToken, onNeedUpgrade, onTokenUpdate }) {
  const [input, setInput] = useState(""); const [output, setOutput] = useState(""); const [loading, setLoading] = useState(false); const [mode, setMode] = useState("groq"); const [error, setError] = useState("");
  const [groqCount, setGroqCount] = useState(() => { try { const s = localStorage.getItem("tf_groq_usage"); if (!s) return 0; const { date, count } = JSON.parse(s); return new Date().toDateString() === date ? count : 0; } catch { return 0; } });
  const groqAtLimit = groqCount >= 3; const hasClaude = proToken && proToken.generations_left > 0;

  const generateGroq = async () => {
    if (!input.trim() || groqAtLimit) return;
    setLoading(true); setOutput(""); setError("");
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY || ""}` }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1000, messages: [{ role: "system", content: GROQ_PROMPTS[name] || `You are a professional ${name} tool. Output only the result.` }, { role: "user", content: input }] }) });
      const data = await res.json(); const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty"); setOutput(text);
      const n = groqCount + 1; setGroqCount(n); localStorage.setItem("tf_groq_usage", JSON.stringify({ date: new Date().toDateString(), count: n }));
    } catch { setError("Generation failed. Please try again."); }
    setLoading(false);
  };

  const generateClaude = async () => {
    if (!input.trim() || !hasClaude) return;
    setLoading(true); setOutput(""); setError("");
    try {
      const res = await fetch("/api/generate-claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: proToken.token, toolName: name, userInput: input }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Generation failed."); setLoading(false); return; }
      setOutput(data.result); onTokenUpdate({ ...proToken, generations_left: data.generations_left });
    } catch { setError("Server error. Please try again."); }
    setLoading(false);
  };

  const canGenerate = input.trim() && !loading && (mode === "groq" ? !groqAtLimit : hasClaude);

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <div onClick={() => setMode("groq")} style={{ flex:1, padding:"10px 12px", borderRadius:10, border:`1.5px solid ${mode==="groq"?T.green:T.border}`, background:mode==="groq"?T.greenDim:"white", cursor:"pointer", textAlign:"center" }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:mode==="groq"?T.green:T.muted }}>🆓 Free (Groq AI)</div>
          <div style={{ fontSize:10, color:mode==="groq"?T.green:T.muted, marginTop:2 }}>{groqAtLimit?"Limit reached today":`${groqCount}/3 used today`}</div>
        </div>
        <div onClick={() => { if (!hasClaude) onNeedUpgrade(); else setMode("claude"); }} style={{ flex:1, padding:"10px 12px", borderRadius:10, border:`1.5px solid ${mode==="claude"?T.gold:T.border}`, background:mode==="claude"?T.goldDim:"white", cursor:"pointer", textAlign:"center" }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:mode==="claude"?T.gold:T.muted }}>✦ Premium (Claude Sonnet AI)</div>
          <div style={{ fontSize:10, color:mode==="claude"?T.gold:T.muted, marginTop:2 }}>{proToken && proToken.generations_left === 0 ? "Out of generations" : hasClaude ? `${proToken.generations_left} left` : "Unlock from $2.99"}</div>
        </div>
      </div>
      {mode==="claude" && proToken && proToken.generations_left === 0 && (
        <a href={`${import.meta.env.VITE_LS_TOPUP_URL || "#"}?checkout[custom][existing_token]=${proToken.token}&checkout[custom][type]=topup`} style={{ display:"block", marginBottom:10, padding:"12px 14px", borderRadius:10, background:T.goldDim, border:`2px solid ${T.gold}`, textDecoration:"none", textAlign:"center" }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.gold, marginBottom:2 }}>Top up 100 generations — $2.99</div>
          <div style={{ fontSize:11, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>Added instantly to your existing account</div>
        </a>
      )}
      {mode==="claude" && (!proToken || proToken.generations_left > 0) && <div style={{ marginBottom:10, padding:"8px 12px", borderRadius:8, background:T.goldDim, border:`1px solid ${T.gold}44`, fontSize:11, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>✦ Claude produces significantly more polished output — ideal for client-facing work.</div>}
      {mode==="groq" && groqAtLimit && <div style={{ marginBottom:10, padding:"8px 12px", borderRadius:8, background:T.accentDim, border:`1px solid ${T.accent}44`, fontSize:11, color:T.accent, fontFamily:"DM Sans, sans-serif" }}>Daily free limit reached. Resets at midnight — or unlock Premium Claude now.</div>}
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={mode==="claude"?"Describe in detail for best Claude results...":"Describe what you need..."} disabled={mode==="groq"&&groqAtLimit} style={{ ...inputStyle, width:"100%", height:90, resize:"vertical", boxSizing:"border-box", fontFamily:"DM Sans, sans-serif", opacity:(mode==="groq"&&groqAtLimit)?0.5:1 }} />
      <button onClick={() => mode==="claude"?generateClaude():generateGroq()} disabled={!canGenerate} style={{ width:"100%", padding:"11px 0", borderRadius:10, border:"none", background:!canGenerate?T.border:mode==="claude"?T.gold:T.green, color:!canGenerate?T.muted:"white", fontSize:13, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:canGenerate?"pointer":"default", marginTop:8, letterSpacing:0.5 }}>
        {loading?"Generating…":mode==="claude"?"✦ Generate with Claude Sonnet AI":"Generate with Groq AI"}
      </button>
      {error && <div style={{ marginTop:10, padding:"9px 12px", borderRadius:8, background:"#fee2e2", border:"1px solid #fca5a5", fontSize:12, color:"#dc2626", fontFamily:"DM Sans, sans-serif" }}>{error}</div>}
      {output && <><div style={{ marginTop:14, padding:14, borderRadius:10, background:T.bg, border:`1px solid ${T.border}`, fontSize:13, lineHeight:1.7, color:T.ink, whiteSpace:"pre-wrap", fontFamily:"DM Sans, sans-serif" }}>{output}</div><CopyButton text={output} /></>}
    </div>
  );
}

function WordCounter() {
  const [text, setText] = useState("");
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim() === "" ? 0 : (text.match(/[.!?]+/g) || []).length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const stats = [
    { label: "Words", value: words.toLocaleString(), color: T.accent },
    { label: "Characters", value: chars.toLocaleString(), color: T.blue },
    { label: "No Spaces", value: charsNoSpaces.toLocaleString(), color: T.purple },
    { label: "Sentences", value: sentences.toLocaleString(), color: T.teal },
    { label: "Paragraphs", value: paragraphs.toLocaleString(), color: T.gold },
    { label: "Reading Time", value: `~${readingTime}min`, color: "#dc2626" },
  ];
  return (
    <div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste or type your text here…"
        style={{ width: "100%", minHeight: 200, padding: "13px 14px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 14, fontFamily: "DM Sans, sans-serif", color: T.ink, background: "#fdfcfb", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
        onFocus={e => (e.target.style.borderColor = T.accent)}
        onBlur={e => (e.target.style.borderColor = T.border)}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "Syne, sans-serif", lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 3, fontFamily: "DM Sans, sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>
      {text.length > 0 && (
        <button onClick={() => setText("")} style={{ marginTop: 10, padding: "7px 16px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 12, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>Clear</button>
      )}
    </div>
  );
}

function BMICalculator() {
  const [unit, setUnit] = useState("metric");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [bmi, setBmi] = useState(null);
  const getCategory = (b) => {
    if (b < 18.5) return { label: "Underweight", color: T.blue, bg: T.blueDim };
    if (b < 25)   return { label: "Healthy Weight", color: T.green, bg: T.greenDim };
    if (b < 30)   return { label: "Overweight", color: T.gold, bg: T.goldDim };
    return           { label: "Obese", color: "#dc2626", bg: "#fee2e2" };
  };
  const calculate = () => {
    let val;
    if (unit === "metric") {
      const h = parseFloat(height) / 100; const w = parseFloat(weight);
      if (!h || !w || h <= 0 || w <= 0) return;
      val = w / (h * h);
    } else {
      const inches = parseFloat(heightFt) * 12 + parseFloat(heightIn || 0); const w = parseFloat(weight);
      if (!inches || !w) return;
      val = (w / (inches * inches)) * 703;
    }
    setBmi(Math.round(val * 10) / 10);
  };
  const cat = bmi ? getCategory(bmi) : null;
  const iStyle = { ...inputStyle, fontSize: 14, padding: "10px 12px" };
  return (
    <div>
      <div style={{ display: "flex", background: T.bg, borderRadius: 10, padding: 3, marginBottom: 18, width: "fit-content" }}>
        {["metric","imperial"].map(u => (
          <button key={u} onClick={() => { setUnit(u); setBmi(null); }} style={{ padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, background: unit === u ? T.accent : "transparent", color: unit === u ? "white" : T.muted, transition: "all 0.15s" }}>
            {u === "metric" ? "Metric (kg/cm)" : "Imperial (lb/ft)"}
          </button>
        ))}
      </div>
      {unit === "metric" ? (
        <>
          <Row label="Height (cm)"><input type="number" placeholder="e.g. 175" value={height} onChange={e => setHeight(e.target.value)} style={iStyle} /></Row>
          <Row label="Weight (kg)"><input type="number" placeholder="e.g. 70" value={weight} onChange={e => setWeight(e.target.value)} style={iStyle} /></Row>
        </>
      ) : (
        <>
          <Row label="Height"><div style={{ display: "flex", gap: 8 }}><input type="number" placeholder="ft" value={heightFt} onChange={e => setHeightFt(e.target.value)} style={{ ...iStyle, flex: 1 }} /><input type="number" placeholder="in" value={heightIn} onChange={e => setHeightIn(e.target.value)} style={{ ...iStyle, flex: 1 }} /></div></Row>
          <Row label="Weight (lbs)"><input type="number" placeholder="e.g. 154" value={weight} onChange={e => setWeight(e.target.value)} style={iStyle} /></Row>
        </>
      )}
      <button onClick={calculate} style={{ width: "100%", marginTop: 6, padding: "12px 0", background: T.accent, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "Syne, sans-serif", cursor: "pointer" }}>Calculate BMI</button>
      {bmi && cat && (
        <div style={{ marginTop: 20, background: cat.bg, border: `1.5px solid ${cat.color}44`, borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: cat.color, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>{bmi}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: cat.color, marginTop: 6, fontFamily: "Syne, sans-serif" }}>{cat.label}</div>
          <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 8, marginTop: 16, marginBottom: 4 }}>
            {[{ c: "#93c5fd", w: 25 }, { c: "#4ade80", w: 33 }, { c: "#fbbf24", w: 25 }, { c: "#f87171", w: 17 }].map((s, i) => (
              <div key={i} style={{ flex: s.w, background: s.c }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>
            <span>Under</span><span>Healthy</span><span>Over</span><span>Obese</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 12, fontFamily: "DM Sans, sans-serif" }}>BMI is a screening tool, not a medical diagnosis.</div>
        </div>
      )}
    </div>
  );
}

function QRGenerator() {
  const [input, setInput] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [size, setSize] = useState(256);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true); setError("");
    try {
      const url = await QRCodeLib.toDataURL(input.trim(), {
        width: size, margin: 2,
        color: { dark: "#0f0f0d", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      setQrUrl(url);
    } catch { setError("Failed to generate. Please try again."); }
    setLoading(false);
  };

  const download = () => {
    const a = document.createElement("a");
    a.download = "qrcode.png"; a.href = qrUrl; a.click();
  };

  return (
    <div>
      <Row label="URL or Text">
        <input type="text" placeholder="https://yoursite.com or any text…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} style={{ ...inputStyle, fontSize: 14, padding: "10px 12px" }} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.border)} />
      </Row>
      <Row label="Size">
        <div style={{ display: "flex", gap: 8 }}>
          {[{ label: "Small", val: 128 }, { label: "Medium", val: 256 }, { label: "Large", val: 512 }].map(s => (
            <button key={s.val} onClick={() => setSize(s.val)} style={{ flex: 1, padding: "7px 0", border: `1.5px solid ${size === s.val ? T.teal : T.border}`, borderRadius: 8, cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: size === s.val ? 700 : 400, background: size === s.val ? T.tealDim : "white", color: size === s.val ? T.teal : T.muted, transition: "all 0.15s" }}>
              {s.label}
            </button>
          ))}
        </div>
      </Row>
      <button onClick={generate} disabled={!input.trim() || loading} style={{ width: "100%", marginTop: 4, padding: "12px 0", background: input.trim() ? T.accent : T.border, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "Syne, sans-serif", cursor: input.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
        {loading ? "Generating…" : "Generate QR Code"}
      </button>
      {error && <div style={{ marginTop: 10, padding: "9px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, fontFamily: "DM Sans, sans-serif" }}>{error}</div>}
      {qrUrl && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 20, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
          <img src={qrUrl} alt="QR Code" style={{ borderRadius: 8, boxShadow: "0 2px 16px #0f0f0d14", maxWidth: "100%" }} />
          <button onClick={download} style={{ padding: "9px 24px", background: T.ink, color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>⬇️ Download PNG</button>
        </div>
      )}
    </div>
  );
}

function UpgradeModal({ onClose }) {
  const onetimeUrl = import.meta.env.VITE_LS_ONETIME_URL || "#";
  const proUrl = import.meta.env.VITE_LS_PRO_URL || "#";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,15,13,0.6)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 }} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:T.card, borderRadius:20, padding:24, width:"100%", maxWidth:440, boxShadow:"0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.ink }}>Unlock Claude Sonnet AI ✦</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.muted }}>✕</button>
        </div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:16, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>Claude produces noticeably better cover letters, proposals, and emails — polished enough to send to real clients.</div>
        <a href={onetimeUrl} style={{ textDecoration:"none", display:"block", marginBottom:10 }}>
          <div style={{ padding:16, borderRadius:14, border:`2px solid ${T.accent}`, background:T.accentDim, cursor:"pointer" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.accent }}>One-Time Pack</div><div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.accent }}>$2.99</div></div>
            <div style={{ fontSize:12, color:T.accent, fontFamily:"DM Sans, sans-serif" }}>50 Claude generations · Never expires · No subscription</div>
          </div>
        </a>
        <a href={proUrl} style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
          <div style={{ padding:16, borderRadius:14, border:`2px solid ${T.gold}`, background:T.goldDim, cursor:"pointer", position:"relative" }}>
            <div style={{ position:"absolute", top:10, right:10, fontSize:9, padding:"3px 8px", borderRadius:99, background:T.gold, color:"white", fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>BEST VALUE</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.gold }}>Pro Monthly</div><div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.gold }}>$7.99<span style={{ fontSize:12, fontWeight:400 }}>/mo</span></div></div>
            <div style={{ fontSize:12, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>400 Claude generations/month · No ads · Cancel anytime</div>
          </div>
        </a>
        <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:8, background:"#f0f9ff", border:"1px solid #bae6fd", fontSize:11, color:"#0369a1", fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>
          ⚠️ <strong>Important:</strong> Your access token is saved in this browser and emailed in your receipt. Save it somewhere safe to restore access on any device.
        </div>
        <div style={{ textAlign:"center", fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>Secure payment via Lemon Squeezy · Token activated instantly after purchase</div>
      </div>
    </div>
  );
}

function SuccessPage({ orderId, onDone }) {
  const [status, setStatus] = useState("loading"); const [tokenInfo, setTokenInfo] = useState(null);
  useEffect(() => {
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/get-token?order_id=${orderId}`);
        if (res.ok) { const data = await res.json(); localStorage.setItem("tf_pro_token", JSON.stringify(data)); setTokenInfo(data); setStatus("ready"); }
        else if (res.status === 404 && attempts < 10) setTimeout(poll, 1500);
        else setStatus("error");
      } catch { if (attempts < 10) setTimeout(poll, 1500); else setStatus("error"); }
    };
    poll();
  }, [orderId]);

  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:40, background:T.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:T.card, borderRadius:20, padding:28, textAlign:"center", border:`1px solid ${T.border}`, width:"100%" }}>
        {status==="loading" && <><div style={{ fontSize:40, marginBottom:16 }}>⏳</div><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:18, color:T.ink, marginBottom:8 }}>Activating your access…</div><div style={{ fontSize:13, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>This takes a few seconds. Please wait.</div></>}
        {status==="ready" && tokenInfo && <>
          <div style={{ fontSize:40, marginBottom:16 }}>🎉</div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:20, color:T.ink, marginBottom:8 }}>You're all set!</div>
          <div style={{ fontSize:13, color:T.muted, marginBottom:16, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>{tokenInfo.type==="pro"?`Pro access activated. You have ${tokenInfo.generations_left} Claude generations this month.`:`Your one-time pack is ready. You have ${tokenInfo.generations_left} Claude generations.`}</div>
          <div style={{ padding:14, borderRadius:10, background:T.goldDim, border:`1px solid ${T.gold}44`, marginBottom:12, wordBreak:"break-all", textAlign:"left" }}>
            <div style={{ fontSize:10, color:T.gold, marginBottom:4, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>YOUR ACCESS TOKEN</div>
            <div style={{ fontSize:12, color:T.gold, fontFamily:"DM Sans, sans-serif", marginBottom:8, lineHeight:1.5 }}>{tokenInfo.token}</div>
            <CopyButton text={tokenInfo.token} />
          </div>
          <div style={{ marginBottom:16, padding:"12px 14px", borderRadius:10, background:"#f0f9ff", border:"1px solid #bae6fd", fontSize:12, color:"#0369a1", fontFamily:"DM Sans, sans-serif", lineHeight:1.8, textAlign:"left" }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, marginBottom:6 }}>⚠️ Save your token — here's what to know:</div>
            <div>✓ Saved automatically in <strong>this browser</strong></div>
            <div>✓ Also in your <strong>receipt email</strong> — check your inbox</div>
            <div>✓ To use on another device, click <strong>"Restore access"</strong> on the homepage and paste your token</div>
            <div>✗ Clearing your browser data will remove the token from this device</div>
          </div>
          <button onClick={onDone} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:T.accent, color:"white", fontSize:14, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>Start Using Claude Sonnet AI →</button>
        </>}
        {status==="error" && <>
          <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:18, color:T.ink, marginBottom:8 }}>Taking longer than expected</div>
          <div style={{ fontSize:13, color:T.muted, marginBottom:20, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>Your payment was received! Check your email for your access token, or contact support.</div>
          <button onClick={onDone} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:T.accent, color:"white", fontSize:14, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>Back to ToolForge</button>
        </>}
      </div>
    </div>
  );
}

function ToolView({ tool, onBack, proToken, onNeedUpgrade, onTokenUpdate, addWidget, removeWidget, pomoProps, dlProps }) {
  const cat = CATEGORIES.find(c => c.id === tool.catId);
  const renderTool = () => {
    switch (tool.id) {
      case "rate": return <RateCalc />; case "project": return <ProjectEstimator />; case "gpa": return <GPACalc />; case "tip": return <TipSplitter />; case "savings": return <SavingsCalc />; case "margin": return <MarginCalc />; case "breakeven": return <BreakEvenCalc />; case "unit": return <UnitConverter />; case "timezone": return <TimezoneConverter />; case "study": return <StudyPlanner />; case "citation": return <CitationFormatter />; case "salary": return <SalaryHelper />; case "word-counter": return <WordCounter />; case "bmi": return <BMICalculator />; case "qr-generator": return <QRGenerator />;
      case "deadline": return <DeadlineCountdown {...dlProps} />;
      case "pomodoro": return <PomodoroTimer {...pomoProps} />;
      default: if (AI_TOOLS.includes(tool.name)) return <AIToolPlaceholder name={tool.name} proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      return <div style={{ textAlign:"center", padding:"30px 0", color:T.muted, fontFamily:"DM Sans, sans-serif" }}><div style={{ fontSize:36, marginBottom:10 }}>{tool.icon}</div><div style={{ fontSize:14 }}>Coming soon!</div></div>;
    }
  };
  return (
    <div>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:T.muted, fontSize:13, cursor:"pointer", fontFamily:"DM Sans, sans-serif", marginBottom:16, padding:0 }}>← Back to all tools</button>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <div style={{ width:46, height:46, borderRadius:12, background:cat.colorDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{tool.icon}</div>
        <div><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:17, color:T.ink }}>{tool.name}</div><div style={{ fontSize:12, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{tool.desc}</div></div>
      </div>
      {renderTool()}
    </div>
  );
}

function ToolCard({ tool, onClick }) {
  const [hov, setHov] = useState(false); const isAI = AI_TOOLS.includes(tool.name);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ padding:"14px 13px", borderRadius:13, border:`1px solid ${hov?tool.catColor:T.border}`, background:hov?tool.catColorDim:T.card, cursor:"pointer", transition:"all 0.18s", boxShadow:hov?`0 4px 20px ${tool.catColor}18`:"0 1px 6px #0f0f0d08" }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{tool.icon}</div>
      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:T.ink, marginBottom:4, lineHeight:1.3 }}>{tool.name}</div>
      <div style={{ fontSize:11, color:T.muted, lineHeight:1.4, marginBottom:isAI?8:0 }}>{tool.desc}</div>
      {isAI && <span style={{ fontSize:9, padding:"2px 7px", borderRadius:99, background:T.accentDim, color:T.accent, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>AI POWERED</span>}
    </div>
  );
}

export default function ToolForge() {
  const [activeCat, setActiveCat] = useState("all");
  const [activeTool, setActiveTool] = useState(null);
  const [search, setSearch] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [widgets, setWidgets] = useState({});
  const [activePill, setActivePill] = useState(null);
  const addWidget = (id, data) => setWidgets(w => ({ ...w, [id]: data }));
  const removeWidgetRef = useRef(null);
  const removeWidget = (id) => { if (removeWidgetRef.current) removeWidgetRef.current(id); };
  const [proToken, setProToken] = useState(() => { try { const s = localStorage.getItem("tf_pro_token"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const handleTokenUpdate = (t) => { setProToken(t); localStorage.setItem("tf_pro_token", JSON.stringify(t)); };

  // ── Lifted Pomodoro state — survives navigation ──
  const POMO_MODES = [
    { id: "focus",  label: "Focus",       icon: "🍅", mins: 25, color: T.accent,  colorDim: T.accentDim },
    { id: "short",  label: "Short Break", icon: "☕", mins: 5,  color: T.green,   colorDim: T.greenDim },
    { id: "long",   label: "Long Break",  icon: "🌿", mins: 15, color: T.teal,    colorDim: T.tealDim },
  ];
  const [pomoModeId, setPomoModeId] = useState("focus");
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoPinned, setPomoPinned] = useState(false);
  const [pomoSessions, setPomoSessions] = useState(0);
  const [pomoPaused, setPomoPaused] = useState(false);
  const pomoIntervalRef = useRef(null);

  const clearPomoTick = () => { if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current); };
  const pomoMode = POMO_MODES.find(m => m.id === pomoModeId);

  const pomoDoPin = (secs, paused) => {
    setPomoPinned(true);
    addWidget("pomodoro", { toolId: "pomodoro", icon: pomoMode.icon, color: pomoMode.color, colorDim: pomoMode.colorDim, type: "pomodoro", sessionLabel: pomoMode.label, secondsLeft: secs, paused });
  };
  const pomoDoUnpin = () => { setPomoPinned(false); removeWidget("pomodoro"); };

  const pomoStart = () => {
    clearPomoTick();
    setPomoRunning(true); setPomoPaused(false);
    if (!pomoPinned) pomoDoPin(pomoSeconds, false);
    pomoIntervalRef.current = setInterval(() => {
      setPomoSeconds(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearPomoTick(); setPomoRunning(false); setPomoPaused(false);
          setPomoSessions(s => pomoModeId === "focus" ? s + 1 : s);
          pomoDoUnpin(); return 0;
        }
        addWidget("pomodoro", { toolId: "pomodoro", icon: pomoMode.icon, color: pomoMode.color, colorDim: pomoMode.colorDim, type: "pomodoro", sessionLabel: pomoMode.label, secondsLeft: next, paused: false });
        return next;
      });
    }, 1000);
  };
  const pomocPause = () => {
    clearPomoTick(); setPomoRunning(false); setPomoPaused(true);
    addWidget("pomodoro", { toolId: "pomodoro", icon: pomoMode.icon, color: pomoMode.color, colorDim: pomoMode.colorDim, type: "pomodoro", sessionLabel: pomoMode.label, secondsLeft: pomoSeconds, paused: true });
  };
  const pomoReset = () => {
    clearPomoTick(); setPomoRunning(false); setPomoPaused(false);
    setPomoSeconds(pomoMode.mins * 60); pomoDoUnpin();
  };
  const pomoSwitchMode = (id) => {
    clearPomoTick(); setPomoRunning(false); setPomoPaused(false);
    setPomoModeId(id); setPomoSeconds(POMO_MODES.find(m => m.id === id).mins * 60); pomoDoUnpin();
  };
  const pomoTogglePin = () => { if (pomoPinned) pomoDoUnpin(); else pomoDoPin(pomoSeconds, !pomoRunning); };
  useEffect(() => () => clearPomoTick(), []);

  // ── Lifted Deadline state — survives navigation ──
  const [dlPinned, setDlPinned] = useState(false);
  const [dlRunning, setDlRunning] = useState(false);
  const [dlLabel, setDlLabel] = useState("Project deadline");
  const dlDefaultTarget = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().split("T")[0]; };
  const [dlTarget, setDlTarget] = useState(dlDefaultTarget);
  const dlTickRef = useRef(null);

  const dlClearTick = () => { if (dlTickRef.current) clearInterval(dlTickRef.current); };
  const dlStartCountdown = () => {
    setDlRunning(true);
    dlTickRef.current = setInterval(() => {
      // force widget to re-read targetDate every second (deadline is date-based so just re-set widget)
      setWidgets(w => w.deadline ? { ...w, deadline: { ...w.deadline, _tick: Date.now() } } : w);
    }, 1000);
  };
  const dlStopCountdown = () => { setDlRunning(false); dlClearTick(); };

  const dlPin = () => {
    setDlPinned(true);
    addWidget("deadline", { toolId: "deadline", icon: "🗓", color: T.purple, colorDim: T.purpleDim, type: "deadline", label: dlLabel, targetDate: dlTarget });
  };
  const dlUnpin = () => { setDlPinned(false); dlStopCountdown(); removeWidget("deadline"); };
  const dlHandlePin = () => { if (dlPinned) dlUnpin(); else dlPin(); };
  // keep widget in sync when label/target change while pinned
  useEffect(() => {
    if (dlPinned) addWidget("deadline", { toolId: "deadline", icon: "🗓", color: T.purple, colorDim: T.purpleDim, type: "deadline", label: dlLabel, targetDate: dlTarget });
  }, [dlLabel, dlTarget, dlPinned]);
  useEffect(() => () => dlClearTick(), []);

  // Wire removeWidget after all state setters are defined
  removeWidgetRef.current = (id) => {
    setWidgets(w => { const n = { ...w }; delete n[id]; return n; });
    setActivePill(p => p === id ? null : p);
    if (id === "deadline") { setDlPinned(false); setDlRunning(false); if (dlTickRef.current) clearInterval(dlTickRef.current); }
    if (id === "pomodoro") { setPomoPinned(false); }
  };

  const openTool = (toolId) => { const tool = ALL_TOOLS.find(t => t.id === toolId); if (tool) setActiveTool(tool); };

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");
  if (orderId) return <SuccessPage orderId={orderId} onDone={() => { window.history.replaceState({}, "", "/"); try { const s = localStorage.getItem("tf_pro_token"); if (s) setProToken(JSON.parse(s)); } catch {} window.location.reload(); }} />;

  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = ALL_TOOLS.filter(t =>
    (activeCat === "all" || t.catId === activeCat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  };

  const responsiveGrid = `
    @media (max-width: 400px) { .tf-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  `;

  if (activeTool) return (
    <>
      <style>{responsiveGrid}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 20, background: T.bg, minHeight: "100vh" }}>
        <div style={{ background: T.card, borderRadius: 16, padding: 20, border: `1px solid ${T.border}`, boxShadow: "0 2px 24px #0f0f0d0a" }}>
          <ToolView tool={activeTool} onBack={() => setActiveTool(null)} proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} addWidget={addWidget} removeWidget={removeWidget} pomoProps={{ modes: POMO_MODES, modeId: pomoModeId, secondsLeft: pomoSeconds, running: pomoRunning, pinned: pomoPinned, sessions: pomoSessions, paused: pomoPaused, onStart: pomoStart, onPause: pomocPause, onReset: pomoReset, onSwitchMode: pomoSwitchMode, onTogglePin: pomoTogglePin }} dlProps={{ label: dlLabel, setLabel: setDlLabel, target: dlTarget, setTarget: setDlTarget, pinned: dlPinned, onTogglePin: dlHandlePin, running: dlRunning, onStart: dlStartCountdown, onStop: dlStopCountdown }} />
        </div>
        {proToken && proToken.generations_left > 0 && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: T.goldDim, border: `1px solid ${T.gold}44`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 11, color: T.gold }}>✦ {proToken.type === "pro" ? "Pro Active" : "Pack Active"}</div>
            <div style={{ fontSize: 11, color: T.gold, fontFamily: "DM Sans, sans-serif" }}>{proToken.generations_left} Claude generations left</div>
          </div>
        )}
      </div>
      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={openTool} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );

  return (
    <>
      <style>{responsiveGrid}</style>

      {/* Sticky upgrade banner */}
      {!proToken && (
        <div onClick={() => setShowUpgrade(true)} style={{ position: "sticky", top: 0, zIndex: 100, background: `linear-gradient(90deg, ${T.gold}, ${T.accent})`, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: "white" }}>✦ Unlock Claude Sonnet AI — from $2.99</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: "DM Sans, sans-serif", whiteSpace: "nowrap" }}>Better outputs →</div>
        </div>
      )}

      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: "DM Sans, sans-serif" }}>

        {/* Header */}
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${T.border}`, background: T.card }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: T.ink, letterSpacing: -0.5 }}>Tool</span>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: T.accent, letterSpacing: -0.5 }}>Forge</span>
            <span style={{ fontSize: 11, color: T.muted, marginLeft: 4, fontWeight: 400, letterSpacing: 1 }}>{ALL_TOOLS.length} FREE TOOLS</span>
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>Every tool you need — writing, calculators, planning & more.</div>
          {proToken && proToken.generations_left > 0 && (
            <div style={{ marginBottom: 10, padding: "6px 12px", borderRadius: 99, background: T.goldDim, border: `1px solid ${T.gold}44`, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, fontFamily: "Syne, sans-serif", fontWeight: 700, color: T.gold }}>✦ {proToken.type === "pro" ? "PRO" : "PACK"}</span>
              <span style={{ fontSize: 10, color: T.gold, fontFamily: "DM Sans, sans-serif" }}>{proToken.generations_left} Claude uses left</span>
            </div>
          )}
          {!proToken && <RestoreToken onRestore={handleTokenUpdate} />}
          <div style={{ position: "relative", marginTop: 12 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: T.muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools..." style={{ ...inputStyle, paddingLeft: 36, width: "100%", boxSizing: "border-box", background: T.bg, border: `1px solid ${T.border}` }} />
          </div>
        </div>

        {/* Category filter tabs */}
        <div style={{ padding: "10px 16px", display: "flex", gap: 7, overflowX: "auto", borderBottom: `1px solid ${T.border}`, background: T.card }}>
          {[{ id: "all", label: "All", icon: "✦", color: T.accent, colorDim: T.accentDim }, ...CATEGORIES].map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 99, border: `1px solid ${activeCat === c.id ? c.color : T.border}`, background: activeCat === c.id ? c.colorDim || T.accentDim : "white", color: activeCat === c.id ? c.color : T.muted, fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Tool grid */}
        <div style={{ padding: 16 }}>
          {search ? (
            <>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</div>
              <div className="tf-grid" style={gridStyle}>
                {filtered.map(tool => <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />)}
              </div>
            </>
          ) : activeCat !== "all" ? (
            <div className="tf-grid" style={gridStyle}>
              {filtered.map(tool => <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />)}
            </div>
          ) : (
            CATEGORIES.map(cat => (
              <div key={cat.id} style={{ marginBottom: 20 }}>
                {/* Category header */}
                <div onClick={() => toggleCollapse(cat.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: collapsed[cat.id] ? 0 : 10, cursor: "pointer", padding: "6px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: cat.colorDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{cat.icon}</div>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: T.ink }}>{cat.label}</span>
                    <span style={{ fontSize: 10, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>{cat.tools.length} tools</span>
                  </div>
                  <span style={{ fontSize: 14, color: T.muted, transform: collapsed[cat.id] ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
                </div>
                {!collapsed[cat.id] && (
                  <div className="tf-grid" style={gridStyle}>
                    {cat.tools.map(tool => (
                      <ToolCard key={tool.id} tool={{ ...tool, catId: cat.id, catColor: cat.color, catColorDim: cat.colorDim }} onClick={() => setActiveTool({ ...tool, catId: cat.id, catColor: cat.color, catColorDim: cat.colorDim })} />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          <div style={{ marginTop: 10, padding: 16, borderRadius: 14, background: `linear-gradient(135deg,${T.accentDim},${T.blueDim})`, border: `1px solid ${T.border}`, textAlign: "center" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: T.ink, marginBottom: 4 }}>✦ More tools dropping weekly</div>
            <div style={{ fontSize: 12, color: T.muted }}>Debt payoff · Resume bullets · Pricing guide · and 20+ more</div>
          </div>
        </div>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={(toolId) => { openTool(toolId); }} />
    </>
  );
}
