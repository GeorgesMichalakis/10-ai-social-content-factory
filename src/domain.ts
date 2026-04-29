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
  ]
};
