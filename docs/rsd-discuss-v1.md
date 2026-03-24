# Research Summary Document (RSD): Discuss v1

## 1. Project Overview

- **User brief:** Build "Discuss," a Confluence alternative hosted at DiscussLabs.com. Multi-tenant SaaS with custom subdomains, user invitations, role-based permissions (read/write/view), Markdown document creation/viewing, document organization, commenting, internal/external sharing, admin controls, and billing. Product should be powerful yet simple — not clunky. Pricing should significantly undercut Atlassian.
- **Project type(s):** Product + Design
- **Research depth:** Moderate
- **Primary research focus:** Both internal and external equally
- **Tech stack:** Node.js, ShadCN UI, Tailwind CSS, Supabase
- **Priority:** Time-to-market / delivery speed

---

## 2. Existing Context & Assets (Internal)

### 2.1 Related Requirements & Docs
- No existing PRDs, CRDs, DRDs, or documentation found in `/docs`.
- This is a greenfield project — no prior implementation exists.

### 2.2 Codebase / System Context
- The repository is empty (no source code, no configuration files).
- No existing services, modules, or components to build upon.
- No technical debt or legacy constraints.

---

## 3. User & Business Context

### 3.1 Target Users / Audience

| Segment | Description |
|---|---|
| **Small teams (2–20)** | Startups, agencies, freelance teams needing a shared knowledge base without enterprise overhead |
| **Mid-size orgs (20–200)** | Companies outgrowing Google Docs/Notion for structured documentation |
| **Non-technical teams** | Marketing, HR, ops teams who find Confluence intimidating |
| **Developer teams** | Teams wanting Markdown-native documentation with minimal friction |
| **Open-source / community groups** | Organizations that need lightweight, affordable collaboration docs |

### 3.2 User Goals & Pain Points

**Pain points with Confluence and alternatives:**
- Confluence is expensive at scale ($5.25–$11.75+/user/month) and complex to administer
- Confluence's editor is clunky — not Markdown-native
- Notion is flexible but overwhelming; becomes a "Swiss Army knife" people misuse
- GitBook is too developer-focused and lacks wiki-style linking
- Most tools add AI features that inflate pricing without clear value

**User goals:**
- Simple sign-up → subdomain → invite team → start writing
- Clean Markdown editing without fighting a WYSIWYG toolbar
- Clear document organization (folders, tags, or spaces)
- Easy sharing: internal by default, external when needed
- Transparent, affordable pricing

### 3.3 Business Goals
- Build a revenue-generating SaaS product
- Capture market share from teams priced out of or frustrated by Confluence
- Establish DiscussLabs.com as a credible, focused alternative
- Achieve sustainable growth through competitive pricing and word-of-mouth
- Keep operational costs low by leveraging Supabase (managed infra)

### 3.4 Success Signals
- Users can go from sign-up to first published document in under 5 minutes
- Team invitations and permissions are intuitive (no admin guide needed)
- Low churn relative to competitors
- Positive comparisons in "Confluence alternatives" review articles

---

## 4. External Research: Best Practices & References

### 4.1 Competitor Landscape & Pricing

| Product | Free Tier | Entry Paid | Mid Tier | Enterprise |
|---|---|---|---|---|
| **Confluence** | 10 users | $5.25/user/mo | $11.75/user/mo (Premium) | ~$23.50/user/mo |
| **Notion** | Limited | $10/user/mo (Plus) | $20/user/mo (Business) | Custom |
| **Slite** | Limited | $10/user/mo | — | Custom |
| **Nuclino** | Limited | $6/user/mo | $12.50/user/mo | — |
| **GitBook** | Limited | $10/user/mo | $18/user/mo | Custom |

**Discuss pricing opportunity:** The $3–5/user/month range is wide open. Nuclino at $6 is the current low-cost leader among credible options. Pricing Discuss at **$4/user/month (Starter)** and **$8/user/month (Pro)** would be genuinely disruptive while leaving healthy margins on Supabase infrastructure.

**Suggested pricing model:**

