"use client";

import { useState, useRef, useEffect } from "react";
import Footer from "../components/Footer";

type TileState = "correct" | "present" | "absent" | "empty";

const STATE_CYCLE: TileState[] = ["absent", "present", "correct"];
const STATE_COLORS: Record<TileState, string> = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent: "#3a3a3c",
  empty: "#1a1a1b",
};

export default function DuotrigordlePage() {
  const [boards, setBoards] = useState<string[][]>([]);
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<TileState[][]>(
    Array(32).fill(null).map(() => Array(5).fill("absent"))
  );
  const [bestGuess, setBestGuess] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [guessHistory, setGuessHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [solvedBoardIndices, setSolvedBoardIndices] = useState<Set<number>>(new Set());

  const word = guess.toUpperCase().padEnd(5, " ").slice(0, 5);
  const activeBoards = boards.filter((b) => b.length > 1).length;
  const solvedBoards = solvedBoardIndices.size;

  const cycleTile = (boardIdx: number, tileIdx: number) => {
    if (!guess[tileIdx]) return;
    setFeedbacks((prev) => {
      const next = prev.map((row) => [...row]);
      const idx = STATE_CYCLE.indexOf(next[boardIdx][tileIdx]);
      next[boardIdx][tileIdx] = STATE_CYCLE[(idx + 1) % STATE_CYCLE.length];
      return next;
    });
  };

  const feedbackStrings = feedbacks.map((row) =>
    row.map((t) => (t === "correct" ? "g" : t === "present" ? "y" : "b")).join("")
  );

  async function start() {
    setLoading(true);
    try {
      const res = await fetch("/api/duotrigordle", { method: "POST", body: JSON.stringify({}) });
      const data = await res.json();
      setBoards(data.boards);
      setBestGuess(data.bestGuess);
      setStarted(true);
      setGuessHistory([]);
      setSolvedBoardIndices(new Set());
      setGuess("");
      setFeedbacks(Array(32).fill(null).map(() => Array(5).fill("absent")));
      setTimeout(() => inputRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }

  async function next() {
    if (guess.trim().length !== 5) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/duotrigordle", {
        method: "POST",
        body: JSON.stringify({ guess, feedbacks: feedbackStrings, boards }),
      });
      const data = await res.json();
      setBoards(data.boards);
      setBestGuess(data.bestGuess);
      setGuessHistory((prev) => [...prev, guess.toUpperCase()]);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);

      // Track which boards got ggggg before clearing feedbacks
      setSolvedBoardIndices((prev) => {
        const next = new Set(prev);
        feedbackStrings.forEach((fb, i) => {
          if (fb === "ggggg") next.add(i);
        });
        return next;
      });

      setGuess("");
      setFeedbacks(Array(32).fill(null).map(() => Array(5).fill("absent")));
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  // group boards into 8 columns x 4 rows
  const boardGrid = Array.from({ length: 32 }, (_, i) => i);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Bebas+Neue&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #111113;
          color: #e8e8e9;
          font-family: 'IBM Plex Mono', monospace;
          min-height: 100vh;
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1.5rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(83,141,78,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(83,141,78,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .header {
          width: 100%;
          max-width: 1100px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
          border-bottom: 1px solid #2a2a2c;
          padding-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.8rem;
          letter-spacing: 0.12em;
          color: #e8e8e9;
          line-height: 1;
        }

        .title span { color: #538d4e; }

        .subtitle {
          font-size: 0.65rem;
          color: #555;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .main {
          width: 100%;
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }

        /* ── Splash / Start ── */
        .splash {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 4rem 0;
        }

        .splash-label {
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #555;
        }

        .splash-count {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 5rem;
          color: #538d4e;
          line-height: 1;
        }

        /* ── Top bar (best guess + stats) ── */
        .top-bar {
          display: flex;
          gap: 12px;
          align-items: stretch;
        }

        .best-guess-card {
          flex: 1;
          background: #1c1c1e;
          border: 1px solid #2a2a2c;
          border-radius: 4px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: slideUp 0.35s ease;
        }

        .best-guess-card.flash-card {
          animation: flashBorder 0.6s ease;
        }

        .best-guess-label {
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 4px;
        }

        .best-guess-word {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          color: #e8e8e9;
          letter-spacing: 0.15em;
        }

        .stats-card {
          background: #1c1c1e;
          border: 1px solid #2a2a2c;
          border-radius: 4px;
          padding: 14px 20px;
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          line-height: 1;
        }

        .stat-value.active { color: #b59f3b; }
        .stat-value.solved { color: #538d4e; }
        .stat-value.total { color: #555; }

        .stat-label {
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #444;
        }

        /* ── Board grid ── */
        .boards-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 8px;
        }

        @media (max-width: 900px) {
          .boards-grid { grid-template-columns: repeat(4, 1fr); }
        }

        @media (max-width: 500px) {
          .boards-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .board-cell {
          background: #1a1a1c;
          border: 1px solid #252527;
          border-radius: 4px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          transition: border-color 0.2s;
        }

        .board-cell.is-solved {
          border-color: #538d4e33;
          background: #1a1e1a;
        }

        .board-cell.is-active {
          border-color: #2a2a2c;
        }

        .board-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .board-num {
          font-size: 0.55rem;
          color: #444;
          letter-spacing: 0.15em;
        }

        .board-solved-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #538d4e;
        }

        /* Mini tile row in each board */
        .mini-tile-row {
          display: flex;
          gap: 2px;
        }

        .mini-tile {
          flex: 1;
          aspect-ratio: 1;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.6rem;
          cursor: pointer;
          transition: filter 0.1s, transform 0.1s;
          user-select: none;
          border: 1px solid transparent;
        }

        .mini-tile:hover {
          filter: brightness(1.3);
          transform: scale(1.08);
        }

        .mini-tile.cursor-tile {
          border-color: #666 !important;
        }

        /* ── Input section ── */
        .input-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-label {
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
        }

        .tile-input-row {
          display: flex;
          gap: 6px;
        }

        .input-tile {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.9rem;
          border-radius: 3px;
          border: 1px solid #3a3a3c;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          user-select: none;
          color: white;
        }

        .input-tile:hover {
          filter: brightness(1.25);
          transform: scale(1.04);
        }

        .input-tile.active-cursor {
          border-color: #888 !important;
          box-shadow: 0 0 0 1px #888;
        }

        .hidden-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          width: 1px;
          height: 1px;
        }

        .shake { animation: shake 0.4s ease; }

        /* ── Controls ── */
        .controls {
          display: flex;
          gap: 10px;
        }

        .btn-primary {
          flex: 1;
          height: 48px;
          background: #538d4e;
          border: none;
          color: white;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 3px;
          transition: background 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #6aaf63;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .btn-secondary {
          height: 48px;
          padding: 0 20px;
          background: transparent;
          border: 1px solid #3a3a3c;
          color: #666;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.15s;
        }

        .btn-secondary:hover {
          border-color: #888;
          color: #aaa;
        }

        /* ── Guess history pills ── */
        .guess-history {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .history-label {
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #444;
          margin-right: 4px;
        }

        .guess-pill {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          padding: 3px 10px;
          background: #1a1a1c;
          border: 1px solid #2a2a2c;
          border-radius: 2px;
          color: #777;
        }

        /* ── Loading dots ── */
        .loading-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .loading-dots span {
          width: 5px;
          height: 5px;
          background: white;
          border-radius: 50%;
          animation: pulse 1s ease infinite;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes flipIn {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes flashBorder {
          0%, 100% { border-color: #2a2a2c; }
          50% { border-color: #538d4e; box-shadow: 0 0 20px #538d4e44; }
        }
      `}</style>

      <div className="app">
        <div className="bg-grid" />

        <header className="header">
          <div>
            <h1 className="title">DUOTRIGORDLE<span>.</span>AI</h1>
          </div>
          <div>
            <div className="subtitle">32-board entropy solver</div>
          </div>
        </header>

        <main className="main">
          {!started ? (
            <div className="splash">
              <div className="splash-label">simultaneous boards</div>
              <div className="splash-count">32</div>
              <button className="btn-primary" style={{ width: 200 }} onClick={start} disabled={loading}>
                {loading ? <div className="loading-dots"><span /><span /><span /></div> : "START SOLVING"}
              </button>
            </div>
          ) : (
            <>
              {/* Top bar */}
              <div className="top-bar">
                <div className={`best-guess-card ${flash ? "flash-card" : ""}`}>
                  <div>
                    <div className="best-guess-label">best next guess</div>
                    <div className="best-guess-word">{bestGuess.toUpperCase() || "—"}</div>
                  </div>
                  <span style={{ color: "#538d4e", fontSize: "1.4rem", opacity: 0.6 }}>→</span>
                </div>
                <div className="stats-card">
                  <div className="stat">
                    <span className="stat-value active">{activeBoards || 0}</span>
                    <span className="stat-label">active</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value solved">{solvedBoards}</span>
                    <span className="stat-label">solved</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value total">32</span>
                    <span className="stat-label">total</span>
                  </div>
                </div>
              </div>

              {/* Board grid */}
              <div className="boards-grid">
                {boardGrid.map((bi) => {
                  const boardWords: string[] = boards[bi] ?? [];
                  const isSolved = solvedBoardIndices.has(bi);
                  const wordDisplay = guess.toUpperCase().padEnd(5, " ").slice(0, 5);

                  return (
                    <div key={bi} className={`board-cell ${isSolved ? "is-solved" : "is-active"}`}>
                      <div className="board-header">
                        <span className="board-num">#{bi + 1}</span>
                        {isSolved && <div className="board-solved-dot" />}
                      </div>

                      {/* Current input row shown as mini tiles */}
                      <div className="mini-tile-row">
                        {Array.from({ length: 5 }, (_, ti) => {
                          const char = wordDisplay[ti]?.trim() || "";
                          const state: TileState = char ? feedbacks[bi][ti] : "empty";
                          const isCursor = ti === guess.length && guess.length < 5;
                          return (
                            <div
                              key={ti}
                              className={`mini-tile ${isCursor ? "cursor-tile" : ""}`}
                              style={{
                                background: STATE_COLORS[state],
                                color: "white",
                              }}
                              onClick={() => {
                                if (char && !isSolved) cycleTile(bi, ti);
                                else inputRef.current?.focus();
                              }}
                            >
                              {char}
                            </div>
                          );
                        })}
                      </div>

                      {/* Show remaining count if >1 */}
                      {!isSolved && boardWords.length >= 0 && (
                        <div style={{
                          fontSize: "0.5rem",
                          color: boardWords.length === 0 ? "#e63946" : boardWords.length <= 3 ? "#b59f3b" : "#444",
                          marginTop: 3,
                          letterSpacing: "0.1em"
                        }}>
                          {boardWords.length === 0 ? "INVALID" : `${boardWords.length} left`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="input-section">
                <div className="input-label">
                  {`guess #${guessHistory.length + 1} — type word, tap board tiles to color`}
                </div>

                <div
                  className={`tile-input-row ${shake ? "shake" : ""}`}
                  onClick={() => inputRef.current?.focus()}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const char = word[i]?.trim() || "";
                    const isCursor = i === guess.length && guess.length < 5;
                    return (
                      <div
                        key={i}
                        className={`input-tile ${isCursor ? "active-cursor" : ""}`}
                        style={{
                          background: char ? STATE_COLORS["absent"] : STATE_COLORS["empty"],
                          borderColor: char ? "transparent" : undefined,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          inputRef.current?.focus();
                        }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>

                <input
                  ref={inputRef}
                  className="hidden-input"
                  value={guess}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 5);
                    setGuess(v);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && next()}
                />

                <div className="controls">
                  <button
                    className="btn-primary"
                    onClick={next}
                    disabled={loading || guess.length !== 5}
                  >
                    {loading
                      ? <div className="loading-dots"><span /><span /><span /></div>
                      : "SUBMIT GUESS"}
                  </button>
                  <button className="btn-secondary" onClick={start}>
                    ↺ RESET
                  </button>
                </div>
              </div>

              {/* Guess history */}
              {guessHistory.length > 0 && (
                <div className="guess-history">
                  <span className="history-label">guesses</span>
                  {guessHistory.map((g, i) => (
                    <span key={i} className="guess-pill">{g}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}