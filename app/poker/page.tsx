"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

// --- Types & Constants ---
type Suit = "s" | "h" | "d" | "c";
type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K" | "A";
interface Card { rank: Rank; suit: Suit; }

const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const SUITS: Suit[] = ["s", "h", "d", "c"];
const RANK_VALUES: Record<Rank, number> = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "T": 10, "J": 11, "Q": 12, "K": 13, "A": 14 };

// --- Poker Logic ---
const getHandRank = (cards: Card[]) => {
  const sorted = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
  const ranksCount: Record<string, number> = {};
  const suitsCount: Record<string, number> = {};
  sorted.forEach(c => {
    ranksCount[c.rank] = (ranksCount[c.rank] || 0) + 1;
    suitsCount[c.suit] = (suitsCount[c.suit] || 0) + 1;
  });

  const isFlush = Object.values(suitsCount).some(count => count >= 5);
  const values = Array.from(new Set(sorted.map(c => RANK_VALUES[c.rank]))).sort((a, b) => b - a);
  let isStraight = false;
  let straightHigh = 0;

  for (let i = 0; i <= values.length - 5; i++) {
    if (values[i] - values[i + 4] === 4) {
      isStraight = true;
      straightHigh = values[i];
      break;
    }
  }
  // Low Ace Straight (A, 2, 3, 4, 5)
  if (!isStraight && values.includes(14) && values.includes(2) && values.includes(3) && values.includes(4) && values.includes(5)) {
    isStraight = true;
    straightHigh = 5;
  }

  const duplicates = Object.entries(ranksCount).sort((a, b) => b[1] - a[1] || RANK_VALUES[b[0] as Rank] - RANK_VALUES[a[0] as Rank]);

  if (isFlush && isStraight) return 9 + (straightHigh / 100); // Straight Flush
  if (duplicates[0][1] === 4) return 8 + (RANK_VALUES[duplicates[0][0] as Rank] / 100); // 4 of a kind
  if (duplicates[0][1] === 3 && duplicates[1] && duplicates[1][1] >= 2) return 7 + (RANK_VALUES[duplicates[0][0] as Rank] / 100); // Full House
  if (isFlush) return 6;
  if (isStraight) return 5 + (straightHigh / 100);
  if (duplicates[0][1] === 3) return 4 + (RANK_VALUES[duplicates[0][0] as Rank] / 100);
  if (duplicates[0][1] === 2 && duplicates[1] && duplicates[1][1] === 2) return 3 + (RANK_VALUES[duplicates[0][0] as Rank] / 100);
  if (duplicates[0][1] === 2) return 2 + (RANK_VALUES[duplicates[0][0] as Rank] / 100);
  return 1 + (RANK_VALUES[duplicates[0][0] as Rank] / 100); // High card
};

const getHandName = (score: number) => {
  if (score >= 9) return "Straight Flush";
  if (score >= 8) return "Four of a Kind";
  if (score >= 7) return "Full House";
  if (score >= 6) return "Flush";
  if (score >= 5) return "Straight";
  if (score >= 4) return "Three of a Kind";
  if (score >= 3) return "Two Pair";
  if (score >= 2) return "One Pair";
  return "High Card";
};

const getStartingHandTier = (hole: Card[]) => {
  if (hole.length !== 2) return null;
  const sorted = [...hole].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
  const r1 = sorted[0].rank;
  const r2 = sorted[1].rank;
  const suited = sorted[0].suit === sorted[1].suit;
  const v1 = RANK_VALUES[r1];
  const v2 = RANK_VALUES[r2];
  const pair = r1 === r2;

  // Tier S
  if (pair && v1 >= 13) return { tier: "S", label: "MONSTER", color: "#f1c40f" }; // AA, KK
  // Tier A
  if (pair && v1 >= 11) return { tier: "A", label: "ELITE", color: "#2ecc71" }; // QQ, JJ
  if (r1 === "A" && r2 === "K" && suited) return { tier: "A", label: "ELITE", color: "#2ecc71" };
  // Tier B
  if (pair && v1 >= 9) return { tier: "B", label: "STRONG", color: "#3498db" }; // 1010, 99
  if (v1 === 14 && v2 >= 12) return { tier: "B", label: "STRONG", color: "#3498db" }; // AKo, AQ
  // Tier C
  if (pair && v1 >= 7) return { tier: "C", label: "PLAYABLE", color: "#9b59b6" };
  if (v1 >= 11 && v2 >= 10) return { tier: "C", label: "PLAYABLE", color: "#9b59b6" };
  // Tier D
  if (v1 >= 10 || (v1 >= 9 && suited)) return { tier: "D", label: "WEAK / TRAP", color: "#e67e22" };
  // Tier F
  return { tier: "F", label: "FOLD BAIT", color: "#e74c3c" };
};

