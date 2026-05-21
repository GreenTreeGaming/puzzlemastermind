# Sarva Game Solver

SarvaWordleSolver is a Next.js app that bundles a set of interactive puzzle solvers and game strategy tools into one place. It started with Wordle-style solving, but the project now includes logic, geography, card-game, and board-game tools behind a single UI.

The app is built with Next.js 16, React 19, TypeScript, and Tailwind/PostCSS tooling, with most solver logic implemented directly in route handlers or client-side game engines.

## What is in the app

### Word games and daily puzzle helpers

- `Wordle Solver` filters the remaining answer pool from your guess feedback and ranks next guesses using a mix of entropy, worst-case reduction, and letter diversity.
- `Globle Solver` narrows countries from distance and adjacency clues using a country centroid dataset plus border data.
- `Spelling Bee Solver` finds all valid words from a 7-letter set, calculates score, and highlights pangrams.
- `Nerdle Solver` generates valid 8-character equations and reduces the search space from feedback history.
- `Duotrigordle` support exists as a separate experimental route and API flow.

### Board and card strategy tools

- `Tic Tac Toe` uses minimax to recommend perfect play.
- `Connect 4` uses alpha-beta minimax with heuristic board evaluation and dynamic search depth.
- `Blackjack Strategist` applies basic-strategy style decision rules and displays bust probabilities.
- `Texas Hold'em` estimates equity with Monte Carlo simulation, evaluates hand class, and gives simple draw analysis.

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `ESLint 9`
- `Tailwind CSS 4` tooling

## Project structure

```text
app/
  api/
    solve/              Wordle solver API
    globle/             Globle solver API
    spelling-bee/       Spelling Bee solver API
    nerdle/             Nerdle solver API
    duotrigordle/       Experimental Duotrigordle API
  wordle/               Wordle UI
  globle/               Globle UI
  spelling-bee/         Spelling Bee UI
  nerdle/               Nerdle UI
  tic-tac-toe/          Tic Tac Toe UI
  connect-4/            Connect 4 UI
  blackjack/            Blackjack UI
  poker/                Texas Hold'em UI
  components/
data/
  borders.json          Border adjacency data used by Globle
scripts/
  buildBorders.ts       Helper script for generating border relationships
words.json              Word list used by Wordle-style solvers
spelling_bee_words.txt  Dictionary used by the Spelling Bee solver
country_borders.csv     Source border data
```

## Running locally

### Prerequisites

- `Node.js 20+` is recommended
- `npm`

### Install

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build
npm run start
npm run lint
```

## How the main solvers work

### Wordle

The Wordle route posts guesses and tile feedback to `app/api/solve/route.ts`. The solver:

- computes Wordle-style feedback patterns
- filters the remaining candidate list
- scores candidate guesses by entropy, worst-case branch size, and unique-letter coverage
- shifts strategy based on game stage so late guesses favor actual solutions

### Globle

The Globle route posts clue history to `app/api/globle/route.ts`. The solver uses:

- country centroid coordinates
- distance comparisons
- border adjacency data

This lets it shrink the possible country set and recommend the next informative guess.

### Spelling Bee

The Spelling Bee route reads from `spelling_bee_words.txt` and:

- enforces the center-letter rule
- rejects letters outside the 7-letter set
- scores words using standard Spelling Bee scoring conventions
- identifies pangrams

### Nerdle

The Nerdle solver generates valid 8-character equations, applies feedback filtering, and ranks surviving candidates using a simple diversity heuristic.

### Poker

The poker tool runs a client-side Monte Carlo simulation with 2,000 iterations per estimate, computes hand class, and adds lightweight draw analysis for common situations such as flush and straight draws.

## Data files

- [`words.json`](/Users/sarvajithkarun/Desktop/Projects/sarvawordlesolver/words.json) contains the five-letter word list used by Wordle-style solvers.
- [`spelling_bee_words.txt`](/Users/sarvajithkarun/Desktop/Projects/sarvawordlesolver/spelling_bee_words.txt) is the dictionary for the Spelling Bee tool.
- [`data/borders.json`](/Users/sarvajithkarun/Desktop/Projects/sarvawordlesolver/data/borders.json) stores normalized country-border relationships for Globle.
- [`country_borders.csv`](/Users/sarvajithkarun/Desktop/Projects/sarvawordlesolver/country_borders.csv) is the raw border dataset used to derive adjacency data.

## Current state

This project is already useful as a collection of solvers, but it is still closer to an ambitious personal toolkit than a fully standardized product. A few notes that matter if you plan to extend it:

- UI styling is mostly page-local and intentionally custom rather than shared through a design system.
- Solver quality varies by game. Some tools use stronger search logic than others.
- The Duotrigordle page is explicitly experimental.
- There is no formal automated test suite in the repository yet.
- A few app-level defaults still reflect the original `create-next-app` scaffold and can be polished further.

## Ideas for future improvement

- add automated tests for solver correctness and API routes
- move repeated page styling into reusable components or shared tokens
- add benchmark tooling for solver quality and response time
- improve metadata, SEO, and share previews
- standardize dictionaries and datasets with documented provenance

## Credits

The footer credits the project to Sarvajith Karun, with contributions by Kamalesh Motamarri, Pughazhendi Saravanan, and Aditya Nair.
