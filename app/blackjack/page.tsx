"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type Action = "HIT" | "STAND" | "DOUBLE" | "SPLIT" | "SURRENDER";

const getBlackjackStrategy = (userTotal: number, dealerCard: string, isSoft: boolean, isPair: boolean): Action => {
  const d = dealerCard === "A" ? 11 : parseInt(dealerCard) || 10;

  if (isPair) {
    const p = userTotal / 2;
    if (p === 8 || p === 11) return "SPLIT"; // 8,8 and A,A
    if (p === 10) return "STAND"; // 10,10
    if (p === 9) return (d === 7 || d === 10 || d === 11) ? "STAND" : "SPLIT";
    if (p === 7) return (d <= 7) ? "SPLIT" : "HIT";
    if (p === 6) return (d <= 6) ? "SPLIT" : "HIT";
    if (p === 5) return (d <= 9) ? "DOUBLE" : "HIT";
    if (p === 4) return (d === 5 || d === 6) ? "SPLIT" : "HIT";
    if (p === 3 || p === 2) return (d <= 7) ? "SPLIT" : "HIT";
  }

  if (isSoft) {
    if (userTotal >= 19) return "STAND";
    if (userTotal === 18) {
      if (d <= 6) return "DOUBLE";
      if (d === 7 || d === 8) return "STAND";
      return "HIT";
    }
    if (userTotal === 17) return (d <= 6) ? "DOUBLE" : "HIT";
    if (userTotal === 15 || userTotal === 16) return (d >= 4 && d <= 6) ? "DOUBLE" : "HIT";
    if (userTotal === 13 || userTotal === 14) return (d === 5 || d === 6) ? "DOUBLE" : "HIT";
  }

  // Hard Totals
  if (userTotal >= 17) return "STAND";
  if (userTotal >= 13 && userTotal <= 16) return (d <= 6) ? "STAND" : "HIT";
  if (userTotal === 12) return (d >= 4 && d <= 6) ? "STAND" : "HIT";
  if (userTotal === 11) return "DOUBLE";
  if (userTotal === 10) return (d <= 9) ? "DOUBLE" : "HIT";
  if (userTotal === 9) return (d >= 3 && d <= 6) ? "DOUBLE" : "HIT";
  if (userTotal <= 8) return "HIT";

  return "HIT";
};

const CARDS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const DEALER_BUST_PROBS: Record<string, number> = {
  "2": 35.3,
  "3": 37.5,
  "4": 40.2,
  "5": 42.8,
  "6": 42.0,
  "7": 25.9,
  "8": 23.8,
  "9": 23.3,
  "10": 21.4,
  "J": 21.4,
  "Q": 21.4,
  "K": 21.4,
  "A": 11.6,
};

