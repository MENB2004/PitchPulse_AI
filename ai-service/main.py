from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random

app = FastAPI(
    title="PitchPulse AI Prediction Engine",
    description="Microservice for predicting FIFA World Cup outcomes using machine learning heuristics.",
    version="1.0.0"
)

class MatchPredictionRequest(BaseModel):
    teamA: str
    teamB: str
    formationA: str = None
    mentalityA: str = None
    formationB: str = None
    mentalityB: str = None

# Define static team database for calculation inside the AI Service
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
        "form": 50
    }

@app.get("/health")
def read_health():
    return {"status": "healthy", "service": "pitchpulse-ai"}

@app.post("/predict/match")
def predict_match(request: MatchPredictionRequest):
    team_a_key = request.teamA.strip().lower()
    team_b_key = request.teamB.strip().lower()

    stats_a = TEAM_DATABASE.get(team_a_key, get_default_stats(request.teamA)).copy()
    stats_b = TEAM_DATABASE.get(team_b_key, get_default_stats(request.teamB)).copy()

    # Convert ranks to strengths
    strength_a = max(1, 100 - stats_a["rank"])
    strength_b = max(1, 100 - stats_b["rank"])

    attack_a = stats_a["attack"]
    defense_a = stats_a["defense"]
    attack_b = stats_b["attack"]
    defense_b = stats_b["defense"]

    # Mentality modifiers
    if request.mentalityA == "attacking":
        attack_a *= 1.15
        defense_a *= 0.88
    elif request.mentalityA == "defensive":
        defense_a *= 1.15
        attack_a *= 0.88

    if request.mentalityB == "attacking":
        attack_b *= 1.15
        defense_b *= 0.88
    elif request.mentalityB == "defensive":
        defense_b *= 1.15
        attack_b *= 0.88

    # Formation modifiers
    def get_formation_mods(f):
        if f in ["5-4-1", "4-5-1", "5-3-2"]:
            return 0.92, 1.12
        if f in ["4-3-3", "3-4-3", "4-2-4"]:
            return 1.10, 0.94
        return 1.05, 1.05  # Balanced, e.g., 4-4-2, 3-5-2

    if request.formationA:
        att_mod, def_mod = get_formation_mods(request.formationA)
        attack_a *= att_mod
        defense_a *= def_mod

    if request.formationB:
        att_mod, def_mod = get_formation_mods(request.formationB)
        attack_b *= att_mod
        defense_b *= def_mod

    # Heuristic weights
    score_a = (0.35 * strength_a) + (0.25 * stats_a["form"]) + (0.20 * attack_a) + (0.20 * defense_a)
    score_b = (0.35 * strength_b) + (0.25 * stats_b["form"]) + (0.20 * attack_b) + (0.20 * defense_b)

    total = score_a + score_b
    prob_a_raw = score_a / total
    prob_b_raw = score_b / total

    # Add minor noise
    noise = random.uniform(-0.02, 0.02)
    prob_a_raw = max(0.1, min(0.9, prob_a_raw + noise))
    prob_b_raw = max(0.1, min(0.9, prob_b_raw - noise))

    # Introduce draw probability
    draw_prob = 0.22
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

    return {
        "teamA": stats_a["name"],
        "teamB": stats_b["name"],
        "prediction": {
            "winA": win_a,
            "draw": draw,
            "winB": win_b,
            "winner": winner,
            "confidence": confidence,
            "source": "AI Service (FastAPI Microservice Engine)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
