"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type TileState = "correct" | "present" | "absent" | "empty";

const STATE_CYCLE: TileState[] = ["absent", "present", "correct"];
const STATE_COLORS: Record<TileState, string> = {
    correct: "#538d4e", // Green
    present: "#820458", // Purple
    absent: "#1a1a1b",  // Dark
    empty: "#0a0a0b",
};

interface GuessRow {
    equation: string;
    tiles: TileState[];
}

export default function NerdlePage() {
    const [currentGuess, setCurrentGuess] = useState("");
    const [tiles, setTiles] = useState<TileState[]>(Array(8).fill("absent"));
    const [history, setHistory] = useState<GuessRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const equation = currentGuess.padEnd(8, " ").slice(0, 8);

    const cycleTile = (i: number) => {
        if (!currentGuess[i]) return;
        setTiles((prev) => {
            const next = [...prev];
            const idx = STATE_CYCLE.indexOf(next[i]);
            next[i] = STATE_CYCLE[(idx + 1) % STATE_CYCLE.length];
            return next;
        });
    };

    const solve = async () => {
        if (currentGuess.length !== 8) {
            setError("Equation must be 8 characters.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            const feedback = tiles.map(t => (t === "correct" ? "g" : t === "present" ? "p" : "b")).join("");
            const res = await fetch("/api/nerdle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ guess: currentGuess, feedback, history }),
            });

            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setResult(data);
                setHistory([...history, { equation: currentGuess, tiles: [...tiles] }]);
                setCurrentGuess("");
                setTiles(Array(8).fill("absent"));
            }
        } catch (e) {
            setError("Failed to solve.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetch("/api/nerdle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess: "", feedback: "", history: [] }),
        })
            .then((res) => res.json())
            .then((data) => setResult(data))
            .finally(() => setLoading(false));

        inputRef.current?.focus();
    }, []);

    const reset = () => {
        setCurrentGuess("");
        setTiles(Array(8).fill("absent"));
        setHistory([]);
        setResult(null);
        setError("");

        setLoading(true);
        fetch("/api/nerdle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess: "", feedback: "", history: [] }),
        })
            .then((res) => res.json())
            .then((data) => setResult(data))
            .finally(() => setLoading(false));
    };

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
            linear-gradient(rgba(130,4,88,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(130,4,88,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .header {
          width: 100%;
          max-width: 560px;
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

        .title span { color: #820458; }

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
          max-width: 560px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }

        /* ── History ── */
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
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          letter-spacing: 0.05em;
          border-radius: 3px;
          border: 1px solid transparent;
          flex-shrink: 0;
          user-select: none;
          animation: flipIn 0.4s ease both;
          color: white;
        }

        /* ── Input section ── */
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
          width: 50px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          border-radius: 3px;
          border: 1px solid #3a3a3c;
          cursor: pointer;
          transition: all 0.15s;
          user-select: none;
          color: white;
        }

        .input-tile:hover { filter: brightness(1.3); transform: scale(1.04); }

        .input-tile.active-cursor {
          border-color: #820458 !important;
          box-shadow: 0 0 0 1px #820458;
        }

        .hidden-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          width: 1px;
          height: 1px;
        }

        /* ── Controls ── */
        .controls { display: flex; gap: 10px; }

        .btn-solve {
          flex: 1;
          height: 48px;
          background: #820458;
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

        .btn-solve:hover:not(:disabled) { background: #a8056f; transform: translateY(-1px); }
        .btn-solve:disabled { opacity: 0.45; cursor: not-allowed; }

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
        .btn-reset:hover { border-color: #888; color: #aaa; }

        /* ── Error ── */
        .error-box {
          padding: 10px 14px;
          background: #2a0e0e;
          border: 1px solid #5c1a1a;
          border-radius: 3px;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e06060;
        }

        /* ── Best guess card ── */
        .best-card {
          background: #1c1c1e;
          border: 1px solid #2a2a2c;
          border-radius: 4px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .best-label { font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #555; margin-bottom: 4px; }
        .best-word { font-family: 'Bebas Neue', sans-serif; font-size: 2.4rem; color: #e8e8e9; letter-spacing: 0.15em; }
        .best-arrow { color: #820458; font-size: 1.4rem; opacity: 0.6; }

        .count-block { text-align: right; }
        .count-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: #820458; line-height: 1; }
        .count-label { font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: #444; }

        /* ── Top candidates ── */
        .top-section {
          border: 1px solid #2a2a2c;
          border-radius: 4px;
          overflow: hidden;
        }

        .top-header {
          background: #1c1c1e;
          padding: 8px 14px;
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
          border-bottom: 1px solid #2a2a2c;
        }

        .top-list { display: flex; flex-direction: column; }

        .top-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 14px;
          border-bottom: 1px solid #1e1e20;
          gap: 12px;
          transition: background 0.12s;
        }
        .top-item:last-child { border-bottom: none; }
        .top-item:hover { background: #1a1a1c; }
        .top-item:first-child { border-left: 2px solid #82045855; }

        .top-rank { font-size: 0.6rem; color: #444; width: 20px; flex-shrink: 0; }
        .top-eq { font-family: 'Bebas Neue', sans-serif; font-size: 1.25rem; letter-spacing: 0.1em; flex: 1; }
        .top-item:first-child .top-eq { color: #c44a8a; }
        .top-score-label { font-size: 0.6rem; color: #555; }
        .top-score-val { font-size: 0.65rem; color: #820458; margin-left: 4px; }

        /* Loading dots */
        .loading-dots { display: flex; gap: 4px; align-items: center; }
        .loading-dots span { width: 5px; height: 5px; background: white; border-radius: 50%; animation: pulse 1s ease infinite; }
        .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes flipIn {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }

        @keyframes pulse {
          0%,100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1); }
        }
      `}</style>

            <div className="app">
                <div className="bg-grid" />

                <header className="header">
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <Link href="/" className="back-link">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            back
                        </Link>
                        <h1 className="title">NERDLE<span>.</span>AI</h1>
                    </div>
                    <div className="subtitle">equation solver</div>
                </header>

                <main className="main">
                    {/* Best guess card */}
                    {result && (
                        <div className="best-card">
                            <div>
                                <div className="best-label">best next guess</div>
                                <div className="best-word">{result?.bestGuess || "???"}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div className="count-block">
                                    <div className="count-num">{result?.count ?? 0}</div>
                                    <div className="count-label">possible</div>
                                </div>
                                <div className="best-arrow">→</div>
                            </div>
                        </div>
                    )}

                    {/* History */}
                    {history.length > 0 && (
                        <div className="history">
                            {history.map((row, ri) => (
                                <div key={ri} className="tile-row">
                                    {row.equation.split("").map((char, ci) => (
                                        <div
                                            key={ci}
                                            className="tile"
                                            style={{
                                                background: STATE_COLORS[row.tiles[ci]],
                                                animationDelay: `${ci * 0.07}s`,
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
                            {history.length === 0
                                ? "enter your first equation"
                                : `guess #${history.length + 1} — tap tiles to set colors`}
                        </div>

                        <div
                            className="tile-input-row"
                            onClick={() => inputRef.current?.focus()}
                        >
                            {Array.from({ length: 8 }, (_, i) => {
                                const char = equation[i]?.trim() || "";
                                const state = char ? tiles[i] : "empty";
                                const isCursor = i === currentGuess.length && currentGuess.length < 8;
                                return (
                                    <div
                                        key={i}
                                        className={`input-tile ${isCursor ? "active-cursor" : ""}`}
                                        style={{
                                            background: char ? STATE_COLORS[state] : "#1a1a1c",
                                            borderColor: char ? "transparent" : undefined,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (char) cycleTile(i);
                                            else inputRef.current?.focus();
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
                            autoFocus
                            value={currentGuess}
                            onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9+\-*/=]/g, "").slice(0, 8);
                                setCurrentGuess(v);
                                if (v.length > currentGuess.length) {
                                    setTiles((prev) => {
                                        const next = [...prev];
                                        next[v.length - 1] = "absent";
                                        return next;
                                    });
                                }
                            }}
                            onKeyDown={(e) => e.key === "Enter" && solve()}
                        />

                        <div className="controls">
                            <button
                                className="btn-solve"
                                onClick={solve}
                                disabled={loading || currentGuess.length !== 8}
                            >
                                {loading ? (
                                    <div className="loading-dots">
                                        <span /><span /><span />
                                    </div>
                                ) : (
                                    "ANALYZE"
                                )}
                            </button>
                            <button className="btn-reset" onClick={reset} title="Reset">↺</button>
                        </div>
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    {/* Top candidates */}
                    {result?.topCandidates && result.topCandidates.length > 0 && (
                        <div className="top-section">
                            <div className="top-header">top candidates</div>
                            <div className="top-list">
                                {result.topCandidates.map((c: any, i: number) => (
                                    <div key={i} className="top-item">
                                        <span className="top-rank">#{i + 1}</span>
                                        <span className="top-eq">{c.equation}</span>
                                        <span className="top-score-label">info</span>
                                        <span className="top-score-val">{c.score.toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </>
    );
}