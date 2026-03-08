import { useState, useEffect, useRef } from "react";
import QRCodeLib from "qrcode";
import { T, inputStyle, addBtnStyle, CURRENCIES, NumInput, Row, Result, MiniResult, Tip, CopyButton, CurrencyPicker } from "./theme";

export function RateCalc() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [expenses, setExpenses] = useState(2000); const [salary, setSalary] = useState(4000); const [hours, setHours] = useState(160); const [buffer, setBuffer] = useState(20);
  const rate = ((Number(expenses) + Number(salary)) / Number(hours) * (1 + Number(buffer) / 100)).toFixed(2);
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Monthly Expenses (${sym})`}><NumInput val={expenses} set={setExpenses} /></Row><Row label={`Desired Monthly Take-home (${sym})`}><NumInput val={salary} set={setSalary} /></Row><Row label="Billable Hours / Month"><NumInput val={hours} set={setHours} /></Row><Row label="Buffer / Profit (%)"><NumInput val={buffer} set={setBuffer} /></Row><Result label="Your Minimum Hourly Rate" value={`${sym}${rate}/hr`} /><CopyButton text={`My minimum hourly rate is ${sym}${rate}/hr — ToolForge`} /><Tip>Going below this rate means you're losing money. Add 20–40% more for growth.</Tip></div>;
}

export function ProjectEstimator() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [tasks, setTasks] = useState([{ name: "Design", hours: 5 }, { name: "Development", hours: 15 }]); const [rate, setRate] = useState(75);
  const total = tasks.reduce((s, t) => s + Number(t.hours), 0); const price = (total * Number(rate) * 1.15).toFixed(0);
  return <div><CurrencyPicker value={currency} onChange={setCurrency} />{tasks.map((t, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}><input value={t.name} onChange={e => setTasks(ts => ts.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={inputStyle} placeholder="Task name" /><input type="number" value={t.hours} onChange={e => setTasks(ts => ts.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))} style={{ ...inputStyle, width: 80 }} placeholder="hrs" /></div>)}<button onClick={() => setTasks(ts => [...ts, { name: "", hours: 0 }])} style={addBtnStyle}>+ Add Task</button><Row label={`Your Hourly Rate (${sym})`}><NumInput val={rate} set={setRate} /></Row><Result label="Recommended Project Price (incl. 15% buffer)" value={`${sym}${Number(price).toLocaleString()}`} /><CopyButton text={`Project price: ${sym}${Number(price).toLocaleString()} for ${total} hours — ToolForge`} /><Tip>{total} hours estimated. Always add a buffer for revisions.</Tip></div>;
}

export function GPACalc() {
  const grades = [["A+",4.3],["A",4.0],["A-",3.7],["B+",3.3],["B",3.0],["B-",2.7],["C+",2.3],["C",2.0],["D",1.0],["F",0]];
  const [courses, setCourses] = useState([{ name: "Math", grade: "A", credits: 3 }, { name: "English", grade: "B+", credits: 3 }]);
  const totalCredits = courses.reduce((s, c) => s + Number(c.credits), 0);
  const gpa = totalCredits ? (courses.reduce((s, c) => s + (grades.find(g => g[0] === c.grade)?.[1] || 0) * Number(c.credits), 0) / totalCredits).toFixed(2) : "0.00";
  return <div>{courses.map((c, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}><input value={c.name} onChange={e => setCourses(cs => cs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={inputStyle} placeholder="Course" /><select value={c.grade} onChange={e => setCourses(cs => cs.map((x, j) => j === i ? { ...x, grade: e.target.value } : x))} style={{ ...inputStyle, width: 75 }}>{grades.map(g => <option key={g[0]}>{g[0]}</option>)}</select><input type="number" value={c.credits} onChange={e => setCourses(cs => cs.map((x, j) => j === i ? { ...x, credits: e.target.value } : x))} style={{ ...inputStyle, width: 60 }} placeholder="cr" /></div>)}<button onClick={() => setCourses(cs => [...cs, { name: "", grade: "B", credits: 3 }])} style={addBtnStyle}>+ Add Course</button><Result label="Your Current GPA" value={gpa} /><CopyButton text={`My GPA is ${gpa} — ToolForge`} /></div>;
}

export function TipSplitter() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [bill, setBill] = useState(80); const [tip, setTip] = useState(18); const [people, setPeople] = useState(4);
  const tipAmt = (bill * tip / 100).toFixed(2); const total = (Number(bill) + Number(tipAmt)).toFixed(2); const perPerson = (total / people).toFixed(2);
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Bill Total (${sym})`}><NumInput val={bill} set={setBill} /></Row><Row label="Tip (%)"><div style={{ display: "flex", gap: 6 }}>{[10,15,18,20,25].map(p => <button key={p} onClick={() => setTip(p)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${tip===p?T.accent:T.border}`, background: tip===p?T.accentDim:"white", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans, sans-serif", color: tip===p?T.accent:T.muted }}>{p}%</button>)}</div></Row><Row label="Number of People"><NumInput val={people} set={setPeople} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Tip Amount" value={`${sym}${tipAmt}`} /><MiniResult label="Total Bill" value={`${sym}${total}`} /></div><Result label="Each Person Pays" value={`${sym}${perPerson}`} /><CopyButton text={`Bill split: ${sym}${perPerson} each — ToolForge`} /></div>;
}

export function MarginCalc() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [cost, setCost] = useState(30); const [price, setPrice] = useState(75);
  const profit = (price - cost).toFixed(2); const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : 0; const markup = cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : 0;
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Cost Price (${sym})`}><NumInput val={cost} set={setCost} /></Row><Row label={`Selling Price (${sym})`}><NumInput val={price} set={setPrice} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Profit" value={`${sym}${profit}`} /><MiniResult label="Markup %" value={`${markup}%`} /></div><Result label="Profit Margin" value={`${margin}%`} color={margin >= 40 ? T.green : margin >= 20 ? T.accent : "#dc2626"} /><CopyButton text={`Profit margin: ${margin}% — ToolForge`} /><Tip>{margin >= 40 ? "Excellent margin!" : margin >= 20 ? "Decent margin." : "Low margin — review your pricing."}</Tip></div>;
}

export function BreakEvenCalc() {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [fixed, setFixed] = useState(3000); const [varCost, setVarCost] = useState(20); const [sellPrice, setSellPrice] = useState(50);
  const contrib = sellPrice - varCost; const units = contrib > 0 ? Math.ceil(fixed / contrib) : "∞"; const revenue = typeof units === "number" ? (units * sellPrice).toFixed(0) : "∞";
  return <div><CurrencyPicker value={currency} onChange={setCurrency} /><Row label={`Monthly Fixed Costs (${sym})`}><NumInput val={fixed} set={setFixed} /></Row><Row label={`Variable Cost per Unit (${sym})`}><NumInput val={varCost} set={setVarCost} /></Row><Row label={`Selling Price per Unit (${sym})`}><NumInput val={sellPrice} set={setSellPrice} /></Row><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><MiniResult label="Contribution Margin" value={`${sym}${contrib}`} /><MiniResult label="Break-Even Revenue" value={`${sym}${Number(revenue).toLocaleString()}`} /></div><Result label="Units to Break Even" value={typeof units === "number" ? units.toLocaleString() : "∞"} /><CopyButton text={`Break-even: ${units} units — ToolForge`} /><Tip>Sell more than {units} units per month and you're profitable.</Tip></div>;
}

export function DeadlineCountdown({ label, setLabel, target, setTarget, pinned, onTogglePin, running, onStart, onStop }) {
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

export function PomodoroTimer({ modes, modeId, secondsLeft, running, pinned, sessions, paused, onStart, onPause, onReset, onSwitchMode, onTogglePin }) {
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

export function FloatingWidget({ widgets, removeWidget, activePill, setActivePill, onOpenTool }) {
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
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, flexShrink: 0 }}>
          {keys.length > 1 && (
            <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", fontSize: 11, color: T.muted, cursor: "pointer", fontFamily: "DM Sans, sans-serif", padding: "4px 6px", borderRadius: 6, whiteSpace: "nowrap" }}>
              {expanded ? "less ▴" : `+${keys.length - 1} more ▾`}
            </button>
          )}
          <button onClick={() => { keys.forEach(id => removeWidget(id)); }} style={{ background: T.bg, border: "none", borderRadius: 8, color: T.muted, fontSize: 13, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      </div>
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

export function TimezoneConverter() {
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
    { offset: 4,     label: "UTC+4",     regions: "Dubai, Baku, Tbilisi" },
    { offset: 4.5,   label: "UTC+4:30",  regions: "Kabul" },
    { offset: 5,     label: "UTC+5",     regions: "Karachi, Tashkent, Yekaterinburg" },
    { offset: 5.5,   label: "UTC+5:30",  regions: "Mumbai, Delhi, Colombo" },
    { offset: 5.75,  label: "UTC+5:45",  regions: "Kathmandu" },
    { offset: 6,     label: "UTC+6",     regions: "Dhaka, Almaty, Omsk" },
    { offset: 6.5,   label: "UTC+6:30",  regions: "Yangon (Rangoon)" },
    { offset: 7,     label: "UTC+7",     regions: "Bangkok, Jakarta, Hanoi" },
    { offset: 8,     label: "UTC+8",     regions: "Beijing, Singapore, Hong Kong, Perth" },
    { offset: 8.75,  label: "UTC+8:45",  regions: "Eucla, Australia" },
    { offset: 9,     label: "UTC+9",     regions: "Tokyo, Seoul, Yakutsk" },
    { offset: 9.5,   label: "UTC+9:30",  regions: "Adelaide, Darwin" },
    { offset: 10,    label: "UTC+10",    regions: "Sydney, Melbourne, Vladivostok" },
    { offset: 10.5,  label: "UTC+10:30", regions: "Lord Howe Island" },
    { offset: 11,    label: "UTC+11",    regions: "Solomon Islands, Magadan" },
    { offset: 12,    label: "UTC+12",    regions: "Auckland, Fiji, Kamchatka" },
    { offset: 12.75, label: "UTC+12:45", regions: "Chatham Islands" },
    { offset: 13,    label: "UTC+13",    regions: "Tonga, Samoa (DST)" },
    { offset: 14,    label: "UTC+14",    regions: "Line Islands (Kiribati)" },
  ];

  const [tab, setTab] = useState("city");
  const [fromLabel, setFromLabel] = useState("New York");
  const [inputTime, setInputTime] = useState(() => { const n = new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; });
  const [myUtcOffset, setMyUtcOffset] = useState(0);
  const [filterRegion, setFilterRegion] = useState("All");

  const regions = ["All", ...Array.from(new Set(CITIES.map(c => c.region)))];
  const fromCity = CITIES.find(c => c.label === fromLabel) || CITIES[0];

  const convert = (toTz) => {
    const [hStr, mStr] = inputTime.split(":");
    const h = parseInt(hStr, 10); const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return { time: "--:--", period: "", offset: "" };
    const now = new Date();
    now.setHours(h, m, 0, 0);
    const fromStr = now.toLocaleString("en-US", { timeZone: fromCity.tz });
    const toStr = now.toLocaleString("en-US", { timeZone: toTz });
    const fromDate = new Date(fromStr); const toDate2 = new Date(toStr);
    const diffMs = toDate2 - fromDate;
    const result = new Date(now.getTime() + diffMs);
    const rh = result.getHours(); const rm = result.getMinutes();
    const timeStr = `${String(rh).padStart(2,"0")}:${String(rm).padStart(2,"0")}`;
    const period = rh < 6 ? "🌙 Night" : rh < 12 ? "🌅 Morning" : rh < 17 ? "☀️ Afternoon" : rh < 21 ? "🌆 Evening" : "🌙 Night";
    const offH = Math.floor(Math.abs(diffMs) / 36e5); const offSign = diffMs >= 0 ? "+" : "-";
    const offsetStr = diffMs === 0 ? "same time" : `${offSign}${offH}h`;
    return { time: timeStr, period, offset: offsetStr };
  };

  const diffColor = (diff) => {
    if (diff === 0) return T.green;
    if (Math.abs(diff) <= 3) return T.blue;
    if (Math.abs(diff) <= 6) return T.gold;
    return T.accent;
  };

  const filteredCities = filterRegion === "All" ? CITIES : CITIES.filter(c => c.region === filterRegion);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["city", "utc"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: `1.5px solid ${tab === t ? T.teal : T.border}`, background: tab === t ? T.tealDim : "white", color: tab === t ? T.teal : T.muted, fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
            {t === "city" ? "🌆 City Converter" : "🕐 UTC Offset Tool"}
          </button>
        ))}
      </div>

      {tab === "city" && (
        <div>
          <Row label="Convert from">
            <select value={fromLabel} onChange={e => setFromLabel(e.target.value)} style={inputStyle}>
              {CITIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
            </select>
          </Row>
          <Row label="Time">
            <input type="time" value={inputTime} onChange={e => setInputTime(e.target.value)} style={inputStyle} />
          </Row>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {regions.map(r => (
              <button key={r} onClick={() => setFilterRegion(r)} style={{ padding: "5px 10px", borderRadius: 99, border: `1px solid ${filterRegion === r ? T.teal : T.border}`, background: filterRegion === r ? T.tealDim : "white", color: filterRegion === r ? T.teal : T.muted, fontSize: 11, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>{r}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredCities.filter(z => z.label !== fromLabel).map(z => {
              const r = convert(z.tz);
              return (
                <div key={z.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", borderRadius: 9, background: "white", border: `1px solid ${T.border}` }}>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: T.ink }}>{z.label}</div>
                    <div style={{ fontSize: 10, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>{z.region} · {r.period}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: T.teal }}>{r.time}</div>
                    <div style={{ fontSize: 10, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>{r.offset}</div>
                  </div>
                </div>
              );
            })}
          </div>
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

export function UnitConverter() {
  const cats = { Length: { units: ["mm","cm","m","km","in","ft","yd","mi"], toBase: { mm:.001,cm:.01,m:1,km:1000,in:.0254,ft:.3048,yd:.9144,mi:1609.34 } }, Weight: { units: ["mg","g","kg","oz","lb"], toBase: { mg:.000001,g:.001,kg:1,oz:.0283495,lb:.453592 } }, Temperature: { units: ["°C","°F","K"], toBase: null }, Volume: { units: ["ml","L","fl oz","cup","gal"], toBase: { ml:.001,L:1,"fl oz":.0295735,cup:.236588,gal:3.78541 } } };
  const [catKey, setCatKey] = useState("Length"); const [fromUnit, setFromUnit] = useState("m"); const [toUnit, setToUnit] = useState("ft"); const [value, setValue] = useState(1);
  const cat = cats[catKey];
  const convert = () => { const v = Number(value); if (catKey === "Temperature") { if (fromUnit===toUnit) return String(v); if (fromUnit==="°C"&&toUnit==="°F") return (v*9/5+32).toFixed(2); if (fromUnit==="°C"&&toUnit==="K") return (v+273.15).toFixed(2); if (fromUnit==="°F"&&toUnit==="°C") return ((v-32)*5/9).toFixed(2); if (fromUnit==="°F"&&toUnit==="K") return ((v-32)*5/9+273.15).toFixed(2); if (fromUnit==="K"&&toUnit==="°C") return (v-273.15).toFixed(2); if (fromUnit==="K"&&toUnit==="°F") return ((v-273.15)*9/5+32).toFixed(2); } return (v*cat.toBase[fromUnit]/cat.toBase[toUnit]).toFixed(6).replace(/\.?0+$/,""); };
  return <div><Row label="Category"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{Object.keys(cats).map(k => <button key={k} onClick={() => { setCatKey(k); setFromUnit(cats[k].units[0]); setToUnit(cats[k].units[1]); }} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${catKey===k?T.accent:T.border}`, background:catKey===k?T.accentDim:"white", color:catKey===k?T.accent:T.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>{k}</button>)}</div></Row><Row label="Value"><NumInput val={value} set={setValue} /></Row><div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"end", marginBottom:10 }}><Row label="From"><select value={fromUnit} onChange={e=>setFromUnit(e.target.value)} style={inputStyle}>{cat.units.map(u=><option key={u}>{u}</option>)}</select></Row><div style={{ fontSize:18, color:T.muted, paddingBottom:4, textAlign:"center" }}>→</div><Row label="To"><select value={toUnit} onChange={e=>setToUnit(e.target.value)} style={inputStyle}>{cat.units.map(u=><option key={u}>{u}</option>)}</select></Row></div><Result label={`${value} ${fromUnit} =`} value={`${convert()} ${toUnit}`} /><CopyButton text={`${value} ${fromUnit} = ${convert()} ${toUnit} — ToolForge`} /></div>;
}

export function StudyPlanner() {
  const [subject, setSubject] = useState("Calculus"); const [hours, setHours] = useState(10); const [days, setDays] = useState(5); const [technique, setTech] = useState("pomodoro");
  const techniques = { pomodoro:{label:"Pomodoro (25min on / 5min break)",mins:30}, deep:{label:"Deep Work (90min blocks)",mins:90}, spaced:{label:"Spaced Repetition (30min review)",mins:30} };
  const t = techniques[technique]; const sessions = Math.ceil((hours * 60) / t.mins); const perDay = Math.ceil(sessions / days);
  return <div><Row label="Subject / Topic"><input value={subject} onChange={e=>setSubject(e.target.value)} style={inputStyle} /></Row><Row label="Total Study Hours Needed"><NumInput val={hours} set={setHours} /></Row><Row label="Days Available"><NumInput val={days} set={setDays} /></Row><Row label="Study Technique">{Object.entries(techniques).map(([k,v]) => <div key={k} onClick={()=>setTech(k)} style={{ padding:"9px 12px", borderRadius:8, marginBottom:6, border:`1px solid ${technique===k?T.purple:T.border}`, background:technique===k?T.purpleDim:"white", cursor:"pointer", fontSize:12, color:technique===k?T.purple:T.muted, fontFamily:"DM Sans, sans-serif" }}>{v.label}</div>)}</Row><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}><MiniResult label="Sessions Needed" value={sessions} /><MiniResult label="Per Day" value={perDay} /></div><Result label={`Daily Plan for ${subject}`} value={`${perDay} × ${t.mins}min`} color={T.purple} /><CopyButton text={`Study plan: ${perDay} sessions/day for ${subject} — ToolForge`} /><Tip>Consistency beats cramming.</Tip></div>;
}

export function CitationFormatter() {
  const [style, setStyle] = useState("APA"); const [type, setType] = useState("book"); const [author, setAuthor] = useState("Smith, J."); const [title, setTitle] = useState("The Art of Learning"); const [year, setYear] = useState("2023"); const [publisher, setPub] = useState("Penguin Press"); const [url, setUrl] = useState("");
  const cite = () => { if (style==="APA") return type==="website"?`${author} (${year}). ${title}. Retrieved from ${url}`:`${author} (${year}). *${title}*. ${publisher}.`; if (style==="MLA") return type==="website"?`${author} "${title}." ${year}${url ? ", " + url : ""}.`:`${author} *${title}*. ${publisher}, ${year}.`; return type==="website"?`${author} "${title}." Accessed ${year}${url ? ". " + url : ""}.`:`${author} *${title}*. ${publisher}, ${year}.`; };
  return <div><Row label="Citation Style"><div style={{ display:"flex", gap:6 }}>{["APA","MLA","Chicago"].map(s => <button key={s} onClick={()=>setStyle(s)} style={{ flex:1, padding:"7px 0", borderRadius:8, border:`1px solid ${style===s?T.purple:T.border}`, background:style===s?T.purpleDim:"white", color:style===s?T.purple:T.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:600, cursor:"pointer" }}>{s}</button>)}</div></Row><Row label="Source Type"><div style={{ display:"flex", gap:6 }}>{["book","website"].map(tp => <button key={tp} onClick={()=>setType(tp)} style={{ flex:1, padding:"7px 0", borderRadius:8, border:`1px solid ${type===tp?T.purple:T.border}`, background:type===tp?T.purpleDim:"white", color:type===tp?T.purple:T.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>{tp.charAt(0).toUpperCase()+tp.slice(1)}</button>)}</div></Row><Row label="Author (Last, F.)"><input value={author} onChange={e=>setAuthor(e.target.value)} style={inputStyle} /></Row><Row label="Title"><input value={title} onChange={e=>setTitle(e.target.value)} style={inputStyle} /></Row><Row label="Year"><input value={year} onChange={e=>setYear(e.target.value)} style={inputStyle} /></Row>{type==="book"&&<Row label="Publisher"><input value={publisher} onChange={e=>setPub(e.target.value)} style={inputStyle} /></Row>}{type==="website"&&<Row label="URL"><input value={url} onChange={e=>setUrl(e.target.value)} style={inputStyle} placeholder="https://..." /></Row>}<div style={{ marginTop:14, padding:14, borderRadius:10, background:T.purpleDim, border:`1px solid ${T.purple}33`, fontSize:13, color:T.ink, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>{cite()}</div><CopyButton text={cite()} /></div>;
}

export function WordCounter() {
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
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste or type your text here…" style={{ width: "100%", minHeight: 200, padding: "13px 14px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 14, fontFamily: "DM Sans, sans-serif", color: T.ink, background: "#fdfcfb", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.border)} />
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

export function BMICalculator() {
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

export function QRGenerator() {
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
