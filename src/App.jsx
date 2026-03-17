import { useState, useEffect, useRef } from "react";
import { T, inputStyle, injectFonts, RestoreToken, CopyButton } from "./theme";
import {
  RateCalc, ProjectEstimator, GPACalc, TipSplitter, MarginCalc, BreakEvenCalc,
  DeadlineCountdown, PomodoroTimer, FloatingWidget,
  TimezoneConverter, UnitConverter, StudyPlanner, CitationFormatter,
  WordCounter, BMICalculator, QRGenerator
} from "./tools";
import { SavingsCalc, SalaryHelper, ResumeReviewer, AIToolPlaceholder, DocumentSummarizer } from "./ai-tools";
import { G_COLOR, G_DIM, GamesSection } from "./games";

/* ── Dark theme ── */
const D = {
  bg:"#1c1a17", ink:"#f0ede8", muted:"#8a8780", border:"#2e2b27",
  card:"#242220", accent:"#f97316", accentDim:"#431407",
  green:"#22c55e", greenDim:"#052e16",
  blue:"#60a5fa", blueDim:"#1e3a5f",
  purple:"#a78bfa", purpleDim:"#2e1065",
  teal:"#2dd4bf", tealDim:"#042f2e",
  gold:"#fbbf24", goldDim:"#292008",
};

/* ── Categories & tool registry ── */
const CATEGORIES = [
  { id:"writing", label:"Writing & AI", icon:"✍️", color:T.accent, colorDim:T.accentDim, tools:[
    { id:"summarize", icon:"🗂",  name:"Document Summarizer",      desc:"Summarize any file or text instantly" },
    { id:"resume",    icon:"📋",  name:"Resume Reviewer",          desc:"AI feedback to strengthen your CV" },
    { id:"cover",     icon:"📄",  name:"Cover Letter Generator",   desc:"Tailored AI cover letters in seconds" },
    { id:"linkedin",  icon:"🔗",  name:"LinkedIn Bio Writer",      desc:"Stand out with an AI-crafted bio" },
    { id:"cold",      icon:"📧",  name:"Cold Email Generator",     desc:"Outreach emails that get replies" },
    { id:"proposal",  icon:"✍️",  name:"Client Proposal Writer",   desc:"Win more clients with AI proposals" },
    { id:"invoice",   icon:"🧾",  name:"Invoice Text Generator",   desc:"AI-written professional invoices" },
    { id:"tagline",   icon:"✨",  name:"Business Tagline Generator",desc:"AI slogans that stick" },
    { id:"essay",     icon:"📝",  name:"Essay Outline Generator",  desc:"AI-structured essay plans" },
    { id:"email",     icon:"💌",  name:"Marketing Email Writer",   desc:"Convert with AI-written emails" },
  ]},
  { id:"calculators", label:"Calculators", icon:"🧮", color:T.blue, colorDim:T.blueDim, tools:[
    { id:"rate",      icon:"💰",  name:"Hourly Rate Calculator",   desc:"Know exactly what to charge" },
    { id:"project",   icon:"📅",  name:"Project Price Estimator",  desc:"Quote any project confidently" },
    { id:"margin",    icon:"📈",  name:"Profit Margin Calculator", desc:"Price products for profit" },
    { id:"breakeven", icon:"⚖️",  name:"Break-Even Calculator",    desc:"Find your break-even point fast" },
    { id:"gpa",       icon:"📐",  name:"GPA Calculator",           desc:"Track and project your GPA" },
    { id:"salary",    icon:"📊",  name:"Salary Negotiation Helper",desc:"Know your worth, negotiate better" },
    { id:"tip",       icon:"🍽",  name:"Tip & Bill Splitter",      desc:"Split any bill instantly" },
    { id:"savings",   icon:"🏦",  name:"Savings Goal Calculator",  desc:"Plan your way to any goal" },
    { id:"bmi",       icon:"⚖️",  name:"BMI Calculator",           desc:"Check your body mass index instantly" },
  ]},
  { id:"planning", label:"Planning & Time", icon:"📅", color:T.purple, colorDim:T.purpleDim, tools:[
    { id:"deadline",  icon:"🗓",  name:"Deadline Countdown",       desc:"Days, hours, minutes to any date" },
    { id:"study",     icon:"⏱",  name:"Study Session Planner",    desc:"Optimise your revision time" },
    { id:"citation",  icon:"📚",  name:"Citation Formatter",       desc:"APA, MLA, Chicago in one click" },
    { id:"pomodoro",  icon:"🍅",  name:"Pomodoro Timer",           desc:"Stay focused with timed work sessions" },
  ]},
  { id:"utilities", label:"Utilities", icon:"🛠", color:T.teal, colorDim:T.tealDim, tools:[
    { id:"unit",      icon:"📏",  name:"Unit Converter",           desc:"Length, weight, temp & more" },
    { id:"timezone",  icon:"🌍",  name:"Timezone Converter",       desc:"Convert times across the world instantly" },
    { id:"wordcount", icon:"📝",  name:"Word Counter",             desc:"Count words, reading time & more" },
    { id:"qr",        icon:"🔲",  name:"QR Code Generator",        desc:"Turn any link or text into a QR code" },
  ]},
];

const ALL_TOOLS = CATEGORIES.flatMap(c => c.tools.map(t => ({ ...t, catId:c.id, catColor:c.color, catColorDim:c.colorDim })));
const AI_TOOLS  = ["Cover Letter Generator","LinkedIn Bio Writer","Cold Email Generator","Business Tagline Generator","Essay Outline Generator","Client Proposal Writer","Invoice Text Generator","Marketing Email Writer","Resume Reviewer","Salary Negotiation Helper","Savings Goal Calculator","Document Summarizer","Citation Formatter"];

