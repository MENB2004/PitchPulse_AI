import { useState, useEffect } from "react";
import { 
  Activity, 
  Award, 
  Cpu, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Pause,
  Clock, 
  X, 
  Play, 
  Zap, 
  AlertCircle,
  Search,
  Filter,
  CheckCircle,
  RotateCcw
} from "lucide-react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import heroPoster from "./assets/hero.png";
import fifaLogo from "./assets/fifa-transparent.png";
import { supabase } from "./supabase.js";

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const countryCodes = {
  mexico: "mx", "south korea": "kr", czechia: "cz", "south africa": "za",
  switzerland: "ch", canada: "ca", qatar: "qa", "bosnia-herzegovina": "ba",
  scotland: "gb-sct", morocco: "ma", brazil: "br", haiti: "ht",
  "united states": "us", usa: "us", australia: "au", turkey: "tr", paraguay: "py",
  germany: "de", ecuador: "ec", "ivory coast": "ci", curacao: "cw",
  japan: "jp", netherlands: "nl", sweden: "se", tunisia: "tn",
  egypt: "eg", belgium: "be", iran: "ir", "new zealand": "nz",
  "cape verde islands": "cv", "saudi arabia": "sa", spain: "es", uruguay: "uy",
  france: "fr", iraq: "iq", norway: "no", senegal: "sn",
  algeria: "dz", argentina: "ar", jordan: "jo", austria: "at",
  "congo dr": "cd", colombia: "co", portugal: "pt", uzbekistan: "uz",
  england: "gb-eng", ghana: "gh", croatia: "hr", panama: "pa"
};

