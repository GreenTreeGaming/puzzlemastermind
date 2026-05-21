"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

export default function SpellingBeePage() {
    const [centerLetter, setCenterLetter] = useState("");
    const [letters, setLetters] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        words: any[];
        totalWords: number;
        totalScore: number;
        pangrams: string[];
    } | null>(null);

    const handleSolve = async () => {
        setError("");
        setLoading(true);

        const fullLetterString = letters.join("");
        if (fullLetterString.length !== 6 || centerLetter.length !== 1) {
            setError("Please fill all letters (1 center and 6 outer letters).");
            setLoading(false);
            return;
        }

        const allUnique = new Set([...letters.map(l => l.toLowerCase()), centerLetter.toLowerCase()]);
        if (allUnique.size !== 7) {
            setError("All 7 letters must be unique.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/spelling-bee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ letters: letters.map(l => l.toLowerCase()), centerLetter: centerLetter.toLowerCase() }),
            });

            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setResults(data);
            }
        } catch (e) {
            setError("Something went wrong. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleLetterChange = (index: number, value: string) => {
        const val = value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(-1);
        const newLetters = [...letters];
        newLetters[index] = val;
        setLetters(newLetters);

        if (val && index < 5) {
            const nextInput = document.getElementById(`letter-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleCenterChange = (value: string) => {
        const val = value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(-1);
        setCenterLetter(val);
        if (val) {
            const nextInput = document.getElementById(`letter-0`);
            nextInput?.focus();
        }
    };

    const clearAll = () => {
        setCenterLetter("");
        setLetters(["", "", "", "", "", ""]);
        setResults(null);
        setError("");
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

                .sb-app {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 2rem 1rem 4rem;
                    position: relative;
                }

                .bg-grid {
                    position: fixed;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(230,180,34,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(230,180,34,0.04) 1px, transparent 1px);
                    background-size: 40px 40px;
                    pointer-events: none;
                    z-index: 0;
                }

                .sb-header {
                    width: 100%;
                    max-width: 780px;
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #2a2a2c;
                    padding-bottom: 1rem;
                    position: relative;
                    z-index: 1;
                }

                .sb-back {
                    font-size: 0.6rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #555;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: color 0.15s;
                }
                .sb-back:hover { color: #aaa; }

                .sb-title {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 2.8rem;
                    letter-spacing: 0.12em;
                    color: #e8e8e9;
                    line-height: 1;
                }
                .sb-title span { color: #e6b422; }

                .sb-subtitle {
                    font-size: 0.65rem;
                    color: #555;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                }

                .sb-main {
                    width: 100%;
                    max-width: 780px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2.5rem;
                    position: relative;
                    z-index: 1;
                    align-items: start;
                }

                @media (max-width: 640px) {
                    .sb-main { grid-template-columns: 1fr; }
                }

                /* ── Left column ── */
                .sb-left { display: flex; flex-direction: column; gap: 1.5rem; }

                /* Hex Grid */
                .hex-container {
                    display: flex;
                    justify-content: center;
                    padding: 2.5rem 0 1rem;
                    position: relative;
                }

                .hex-wrap {
                    position: relative;
                    width: 240px;
                    height: 240px;
                }

                .hex-input {
                    position: absolute;
                    width: 64px;
                    height: 64px;
                    background: #1a1a1c;
                    border: 1px solid #3a3a3c;
                    color: #e8e8e9;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.9rem;
                    text-align: center;
                    text-transform: uppercase;
                    outline: none;
                    transition: border-color 0.15s, background 0.15s;
                    cursor: pointer;
                    letter-spacing: 0.05em;
                    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                    -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    caret-color: transparent;
                }

                .hex-input:focus {
                    border-color: #666;
                    background: #252527;
                }

                .hex-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 2;
                    width: 72px;
                    height: 72px;
                    background: #e6b422;
                    color: #111113;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 2.2rem;
                    text-align: center;
                    text-transform: uppercase;
                    outline: none;
                    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                    -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                    border: none;
                    cursor: pointer;
                    letter-spacing: 0.05em;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    caret-color: transparent;
                    transition: filter 0.15s;
                }

                .hex-center:focus { filter: brightness(1.15); }

                .center-required {
                    text-align: center;
                    font-size: 0.55rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #e6b42266;
                    margin-top: 0.5rem;
                }

                /* Input section */
                .sb-input-section { display: flex; flex-direction: column; gap: 10px; }

                .sb-label {
                    font-size: 0.6rem;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: #555;
                }

                .sb-controls { display: flex; gap: 8px; }

                .btn-solve {
                    flex: 1;
                    height: 48px;
                    background: #e6b422;
                    border: none;
                    color: #111113;
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
                .btn-solve:hover:not(:disabled) { background: #f0c72e; transform: translateY(-1px); }
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

                .sb-error {
                    background: #e6342211;
                    border: 1px solid #e6342233;
                    color: #e63422;
                    padding: 10px 14px;
                    font-size: 0.7rem;
                    letter-spacing: 0.08em;
                    border-radius: 3px;
                    animation: slideUp 0.2s ease;
                }

                /* ── Right column ── */
                .sb-right { display: flex; flex-direction: column; gap: 1.25rem; }

                /* Stats row */
                .stats-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 8px;
                }

                .stat-card {
                    background: #1c1c1e;
                    border: 1px solid #2a2a2c;
                    border-radius: 4px;
                    padding: 12px 14px;
                }
                .stat-label {
                    font-size: 0.55rem;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: #555;
                    margin-bottom: 4px;
                }
                .stat-value {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 2rem;
                    line-height: 1;
                    color: #e8e8e9;
                }
                .stat-value.yellow { color: #e6b422; }
                .stat-value.purple { color: #a855f7; }

                /* Pangrams section */
                .sb-section { border: 1px solid #2a2a2c; border-radius: 4px; overflow: hidden; }
                .sb-section-header {
                    background: #1c1c1e;
                    padding: 8px 14px;
                    font-size: 0.6rem;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: #555;
                    border-bottom: 1px solid #2a2a2c;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .sb-section-header span { color: #a855f7; }

                .pangram-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    padding: 12px;
                }

                .pangram-chip {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.1rem;
                    letter-spacing: 0.1em;
                    padding: 4px 10px;
                    background: #a855f711;
                    border: 1px solid #a855f733;
                    border-radius: 2px;
                    color: #c084fc;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .pangram-score {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 0.6rem;
                    color: #a855f766;
                }

                /* Word table */
                .word-table-wrap {
                    max-height: 420px;
                    overflow-y: auto;
                }
                .word-table-wrap::-webkit-scrollbar { width: 6px; }
                .word-table-wrap::-webkit-scrollbar-track { background: transparent; }
                .word-table-wrap::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
                .word-table-wrap::-webkit-scrollbar-thumb:hover { background: #3f3f46; }

                table { width: 100%; border-collapse: collapse; }
                thead th {
                    position: sticky;
                    top: 0;
                    background: #1a1a1c;
                    padding: 8px 14px;
                    text-align: left;
                    font-size: 0.55rem;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: #444;
                    border-bottom: 1px solid #252527;
                    font-weight: 700;
                }
                thead th:last-child { text-align: right; }

                tbody tr {
                    border-bottom: 1px solid #1e1e20;
                    transition: background 0.1s;
                }
                tbody tr:last-child { border-bottom: none; }
                tbody tr:hover { background: #1e1e21; }

                tbody td {
                    padding: 8px 14px;
                    font-size: 0.8rem;
                }
                tbody td:last-child {
                    text-align: right;
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 0.7rem;
                    color: #555;
                }
                tbody tr:hover td:last-child { color: #e6b422; }

                .word-name { color: #ccc; letter-spacing: 0.05em; }
                .word-name.palindrome { color: #e6b422; }
                .palindrome-badge {
                    font-size: 0.5rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    padding: 1px 5px;
                    background: #e6b42211;
                    border: 1px solid #e6b42233;
                    color: #e6b422;
                    border-radius: 2px;
                    margin-left: 6px;
                    vertical-align: middle;
                }

                /* Empty state */
                .empty-state {
                    border: 1px dashed #2a2a2c;
                    border-radius: 4px;
                    padding: 3rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    text-align: center;
                }
                .empty-icon {
                    width: 56px;
                    height: 56px;
                    background: #1a1a1c;
                    border: 1px solid #2a2a2c;
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #444;
                    font-size: 1.5rem;
                }
                .empty-title {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.6rem;
                    letter-spacing: 0.12em;
                    color: #333;
                }
                .empty-desc {
                    font-size: 0.65rem;
                    color: #444;
                    letter-spacing: 0.08em;
                    line-height: 1.7;
                    max-width: 220px;
                }
                .empty-placeholder {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                    width: 100%;
                    opacity: 0.15;
                    margin-top: 0.5rem;
                }
                .empty-placeholder-block {
                    height: 48px;
                    background: #1a1a1c;
                    border: 1px solid #2a2a2c;
                    border-radius: 3px;
                }

                /* Loading dots */
                .loading-dots { display: flex; gap: 4px; align-items: center; }
                .loading-dots span {
                    width: 5px; height: 5px;
                    background: #111113;
                    border-radius: 50%;
                    animation: pulse 1s ease infinite;
                }
                .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
                .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

                @keyframes slideUp {
                    from { transform: translateY(8px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <div className="sb-app">
                <div className="bg-grid" />

                <header className="sb-header">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Link href="/" className="sb-back">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            back
                        </Link>
                        <h1 className="sb-title">SPELLING<span>.</span>BEE</h1>
                    </div>
                    <div className="sb-subtitle">pangram solver</div>
                </header>

                <main className="sb-main">
                    {/* ── Left: Input ── */}
                    <div className="sb-left">
                        <div className="hex-container">
                            <div>
                                <div className="hex-wrap">
                                    {/* Center hex */}
                                    <input
                                        id="center-letter"
                                        className="hex-center"
                                        type="text"
                                        value={centerLetter}
                                        onChange={(e) => handleCenterChange(e.target.value)}
                                        placeholder="?"
                                        autoFocus
                                        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute', zIndex: 2 }}
                                    />

                                    {/* Outer hexes */}
                                    {[...Array(6)].map((_, i) => {
                                        const angle = (i * 60 - 30) * (Math.PI / 180);
                                        const radius = 95;
                                        const cx = 120; const cy = 120;
                                        const top = cy + radius * Math.sin(angle);
                                        const left = cx + radius * Math.cos(angle);

                                        return (
                                            <input
                                                key={i}
                                                id={`letter-${i}`}
                                                className="hex-input"
                                                type="text"
                                                value={letters[i]}
                                                onChange={(e) => handleLetterChange(i, e.target.value)}
                                                placeholder="?"
                                                style={{
                                                    position: 'absolute',
                                                    top: `${top}px`,
                                                    left: `${left}px`,
                                                    transform: 'translate(-50%, -50%)',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="center-required">center · required in all words</div>
                            </div>
                        </div>

                        <div className="sb-input-section">
                            <div className="sb-label">
                                {centerLetter ? `center: ${centerLetter.toUpperCase()} · outer: ${letters.filter(Boolean).join(" ") || "—"}` : "enter center letter first"}
                            </div>

                            <div className="sb-controls">
                                <button
                                    className="btn-solve"
                                    onClick={handleSolve}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="loading-dots">
                                            <span /><span /><span />
                                        </div>
                                    ) : <>FIND WORDS</>}
                                </button>
                                <button
                                    className="btn-reset"
                                    onClick={clearAll}
                                    title="Clear all"
                                >
                                    ↺
                                </button>
                            </div>

                            {error && (
                                <div className="sb-error">{error}</div>
                            )}
                        </div>

                        {/* Quick tips */}
                        <div style={{ fontSize: '0.6rem', color: '#444', letterSpacing: '0.05em', lineHeight: 1.7, paddingLeft: 2 }}>
                            💡 Click the center hex first, then fill outer letters. <strong style={{ color: '#666' }}>Pangrams</strong> use all 7 letters and score bonus points.
                        </div>
                    </div>

                    {/* ── Right: Results ── */}
                    <div className="sb-right">
                        {results ? (
                            <>
                                {/* Stats */}
                                <div className="stats-row">
                                    <div className="stat-card">
                                        <div className="stat-label">words</div>
                                        <div className="stat-value">{results.totalWords}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-label">score</div>
                                        <div className="stat-value yellow">{results.totalScore}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-label">pangrams</div>
                                        <div className="stat-value purple">{results.pangrams.length}</div>
                                    </div>
                                </div>

                                {/* Pangrams */}
                                {results.pangrams.length > 0 && (
                                    <div className="sb-section">
                                        <div className="sb-section-header">
                                            pangrams
                                            <span>{results.pangrams.length} found</span>
                                        </div>
                                        <div className="pangram-chips">
                                            {results.words.filter(w => w.isPangram).map((word, idx) => (
                                                <div key={idx} className="pangram-chip">
                                                    {word.word}
                                                    <span className="pangram-score">{word.score}pt</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Word list */}
                                <div className="sb-section">
                                    <div className="sb-section-header">
                                        all words
                                        <span style={{ color: '#e6b422' }}>{results.totalWords} results</span>
                                    </div>
                                    <div className="word-table-wrap">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Word</th>
                                                    <th>Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.words.map((w, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <span className={`word-name ${w.isPalindrome ? 'palindrome' : ''}`}>
                                                                {w.word}
                                                            </span>
                                                            {w.isPalindrome && (
                                                                <span className="palindrome-badge">palindrome</span>
                                                            )}
                                                        </td>
                                                        <td>{w.score}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">⬡</div>
                                <div className="empty-title">NO ACTIVE SOLVE</div>
                                <div className="empty-desc">
                                    Enter the center letter and 6 outer letters, then hit Find Words.
                                </div>
                                <div className="empty-placeholder">
                                    <div className="empty-placeholder-block" />
                                    <div className="empty-placeholder-block" />
                                    <div className="empty-placeholder-block" />
                                    <div className="empty-placeholder-block" />
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}