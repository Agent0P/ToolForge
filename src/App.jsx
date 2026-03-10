import { useState, useEffect } from "react";

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
    { id: "summarize", icon: "🗂", name: "Document Summarizer", desc: "Summarize any file or text instantly" },
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
  ]},
  { id: "planning", label: "Planning & Time", icon: "📅", color: T.purple, colorDim: T.purpleDim, tools: [
    { id: "deadline", icon: "🗓", name: "Deadline Countdown", desc: "Days, hours, minutes to any date" },
    { id: "study", icon: "⏱", name: "Study Session Planner", desc: "Optimise your revision time" },
    { id: "citation", icon: "📚", name: "Citation Formatter", desc: "APA, MLA, Chicago in one click" },
    { id: "pomodoro", icon: "🍅", name: "Pomodoro Timer", desc: "Stay focused with timed work sessions" },
  ]},
  { id: "utilities", label: "Utilities", icon: "🛠", color: T.teal, colorDim: T.tealDim, tools: [
    { id: "unit", icon: "📏", name: "Unit Converter", desc: "Length, weight, temp & more" },
    { id: "timezone", icon: "🌍", name: "Timezone Converter", desc: "Convert times across the world instantly" },
    { id: "wordcount", icon: "📝", name: "Word Counter", desc: "Count words, reading time & more" },
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


function RateCalc() {
  const [expenses, setExpenses] = useState(2000); const [salary, setSalary] = useState(4000); const [hours, setHours] = useState(160); const [buffer, setBuffer] = useState(20);
  const rate = ((Number(expenses) + Number(salary)) / Number(hours) * (1 + Number(buffer) / 100)).toFixed(2);
  return <div><Row label="Monthly Expenses ($)"><NumInput val={expenses} set={setExpenses} /></Row><Row label="Desired Monthly Take-home ($)"><NumInput val={salary} set={setSalary} /></Row><Row label="Billable Hours / Month"><NumInput val={hours} set={setHours} /></Row><Row label="Buffer / Profit (%)"><NumInput val={buffer} set={setBuffer} /></Row><Result label="Your Minimum Hourly Rate" value={`$${rate}/hr`} /><CopyButton text={`My minimum hourly rate is $${rate}/hr — ToolForge`} /><Tip>Going below this rate means you're losing money. Add 20–40% more for growth.</Tip></div>;
}

function ProjectEstimator() {
  const [tasks, setTasks] = useState([{ name: "Design", hours: 5 }, { name: "Development", hours: 15 }]); const [rate, setRate] = useState(75);
  const total = tasks.reduce((s, t) => s + Number(t.hours), 0); const price = (total * Number(rate) * 1.15).toFixed(0);
  return <div>{tasks.map((t, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}><input value={t.name} onChange={e => setTasks(ts => ts.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={inputStyle} placeholder="Task name" /><input type="number" value={t.hours} onChange={e => setTasks(ts => ts.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))} style={{ ...inputStyle, width: 80 }} placeholder="hrs" /></div>)}<button onClick={() => setTasks(ts => [...ts, { name: "", hours: 0 }])} style={addBtnStyle}>+ Add Task</button><Row label="Your Hourly Rate ($)"><NumInput val={rate} set={setRate} /></Row><Result label="Recommended Project Price (incl. 15% buffer)" value={`$${Number(price).toLocaleString()}`} /><CopyButton text={`Project price: $${Number(price).toLocaleString()} for ${total} hours — ToolForge`} /><Tip>{total} hours estimated. Always add a buffer for revisions.</Tip></div>;
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
  const [bill, setBill] = useState(80);
  const [tip, setTip] = useState(18);
  const [customTip, setCustomTip] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [splitMode, setSplitMode] = useState("equal"); // "equal" | "unequal"
  const [people, setPeople] = useState(4);
  const [shares, setShares] = useState([{ name: "Person 1", pct: 50 }, { name: "Person 2", pct: 50 }]);

  const activeTip = useCustom ? (Number(customTip) || 0) : tip;
  const tipAmt = (bill * activeTip / 100).toFixed(2);
  const total = (Number(bill) + Number(tipAmt)).toFixed(2);
  const perPerson = people > 0 ? (total / people).toFixed(2) : "0.00";
  const perPersonRounded = Math.ceil(total / people).toFixed(2);

  const totalPct = shares.reduce((s, p) => s + Number(p.pct), 0);
  const updateShare = (i, field, val) => setShares(sh => sh.map((s, j) => j === i ? { ...s, [field]: val } : s));
  const addPerson = () => setShares(sh => [...sh, { name: `Person ${sh.length + 1}`, pct: 0 }]);
  const removePerson = i => setShares(sh => sh.filter((_, j) => j !== i));

  return (
    <div>
      <CurrencyPicker value={currency} onChange={setCurrency} />
      <Row label={`Bill Total (${sym})`}><NumInput val={bill} set={setBill} /></Row>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif" }}>Tip (%)</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          {[10,15,18,20,25].map(p => (
            <button key={p} onClick={() => { setTip(p); setUseCustom(false); }} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${!useCustom&&tip===p?T.accent:T.border}`, background: !useCustom&&tip===p?T.accentDim:"white", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans, sans-serif", color: !useCustom&&tip===p?T.accent:T.muted }}>{p}%</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setUseCustom(true)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${useCustom?T.accent:T.border}`, background: useCustom?T.accentDim:"white", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans, sans-serif", color: useCustom?T.accent:T.muted, whiteSpace: "nowrap" }}>Custom</button>
          {useCustom && <input type="number" value={customTip} onChange={e => setCustomTip(e.target.value)} placeholder="e.g. 22" style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.accent}`, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }} />}
          {useCustom && <span style={{ fontSize: 12, color: T.muted }}>%</span>}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif" }}>Split mode</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["equal","⚖️ Equal split"],["unequal","✂️ Custom split"]].map(([val, label]) => (
            <button key={val} onClick={() => setSplitMode(val)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: `1.5px solid ${splitMode===val?T.accent:T.border}`, background: splitMode===val?T.accentDim:"white", color: splitMode===val?T.accent:T.muted, fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>

      {splitMode === "equal" ? (
        <>
          <Row label="Number of People"><NumInput val={people} set={setPeople} /></Row>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <MiniResult label="Tip Amount" value={`${sym}${tipAmt}`} />
            <MiniResult label="Total Bill" value={`${sym}${total}`} />
          </div>
          <Result label="Each Person Pays" value={`${sym}${perPerson}`} />
          <div style={{ marginTop: 4, padding: "8px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, fontSize: 12, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>
            💡 Rounded up: <strong>${sym}${perPersonRounded}</strong> each (easier cash)
          </div>
          <CopyButton text={`Bill split: ${sym}${perPerson} each (${activeTip}% tip) — ToolForge`} />
        </>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}>
            {shares.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input value={s.name} onChange={e => updateShare(i, "name", e.target.value)} placeholder={`Person ${i+1}`} style={{ flex: 2, padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }} />
                <input type="number" value={s.pct} onChange={e => updateShare(i, "pct", e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" }} />
                <span style={{ fontSize: 12, color: T.muted }}>%</span>
                {shares.length > 2 && <button onClick={() => removePerson(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>✕</button>}
              </div>
            ))}
            <button onClick={addPerson} style={{ padding: "7px 14px", borderRadius: 8, border: `1px dashed ${T.border}`, background: "transparent", color: T.muted, fontSize: 12, fontFamily: "DM Sans, sans-serif", cursor: "pointer", width: "100%" }}>+ Add person</button>
          </div>
          <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 8, background: totalPct === 100 ? T.greenDim : "#fef2f2", border: `1px solid ${totalPct===100?T.green:"#fca5a5"}`, fontSize: 12, fontFamily: "DM Sans, sans-serif", color: totalPct===100?T.green:"#dc2626" }}>
            {totalPct === 100 ? "✓ Percentages add up to 100%" : `⚠ Total is ${totalPct}% — must equal 100%`}
          </div>
          {totalPct === 100 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {shares.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", color: T.ink }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, color: T.accent }}>{sym}{(total * s.pct / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MiniResult label="Tip Amount" value={`${sym}${tipAmt}`} />
            <MiniResult label="Total Bill" value={`${sym}${total}`} />
          </div>
        </>
      )}
    </div>
  );
}

function SavingsCalc() {
  const [goal, setGoal] = useState(5000); const [saved, setSaved] = useState(500); const [monthly, setMonthly] = useState(200);
  const months = monthly > 0 ? Math.ceil(Math.max(0, goal - saved) / monthly) : "∞";
  const date = typeof months === "number" ? new Date(Date.now() + months * 30.5 * 864e5).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Never";
  return <div><Row label="Savings Goal ($)"><NumInput val={goal} set={setGoal} /></Row><Row label="Already Saved ($)"><NumInput val={saved} set={setSaved} /></Row><Row label="Monthly Contribution ($)"><NumInput val={monthly} set={setMonthly} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Months Needed" value={months} /><MiniResult label="Years" value={typeof months === "number" ? (months/12).toFixed(1) : "∞"} /></div><Result label="Goal Reached By" value={date} /><CopyButton text={`I'll reach my $${goal} goal by ${date} — ToolForge`} /></div>;
}

function MarginCalc() {
  const [cost, setCost] = useState(30); const [price, setPrice] = useState(75);
  const profit = (price - cost).toFixed(2); const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : 0; const markup = cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : 0;
  return <div><Row label="Cost Price ($)"><NumInput val={cost} set={setCost} /></Row><Row label="Selling Price ($)"><NumInput val={price} set={setPrice} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Profit" value={`$${profit}`} /><MiniResult label="Markup %" value={`${markup}%`} /></div><Result label="Profit Margin" value={`${margin}%`} color={margin >= 40 ? T.green : margin >= 20 ? T.accent : "#dc2626"} /><CopyButton text={`Profit margin: ${margin}% — ToolForge`} /><Tip>{margin >= 40 ? "Excellent margin!" : margin >= 20 ? "Decent margin." : "Low margin — review your pricing."}</Tip></div>;
}

function BreakEvenCalc() {
  const [fixed, setFixed] = useState(3000); const [varCost, setVarCost] = useState(20); const [sellPrice, setSellPrice] = useState(50);
  const contrib = sellPrice - varCost; const units = contrib > 0 ? Math.ceil(fixed / contrib) : "∞"; const revenue = typeof units === "number" ? (units * sellPrice).toFixed(0) : "∞";
  return <div><Row label="Monthly Fixed Costs ($)"><NumInput val={fixed} set={setFixed} /></Row><Row label="Variable Cost per Unit ($)"><NumInput val={varCost} set={setVarCost} /></Row><Row label="Selling Price per Unit ($)"><NumInput val={sellPrice} set={setSellPrice} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Contribution Margin" value={`$${contrib}`} /><MiniResult label="Break-Even Revenue" value={`$${Number(revenue).toLocaleString()}`} /></div><Result label="Units to Break Even" value={typeof units === "number" ? units.toLocaleString() : "∞"} /><CopyButton text={`Break-even: ${units} units — ToolForge`} /><Tip>Sell more than {units} units per month and you're profitable.</Tip></div>;
}

function DeadlineCountdown() {
  const [target, setTarget] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().split("T")[0]; });
  const [label, setLabel] = useState("Project deadline");
  const diff = new Date(target) - new Date();
  const days = diff > 0 ? Math.floor(diff / 864e5) : 0; const hours = diff > 0 ? Math.floor((diff % 864e5) / 36e5) : 0; const mins = diff > 0 ? Math.floor((diff % 36e5) / 6e4) : 0;
  return <div><Row label="Event / Deadline Name"><input value={label} onChange={e => setLabel(e.target.value)} style={inputStyle} /></Row><Row label="Target Date"><input type="date" value={target} onChange={e => setTarget(e.target.value)} style={inputStyle} /></Row>{diff <= 0 ? <Result label={label} value="Past due!" color="#dc2626" /> : <><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}><MiniResult label="Days" value={days} /><MiniResult label="Hours" value={hours} /><MiniResult label="Minutes" value={mins} /></div><Result label={`Until: ${label}`} value={`${days}d ${hours}h ${mins}m`} /><CopyButton text={`${days} days until ${label} — ToolForge`} /></>}</div>;
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
  const [tab, setTab] = useState("planner");
  // Planner
  const [subject, setSubject] = useState("Calculus"); const [hours, setHours] = useState(10); const [days, setDays] = useState(5); const [technique, setTech] = useState("pomodoro");
  const techniques = { pomodoro:{label:"Pomodoro (25min on / 5min break)",work:25,brk:5}, deep:{label:"Deep Work (90min blocks)",work:90,brk:15}, spaced:{label:"Spaced Repetition (30min review)",work:30,brk:5} };
  const t = techniques[technique]; const sessions = Math.ceil((hours * 60) / t.work); const perDay = Math.ceil(sessions / days);
  // Timer
  const [isWork, setIsWork] = useState(true);
  const [timeLeft, setTimeLeft] = useState(t.work * 60);
  const [running, setRunning] = useState(false);
  const [sessionsLeft, setSessionsLeft] = useState(perDay);
  useEffect(() => { setTimeLeft((isWork ? t.work : t.brk) * 60); }, [technique, isWork]);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (isWork) { setIsWork(false); return t.brk * 60; }
          else { setIsWork(true); setSessionsLeft(s => Math.max(0, s-1)); return t.work * 60; }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, isWork, t]);
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const reset = () => { setRunning(false); setIsWork(true); setTimeLeft(t.work * 60); setSessionsLeft(perDay); };
  const pct = isWork ? (1 - timeLeft/(t.work*60)) : (1 - timeLeft/(t.brk*60));
  const r = 54; const circ = 2 * Math.PI * r;

  return (
    <div>
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {["planner","timer"].map(tp => <button key={tp} onClick={()=>setTab(tp)} style={{ flex:1, padding:"8px 0", borderRadius:9, border:`1px solid ${tab===tp?T.purple:T.border}`, background:tab===tp?T.purpleDim:"white", color:tab===tp?T.purple:T.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>{tp==="planner"?"📋 Planner":"⏱ Timer"}</button>)}
      </div>

      {tab==="planner" && <>
        <Row label="Subject / Topic"><input value={subject} onChange={e=>setSubject(e.target.value)} style={inputStyle} /></Row>
        <Row label="Total Study Hours Needed"><NumInput val={hours} set={setHours} /></Row>
        <Row label="Days Available"><NumInput val={days} set={setDays} /></Row>
        <Row label="Study Technique">{Object.entries(techniques).map(([k,v]) => <div key={k} onClick={()=>setTech(k)} style={{ padding:"9px 12px", borderRadius:8, marginBottom:6, border:`1px solid ${technique===k?T.purple:T.border}`, background:technique===k?T.purpleDim:"white", cursor:"pointer", fontSize:12, color:technique===k?T.purple:T.muted, fontFamily:"DM Sans, sans-serif" }}>{v.label}</div>)}</Row>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}>
          <MiniResult label="Sessions Needed" value={sessions} />
          <MiniResult label="Per Day" value={perDay} />
        </div>
        <Result label={`Daily Plan for ${subject}`} value={`${perDay} × ${t.work}min`} color={T.purple} />
        <CopyButton text={`Study plan: ${perDay} sessions/day for ${subject} — ToolForge`} />
        <Tip>Consistency beats cramming. Switch to Timer tab to start a session!</Tip>
      </>}

      {tab==="timer" && <>
        <div style={{ textAlign:"center", padding:"10px 0 20px" }}>
          <div style={{ fontSize:11, fontFamily:"Syne, sans-serif", fontWeight:700, color:isWork?T.purple:T.green, letterSpacing:1, marginBottom:16 }}>
            {isWork ? "🧠 FOCUS TIME" : "☕ BREAK TIME"}
          </div>
          <svg width={130} height={130} style={{ display:"block", margin:"0 auto" }}>
            <circle cx={65} cy={65} r={r} fill="none" stroke={T.border} strokeWidth={8} />
            <circle cx={65} cy={65} r={r} fill="none" stroke={isWork?T.purple:T.green} strokeWidth={8}
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round" transform="rotate(-90 65 65)" style={{ transition:"stroke-dashoffset 0.5s" }} />
            <text x={65} y={60} textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800} fontSize={24} fill={T.ink}>{fmt(timeLeft)}</text>
            <text x={65} y={78} textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize={11} fill={T.muted}>{isWork?`${t.work} min focus`:`${t.brk} min break`}</text>
          </svg>
          <div style={{ marginTop:16, fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{sessionsLeft} sessions remaining today</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:16 }}>
            <button onClick={()=>setRunning(r=>!r)} style={{ padding:"10px 28px", borderRadius:10, border:"none", background:running?T.accentDim:T.purple, color:running?T.accent:"white", fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>
              {running?"⏸ Pause":"▶ Start"}
            </button>
            <button onClick={reset} style={{ padding:"10px 18px", borderRadius:10, border:`1px solid ${T.border}`, background:"white", color:T.muted, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>↺</button>
          </div>
        </div>
        <Row label="Study Technique">{Object.entries(techniques).map(([k,v]) => <div key={k} onClick={()=>{ if(!running){setTech(k); setIsWork(true); setTimeLeft(techniques[k].work*60); }}} style={{ padding:"9px 12px", borderRadius:8, marginBottom:6, border:`1px solid ${technique===k?T.purple:T.border}`, background:technique===k?T.purpleDim:"white", cursor:running?"not-allowed":"pointer", fontSize:12, color:technique===k?T.purple:T.muted, fontFamily:"DM Sans, sans-serif", opacity:running?0.6:1 }}>{v.label}</div>)}</Row>
        <Tip>Stop the timer before switching techniques.</Tip>
      </>}
    </div>
  );
}

function PomodoroTimer() {
  const MODES = { work: { label: "Focus", duration: 25 * 60, color: T.accent, bg: T.accentDim }, short: { label: "Short Break", duration: 5 * 60, color: T.green, bg: T.greenDim }, long: { label: "Long Break", duration: 15 * 60, color: T.blue, bg: T.blueDim } };
  const [mode, setMode] = useState("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [customWork, setCustomWork] = useState(25);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setRunning(false);
          if (mode === "work") setSessions(s => s + 1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode]);

  const switchMode = (m) => { setMode(m); setRunning(false); setTimeLeft(m === "work" ? customWork * 60 : MODES[m].duration); };
  const reset = () => { setRunning(false); setTimeLeft(mode === "work" ? customWork * 60 : MODES[mode].duration); };
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const total = mode === "work" ? customWork * 60 : MODES[mode].duration;
  const progress = ((total - timeLeft) / total) * 100;
  const m = MODES[mode];

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button key={key} onClick={() => switchMode(key)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${mode === key ? val.color : T.border}`, background: mode === key ? val.bg : "white", color: mode === key ? val.color : T.muted, fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>{val.label}</button>
        ))}
      </div>

      {/* Timer display */}
      <div style={{ textAlign: "center", padding: "28px 0 20px", borderRadius: 16, background: m.bg, border: `1px solid ${m.color}33`, marginBottom: 16 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 56, color: m.color, letterSpacing: 2, lineHeight: 1 }}>{mins}:{secs}</div>
        <div style={{ fontSize: 12, color: m.color, fontFamily: "DM Sans, sans-serif", marginTop: 6, opacity: 0.8 }}>{m.label}</div>
        {/* Progress bar */}
        <div style={{ margin: "14px 24px 0", height: 4, borderRadius: 99, background: `${m.color}22` }}>
          <div style={{ height: "100%", borderRadius: 99, background: m.color, width: `${progress}%`, transition: "width 1s linear" }} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setRunning(r => !r)} style={{ flex: 2, padding: "12px 0", borderRadius: 10, border: "none", background: m.color, color: "white", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {running ? "⏸ Pause" : timeLeft === 0 ? "✓ Done!" : "▶ Start"}
        </button>
        <button onClick={reset} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `1px solid ${T.border}`, background: "white", color: T.muted, fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>↺ Reset</button>
      </div>

      {/* Custom work duration */}
      {mode === "work" && (
        <Row label="Custom Focus Duration (minutes)">
          <div style={{ display: "flex", gap: 6 }}>
            {[15, 25, 30, 45, 60].map(n => (
              <button key={n} onClick={() => { setCustomWork(n); setRunning(false); setTimeLeft(n * 60); }} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${customWork === n ? T.accent : T.border}`, background: customWork === n ? T.accentDim : "white", color: customWork === n ? T.accent : T.muted, fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 600, cursor: "pointer" }}>{n}m</button>
            ))}
          </div>
        </Row>
      )}

      {/* Session count */}
      {sessions > 0 && <Tip>🍅 {sessions} focus session{sessions > 1 ? "s" : ""} completed today. {sessions >= 4 ? "Great work — take a long break!" : `${4 - sessions} more until a long break.`}</Tip>}
    </div>
  );
}

