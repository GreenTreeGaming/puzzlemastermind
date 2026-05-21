import { NextRequest, NextResponse } from "next/server";

const ALL_WORDS: string[] = require("../../../words.json");

function getFeedback(guess: string, solution: string): string {
  let feedback = Array(5).fill("b");
  let sol = solution.split("");
  let g = guess.split("");

  // greens
  for (let i = 0; i < 5; i++) {
    if (g[i] === sol[i]) {
      feedback[i] = "g";
      sol[i] = "";
      g[i] = "";
    }
  }

  // yellows
  for (let i = 0; i < 5; i++) {
    if (g[i] && sol.includes(g[i])) {
      feedback[i] = "y";
      sol[sol.indexOf(g[i])] = "";
    }
  }

  return feedback.join("");
}

// 🧠 entropy per board
function getEntropy(guess: string, possibleWords: string[]) {
  const total = possibleWords.length;
  if (total === 0) return 0; // 🎯 Avoid division by zero

  const patterns: Record<string, number> = {};

  for (const word of possibleWords) {
    const pattern = getFeedback(guess, word);
    patterns[pattern] = (patterns[pattern] || 0) + 1;
  }

  let entropy = 0;

  for (const count of Object.values(patterns)) {
    const p = count / total;
    entropy += p * Math.log2(1 / p);
  }

  return entropy;
}

// 🎯 GLOBAL scoring across ALL boards
function scoreGuessGlobal(
  guess: string,
  boards: string[][]
) {
  let totalEntropy = 0;
  let activeBoards = 0;

  for (const possible of boards) {
    if (possible.length <= 1) continue;

    totalEntropy += getEntropy(guess, possible);
    activeBoards++;
  }

  return activeBoards > 0
    ? totalEntropy / activeBoards
    : 0;
}

function getBestGuessGlobal(
  boards: string[][],
  allWords: string[]
) {
  let bestWord = "";
  let bestScore = -Infinity;

  for (const word of allWords) {
    const score = scoreGuessGlobal(word, boards);

    if (score > bestScore) {
      bestScore = score;
      bestWord = word;
    }
  }

  return bestWord;
}

export async function POST(req: NextRequest) {
  const { guess, feedbacks, boards } = await req.json();

  /**
   * boards: string[][]
   * feedbacks: string[] (length 32, e.g. "bgybb")
   */

  // 🧠 FIRST MOVE
  if (!guess) {
    return NextResponse.json({
      boards: Array(32).fill(ALL_WORDS),
      bestGuess: "serai",
    });
  }

  // 🔍 Update each board
  const newBoards = boards.map(
    (possible: string[], i: number) => {
      const fb = feedbacks[i];

      if (!fb) return possible;
      if (fb === "ggggg") return [guess]; // ✅ mark as solved with 1 word

      return possible.filter(
        (w) => getFeedback(guess, w) === fb
      );
    }
  );

  // 🧠 check if everything solved
  const allSolved = newBoards.every(
    (b) => b.length <= 1
  );

  if (allSolved) {
    return NextResponse.json({
      boards: newBoards,
      bestGuess: null,
      done: true,
    });
  }

  // 🎯 pick global best guess
  const bestGuess = getBestGuessGlobal(
    newBoards,
    ALL_WORDS
  );

  return NextResponse.json({
    boards: newBoards,
    bestGuess,
  });
}