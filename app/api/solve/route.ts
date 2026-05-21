import { NextRequest, NextResponse } from "next/server";

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

// 🎯 Letter diversity (encourages unique letters early)
function uniqueLetterScore(word: string): number {
  return new Set(word).size;
}

function getWorstCaseAndEntropy(
  guess: string,
  possibleWords: string[]
) {
  const patterns: Record<string, number> = {};

  for (const word of possibleWords) {
    const pattern = getFeedback(guess, word);
    patterns[pattern] = (patterns[pattern] || 0) + 1;
  }

  const counts = Object.values(patterns);
  const worstCase = Math.max(...counts);

  let entropy = 0;
  const total = possibleWords.length;

  for (const count of counts) {
    const p = count / total;
    entropy += p * Math.log2(1 / p);
  }

  return { worstCase, entropy };
}

function scoreAndRank(
  possibleWords: string[],
  allWords: string[]
) {
  const size = possibleWords.length;

  // 🧠 Dynamic strategy switching
  let candidates: string[];

  if (size > 20) {
    // exploration heavy
    candidates = allWords;
  } else if (size > 8) {
    // balanced
    candidates = allWords;
  } else {
    // 🔥 ENDGAME: only guess possible answers
    candidates = possibleWords;
  }

  const ranked = [];

  for (const word of candidates) {
    const { worstCase, entropy } =
      getWorstCaseAndEntropy(word, possibleWords);

    const isSolution = possibleWords.includes(word) ? 1 : 0;
    const diversity = uniqueLetterScore(word);

    // 🎯 Dynamic weighting based on game stage
    let score = 0;

    if (size > 20) {
      // early game → explore
      score =
        entropy * 2 +
        diversity * 1.5 -
        worstCase * 1.2 +
        isSolution * 0.2;
    } else if (size > 8) {
      // mid game → balance
      score =
        entropy * 1.5 +
        diversity * 0.5 -
        worstCase * 1.5 +
        isSolution * 1.5;
    } else {
      // 🔥 late game → solve
      score =
        entropy * 0.5 -
        worstCase * 2 +
        isSolution * 5;
    }

    ranked.push({
      word,
      worstCase,
      entropy,
      score,
    });
  }

  ranked.sort((a, b) => b.score - a.score);

  return ranked;
}

// load word list once
const ALL_WORDS: string[] = require("../../../words.json");

export async function POST(req: NextRequest) {
  const { guess, feedback, possible } = await req.json();

  // 🧠 FIRST MOVE
  if (!guess || guess.length === 0) {
    const FIRST_GUESS = "serai";

    return NextResponse.json({
      possible: ALL_WORDS,
      bestGuess: FIRST_GUESS,
      top3: [
        { word: "serai" },
        { word: "soare" },
        { word: "roate" },
      ],
    });
  }

  // 🔍 Filter possible words
  const filtered = possible.filter(
    (w: string) => getFeedback(guess, w) === feedback
  );

  if (filtered.length === 0) {
    return NextResponse.json({
      possible: [],
      bestGuess: "N/A",
      top3: [],
      error: "No matches"
    });
  }

  // 🧠 If only 1 left → instant solve
  if (filtered.length === 1) {
    return NextResponse.json({
      possible: filtered,
      bestGuess: filtered[0],
      top3: [{ word: filtered[0] }],
    });
  }

  const ranked = scoreAndRank(filtered, ALL_WORDS);

  return NextResponse.json({
    possible: filtered,
    bestGuess: ranked[0].word,
    top3: ranked.slice(0, 3),
  });
}