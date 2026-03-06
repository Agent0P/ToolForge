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
  { id: "freelance", label: "Freelancers", icon: "💼", color: T.accent, colorDim: T.accentDim, tools: [
    { id: "rate", icon: "💰", name: "Hourly Rate Calculator", desc: "Know exactly what to charge" },
    { id: "project", icon: "📅", name: "Project Price Estimator", desc: "Quote any project confidently" },
    { id: "invoice", icon: "🧾", name: "Invoice Text Generator", desc: "AI-written professional invoices" },
    { id: "proposal", icon: "✍️", name: "Client Proposal Writer", desc: "Win more clients with AI proposals" },
  ]},
  { id: "career", label: "Job Seekers", icon: "🎯", color: T.blue, colorDim: T.blueDim, tools: [
    { id: "cover", icon: "📄", name: "Cover Letter Generator", desc: "Tailored AI cover letters in seconds" },
    { id: "salary", icon: "📊", name: "Salary Negotiation Helper", desc: "Know your worth, negotiate better" },
    { id: "linkedin", icon: "🔗", name: "LinkedIn Bio Writer", desc: "Stand out with an AI-crafted bio" },
    { id: "cold", icon: "📧", name: "Cold Email Generator", desc: "Outreach emails that get replies" },
  ]},
  { id: "student", label: "Students", icon: "🎓", color: T.purple, colorDim: T.purpleDim, tools: [
    { id: "gpa", icon: "📐", name: "GPA Calculator", desc: "Track and project your GPA" },
    { id: "essay", icon: "📝", name: "Essay Outline Generator", desc: "AI-structured essay plans" },
    { id: "study", icon: "⏱", name: "Study Session Planner", desc: "Optimise your revision time" },
    { id: "citation", icon: "📚", name: "Citation Formatter", desc: "APA, MLA, Chicago in one click" },
  ]},
  { id: "business", label: "Small Business", icon: "🏪", color: T.teal, colorDim: T.tealDim, tools: [
    { id: "margin", icon: "📈", name: "Profit Margin Calculator", desc: "Price products for profit" },
    { id: "breakeven", icon: "⚖️", name: "Break-Even Calculator", desc: "Find your break-even point fast" },
    { id: "tagline", icon: "✨", name: "Business Tagline Generator", desc: "AI slogans that stick" },
    { id: "email", icon: "💌", name: "Marketing Email Writer", desc: "Convert with AI-written emails" },
  ]},
  { id: "life", label: "Life Utilities", icon: "🛠", color: T.green, colorDim: T.greenDim, tools: [
    { id: "tip", icon: "🍽", name: "Tip & Bill Splitter", desc: "Split any bill instantly" },
    { id: "savings", icon: "🏦", name: "Savings Goal Calculator", desc: "Plan your way to any goal" },
    { id: "deadline", icon: "🗓", name: "Deadline Countdown", desc: "Days, hours, minutes to any date" },
    { id: "unit", icon: "📏", name: "Unit Converter", desc: "Length, weight, temp & more" },
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
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const restore = async () => {
    if (!val.trim()) return;
    setLoading(true); setErr("");
    try {
      const res = await fetch(`/api/get-token?token=${val.trim()}`);
      if (res.ok) {
        const data = await res.json();
        const tokenData = { ...data, token: val.trim() };
        localStorage.setItem("tf_pro_token", JSON.stringify(tokenData));
        onRestore(tokenData);
        setShow(false);
      } else { setErr("Token not found. Check your receipt email and try again."); }
    } catch { setErr("Could not verify token. Please try again."); }
    setLoading(false);
  };
  if (!show) return <button onClick={() => setShow(true)} style={{ background: "none", border: "none", fontSize: 11, color: T.muted, cursor: "pointer", fontFamily: "DM Sans, sans-serif", textDecoration: "underline", padding: 0, marginTop: 6, display: "block" }}>Already purchased? Restore access →</button>;
  return (
    <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: "white", border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif" }}>Paste your access token from your receipt email:</div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="Paste token here..." style={{ ...inputStyle, fontSize: 11 }} />
        <button onClick={restore} disabled={loading || !val.trim()} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: T.accent, color: "white", fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{loading ? "…" : "Restore"}</button>
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
  const [bill, setBill] = useState(80); const [tip, setTip] = useState(18); const [people, setPeople] = useState(4);
  const tipAmt = (bill * tip / 100).toFixed(2); const total = (Number(bill) + Number(tipAmt)).toFixed(2); const perPerson = (total / people).toFixed(2);
  return <div><Row label="Bill Total ($)"><NumInput val={bill} set={setBill} /></Row><Row label="Tip (%)"><div style={{ display: "flex", gap: 6 }}>{[10,15,18,20,25].map(p => <button key={p} onClick={() => setTip(p)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${tip===p?T.accent:T.border}`, background: tip===p?T.accentDim:"white", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans, sans-serif", color: tip===p?T.accent:T.muted }}>{p}%</button>)}</div></Row><Row label="Number of People"><NumInput val={people} set={setPeople} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Tip Amount" value={`$${tipAmt}`} /><MiniResult label="Total Bill" value={`$${total}`} /></div><Result label="Each Person Pays" value={`$${perPerson}`} /><CopyButton text={`Bill split: $${perPerson} each — ToolForge`} /></div>;
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
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:mode==="claude"?T.gold:T.muted }}>✦ Premium (Claude AI Sonnet Model)</div>
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
        {loading?"Generating…":mode==="claude"?"✦ Generate with Claude AI (Sonnet Model)":"Generate with Groq AI"}
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
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.ink }}>Unlock Claude AI ✦</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.muted }}>✕</button>
        </div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:16, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>Claude produces noticeably better cover letters, proposals, and emails — polished enough to send to real clients.</div>
        <a href={onetimeUrl} style={{ textDecoration:"none", display:"block", marginBottom:10 }}>
          <div style={{ padding:16, borderRadius:14, border:`2px solid ${T.accent}`, background:T.accentDim, cursor:"pointer" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.accent }}>One-Time Pack</div><div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.accent }}>$2.99</div></div>
            <div style={{ fontSize:12, color:T.accent, fontFamily:"DM Sans, sans-serif" }}>50 Claude Sonnet generations · Never expires · No subscription</div>
          </div>
        </a>
        <a href={proUrl} style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
          <div style={{ padding:16, borderRadius:14, border:`2px solid ${T.gold}`, background:T.goldDim, cursor:"pointer", position:"relative" }}>
            <div style={{ position:"absolute", top:10, right:10, fontSize:9, padding:"3px 8px", borderRadius:99, background:T.gold, color:"white", fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>BEST VALUE</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.gold }}>Pro Monthly</div><div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.gold }}>$7.99<span style={{ fontSize:12, fontWeight:400 }}>/mo</span></div></div>
            <div style={{ fontSize:12, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>400 Claude Sonnet generations/month · Top up anytime for $2.99 · No ads · Cancel anytime</div>
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
          <button onClick={onDone} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:T.accent, color:"white", fontSize:14, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>Start Using Claude AI →</button>
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

function ToolView({ tool, onBack, proToken, onNeedUpgrade, onTokenUpdate }) {
  const cat = CATEGORIES.find(c => c.id === tool.catId);
  const renderTool = () => {
    switch (tool.id) {
      case "rate": return <RateCalc />; case "project": return <ProjectEstimator />; case "gpa": return <GPACalc />; case "tip": return <TipSplitter />; case "savings": return <SavingsCalc />; case "margin": return <MarginCalc />; case "breakeven": return <BreakEvenCalc />; case "deadline": return <DeadlineCountdown />; case "unit": return <UnitConverter />; case "study": return <StudyPlanner />; case "citation": return <CitationFormatter />; case "salary": return <SalaryHelper />;
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
  const [activeCat, setActiveCat] = useState("all"); const [activeTool, setActiveTool] = useState(null); const [search, setSearch] = useState(""); const [showUpgrade, setShowUpgrade] = useState(false);
  const [proToken, setProToken] = useState(() => { try { const s = localStorage.getItem("tf_pro_token"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const handleTokenUpdate = (t) => { setProToken(t); localStorage.setItem("tf_pro_token", JSON.stringify(t)); };
  useEffect(() => { injectFonts(); }, []);

  const params = new URLSearchParams(window.location.search); const orderId = params.get("order_id");
  if (orderId) return <SuccessPage orderId={orderId} onDone={() => { window.history.replaceState({}, "", "/"); try { const s = localStorage.getItem("tf_pro_token"); if (s) setProToken(JSON.parse(s)); } catch {} window.location.reload(); }} />;

  const filtered = ALL_TOOLS.filter(t => (activeCat==="all"||t.catId===activeCat) && (t.name.toLowerCase().includes(search.toLowerCase())||t.desc.toLowerCase().includes(search.toLowerCase())));

  if (activeTool) return (
    <>
      <div style={{ maxWidth:480, margin:"0 auto", padding:20, background:T.bg, minHeight:"100vh" }}>
        <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, boxShadow:"0 2px 24px #0f0f0d0a" }}>
          <ToolView tool={activeTool} onBack={() => setActiveTool(null)} proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} />
        </div>
        {proToken && proToken.generations_left > 0 && <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:T.goldDim, border:`1px solid ${T.gold}44`, display:"flex", alignItems:"center", justifyContent:"space-between" }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:11, color:T.gold }}>✦ {proToken.type==="pro"?"Pro Active":"Pack Active"}</div><div style={{ fontSize:11, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>{proToken.generations_left} Claude generations left</div></div>}
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );

  return (
    <>
      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:T.bg, fontFamily:"DM Sans, sans-serif" }}>
        <div style={{ padding:"28px 20px 20px", borderBottom:`1px solid ${T.border}`, background:T.card }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:26, color:T.ink, letterSpacing:-0.5 }}>Tool</span>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:26, color:T.accent, letterSpacing:-0.5 }}>Forge</span>
            <span style={{ fontSize:11, color:T.muted, marginLeft:4, fontWeight:400, letterSpacing:1 }}>{ALL_TOOLS.length} FREE TOOLS</span>
          </div>
          <div style={{ fontSize:13, color:T.muted, marginBottom:12 }}>Every tool you need — freelance, career, student, business & life.</div>
          {proToken && proToken.generations_left > 0 && <div style={{ marginBottom:10, padding:"6px 12px", borderRadius:99, background:T.goldDim, border:`1px solid ${T.gold}44`, display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ fontSize:10, fontFamily:"Syne, sans-serif", fontWeight:700, color:T.gold }}>✦ {proToken.type==="pro"?"PRO":"PACK"}</span><span style={{ fontSize:10, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>{proToken.generations_left} Claude uses left</span></div>}
          {!proToken && <RestoreToken onRestore={handleTokenUpdate} />}
          <div style={{ position:"relative", marginTop:12 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:T.muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools..." style={{ ...inputStyle, paddingLeft:36, width:"100%", boxSizing:"border-box", background:T.bg, border:`1px solid ${T.border}` }} />
          </div>
        </div>
        <div style={{ padding:"12px 16px", display:"flex", gap:7, overflowX:"auto", borderBottom:`1px solid ${T.border}`, background:T.card }}>
          {[{ id:"all", label:"All", icon:"✦", color:T.accent }, ...CATEGORIES].map(c => <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:99, border:`1px solid ${activeCat===c.id?c.color:T.border}`, background:activeCat===c.id?c.colorDim||T.accentDim:"white", color:activeCat===c.id?c.color:T.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>{c.icon} {c.label}</button>)}
        </div>
        <div style={{ padding:16 }}>
          {search && <div style={{ fontSize:12, color:T.muted, marginBottom:12 }}>{filtered.length} result{filtered.length!==1?"s":""} for "{search}"</div>}
          {!search && activeCat==="all" ? CATEGORIES.map(cat => <div key={cat.id} style={{ marginBottom:24 }}><div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><div style={{ width:28, height:28, borderRadius:8, background:cat.colorDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{cat.icon}</div><span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:T.ink }}>{cat.label}</span></div><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>{cat.tools.map(tool => <ToolCard key={tool.id} tool={{ ...tool, catId:cat.id, catColor:cat.color, catColorDim:cat.colorDim }} onClick={() => setActiveTool({ ...tool, catId:cat.id, catColor:cat.color, catColorDim:cat.colorDim })} />)}</div></div>) : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>{filtered.map(tool => <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />)}</div>}
          {!proToken && <div onClick={() => setShowUpgrade(true)} style={{ marginTop:10, padding:16, borderRadius:14, background:`linear-gradient(135deg,${T.goldDim},${T.accentDim})`, border:`1px solid ${T.border}`, textAlign:"center", cursor:"pointer" }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, marginBottom:4 }}>✦ Unlock Claude AI from $2.99</div><div style={{ fontSize:12, color:T.muted }}>Better cover letters, proposals & emails. No subscription required.</div></div>}
          <div style={{ marginTop:10, padding:16, borderRadius:14, background:`linear-gradient(135deg,${T.accentDim},${T.blueDim})`, border:`1px solid ${T.border}`, textAlign:"center" }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, marginBottom:4 }}>✦ More tools dropping weekly</div><div style={{ fontSize:12, color:T.muted }}>Debt payoff · Resume bullets · Pricing guide · and 20+ more</div></div>
        </div>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
