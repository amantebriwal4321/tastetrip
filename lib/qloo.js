// Qloo Taste AI API client. Falls back to cached demo data when QLOO_API_KEY is not set.
import { DEMO } from "./demo";
const BASE = process.env.QLOO_BASE_URL || "https://hackathon.api.qloo.com";
export const LIVE = () => !!process.env.QLOO_API_KEY;

const TYPES = { artist:"urn:entity:artist", movie:"urn:entity:movie", place:"urn:entity:place",
  brand:"urn:entity:brand", book:"urn:entity:book", tv_show:"urn:entity:tv_show", podcast:"urn:entity:podcast",
  destination:"urn:entity:destination", person:"urn:entity:person" };

// Every Qloo feature TasteTrip uses. Rendered in the UI and README.
export const QLOO_FEATURES = [
  { tool: "search_entities", endpoint: "GET /search", what: "Turns names you type (artists, films, brands, books) into Qloo entity ids", benefit: "Cold start from 2 or 3 names. No signup, no history, no ratings needed" },
  { tool: "search_tags", endpoint: "GET /v2/tags", what: "Turns loose vibes like \"filter coffee\" or \"jazz\" into Qloo taste tags", benefit: "Fuzzy vibes become precise filters, so \"filter coffee\" finds actual filter coffee spots" },
  { tool: "get_insights", endpoint: "GET /v2/insights", what: "Cross domain recs with affinity scores. Uses filter.type, signal.interests.entities, signal.interests.tags, filter.tags, filter.location.query", benefit: "One cross domain taste graph: a song you like predicts a cafe you will like. Affinity scores explain every pick" },
  { tool: "get_audience", endpoint: "GET /v2/insights (urn:demographics)", what: "Age and gender taste profile behind your picks, used to tune the plan's tone", benefit: "Audience insight without any personal data. Privacy safe by design, Qloo never needs who you are" },
];

async function q(path, params) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") url.searchParams.set(k, v);
  const r = await fetch(url, { headers: { "X-Api-Key": process.env.QLOO_API_KEY, accept: "application/json" }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`Qloo ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}
const r2 = (x) => typeof x === "number" ? +x.toFixed(3) : undefined;
const slim = (e) => ({ id: e.entity_id, name: e.name, type: (e.subtype || e.types?.[0] || e.type || "").replace("urn:entity:", ""),
  address: e.properties?.address, tags: (e.tags || []).slice(0, 5).map(t => t.name),
  popularity: r2(e.popularity), affinity: r2(e.query?.affinity) });

export async function searchEntities({ query, type }) {
  if (!LIVE()) return DEMO.search(query, type);
  const d = await q("/search", { query, types: TYPES[type] || type, take: 5 });
  return (d.results || []).map(slim);
}

export async function searchTags({ query }) {
  if (!LIVE()) return [{ id: "urn:tag:keyword:demo:" + query, name: query, demo: true }];
  const d = await q("/v2/tags", { "filter.query": query, take: 5 });
  return (d.results?.tags || []).map(t => ({ id: t.id, name: t.name, type: t.type, popularity: r2(t.popularity) }));
}

export async function getInsights({ type, entity_ids, tags, filter_tags, city, take = 6 }) {
  if (!LIVE()) return DEMO.insights(type, city);
  const d = await q("/v2/insights", {
    "filter.type": TYPES[type] || type,
    "signal.interests.entities": (entity_ids || []).join(",") || undefined,
    "signal.interests.tags": (tags || []).join(",") || undefined,
    "filter.tags": (filter_tags || []).join(",") || undefined,
    "filter.location.query": type === "place" ? city : undefined,
    take,
  });
  return (d.results?.entities || []).map(slim);
}

export async function getAudience({ entity_ids }) {
  if (!LIVE() || !entity_ids?.length) return [];
  const d = await q("/v2/insights", { "filter.type": "urn:demographics", "signal.interests.entities": entity_ids.join(",") });
  return (d.results?.demographics || []).map(x => ({ id: x.entity_id, name: "audience " + x.entity_id.slice(0, 8), age: x.query?.age, gender: x.query?.gender }));
}