/* ── Tool renderer ── */
function ToolView({ tool, onBack, hideBack, proToken, onNeedUpgrade, onTokenUpdate, pomoProps, dlProps }) {
  const cat = CATEGORIES.find(c => c.id === tool.catId);
  const renderTool = () => {
    switch (tool.id) {
      case "rate":      return <RateCalc />;
      case "project":   return <ProjectEstimator />;
      case "gpa":       return <GPACalc />;
      case "tip":       return <TipSplitter />;
      case "savings":   return <SavingsCalc proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      case "margin":    return <MarginCalc />;
      case "breakeven": return <BreakEvenCalc />;
      case "deadline":  return <DeadlineCountdown {...dlProps} />;
      case "unit":      return <UnitConverter />;
      case "timezone":  return <TimezoneConverter />;
      case "study":     return <StudyPlanner />;
      case "citation":  return <CitationFormatter proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      case "salary":    return <SalaryHelper proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      case "pomodoro":  return <PomodoroTimer {...pomoProps} />;
      case "wordcount": return <WordCounter />;
      case "bmi":       return <BMICalculator />;
      case "qr":        return <QRGenerator />;
      case "resume":    return <ResumeReviewer proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      case "summarize": return <DocumentSummarizer proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      default:
        if (AI_TOOLS.includes(tool.name)) return <AIToolPlaceholder name={tool.name} proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
        return <div style={{ textAlign:"center", padding:"30px 0", color:T.muted, fontFamily:"DM Sans, sans-serif" }}><div style={{ fontSize:36, marginBottom:10 }}>{tool.icon}</div><div style={{ fontSize:14 }}>Coming soon!</div></div>;
    }
  };
  return (
    <div>
      {!hideBack && (
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:T.muted, fontSize:13, cursor:"pointer", fontFamily:"DM Sans, sans-serif", marginBottom:16, padding:0 }}>← Back to all tools</button>
      )}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <div style={{ width:46, height:46, borderRadius:12, background:cat.colorDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{tool.icon}</div>
        <div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:17, color:T.ink }}>{tool.name}</div>
          <div style={{ fontSize:12, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{tool.desc}</div>
        </div>
      </div>
      {renderTool()}
    </div>
  );
}

function ToolCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  const isAI = AI_TOOLS.includes(tool.name);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"14px 13px", borderRadius:13, border:`1px solid ${hov?tool.catColor:T.border}`, background:hov?tool.catColorDim:T.card, cursor:"pointer", transition:"all 0.18s", boxShadow:hov?`0 4px 20px ${tool.catColor}18`:"0 1px 6px #0f0f0d08" }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{tool.icon}</div>
      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:T.ink, marginBottom:4, lineHeight:1.3 }}>{tool.name}</div>
      <div style={{ fontSize:11, color:T.muted, lineHeight:1.4, marginBottom:isAI?8:0 }}>{tool.desc}</div>
      {isAI && <span style={{ fontSize:9, padding:"2px 7px", borderRadius:99, background:T.accentDim, color:T.accent, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>AI POWERED</span>}
    </div>
  );
}

/* ── Modals & pages ── */
function UpgradeModal({ onClose }) {
  const onetimeUrl = import.meta.env.VITE_LS_ONETIME_URL || "#";
  const proUrl     = import.meta.env.VITE_LS_PRO_URL     || "#";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,15,13,0.6)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 }} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:T.card, borderRadius:20, padding:24, width:"100%", maxWidth:440, boxShadow:"0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.ink }}>Unlock Claude</div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink }}>Sonnet AI ✦</div>
          </div>
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
            <div style={{ position:"absolute", top:-10, right:12, fontSize:9, padding:"3px 9px", borderRadius:99, background:T.gold, color:"white", fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>BEST VALUE</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.gold }}>Pro Monthly</div>
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
  const [status, setStatus] = useState("loading");
  const [tokenInfo, setTokenInfo] = useState(null);
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
          <div style={{ marginBottom:16, padding:"12px 14px", borderRadius:10, background:"#f0f9ff", border:"1px solid #bae6fd", fontSize:12, color:"#0369a1", fontFamily:"DM Sans, sans-serif", lineHeight:1.8, textAlign:"left" }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, marginBottom:6 }}>✓ Access is linked to your email address</div>
            <div>To restore access on another device, click <strong>"Restore Access"</strong> on the homepage and enter your purchase email.</div>
          </div>
          <button onClick={onDone} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:T.accent, color:"white", fontSize:14, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>Start Using Claude Sonnet AI →</button>
        </>}
        {status==="error" && <>
          <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:18, color:T.ink, marginBottom:8 }}>Taking longer than expected</div>
          <div style={{ fontSize:13, color:T.muted, marginBottom:20, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>Your payment was received! Contact us at <a href="mailto:toolforgesupport@gmail.com" style={{ color:T.accent }}>toolforgesupport@gmail.com</a> and we'll sort it out fast.</div>
          <button onClick={onDone} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:T.accent, color:"white", fontSize:14, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>Back to ToolForge</button>
        </>}
      </div>
    </div>
  );
}