function CitationFormatter() {
  const [style, setStyle] = useState("APA"); const [type, setType] = useState("book"); const [author, setAuthor] = useState("Smith, J."); const [title, setTitle] = useState("The Art of Learning"); const [year, setYear] = useState("2023"); const [publisher, setPub] = useState("Penguin Press"); const [url, setUrl] = useState("");
  const cite = () => { if (style==="APA") return type==="website"?`${author} (${year}). ${title}. Retrieved from ${url}`:`${author} (${year}). *${title}*. ${publisher}.`; if (style==="MLA") return type==="website"?`${author} "${title}." Web. ${year}. <${url}>`:`${author} *${title}*. ${publisher}, ${year}.`; return type==="website"?`${author} "${title}." Accessed ${year}. ${url}.`:`${author} *${title}*. ${publisher}, ${year}.`; };
  return <div><Row label="Citation Style"><div style={{ display:"flex", gap:6 }}>{["APA","MLA","Chicago"].map(s => <button key={s} onClick={()=>setStyle(s)} style={{ flex:1, padding:"7px 0", borderRadius:8, border:`1px solid ${style===s?T.purple:T.border}`, background:style===s?T.purpleDim:"white", color:style===s?T.purple:T.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:600, cursor:"pointer" }}>{s}</button>)}</div></Row><Row label="Source Type"><div style={{ display:"flex", gap:6 }}>{["book","website"].map(tp => <button key={tp} onClick={()=>setType(tp)} style={{ flex:1, padding:"7px 0", borderRadius:8, border:`1px solid ${type===tp?T.purple:T.border}`, background:type===tp?T.purpleDim:"white", color:type===tp?T.purple:T.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>{tp.charAt(0).toUpperCase()+tp.slice(1)}</button>)}</div></Row><Row label="Author (Last, F.)"><input value={author} onChange={e=>setAuthor(e.target.value)} style={inputStyle} /></Row><Row label="Title"><input value={title} onChange={e=>setTitle(e.target.value)} style={inputStyle} /></Row><Row label="Year"><input value={year} onChange={e=>setYear(e.target.value)} style={inputStyle} /></Row>{type==="book"&&<Row label="Publisher"><input value={publisher} onChange={e=>setPub(e.target.value)} style={inputStyle} /></Row>}{type==="website"&&<Row label="URL"><input value={url} onChange={e=>setUrl(e.target.value)} style={inputStyle} placeholder="https://..." /></Row>}<div style={{ marginTop:14, padding:14, borderRadius:10, background:T.purpleDim, border:`1px solid ${T.purple}33`, fontSize:13, color:T.ink, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>{cite()}</div><CopyButton text={cite()} /></div>;
}

function SalaryHelper() {
  const [role, setRole] = useState("Software Engineer"); const [current, setCurrent] = useState(70000); const [experience, setExp] = useState(3); const [location, setLocation] = useState("New York");
  const target = Math.round(current * 1.15 / 1000) * 1000; const stretch = Math.round(current * 1.25 / 1000) * 1000;
  return <div><Row label="Job Title"><input value={role} onChange={e=>setRole(e.target.value)} style={inputStyle} /></Row><Row label="Current / Offered Salary ($)"><NumInput val={current} set={setCurrent} /></Row><Row label="Years of Experience"><NumInput val={experience} set={setExp} /></Row><Row label="Location"><input value={location} onChange={e=>setLocation(e.target.value)} style={inputStyle} /></Row><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:12 }}><MiniResult label="Target Ask" value={`$${target.toLocaleString()}`} /><MiniResult label="Stretch Goal" value={`$${stretch.toLocaleString()}`} /></div><Result label="Negotiation Range" value={`$${target.toLocaleString()} – $${stretch.toLocaleString()}`} color={T.blue} /><CopyButton text={`Salary range for ${role}: $${target.toLocaleString()} – $${stretch.toLocaleString()} — ToolForge`} /><Tip>Always ask for 15–25% above your target. Companies expect negotiation.</Tip></div>;
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
          <div style={{ padding:16, borderRadius:14, border:`2px solid ${T.gold}`, background:T.goldDim, cursor:"pointer" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div>
                <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.gold }}>Pro Monthly</div>
                <div style={{ fontSize:9, padding:"2px 7px", borderRadius:99, background:T.gold, color:"white", fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5, display:"inline-block", marginTop:3 }}>BEST VALUE</div>
              </div>
              <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.gold }}>$7.99<span style={{ fontSize:12, fontWeight:400 }}>/mo</span></div>
            </div>
            <div style={{ fontSize:12, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>400 Claude generations/month · No ads · Cancel anytime</div>
          </div>
        </a>
        <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:8, background:"#f0f9ff", border:"1px solid #bae6fd", fontSize:11, color:"#0369a1", fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>
          💡 <strong>How to restore access:</strong> After purchase, go to ToolForge → click "Restore Access" → enter your purchase email. Works on any device, anytime.
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



function DocumentSummarizer({ proToken, onNeedUpgrade, onTokenUpdate }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("summary"); // "summary" | "clarity"
  const [aiMode, setAiMode] = useState("groq");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [groqCount, setGroqCount] = useState(() => {
    try { const s = localStorage.getItem("tf_groq_usage"); if (!s) return 0; const { date, count } = JSON.parse(s); return new Date().toDateString() === date ? count : 0; } catch { return 0; }
  });
  const groqAtLimit = groqCount >= 3;
  const hasClaude = proToken && proToken.generations_left >= 1;
  const canGenerate = text.trim().length > 50 && !loading && (aiMode === "groq" ? !groqAtLimit : hasClaude);

  const PROMPTS = {
    summary: `You are a professional document analyst. The user has provided a document or piece of text. Your job is to give a clear, structured summary.

Respond with these sections:

**What This Is**
One sentence describing what type of document this is and its purpose.

**Summary**
A clear 3-5 sentence summary of the content. Write it so someone who has never seen the document understands what it covers.

**Key Points**
5-7 bullet points of the most important information, decisions, arguments or facts.

**Main Conclusion / Takeaway**
What is the ultimate message or conclusion of this document?

Be concise. No filler. Do not say things like "the document mentions" — just state the content directly.`,

    clarity: `You are a professional writing coach and communications expert. The user wants to know how clearly their writing communicates their intended message — and how to make it better.

Respond with these sections:

**What I Understood**
Explain in your own words what you understood this document to be saying. Be honest — write what the text actually communicates to a fresh reader, not what the author may have intended.

**Core Message**
In one sentence: what is the single main point this document is trying to make?

**What Works Well**
2-3 things the writing does effectively — structure, clarity, specifics, tone, etc.

**What's Unclear or Missing**
Be direct and specific. What confused you? What felt vague? What questions were left unanswered? What assumptions did the author make that a reader might not share?

**Specific Improvements**
3-5 concrete, actionable suggestions to make the message clearer and more impactful. Be specific — not "add more detail" but "the second paragraph assumes the reader knows X — add one sentence explaining it.'

**Revised Opening Line (optional)**
If the opening could be stronger, suggest an improved version.

Be honest. The goal is to genuinely help the writer improve, not to flatter them.`
  };

  const handleFile = async (file) => {
    setFileError(""); setOutput("");
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = e => { setText(e.target.result); setFileName(file.name); };
      reader.readAsText(file);
    } else if (name.endsWith(".docx")) {
      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value); setFileName(file.name);
      } catch { setFileError("Could not read DOCX file. Try copying the text manually."); }
    } else {
      setFileError("Only .txt and .docx files are supported.");
    }
  };

  const truncate = (t) => t.length > 6000 ? t.slice(0, 6000) + "\n\n[Document truncated for analysis]" : t;

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true); setOutput(""); setError("");
    const systemPrompt = PROMPTS[analysisMode];
    const userContent = `Here is the document to analyse:

${truncate(text)}`;

    if (aiMode === "groq") {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY || ""}` },
          body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1200, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }] })
        });
        const data = await res.json();
        const result = data.choices?.[0]?.message?.content;
        if (!result) throw new Error("Empty");
        setOutput(result);
        const n = groqCount + 1; setGroqCount(n);
        localStorage.setItem("tf_groq_usage", JSON.stringify({ date: new Date().toDateString(), count: n }));
      } catch { setError("Generation failed. Please try again."); }
    } else {
      try {
        const res = await fetch("/api/generate-claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: proToken.token, toolName: "Document Summarizer", userInput: `${systemPrompt}

