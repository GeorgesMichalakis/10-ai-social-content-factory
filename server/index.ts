import cors from "cors";
import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { z } from "zod";
import { buildAutomationRun, publishMock, type AutomationRun } from "../src/automation";
import { domainConfig } from "../src/domain";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const analyzeSchema = z.object({
  itemId: z.string(),
  liveMode: z.boolean().optional()
});

const publishSchema = z.object({
  itemId: z.string(),
  integration: z.string()
});

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    demo: domainConfig.title,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.get("/api/items", (_request, response) => {
  response.json({ config: domainConfig, items: domainConfig.sampleItems });
});

app.post("/api/analyze", async (request, response) => {
  const input = analyzeSchema.parse(request.body);
  const item = domainConfig.sampleItems.find((candidate) => candidate.id === input.itemId);
  if (!item) {
    response.status(404).json({ error: "Item not found" });
    return;
  }

  const deterministic = buildAutomationRun(item, domainConfig);
  if (!input.liveMode || !process.env.OPENAI_API_KEY) {
    response.json({ mode: "deterministic-demo", run: deterministic });
    return;
  }

  const run = await enrichWithOpenAI(deterministic);
  response.json({ mode: "openai-responses-api", run });
});

app.post("/api/publish", (request, response) => {
  const input = publishSchema.parse(request.body);
  const item = domainConfig.sampleItems.find((candidate) => candidate.id === input.itemId);
  if (!item) {
    response.status(404).json({ error: "Item not found" });
    return;
  }

  const run = buildAutomationRun(item, domainConfig);
  response.json({ delivery: publishMock(run, input.integration) });
});

async function enrichWithOpenAI(fallback: AutomationRun): Promise<AutomationRun> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = [
    `You are an AI automation consultant demoing AI Social Content Factory.`,
    "Improve the provided automation run for a small-business client.",
    "Return strict JSON with only these keys: nextBestActions, draftOutputs, confidence.",
    "Keep the route, score, priority, and integration payload structure unchanged.",
    JSON.stringify({
      workflow: domainConfig.workflow,
      businessGoal: domainConfig.businessGoal,
      run: fallback
    }, null, 2)
  ].join("\n\n");

  try {
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.2",
      input: prompt
    });
    const parsed = JSON.parse(extractJson(result.output_text ?? "{}"));
    return {
      ...fallback,
      confidence: typeof parsed.confidence === "number" ? Math.max(45, Math.min(98, Math.round(parsed.confidence))) : fallback.confidence,
      nextBestActions: Array.isArray(parsed.nextBestActions) ? parsed.nextBestActions.slice(0, 6).map(String) : fallback.nextBestActions,
      draftOutputs: Array.isArray(parsed.draftOutputs) ? parsed.draftOutputs.map((draft: any, index: number) => ({
        label: String(draft.label ?? fallback.draftOutputs[index]?.label ?? `Draft ${index + 1}`),
        content: String(draft.content ?? fallback.draftOutputs[index]?.content ?? "")
      })).filter((draft: { content: string }) => draft.content.length > 0) : fallback.draftOutputs,
      timeline: [
        ...fallback.timeline,
        { at: "00:14", event: "OpenAI review", detail: "Drafts improved with live Responses API call" }
      ]
    };
  } catch (error) {
    console.error("OpenAI enrichment failed, returning deterministic run", error);
    return fallback;
  }
}

function extractJson(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return "{}";
  return text.slice(first, last + 1);
}

const staticDir = path.resolve(__dirname, "../../dist");
app.use(express.static(staticDir));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, () => {
  console.log(`AI Social Content Factory listening on http://localhost:${port}`);
});
