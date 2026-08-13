export type Team = {
  code: string;
  name: string;
  city: string;
  rank: number;
  color: string;
};

// NFL.com post-draft power rankings, published April 27, 2026.
export const teams: Team[] = [
  { code: "SEA", name: "Seahawks", city: "Seattle", rank: 1, color: "#69be28" },
  { code: "LA", name: "Rams", city: "Los Angeles", rank: 2, color: "#003594" },
  { code: "DEN", name: "Broncos", city: "Denver", rank: 3, color: "#fb4f14" },
  { code: "BUF", name: "Bills", city: "Buffalo", rank: 4, color: "#00338d" },
  { code: "BAL", name: "Ravens", city: "Baltimore", rank: 5, color: "#241773" },
  { code: "SF", name: "49ers", city: "San Francisco", rank: 6, color: "#aa0000" },
  { code: "HOU", name: "Texans", city: "Houston", rank: 7, color: "#03202f" },
  { code: "KC", name: "Chiefs", city: "Kansas City", rank: 8, color: "#e31837" },
  { code: "NE", name: "Patriots", city: "New England", rank: 9, color: "#002244" },
  { code: "PHI", name: "Eagles", city: "Philadelphia", rank: 10, color: "#004c54" },
  { code: "CHI", name: "Bears", city: "Chicago", rank: 11, color: "#0b162a" },
  { code: "LAC", name: "Chargers", city: "Los Angeles", rank: 12, color: "#0080c6" },
  { code: "DET", name: "Lions", city: "Detroit", rank: 13, color: "#0076b6" },
  { code: "JAX", name: "Jaguars", city: "Jacksonville", rank: 14, color: "#006778" },
  { code: "PIT", name: "Steelers", city: "Pittsburgh", rank: 15, color: "#ffb612" },
  { code: "GB", name: "Packers", city: "Green Bay", rank: 16, color: "#203731" },
  { code: "CAR", name: "Panthers", city: "Carolina", rank: 17, color: "#0085ca" },
  { code: "TB", name: "Buccaneers", city: "Tampa Bay", rank: 18, color: "#d50a0a" },
  { code: "IND", name: "Colts", city: "Indianapolis", rank: 19, color: "#002c5f" },
  { code: "DAL", name: "Cowboys", city: "Dallas", rank: 20, color: "#003594" },
  { code: "CIN", name: "Bengals", city: "Cincinnati", rank: 21, color: "#fb4f14" },
  { code: "ATL", name: "Falcons", city: "Atlanta", rank: 22, color: "#a71930" },
  { code: "NO", name: "Saints", city: "New Orleans", rank: 23, color: "#d3bc8d" },
  { code: "WAS", name: "Commanders", city: "Washington", rank: 24, color: "#5a1414" },
  { code: "TEN", name: "Titans", city: "Tennessee", rank: 25, color: "#4b92db" },
  { code: "NYG", name: "Giants", city: "New York", rank: 26, color: "#0b2265" },
  { code: "CLE", name: "Browns", city: "Cleveland", rank: 27, color: "#311d00" },
  { code: "MIN", name: "Vikings", city: "Minnesota", rank: 28, color: "#4f2683" },
  { code: "LV", name: "Raiders", city: "Las Vegas", rank: 29, color: "#111111" },
  { code: "MIA", name: "Dolphins", city: "Miami", rank: 30, color: "#008e97" },
  { code: "NYJ", name: "Jets", city: "New York", rank: 31, color: "#125740" },
  { code: "ARI", name: "Cardinals", city: "Arizona", rank: 32, color: "#97233f" },
];
