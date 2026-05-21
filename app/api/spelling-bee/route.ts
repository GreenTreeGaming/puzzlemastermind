import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Function to calculate score based on NYT Spelling Bee rules
function calculateScore(word: string, isPangram: boolean): number {
    if (word.length === 4) return 1;
    let score = word.length;
    if (isPangram) score += 7;
    return score;
}

function isPalindrome(word: string): boolean {
    return word.length > 2 && word === word.split('').reverse().join('');
}

const filePath = path.join(process.cwd(), "spelling_bee_words.txt");
let cachedWords: string[] | null = null;

function getWords() {
    if (cachedWords) return cachedWords;
    try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        cachedWords = fileContent.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w.length >= 4);
        return cachedWords;
    } catch (error) {
        console.error("Failed to read word list:", error);
        return [];
    }
}

export async function POST(req: NextRequest) {
    try {
        const { letters, centerLetter } = await req.json();

        if (!letters || !centerLetter || letters.length !== 6 || centerLetter.length !== 1) {
            return NextResponse.json({ error: "Invalid input. Provide 6 letters and 1 center letter." }, { status: 400 });
        }

        const allAllowedLetters = new Set([...letters.map((l: string) => l.toLowerCase()), centerLetter.toLowerCase()]);
        const requiredLetter = centerLetter.toLowerCase();

        // Get the word list
        const allWords = getWords();

        const validWords = [];

        for (const word of allWords) {
            // Basic Spelling Bee rules:
            // 1. Min 4 letters
            // 2. Contains center letter
            // 3. Only uses allowed letters
            if (word.length < 4) continue;
            if (!word.includes(requiredLetter)) continue;

            let isPossible = true;
            const seenInWord = new Set<string>();
            for (const char of word) {
                if (!allAllowedLetters.has(char)) {
                    isPossible = false;
                    break;
                }
                seenInWord.add(char);
            }

            if (isPossible) {
                const isPangram = seenInWord.size === 7;
                const score = calculateScore(word, isPangram);
                const palindrome = isPalindrome(word);

                validWords.push({
                    word,
                    score,
                    isPangram,
                    isPalindrome: palindrome,
                    length: word.length
                });
            }
        }

        // Sort by score first, then length, then alphabetically
        validWords.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.length !== a.length) return b.length - a.length;
            return a.word.localeCompare(b.word);
        });

        return NextResponse.json({
            words: validWords,
            totalWords: validWords.length,
            totalScore: validWords.reduce((acc, curr) => acc + curr.score, 0),
            pangrams: validWords.filter(w => w.isPangram).map(w => w.word)
        });

    } catch (error: any) {
        console.error("Spelling Bee Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
