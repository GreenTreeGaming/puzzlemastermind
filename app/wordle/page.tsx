"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Footer from "../components/Footer";
import words from "../../words.json";

type TileState = "correct" | "present" | "absent" | "empty";

const STATE_CYCLE: TileState[] = ["absent", "present", "correct"];
const STATE_COLORS: Record<TileState, string> = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent: "#3a3a3c",
  empty: "#1a1a1b",
};
const STATE_LABELS: Record<TileState, string> = {
  correct: "G",
  present: "Y",
  absent: "B",
  empty: "·",
};

interface GuessRow {
  word: string;
  tiles: TileState[];
}

interface SolverResult {
  bestGuess: string;
  possible: string[];
  top3: { word: string; worstCase: number }[];
}

export default function Home() {
  const [currentWord, setCurrentWord] = useState("");
  const [tiles, setTiles] = useState<TileState[]>(Array(5).fill("absent"));
  const [history, setHistory] = useState<GuessRow[]>([]);
  const [possible, setPossible] = useState<string[]>(words);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = currentWord.toUpperCase().padEnd(5, " ").slice(0, 5);

  const cycleTile = (i: number) => {
    if (!currentWord[i]) return;
    setTiles((prev) => {
      const next = [...prev];
      const idx = STATE_CYCLE.indexOf(next[i]);
      next[i] = STATE_CYCLE[(idx + 1) % STATE_CYCLE.length];
      return next;
    });
  };

  const feedbackString = tiles
    .map((t) => (t === "correct" ? "g" : t === "present" ? "y" : "b"))
    .join("");

  const solve = async () => {
    if (currentWord.trim().length !== 5) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        body: JSON.stringify({ guess: currentWord.toLowerCase(), feedback: feedbackString, possible }),
      });
      const data = await res.json();

      if (data.error) {
        setResult({
          ...result,
          possible: [],
          bestGuess: "N/A",
          top3: [],
          error: data.error
        } as any);
        setPossible([]);
      } else {
        setResult(data);
        setPossible(data.possible);
        setFlash(true);
        setTimeout(() => setFlash(false), 600);
      }
      setHistory((prev) => [...prev, { word: currentWord.toUpperCase(), tiles: [...tiles] }]);
      setCurrentWord("");
      setTiles(Array(5).fill("absent"));
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const getFirstGuess = async () => {
    const res = await fetch("/api/solve", {
      method: "POST",
      body: JSON.stringify({
        guess: "",
        feedback: "",
        possible: [],
      }),
    });

    const data = await res.json();
    setResult(data);
  };

  const reset = () => {
    setCurrentWord("");
    setTiles(Array(5).fill("absent"));
    setHistory([]);
    setPossible(words);

    getFirstGuess(); // 🔥 THIS IS THE FIX
  };

  useEffect(() => {
    // get best opening move immediately
    fetch("/api/solve", {
      method: "POST",
      body: JSON.stringify({
        guess: "",
        feedback: "",
        possible: words,
      }),
    })
      .then((res) => res.json())
      .then((data) => setResult(data));

    inputRef.current?.focus();
  }, []);

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
          padding: 2rem 1rem 4rem;
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
          max-width: 500px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2.5rem;
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

        .title span {
          color: #538d4e;
        }

        .subtitle {
          font-size: 0.65rem;
          color: #555;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .back-link {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #555;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
          margin-bottom: 6px;
        }
        .back-link:hover { color: #aaa; }

        .main {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }

        /* History rows */
        .history {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tile-row {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .tile {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.9rem;
          letter-spacing: 0.05em;
          border-radius: 3px;
          transition: background 0.18s, border-color 0.18s, transform 0.12s;
          border: 1px solid transparent;
          flex-shrink: 0;
          user-select: none;
        }

        .tile.history-tile {
          animation: flipIn 0.4s ease both;
        }

        /* Input row */
        .input-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .label {
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
        }

        .input-tile:hover {
          filter: brightness(1.25);
          transform: scale(1.04);
        }

        .input-tile.active-cursor {
          border-color: #888 !important;
          box-shadow: 0 0 0 1px #888;
        }

        .input-tile .state-dot {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
        }

        .hidden-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          width: 1px;
          height: 1px;
        }

        .shake {
          animation: shake 0.4s ease;
        }

        /* Controls */
        .controls {
          display: flex;
          gap: 10px;
        }

        .btn-solve {
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

        .btn-solve:hover:not(:disabled) {
          background: #6aaf63;
          transform: translateY(-1px);
        }

        .btn-solve:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .btn-reset {
          width: 48px;
          height: 48px;
          background: transparent;
          border: 1px solid #3a3a3c;
          color: #666;
          font-size: 1.1rem;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-reset:hover {
          border-color: #888;
          color: #aaa;
        }

        /* Results panel */
        .results {
          border: 1px solid #2a2a2c;
          border-radius: 4px;
          overflow: hidden;
          animation: slideUp 0.35s ease;
        }

        .results.flash {
          animation: flashBorder 0.6s ease;
        }

        .results-header {
          background: #1c1c1e;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #2a2a2c;
        }

        .results-header-left {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .results-label {
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
        }

        .remaining-count {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          color: #538d4e;
          line-height: 1;
        }

        .remaining-count.low { color: #b59f3b; }
        .remaining-count.very-low { color: #e63946; }

        .best-guess-section {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1e1e20;
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

        .best-guess-arrow {
          color: #538d4e;
          font-size: 1.4rem;
          opacity: 0.6;
        }

        .top3-section {
          padding: 12px 16px;
        }

        .top3-label {
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 10px;
        }

        .top3-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .top3-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #1a1a1c;
          border-radius: 3px;
          border: 1px solid #252527;
          transition: border-color 0.15s;
        }

        .top3-item:first-child {
          border-color: #538d4e33;
        }

        .top3-rank {
          font-size: 0.6rem;
          color: #444;
          width: 16px;
        }

        .top3-word {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.12em;
          flex: 1;
          padding-left: 10px;
        }

        .top3-score {
          font-size: 0.65rem;
          color: #555;
        }

        .top3-score span {
          color: #b59f3b;
        }

        .possible-words {
          padding: 0 16px 16px;
        }

        .possible-label {
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 8px;
          padding-top: 12px;
          border-top: 1px solid #1e1e20;
        }

        .word-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          max-height: 120px;
          overflow-y: auto;
        }

        .word-chip {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          padding: 3px 8px;
          background: #1a1a1c;
          border: 1px solid #2a2a2c;
          border-radius: 2px;
          color: #aaa;
          letter-spacing: 0.08em;
        }

        .word-chip.highlight {
          border-color: #538d4e55;
          color: #538d4e;
        }

        .more-chip {
          font-size: 0.65rem;
          padding: 3px 8px;
          color: #444;
          border: 1px solid #222;
          border-radius: 2px;
          font-style: italic;
        }

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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href="/" className="back-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              back
            </Link>
            <h1 className="title">WORDLE<span>.</span>AI</h1>
          </div>
          <div>
            <div className="subtitle">entropy solver</div>
          </div>
        </header>

        <main className="main">
          {/* History */}
          {history.length > 0 && (
            <div className="history">
              {history.map((row, ri) => (
                <div key={ri} className="tile-row">
                  {row.word.split("").map((char, ci) => (
                    <div
                      key={ci}
                      className="tile history-tile"
                      style={{
                        background: STATE_COLORS[row.tiles[ci]],
                        animationDelay: `${ci * 0.08}s`,
                        color: "white",
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="input-section">
            <div className="label">
              {history.length === 0 ? "enter your first guess" : `guess #${history.length + 1} — tap tiles to set colors`}
            </div>

            <div className={`tile-input-row ${shake ? "shake" : ""}`}
              onClick={() => inputRef.current?.focus()}>
              {Array.from({ length: 5 }, (_, i) => {
                const char = word[i]?.trim() || "";
                const state = char ? tiles[i] : "empty";
                const isCursor = i === currentWord.length && currentWord.length < 5;
                return (
                  <div
                    key={i}
                    className={`input-tile ${isCursor ? "active-cursor" : ""}`}
                    style={{
                      background: STATE_COLORS[state],
                      borderColor: char ? "transparent" : undefined,
                      color: "white",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (char) cycleTile(i);
                      else inputRef.current?.focus();
                    }}
                  >
                    {char || ""}
                    {char && <div className="state-dot" />}
                  </div>
                );
              })}
            </div>

            <input
              ref={inputRef}
              className="hidden-input"
              value={currentWord}
              onChange={(e) => {
                const v = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 5);
                setCurrentWord(v);
                setTiles((prev) => {
                  const next = [...prev];
                  for (let i = v.length; i < 5; i++) next[i] = "absent";
                  return next;
                });
              }}
              onKeyDown={(e) => e.key === "Enter" && solve()}
            />

            <div className="controls">
              <button
                className="btn-solve"
                onClick={solve}
                disabled={loading || currentWord.length !== 5}
              >
                {loading ? (
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                ) : (
                  <>ANALYZE</>
                )}
              </button>
              <button className="btn-reset" onClick={reset} title="Reset">
                ↺
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className={`results ${flash ? "flash" : ""}`}>
              <div className="results-header">
                <div className="results-header-left">
                  <span className="results-label">remaining</span>
                  <span
                    className={`remaining-count ${result.possible?.length <= 2
                      ? "very-low"
                      : result.possible?.length <= 10
                        ? "low"
                        : ""
                      }`}
                  >
                    {result.possible?.length ?? 0}
                  </span>
                </div>
                <span className="results-label">
                  {result.possible.length === 1 ? "🟩 solved" : `words left`}
                </span>
              </div>

              <div className="best-guess-section">
                <div>
                  <div className="best-guess-label">best next guess</div>
                  <div className="best-guess-word">{(result.bestGuess || "N/A").toUpperCase()}</div>
                </div>
                <div className="best-guess-arrow">→</div>
              </div>

              <div className="top3-section">
                <div className="top3-label">top candidates</div>
                <div className="top3-list">
                  {result.top3.map((w, i) => (
                    <div key={i} className="top3-item">
                      <span className="top3-rank">#{i + 1}</span>
                      <span className="top3-word">{w.word.toUpperCase()}</span>
                      <span className="top3-score">
                        worst <span>{w.worstCase}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {result.possible?.length > 0 && result.possible?.length <= 30 && (
                <div className="possible-words">
                  <div className="possible-label">possible answers</div>
                  <div className="word-chips">
                    {result.possible.slice(0, 30).map((w, i) => (
                      <span
                        key={i}
                        className={`word-chip ${w === result.bestGuess ? "highlight" : ""}`}
                      >
                        {w.toUpperCase()}
                      </span>
                    ))}
                    {result.possible.length > 30 && (
                      <span className="more-chip">+{result.possible.length - 30} more</span>
                    )}
                  </div>
                </div>
              )}

              {(result as any).error && (
                <div style={{ padding: '16px', color: '#e63946', fontSize: '0.7rem', borderTop: '1px solid #2a2a2c' }}>
                  ⚠️ NO MATCHES FOUND. Check your tile colors!
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}