# TasteTrip

Agentic weekend planner built on the Qloo Taste API. Describe your vibe, the stuff you love and your city. A Gemini function calling agent resolves your tastes into Qloo entities, pulls cross domain insights (places, music, movies, brands) and writes a weekend itinerary where every stop has a reason.

Live: https://tastetrip-aman.vercel.app

## How it works
- `lib/agent.js`: Gemini agent loop with two tools, `search_entities` and `get_insights`
- `lib/qloo.js`: Qloo client. `GET /search` for entity resolution, `GET /v2/insights` with `filter.type`, `signal.interests.entities`, `signal.interests.tags`, `filter.location.query`. Auth via `X-Api-Key`
- The UI shows every tool call the agent made, so you can see the Qloo signal behind each pick

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
