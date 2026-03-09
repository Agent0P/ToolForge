import { useState, useEffect, useRef } from "react";
import { T } from "./theme";

const G_COLOR = "#4f46e5";
const G_DIM   = "#eef2ff";

/* ── Profanity filter ── */
const BAD_WORDS = ["fuck","shit","bitch","cunt","dick","cock","pussy","nigger","nigga","faggot","fag","retard","whore","slut","bastard","twat","wanker","bollocks","asshole","arsehole","motherfucker","fucker","bullshit","jackass","dumbass","shithead","dipshit","douchebag","prick","tosser"];
function hasBadWord(str) {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return BAD_WORDS.some(w => clean.includes(w));
}

/* ── Leaderboard (localStorage) ── */
const LB_KEY = "tf_ttt_leaderboard";
function lbGet() {
  try { const s = localStorage.getItem(LB_KEY); return s ? JSON.parse(s) : []; }
  catch { return []; }
}
function lbAdd(entry) {
  const list = lbGet();
  list.push(entry);
  list.sort((a,b) => b.wins - a.wins || a.bestMoves - b.bestMoves || a.bestTime - b.bestTime);
  const top = list.slice(0, 20);
  try { localStorage.setItem(LB_KEY, JSON.stringify(top)); } catch {}
  return top;
}
function fmtTime(s) { return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`; }

/* ── Minimax AI ── */
function checkWinner(b) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,c,d] of lines) if (b[a] && b[a]===b[c] && b[a]===b[d]) return { winner: b[a], line: [a,c,d] };
  return b.includes(null) ? null : { winner: "draw", line: [] };
}
function minimax(board, isMax, alpha, beta, depth) {
  const res = checkWinner(board);
  if (res) { if (res.winner==="O") return 10-depth; if (res.winner==="X") return depth-10; return 0; }
  if (isMax) {
    let best = -Infinity;
    for (let i=0;i<9;i++) { if (!board[i]) { board[i]="O"; best=Math.max(best,minimax(board,false,alpha,beta,depth+1)); board[i]=null; alpha=Math.max(alpha,best); if (beta<=alpha) break; } }
    return best;
  } else {
    let best = Infinity;
    for (let i=0;i<9;i++) { if (!board[i]) { board[i]="X"; best=Math.min(best,minimax(board,true,alpha,beta,depth+1)); board[i]=null; beta=Math.min(beta,best); if (beta<=alpha) break; } }
    return best;
  }
}
function getAiMove(board, difficulty) {
  const empty = board.map((v,i) => v===null?i:-1).filter(i=>i>=0);
  if (!empty.length) return -1;
  if (difficulty==="easy" && Math.random()<0.7) return empty[Math.floor(Math.random()*empty.length)];
  if (difficulty==="normal" && Math.random()<0.3) return empty[Math.floor(Math.random()*empty.length)];
  let best=-Infinity, move=empty[0];
  for (const i of empty) { board[i]="O"; const s=minimax(board,false,-Infinity,Infinity,0); board[i]=null; if (s>best){best=s;move=i;} }
  return move;
}

/* ── Leaderboard Panel ── */
function Leaderboard({ onClose, refreshKey }) {
  const [entries, setEntries] = useState([]);
  useEffect(() => { setEntries(lbGet()); }, [refreshKey]);
  return (
    <div style={{ marginTop:16, padding:16, borderRadius:14, border:`1px solid ${G_COLOR}33`, background:G_DIM }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:G_COLOR }}>🏆 Leaderboard</div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, fontSize:18, cursor:"pointer", lineHeight:1 }}>✕</button>
      </div>
      {entries.length===0
        ? <div style={{ fontSize:12, color:T.muted, textAlign:"center", padding:"12px 0" }}>No entries yet — be the first!</div>
        : <>
          <div style={{ display:"grid", gridTemplateColumns:"20px 1fr auto auto auto", gap:"0 10px", paddingBottom:6, borderBottom:`1px solid ${G_COLOR}22`, marginBottom:4 }}>
            {["","Name","Wins","Moves","Time"].map((h,i)=>(
              <div key={i} style={{ fontSize:9, color:T.muted, fontFamily:"Syne, sans-serif", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</div>
            ))}
          </div>
          {entries.map((e,i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"20px 1fr auto auto auto", gap:"0 10px", padding:"6px 0", borderBottom:i<entries.length-1?`1px solid ${G_COLOR}11`:"none", alignItems:"center" }}>
              <div style={{ fontSize:i<3?14:11, textAlign:"center" }}>{i<3?["🥇","🥈","🥉"][i]:i+1}</div>
              <div style={{ fontFamily:"DM Sans, sans-serif", fontSize:12, color:T.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</div>
              <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:11, color:T.green }}>{e.wins}W</div>
              <div style={{ fontSize:10, color:T.muted }}>{e.bestMoves}mv</div>
              <div style={{ fontSize:10, color:T.muted }}>{fmtTime(e.bestTime)}</div>
            </div>
          ))}
        </>
      }
    </div>
  );
}

/* ── TicTacToe Component ── */
export function TicTacToe() {
  const DIFFS = ["easy","normal","hard"];
  const [phase, setPhase]           = useState("setup");
  const [difficulty, setDiff]       = useState("normal");
  const [nameInput, setNameInput]   = useState("");
  const [nameError, setNameError]   = useState("");
  const [username, setUsername]     = useState("");
  const [board, setBoard]           = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext]       = useState(true);
  const [result, setResult]         = useState(null);
  const [wins, setWins]             = useState(0);
  const [losses, setLosses]         = useState(0);
  const [draws, setDraws]           = useState(0);
  const [showLb, setShowLb]         = useState(false);
  const [lbSaved, setLbSaved]       = useState(false);
  const [lbRefresh, setLbRefresh]   = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const [moveCount, setMoveCount]   = useState(0);
  const [elapsed, setElapsed]       = useState(0);
  const [timerOn, setTimerOn]       = useState(false);
  const timerRef                    = useRef(null);
  const lastWinStats                = useRef({ moves: 0, time: 0 });
  const [bestMoves, setBestMoves]   = useState(null);
  const [bestTime, setBestTime]     = useState(null);

  useEffect(() => {
    if (timerOn) { timerRef.current = setInterval(() => setElapsed(e => e+1), 1000); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  useEffect(() => {
    if (phase!=="playing"||xIsNext||result) return;
    setAiThinking(true);
    const delay={easy:300,normal:500,hard:700}[difficulty];
    const t=setTimeout(()=>{
      setBoard(prev=>{
        const copy=[...prev];
        const move=getAiMove([...copy],difficulty);
        if (move===-1) return prev;
        copy[move]="O";
        const res=checkWinner(copy);
        if (res){ setTimerOn(false); setResult(res); setPhase("over"); if(res.winner==="O") setLosses(l=>l+1); else if(res.winner==="draw") setDraws(d=>d+1); }
        else setXIsNext(true);
        return copy;
      });
      setAiThinking(false);
    },delay);
    return ()=>clearTimeout(t);
  },[xIsNext,phase,difficulty,result]);

  const handleCell=(i)=>{
    if (!xIsNext||board[i]||phase!=="playing"||aiThinking) return;
    if (moveCount===0) setTimerOn(true);
    const newMoves=moveCount+1;
    setMoveCount(newMoves);
    const copy=[...board]; copy[i]="X";
    const res=checkWinner(copy);
    setBoard(copy);
    if (res){
      setTimerOn(false); setResult(res); setPhase("over");
      if(res.winner==="X"){
        setWins(w=>w+1);
        lastWinStats.current={moves:newMoves,time:elapsed+1};
        setBestMoves(b=>b===null?newMoves:Math.min(b,newMoves));
        setBestTime(b=>b===null?elapsed+1:Math.min(b,elapsed+1));
      } else if(res.winner==="draw") setDraws(d=>d+1);
    } else setXIsNext(false);
  };

  const validateName=(val)=>{
    if (!val.trim()) { setNameError(""); return; }
    if (hasBadWord(val)) { setNameError("Please choose an appropriate username."); return; }
    if (val.trim().length < 2) { setNameError("Name must be at least 2 characters."); return; }
    if (val.trim().length > 20) { setNameError("Name must be 20 characters or less."); return; }
    setNameError("");
  };

  const handleNameChange=(e)=>{ setNameInput(e.target.value); validateName(e.target.value); };

  const startGame=()=>{
    if (!nameInput.trim()||nameError) return;
    if (hasBadWord(nameInput)) { setNameError("Please choose an appropriate username."); return; }
    setUsername(nameInput.trim());
    setBoard(Array(9).fill(null)); setXIsNext(true); setResult(null); setLbSaved(false);
    setMoveCount(0); setElapsed(0); setTimerOn(false);
    setPhase("playing");
  };

  const playAgain=()=>{ setBoard(Array(9).fill(null)); setXIsNext(true); setResult(null); setLbSaved(false); setMoveCount(0); setElapsed(0); setTimerOn(false); setPhase("playing"); };

  const saveToLb=()=>{
    if (lbSaved||wins===0) return;
    lbAdd({ name:username, wins, difficulty, bestMoves:bestMoves??lastWinStats.current.moves, bestTime:bestTime??lastWinStats.current.time, date:new Date().toLocaleDateString() });
    setLbSaved(true); setLbRefresh(r=>r+1); setShowLb(true);
  };

  const canStart = nameInput.trim().length>=2 && !nameError;
  const dC={easy:T.green,normal:T.accent,hard:"#ef4444"};
  const dD={easy:T.greenDim,normal:T.accentDim,hard:"#fee2e2"};

  /* SETUP */
  if (phase==="setup") return (
    <div style={{ fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ marginBottom:20, padding:16, borderRadius:14, background:G_DIM, border:`1px solid ${G_COLOR}33`, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:6 }}>⭕</div>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:G_COLOR }}>Tic-Tac-Toe</div>
        <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>You are X · AI is O</div>
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:T.ink, fontFamily:"Syne, sans-serif", fontWeight:700, marginBottom:6 }}>Your name (for leaderboard)</div>
        <input value={nameInput} onChange={handleNameChange} onKeyDown={e=>e.key==="Enter"&&startGame()} placeholder="Enter username…"
          style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${nameError?"#ef4444":T.border}`, fontFamily:"DM Sans, sans-serif", fontSize:14, outline:"none", color:T.ink }} />
        {nameError && <div style={{ fontSize:11, color:"#ef4444", fontFamily:"DM Sans, sans-serif", marginTop:5 }}>⚠ {nameError}</div>}
      </div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:T.ink, fontFamily:"Syne, sans-serif", fontWeight:700, marginBottom:8 }}>Difficulty</div>
        <div style={{ display:"flex", gap:8 }}>
          {DIFFS.map(d=>(
            <button key={d} onClick={()=>setDiff(d)} style={{ flex:1, padding:"9px 0", borderRadius:10, border:`1.5px solid ${difficulty===d?dC[d]:T.border}`, background:difficulty===d?dD[d]:"white", color:difficulty===d?dC[d]:T.muted, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, cursor:"pointer", textTransform:"capitalize", transition:"all 0.15s" }}>{d}</button>
          ))}
        </div>
      </div>
      <button onClick={startGame} disabled={!canStart} style={{ width:"100%", padding:"13px 0", borderRadius:12, border:"none", background:canStart?G_COLOR:"#e2e8f0", color:canStart?"white":"#94a3b8", fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:15, cursor:canStart?"pointer":"default", transition:"all 0.15s" }}>
        Start Game →
      </button>
      <button onClick={()=>setShowLb(s=>!s)} style={{ width:"100%", marginTop:10, padding:"10px 0", borderRadius:12, border:`1.5px solid ${G_COLOR}44`, background:"transparent", color:G_COLOR, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>
        🏆 View Leaderboard
      </button>
      {showLb && <Leaderboard onClose={()=>setShowLb(false)} refreshKey={lbRefresh} />}
    </div>
  );

  const winResult=result&&result.winner!=="draw"?result:null;
  const isDraw=result&&result.winner==="draw";
  const playerWon=result&&result.winner==="X";

  /* PLAYING / OVER */
  return (
    <div style={{ fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, padding:"10px 14px", borderRadius:12, background:T.card, border:`1px solid ${T.border}` }}>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:T.ink }}>
          {phase==="over"?(playerWon?"🎉 You win!":isDraw?"🤝 Draw!":"🤖 AI wins!"):aiThinking?"🤖 Thinking…":"Your turn (X)"}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <span style={{ fontSize:11, color:T.green, fontFamily:"Syne, sans-serif", fontWeight:700 }}>{wins}W</span>
          <span style={{ fontSize:11, color:T.muted }}>·</span>
          <span style={{ fontSize:11, color:"#ef4444", fontFamily:"Syne, sans-serif", fontWeight:700 }}>{losses}L</span>
          <span style={{ fontSize:11, color:T.muted }}>·</span>
          <span style={{ fontSize:11, color:T.muted, fontFamily:"Syne, sans-serif", fontWeight:700 }}>{draws}D</span>
        </div>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ flex:1, padding:"8px 12px", borderRadius:10, background:T.card, border:`1px solid ${T.border}`, textAlign:"center" }}>
          <div style={{ fontSize:9, color:T.muted, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5, marginBottom:2 }}>MOVES</div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:G_COLOR }}>{moveCount}</div>
        </div>
        <div style={{ flex:1, padding:"8px 12px", borderRadius:10, background:T.card, border:`1px solid ${T.border}`, textAlign:"center" }}>
          <div style={{ fontSize:9, color:T.muted, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5, marginBottom:2 }}>TIME</div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:G_COLOR }}>{fmtTime(elapsed)}</div>
        </div>
        {bestMoves!==null&&(
          <div style={{ flex:1, padding:"8px 12px", borderRadius:10, background:T.greenDim, border:`1px solid ${T.green}44`, textAlign:"center" }}>
            <div style={{ fontSize:9, color:T.green, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5, marginBottom:2 }}>BEST</div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:13, color:T.green }}>{bestMoves}mv · {fmtTime(bestTime)}</div>
          </div>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, marginBottom:14 }}>
        {board.map((cell,i)=>{
          const isWin=winResult&&winResult.line.includes(i);
          return (
            <div key={i} onClick={()=>handleCell(i)} style={{ aspectRatio:"1", borderRadius:14, border:`2px solid ${isWin?G_COLOR:T.border}`, background:isWin?G_DIM:T.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, fontFamily:"Syne, sans-serif", fontWeight:800, color:cell==="X"?T.accent:G_COLOR, cursor:(!cell&&xIsNext&&phase==="playing"&&!aiThinking)?"pointer":"default", transition:"all 0.12s", boxShadow:isWin?`0 0 12px ${G_COLOR}44`:"none" }}>
              {cell}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign:"center", marginBottom:14 }}>
        <span style={{ fontSize:10, padding:"3px 10px", borderRadius:99, background:dD[difficulty], color:dC[difficulty], fontFamily:"Syne, sans-serif", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{difficulty}</span>
      </div>

      {phase==="over"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {playerWon&&(
            <div style={{ padding:"10px 14px", borderRadius:10, background:T.greenDim, border:`1px solid ${T.green}44`, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:T.green, fontFamily:"Syne, sans-serif", fontWeight:700 }}>🎯 {moveCount} moves</span>
              <span style={{ fontSize:12, color:T.green, fontFamily:"Syne, sans-serif", fontWeight:700 }}>⏱ {fmtTime(elapsed)}</span>
            </div>
          )}
          <button onClick={playAgain} style={{ padding:"12px 0", borderRadius:12, border:"none", background:G_COLOR, color:"white", fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>Play Again</button>
          {wins>0&&!lbSaved&&<button onClick={saveToLb} style={{ padding:"12px 0", borderRadius:12, border:`1.5px solid ${G_COLOR}`, background:"transparent", color:G_COLOR, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>🏆 Save score to leaderboard</button>}
          {lbSaved&&<div style={{ textAlign:"center", fontSize:12, color:T.green }}>✓ Score saved!</div>}
          <button onClick={()=>{setPhase("setup");setWins(0);setLosses(0);setDraws(0);setBestMoves(null);setBestTime(null);setShowLb(false);}} style={{ padding:"10px 0", borderRadius:12, border:`1.5px solid ${T.border}`, background:"transparent", color:T.muted, fontFamily:"DM Sans, sans-serif", fontSize:13, cursor:"pointer" }}>Change difficulty / name</button>
        </div>
      )}

      {phase==="playing"&&<button onClick={()=>setShowLb(s=>!s)} style={{ width:"100%", marginTop:8, padding:"9px 0", borderRadius:12, border:`1.5px solid ${G_COLOR}33`, background:"transparent", color:G_COLOR, fontFamily:"Syne, sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>🏆 Leaderboard</button>}
      {showLb&&<Leaderboard onClose={()=>setShowLb(false)} refreshKey={lbRefresh} />}
    </div>
  );
}
 
