import { useState, useEffect, useRef } from "react";
import { T, D, inputStyle, injectFonts, injectStyles, RestoreToken, CopyButton } from "./theme";
import {
  RateCalc, ProjectEstimator, GPACalc, TipSplitter, MarginCalc, BreakEvenCalc,
  DeadlineCountdown, PomodoroTimer, FloatingWidget,
  TimezoneConverter, UnitConverter, StudyPlanner, CitationFormatter,
  WordCounter, BMICalculator, QRGenerator,
  PasswordGenerator, CurrencyConverter, LoanCalculator
} from "./tools";
import { SavingsCalc, SalaryHelper, ResumeReviewer, AIToolPlaceholder, DocumentSummarizer } from "./ai-tools";
import { G_COLOR, G_DIM, GamesSection } from "./games";

/* ── Dark theme imported from theme.jsx ── */

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
    { id:"password",  icon:"🔐",  name:"Password Generator",        desc:"Secure passwords in one click" },
    { id:"currency",  icon:"💱",  name:"Currency Converter",         desc:"Live exchange rates, 27 currencies" },
    { id:"loan",      icon:"🏠",  name:"Loan & Mortgage Calculator", desc:"Monthly payments & interest breakdown", section:"Calculators" },
    { id:"qr",        icon:"🔲",  name:"QR Code Generator",        desc:"Turn any link or text into a QR code" },
  ]},
];

const ALL_TOOLS = CATEGORIES.flatMap(c => c.tools.map(t => ({ ...t, catId:c.id, catColor:c.color, catColorDim:c.colorDim })));
const AI_TOOLS  = ["Cover Letter Generator","LinkedIn Bio Writer","Cold Email Generator","Business Tagline Generator","Essay Outline Generator","Client Proposal Writer","Invoice Text Generator","Marketing Email Writer","Resume Reviewer","Salary Negotiation Helper","Savings Goal Calculator","Document Summarizer","Citation Formatter"];

/* ── SEO: slug → { title, description } for every tool ── */
const TOOL_META = {
  /* Writing & AI */
  "summarize":  { slug:"document-summarizer",       title:"Free Document Summarizer — Instant AI Summary",                    desc:"Paste or upload any text and get an instant AI summary. Understand any document in seconds. Free, no sign-up required." },
  "resume":     { slug:"resume-reviewer",            title:"Free Resume Reviewer — AI CV Feedback & Score",                   desc:"Get honest AI feedback on your resume. Section-by-section critique, ATS check, rewrite suggestions, and a score out of 100. Free." },
  "cover":      { slug:"cover-letter-generator",    title:"Free Cover Letter Generator — AI Tailored Letters",               desc:"Generate a tailored, professional cover letter in seconds. AI-written for your specific job and experience. No sign-up needed." },
  "linkedin":   { slug:"linkedin-bio-writer",        title:"Free LinkedIn Bio Writer — AI-Written Profile Summary",           desc:"Create a standout LinkedIn About section with AI. Professional, keyword-rich bios that get noticed by recruiters. Free." },
  "cold":       { slug:"cold-email-generator",       title:"Free Cold Email Generator — AI Outreach Emails That Get Replies", desc:"Write cold emails that actually get responses. AI-crafted outreach emails for sales, networking, and job hunting. Free to try." },
  "proposal":   { slug:"client-proposal-writer",    title:"Free Client Proposal Writer — Win More Freelance Clients",        desc:"Write professional client proposals in minutes with AI. Customised to your project, rate, and client. Free for freelancers." },
  "invoice":    { slug:"invoice-text-generator",    title:"Free Invoice Text Generator — Professional AI Invoices",          desc:"Generate clear, professional invoice text instantly. Perfect for freelancers and small businesses. No sign-up, completely free." },
  "tagline":    { slug:"business-tagline-generator", title:"Free Business Tagline Generator — AI Slogans That Stick",        desc:"Create memorable taglines and slogans for your business with AI. Get multiple options instantly. Free, no account needed." },
  "essay":      { slug:"essay-outline-generator",   title:"Free Essay Outline Generator — AI Structured Essay Plans",       desc:"Build a clear, structured essay outline in seconds. AI organises your arguments and sections for any topic. Free for students." },
  "email":      { slug:"marketing-email-writer",    title:"Free Marketing Email Writer — AI Emails That Convert",           desc:"Write marketing emails that drive clicks and conversions. AI-crafted campaigns for newsletters, promotions, and more. Free." },
  /* Calculators */
  "rate":       { slug:"hourly-rate-calculator",    title:"Free Hourly Rate Calculator for Freelancers",                    desc:"Calculate your exact freelance hourly rate. Factor in expenses, taxes, and desired salary. Know what to charge. Free tool." },
  "project":    { slug:"project-price-estimator",   title:"Free Project Price Estimator — Quote Any Project Instantly",     desc:"Estimate project costs by task. Add hours, rates, and a rush fee. Export a clean quote ready to send to clients. Free." },
  "margin":     { slug:"profit-margin-calculator",  title:"Free Profit Margin Calculator — Price Products for Profit",      desc:"Calculate gross profit margin instantly. Enter cost and price, see your margin percentage. Find what price hits your target. Free." },
  "breakeven":  { slug:"break-even-calculator",     title:"Free Break-Even Calculator — Find Your Break-Even Point Fast",   desc:"Find out exactly how many units you need to sell to break even. Enter fixed costs, variable costs, and price. Free online tool." },
  "gpa":        { slug:"gpa-calculator",            title:"Free GPA Calculator — Track & Project Your GPA",                 desc:"Calculate your GPA, track your grades, and find out exactly what grade you need in your next course to hit your target GPA. Free." },
  "salary":     { slug:"salary-negotiation-helper", title:"Free Salary Negotiation Helper — Know Your Worth",               desc:"Get a personalised salary negotiation range based on your role, experience, and market. AI-powered full analysis available. Free." },
  "tip":        { slug:"tip-bill-splitter",         title:"Free Tip Calculator & Bill Splitter — Split Any Bill Instantly", desc:"Split restaurant bills evenly or by custom percentage. Calculate tip amounts for any bill size. Free tip and bill splitting tool." },
  "savings":    { slug:"savings-goal-calculator",   title:"Free Savings Goal Calculator — Plan Any Financial Goal",         desc:"Calculate how long it takes to reach a savings goal. Compare cash savings vs investing. AI financial strategy available. Free." },
  "bmi":        { slug:"bmi-calculator",            title:"Free BMI Calculator — Check Your Body Mass Index",               desc:"Calculate your Body Mass Index instantly. Supports metric and imperial. See your weight category and health range. Free tool." },
  /* Planning & Time */
  "deadline":   { slug:"deadline-countdown",        title:"Free Deadline Countdown Timer — Days & Hours to Any Date",       desc:"Count down to any deadline in days, hours, and minutes. Set a label, pin it to your screen, and never miss a deadline. Free." },
  "study":      { slug:"study-session-planner",     title:"Free Study Session Planner — Optimise Your Revision Time",      desc:"Plan your study sessions with Pomodoro or custom techniques. Set your exam date and build an optimised revision schedule. Free." },
  "citation":   { slug:"citation-formatter",        title:"Free Citation Formatter — APA, MLA & Chicago in One Click",     desc:"Format citations in APA, MLA, or Chicago style instantly. Auto-fill from a URL with AI. Supports books, websites, and journals. Free." },
  "pomodoro":   { slug:"pomodoro-timer",            title:"Free Pomodoro Timer — Stay Focused with Timed Work Sessions",   desc:"Use the Pomodoro technique to boost focus. 25-minute work sessions with short and long breaks. Track your sessions. Free." },
  /* Utilities */
  "unit":       { slug:"unit-converter",            title:"Free Unit Converter — Length, Weight, Temperature & More",      desc:"Convert between units instantly. Length, weight, temperature, speed, area, volume, data, and cooking measurements. Free." },
  "timezone":   { slug:"timezone-converter",        title:"Free Timezone Converter — Convert Times Across the World",      desc:"Convert times between 50+ cities worldwide. Find meeting overlaps across timezones. City converter and UTC reference table. Free." },
  "wordcount":  { slug:"word-counter",              title:"Free Word Counter — Words, Characters & Reading Time",           desc:"Count words, characters, sentences, and paragraphs instantly. See reading time, speaking time, and top keywords. Free." },
  "password":  { slug:"password-generator",    title:"Free Password Generator — Create Strong Secure Passwords",      desc:"Generate strong, secure passwords instantly. Customise length, uppercase, numbers and symbols. Free, no sign-up." },
  "currency":  { slug:"currency-converter",     title:"Free Currency Converter — Live Exchange Rates",                  desc:"Convert currencies with live exchange rates. 27 currencies supported including USD, EUR, GBP, JPY, ILS and more." },
  "loan":      { slug:"loan-calculator",         title:"Free Loan & Mortgage Calculator — Monthly Payments & Interest",  desc:"Calculate monthly loan payments, total interest and full repayment breakdown. Works for mortgages, car loans and personal loans." },
  "qr":         { slug:"qr-code-generator",         title:"Free QR Code Generator — Turn Any Link Into a QR Code",        desc:"Generate a scannable QR code for any URL or text instantly. Choose your size and download as PNG. Free, no sign-up needed." },
};

