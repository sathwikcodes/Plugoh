# Graph Report - app  (2026-04-11)

## Corpus Check
- 189 files · ~69,055 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 284 nodes · 330 edges · 31 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `upsertCommonProfile()` - 4 edges
2. `GET()` - 3 edges
3. `upsertBusinessProfile()` - 3 edges
4. `handleBusinessContinue()` - 3 edges
5. `handleBusinessInstagramConnect()` - 3 edges
6. `handleToggleActive()` - 2 edges
7. `handleToggle()` - 2 edges
8. `daysRemaining()` - 2 edges
9. `InfluencerCampaignDetail()` - 2 edges
10. `handleCancel()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `errorRedirect()`  [EXTRACTED]
  app/api/cron/auto-release/route.ts → app/api/auth/callback/instagram/route.ts
- `GET()` --calls--> `syncInstagramMedia()`  [EXTRACTED]
  app/api/cron/auto-release/route.ts → app/api/auth/callback/instagram/route.ts

## Communities

### Community 0 - "Dashboard/business Flow"
Cohesion: 0.04
Nodes (9): daysRemaining(), handleBusinessContinue(), handleBusinessInstagramConnect(), handleInfluencerSubmit(), InfluencerCampaignDetail(), LegacyBookRedirect(), normalizePackage(), upsertBusinessProfile() (+1 more)

### Community 1 - "Dashboard/influencer Flow"
Cohesion: 0.05
Nodes (0): 

### Community 2 - "Dashboard/business Flow"
Cohesion: 0.1
Nodes (4): getEngagementLabel(), getEngagementRate(), getPriceLabel(), getStartsAtPrice()

### Community 3 - "Dashboard/business Flow"
Cohesion: 0.11
Nodes (2): handleCancel(), handleSubmitDelivery()

### Community 4 - "Dashboard/business Flow"
Cohesion: 0.13
Nodes (4): getEngagementRate(), getSortValue(), formatPriceShort(), summarizePrice()

### Community 5 - "Dashboard/business Flow"
Cohesion: 0.12
Nodes (0): 

### Community 6 - "Dashboard/business Flow"
Cohesion: 0.22
Nodes (2): getInitialPackage(), useBookingForm()

### Community 7 - "Dashboard/business Flow"
Cohesion: 0.18
Nodes (0): 

### Community 8 - "Dashboard/influencer Flow"
Cohesion: 0.22
Nodes (0): 

### Community 9 - "App Flow"
Cohesion: 0.29
Nodes (0): 

### Community 10 - "Dashboard/influencer Flow"
Cohesion: 0.29
Nodes (0): 

### Community 11 - "(landing)/ Components Flow"
Cohesion: 0.29
Nodes (0): 

### Community 12 - "(auth)/layout.tsx Flow"
Cohesion: 0.33
Nodes (0): 

### Community 13 - "Api/cron Flow"
Cohesion: 0.47
Nodes (3): errorRedirect(), GET(), syncInstagramMedia()

### Community 14 - "Dashboard/business Flow"
Cohesion: 0.5
Nodes (2): handleToggle(), handleToggleActive()

### Community 15 - "(landing)/ Components Flow"
Cohesion: 0.4
Nodes (0): 

### Community 16 - "(landing)/ Components Flow"
Cohesion: 0.5
Nodes (0): 

### Community 17 - "Dashboard/not Found.tsx Flow"
Cohesion: 0.67
Nodes (0): 

### Community 18 - "(landing)/ Components Flow"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Dashboard/influencer Flow"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Dashboard/business Flow"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Dashboard/influencer Flow"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "(landing)/ Components Flow"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Dashboard/influencer Flow"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Dashboard/business Flow"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Dashboard/influencer Flow"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Dashboard/business Flow"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Dashboard/business Flow"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Dashboard/business Flow"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "(landing)/ Components Flow"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "(landing)/ Components Flow"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Dashboard/influencer Flow`** (2 nodes): `social-proof.tsx`, `SocialProof()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard/business Flow`** (2 nodes): `quick-actions.tsx`, `QuickActions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard/influencer Flow`** (2 nodes): `pulse-stats.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `(landing)/ Components Flow`** (2 nodes): `features-alt-section.tsx`, `Features()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard/influencer Flow`** (1 nodes): `top-content.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard/business Flow`** (1 nodes): `recent-activity.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard/influencer Flow`** (1 nodes): `creator-insights.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard/business Flow`** (1 nodes): `analytics-spend-chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard/business Flow`** (1 nodes): `spend-stats.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard/business Flow`** (1 nodes): `brand-insights.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `(landing)/ Components Flow`** (1 nodes): `footer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `(landing)/ Components Flow`** (1 nodes): `features-primary-section.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Dashboard/business Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Dashboard/influencer Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Dashboard/business Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Dashboard/business Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Dashboard/business Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Dashboard/business Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._