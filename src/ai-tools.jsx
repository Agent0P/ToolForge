import { useState } from "react";
import { T, inputStyle, CURRENCIES, Row, Result, MiniResult, Tip, CopyButton, CurrencyPicker } from "./theme";

export function SavingsCalc({ proToken, onNeedUpgrade, onTokenUpdate }) {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [goal, setGoal] = useState(10000);
  const [saved, setSaved] = useState(1000);
  const [monthly, setMonthly] = useState(300);
  const [investType, setInvestType] = useState("sp500");
  const [analysis, setAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const hasClaude = proToken && proToken.generations_left >= 1;

  const INVEST_OPTIONS = [
    { id: "cash",    label: "💵 Cash / Savings",  rate: 0.04, desc: "~4% (HYSA)"         },
    { id: "bonds",   label: "📄 Bonds / GICs",    rate: 0.05, desc: "~5% annually"        },
    { id: "sp500",   label: "📈 S&P 500 Index",   rate: 0.10, desc: "~10% historical avg" },
    { id: "growth",  label: "🚀 Growth ETF",      rate: 0.12, desc: "~12% historical avg" },
    { id: "custom",  label: "⚙️ Custom",          rate: null, desc: "Set your own %"      },
  ];
  const [customRate, setCustomRate] = useState(8);
  const selected = INVEST_OPTIONS.find(o => o.id === investType);
  const annualRate = investType === "custom" ? Number(customRate) / 100 : selected.rate;
  const monthlyRate = annualRate / 12;

  const remaining = Math.max(0, goal - saved);
  const cashMonths = monthly > 0 ? Math.ceil(remaining / monthly) : Infinity;

  let investMonths = 0;
  if (monthly > 0 || saved > 0) {
    if (monthlyRate === 0) {
      investMonths = cashMonths;
    } else {
      let balance = Number(saved);
      investMonths = 0;
      while (balance < Number(goal) && investMonths < 1200) {
        balance = balance * (1 + monthlyRate) + Number(monthly);
        investMonths++;
      }
      if (investMonths >= 1200) investMonths = Infinity;
    }
  }

  const investedBalanceAtCashDate = (() => {
    if (!isFinite(cashMonths)) return 0;
    let b = Number(saved);
    for (let i = 0; i < cashMonths; i++) b = b * (1 + monthlyRate) + Number(monthly);
    return Math.round(b);
  })();

  const extraGained = investedBalanceAtCashDate - Number(goal);
  const monthsSaved = isFinite(cashMonths) && isFinite(investMonths) ? cashMonths - investMonths : 0;

  const toDate = (months) => {
    if (!isFinite(months)) return "Never";
    return new Date(Date.now() + months * 30.5 * 864e5).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const milestones = [25, 50, 75, 100].map(pct => {
    const target = Number(goal) * pct / 100;
    const alreadyThere = Number(saved) >= target;
    if (alreadyThere) return { pct, date: "Already there ✓", months: 0 };
    let b = Number(saved), m = 0;
    if (monthlyRate > 0) {
      while (b < target && m < 1200) { b = b * (1 + monthlyRate) + Number(monthly); m++; }
    } else {
      m = monthly > 0 ? Math.ceil((target - Number(saved)) / monthly) : Infinity;
    }
    return { pct, date: toDate(m), months: m };
  });

  const getAIAnalysis = async () => {
    if (!hasClaude) { onNeedUpgrade(); return; }
    setLoadingAnalysis(true); setAnalysisError("");
    const prompt = `You are a friendly but realistic personal finance advisor. A user wants advice on their savings goal.

Their numbers:
- Goal: ${sym}${Number(goal).toLocaleString()}
- Already saved: ${sym}${Number(saved).toLocaleString()}
- Monthly contribution: ${sym}${Number(monthly).toLocaleString()}
- Chosen investment approach: ${selected?.label} (${(annualRate * 100).toFixed(1)}% annual return assumption)
- Without investing (cash): reaches goal in ${isFinite(cashMonths) ? cashMonths + " months (" + toDate(cashMonths) + ")" : "never"}
- With investing: reaches goal in ${isFinite(investMonths) ? investMonths + " months (" + toDate(investMonths) + ")" : "never"}

Write a personalised savings strategy with these sections:

1. **Reality Check** – Is this goal realistic given their numbers? Be honest. If their monthly contribution is too low, say so clearly with specific numbers.

2. **Investment Approach Assessment** – Is their chosen approach (${selected?.label}) suitable for their timeline and goal size? What are the real risks they should know about?

3. **How to Reach It Faster** – 2–3 specific, actionable things they could do to hit this goal sooner. Include numbers where possible.

4. **What Could Go Wrong** – Honest risks: market downturns, life events, inflation eroding the goal value, etc. Don't sugarcoat.

5. **One Smart Move to Make This Week** – One concrete action they can take right now.

⚠️ IMPORTANT: End every section and the overall response with a clear disclaimer: "This is not financial advice. Past returns do not guarantee future results. Consider consulting a licensed financial advisor before making investment decisions."

Be direct, specific to their numbers, and practical. No generic filler.`;

    try {
      const res = await fetch("/api/generate-claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: proToken.token, toolName: "Savings Goal Calculator", userInput: prompt, tokensToDeduct: 1 }) });
      const data = await res.json();
      if (!res.ok) { setAnalysisError(data.error || "Generation failed."); setLoadingAnalysis(false); return; }
      setAnalysis(data.result);
      onTokenUpdate({ ...proToken, generations_left: data.generations_left });
    } catch { setAnalysisError("Server error. Please try again."); }
    setLoadingAnalysis(false);
  };

  return (
    <div>
      <CurrencyPicker value={currency} onChange={setCurrency} />
      <div style={{ marginBottom: 14, padding: "9px 12px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: 11, color: "#0369a1", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>
        ⚠️ For informational purposes only. Projections are based on historical averages and are not guaranteed. This is not financial advice — consult a licensed financial advisor before making investment decisions.
      </div>
      <Row label={`Savings Goal (${sym})`}><input type="number" value={goal} onChange={e => setGoal(e.target.value)} style={inputStyle} /></Row>
      <Row label={`Already Saved (${sym})`}><input type="number" value={saved} onChange={e => setSaved(e.target.value)} style={inputStyle} /></Row>
      <Row label={`Monthly Contribution (${sym})`}><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} style={inputStyle} /></Row>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.3 }}>Investment approach</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {INVEST_OPTIONS.map(o => (
              <button key={o.id} onClick={() => setInvestType(o.id)} style={{ padding: "7px 10px", borderRadius: 9, border: `1.5px solid ${investType === o.id ? T.green : T.border}`, background: investType === o.id ? T.greenDim : "white", color: investType === o.id ? T.green : T.muted, fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{o.label}</button>
            ))}
          </div>
          {investType === "custom" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <input type="number" value={customRate} onChange={e => setCustomRate(e.target.value)} style={{ ...inputStyle, width: 80 }} />
              <span style={{ fontSize: 12, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>% annual return</span>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: T.green, fontFamily: "DM Sans, sans-serif" }}>{selected?.desc} · {(annualRate * 100).toFixed(0)}% annual return used for projection</div>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{ padding: 12, borderRadius: 12, background: T.bg, border: `1px solid ${T.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, fontFamily: "DM Sans, sans-serif" }}>💵 Saving only</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, fontFamily: "Syne, sans-serif" }}>{isFinite(cashMonths) ? cashMonths + " mo" : "Never"}</div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>{toDate(cashMonths)}</div>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: T.greenDim, border: `1.5px solid ${T.green}`, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.green, marginBottom: 4, fontFamily: "DM Sans, sans-serif" }}>📈 Invested ({(annualRate*100).toFixed(0)}%)</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.green, fontFamily: "Syne, sans-serif" }}>{isFinite(investMonths) ? investMonths + " mo" : "Never"}</div>
          <div style={{ fontSize: 11, color: T.green, fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>{toDate(investMonths)}</div>
        </div>
      </div>
      {isFinite(monthsSaved) && monthsSaved > 0 && (
        <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 10, background: T.greenDim, border: `1px solid ${T.green}44`, fontSize: 12, color: T.green, fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>
          🎯 Investing gets you there <strong>{monthsSaved} months sooner</strong>
          {extraGained > 0 && <> · and you'd have <strong>{sym}{extraGained.toLocaleString()}</strong> extra by the original cash deadline</>}
        </div>
      )}
      <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 12, background: T.bg, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 10, color: T.muted, marginBottom: 10, letterSpacing: 0.3, fontFamily: "DM Sans, sans-serif" }}>MILESTONE TRACKER</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {milestones.map(m => (
            <div key={m.pct} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", borderRadius: 8, background: m.months === 0 ? T.greenDim : "white", border: `1px solid ${m.months === 0 ? T.green : T.border}` }}>
              <span style={{ fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, color: m.months === 0 ? T.green : T.ink }}>{m.pct}%</span>
              <span style={{ fontSize: 10, color: m.months === 0 ? T.green : T.muted, fontFamily: "DM Sans, sans-serif" }}>{m.date}</span>
            </div>
          ))}
        </div>
      </div>
      <Result label="Goal Reached By (Invested)" value={toDate(investMonths)} color={T.green} />
      <CopyButton text={`My ${sym}${Number(goal).toLocaleString()} savings goal: reached by ${toDate(investMonths)} investing at ${(annualRate*100).toFixed(0)}% vs ${toDate(cashMonths)} saving only — ToolForge`} />
      {!analysis && (
        <div style={{ marginTop: 14, padding: 16, borderRadius: 12, border: `2px solid ${T.gold}`, background: T.goldDim }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: T.gold, marginBottom: 4 }}>✦ AI Savings Strategy</div>
          <div style={{ fontSize: 12, color: T.gold, fontFamily: "DM Sans, sans-serif", lineHeight: 1.6, marginBottom: 12 }}>Get a personalised reality check on your plan — is it realistic, what could go wrong, how to reach it faster, and one smart move to make this week.</div>
          {analysisError && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", fontSize: 11, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>{analysisError}</div>}
          {loadingAnalysis ? (
            <div style={{ padding: "18px 14px", borderRadius: 10, background: "rgba(255,255,255,0.6)", border: `1px solid ${T.gold}55`, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold, animation: `tf-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
              <style>{`@keyframes tf-bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }`}</style>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: T.gold, marginBottom: 4 }}>Claude is building your strategy…</div>
              <div style={{ fontSize: 11, color: T.gold, fontFamily: "DM Sans, sans-serif", opacity: 0.8 }}>This takes 15–20 seconds. Please don't close this page.</div>
            </div>
          ) : (
            <button onClick={getAIAnalysis} style={{ width: "100%", padding: "11px 0", borderRadius: 9, border: "none", background: T.gold, color: "white", fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
              {hasClaude ? `✦ Get AI Strategy · 1 token (${proToken.generations_left} left)` : "✦ Unlock AI Strategy — from $2.99"}
            </button>
          )}
        </div>
      )}
      {analysis && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: T.gold, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.5, marginBottom: 8, fontWeight: 700 }}>✦ AI SAVINGS STRATEGY</div>
          <div style={{ padding: 14, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, fontSize: 13, lineHeight: 1.8, color: T.ink, whiteSpace: "pre-wrap", fontFamily: "DM Sans, sans-serif" }}>{analysis}</div>
          <CopyButton text={analysis} />
        </div>
      )}
    </div>
  );
}