/* ── URL helpers ── */
function toolToSlug(toolId) {
  return TOOL_META[toolId]?.slug || toolId;
}
function slugToToolId(slug) {
  return Object.entries(TOOL_META).find(([,v]) => v.slug === slug)?.[0] || null;
}

/* ── SEO: FAQ structured data per tool ── */
const TOOL_FAQS = {
  "gpa": [
    { q: "How is GPA calculated?", a: "GPA is calculated by multiplying each course grade by its credit hours, summing those points, then dividing by total credit hours. An A is worth 4.0, B is 3.0, C is 2.0, D is 1.0, and F is 0." },
    { q: "What is a good GPA?", a: "A GPA of 3.5 or above is generally considered excellent. 3.0–3.49 is good standing. Below 2.0 may put you at academic risk depending on your institution." },
    { q: "What grade do I need to raise my GPA?", a: "Use the 'What grade do I need?' section of the calculator — enter your target GPA and next course credits and it will tell you the exact letter grade required." },
    { q: "Does GPA reset each semester?", a: "Your semester GPA resets each term, but your cumulative GPA includes all semesters. Use the Cumulative GPA tab to factor in your previous semesters." },
  ],
  "tip": [
    { q: "How do you calculate a tip?", a: "Multiply your bill by the tip percentage. For a 20% tip on a $50 bill: $50 × 0.20 = $10 tip, making the total $60." },
    { q: "What is the standard tip percentage?", a: "In the US, 15–20% is standard for restaurants. 18–20% is considered good service. 25% or more for exceptional service." },
    { q: "How do you split a bill evenly?", a: "Add up the total including tip, then divide by the number of people. Our tip splitter does this automatically — just enter the bill, tip %, and number of people." },
  ],
  "bmi": [
    { q: "What is BMI?", a: "BMI (Body Mass Index) is a measure of body fat based on height and weight. It is calculated by dividing weight in kg by height in metres squared." },
    { q: "What is a healthy BMI?", a: "A BMI between 18.5 and 24.9 is considered healthy. Under 18.5 is underweight, 25–29.9 is overweight, and 30 or above is obese." },
    { q: "Is BMI accurate?", a: "BMI is a useful screening tool but not a perfect measure. It doesn't account for muscle mass, age, or body composition. Consult a doctor for a full health assessment." },
  ],
  "rate": [
    { q: "How do I calculate my freelance hourly rate?", a: "Start with your target annual income, add 25–30% for taxes, then divide by your billable hours (typically 50–60% of working hours). Our calculator handles all these factors automatically." },
    { q: "What should a freelancer charge per hour?", a: "It depends on your skills, experience, and location. Use the calculator to find your minimum viable rate based on your actual expenses and desired income." },
    { q: "How many hours do freelancers bill per week?", a: "Most freelancers bill 20–25 hours per week out of a 40-hour work week. The rest goes to admin, sales, and non-billable tasks." },
  ],
  "unit": [
    { q: "How do you convert Celsius to Fahrenheit?", a: "Multiply the Celsius temperature by 9/5 (or 1.8) and add 32. For example, 20°C × 1.8 + 32 = 68°F. Use our unit converter for instant results." },
    { q: "How many centimeters in an inch?", a: "There are 2.54 centimeters in one inch. So 1 inch = 2.54 cm, and 1 cm = 0.3937 inches." },
    { q: "How do you convert kg to pounds?", a: "Multiply kilograms by 2.20462. For example, 70 kg × 2.20462 = 154.3 lbs. Our unit converter handles this and dozens of other unit conversions instantly." },
  ],
  "timezone": [
    { q: "How do I convert time zones?", a: "Find the UTC offset for both locations, calculate the difference, and apply it to your time. Our timezone converter does this instantly for 50+ cities worldwide." },
    { q: "What is UTC time?", a: "UTC (Coordinated Universal Time) is the global time standard. All time zones are defined as UTC plus or minus a certain number of hours." },
    { q: "How do I find a meeting time that works for multiple time zones?", a: "Use the Meeting Planner tab in our Timezone Converter. Add multiple cities and it will show you all time windows where everyone falls within working hours." },
  ],
  "wordcount": [
    { q: "How many words is a page?", a: "A standard double-spaced page contains roughly 250–300 words. Single-spaced pages contain about 500–600 words. This varies by font size and margins." },
    { q: "How long does it take to read 1000 words?", a: "At an average reading speed of 238 words per minute, 1000 words takes about 4 minutes to read. Our word counter shows reading time automatically." },
    { q: "How many words should a cover letter be?", a: "A cover letter should be 250–400 words — roughly one page. Concise and targeted performs better than lengthy explanations." },
  ],
  "pomodoro": [
    { q: "What is the Pomodoro Technique?", a: "The Pomodoro Technique is a time management method that breaks work into 25-minute focused sessions (pomodoros) separated by short 5-minute breaks. After 4 sessions, take a longer 15–30 minute break." },
    { q: "Does the Pomodoro Technique work?", a: "Research supports that structured work intervals reduce mental fatigue and improve focus. Many students and freelancers report higher productivity using the technique." },
    { q: "How many Pomodoros should I do per day?", a: "Most people aim for 8–12 pomodoros per day (4–6 hours of focused work). Quality focused sessions matter more than quantity." },
  ],
  "cover": [
    { q: "What should a cover letter include?", a: "A strong cover letter includes: a compelling opening, your relevant experience, specific achievements with numbers, why you want this role at this company, and a clear call to action." },
    { q: "How long should a cover letter be?", a: "A cover letter should be 3–4 short paragraphs, around 250–400 words. Hiring managers spend an average of 30 seconds reviewing it — keep it concise." },
    { q: "Can AI write a cover letter for me?", a: "Yes — our AI cover letter generator uses Claude Sonnet to write tailored cover letters based on your experience and the specific role. Free users get 3 generations per day." },
  ],
  "margin": [
    { q: "How do you calculate profit margin?", a: "Profit margin = (Revenue - Cost) / Revenue × 100. For example, if you sell something for $100 that costs $60 to make, your profit margin is 40%." },
    { q: "What is a good profit margin?", a: "It varies by industry. Retail typically targets 5–20%. SaaS businesses often aim for 60–80% gross margins. Services businesses can achieve 30–50%." },
    { q: "What is the difference between gross and net profit margin?", a: "Gross margin only subtracts cost of goods sold. Net margin subtracts all expenses including operating costs, taxes, and interest." },
  ],
  "breakeven": [
    { q: "What is a break-even point?", a: "The break-even point is the number of units you need to sell for your total revenue to equal your total costs — where you make neither profit nor loss." },
    { q: "How do you calculate break-even point?", a: "Break-even units = Fixed Costs / (Price per Unit - Variable Cost per Unit). Our calculator does this automatically once you enter your costs and price." },
    { q: "Why is break-even analysis important?", a: "It tells you the minimum sales volume needed to cover costs, helping you price products correctly and understand the viability of a business idea." },
  ],
  "qr": [
    { q: "What can a QR code link to?", a: "A QR code can link to any URL — websites, app downloads, contact cards, social profiles, menus, or any text. Our generator works with any URL or plain text." },
    { q: "How do I scan a QR code?", a: "Open your phone's camera app and point it at the QR code. On most modern smartphones this works automatically without a separate app." },
    { q: "Are QR codes free to generate?", a: "Yes — our QR code generator is completely free. No sign-up required. Generate as many QR codes as you need and download them as PNG files." },
  ],
  "password": [
    { q: "What makes a password strong?", a: "A strong password is at least 12 characters long and contains a mix of uppercase letters, lowercase letters, numbers, and symbols. Avoid common words, names, or sequences like 123456." },
    { q: "How long should a password be?", a: "Security experts recommend at least 12–16 characters. Longer is always better — a 20-character password is exponentially harder to crack than a 10-character one." },
    { q: "What are similar characters and why exclude them?", a: "Similar characters like i, I, 1, l, o, O, and 0 look alike and can cause confusion when reading or typing passwords. Excluding them makes passwords easier to read and type manually." },
    { q: "What is a memorable password?", a: "A memorable password combines random words with numbers and separators — like frost-eagle-solar-42. These are easier to remember than random strings but still very secure." },
    { q: "Is it safe to generate passwords in a browser?", a: "Yes — our password generator runs entirely in your browser. No passwords are ever sent to any server or stored anywhere. All generation happens locally on your device." },
  ],
  "currency": [
    { q: "How often are exchange rates updated?", a: "Our exchange rates are updated daily via the open.er-api.com API. For most purposes this is accurate enough — rates typically don't change dramatically hour to hour." },
    { q: "Which currencies are supported?", a: "We support 27 major currencies including USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, ILS, AED, and more. New currencies may be added over time." },
    { q: "Why is the exchange rate different from my bank?", a: "Banks and money transfer services add a markup (typically 1–5%) to the mid-market rate shown by currency converters. Our tool shows the real mid-market rate with no markup." },
    { q: "How do I convert multiple currencies at once?", a: "Select your base currency and amount, then change the target currency. The conversion updates instantly. Switch between different target currencies using the dropdown." },
  ],
  "loan": [
    { q: "How is a monthly loan payment calculated?", a: "Monthly payment = P × r(1+r)ⁿ / ((1+r)ⁿ-1), where P is the principal, r is the monthly interest rate, and n is the number of payments. Our calculator handles all of this automatically." },
    { q: "What is the difference between a loan and a mortgage?", a: "A mortgage is a specific type of loan secured against a property. The same monthly payment formula applies — our calculator works for both personal loans and mortgages." },
    { q: "How does interest rate affect monthly payments?", a: "A higher interest rate increases both your monthly payment and total interest paid significantly. Even a 1% difference on a large loan can mean thousands of dollars over the loan term." },
    { q: "What is total interest paid?", a: "Total interest is the difference between the total amount you repay and the original loan amount. Our calculator shows this clearly alongside your monthly payment." },
    { q: "Should I choose a shorter or longer loan term?", a: "A shorter term means higher monthly payments but much less total interest paid. A longer term means lower payments but significantly more interest over time. Use our calculator to compare both scenarios." },
  ],
};

