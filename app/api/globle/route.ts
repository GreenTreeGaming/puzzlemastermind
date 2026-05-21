import { NextRequest, NextResponse } from "next/server";
import rawBorders from "@/data/borders.json";

const BORDERS: Record<string, Set<string>> = {};

for (const key in rawBorders) {
  BORDERS[key] = new Set(rawBorders[key]);
}

const COUNTRIES: Record<string, [number, number]> = {
  "Afghanistan": [33.93911, 67.709953],
  "Albania": [41.153332, 20.168331],
  "Algeria": [28.033886, 1.659626],
  "American Samoa": [-14.271, -170.1322],
  "Andorra": [42.546245, 1.601554],
  "Angola": [-11.202692, 17.873887],
  "Anguilla": [18.2206, -63.0686],
  "Antigua and Barbuda": [17.0608, -61.7964],
  "Argentina": [-38.416097, -63.616672],
  "Armenia": [40.069099, 45.038189],
  "Aruba": [12.5211, -69.9683],
  "Australia": [-25.274398, 133.775136],
  "Austria": [47.516231, 14.550072],
  "Azerbaijan": [40.143105, 47.576927],
  "Bahamas": [25.0343, -77.3963],
  "Bahrain": [25.930414, 50.637772],
  "Bangladesh": [23.684994, 90.356331],
  "Barbados": [13.1939, -59.5432],
  "Belarus": [53.709807, 27.953389],
  "Belgium": [50.503887, 4.469936],
  "Belize": [17.189877, -88.49765],
  "Benin": [9.30769, 2.315834],
  "Bermuda": [32.3078, -64.7505],
  "Bhutan": [27.514162, 90.433601],
  "Bolivia": [-16.290154, -63.588653],
  "Bosnia and Herzegovina": [43.915886, 17.679076],
  "Botswana": [-22.328474, 24.684866],
  "Brazil": [-14.235004, -51.92528],
  "British Virgin Islands": [18.4207, -64.64],
  "Brunei": [4.5353, 114.7277],
  "Bulgaria": [42.733883, 25.48583],
  "Burkina Faso": [12.364637, -1.561593],
  "Burundi": [-3.373056, 29.918886],
  "Cabo Verde": [16.002, -24.0131],
  "Cambodia": [12.565679, 104.990963],
  "Cameroon": [7.369722, 12.354722],
  "Canada": [56.130366, -106.346771],
  "Cayman Islands": [19.3133, -81.2546],
  "Central African Republic": [6.611111, 20.939444],
  "Chad": [15.454166, 18.732207],
  "Chile": [-35.675147, -71.542969],
  "China": [35.86166, 104.195397],
  "Cocos (Keeling) Islands": [-12.1642, 96.871],
  "Colombia": [4.570868, -74.297333],
  "Comoros": [-11.6455, 43.3333],
  "Cook Islands": [-21.2367, -159.7777],
  "Costa Rica": [9.748917, -83.753428],
  "Croatia": [45.1, 15.2],
  "Cuba": [21.521757, -77.781167],
  "Curaçao": [12.1696, -68.99],
  "Cyprus": [35.126413, 33.429859],
  "Czech Republic": [49.817492, 15.472962],
  "DR Congo": [-4.038333, 21.758664],
  "Denmark": [56.26392, 9.501785],
  "Djibouti": [11.825138, 42.590275],
  "Dominica": [15.415, -61.371],
  "Dominican Republic": [18.735693, -70.162651],
  "East Timor": [-8.874217, 125.727539],
  "Ecuador": [-1.831239, -78.183406],
  "Egypt": [26.820553, 30.802498],
  "El Salvador": [13.794185, -88.89653],
  "Equatorial Guinea": [1.650801, 10.267895],
  "Eritrea": [15.179384, 39.782334],
  "Estonia": [58.595272, 25.013607],
  "Ethiopia": [9.145, 40.489673],
  "Falkland Islands": [-51.7963, -59.5236],
  "Faroe Islands": [61.8926, -6.9118],
  "Fiji": [-17.7134, 178.065],
  "Finland": [61.92411, 25.748151],
  "France": [46.227638, 2.213749],
  "French Guiana": [3.9339, -53.1258],
  "French Polynesia": [-17.6509, -149.426],
  "Gabon": [-0.803689, 11.609444],
  "Gambia": [13.443182, -15.310139],
  "Georgia": [42.315407, 43.356892],
  "Germany": [51.165691, 10.451526],
  "Ghana": [7.946527, -1.023194],
  "Gibraltar": [36.1408, -5.3536],
  "Greece": [39.074208, 21.824312],
  "Greenland": [74.73332, -41.68332],
  "Grenada": [12.1165, -61.679],
  "Guadeloupe": [16.265, -61.551],
  "Guam": [13.4443, 144.7937],
  "Guatemala": [15.783471, -90.230759],
  "Guernsey": [49.4657, -2.5853],
  "Guinea": [9.945587, -9.696645],
  "Guinea-Bissau": [11.803749, -15.180413],
  "Guyana": [4.8604, -58.9302],
  "Haiti": [18.971187, -72.285215],
  "Honduras": [15.199999, -86.241905],
  "Hong Kong": [22.3193, 114.1694],
  "Hungary": [47.162494, 19.503304],
  "Iceland": [64.963051, -19.020835],
  "India": [20.593684, 78.96288],
  "Indonesia": [-0.789275, 113.921327],
  "Iran": [32.427908, 53.688046],
  "Iraq": [33.223191, 43.679291],
  "Ireland": [53.41291, -8.24389],
  "Isle of Man": [54.2361, -4.5481],
  "Israel": [31.046051, 34.851612],
  "Italy": [41.87194, 12.56738],
  "Ivory Coast": [7.539989, -5.54708],
  "Jamaica": [18.109581, -77.297508],
  "Japan": [36.204824, 138.252924],
  "Jersey": [49.2144, -2.1312],
  "Jordan": [30.585164, 36.238414],
  "Kazakhstan": [48.019573, 66.923684],
  "Kenya": [-0.023559, 37.906193],
  "Kiribati": [-3.37, 168.73],
  "Kosovo": [42.602636, 20.902977],
  "Kuwait": [29.31166, 47.481766],
  "Kyrgyzstan": [41.20438, 74.766098],
  "Laos": [19.85627, 102.495496],
  "Latvia": [56.879635, 24.603189],
  "Lebanon": [33.854721, 35.862285],
  "Lesotho": [-29.609988, 28.233608],
  "Liberia": [6.428055, -9.429499],
  "Libya": [26.3351, 17.228331],
  "Liechtenstein": [47.166, 9.5554],
  "Lithuania": [55.169438, 23.881275],
  "Luxembourg": [49.815273, 6.129583],
  "Macau": [22.1987, 113.5439],
  "Madagascar": [-18.766947, 46.869107],
  "Malawi": [-13.254308, 34.301525],
  "Malaysia": [4.210484, 101.975766],
  "Maldives": [3.2028, 73.2207],
  "Mali": [17.570692, -3.996166],
  "Malta": [35.9375, 14.3754],
  "Marshall Islands": [7.1315, 171.1845],
  "Martinique": [14.6415, -61.0242],
  "Mauritania": [21.00789, -10.940835],
  "Mauritius": [-20.3484, 57.5522],
  "Mayotte": [-12.8275, 45.1662],
  "Mexico": [23.634501, -102.552784],
  "Micronesia": [7.4256, 150.5508],
  "Moldova": [47.411631, 28.369885],
  "Monaco": [43.7384, 7.4246],
  "Mongolia": [46.862496, 103.846656],
  "Montenegro": [42.708678, 19.37439],
  "Montserrat": [16.7425, -62.1873],
  "Morocco": [31.791702, -7.09262],
  "Mozambique": [-18.665695, 35.529562],
  "Myanmar": [21.913965, 95.956223],
  "Namibia": [-22.95764, 18.49041],
  "Nauru": [-0.5228, 166.9315],
  "Nepal": [28.394857, 84.124008],
  "Netherlands": [52.132633, 5.291266],
  "New Caledonia": [-20.9043, 165.618],
  "New Zealand": [-40.900557, 174.885971],
  "Nicaragua": [12.865416, -85.207229],
  "Niger": [17.607789, 8.081666],
  "Nigeria": [9.081999, 8.675277],
  "Niue": [-19.0544, -169.8672],
  "North Korea": [40.339852, 127.510093],
  "North Macedonia": [41.608635, 21.745275],
  "Norway": [60.472024, 8.468946],
  "Oman": [21.512583, 55.923255],
  "Pakistan": [30.375321, 69.345116],
  "Palau": [7.515, 134.5825],
  "Palestine": [31.952162, 35.233154],
  "Panama": [8.537981, -80.782127],
  "Papua New Guinea": [-6.314993, 143.95555],
  "Paraguay": [-23.442503, -58.443832],
  "Peru": [-9.189967, -75.015152],
  "Philippines": [12.879721, 121.774017],
  "Pitcairn Island": [-24.3768, -128.3242],
  "Poland": [51.919438, 19.145136],
  "Portugal": [39.399872, -8.224454],
  "Puerto Rico": [18.2208, -66.5901],
  "Qatar": [25.354826, 51.183884],
  "Réunion": [-21.1151, 55.5364],
  "Romania": [45.943161, 24.96676],
  "Russia": [61.52401, 105.318756],
  "Rwanda": [-1.940278, 29.873888],
  "Saint Helena": [-15.965, -5.7089],
  "Saint Kitts and Nevis": [17.3578, -62.783],
  "Saint Lucia": [13.9094, -60.9789],
  "Saint-Pierre and Miquelon": [46.8852, -56.3159],
  "Saint Vincent and the Grenadines": [12.9843, -61.2872],
  "Samoa": [-13.759, -172.1046],
  "San Marino": [43.9424, 12.4578],
  "Sao Tome and Principe": [0.1864, 6.6131],
  "Saudi Arabia": [23.885942, 45.079162],
  "Senegal": [14.497401, -14.452362],
  "Serbia": [44.016521, 21.005859],
  "Seychelles": [-4.6796, 55.492],
  "Sierra Leone": [8.460555, -11.779889],
  "Singapore": [1.3521, 103.8198],
  "Sint Maarten": [18.0425, -63.0548],
  "Slovakia": [48.669026, 19.699024],
  "Slovenia": [46.151241, 14.995463],
  "Solomon Islands": [-9.6457, 160.1562],
  "Somalia": [5.152149, 46.199616],
  "South Africa": [-30.559482, 22.937506],
  "South Korea": [35.907757, 127.766922],
  "South Sudan": [4.859363, 31.571251],
  "Spain": [40.463667, -3.74922],
  "Sri Lanka": [7.873054, 80.771797],
  "Sudan": [12.862807, 30.217636],
  "Suriname": [3.919305, -56.027783],
  "Sweden": [60.128161, 18.643501],
  "Switzerland": [46.818188, 8.227512],
  "Syria": [34.802075, 38.996815],
  "Taiwan": [23.69781, 120.960515],
  "Tajikistan": [38.861034, 71.276093],
  "Tanzania": [-6.369028, 34.888822],
  "Thailand": [15.870032, 100.992541],
  "Togo": [8.619543, 0.824782],
  "Tokelau": [-9.2002, -171.8484],
  "Tonga": [-21.179, -175.1982],
  "Trinidad and Tobago": [10.691803, -61.222503],
  "Tunisia": [33.886917, 9.537499],
  "Turkey": [38.963745, 35.243322],
  "Turkmenistan": [38.969719, 59.556278],
  "Turks and Caicos Islands": [21.694, -71.7979],
  "Tuvalu": [-7.1095, 177.6493],
  "Uganda": [1.373333, 32.290275],
  "Ukraine": [48.379433, 31.16558],
  "United Arab Emirates": [23.424076, 53.847818],
  "United Kingdom": [55.378051, -3.435973],
  "United States": [37.09024, -95.712891],
  "United States Virgin Islands": [18.3358, -64.8963],
  "Uruguay": [-32.522779, -55.765835],
  "Uzbekistan": [41.377491, 64.585262],
  "Vanuatu": [-15.3767, 166.9592],
  "Vatican City": [41.9029, 12.4534],
  "Venezuela": [6.42375, -66.58973],
  "Vietnam": [14.058324, 108.277199],
  "Wallis and Futuna": [-13.29, -176.2],
  "Western Sahara": [24.2155, -12.8858],
  "Yemen": [15.552727, 48.516388],
  "Zambia": [-13.133897, 27.849332],
  "Zimbabwe": [-19.015438, 29.154857],
};

