export const mockTeams = [
  // Group A
  { id: "mexico", name: "Mexico", group: "A", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 3, pts: 4, fifaRanking: 15, attackPower: 78, defenseRating: 77, form: ["W", "D", "L"], h2h: { south_korea: "1-1-0", czechia: "0-1-0", south_africa: "1-0-1" } },
  { id: "south_korea", name: "South Korea", group: "A", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 4, pts: 6, fifaRanking: 22, attackPower: 79, defenseRating: 76, form: ["W", "W", "L"], h2h: { mexico: "0-1-1", czechia: "1-0-0", south_africa: "1-0-0" } },
  { id: "czechia", name: "Czechia", group: "A", played: 3, won: 0, drawn: 2, lost: 1, gf: 2, ga: 4, pts: 2, fifaRanking: 36, attackPower: 74, defenseRating: 75, form: ["D", "D", "L"], h2h: { mexico: "0-1-0", south_korea: "0-0-1", south_africa: "0-1-0" } },
  { id: "south_africa", name: "South Africa", group: "A", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 2, pts: 4, fifaRanking: 59, attackPower: 72, defenseRating: 73, form: ["L", "D", "W"], h2h: { mexico: "1-0-1", south_korea: "0-0-1", czechia: "1-0-0" } },

  // Group B
  { id: "switzerland", name: "Switzerland", group: "B", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, pts: 7, fifaRanking: 19, attackPower: 79, defenseRating: 81, form: ["W", "D", "W"], h2h: { canada: "1-1-0", qatar: "1-0-0", bosnia_herzegovina: "1-0-0" } },
  { id: "canada", name: "Canada", group: "B", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, pts: 4, fifaRanking: 40, attackPower: 77, defenseRating: 74, form: ["L", "D", "W"], h2h: { switzerland: "0-1-1", qatar: "1-0-0", bosnia_herzegovina: "0-1-0" } },
  { id: "qatar", name: "Qatar", group: "B", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 7, pts: 0, fifaRanking: 46, attackPower: 68, defenseRating: 66, form: ["L", "L", "L"], h2h: { switzerland: "0-0-1", canada: "0-0-1", bosnia_herzegovina: "0-0-1" } },
  { id: "bosnia_herzegovina", name: "Bosnia-Herzegovina", group: "B", played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 3, pts: 6, fifaRanking: 74, attackPower: 75, defenseRating: 73, form: ["W", "W", "L"], h2h: { switzerland: "0-0-1", canada: "1-0-0", qatar: "1-0-0" } },

  // Group C
  { id: "scotland", name: "Scotland", group: "C", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, fifaRanking: 39, attackPower: 73, defenseRating: 75, form: ["L", "D", "W"], h2h: { morocco: "0-1-0", brazil: "0-0-1", haiti: "1-0-0" } },
  { id: "morocco", name: "Morocco", group: "C", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, pts: 7, fifaRanking: 13, attackPower: 81, defenseRating: 83, form: ["W", "D", "W"], h2h: { scotland: "1-0-0", brazil: "1-1-0", haiti: "1-0-0" } },
  { id: "brazil", name: "Brazil", group: "C", played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 2, pts: 6, fifaRanking: 5, attackPower: 91, defenseRating: 88, form: ["W", "W", "L"], h2h: { scotland: "1-0-0", morocco: "0-1-1", haiti: "2-0-0" } },
  { id: "haiti", name: "Haiti", group: "C", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 7, pts: 0, fifaRanking: 86, attackPower: 65, defenseRating: 63, form: ["L", "L", "L"], h2h: { scotland: "0-0-1", morocco: "0-0-1", brazil: "0-0-2" } },

  // Group D
  { id: "united_states", name: "United States", group: "D", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, pts: 7, fifaRanking: 14, attackPower: 80, defenseRating: 79, form: ["W", "D", "W"], h2h: { australia: "1-0-0", turkey: "1-1-0", paraguay: "1-0-0" } },
  { id: "australia", name: "Australia", group: "D", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 5, pts: 4, fifaRanking: 23, attackPower: 76, defenseRating: 74, form: ["L", "D", "W"], h2h: { united_states: "0-0-1", turkey: "0-1-0", paraguay: "1-0-0" } },
  { id: "turkey", name: "Turkey", group: "D", played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 3, pts: 5, fifaRanking: 26, attackPower: 79, defenseRating: 76, form: ["W", "D", "D"], h2h: { united_states: "0-1-1", australia: "1-0-0", paraguay: "0-1-0" } },
  { id: "paraguay", name: "Paraguay", group: "D", played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 6, pts: 0, fifaRanking: 56, attackPower: 72, defenseRating: 73, form: ["L", "L", "L"], h2h: { united_states: "0-0-1", australia: "0-0-1", turkey: "0-0-1" } },

  // Group E
  { id: "germany", name: "Germany", group: "E", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 2, pts: 7, fifaRanking: 16, attackPower: 86, defenseRating: 83, form: ["W", "D", "W"], h2h: { ecuador: "1-1-0", ivory_coast: "1-0-0", curacao: "1-0-0" } },
  { id: "ecuador", name: "Ecuador", group: "E", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, pts: 4, fifaRanking: 44, attackPower: 77, defenseRating: 75, form: ["L", "D", "W"], h2h: { germany: "0-1-1", ivory_coast: "0-1-0", curacao: "1-0-0" } },
  { id: "ivory_coast", name: "Ivory Coast", group: "E", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, pts: 6, fifaRanking: 38, attackPower: 78, defenseRating: 76, form: ["W", "W", "L"], h2h: { germany: "0-0-1", ecuador: "1-0-0", curacao: "1-0-0" } },
  { id: "curacao", name: "Curaçao", group: "E", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 8, pts: 0, fifaRanking: 90, attackPower: 64, defenseRating: 62, form: ["L", "L", "L"], h2h: { germany: "0-0-1", ecuador: "0-0-1", ivory_coast: "0-0-1" } },

  // Group F
  { id: "japan", name: "Japan", group: "F", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, pts: 7, fifaRanking: 17, attackPower: 82, defenseRating: 79, form: ["W", "D", "W"], h2h: { netherlands: "1-1-0", sweden: "1-0-0", tunisia: "1-0-0" } },
  { id: "netherlands", name: "Netherlands", group: "F", played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 3, pts: 6, fifaRanking: 7, attackPower: 85, defenseRating: 85, form: ["W", "W", "L"], h2h: { japan: "0-1-1", sweden: "1-0-0", tunisia: "1-0-0" } },
  { id: "sweden", name: "Sweden", group: "F", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, fifaRanking: 24, attackPower: 78, defenseRating: 78, form: ["L", "D", "W"], h2h: { japan: "0-0-1", netherlands: "0-0-1", tunisia: "1-0-0" } },
  { id: "tunisia", name: "Tunisia", group: "F", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 6, pts: 0, fifaRanking: 41, attackPower: 70, defenseRating: 71, form: ["L", "L", "L"], h2h: { japan: "0-0-1", netherlands: "0-0-1", sweden: "0-0-1" } },

  // Group G
  { id: "egypt", name: "Egypt", group: "G", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 3, pts: 4, fifaRanking: 33, attackPower: 79, defenseRating: 75, form: ["L", "D", "W"], h2h: { belgium: "0-1-0", iran: "1-0-0", new_zealand: "1-0-0" } },
  { id: "belgium", name: "Belgium", group: "G", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, pts: 7, fifaRanking: 6, attackPower: 84, defenseRating: 82, form: ["W", "D", "W"], h2h: { egypt: "0-1-0", iran: "1-0-0", new_zealand: "1-0-0" } },
  { id: "iran", name: "Iran", group: "G", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, fifaRanking: 20, attackPower: 72, defenseRating: 70, form: ["L", "D", "W"], h2h: { egypt: "0-0-1", belgium: "0-0-1", new_zealand: "1-0-0" } },
  { id: "new_zealand", name: "New Zealand", group: "G", played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 3, pts: 1, fifaRanking: 104, attackPower: 66, defenseRating: 68, form: ["L", "L", "D"], h2h: { egypt: "0-0-1", belgium: "0-0-1", iran: "0-0-1" } },

  // Group H
  { id: "cape_verde_islands", name: "Cape Verde Islands", group: "H", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, fifaRanking: 65, attackPower: 70, defenseRating: 69, form: ["L", "D", "W"], h2h: { saudi_arabia: "0-1-0", spain: "0-0-1", uruguay: "1-0-0" } },
  { id: "saudi_arabia", name: "Saudi Arabia", group: "H", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, pts: 4, fifaRanking: 53, attackPower: 73, defenseRating: 71, form: ["W", "D", "L"], h2h: { cape_verde_islands: "0-1-0", spain: "0-0-1", uruguay: "1-0-0" } },
  { id: "spain", name: "Spain", group: "H", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 2, pts: 7, fifaRanking: 3, attackPower: 89, defenseRating: 87, form: ["W", "D", "W"], h2h: { cape_verde_islands: "1-0-0", saudi_arabia: "1-0-0", uruguay: "1-1-0" } },
  { id: "uruguay", name: "Uruguay", group: "H", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 5, pts: 4, fifaRanking: 11, attackPower: 83, defenseRating: 83, form: ["L", "D", "W"], h2h: { cape_verde_islands: "0-0-1", saudi_arabia: "0-0-1", spain: "0-1-1" } },

  // Group I
  { id: "france", name: "France", group: "I", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 3, pts: 7, fifaRanking: 2, attackPower: 91, defenseRating: 89, form: ["W", "D", "W"], h2h: { iraq: "1-0-0", norway: "1-1-0", senegal: "1-0-0" } },
  { id: "iraq", name: "Iraq", group: "I", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 6, pts: 3, fifaRanking: 58, attackPower: 70, defenseRating: 68, form: ["L", "W", "L"], h2h: { france: "0-0-1", norway: "0-0-1", senegal: "1-0-0" } },
  { id: "norway", name: "Norway", group: "I", played: 3, won: 1, drawn: 1, lost: 1, gf: 5, ga: 4, pts: 4, fifaRanking: 44, attackPower: 84, defenseRating: 74, form: ["L", "D", "W"], h2h: { france: "0-1-1", iraq: "1-0-0", senegal: "0-0-1" } },
  { id: "senegal", name: "Senegal", group: "I", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, pts: 3, fifaRanking: 19, attackPower: 80, defenseRating: 78, form: ["W", "L", "L"], h2h: { france: "0-0-1", iraq: "0-0-1", norway: "1-0-0" } },

  // Group J
  { id: "algeria", name: "Algeria", group: "J", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 3, pts: 4, fifaRanking: 43, attackPower: 77, defenseRating: 75, form: ["L", "D", "W"], h2h: { argentina: "0-1-0", jordan: "1-0-0", austria: "0-0-1" } },
  { id: "argentina", name: "Argentina", group: "J", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, pts: 7, fifaRanking: 1, attackPower: 92, defenseRating: 88, form: ["W", "D", "W"], h2h: { algeria: "0-1-0", jordan: "1-0-0", austria: "1-0-0" } },
  { id: "jordan", name: "Jordan", group: "J", played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 4, pts: 1, fifaRanking: 71, attackPower: 68, defenseRating: 69, form: ["L", "L", "D"], h2h: { algeria: "0-0-1", argentina: "0-0-1", austria: "0-0-1" } },
  { id: "austria", name: "Austria", group: "J", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 5, pts: 4, fifaRanking: 25, attackPower: 78, defenseRating: 77, form: ["W", "D", "L"], h2h: { algeria: "1-0-0", argentina: "0-0-1", jordan: "1-0-0" } },

  // Group K
  { id: "congo_dr", name: "Congo DR", group: "K", played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 5, pts: 3, fifaRanking: 62, attackPower: 71, defenseRating: 70, form: ["L", "W", "L"], h2h: { colombia: "0-0-1", portugal: "0-0-1", uzbekistan: "1-0-0" } },
  { id: "colombia", name: "Colombia", group: "K", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, pts: 6, fifaRanking: 12, attackPower: 82, defenseRating: 81, form: ["W", "W", "L"], h2h: { congo_dr: "1-0-0", portugal: "0-0-1", uzbekistan: "1-0-0" } },
  { id: "portugal", name: "Portugal", group: "K", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 2, pts: 7, fifaRanking: 8, attackPower: 88, defenseRating: 86, form: ["W", "D", "W"], h2h: { congo_dr: "1-0-0", colombia: "1-0-0", uzbekistan: "1-0-0" } },
  { id: "uzbekistan", name: "Uzbekistan", group: "K", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 7, pts: 0, fifaRanking: 66, attackPower: 70, defenseRating: 68, form: ["L", "L", "L"], h2h: { congo_dr: "0-0-1", colombia: "0-0-1", portugal: "0-0-1" } },

  // Group L
  { id: "england", name: "England", group: "L", played: 3, won: 2, drawn: 1, lost: 0, gf: 8, ga: 2, pts: 7, fifaRanking: 4, attackPower: 90, defenseRating: 86, form: ["W", "D", "W"], h2h: { ghana: "1-0-0", croatia: "1-1-0", panama: "1-0-0" } },
  { id: "ghana", name: "Ghana", group: "L", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 6, pts: 3, fifaRanking: 64, attackPower: 74, defenseRating: 72, form: ["L", "W", "L"], h2h: { england: "0-0-1", croatia: "0-0-1", panama: "1-0-0" } },
  { id: "croatia", name: "Croatia", group: "L", played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 3, pts: 5, fifaRanking: 10, attackPower: 81, defenseRating: 83, form: ["W", "D", "D"], h2h: { england: "0-1-1", ghana: "1-0-0", panama: "0-1-0" } },
  { id: "panama", name: "Panama", group: "L", played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 6, pts: 1, fifaRanking: 45, attackPower: 71, defenseRating: 70, form: ["L", "L", "D"], h2h: { england: "0-0-1", ghana: "0-0-1", croatia: "0-1-0" } }
];

