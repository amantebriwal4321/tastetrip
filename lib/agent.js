import { searchEntities, searchTags, getInsights, getAudience, LIVE } from "./qloo";
const MODELS = [process.env.GEMINI_MODEL || "gemini-3.5-flash", "gemini-3.1-flash-lite"];
const TYPES = ["artist","movie","place","brand","book","tv_show","podcast","destination"];
const tools = [{ functionDeclarations: [
  { name: "search_entities", description: "Resolve a name (artist, movie, brand, place...) the user mentioned into Qloo entity ids.",
    parameters: { type: "OBJECT", properties: { query: { type: "STRING" }, type: { type: "STRING", enum: TYPES } }, required: ["query","type"] } },
  { name: "get_insights", description: "Get Qloo taste based recommendations of a given type, seeded by entity ids and/or tags. For type=place pass the city.",
    parameters: { type: "OBJECT", properties: { type: { type: "STRING", enum: TYPES }, entity_ids: { type: "ARRAY", items: { type: "STRING" } },
      tags: { type: "ARRAY", items: { type: "STRING" } }, filter_tags: { type: "ARRAY", items: { type: "STRING" }, description: "Qloo tag ids to restrict results, e.g. urn:tag:genre:place:restaurant" }, city: { type: "STRING" }, take: { type: "INTEGER" } }, required: ["type"] } },
,
  { name: "search_tags", description: "Resolve a loose vibe or interest (e.g. 'filter coffee', 'jazz', 'rooftop') into Qloo tag ids.",
    parameters: { type: "OBJECT", properties: { query: { type: "STRING" } }, required: ["query"] } },
  { name: "get_audience", description: "Get the Qloo demographic taste profile (age, gender affinity) for the user's resolved entity ids.",
    parameters: { type: "OBJECT", properties: { entity_ids: { type: "ARRAY", items: { type: "STRING" } } }, required: ["entity_ids"] } },
]}];
const SYS = `You are TasteTrip, a planning agent. The user gives a vibe, things they love, and a city.
Steps: 1) call search_entities for every concrete artist/movie/brand/book they mention, and search_tags for loose vibes (food, mood). Call get_audience once with the resolved ids. 2) call get_insights for places in their city (seeded by those ids and tag ids) and at least one other domain (music or food or brands). 3) Write a weekend itinerary.
Only recommend places returned by tools. Output markdown: a title, then Saturday and Sunday with time slots, each item with one line "why" that links it to the user's taste and the Qloo signal, quoting the Qloo affinity score when there is one. End with a short "Soundtrack" list from artist insights. Keep it short and friendly. Never use em dashes or en dashes.`;

const impl = { search_entities: searchEntities, search_tags: searchTags, get_insights: getInsights, get_audience: getAudience };

export async function runAgent(prompt) {
  const trace = [];
  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  for (let i = 0; i < 8; i++) {
    let r;
    for (const MODEL of MODELS) {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: SYS }] }, contents, tools }),
        signal: AbortSignal.timeout(25000),
      }).catch(e => ({ ok: false, status: 0, text: async () => e.message }));
      if (r.ok) break;
    }
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const d = await r.json();
    const parts = d.candidates?.[0]?.content?.parts || [];
    contents.push({ role: "model", parts });
    const calls = parts.filter(p => p.functionCall);
    if (!calls.length) return { plan: parts.map(p => p.text || "").join(""), trace, demo: !LIVE() };
    const responses = [];
    for (const { functionCall: fc } of calls) {
      let out;
      try { out = await impl[fc.name](fc.args || {}); } catch (e) { out = { error: e.message }; }
      trace.push({ tool: fc.name, args: fc.args, results: Array.isArray(out) ? out.length : 0, sample: Array.isArray(out) ? out.slice(0, 3).map(x => x.name) : out, items: Array.isArray(out) ? out.slice(0, 6) : [] });
      responses.push({ functionResponse: { name: fc.name, response: { result: out } } });
    }
    contents.push({ role: "user", parts: responses });
  }
  return { plan: "Agent ran out of steps, try a simpler prompt.", trace, demo: !LIVE() };
}