function Footer({ onFaq, onTos, onRefund, TH: th }) {
  const theme = th || T;
  return (
    <div style={{ borderTop:`1px solid ${theme.border}`, padding:"20px 20px", background:theme.card, textAlign:"center" }}>
      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:theme.ink, marginBottom:6 }}>Tool<span style={{ color:theme.accent }}>Forge</span></div>
      <div style={{ fontSize:11, color:theme.muted, fontFamily:"DM Sans, sans-serif", marginBottom:12 }}>Free tools for freelancers, students & small businesses.</div>
      <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
        <span onClick={onFaq}    style={{ fontSize:11, color:theme.accent, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>FAQ & About</span>
        <a href="https://toolforge.lemonsqueezy.com" target="_blank" rel="noreferrer" style={{ fontSize:11, color:theme.muted, fontFamily:"DM Sans, sans-serif", textDecoration:"none" }}>Pricing</a>
        <span onClick={onTos}    style={{ fontSize:11, color:theme.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Terms of Service</span>
        <span onClick={onRefund} style={{ fontSize:11, color:theme.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Refund Policy</span>
      </div>
      <div style={{ fontSize:10, color:theme.muted, fontFamily:"DM Sans, sans-serif", marginTop:14 }}>© {new Date().getFullYear()} ToolForge · Made with ☕</div>
    </div>
  );
}

const FAQ_ITEMS = [
  { q:"What is ToolForge?", a:"ToolForge is a free collection of 27+ online tools designed for freelancers, students, job seekers and small businesses. No sign-up required — just open a tool and use it." },
  { q:"Are the tools really free?", a:"Yes. All calculators and utilities are completely free, forever. AI-powered tools offer 3 free generations per day via Groq. For more generations and access to Claude Sonnet AI (higher quality), there's an affordable paid plan." },
  { q:"What's the difference between Groq AI and Claude Sonnet AI?", a:"Groq (free) uses the Llama 3.3 model — fast and capable for most tasks. Claude Sonnet AI (paid) is Anthropic's Claude model — it produces noticeably better, more nuanced writing. Worth it if you rely on the AI tools regularly." },
  { q:"What do I get with a paid plan?", a:"The One-Time Pack ($2.99) gives you 50 Claude Sonnet AI generations. The Pro Monthly ($7.99/mo) gives 400 generations per month and renews automatically. The Top-Up Pack ($2.99) adds 100 generations to your existing balance whenever you need more." },
  { q:"How do I access my account on a new device?", a:"There are no accounts or passwords. Just go to ToolForge, click \"Restore Access\" and enter the email you used to purchase. Your access will be restored instantly on any device, any browser." },
  { q:"I bought a plan but can't access Claude — what do I do?", a:"Click \"Restore Access\" on the homepage and enter your purchase email. Your access will be restored instantly. If that doesn't work, contact toolforgesupport@gmail.com." },
  { q:"Is my data private? Do you store my inputs?", a:"Your inputs are sent to the AI model to generate a response and are not stored on our servers. We don't sell data or show ads based on your inputs. Payments are handled entirely by Lemon Squeezy — we never see your card details." },
  { q:"How many tools are there and will more be added?", a:"There are currently 27 tools and we add more regularly. Tools span AI writing, calculators, planning, utilities and more. There's also a fun Take a Break games section!" },
  { q:"What payment methods are accepted?", a:"All major credit and debit cards are accepted via Lemon Squeezy, our payment provider. Payments are secure and encrypted." },
  { q:"Can I cancel my Pro subscription?", a:"Yes, anytime. Log into your Lemon Squeezy customer portal (link in your receipt email) and cancel with one click. You keep access until the end of your billing period." },
  { q:"Will there be ads on ToolForge?", a:"Not right now. The site is funded by the paid AI plans. If ads are ever introduced in the future, they'll be minimal and non-intrusive." },
];

function FAQPage({ onBack, onTos, onRefund }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:T.bg, fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid ${T.border}`, background:T.card }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:T.accent, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Back to ToolForge</button>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:T.ink, marginBottom:6 }}>FAQ & About</div>
        <div style={{ fontSize:13, color:T.muted }}>Everything you need to know about ToolForge.</div>
      </div>
      <div style={{ margin:16, padding:20, borderRadius:16, background:T.card, border:`1px solid ${T.border}` }}>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.ink, marginBottom:8 }}>✦ About ToolForge</div>
        <div style={{ fontSize:13, color:T.muted, lineHeight:1.7 }}>ToolForge was built to give freelancers, students, job seekers and small business owners access to powerful tools — for free. No accounts, no paywalls on the essentials, no bloat.<br /><br />AI-powered tools use Groq (free, fast) or Claude Sonnet AI (premium, higher quality). New tools are added every week.</div>
      </div>
      <div style={{ padding:"0 16px 24px" }}>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:T.ink, marginBottom:12 }}>Frequently Asked Questions</div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} onClick={() => setOpen(open===i?null:i)} style={{ marginBottom:8, borderRadius:12, border:`1px solid ${open===i?T.accent:T.border}`, background:T.card, overflow:"hidden", cursor:"pointer", transition:"border 0.15s" }}>
            <div style={{ padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, lineHeight:1.4 }}>{item.q}</div>
              <span style={{ fontSize:14, color:T.muted, flexShrink:0, transform:open===i?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
            </div>
            {open===i && <div style={{ padding:"0 16px 14px 16px", paddingTop:12, fontSize:12, color:T.muted, lineHeight:1.7, borderTop:`1px solid ${T.border}` }}>{item.a}</div>}
          </div>
        ))}
      </div>
      <Footer onFaq={() => {}} onTos={onTos} onRefund={onRefund} />
    </div>
  );
}

function TosPage({ onBack, onFaq, onRefund }) {
  const sections = [
    { title:"1. Acceptance of Terms", body:"By using ToolForge you agree to these terms. If you do not agree, please do not use the service." },
    { title:"2. Description of Service", body:"ToolForge provides a collection of free and premium online tools for productivity, writing, and calculation. AI-powered features require a paid token balance." },
    { title:"3. User Responsibilities", body:"You agree to use ToolForge lawfully and not to misuse, reverse-engineer, or attempt to circumvent the service's limitations." },
    { title:"4. Payments & Tokens", body:"Paid plans are processed by Lemon Squeezy. Token balances are non-transferable and linked to your purchase email address." },
    { title:"5. Intellectual Property", body:"All content, branding, and code on ToolForge are the property of ToolForge. You may not reproduce or redistribute them without permission." },
    { title:"6. Limitation of Liability", body:"ToolForge is provided 'as is' without warranties of any kind. We are not liable for any damages arising from use of the service." },
    { title:"7. AI-Generated Content", body:"AI outputs are generated by third-party models (Groq/Anthropic). ToolForge does not guarantee accuracy and outputs should not be treated as professional advice." },
    { title:"8. Changes to Terms", body:"We reserve the right to update these terms at any time. Continued use of ToolForge constitutes acceptance of any changes." },
    { title:"9. Contact", body:"For questions about these terms, contact us at toolforgesupport@gmail.com." },
  ];
  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:T.bg, fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid ${T.border}`, background:T.card }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:T.accent, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Back to ToolForge</button>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:T.ink, marginBottom:4 }}>Terms of Service</div>
        <div style={{ fontSize:12, color:T.muted }}>Last updated: March 2025</div>
      </div>
      <div style={{ padding:"16px 16px 32px" }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom:16, padding:16, borderRadius:12, background:T.card, border:`1px solid ${T.border}` }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, marginBottom:6 }}>{s.title}</div>
            <div style={{ fontSize:12, color:T.muted, lineHeight:1.7 }}>{s.body}</div>
          </div>
        ))}
      </div>
      <Footer onFaq={onFaq} onTos={() => {}} onRefund={onRefund} />
    </div>
  );
}

