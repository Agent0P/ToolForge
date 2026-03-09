import { useState, useEffect, useRef } from "react";
import { T, injectFonts, inputStyle, RestoreToken, CopyButton } from "./theme";
import {
  RateCalc, ProjectEstimator, GPACalc, TipSplitter, MarginCalc, BreakEvenCalc,
  DeadlineCountdown, PomodoroTimer, FloatingWidget,
  TimezoneConverter, UnitConverter, StudyPlanner, CitationFormatter,
  WordCounter, BMICalculator, QRGenerator,
} from "./tools";
import { SavingsCalc, SalaryHelper, ResumeReviewer, AIToolPlaceholder } from "./ai-tools";

injectFonts();

/* ── Categories & tool registry ── */
const CATEGORIES = [
  { id: "writing", label: "Writing & AI", icon: "✍️", color: T.accent, colorDim: T.accentDim, tools: [
    { id: "cover",           icon: "📄", name: "Cover Letter Generator",   desc: "Tailored AI cover letters in seconds" },
    { id: "linkedin",        icon: "🔗", name: "LinkedIn Bio Writer",       desc: "Stand out with an AI-crafted bio" },
    { id: "cold",            icon: "📧", name: "Cold Email Generator",      desc: "Outreach emails that get replies" },
    { id: "proposal",        icon: "✍️", name: "Client Proposal Writer",    desc: "Win more clients with AI proposals" },
    { id: "invoice",         icon: "🧾", name: "Invoice Text Generator",    desc: "AI-written professional invoices" },
    { id: "tagline",         icon: "✨", name: "Business Tagline Generator",desc: "AI slogans that stick" },
    { id: "essay",           icon: "📝", name: "Essay Outline Generator",   desc: "AI-structured essay plans" },
    { id: "email",           icon: "💌", name: "Marketing Email Writer",    desc: "Convert with AI-written emails" },
    { id: "resume-reviewer", icon: "📋", name: "Resume Reviewer",          desc: "Get honest AI feedback on your CV" },
  ]},
  { id: "calculators", label: "Calculators", icon: "🧮", color: T.blue, colorDim: T.blueDim, tools: [
    { id: "rate",      icon: "💰", name: "Hourly Rate Calculator",    desc: "Know exactly what to charge" },
    { id: "project",   icon: "📅", name: "Project Price Estimator",   desc: "Quote any project confidently" },
    { id: "margin",    icon: "📈", name: "Profit Margin Calculator",  desc: "Price products for profit" },
    { id: "breakeven", icon: "⚖️", name: "Break-Even Calculator",     desc: "Find your break-even point fast" },
    { id: "gpa",       icon: "📐", name: "GPA Calculator",            desc: "Track and project your GPA" },
    { id: "salary",    icon: "📊", name: "Salary Negotiation Helper", desc: "Know your worth, negotiate better" },
    { id: "tip",       icon: "🍽", name: "Tip & Bill Splitter",       desc: "Split any bill instantly" },
    { id: "savings",   icon: "🏦", name: "Savings Goal Calculator",   desc: "Plan your way to any goal" },
    { id: "bmi",       icon: "⚖️", name: "BMI Calculator",            desc: "Calculate your Body Mass Index and health range" },
  ]},
  { id: "planning", label: "Planning & Time", icon: "📅", color: T.purple, colorDim: T.purpleDim, tools: [
    { id: "pomodoro", icon: "🍅", name: "Pomodoro Timer",        desc: "Focus sessions with automatic break reminders" },
    { id: "deadline", icon: "🗓", name: "Deadline Countdown",    desc: "Days, hours, minutes to any date" },
    { id: "study",    icon: "⏱", name: "Study Session Planner", desc: "Optimise your revision time" },
    { id: "citation", icon: "📚", name: "Citation Formatter",    desc: "APA, MLA, Chicago in one click" },
  ]},
  { id: "utilities", label: "Utilities", icon: "🛠", color: T.teal, colorDim: T.tealDim, tools: [
    { id: "unit",        icon: "📏", name: "Unit Converter",    desc: "Length, weight, temp & more" },
    { id: "timezone",    icon: "🌍", name: "Timezone Converter",desc: "Convert times across the world instantly" },
    { id: "word-counter",icon: "📝", name: "Word Counter",      desc: "Words, characters, sentences & reading time" },
    { id: "qr-generator",icon: "📱", name: "QR Code Generator", desc: "Generate a scannable QR code for any link or text" },
  ]},
];