export const mockMatches = [
  // Completed Matches - Day 1
  {
    id: "completed-1",
    status: "COMPLETED",
    day: "Day 1",
    homeTeam: "Mexico",
    awayTeam: "South Africa",
    homeId: "mexico",
    awayId: "south_africa",
    homeScore: 2,
    awayScore: 0,
    homeFlag: "🇲🇽",
    awayFlag: "🇿🇦",
    stats: {
      possession: { home: 55, away: 45 },
      shots: { home: 12, away: 8 },
      shotsOnTarget: { home: 4, away: 2 },
      xg: { home: 1.25, away: 0.65 },
      passes: { home: 420, away: 360 },
      passAccuracy: { home: 84, away: 78 },
      fouls: { home: 11, away: 12 },
      yellowCards: { home: 1, away: 2 }
    },
    lineups: { home: [], away: [] },
    timeline: [
      { minute: 32, team: "home", player: "Lozano", type: "goal", detail: "Assisted by Alvarez (1-0)" },
      { minute: 82, team: "home", player: "Jimenez", type: "goal", detail: "Penalty (2-0)" }
    ]
  },
  {
    id: "completed-2",
    status: "COMPLETED",
    day: "Day 1",
    homeTeam: "Switzerland",
    awayTeam: "Canada",
    homeId: "switzerland",
    awayId: "canada",
    homeScore: 2,
    awayScore: 1,
    homeFlag: "🇨🇭",
    awayFlag: "🇨🇦",
    stats: {
      possession: { home: 51, away: 49 },
      shots: { home: 11, away: 13 },
      shotsOnTarget: { home: 5, away: 4 },
      xg: { home: 1.18, away: 1.35 },
      passes: { home: 450, away: 440 },
      passAccuracy: { home: 85, away: 82 },
      fouls: { home: 10, away: 8 },
      yellowCards: { home: 2, away: 1 }
    },
    lineups: { home: [], away: [] },
    timeline: [
      { minute: 15, team: "away", player: "Jonathan David", type: "goal", detail: "Assisted by Davies (0-1)" },
      { minute: 49, team: "home", player: "Embolo", type: "goal", detail: "Assisted by Xhaka (1-1)" },
      { minute: 77, team: "home", player: "Akanji", type: "goal", detail: "Header from corner (2-1)" }
    ]
  },

  // LIVE Matches - Day 3
  {
    id: "live-1",
    status: "LIVE",
    day: "Day 3",
    minute: 82,
    homeTeam: "Argentina",
    awayTeam: "France",
    homeId: "argentina",
    awayId: "france",
    homeScore: 2,
    awayScore: 2,
    homeFlag: "🇦🇷",
    awayFlag: "🇫🇷",
    stats: {
      possession: { home: 54, away: 46 },
      shots: { home: 14, away: 11 },
      shotsOnTarget: { home: 6, away: 5 },
      xg: { home: 1.84, away: 1.56 },
      passes: { home: 480, away: 412 },
      passAccuracy: { home: 86, away: 82 },
      fouls: { home: 10, away: 12 },
      yellowCards: { home: 2, away: 3 }
    },
    lineups: {
      home: [
        { name: "E. Martínez", number: 23, role: "GK" },
        { name: "Molina", number: 26, role: "DF" },
        { name: "Romero", number: 13, role: "DF" },
        { name: "Otamendi", number: 19, role: "DF" },
        { name: "Tagliafico", number: 3, role: "DF" },
        { name: "De Paul", number: 7, role: "MF" },
        { name: "Enzo Fernández", number: 24, role: "MF" },
        { name: "Mac Allister", number: 20, role: "MF" },
        { name: "Lionel Messi", number: 10, role: "FW" },
        { name: "Julián Álvarez", number: 9, role: "FW" },
        { name: "Di María", number: 11, role: "FW" }
      ],
      away: [
        { name: "Lloris", number: 1, role: "GK" },
        { name: "Koundé", number: 5, role: "DF" },
        { name: "Varane", number: 4, role: "DF" },
        { name: "Upamecano", number: 18, role: "DF" },
        { name: "T. Hernandez", number: 22, role: "DF" },
        { name: "Tchouaméni", number: 8, role: "MF" },
        { name: "Rabiot", number: 14, role: "MF" },
        { name: "Griezmann", number: 7, role: "MF" },
        { name: "Dembélé", number: 11, role: "FW" },
        { name: "Giroud", number: 9, role: "FW" },
        { name: "Kylian Mbappé", number: 10, role: "FW" }
      ]
    },
    timeline: [
      { minute: 23, team: "home", player: "Lionel Messi", type: "goal", detail: "Penalty (1-0)" },
      { minute: 36, team: "home", player: "Di María", type: "goal", detail: "Assisted by Mac Allister (2-0)" },
      { minute: 45, team: "away", player: "Rabiot", type: "yellow", detail: "Foul on De Paul" },
      { minute: 55, team: "home", player: "Romero", type: "yellow", detail: "Foul on Mbappé" },
      { minute: 80, team: "away", player: "Kylian Mbappé", type: "goal", detail: "Penalty (2-1)" },
      { minute: 81, team: "away", player: "Kylian Mbappé", type: "goal", detail: "Volley (2-2)" }
    ]
  },
  {
    id: "live-2",
    status: "LIVE",
    day: "Day 3",
    minute: 61,
    homeTeam: "Brazil",
    awayTeam: "Switzerland",
    homeId: "brazil",
    awayId: "switzerland",
    homeScore: 1,
    awayScore: 0,
    homeFlag: "🇧🇷",
    awayFlag: "🇨🇭",
    stats: {
      possession: { home: 62, away: 38 },
      shots: { home: 10, away: 3 },
      shotsOnTarget: { home: 4, away: 0 },
      xg: { home: 1.12, away: 0.24 },
      passes: { home: 395, away: 242 },
      passAccuracy: { home: 89, away: 77 },
      fouls: { home: 8, away: 11 },
      yellowCards: { home: 1, away: 2 }
    },
    lineups: {
      home: [
        { name: "Alisson", number: 1, role: "GK" },
        { name: "Militão", number: 14, role: "DF" },
        { name: "Marquinhos", number: 4, role: "DF" },
        { name: "Thiago Silva", number: 3, role: "DF" },
        { name: "Alex Sandro", number: 6, role: "DF" },
        { name: "Casemiro", number: 5, role: "MF" },
        { name: "Fred", number: 8, role: "MF" },
        { name: "Paquetá", number: 7, role: "MF" },
        { name: "Raphinha", number: 11, role: "FW" },
        { name: "Richarlison", number: 9, role: "FW" },
        { name: "Vinícius Júnior", number: 20, role: "FW" }
      ],
      away: [
        { name: "Sommer", number: 1, role: "GK" },
        { name: "Widmer", number: 3, role: "DF" },
        { name: "Akanji", number: 5, role: "DF" },
        { name: "Elvedi", number: 4, role: "DF" },
        { name: "Rodriguez", number: 13, role: "DF" },
        { name: "Freuler", number: 8, role: "MF" },
        { name: "Xhaka", number: 10, role: "MF" },
        { name: "Rieder", number: 25, role: "MF" },
        { name: "Sow", number: 15, role: "MF" },
        { name: "Vargas", number: 17, role: "MF" },
        { name: "Embolo", number: 7, role: "FW" }
      ]
    },
    timeline: [
      { minute: 50, team: "away", player: "Rieder", type: "yellow", detail: "Foul on Casemiro" },
      { minute: 58, team: "home", player: "Casemiro", type: "goal", detail: "Assisted by Rodrygo (1-0)" }
    ]
  },
  {
    id: "upcoming-1",
    status: "UPCOMING",
    day: "Day 4",
    homeTeam: "United States",
    awayTeam: "England",
    homeId: "united_states",
    awayId: "england",
    homeScore: 0,
    awayScore: 0,
    homeFlag: "🇺🇸",
    awayFlag: "🏴",
    predictProb: { home: 35, draw: 25, away: 40 },
    stats: null,
    lineups: { home: [], away: [] },
    timeline: []
  },
  {
    id: "upcoming-2",
    status: "UPCOMING",
    day: "Day 4",
    homeTeam: "Germany",
    awayTeam: "Japan",
    homeId: "germany",
    awayId: "japan",
    homeScore: 0,
    awayScore: 0,
    homeFlag: "🇩🇪",
    awayFlag: "🇯🇵",
    predictProb: { home: 60, draw: 20, away: 20 },
    stats: null,
    lineups: { home: [], away: [] },
    timeline: []
  }
];

