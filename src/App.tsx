import { useMemo, useState } from "react";
import { buildDashboard, buildAutomationRun, type AutomationRun } from "./automation";
import { domainConfig } from "./domain";
import "./styles.css";

type PublishState = {
  integration: string;
  requestId: string;
  deliveredAt: string;
} | null;

export default function App() {
  const dashboard = useMemo(() => buildDashboard(domainConfig.sampleItems, domainConfig), []);
  const [selectedId, setSelectedId] = useState(dashboard.runs[0]?.item.id ?? "");
  const [activeRun, setActiveRun] = useState<AutomationRun>(dashboard.runs[0]);
  const [publishState, setPublishState] = useState<PublishState>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectRun = (itemId: string) => {
    const run = dashboard.runs.find((candidate) => candidate.item.id === itemId);
    if (!run) return;
    setSelectedId(itemId);
    setActiveRun(run);
    setPublishState(null);
  };

  const runAiReview = async () => {
    setBusy(true);
    setPublishState(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedId, liveMode })
      });
      const data = await response.json();
      setActiveRun(data.run ?? buildAutomationRun(activeRun.item, domainConfig));
    } finally {
      setBusy(false);
    }
  };

  const publish = async (integration: string) => {
    setBusy(true);
    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedId, integration })
      });
      const data = await response.json();
      setPublishState(data.delivery);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell" style={{ "--accent": domainConfig.accent } as React.CSSProperties}>
      <aside className="sidebar">
        <div>
          <p className="eyebrow">{domainConfig.workflow}</p>
          <h1>{domainConfig.title}</h1>
          <p className="tagline">{domainConfig.tagline}</p>
        </div>
        <div className="goal">
          <span>Client outcome</span>
          <strong>{domainConfig.businessGoal}</strong>
        </div>
        <div className="integration-list" aria-label="Available integrations">
          {domainConfig.integrations.map((integration) => (
            <span key={integration}>{integration}</span>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{domainConfig.audience}</p>
            <h2>Automation control room</h2>
          </div>
          <label className="toggle">
            <input checked={liveMode} onChange={(event) => setLiveMode(event.target.checked)} type="checkbox" />
            <span>Live OpenAI review</span>
          </label>
        </header>

        <section className="kpi-grid" aria-label="Workflow KPIs">
          {dashboard.kpis.map((kpi) => (
            <article className="kpi-card" key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <small>{kpi.helper}</small>
            </article>
          ))}
        </section>

        <section className="demo-story-grid" aria-label="Before and after demo story">
          <article className="story-card before">
            <p className="eyebrow">Before</p>
            <h3>{domainConfig.demo.beforeTitle}</h3>
            <ul>
              {domainConfig.demo.beforeState.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article className="story-card provide">
            <p className="eyebrow">What we provide</p>
            <h3>Deployable automation system</h3>
            <ul>
              {domainConfig.demo.whatWeProvide.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article className="story-card after">
            <p className="eyebrow">After</p>
            <h3>{domainConfig.demo.afterTitle}</h3>
            <ul>
              {domainConfig.demo.afterState.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </section>

        <section className="content-grid">
          <nav className="queue" aria-label="Work queue">
            <div className="section-heading">
              <p className="eyebrow">Incoming {domainConfig.itemPlural}</p>
              <h3>Approval queue</h3>
            </div>
            {dashboard.runs.map((run) => (
              <button className={run.item.id === selectedId ? "queue-item active" : "queue-item"} key={run.item.id} onClick={() => selectRun(run.item.id)}>
                <span>
                  <strong>{run.item.title}</strong>
                  <small>{run.item.customer} via {run.item.source}</small>
                </span>
                <b className={`priority ${run.priority}`}>{run.score}</b>
              </button>
            ))}
          </nav>

          <section className="detail-panel">
            <div className="section-heading">
              <p className="eyebrow">{activeRun.item.id}</p>
              <h3>{activeRun.item.title}</h3>
            </div>
            <p className="description">{activeRun.item.description}</p>
            <div className="tag-row">
              {activeRun.item.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>

            <div className="analysis-strip">
              <div>
                <span>AI score</span>
                <strong>{activeRun.score}</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>{activeRun.confidence}%</strong>
              </div>
              <div>
                <span>Priority</span>
                <strong>{activeRun.priority}</strong>
              </div>
              <div>
                <span>Route</span>
                <strong>{activeRun.route}</strong>
              </div>
            </div>

            <div className="automation-row">
              <button className="primary" disabled={busy} onClick={runAiReview}>{busy ? "Running..." : domainConfig.primaryAction}</button>
              <button disabled={busy} onClick={() => setActiveRun(buildAutomationRun(activeRun.item, domainConfig))}>Reset deterministic demo</button>
            </div>

            <div className="split">
              <section>
                <h4>Next best actions</h4>
                <ul className="action-list">
                  {activeRun.nextBestActions.map((action) => <li key={action}>{action}</li>)}
                </ul>
              </section>
              <section>
                <h4>Timeline</h4>
                <ol className="timeline">
                  {activeRun.timeline.map((event) => (
                    <li key={event.at + event.event}>
                      <time>{event.at}</time>
                      <span>{event.event}</span>
                      <small>{event.detail}</small>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </section>

          <aside className="output-panel">
            <div className="section-heading">
              <p className="eyebrow">Human-in-loop outputs</p>
              <h3>Drafts and payloads</h3>
            </div>
            {activeRun.draftOutputs.map((output) => (
              <section className="output-block" key={output.label}>
                <h4>{output.label}</h4>
                <pre>{output.content}</pre>
              </section>
            ))}
            <div className="publish-grid">
              {activeRun.integrationPayloads.map((payload) => (
                <button disabled={busy} key={payload.integration} onClick={() => publish(payload.integration)}>
                  Send to {payload.integration}
                </button>
              ))}
            </div>
            {publishState && (
              <div className="delivery">
                <strong>Delivered to {publishState.integration}</strong>
                <span>{publishState.requestId}</span>
                <small>{publishState.deliveredAt}</small>
              </div>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
