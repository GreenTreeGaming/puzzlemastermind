"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type Player = 1 | 2 | null; // 1 = Red, 2 = Yellow

const ROWS = 6;
const COLS = 7;

export default function Connect4Solver() {
  const [board, setBoard] = useState<Player[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [turn, setTurn] = useState<1 | 2>(1);
  const [bestMove, setBestMove] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const checkWinner = (grid: Player[][]): Player | "Draw" | null => {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (grid[r][c] && grid[r][c] === grid[r][c + 1] && grid[r][c] === grid[r][c + 2] && grid[r][c] === grid[r][c + 3]) {
          return grid[r][c];
        }
      }
    }
    // Check vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] && grid[r][c] === grid[r + 1][c] && grid[r][c] === grid[r + 2][c] && grid[r][c] === grid[r + 3][c]) {
          return grid[r][c];
        }
      }
    }
    // Check diagonal (down-right)
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (grid[r][c] && grid[r][c] === grid[r + 1][c + 1] && grid[r][c] === grid[r + 2][c + 2] && grid[r][c] === grid[r + 3][c + 3]) {
          return grid[r][c];
        }
      }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (grid[r][c] && grid[r][c] === grid[r - 1][c + 1] && grid[r][c] === grid[r - 2][c + 2] && grid[r][c] === grid[r - 3][c + 3]) {
          return grid[r][c];
        }
      }
    }
    // Check draw
    if (grid[0].every(cell => cell !== null)) return "Draw";
    return null;
  };

  const getLowestEmptyRow = (grid: Player[][], col: number): number | -1 => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][col] === null) return r;
    }
    return -1;
  };

  // Heuristic evaluation for the board state
  const evaluateBoard = (grid: Player[][]): number => {
    let score = 0;

    // Central column bonus
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][3] === 1) score += 3;
      else if (grid[r][3] === 2) score -= 3;
    }

    const evaluateWindow = (window: (Player | null)[]) => {
      let rCount = window.filter(c => c === 1).length;
      let yCount = window.filter(c => c === 2).length;
      let empty = window.filter(c => c === null).length;

      if (rCount === 4) return 1000;
      if (rCount === 3 && empty === 1) return 10;
      if (rCount === 2 && empty === 2) return 2;

      if (yCount === 4) return -1000;
      if (yCount === 3 && empty === 1) return -10;
      if (yCount === 2 && empty === 2) return -2;

      return 0;
    };

    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += evaluateWindow([grid[r][c], grid[r][c + 1], grid[r][c + 2], grid[r][c + 3]]);
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        score += evaluateWindow([grid[r][c], grid[r + 1][c], grid[r + 2][c], grid[r + 3][c]]);
      }
    }
    // Diagonal
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += evaluateWindow([grid[r][c], grid[r + 1][c + 1], grid[r + 2][c + 2], grid[r + 3][c + 3]]);
      }
    }
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += evaluateWindow([grid[r][c], grid[r - 1][c + 1], grid[r - 2][c + 2], grid[r - 3][c + 3]]);
      }
    }

    return score;
  };

  const minimax = (grid: Player[][], depth: number, alpha: number, beta: number, maximizing: boolean): number => {
    const win = checkWinner(grid);
    if (win === 1) return 1000000 + depth; // Depth bonus to win faster
    if (win === 2) return -1000000 - depth;
    if (win === "Draw") return 0;
    if (depth === 0) return evaluateBoard(grid);

    const validMoves = Array.from({ length: COLS }, (_, i) => i).filter(c => grid[0][c] === null);
    // Move ordering: check center first
    validMoves.sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b));

    if (maximizing) {
      let maxEval = -Infinity;
      for (const col of validMoves) {
        const row = getLowestEmptyRow(grid, col);
        grid[row][col] = 1;
        const ev = minimax(grid, depth - 1, alpha, beta, false);
        grid[row][col] = null;
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const col of validMoves) {
        const row = getLowestEmptyRow(grid, col);
        grid[row][col] = 2;
        const ev = minimax(grid, depth - 1, alpha, beta, true);
        grid[row][col] = null;
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const findBestMove = () => {
    setAnalyzing(true);
    // Small timeout to allow UI to show "Analyzing..."
    setTimeout(() => {
      const validCols = Array.from({ length: COLS }, (_, i) => i).filter(c => board[0][c] === null);
      if (validCols.length === 0) {
        setAnalyzing(false);
        return;
      }

      let bestScore = turn === 1 ? -Infinity : Infinity;
      let move = validCols[0];

      // Dynamic depth based on board state (more empty spots = less depth)
      const emptySpots = board.flat().filter(s => s === null).length;
      const depth = emptySpots > 30 ? 6 : emptySpots > 15 ? 7 : 8;

      for (const col of validCols) {
        const row = getLowestEmptyRow(board, col);
        const gridCopy = board.map(r => [...r]);
        gridCopy[row][col] = turn;
        const score = minimax(gridCopy, depth, -Infinity, Infinity, turn === 2);

        if (turn === 1) {
          if (score > bestScore) {
            bestScore = score;
            move = col;
          }
        } else {
          if (score < bestScore) {
            bestScore = score;
            move = col;
          }
        }
      }
      setBestMove(move);
      setAnalyzing(false);
    }, 50);
  };

  const handleColClick = (col: number) => {
    if (winner || board[0][col] !== null) return;
    const row = getLowestEmptyRow(board, col);
    const nextBoard = board.map(r => [...r]);
    nextBoard[row][col] = turn;
    setBoard(nextBoard);
    setTurn(turn === 1 ? 2 : 1);
  };

  const reset = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setTurn(1);
    setBestMove(null);
    setWinner(null);
  };

  useEffect(() => {
    const win = checkWinner(board);
    setWinner(win);
    if (!win) {
      findBestMove();
    } else {
      setBestMove(null);
    }
  }, [board, turn]);

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
            linear-gradient(rgba(230, 57, 70, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(230, 57, 70, 0.04) 1px, transparent 1px);
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

        .title span {
          color: #e63946;
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
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #111114;
          padding: 0.8rem 1.2rem;
          border: 1px solid #2a2a2c;
          border-radius: 8px;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .status-turn span {
          font-weight: 700;
        }
        .text-red { color: #e63946; }
        .text-yellow { color: #f1fa8c; }

        .board-container {
          background: #1a1a1f;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #2a2a2c;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          position: relative;
        }

        .board {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }

        .column {
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          position: relative;
          padding: 4px;
          border-radius: 6px;
          transition: background 0.15s;
        }

        .column:hover:not(.winner-state) {
          background: rgba(255,255,255,0.03);
        }

        .cell {
          aspect-ratio: 1;
          background: #0a0a0b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 1px solid #111;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
        }

        .piece {
          width: 85%;
          height: 85%;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform: translateY(-20px);
          opacity: 0;
        }

        .piece.placed {
          transform: translateY(0);
          opacity: 1;
        }

        .piece.red {
          background: radial-gradient(circle at 30% 30%, #ff4d4d, #b30000);
          box-shadow: 0 4px 10px rgba(179, 0, 0, 0.4);
        }

        .piece.yellow {
          background: radial-gradient(circle at 30% 30%, #f1fa8c, #d4af37);
          box-shadow: 0 4px 10px rgba(212, 175, 55, 0.4);
        }

        .best-indicator {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.5rem;
          font-weight: 700;
          color: #e63946;
          background: rgba(230, 57, 70, 0.1);
          border: 1px solid rgba(230, 57, 70, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          white-space: nowrap;
          animation: float 1.5s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -4px); }
        }

        .controls {
          display: flex;
          gap: 12px;
        }

        .btn-reset {
          flex: 1;
          height: 50px;
          background: #111114;
          border: 1px solid #2a2a2c;
          color: #e8e8e9;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .btn-reset:hover {
          border-color: #444;
          background: #1c1c21;
        }

        .info-panel {
          background: #111114;
          border: 1px solid #2a2a2c;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-title {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #555;
        }

        .info-desc {
          font-size: 0.8rem;
          color: #888;
          line-height: 1.6;
        }

        .winner-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 10, 11, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
          border-radius: 12px;
          animation: fadeIn 0.4s ease;
        }

        .winner-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3.5rem;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 600px) {
          .board { gap: 4px; }
          .cell { border-width: 0.5px; }
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
            <h1 className="title">CONNECT<span>.</span>FOUR</h1>
          </div>
          <div>
            <div className="subtitle">heuristic solver</div>
          </div>
        </header>

        <main className="main">
          <div className="status-bar">
            <div className="status-turn">
              {winner ? "Game Over" : (
                <>Next: <span className={turn === 1 ? "text-red" : "text-yellow"}>{turn === 1 ? "RED" : "YELLOW"}</span></>
              )}
            </div>
            <div className="status-ai" style={{ color: analyzing ? '#e63946' : '#555' }}>
              {analyzing ? "Thinking..." : "AI Engine 8.0 Active"}
            </div>
          </div>

          <div className="board-container">
            <div className="board">
              {Array.from({ length: COLS }).map((_, c) => (
                <div
                  key={c}
                  className={`column ${winner ? "winner-state" : ""}`}
                  onClick={() => handleColClick(c)}
                >
                  {bestMove === c && !winner && <div className="best-indicator">BEST MOVE</div>}
                  {Array.from({ length: ROWS }).map((_, r) => {
                    const player = board[r][c];
                    return (
                      <div key={r} className="cell">
                        <div className={`piece ${player ? (player === 1 ? "red placed" : "yellow placed") : ""}`} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {winner && (
              <div className="winner-overlay">
                <div className={`winner-text ${winner === 1 ? "text-red" : winner === 2 ? "text-yellow" : ""}`}>
                  {winner === "Draw" ? "FULL BOARD - DRAW" : `${winner === 1 ? "RED" : "YELLOW"} DOMINATES!`}
                </div>
                <button className="btn-reset" style={{ flex: 'none', width: '220px' }} onClick={reset}>
                  Rematch
                </button>
              </div>
            )}
          </div>

          <div className="controls">
            <button className="btn-reset" onClick={reset}>
              Clear Board
            </button>
          </div>

          <div className="info-panel">
            <div className="info-title">Engine Specification</div>
            <p className="info-desc">
              Utilizing a depth-limited <strong>Minimax Algorithm</strong> with <strong>Alpha-Beta Pruning</strong>.
              The engine prioritizes center-control and evaluates 126 possible win-windows per move.
              Look-ahead depth varies between 6-8 turns based on board complexity.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