const ALL_TOOLS = CATEGORIES.flatMap(c => c.tools.map(t => ({ ...t, catId: c.id, catColor: c.color, catColorDim: c.colorDim })));
const AI_TOOLS = ["Cover Letter Generator","LinkedIn Bio Writer","Cold Email Generator","Business Tagline Generator","Essay Outline Generator","Client Proposal Writer","Invoice Text Generator","Marketing Email Writer","Resume Reviewer","Salary Negotiation Helper","Savings Goal Calculator"];

/* ── FAQ data ── */
const FAQ_ITEMS = [
  { q:"What is ToolForge?", a:"ToolForge is a free collection of 25+ online tools designed for freelancers, students, job seekers and small businesses. No sign-up required — just open a tool and use it." },
  { q:"Are the tools really free?", a:"Yes. All calculators and utilities are completely free, forever. AI-powered tools offer 3 free generations per day via Groq. For more generations and access to Claude Sonnet AI (higher quality), there's an affordable paid plan." },
  { q:"What's the difference between Groq AI and Claude Sonnet AI?", a:"Groq (free) uses the Llama 3.3 model — fast and capable for most tasks. Claude Sonnet AI (paid) is Anthropic's Claude model — it produces noticeably better, more nuanced writing. Worth it if you rely on the AI tools regularly." },
  { q:"What do I get with a paid plan?", a:"The One-Time Pack ($2.99) gives you 50 Claude Sonnet AI generations. The Pro Monthly ($7.99/mo) gives 400 generations per month and renews automatically. The Top-Up Pack ($2.99) adds 100 generations to your existing balance whenever you need more." },
  { q:"How do I access my account on a new device?", a:"There are no accounts or passwords. Just go to ToolForge, click \"Restore Access\" and enter the email you used to purchase. Your access will be restored instantly on any device, any browser." },
  { q:"I bought a plan but can't access Claude — what do I do?", a:"Click \"Restore Access\" on the homepage and enter your purchase email. Your access will be restored instantly on any device. If you're still having trouble, email us at toolforgesupport@gmail.com." },
  { q:"Is my data private? Do you store my inputs?", a:"Your inputs are sent to the AI model to generate a response and are not stored on our servers. We don't sell data or show ads based on your inputs. Payments are handled entirely by Lemon Squeezy — we never see your card details." },
  { q:"How many tools are there and will more be added?", a:"There are currently 25 tools and we add more every week. Upcoming tools include a mortgage calculator, debt payoff calculator, currency converter and more." },
  { q:"What payment methods are accepted?", a:"All major credit and debit cards are accepted via Lemon Squeezy, our payment provider. Payments are secure and encrypted." },
  { q:"Can I cancel my Pro subscription?", a:"Yes, anytime. Log into your Lemon Squeezy customer portal (link in your receipt email) and cancel with one click. You keep access until the end of your billing period." },
  { q:"Will there be ads on ToolForge?", a:"Not right now. The site is funded by the paid AI plans. If ads are ever introduced in the future, they'll be minimal and non-intrusive." },
];

/* ── Shared UI components ── */
function Footer({ onFaq, onTos, onRefund }) {
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
        <span onClick={onTos} style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Terms of Service</span>
        <span onClick={onRefund} style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Refund Policy</span>
        <a href="mailto:toolforgesupport@gmail.com" style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif", textDecoration:"underline" }}>Contact</a>
      </div>
      <div style={{ fontSize:10, color:T.muted, fontFamily:"DM Sans, sans-serif", marginTop:14 }}>
        © {new Date().getFullYear()} ToolForge · Made with ☕
      </div>
    </div>
  );
}

