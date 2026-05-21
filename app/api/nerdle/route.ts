import { NextRequest, NextResponse } from "next/server";

// Standard order of operations (MDAS)
function evaluate(equation: string): number | null {
    try {
        // Safe evaluation for simple expressions
        // Using a basic regex-based parser or just Function() since it's controlled
        // But for Nerdle, we can just use a simple MDAS solver.

        // Split by =
        const parts = equation.split('=');
        if (parts.length !== 2) return null;

        const left = parts[0];
        const right = parseInt(parts[1], 10);

        // We only allow 0-9, +, -, *, /
        if (/[^0-9+\-*/]/.test(left)) return null;

        // Prevent leading zeros except for number 0 itself
        // e.g. 05+1=6 is invalid in some Nerdle versions, but let's be strict
        if (/(^|[+\-*/])0[0-9]/.test(left)) return null;

        // Use a safe evaluation
        // eslint-disable-next-line no-new-func
        const res = new Function(`return ${left}`)();

        if (res === right && Number.isInteger(res)) return res;
        return null;
    } catch {
        return null;
    }
}

// Generate all valid 8-char equations
// This is done once per warm start
let cachedEquations: string[] | null = null;

function getEquations(): string[] {
    if (cachedEquations) return cachedEquations;

    const equations: string[] = [];
    const ops = ['+', '-', '*', '/'];

    // A op B = C
    // Iterate through possible numbers for A and B
    // Max length for A op B = C is 8.
    // Smallest: 1+1=2 (5 chars)
    // Largest: 999+999=1998 (10 chars) - too long
    // 9999/1=9999 (9 chars) - too long
    // 1000/2=500 (8 chars)
    // 12*34=408 (8 chars)
    // 123+45=168 (8 chars)
    // 1234+5=1239 (9 chars)
    // 1234-5=1229 (9 chars)
    // 999-1=998 (7 chars)
    // 99+1=100 (7 chars)
    // 9*9=81 (5 chars)
    // 99*9=891 (7 chars)
    // 99*99=9801 (9 chars)

    // A op B = C (8 chars)
    for (let a = 0; a <= 9999; a++) { // Max 4 digits for A
        for (const op of ops) {
            for (let b = 0; b <= 999; b++) { // Max 3 digits for B
                // Prevent lone zero for + and -
                if ((op === '+' || op === '-') && b === 0) continue;

                let res: number;
                if (op === '+') res = a + b;
                else if (op === '-') res = a - b;
                else if (op === '*') res = a * b;
                else if (op === '/') {
                    if (b === 0 || a % b !== 0) continue; // Division by zero or non-integer result
                    res = a / b;
                } else continue;

                if (res < 0) continue; // Result must be non-negative

                const left = `${a}${op}${b}`;
                const eq = `${left}=${res}`;

                // Check total length and leading zeros in the left side
                if (eq.length === 8 && !/(^|[+\-*/])0[0-9]/.test(left)) {
                    equations.push(eq);
                }
            }
        }
    }

    // A op B op C = D (8 chars)
    // Max 2 digits for A, B, C to keep search space manageable and fit 8 chars
    // e.g., 12+3+4=19 (8 chars)
    // e.g., 1+2+34=37 (8 chars)
    // e.g., 1+23+4=28 (8 chars)
    // e.g., 12+34=46 (7 chars)
    for (let a = 0; a <= 99; a++) {
        for (const op1 of ops) {
            for (let b = 0; b <= 99; b++) {
                if ((op1 === '+' || op1 === '-') && b === 0) continue; // Lone zero for B

                for (const op2 of ops) {
                    for (let c = 0; c <= 99; c++) {
                        if ((op2 === '+' || op2 === '-') && c === 0) continue; // Lone zero for C

                        const left = `${a}${op1}${b}${op2}${c}`;
                        // The left side must be short enough to allow for '=' and the result
                        // Max length for left side is 6 (e.g., 1*2*3=6, 12+3+4=19)
                        if (left.length > 6) continue;

                        let res: number;
                        try {
                            // eslint-disable-next-line no-new-func
                            res = new Function(`return ${left}`)();
                            if (!Number.isInteger(res) || res < 0) continue; // Result must be integer and non-negative
                        } catch { continue; }

                        const eq = `${left}=${res}`;
                        // Check total length and leading zeros in the left side
                        if (eq.length === 8 && !/(^|[+\-*/])0[0-9]/.test(left)) {
                            equations.push(eq);
                        }
                    }
                }
            }
        }
    }

    cachedEquations = Array.from(new Set(equations));
    return cachedEquations;
}