function RefundPage({ onBack, onFaq, onTos }) {
  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:T.bg, fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid ${T.border}`, background:T.card }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:T.accent, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Back to ToolForge</button>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:T.ink, marginBottom:4 }}>Refund Policy</div>
        <div style={{ fontSize:12, color:T.muted }}>Last updated: March 2025</div>
      </div>
      <div style={{ padding:"16px 16px 32px" }}>
        {[
          { title:"Eligibility", body:"Refunds are available within 3 days of purchase, provided that no AI generations have been used from the purchased pack or plan." },
          { title:"Non-Refundable", body:"Once any AI generation has been used, or after 3 days have passed since purchase, the transaction is non-refundable." },
          { title:"Subscriptions", body:"Pro Monthly subscriptions can be cancelled at any time via your Lemon Squeezy customer portal. Cancellation stops future charges but does not refund the current billing period." },
          { title:"How to Request a Refund", body:"To request a refund, email us at toolforgesupport@gmail.com and include:\n• Your purchase email address\n• Your order ID (found in your Lemon Squeezy receipt email)\n\nWe will verify your eligibility and process approved refunds within 3 business days." },
          { title:"Questions", body:"If you have any questions about this policy, contact us at toolforgesupport@gmail.com." },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom:16, padding:16, borderRadius:12, background:T.card, border:`1px solid ${T.border}` }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, marginBottom:6 }}>{s.title}</div>
            <div style={{ fontSize:12, color:T.muted, lineHeight:1.7, whiteSpace:"pre-line" }}>{s.body}</div>
          </div>
        ))}
      </div>
      <Footer onFaq={onFaq} onTos={onTos} onRefund={() => {}} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
export default function ToolForge() {
  const [activeCat, setActiveCat]       = useState("all");
  const [activeTool, setActiveTool]     = useState(null);
  const [showGames, setShowGames]       = useState(false);
  const [search, setSearch]             = useState("");
  const [showUpgrade, setShowUpgrade]   = useState(false);
  const [collapsed, setCollapsed]       = useState({});
  const [showFaq, setShowFaq]           = useState(window.location.pathname === "/faq");
  const [showTos, setShowTos]           = useState(window.location.pathname === "/terms");
  const [showRefund, setShowRefund]     = useState(window.location.pathname === "/refund");
  const [proToken, setProToken]         = useState(() => { try { const s = localStorage.getItem("tf_pro_token"); return s ? JSON.parse(s) : null; } catch { return null; } });

  /* ── Dark mode ── */
  const [isDark, setIsDark] = useState(() => { try { return localStorage.getItem("tf_dark") === "1"; } catch { return false; } });
  const toggleDark = () => setIsDark(d => { const n = !d; try { localStorage.setItem("tf_dark", n ? "1" : "0"); } catch {} return n; });
  const TH = isDark ? D : T;

  /* ── Desktop detection ── */
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ── Resizable panels ── */
  const [sideW, _setSideW] = useState(() => { try { return parseInt(localStorage.getItem("tf_sideW")) || 200; } catch { return 200; } });
  const [midW,  _setMidW]  = useState(() => { try { return parseInt(localStorage.getItem("tf_midW"))  || 210; } catch { return 210; } });
  const sideWRef = useRef(sideW); const midWRef = useRef(midW);
  const setSideW = w => { sideWRef.current = w; _setSideW(w); try { localStorage.setItem("tf_sideW", w); } catch {} };
  const setMidW  = w => { midWRef.current  = w; _setMidW(w);  try { localStorage.setItem("tf_midW",  w); } catch {} };

  useEffect(() => {
    if (!isDesktop) return;
    const h1 = document.getElementById("tf-h1");
    const h2 = document.getElementById("tf-h2");
    if (!h1 || !h2) return;
    const attach = (el, getW, setW, min, max) => {
      let active = false, sx = 0, sw = 0;
      const down = e => { active = true; sx = e.clientX; sw = getW(); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; e.preventDefault(); };
      const move = e => { if (!active) return; setW(Math.max(min, Math.min(max, sw + e.clientX - sx))); };
      const up   = () => { if (!active) return; active = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
      el.addEventListener("mousedown", down); document.addEventListener("mousemove", move); document.addEventListener("mouseup", up);
      return () => { el.removeEventListener("mousedown", down); document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    };
    const c1 = attach(h1, () => sideWRef.current, setSideW, 48, 300);
    const c2 = attach(h2, () => midWRef.current,  setMidW,  52, 340);
    return () => { c1(); c2(); };
  }, [isDesktop]);

  /* ── Pomodoro ── */
  const POMO_MODES = [
    { id:"focus", label:"Focus",       icon:"🍅", mins:25, color:T.accent, colorDim:T.accentDim },
    { id:"short",  label:"Short Break", icon:"☕", mins:5,  color:T.green,  colorDim:T.greenDim  },
    { id:"long",   label:"Long Break",  icon:"🌿", mins:15, color:T.blue,   colorDim:T.blueDim   },
  ];
  const [pomoMode, setPomoMode]         = useState("focus");
  const [pomoSec, setPomoSec]           = useState(25 * 60);
  const [pomoRunning, setPomoRunning]   = useState(false);
  const [pomoPaused, setPomoPaused]     = useState(false);
  const [pomoSessions, setPomoSessions] = useState(0);
  const [pomoPinned, setPomoPinned]     = useState(false);
  const pomoRef = useRef(null);
  useEffect(() => {
    if (pomoRunning) { pomoRef.current = setInterval(() => { setPomoSec(s => { if (s<=1) { clearInterval(pomoRef.current); setPomoRunning(false); setPomoPaused(false); if (pomoMode==="focus") setPomoSessions(n=>n+1); return 0; } return s-1; }); }, 1000); }
    else clearInterval(pomoRef.current);
    return () => clearInterval(pomoRef.current);
  }, [pomoRunning, pomoMode]);
  const pomoProps = {
    modes:POMO_MODES, modeId:pomoMode, secondsLeft:pomoSec, running:pomoRunning,
    pinned:pomoPinned, sessions:pomoSessions, paused:pomoPaused,
    onStart:      () => { setPomoRunning(true); setPomoPaused(false); setPomoPinned(true); },
    onPause:      () => { setPomoRunning(false); setPomoPaused(true); },
    onReset:      () => { const m = POMO_MODES.find(x=>x.id===pomoMode); clearInterval(pomoRef.current); setPomoRunning(false); setPomoPaused(false); setPomoSec(m.mins*60); setPomoPinned(false); },
    onSwitchMode: (id) => { const m = POMO_MODES.find(x=>x.id===id); clearInterval(pomoRef.current); setPomoMode(id); setPomoSec(m.mins*60); setPomoRunning(false); setPomoPaused(false); },
    onTogglePin:  () => setPomoPinned(p=>!p),
  };

  /* ── Deadline ── */
  const [dlLabel, setDlLabel]     = useState("");
  const [dlTarget, setDlTarget]   = useState("");
  const [dlPinned, setDlPinned]   = useState(false);
  const [dlRunning, setDlRunning] = useState(false);
  const dlRef = useRef(null); const [dlTick, setDlTick] = useState(0);
  useEffect(() => { if (dlRunning) { dlRef.current = setInterval(() => setDlTick(t=>t+1), 1000); } else clearInterval(dlRef.current); return () => clearInterval(dlRef.current); }, [dlRunning]);
  const dlProps = { label:dlLabel, setLabel:setDlLabel, target:dlTarget, setTarget:setDlTarget, pinned:dlPinned, running:dlRunning, tick:dlTick, onTogglePin:() => setDlPinned(p=>!p), onStart:() => setDlRunning(true), onStop:() => setDlRunning(false) };

  /* ── Widgets ── */
  const [widgets, setWidgets]       = useState([]);
  const [activePill, setActivePill] = useState(null);
  useEffect(() => {
    if (pomoPinned && pomoRunning) { const mm=Math.floor(pomoSec/60).toString().padStart(2,"0"); const ss=(pomoSec%60).toString().padStart(2,"0"); setWidgets(w => { const e=w.find(x=>x.id==="pomodoro"); if(e) return w.map(x=>x.id==="pomodoro"?{...x,label:`🍅 ${mm}:${ss}`}:x); return [...w,{id:"pomodoro",icon:"🍅",color:"#e85d04",label:`🍅 ${mm}:${ss}`,toolId:"pomodoro"}]; }); }
    else if (pomoPinned && pomoPaused) { const mm=Math.floor(pomoSec/60).toString().padStart(2,"0"); const ss=(pomoSec%60).toString().padStart(2,"0"); setWidgets(w=>w.map(x=>x.id==="pomodoro"?{...x,label:`🍅 ${mm}:${ss} ⏸`}:x)); }
    else if (!pomoPinned) setWidgets(w=>w.filter(x=>x.id!=="pomodoro"));
  }, [pomoPinned, pomoRunning, pomoPaused, pomoSec]);
  useEffect(() => {
    if (dlPinned && dlTarget) { const diff=new Date(dlTarget)-new Date(); if (diff>0) { const d=Math.floor(diff/86400000); const h=Math.floor((diff%86400000)/3600000); const lbl=d>0?`🗓 ${d}d ${h}h`:`🗓 ${h}h`; setWidgets(w => { const e=w.find(x=>x.id==="deadline"); if(e) return w.map(x=>x.id==="deadline"?{...x,label:lbl}:x); return [...w,{id:"deadline",icon:"🗓",color:T.purple,label:lbl,toolId:"deadline"}]; }); } }
    else if (!dlPinned) setWidgets(w=>w.filter(x=>x.id!=="deadline"));
  }, [dlPinned, dlTarget, dlTick]);
  const removeWidget = id => { setWidgets(w=>w.filter(x=>x.id!==id)); if (id==="pomodoro") setPomoPinned(false); if (id==="deadline") setDlPinned(false); if (activePill===id) setActivePill(null); };

  /* ── Misc ── */
  const handleTokenUpdate = t => { setProToken(t); localStorage.setItem("tf_pro_token", JSON.stringify(t)); };
  useEffect(() => { injectFonts(); }, []);
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  /* ── Special pages ── */
  if (orderId) return <SuccessPage orderId={orderId} onDone={() => { window.history.replaceState({},"","/"); try { const s=localStorage.getItem("tf_pro_token"); if(s) setProToken(JSON.parse(s)); } catch {} window.location.reload(); }} />;
  if (showFaq)    return <FAQPage    onBack={() => { setShowFaq(false);    window.history.pushState({},"","/"); }} onTos={() => { setShowFaq(false); setShowTos(true); }} onRefund={() => { setShowFaq(false); setShowRefund(true); }} />;
  if (showTos)    return <TosPage    onBack={() => { setShowTos(false);    window.history.pushState({},"","/"); }} onFaq={() => { setShowTos(false); setShowFaq(true); }} onRefund={() => { setShowTos(false); setShowRefund(true); }} />;
  if (showRefund) return <RefundPage onBack={() => { setShowRefund(false); window.history.pushState({},"","/"); }} onFaq={() => { setShowRefund(false); setShowFaq(true); }} onTos={() => { setShowRefund(false); setShowTos(true); }} />;

  /* ── Dark toggle button ── */
  const DarkToggle = () => (
    <button onClick={toggleDark} title={isDark ? "Light mode" : "Dark mode"}
      style={{ display:"flex", alignItems:"center", padding:"5px 9px", borderRadius:8, border:`1px solid ${TH.border}`, background:TH.bg, cursor:"pointer", fontSize:13, transition:"all 0.2s" }}>
      {isDark ? "☀️" : "🌙"}
    </button>
  );

  /* ── Filtered tool list (used in desktop middle panel + mobile grid) ── */
  const middleTools = (activeCat === "all" ? ALL_TOOLS : ALL_TOOLS.filter(t => t.catId === activeCat))
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()));

  /* ══════════════════════════════════
     DESKTOP
  ══════════════════════════════════ */
  if (isDesktop) {
    const hStyle = (id) => ({ id, width:5, flexShrink:0, background:TH.border, cursor:"col-resize", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s", zIndex:10 });

    /* ── Collapse thresholds ── */
    const SIDE_ICON = sideW < 100;  // sidebar icon-only
    const MID_ICON  = midW  < 100;  // middle icon-only
    const MID_SLIM  = midW  < 160;  // middle icon+name, no desc

    const rightContent = () => {
      if (!activeTool) return (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16, opacity:0.2, color:TH.accent }}>✦</div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:17, color:TH.ink, marginBottom:8 }}>Select a tool</div>
          <div style={{ fontSize:13, color:TH.muted, maxWidth:260, lineHeight:1.6 }}>Choose any tool from the list to get started.</div>
        </div>
      );
      return <div style={{ padding:24, overflowY:"auto", flex:1 }}><ToolView tool={activeTool} hideBack onBack={() => setActiveTool(null)} proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} pomoProps={pomoProps} dlProps={dlProps} /></div>;
    };

    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:TH.bg, fontFamily:"DM Sans, sans-serif", overflow:"hidden" }}>

        {/* Nav */}
        <div style={{ background:TH.card, borderBottom:`1px solid ${TH.border}`, padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, zIndex:50 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:16, color:TH.ink }}>Tool<span style={{ color:TH.accent }}>Forge</span></span>
            <span style={{ background:TH.accentDim, color:TH.accent, fontSize:9, padding:"2px 8px", borderRadius:5, fontFamily:"Syne, sans-serif", fontWeight:700 }}>{ALL_TOOLS.length} FREE TOOLS</span>
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span onClick={() => { setShowFaq(true); window.history.pushState({},"","/faq"); }} style={{ fontSize:11, color:TH.muted, cursor:"pointer", fontFamily:"DM Sans, sans-serif" }}>FAQ</span>
            <a href="https://toolforge.lemonsqueezy.com" target="_blank" rel="noreferrer" style={{ fontSize:11, color:TH.muted, textDecoration:"none", fontFamily:"DM Sans, sans-serif" }}>Pricing</a>
            <DarkToggle />
            {proToken && proToken.generations_left > 0
              ? <div style={{ background:TH.goldDim, border:`1px solid ${TH.gold}`, borderRadius:8, padding:"4px 11px", fontSize:10, color:TH.gold, fontFamily:"Syne, sans-serif", fontWeight:700 }}>✦ {proToken.generations_left} left</div>
              : <button onClick={() => setShowUpgrade(true)} style={{ background:TH.accent, color:"white", fontSize:11, padding:"5px 13px", borderRadius:8, border:"none", fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>✦ Upgrade</button>
            }
          </div>
        </div>

        {/* Hero strip */}
        <div style={{ background:TH.card, borderBottom:`1px solid ${TH.border}`, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:15, color:TH.ink, marginBottom:2 }}>27 free tools for work & study</div>
            <div style={{ fontSize:11, color:TH.muted }}>Calculators, AI writing, converters — no sign-up needed.</div>
          </div>
          <div style={{ display:"flex", gap:20, flexShrink:0, marginLeft:20 }}>
            <div style={{ textAlign:"center" }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:TH.accent }}>{ALL_TOOLS.length}</div><div style={{ fontSize:9, color:TH.muted }}>free tools</div></div>
            <div style={{ textAlign:"center" }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:TH.ink }}>100%</div><div style={{ fontSize:9, color:TH.muted }}>no sign-up</div></div>
            <div style={{ textAlign:"center" }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:TH.gold }}>✦ AI</div><div style={{ fontSize:9, color:TH.muted }}>powered</div></div>
          </div>
        </div>

        {/* Three panels */}
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Sidebar — collapses to icon-only when narrow */}
          <div style={{ width:sideW, flexShrink:0, background:TH.card, borderRight:`1px solid ${TH.border}`, display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.15s" }}>
            {SIDE_ICON ? (
              /* ── Icon-only sidebar ── */
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 0", gap:4, flex:1 }}>
                {[{ id:"all", label:"All Tools", icon:"✦", color:TH.accent }, ...CATEGORIES].map(c => (
                  <div key={c.id} onClick={() => { setActiveCat(c.id); setSearch(""); }} title={c.label || "All Tools"}
                    style={{ width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:"pointer", background:activeCat===c.id&&!search?TH.accentDim:"transparent", border:`1px solid ${activeCat===c.id&&!search?TH.accent:"transparent"}`, transition:"all 0.15s" }}>
                    {c.icon}
                  </div>
                ))}
                <div style={{ marginTop:"auto", marginBottom:8 }}>
                  <div onClick={() => setShowGames(true)} title="Take a Break"
                    style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, cursor:"pointer" }}>
                    🎮
                  </div>
                </div>
              </div>
            ) : (
              /* ── Full sidebar ── */
              <>
                <div style={{ padding:"10px 10px 0", flexShrink:0 }}>
                  <div style={{ position:"relative", marginBottom:10 }}>
                    <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", fontSize:12, color:TH.muted, pointerEvents:"none" }}>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ ...inputStyle, paddingLeft:30, fontSize:11, background:TH.bg, border:`1px solid ${TH.border}`, color:TH.ink }} />
                  </div>
                  <div style={{ fontSize:9, color:TH.muted, letterSpacing:0.6, marginBottom:6, fontFamily:"Syne, sans-serif", fontWeight:700, paddingLeft:2 }}>CATEGORIES</div>
                  {[{ id:"all", label:"All Tools", icon:"✦" }, ...CATEGORIES].map(c => (
                    <div key={c.id} onClick={() => { setActiveCat(c.id); setSearch(""); }}
                      style={{ padding:"7px 10px", borderRadius:8, marginBottom:2, background:activeCat===c.id&&!search?TH.accentDim:"transparent", color:activeCat===c.id&&!search?TH.accent:TH.muted, fontSize:11, fontFamily:activeCat===c.id&&!search?"Syne, sans-serif":"DM Sans, sans-serif", fontWeight:activeCat===c.id&&!search?700:400, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {c.icon}&nbsp;&nbsp;{c.label || "All Tools"}
                    </div>
                  ))}
                </div>
                {!proToken && <div style={{ padding:"6px 10px" }}><RestoreToken onRestore={handleTokenUpdate} /></div>}
                <div style={{ marginTop:"auto", padding:10, borderTop:`1px solid ${TH.border}` }}>
                  <div onClick={() => setShowGames(true)}
                    style={{ background:"linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
                    <div>
                      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:"white" }}>🎮 Take a Break</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)", marginTop:1 }}>Mini games</div>
                    </div>
                    <span style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>→</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Handle 1 */}
          <div style={hStyle("tf-h1")} id="tf-h1" onMouseEnter={e=>e.currentTarget.style.background=TH.muted} onMouseLeave={e=>e.currentTarget.style.background=TH.border}>
            <div style={{ display:"flex", flexDirection:"column", gap:3, pointerEvents:"none" }}>{[0,1,2].map(i=><div key={i} style={{ width:3,height:3,borderRadius:"50%",background:TH.muted,opacity:0.5 }}/>)}</div>
          </div>

          {/* Middle tool list */}
          <div style={{ width:midW, flexShrink:0, background:TH.bg, borderRight:`1px solid ${TH.border}`, overflowY:"auto", padding:"10px 8px" }}>
            {/* ── Header label (hidden in icon-only) ── */}
            {!MID_ICON && (
              <div style={{ fontSize:9, color:TH.muted, letterSpacing:0.6, marginBottom:10, fontFamily:"Syne, sans-serif", fontWeight:700, paddingLeft:2 }}>
                {search ? `${middleTools.length} RESULT${middleTools.length!==1?"S":""}` : activeCat==="all" ? `ALL ${ALL_TOOLS.length} TOOLS` : `${CATEGORIES.find(c=>c.id===activeCat)?.label?.toUpperCase()} — ${middleTools.length}`}
              </div>
            )}

            {/* ── Icon-only middle ── */}
            {MID_ICON ? (
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                {middleTools.map(tool => (
                  <div key={tool.id} onClick={() => { setActiveTool(tool); setShowGames(false); }} title={tool.name}
                    style={{ width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, cursor:"pointer", border:`1px solid ${activeTool?.id===tool.id?tool.catColor:"transparent"}`, background:activeTool?.id===tool.id?tool.catColorDim:"transparent", transition:"all 0.15s", margin:"0 auto" }}>
                    {tool.icon}
                  </div>
                ))}
              </div>
            ) : (activeCat === "all" || search) ? (
              /* ── Grouped by category ── */
              CATEGORIES.map(cat => {
                const catTools = middleTools.filter(t => t.catId === cat.id);
                if (catTools.length === 0) return null;
                return (
                  <div key={cat.id} style={{ marginBottom:14 }}>
                    {!MID_SLIM && (
                      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 8px", marginBottom:5, borderRadius:7, background:cat.colorDim, border:`1px solid ${cat.color}22` }}>
                        <span style={{ fontSize:12 }}>{cat.icon}</span>
                        <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:10, color:cat.color, flex:1 }}>{cat.label}</span>
                        <span style={{ fontSize:9, color:cat.color, opacity:0.7 }}>{catTools.length}</span>
                      </div>
                    )}
                    {MID_SLIM && (
                      <div style={{ padding:"3px 6px", marginBottom:4, fontSize:10, color:cat.color, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.4 }}>{cat.icon} {cat.label}</div>
                    )}
                    {catTools.map(tool => (
                      <div key={tool.id} onClick={() => { setActiveTool(tool); setShowGames(false); }}
                        style={{ padding: MID_SLIM ? "7px 8px" : "9px 10px", borderRadius:8, border:`1px solid ${activeTool?.id===tool.id?tool.catColor:TH.border}`, background:activeTool?.id===tool.id?tool.catColorDim:TH.card, display:"flex", alignItems:"flex-start", gap:8, cursor:"pointer", marginBottom:4, transition:"all 0.15s" }}>
                        <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>{tool.icon}</span>
                        {!MID_SLIM && (
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:11, color:activeTool?.id===tool.id?tool.catColor:TH.ink, fontWeight:600, fontFamily:"Syne, sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2 }}>{tool.name}</div>
                            <div style={{ fontSize:10, color:TH.muted, lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{tool.desc}</div>
                            {AI_TOOLS.includes(tool.name) && <span style={{ fontSize:9, color:TH.accent, fontFamily:"Syne, sans-serif", fontWeight:700 }}>✦ AI</span>}
                          </div>
                        )}
                        {MID_SLIM && (
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:11, color:activeTool?.id===tool.id?tool.catColor:TH.ink, fontWeight:600, fontFamily:"Syne, sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tool.name}</div>
                            {AI_TOOLS.includes(tool.name) && <span style={{ fontSize:9, color:TH.accent, fontFamily:"Syne, sans-serif", fontWeight:700 }}>✦ AI</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              /* ── Single category list ── */
              middleTools.map(tool => (
                <div key={tool.id} onClick={() => { setActiveTool(tool); setShowGames(false); }}
                  style={{ padding: MID_SLIM ? "8px 8px" : "10px 10px", borderRadius:8, border:`1px solid ${activeTool?.id===tool.id?tool.catColor:TH.border}`, background:activeTool?.id===tool.id?tool.catColorDim:TH.card, display:"flex", alignItems:"flex-start", gap:9, cursor:"pointer", marginBottom:5, transition:"all 0.15s" }}>
                  <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{tool.icon}</span>
                  {!MID_SLIM ? (
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, color:activeTool?.id===tool.id?tool.catColor:TH.ink, fontWeight:600, fontFamily:"Syne, sans-serif", marginBottom:3 }}>{tool.name}</div>
                      <div style={{ fontSize:11, color:TH.muted, lineHeight:1.4 }}>{tool.desc}</div>
                      {AI_TOOLS.includes(tool.name) && <span style={{ fontSize:9, color:TH.accent, fontFamily:"Syne, sans-serif", fontWeight:700, marginTop:4, display:"block" }}>✦ AI POWERED</span>}
                    </div>
                  ) : (
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:11, color:activeTool?.id===tool.id?tool.catColor:TH.ink, fontWeight:600, fontFamily:"Syne, sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{tool.name}</div>
                      {AI_TOOLS.includes(tool.name) && <span style={{ fontSize:9, color:TH.accent, fontFamily:"Syne, sans-serif", fontWeight:700 }}>✦ AI</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Handle 2 */}
          <div style={hStyle("tf-h2")} id="tf-h2" onMouseEnter={e=>e.currentTarget.style.background=TH.muted} onMouseLeave={e=>e.currentTarget.style.background=TH.border}>
            <div style={{ display:"flex", flexDirection:"column", gap:3, pointerEvents:"none" }}>{[0,1,2].map(i=><div key={i} style={{ width:3,height:3,borderRadius:"50%",background:TH.muted,opacity:0.5 }}/>)}</div>
          </div>

          {/* Right panel */}
          <div style={{ flex:1, minWidth:0, background:TH.card, overflowY:"auto", display:"flex", flexDirection:"column" }}>
            {rightContent()}
            {activeTool && proToken && proToken.generations_left > 0 && (
              <div style={{ padding:"8px 16px", borderTop:`1px solid ${TH.border}`, background:TH.goldDim, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
                <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:11, color:TH.gold }}>✦ {proToken.type==="pro"?"Pro Active":"Pack Active"}</span>
                <span style={{ fontSize:11, color:TH.gold }}>{proToken.generations_left} Claude generations left</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Games fullscreen overlay (desktop) ── */}
        {showGames && (
          <div style={{ position:"fixed", inset:0, zIndex:200, background:TH.bg, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {/* overlay nav */}
            <div style={{ background:TH.card, borderBottom:`1px solid ${TH.border}`, padding:"10px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
              <button onClick={() => setShowGames(false)}
                style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:`1px solid ${TH.border}`, borderRadius:8, padding:"6px 12px", color:TH.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>
                ← Back to tools
              </button>
              <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:15, color:TH.ink }}>🎮 Take a Break</span>
              <span style={{ fontSize:11, color:TH.muted, fontFamily:"DM Sans, sans-serif" }}>Step away from work for a minute</span>
            </div>
            {/* overlay content */}
            <div style={{ flex:1, overflowY:"auto", padding:24, maxWidth:700, width:"100%", margin:"0 auto" }}>
              <GamesSection proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} onBack={() => setShowGames(false)} />
            </div>
          </div>
        )}

        {/* ── Games fullscreen overlay (desktop) ── */}
        {showGames && (
          <div style={{ position:"fixed", inset:0, zIndex:200, background:TH.bg, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ background:TH.card, borderBottom:`1px solid ${TH.border}`, padding:"10px 20px", display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
              <button onClick={() => setShowGames(false)}
                style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:`1px solid ${TH.border}`, borderRadius:8, padding:"6px 12px", color:TH.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>
                ← Back to tools
              </button>
              <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:15, color:TH.ink }}>🎮 Take a Break</span>
              <span style={{ fontSize:11, color:TH.muted, fontFamily:"DM Sans, sans-serif" }}>Step away for a minute</span>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:24, maxWidth:700, width:"100%", margin:"0 auto" }}>
              <GamesSection proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} onBack={() => setShowGames(false)} />
            </div>
          </div>
        )}

        <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={toolId => { setActiveTool(ALL_TOOLS.find(t=>t.id===toolId)); setShowGames(false); }} />
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </div>
    );
  }

  /* ══════════════════════════════════
     MOBILE
  ══════════════════════════════════ */
  const mobileGrid = { display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 };

  if (showGames) return (
    <>
      <div style={{ maxWidth:480, margin:"0 auto", padding:20, background:TH.bg, minHeight:"100vh" }}>
        <div style={{ background:TH.card, borderRadius:16, padding:20, border:`1px solid ${TH.border}` }}>
          <GamesSection proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} onBack={() => setShowGames(false)} />
        </div>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={toolId => { setShowGames(false); setActiveTool(ALL_TOOLS.find(t=>t.id===toolId)); }} />
    </>
  );

  if (activeTool) return (
    <>
      <div style={{ maxWidth:480, margin:"0 auto", padding:20, background:TH.bg, minHeight:"100vh" }}>
        <div style={{ background:TH.card, borderRadius:16, padding:20, border:`1px solid ${TH.border}` }}>
          <ToolView tool={activeTool} onBack={() => setActiveTool(null)} proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} pomoProps={pomoProps} dlProps={dlProps} />
        </div>
        {proToken && proToken.generations_left > 0 && (
          <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:TH.goldDim, border:`1px solid ${TH.gold}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:11, color:TH.gold }}>✦ {proToken.type==="pro"?"Pro Active":"Pack Active"}</div>
            <div style={{ fontSize:11, color:TH.gold }}>{proToken.generations_left} Claude generations left</div>
          </div>
        )}
      </div>
      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={toolId => setActiveTool(ALL_TOOLS.find(t=>t.id===toolId))} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );

  const filtered = ALL_TOOLS.filter(t =>
    (activeCat==="all" || t.catId===activeCat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {!proToken && (
        <div onClick={() => setShowUpgrade(true)} style={{ position:"sticky", top:0, zIndex:100, background:`linear-gradient(90deg,${TH.gold},${TH.accent})`, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:"white" }}>✦ Unlock Claude Sonnet AI — from $2.99</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.85)", fontFamily:"DM Sans, sans-serif", whiteSpace:"nowrap" }}>Better outputs →</div>
        </div>
      )}

      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:TH.bg, fontFamily:"DM Sans, sans-serif" }}>

        {/* Mobile header */}
        <div style={{ padding:"20px 20px 14px", borderBottom:`1px solid ${TH.border}`, background:TH.card }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:TH.ink }}>Tool</span>
              <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:TH.accent }}>Forge</span>
              <span style={{ fontSize:10, color:TH.muted, fontWeight:400, letterSpacing:1, marginLeft:2 }}>{ALL_TOOLS.length} FREE</span>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <DarkToggle />
              {proToken && proToken.generations_left > 0
                ? <div style={{ background:TH.goldDim, border:`1px solid ${TH.gold}`, borderRadius:8, padding:"4px 9px", fontSize:10, color:TH.gold, fontFamily:"Syne, sans-serif", fontWeight:700 }}>✦ {proToken.generations_left}</div>
                : <button onClick={() => setShowUpgrade(true)} style={{ background:TH.accent, color:"white", fontSize:10, padding:"4px 10px", borderRadius:7, border:"none", fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>✦ Upgrade</button>
              }
            </div>
          </div>
          <div style={{ fontSize:12, color:TH.muted, marginBottom:10 }}>Every tool you need — writing, calculators, planning & more.</div>
          {!proToken && <RestoreToken onRestore={handleTokenUpdate} />}
          <div style={{ position:"relative", marginTop:10 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:TH.muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools…" style={{ ...inputStyle, paddingLeft:36, background:TH.bg, border:`1px solid ${TH.border}`, color:TH.ink }} />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ padding:"10px 16px", display:"flex", gap:7, overflowX:"auto", borderBottom:`1px solid ${TH.border}`, background:TH.card }}>
          {[{ id:"all", label:"All", icon:"✦", color:TH.accent, colorDim:TH.accentDim }, ...CATEGORIES].map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:99, border:`1px solid ${activeCat===c.id?c.color||TH.accent:TH.border}`, background:activeCat===c.id?c.colorDim||TH.accentDim:TH.card, color:activeCat===c.id?c.color||TH.accent:TH.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* 🎮 Take a Break — between category tabs and tool grid */}
        <div onClick={() => setShowGames(true)} style={{ margin:"12px 16px 0", padding:"14px 18px", borderRadius:14, background:`linear-gradient(135deg,${G_COLOR},#7c3aed)`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:`0 4px 20px ${G_COLOR}30` }}>
          <div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:"white", marginBottom:2 }}>🎮 Take a Break</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)", fontFamily:"DM Sans, sans-serif" }}>Free games + premium unlocks · resets daily</div>
          </div>
          <div style={{ fontSize:18, color:"rgba(255,255,255,0.7)" }}>→</div>
        </div>

        {/* Tool grid — 2 columns */}
        <div style={{ padding:16 }}>
          {search ? (
            <>
              <div style={{ fontSize:12, color:TH.muted, marginBottom:12 }}>{filtered.length} result{filtered.length!==1?"s":""} for "{search}"</div>
              <div style={mobileGrid}>{filtered.map(tool => <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />)}</div>
            </>
          ) : activeCat !== "all" ? (
            <div style={mobileGrid}>{filtered.map(tool => <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />)}</div>
          ) : (
            CATEGORIES.map(cat => (
              <div key={cat.id} style={{ marginBottom:20 }}>
                <div onClick={() => setCollapsed(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:collapsed[cat.id]?0:10, cursor:"pointer", padding:"6px 0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:cat.colorDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{cat.icon}</div>
                    <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:TH.ink }}>{cat.label}</span>
                    <span style={{ fontSize:10, color:TH.muted }}>{cat.tools.length} tools</span>
                  </div>
                  <span style={{ fontSize:14, color:TH.muted, transform:collapsed[cat.id]?"rotate(-90deg)":"rotate(0deg)", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
                </div>
                {!collapsed[cat.id] && (
                  <div style={mobileGrid}>
                    {cat.tools.map(tool => (
                      <ToolCard key={tool.id} tool={{ ...tool, catId:cat.id, catColor:cat.color, catColorDim:cat.colorDim }} onClick={() => setActiveTool({ ...tool, catId:cat.id, catColor:cat.color, catColorDim:cat.colorDim })} />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          <div style={{ marginTop:10, padding:16, borderRadius:14, background:`linear-gradient(135deg,${TH.accentDim},${TH.blueDim})`, border:`1px solid ${TH.border}`, textAlign:"center" }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:TH.ink, marginBottom:4 }}>✦ More tools dropping weekly</div>
            <div style={{ fontSize:12, color:TH.muted }}>Debt payoff · Resume bullets · Pricing guide · and 20+ more</div>
          </div>
        </div>

      </div>

      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <Footer TH={TH}
          onFaq={()    => { setShowFaq(true);    window.history.pushState({},"","/faq"); }}
          onTos={()    => { setShowTos(true);    window.history.pushState({},"","/terms"); }}
          onRefund={()=> { setShowRefund(true);  window.history.pushState({},"","/refund"); }}
        />
      </div>

      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={toolId => setActiveTool(ALL_TOOLS.find(t=>t.id===toolId))} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
