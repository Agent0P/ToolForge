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
function ToolView({ tool, onBack, proToken, onNeedUpgrade, onTokenUpdate, pomoProps, dlProps }) {
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
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:T.muted, fontSize:13, cursor:"pointer", fontFamily:"DM Sans, sans-serif", marginBottom:16, padding:0 }}>← Back to all tools</button>
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

/* ── Footer & static pages ── */
function Footer({ onFaq, onTos, onRefund }) {
  return (
    <div style={{ borderTop:`1px solid ${T.border}`, padding:"20px 20px", background:T.card, textAlign:"center" }}>
      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:T.ink, marginBottom:6 }}>Tool<span style={{ color:T.accent }}>Forge</span></div>
      <div style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", marginBottom:12 }}>Free tools for freelancers, students & small businesses.</div>
      <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
        <span onClick={onFaq}    style={{ fontSize:11, color:T.accent, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>FAQ & About</span>
        <a href="https://toolforge.lemonsqueezy.com" target="_blank" rel="noreferrer" style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", textDecoration:"none" }}>Pricing</a>
        <span onClick={onTos}    style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Terms of Service</span>
        <span onClick={onRefund} style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Refund Policy</span>
      </div>
      <div style={{ fontSize:10, color:T.muted, fontFamily:"DM Sans, sans-serif", marginTop:14 }}>© {new Date().getFullYear()} ToolForge · Made with ☕</div>
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
        <div style={{ fontSize:13, color:T.muted, lineHeight:1.7 }}>
          ToolForge was built to give freelancers, students, job seekers and small business owners access to powerful tools — for free. No accounts, no paywalls on the essentials, no bloat. Just open a tool and get things done.<br /><br />
          AI-powered tools use Groq (free, fast) or Claude Sonnet AI (premium, higher quality). New tools are added every week.
        </div>
      </div>
      <div style={{ padding:"0 16px 24px" }}>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:T.ink, marginBottom:12 }}>Frequently Asked Questions</div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} onClick={() => setOpen(open===i?null:i)} style={{ marginBottom:8, borderRadius:12, border:`1px solid ${open===i?T.accent:T.border}`, background:T.card, overflow:"hidden", cursor:"pointer", transition:"border 0.15s" }}>
            <div style={{ padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, lineHeight:1.4 }}>{item.q}</div>
              <span style={{ fontSize:14, color:T.muted, flexShrink:0, transform:open===i?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
            </div>
            {open===i && <div style={{ padding:"0 16px 14px", fontSize:12, color:T.muted, lineHeight:1.7, borderTop:`1px solid ${T.border}`, paddingTop:12 }}>{item.a}</div>}
          </div>
        ))}
      </div>
      <Footer onFaq={()=>{}} onTos={onTos} onRefund={onRefund} />
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
      <Footer onFaq={onFaq} onTos={()=>{}} onRefund={onRefund} />
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
          { title:"How to Request a Refund", body:"To request a refund, email us at toolforgesupport@gmail.com and include:\n• Your purchase email address\n• Your order ID (found in your Lemon Squeezy receipt email)\n\nWe will verify your eligibility and process approved refunds within 3 business days. Once issued, the refund typically appears back on your card within 5–10 business days depending on your bank or card provider." },
          { title:"Questions", body:"If you have any questions about this policy, contact us at toolforgesupport@gmail.com." },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom:16, padding:16, borderRadius:12, background:T.card, border:`1px solid ${T.border}` }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, marginBottom:6 }}>{s.title}</div>
            <div style={{ fontSize:12, color:T.muted, lineHeight:1.7, whiteSpace:"pre-line" }}>{s.body}</div>
          </div>
        ))}
      </div>
      <Footer onFaq={onFaq} onTos={onTos} onRefund={()=>{}} />
    </div>
  );
}

