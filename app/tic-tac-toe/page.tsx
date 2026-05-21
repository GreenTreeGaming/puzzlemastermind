"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

type Player = "X" | "O" | null;

interface Move {
  index: number;
  score: number;
}

export default function TicTacToeSolver() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [bestMove, setBestMove] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);

  const calculateWinner = (squares: Player[]): Player | "Draw" | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every((square) => square !== null)) {
      return "Draw";
    }
    return null;
  };

  const minimax = (newBoard: Player[], player: "X" | "O"): Move => {
    const availSpots = newBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null) as number[];

    const winResult = calculateWinner(newBoard);
    if (winResult === "X") return { index: -1, score: 10 };
    if (winResult === "O") return { index: -1, score: -10 };
    if (winResult === "Draw") return { index: -1, score: 0 };

    const moves: Move[] = [];

    for (let i = 0; i < availSpots.length; i++) {
      const move = {} as Move;
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;

      if (player === "X") {
        const result = minimax(newBoard, "O");
        move.score = result.score;
      } else {
        const result = minimax(newBoard, "X");
        move.score = result.score;
      }

      newBoard[availSpots[i]] = null;
      moves.push(move);
    }

    let bestMoveIdx = 0;
    if (player === "X") {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMoveIdx = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMoveIdx = i;
        }
      }
    }

    return moves[bestMoveIdx];
  };

  const handleSquareClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = turn;
    setBoard(newBoard);
    setTurn(turn === "X" ? "O" : "X");
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setBestMove(null);
    setWinner(null);
  };

  useEffect(() => {
    const win = calculateWinner(board);
    setWinner(win);
    if (!win) {
      const move = minimax([...board], turn);
      setBestMove(move.index);
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
          padding: 2rem 1.5rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(64, 123, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(64, 123, 255, 0.04) 1px, transparent 1px);
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
          color: #407bff;
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
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #111114;
          padding: 1rem;
          border: 1px solid #2a2a2c;
          border-radius: 8px;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .status-turn span {
          color: #407bff;
          font-weight: 700;
        }

        .board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          aspect-ratio: 1 / 1;
          width: 100%;
        }

        .square {
          background: #151518;
          border: 1px solid #2a2a2c;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 4rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .square:hover {
          background: #1c1c21;
          border-color: #444;
          transform: translateY(-2px);
        }

        .square.best-move {
          border-color: #407bff99;
          box-shadow: inset 0 0 15px #407bff22;
        }

        .square.best-move::after {
          content: "BEST";
          position: absolute;
          top: 4px;
          right: 6px;
          font-size: 0.5rem;
          color: #407bff;
          letter-spacing: 0.1em;
          font-weight: 700;
        }

        .square.x { color: #538d4e; }
        .square.o { color: #e67e22; }

        .controls {
          display: flex;
          gap: 12px;
        }

        .btn-reset {
          flex: 1;
          height: 50px;
          background: #151518;
          border: 1px solid #2a2a2c;
          color: #e8e8e9;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .btn-reset:hover {
          background: #1c1c21;
          border-color: #444;
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
          line-height: 1.5;
        }

        .winner-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 10, 11, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 8px;
          animation: fadeIn 0.3s ease;
        }

        .winner-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3rem;
          margin-bottom: 1rem;
          letter-spacing: 0.1em;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 480px) {
          .square { font-size: 3rem; }
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
            <h1 className="title">TIC<span>.</span>TAC<span>.</span>TOE</h1>
          </div>
          <div>
            <div className="subtitle">minimax solver</div>
          </div>
        </header>

        <main className="main">
          <div className="status-bar">
            <div className="status-turn">
              {winner ? "Game Over" : <>Next Turn: <span>{turn}</span></>}
            </div>
            <div className="status-ai">
              Unbeatable Engine
            </div>
          </div>

          <div className="board-container" style={{ position: 'relative' }}>
            <div className="board">
              {board.map((square, i) => (
                <div
                  key={i}
                  className={`square ${square ? square.toLowerCase() : ""} ${bestMove === i ? "best-move" : ""}`}
                  onClick={() => handleSquareClick(i)}
                >
                  {square}
                </div>
              ))}
            </div>

            {winner && (
              <div className="winner-overlay">
                <div className="winner-text" style={{ color: winner === 'X' ? '#538d4e' : winner === 'O' ? '#e67e22' : '#888' }}>
                  {winner === "Draw" ? "IT'S A DRAW" : `${winner} WINS!`}
                </div>
                <button className="btn-reset" style={{ flex: 'none', width: '200px' }} onClick={resetBoard}>
                  Play Again
                </button>
              </div>
            )}
          </div>

          <div className="controls">
            <button className="btn-reset" onClick={resetBoard}>
              Reset Board
            </button>
          </div>

          <div className="info-panel">
            <div className="info-title">How it works</div>
            <p className="info-desc">
              This solver uses the <strong>Minimax Algorithm</strong> to analyze every possible future move.
              The engine looks up to 9 moves ahead to ensure it never loses.
              The <span style={{ color: '#407bff' }}>BEST</span> tag indicates the optimal move for the current player.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