${userContent}`, tokensToDeduct: 1 })
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Generation failed."); setLoading(false); return; }
        setOutput(data.result);
        onTokenUpdate({ ...proToken, generations_left: data.generations_left });
      } catch { setError("Server error. Please try again."); }
    }
    setLoading(false);
  };

  const renderOutput = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <div key={i} style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: T.ink, marginTop: i === 0 ? 0 : 16, marginBottom: 6 }}>{line.replace(/\*\*/g, "")}</div>;
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: T.accent, flexShrink: 0 }}>✦</span><span style={{ fontSize: 13, color: T.ink, fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>{line.slice(2)}</span></div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 4 }} />;
      return <div key={i} style={{ fontSize: 13, color: T.ink, fontFamily: "DM Sans, sans-serif", lineHeight: 1.7, marginBottom: 2 }}>{line.replace(/\*\*/g, "")}</div>;
    });
  };

  return (
    <div>
      {/* Analysis mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["summary", "📄", "What is this?", "Summary & key points"],["clarity", "🔍", "Clarity Check", "Improve your message"]].map(([val, icon, label, sub]) => (
          <div key={val} onClick={() => { setAnalysisMode(val); setOutput(""); }} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${analysisMode === val ? T.accent : T.border}`, background: analysisMode === val ? T.accentDim : "white", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: analysisMode === val ? T.accent : T.muted }}>{icon} {label}</div>
            <div style={{ fontSize: 10, color: analysisMode === val ? T.accent : T.muted, marginTop: 2, opacity: 0.8 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* File upload */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById("ds-file-input").click()}
        style={{ marginBottom: 10, padding: "14px", borderRadius: 10, border: `2px dashed ${dragOver ? T.accent : T.border}`, background: dragOver ? T.accentDim : T.bg, textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}
      >
        <input id="ds-file-input" type="file" accept=".txt,.docx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        <div style={{ fontSize: 20, marginBottom: 4 }}>📂</div>
        <div style={{ fontSize: 12, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>
          {fileName ? <><strong style={{ color: T.accent }}>{fileName}</strong> loaded — ready to analyse</> : <>Drop a <strong>.txt</strong> or <strong>.docx</strong> file, or click to browse</>}
        </div>
      </div>
      {fileError && <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", fontSize: 12, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>{fileError}</div>}

      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setFileName(""); setOutput(""); }}
        placeholder="Or paste your text here…"
        rows={5}
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "DM Sans, sans-serif", resize: "vertical", outline: "none", color: T.ink, lineHeight: 1.6, marginBottom: 12 }}
      />

      {/* AI mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div onClick={() => setAiMode("groq")} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${aiMode === "groq" ? T.green : T.border}`, background: aiMode === "groq" ? T.greenDim : "white", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: aiMode === "groq" ? T.green : T.muted }}>🆓 Free (Groq AI)</div>
          <div style={{ fontSize: 10, color: aiMode === "groq" ? T.green : T.muted, marginTop: 2 }}>{groqAtLimit ? "Limit reached today" : `${groqCount}/3 used today`}</div>
        </div>
        <div onClick={() => { if (!hasClaude) onNeedUpgrade(); else setAiMode("claude"); }} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${aiMode === "claude" ? T.gold : T.border}`, background: aiMode === "claude" ? T.goldDim : "white", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: aiMode === "claude" ? T.gold : T.muted }}>✦ Premium (Claude Sonnet)</div>
          <div style={{ fontSize: 10, color: aiMode === "claude" ? T.gold : T.muted, marginTop: 2 }}>{hasClaude ? `${proToken.generations_left} left · ${analysisMode === "clarity" ? 2 : 1} token` : "Unlock from $2.99"}</div>
        </div>
      </div>

      {aiMode === "groq" && groqAtLimit && <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 8, background: T.accentDim, border: `1px solid ${T.accent}44`, fontSize: 11, color: T.accent, fontFamily: "DM Sans, sans-serif" }}>Daily free limit reached. Resets at midnight — or unlock Premium Claude now.</div>}
      {text.trim().length > 6000 && <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 8, background: "#fef9c3", border: "1px solid #fde047", fontSize: 11, color: "#854d0e", fontFamily: "DM Sans, sans-serif" }}>⚠ Your document is over 6,000 characters — only the first 6,000 will be analysed.</div>}
      {text.trim().length > 0 && text.trim().length < 50 && <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", fontSize: 11, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>Text is too short to summarize — paste more content.</div>}

      <button onClick={generate} disabled={!canGenerate} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: !canGenerate ? T.border : aiMode === "claude" ? T.gold : T.green, color: !canGenerate ? T.muted : "white", fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: canGenerate ? "pointer" : "default", letterSpacing: 0.5 }}>
        {loading ? "Analysing…" : aiMode === "claude" ? `✦ Analyse with Claude Sonnet · ${analysisMode === "clarity" ? 2 : 1} token` : analysisMode === "summary" ? "Summarize with Groq AI" : "Check Clarity with Groq AI"}
      </button>

      {error && <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", fontSize: 12, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>{error}</div>}

      {loading && (
        <div style={{ marginTop: 16, padding: "20px", borderRadius: 12, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: aiMode === "claude" ? T.gold : T.green, animation: `tf-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
          <div style={{ fontSize: 13, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>{analysisMode === "summary" ? "Reading your document…" : "Checking clarity of your message…"}</div>
        </div>
      )}

      {output && !loading && (
        <div style={{ marginTop: 14 }}>
          <div style={{ padding: "16px", borderRadius: 12, background: T.bg, border: `1px solid ${T.border}` }}>
            {renderOutput(output)}
          </div>
          <CopyButton text={output} />
        </div>
      )}
    </div>
  );
}
function WordCounter() {
  const [text, setText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [fileName, setFileName] = useState("");

  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim()).length : 0;
  const readMins = Math.ceil(words / 238);
  const speakMins = Math.ceil(words / 130);

  const topKeywords = (() => {
    if (!text.trim()) return [];
    const stopWords = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","was","are","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","that","this","it","he","she","they","we","i","you","not","as","if","so","up","out","about","into","than","then","its"]);
    const freq = {};
    text.toLowerCase().match(/[a-z]{3,}/g)?.forEach(w => { if (!stopWords.has(w)) freq[w] = (freq[w]||0)+1; });
    return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,5);
  })();

  const handleFile = async (file) => {
    setFileError("");
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = e => { setText(e.target.result); setFileName(file.name); };
      reader.readAsText(file);
    } else if (name.endsWith(".docx")) {
      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value); setFileName(file.name);
      } catch { setFileError("Could not read DOCX file. Please try copying the text manually."); }
    } else {
      setFileError("Only .txt and .docx files are supported.");
    }
  };

  const T2 = { teal: "#0d9488", tealDim: "#f0fdfa" };

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
        style={{ marginBottom: 12, padding: "14px", borderRadius: 10, border: `2px dashed ${dragOver ? T2.teal : T.border}`, background: dragOver ? T2.tealDim : T.bg, textAlign: "center", transition: "all 0.15s", cursor: "pointer" }}
        onClick={() => document.getElementById("wc-file-input").click()}
      >
        <input id="wc-file-input" type="file" accept=".txt,.docx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        <div style={{ fontSize: 20, marginBottom: 4 }}>📂</div>
        <div style={{ fontSize: 12, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>
          {fileName ? <><strong style={{ color: T2.teal }}>{fileName}</strong> loaded</> : <>Drop a <strong>.txt</strong> or <strong>.docx</strong> file, or click to browse</>}
        </div>
      </div>
      {fileError && <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", fontSize: 12, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>{fileError}</div>}

      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setFileName(""); }}
        placeholder="Or paste / type your text here…"
        rows={7}
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "DM Sans, sans-serif", resize: "vertical", outline: "none", color: T.ink, lineHeight: 1.6 }}
      />

      {text.trim() ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: T2.tealDim, border: `1px solid ${T2.teal}44`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T2.teal, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Words</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T2.teal, fontFamily: "Syne, sans-serif" }}>{words.toLocaleString()}</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Characters</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.ink, fontFamily: "Syne, sans-serif" }}>{chars.toLocaleString()}</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>No Spaces</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.ink, fontFamily: "Syne, sans-serif" }}>{charsNoSpace.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Sentences</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontFamily: "Syne, sans-serif" }}>{sentences}</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Paragraphs</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontFamily: "Syne, sans-serif" }}>{paragraphs}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: T.accentDim, border: `1px solid ${T.accent}44`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.accent, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>📖 Reading time</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.accent, fontFamily: "Syne, sans-serif" }}>{readMins} min</div>
              <div style={{ fontSize: 10, color: T.accent, opacity: 0.7, fontFamily: "DM Sans, sans-serif" }}>@ 238 wpm avg</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: T.purpleDim, border: `1px solid ${T.purple}44`, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.purple, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>🎤 Speaking time</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.purple, fontFamily: "Syne, sans-serif" }}>{speakMins} min</div>
              <div style={{ fontSize: 10, color: T.purple, opacity: 0.7, fontFamily: "DM Sans, sans-serif" }}>@ 130 wpm avg</div>
            </div>
          </div>

          {topKeywords.length > 0 && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: T.bg, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: "Syne, sans-serif", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Top Keywords</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {topKeywords.map(([word, count]) => (
                  <div key={word} style={{ padding: "4px 10px", borderRadius: 99, background: T2.tealDim, border: `1px solid ${T2.teal}44`, fontSize: 12, fontFamily: "DM Sans, sans-serif", color: T2.teal }}>
                    {word} <span style={{ fontWeight: 700 }}>×{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CopyButton text={`${words} words · ${chars} characters · ${readMins} min read · ${speakMins} min speak — ToolForge`} />
        </>
      ) : (
        <div style={{ marginTop: 16, padding: "16px", borderRadius: 12, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>Start typing or upload a file to see stats</div>
        </div>
      )}
    </div>
  );
}
function ToolView({ tool, onBack, proToken, onNeedUpgrade, onTokenUpdate }) {
  const cat = CATEGORIES.find(c => c.id === tool.catId);
  const renderTool = () => {
    switch (tool.id) {
      case "rate": return <RateCalc />; case "project": return <ProjectEstimator />; case "gpa": return <GPACalc />; case "tip": return <TipSplitter />; case "savings": return <SavingsCalc />; case "margin": return <MarginCalc />; case "breakeven": return <BreakEvenCalc />; case "deadline": return <DeadlineCountdown />; case "unit": return <UnitConverter />; case "timezone": return <TimezoneConverter />; case "study": return <StudyPlanner />; case "citation": return <CitationFormatter />; case "salary": return <SalaryHelper />; case "pomodoro": return <PomodoroTimer />; case "wordcount": return <WordCounter />; case "summarize": return <DocumentSummarizer proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
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

function Footer({ onFaq }) {
  return (
    <div style={{ borderTop:`1px solid ${T.border}`, padding:"20px 20px", background:T.card, textAlign:"center" }}>
      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:T.ink, marginBottom:6 }}>
        Tool<span style={{ color:T.accent }}>Forge</span>
      </div>
      <div style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", marginBottom:12 }}>
        Free tools for freelancers, students & small businesses.
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
        <span onClick={onFaq} style={{ fontSize:11, color:T.accent, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>FAQ & About</span>

        <a href="https://toolforge.lemonsqueezy.com" target="_blank" rel="noreferrer" style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", textDecoration:"none" }}>Pricing</a>
      </div>
      <div style={{ fontSize:10, color:T.muted, fontFamily:"DM Sans, sans-serif", marginTop:14 }}>
        © {new Date().getFullYear()} ToolForge · Made with ☕
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  { q:"What is ToolForge?", a:"ToolForge is a free collection of 21+ online tools designed for freelancers, students, job seekers and small businesses. No sign-up required — just open a tool and use it." },
  { q:"Are the tools really free?", a:"Yes. All calculators and utilities are completely free, forever. AI-powered tools offer 3 free generations per day via Groq. For more generations and access to Claude Sonnet AI (higher quality), there's an affordable paid plan." },
  { q:"What's the difference between Groq AI and Claude Sonnet AI?", a:"Groq (free) uses the Llama 3.3 model — fast and capable for most tasks. Claude Sonnet AI (paid) is Anthropic's Claude model — it produces noticeably better, more nuanced writing. Worth it if you rely on the AI tools regularly." },
  { q:"What do I get with a paid plan?", a:"The One-Time Pack ($2.99) gives you 50 Claude Sonnet AI generations. The Pro Monthly ($7.99/mo) gives 400 generations per month and renews automatically. The Top-Up Pack ($2.99) adds 100 generations to your existing balance whenever you need more." },
  { q:"How do I access my account on a new device?", a:"There are no accounts or passwords. Just go to ToolForge, click \"Restore Access\" and enter the email you used to purchase. Your access will be restored instantly on any device, any browser." },
  { q:"I bought a plan but can't access Claude — what do I do?", a:"Click \"Restore Access\" on the homepage and enter your purchase email. Your access will be restored instantly on any device." },
  { q:"Is my data private? Do you store my inputs?", a:"Your inputs are sent to the AI model to generate a response and are not stored on our servers. We don't sell data or show ads based on your inputs. Payments are handled entirely by Lemon Squeezy — we never see your card details." },
  { q:"How many tools are there and will more be added?", a:"There are currently 21 tools and we add more every week. Upcoming tools include a BMI calculator, word counter, QR code generator, mortgage calculator and more. There's also a fun \"Take a Break\" games section coming soon." },
  { q:"What payment methods are accepted?", a:"All major credit and debit cards are accepted via Lemon Squeezy, our payment provider. Payments are secure and encrypted." },
  { q:"Can I cancel my Pro subscription?", a:"Yes, anytime. Log into your Lemon Squeezy customer portal (link in your receipt email) and cancel with one click. You keep access until the end of your billing period." },
  { q:"Will there be ads on ToolForge?", a:"Not right now. The site is funded by the paid AI plans. If ads are ever introduced in the future, they'll be minimal and non-intrusive." },
];

function FAQPage({ onBack }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:T.bg, fontFamily:"DM Sans, sans-serif" }}>
      {/* Header */}
      <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid ${T.border}`, background:T.card }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:T.accent, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Back to ToolForge</button>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:T.ink, marginBottom:6 }}>FAQ & About</div>
        <div style={{ fontSize:13, color:T.muted }}>Everything you need to know about ToolForge.</div>
      </div>

      {/* About section */}
      <div style={{ margin:16, padding:20, borderRadius:16, background:T.card, border:`1px solid ${T.border}` }}>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.ink, marginBottom:8 }}>✦ About ToolForge</div>
        <div style={{ fontSize:13, color:T.muted, lineHeight:1.7 }}>
          ToolForge was built to give freelancers, students, job seekers and small business owners access to powerful tools — for free. No accounts, no paywalls on the essentials, no bloat. Just open a tool and get things done.
          <br /><br />
          AI-powered tools use Groq (free, fast) or Claude Sonnet AI (premium, higher quality). New tools are added every week.
        </div>
      </div>

      {/* FAQ items */}
      <div style={{ padding:"0 16px 24px" }}>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:T.ink, marginBottom:12 }}>Frequently Asked Questions</div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{ marginBottom:8, borderRadius:12, border:`1px solid ${open===i?T.accent:T.border}`, background:T.card, overflow:"hidden", cursor:"pointer", transition:"border 0.15s" }}>
            <div style={{ padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, lineHeight:1.4 }}>{item.q}</div>
              <span style={{ fontSize:14, color:T.muted, flexShrink:0, transform:open===i?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
            </div>
            {open === i && (
              <div style={{ padding:"0 16px 14px", fontSize:12, color:T.muted, lineHeight:1.7, borderTop:`1px solid ${T.border}`, paddingTop:12 }}>{item.a}</div>
            )}
          </div>
        ))}
      </div>

      <Footer onFaq={() => {}} />
    </div>
  );
}

export default function ToolForge() {
  const [activeCat, setActiveCat] = useState("all");
  const [activeTool, setActiveTool] = useState(null);
  const [search, setSearch] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [showFaq, setShowFaq] = useState(window.location.pathname === "/faq");
  const [proToken, setProToken] = useState(() => { try { const s = localStorage.getItem("tf_pro_token"); return s ? JSON.parse(s) : null; } catch { return null; } });

  const handleTokenUpdate = (t) => { setProToken(t); localStorage.setItem("tf_pro_token", JSON.stringify(t)); };
  useEffect(() => { injectFonts(); }, []);

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");
  if (orderId) return <SuccessPage orderId={orderId} onDone={() => { window.history.replaceState({}, "", "/"); try { const s = localStorage.getItem("tf_pro_token"); if (s) setProToken(JSON.parse(s)); } catch {} window.location.reload(); }} />;

  if (showFaq) return <FAQPage onBack={() => { setShowFaq(false); window.history.pushState({}, "", "/"); }} />;

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
          <ToolView tool={activeTool} onBack={() => setActiveTool(null)} proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} />
        </div>
        {proToken && proToken.generations_left > 0 && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: T.goldDim, border: `1px solid ${T.gold}44`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 11, color: T.gold }}>✦ {proToken.type === "pro" ? "Pro Active" : "Pack Active"}</div>
            <div style={{ fontSize: 11, color: T.gold, fontFamily: "DM Sans, sans-serif" }}>{proToken.generations_left} Claude generations left</div>
          </div>
        )}
      </div>
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
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <Footer onFaq={() => { setShowFaq(true); window.history.pushState({}, "", "/faq"); }} />
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
