export type Priority = "critical" | "high" | "medium" | "low";

export type WorkItem = {
  id: string;
  title: string;
  source: string;
  customer: string;
  owner: string;
  value: number;
  urgency: number;
  description: string;
  tags: string[];
  receivedAt: string;
};

export type CategoryRule = {
  name: string;
  keywords: string[];
  route: string;
  boost: number;
};

export type DomainConfig = {
  slug: string;
  title: string;
  tagline: string;
  workflow: string;
  audience: string;
  itemNoun: string;
  itemPlural: string;
  primaryAction: string;
  accent: string;
  businessGoal: string;
  integrations: string[];
  routes: string[];
  categories: CategoryRule[];
  positiveKeywords: string[];
  riskKeywords: string[];
  outputLabels: string[];
  sampleItems: WorkItem[];
};

export type AutomationRun = {
  id: string;
  item: WorkItem;
  category: string;
  route: string;
  score: number;
  confidence: number;
  priority: Priority;
  riskFlags: string[];
  matchedKeywords: string[];
  nextBestActions: string[];
  draftOutputs: { label: string; content: string }[];
  integrationPayloads: IntegrationPayload[];
  timeline: { at: string; event: string; detail: string }[];
};

export type IntegrationPayload = {
  integration: string;
  endpoint: string;
  payload: Record<string, unknown>;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const tokenize = (item: WorkItem) => [item.title, item.description, item.source, ...item.tags].join(" ").toLowerCase();

const keywordHits = (text: string, keywords: string[]) => keywords.filter((keyword) => text.includes(keyword.toLowerCase()));

export function classifyItem(item: WorkItem, config: DomainConfig) {
  const text = tokenize(item);
  const ranked = config.categories
    .map((category) => ({
      ...category,
      hits: keywordHits(text, category.keywords),
      rawScore: keywordHits(text, category.keywords).length * 18 + category.boost
    }))
    .sort((a, b) => b.rawScore - a.rawScore);

  return ranked[0];
}

export function scoreItem(item: WorkItem, config: DomainConfig) {
  const text = tokenize(item);
  const category = classifyItem(item, config);
  const positiveHits = keywordHits(text, config.positiveKeywords);
  const riskHits = keywordHits(text, config.riskKeywords);
  const tagSignal = item.tags.length * 2;
  const valueSignal = item.value > 10000 ? 18 : item.value > 2500 ? 10 : item.value > 0 ? 4 : 0;
  const score = clamp(Math.round(item.urgency * 0.52 + valueSignal + tagSignal + category.boost + positiveHits.length * 5 + riskHits.length * 7), 1, 100);

  return {
    score,
    category,
    positiveHits,
    riskHits,
    matchedKeywords: [...new Set([...category.hits, ...positiveHits, ...riskHits])]
  };
}

export function priorityFromScore(score: number): Priority {
  if (score >= 86) return "critical";
  if (score >= 68) return "high";
  if (score >= 42) return "medium";
  return "low";
}

export function buildDraftOutputs(item: WorkItem, config: DomainConfig, runFacts: { category: string; route: string; priority: Priority; riskFlags: string[] }) {
  const lead = `${config.workflow}: ${item.title}`;
  const riskLine = runFacts.riskFlags.length ? `Risks to review: ${runFacts.riskFlags.join(", ")}.` : "No major risk flags detected.";
  return config.outputLabels.map((label, index) => {
    if (index === 0) {
      return {
        label,
        content: `${lead}\nCustomer: ${item.customer}\nClassification: ${runFacts.category}\nPriority: ${runFacts.priority}\nRecommended route: ${runFacts.route}\n${riskLine}`
      };
    }
    if (index === 1) {
      return {
        label,
        content: `Hi ${item.customer.split(" ")[0]},\n\nThanks for reaching out about ${item.title.toLowerCase()}. I reviewed the details and the next best step is to route this to ${runFacts.route}. I will keep the workflow moving and follow up with the relevant details.\n\nBest,\nAI Operations Assistant`
      };
    }
    return {
      label,
      content: JSON.stringify({
        itemId: item.id,
        workflow: config.workflow,
        route: runFacts.route,
        priority: runFacts.priority,
        category: runFacts.category,
        source: item.source,
        requiresHumanApproval: runFacts.priority === "critical" || runFacts.riskFlags.length > 0
      }, null, 2)
    };
  });
}

export function buildIntegrationPayloads(item: WorkItem, config: DomainConfig, route: string, priority: Priority): IntegrationPayload[] {
  return config.integrations.slice(0, 4).map((integration) => ({
    integration,
    endpoint: `/api/integrations/${integration.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    payload: {
      itemId: item.id,
      title: item.title,
      customer: item.customer,
      workflow: config.workflow,
      route,
      priority,
      source: item.source,
      tags: item.tags,
      value: item.value,
      createdBy: "ai-automation-demo"
    }
  }));
}

export function buildAutomationRun(item: WorkItem, config: DomainConfig): AutomationRun {
  const scored = scoreItem(item, config);
  const priority = priorityFromScore(scored.score);
  const route = scored.category.route;
  const riskFlags = [...new Set(scored.riskHits)];
  const confidence = clamp(Math.round(62 + scored.matchedKeywords.length * 6 + (scored.score > 70 ? 10 : 0) - (riskFlags.length ? 5 : 0)), 45, 98);
  const nextBestActions = [
    `${config.primaryAction} to ${route}`,
    priority === "critical" ? "Require human approval before external send" : "Allow one-click approval",
    riskFlags.length ? `Review risk flags: ${riskFlags.join(", ")}` : `Publish to ${config.integrations.slice(0, 2).join(" and ")}`,
    `Log result in ${config.integrations[0]}`
  ];

  const facts = { category: scored.category.name, route, priority, riskFlags };

  return {
    id: `run-${item.id}`,
    item,
    category: scored.category.name,
    route,
    score: scored.score,
    confidence,
    priority,
    riskFlags,
    matchedKeywords: scored.matchedKeywords,
    nextBestActions,
    draftOutputs: buildDraftOutputs(item, config, facts),
    integrationPayloads: buildIntegrationPayloads(item, config, route, priority),
    timeline: [
      { at: "00:00", event: "Ingested", detail: `Received from ${item.source}` },
      { at: "00:04", event: "Classified", detail: `${scored.category.name} with ${confidence}% confidence` },
      { at: "00:07", event: "Routed", detail: `Assigned to ${route}` },
      { at: "00:10", event: "Drafted", detail: `${config.outputLabels.length} outputs generated for approval` }
    ]
  };
}

export function buildDashboard(items: WorkItem[], config: DomainConfig) {
  const runs = items.map((item) => buildAutomationRun(item, config));
  const highPriority = runs.filter((run) => run.priority === "critical" || run.priority === "high").length;
  const avgScore = Math.round(runs.reduce((sum, run) => sum + run.score, 0) / runs.length);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const approvalRequired = runs.filter((run) => run.riskFlags.length > 0 || run.priority === "critical").length;

  return {
    runs,
    kpis: [
      { label: "Items processed", value: String(items.length), helper: config.itemPlural },
      { label: "High priority", value: String(highPriority), helper: "need fast action" },
      { label: "Average AI score", value: String(avgScore), helper: "qualification signal" },
      { label: "Value in queue", value: formatCurrency(totalValue), helper: "pipeline impact" },
      { label: "Approval required", value: String(approvalRequired), helper: "human-in-loop" }
    ]
  };
}

export function publishMock(run: AutomationRun, integration: string) {
  const payload = run.integrationPayloads.find((item) => item.integration === integration) ?? run.integrationPayloads[0];
  return {
    ok: true,
    integration,
    deliveredAt: new Date().toISOString(),
    requestId: `mock_${integration.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${run.item.id}`,
    payload: payload.payload
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