const RADIUS: Record<string, number> = {
  "Russia": 3500, "Canada": 1800, "United States": 1750, "China": 2200,
  "Brazil": 1650, "Australia": 1550, "India": 1000, "Argentina": 940,
  "Kazakhstan": 930, "Algeria": 870, "DR Congo": 860, "Saudi Arabia": 830,
  "Mexico": 790, "Indonesia": 780, "Sudan": 770, "Libya": 750, "Iran": 720,
  "Mongolia": 705, "Peru": 640, "Chad": 640, "Niger": 630, "Angola": 630,
  "Mali": 630, "South Africa": 620, "Colombia": 600, "Ethiopia": 600,
  "Bolivia": 590, "Mauritania": 570, "Egypt": 560, "Tanzania": 550,
  "Nigeria": 540, "Venezuela": 540, "Turkey": 500, "Chile": 450,
  "Zambia": 490, "Myanmar": 460, "Afghanistan": 450, "France": 420,
  "Somalia": 450, "Central African Republic": 450, "Ukraine": 440,
  "Kenya": 430, "Madagascar": 430, "Botswana": 430, "Thailand": 400,
  "Spain": 400, "Turkmenistan": 395, "Uzbekistan": 380, "Sweden": 400,
  "Iraq": 370, "Morocco": 370, "Vietnam": 320, "Norway": 320, "Poland": 320,
  "Italy": 310, "Philippines": 310, "Ecuador": 300, "Burkina Faso": 300,
  "Germany": 340, "Finland": 330, "Gabon": 290, "New Zealand": 290,
  "United Kingdom": 280, "Romania": 280, "Laos": 275, "Guyana": 260,
  "Oman": 310, "Belarus": 260, "Kyrgyzstan": 250, "Senegal": 250,
  "Syria": 240, "Cambodia": 240, "Uruguay": 240, "Tunisia": 230,
  "Suriname": 230, "Bangladesh": 215, "Nepal": 215, "Tajikistan": 215,
  "Greece": 200, "Nicaragua": 200, "Eritrea": 190, "North Korea": 200,
  "Malawi": 195, "Benin": 190, "Honduras": 190, "Liberia": 185,
  "Mozambique": 500, "Zimbabwe": 350, "Namibia": 400,
  "Ghana": 270, "Guinea": 240, "Cameroon": 390, "Ivory Coast": 320,
  "Bulgaria": 190, "Cuba": 185, "Guatemala": 185, "Iceland": 180,
  "South Korea": 180, "Hungary": 170, "Portugal": 170, "Jordan": 170,
  "Serbia": 170, "Azerbaijan": 165, "Austria": 160, "United Arab Emirates": 160,
  "Czech Republic": 160, "Panama": 155, "Sierra Leone": 150, "Ireland": 150,
  "Georgia": 150, "Sri Lanka": 145, "Lithuania": 145, "Latvia": 145,
  "Togo": 135, "Croatia": 135, "Bosnia and Herzegovina": 125, "Costa Rica": 125,
  "Slovakia": 125, "Dominican Republic": 125, "Bhutan": 110, "Estonia": 120,
  "Denmark": 115, "Netherlands": 115, "Switzerland": 115, "Guinea-Bissau": 105,
  "Moldova": 105, "Belgium": 100, "Lesotho": 100, "Armenia": 95, "Albania": 95,
  "Equatorial Guinea": 95, "Burundi": 95, "Rwanda": 90, "Haiti": 95,
  "Israel": 85, "Slovenia": 80, "Kuwait": 75, "Fiji": 75, "Gambia": 60,
  "Jamaica": 60, "Lebanon": 55, "Cyprus": 55, "Puerto Rico": 55,
  "Brunei": 40, "Trinidad and Tobago": 40, "Luxembourg": 30, "Mauritius": 25,
  "Hong Kong": 15, "Singapore": 10,
  "American Samoa": 15, "Andorra": 10, "Anguilla": 5, "Antigua and Barbuda": 10,
  "Aruba": 5, "Bahamas": 50, "Barbados": 5, "Belize": 60, "Bermuda": 5,
  "British Virgin Islands": 5, "Cabo Verde": 20, "Cayman Islands": 5,
  "Cocos (Keeling) Islands": 2, "Comoros": 10, "Cook Islands": 10,
  "Curaçao": 5, "Dominica": 5, "Falkland Islands": 30, "Faroe Islands": 15,
  "French Guiana": 90, "French Polynesia": 150, "Gibraltar": 2,
  "Greenland": 600, "Grenada": 5, "Guadeloupe": 15, "Guam": 10,
  "Guernsey": 4, "Isle of Man": 10, "Jersey": 4, "Kiribati": 200,
  "Liechtenstein": 5, "Macau": 2, "Maldives": 30, "Malta": 10,
  "Marshall Islands": 150, "Martinique": 15, "Mayotte": 5, "Micronesia": 200,
  "Monaco": 1, "Montserrat": 3, "Nauru": 3, "New Caledonia": 100,
  "Niue": 5, "Northern Mariana Islands": 50, "Palau": 30, "Pitcairn Island": 2,
  "Réunion": 15, "Saint Helena": 5, "Saint Kitts and Nevis": 5, "Saint Lucia": 5,
  "Saint-Pierre and Miquelon": 5, "Saint Vincent and the Grenadines": 5,
  "Samoa": 20, "San Marino": 5, "Sao Tome and Principe": 10, "Seychelles": 15,
  "Sint Maarten": 3, "Solomon Islands": 150, "Tokelau": 5, "Tonga": 30,
  "Turks and Caicos Islands": 15, "Tuvalu": 10, "United States Virgin Islands": 5,
  "Vanuatu": 60, "Vatican City": 1, "Wallis and Futuna": 5, "Western Sahara": 250,
};