export function SalaryHelper({ proToken, onNeedUpgrade, onTokenUpdate }) {
  const [currency, setCurrency] = useState("USD");
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || "$";
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [situation, setSituation] = useState("new_offer");
  const [current, setCurrent] = useState("");
  const [experience, setExp] = useState("");
  const [competing, setCompeting] = useState("no");
  const [topSkills, setTopSkills] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [employed, setEmployed] = useState("");
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const hasClaude = proToken && proToken.generations_left >= 2;
  const canCalculate = role.trim() && current && experience;

  const calculate = () => {
    const exp = Number(experience);
    const base = Number(current);
    const hasCompeting = competing === "yes";
    const bracket = exp <= 2
      ? { low: 0.10, high: 0.15, label: "Entry level", tip: "You have less leverage at this stage — lead with enthusiasm and long-term potential." }
      : exp <= 5
      ? { low: 0.15, high: 0.20, label: "Mid-level", tip: "Standard negotiation range. Companies expect this — asking is normal and respected." }
      : exp <= 10
      ? { low: 0.20, high: 0.28, label: "Senior", tip: "You have strong leverage. Be direct and anchor high — you can always come down." }
      : { low: 0.25, high: 0.35, label: "Principal / Lead", tip: "Negotiate the full package: base, bonus, equity, flexibility. Don't leave any of it on the table." };
    const lowBoost = hasCompeting ? 0.05 : 0;
    const target = Math.round(base * (1 + bracket.low + lowBoost) / 1000) * 1000;
    const stretch = Math.round(base * (1 + bracket.high + lowBoost) / 1000) * 1000;
    const midpoint = Math.round((target + stretch) / 2 / 1000) * 1000;
    const pctLow = Math.round((bracket.low + lowBoost) * 100);
    const pctHigh = Math.round((bracket.high + lowBoost) * 100);
    setResult({ base, exp, target, stretch, midpoint, pctLow, pctHigh, bracket, hasCompeting });
    setAnalysis(""); setAnalysisError("");
  };

  const getFullAnalysis = async () => {
    if (!hasClaude) { onNeedUpgrade(); return; }
    setLoadingAnalysis(true); setAnalysisError("");
    const prompt = `You are a senior compensation consultant and career coach with deep knowledge of global salary markets. A user wants a full salary negotiation analysis.

Their situation:
- Role: ${role}
- Industry: ${industry || "not specified"}
- Location: ${location || "not specified"}
- Situation: ${situation === "new_offer" ? "Received a new job offer" : situation === "raise" ? "Asking for a raise" : "Going for a promotion"}
- Offered/Current salary: ${sym}${Number(current).toLocaleString()}
- Years of experience: ${experience}
- Company size/type: ${companySize ? { startup: "Early-stage startup", scaleup: "Scale-up (growth stage)", midsize: "Mid-size company", enterprise: "Large enterprise", public: "Publicly listed company" }[companySize] : "not specified"}
- Employment status: ${employed === "employed" ? "Currently employed (has leverage to walk away)" : employed === "unemployed" ? "Currently between jobs (less walk-away leverage)" : "not specified"}
- Competing offer: ${competing === "yes" ? "Yes" : "No"}
- Key skills/strengths: ${topSkills || "not specified"}
- Calculated negotiation range: ${sym}${result.target.toLocaleString()} – ${sym}${result.stretch.toLocaleString()}

Give a thorough, personalised negotiation analysis with these sections:

1. **Situation Assessment** – Read their specific situation. What leverage do they actually have? Be honest if it's weak.
2. **Market Rate Reality Check** – Based on the role, industry, location and experience level, what does this position actually pay in the real market right now? Is the offer fair, below market, or above market? Give a realistic salary range you'd expect to see for this exact profile, and explain your reasoning. Be specific — use real market knowledge, not generalities.
3. **Why This Negotiation Range** – Explain in detail why the calculated range (${sym}${result.target.toLocaleString()} – ${sym}${result.stretch.toLocaleString()}) makes sense given their profile and the market context above.
4. **Timing & How to Play It** – Tactical advice on when to bring up the number, how many rounds of back-and-forth to expect, whether to name a number first or wait for them. Tailor this specifically to their situation (${situation === "new_offer" ? "new offer" : situation === "raise" ? "asking for a raise" : "promotion"}).
5. **Negotiation Strategy** – Step-by-step approach for their specific situation. What to say, in what order, and how to frame it.
6. **Word-for-Word Script** – A strong opening line, and a confident response to "this is our final offer / we can't go higher."
7. **The Compounding Argument** – Calculate what successfully negotiating to the midpoint (${sym}${result.midpoint.toLocaleString()}) means financially over 5 and 10 years, assuming 3% annual raises compound on top of this new base. Show the actual numbers. This helps them feel the real stakes of the conversation.
8. **Watch Out For** – 2–3 specific red flags or mistakes to avoid given their exact situation.
9. **Beyond Base Salary** – What else is on the table to negotiate: bonus structure, equity, remote flexibility, title, early review date, signing bonus, etc. Prioritise by what's most realistic for their role and industry.

Be specific, direct and practical. No filler. Every section should feel personalised to this person's situation, not generic advice.`;

    try {
      const res = await fetch("/api/generate-claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: proToken.token, toolName: "Salary Negotiation Helper", userInput: prompt, tokensToDeduct: 2 }) });
      const data = await res.json();
      if (!res.ok) { setAnalysisError(data.error || "Generation failed."); setLoadingAnalysis(false); return; }
      setAnalysis(data.result);
      onTokenUpdate({ ...proToken, generations_left: data.generations_left });
    } catch { setAnalysisError("Server error. Please try again."); }
    setLoadingAnalysis(false);
  };

  const situationLabels = { new_offer: "💼 New Job Offer", raise: "📈 Asking for a Raise", promotion: "🚀 Going for Promotion" };

  return (
    <div>
      <CurrencyPicker value={currency} onChange={setCurrency} />
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.3 }}>What's your situation?</div>
        <div style={{ display: "flex", gap: 6 }}>
          {Object.entries(situationLabels).map(([val, label]) => (
            <button key={val} onClick={() => setSituation(val)} style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: `1.5px solid ${situation === val ? T.blue : T.border}`, background: situation === val ? T.blueDim : "white", color: situation === val ? T.blue : T.muted, fontSize: 10, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer", lineHeight: 1.4 }}>{label}</button>
          ))}
        </div>
      </div>
      <Row label="Job Title / Role"><input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Product Manager" style={inputStyle} /></Row>
      <Row label="Industry (optional)"><input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Tech, Finance, Healthcare" style={inputStyle} /></Row>
      <Row label="Location (optional)"><input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. New York, London, Remote" style={inputStyle} /></Row>
      <Row label={`${situation === "raise" ? "Current" : "Offered"} Salary (${sym})`}><input type="number" value={current} onChange={e => setCurrent(e.target.value)} style={inputStyle} /></Row>
      <Row label="Years of Experience in This Field"><input type="number" value={experience} onChange={e => setExp(e.target.value)} style={inputStyle} /></Row>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.3 }}>Company size / type</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["startup", "🚀 Startup"], ["scaleup", "📈 Scale-up"], ["midsize", "🏢 Mid-size"], ["enterprise", "🌐 Enterprise"], ["public", "📋 Public Co."]].map(([val, label]) => (
            <button key={val} onClick={() => setCompanySize(val)} style={{ padding: "7px 10px", borderRadius: 9, border: `1.5px solid ${companySize === val ? T.purple : T.border}`, background: companySize === val ? T.purpleDim : "white", color: companySize === val ? T.purple : T.muted, fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.3 }}>Your current employment status</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["employed", "✅ Currently employed"], ["unemployed", "🔍 Between jobs"]].map(([val, label]) => (
            <button key={val} onClick={() => setEmployed(val)} style={{ flex: 1, padding: "8px 6px", borderRadius: 9, border: `1.5px solid ${employed === val ? T.accent : T.border}`, background: employed === val ? T.accentDim : "white", color: employed === val ? T.accent : T.muted, fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.3 }}>Do you have a competing offer?</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["no", "No"], ["yes", "Yes — I have one"]].map(([val, label]) => (
            <button key={val} onClick={() => setCompeting(val)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: `1.5px solid ${competing === val ? T.green : T.border}`, background: competing === val ? T.greenDim : "white", color: competing === val ? T.green : T.muted, fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>
      <Row label="Your strongest skills / achievements (optional)"><input value={topSkills} onChange={e => setTopSkills(e.target.value)} placeholder="e.g. led team of 10, increased revenue 40%" style={inputStyle} /></Row>
      <button onClick={calculate} disabled={!canCalculate} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: canCalculate ? T.blue : T.border, color: canCalculate ? "white" : T.muted, fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: canCalculate ? "pointer" : "default", marginTop: 4, marginBottom: 16, letterSpacing: 0.3 }}>
        Calculate My Range →
      </button>
      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <MiniResult label="Open With" value={`${sym}${result.stretch.toLocaleString()}`} />
            <MiniResult label="Accept At" value={`${sym}${result.target.toLocaleString()}`} />
            <MiniResult label="Midpoint" value={`${sym}${result.midpoint.toLocaleString()}`} />
          </div>
          <Result label="Your Negotiation Range" value={`${sym}${result.target.toLocaleString()} – ${sym}${result.stretch.toLocaleString()}`} color={T.blue} />
          <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, fontSize: 12, color: T.ink, fontFamily: "DM Sans, sans-serif", lineHeight: 1.8 }}>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, letterSpacing: 0.3 }}>WHY THESE NUMBERS</div>
            Base: {sym}{result.base.toLocaleString()} · {result.exp} years ({result.bracket.label}) → +{result.pctLow}–{result.pctHigh}%
            {result.hasCompeting && <span style={{ color: T.green }}> · +5% competing offer boost</span>}<br/>
            <span style={{ fontSize: 11, color: T.muted }}>Always open with your stretch number — you can always come down, never up.</span>
          </div>
          <Tip>{result.bracket.tip}</Tip>
          <CopyButton text={`${role} negotiation range: ${sym}${result.target.toLocaleString()} – ${sym}${result.stretch.toLocaleString()} — ToolForge`} />
          {!analysis && (
            <div style={{ marginTop: 14, padding: 16, borderRadius: 12, border: `2px solid ${T.gold}`, background: T.goldDim }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: T.gold, marginBottom: 4 }}>✦ Full AI Negotiation Analysis</div>
              <div style={{ fontSize: 12, color: T.gold, fontFamily: "DM Sans, sans-serif", lineHeight: 1.6, marginBottom: 12 }}>Get a personalised deep-dive: market rate context, timing tactics, a word-for-word script, compounding impact over 10 years, and what else to negotiate beyond base salary.</div>
              {analysisError && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", fontSize: 11, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>{analysisError}</div>}
              {loadingAnalysis ? (
                <div style={{ padding: "18px 14px", borderRadius: 10, background: "rgba(255,255,255,0.6)", border: `1px solid ${T.gold}55`, textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold, animation: `tf-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                  </div>
                  <style>{`@keyframes tf-bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }`}</style>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: T.gold, marginBottom: 4 }}>Claude is analysing your situation…</div>
                  <div style={{ fontSize: 11, color: T.gold, fontFamily: "DM Sans, sans-serif", opacity: 0.8 }}>This takes 15–30 seconds. Please don't close this page.</div>
                </div>
              ) : (
                <button onClick={getFullAnalysis} style={{ width: "100%", padding: "11px 0", borderRadius: 9, border: "none", background: T.gold, color: "white", fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
                  {hasClaude ? `✦ See Full Analysis · 2 tokens (${proToken.generations_left} left)` : "✦ Unlock Full Analysis — from $2.99"}
                </button>
              )}
            </div>
          )}
          {analysis && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: T.gold, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.5, marginBottom: 8, fontWeight: 700 }}>✦ FULL AI ANALYSIS</div>
              <div style={{ padding: 14, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, fontSize: 13, lineHeight: 1.8, color: T.ink, whiteSpace: "pre-wrap", fontFamily: "DM Sans, sans-serif" }}>{analysis}</div>
              <CopyButton text={analysis} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const GROQ_PROMPTS = {
  "Cover Letter Generator": "You are an expert cover letter writer. Write a concise, compelling cover letter based on the job description provided. Output the letter only, no preamble.",
  "LinkedIn Bio Writer": "You are a LinkedIn profile expert. Write a punchy, professional LinkedIn About section in first person. Max 3 short paragraphs. Output only the bio.",
  "Cold Email Generator": "You are a cold email copywriter. Write a concise cold email. First line: Subject: [subject]. Then the email body. Keep it under 150 words.",
  "Business Tagline Generator": "You are a brand copywriter. Generate 5 punchy, memorable taglines. Output as a numbered list only.",
  "Essay Outline Generator": "You are an academic writing coach. Create a structured essay outline with intro, 3-4 body sections, and conclusion. Output the outline only.",
  "Client Proposal Writer": "You are a freelance consultant. Write a professional project proposal with: Overview, Scope, Timeline, Investment. Output the proposal only.",
  "Invoice Text Generator": "You are an invoicing assistant. Generate clean invoice line items and a payment note. Output invoice text only.",
  "Marketing Email Writer": "You are an email marketer. Write a high-converting marketing email with subject, preview text, body and CTA. Output the email only.",
  "Resume Reviewer": "You are a professional CV and resume coach. Give a brief but honest review of the resume provided. Cover: (1) overall impression in 2 sentences, (2) top 2 strengths, (3) top 3 things to improve immediately. Be direct and specific. Output only the review, no preamble.",
};

export function ResumeReviewer({ proToken, onNeedUpgrade, onTokenUpdate }) {
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [freeReview, setFreeReview] = useState("");
  const [fullReview, setFullReview] = useState("");
  const [loadingFree, setLoadingFree] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);
  const [freeError, setFreeError] = useState("");
  const [fullError, setFullError] = useState("");
  const [groqCount, setGroqCount] = useState(() => { try { const s = localStorage.getItem("tf_groq_usage"); if (!s) return 0; const { date, count } = JSON.parse(s); return new Date().toDateString() === date ? count : 0; } catch { return 0; } });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const groqAtLimit = groqCount >= 3;
  const hasClaude = proToken && proToken.generations_left >= 2;
  const canReview = cvText.trim().length > 100;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(""); setUploading(true);
    const ext = file.name.split(".").pop().toLowerCase();
    try {
      if (ext === "txt") {
        const text = await file.text();
        setCvText(text);
      } else if (ext === "docx" || ext === "doc") {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setCvText(result.value);
      } else {
        setUploadError("Unsupported file type. Please upload a .txt or .docx file, or paste your CV text directly.");
      }
    } catch { setUploadError("Couldn't read the file. Try pasting your CV text directly instead."); }
    setUploading(false);
    e.target.value = "";
  };

  const getFreeReview = async () => {
    if (!canReview || groqAtLimit) return;
    setLoadingFree(true); setFreeError(""); setFreeReview(""); setFullReview("");
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY || ""}` }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 600, messages: [{ role: "system", content: GROQ_PROMPTS["Resume Reviewer"] }, { role: "user", content: `${targetRole ? `Target role: ${targetRole}\n\n` : ""}Resume:\n${cvText}` }] }) });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty");
      setFreeReview(text);
      const n = groqCount + 1; setGroqCount(n); localStorage.setItem("tf_groq_usage", JSON.stringify({ date: new Date().toDateString(), count: n }));
    } catch { setFreeError("Review failed. Please try again."); }
    setLoadingFree(false);
  };

  const getFullReview = async () => {
    if (!hasClaude) { onNeedUpgrade(); return; }
    setLoadingFull(true); setFullError("");
    const prompt = `You are a senior recruitment consultant and CV expert who has reviewed thousands of CVs across all industries. Give a thorough, honest, and actionable review of the following resume.
${targetRole ? `The candidate is targeting: ${targetRole}` : ""}

Resume:
${cvText}

Provide a full structured review with these sections:

1. **Overall Score: X/100** – Give a score and a one-line verdict. Be honest — most CVs score between 40–75.
2. **First Impression** – What does a recruiter think in the first 6 seconds? Does it pass the scan test?
3. **Section-by-Section Breakdown**
   - Summary/Objective: (if present)
   - Work Experience: quality of bullet points, use of numbers/results, action verbs
   - Skills: relevance, specificity, layout
   - Education: appropriate level of detail
   - Format & Design: readability, length, ATS-friendliness
4. **ATS Compatibility Check** – Will this CV get filtered out by applicant tracking systems? What keywords or formatting issues could cause problems?
5. **Top 3 Critical Fixes** – The 3 most impactful changes they should make immediately, with specific examples.
6. **Rewrite Examples** – Take 2 weak bullet points from their CV and rewrite them stronger (more results-focused, quantified where possible).
7. **Honest Verdict** – Would you shortlist this candidate for an interview? Why or why not?

Be specific, reference their actual CV content, and don't soften feedback that needs to be heard. This person wants to get hired — help them do that.`;

    try {
      const res = await fetch("/api/generate-claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: proToken.token, toolName: "Resume Reviewer", userInput: prompt, tokensToDeduct: 2 }) });
      const data = await res.json();
      if (!res.ok) { setFullError(data.error || "Generation failed."); setLoadingFull(false); return; }
      setFullReview(data.result);
      onTokenUpdate({ ...proToken, generations_left: data.generations_left });
    } catch { setFullError("Server error. Please try again."); }
    setLoadingFull(false);
  };

  return (
    <div>
      <Row label="Target Role (optional)">
        <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Product Manager, UX Designer" style={inputStyle} />
      </Row>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.3 }}>Upload your CV</div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `1.5px dashed ${T.border}`, background: T.bg, cursor: "pointer" }}>
          <span style={{ fontSize: 18 }}>{uploading ? "⏳" : "📎"}</span>
          <div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color: T.ink }}>{uploading ? "Reading file…" : "Upload .txt or .doc / .docx"}</div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "DM Sans, sans-serif" }}>or paste your CV text below</div>
          </div>
          <input type="file" accept=".txt,.doc,.docx" onChange={handleFileUpload} style={{ display: "none" }} disabled={uploading} />
        </label>
        {uploadError && <div style={{ marginTop: 6, fontSize: 11, color: "#dc2626", fontFamily: "DM Sans, sans-serif", padding: "8px 10px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5" }}>{uploadError}</div>}
      </div>
      <Row label="Or paste your CV / Resume">
        <textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder="Paste the full text of your CV here — work experience, skills, education, everything..." style={{ ...inputStyle, width: "100%", height: 160, resize: "vertical", boxSizing: "border-box", fontFamily: "DM Sans, sans-serif" }} />
      </Row>
      {cvText.trim().length > 0 && cvText.trim().length < 100 && (
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, fontFamily: "DM Sans, sans-serif" }}>Paste more of your CV for a meaningful review ({cvText.trim().length} / 100 chars minimum)</div>
      )}
      {!freeReview && !fullReview && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <button onClick={getFreeReview} disabled={!canReview || groqAtLimit || loadingFree} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: !canReview || groqAtLimit ? T.border : T.green, color: !canReview || groqAtLimit ? T.muted : "white", fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: canReview && !groqAtLimit ? "pointer" : "default" }}>
            {loadingFree ? "Reviewing…" : groqAtLimit ? "🆓 Free limit reached today" : `🆓 Quick Review — Free (${groqCount}/3 used)`}
          </button>
          <button onClick={getFullReview} disabled={!canReview || loadingFull} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: !canReview ? T.border : T.gold, color: !canReview ? T.muted : "white", fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: canReview ? "pointer" : "default" }}>
            {hasClaude ? `✦ Full Review · 2 tokens (${proToken.generations_left} left)` : "✦ Full Review — Unlock from $2.99"}
          </button>
        </div>
      )}
      {freeError && <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", fontSize: 12, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>{freeError}</div>}
      {freeReview && !fullReview && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: T.green, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.5, marginBottom: 8, fontWeight: 700 }}>🆓 QUICK REVIEW</div>
          <div style={{ padding: 14, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, fontSize: 13, lineHeight: 1.8, color: T.ink, whiteSpace: "pre-wrap", fontFamily: "DM Sans, sans-serif" }}>{freeReview}</div>
          <CopyButton text={freeReview} />
          <div style={{ marginTop: 14, padding: 16, borderRadius: 12, border: `2px solid ${T.gold}`, background: T.goldDim }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 13, color: T.gold, marginBottom: 4 }}>✦ Want the full picture?</div>
            <div style={{ fontSize: 12, color: T.gold, fontFamily: "DM Sans, sans-serif", lineHeight: 1.6, marginBottom: 12 }}>Get a score out of 100, section-by-section breakdown, ATS check, rewritten bullet points, and an honest shortlist verdict.</div>
            {fullError && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", fontSize: 11, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>{fullError}</div>}
            {loadingFull ? (
              <div style={{ padding: "18px 14px", borderRadius: 10, background: "rgba(255,255,255,0.6)", border: `1px solid ${T.gold}55`, textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold, animation: `tf-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </div>
                <style>{`@keyframes tf-bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }`}</style>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: T.gold, marginBottom: 4 }}>Claude is reviewing your CV…</div>
                <div style={{ fontSize: 11, color: T.gold, fontFamily: "DM Sans, sans-serif", opacity: 0.8 }}>This takes 20–30 seconds. Please don't close this page.</div>
              </div>
            ) : (
              <button onClick={getFullReview} style={{ width: "100%", padding: "11px 0", borderRadius: 9, border: "none", background: T.gold, color: "white", fontSize: 13, fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
                {hasClaude ? `✦ Full Review · 2 tokens (${proToken.generations_left} left)` : "✦ Unlock Full Review — from $2.99"}
              </button>
            )}
          </div>
        </div>
      )}
      {loadingFull && !freeReview && (
        <div style={{ marginTop: 14, padding: "24px 14px", borderRadius: 10, background: T.goldDim, border: `2px solid ${T.gold}`, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold, animation: `tf-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
          <style>{`@keyframes tf-bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }`}</style>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: T.gold, marginBottom: 4 }}>Claude is reviewing your CV…</div>
          <div style={{ fontSize: 11, color: T.gold, fontFamily: "DM Sans, sans-serif", opacity: 0.8 }}>This takes 20–30 seconds. Please don't close this page.</div>
        </div>
      )}
      {fullError && !freeReview && <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", fontSize: 12, color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>{fullError}</div>}
      {fullReview && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: T.gold, fontFamily: "DM Sans, sans-serif", letterSpacing: 0.5, marginBottom: 8, fontWeight: 700 }}>✦ FULL CV REVIEW</div>
          <div style={{ padding: 14, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, fontSize: 13, lineHeight: 1.8, color: T.ink, whiteSpace: "pre-wrap", fontFamily: "DM Sans, sans-serif" }}>{fullReview}</div>
          <CopyButton text={fullReview} />
        </div>
      )}
    </div>
  );
}

export function AIToolPlaceholder({ name, proToken, onNeedUpgrade, onTokenUpdate }) {
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