| Plan | Price | Target |
|---|---|---|
| **Free** | $0 (up to 5 users, limited docs) | Individuals, evaluation |
| **Starter** | $4/user/month | Small teams, basic needs |
| **Pro** | $8/user/month | Growing teams, advanced permissions, external sharing |
| **Enterprise** | Custom | SSO, audit logs, dedicated support |

### 4.2 Multi-Tenant Architecture (Supabase + Next.js)

**Subdomain-based multi-tenancy pattern:**
- Next.js Edge Middleware intercepts requests, extracts subdomain from Host header
- Middleware rewrites `{tenant}.discusslabs.com/path` → internal `/{tenant}/path` routing
- Wildcard SSL certificate required (e.g., `*.discusslabs.com`)
- Supabase Row Level Security (RLS) enforces data isolation at the database level

**Data isolation strategy:**
- All tenant data in shared tables with `org_id` column
- RLS policies match `org_id` against JWT custom claims
- Custom claims set during auth (Supabase Auth hooks or Edge Functions)
- Index all columns used in RLS policies for performance

**Proven pattern:** The Next.js + Supabase + subdomain multi-tenancy pattern is well-established with multiple production-ready templates and reference implementations available (supastarter.dev, Vercel templates).

### 4.3 Markdown Editor Ecosystem

**Recommended: Tiptap + ShadCN UI**

Tiptap is the strongest choice for Discuss because:
- **Headless architecture** — full control over UI, pairs naturally with ShadCN components
- **Markdown support** — can import/export Markdown while providing WYSIWYG editing
- **Collaborative editing** — built-in Yjs integration for real-time collaboration (future feature)
- **Extension system** — tables, code blocks, images, mentions, comments
- **Production-ready ShadCN integrations** exist (hunghg255/reactjs-tiptap-editor, shadcn-tiptap-editor)

**Editor feature priority for MVP:**
1. Rich text editing with Markdown shortcuts
2. Markdown source toggle
3. Images, code blocks, tables
4. @mentions (for comments)
5. Export as Markdown

**Deferred:** Real-time collaborative editing (requires Tiptap Cloud or self-hosted Yjs server — adds complexity and cost)

### 4.4 Billing & Subscription (Stripe + Supabase)

