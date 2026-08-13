export type Team = {
  code: string;
  name: string;
  city: string;
  conference: "AFC" | "NFC";
  division: "East" | "North" | "South" | "West";
  rank: number;
  color: string;
};

// NFL.com post-draft power rankings, published April 27, 2026.
export const teams: Team[] = [
  { code: "SEA", name: "Seahawks", city: "Seattle", conference: "NFC", division: "West", rank: 1, color: "#69be28" },
  { code: "LA", name: "Rams", city: "Los Angeles", conference: "NFC", division: "West", rank: 2, color: "#003594" },
  { code: "DEN", name: "Broncos", city: "Denver", conference: "AFC", division: "West", rank: 3, color: "#fb4f14" },
  { code: "BUF", name: "Bills", city: "Buffalo", conference: "AFC", division: "East", rank: 4, color: "#00338d" },
  { code: "BAL", name: "Ravens", city: "Baltimore", conference: "AFC", division: "North", rank: 5, color: "#241773" },
  { code: "SF", name: "49ers", city: "San Francisco", conference: "NFC", division: "West", rank: 6, color: "#aa0000" },
  { code: "HOU", name: "Texans", city: "Houston", conference: "AFC", division: "South", rank: 7, color: "#03202f" },
  { code: "KC", name: "Chiefs", city: "Kansas City", conference: "AFC", division: "West", rank: 8, color: "#e31837" },
  { code: "NE", name: "Patriots", city: "New England", conference: "AFC", division: "East", rank: 9, color: "#002244" },
  { code: "PHI", name: "Eagles", city: "Philadelphia", conference: "NFC", division: "East", rank: 10, color: "#004c54" },
  { code: "CHI", name: "Bears", city: "Chicago", conference: "NFC", division: "North", rank: 11, color: "#0b162a" },
  { code: "LAC", name: "Chargers", city: "Los Angeles", conference: "AFC", division: "West", rank: 12, color: "#0080c6" },
  { code: "DET", name: "Lions", city: "Detroit", conference: "NFC", division: "North", rank: 13, color: "#0076b6" },
  { code: "JAX", name: "Jaguars", city: "Jacksonville", conference: "AFC", division: "South", rank: 14, color: "#006778" },
  { code: "PIT", name: "Steelers", city: "Pittsburgh", conference: "AFC", division: "North", rank: 15, color: "#ffb612" },
  { code: "GB", name: "Packers", city: "Green Bay", conference: "NFC", division: "North", rank: 16, color: "#203731" },
  { code: "CAR", name: "Panthers", city: "Carolina", conference: "NFC", division: "South", rank: 17, color: "#0085ca" },
  { code: "TB", name: "Buccaneers", city: "Tampa Bay", conference: "NFC", division: "South", rank: 18, color: "#d50a0a" },
  { code: "IND", name: "Colts", city: "Indianapolis", conference: "AFC", division: "South", rank: 19, color: "#002c5f" },
  { code: "DAL", name: "Cowboys", city: "Dallas", conference: "NFC", division: "East", rank: 20, color: "#003594" },
  { code: "CIN", name: "Bengals", city: "Cincinnati", conference: "AFC", division: "North", rank: 21, color: "#fb4f14" },
  { code: "ATL", name: "Falcons", city: "Atlanta", conference: "NFC", division: "South", rank: 22, color: "#a71930" },
  { code: "NO", name: "Saints", city: "New Orleans", conference: "NFC", division: "South", rank: 23, color: "#d3bc8d" },
  { code: "WAS", name: "Commanders", city: "Washington", conference: "NFC", division: "East", rank: 24, color: "#5a1414" },
  { code: "TEN", name: "Titans", city: "Tennessee", conference: "AFC", division: "South", rank: 25, color: "#4b92db" },
  { code: "NYG", name: "Giants", city: "New York", conference: "NFC", division: "East", rank: 26, color: "#0b2265" },
  { code: "CLE", name: "Browns", city: "Cleveland", conference: "AFC", division: "North", rank: 27, color: "#311d00" },
  { code: "MIN", name: "Vikings", city: "Minnesota", conference: "NFC", division: "North", rank: 28, color: "#4f2683" },
  { code: "LV", name: "Raiders", city: "Las Vegas", conference: "AFC", division: "West", rank: 29, color: "#111111" },
  { code: "MIA", name: "Dolphins", city: "Miami", conference: "AFC", division: "East", rank: 30, color: "#008e97" },
  { code: "NYJ", name: "Jets", city: "New York", conference: "AFC", division: "East", rank: 31, color: "#125740" },
  { code: "ARI", name: "Cardinals", city: "Arizona", conference: "NFC", division: "West", rank: 32, color: "#97233f" },
];