function FAQPage({ onBack }) {
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
          ToolForge was built to give freelancers, students, job seekers and small business owners access to powerful tools — for free. No accounts, no paywalls on the essentials, no bloat. Just open a tool and get things done.
          <br /><br />
          AI-powered tools use Groq (free, fast) or Claude Sonnet AI (premium, higher quality). New tools are added every week.
        </div>
      </div>
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
      <Footer onFaq={() => {}} onTos={() => {}} onRefund={() => {}} />
    </div>
  );
}

function TosPage({ onBack }) {
  const s = { heading: { fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:"#0f0f0d", marginTop:20, marginBottom:6 }, body: { fontSize:12, color:"#6b6b5f", fontFamily:"DM Sans, sans-serif", lineHeight:1.8, marginBottom:4 } };
  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:"#f7f5f0", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid #e0ddd6", background:"white" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#e85d04", fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Back to ToolForge</button>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:"#0f0f0d", marginBottom:4 }}>Terms of Service</div>
        <div style={{ fontSize:12, color:"#6b6b5f" }}>Last updated: {new Date().toLocaleDateString("en-US", { month:"long", year:"numeric" })}</div>
      </div>
      <div style={{ padding:"16px 20px 40px" }}>
        <div style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e0ddd6" }}>

          <div style={s.heading}>1. Acceptance of Terms</div>
          <div style={s.body}>By accessing or using ToolForge ("the Service") at toolforge.pro, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</div>

          <div style={s.heading}>2. Description of Service</div>
          <div style={s.body}>ToolForge provides free and premium online tools for freelancers, students, and small businesses. Free tools are available without registration. Premium AI features require a paid token purchased via Lemon Squeezy.</div>

          <div style={s.heading}>3. Paid Plans & Access Tokens</div>
          <div style={s.body}>Upon successful payment, you receive a unique access token granting a set number of AI generations. Tokens are non-transferable and tied to your purchase email. ToolForge is not responsible for tokens lost due to browser data being cleared — use the "Restore Access" feature to recover access.</div>

          <div style={s.heading}>4. Acceptable Use</div>
          <div style={s.body}>You agree not to misuse the Service, including but not limited to: attempting to reverse-engineer the platform, using automated tools to abuse free limits, generating illegal or harmful content, or reselling access tokens.</div>

          <div style={s.heading}>5. AI-Generated Content</div>
          <div style={s.body}>All AI-generated content is provided for informational and productivity purposes only. ToolForge makes no guarantees regarding the accuracy, completeness, or fitness of AI outputs for any particular purpose. You are solely responsible for how you use generated content.</div>

          <div style={s.heading}>6. Intellectual Property</div>
          <div style={s.body}>The ToolForge name, logo, design, and underlying code are the intellectual property of ToolForge. AI-generated outputs belong to the user who generated them, subject to the terms of the underlying AI providers (Anthropic, Groq).</div>

          <div style={s.heading}>7. Limitation of Liability</div>
          <div style={s.body}>ToolForge is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including loss of data or revenue.</div>

          <div style={s.heading}>8. Changes to Terms</div>
          <div style={s.body}>We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</div>

          <div style={s.heading}>9. Contact</div>
          <div style={s.body}>For any questions regarding these Terms, please contact us at <strong>toolforgesupport@gmail.com</strong>.</div>
        </div>
      </div>
    </div>
  );
}