interface Analysis {
  type: string;
  outs: number;
  prob: number;
  reason: string;
}

const getDetailedAnalysis = (hole: Card[], comm: Card[]): Analysis | null => {
  const all = [...hole, ...comm];
  if (all.length < 5 || all.length >= 7) return null;

  const suitsCount: Record<string, number> = {};
  all.forEach(c => suitsCount[c.suit] = (suitsCount[c.suit] || 0) + 1);

  // Flush Draw
  for (const [suit, count] of Object.entries(suitsCount)) {
    if (count === 4) {
      const outs = 9;
      const remaining = 52 - all.length;
      const name = suit === "s" ? "Spades" : suit === "h" ? "Hearts" : suit === "d" ? "Diamonds" : "Clubs";
      return {
        type: "Flush Draw",
        outs,
        prob: (outs / remaining) * 100,
        reason: `You have 4 ${name}. There are 13 total in the deck, so 9 remaining ${name} are your "outs".`
      };
    }
  }

  // Simple Straight Draw (OESD approx)
  const values = Array.from(new Set(all.map(c => RANK_VALUES[c.rank]))).sort((a, b) => a - b);
  for (let i = 0; i <= values.length - 4; i++) {
    if (values[i + 3] - values[i] === 3) {
      const outs = 8;
      const remaining = 52 - all.length;
      return {
        type: "Straight Draw",
        outs,
        prob: (outs / remaining) * 100,
        reason: "You have 4 cards in sequence. Any card at either end (8 possible cards) completes your straight."
      };
    }
  }

  return null;
};

