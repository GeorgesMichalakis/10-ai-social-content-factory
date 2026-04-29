import { describe, expect, it } from "vitest";
import { buildAutomationRun, buildDashboard, publishMock } from "../src/automation";
import { domainConfig } from "../src/domain";

describe("AI Social Content Factory", () => {
  it("classifies and prioritizes a high-value sample item", () => {
    const item = domainConfig.sampleItems.find((candidate) => candidate.id === "post-701")!;
    const run = buildAutomationRun(item, domainConfig);

    expect(run.score).toBeGreaterThanOrEqual(68);
    expect(["critical", "high"]).toContain(run.priority);
    expect(domainConfig.routes).toContain(run.route);
    expect(run.nextBestActions.join(" ")).toContain(domainConfig.primaryAction);
  });

  it("builds dashboard KPIs for the whole queue", () => {
    const dashboard = buildDashboard(domainConfig.sampleItems, domainConfig);

    expect(dashboard.runs).toHaveLength(domainConfig.sampleItems.length);
    expect(dashboard.kpis[0].value).toBe(String(domainConfig.sampleItems.length));
    expect(domainConfig.demo.beforeState.length).toBeGreaterThan(0);
    expect(domainConfig.demo.afterState.length).toBeGreaterThan(0);
  });

  it("creates mock integration delivery payloads", () => {
    const run = buildAutomationRun(domainConfig.sampleItems[0], domainConfig);
    const delivery = publishMock(run, domainConfig.integrations[0]);

    expect(delivery.ok).toBe(true);
    expect(delivery.integration).toBe(domainConfig.integrations[0]);
    expect(delivery.payload).toMatchObject({ itemId: domainConfig.sampleItems[0].id });
  });
});
