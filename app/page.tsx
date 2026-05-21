"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "./components/Footer";

const SOLVERS = [
  {
    href: "/wordle",
    tag: "Entropy Based",
    title: "Wordle Solver",
    desc: "Uses advanced entropy calculation to find the most informative next guess. Guaranteed to solve any Wordle within 4-5 tries.",
    className: "wordle-card",
    action: "Start Solving",
  },
  {
    href: "/globle",
    tag: "Distance Mapping",
    title: "Globle Solver",
    desc: "High-precision distance triangulation considering all 195 sovereign nations. Locate your target country with surgical accuracy.",
    className: "globle-card",
    action: "Start Solving",
  },
  {
    href: "/spelling-bee",
    tag: "Pangram Detection",
    title: "Spelling Bee",
    desc: "Find every possible word for the daily NYT Spelling Bee. Identify pangrams and high-score words instantly.",
    className: "spelling-bee-card",
    action: "Find Pangrams",
  },
  {
    href: "/nerdle",
    tag: "Mathematical Logic",
    title: "Nerdle Solver",
    desc: "Crack any 8-digit math challenge. Full analytical breakdown of 17,723 possible calculations.",
    className: "nerdle-card",
    action: "Solve Equations",
  },
  {
    href: "/tic-tac-toe",
    tag: "Minimax Algorithm",
    title: "Tic Tac Toe",
    desc: "An unbeatable engine that calculates every possible outcome. Never lose another game with the perfect strategy.",
    className: "tic-tac-toe-card",
    action: "Play Perfect",
  },
  {
    href: "/connect-4",
    tag: "Positional Analysis",
    title: "Connect 4",
    desc: "Advanced heuristic engine that evaluates 126 win-paths. Dominate the board with a perfect 8-turn lookahead.",
    className: "connect-4-card",
    action: "Control Board",
  },
  {
    href: "/blackjack",
    tag: "Probability Analysis",
    title: "Blackjack Strategist",
    desc: "Optimal basic strategy engine. Provides the mathematically correct move (Hit, Stand, Double, Split) for every hand combination.",
    className: "blackjack-card",
    action: "Beat Dealer",
  },
  {
    href: "/poker",
    tag: "Monte Carlo Solver",
    title: "Texas Hold'em",
    desc: "Professional equity calculator. Simulates 2,000 random outcomes per second to provide your exact win probability at any street.",
    className: "poker-card",
    action: "Analyze Equity",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredSolvers = SOLVERS.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.tag.toLowerCase().includes(search.toLowerCase()) ||
    s.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Bebas+Neue&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0b;
          color: #e8e8e9;
          font-family: 'IBM Plex Mono', monospace;
          min-height: 100vh;
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(83,141,78,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(83,141,78,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        /* Hero / Glow */
        .glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(circle, rgba(83,141,78,0.1) 0%, transparent 70%);
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
        }

        .container {
          width: 100%;
          max-width: 900px;
          padding: 6rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 10vw, 6rem);
          line-height: 0.95;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
          color: #ffffff;
          animation: fadeInUp 0.8s ease backwards;
        }

        .hero-title span {
          background: linear-gradient(to right, #538d4e, #e67e22);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 0.9rem;
          max-width: 500px;
          color: #888;
          line-height: 1.6;
          letter-spacing: 0.05em;
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s ease 0.2s backwards;
        }

        /* Search Bar */
        .search-container {
          width: 100%;
          max-width: 500px;
          margin-bottom: 4rem;
          position: relative;
          animation: fadeInUp 0.8s ease 0.3s backwards;
        }

        .search-input {
          width: 100%;
          background: #111114;
          border: 1px solid #2a2a2c;
          padding: 1rem 1.5rem 1rem 3.5rem;
          border-radius: 99px;
          color: #fff;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.85rem;
          transition: all 0.3s;
          outline: none;
        }

        .search-input:focus {
          border-color: #538d4e;
          box-shadow: 0 0 20px rgba(83, 141, 78, 0.15);
          background: #151518;
        }

        .search-icon {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: #555;
          pointer-events: none;
          transition: color 0.3s;
        }

        .search-input:focus + .search-icon {
          color: #538d4e;
        }

        /* Cards */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          width: 100%;
          animation: fadeInUp 0.8s ease 0.4s backwards;
        }

        .card {
          position: relative;
          background: #151518;
          border: 1px solid #2a2a2c;
          border-radius: 12px;
          padding: 2.5rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .card:hover {
          transform: translateY(-8px);
          border-color: #444;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, var(--accent-glow), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .card:hover::before {
          opacity: 0.2;
        }

        .card-tag {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.75rem;
          font-weight: 700;
        }

        .card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.8rem;
          color: #ffffff;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }

        .card-desc {
          font-size: 0.8rem;
          color: #777;
          line-height: 1.5;
          margin-bottom: 2rem;
          flex-grow: 1;
        }

        .card-action {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #eee;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .card-action span {
          transition: transform 0.3s;
        }

        .card:hover .card-action span {
          transform: translateX(5px);
        }

        /* Card specific accents */
        .wordle-card {
          --accent: #538d4e;
          --accent-glow: #538d4e44;
        }
        .globle-card {
          --accent: #e67e22;
          --accent-glow: #e67e2244;
        }
        .spelling-bee-card {
          --accent: #e6b422;
          --accent-glow: #e6b42244;
        }
        .nerdle-card {
          --accent: #820458;
          --accent-glow: #82045844;
        }
        .tic-tac-toe-card {
          --accent: #407bff;
          --accent-glow: #407bff44;
        }
        .connect-4-card {
          --accent: #e63946;
          --accent-glow: #e6394644;
        }
        .blackjack-card {
          --accent: #2ecc71;
          --accent-glow: #2ecc7144;
        }
        .poker-card {
          --accent: #f1c40f;
          --accent-glow: #f1c40f44;
        }

        .no-results {
          grid-column: 1 / -1;
          padding: 4rem;
          color: #555;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .container { padding: 4rem 1rem; }
          .hero-title { font-size: 3rem; }
        }
      `}</style>

      <div className="app">
        <div className="bg-grid" />
        <div className="glow" />

        <main className="container">
          <h1 className="hero-title">
            PUZZLE<span>.</span>MASTERMIND
          </h1>

          <p className="hero-description">
            The world's most accurate solvers for daily game challenges.
            No more broken streaks. No more missed opportunities.
          </p>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search solvers (e.g. Wordle, Minimax, math...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <div className="cards-grid">
            {filteredSolvers.length > 0 ? (
              filteredSolvers.map((solver, idx) => (
                <Link key={idx} href={solver.href} className={`card ${solver.className}`}>
                  <div className="card-tag">{solver.tag}</div>
                  <h2 className="card-title">{solver.title}</h2>
                  <p className="card-desc">{solver.desc}</p>
                  <div className="card-action">
                    {solver.action} <span>→</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-results">No solvers match your search.</div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}