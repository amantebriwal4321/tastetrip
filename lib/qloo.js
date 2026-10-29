// Qloo Taste API client. Falls back to cached demo data when QLOO_API_KEY is not set.
import { DEMO } from "./demo";
const BASE = process.env.QLOO_BASE_URL || "https://hackathon.api.qloo.com";
export const LIVE = () => !!process.env.QLOO_API_KEY;

const TYPES = { artist:"urn:entity:artist", movie:"urn:entity:movie", place:"urn:entity:place",
  brand:"urn:entity:brand", book:"urn:entity:book", tv_show:"urn:entity:tv_show", podcast:"urn:entity:podcast",
  destination:"urn:entity:destination", person:"urn:entity:person" };

async function q(path, params) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") url.searchParams.set(k, v);
  const r = await fetch(url, { headers: { "X-Api-Key": process.env.QLOO_API_KEY, accept: "application/json" } });
  if (!r.ok) throw new Error(`Qloo ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}
const slim = (e) => ({ id: e.entity_id, name: e.name, type: e.subtype || e.type,
  address: e.properties?.address, tags: (e.tags || []).slice(0, 5).map(t => t.name),
  popularity: e.popularity, affinity: e.query?.affinity });

// Resolve free text like "Radiohead" to Qloo entity ids
export async function searchEntities({ query, type }) {
  if (!LIVE()) return DEMO.search(query, type);
  const d = await q("/search", { query, types: TYPES[type] || type, take: 5 });
  return (d.results || []).map(slim);
}

// Taste based recommendations via /v2/insights
export async function getInsights({ type, entity_ids, tags, city, take = 6 }) {
  if (!LIVE()) return DEMO.insights(type, city);
  const d = await q("/v2/insights", {
    "filter.type": TYPES[type] || type,
    "signal.interests.entities": (entity_ids || []).join(",") || undefined,
    "signal.interests.tags": (tags || []).join(",") || undefined,
    "filter.location.query": type === "place" ? city : undefined,
    take,
  });
  return (d.results?.entities || []).map(slim);
}
