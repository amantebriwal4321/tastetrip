# TasteTrip

Agentic weekend planner built on the Qloo Taste API. Describe your vibe, the stuff you love and your city. A Gemini function calling agent resolves your tastes into Qloo entities, pulls cross domain insights (places, music, movies, brands) and writes a weekend itinerary where every stop has a reason.

Live: https://tastetrip-aman.vercel.app

## How we use Qloo
Qloo is the whole taste brain here. Every place, artist, film and brand in a plan comes from the Qloo Taste AI API. Gemini only decides which Qloo calls to make and writes the itinerary.

| Agent tool | Qloo endpoint | What it does in TasteTrip |
|---|---|---|
| `search_entities` | `GET /search` | Turns names you type (Prateek Kuhad, Before Sunrise) into Qloo entity ids |
| `search_tags` | `GET /v2/tags` | Turns loose vibes (filter coffee, chill indie) into Qloo tag ids |
| `get_insights` | `GET /v2/insights` | Cross domain recs for places, artists, movies, brands, books. Uses `filter.type`, `signal.interests.entities`, `signal.interests.tags`, `filter.tags`, `filter.location.query` |
| `get_audience` | `GET /v2/insights` with `filter.type=urn:demographics` | Age and gender taste profile behind your picks, used to tune the plan's tone |

What you see in the UI:
- A "How TasteTrip uses Qloo" panel listing each endpoint above
- Every Qloo call the agent made, with its args and the returned entities as cards
- Qloo affinity and popularity scores as bars on each entity
- The plan quotes the Qloo affinity score behind each stop
- "Powered by Qloo" badges on every section driven by Qloo data

## Code
- `lib/agent.js`: Gemini function calling loop over the four Qloo tools
- `lib/qloo.js`: Qloo client, auth via `X-Api-Key`, base `https://hackathon.api.qloo.com`

## Run
```
npm i
GEMINI_API_KEY=... QLOO_API_KEY=... npm run dev
```
Without `QLOO_API_KEY` the app runs in demo mode with cached sample Qloo responses, clearly labeled in the UI.

## Env
- `GEMINI_API_KEY` required
- `QLOO_API_KEY` Qloo hackathon key
- `QLOO_BASE_URL` defaults to `https://hackathon.api.qloo.com`

MIT licensed.