const VALID_COUNTRIES = new Set([
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti",
  "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
  "Taiwan", "Vatican City", "Palestine"
]);

const FILTERED_RADIUS: Record<string, number> = {};
for (const key of Object.keys(RADIUS)) {
  if (VALID_COUNTRIES.has(key)) {
    FILTERED_RADIUS[key] = RADIUS[key];
  }
}

function actuallyBorders(a: string, b: string): boolean {
  return BORDERS[a]?.has(b) ?? false;
}


function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ALL_COUNTRY_NAMES = Object.keys(COUNTRIES).filter(c => VALID_COUNTRIES.has(c));
const DISTANCE_MATRIX: Record<string, Record<string, number>> = {};

for (const a of ALL_COUNTRY_NAMES) {
  DISTANCE_MATRIX[a] = {};
  const [la, lo] = COUNTRIES[a];
  for (const b of ALL_COUNTRY_NAMES) {
    const [lb, ll] = COUNTRIES[b];
    DISTANCE_MATRIX[a][b] = haversine(la, lo, lb, ll);
  }
}

function estimateBorderDistance(a: string, b: string): number {
  const d = DISTANCE_MATRIX[a]?.[b] ?? 100000;
  const rA = FILTERED_RADIUS[a] ?? 80;
  const rB = FILTERED_RADIUS[b] ?? 80;
  return Math.max(0, d - rA - rB);
}

