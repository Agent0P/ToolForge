import { useState } from "react";
import { T } from "./theme";

export const G_COLOR = "#4f46e5";
export const G_DIM   = "#eef2ff";

export const GAMES = [
  { id:"tictactoe",    icon:"⭕", name:"Tic-Tac-Toe",      desc:"Classic 3×3 — can you beat the AI?",             free:true,  tokens:0, hasDifficulty:true,  available:true  },
  { id:"wordscramble", icon:"🔤", name:"Word Scramble",    desc:"Unscramble the word before time runs out",       free:true,  tokens:0, hasDifficulty:false, available:false },
  { id:"dottodot",     icon:"✏️", name:"Dot-to-Dot",       desc:"Connect the dots to reveal the shape",           free:true,  tokens:0, hasDifficulty:false, available:false },
  { id:"fourinarow",   icon:"🔴", name:"4-in-a-Row",       desc:"Drop pieces and connect four — vs AI",           free:false, tokens:1, hasDifficulty:true,  available:false },
  { id:"battleships",  icon:"🚢", name:"Battleships",      desc:"Sink the enemy fleet before yours is gone",      free:false, tokens:1, hasDifficulty:true,  available:false },
  { id:"runner",       icon:"🏃", name:"Endless Runner",   desc:"Dodge obstacles and survive as long as you can", free:false, tokens:1, hasDifficulty:true,  available:false },
  { id:"rocklauncher", icon:"🪨", name:"Rock Launcher",    desc:"Aim, fire and knock down the structures",        free:false, tokens:2, hasDifficulty:false, available:false },
  { id:"shooter",      icon:"🚀", name:"Top-Down Shooter", desc:"Survive endless waves of enemies",               free:false, tokens:2, hasDifficulty:true,  available:false },
];

export function getGameCounts() {
  try {
    const s = localStorage.getItem("tf_games_usage");
    if (!s) return {};
    const { date, counts } = JSON.parse(s);
    return new Date().toDateString() === date ? counts : {};
  } catch { return {}; }
}

export function saveGameCount(id, counts) {
  localStorage.setItem("tf_games_usage", JSON.stringify({ date: new Date().toDateString(), counts }));
}