function setToolMeta(tool) {
  const meta = TOOL_META[tool.id];
  if (!meta) return;
  const url = `https://toolforge.pro/tool/${meta.slug}`;
  const fullTitle = `${meta.title} | ToolForge`;

  // Title
  document.title = fullTitle;

  // Meta description
  let descEl = document.querySelector("meta[name='description']");
  if (descEl) descEl.setAttribute("content", meta.desc);

  // Canonical
  let canon = document.querySelector("link[rel='canonical']");
  if (canon) canon.setAttribute("href", url);

  // Open Graph
  let ogTitle = document.querySelector("meta[property='og:title']");
  if (ogTitle) ogTitle.setAttribute("content", fullTitle);
  let ogDesc = document.querySelector("meta[property='og:description']");
  if (ogDesc) ogDesc.setAttribute("content", meta.desc);
  let ogUrl = document.querySelector("meta[property='og:url']");
  if (ogUrl) ogUrl.setAttribute("content", url);

  // Twitter
  let twTitle = document.querySelector("meta[name='twitter:title']");
  if (twTitle) twTitle.setAttribute("content", fullTitle);
  let twDesc = document.querySelector("meta[name='twitter:description']");
  if (twDesc) twDesc.setAttribute("content", meta.desc);
  let twUrl = document.querySelector("meta[name='twitter:url']");
  if (twUrl) twUrl.setAttribute("content", url);

  // Schema.org structured data (JSON-LD)
  const isAI = ["summarize","resume","cover","linkedin","cold","proposal","invoice","tagline","essay","email","salary","savings","citation"].includes(tool.id);
  const isFree = !["resume","cover","linkedin","cold","proposal","invoice","tagline","essay","email","salary","savings","citation","summarize"].includes(tool.id);
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": meta.title.split(" — ")[0].replace(" | ToolForge",""),
    "description": meta.desc,
    "url": url,
    "applicationCategory": isAI ? "AIApplication" : "UtilitiesApplication",
    "operatingSystem": "Web",
    "offers": isFree
      ? { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      : {
          "@type": "AggregateOffer",
          "lowPrice": "0",
          "highPrice": "7.99",
          "priceCurrency": "USD",
          "offerCount": "3"
        },
    "featureList": meta.desc,
    "provider": {
      "@type": "Organization",
      "name": "ToolForge",
      "url": "https://toolforge.pro"
    }
  };

  // FAQ schema (if available for this tool)
  const faqs = TOOL_FAQS[tool.id];
  const schemaArray = [schema];
  if (faqs && faqs.length > 0) {
    schemaArray.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    });
  }

  let schemaEl = document.getElementById("tf-schema");
  if (!schemaEl) {
    schemaEl = document.createElement("script");
    schemaEl.id = "tf-schema";
    schemaEl.type = "application/ld+json";
    document.head.appendChild(schemaEl);
  }
  schemaEl.textContent = JSON.stringify(schemaArray.length === 1 ? schemaArray[0] : schemaArray);
}
function resetMeta() {
  const defaultTitle = "ToolForge — 30 Free Tools For Freelancers, Students & Small Business";
  const defaultDesc  = "Free online tools for freelancers, students, job seekers and small businesses. AI cover letters, hourly rate calculator, GPA calculator, timezone converter and more. No sign-up needed.";
  const defaultUrl   = "https://toolforge.pro";

  document.title = defaultTitle;

  let desc = document.querySelector("meta[name='description']");
  if (desc) desc.setAttribute("content", defaultDesc);
  let canon = document.querySelector("link[rel='canonical']");
  if (canon) canon.setAttribute("href", defaultUrl);

  // OG
  let ogTitle = document.querySelector("meta[property='og:title']");
  if (ogTitle) ogTitle.setAttribute("content", defaultTitle);
  let ogDesc = document.querySelector("meta[property='og:description']");
  if (ogDesc) ogDesc.setAttribute("content", defaultDesc);
  let ogUrl = document.querySelector("meta[property='og:url']");
  if (ogUrl) ogUrl.setAttribute("content", defaultUrl);

  // Twitter
  let twTitle = document.querySelector("meta[name='twitter:title']");
  if (twTitle) twTitle.setAttribute("content", defaultTitle);
  let twDesc = document.querySelector("meta[name='twitter:description']");
  if (twDesc) twDesc.setAttribute("content", defaultDesc);
  let twUrl = document.querySelector("meta[name='twitter:url']");
  if (twUrl) twUrl.setAttribute("content", defaultUrl);

  // Remove per-tool schema, inject homepage schema
  const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ToolForge",
    "url": "https://toolforge.pro",
    "description": defaultDesc,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://toolforge.pro/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  let schemaEl = document.getElementById("tf-schema");
  if (!schemaEl) {
    schemaEl = document.createElement("script");
    schemaEl.id = "tf-schema";
    schemaEl.type = "application/ld+json";
    document.head.appendChild(schemaEl);
  }
  schemaEl.textContent = JSON.stringify(homepageSchema);
}



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
      case "password":  return <PasswordGenerator />;
      case "currency":  return <CurrencyConverter />;
      case "loan":      return <LoanCalculator />;
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