export default function BlackjackSolver() {
  const [userCards, setUserCards] = useState<string[]>([]);
  const [dealerCard, setDealerCard] = useState<string | null>(null);

  const calculateTotal = (cards: string[]) => {
    let total = 0;
    let aces = 0;
    cards.forEach(c => {
      if (c === "A") aces++;
      else if (["J", "Q", "K", "10"].includes(c)) total += 10;
      else total += parseInt(c);
    });
    for (let i = 0; i < aces; i++) {
      if (total + 11 <= 21) total += 11;
      else total += 1;
    }
    return total;
  };

  const isSoft = userCards.includes("A") && calculateTotal(userCards) <= 21; // simplified for basic strategy
  const isPair = userCards.length === 2 && userCards[0] === userCards[1];
  const total = calculateTotal(userCards);

  const recommendedAction = (userCards.length >= 2 && dealerCard)
    ? getBlackjackStrategy(total, dealerCard, isSoft, isPair)
    : null;

  const calculateBustProb = (handTotal: number) => {
    if (handTotal >= 21) return 100;
    if (handTotal <= 11) return 0;

    const needed = 21 - handTotal;
    // Cards that bust are those > needed
    // 2-9, 10(4 cards), A
    let bustCount = 0;
    const cardValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 1];
    cardValues.forEach(v => {
      if (v > needed) bustCount++;
    });
    return (bustCount / 13) * 100;
  };

  const bustProb = calculateBustProb(total);
  const dealerBustProb = dealerCard ? DEALER_BUST_PROBS[dealerCard] : null;

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
          padding: 2rem 1rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(46, 204, 113, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46, 204, 113, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .header {
          width: 100%;
          max-width: 600px;
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

        .title span { color: #2ecc71; }

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
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }

        .table-area {
          background: radial-gradient(circle at center, #1a3c2a 0%, #0a0a0b 100%);
          border: 1px solid #2ecc7133;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .section-label {
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #2ecc71aa;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .cards-selection {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .card-btn {
          width: 44px;
          height: 60px;
          background: #111;
          border: 1px solid #333;
          border-radius: 4px;
          color: #fff;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .card-btn:hover {
          border-color: #2ecc71;
          background: #1a1a1a;
          transform: translateY(-2px);
        }

        .hand-display {
          display: flex;
          gap: 12px;
          justify-content: center;
          min-height: 80px;
          align-items: center;
        }

        .playing-card {
          width: 56px;
          height: 80px;
          background: #fff;
          border-radius: 6px;
          color: #000;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 6px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          animation: cardPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }

        @keyframes cardPop {
          from { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          to { transform: scale(1) rotate(0); opacity: 1; }
        }

        .playing-card:hover { transform: scale(1.05) translateY(-5px); }

        .result-display {
          background: rgba(0,0,0,0.4);
          border: 1px dashed #2ecc7166;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: fadeIn 0.5s ease;
        }

        .result-title {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #555;
        }

        .action-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 4rem;
          letter-spacing: 0.1em;
          line-height: 1;
        }

        .action-HIT { color: #f1c40f; }
        .action-STAND { color: #e74c3c; }
        .action-DOUBLE { color: #2ecc71; }
        .action-SPLIT { color: #9b59b6; }

        .btn-reset {
          background: transparent;
          border: 1px solid #333;
          color: #555;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          align-self: center;
          transition: all 0.2s;
        }

        .btn-reset:hover { border-color: #555; color: #888; }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 1rem;
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }

        .stat-label {
          font-size: 0.55rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }

        .stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          color: #eee;
        }

        .stat-value span {
          font-size: 0.8rem;
          color: #444;
          margin-left: 2px;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="app">
        <div className="bg-grid" />

        <header className="header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href="/" className="back-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              back
            </Link>
            <h1 className="title">BLACKJACK<span>.</span>STRATEGY</h1>
          </div>
          <div>
            <div className="subtitle">probability analyzer</div>
          </div>
        </header>

        <main className="main">
          <div className="table-area">
            <section>
              <div className="section-label">Dealer Up-Card</div>
              <div className="cards-selection">
                {CARDS.map(c => (
                  <button
                    key={c}
                    className="card-btn"
                    onClick={() => setDealerCard(c)}
                    style={{ borderColor: dealerCard === c ? "#2ecc71" : undefined }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="hand-display">
                {dealerCard ? (
                  <div className="playing-card" onClick={() => setDealerCard(null)}>
                    <span>{dealerCard}</span>
                    <span style={{ alignSelf: 'flex-end' }}>{dealerCard}</span>
                  </div>
                ) : <div style={{ color: '#333', fontSize: '0.8rem' }}>SELECT DEALER CARD</div>}
              </div>
            </section>

            <section>
              <div className="section-label">Your Hand (Total: {total})</div>
              <div className="cards-selection">
                {CARDS.map(c => (
                  <button key={c} className="card-btn" onClick={() => setUserCards([...userCards, c])}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="hand-display">
                {userCards.length > 0 ? userCards.map((c, i) => (
                  <div key={i} className="playing-card" onClick={() => setUserCards(userCards.filter((_, idx) => idx !== i))}>
                    <span>{c}</span>
                    <span style={{ alignSelf: 'flex-end' }}>{c}</span>
                  </div>
                )) : <div style={{ color: '#333', fontSize: '0.8rem' }}>ADD YOUR CARDS</div>}
              </div>
            </section>

            {recommendedAction && (
              <div className="result-display">
                <div className="result-title">Mathematically Recommended</div>
                <div className={`action-text action-${recommendedAction}`}>{recommendedAction}</div>

                <div className="analytics-grid">
                  <div className="stat-card">
                    <div className="stat-label">Your Bust Risk</div>
                    <div className="stat-value" style={{ color: bustProb > 50 ? '#e74c3c' : bustProb > 0 ? '#f1c40f' : '#2ecc71' }}>
                      {bustProb.toFixed(1)}<span>%</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Dealer Bust Chance</div>
                    <div className="stat-value" style={{ color: dealerBustProb && dealerBustProb > 35 ? '#2ecc71' : '#f1c40f' }}>
                      {dealerBustProb?.toFixed(1)}<span>%</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '10px' }}>
                  Based on standard 4-8 deck basic strategy.
                </div>
              </div>
            )}

            {(userCards.length > 0 || dealerCard) && (
              <button className="btn-reset" onClick={() => { setUserCards([]); setDealerCard(null); }}>
                RESET TABLE
              </button>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