export const mockPlayers = [
  {
    id: "messi",
    name: "Lionel Messi",
    team: "Argentina",
    position: "Forward",
    jersey: 10,
    age: 38,
    club: "Inter Miami",
    traits: ["Playmaker", "Free Kick Specialist", "Clinical Finisher"],
    stats: { goals: 7, assists: 3, games: 7, shotsPerGame: 4.6, passAccuracy: 87.2 },
    attributes: [
      { label: "Pace", value: 81 },
      { label: "Shooting", value: 92 },
      { label: "Passing", value: 94 },
      { label: "Dribbling", value: 95 },
      { label: "Defending", value: 39 },
      { label: "Physical", value: 65 }
    ],
    heatmap: [
      { x: 75, y: 35, val: 95 },
      { x: 80, y: 40, val: 80 },
      { x: 85, y: 45, val: 70 },
      { x: 70, y: 30, val: 65 },
      { x: 65, y: 50, val: 40 },
      { x: 55, y: 45, val: 30 }
    ]
  },
  {
    id: "mbappe",
    name: "Kylian Mbappé",
    team: "France",
    position: "Forward",
    jersey: 10,
    age: 27,
    club: "Real Madrid",
    traits: ["Speed Dribbler", "Clinical Finisher", "Counter-Attack Threat"],
    stats: { goals: 8, assists: 2, games: 7, shotsPerGame: 5.1, passAccuracy: 83.5 },
    attributes: [
      { label: "Pace", value: 97 },
      { label: "Shooting", value: 89 },
      { label: "Passing", value: 80 },
      { label: "Dribbling", value: 92 },
      { label: "Defending", value: 36 },
      { label: "Physical", value: 78 }
    ],
    heatmap: [
      { x: 82, y: 75, val: 98 },
      { x: 85, y: 80, val: 90 },
      { x: 90, y: 70, val: 85 },
      { x: 75, y: 75, val: 75 },
      { x: 70, y: 80, val: 50 },
      { x: 60, y: 70, val: 30 }
    ]
  },
  {
    id: "neymar",
    name: "Neymar Jr",
    team: "Brazil",
    position: "Forward",
    jersey: 10,
    age: 34,
    club: "Al Hilal",
    traits: ["Flair", "Technical Dribbler", "Creative Passer"],
    stats: { goals: 2, assists: 1, games: 3, shotsPerGame: 3.8, passAccuracy: 82.0 },
    attributes: [
      { label: "Pace", value: 86 },
      { label: "Shooting", value: 83 },
      { label: "Passing", value: 85 },
      { label: "Dribbling", value: 93 },
      { label: "Defending", value: 37 },
      { label: "Physical", value: 61 }
    ],
    heatmap: [
      { x: 78, y: 70, val: 90 },
      { x: 75, y: 65, val: 80 },
      { x: 85, y: 75, val: 75 },
      { x: 70, y: 55, val: 65 },
      { x: 65, y: 50, val: 40 }
    ]
  },
  {
    id: "debruyne",
    name: "Kevin De Bruyne",
    team: "Belgium",
    position: "Midfielder",
    jersey: 7,
    age: 34,
    club: "Manchester City",
    traits: ["Cross Specialist", "Visionary Passer", "Long Shot Threat"],
    stats: { goals: 0, assists: 2, games: 3, shotsPerGame: 2.1, passAccuracy: 89.4 },
    attributes: [
      { label: "Pace", value: 74 },
      { label: "Shooting", value: 86 },
      { label: "Passing", value: 93 },
      { label: "Dribbling", value: 87 },
      { label: "Defending", value: 63 },
      { label: "Physical", value: 74 }
    ],
    heatmap: [
      { x: 58, y: 40, val: 95 },
      { x: 55, y: 35, val: 85 },
      { x: 62, y: 45, val: 75 },
      { x: 50, y: 50, val: 60 },
      { x: 45, y: 35, val: 45 },
      { x: 35, y: 40, val: 30 }
    ]
  },
  {
    id: "bellingham",
    name: "Jude Bellingham",
    team: "England",
    position: "Midfielder",
    jersey: 10,
    age: 22,
    club: "Real Madrid",
    traits: ["Box-to-Box Engine", "Tenacious Tackler", "Late Box-Run Threat"],
    stats: { goals: 2, assists: 1, games: 5, shotsPerGame: 2.3, passAccuracy: 88.5 },
    attributes: [
      { label: "Pace", value: 79 },
      { label: "Shooting", value: 82 },
      { label: "Passing", value: 84 },
      { label: "Dribbling", value: 85 },
      { label: "Defending", value: 77 },
      { label: "Physical", value: 84 }
    ],
    heatmap: [
      { x: 50, y: 50, val: 92 },
      { x: 45, y: 45, val: 85 },
      { x: 55, y: 55, val: 85 },
      { x: 38, y: 48, val: 70 },
      { x: 62, y: 52, val: 70 },
      { x: 75, y: 50, val: 55 },
      { x: 25, y: 50, val: 50 }
    ]
  },
  {
    id: "haaland",
    name: "Erling Haaland",
    team: "Norway",
    position: "Forward",
    jersey: 9,
    age: 25,
    club: "Manchester City",
    traits: ["Acrobatic Finisher", "Physical Dominance", "Target Man"],
    stats: { goals: 12, assists: 1, games: 8, shotsPerGame: 5.4, passAccuracy: 76.5 },
    attributes: [
      { label: "Pace", value: 89 },
      { label: "Shooting", value: 93 },
      { label: "Passing", value: 66 },
      { label: "Dribbling", value: 80 },
      { label: "Defending", value: 43 },
      { label: "Physical", value: 88 }
    ],
    heatmap: [
      { x: 85, y: 50, val: 99 },
      { x: 88, y: 48, val: 90 },
      { x: 80, y: 52, val: 85 },
      { x: 75, y: 45, val: 50 },
      { x: 70, y: 55, val: 35 }
    ]
  },
  {
    id: "salah",
    name: "Mohamed Salah",
    team: "Egypt",
    position: "Forward",
    jersey: 10,
    age: 34,
    club: "Liverpool",
    traits: ["Inside Forward", "Clinical Finisher", "Speed Dribbler"],
    stats: { goals: 6, assists: 4, games: 6, shotsPerGame: 4.1, passAccuracy: 81.2 },
    attributes: [
      { label: "Pace", value: 89 },
      { label: "Shooting", value: 87 },
      { label: "Passing", value: 82 },
      { label: "Dribbling", value: 88 },
      { label: "Defending", value: 45 },
      { label: "Physical", value: 74 }
    ],
    heatmap: [
      { x: 80, y: 30, val: 95 },
      { x: 82, y: 35, val: 88 },
      { x: 85, y: 40, val: 78 },
      { x: 75, y: 28, val: 68 },
      { x: 70, y: 35, val: 50 }
    ]
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    team: "Portugal",
    position: "Forward",
    jersey: 7,
    age: 41,
    club: "Al Nassr",
    traits: ["Target Man", "Aerial Threat", "Clutch Finisher"],
    stats: { goals: 5, assists: 1, games: 6, shotsPerGame: 4.8, passAccuracy: 84.3 },
    attributes: [
      { label: "Pace", value: 77 },
      { label: "Shooting", value: 88 },
      { label: "Passing", value: 78 },
      { label: "Dribbling", value: 80 },
      { label: "Defending", value: 34 },
      { label: "Physical", value: 78 }
    ],
    heatmap: [
      { x: 84, y: 48, val: 96 },
      { x: 86, y: 52, val: 88 },
      { x: 80, y: 45, val: 70 },
      { x: 75, y: 55, val: 55 },
      { x: 70, y: 50, val: 40 }
    ]
  },
  {
    id: "son",
    name: "Son Heung-min",
    team: "South Korea",
    position: "Forward",
    jersey: 7,
    age: 33,
    club: "Tottenham Hotspur",
    traits: ["Long Shot Threat", "Speed Dribbler", "Two-Footed Finisher"],
    stats: { goals: 4, assists: 2, games: 5, shotsPerGame: 3.5, passAccuracy: 83.1 },
    attributes: [
      { label: "Pace", value: 87 },
      { label: "Shooting", value: 88 },
      { label: "Passing", value: 81 },
      { label: "Dribbling", value: 84 },
      { label: "Defending", value: 42 },
      { label: "Physical", value: 70 }
    ],
    heatmap: [
      { x: 80, y: 70, val: 92 },
      { x: 82, y: 65, val: 85 },
      { x: 85, y: 60, val: 78 },
      { x: 75, y: 72, val: 65 },
      { x: 70, y: 65, val: 45 }
    ]
  },
  {
    id: "kane",
    name: "Harry Kane",
    team: "England",
    position: "Forward",
    jersey: 9,
    age: 32,
    club: "Bayern Munich",
    traits: ["Clinical Finisher", "Playmaker Forward", "Passing Vision"],
    stats: { goals: 6, assists: 3, games: 6, shotsPerGame: 3.9, passAccuracy: 84.7 },
    attributes: [
      { label: "Pace", value: 69 },
      { label: "Shooting", value: 93 },
      { label: "Passing", value: 84 },
      { label: "Dribbling", value: 82 },
      { label: "Defending", value: 47 },
      { label: "Physical", value: 82 }
    ],
    heatmap: [
      { x: 85, y: 50, val: 94 },
      { x: 80, y: 48, val: 85 },
      { x: 75, y: 52, val: 85 },
      { x: 65, y: 50, val: 75 },
      { x: 55, y: 50, val: 60 }
    ]
  },
  {
    id: "vinicius",
    name: "Vinícius Júnior",
    team: "Brazil",
    position: "Forward",
    jersey: 7,
    age: 25,
    club: "Real Madrid",
    traits: ["Speed Dribbler", "Flair", "Agility Threat"],
    stats: { goals: 5, assists: 3, games: 6, shotsPerGame: 4.2, passAccuracy: 80.9 },
    attributes: [
      { label: "Pace", value: 95 },
      { label: "Shooting", value: 84 },
      { label: "Passing", value: 78 },
      { label: "Dribbling", value: 91 },
      { label: "Defending", value: 37 },
      { label: "Physical", value: 71 }
    ],
    heatmap: [
      { x: 80, y: 78, val: 98 },
      { x: 82, y: 74, val: 90 },
      { x: 85, y: 82, val: 85 },
      { x: 75, y: 76, val: 75 },
      { x: 70, y: 80, val: 55 }
    ]
  },
  {
    id: "musiala",
    name: "Jamal Musiala",
    team: "Germany",
    position: "Midfielder",
    jersey: 10,
    age: 23,
    club: "Bayern Munich",
    traits: ["Dribbling Wizard", "Technical Maestro", "Agility Threat"],
    stats: { goals: 3, assists: 4, games: 6, shotsPerGame: 2.8, passAccuracy: 88.7 },
    attributes: [
      { label: "Pace", value: 84 },
      { label: "Shooting", value: 81 },
      { label: "Passing", value: 84 },
      { label: "Dribbling", value: 92 },
      { label: "Defending", value: 61 },
      { label: "Physical", value: 66 }
    ],
    heatmap: [
      { x: 70, y: 50, val: 92 },
      { x: 72, y: 45, val: 88 },
      { x: 75, y: 55, val: 85 },
      { x: 65, y: 48, val: 75 },
      { x: 60, y: 52, val: 70 }
    ]
  },
  {
    id: "pulisic",
    name: "Christian Pulisic",
    team: "United States",
    position: "Forward",
    jersey: 10,
    age: 27,
    club: "AC Milan",
    traits: ["Speed Dribbler", "Inside Forward", "Agility Threat"],
    stats: { goals: 3, assists: 2, games: 5, shotsPerGame: 2.9, passAccuracy: 82.5 },
    attributes: [
      { label: "Pace", value: 86 },
      { label: "Shooting", value: 79 },
      { label: "Passing", value: 77 },
      { label: "Dribbling", value: 85 },
      { label: "Defending", value: 41 },
      { label: "Physical", value: 65 }
    ],
    heatmap: [
      { x: 78, y: 74, val: 90 },
      { x: 80, y: 70, val: 82 },
      { x: 82, y: 78, val: 78 },
      { x: 75, y: 72, val: 68 },
      { x: 68, y: 75, val: 50 }
    ]
  },
  {
    id: "modric",
    name: "Luka Modrić",
    team: "Croatia",
    position: "Midfielder",
    jersey: 10,
    age: 40,
    club: "Real Madrid",
    traits: ["Playmaker", "Visionary Passer", "Midfield Controller"],
    stats: { goals: 1, assists: 3, games: 4, shotsPerGame: 1.8, passAccuracy: 91.2 },
    photo: "https://www.thesportsdb.com/images/media/player/cutout/v5y37i1620641614.png",
    attributes: [
      { label: "Pace", value: 66 },
      { label: "Shooting", value: 76 },
      { label: "Passing", value: 91 },
      { label: "Dribbling", value: 88 },
      { label: "Defending", value: 72 },
      { label: "Physical", value: 68 }
    ],
    heatmap: [
      { x: 50, y: 45, val: 95 },
      { x: 45, y: 35, val: 80 },
      { x: 45, y: 55, val: 80 },
      { x: 55, y: 40, val: 85 }
    ]
  },
  {
    id: "yamal",
    name: "Lamine Yamal",
    team: "Spain",
    position: "Forward",
    jersey: 19,
    age: 18,
    club: "Barcelona",
    traits: ["Dribbling Wizard", "Speed Dribbler", "Agile Playmaker"],
    stats: { goals: 2, assists: 4, games: 6, shotsPerGame: 3.2, passAccuracy: 84.5 },
    photo: "https://www.thesportsdb.com/images/media/player/cutout/1qptj61719225723.png",
    attributes: [
      { label: "Pace", value: 92 },
      { label: "Shooting", value: 82 },
      { label: "Passing", value: 85 },
      { label: "Dribbling", value: 93 },
      { label: "Defending", value: 32 },
      { label: "Physical", value: 64 }
    ],
    heatmap: [
      { x: 80, y: 30, val: 95 },
      { x: 82, y: 35, val: 88 },
      { x: 85, y: 40, val: 78 }
    ]
  },
  {
    id: "lewandowski",
    name: "Robert Lewandowski",
    team: "Poland",
    position: "Forward",
    jersey: 9,
    age: 37,
    club: "Barcelona",
    traits: ["Target Man", "Clinical Finisher", "Penalty Taker"],
    stats: { goals: 4, assists: 1, games: 4, shotsPerGame: 4.2, passAccuracy: 78.5 },
    photo: "https://www.thesportsdb.com/images/media/player/cutout/65sw921600249557.png",
    attributes: [
      { label: "Pace", value: 75 },
      { label: "Shooting", value: 91 },
      { label: "Passing", value: 72 },
      { label: "Dribbling", value: 82 },
      { label: "Defending", value: 40 },
      { label: "Physical", value: 84 }
    ],
    heatmap: [
      { x: 85, y: 50, val: 99 },
      { x: 80, y: 48, val: 85 },
      { x: 75, y: 52, val: 85 }
    ]
  },
  {
    id: "griezmann",
    name: "Antoine Griezmann",
    team: "France",
    position: "Forward",
    jersey: 7,
    age: 35,
    club: "Atletico Madrid",
    traits: ["Creative Playmaker", "Set Piece Specialist", "High Work Rate"],
    stats: { goals: 2, assists: 3, games: 6, shotsPerGame: 2.5, passAccuracy: 86.8 },
    photo: "https://www.thesportsdb.com/images/media/player/cutout/65sw921600249557.png",
    attributes: [
      { label: "Pace", value: 78 },
      { label: "Shooting", value: 84 },
      { label: "Passing", value: 88 },
      { label: "Dribbling", value: 86 },
      { label: "Defending", value: 58 },
      { label: "Physical", value: 72 }
    ],
    heatmap: [
      { x: 75, y: 50, val: 90 },
      { x: 70, y: 45, val: 80 },
      { x: 70, y: 55, val: 80 }
    ]
  },
  {
    id: "fernandes",
    name: "Bruno Fernandes",
    team: "Portugal",
    position: "Midfielder",
    jersey: 8,
    age: 31,
    club: "Manchester United",
    traits: ["Long Shot Threat", "Key Passer", "Tenacious Engine"],
    stats: { goals: 3, assists: 4, games: 6, shotsPerGame: 3.1, passAccuracy: 85.3 },
    photo: "https://www.thesportsdb.com/images/media/player/cutout/v5y36i1620641604.png",
    attributes: [
      { label: "Pace", value: 74 },
      { label: "Shooting", value: 86 },
      { label: "Passing", value: 89 },
      { label: "Dribbling", value: 84 },
      { label: "Defending", value: 68 },
      { label: "Physical", value: 76 }
    ],
    heatmap: [
      { x: 55, y: 50, val: 92 },
      { x: 50, y: 40, val: 80 },
      { x: 60, y: 60, val: 80 }
    ]
  },
  {
    id: "valverde",
    name: "Federico Valverde",
    team: "Uruguay",
    position: "Midfielder",
    jersey: 15,
    age: 27,
    club: "Real Madrid",
    traits: ["Box-to-Box Engine", "Long Shot Threat", "Pacey Midfielder"],
    stats: { goals: 2, assists: 2, games: 5, shotsPerGame: 2.4, passAccuracy: 88.1 },
    photo: "https://www.thesportsdb.com/images/media/player/cutout/8wz2h51620473950.png",
    attributes: [
      { label: "Pace", value: 87 },
      { label: "Shooting", value: 82 },
      { label: "Passing", value: 84 },
      { label: "Dribbling", value: 82 },
      { label: "Defending", value: 78 },
      { label: "Physical", value: 85 }
    ],
    heatmap: [
      { x: 50, y: 50, val: 90 },
      { x: 45, y: 40, val: 80 },
      { x: 55, y: 60, val: 80 }
    ]
  }
];