**Established pattern:**
- Stripe Checkout Sessions for subscription creation
- Stripe Customer Portal for self-service management
- Webhook sync to Supabase: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Subscription status stored in Supabase, gated via RLS
- Multiple production-ready starter kits exist (next-supabase-stripe-starter, Vercel's subscription-starter)

**Key webhooks to handle:**
- Product/price sync from Stripe → Supabase `products` and `prices` tables
- Subscription lifecycle events → `subscriptions` table
- Access control derived from active subscription status

### 4.5 Design Patterns (ShadCN + Tailwind)

**ShadCN UI approach:**
- Copy components into codebase (not a dependency — full ownership)
- Tailwind tokens for color, spacing, typography — easy theming
- Composable component interface for consistency
- Strong accessibility defaults (semantic HTML, ARIA)

**Key UI patterns for a docs product:**
- Sidebar navigation (collapsible tree for document hierarchy)
- Command palette (Cmd+K for search/navigation)
- Split view (sidebar + editor/viewer)
- Breadcrumb navigation for document context
- Comment thread UI (inline or sidebar)
- Permission badges and sharing dialogs

### 4.6 Standards & Compliance
- **GDPR:** Required for EU users — data deletion, export, consent
- **SOC 2:** Expected by mid-size+ customers; Supabase is SOC 2 compliant, which helps
- **WCAG 2.1 AA:** ShadCN has good accessibility defaults; maintain this standard
- **Data residency:** Supabase supports region selection — document this for enterprise customers

---

## 5. Constraints, Risks, and Dependencies

### 5.1 Constraints

| Category | Constraint |
|---|---|
| **Technical** | Supabase free tier limits (500MB DB, 1GB storage, 50k monthly active users). Production will need Pro plan ($25/month base). |
| **Technical** | Wildcard SSL for subdomains requires specific DNS and hosting setup (Vercel supports this natively). |
| **Technical** | Tiptap collaborative editing (real-time) requires Tiptap Cloud ($) or self-hosted Yjs — adds significant complexity. |
| **Organizational** | Solo/small team — prioritize time-to-market over feature completeness. |
| **Financial** | Low pricing strategy means volume is needed for revenue; infrastructure costs must stay lean. |

### 5.2 Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Markdown editor quality** | High — editor is the core product experience | Medium | Use Tiptap (battle-tested); invest in polish early |
| **Multi-tenant data leaks** | Critical — trust-destroying | Low (with RLS) | Strict RLS policies, automated security tests, penetration testing |
| **Supabase vendor lock-in** | Medium — migration would be costly | Low-Medium | Supabase is open-source Postgres; keep queries standard SQL |
| **Pricing too low for sustainability** | High — could undermine business | Medium | Model unit economics early; ensure $4/user covers infra + margin |
| **Feature creep / complexity** | High — defeats core value proposition | High | Strict MVP scope; say no to features that don't serve document collaboration |
| **SEO/discoverability** | Medium — hard to rank for "Confluence alternative" | Medium | Content marketing, comparison pages, developer community engagement |

### 5.3 Dependencies & Assumptions

**Dependencies:**
- Supabase (auth, database, storage, real-time)
- Stripe (billing, subscription management)
- Vercel or similar (hosting, edge middleware, wildcard subdomains)
- Tiptap (editor framework)
- DNS provider supporting wildcard records

**Assumptions:**
- Supabase RLS is sufficient for multi-tenant isolation (no need for separate schemas/databases per tenant)
- Tiptap's MIT-licensed core provides enough functionality for MVP without Tiptap Cloud
- Vercel's free/Pro tier can handle initial traffic and subdomain routing
- Users will accept Markdown-first editing (not a full Confluence-style page builder)

---

## 6. Opportunities & Ideas

### 6.1 Reuse Opportunities
- **next-supabase-stripe-starter** — production-ready auth + billing scaffold
- **shadcn-tiptap-editor** — pre-built editor with ShadCN integration
- **supastarter.dev** — multi-tenant Next.js + Supabase template
- **ShadCN UI component library** — sidebar, command palette, dialogs, forms

### 6.2 Quick Wins
- Cmd+K command palette for navigation/search (ShadCN has this built-in)
- Dark mode toggle (Tailwind + ShadCN support this trivially)
- Markdown import/export (paste a .md file, get a formatted doc)
- Public sharing via unique link (simple boolean flag + public route)

### 6.3 Differentiation Ideas
- **Simplicity as a feature** — intentionally fewer features than Confluence, marketed as a strength
- **Instant subdomains** — sign up and get `yourteam.discusslabs.com` in seconds
- **Transparent pricing** — no "contact sales" tier until Enterprise; show all pricing publicly
- **Markdown-native** — toggle between rich text and raw Markdown (developers love this)
- **Fast search** — Supabase full-text search; snappy Cmd+K experience
- **Clean, modern UI** — ShadCN/Tailwind aesthetic vs. Confluence's dated look

### 6.4 Future Extensions (Post-MVP)
- Real-time collaborative editing (Tiptap + Yjs)
- API access for programmatic document management
- Webhooks for integrations (Slack, Discord, etc.)
- Templates library (meeting notes, RFCs, onboarding docs)
- Version history / document diffing
- AI-powered search and summarization
- Custom domains (beyond subdomains)
- SSO / SAML for enterprise

---

## 7. Key Findings by Track

### 7.1 Product / Feature Findings
1. **The Next.js + Supabase + Stripe stack is mature** for multi-tenant SaaS — multiple production templates exist, reducing build time significantly.
2. **Supabase RLS with JWT custom claims** is the recommended pattern for tenant data isolation — avoids separate schemas while maintaining security.
3. **Tiptap is the clear editor choice** — headless, extensible, Markdown-capable, with existing ShadCN integrations and a path to collaborative editing.
4. **Stripe webhook sync to Supabase** is a well-documented pattern — subscription gating can be enforced at the database level via RLS.
5. **The $4–8/user/month price point** is viable and significantly undercuts all major competitors while Nuclino ($6) is the only nearby competitor.

### 7.2 Design Findings
1. **ShadCN + Tailwind gives a modern, clean aesthetic** out of the box — critical for differentiating from Confluence's dated UI.
2. **Sidebar + editor split layout** is the established pattern for document tools — users expect it.
3. **Command palette (Cmd+K)** is becoming table stakes for productivity tools — ShadCN provides this component.
4. **Accessibility is built into ShadCN's defaults** — maintain WCAG 2.1 AA compliance from day one.
5. **Dark mode** is expected by developer-oriented users and trivial to implement with Tailwind.

---

## 8. Recommendations for the Create Phase

### 8.1 Recommended Requirements Document(s)
- **Create next:** PRD (Product Requirements Document) — covers both product features and design direction
- **Suggested filename:** `prd-discuss-v1.md`
- **Optional follow-up:** DRD for detailed component/UI specifications once PRD is approved

### 8.2 Scope Recommendations

**MVP scope (must have):**
- Sign-up / sign-in (Supabase Auth — email + OAuth)
- Org creation with auto-provisioned subdomain (`{org}.discusslabs.com`)
- Invite users to org via email
- Role-based permissions (Owner, Admin, Editor, Viewer)
- Create, edit, view documents using Tiptap + Markdown
- Document organization (spaces/folders + nested hierarchy)
- Inline commenting on documents
- Internal document sharing (within org)
- External sharing via public link (toggle per document)
- Full-text search (Supabase)
- Billing & subscription management (Stripe)
- Admin dashboard (manage members, billing, org settings)
- Responsive design (desktop-first, mobile-usable)

**Stretch / Deferred:**
- Real-time collaborative editing
- Document version history / diffing
- Custom domains
- API access
- Templates library
- Webhooks / integrations (Slack, etc.)
- SSO / SAML
- AI-powered features (search, summarization)
- Mobile apps

### 8.3 Key Questions the Requirements Doc Should Answer
1. **Auth flow:** Email + password only for MVP, or include Google/GitHub OAuth from day one?
2. **Document hierarchy:** Flat spaces with folders, or nested spaces → pages → sub-pages?
3. **Permissions granularity:** Per-space, per-document, or both?
4. **External sharing:** Public link only, or also password-protected / expiring links?
5. **Commenting model:** Inline (on text selections) or document-level threads, or both?
6. **Search scope:** Within-org only, or also across user's personal docs?
7. **Free tier limits:** How many docs/users/storage before requiring a paid plan?
8. **Hosting/deployment:** Vercel (easiest for Next.js + subdomains) vs. self-hosted?

### 8.4 Suggested Decisions to Lock In Now

| Decision | Recommendation | Rationale |
|---|---|---|
| **Framework** | Next.js (App Router) | Best DX for the chosen stack; native Vercel deployment; mature multi-tenant patterns |
| **Database + Auth** | Supabase (Postgres + Auth + Storage) | User's choice; strong RLS for multi-tenancy; managed infrastructure |
| **Editor** | Tiptap with ShadCN UI components | Headless, Markdown-native, extensible, existing ShadCN integrations |
| **UI framework** | ShadCN UI + Tailwind CSS | User's choice; modern aesthetic, accessible, composable |
| **Billing** | Stripe | Industry standard; excellent Supabase integration patterns available |
| **Hosting** | Vercel | Native Next.js support, wildcard subdomains, edge middleware, generous free tier |
| **Multi-tenancy** | Shared DB with RLS + JWT custom claims | Proven pattern; simpler than schema-per-tenant; scales well |

---

## 9. Open Questions & Gaps

- **Domain/DNS setup:** Who manages DNS for discusslabs.com? Wildcard CNAME/A record setup needed for subdomains.
- **Tiptap licensing:** Tiptap's core is MIT, but collaborative editing features (Tiptap Cloud) are commercial — clarify what's needed for MVP vs. paid features later.
- **Unit economics modeling:** At $4/user/month, what's the break-even point per org given Supabase Pro ($25/mo), Vercel Pro ($20/mo), and Stripe fees (2.9% + $0.30)?
- **Content limits:** How much storage per org on each plan? Supabase storage pricing will factor in.
- **Compliance timeline:** When does SOC 2 / GDPR compliance need to be formalized vs. just designed-for?
- **Team size:** Is this a solo build or will there be additional developers? Affects architecture decisions (monorepo vs. separate services).
- **Marketing site:** Will discusslabs.com itself be part of this codebase or a separate marketing site?

---

## 10. Sources & References

**Competitor Analysis:**
- [Confluence Alternatives 2026 — eesel.ai](https://www.eesel.ai/blog/confluence-alternatives)
- [Best Confluence Alternatives — Nuclino](https://www.nuclino.com/alternatives/confluence-alternative)
- [Confluence vs Notion Pricing 2026 — Docsie](https://www.docsie.io/blog/articles/confluence-vs-notion-pricing-comparison-2026/)
- [Notion Pricing 2026 — CostBench](https://costbench.com/software/project-management/notion/)
- [Nuclino Review 2026 — SaaS CRM Review](https://saascrmreview.com/nuclino-review/)

**Confluence Pricing:**
- [Confluence Pricing — Atlassian Official](https://www.atlassian.com/software/confluence/pricing)
- [Confluence Pricing 2026 Guide — Softgile](https://softgile.com/en/confluence-pricing-2026/)
- [Confluence Pricing Guide — eesel.ai](https://www.eesel.ai/blog/confluence-pricing)

**Multi-Tenant Architecture:**
- [Next.js Subdomain Multi-Tenancy Discussion](https://github.com/vercel/next.js/discussions/84461)
- [Next.js + Supabase Multi-Tenant Template — supastarter.dev](https://supastarter.dev/nextjs-multi-tenancy-template)
- [Multi-Tenant SaaS with Subdomains in Next.js — Medium](https://medium.com/@theNewGenCoder/build-a-multi-tenant-saas-with-subdomains-in-next-js-6b40910da4cf)
- [Multi-Tenant Supabase Discussion](https://github.com/orgs/supabase/discussions/1615)

**Supabase RLS & Security:**
- [Supabase RLS Guide — DesignRevision](https://designrevision.com/blog/supabase-row-level-security)
- [Multi-Tenant RLS on Supabase — AntStack](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)
- [Supabase Row Level Security — Official Docs](https://supabase.com/features/row-level-security)

**Markdown Editor:**
- [Tiptap + ShadCN Editor — GitHub](https://github.com/hunghg255/reactjs-tiptap-editor)
- [Best ShadCN Tiptap Editors — ShadCN Studio](https://shadcnstudio.com/blog/shadcn-tiptap-editors)
- [MDXEditor — React Markdown Editor](https://mdxeditor.dev/)
- [Top 5 Markdown Editors for React — Strapi](https://strapi.io/blog/top-5-markdown-editors-for-react)

**Billing & Stripe:**
- [SaaS Stripe Integration 2026 — DesignRevision](https://designrevision.com/blog/saas-stripe-integration)
- [Next.js Supabase Stripe Starter — GitHub](https://github.com/KolbySisk/next-supabase-stripe-starter)
- [Stripe Supabase SaaS Starter Kit — Vercel](https://vercel.com/templates/next.js/stripe-supabase-saas-starter-kit)
- [Stripe Wrappers — Supabase Docs](https://supabase.com/docs/guides/database/extensions/wrappers/stripe)

**Design & UI:**
- [ShadCN UI — Official](https://ui.shadcn.com/)
- [ShadCN UI Docs](https://ui.shadcn.com/docs)
- [ShadCN Adoption Guide — LogRocket](https://blog.logrocket.com/shadcn-ui-adoption-guide/)