// --- Component ---
export default function PokerSolver() {
  const [holeCards, setHoleCards] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [equity, setEquity] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [activeSelect, setActiveSelect] = useState<"hole" | "community">("hole");

  const handStrength = holeCards.length === 2 ? getHandName(getHandRank([...holeCards, ...communityCards])) : null;

  const calculateEquity = () => {
    if (holeCards.length < 2) return;
    setCalculating(true);

    setTimeout(() => {
      let wins = 0;
      const iterations = 2000;
      const fullDeck: Card[] = [];
      RANKS.forEach(r => SUITS.forEach(s => fullDeck.push({ rank: r, suit: s })));

      const used = [...holeCards, ...communityCards];
      const deck = fullDeck.filter(c => !used.some(u => u.rank === c.rank && u.suit === c.suit));

      for (let i = 0; i < iterations; i++) {
        const shuffled = [...deck].sort(() => Math.random() - 0.5);
        const remainingCommCount = 5 - communityCards.length;
        const simComm = [...communityCards, ...shuffled.slice(0, remainingCommCount)];
        const opponentHole = shuffled.slice(remainingCommCount, remainingCommCount + 2);

        const myRank = getHandRank([...holeCards, ...simComm]);
        const opRank = getHandRank([...opponentHole, ...simComm]);

        if (myRank > opRank) wins++;
        else if (myRank === opRank) wins += 0.5; // split
      }

      setEquity((wins / iterations) * 100);
      setCalculating(false);
    }, 100);
  };

  useEffect(() => {
    if (holeCards.length === 2) calculateEquity();
    else setEquity(null);
  }, [holeCards, communityCards]);

  const handTier = getStartingHandTier(holeCards);
  const analysis = getDetailedAnalysis(holeCards, communityCards);

  const toggleCard = (card: Card) => {
    const isHole = holeCards.some(c => c.rank === card.rank && c.suit === card.suit);
    const isComm = communityCards.some(c => c.rank === card.rank && c.suit === card.suit);

    if (isHole) {
      setHoleCards(holeCards.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
    } else if (isComm) {
      setCommunityCards(communityCards.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
    } else {
      if (activeSelect === "hole" && holeCards.length < 2) {
        setHoleCards([...holeCards, card]);
      } else if (activeSelect === "community" && communityCards.length < 5) {
        setCommunityCards([...communityCards, card]);
      }
    }
  };

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
            linear-gradient(rgba(241, 196, 15, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(241, 196, 15, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .header {
          width: 100%;
          max-width: 800px;
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

        .title span { color: #f1c40f; }

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
          max-width: 900px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }

        .game-area {
          background: #111114;
          border: 1px solid #2a2a2c;
          border-radius: 16px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .hand-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .section-label {
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .section-label.active {
          color: #f1c40f;
          background: rgba(241, 196, 15, 0.1);
        }

        .cards-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          min-height: 100px;
        }

        .poker-card {
           width: 64px;
           height: 90px;
           background: #1a1a1c;
           border: 2px dashed #2a2a2c;
           border-radius: 8px;
           display: flex;
           flex-direction: column;
           padding: 8px;
           font-family: 'Bebas Neue', sans-serif;
           font-size: 1.4rem;
           position: relative;
        }

        .poker-card.filled {
           background: #fff;
           border-style: solid;
           color: #000;
           box-shadow: 0 4px 15px rgba(0,0,0,0.4);
           animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .suit-icon {
          position: absolute;
          bottom: 8px;
          right: 8px;
          font-size: 1.8rem;
          opacity: 0.1;
        }

        .poker-card.filled .suit-icon {
          opacity: 0.8;
        }

        .suit-h, .suit-d { color: #e74c3c; }
        .suit-s, .suit-c { color: #000; }

        .deck-selector {
          background: #111;
          border: 1px solid #2a2a2c;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .deck-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
        }

        .selector-card {
          padding: 4px;
          background: #1a1a1c;
          border: 1px solid #2a2a2c;
          border-radius: 4px;
          font-size: 0.7rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
        }

        .selector-card:hover {
          background: #252527;
          border-color: #f1c40f;
        }

        .selector-card.selected {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .side-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stat-box {
          background: #111114;
          border: 1px solid #2a2a2c;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3rem;
          color: #f1c40f;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          color: #555;
          text-transform: uppercase;
        }

        .btn-reset {
           margin-top: auto;
           padding: 12px;
           background: transparent;
           border: 1px solid #2a2a2c;
           color: #555;
           border-radius: 6px;
           cursor: pointer;
           font-size: 0.7rem;
           letter-spacing: 0.1em;
           transition: all 0.2s;
        }

        .btn-reset:hover { border-color: #f1c40f; color: #f1c40f; }

        .advice-box {
           background: rgba(241, 196, 15, 0.05);
           border: 1px dashed rgba(241, 196, 15, 0.3);
           border-radius: 12px;
           padding: 1.5rem;
           text-align: center;
           margin-top: auto;
           animation: fadeIn 0.4s ease;
        }

        .advice-label {
           font-size: 0.6rem;
           letter-spacing: 0.2em;
           color: #666;
           text-transform: uppercase;
           margin-bottom: 8px;
        }

        .advice-action {
           font-family: 'Bebas Neue', sans-serif;
           font-size: 2.2rem;
           letter-spacing: 0.05em;
           line-height: 1;
        }

        .advice-desc {
           font-size: 0.7rem;
           color: #555;
           margin-top: 8px;
           line-height: 1.4;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { from { scale: 0.8; opacity: 0; } to { scale: 1; opacity: 1; } }

        .analysis-card {
          margin-top: 2rem;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          padding: 1.5rem;
          border-left: 3px solid #f1c40f;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .analysis-type {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.05em;
          color: #f1c40f;
        }

        .analysis-odds {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.8rem;
          color: #2ecc71;
          font-weight: 700;
        }

        .analysis-explanation {
          font-size: 0.75rem;
          color: #888;
          line-height: 1.6;
        }

        .outs-badge {
          display: inline-block;
          background: #333;
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          margin-right: 8px;
        }

        .tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 99px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 1.5rem;
        }

        .tier-letter {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          line-height: 1;
        }

        .tier-info {
          display: flex;
          flex-direction: column;
        }

        .tier-name {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .tier-warning {
          font-size: 0.55rem;
          color: #666;
          text-transform: uppercase;
        }

        @media (max-width: 800px) {
          .main { grid-template-columns: 1fr; }
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
            <h1 className="title">TEXAS<span>.</span>HOLDEM</h1>
          </div>
          <div>
            <div className="subtitle">monte carlo solver</div>
          </div>
        </header>

        <main className="main">
          <div className="game-area">
            <section className="hand-section">
              {handTier && (
                <div className="tier-badge">
                  <div className="tier-letter" style={{ color: handTier.color }}>{handTier.tier}</div>
                  <div className="tier-info">
                    <div className="tier-name" style={{ color: handTier.color }}>{handTier.label}</div>
                    <div className="tier-warning">{handTier.tier === 'D' || handTier.tier === 'F' ? "High Risk: Handle with caution" : "Solid Hand Strategy"}</div>
                  </div>
                </div>
              )}
              <div
                className={`section-label ${activeSelect === "hole" ? "active" : ""}`}
                onClick={() => setActiveSelect("hole")}
              >
                Your Hole Cards
              </div>
              <div className="cards-row">
                {Array.from({ length: 2 }).map((_, i) => {
                  const card = holeCards[i];
                  return (
                    <div
                      key={i}
                      className={`poker-card ${card ? "filled" : ""}`}
                      onClick={() => card && toggleCard(card)}
                    >
                      {card && (
                        <>
                          <span className={`suit-${card.suit}`}>{card.rank}</span>
                          <span className={`suit-icon suit-${card.suit}`}>
                            {card.suit === "s" ? "♠" : card.suit === "h" ? "♥" : card.suit === "d" ? "♦" : "♣"}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="hand-section">
              <div
                className={`section-label ${activeSelect === "community" ? "active" : ""}`}
                onClick={() => setActiveSelect("community")}
              >
                Community Cards (Flop, Turn, River)
              </div>
              <div className="cards-row">
                {Array.from({ length: 5 }).map((_, i) => {
                  const card = communityCards[i];
                  return (
                    <div
                      key={i}
                      className={`poker-card ${card ? "filled" : ""}`}
                      onClick={() => card && toggleCard(card)}
                    >
                      {card && (
                        <>
                          <span className={`suit-${card.suit}`}>{card.rank}</span>
                          <span className={`suit-icon suit-${card.suit}`}>
                            {card.suit === "s" ? "♠" : card.suit === "h" ? "♥" : card.suit === "d" ? "♦" : "♣"}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {analysis && (
              <div className="analysis-card">
                <div className="analysis-header">
                  <div className="analysis-type">{analysis.type}</div>
                  <div className="analysis-odds">+{analysis.prob.toFixed(1)}% Chance</div>
                </div>
                <div className="analysis-explanation">
                  <span className="outs-badge">{analysis.outs} OUTS</span>
                  {analysis.reason}
                </div>
              </div>
            )}
          </div>

          <div className="side-panel">
            <div className="stat-box">
              <div className="stat-label">Win Equity</div>
              <div className="stat-value">
                {calculating ? "..." : equity !== null ? `${equity.toFixed(1)}%` : "0.0%"}
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-label">Current Strength</div>
              <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '8px' }}>
                {handStrength || "N/A"}
              </div>
            </div>

            {equity !== null && (
              <div className="advice-box">
                <div className="advice-label">Strategic Advice</div>
                <div className="advice-action" style={{
                  color: equity > 60 ? '#2ecc71' : equity > 35 ? '#f1c40f' : '#e74c3c'
                }}>
                  {equity > 60 ? "STRONG RAISE" : equity > 35 ? "CALL / CHECK" : "SAFE FOLD"}
                </div>
                <div className="advice-desc">
                  {equity > 60 ? "You have a significant mathematical advantage. Build the pot." :
                    equity > 35 ? "You possess enough equity to see the next card. Don't overcommit." :
                      "The math doesn't favor you. Protecting your chips is the priority."}
                </div>
              </div>
            )}

            <div className="deck-selector">
              <div className="stat-label" style={{ marginBottom: '8px' }}>Deck Select</div>
              {SUITS.map(s => (
                <div key={s} className="deck-grid">
                  {RANKS.map(r => {
                    const isSelected = [...holeCards, ...communityCards].some(c => c.rank === r && c.suit === s);
                    return (
                      <div
                        key={r}
                        className={`selector-card ${isSelected ? "selected" : ""}`}
                        onClick={() => !isSelected && toggleCard({ rank: r, suit: s })}
                      >
                        <span className={`suit-${s}`}>{r}{s === "s" ? "♠" : s === "h" ? "♥" : s === "d" ? "♦" : "♣"}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <button className="btn-reset" onClick={() => { setHoleCards([]); setCommunityCards([]); }}>
              RESET ENGINE
            </button>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