function RefundPage({ onBack }) {
  const s = { heading: { fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:"#0f0f0d", marginTop:20, marginBottom:6 }, body: { fontSize:12, color:"#6b6b5f", fontFamily:"DM Sans, sans-serif", lineHeight:1.8, marginBottom:4 } };
  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:"#f7f5f0", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid #e0ddd6", background:"white" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#e85d04", fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Back to ToolForge</button>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:"#0f0f0d", marginBottom:4 }}>Refund Policy</div>
        <div style={{ fontSize:12, color:"#6b6b5f" }}>Last updated: {new Date().toLocaleDateString("en-US", { month:"long", year:"numeric" })}</div>
      </div>
      <div style={{ padding:"16px 20px 40px" }}>
        <div style={{ background:"white", borderRadius:16, padding:20, border:"1px solid #e0ddd6" }}>

          <div style={s.heading}>Our Commitment</div>
          <div style={s.body}>We want you to be satisfied with your purchase. If ToolForge doesn't work as described, we'll make it right.</div>

          <div style={s.heading}>Eligibility for a Refund</div>
          <div style={s.body}>You are eligible for a full refund if:</div>
          <div style={{ ...s.body, paddingLeft:14 }}>• You request it within <strong>3 days</strong> of your purchase date<br/>• You have <strong>not used any AI generations</strong> from your purchased pack or plan</div>

          <div style={s.heading}>Non-Refundable Situations</div>
          <div style={{ ...s.body, paddingLeft:14 }}>• Refund requests made more than 3 days after purchase<br/>• Packs or plans where any generations have been used<br/>• Dissatisfaction with AI output quality alone (we encourage you to try the free Groq tier before purchasing)</div>

          <div style={s.heading}>How to Request a Refund</div>
          <div style={s.body}>To request a refund, email us at <strong>toolforgesupport@gmail.com</strong> and include the following:</div>
          <div style={{ ...s.body, paddingLeft:14 }}>• Your purchase email address<br/>• Your order ID (found in your Lemon Squeezy receipt email)</div>
          <div style={s.body}>We will verify your eligibility and process approved refunds within 3 business days. Once issued, the refund typically appears back on your card within <strong>5–10 business days</strong> depending on your bank or card provider. Refunds are returned to the original payment method via Lemon Squeezy.</div>

          <div style={s.heading}>Subscription Cancellations</div>
          <div style={s.body}>Pro Monthly subscribers can cancel at any time via the Lemon Squeezy customer portal (link in your receipt email). Cancellation stops future billing immediately. You retain access until the end of your current billing period. Partial-month refunds are not issued for cancellations.</div>

          <div style={s.heading}>Questions</div>
          <div style={s.body}>If you have any questions about this policy, please email us at <strong>toolforgesupport@gmail.com</strong>.</div>
        </div>
      </div>
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
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.ink }}>Unlock Claude<br/><span>Sonnet AI ✦</span></div>
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
          <div style={{ padding:16, paddingTop:22, borderRadius:14, border:`2px solid ${T.gold}`, background:T.goldDim, cursor:"pointer", position:"relative" }}>
            <div style={{ position:"absolute", top:-11, right:12, fontSize:9, padding:"3px 10px", borderRadius:99, background:T.gold, color:"white", fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5, whiteSpace:"nowrap" }}>BEST VALUE</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:T.gold }}>Pro Monthly</div><div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.gold }}>$7.99<span style={{ fontSize:12, fontWeight:400 }}>/mo</span></div></div>
            <div style={{ fontSize:12, color:T.gold, fontFamily:"DM Sans, sans-serif" }}>400 Claude generations/month · No ads · Cancel anytime</div>
          </div>
        </a>
        <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:8, background:"#f0f9ff", border:"1px solid #bae6fd", fontSize:11, color:"#0369a1", fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>
          ⚠️ <strong>Important:</strong> Access is tied to your purchase email. To restore access on any device, use the "Restore Access" button on the homepage and enter the same email you used to purchase.
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
          <div style={{ fontSize:13, color:T.muted, marginBottom:20, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>Your payment was received! Check your email for your access token, or contact us at toolforgesupport@gmail.com.</div>
          <button onClick={onDone} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:T.accent, color:"white", fontSize:14, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>Back to ToolForge</button>
        </>}
      </div>
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

function ToolView({ tool, onBack, proToken, onNeedUpgrade, onTokenUpdate, addWidget, removeWidget, pomoProps, dlProps }) {
  const cat = CATEGORIES.find(c => c.id === tool.catId);
  const renderTool = () => {
    switch (tool.id) {
      case "resume-reviewer": return <ResumeReviewer proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      case "savings":         return <SavingsCalc proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      case "salary":          return <SalaryHelper proToken={proToken} onNeedUpgrade={onNeedUpgrade} onTokenUpdate={onTokenUpdate} />;
      case "rate":            return <RateCalc />;
      case "project":         return <ProjectEstimator />;
      case "gpa":             return <GPACalc />;
      case "tip":             return <TipSplitter />;
      case "margin":          return <MarginCalc />;
      case "breakeven":       return <BreakEvenCalc />;
      case "unit":            return <UnitConverter />;
      case "timezone":        return <TimezoneConverter />;
      case "study":           return <StudyPlanner />;
      case "citation":        return <CitationFormatter />;
      case "word-counter":    return <WordCounter />;
      case "bmi":             return <BMICalculator />;
      case "qr-generator":    return <QRGenerator />;
      case "deadline":        return <DeadlineCountdown {...dlProps} />;
      case "pomodoro":        return <PomodoroTimer {...pomoProps} />;
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
        <div><div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:17, color:T.ink }}>{tool.name}</div><div style={{ fontSize:12, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{tool.desc}</div></div>
      </div>
      {renderTool()}
    </div>
  );
}

/* ── Main App ── */
export default function ToolForge() {
  const [activeCat, setActiveCat] = useState("all");
  const [activeTool, setActiveTool] = useState(null);
  const [search, setSearch] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [showFaq, setShowFaq] = useState(window.location.pathname === "/faq");
  const [showTos, setShowTos] = useState(window.location.pathname === "/terms");
  const [showRefund, setShowRefund] = useState(window.location.pathname === "/refund");
  const [widgets, setWidgets] = useState({});
  const [activePill, setActivePill] = useState(null);
  const addWidget = (id, data) => setWidgets(w => ({ ...w, [id]: data }));
  const removeWidgetRef = useRef(null);
  const removeWidget = (id) => { if (removeWidgetRef.current) removeWidgetRef.current(id); };
  const [proToken, setProToken] = useState(() => { try { const s = localStorage.getItem("tf_pro_token"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const handleTokenUpdate = (t) => { setProToken(t); localStorage.setItem("tf_pro_token", JSON.stringify(t)); };

  /* ── Lifted Pomodoro state ── */
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
    clearPomoTick(); setPomoRunning(true); setPomoPaused(false);
    if (!pomoPinned) pomoDoPin(pomoSeconds, false);
    pomoIntervalRef.current = setInterval(() => {
      setPomoSeconds(prev => {
        const next = prev - 1;
        if (next <= 0) { clearPomoTick(); setPomoRunning(false); setPomoPaused(false); setPomoSessions(s => pomoModeId === "focus" ? s + 1 : s); pomoDoUnpin(); return 0; }
        addWidget("pomodoro", { toolId: "pomodoro", icon: pomoMode.icon, color: pomoMode.color, colorDim: pomoMode.colorDim, type: "pomodoro", sessionLabel: pomoMode.label, secondsLeft: next, paused: false });
        return next;
      });
    }, 1000);
  };
  const pomocPause = () => { clearPomoTick(); setPomoRunning(false); setPomoPaused(true); addWidget("pomodoro", { toolId: "pomodoro", icon: pomoMode.icon, color: pomoMode.color, colorDim: pomoMode.colorDim, type: "pomodoro", sessionLabel: pomoMode.label, secondsLeft: pomoSeconds, paused: true }); };
  const pomoReset = () => { clearPomoTick(); setPomoRunning(false); setPomoPaused(false); setPomoSeconds(pomoMode.mins * 60); pomoDoUnpin(); };
  const pomoSwitchMode = (id) => { clearPomoTick(); setPomoRunning(false); setPomoPaused(false); setPomoModeId(id); setPomoSeconds(POMO_MODES.find(m => m.id === id).mins * 60); pomoDoUnpin(); };
  const pomoTogglePin = () => { if (pomoPinned) pomoDoUnpin(); else pomoDoPin(pomoSeconds, !pomoRunning); };
  useEffect(() => () => clearPomoTick(), []);

  /* ── Lifted Deadline state ── */
  const [dlPinned, setDlPinned] = useState(false);
  const [dlRunning, setDlRunning] = useState(false);
  const [dlLabel, setDlLabel] = useState("Project deadline");
  const dlDefaultTarget = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().split("T")[0]; };
  const [dlTarget, setDlTarget] = useState(dlDefaultTarget);
  const dlTickRef = useRef(null);
  const dlClearTick = () => { if (dlTickRef.current) clearInterval(dlTickRef.current); };
  const dlStartCountdown = () => { setDlRunning(true); dlTickRef.current = setInterval(() => { setWidgets(w => w.deadline ? { ...w, deadline: { ...w.deadline, _tick: Date.now() } } : w); }, 1000); };
  const dlStopCountdown = () => { setDlRunning(false); dlClearTick(); };
  const dlPin = () => { setDlPinned(true); addWidget("deadline", { toolId: "deadline", icon: "🗓", color: T.purple, colorDim: T.purpleDim, type: "deadline", label: dlLabel, targetDate: dlTarget }); };
  const dlUnpin = () => { setDlPinned(false); removeWidget("deadline"); };
  const dlHandlePin = () => { if (dlPinned) dlUnpin(); else dlPin(); };
  useEffect(() => { if (dlPinned) addWidget("deadline", { toolId: "deadline", icon: "🗓", color: T.purple, colorDim: T.purpleDim, type: "deadline", label: dlLabel, targetDate: dlTarget }); }, [dlLabel, dlTarget, dlPinned]);
  useEffect(() => () => dlClearTick(), []);

  removeWidgetRef.current = (id) => {
    setWidgets(w => { const n = { ...w }; delete n[id]; return n; });
    setActivePill(p => p === id ? null : p);
    if (id === "deadline") setDlPinned(false);
    if (id === "pomodoro") setPomoPinned(false);
  };

  const openTool = (toolId) => { const tool = ALL_TOOLS.find(t => t.id === toolId); if (tool) setActiveTool(tool); };

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");
  if (orderId) return <SuccessPage orderId={orderId} onDone={() => { window.history.replaceState({}, "", "/"); try { const s = localStorage.getItem("tf_pro_token"); if (s) setProToken(JSON.parse(s)); } catch {} window.location.reload(); }} />;

  if (showFaq) return <FAQPage onBack={() => { setShowFaq(false); window.history.pushState({}, "", "/"); }} />;
  if (showTos) return <TosPage onBack={() => { setShowTos(false); window.history.pushState({}, "", "/"); }} />;
  if (showRefund) return <RefundPage onBack={() => { setShowRefund(false); window.history.pushState({}, "", "/"); }} />;

  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  const filtered = ALL_TOOLS.filter(t => (activeCat === "all" || t.catId === activeCat) && (t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())));

  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 };
  const responsiveGrid = `@media (max-width: 400px) { .tf-grid { grid-template-columns: repeat(2, 1fr) !important; } }`;

  const pomoProps = { modes: POMO_MODES, modeId: pomoModeId, secondsLeft: pomoSeconds, running: pomoRunning, pinned: pomoPinned, sessions: pomoSessions, paused: pomoPaused, onStart: pomoStart, onPause: pomocPause, onReset: pomoReset, onSwitchMode: pomoSwitchMode, onTogglePin: pomoTogglePin };
  const dlProps = { label: dlLabel, setLabel: setDlLabel, target: dlTarget, setTarget: setDlTarget, pinned: dlPinned, onTogglePin: dlHandlePin, running: dlRunning, onStart: dlStartCountdown, onStop: dlStopCountdown };

  if (activeTool) return (
    <>
      <style>{responsiveGrid}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 20, background: T.bg, minHeight: "100vh" }}>
        <div style={{ background: T.card, borderRadius: 16, padding: 20, border: `1px solid ${T.border}`, boxShadow: "0 2px 24px #0f0f0d0a" }}>
          <ToolView tool={activeTool} onBack={() => setActiveTool(null)} proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} addWidget={addWidget} removeWidget={removeWidget} pomoProps={pomoProps} dlProps={dlProps} />
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

        {/* Category tabs */}
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
        <Footer onFaq={() => { setShowFaq(true); window.history.pushState({}, "", "/faq"); }} onTos={() => { setShowTos(true); window.history.pushState({}, "", "/terms"); }} onRefund={() => { setShowRefund(true); window.history.pushState({}, "", "/refund"); }} />
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={openTool} />
    </>
  );
}
