from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Union, Optional
import random

app = FastAPI(
    title="PitchPulse AI Prediction Engine",
    description="Microservice for predicting FIFA World Cup outcomes using machine learning heuristics.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TeamStatsInput(BaseModel):
    rank: int
    attack: float
    defense: float
    form: Union[List[str], int, float, List[int]] = []
    h2h: Optional[Dict[str, str]] = {}

class MatchPredictionRequest(BaseModel):
    teamA: str
    teamB: str
    formationA: Optional[str] = "4-3-3"
    mentalityA: Optional[str] = "balanced"
    formationB: Optional[str] = "4-3-3"
    mentalityB: Optional[str] = "balanced"
    teamAStats: Optional[TeamStatsInput] = None
    teamBStats: Optional[TeamStatsInput] = None

# Define static team database for fallback/standalone calculations
TEAM_DATABASE = {
    "mexico": {"name": "Mexico", "rank": 15, "attack": 78, "defense": 77, "form": 75},
    "south_korea": {"name": "South Korea", "rank": 22, "attack": 79, "defense": 76, "form": 75},
    "czechia": {"name": "Czechia", "rank": 36, "attack": 74, "defense": 75, "form": 65},
    "south_africa": {"name": "South Africa", "rank": 59, "attack": 72, "defense": 73, "form": 65},
    "switzerland": {"name": "Switzerland", "rank": 19, "attack": 79, "defense": 81, "form": 78},
    "canada": {"name": "Canada", "rank": 40, "attack": 77, "defense": 74, "form": 70},
    "qatar": {"name": "Qatar", "rank": 46, "attack": 68, "defense": 66, "form": 50},
    "bosnia_herzegovina": {"name": "Bosnia-Herzegovina", "rank": 74, "attack": 75, "defense": 73, "form": 70},
    "scotland": {"name": "Scotland", "rank": 39, "attack": 73, "defense": 75, "form": 65},
    "morocco": {"name": "Morocco", "rank": 13, "attack": 81, "defense": 83, "form": 80},
    "brazil": {"name": "Brazil", "rank": 5, "attack": 91, "defense": 88, "form": 85},
    "haiti": {"name": "Haiti", "rank": 86, "attack": 65, "defense": 63, "form": 50},
    "united_states": {"name": "United States", "rank": 14, "attack": 80, "defense": 79, "form": 78},
    "australia": {"name": "Australia", "rank": 23, "attack": 76, "defense": 74, "form": 70},
    "turkey": {"name": "Turkey", "rank": 26, "attack": 79, "defense": 76, "form": 72},
    "paraguay": {"name": "Paraguay", "rank": 56, "attack": 72, "defense": 73, "form": 50},
    "germany": {"name": "Germany", "rank": 16, "attack": 86, "defense": 83, "form": 80},
    "ecuador": {"name": "Ecuador", "rank": 44, "attack": 77, "defense": 75, "form": 70},
    "ivory_coast": {"name": "Ivory Coast", "rank": 38, "attack": 78, "defense": 76, "form": 75},
    "curacao": {"name": "Curaçao", "rank": 90, "attack": 64, "defense": 62, "form": 50},
    "japan": {"name": "Japan", "rank": 17, "attack": 82, "defense": 79, "form": 80},
    "netherlands": {"name": "Netherlands", "rank": 7, "attack": 85, "defense": 85, "form": 82},
    "sweden": {"name": "Sweden", "rank": 24, "attack": 78, "defense": 78, "form": 70},
    "tunisia": {"name": "Tunisia", "rank": 41, "attack": 70, "defense": 71, "form": 50},
    "egypt": {"name": "Egypt", "rank": 33, "attack": 79, "defense": 75, "form": 70},
    "belgium": {"name": "Belgium", "rank": 6, "attack": 84, "defense": 82, "form": 80},
    "iran": {"name": "Iran", "rank": 20, "attack": 72, "defense": 70, "form": 70},
    "new_zealand": {"name": "New Zealand", "rank": 104, "attack": 66, "defense": 68, "form": 50},
    "cape_verde_islands": {"name": "Cape Verde Islands", "rank": 65, "attack": 70, "defense": 69, "form": 65},
    "saudi_arabia": {"name": "Saudi Arabia", "rank": 53, "attack": 73, "defense": 71, "form": 70},
    "spain": {"name": "Spain", "rank": 3, "attack": 89, "defense": 87, "form": 85},
    "uruguay": {"name": "Uruguay", "rank": 11, "attack": 83, "defense": 83, "form": 75},
    "france": {"name": "France", "rank": 2, "attack": 91, "defense": 89, "form": 85},
    "iraq": {"name": "Iraq", "rank": 58, "attack": 70, "defense": 68, "form": 60},
    "norway": {"name": "Norway", "rank": 44, "attack": 84, "defense": 74, "form": 70},
    "senegal": {"name": "Senegal", "rank": 19, "attack": 80, "defense": 78, "form": 70},
    "algeria": {"name": "Algeria", "rank": 43, "attack": 77, "defense": 75, "form": 70},
    "argentina": {"name": "Argentina", "rank": 1, "attack": 92, "defense": 88, "form": 88},
    "jordan": {"name": "Jordan", "rank": 71, "attack": 68, "defense": 69, "form": 50},
    "austria": {"name": "Austria", "rank": 25, "attack": 78, "defense": 77, "form": 70},
    "congo_dr": {"name": "Congo DR", "rank": 62, "attack": 71, "defense": 70, "form": 60},
    "colombia": {"name": "Colombia", "rank": 12, "attack": 82, "defense": 81, "form": 80},
    "portugal": {"name": "Portugal", "rank": 8, "attack": 88, "defense": 86, "form": 82},
    "uzbekistan": {"name": "Uzbekistan", "rank": 66, "attack": 70, "defense": 68, "form": 50},
    "england": {"name": "England", "rank": 4, "attack": 90, "defense": 86, "form": 85},
    "ghana": {"name": "Ghana", "rank": 64, "attack": 74, "defense": 72, "form": 60},
    "croatia": {"name": "Croatia", "rank": 10, "attack": 81, "defense": 83, "form": 75},
    "panama": {"name": "Panama", "rank": 45, "attack": 71, "defense": 70, "form": 55}
}

def get_default_stats(team_name: str):
    return {
        "name": team_name,
        "rank": 35,
        "attack": 75,
        "defense": 75,
        "form": 60,
        "h2h": {}
    }

def calculate_form_score(form_input) -> float:
    if isinstance(form_input, (int, float)):
        return float(form_input)
    if isinstance(form_input, list) and len(form_input) > 0:
        w_count = sum(1 for x in form_input if str(x).upper() == "W")
        d_count = sum(1 for x in form_input if str(x).upper() == "D")
        return ((w_count * 3 + d_count * 1) / (len(form_input) * 3)) * 100
    return 60.0

@app.get("/health")
def read_health():
    return {"status": "healthy", "service": "pitchpulse-ai"}

@app.post("/predict/match")
def predict_match(request: MatchPredictionRequest):
    team_a_key = request.teamA.strip().lower().replace(" ", "_")
    team_b_key = request.teamB.strip().lower().replace(" ", "_")

    # 1. Resolve stats (prefer request inputs)
    if request.teamAStats:
        stats_a = {
            "name": request.teamA,
            "rank": request.teamAStats.rank,
            "attack": request.teamAStats.attack,
            "defense": request.teamAStats.defense,
            "form": calculate_form_score(request.teamAStats.form),
            "h2h": request.teamAStats.h2h or {}
        }
    else:
        stats_a = TEAM_DATABASE.get(team_a_key, get_default_stats(request.teamA)).copy()
        stats_a["form"] = calculate_form_score(stats_a["form"])
        stats_a["h2h"] = stats_a.get("h2h", {})

    if request.teamBStats:
        stats_b = {
            "name": request.teamB,
            "rank": request.teamBStats.rank,
            "attack": request.teamBStats.attack,
            "defense": request.teamBStats.defense,
            "form": calculate_form_score(request.teamBStats.form),
            "h2h": request.teamBStats.h2h or {}
        }
    else:
        stats_b = TEAM_DATABASE.get(team_b_key, get_default_stats(request.teamB)).copy()
        stats_b["form"] = calculate_form_score(stats_b["form"])
        stats_b["h2h"] = stats_b.get("h2h", {})

    # Calculate base strengths based on FIFA rank
    strength_a = max(10, 100 - stats_a["rank"])
    strength_b = max(10, 100 - stats_b["rank"])

    attack_a = stats_a["attack"]
    defense_a = stats_a["defense"]
    attack_b = stats_b["attack"]
    defense_b = stats_b["defense"]

    # Mentality modifiers
    def_mod_a = att_mod_a = def_mod_b = att_mod_b = 1.0

    if request.mentalityA == "attacking":
        att_mod_a = 1.15
        def_mod_a = 0.88
    elif request.mentalityA == "defensive":
        def_mod_a = 1.15
        att_mod_a = 0.88

    if request.mentalityB == "attacking":
        att_mod_b = 1.15
        def_mod_b = 0.88
    elif request.mentalityB == "defensive":
        def_mod_b = 1.15
        att_mod_b = 0.88

    # Formation modifiers
    def get_formation_mods(f):
        if f in ["5-4-1", "4-5-1", "5-3-2"]:
            return 0.90, 1.15 # Defensive
        if f in ["4-3-3", "3-4-3", "4-2-4"]:
            return 1.12, 0.92 # Attacking
        return 1.05, 1.05  # Balanced, e.g. 4-4-2, 3-5-2

    form_att_a, form_def_a = get_formation_mods(request.formationA)
    form_att_b, form_def_b = get_formation_mods(request.formationB)

    # Apply modifiers
    final_att_a = attack_a * att_mod_a * form_att_a
    final_def_a = defense_a * def_mod_a * form_def_a
    final_att_b = attack_b * att_mod_b * form_att_b
    final_def_b = defense_b * def_mod_b * form_def_b

    # H2H history factoring
    h2h_mod_a = 1.0
    h2h_mod_b = 1.0
    h2h_data = stats_a["h2h"].get(team_b_key) or stats_a["h2h"].get(request.teamB.lower())
    if h2h_data and isinstance(h2h_data, str) and "-" in h2h_data:
        try:
            parts = h2h_data.split("-")
            wins = int(parts[0])
            draws = int(parts[1])
            losses = int(parts[2])
            total_games = wins + draws + losses
            if total_games > 0:
                h2h_mod_a = 1.0 + ((wins - losses) / (total_games * 10))
                h2h_mod_b = 2.0 - h2h_mod_a
        except Exception:
            pass

    # Expected Goals (xG) calculation
    # Base expected goals: ~1.25
    xG_A = max(0.2, (final_att_a / (final_def_b + 5)) * (stats_a["form"] / 75.0) * h2h_mod_a * 1.35)
    xG_B = max(0.2, (final_att_b / (final_def_a + 5)) * (stats_b["form"] / 75.0) * h2h_mod_b * 1.35)

    # Heuristic score calculation for win/loss probabilities
    score_a = (0.35 * strength_a) + (0.25 * stats_a["form"]) + (0.20 * final_att_a) + (0.20 * final_def_a)
    score_b = (0.35 * strength_b) + (0.25 * stats_b["form"]) + (0.20 * final_att_b) + (0.20 * final_def_b)

    # Combine metrics and H2H modifiers
    score_a = score_a * h2h_mod_a
    score_b = score_b * h2h_mod_b

    total = score_a + score_b
    prob_a_raw = score_a / total
    prob_b_raw = score_b / total

    # Add minor noise
    noise = random.uniform(-0.015, 0.015)
    prob_a_raw = max(0.1, min(0.9, prob_a_raw + noise))
    prob_b_raw = max(0.1, min(0.9, prob_b_raw - noise))

    # Introduce draw probability
    draw_prob = 0.23
    win_a = int(round(prob_a_raw * (1 - draw_prob) * 100))
    win_b = int(round(prob_b_raw * (1 - draw_prob) * 100))
    draw = 100 - win_a - win_b

    # Determine winner
    if win_a > win_b:
        winner = stats_a["name"]
        confidence = win_a
    elif win_b > win_a:
        winner = stats_b["name"]
        confidence = win_b
    else:
        winner = "Draw"
        confidence = draw

    # Scoreline simulation (aligned with win percentages)
    goals_a = int(round(xG_A + random.uniform(-0.4, 0.4)))
    goals_b = int(round(xG_B + random.uniform(-0.4, 0.4)))
    goals_a = max(0, goals_a)
    goals_b = max(0, goals_b)

    # Align simulated score with predicted winner
    if win_a > win_b + 5 and goals_a <= goals_b:
        goals_a = goals_b + 1
    elif win_b > win_a + 5 and goals_b <= goals_a:
        goals_b = goals_a + 1
    elif abs(win_a - win_b) <= 5 and goals_a != goals_b:
        # Close game or draw prediction, make it a draw or narrow 1 goal difference
        if random.random() > 0.4:
            goals_a = goals_b = min(goals_a, goals_b)
        else:
            if goals_a > goals_b:
                goals_a = goals_b + 1
            else:
                goals_b = goals_a + 1

    # Generate narrative tactical analysis comment
    analysis_pieces = []
    
    # 1. Opening statement
    analysis_pieces.append(
        f"A tactical duel features {stats_a['name']} playing {request.formationA} ({request.mentalityA}) "
        f"against {stats_b['name']} in a {request.formationB} ({request.mentalityB}) posture."
    )

    # 2. Form/Rank commentary
    if stats_a["rank"] < stats_b["rank"] - 10:
        analysis_pieces.append(f"{stats_a['name']} holds the rank advantage (Rank {stats_a['rank']} vs {stats_b['name']}'s {stats_b['rank']}).")
    elif stats_b["rank"] < stats_a["rank"] - 10:
        analysis_pieces.append(f"{stats_b['name']} enters the match with the pedigree edge (Rank {stats_b['rank']} vs {stats_a['name']}'s {stats_a['rank']}).")
    else:
        analysis_pieces.append("Both squads are closely matched in their global FIFA standings.")

    # 3. Mentality/Tactical matchup
    if request.mentalityA == "attacking" and request.mentalityB == "defensive":
        analysis_pieces.append(f"We expect {stats_a['name']}'s aggressive press to test {stats_b['name']}'s defensive low-block.")
    elif request.mentalityA == "defensive" and request.mentalityB == "attacking":
        analysis_pieces.append(f"{stats_b['name']}'s heavy forward lines will push back {stats_a['name']}'s counter-attacking structure.")
    elif request.mentalityA == "attacking" and request.mentalityB == "attacking":
        analysis_pieces.append("Expect a high-tempo, open-ended game with both sides pushing forward aggressively.")
    elif request.mentalityA == "defensive" and request.mentalityB == "defensive":
        analysis_pieces.append("A cagey affair is anticipated with both teams prioritizing central compactness and clean sheets.")
    else:
        analysis_pieces.append("A balanced tactical setup will likely result in heavy midfield competition.")

    # 4. H2H detail
    if h2h_mod_a > 1.05:
        analysis_pieces.append(f"Historical H2H trends favor {stats_a['name']} as a historical challenge for {stats_b['name']}.")
    elif h2h_mod_b > 1.05:
        analysis_pieces.append(f"{stats_b['name']} enters with a psychological head-to-head edge.")

    # 5. Conclusion
    analysis_pieces.append(
        f"The AI Engine simulates an expected scoreline of {goals_a}-{goals_b} with a "
        f"{confidence}% confidence level favoring {winner if winner != 'Draw' else 'a Draw'}."
    )
    
    analysis_paragraph = " ".join(analysis_pieces)

    return {
        "teamA": stats_a["name"],
        "teamB": stats_b["name"],
        "prediction": {
            "winA": win_a,
            "draw": draw,
            "winB": win_b,
            "winner": winner,
            "confidence": confidence,
            "predictedScoreA": goals_a,
            "predictedScoreB": goals_b,
            "xG_A": round(xG_A, 2),
            "xG_B": round(xG_B, 2),
            "analysis": analysis_paragraph,
            "source": "AI Prediction Engine (FastAPI Service)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