const getTeamFlag = (teamName) => {
  const key = teamName?.toLowerCase().trim().replace(/[-_]+/g, " ") || "";
  const code = countryCodes[key];
  if (code) {
    if (code.includes("-")) {
      return `https://flagcdn.com/w160/${code.split("-")[1]}.png`;
    }
    return `https://flagcdn.com/w160/${code}.png`;
  }
  return "⚽";
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [matches, setMatches] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselAutoplay, setCarouselAutoplay] = useState(true);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [standings, setStandings] = useState({});
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [crestErrors, setCrestErrors] = useState({});
  
  // Advanced filters state
  const [selectedDay, setSelectedDay] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedScheduleTeam, setSelectedScheduleTeam] = useState("All");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Tactical Predictor state
  const [predictTeamA, setPredictTeamA] = useState("Argentina");
  const [predictTeamB, setPredictTeamB] = useState("France");
  const [formationA, setFormationA] = useState("4-3-3");
  const [mentalityA, setMentalityA] = useState("balanced");
  const [formationB, setFormationB] = useState("4-3-3");
  const [mentalityB, setMentalityB] = useState("balanced");
  
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  // Match Center (modal) state
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Player Directory state
  const [searchQuery, setSearchQuery] = useState("");
  const [playerFilterPosition, setPlayerFilterPosition] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [comparePlayerId, setComparePlayerId] = useState("");
  
  const [activeSquad, setActiveSquad] = useState([]);
  const [squadLoading, setSquadLoading] = useState(false);
  const [playerDetailsLoading, setPlayerDetailsLoading] = useState(false);

  // Heuristics for position-based attributes
  const getDynamicAttributes = (position) => {
    const pos = position?.toLowerCase() || "";
    const isGK = pos.includes("goalkeeper") || pos.includes("gk");
    const isDF = pos.includes("defender") || pos.includes("df") || pos.includes("back");
    const isMF = pos.includes("midfielder") || pos.includes("mf");

    if (isGK) {
      return [
        { label: "Reflexes", value: 80 + Math.round(Math.random() * 10) },
        { label: "Diving", value: 78 + Math.round(Math.random() * 10) },
        { label: "Handling", value: 75 + Math.round(Math.random() * 12) },
        { label: "Kicking", value: 68 + Math.round(Math.random() * 18) },
        { label: "Positioning", value: 78 + Math.round(Math.random() * 10) },
        { label: "Physical", value: 65 + Math.round(Math.random() * 15) }
      ];
    }

    let pace = 72 + Math.round(Math.random() * 18);
    let shooting = 52 + Math.round(Math.random() * 28);
    let passing = 68 + Math.round(Math.random() * 18);
    let dribbling = 68 + Math.round(Math.random() * 22);
    let defending = 42 + Math.round(Math.random() * 42);
    let physical = 68 + Math.round(Math.random() * 18);

    if (isDF) {
      defending = 80 + Math.round(Math.random() * 10);
      shooting = 38 + Math.round(Math.random() * 18);
      physical = 76 + Math.round(Math.random() * 12);
    } else if (isMF) {
      passing = 80 + Math.round(Math.random() * 12);
      dribbling = 76 + Math.round(Math.random() * 12);
      shooting = 62 + Math.round(Math.random() * 18);
      defending = 58 + Math.round(Math.random() * 18);
    } else { // Forward / Attacker
      pace = 84 + Math.round(Math.random() * 11);
      shooting = 82 + Math.round(Math.random() * 12);
      dribbling = 82 + Math.round(Math.random() * 11);
      defending = 28 + Math.round(Math.random() * 18);
    }

    return [
      { label: "Pace", value: pace },
      { label: "Shooting", value: shooting },
      { label: "Passing", value: passing },
      { label: "Dribbling", value: dribbling },
      { label: "Defending", value: defending },
      { label: "Physical", value: physical }
    ];
  };

  const getDynamicHeatmap = (position) => {
    const pos = position?.toLowerCase() || "";
    const isGK = pos.includes("goalkeeper") || pos.includes("gk");
    const isDF = pos.includes("defender") || pos.includes("df") || pos.includes("back");
    const isMF = pos.includes("midfielder") || pos.includes("mf");

    if (isGK) {
      return [
        { x: 10, y: 50, val: 95 },
        { x: 12, y: 45, val: 80 },
        { x: 12, y: 55, val: 80 },
        { x: 8, y: 50, val: 90 }
      ];
    }
    if (isDF) {
      return [
        { x: 25, y: 50, val: 90 },
        { x: 28, y: 35, val: 75 },
        { x: 28, y: 65, val: 75 },
        { x: 20, y: 50, val: 85 },
        { x: 35, y: 50, val: 60 }
      ];
    }
    if (isMF) {
      return [
        { x: 50, y: 50, val: 95 },
        { x: 45, y: 35, val: 80 },
        { x: 45, y: 65, val: 80 },
        { x: 55, y: 40, val: 85 },
        { x: 55, y: 60, val: 85 },
        { x: 35, y: 50, val: 65 }
      ];
    }
    return [
      { x: 78, y: 50, val: 95 },
      { x: 82, y: 45, val: 88 },
      { x: 82, y: 55, val: 88 },
      { x: 72, y: 35, val: 70 },
      { x: 72, y: 65, val: 70 },
      { x: 88, y: 50, val: 85 }
    ];
  };

  const getDynamicTraits = (position) => {
    const pos = position?.toLowerCase() || "";
    if (pos.includes("goalkeeper") || pos.includes("gk")) return ["Reflexes", "Penalty Saver", "GK Command"];
    if (pos.includes("defender") || pos.includes("df") || pos.includes("back")) return ["Tactical Tackler", "Aerial Threat", "Strength"];
    if (pos.includes("midfielder") || pos.includes("mf")) return ["Playmaker", "Visionary Passer", "Midfield Controller"];
    return ["Clinical Finisher", "Speed Dribbler", "Attacking Threat"];
  };

  // Fetch initial data & subscribe to realtime updates
  useEffect(() => {
    fetchAllMatches();
    fetchLiveMatches();
    fetchUpcomingMatches();
    fetchStandings();
    fetchTeams();
    fetchPlayers();

    // Subscribe to realtime updates on matches table
    const matchSubscription = supabase
      .channel('public:matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        console.log('Realtime Match Update:', payload);
        fetchAllMatches();
        fetchLiveMatches();
        fetchUpcomingMatches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchSubscription);
    };
  }, []);

  // Carousel autoplay rotation and range filtering (last 24 hours to next 24 hours = 48 hours)
  const getCarouselMatches = () => {
    const now = new Date().getTime();
    const range = 24 * 60 * 60 * 1000; // 24 hours
    const toTime = (match) => {
      const parsed = match?.utcDate ? new Date(match.utcDate).getTime() : NaN;
      return Number.isFinite(parsed) ? parsed : 0;
    };
    
    let filtered = [...matches].filter(m => {
      if (!m.utcDate) return false;
      const matchTime = new Date(m.utcDate).getTime();
      return Math.abs(matchTime - now) <= range;
    }).sort((a, b) => toTime(a) - toTime(b));

    // Fallback if no matches in the 48-hour window
    if (filtered.length === 0) {
      filtered = [...matches].sort((a, b) => toTime(a) - toTime(b)).slice(0, 4);
    }
    return filtered;
  };

  const carouselMatches = getCarouselMatches();

  useEffect(() => {
    if (!carouselAutoplay || carouselMatches.length <= 1) return;
    
    const timer = setInterval(() => {
      setCarouselIndex((prevIndex) => (prevIndex + 1) % carouselMatches.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselAutoplay, carouselMatches.length]);

  useEffect(() => {
    if (carouselIndex >= carouselMatches.length) {
      setCarouselIndex(0);
    }
  }, [carouselMatches.length, carouselIndex]);

  const playerCutoutsByTeam = {
    "argentina": "https://www.thesportsdb.com/images/media/player/cutout/0y0t5p1637508249.png", // Messi
    "france": "https://www.thesportsdb.com/images/media/player/cutout/qpxxvy1473587661.png", // Mbappe
    "portugal": "https://www.thesportsdb.com/images/media/player/cutout/8wz2h51620473950.png", // Ronaldo
    "brazil": "https://www.thesportsdb.com/images/media/player/cutout/65sw921600249557.png", // Neymar
    "england": "https://www.thesportsdb.com/images/media/player/cutout/7f42p01683973957.png", // Bellingham
    "belgium": "https://www.thesportsdb.com/images/media/player/cutout/v5y36i1620641604.png", // De Bruyne
    "norway": "https://www.thesportsdb.com/images/media/player/cutout/m70g1p1653909772.png", // Haaland
    "egypt": "https://www.thesportsdb.com/images/media/player/cutout/724zsz1512403666.png", // Salah
    "south korea": "https://www.thesportsdb.com/images/media/player/cutout/gswsxx1543315803.png", // Son
    "germany": "https://www.thesportsdb.com/images/media/player/cutout/2jex031620474643.png", // Musiala
    "united states": "https://www.thesportsdb.com/images/media/player/cutout/r492n41620643900.png", // Pulisic
    "mexico": "https://www.thesportsdb.com/images/media/player/cutout/3s8s2x1620643120.png", // Lozano
    "spain": "https://www.thesportsdb.com/images/media/player/cutout/1qptj61719225723.png", // Yamal
    "croatia": "https://www.thesportsdb.com/images/media/player/cutout/v5y37i1620641614.png", // Modric
    "poland": "https://www.thesportsdb.com/images/media/player/cutout/65sw921600249557.png", // Lewandowski
    "uruguay": "https://www.thesportsdb.com/images/media/player/cutout/8wz2h51620473950.png" // Valverde
  };

  const playerCutoutsByName = {
    "lionel messi": "https://www.thesportsdb.com/images/media/player/cutout/0y0t5p1637508249.png",
    "kylian mbappe": "https://www.thesportsdb.com/images/media/player/cutout/qpxxvy1473587661.png",
    "cristiano ronaldo": "https://www.thesportsdb.com/images/media/player/cutout/8wz2h51620473950.png",
    "neymar jr": "https://www.thesportsdb.com/images/media/player/cutout/65sw921600249557.png",
    "jude bellingham": "https://www.thesportsdb.com/images/media/player/cutout/7f42p01683973957.png",
    "kevin de bruyne": "https://www.thesportsdb.com/images/media/player/cutout/v5y36i1620641604.png",
    "erling haaland": "https://www.thesportsdb.com/images/media/player/cutout/m70g1p1653909772.png",
    "mohamed salah": "https://www.thesportsdb.com/images/media/player/cutout/724zsz1512403666.png",
    "son heung-min": "https://www.thesportsdb.com/images/media/player/cutout/gswsxx1543315803.png",
    "jamal musiala": "https://www.thesportsdb.com/images/media/player/cutout/2jex031620474643.png",
    "christian pulisic": "https://www.thesportsdb.com/images/media/player/cutout/r492n41620643900.png",
    "hirving lozano": "https://www.thesportsdb.com/images/media/player/cutout/3s8s2x1620643120.png",
    "lamine yamal": "https://www.thesportsdb.com/images/media/player/cutout/1qptj61719225723.png",
    "luka modric": "https://www.thesportsdb.com/images/media/player/cutout/v5y37i1620641614.png",
    "luka modrić": "https://www.thesportsdb.com/images/media/player/cutout/v5y37i1620641614.png",
    "robert lewandowski": "https://www.thesportsdb.com/images/media/player/cutout/65sw921600249557.png",
    "federico valverde": "https://www.thesportsdb.com/images/media/player/cutout/8wz2h51620473950.png",
    "antoine griezmann": "https://www.thesportsdb.com/images/media/player/cutout/65sw921600249557.png",
    "bruno fernandes": "https://www.thesportsdb.com/images/media/player/cutout/v5y36i1620641604.png"
  };

  const getPlayerPhoto = (player) => {
    if (player?.photo) return player.photo;
    const key = player?.name?.toLowerCase().trim().replace(/[-\s]+/g, " ") || "";
    return playerCutoutsByName[key] || null;
  };

  const teamColors = {
    "argentina": "from-sky-500/20",
    "france": "from-blue-600/20",
    "brazil": "from-yellow-500/20",
    "england": "from-red-500/10",
    "portugal": "from-red-600/20",
    "spain": "from-red-500/20",
    "germany": "from-slate-500/20",
    "netherlands": "from-orange-500/20",
    "belgium": "from-red-600/20",
    "croatia": "from-red-600/25",
    "uruguay": "from-sky-600/20",
    "colombia": "from-yellow-500/20",
    "mexico": "from-emerald-600/20",
    "united states": "from-blue-700/20",
    "south korea": "from-red-600/20",
    "japan": "from-blue-800/20",
    "morocco": "from-red-700/20",
    "south africa": "from-green-600/20",
    "egypt": "from-red-600/20",
    "saudi arabia": "from-green-700/20",
    "poland": "from-red-600/20",
    "canada": "from-red-600/20",
    "bosnia-herzegovina": "from-blue-600/20"
  };

  const getTeamKey = (teamName) => teamName?.toLowerCase().trim().replace(/[-_]+/g, " ") || "";

  const getTeamGradient = (teamName, stronger = false) => {
    const key = getTeamKey(teamName);
    const baseColor = teamColors[key] || "from-slate-500/10";
    if (stronger) {
      return baseColor.replace(/\/10|\/20|\/25/g, "/45");
    }
    return baseColor;
  };

  const getTeamPlayerCutout = (teamName) => {
    const key = getTeamKey(teamName);
    return playerCutoutsByTeam[key] || null;
  };

  const getTeamCrest = (match, side) => {
    const team = side === "home" ? match.home : match.away;
    return team?.crest || null;
  };

  const getFlagEmoji = (countryCode) => {
    if (!countryCode || typeof countryCode !== "string" || countryCode.length !== 2) {
      return countryCode || "⚽";
    }
    // Only parse standard 2-letter alphabetic country codes (like 'US', 'GB')
    if (!/^[A-Za-z]{2}$/.test(countryCode)) {
      return countryCode;
    }
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch (e) {
      return countryCode;
    }
  };

  const renderFlag = (flagValue, sizeClass = "w-12 h-12", textClass = "text-3xl") => {
    if (!flagValue) return <span className={`${textClass}`}>⚽</span>;
    if (typeof flagValue === "string" && flagValue.startsWith("http")) {
      return (
        <span className="inline-flex items-center justify-center relative">
          <img 
            src={flagValue} 
            alt="Flag" 
            className={`${sizeClass} object-contain drop-shadow-md`} 
            onError={(e) => { 
              e.currentTarget.style.display = 'none';
              const sib = e.currentTarget.nextSibling;
              if (sib) sib.style.display = 'inline';
            }}
          />
          <span className={`${textClass}`} style={{ display: 'none' }}>⚽</span>
        </span>
      );
    }
    return <span className={`${textClass} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>{getFlagEmoji(flagValue)}</span>;
  };


  const getPosterBg = (match) => {
    const images = [
      "https://huggingface.co/datasets/Voxel51/SoccerNet-V3/resolve/main/data/data_0/0-2.png",
      "https://huggingface.co/datasets/Voxel51/SoccerNet-V3/resolve/main/data/data_0/0.png",
      "https://huggingface.co/datasets/Voxel51/SoccerNet-V3/resolve/main/data/data_0/0_0-2.png",
      "https://huggingface.co/datasets/Voxel51/SoccerNet-V3/resolve/main/data/data_0/0_0.png",
      "https://huggingface.co/datasets/Voxel51/SoccerNet-V3/resolve/main/data/data_0/0_1.png"
    ];
    const idStr = String(match.id);
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % images.length;
    return images[idx];
  };

  const toDisplayText = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    if (typeof value === "object") return value.name || value.shortName || value.tla || value.id || fallback;
    return fallback;
  };

  const getTeamDisplayName = (team, fallback = "TBD") => {
    if (!team) return fallback;
    if (typeof team === "string") return team;
    return toDisplayText(team, fallback);
  };

  const normalizeMatchForUi = (match) => {
    const homeName = getTeamDisplayName(match.homeTeam, getTeamDisplayName(match.home));
    const awayName = getTeamDisplayName(match.awayTeam, getTeamDisplayName(match.away));
    const homeMeta = {
      ...(typeof match.home === "object" && match.home ? match.home : {}),
      name: getTeamDisplayName(match.home, homeName)
    };
    const awayMeta = {
      ...(typeof match.away === "object" && match.away ? match.away : {}),
      name: getTeamDisplayName(match.away, awayName)
    };

    return {
      ...match,
      home: homeMeta,
      away: awayMeta,
      id: toDisplayText(match.id, `${homeName}-${awayName}-${match.utcDate || "match"}`),
      day: toDisplayText(match.day, "Matchday"),
      status: toDisplayText(match.status, "UPCOMING"),
      source: toDisplayText(match.source, "local-fallback"),
      homeTeam: homeName,
      awayTeam: awayName,
      homeId: toDisplayText(match.homeId || homeMeta.id || homeMeta.tla, homeName),
      awayId: toDisplayText(match.awayId || awayMeta.id || awayMeta.tla, awayName),
      homeFlag: toDisplayText(match.homeFlag, "⚽"),
      awayFlag: toDisplayText(match.awayFlag, "⚽")
    };
  };

  const normalizeMatchesForUi = (data) => Array.isArray(data) ? data.map(normalizeMatchForUi) : [];

  const runLocalPrediction = (teamA, teamB, options = {}) => {
    const { formationA, mentalityA, formationB, mentalityB } = options;

    const tA = teams.find(t => t.id === teamA.toLowerCase() || t.name.toLowerCase() === teamA.toLowerCase()) || {
      name: teamA, fifaRanking: 30, attackPower: 75, defenseRating: 75, form: ["D"], h2h: {}
    };
    const tB = teams.find(t => t.id === teamB.toLowerCase() || t.name.toLowerCase() === teamB.toLowerCase()) || {
      name: teamB, fifaRanking: 30, attackPower: 75, defenseRating: 75, form: ["D"], h2h: {}
    };

    let attackA = tA.attackPower || 75;
    let defenseA = tA.defenseRating || 75;
    let attackB = tB.attackPower || 75;
    let defenseB = tB.defenseRating || 75;

    if (mentalityA === "attacking") { attackA *= 1.15; defenseA *= 0.88; }
    else if (mentalityA === "defensive") { defenseA *= 1.15; attackA *= 0.88; }

    if (mentalityB === "attacking") { attackB *= 1.15; defenseB *= 0.88; }
    else if (mentalityB === "defensive") { defenseB *= 1.15; attackB *= 0.88; }

    const getFormationModifier = (f) => {
      if (["5-4-1", "4-5-1", "5-3-2"].includes(f)) return { att: 0.90, def: 1.15 };
      if (["4-3-3", "3-4-3", "4-2-4"].includes(f)) return { att: 1.12, def: 0.92 };
      return { att: 1.05, def: 1.05 };
    };

    if (formationA) {
      const mod = getFormationModifier(formationA);
      attackA *= mod.att;
      defenseA *= mod.def;
    }
    if (formationB) {
      const mod = getFormationModifier(formationB);
      attackB *= mod.att;
      defenseB *= mod.def;
    }

    const rankStrengthA = Math.max(10, 100 - (tA.fifaRanking || 30));
    const rankStrengthB = Math.max(10, 100 - (tB.fifaRanking || 30));

    const getFormScore = (formArray) => {
      if (typeof formArray === "number") return formArray;
      if (!Array.isArray(formArray) || formArray.length === 0) return 60.0;
      return formArray.reduce((acc, val) => {
        if (val === "W") return acc + 3;
        if (val === "D") return acc + 1;
        return acc;
      }, 0) / (formArray.length * 3) * 100;
    };

    const formScoreA = getFormScore(tA.form);
    const formScoreB = getFormScore(tB.form);

    // H2H modifier calculation
    let h2hModA = 1.0;
    let h2hModB = 1.0;
    const teamBKey = tB.name.toLowerCase().replace(/[-\s]+/g, "_");
    const h2hData = tA.h2h?.[teamBKey] || tA.h2h?.[tB.name.toLowerCase()];
    if (h2hData && typeof h2hData === "string" && h2hData.includes("-")) {
      try {
        const parts = h2hData.split("-").map(Number);
        const wins = parts[0] || 0;
        const draws = parts[1] || 0;
        const losses = parts[2] || 0;
        const total = wins + draws + losses;
        if (total > 0) {
          h2hModA = 1.0 + ((wins - losses) / (total * 10));
          h2hModB = 2.0 - h2hModA;
        }
      } catch (e) {}
    }

    // Expected Goals (xG)
    const xG_A = Math.max(0.2, (attackA / (defenseB + 5)) * (formScoreA / 75.0) * h2hModA * 1.35);
    const xG_B = Math.max(0.2, (attackB / (defenseA + 5)) * (formScoreB / 75.0) * h2hModB * 1.35);

    let scoreA = (0.35 * rankStrengthA) + (0.25 * formScoreA) + (0.20 * attackA) + (0.20 * defenseA);
    let scoreB = (0.35 * rankStrengthB) + (0.25 * formScoreB) + (0.20 * attackB) + (0.20 * defenseB);

    scoreA *= h2hModA;
    scoreB *= h2hModB;

    const total = scoreA + scoreB;
    const rawWinA = scoreA / total;
    const rawWinB = scoreB / total;

    const drawProb = 0.23;
    const winA = Math.round(rawWinA * (1 - drawProb) * 100);
    const winB = Math.round(rawWinB * (1 - drawProb) * 100);
    const draw = 100 - winA - winB;

    let winner = "Draw";
    let confidence = draw;
    if (winA > winB) {
      winner = tA.name;
      confidence = winA;
    } else if (winB > winA) {
      winner = tB.name;
      confidence = winB;
    }

    // Simulate scoreline
    let goalsA = Math.max(0, Math.round(xG_A + (Math.random() * 0.8 - 0.4)));
    let goalsB = Math.max(0, Math.round(xG_B + (Math.random() * 0.8 - 0.4)));

    if (winA > winB + 5 && goalsA <= goalsB) {
      goalsA = goalsB + 1;
    } else if (winB > winA + 5 && goalsB <= goalsA) {
      goalsB = goalsA + 1;
    } else if (Math.abs(winA - winB) <= 5 && goalsA !== goalsB) {
      if (Math.random() > 0.4) {
        goalsA = goalsB = Math.min(goalsA, goalsB);
      } else {
        if (goalsA > goalsB) goalsA = goalsB + 1;
        else goalsB = goalsA + 1;
      }
    }

    // Generate Analysis
    const analysisParts = [
      `Tactical review shows ${tA.name} playing ${formationA || "4-3-3"} (${mentalityA || "balanced"}) against ${tB.name} in a ${formationB || "4-3-3"} (${mentalityB || "balanced"}) posture.`,
      (tA.fifaRanking || 30) < (tB.fifaRanking || 30) - 10 ? `${tA.name} holds a strong ranking advantage.` : ((tB.fifaRanking || 30) < (tA.fifaRanking || 30) - 10 ? `${tB.name} has the ranking edge.` : "The squads are tightly matched on paper."),
      `The Heuristic Simulator models an expected outcome of ${goalsA}-${goalsB} with a ${confidence}% probability backing ${winner === "Draw" ? "a Draw" : `${winner} win`}.`
    ];

    return {
      teamA: tA.name,
      teamB: tB.name,
      prediction: {
        winA,
        draw,
        winB,
        winner,
        confidence,
        predictedScoreA: goalsA,
        predictedScoreB: goalsB,
        xG_A: Number(xG_A.toFixed(2)),
        xG_B: Number(xG_B.toFixed(2)),
        analysis: analysisParts.join(" "),
        source: "Local Heuristic Prediction Engine (Browser Fallback)"
      }
    };
  };

  const fetchAllMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("utcDate", { ascending: true });
      if (error) throw error;
      const originalMatches = (data || []).filter(m => !isNaN(Number(m.id)));
      setMatches(normalizeMatchesForUi(originalMatches));
    } catch (err) {
      console.error("Error fetching all matches from Supabase:", err);
    }
  };

  const fetchLiveMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "LIVE")
        .order("utcDate", { ascending: true });
      if (error) throw error;
      const originalLive = (data || []).filter(m => !isNaN(Number(m.id)));
      setLiveMatches(normalizeMatchesForUi(originalLive));
    } catch (err) {
      console.error("Error fetching live matches from Supabase:", err);
    }
  };

  const fetchUpcomingMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "UPCOMING")
        .order("utcDate", { ascending: true });
      if (error) throw error;
      const originalUpcoming = (data || []).filter(m => !isNaN(Number(m.id)));
      setUpcomingMatches(normalizeMatchesForUi(originalUpcoming));
    } catch (err) {
      console.error("Error fetching upcoming matches from Supabase:", err);
    }
  };

  const fetchStandings = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*");
      if (error) throw error;

      const grouped = {};
      const originalTeams = (data || []).filter(t => !isNaN(Number(t.id)));
      originalTeams.forEach(team => {
        if (!team.group) return;
        const cleanGroup = team.group.replace("Group ", "").replace("GROUP_", "").trim();
        const flag = getTeamFlag(team.name);
        const teamWithFlag = {
          ...team,
          group: cleanGroup,
          flag: flag,
          crest: flag
        };
        if (!grouped[cleanGroup]) grouped[cleanGroup] = [];
        grouped[cleanGroup].push(teamWithFlag);
      });

      Object.keys(grouped).forEach(group => {
        grouped[group].sort((a, b) => b.pts - a.pts);
      });

      setStandings(grouped);
    } catch (err) {
      console.error("Error fetching standings from Supabase:", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      
      const originalTeams = (data || []).filter(t => !isNaN(Number(t.id)));
      const enriched = originalTeams.map(team => {
        const flag = getTeamFlag(team.name);
        return {
          ...team,
          group: team.group ? team.group.replace("Group ", "").replace("GROUP_", "").trim() : "A",
          flag: flag,
          crest: flag
        };
      });
      setTeams(enriched);
    } catch (err) {
      console.error("Error fetching teams from Supabase:", err);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      const originalPlayers = (data || []).filter(p => !isNaN(Number(p.id)));
      setPlayers(originalPlayers);
      if (originalPlayers.length > 0) {
        setSelectedPlayer(originalPlayers[0]);
        setComparePlayerId(originalPlayers[1]?.id || "");
      }
    } catch (err) {
      console.error("Error fetching players from Supabase:", err);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      fetchSquad(selectedTeam.id);
    } else {
      setActiveSquad([]);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedPlayer && (!selectedPlayer.photo || !selectedPlayer.bio) && !playerDetailsLoading) {
      enrichSelectedPlayer(selectedPlayer);
    }
  }, [selectedPlayer]);

  const fetchSquad = async (teamId) => {
    setSquadLoading(true);
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) throw new Error("Team not found");

      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team", team.name)
        .order("name", { ascending: true });
      if (error) throw error;

      const originalSquad = (data || []).filter(p => !isNaN(Number(p.id)));
      const mappedSquad = originalSquad.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position,
        jersey: p.jersey,
        age: p.age,
        club: p.club,
        traits: p.traits,
        stats: p.stats,
        attributes: p.attributes,
        heatmap: p.heatmap,
        photo: p.photo,
        bio: p.bio,
        height: p.height,
        weight: p.weight,
        nationality: p.team
      }));
      setActiveSquad(mappedSquad);
    } catch (err) {
      console.error("Error fetching squad from Supabase:", err);
      setActiveSquad([]);
    } finally {
      setSquadLoading(false);
    }
  };

  const enrichSelectedPlayer = async (player) => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", player.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSelectedPlayer(data);
        setPlayers(prev => prev.map(p => p.id === player.id ? data : p));
      }
    } catch (err) {
      console.warn("Failed to enrich selected player from Supabase:", err.message);
    }
  };

  const handleSelectSquadPlayer = async (squadPlayer) => {
    setPlayerDetailsLoading(true);
    setActiveTab("players");
    
    const teamName = selectedTeam ? selectedTeam.name : "TBD";

    const initialPlayer = {
      id: squadPlayer.id,
      name: squadPlayer.name,
      team: teamName,
      position: squadPlayer.position,
      jersey: squadPlayer.jersey || 11,
      age: squadPlayer.age || 26,
      club: squadPlayer.club || "TBD",
      traits: squadPlayer.traits || getDynamicTraits(squadPlayer.position),
      stats: squadPlayer.stats || { goals: 0, assists: 0, games: 0, shotsPerGame: 0, passAccuracy: 80 },
      attributes: squadPlayer.attributes || getDynamicAttributes(squadPlayer.position),
      heatmap: squadPlayer.heatmap || getDynamicHeatmap(squadPlayer.position),
      photo: squadPlayer.photo || null,
      bio: squadPlayer.bio || null,
      height: squadPlayer.height || null,
      weight: squadPlayer.weight || null
    };
    setSelectedPlayer(initialPlayer);
    
    setPlayers(prev => {
      if (!prev.some(p => p.id === squadPlayer.id)) {
        return [initialPlayer, ...prev];
      }
      return prev.map(p => p.id === squadPlayer.id ? initialPlayer : p);
    });

    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", squadPlayer.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSelectedPlayer(data);
        setPlayers(prev => prev.map(p => p.id === squadPlayer.id ? data : p));
      }
    } catch (err) {
      console.error("Error loading squad player details from Supabase:", err);
    } finally {
      setPlayerDetailsLoading(false);
    }
  };

  const handleOpenMatchCenter = async (matchId) => {
    const match = matches.find(m => String(m.id) === String(matchId));
    if (match) {
      setSelectedMatch(match);
      setModalOpen(true);
    } else {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("id", matchId)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          const norm = normalizeMatchForUi(data);
          setSelectedMatch(norm);
          setModalOpen(true);
        }
      } catch (err) {
        console.error("Error loading match details from Supabase:", err);
      }
    }
  };

  const runPrediction = async () => {
    if (predictTeamA === predictTeamB) {
      setPredictionError("Please choose two different teams to simulate.");
      return;
    }
    setPredictionError("");
    setPredictionLoading(true);
    setPredictionResult(null);

    const payload = { 
      teamA: predictTeamA, 
      teamB: predictTeamB,
      formationA,
      mentalityA,
      formationB,
      mentalityB
    };

    try {
      // Simulate brief loading delay for premium feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      const result = runLocalPrediction(predictTeamA, predictTeamB, payload);
      setPredictionResult(result);
    } catch (err) {
      console.error("Error during prediction:", err);
      setPredictionError("Failed to calculate prediction.");
    } finally {
      setPredictionLoading(false);
    }
  };

  const getMatchTimestamp = (match) => {
    const parsed = match?.utcDate ? new Date(match.utcDate).getTime() : NaN;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatShortDate = (match) => {
    if (!match?.utcDate) return match?.date || "TBD";
    return new Intl.DateTimeFormat([], {
      weekday: "short",
      month: "short",
      day: "numeric"
    }).format(new Date(match.utcDate));
  };

  const formatKickoff = (match) => {
    if (!match?.utcDate) return match?.date || "TBD";
    return new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(match.utcDate));
  };

  const getStatusLabel = (status) => {
    if (status === "LIVE") return "Live";
    if (status === "COMPLETED") return "Finished";
    if (status === "UPCOMING") return "Upcoming";
    return status || "TBD";
  };

  const sortedMatches = [...matches].sort((a, b) => getMatchTimestamp(a) - getMatchTimestamp(b));

  const calendarTabs = ["All", ...Array.from(new Set(sortedMatches.map(m => toDisplayText(m.day, "Matchday")).filter(Boolean)))].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    const aFirst = sortedMatches.find(m => toDisplayText(m.day, "Matchday") === a);
    const bFirst = sortedMatches.find(m => toDisplayText(m.day, "Matchday") === b);
    return getMatchTimestamp(aFirst) - getMatchTimestamp(bFirst);
  });

  const scheduleTeamOptions = ["All", ...Array.from(new Set(
    sortedMatches
      .flatMap(m => [getTeamDisplayName(m.homeTeam, getTeamDisplayName(m.home)), getTeamDisplayName(m.awayTeam, getTeamDisplayName(m.away))])
      .filter(Boolean)
  )).sort()];

  const statusSummary = {
    total: sortedMatches.length,
    live: liveMatches.length || sortedMatches.filter(m => m.status === "LIVE").length,
    upcoming: upcomingMatches.length || sortedMatches.filter(m => m.status === "UPCOMING").length,
    completed: sortedMatches.filter(m => m.status === "COMPLETED").length
  };

  const nextMatch = sortedMatches.find(m => m.status === "UPCOMING") || sortedMatches[0];

  const filteredMatches = sortedMatches.filter((match) => {
    const matchDay = selectedDay === "All" || toDisplayText(match.day, "Matchday") === selectedDay;
    const matchStatus = selectedStatus === "All" || match.status === selectedStatus;
    const homeName = getTeamDisplayName(match.homeTeam, getTeamDisplayName(match.home));
    const awayName = getTeamDisplayName(match.awayTeam, getTeamDisplayName(match.away));
    const matchTeam = selectedScheduleTeam === "All" || homeName === selectedScheduleTeam || awayName === selectedScheduleTeam;
    const query = scheduleSearch.trim().toLowerCase();
    const matchSearch = !query || [homeName, awayName, toDisplayText(match.day, "Matchday"), toDisplayText(match.status, "")]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(query));
    return matchDay && matchStatus && matchTeam && matchSearch;
  });

  // Player search logic
  const filteredPlayers = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPosition = playerFilterPosition === "All" || p.position === playerFilterPosition;
    return matchSearch && matchPosition;
  });

  // Comparative Radar Data
  const comparePlayer = players.find(p => p.id === comparePlayerId);
  const positionOrder = {
    "All": 0,
    "Goalkeeper": 1,
    "Defender": 2,
    "Midfielder": 3,
    "Forward": 4
  };
  const positionOptions = ["All", ...Array.from(new Set(players.map(p => p.position).filter(Boolean)))].sort((a, b) => {
    return (positionOrder[a] ?? 99) - (positionOrder[b] ?? 99);
  });
  const radarData = selectedPlayer && comparePlayer ? selectedPlayer.attributes.map((attr, index) => ({
    subject: attr.label,
    [selectedPlayer.name]: attr.value,
    [comparePlayer.name]: comparePlayer.attributes[index].value,
    fullMark: 100
  })) : [];

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e5e7eb] font-sans pb-16">
      
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#07090ebd] backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-1 bg-white/5 rounded-xl border border-white/10 shadow-lg">
            <img src={fifaLogo} alt="FIFA Logo" className="h-10 w-auto object-contain" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              PITCHPULSE <span className="text-xs px-2 py-0.5 bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/20 rounded-full font-semibold">PRO ANALYTICS</span>
            </h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">FIFA World Cup Live Dashboard & Tactical Forecaster</p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <nav className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`nav-tab flex items-center gap-2 text-sm ${activeTab === "dashboard" ? "active" : ""}`}
          >
            <Activity className="w-4 h-4" /> Schedule & Live
          </button>
          <button 
            onClick={() => setActiveTab("predictions")} 
            className={`nav-tab flex items-center gap-2 text-sm ${activeTab === "predictions" ? "active" : ""}`}
          >
            <Cpu className="w-4 h-4" /> Tactical Predictor
          </button>
          <button 
            onClick={() => setActiveTab("players")} 
            className={`nav-tab flex items-center gap-2 text-sm ${activeTab === "players" ? "active" : ""}`}
          >
            <Users className="w-4 h-4" /> Player Profiles
          </button>
          <button 
            onClick={() => setActiveTab("standings")} 
            className={`nav-tab flex items-center gap-2 text-sm ${activeTab === "standings" ? "active" : ""}`}
          >
            <Award className="w-4 h-4" /> Standings & Teams
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* TABS 1: SCHEDULE & LIVE DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Featured Matches 48-Hour Live Carousel */}
            {carouselMatches.length > 0 && (
              <div 
                className="relative overflow-hidden w-full h-[300px] md:h-[340px] rounded-lg border border-white/10 shadow-2xl group"
                onMouseEnter={() => setCarouselAutoplay(false)}
                onMouseLeave={() => setCarouselAutoplay(true)}
              >
                {/* Carousel Slides */}
                <div 
                  className="flex h-full transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                >
                  {carouselMatches.map((match) => {
                    const posterBg = getPosterBg(match);
                    const homeName = getTeamDisplayName(match.homeTeam, getTeamDisplayName(match.home));
                    const awayName = getTeamDisplayName(match.awayTeam, getTeamDisplayName(match.away));
                    const homePlayerCutout = getTeamPlayerCutout(homeName);
                    const awayPlayerCutout = getTeamPlayerCutout(awayName);
                    const homeCrest = getTeamCrest(match, "home");
                    const awayCrest = getTeamCrest(match, "away");
                    
                    return (
                      <div 
                        key={match.id}
                        onClick={() => handleOpenMatchCenter(match.id)}
                        className="w-full h-full flex-shrink-0 relative cursor-pointer overflow-hidden flex flex-col justify-end animate-fadeIn"
                        style={{ minWidth: '100%' }}
                      >
                        {/* Background Poster Image */}
                        <img 
                          src={posterBg} 
                          alt="Match Poster backdrop" 
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-[1.03] transition-transform duration-[4000ms] ease-out select-none"
                          onError={(e) => { e.currentTarget.src = heroPoster; }}
                        />
                        
                        {/* Dramatic dark gradients overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/80 via-transparent to-[#07090e]/80" />

                        {/* Team Gradient overlays */}
                        <div className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r ${getTeamGradient(homeName, true)} to-transparent z-0`} />
                        <div className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l ${getTeamGradient(awayName, true)} to-transparent z-0`} />

                        {/* Home player cutout */}
                        {homePlayerCutout && (
                          <div className="absolute left-[12%] bottom-0 h-[88%] w-[25%] flex items-end justify-center pointer-events-none select-none z-0">
                            <img 
                              src={homePlayerCutout} 
                              alt="" 
                              className="h-full object-contain opacity-55 drop-shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:scale-105"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        
                        {/* Home Team Box */}
                        <div className="absolute inset-x-0 top-10 bottom-16 grid grid-cols-3 items-stretch px-4 sm:px-8 md:px-24 z-10 select-none pointer-events-none">
                          {/* Column 1: Home Team (Flag Box centered, name at the bottom) */}
                          <div className="flex flex-col items-center justify-between h-full py-2">
                            {/* Top spacer to balance the height of the team name container at the bottom */}
                            <div className="h-8 sm:h-10 md:h-12" />

                            {/* Home Flag Box */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center transition-all">
                              {renderFlag(match.homeFlag, "w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32", "text-4xl sm:text-5xl md:text-6xl")}
                            </div>

                            {/* Home Team Name */}
                            <div className="flex flex-col items-center text-center">
                              <span className="text-sm sm:text-lg md:text-2xl font-black text-white tracking-tight leading-none">
                                {homeName}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-white/40 uppercase font-bold mt-1 tracking-wider">Home</span>
                            </div>
                          </div>

                          {/* Column 2: Result/Score (centered at the bottom) */}
                          <div className="flex flex-col items-center justify-between h-full py-2">
                            <div className="flex-1" /> {/* empty space to push the score/result to the bottom */}
                            
                            {/* Versus / Score text */}
                            <div className="flex flex-col items-center justify-center px-4 py-2 min-w-[70px] text-center pointer-events-auto">
                              {match.status === "UPCOMING" ? (
                                <span className="text-sm font-black text-white/60 tracking-wider">VS</span>
                              ) : (
                                <span className="text-xl md:text-2xl font-black text-[#00ff87] tracking-widest leading-none font-mono">
                                  {match.homeScore}:{match.awayScore}
                                </span>
                              )}
                              <span className="text-[8px] text-white/45 uppercase font-extrabold tracking-widest mt-0.5">
                                {match.status === "LIVE" ? `${match.minute}'` : match.status === "COMPLETED" ? "FT" : "K.O."}
                              </span>
                            </div>

                            {/* Compact mobile-only date display below score */}
                            <span className="md:hidden text-[9px] text-white/60 font-semibold mt-1.5 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-[#00ff87]" />
                              {match.date}
                            </span>
                          </div>

                          {/* Column 3: Away Team (Flag Box centered, name at the bottom) */}
                          <div className="flex flex-col items-center justify-between h-full py-2">
                            {/* Top spacer to balance the height of the team name container at the bottom */}
                            <div className="h-8 sm:h-10 md:h-12" />

                            {/* Away Flag Box */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center transition-all">
                              {renderFlag(match.awayFlag, "w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32", "text-4xl sm:text-5xl md:text-6xl")}
                            </div>

                            {/* Away Team Name */}
                            <div className="flex flex-col items-center text-center">
                              <span className="text-sm sm:text-lg md:text-2xl font-black text-white tracking-tight leading-none">
                                {awayName}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-white/40 uppercase font-bold mt-1 tracking-wider">Away</span>
                            </div>
                          </div>
                        </div>

                        {/* Away player cutout */}
                        {awayPlayerCutout && (
                          <div className="absolute right-[12%] bottom-0 h-[88%] w-[25%] flex items-end justify-center pointer-events-none select-none z-0">
                            <img 
                              src={awayPlayerCutout} 
                              alt="" 
                              className="h-full object-contain opacity-55 drop-shadow-[0_0_15px_rgba(0,0,0,0.6)] scale-x-[-1] transition-all duration-500 group-hover:scale-105"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}

                        {/* Top banner tag */}
                        <div className="absolute top-4 left-6 flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-[#00ff87] border border-[#00ff87]/20 px-3 py-1 rounded-full">
                            Featured Match
                          </span>
                          {match.status === "LIVE" ? (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                              LIVE
                            </span>
                          ) : match.status === "COMPLETED" ? (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/5 text-white/50 border border-white/5 px-3 py-1 rounded-full">
                              Finished
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-3 py-1 rounded-full">
                              Upcoming
                            </span>
                          )}
                          <span className="hidden sm:inline-flex text-[10px] font-extrabold uppercase tracking-widest bg-white/5 text-white/50 border border-white/10 px-3 py-1 rounded-full">
                            {match.source === "football-data.org" ? "API Live Data" : "Local Fallback"}
                          </span>
                        </div>

                        {/* Absolute Action Info/Date Column (Desktop only, positioned at bottom right) */}
                        <div className="absolute right-6 bottom-16 flex flex-col items-end gap-1 z-20 border-l border-white/10 pl-4 hidden md:flex select-none">
                          <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#00ff87]" />
                            {match.date}
                          </span>
                          <span className="text-[10px] text-white/40 uppercase font-extrabold tracking-wider">
                            {match.day} Stage Match
                          </span>
                          {match.predictProb && (
                            <div className="text-[10px] font-bold text-[#00ff87] bg-[#00ff87]/5 border border-[#00ff87]/10 rounded-lg px-2 py-0.5 mt-0.5">
                              AI Prediction: {match.predictProb.home > match.predictProb.away ? homeName : awayName} ({Math.max(match.predictProb.home, match.predictProb.away)}%)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Left Arrow Navigation */}
                {carouselMatches.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndex((prev) => (prev === 0 ? carouselMatches.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#00ff87]/20 text-white/70 hover:text-white border border-white/10 hover:border-[#00ff87]/30 p-2.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right Arrow Navigation */}
                {carouselMatches.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndex((prev) => (prev === carouselMatches.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-[#00ff87]/20 text-white/70 hover:text-white border border-white/10 hover:border-[#00ff87]/30 p-2.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Pause/Autoplay Indicator */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCarouselAutoplay(!carouselAutoplay);
                  }}
                  className="absolute right-4 bottom-4 z-20 bg-black/50 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white p-1.5 rounded-lg backdrop-blur-sm cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                  title={carouselAutoplay ? "Pause Autoplay" : "Resume Autoplay"}
                >
                  {carouselAutoplay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                </button>

                {/* Dot Indicators */}
                {carouselMatches.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {carouselMatches.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarouselIndex(idx);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          carouselIndex === idx 
                            ? "w-6 bg-[#00ff87] shadow-[0_0_8px_#00ff87]" 
                            : "w-2 bg-white/20 hover:bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Live Indicator panel */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <span className="live-indicator"></span> Match Schedules & Center
                </h2>
                <p className="text-xs text-white/40">Real-time stats update automatically. Matches are sorted chronologically by kickoff date.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-full lg:min-w-[520px]">
                {[
                  ["All", statusSummary.total, "text-white"],
                  ["Live", statusSummary.live, "text-red-400"],
                  ["Upcoming", statusSummary.upcoming, "text-cyan-400"],
                  ["Finished", statusSummary.completed, "text-white/60"]
                ].map(([label, value, color]) => (
                  <div key={label} className="schedule-stat">
                    <span className="text-[10px] uppercase tracking-wider text-white/35 font-bold">{label}</span>
                    <span className={`text-lg font-black ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {nextMatch && (
              <div className="glass-panel p-4 md:p-5 border-cyan-500/20 bg-cyan-500/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#00ff87]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Next Chronological Fixture</p>
                      <h3 className="font-black text-white">{getTeamDisplayName(nextMatch.homeTeam, getTeamDisplayName(nextMatch.home))} vs {getTeamDisplayName(nextMatch.awayTeam, getTeamDisplayName(nextMatch.away))}</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70">{formatShortDate(nextMatch)}</span>
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70">{formatKickoff(nextMatch)}</span>
                    <button
                      onClick={() => handleOpenMatchCenter(nextMatch.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#00ff87]/10 border border-[#00ff87]/20 text-[#00ff87] font-bold hover:bg-[#00ff87]/15 transition-colors"
                    >
                      Open Center
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Filters */}
            <div className="glass-panel p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                    placeholder="Search by team, stage, or status..."
                    className="w-full bg-[#07090e]/80 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ff87]/40"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#07090e]/80 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white"
                >
                  <option value="All">All statuses</option>
                  <option value="LIVE">Live only</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="COMPLETED">Finished</option>
                </select>
                <select
                  value={selectedScheduleTeam}
                  onChange={(e) => setSelectedScheduleTeam(e.target.value)}
                  className="bg-[#07090e]/80 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white"
                >
                  {scheduleTeamOptions.map(team => (
                    <option key={String(team)} value={String(team)}>{team === "All" ? "All teams" : String(team)}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setSelectedDay("All");
                    setSelectedStatus("All");
                    setSelectedScheduleTeam("All");
                    setScheduleSearch("");
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-xs font-bold text-white/70 transition-colors"
                  title="Reset schedule filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Horizontal Day Calendar Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
              {calendarTabs.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedDay === day 
                      ? "bg-[#00ff87]/15 text-[#00ff87] border border-[#00ff87]/20 shadow-[0_0_12px_rgba(0,255,135,0.15)]"
                      : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"
                  }`}
                >
                  <span>{day}</span>
                  {day !== "All" && (
                    <span className="ml-2 text-[10px] opacity-60">
                      {sortedMatches.filter(match => match.day === day).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Matches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMatches.length === 0 ? (
                <div className="glass-panel p-10 text-center text-white/40 col-span-2">
                  No matches found for the selected filters.
                </div>
              ) : (
                filteredMatches.map((match) => {
                  const homeCrest = getTeamCrest(match, "home");
                  const awayCrest = getTeamCrest(match, "away");
                  const homeName = getTeamDisplayName(match.homeTeam, getTeamDisplayName(match.home));
                  const awayName = getTeamDisplayName(match.awayTeam, getTeamDisplayName(match.away));

                  return (
                    <div 
                      key={match.id}
                      onClick={() => handleOpenMatchCenter(match.id)}
                      className="match-card glass-panel p-5 cursor-pointer relative overflow-hidden group"
                    >
                      {/* Visual state line indicators */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        match.status === "LIVE" 
                          ? "bg-gradient-to-r from-red-500 to-amber-500" 
                          : (match.status === "COMPLETED" ? "bg-white/20" : "bg-gradient-to-r from-cyan-500 to-purple-500")
                      }`} />

                      <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{match.day}</span>
                          <p className="text-xs text-white/60 font-semibold mt-0.5">{formatShortDate(match)} · {formatKickoff(match)}</p>
                        </div>
                        
                        {match.status === "LIVE" ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-500">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            LIVE {match.minute}'
                          </div>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            match.status === "COMPLETED" ? "bg-white/5 text-white/50" : "bg-cyan-500/10 text-cyan-400"
                          }`}>
                            {getStatusLabel(match.status)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 my-5">
                        <div className="team-cell flex flex-col items-center justify-center">
                          <div className="w-14 h-14 flex items-center justify-center mb-2 overflow-hidden transition-all">
                            {renderFlag(match.homeFlag, "w-12 h-12", "text-3xl")}
                          </div>
                          <span className="font-bold text-sm text-white leading-tight text-center">{homeName}</span>
                          <span className="text-[10px] text-white/35 uppercase font-bold mt-1">Home</span>
                        </div>

                        <div className="score-cell">
                          {match.status === "UPCOMING" ? (
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-white/30 uppercase tracking-widest"><Clock className="w-3.5 h-3.5" /></span>
                              <span className="text-sm font-black text-white/80 mt-1">VS</span>
                            </div>
                          ) : (
                            <span className="text-3xl font-extrabold tracking-widest text-white">
                              {match.homeScore} : {match.awayScore}
                            </span>
                          )}
                        </div>

                        <div className="team-cell flex flex-col items-center justify-center">
                          <div className="w-14 h-14 flex items-center justify-center mb-2 overflow-hidden transition-all">
                            {renderFlag(match.awayFlag, "w-12 h-12", "text-3xl")}
                          </div>
                          <span className="font-bold text-sm text-white leading-tight text-center">{awayName}</span>
                          <span className="text-[10px] text-white/35 uppercase font-bold mt-1">Away</span>
                        </div>
                      </div>

                      {match.predictProb && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="prob-chip">
                            <span>{homeName}</span>
                            <strong>{match.predictProb.home}%</strong>
                          </div>
                          <div className="prob-chip">
                            <span>Draw</span>
                            <strong>{match.predictProb.draw}%</strong>
                          </div>
                          <div className="prob-chip">
                            <span>{awayName}</span>
                            <strong>{match.predictProb.away}%</strong>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-3 text-xs text-white/50">
                        <div className="min-w-0">
                          {match.stats?.xg && (
                            <span>xG: {match.stats.xg.home} - {match.stats.xg.away}</span>
                          )}
                          {match.predictProb && (
                            <span className="text-[#00ff87] font-semibold">AI Pick: {match.predictProb.home > match.predictProb.away ? homeName : awayName}</span>
                          )}
                        </div>
                        <span className="flex items-center gap-0.5 group-hover:text-[#00ff87] transition-all shrink-0">
                          Analytics Center <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TABS 2: TACTICAL PREDICTOR */}
        {activeTab === "predictions" && (
          <div className="glass-panel p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-[0_0_12px_rgba(0,255,135,0.15)]">
                  <Cpu className="w-6 h-6 text-[#00ff87]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Advanced Tactical Simulator</h2>
                  <p className="text-xs text-white/40">Adjust team mentalities and pitch formations to simulate prediction modifiers.</p>
                </div>
              </div>

              {/* Team selection block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                
                {/* Team A setup */}
                <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                  <div className="mb-4">
                    <label className="block text-xs uppercase text-cyan-400 mb-1.5 font-bold tracking-wider">Select Team A (Home)</label>
                    <select 
                      value={predictTeamA} 
                      onChange={(e) => setPredictTeamA(e.target.value)}
                      className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-sm text-white"
                    >
                      {teams.map(t => (
                        <option key={t.id} value={t.name}>{t.name} (FIFA #{t.fifaRanking})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-white/40 mb-1.5 font-bold">Formation</label>
                      <select 
                        value={formationA} 
                        onChange={(e) => setFormationA(e.target.value)}
                        className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="4-3-3">4-3-3 (Offensive)</option>
                        <option value="4-4-2">4-4-2 (Balanced)</option>
                        <option value="3-5-2">3-5-2 (Midfield Heavy)</option>
                        <option value="5-4-1">5-4-1 (Ultra Defensive)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-white/40 mb-1.5 font-bold">Mentality</label>
                      <select 
                        value={mentalityA} 
                        onChange={(e) => setMentalityA(e.target.value)}
                        className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="balanced">Balanced</option>
                        <option value="attacking">Attacking (+15% Att)</option>
                        <option value="defensive">Defensive (+15% Def)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Team B setup */}
                <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                  <div className="mb-4">
                    <label className="block text-xs uppercase text-red-400 mb-1.5 font-bold tracking-wider">Select Team B (Away)</label>
                    <select 
                      value={predictTeamB} 
                      onChange={(e) => setPredictTeamB(e.target.value)}
                      className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2.5 text-sm text-white"
                    >
                      {teams.map(t => (
                        <option key={t.id} value={t.name}>{t.name} (FIFA #{t.fifaRanking})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-white/40 mb-1.5 font-bold">Formation</label>
                      <select 
                        value={formationB} 
                        onChange={(e) => setFormationB(e.target.value)}
                        className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="4-3-3">4-3-3 (Offensive)</option>
                        <option value="4-4-2">4-4-2 (Balanced)</option>
                        <option value="3-5-2">3-5-2 (Midfield Heavy)</option>
                        <option value="5-4-1">5-4-1 (Ultra Defensive)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-white/40 mb-1.5 font-bold">Mentality</label>
                      <select 
                        value={mentalityB} 
                        onChange={(e) => setMentalityB(e.target.value)}
                        className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="balanced">Balanced</option>
                        <option value="attacking">Attacking (+15% Att)</option>
                        <option value="defensive">Defensive (+15% Def)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {predictionError && (
                <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-lg flex items-center gap-2 text-xs text-red-400 mb-6">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{predictionError}</span>
                </div>
              )}

              <button 
                onClick={runPrediction}
                disabled={predictionLoading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#07090e] font-bold rounded-xl text-sm transition-all hover:opacity-95 shadow-[0_0_20px_rgba(0,255,135,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {predictionLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#07090e] border-t-transparent rounded-full animate-spin" />
                    Simulating Tactical Scenarios...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Run Forecast Engine
                  </>
                )}
              </button>

              {/* Forecast Simulation Display */}
              {predictionResult && (
                <div className="mt-10 border-t border-white/5 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Gauge */}
                  <div className="flex flex-col items-center">
                    <h4 className="text-xs font-semibold uppercase text-white/40 mb-2 tracking-wider">Tactical Probability Distribution</h4>
                    
                    <div className="relative w-64 h-64 flex items-center justify-center">
                      <PieChart width={256} height={256}>
                        <Pie
                          data={[
                            { name: predictionResult.teamA, value: predictionResult.prediction.winA },
                            { name: "Draw", value: predictionResult.prediction.draw },
                            { name: predictionResult.teamB, value: predictionResult.prediction.winB }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#00f0ff" />
                          <Cell fill="rgba(255,255,255,0.2)" />
                          <Cell fill="#ff2a5f" />
                        </Pie>
                        <Tooltip contentStyle={{ background: "#0d0f14", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                      </PieChart>

                      <div className="absolute text-center">
                        <span className="block text-[10px] text-white/40 uppercase tracking-widest">Confidence</span>
                        <span className="text-3xl font-extrabold text-[#00ff87]">{predictionResult.prediction.confidence}%</span>
                        <span className="block text-[11px] text-white/70 mt-1 font-semibold">{predictionResult.prediction.winner}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mt-4 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#00f0ff] rounded-full" />
                        <span>{predictionResult.teamA}: <strong>{predictionResult.prediction.winA}%</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/50">
                        <span className="w-2.5 h-2.5 bg-white/20 rounded-full" />
                        <span>Draw: <strong>{predictionResult.prediction.draw}%</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#ff2a5f] rounded-full" />
                        <span>{predictionResult.teamB}: <strong>{predictionResult.prediction.winB}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Descriptive breakdown panel */}
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                      <span className="text-[10px] text-[#00ff87] uppercase font-bold tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Simulation Verdict
                      </span>
                      <p className="text-base font-bold text-white mt-1">
                        {predictionResult.prediction.winner === "Draw" ? (
                          "Expects a deadlocked result. Grid coordinates suggest heavy midfield consolidation."
                        ) : (
                          <>AI predicts a <span className="text-[#00ff87] font-extrabold">{predictionResult.prediction.winner}</span> victory.</>
                        )}
                      </p>
                    </div>

                    {/* Simulated Scoreline Card */}
                    {predictionResult.prediction.predictedScoreA !== undefined && (
                      <div className="bg-[#0b0e14] border border-[#00ff87]/20 p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,255,135,0.03)]">
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00ff87]/30 to-transparent" />
                        <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-2.5">Simulated Scoreline</span>
                        <div className="flex items-center justify-center gap-4 w-full">
                          <div className="flex items-center gap-1.5 w-1/3 justify-end text-right">
                            <span className="font-extrabold text-white text-xs truncate max-w-[80px]" title={predictionResult.teamA}>{predictionResult.teamA}</span>
                            {renderFlag(teams.find(t => t.name.toLowerCase() === predictionResult.teamA.toLowerCase())?.flag, "w-6 h-6", "text-lg")}
                          </div>
                          <span className="text-2xl font-black text-[#00ff87] font-mono tracking-widest px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 min-w-[70px] text-center">
                            {predictionResult.prediction.predictedScoreA} - {predictionResult.prediction.predictedScoreB}
                          </span>
                          <div className="flex items-center gap-1.5 w-1/3 justify-start text-left">
                            {renderFlag(teams.find(t => t.name.toLowerCase() === predictionResult.teamB.toLowerCase())?.flag, "w-6 h-6", "text-lg")}
                            <span className="font-extrabold text-white text-xs truncate max-w-[80px]" title={predictionResult.teamB}>{predictionResult.teamB}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expected Goals (xG) Meter */}
                    {predictionResult.prediction.xG_A !== undefined && (
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2.5">
                        <div className="flex justify-between text-[10px] text-white/45 uppercase font-bold tracking-wider">
                          <span className="flex items-center gap-1">Expected Goals (xG)</span>
                          <span className="text-[#00f0ff] font-extrabold">{predictionResult.prediction.xG_A?.toFixed(2)} vs {predictionResult.prediction.xG_B?.toFixed(2)}</span>
                        </div>
                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${(predictionResult.prediction.xG_A / (predictionResult.prediction.xG_A + predictionResult.prediction.xG_B || 1)) * 100}%` }} 
                            className="h-full bg-gradient-to-r from-cyan-500 to-[#00f0ff] transition-all duration-500" 
                          />
                          <div 
                            style={{ width: `${(predictionResult.prediction.xG_B / (predictionResult.prediction.xG_A + predictionResult.prediction.xG_B || 1)) * 100}%` }} 
                            className="h-full bg-gradient-to-l from-red-500 to-[#ff2a5f] transition-all duration-500" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Matchup Commentary */}
                    {predictionResult.prediction.analysis && (
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 animate-pulse" /> Tactical Commentary
                        </span>
                        <p className="text-xs text-white/75 leading-relaxed italic border-l border-yellow-400/40 pl-3">
                          "{predictionResult.prediction.analysis}"
                        </p>
                      </div>
                    )}

                    {/* Tactical breakdown */}
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs space-y-2.5">
                      <h5 className="font-bold text-white/60 uppercase">Applied Rating Modifiers</h5>
                      <div className="flex justify-between">
                        <span className="text-white/40">{predictTeamA} ({formationA} / {mentalityA})</span>
                        <span className={mentalityA !== "balanced" ? "text-cyan-400 font-semibold" : "text-white/55"}>
                          {mentalityA === "attacking" ? "+15% Att / -12% Def" : (mentalityA === "defensive" ? "+15% Def / -12% Att" : "Base")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">{predictTeamB} ({formationB} / {mentalityB})</span>
                        <span className={mentalityB !== "balanced" ? "text-red-400 font-semibold" : "text-white/55"}>
                          {mentalityB === "attacking" ? "+15% Att / -12% Def" : (mentalityB === "defensive" ? "+15% Def / -12% Att" : "Base")}
                        </span>
                      </div>
                      <div className="border-t border-white/5 pt-2 flex items-center gap-1 text-[10px] text-white/40 uppercase">
                        <Zap className="w-3 h-3 text-yellow-400" /> {predictionResult?.prediction?.source ? `Powered by ${predictionResult.prediction.source}` : "Powered by FastAPI Engine"}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* TABS 3: PLAYER PROFILES & 2D HEATMAPS */}
        {activeTab === "players" && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Player Database & Heatmaps</h2>
                <p className="text-xs text-white/40">Select a player card to view key tactical characteristics and positional heatmaps.</p>
              </div>
            </div>

            {/* Filter Search Input */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="Search player name or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/40" />
                <select 
                  value={playerFilterPosition}
                  onChange={(e) => setPlayerFilterPosition(e.target.value)}
                  className="bg-[#07090e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  {positionOptions.map(pos => {
                    let label = pos;
                    if (pos === "All") label = "All Positions";
                    else if (pos.toLowerCase() === "goalkeeper") label = "Goalkeepers";
                    else if (pos.toLowerCase() === "defender") label = "Defenders";
                    else if (pos.toLowerCase() === "midfielder") label = "Midfielders";
                    else if (pos.toLowerCase() === "forward") label = "Forwards & Attackers";
                    return (
                      <option key={pos} value={pos}>{label}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Roster list column */}
              <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredPlayers.length === 0 && searchQuery.trim().length > 2 && (
                  <button
                    onClick={async () => {
                      setPlayerDetailsLoading(true);
                      try {
                        const res = await fetch(`${API_BASE}/players/details?name=${encodeURIComponent(searchQuery)}`);
                        if (res.ok) {
                          const data = await res.json();
                          const searchedPlayer = {
                            id: "searched-" + Date.now(),
                            name: data.name,
                            team: "External",
                            position: "Forward",
                            jersey: 9,
                            age: 28,
                            club: data.club || "External",
                            traits: ["Worldwide Star"],
                            stats: data.stats,
                            attributes: getDynamicAttributes("Forward"),
                            heatmap: getDynamicHeatmap("Forward"),
                            photo: data.photo,
                            bio: data.bio,
                            height: data.height,
                            weight: data.weight
                          };
                          setPlayers(prev => [searchedPlayer, ...prev]);
                          setSelectedPlayer(searchedPlayer);
                        }
                      } catch (err) {
                        console.error("External search failed:", err);
                      } finally {
                        setPlayerDetailsLoading(false);
                      }
                    }}
                    className="w-full py-2.5 bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-xl text-xs font-bold text-[#00ff87] hover:bg-[#00ff87]/20 transition-all cursor-pointer mb-2"
                  >
                    Search worldwide database for "{searchQuery}"
                  </button>
                )}
                {filteredPlayers.length === 0 ? (
                  <span className="text-xs text-white/40">No player results match filters.</span>
                ) : (
                  filteredPlayers.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedPlayer(p)}
                      className={`glass-panel p-3.5 cursor-pointer border flex items-center justify-between gap-3 transition-all ${
                        selectedPlayer?.id === p.id 
                          ? "border-purple-500/40 bg-purple-500/10 shadow-[0_0_12px_rgba(139,92,246,0.15)]" 
                          : "border-transparent hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Player Small Photo Avatar */}
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md">
                          {getPlayerPhoto(p) ? (
                            <img 
                              src={getPlayerPhoto(p)} 
                              alt="" 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = ""; }}
                            />
                          ) : (
                            <span className="text-lg">⚽</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-white/40 font-semibold uppercase truncate">{p.team} • {p.position}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs px-2 py-1 bg-white/5 rounded text-white/80 font-extrabold font-mono">#{p.jersey || "--"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Roster detail sheet */}
              {selectedPlayer && (
                <div className="lg:col-span-2 glass-panel p-6 border border-white/5 space-y-6">
                  
                  {/* Bio block */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-white/5 w-full">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center shadow-lg group">
                        {playerDetailsLoading ? (
                          <span className="w-4 h-4 border-2 border-[#00ff87] border-t-transparent rounded-full animate-spin" />
                        ) : getPlayerPhoto(selectedPlayer) ? (
                          <img 
                            src={getPlayerPhoto(selectedPlayer)} 
                            alt={selectedPlayer.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-3xl">⚽</span>
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 px-1 py-0.5 rounded font-mono font-bold text-white/80">#{selectedPlayer.jersey}</span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                          {selectedPlayer.name}
                        </h3>
                        <div className="text-xs text-white/50 font-semibold uppercase mt-1">
                          {selectedPlayer.team} • {selectedPlayer.position} • {selectedPlayer.age} Years Old • {selectedPlayer.club}
                        </div>
                        {(selectedPlayer.height || selectedPlayer.weight) && (
                          <div className="text-[10px] text-white/40 font-mono mt-1 uppercase">
                            {selectedPlayer.height && `Height: ${selectedPlayer.height} `}
                            {selectedPlayer.weight && `• Weight: ${selectedPlayer.weight}`}
                          </div>
                        )}

                        {/* Traits list */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {selectedPlayer.traits.map((trait, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-white/5 border border-white/5 text-[#00ff87] rounded"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-white/40 uppercase font-semibold">Compare With</label>
                      <select 
                        value={comparePlayerId}
                        onChange={(e) => setComparePlayerId(e.target.value)}
                        className="bg-[#07090e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="">Select Opponent</option>
                        {players.filter(p => p.id !== selectedPlayer.id).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Biography text block */}
                  {selectedPlayer.bio && (
                    <div className="bg-[#07090e]/40 border border-white/5 p-4 rounded-xl text-xs text-white/70 leading-relaxed max-h-32 overflow-y-auto">
                      <h4 className="text-[10px] uppercase font-bold text-purple-400 mb-1 tracking-wider">Career Biography</h4>
                      <p>{selectedPlayer.bio}</p>
                    </div>
                  )}

                  {/* Pitch Heatmap vs Radar section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Simulated Heatmap field layout */}
                    <div>
                      <h4 className="text-xs uppercase text-white/40 mb-2 font-bold tracking-wider">Simulated Matchday Heatmap</h4>
                      
                      {/* Football field grid background wrapper */}
                      <div className="relative w-full h-56 bg-[#1b4332] border-2 border-white/10 rounded-xl overflow-hidden shadow-inner">
                        {/* Grass lines pattern */}
                        <div className="absolute inset-0 grid grid-cols-10 grid-rows-1 opacity-5">
                          {Array.from({ length: 10 }).map((_, idx) => (
                            <div key={idx} className="border-r border-white h-full" />
                          ))}
                        </div>
                        
                        {/* Field outline borders */}
                        <div className="absolute top-2 bottom-2 left-2 right-2 border border-white/20" />
                        {/* Midfield line */}
                        <div className="absolute top-2 bottom-2 left-1/2 w-px bg-white/20" />
                        {/* Center Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 rounded-full" />
                        {/* Goal Area Left */}
                        <div className="absolute top-1/4 bottom-1/4 left-2 w-10 border-r border-t border-b border-white/20" />
                        {/* Goal Area Right */}
                        <div className="absolute top-1/4 bottom-1/4 right-2 w-10 border-l border-t border-b border-white/20" />

                        {/* Coordinate points overlay rendering */}
                        {selectedPlayer.heatmap && selectedPlayer.heatmap.map((pt, index) => (
                          <div 
                            key={index}
                            className="absolute rounded-full blur-[6px] opacity-75"
                            style={{
                              left: `${pt.x}%`,
                              top: `${pt.y}%`,
                              width: `${pt.val / 2.2}px`,
                              height: `${pt.val / 2.2}px`,
                              backgroundColor: pt.val > 85 ? '#ff2a5f' : (pt.val > 70 ? '#ffb800' : '#00f0ff'),
                              boxShadow: `0 0 12px 2px ${pt.val > 85 ? '#ff2a5f' : (pt.val > 70 ? '#ffb800' : '#00f0ff')}`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-white/30 uppercase mt-2">
                        <span>Defending Zone</span>
                        <span>Midfield</span>
                        <span>Attacking Zone</span>
                      </div>
                    </div>

                    {/* Radar representation */}
                    <div className="flex flex-col justify-between">
                      <h4 className="text-xs uppercase text-white/40 mb-2 font-bold tracking-wider">
                        {comparePlayer ? `Radar vs ${comparePlayer.name}` : "Radar Attributes"}
                      </h4>

                      {comparePlayer ? (
                        <div className="w-full h-48 flex items-center justify-center bg-[#07090e]/40 rounded-xl border border-white/5">
                          <ResponsiveContainer width="100%" height={180}>
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                              <PolarGrid stroke="rgba(255,255,255,0.05)" />
                              <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.6)" fontSize={9} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" />
                              <Radar name={selectedPlayer.name} dataKey={selectedPlayer.name} stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.25} />
                              <Radar name={comparePlayer.name} dataKey={comparePlayer.name} stroke="#ff2a5f" fill="#ff2a5f" fillOpacity={0.25} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                          <span className="text-[10px] text-white/40 uppercase">Individual Ratings Summary</span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {selectedPlayer.attributes.map((attr, idx) => (
                              <div key={idx} className="flex justify-between bg-[#07090e]/40 p-2 rounded">
                                <span className="text-white/60">{attr.label}</span>
                                <span className="font-bold text-[#00ff87]">{attr.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display minor comparative stats table */}
                      <div className="mt-3 bg-white/5 p-2.5 rounded-lg border border-white/5 text-[11px] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-white/40">Goals Scored</span>
                          <span className="font-bold text-[#00ff87]">{selectedPlayer.stats.goals} {comparePlayer && `vs ${comparePlayer.stats.goals}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Pass Accuracy</span>
                          <span className="font-bold">{selectedPlayer.stats.passAccuracy}% {comparePlayer && `vs ${comparePlayer.stats.passAccuracy}%`}</span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* TABS 4: STANDINGS & TEAMS */}
        {activeTab === "standings" && (
          <div className="space-y-8">
            
            {/* Split Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00ff87]/10 rounded-lg border border-[#00ff87]/20">
                  <Award className="w-6 h-6 text-[#00ff87]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">World Cup Group Standings</h2>
                  <p className="text-xs text-white/40">Select any team in the table to display their squad rosters and H2H records.</p>
                </div>
              </div>
            </div>

            {/* Selector Team Profile Display */}
            {selectedTeam && (
              <div className="glass-panel p-6 border border-emerald-500/25 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                <button 
                  onClick={() => setSelectedTeam(null)} 
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedTeam.name} Details</span>
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-[#00ff87] border border-emerald-500/20 rounded-full font-semibold">FIFA Rank #{selectedTeam.fifaRanking}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Squad Roster */}
                  <div className="bg-[#07090e]/40 p-4 rounded-xl border border-white/5">
                    <h4 className="text-xs uppercase text-white/40 mb-3 font-bold tracking-wider">Squad Roster</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {squadLoading ? (
                        <div className="text-xs text-white/40 flex items-center gap-2 py-4">
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                          Loading Live Squad...
                        </div>
                      ) : activeSquad.length === 0 ? (
                        <span className="text-xs text-white/40">No player profiles loaded for this team.</span>
                      ) : (
                        activeSquad.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => handleSelectSquadPlayer(p)}
                            className="flex justify-between items-center bg-white/5 hover:bg-purple-500/10 p-2.5 rounded text-xs cursor-pointer border border-transparent hover:border-purple-500/20 transition-all"
                          >
                            <span className="font-semibold">{p.name}</span>
                            <span className="text-white/40 text-[10px] uppercase">{p.position}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* H2H Historical data */}
                  <div className="bg-[#07090e]/40 p-4 rounded-xl border border-white/5">
                    <h4 className="text-xs uppercase text-white/40 mb-3 font-bold tracking-wider">H2H Historical Outcomes</h4>
                    <div className="space-y-2 text-xs text-white/70">
                      {selectedTeam.h2h && Object.entries(selectedTeam.h2h).map(([opponent, record]) => (
                        <div key={opponent} className="flex justify-between border-b border-white/5 py-1.5">
                          <span className="capitalize text-white/50">{opponent}</span>
                          <span className="font-semibold text-emerald-400">{record} (W-D-L)</span>
                        </div>
                      ))}
                      {!selectedTeam.h2h && <span className="text-white/40">No records found.</span>}
                    </div>
                  </div>

                  {/* Team performance metrics */}
                  <div className="bg-[#07090e]/40 p-4 rounded-xl border border-white/5 space-y-3">
                    <h4 className="text-xs uppercase text-white/40 font-bold tracking-wider">Performance Parameters</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Attack Rating</span>
                        <span className="font-bold text-cyan-400">{selectedTeam.attackPower} / 100</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Defense Rating</span>
                        <span className="font-bold text-red-400">{selectedTeam.defenseRating} / 100</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Recent Form</span>
                        <span className="font-bold flex gap-1">
                          {selectedTeam.form.map((f, fIdx) => (
                            <span key={fIdx} className={`px-1.5 py-0.5 rounded text-[10px] ${f === "W" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/50"}`}>{f}</span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standings Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.keys(standings).map((groupName) => (
                <div key={groupName} className="glass-panel p-5">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center justify-between">
                    <span>Group {groupName}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#00ff87] font-semibold bg-[#00ff87]/10 px-2 py-0.5 rounded border border-[#00ff87]/10">Standings</span>
                  </h3>

                  <table className="standings-table text-xs">
                    <thead>
                      <tr>
                        <th>Pos</th>
                        <th>Team</th>
                        <th className="text-center">P</th>
                        <th className="text-center">GD</th>
                        <th className="text-center">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings[groupName].map((team, index) => {
                        const isQualifying = index < 2;
                        return (
                          <tr 
                            key={team.id}
                            onClick={() => setSelectedTeam(team)}
                            className="cursor-pointer"
                          >
                            <td className="w-8 font-semibold">
                              <span className={`w-5 h-5 flex items-center justify-center rounded-full ${isQualifying ? "bg-emerald-500/10 text-[#00ff87] border border-emerald-500/20" : "text-white/40"}`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="font-bold flex items-center gap-2 hover:text-[#00ff87] transition-colors">
                              {renderFlag(team.flag, "w-6 h-6", "text-lg")}
                              <span>{team.name}</span>
                            </td>
                            <td className="text-center text-white/60 font-semibold">{team.played}</td>
                            <td className="text-center text-white/60 font-semibold">{team.gf - team.ga}</td>
                            <td className={`text-center font-bold ${isQualifying ? "text-[#00ff87]" : ""}`}>{team.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* MATCH CENTER MODAL */}
      {modalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090eeb] backdrop-blur-md">
          <div className="glass-panel w-full max-w-3xl overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/20">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#00ff87] flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                {selectedMatch.status === "LIVE" ? "Live Match Center" : "Match Analytics"}
              </span>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-8 flex-1">
              
              {/* Score header */}
              <div className="flex items-center justify-between text-center border-b border-white/5 pb-6">
                <div className="flex-1 flex flex-col items-center">
                  <div className="h-16 flex items-center justify-center mb-1">
                    {renderFlag(selectedMatch.homeFlag, "w-14 h-14", "text-4xl")}
                  </div>
                  <span className="font-bold text-lg">{getTeamDisplayName(selectedMatch.homeTeam, getTeamDisplayName(selectedMatch.home))}</span>
                </div>
                <div className="px-4">
                  <div className="text-2xl font-extrabold tracking-widest text-white">
                    {selectedMatch.status === "UPCOMING" ? "VS" : `${selectedMatch.homeScore} - ${selectedMatch.awayScore}`}
                  </div>
                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1">
                    {selectedMatch.status === "LIVE" ? `${selectedMatch.minute}' Played` : selectedMatch.status}
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="h-16 flex items-center justify-center mb-1">
                    {renderFlag(selectedMatch.awayFlag, "w-14 h-14", "text-4xl")}
                  </div>
                  <span className="font-bold text-lg">{getTeamDisplayName(selectedMatch.awayTeam, getTeamDisplayName(selectedMatch.away))}</span>
                </div>
              </div>

              {selectedMatch.stats && (
                /* Match Stats progress lines */
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Live Performance Stats</h3>
                  
                  {/* Possession */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Possession</span>
                      <span className="font-bold">{selectedMatch.stats.possession.home}% vs {selectedMatch.stats.possession.away}%</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="stat-bar-container flex-1">
                        <div className="stat-bar-fill-home" style={{ width: `${selectedMatch.stats.possession.home}%` }} />
                      </div>
                      <div className="stat-bar-container flex-1 rotate-180">
                        <div className="stat-bar-fill-away" style={{ width: `${selectedMatch.stats.possession.away}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Shots */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Total Shots</span>
                      <span className="font-bold">{selectedMatch.stats.shots.home} vs {selectedMatch.stats.shots.away}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="stat-bar-container flex-1">
                        <div className="stat-bar-fill-home" style={{ width: `${(selectedMatch.stats.shots.home / (selectedMatch.stats.shots.home + selectedMatch.stats.shots.away || 1)) * 100}%` }} />
                      </div>
                      <div className="stat-bar-container flex-1 rotate-180">
                        <div className="stat-bar-fill-away" style={{ width: `${(selectedMatch.stats.shots.away / (selectedMatch.stats.shots.home + selectedMatch.stats.shots.away || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Expected Goals xG */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Expected Goals (xG)</span>
                      <span className="font-bold">{selectedMatch.stats.xg.home} vs {selectedMatch.stats.xg.away}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="stat-bar-container flex-1">
                        <div className="stat-bar-fill-home" style={{ width: `${(selectedMatch.stats.xg.home / (selectedMatch.stats.xg.home + selectedMatch.stats.xg.away || 1)) * 100}%` }} />
                      </div>
                      <div className="stat-bar-container flex-1 rotate-180">
                        <div className="stat-bar-fill-away" style={{ width: `${(selectedMatch.stats.xg.away / (selectedMatch.stats.xg.home + selectedMatch.stats.xg.away || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Pass Accuracy */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Pass Accuracy</span>
                      <span className="font-bold">{selectedMatch.stats.passAccuracy.home}% vs {selectedMatch.stats.passAccuracy.away}%</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="stat-bar-container flex-1">
                        <div className="stat-bar-fill-home" style={{ width: `${selectedMatch.stats.passAccuracy.home}%` }} />
                      </div>
                      <div className="stat-bar-container flex-1 rotate-180">
                        <div className="stat-bar-fill-away" style={{ width: `${selectedMatch.stats.passAccuracy.away}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMatch.timeline && selectedMatch.timeline.length > 0 && (
                /* TIMELINE */
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Timeline</h3>
                  <div className="relative border-l border-white/5 ml-3 pl-4 space-y-4">
                    {selectedMatch.timeline.map((event, index) => (
                      <div key={index} className="relative">
                        <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${event.type === "goal" ? "bg-[#00ff87] shadow-[0_0_8px_#00ff87]" : "bg-yellow-500"}`} />
                        <div className="text-xs">
                          <span className="font-bold text-white/50">{event.minute}'</span> - <span className="font-semibold text-white">{event.player}</span> ({event.team === "home" ? getTeamDisplayName(selectedMatch.homeTeam, getTeamDisplayName(selectedMatch.home)) : getTeamDisplayName(selectedMatch.awayTeam, getTeamDisplayName(selectedMatch.away))})
                          <span className="block text-[11px] text-white/40">{event.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMatch.lineups && selectedMatch.lineups.home && selectedMatch.lineups.home.length > 0 && (
                /* LINEUPS */
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Starting Lineups</h3>
                  <div className="grid grid-cols-2 gap-8 text-xs">
                    <div>
                      <h4 className="font-bold text-cyan-400 mb-2 border-b border-white/5 pb-1">{getTeamDisplayName(selectedMatch.homeTeam, getTeamDisplayName(selectedMatch.home))}</h4>
                      <div className="space-y-1.5">
                        {selectedMatch.lineups.home.map((player, idx) => (
                          <div key={idx} className="flex justify-between text-white/70">
                            <span>{player.name}</span>
                            <span className="text-white/40 uppercase">{player.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-400 mb-2 border-b border-white/5 pb-1">{getTeamDisplayName(selectedMatch.awayTeam, getTeamDisplayName(selectedMatch.away))}</h4>
                      <div className="space-y-1.5">
                        {selectedMatch.lineups.away.map((player, idx) => (
                          <div key={idx} className="flex justify-between text-white/70">
                            <span>{player.name}</span>
                            <span className="text-white/40 uppercase">{player.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;