function ToolCard({ tool, onClick, TH: th }) {
  const theme = th || T;
  const isAI = AI_TOOLS.includes(tool.name);
  const stripeClass = { writing:"tf-stripe-writing", calculators:"tf-stripe-calc", planning:"tf-stripe-planning", utilities:"tf-stripe-utils" }[tool.catId] || "tf-stripe-writing";
  return (
    <div onClick={onClick} className="tf-card tf-fade-up"
      style={{ padding:"17px 15px 15px", borderRadius:14, border:`1px solid ${theme.border}`, background:theme.card, cursor:"pointer", boxShadow:theme.shadowSm }}>
      <div className={stripeClass} style={{ position:"absolute", top:0, left:0, right:0, height:3.5, borderRadius:"14px 14px 0 0" }} />
      <div style={{ fontSize:24, marginBottom:11, marginTop:3 }}>{tool.icon}</div>
      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:theme.ink, marginBottom:4, lineHeight:1.3, letterSpacing:"-0.1px" }}>{tool.name}</div>
      <div style={{ fontSize:11, color:theme.muted, lineHeight:1.55, marginBottom:isAI?9:0 }}>{tool.desc}</div>
      {isAI && (
        <span style={{ fontSize:9, padding:"3px 8px", borderRadius:5, background:theme.goldDim, color:theme.gold, border:`1px solid ${theme.goldBrd}`, fontFamily:"Inter, sans-serif", fontWeight:700, letterSpacing:"0.05em", display:"inline-block" }}>
          ✦ AI POWERED
        </span>
      )}
    </div>
  );
}

/* ── Modals & pages ── */
function UpgradeModal({ onClose, proToken, thm }) {
  if (!thm) thm = T;
  const onetimeUrl = import.meta.env.VITE_LS_ONETIME_URL || "#";
  const proUrl     = import.meta.env.VITE_LS_PRO_URL     || "#";
  const topupUrl   = import.meta.env.VITE_LS_TOPUP_URL   || "#";

  // Subscriber state
  const isPro     = proToken?.type === "pro";
  const isPack    = proToken?.type === "pack" || (proToken && !isPro);
  const hasToken  = !!proToken;

  // Title / subtitle adapt to context
  const title    = hasToken ? "Top up your balance" : "Unlock Claude Sonnet AI ✦";
  const subtitle = hasToken
    ? `You have ${proToken.generations_left} generation${proToken.generations_left !== 1 ? "s" : ""} left`
    : "Claude produces noticeably better cover letters, proposals, and emails — polished enough to send to real clients.";

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16 }} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:thm.card, borderRadius:20, padding:24, width:"100%", maxWidth:440, boxShadow:"0 -8px 48px rgba(0,0,0,0.3)", border:`1px solid ${thm.border2}` }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:thm.ink }}>{title}</div>
            <div style={{ fontSize:12, color:thm.muted, fontFamily:"DM Sans, sans-serif", marginTop:3, lineHeight:1.5 }}>{subtitle}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:thm.muted, marginLeft:12, flexShrink:0 }}>✕</button>
        </div>

        {/* Top-Up — ONLY for existing subscribers (pro or pack) */}
        {hasToken && (
          <a href={topupUrl} style={{ textDecoration:"none", display:"block", marginBottom:10 }}>
            <div style={{ padding:16, borderRadius:14, border:`2px solid ${thm.green}`, background:thm.greenDim, cursor:"pointer", position:"relative" }}>
              <div style={{ position:"absolute", top:-10, right:12, fontSize:9, padding:"3px 9px", borderRadius:99, background:T.green, color:"white", fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>REFILL</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:thm.green }}>Top-Up Pack</div>
                <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:thm.green }}>$2.99</div>
              </div>
              <div style={{ fontSize:12, color:thm.green, fontFamily:"DM Sans, sans-serif" }}>+100 Claude generations · Added to your current balance instantly</div>
            </div>
          </a>
        )}

        {/* One-Time Pack — only for non-subscribers */}
        {!hasToken && (
          <a href={onetimeUrl} style={{ textDecoration:"none", display:"block", marginBottom:10 }}>
            <div style={{ padding:16, borderRadius:14, border:`2px solid ${thm.accent}`, background:thm.accentDim, cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:thm.accent }}>One-Time Pack</div>
                <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:thm.accent }}>$2.99</div>
              </div>
              <div style={{ fontSize:12, color:thm.accent, fontFamily:"DM Sans, sans-serif" }}>50 Claude generations · Never expires · No subscription</div>
            </div>
          </a>
        )}

        {/* Pro Monthly — only for non-pro users */}
        {!isPro && (
          <a href={proUrl} style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
            <div style={{ padding:16, borderRadius:14, border:`2px solid ${thm.gold}`, background:thm.goldDim, cursor:"pointer", position:"relative" }}>
              <div style={{ position:"absolute", top:-10, right:12, fontSize:9, padding:"3px 9px", borderRadius:99, background:T.gold, color:"white", fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>BEST VALUE</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, color:thm.gold }}>Pro Monthly</div>
                <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:thm.gold }}>$7.99<span style={{ fontSize:12, fontWeight:400 }}>/mo</span></div>
              </div>
              <div style={{ fontSize:12, color:thm.gold, fontFamily:"DM Sans, sans-serif" }}>400 Claude generations/month · No ads · Cancel anytime</div>
            </div>
          </a>
        )}

        {/* Restore hint — only for non-subscribers */}
        {!hasToken && (
          <div style={{ marginBottom:12, padding:"10px 12px", borderRadius:8, background:thm.bg2, border:`1px solid ${thm.border2}`, fontSize:11, color:thm.ink2||thm.muted, fontFamily:"DM Sans, sans-serif", lineHeight:1.6 }}>
            💡 <strong>Already purchased?</strong> Click "Restore Access" on the home screen and enter your purchase email.
          </div>
        )}

        <div style={{ textAlign:"center", fontSize:11, color:thm.muted, fontFamily:"DM Sans, sans-serif" }}>Secure payment via Lemon Squeezy · Activated instantly</div>
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