// ─────────────────────────────────────────────────────────────
// FIX: Use a hard cap of 500 km on each country's radius when
// deciding adjacency. Without this cap, Russia's 3500 km radius
// causes it to "border" Central Asian countries that it doesn't
// actually touch, misleading the solver after adjacent clues.
// ─────────────────────────────────────────────────────────────
const ADJACENCY_RADIUS_CAP = 500;

function isLikelyBordering(a: string, b: string): boolean {
  const d = DISTANCE_MATRIX[a]?.[b] ?? 100000;
  const rA = Math.min(FILTERED_RADIUS[a] ?? 80, ADJACENCY_RADIUS_CAP);
  const rB = Math.min(FILTERED_RADIUS[b] ?? 80, ADJACENCY_RADIUS_CAP);
  return (d - rA - rB) <= 0;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function levenshtein(a: string, b: string): number {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function findCountry(input: string): string | null {
  const norm = normalize(input);
  const exact = ALL_COUNTRY_NAMES.find(c => normalize(c) === norm);
  if (exact) return exact;

  // Fuzzy match: allowing up to 2 edits or 30% of string length
  let bestMatch: string | null = null;
  let minDistance = Infinity;
  for (const c of ALL_COUNTRY_NAMES) {
    const dist = levenshtein(norm, normalize(c));
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = c;
    }
  }

  if (bestMatch && minDistance <= Math.max(2, Math.floor(norm.length * 0.3))) {
    return bestMatch;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Clue shape sent from the UI:
//
//   country  – the country that was guessed
//   distance – the CURRENT BEST distance shown by the game
//   status   – 'warmer'   -> this guess is the new closest (dist = distance)
//              'cooler'   -> this guess is NOT the new closest (dist > distance)
//              'adjacent' -> this guess touches the answer (dist ≈ 0)
// ─────────────────────────────────────────────────────────────
type ClueStatus = 'warmer' | 'cooler' | 'adjacent';

interface Clue {
  country: string;
  distance: number;
  status: ClueStatus;
}

function scoreCandidate(candidate: string, clues: Clue[]): number {
  let totalErr = 0;
  let currentBest: string | null = null;
  const hasAdjacent = clues.some(c => c.status === 'adjacent');

  for (const clue of clues) {
    const guessed = findCountry(clue.country);
    if (!guessed) continue;

    const estToGuessed = estimateBorderDistance(guessed, candidate);

    if (clue.status !== "adjacent") {
      if (BORDERS[guessed] && actuallyBorders(guessed, candidate)) {
        return 1e9;
      }
    }

    if (clue.status === 'adjacent') {
      // Border-to-border must be 0. Extremely strong signal.
      totalErr += estToGuessed * 50.0;
      currentBest = guessed;
      continue;
    }

    if (clue.status === 'warmer') {
      // A warmer guess gives us an EXACT distance ring!
      if (hasAdjacent) {
        totalErr += Math.abs(estToGuessed - clue.distance) * 0.1;
      } else {
        totalErr += Math.abs(estToGuessed - clue.distance);
      }

      // It also means it's strictly closer than the previous best
      if (currentBest && currentBest !== guessed) {
        let estToPrevBest = estimateBorderDistance(currentBest, candidate);
        if (estToGuessed >= estToPrevBest) {
          totalErr += (estToGuessed - estToPrevBest + 50) * 15.0;
        }
      }

      currentBest = guessed;
    } else if (clue.status === 'cooler') {
      if (currentBest) {
        let estBest = estimateBorderDistance(currentBest, candidate);
        let estCurrent = estToGuessed;

        // Use exact centroid distance if border overlap prevents comparison
        if (estCurrent <= 20 && estBest <= 20) {
          estCurrent = DISTANCE_MATRIX[guessed]?.[candidate] ?? 1000;
          estBest = DISTANCE_MATRIX[currentBest]?.[candidate] ?? 1000;
        }

        // MUST be strictly worse than best
        if (estCurrent <= estBest) {
          // Massive penalty if candidate is closer to cooler guess
          totalErr += (estBest - estCurrent + 50) * 15.0;
        }
      }
    }
  }

  // Tie-breaker: prefer candidates that are generally closer to our final best anchor
  if (currentBest && !hasAdjacent) {
    totalErr += estimateBorderDistance(currentBest, candidate) * 0.001;
  }

  return totalErr;
}

function getBestGuess(top: { country: string; error: number }[], clues: Clue[]): string {
  if (top.length === 0) return "Chad";

  const adjacentClues = clues.filter(c => c.status === 'adjacent');

  if (adjacentClues.length > 0) {
    const adjacentCountries = adjacentClues
      .map(c => findCountry(c.country))
      .filter((c): c is string => c !== null);

    if (adjacentCountries.length > 0 && top.length > 1) {
      // ─────────────────────────────────────────────────────────
      // FIX: Use isLikelyBordering (capped radius) instead of
      // estimateBorderDistance === 0. The old approach let Russia's
      // 3500 km radius make it "adjacent" to Kyrgyzstan even though
      // the centroids are ~3800 km apart — far outside the 500 km cap.
      // ─────────────────────────────────────────────────────────
      const filtered = top.slice(0, 80).filter(t => {
        for (const adj of adjacentCountries) {
          if (BORDERS[adj]) {
            if (!actuallyBorders(adj, t.country)) {
              return false; // reject immediately
            }
          } else {
            if (!isLikelyBordering(adj, t.country)) {
              return false;
            }
          }
        }
        return true;
      });

      if (filtered.length > 0) {
        return filtered.sort((a, b) => a.error - b.error)[0].country;
      }

      // Sort: most adjacent constraints satisfied first, then lowest error
      // rankedByAdjacency.sort((a, b) => {
      //   if (b.satisfied !== a.satisfied) return b.satisfied - a.satisfied;
      //   return a.error - b.error;
      // });

      // if (rankedByAdjacency[0].satisfied > 0) {
      //   return rankedByAdjacency[0].country;
      // }
    }
  }

  return top[0].country;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clues } = body as { clues?: Clue[] };

  if (!clues || clues.length === 0) {
    return NextResponse.json({
      possible: ALL_COUNTRY_NAMES,
      bestGuess: "Chad",
      count: ALL_COUNTRY_NAMES.length,
      top10: [],
    });
  }


  const guessedSet = new Set(clues.map(c => normalize(c.country)));
  const adjacentClues = clues.filter(c => c.status === "adjacent");

  const adjacentCountries = adjacentClues
    .map(c => findCountry(c.country))
    .filter((c): c is string => c !== null);

  const basePool = ALL_COUNTRY_NAMES.filter(c => !guessedSet.has(normalize(c)));

  const filteredPool =
    adjacentCountries.length > 0
      ? basePool.filter(candidate => {
        for (const adj of adjacentCountries) {
          if (BORDERS[adj]) {
            if (!actuallyBorders(adj, candidate)) return false;
          } else {
            if (!isLikelyBordering(adj, candidate)) return false;
          }
        }
        return true;
      })
      : basePool;

  // 🔥 fallback if filtering nukes everything
  const pool = filteredPool.length > 0 ? filteredPool : basePool;

  if (adjacentCountries.length >= 3) {
    const possible = pool;

    return NextResponse.json({
      possible,
      bestGuess: possible[0] ?? "Chad",
      count: possible.length,
      top10: possible.slice(0, 10).map(c => ({ country: c, error: 0 })),
    });
  }

  const scored = pool
    .map(c => ({ country: c, error: scoreCandidate(c, clues) }))
    .sort((a, b) => a.error - b.error);

  const bestError = scored[0]?.error ?? 0;
  const threshold = Math.max(bestError * 1.5, 800);

  const possible = scored
    .filter(c => c.error <= threshold)
    .map(c => c.country);

  const bestGuess = getBestGuess(scored.slice(0, 30), clues);

  const top10 = scored.slice(0, 10).map(c => ({
    country: c.country,
    error: Math.round(c.error),
  }));

  return NextResponse.json({
    possible,
    bestGuess,
    count: possible.length,
    top10,
  });
}