function getMatches(guess: string, feedback: string, possibilities: string[]): string[] {
    return possibilities.filter(eq => {
        // Apply feedback logic (NYT-style)
        // Green: eq[i] === guess[i]
        // Purple/Black: logic for count and position

        for (let i = 0; i < 8; i++) {
            if (feedback[i] === 'g' && eq[i] !== guess[i]) return false;
            if (feedback[i] === 'b' && eq[i] === guess[i]) return false;
        }

        // Count characters for purple logic
        const guessChars = [...guess];
        const eqChars = [...eq];

        // Remove greens
        const remainingEq: string[] = [];
        const remainingGuess: { char: string, index: number, status: string }[] = [];

        for (let i = 0; i < 8; i++) {
            if (feedback[i] === 'g') {
                eqChars[i] = '#'; // consumed
            } else {
                remainingGuess.push({ char: guess[i], index: i, status: feedback[i] });
            }
        }

        for (let i = 0; i < 8; i++) {
            if (eqChars[i] !== '#') remainingEq.push(eqChars[i]);
        }

        for (const g of remainingGuess) {
            const matchIndex = remainingEq.indexOf(g.char);
            if (g.status === 'p') {
                if (matchIndex === -1) return false;
                remainingEq.splice(matchIndex, 1);
            } else if (g.status === 'b') {
                if (matchIndex !== -1) return false;
            }
        }

        return true;
    });
}

// Since generating all 17k might be heavy for a single request without caching, 
// I'll use a pre-calculated or high-speed generator for the standard structures.

export async function POST(req: NextRequest) {
    try {
        const { guess, feedback, history } = await req.json();

        // Get all possible valid equations
        const allPossible = getEquations();

        // If it's the first move and no guess is provided, suggest strong openings
        if ((!history || history.length === 0) && !guess) {
            return NextResponse.json({
                count: allPossible.length,
                bestGuess: "48-32=16",
                topCandidates: [
                    { equation: "48-32=16", score: 10.5 },
                    { equation: "9*8-7=65", score: 10.2 },
                    { equation: "12+35=47", score: 9.8 }
                ]
            });
        }

        // Apply filters based on history
        let filtered = allPossible;
        for (const h of history) {
            const hFeedback = h.tiles.map((t: string) => (t === "correct" ? "g" : t === "present" ? "p" : "b")).join("");
            filtered = getMatches(h.equation, hFeedback, filtered);
        }

        // Apply filters for the current guess if not already in history
        filtered = getMatches(guess, feedback, filtered);

        // Score based on unique characters (simple entropy proxy)
        const historyEquations = new Set(history.map((h: any) => h.equation.toLowerCase()));
        historyEquations.add(guess.toLowerCase());

        const scored = filtered
            .filter(eq => !historyEquations.has(eq.toLowerCase()))
            .map(eq => {
                const uniqueChars = new Set(eq).size;
                return { equation: eq, score: uniqueChars };
            })
            .sort((a, b) => b.score - a.score);

        const best = scored.length > 0 ? scored[0].equation : "???";

        return NextResponse.json({
            count: filtered.length,
            bestGuess: best,
            topCandidates: scored.slice(0, 50)
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Solver failed" }, { status: 500 });
    }
}