function Footer({ onFaq, onTos, onRefund, onPricing, TH: th }) {
  const theme = th || T;
  return (
    <div style={{ borderTop:`1px solid ${theme.border}`, padding:"20px 20px", background:theme.card, textAlign:"center" }}>
      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:14, color:theme.ink, marginBottom:6 }}>Tool<span style={{ color:theme.accent }}>Forge</span></div>
      <div style={{ fontSize:11, color:theme.muted, fontFamily:"DM Sans, sans-serif", marginBottom:12 }}>Free tools for freelancers, students & small businesses.</div>
      <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
        <span onClick={onFaq}    style={{ fontSize:11, color:theme.accent, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>FAQ & About</span>
        <span onClick={onPricing} style={{ fontSize:11, color:theme.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Pricing</span>
        <span onClick={onTos}    style={{ fontSize:11, color:theme.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Terms of Service</span>
        <span onClick={onRefund} style={{ fontSize:11, color:theme.muted, fontFamily:"DM Sans, sans-serif", cursor:"pointer", textDecoration:"underline" }}>Refund Policy</span>
      </div>
      <div style={{ marginTop:16, marginBottom:4 }}>
        <a href="https://www.saashub.com/toolforge?utm_source=badge&utm_campaign=badge&utm_content=toolforge&badge_kind=approved" target="_blank" rel="noopener noreferrer">
          <img src={theme.bg === T.bg ? "https://cdn-b.saashub.com/img/badges/approved-color.png?v=1" : "https://cdn-b.saashub.com/img/badges/approved-dark.png?v=1"} alt="Approved on SaaSHub" style={{ maxWidth:110, opacity:0.85, transition:"opacity 0.2s" }} onMouseOver={e=>e.target.style.opacity=1} onMouseOut={e=>e.target.style.opacity=0.85} />
        </a>
      </div>
      <div style={{ fontSize:10, color:theme.muted, fontFamily:"DM Sans, sans-serif", marginTop:8 }}>© {new Date().getFullYear()} ToolForge · Made with ☕</div>
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
  { q:"How many tools are there and will more be added?", a:"There are currently 30 tools and we add more regularly. Tools span AI writing, calculators, planning, utilities and more. There's also a fun Take a Break games section!" },
  { q:"What payment methods are accepted?", a:"All major credit and debit cards are accepted via Lemon Squeezy, our payment provider. Payments are secure and encrypted." },
  { q:"Can I cancel my Pro subscription?", a:"Yes, anytime. Log into your Lemon Squeezy customer portal (link in your receipt email) and cancel with one click. You keep access until the end of your billing period." },
  { q:"Will there be ads on ToolForge?", a:"Not right now. The site is funded by the paid AI plans. If ads are ever introduced in the future, they'll be minimal and non-intrusive." },
];

function FAQPage({ onBack, onTos, onRefund, proToken, thm }) {
  const th = thm || T;
  const [open, setOpen] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:th.bg, fontFamily:"Inter, sans-serif" }}>
      {/* Nav bar */}
      <div style={{ height:52, background:th.card, borderBottom:`1px solid ${th.border}`, display:"flex", alignItems:"center", padding:"0 20px", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, boxShadow:th.shadow }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:th.accent, fontFamily:"Inter, sans-serif", fontWeight:600, fontSize:13, cursor:"pointer", padding:0 }}>← Back</button>
        <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:15, color:th.ink }}>FAQ & About</span>
        <div style={{ width:60 }} />
      </div>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 20px 48px" }}>
        {/* About card */}
        <div style={{ marginBottom:24, padding:20, borderRadius:14, background:th.card, border:`1px solid ${th.border}`, boxShadow:th.shadow }}>
          <div style={{ fontSize:10, fontWeight:600, color:th.accent, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>✦ About ToolForge</div>
          <div style={{ fontSize:13, color:th.muted, lineHeight:1.75 }}>ToolForge was built to give freelancers, students, job seekers and small business owners access to powerful tools — for free. No accounts, no paywalls on the essentials, no bloat.<br /><br />AI-powered tools use Groq (free, fast) or Claude Sonnet AI (premium, higher quality). New tools are added every week.</div>
        </div>
        {/* FAQ items */}
        <div style={{ fontSize:11, fontWeight:600, color:th.muted, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:12 }}>Frequently Asked Questions</div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} onClick={() => setOpen(open===i?null:i)}
            style={{ marginBottom:6, borderRadius:11, border:`1px solid ${open===i?th.accent:th.border}`, background:th.card, overflow:"hidden", cursor:"pointer", transition:"border-color 0.15s", boxShadow:th.shadowSm }}>
            <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div style={{ fontFamily:"Inter, sans-serif", fontWeight:600, fontSize:13, color:th.ink, lineHeight:1.4 }}>{item.q}</div>
              <span style={{ fontSize:14, color:th.muted, flexShrink:0, transform:open===i?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
            </div>
            {open===i && <div style={{ padding:"0 16px 14px", paddingTop:0, fontSize:12, color:th.muted, lineHeight:1.75, borderTop:`1px solid ${th.border}` }}>{item.a}</div>}
          </div>
        ))}
        {/* Pricing CTA */}
        <div style={{ marginTop:24, padding:"14px 18px", borderRadius:12, background:th.goldDim, border:`1px solid ${th.gold}`, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }} onClick={() => setShowUpgrade(true)}>
          <div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:th.gold }}>✦ Upgrade to Claude Sonnet AI</div>
            <div style={{ fontSize:11, color:th.gold, opacity:0.75, marginTop:2 }}>Plans from $2.99 · No subscription required</div>
          </div>
          <span style={{ fontSize:16, color:th.gold }}>→</span>
        </div>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} proToken={proToken} thm={th} />}
    </div>
  );
}

function TosPage({ onBack, onFaq, onRefund, proToken, thm }) {
  const th = thm || T;
  const [showUpgrade, setShowUpgrade] = useState(false);
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
    <div style={{ minHeight:"100vh", background:th.bg, fontFamily:"Inter, sans-serif" }}>
      <div style={{ height:52, background:th.card, borderBottom:`1px solid ${th.border}`, display:"flex", alignItems:"center", padding:"0 20px", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, boxShadow:th.shadow }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:th.accent, fontFamily:"Inter, sans-serif", fontWeight:600, fontSize:13, cursor:"pointer", padding:0 }}>← Back</button>
        <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:15, color:th.ink }}>Terms of Service</span>
        <div style={{ width:60 }} />
      </div>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 20px 48px" }}>
        <div style={{ fontSize:11, color:th.muted, marginBottom:20 }}>Last updated: March 2025</div>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom:8, padding:"14px 16px", borderRadius:11, background:th.card, border:`1px solid ${th.border}`, boxShadow:th.shadowSm }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:th.ink, marginBottom:5 }}>{s.title}</div>
            <div style={{ fontSize:12, color:th.muted, lineHeight:1.75 }}>{s.body}</div>
          </div>
        ))}
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} proToken={proToken} thm={th} />}
    </div>
  );
}

