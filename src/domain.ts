import type { DomainConfig } from "./automation";

export const domainConfig: DomainConfig = {
  "slug": "10-ai-social-content-factory",
  "title": "AI Social Content Factory",
  "tagline": "Repurposes source material into a content calendar, hooks, captions, hashtags, and approval workflows.",
  "workflow": "Social content production",
  "audience": "Creators, agencies, coaches, and B2B teams",
  "itemNoun": "content brief",
  "itemPlural": "content briefs",
  "primaryAction": "Generate content",
  "accent": "#db2777",
  "businessGoal": "Publish more consistently while keeping brand voice and approvals under control.",
  "integrations": [
    "LinkedIn",
    "Instagram",
    "X",
    "Buffer",
    "Airtable",
    "Zapier"
  ],
  "routes": [
    "Ready to schedule",
    "Needs brand review",
    "Video repurpose",
    "Idea backlog"
  ],
  "categories": [
    {
      "name": "Launch announcement",
      "keywords": [
        "launch",
        "new",
        "feature",
        "release"
      ],
      "route": "Ready to schedule",
      "boost": 18
    },
    {
      "name": "Thought leadership",
      "keywords": [
        "lesson",
        "insight",
        "framework",
        "opinion"
      ],
      "route": "Needs brand review",
      "boost": 10
    },
    {
      "name": "Video repurpose",
      "keywords": [
        "transcript",
        "podcast",
        "webinar",
        "clip"
      ],
      "route": "Video repurpose",
      "boost": 16
    },
    {
      "name": "Backlog idea",
      "keywords": [
        "idea",
        "maybe",
        "someday",
        "rough"
      ],
      "route": "Idea backlog",
      "boost": -4
    }
  ],
  "positiveKeywords": [
    "launch",
    "insight",
    "case study",
    "proof",
    "customer"
  ],
  "riskKeywords": [
    "unverified",
    "sensitive",
    "legal",
    "maybe",
    "rough"
  ],
  "outputLabels": [
    "Caption set",
    "Calendar note",
    "Publishing payload"
  ],
  "sampleItems": [
    {
      "id": "post-701",
      "title": "Turn webinar transcript into LinkedIn posts",
      "source": "Transcript upload",
      "customer": "B2B founder",
      "owner": "Content manager",
      "value": 2500,
      "urgency": 74,
      "description": "Repurpose the webinar transcript into five LinkedIn posts with hooks, hashtags, and a launch announcement for the new feature.",
      "tags": [
        "transcript",
        "launch",
        "linkedin"
      ],
      "receivedAt": "2026-04-29T08:42:00Z"
    },
    {
      "id": "post-702",
      "title": "Founder lesson from customer onboarding",
      "source": "Airtable idea bank",
      "customer": "Personal brand",
      "owner": "Founder",
      "value": 900,
      "urgency": 44,
      "description": "Rough idea about a lesson learned during customer onboarding. Needs brand review before publishing.",
      "tags": [
        "lesson",
        "rough"
      ],
      "receivedAt": "2026-04-29T10:28:00Z"
    },
    {
      "id": "post-703",
      "title": "Case study snippet for Instagram",
      "source": "Notion",
      "customer": "Agency client",
      "owner": "Social lead",
      "value": 1800,
      "urgency": 61,
      "description": "Create Instagram caption and hashtags from a customer case study with proof points and results.",
      "tags": [
        "case study",
        "instagram"
      ],
      "receivedAt": "2026-04-29T11:34:00Z"
    }
  ],
  "demo": {
    "beforeTitle": "Manual social content production",
    "beforeState": [
      "Content briefs arrive from LinkedIn, Instagram, X and are reviewed one by one.",
      "The team copies details between tools, decides priority manually, and writes repetitive notes or replies from scratch.",
      "High-value or risky content briefs can sit in the same queue as low-value work, so follow-up quality depends on who notices first."
    ],
    "whatWeProvide": [
      "A deployable React and Express workflow app tailored to Creators, agencies, coaches, and B2B teams.",
      "An AI scoring and routing engine for content briefs, with deterministic fallback mode and optional live OpenAI Responses API review.",
      "Human-in-loop approval screens, generated drafts, audit-friendly timeline, and mock adapters for LinkedIn, Instagram, X, Buffer, Airtable, Zapier.",
      "Production-ready handoff assets: Dockerfile, Render config, environment template, tests, and integration payload examples."
    ],
    "afterTitle": "Automated social content production",
    "afterState": [
      "Content briefs are classified, scored, routed to Ready to schedule, and prepared for review in seconds.",
      "The operator receives draft outputs, next-best actions, and integration payloads before anything is sent externally.",
      "Approved work is pushed to LinkedIn and Instagram, keeping the source workflow and downstream records aligned."
    ],
    "demoFlow": [
      "Open the dashboard and show the client the incoming content briefs queue.",
      "Select the highest-value sample content brief and explain the before state: manual review, copy/paste, and slow routing.",
      "Click \"Generate content\" to run deterministic AI automation, or enable live OpenAI review if an API key is configured.",
      "Review the score, route, confidence, timeline, and generated outputs with the client.",
      "Click a mock integration button to show exactly what would be sent to LinkedIn, Zapier, Make, n8n, or the client tool stack.",
      "Close with the after state: faster response time, cleaner records, and a human approval lane for sensitive work."
    ],
    "successMetrics": [
      "Manual review steps reduced",
      "Average response time improved",
      "High-priority items routed faster",
      "Records updated consistently",
      "Human approval preserved for risky cases"
    ],
    "clientOffer": "I will replace the demo data and mock adapters with your real LinkedIn, Instagram, X setup, connect the API credentials, tune the routing rules, and deploy the workflow for your team."
  }
};
