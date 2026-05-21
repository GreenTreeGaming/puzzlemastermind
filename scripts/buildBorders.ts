import fs from "fs";
import csv from "csv-parser";

const NAME_FIXES: Record<string, string> = {
    "Iran (Islamic Republic of)": "Iran",
    "Lao People's Democratic Republic": "Laos",
    "Russian Federation": "Russia",
    "Viet Nam": "Vietnam",
};

function normalize(name: string): string {
    return NAME_FIXES[name] || name;
}

const borders: Record<string, Set<string>> = {};

fs.createReadStream("country_borders.csv")
    .pipe(csv())
    .on("data", (row) => {
        const a = normalize(row.country_name);
        const b = normalize(row.country_border_name);

        if (!a || !b) return;

        if (!borders[a]) borders[a] = new Set();
        if (!borders[b]) borders[b] = new Set();

        borders[a].add(b);
        borders[b].add(a);
    })
    .on("end", () => {
        // Convert Set → Array for JSON
        const output: Record<string, string[]> = {};
        for (const key of Object.keys(borders)) {
            output[key] = Array.from(borders[key]);
        }

        fs.writeFileSync(
            "borders.json",
            JSON.stringify(output, null, 2)
        );

        console.log("✅ borders.json created");
    });