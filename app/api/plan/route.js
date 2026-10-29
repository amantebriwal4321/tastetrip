import { runAgent } from "../../../lib/agent";
export const maxDuration = 60;
export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt || prompt.length > 1500) return Response.json({ error: "Prompt required (max 1500 chars)" }, { status: 400 });
    return Response.json(await runAgent(prompt));
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
export async function GET() { return Response.json({ qloo: process.env.QLOO_API_KEY ? "live" : "demo" }); }