export function GameCard({ game, count, locked, comingSoon, onClick }) {
  const [hov, setHov] = useState(false);
  const playsLeft = Math.max(0, 3 - count);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{ position:"relative", borderRadius:14, border:`1.5px solid ${hov && !comingSoon ? G_COLOR : T.border}`, background: hov && !comingSoon ? G_DIM : T.card, cursor: comingSoon ? "default" : "pointer", transition:"all 0.18s", overflow:"hidden", boxShadow: hov && !comingSoon ? `0 4px 20px ${G_COLOR}18` : "0 1px 6px #0f0f0d08" }}>

      {locked && !comingSoon && (
        <div style={{ position:"absolute", inset:0, backdropFilter:"blur(3px)", background:"rgba(255,255,255,0.5)", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, borderRadius:13 }}>
          <div style={{ fontSize:22 }}>🔒</div>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:10, color:G_COLOR, background:G_DIM, padding:"3px 10px", borderRadius:99, border:`1px solid ${G_COLOR}44` }}>PREMIUM</div>
          <div style={{ fontSize:10, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{game.tokens} token{game.tokens > 1 ? "s" : ""} / game</div>
        </div>
      )}

      <div style={{ padding:"14px 12px", filter: locked && !comingSoon ? "blur(1px)" : "none" }}>
        <div style={{ fontSize:26, marginBottom:8 }}>{game.icon}</div>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:T.ink, marginBottom:4, lineHeight:1.3 }}>{game.name}</div>
        <div style={{ fontSize:11, color:T.muted, lineHeight:1.4, marginBottom:8 }}>{game.desc}</div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {comingSoon && (
            <span style={{ fontSize:9, padding:"2px 7px", borderRadius:99, background:"#f1f5f9", color:"#94a3b8", fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>COMING SOON</span>
          )}
          {!comingSoon && game.free && !locked && (
            <span style={{ fontSize:9, padding:"2px 7px", borderRadius:99, background:T.greenDim, color:T.green, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>
              {playsLeft}/3 FREE TODAY
            </span>
          )}
          {!comingSoon && !game.free && !locked && (
            <span style={{ fontSize:9, padding:"2px 7px", borderRadius:99, background:G_DIM, color:G_COLOR, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>
              {game.tokens} TOKEN{game.tokens > 1 ? "S" : ""}
            </span>
          )}
          {game.hasDifficulty && !comingSoon && (
            <span style={{ fontSize:9, padding:"2px 7px", borderRadius:99, background:T.accentDim, color:T.accent, fontFamily:"Syne, sans-serif", fontWeight:700, letterSpacing:0.5 }}>DIFFICULTY</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function GamesSection({ proToken, onNeedUpgrade, onTokenUpdate, onBack }) {
  const [activeGame, setActiveGame] = useState(null);
  const [counts, setCounts] = useState(getGameCounts);
  const hasClaude = proToken && proToken.generations_left > 0;

  const startGame = (game) => {
    if (!game.available) return;
    if (game.free) {
      const c = counts[game.id] || 0;
      if (c >= 3 && !hasClaude) { onNeedUpgrade(); return; }
      if (!hasClaude) {
        const newCounts = { ...counts, [game.id]: c + 1 };
        setCounts(newCounts);
        saveGameCount(game.id, newCounts);
      }
      setActiveGame(game);
    } else {
      if (!hasClaude || proToken.generations_left < game.tokens) { onNeedUpgrade(); return; }
      setActiveGame(game);
    }
  };

  if (activeGame) {
    const renderGame = () => {
      if (activeGame.id === "tictactoe") return <TicTacToe proToken={proToken} onTokenUpdate={onTokenUpdate} />;
      return <div style={{ textAlign:"center", padding:"40px 0", color:T.muted, fontFamily:"DM Sans, sans-serif" }}>Coming soon!</div>;
    };
    return (
      <div>
        <button onClick={() => setActiveGame(null)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:T.muted, fontSize:13, cursor:"pointer", fontFamily:"DM Sans, sans-serif", marginBottom:16, padding:0 }}>← Back to Games</button>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <div style={{ width:46, height:46, borderRadius:12, background:G_DIM, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{activeGame.icon}</div>
          <div>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:17, color:T.ink }}>{activeGame.name}</div>
            <div style={{ fontSize:12, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{activeGame.desc}</div>
          </div>
        </div>
        {renderGame()}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:T.muted, fontSize:13, cursor:"pointer", fontFamily:"DM Sans, sans-serif", padding:0, display:"flex", alignItems:"center", gap:5 }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.ink }}>🎮 Take a Break</div>
          <div style={{ fontSize:12, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>You've earned it. Free games reset daily at midnight.</div>
        </div>
      </div>
      {hasClaude && <div style={{ marginBottom:12, padding:"6px 12px", borderRadius:8, background:G_DIM, border:`1px solid ${G_COLOR}44`, display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ fontSize:10, fontFamily:"Syne, sans-serif", fontWeight:700, color:G_COLOR }}>✦ Token holder</span><span style={{ fontSize:10, color:G_COLOR, fontFamily:"DM Sans, sans-serif" }}>Unlimited free games · {proToken.generations_left} tokens left</span></div>}

      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:T.green, marginBottom:8, letterSpacing:0.5 }}>🆓 FREE GAMES</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        {GAMES.filter(g => g.free).map(game => (
          <GameCard key={game.id} game={game} count={counts[game.id] || 0}
            locked={(counts[game.id] || 0) >= 3 && !hasClaude}
            comingSoon={!game.available}
            onClick={() => startGame(game)} />
        ))}
      </div>

      <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:G_COLOR, marginBottom:8, letterSpacing:0.5 }}>✦ PREMIUM GAMES</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {GAMES.filter(g => !g.free).map(game => (
          <GameCard key={game.id} game={game} count={0}
            locked={!hasClaude || (proToken?.generations_left || 0) < game.tokens}
            comingSoon={!game.available}
            onClick={() => game.available ? startGame(game) : null} />
        ))}
      </div>

      <div style={{ marginTop:20, padding:14, borderRadius:12, background:G_DIM, border:`1px solid ${G_COLOR}22`, textAlign:"center" }}>
        <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:G_COLOR, marginBottom:3 }}>More games dropping weekly</div>
        <div style={{ fontSize:11, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>4-in-a-Row · Battleships · Endless Runner · and more</div>
      </div>
    </div>
  );
}

export function TicTacToe({ proToken, onTokenUpdate }) {
  const PROFANITY = ["fuck","shit","ass","bitch","cunt","dick","cock","pussy","bastard","whore","slut","asshole","damn","hell","crap","piss","fag","nigger","nigga","retard","rape","nazi"];
  const checkProfanity = (name) => {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g,"");
    return PROFANITY.some(w => clean.includes(w));
  };

  const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const checkWinner = (b) => { for (const [a,c,d] of WIN_LINES) if (b[a] && b[a]===b[c] && b[a]===b[d]) return b[a]; return b.includes(null)?null:"draw"; };

  const minimax = (b, isMax, depth, alpha, beta) => {
    const w = checkWinner(b);
    if (w === "O") return 10 - depth;
    if (w === "X") return depth - 10;
    if (w === "draw") return 0;
    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) { b[i] = "O"; best = Math.max(best, minimax(b, false, depth+1, alpha, beta)); b[i] = null; alpha = Math.max(alpha, best); if (beta <= alpha) break; }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) { b[i] = "X"; best = Math.min(best, minimax(b, true, depth+1, alpha, beta)); b[i] = null; beta = Math.min(beta, best); if (beta <= alpha) break; }
      }
      return best;
    }
  };

  const getAIMove = (b, diff) => {
    const empty = b.map((v,i) => v ? null : i).filter(v => v !== null);
    if (diff === "easy") return empty[Math.floor(Math.random() * empty.length)];
    if (diff === "normal") {
      if (Math.random() < 0.4) return empty[Math.floor(Math.random() * empty.length)];
      let best = -Infinity, move = empty[0];
      for (const i of empty) { const nb = [...b]; nb[i] = "O"; const s = minimax(nb, false, 0, -Infinity, Infinity); if (s > best) { best = s; move = i; } }
      return move;
    }
    let best = -Infinity, move = empty[0];
    for (const i of empty) { const nb = [...b]; nb[i] = "O"; const s = minimax(nb, false, 0, -Infinity, Infinity); if (s > best) { best = s; move = i; } }
    return move;
  };

  const lbGet = () => { try { return JSON.parse(localStorage.getItem("tf_ttt_lb") || "[]"); } catch { return []; } };
  const lbAdd = (entry) => {
    const lb = lbGet();
    const existing = lb.findIndex(e => e.name === entry.name && e.difficulty === entry.difficulty);
    if (existing >= 0) {
      lb[existing].wins = (lb[existing].wins || 0) + entry.wins;
      if (!lb[existing].bestMoves || entry.bestMoves < lb[existing].bestMoves) lb[existing].bestMoves = entry.bestMoves;
      if (!lb[existing].bestTime || entry.bestTime < lb[existing].bestTime) lb[existing].bestTime = entry.bestTime;
    } else { lb.push(entry); }
    lb.sort((a,b) => (b.wins||0)-(a.wins||0) || (a.bestMoves||99)-(b.bestMoves||99) || (a.bestTime||9999)-(b.bestTime||9999));
    localStorage.setItem("tf_ttt_lb", JSON.stringify(lb.slice(0,20)));
  };

  const [phase, setPhase] = useState("setup");
  const [name, setName] = useState(""); const [nameErr, setNameErr] = useState("");
  const [diff, setDiff] = useState("normal");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [wins, setWins] = useState(0); const [losses, setLosses] = useState(0); const [draws, setDraws] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [savedScore, setSavedScore] = useState(false);
  const [showLb, setShowLb] = useState(false);
  const [lb, setLb] = useState(lbGet);

  const startGame = () => {
    if (name.trim().length < 2) { setNameErr("Name must be at least 2 characters."); return; }
    if (name.trim().length > 20) { setNameErr("Name must be 20 characters or less."); return; }
    if (checkProfanity(name.trim())) { setNameErr("Please choose an appropriate username."); return; }
    setNameErr(""); setPhase("play"); resetBoard();
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null)); setXTurn(true); setWinner(null); setMoveCount(0); setStartTime(null); setElapsed(0); setSavedScore(false);
  };

  const handleClick = (i) => {
    if (!xTurn || winner || board[i]) return;
    const nb = [...board]; nb[i] = "X";
    const mc = moveCount + 1;
    if (!startTime) setStartTime(Date.now());
    const w = checkWinner(nb);
    setBoard(nb); setMoveCount(mc);
    if (w) { const t = startTime ? Math.round((Date.now()-startTime)/1000) : 0; setElapsed(t); setWinner(w); if (w==="X") setWins(v=>v+1); else if (w==="draw") setDraws(v=>v+1); return; }
    setXTurn(false);
    setTimeout(() => {
      const ab = [...nb]; const ai = getAIMove(ab, diff); ab[ai] = "O";
      const aw = checkWinner(ab);
      setBoard(ab);
      if (aw) { const t = startTime ? Math.round((Date.now()-startTime)/1000) : 0; setElapsed(t); setWinner(aw); if (aw==="O") setLosses(v=>v+1); else setDraws(v=>v+1); }
      else setXTurn(true);
    }, 400);
  };

  const saveToLb = () => {
    const t = startTime ? Math.round((Date.now()-startTime)/1000) : elapsed;
    lbAdd({ name: name.trim(), difficulty: diff, wins: 1, bestMoves: moveCount, bestTime: t, date: new Date().toLocaleDateString() });
    setLb(lbGet()); setSavedScore(true);
  };

  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  if (phase === "setup") return (
    <div style={{ fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, color:T.muted, marginBottom:4 }}>YOUR NAME</div>
        <input value={name} onChange={e=>{setName(e.target.value);setNameErr("");}} placeholder="Enter a username…" style={{ width:"100%", padding:"9px 12px", borderRadius:9, border:`1px solid ${nameErr?T.accent:T.border}`, fontSize:13, fontFamily:"DM Sans, sans-serif", color:T.ink, background:"white", outline:"none", boxSizing:"border-box" }} />
        {nameErr && <div style={{ fontSize:11, color:T.accent, marginTop:4 }}>{nameErr}</div>}
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, color:T.muted, marginBottom:6 }}>DIFFICULTY</div>
        <div style={{ display:"flex", gap:8 }}>
          {["easy","normal","hard"].map(d => (
            <button key={d} onClick={()=>setDiff(d)} style={{ flex:1, padding:"8px 0", borderRadius:9, border:`1.5px solid ${diff===d?G_COLOR:T.border}`, background:diff===d?G_DIM:"white", color:diff===d?G_COLOR:T.muted, fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer", textTransform:"capitalize" }}>{d}</button>
          ))}
        </div>
      </div>
      <button onClick={startGame} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:G_COLOR, color:"white", fontSize:14, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer" }}>▶ Start Game</button>
      <button onClick={()=>setShowLb(!showLb)} style={{ width:"100%", padding:"10px 0", borderRadius:10, border:`1px solid ${T.border}`, background:"white", color:T.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer", marginTop:8 }}>🏆 Leaderboard</button>
      {showLb && <LeaderboardPanel lb={lb} />}
    </div>
  );

  const w = winner;
  const resultMsg = w === "X" ? "🎉 You win!" : w === "draw" ? "🤝 Draw!" : "🤖 AI wins!";

  return (
    <div style={{ fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ display:"flex", gap:12 }}>
          <span style={{ fontSize:11, color:T.green, fontFamily:"Syne, sans-serif", fontWeight:700 }}>W:{wins}</span>
          <span style={{ fontSize:11, color:T.accent, fontFamily:"Syne, sans-serif", fontWeight:700 }}>L:{losses}</span>
          <span style={{ fontSize:11, color:T.muted, fontFamily:"Syne, sans-serif", fontWeight:700 }}>D:{draws}</span>
        </div>
        <div style={{ display:"flex", gap:10, fontSize:11, color:T.muted }}>
          <span>Moves: {moveCount}</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)} style={{ aspectRatio:"1", borderRadius:12, border:`1.5px solid ${cell ? (cell==="X"?G_COLOR:"#e85d04") : T.border}`, background: cell ? (cell==="X"?G_DIM:T.accentDim) : "white", fontSize:28, fontFamily:"Syne, sans-serif", fontWeight:800, color:cell==="X"?G_COLOR:T.accent, cursor:!cell&&!winner&&xTurn?"pointer":"default", transition:"all 0.15s" }}>
            {cell}
          </button>
        ))}
      </div>

      {!winner && <div style={{ textAlign:"center", fontSize:12, color:T.muted, marginBottom:12 }}>{xTurn ? "Your turn (X)" : "AI thinking…"}</div>}

      {winner && (
        <div style={{ padding:16, borderRadius:12, background:w==="X"?T.greenDim:w==="draw"?"#f1f5f9":T.accentDim, border:`1px solid ${w==="X"?T.green:w==="draw"?T.border:T.accent}`, textAlign:"center", marginBottom:12 }}>
          <div style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:18, color:T.ink, marginBottom:4 }}>{resultMsg}</div>
          {w==="X" && <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>Solved in {moveCount} moves · {fmt(elapsed)}</div>}
          {w==="X" && !savedScore && (
            <button onClick={saveToLb} style={{ padding:"8px 20px", borderRadius:8, border:"none", background:G_COLOR, color:"white", fontSize:12, fontFamily:"Syne, sans-serif", fontWeight:700, cursor:"pointer", marginBottom:8, display:"block", width:"100%" }}>🏆 Save score to leaderboard</button>
          )}
          {savedScore && <div style={{ fontSize:11, color:T.green, marginBottom:8, fontFamily:"Syne, sans-serif", fontWeight:700 }}>✓ Score saved!</div>}
          <button onClick={resetBoard} style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${T.border}`, background:"white", color:T.muted, fontSize:12, fontFamily:"DM Sans, sans-serif", cursor:"pointer", width:"100%" }}>Play again</button>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
        <button onClick={() => setPhase("setup")} style={{ flex:1, padding:"8px 0", borderRadius:8, border:`1px solid ${T.border}`, background:"white", color:T.muted, fontSize:11, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>← Menu</button>
        <button onClick={()=>setShowLb(!showLb)} style={{ flex:1, padding:"8px 0", borderRadius:8, border:`1px solid ${T.border}`, background:"white", color:T.muted, fontSize:11, fontFamily:"DM Sans, sans-serif", cursor:"pointer" }}>🏆 Leaderboard</button>
      </div>
      {showLb && <LeaderboardPanel lb={lb} />}
    </div>
  );
}

function LeaderboardPanel({ lb }) {
  const medals = ["🥇","🥈","🥉"];
  return (
    <div style={{ marginTop:12, borderRadius:12, border:`1px solid ${T.border}`, overflow:"hidden" }}>
      <div style={{ padding:"10px 14px", background:G_DIM, borderBottom:`1px solid ${T.border}`, fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:G_COLOR }}>🏆 Top Players</div>
      {lb.length === 0 && <div style={{ padding:"16px", textAlign:"center", fontSize:12, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>No scores yet. Play a game!</div>}
      {lb.slice(0,10).map((e, i) => (
        <div key={i} style={{ padding:"10px 14px", borderBottom:i<lb.length-1?`1px solid ${T.border}`:"none", display:"flex", alignItems:"center", justifyContent:"space-between", background:i===0?"#fffbeb":i===1?"#f8fafc":i===2?"#fff8f0":"white" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14, minWidth:20 }}>{medals[i] || `#${i+1}`}</span>
            <div>
              <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:T.ink }}>{e.name}</div>
              <div style={{ fontSize:10, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{e.difficulty} · {e.date}</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:12, color:G_COLOR }}>{e.wins} win{e.wins!==1?"s":""}</div>
            <div style={{ fontSize:10, color:T.muted, fontFamily:"DM Sans, sans-serif" }}>{e.bestMoves}m · {Math.floor((e.bestTime||0)/60)}:{String((e.bestTime||0)%60).padStart(2,"0")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
