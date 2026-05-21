"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type ClueStatus = 'warmer' | 'cooler' | 'adjacent';

interface Clue {
  country: string;
  distance: number;
  status: ClueStatus;
}

interface SolverResult {
  possible: string[];
  bestGuess: string;
  count: number;
  top10: { country: string; error: number }[];
}

export default function GloblePage() {
  const [clues, setClues] = useState<Clue[]>([]);
  const [country, setCountry] = useState("");
  const [distance, setDistance] = useState("");
  const [result, setResult] = useState<SolverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const countryRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    query([]);
  }, []);

  async function query(newClues: Clue[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/globle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clues: newClues }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  async function addClue(status: ClueStatus) {
    if (!country.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    let dist = 0;
    if (status === 'warmer') {
      const parsed = parseFloat(distance);
      if (!distance.trim() || isNaN(parsed)) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      dist = parsed;
    }

    const newClue: Clue = {
      country: country.trim(),
      distance: dist,
      status,
    };
    const newClues = [...clues, newClue];

    setClues(newClues);
    setCountry("");
    setDistance("");
    countryRef.current?.focus();
    await query(newClues);
  }


  async function reset() {
    setClues([]);
    setCountry("");
    setDistance("");
    await query([]);
  }

  function heatColor(status: ClueStatus): string {
    if (status === 'adjacent') return "#538d4e";
    if (status === 'cooler') return "#2c3e50";
    return "#e67e22";
  }


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111113; color: #e8e8e9; font-family: 'IBM Plex Mono', monospace; min-height: 100vh; }

        .app { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem 4rem; position: relative; }

        .bg-grid {
          position: fixed; inset: 0;
          background-image: linear-gradient(rgba(83,141,78,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(83,141,78,0.04) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none; z-index: 0;
        }

        .header {
          width: 100%; max-width: 560px; display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 2rem;
          border-bottom: 1px solid #2a2a2c; padding-bottom: 1rem; position: relative; z-index: 1;
        }
        .title { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; letter-spacing: 0.12em; color: #e8e8e9; line-height: 1; }
        .title span { color: #e67e22; }
        .subtitle { font-size: 0.65rem; color: #555; letter-spacing: 0.2em; text-transform: uppercase; }

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

        .main { width: 100%; max-width: 560px; display: flex; flex-direction: column; gap: 1.25rem; position: relative; z-index: 1; }

        /* ── Best guess card ── */
        .best-card {
          background: #1c1c1e; border: 1px solid #2a2a2c; border-radius: 4px;
          padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;
        }
        .best-label { font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #555; margin-bottom: 4px; }
        .best-word { font-family: 'Bebas Neue', sans-serif; font-size: 2.4rem; color: #e8e8e9; letter-spacing: 0.15em; }
        .best-count { text-align: right; }
        .count-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: #e67e22; line-height: 1; }
        .count-label { font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: #444; }

        /* ── Clue history ── */
        .clue-list { display: flex; flex-direction: column; gap: 6px; }

        .clue-item {
          display: grid;
          grid-template-columns: 10px 1fr auto;
          align-items: center; gap: 10px;
          padding: 9px 12px;
          background: #1a1a1c; border: 1px solid #252527; border-radius: 3px;
        }
        .clue-item.is-closest { border-color: #e67e2255; }

        .clue-heat { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .clue-country { font-size: 0.8rem; color: #ccc; }
        .clue-distance { font-size: 0.7rem; color: #666; letter-spacing: 0.05em; white-space: nowrap; }

        .badge {
          font-size: 0.55rem; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 2px 6px; border-radius: 2px; white-space: nowrap; cursor: default;
        }
        .badge-adjacent { background: #538d4e22; color: #538d4e; border: 1px solid #538d4e44; }
        .badge-closest { background: #e67e2222; color: #e67e22; border: 1px solid #e67e2244; }
        .badge-not-closest {
          background: transparent; color: #444; border: 1px solid #333;
          cursor: pointer; transition: all 0.15s;
        }
        .badge-not-closest:hover { border-color: #e67e2255; color: #e67e22; }

        /* ── Input section ── */
        .input-section { display: flex; flex-direction: column; gap: 10px; }
        .input-label { font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #555; }

        .input-row { display: flex; gap: 8px; }

        .text-input {
          flex: 1; height: 44px; background: #1a1a1c; border: 1px solid #3a3a3c;
          border-radius: 3px; color: #e8e8e9; font-family: 'IBM Plex Mono', monospace;
          font-size: 0.85rem; padding: 0 12px; outline: none; transition: border-color 0.15s;
        }
        .text-input:focus { border-color: #888; }
        .text-input::placeholder { color: #444; }
        .text-input:disabled { opacity: 0.35; }

        .dist-input { width: 110px; flex: none; }

        /* Adjacent toggle */
        .adj-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; background: #1a1a1c; border: 1px solid #252527;
          border-radius: 3px; cursor: pointer; user-select: none; transition: border-color 0.15s;
        }
        .adj-row:hover { border-color: #538d4e55; }
        .adj-row.active { border-color: #538d4e; background: #538d4e11; }

        .adj-check {
          width: 16px; height: 16px; border: 1px solid #3a3a3c; border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; color: #538d4e; background: transparent; transition: all 0.15s;
          flex-shrink: 0;
        }
        .adj-row.active .adj-check { background: #538d4e22; border-color: #538d4e; }

        .adj-label { font-size: 0.75rem; color: #888; }
        .adj-row.active .adj-label { color: #538d4e; }
        .adj-hint { font-size: 0.6rem; color: #444; margin-left: auto; }

        .shake { animation: shake 0.4s ease; }

        /* ── Controls ── */
        .controls { display: flex; gap: 8px; }

        .btn-primary {
          flex: 1; height: 44px; background: #e67e22; border: none; color: white;
          font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; border-radius: 3px;
          transition: background 0.15s, transform 0.1s;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-primary:hover:not(:disabled) { background: #f39c12; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-secondary {
          height: 44px; padding: 0 16px; background: transparent; border: 1px solid #3a3a3c;
          color: #666; font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem;
          font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; border-radius: 3px; transition: all 0.15s;
        }
        .btn-secondary:hover { border-color: #888; color: #aaa; }

        /* ── Top 10 ── */
        .top10-section { border: 1px solid #2a2a2c; border-radius: 4px; overflow: hidden; }
        .top10-header { background: #1c1c1e; padding: 8px 14px; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #555; border-bottom: 1px solid #2a2a2c; }
        .top10-list { display: flex; flex-direction: column; }
        .top10-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 7px 14px; border-bottom: 1px solid #1e1e20; gap: 12px;
        }
        .top10-item:last-child { border-bottom: none; }
        .top10-rank { font-size: 0.6rem; color: #444; width: 20px; flex-shrink: 0; }
        .top10-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 0.1em; flex: 1; }
        .top10-err { font-size: 0.65rem; color: #555; }
        .top10-item:first-child .top10-name { color: #e67e22; }

        /* ── Possible chips ── */
        .possible-section { border: 1px solid #2a2a2c; border-radius: 4px; overflow: hidden; }
        .possible-header { background: #1c1c1e; padding: 8px 14px; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: #555; border-bottom: 1px solid #2a2a2c; }
        .word-chips { display: flex; flex-wrap: wrap; gap: 5px; padding: 12px; max-height: 150px; overflow-y: auto; }
        .word-chip { font-size: 0.7rem; padding: 3px 8px; background: #1a1a1c; border: 1px solid #2a2a2c; border-radius: 2px; color: #aaa; }
        .word-chip.highlight { border-color: #e67e2255; color: #e67e22; }

        /* Loading */
        .loading-dots { display: flex; gap: 4px; align-items: center; }
        .loading-dots span { width: 5px; height: 5px; background: white; border-radius: 50%; animation: pulse 1s ease infinite; }
        .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>

      <div className="app">
        <div className="bg-grid" />
        <header className="header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href="/" className="back-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              back
            </Link>
            <h1 className="title">GLOBLE<span>.</span>AI</h1>
          </div>
          <div className="subtitle">distance solver</div>
        </header>

        <main className="main">
          {/* Best guess card */}
          {result && (
            <div className="best-card">
              <div>
                <div className="best-label">best next guess</div>
                <div className="best-word">{result.bestGuess}</div>
              </div>
              <div className="best-count">
                <div className="count-num">{result.count}</div>
                <div className="count-label">possible</div>
              </div>
            </div>
          )}

          {/* Clue history */}
          {clues.length > 0 && (
            <div className="clue-list">
              {clues.map((c, i) => (
                <div key={i} className="clue-item">
                  <div className="clue-heat" style={{ background: heatColor(c.status) }} />
                  <span className="clue-country">{c.country}</span>
                  {c.status === 'warmer' && (
                    <span className="clue-distance" style={{ fontSize: '0.7rem', color: '#666' }}>
                      {c.distance.toLocaleString()} km
                    </span>
                  )}
                  <span className={`badge badge-${c.status}`}>
                    {c.status === 'warmer' ? 'new closest' : c.status === 'cooler' ? 'not closest' : 'adjacent'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {clues.length > 0 && (
            <div style={{ fontSize: "0.6rem", color: "#444", letterSpacing: "0.05em", paddingLeft: 2 }}>
              💡 Only click <strong style={{ color: '#e67e22' }}>NEW CLOSEST</strong> if the <em style={{ color: "#666" }}>Closest border</em> km changes! Otherwise, just click <strong>NOT CLOSEST</strong> and leave km blank.
            </div>
          )}

          {/* Input section */}
          <div className={`input-section ${shake ? "shake" : ""}`}>
            <div className="input-label">
              {clues.length === 0 ? "enter your first guess" : "add feedback"}
            </div>

            <div className="input-row">
              <input
                ref={countryRef}
                className="text-input"
                placeholder="country guessed"
                value={country}
                onChange={e => setCountry(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") addClue('warmer');
                }}
              />
              <input
                className="text-input dist-input"
                placeholder="km (if Warmer)"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                type="number"
                min="0"
                style={{ width: '130px' }}
              />
            </div>

            <div className="controls">
              <button
                className="btn-primary"
                style={{ background: '#538d4e' }}
                onClick={() => addClue('adjacent')}
                disabled={loading}
              >
                ADJACENT
              </button>
              <button
                className="btn-primary"
                style={{ background: '#e67e22', fontSize: '0.7rem' }}
                onClick={() => addClue('warmer')}
                disabled={loading}
              >
                NEW CLOSEST (km updated)
              </button>
              <button
                className="btn-primary"
                style={{ background: '#2c3e50', fontSize: '0.7rem' }}
                onClick={() => addClue('cooler')}
                disabled={loading}
              >
                NOT CLOSEST
              </button>
            </div>

            <button
              className="btn-secondary"
              style={{ width: '100%', marginTop: 4 }}
              onClick={reset}
              disabled={loading}
            >
              ↺ RESET GAME
            </button>
          </div>


          {/* Top 10 ranked */}
          {result && result.top10 && result.top10.length > 0 && (
            <div className="top10-section">
              <div className="top10-header">top ranked candidates</div>
              <div className="top10-list">
                {result.top10.map((c, i) => (
                  <div key={i} className="top10-item">
                    <span className="top10-rank">#{i + 1}</span>
                    <span className="top10-name">{c.country}</span>
                    <span className="top10-err">{c.error.toLocaleString()} km err</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Possible countries */}
          {result && result.possible.length > 0 && (
            <div className="possible-section">
              <div className="possible-header">possible countries ({result.count})</div>
              <div className="word-chips">
                {result.possible.slice(0, 60).map((c, i) => (
                  <span key={i} className={`word-chip ${c === result.bestGuess ? "highlight" : ""}`}>{c}</span>
                ))}
                {result.count > 60 && (
                  <span className="word-chip" style={{ color: "#444", fontStyle: "italic" }}>+{result.count - 60} more</span>
                )}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}