function RefundPage({ onBack, onFaq, onTos, proToken, thm }) {
  const th = thm || T;
  const [showUpgrade, setShowUpgrade] = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:th.bg, fontFamily:"Inter, sans-serif" }}>
      <div style={{ height:52, background:th.card, borderBottom:`1px solid ${th.border}`, display:"flex", alignItems:"center", padding:"0 20px", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, boxShadow:th.shadow }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:th.accent, fontFamily:"Inter, sans-serif", fontWeight:600, fontSize:13, cursor:"pointer", padding:0 }}>← Back</button>
        <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:15, color:th.ink }}>Refund Policy</span>
        <div style={{ width:60 }} />
      </div>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 20px 48px" }}>
        <div style={{ fontSize:11, color:th.muted, marginBottom:20 }}>Last updated: March 2025</div>
        {[
          { title:"Eligibility", body:"Refunds are available within 3 days of purchase, provided that no AI generations have been used from the purchased pack or plan." },
          { title:"Non-Refundable", body:"Once any AI generation has been used, or after 3 days have passed since purchase, the transaction is non-refundable." },
          { title:"Subscriptions", body:"Pro Monthly subscriptions can be cancelled at any time via your Lemon Squeezy customer portal. Cancellation stops future charges but does not refund the current billing period." },
          { title:"How to Request a Refund", body:"To request a refund, email us at toolforgesupport@gmail.com and include:\n• Your purchase email address\n• Your order ID (found in your Lemon Squeezy receipt email)\n\nWe will verify your eligibility and process approved refunds within 3 business days." },
          { title:"Questions", body:"If you have any questions about this policy, contact us at toolforgesupport@gmail.com." },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom:8, padding:"14px 16px", borderRadius:11, background:th.card, border:`1px solid ${th.border}`, boxShadow:th.shadowSm }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:th.ink, marginBottom:5 }}>{s.title}</div>
            <div style={{ fontSize:12, color:th.muted, lineHeight:1.75, whiteSpace:"pre-line" }}>{s.body}</div>
          </div>
        ))}
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} proToken={proToken} thm={th} />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
export default function ToolForge() {
  const [activeCat, setActiveCat]       = useState("all");
  const [activeTool, setActiveTool]     = useState(() => {
    const m = window.location.pathname.match(/^\/tool\/(.+)$/);
    if (!m) return null;
    const id = slugToToolId(m[1]);
    return id ? (ALL_TOOLS.find(t => t.id === id) || null) : null;
  });
  const [showGames, setShowGames]       = useState(false);
  const [search, setSearch]             = useState("");
  const [showUpgrade, setShowUpgrade]   = useState(false);
  const [showDrawer, setShowDrawer]     = useState(false);
  const [collapsed, setCollapsed]       = useState({});
  const [showFaq, setShowFaq]           = useState(window.location.pathname === "/faq");
  const [showTos, setShowTos]           = useState(window.location.pathname === "/terms");
  const [showRefund, setShowRefund]     = useState(window.location.pathname === "/refund");
  const [proToken, setProToken]         = useState(() => { try { const s = localStorage.getItem("tf_pro_token"); return s ? JSON.parse(s) : null; } catch { return null; } });

  /* ── Dark mode ── */
  const [isDark, setIsDark] = useState(() => { try { return localStorage.getItem("tf_dark") === "1"; } catch { return false; } });
  const toggleDark = () => setIsDark(d => {
    const n = !d;
    try { localStorage.setItem("tf_dark", n ? "1" : "0"); } catch {}
    document.body.classList.toggle("dark", n);
    return n;
  });
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

  const makeDrag = (getW, setW, min, max) => (e) => {
    e.preventDefault();
    const sx = e.clientX; const sw = getW();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = (ev) => setW(Math.max(min, Math.min(max, sw + ev.clientX - sx)));
    const up   = () => { document.body.style.cursor = ""; document.body.style.userSelect = ""; document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

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
  useEffect(() => {
    injectFonts();
    injectStyles();
    if (isDark) document.body.classList.add("dark");
    // Inject homepage schema on first load (if not opening a tool directly)
    if (!window.location.pathname.startsWith("/tool/")) resetMeta();
    // Handle browser back/forward
    const onPop = () => {
      const m = window.location.pathname.match(/^\/tool\/(.+)$/);
      if (m) {
        const id = slugToToolId(m[1]);
        const t = id ? ALL_TOOLS.find(x => x.id === id) : null;
        if (t) { setActiveTool(t); setToolMeta(t); return; }
      }
      if (window.location.pathname === "/faq")    { setShowFaq(true); setActiveTool(null); return; }
      if (window.location.pathname === "/terms")  { setShowTos(true); setActiveTool(null); return; }
      if (window.location.pathname === "/refund") { setShowRefund(true); setActiveTool(null); return; }
      setActiveTool(null);
      setShowFaq(false); setShowTos(false); setShowRefund(false);
      resetMeta();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* ── URL + meta sync when tool opens/closes ── */
  useEffect(() => {
    if (activeTool) {
      const slug = toolToSlug(activeTool.id);
      const target = `/tool/${slug}`;
      if (window.location.pathname !== target) window.history.pushState({}, "", target);
      setToolMeta(activeTool);
    } else {
      if (!showFaq && !showTos && !showRefund) {
        if (window.location.pathname !== "/") window.history.pushState({}, "", "/");
        resetMeta();
      }
    }
  }, [activeTool]);
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  /* ── Special pages ── */
  if (orderId) return <SuccessPage orderId={orderId} onDone={() => { window.history.replaceState({},"","/"); try { const s=localStorage.getItem("tf_pro_token"); if(s) setProToken(JSON.parse(s)); } catch {} window.location.reload(); }} />;
  if (showFaq)    return <FAQPage    onBack={() => { setShowFaq(false);    window.history.pushState({},"","/"); }} onTos={() => { setShowFaq(false); setShowTos(true); }} onRefund={() => { setShowFaq(false); setShowRefund(true); }} proToken={proToken} thm={TH} />;
  if (showTos)    return <TosPage    onBack={() => { setShowTos(false);    window.history.pushState({},"","/"); }} onFaq={() => { setShowTos(false); setShowFaq(true); }} onRefund={() => { setShowTos(false); setShowRefund(true); }} proToken={proToken} thm={TH} />;
  if (showRefund) return <RefundPage onBack={() => { setShowRefund(false); window.history.pushState({},"","/"); }} onFaq={() => { setShowRefund(false); setShowFaq(true); }} onTos={() => { setShowRefund(false); setShowTos(true); }} proToken={proToken} thm={TH} />;

  /* ── Dark toggle button ── */
  const DarkToggle = () => (
    <button onClick={toggleDark} title={isDark ? "Light mode" : "Dark mode"} className="tf-btn"
      style={{ width:32, height:32, borderRadius:8, border:`1px solid ${TH.border2}`, background:TH.bg2, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", color:TH.muted, transition:"all 0.14s" }}>
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


    /* ── Collapse thresholds ── */
    const SIDE_ICON = sideW < 100;  // sidebar icon-only
    const MID_ICON  = midW  < 100;  // middle icon-only
    const MID_SLIM  = midW  < 160;  // middle icon+name, no desc

    const rightContent = () => {
      if (!activeTool) return (
        <div className="tf-fade-in" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:48, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16, opacity:0.12, color:TH.accent, animation:"tf-float 4s ease infinite", fontFamily:"Syne, sans-serif", fontWeight:800 }}>✦</div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:18, color:TH.ink, marginBottom:8, letterSpacing:"-0.2px" }}>Select a tool</div>
          <div style={{ fontSize:13, color:TH.muted, maxWidth:240, lineHeight:1.65, fontFamily:"Inter, sans-serif" }}>Choose anything from the list to get started.</div>
        </div>
      );
      return <div style={{ padding:24, overflowY:"auto", flex:1 }}><ToolView tool={activeTool} hideBack onBack={() => setActiveTool(null)} proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} pomoProps={pomoProps} dlProps={dlProps} /></div>;
    };

    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:TH.bg, fontFamily:"DM Sans, sans-serif", overflow:"hidden" }}>

        {/* Nav */}
        <div className="tf-glass" style={{ borderBottom:`1px solid ${TH.border}55`, padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, zIndex:50, position:"sticky", top:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:16, color:TH.ink }}>Tool<span style={{ color:TH.accent }}>Forge</span></span>
            <span style={{ background:TH.accentDim, color:TH.accent, fontSize:9, padding:"2px 8px", borderRadius:5, fontFamily:"Syne, sans-serif", fontWeight:700 }}>{ALL_TOOLS.length} FREE TOOLS</span>
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span onClick={() => { setShowFaq(true); window.history.pushState({},"","/faq"); }} style={{ fontSize:11, color:TH.muted, cursor:"pointer", fontFamily:"Inter, sans-serif", fontWeight:400 }}>FAQ</span>
            <span onClick={() => setShowUpgrade(true)} style={{ fontSize:11, color:TH.muted, cursor:"pointer", fontFamily:"Inter, sans-serif", fontWeight:400 }}>Pricing</span>
            <span onClick={() => { setShowTos(true); window.history.pushState({},"","/terms"); }} style={{ fontSize:11, color:TH.muted, cursor:"pointer", fontFamily:"Inter, sans-serif", fontWeight:400 }}>Terms</span>
            <span onClick={() => { setShowRefund(true); window.history.pushState({},"","/refund"); }} style={{ fontSize:11, color:TH.muted, cursor:"pointer", fontFamily:"Inter, sans-serif", fontWeight:400 }}>Refund</span>
            <a href="https://www.saashub.com/toolforge?utm_source=badge&utm_campaign=badge&utm_content=toolforge&badge_kind=approved" target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center" }}>
              <img src={isDark ? "https://cdn-b.saashub.com/img/badges/approved-dark.png?v=1" : "https://cdn-b.saashub.com/img/badges/approved-color.png?v=1"} alt="Approved on SaaSHub" style={{ height:22, opacity:0.8, transition:"opacity 0.2s" }} onMouseOver={e=>e.target.style.opacity=1} onMouseOut={e=>e.target.style.opacity=0.8} />
            </a>
            <DarkToggle />
            {proToken && proToken.generations_left > 0
              ? <div style={{ background:TH.goldDim, border:`1px solid ${TH.gold}`, borderRadius:8, padding:"4px 11px", fontSize:10, color:TH.gold, fontFamily:"Syne, sans-serif", fontWeight:700 }}>✦ {proToken.generations_left} left</div>
              : <button onClick={() => setShowUpgrade(true)} style={{ background:TH.accent, color:"white", fontSize:11, padding:"5px 13px", borderRadius:8, border:"none", fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>✦ Upgrade</button>
            }
          </div>
        </div>

        {/* ── Desktop Hero ── */}
        <div className="tf-hero-wrap" style={{ background:TH.card, borderBottom:`1px solid ${TH.border}`, padding:"26px 24px 20px", flexShrink:0, boxShadow:TH.shadowSm }}>
          <div className="tf-hero-gl1"></div>
          <div className="tf-hero-gl2"></div>
          <div style={{ position:"relative" }}>
            <div className="tf-eyebrow" style={{ fontSize:10, fontWeight:600, color:TH.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8, display:"flex", alignItems:"center" }}>
              Free · No sign-up · AI-powered
            </div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:24, color:TH.ink, letterSpacing:"-0.5px", marginBottom:5 }}>
              Every tool you need, <span style={{ color:TH.accent }}>right here.</span>
            </div>
            <div style={{ fontSize:13, color:TH.muted, lineHeight:1.6, marginBottom:14, maxWidth:500 }}>
              30 free tools for freelancers, students & small businesses.
            </div>
            {/* Desktop search */}
            <div className="tf-search" style={{ display:"flex", alignItems:"center", gap:10, background:TH.bg2, border:`1.5px solid ${TH.border2}`, borderRadius:10, padding:"10px 14px", maxWidth:420 }}>
              <span style={{ fontSize:14, color:TH.hint, flexShrink:0 }}>⌕</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or describe what you need…"
                className="tf-input" style={{ ...inputStyle, background:"transparent", border:"none", padding:0, fontSize:13, color:TH.ink, boxShadow:"none" }} />

            </div>
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
                    className="tf-game" style={{ borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
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
          <div onMouseDown={makeDrag(() => sideWRef.current, setSideW, 48, 300)}
            onMouseEnter={e=>e.currentTarget.style.background=TH.border2} onMouseLeave={e=>e.currentTarget.style.background=TH.border}
            style={{ width:6, flexShrink:0, background:TH.border, cursor:"col-resize", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s", zIndex:10 }}>
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
                const isCatCollapsed = collapsed[cat.id];
                return (
                  <div key={cat.id} style={{ marginBottom:14 }}>
                    {!MID_SLIM && (
                      <div onClick={() => setCollapsed(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 8px", marginBottom:isCatCollapsed?0:5, borderRadius:7, background:cat.colorDim, border:`1px solid ${cat.color}22`, cursor:"pointer", userSelect:"none" }}>
                        <span style={{ fontSize:12 }}>{cat.icon}</span>
                        <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:10, color:cat.color, flex:1 }}>{cat.label}</span>
                        <span style={{ fontSize:9, color:cat.color, opacity:0.6 }}>{catTools.length}</span>
                        <span style={{ fontSize:10, color:cat.color, opacity:0.6, transform:isCatCollapsed?"rotate(-90deg)":"rotate(0deg)", transition:"transform 0.18s", display:"inline-block" }}>▾</span>
                      </div>
                    )}
                    {MID_SLIM && (
                      <div onClick={() => setCollapsed(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                        style={{ padding:"3px 6px", marginBottom:isCatCollapsed?0:4, fontSize:10, color:cat.color, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.4, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span>{cat.icon} {cat.label}</span>
                        <span style={{ transform:isCatCollapsed?"rotate(-90deg)":"rotate(0deg)", transition:"transform 0.18s", display:"inline-block", opacity:0.6 }}>▾</span>
                      </div>
                    )}
                    {!isCatCollapsed && catTools.map(tool => (
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
          <div onMouseDown={makeDrag(() => midWRef.current, setMidW, 52, 340)}
            onMouseEnter={e=>e.currentTarget.style.background=TH.border2} onMouseLeave={e=>e.currentTarget.style.background=TH.border}
            style={{ width:6, flexShrink:0, background:TH.border, cursor:"col-resize", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s", zIndex:10 }}>
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
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} proToken={proToken} thm={TH} />}
      </div>
    );
  }

  /* ══════════════════════════════════
     MOBILE
  ══════════════════════════════════ */
  const mobileGrid = { display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 };

  if (showGames) return (
    <>
      <div style={{ maxWidth:480, margin:"0 auto", padding:20, background:TH.bg, minHeight:"100vh" }}>
        <div style={{ background:TH.card, borderRadius:16, padding:20, border:`1px solid ${TH.border}` }}>
          <GamesSection proToken={proToken} onNeedUpgrade={() => setShowUpgrade(true)} onTokenUpdate={handleTokenUpdate} onBack={() => setShowGames(false)} />
        </div>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} proToken={proToken} thm={TH} />}
      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={toolId => { setShowGames(false); setActiveTool(ALL_TOOLS.find(t=>t.id===toolId)); }} />
    </>
  );

  if (activeTool) return (
    <>
      <div style={{ maxWidth:480, margin:"0 auto", padding:20, background:TH.bg, minHeight:"100vh" }}>
        <div className="tf-pop" style={{ background:TH.card, borderRadius:16, padding:22, border:`1px solid ${TH.border2}`, boxShadow:TH.shadow }}>
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
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} proToken={proToken} thm={TH} />}
    </>
  );

  const filtered = ALL_TOOLS.filter(t =>
    (activeCat==="all" || t.catId===activeCat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {!proToken && (
        <div onClick={() => setShowUpgrade(true)} className="tf-upgrade" style={{ position:"sticky", top:0, zIndex:100, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:"white" }}>✦ Unlock Claude Sonnet AI — from $2.99</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.85)", fontFamily:"DM Sans, sans-serif", whiteSpace:"nowrap" }}>Better outputs →</div>
        </div>
      )}

      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:TH.bg, fontFamily:"DM Sans, sans-serif" }}>

        {/* Mobile header */}
        {/* ── Mobile Nav ── */}
        <div className={isDark ? "tf-nav-dark" : "tf-nav"}
          style={{ height:52, borderBottom:`1px solid ${TH.border2}`, display:"flex", alignItems:"center", padding:"0 16px", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:TH.shadowSm }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:17, color:TH.ink, letterSpacing:"-0.2px" }}>
              Tool<span style={{ color:TH.accent }}>Forge</span>
            </span>
            <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:4, background:TH.accentDim, color:TH.accent, letterSpacing:"0.05em" }}>{ALL_TOOLS.length} FREE</span>
          </div>
          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
            <DarkToggle />
            {proToken && proToken.generations_left > 0
              ? <div style={{ background:TH.goldDim, border:`1px solid ${TH.goldBrd}`, borderRadius:7, padding:"4px 9px", fontSize:10, color:TH.gold, fontFamily:"Syne, sans-serif", fontWeight:700 }}>✦ {proToken.generations_left}</div>
              : <button onClick={() => setShowUpgrade(true)} className="tf-btn tf-cta" style={{ background:TH.accent, color:"white", fontSize:11, padding:"6px 12px", borderRadius:7, border:"none", fontFamily:"Inter, sans-serif", fontWeight:600, cursor:"pointer" }}>✦ Upgrade</button>
            }
            {/* Hamburger */}
            <button onClick={() => setShowDrawer(d => !d)} className="tf-btn"
              style={{ width:34, height:34, borderRadius:8, border:`1.5px solid ${TH.border2}`, background:showDrawer ? TH.accentDim : TH.bg3, color:showDrawer ? TH.accent : TH.ink, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, letterSpacing:1, transition:"all 0.15s" }}>
              ☰
            </button>
          </div>
          {/* Drawer */}
          <div className={`tf-drawer${showDrawer ? " open" : ""}`}
            style={{ position:"absolute", top:52, left:0, right:0, background:TH.card, borderBottom:`1px solid ${TH.border2}`, zIndex:60, boxShadow:TH.shadow }}>
            {[
              { label:"FAQ & About", sub:"Everything about ToolForge", ico:"❓", bg:TH.accentDim, action:() => { setShowFaq(true); window.history.pushState({},"","/faq"); setShowDrawer(false); } },
              { label:"Pricing", sub:"Plans from $2.99", ico:"✦", bg:TH.goldDim, action:() => { setShowUpgrade(true); setShowDrawer(false); } },
              { label:"Terms of Service", ico:"📄", bg:TH.bg2, action:() => { setShowTos(true); window.history.pushState({},"","/terms"); setShowDrawer(false); } },
              { label:"Refund Policy", ico:"↩", bg:TH.bg2, action:() => { setShowRefund(true); window.history.pushState({},"","/refund"); setShowDrawer(false); } },
            ].map((item, i) => (
              <div key={i} onClick={item.action}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 18px", borderBottom:`1px solid ${TH.border}`, cursor:"pointer" }}>
                <div style={{ width:30, height:30, borderRadius:8, background:item.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{item.ico}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:TH.ink, fontFamily:"Inter, sans-serif" }}>{item.label}</div>
                  {item.sub && <div style={{ fontSize:11, color:TH.hint, marginTop:1 }}>{item.sub}</div>}
                </div>
                <span style={{ marginLeft:"auto", fontSize:14, color:TH.hint }}>›</span>
              </div>
            ))}
            {!proToken && (
              <div style={{ margin:"12px 16px", padding:"11px 14px", borderRadius:10, background:TH.goldDim, border:`1px solid ${TH.goldBrd}` }}>
                <div style={{ fontSize:10, fontWeight:700, color:TH.gold, letterSpacing:"0.05em", marginBottom:3 }}>Already purchased?</div>
                <RestoreToken onRestore={handleTokenUpdate} />
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Hero ── */}
        <div className="tf-hero-wrap" style={{ background:TH.card, borderBottom:`1px solid ${TH.border}`, padding:"36px 20px 28px", boxShadow:TH.shadowSm }}>
          <div className="tf-hero-gl1"></div>
          <div className="tf-hero-gl2"></div>
          <div style={{ position:"relative" }}>
            <div className="tf-eyebrow" style={{ fontSize:10, fontWeight:600, color:TH.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center" }}>
              Free · No sign-up required
            </div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:34, color:TH.ink, lineHeight:1.07, letterSpacing:"-0.8px", marginBottom:10 }}>
              Every tool you need,<br /><span style={{ color:TH.accent }}>right here.</span>
            </div>
            <div style={{ fontSize:13, color:TH.muted, lineHeight:1.65, marginBottom:20 }}>
              30 tools for freelancers, students & small businesses.
            </div>
            {/* Search */}
            <div className="tf-search" style={{ display:"flex", alignItems:"center", gap:10, background:TH.bg, border:`1.5px solid ${TH.border2}`, borderRadius:12, padding:"12px 14px", boxShadow:TH.shadow }}>
              <span style={{ fontSize:15, color:TH.hint, flexShrink:0 }}>⌕</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cover letter, GPA calc, QR code…"
                className="tf-input" style={{ ...inputStyle, background:"transparent", border:"none", padding:0, fontSize:13, color:TH.ink, boxShadow:"none" }} />
            </div>
            {/* Stats */}
            <div style={{ display:"flex", gap:0, marginTop:20, borderTop:`1px solid ${TH.border}`, paddingTop:18 }}>
              {[{n:"27",l:"Free tools"},{n:"100%",l:"Free"},{n:"✦ AI",l:"Powered",c:TH.gold}].map((s,i) => (
                <div key={i} style={{ flex:1, padding:"0 14px", borderRight: i<2 ? `1px solid ${TH.border}` : "none", ...(i===0?{paddingLeft:0}:{}) }}>
                  <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:s.c||TH.ink, letterSpacing:"-0.2px" }}>{s.n}</div>
                  <div style={{ fontSize:9, color:TH.hint, fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase", marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ padding:"12px 16px", display:"flex", gap:5, overflowX:"auto", borderBottom:`1px solid ${TH.border}`, background:TH.card }}>
          {[{ id:"all", label:"All", icon:"✦" }, ...CATEGORIES].map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} className="tf-cat-tab"
              style={{ flexShrink:0, padding:"6px 14px", borderRadius:99, border:`1px solid ${activeCat===c.id?TH.border2:TH.border}`, background:activeCat===c.id?TH.ink:TH.card, color:activeCat===c.id?TH.bg:TH.muted, fontSize:12, fontFamily:"Inter, sans-serif", fontWeight:activeCat===c.id?600:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>
              {c.icon} {c.label||"All"}
            </button>
          ))}
        </div>

        {/* 🎮 Take a Break — between category tabs and tool grid */}
        <div onClick={() => setShowGames(true)} style={{ margin:"12px 16px 0", padding:"14px 18px", borderRadius:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", background:"linear-gradient(135deg,#2d268a,#5b21b6,#7c3aed)", boxShadow:"0 4px 20px rgba(91,33,182,0.28),0 10px 36px rgba(91,33,182,0.16)" }}>
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
              <div className="tf-stagger" style={mobileGrid}>{filtered.map(tool => <ToolCard key={tool.id} tool={tool} TH={TH} onClick={() => setActiveTool(tool)} />)}</div>
            </>
          ) : activeCat !== "all" ? (
            <div className="tf-stagger" style={mobileGrid}>{filtered.map(tool => <ToolCard key={tool.id} tool={tool} TH={TH} onClick={() => setActiveTool(tool)} />)}</div>
          ) : (
            CATEGORIES.map(cat => (
              <div key={cat.id} style={{ marginBottom:24 }}>
                {/* Section header */}
                <div onClick={() => setCollapsed(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                  style={{ display:"flex", alignItems:"center", gap:8, marginBottom:collapsed[cat.id]?0:11, cursor:"pointer", padding:"6px 0" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:cat.color, flexShrink:0 }}></div>
                  <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:TH.ink }}>{cat.label}</span>
                  <span style={{ fontSize:11, color:TH.hint }}>{cat.tools.length} tools</span>
                  <span style={{ marginLeft:"auto", fontSize:12, color:TH.hint, transform:collapsed[cat.id]?"rotate(-90deg)":"rotate(0deg)", transition:"transform 0.18s", display:"inline-block" }}>▾</span>
                </div>
                {!collapsed[cat.id] && (
                  <div className="tf-stagger" style={mobileGrid}>
                    {cat.tools.map(tool => (
                      <ToolCard key={tool.id} TH={TH} tool={{ ...tool, catId:cat.id, catColor:cat.color, catColorDim:cat.colorDim }} onClick={() => setActiveTool({ ...tool, catId:cat.id, catColor:cat.color, catColorDim:cat.colorDim })} />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          <div style={{ marginTop:4, padding:"14px 16px", borderRadius:12, background:TH.bg2, border:`1px solid ${TH.border2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontFamily:"Syne, sans-serif", fontWeight:600, fontSize:12, color:TH.ink, marginBottom:2 }}>✦ More tools dropping weekly</div>
              <div style={{ fontSize:11, color:TH.hint }}>Password gen · Loan calc · and more</div>
            </div>
            <span style={{ fontSize:14, color:TH.hint }}>→</span>
          </div>
        </div>

      </div>

      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <Footer TH={TH}
          onFaq={()      => { setShowFaq(true);    window.history.pushState({},"","/faq"); }}
          onTos={()      => { setShowTos(true);    window.history.pushState({},"","/terms"); }}
          onRefund={()   => { setShowRefund(true); window.history.pushState({},"","/refund"); }}
          onPricing={()  => setShowUpgrade(true)}
        />
      </div>

      <FloatingWidget widgets={widgets} removeWidget={removeWidget} activePill={activePill} setActivePill={setActivePill} onOpenTool={toolId => setActiveTool(ALL_TOOLS.find(t=>t.id===toolId))} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} proToken={proToken} thm={TH} />}
    </>
  );
}