/* ── Main App ── */
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

  /* ── Lifted Pomodoro state ── */
  const POMO_MODES = { focus:25*60, short:5*60, long:15*60 };
  const [pomoMode, setPomoMode]         = useState("focus");
  const [pomoSec, setPomoSec]           = useState(POMO_MODES.focus);
  const [pomoRunning, setPomoRunning]   = useState(false);
  const [pomoPaused, setPomoPaused]     = useState(false);
  const [pomoSessions, setPomoSessions] = useState(0);
  const [pomoPinned, setPomoPinned]     = useState(false);
  const pomoRef = useRef(null);

  useEffect(() => {
    if (pomoRunning) {
      pomoRef.current = setInterval(() => {
        setPomoSec(s => {
          if (s <= 1) { clearInterval(pomoRef.current); setPomoRunning(false); setPomoPaused(false); if (pomoMode==="focus") setPomoSessions(n=>n+1); return 0; }
          return s - 1;
        });
      }, 1000);
    } else { clearInterval(pomoRef.current); }
    return () => clearInterval(pomoRef.current);
  }, [pomoRunning, pomoMode]);

  const pomoProps = {
    modes: POMO_MODES, modeId: pomoMode, secondsLeft: pomoSec, running: pomoRunning,
    pinned: pomoPinned, sessions: pomoSessions, paused: pomoPaused,
    onStart:      () => { setPomoRunning(true); setPomoPaused(false); setPomoPinned(true); },
    onPause:      () => { setPomoRunning(false); setPomoPaused(true); },
    onReset:      () => { clearInterval(pomoRef.current); setPomoRunning(false); setPomoPaused(false); setPomoSec(POMO_MODES[pomoMode]); setPomoPinned(false); },
    onSwitchMode: (m) => { clearInterval(pomoRef.current); setPomoMode(m); setPomoSec(POMO_MODES[m]); setPomoRunning(false); setPomoPaused(false); },
    onTogglePin:  () => setPomoPinned(p => !p),
  };

  /* ── Lifted Deadline state ── */
  const [dlLabel, setDlLabel]   = useState("");
  const [dlTarget, setDlTarget] = useState("");
  const [dlPinned, setDlPinned] = useState(false);
  const [dlRunning, setDlRunning] = useState(false);
  const dlRef = useRef(null);
  const [dlTick, setDlTick]     = useState(0);

  useEffect(() => {
    if (dlRunning) { dlRef.current = setInterval(() => setDlTick(t => t+1), 1000); }
    else { clearInterval(dlRef.current); }
    return () => clearInterval(dlRef.current);
  }, [dlRunning]);

  const dlProps = {
    label: dlLabel, setLabel: setDlLabel, target: dlTarget, setTarget: setDlTarget,
    pinned: dlPinned, running: dlRunning, tick: dlTick,
    onTogglePin: () => setDlPinned(p => !p),
    onStart: () => setDlRunning(true),
    onStop:  () => setDlRunning(false),
  };

  /* ── Floating widget state ── */
  const [widgets, setWidgets]       = useState([]);
  const [activePill, setActivePill] = useState(null);

  useEffect(() => {
    // Sync Pomodoro widget
    if (pomoPinned && pomoRunning) {
      const mm = Math.floor(pomoSec/60).toString().padStart(2,"0");
      const ss = (pomoSec%60).toString().padStart(2,"0");
      setWidgets(w => { const existing = w.find(x=>x.id==="pomodoro"); if (existing) return w.map(x=>x.id==="pomodoro"?{...x,label:`🍅 ${mm}:${ss}`}:x); return [...w, { id:"pomodoro", icon:"🍅", color:"#e85d04", label:`🍅 ${mm}:${ss}`, toolId:"pomodoro" }]; });
    } else if (pomoPinned && pomoPaused) {
      const mm = Math.floor(pomoSec/60).toString().padStart(2,"0");
      const ss = (pomoSec%60).toString().padStart(2,"0");
      setWidgets(w => w.map(x=>x.id==="pomodoro"?{...x,label:`🍅 ${mm}:${ss} ⏸`}:x));
    } else if (!pomoPinned) {
      setWidgets(w => w.filter(x=>x.id!=="pomodoro"));
    }
  }, [pomoPinned, pomoRunning, pomoPaused, pomoSec]);

  useEffect(() => {
    // Sync Deadline widget
    if (dlPinned && dlTarget) {
      const diff = new Date(dlTarget) - new Date();
      if (diff > 0) {
        const d = Math.floor(diff/86400000); const h = Math.floor((diff%86400000)/3600000);
        const lbl = d > 0 ? `🗓 ${d}d ${h}h` : `🗓 ${h}h`;
        setWidgets(w => { const existing = w.find(x=>x.id==="deadline"); if (existing) return w.map(x=>x.id==="deadline"?{...x,label:lbl}:x); return [...w, { id:"deadline", icon:"🗓", color:T.purple, label:lbl, toolId:"deadline" }]; });
      }
    } else if (!dlPinned) {
      setWidgets(w => w.filter(x=>x.id!=="deadline"));
    }
  }, [dlPinned, dlTarget, dlTick]);

  const removeWidget = (id) => {
    setWidgets(w => w.filter(x=>x.id!==id));
    if (id==="pomodoro") setPomoPinned(false);
    if (id==="deadline") setDlPinned(false);
    if (activePill===id) setActivePill(null);
  };

  const handleTokenUpdate = (t) => { setProToken(t); localStorage.setItem("tf_pro_token", JSON.stringify(t)); };
  useEffect(() => { injectFonts(); }, []);

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");
  if (orderId) return <SuccessPage orderId={orderId} onDone={() => { window.history.replaceState({}, "", "/"); try { const s = localStorage.getItem("tf_pro_token"); if (s) setProToken(JSON.parse(s)); } catch {} window.location.reload(); }} />;
  if (showFaq)    return <FAQPage    onBack={() => { setShowFaq(false);    window.history.pushState({}, "", "/"); }} onTos={() => { setShowFaq(false); setShowTos(true); }} onRefund={() => { setShowFaq(false); setShowRefund(true); }} />;
  if (showTos)    return <TosPage    onBack={() => { setShowTos(false);    window.history.pushState({}, "", "/"); }} onFaq={() => { setShowTos(false); setShowFaq(true); }} onRefund={() => { setShowTos(false); setShowRefund(true); }} />;
  if (showRefund) return <RefundPage onBack={() => { setShowRefund(false); window.history.pushState({}, "", "/"); }} onFaq={() => { setShowRefund(false); setShowFaq(true); }} onTos={() => { setShowRefund(false); setShowTos(true); }} />;

  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  const filtered = ALL_TOOLS.filter(t =>
    (activeCat==="all" || t.catId===activeCat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
  );
  const gridStyle = { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 };
  const responsiveGrid = `@media (max-width:400px) { .tf-grid { grid-template-columns: repeat(2,1fr) !important; } }`;

  /* ── Games view ── */
  if (showGames) return (
    <>
      <style>{responsiveGrid}</style>
      <div style={{ maxWidth:480, margin:"0 auto", padding:20, background:T.bg, minHeight:"100vh" }}>
        <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, boxShadow:"0 2px 24px #0f0f0d0a" }}>
          <GamesSection proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} onBack={() => setShowGames(false)} />
        </div>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={(toolId) => { setShowGames(false); setActiveTool(ALL_TOOLS.find(t=>t.id===toolId)); }} />
    </>
  );

  /* ── Tool view ── */
  if (activeTool) return (
    <>
      <style>{responsiveGrid}</style>
      <div style={{ maxWidth:480, margin:"0 auto", padding:20, background:T.bg, minHeight:"100vh" }}>
        <div style={{ background:T.card, borderRadius:16, padding:20, border:`1px solid ${T.border}`, boxShadow:"0 2px 24px #0f0f0d0a" }}>
          <ToolView tool={activeTool} onBack={() => setActiveTool(null)} proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} pomoProps={pomoProps} dlProps={dlProps} />
        </div>
        {proToken && proToken.generations_left > 0 && (
          <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:T.goldDim, border:`1px solid ${T.gold}44`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:11, color:T.gold }}>✦ {proToken.type==="pro"?"Pro Active":"Pack Active"}</div>
            <div style={{ fontSize:11, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>{proToken.generations_left} Claude generations left</div>
          </div>
        )}
      </div>
      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={(toolId) => setActiveTool(ALL_TOOLS.find(t=>t.id===toolId))} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );

  /* ── Home view ── */
  return (
    <>
      <style>{responsiveGrid}</style>

      {/* Sticky upgrade banner */}
      {!proToken && (
        <div onClick={() => setShowUpgrade(true)} style={{ position:"sticky", top:0, zIndex:100, background:`linear-gradient(90deg,${T.gold},${T.accent})`, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:"white" }}>✦ Unlock Claude Sonnet AI — from $2.99</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.85)", fontFamily:"DM Sans, sans-serif", whiteSpace:"nowrap" }}>Better outputs →</div>
        </div>
      )}

      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:T.bg, fontFamily:"DM Sans, sans-serif" }}>

        {/* Header */}
        <div style={{ padding:"24px 20px 16px", borderBottom:`1px solid ${T.border}`, background:T.card }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:26, color:T.ink, letterSpacing:-0.5 }}>Tool</span>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:26, color:T.accent, letterSpacing:-0.5 }}>Forge</span>
            <span style={{ fontSize:11, color:T.muted, marginLeft:4, fontWeight:400, letterSpacing:1 }}>{ALL_TOOLS.length} FREE TOOLS</span>
          </div>
          <div style={{ fontSize:13, color:T.muted, marginBottom:10 }}>Every tool you need — writing, calculators, planning & more.</div>
          {proToken && proToken.generations_left > 0 && (
            <div style={{ marginBottom:10, padding:"6px 12px", borderRadius:99, background:T.goldDim, border:`1px solid ${T.gold}44`, display:"inline-flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, fontFamily:"Syne, sans-serif", fontWeight:700, color:T.gold }}>✦ {proToken.type==="pro"?"PRO":"PACK"}</span>
              <span style={{ fontSize:10, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>{proToken.generations_left} Claude uses left</span>
            </div>
          )}
          {!proToken && <RestoreToken onRestore={handleTokenUpdate} />}
          <div style={{ position:"relative", marginTop:12 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:T.muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools..." style={{ ...inputStyle, paddingLeft:36, width:"100%", boxSizing:"border-box", background:T.bg, border:`1px solid ${T.border}` }} />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ padding:"10px 16px", display:"flex", gap:7, overflowX:"auto", borderBottom:`1px solid ${T.border}`, background:T.card }}>
          {[{ id:"all", label:"All", icon:"✦", color:T.accent, colorDim:T.accentDim }, ...CATEGORIES].map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:99, border:`1px solid ${activeCat===c.id?c.color:T.border}`, background:activeCat===c.id?c.colorDim||T.accentDim:"white", color:activeCat===c.id?c.color:T.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* 🎮 Take a Break banner — between tabs and tool grid */}
        <div onClick={() => setShowGames(true)} style={{ margin:"12px 16px 0", padding:"14px 18px", borderRadius:14, background:`linear-gradient(135deg, ${G_COLOR}, #7c3aed)`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:`0 4px 20px ${G_COLOR}30` }}>
          <div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:"white", marginBottom:2 }}>🎮 Take a Break</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)", fontFamily:"DM Sans, sans-serif" }}>Free games + premium unlocks · resets daily</div>
          </div>
          <div style={{ fontSize:18, color:"rgba(255,255,255,0.7)" }}>→</div>
        </div>

        {/* Tool grid */}
        <div style={{ padding:16 }}>
          {search ? (
            <>
              <div style={{ fontSize:12, color:T.muted, marginBottom:12 }}>{filtered.length} result{filtered.length!==1?"s":""} for "{search}"</div>
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
              <div key={cat.id} style={{ marginBottom:20 }}>
                <div onClick={() => toggleCollapse(cat.id)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:collapsed[cat.id]?0:10, cursor:"pointer", padding:"6px 0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:cat.colorDim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{cat.icon}</div>
                    <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:T.ink }}>{cat.label}</span>
                    <span style={{ fontSize:10, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{cat.tools.length} tools</span>
                  </div>
                  <span style={{ fontSize:14, color:T.muted, transform:collapsed[cat.id]?"rotate(-90deg)":"rotate(0deg)", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
                </div>
                {!collapsed[cat.id] && (
                  <div className="tf-grid" style={gridStyle}>
                    {cat.tools.map(tool => (
                      <ToolCard key={tool.id} tool={{ ...tool, catId:cat.id, catColor:cat.color, catColorDim:cat.colorDim }} onClick={() => setActiveTool({ ...tool, catId:cat.id, catColor:cat.color, catColorDim:cat.colorDim })} />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          <div style={{ marginTop:10, padding:16, borderRadius:14, background:`linear-gradient(135deg,${T.accentDim},${T.blueDim})`, border:`1px solid ${T.border}`, textAlign:"center" }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:T.ink, marginBottom:4 }}>✦ More tools dropping weekly</div>
            <div style={{ fontSize:12, color:T.muted }}>Debt payoff · Resume bullets · Pricing guide · and 20+ more</div>
          </div>
        </div>

      </div>

      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <Footer
          onFaq={()    => { setShowFaq(true);    window.history.pushState({}, "", "/faq"); }}
          onTos={()    => { setShowTos(true);    window.history.pushState({}, "", "/terms"); }}
          onRefund={()=> { setShowRefund(true);  window.history.pushState({}, "", "/refund"); }}
        />
      </div>

      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={(toolId) => setActiveTool(ALL_TOOLS.find(t=>t.id===toolId))} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
