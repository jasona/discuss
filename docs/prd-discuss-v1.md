# Product Requirements Document (PRD): Discuss v1

## 1. Introduction / Overview

**Discuss** is a multi-tenant SaaS knowledge base and document collaboration platform hosted at DiscussLabs.com. It is a direct alternative to Atlassian Confluence, designed to be simpler, faster, and significantly more affordable.

Users sign up, create an organization with an auto-provisioned subdomain (`{org}.discusslabs.com`), invite their team, and start writing Markdown-powered documents organized into spaces and nested pages. The product targets small-to-midsize teams, developer teams, and non-technical organizations that need centralized documentation without enterprise complexity.

**Core value proposition:** A clean, modern, Markdown-native knowledge base at a fraction of the cost of Confluence — powerful enough to be useful, simple enough that no admin guide is needed.

**Tech stack:** Next.js (App Router), Supabase (Postgres + Auth + Storage), Stripe, Tiptap editor, ShadCN UI, Tailwind CSS, deployed on Vercel.

**Reference:** This PRD is informed by [rsd-discuss-v1.md](/docs/rsd-discuss-v1.md).

---

## 2. Goals

| # | Goal | Measure |
|---|---|---|
| G1 | Users can go from sign-up to published document in under 5 minutes | Time-to-first-document metric |
| G2 | Team invitations and permissions are intuitive without documentation | Zero support tickets related to "how do I invite someone" |
| G3 | Price significantly below Confluence and competitors | Starter at $4/user/mo, Pro at $8/user/mo |
| G4 | Editor experience feels native and fast | Editor load time < 500ms; no perceptible lag while typing |
| G5 | Multi-tenant data is fully isolated | Zero cross-tenant data leaks; RLS coverage on 100% of tenant tables |
| G6 | Ship MVP to production | Functional product available at DiscussLabs.com |

---

## 3. User Stories

### 3.1 Authentication & Onboarding

| ID | Story |
|---|---|
| US-1 | As a new user, I can sign up with email/password, Google, or GitHub so that I can get started quickly with my preferred method. |
| US-2 | As a new user, after signing up I am prompted to create an organization and choose a subdomain (e.g., `myteam.discusslabs.com`) so that my team has its own workspace. |
| US-3 | As a new user, I can see a brief onboarding flow (create org → invite team → create first doc) so that I understand how to use the product immediately. |
| US-4 | As a returning user, I can sign in and be routed to my organization's subdomain automatically. |
| US-5 | As a user who belongs to multiple organizations, I can switch between them from a menu. |

### 3.2 Organization & Team Management

| ID | Story |
|---|---|
| US-6 | As an org Owner, I can invite users by email so that my team can access our workspace. |
| US-7 | As an org Owner or Admin, I can assign roles (Admin, Editor, Viewer) to members at the space level so that I can control who can do what in each area. |
| US-8 | As an org Owner, I can remove members from the organization. |
| US-9 | As an org Owner, I can transfer ownership to another member. |
| US-10 | As an org Admin, I can manage org settings (org name, subdomain display name, default permissions for new spaces). |

### 3.3 Spaces & Document Organization

| ID | Story |
|---|---|
| US-11 | As an Editor or Admin, I can create a space (e.g., "Engineering", "HR", "Product") to group related documents. |
| US-12 | As an Editor or Admin, I can create pages within a space, and nest sub-pages under existing pages, so that I can build a structured document hierarchy. |
| US-13 | As any user with access, I can see a sidebar tree showing all spaces and their nested page structure so that I can navigate easily. |
| US-14 | As an Editor or Admin, I can reorder pages within a space and move pages between spaces via drag-and-drop. |
| US-15 | As an Editor or Admin, I can rename, archive, or delete pages and spaces. |
| US-16 | As any user, I can use breadcrumb navigation to understand where I am in the document hierarchy. |

### 3.4 Document Editing & Viewing

| ID | Story |
|---|---|
| US-17 | As an Editor, I can create and edit documents using a rich text editor that supports Markdown shortcuts (e.g., typing `##` creates a heading, `- ` creates a list). |
| US-18 | As an Editor, I can toggle between rich text (WYSIWYG) mode and raw Markdown source mode. |
| US-19 | As an Editor, I can insert images (upload or paste), code blocks with syntax highlighting, tables, blockquotes, and links into documents. |
| US-20 | As an Editor, I can export a document as a `.md` Markdown file. |
| US-21 | As an Editor, I can import a `.md` file to create a new document. |
| US-22 | As a Viewer, I can read documents in a clean, rendered view without seeing the editing interface. |
| US-23 | As any user, I can see who last edited a document and when. |

### 3.5 Commenting

| ID | Story |
|---|---|
| US-24 | As any user with access, I can leave a comment on a document in a threaded discussion section below/beside the content. |
| US-25 | As any user, I can reply to an existing comment to create a thread. |
| US-26 | As the comment author or an Admin, I can edit or delete a comment. |
| US-27 | As any user, I can @mention another org member in a comment, and they receive a notification. |

### 3.6 Sharing

| ID | Story |
|---|---|
| US-28 | As an Editor or Admin, I can share a document internally by ensuring the appropriate space-level permissions are set (users with space access can view/edit based on their role). |
| US-29 | As an Admin, I can enable external sharing on a per-document basis, generating a unique public link that anyone on the internet can view without signing in. |
| US-30 | As an Admin, I can disable external sharing for a document, immediately revoking access via the public link. |
| US-31 | As an external visitor, I can view a publicly shared document in a clean read-only view without signing up or signing in. |

### 3.7 Search

| ID | Story |
|---|---|
| US-32 | As any user, I can search across all documents I have access to within my org using a Cmd+K / Ctrl+K command palette. |
| US-33 | As any user, search results show the document title, a content snippet with the match highlighted, and the space it belongs to. |
| US-34 | As any user, I can filter search results by space. |

### 3.8 Admin & Billing

| ID | Story |
|---|---|
| US-35 | As an org Owner, I can access a billing settings page to view my current plan, usage, and payment method. |
| US-36 | As an org Owner, I can subscribe to a plan (Free, Starter, Pro) via Stripe Checkout. |
| US-37 | As an org Owner, I can upgrade, downgrade, or cancel my subscription via the Stripe Customer Portal. |
| US-38 | As an org Owner, I can see how many seats (users) are being used and what the next billing amount will be. |
| US-39 | As the system, I enforce plan limits (e.g., Free plan: max 5 users, limited storage) and prompt the Owner to upgrade when limits are approached. |

### 3.9 Notifications

| ID | Story |
|---|---|
| US-40 | As a user, I receive an in-app notification when I am @mentioned in a comment. |
| US-41 | As a user, I receive an email notification when I am invited to an organization. |
| US-42 | As a user, I can view my notifications in a notification dropdown/panel. |

---

## 4. Functional Requirements

### 4.1 Authentication & Multi-Tenancy

| # | Requirement |
|---|---|
| FR-1 | The system must support sign-up and sign-in via email/password, Google OAuth, and GitHub OAuth using Supabase Auth. |
| FR-2 | On first sign-up, the system must prompt the user to create an organization or join an existing one (via invitation). |
| FR-3 | Each organization must have a unique subdomain: `{slug}.discusslabs.com`. The slug must be 3–40 characters, lowercase alphanumeric and hyphens only, and validated for uniqueness. |
| FR-4 | Next.js Edge Middleware must intercept all requests, extract the subdomain from the Host header, and route to the appropriate tenant context. |
| FR-5 | All tenant data must include an `org_id` column. Supabase RLS policies must enforce that users can only access data for organizations they belong to. |
| FR-6 | The `org_id` must be stored as a custom claim in the user's JWT, set during authentication via Supabase Auth hooks. |
| FR-7 | Users may belong to multiple organizations. The system must support org switching via a UI selector that updates the active JWT claim and redirects to the selected org's subdomain. |
| FR-8 | A root domain route (`discusslabs.com/login`, `discusslabs.com/signup`) must handle authentication before any org subdomain is active. After auth, redirect to the user's default org subdomain. |

### 4.2 Organization & Members

| # | Requirement |
|---|---|
| FR-9 | The system must support four roles: **Owner** (one per org, full control), **Admin** (manage members and settings), **Editor** (create/edit content), **Viewer** (read-only). |
| FR-10 | Roles must be assigned at the **space level**. When a user is invited to an org, they are given a default org-wide role. Space-level role assignments override the org-wide default. |
| FR-11 | The Owner can invite users by email. The system must send an invitation email with a unique link. If the invitee does not have an account, the link leads to sign-up, then auto-joins the org. |
| FR-12 | The system must maintain a members list page showing all org members, their roles, and join date. Owners and Admins can modify roles or remove members. |
| FR-13 | The Owner role can be transferred to another Admin. There must always be exactly one Owner per org. |

### 4.3 Spaces & Page Hierarchy

| # | Requirement |
|---|---|
| FR-14 | A **space** is a top-level organizational container (e.g., "Engineering", "HR"). Spaces have a name, optional description, optional icon/emoji, and their own permission settings. |
| FR-15 | Within a space, documents are organized as **pages**. Pages can be nested: a page can have child sub-pages, forming a tree structure. There is no hard limit on nesting depth, but the UI should encourage a practical limit of ~4 levels. |
| FR-16 | The sidebar must display a collapsible tree view of all spaces and their page hierarchies. Spaces the user does not have access to must not be visible. |
| FR-17 | Pages must be reorderable within their parent via drag-and-drop. Pages must be movable between spaces (respecting permissions). |
| FR-18 | Deleting a space must prompt for confirmation and archive all contained pages. Deleting a page must prompt for confirmation and recursively archive all sub-pages. Archived items are soft-deleted and can be restored by an Admin within 30 days. |
| FR-19 | Each space must have configurable default permissions. When a new user is added to the org, their access to each space is determined by the space's default role setting (which can be "No access", "Viewer", "Editor"). Admins can override per-user. |

### 4.4 Document Editor

| # | Requirement |
|---|---|
| FR-20 | The editor must be built on **Tiptap** with ShadCN UI toolbar components. It must provide a WYSIWYG editing experience with Markdown keyboard shortcuts (e.g., `# ` for H1, `**text**` for bold, `- ` for list). |
| FR-21 | The editor must support: headings (H1–H4), bold, italic, strikethrough, inline code, code blocks (with syntax highlighting via language selector), blockquotes, ordered/unordered lists, task lists (checkboxes), tables, horizontal rules, links, and images. |
| FR-22 | The editor must include a **source mode toggle** that switches to a raw Markdown text editor. Changes in source mode must sync back to the WYSIWYG view and vice versa. |
| FR-23 | Images must be uploadable via file picker, drag-and-drop, or paste. Images must be stored in Supabase Storage, scoped to the org. |
| FR-24 | The editor must support **Markdown export** (download current document as `.md` file) and **Markdown import** (upload a `.md` file to create a new page or replace current page content). |
| FR-25 | The editor toolbar must be clean and minimal by default, with less-used formatting options in a "more" overflow menu. The toolbar must not feel cluttered. |
| FR-26 | Documents must auto-save periodically (every 5 seconds of inactivity after a change) and show a save status indicator ("Saved", "Saving...", "Unsaved changes"). |
| FR-27 | Each document must store: title, content (as JSON for Tiptap + Markdown string for export), `created_by`, `updated_by`, `created_at`, `updated_at`, `org_id`, `space_id`, `parent_page_id` (nullable), `sort_order`, `is_archived`, `is_externally_shared`, `external_share_slug`. |

### 4.5 Commenting

| # | Requirement |
|---|---|
| FR-28 | Each document must have a **comments section** (displayed as a sidebar panel or below-document section, togglable). Comments are document-level (not inline on text selections). |
| FR-29 | Comments must support threaded replies (one level of nesting: top-level comment → replies). |
| FR-30 | Comments must support basic formatting: bold, italic, inline code, and links. |
| FR-31 | Comments must support @mentions of org members. Typing `@` must trigger an autocomplete dropdown of org members. |
| FR-32 | Comment authors and Admins can edit or delete comments. Deleted comments show "[deleted]" if they have replies; otherwise they are fully removed. |
| FR-33 | @mentions must trigger an in-app notification for the mentioned user (see Notifications section). |

### 4.6 Sharing

| # | Requirement |
|---|---|
| FR-34 | All documents are **internal by default** — only org members with the appropriate space-level role can view or edit them. |
| FR-35 | Admins can toggle **external sharing** on a per-document basis. When enabled, the system generates a unique, unguessable URL: `{org}.discusslabs.com/public/{share-slug}`. |
| FR-36 | The public view must render the document in read-only mode with no editing UI, no sidebar, and no comments visible. It must include a "Powered by Discuss" footer link. |
| FR-37 | Disabling external sharing must immediately invalidate the public link. Re-enabling generates a new slug. |
| FR-38 | On Pro and Enterprise plans, external sharing is fully available. On Starter plans, external sharing is limited to 5 documents. On the Free plan, external sharing is not available. |

### 4.7 Search

| # | Requirement |
|---|---|
| FR-39 | The system must provide full-text search across all documents the user has access to within their org. Search must use Supabase's built-in full-text search (tsvector/tsquery on Postgres). |
| FR-40 | Search must be accessible via a **Cmd+K / Ctrl+K** command palette (ShadCN Command component). |
| FR-41 | Search results must display: document title, space name, content snippet with highlighted match, and last updated date. Results must be ranked by relevance. |
| FR-42 | The command palette must also support quick navigation: typing a space or page name should surface it for direct navigation. |
| FR-43 | Search must be scoped to the user's current org. Users must never see results from other orgs. |

### 4.8 Billing & Subscriptions

| # | Requirement |
|---|---|
| FR-44 | The system must integrate with **Stripe** for subscription billing. Plans: Free, Starter ($4/user/mo), Pro ($8/user/mo), Enterprise (custom/contact). |
| FR-45 | Subscription creation must use **Stripe Checkout Sessions**. Plan management (upgrade, downgrade, cancel, update payment) must use the **Stripe Customer Portal**. |
| FR-46 | Stripe webhook events must sync to Supabase: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. |
| FR-47 | The system must store subscription status, plan type, current period start/end, and seat count in a `subscriptions` table linked to `org_id`. |
| FR-48 | Plan limits must be enforced server-side: |

| Plan | Max Users | Max Spaces | Storage | External Sharing |
|---|---|---|---|---|
| **Free** | 5 | 3 | 100 MB | Not available |
| **Starter** | 50 | Unlimited | 5 GB | 5 documents |
| **Pro** | Unlimited | Unlimited | 50 GB | Unlimited |
| **Enterprise** | Unlimited | Unlimited | Custom | Unlimited |

| # | Requirement (continued) |
|---|---|
| FR-49 | When an org approaches a plan limit (80% usage), the system must display a banner to the Owner/Admin prompting an upgrade. When a limit is reached, the system must prevent the action (e.g., cannot invite more users) and display a clear upgrade prompt. |
| FR-50 | The billing settings page must show: current plan, number of seats used, storage used, next billing date, and payment method (last 4 digits). |

### 4.9 Notifications

| # | Requirement |
|---|---|
| FR-51 | The system must support **in-app notifications** displayed via a bell icon in the top navigation bar with an unread count badge. |
| FR-52 | Notification triggers: @mention in a comment, invitation to an org, reply to your comment. |
| FR-53 | Clicking a notification must navigate the user to the relevant document/comment. |
| FR-54 | **Email notifications** must be sent for: org invitations. Other email notifications (comment mentions, replies) are a stretch goal. |
| FR-55 | Users must be able to mark notifications as read (individually or "mark all as read"). |

### 4.10 UI & Layout

| # | Requirement |
|---|---|
| FR-56 | The app layout must follow a **sidebar + main content** pattern. The sidebar contains: org switcher, space/page tree, search trigger, and user menu. The main area contains the page editor/viewer and comments. |
| FR-57 | The sidebar must be **collapsible** (toggle to icon-only mode or fully hidden on mobile). |
| FR-58 | The app must support **dark mode** and **light mode** with a toggle in the user menu. User preference must be persisted. |
| FR-59 | The UI must be **responsive**: desktop-first design, but usable on tablet. Mobile is view-only (editing on mobile is out of scope for MVP). |
| FR-60 | All interactive elements must meet **WCAG 2.1 AA** accessibility standards. ShadCN defaults should be maintained and extended where needed. |
| FR-61 | Page transitions and editor interactions must feel fast. Target: initial page load < 2s, navigation between pages < 500ms, editor ready < 500ms. |

---

## 5. Non-Goals (Out of Scope for MVP)

The following are explicitly **not** included in this version. They may be considered for future releases:

- **Real-time collaborative editing** — multiple users editing the same document simultaneously (requires Yjs/Tiptap Cloud)
- **Document version history / diffing** — viewing or restoring previous versions of a document
- **Inline/highlight comments** — selecting text and attaching comments to specific passages
- **Custom domains** — allowing orgs to use their own domain (e.g., `docs.acme.com`) instead of a DiscussLabs subdomain
- **API access** — public REST or GraphQL API for programmatic document management
- **Webhooks / integrations** — Slack, Discord, Zapier, or other third-party integrations
- **Templates library** — pre-built document templates (meeting notes, RFCs, etc.)
- **SSO / SAML** — enterprise single sign-on (planned for Enterprise tier)
- **AI-powered features** — AI search, summarization, or writing assistance
- **Mobile apps** — native iOS or Android applications
- **Marketing site** — the `discusslabs.com` marketing/landing page is a separate project and codebase
- **Audit logs** — detailed activity logging for compliance (planned for Enterprise tier)
- **Import from Confluence/Notion** — migration tools for other platforms
- **Emoji reactions on comments**
- **Document pinning or favoriting**

---

## 6. Design Considerations

### 6.1 UI Framework
- **ShadCN UI** components as the foundation — copied into the codebase for full ownership
- **Tailwind CSS** for all styling — utility-first, consistent spacing/color tokens
- Dark mode via Tailwind's `dark:` variant and a `ThemeProvider`

### 6.2 Key UI Components

| Area | Component / Pattern |
|---|---|
| **Sidebar** | Collapsible tree view (ShadCN Sidebar + custom tree) |
| **Command palette** | ShadCN Command (Cmd+K) for search and navigation |
| **Editor toolbar** | Custom toolbar using ShadCN Button, Toggle, DropdownMenu |
| **Comments** | ShadCN Card-based thread layout with Avatar, Textarea |
| **Sharing dialog** | ShadCN Dialog with toggle switch for external sharing, copy-link button |
| **Notifications** | ShadCN Popover with notification list, badge counter |
| **Billing** | Settings page with ShadCN Table, Badge for plan status |
| **Breadcrumbs** | ShadCN Breadcrumb component |
| **Toasts** | ShadCN Toast/Sonner for save status, success/error feedback |

### 6.3 Design Principles
1. **Less is more** — every UI element must earn its place. When in doubt, leave it out.
2. **Content first** — the document should dominate the viewport. Chrome should be minimal.
3. **Immediate feedback** — all actions should feel instant (optimistic UI, loading states).
4. **Consistent patterns** — same interaction patterns everywhere (e.g., all destructive actions use a confirmation dialog).

---

## 7. Technical Considerations

### 7.1 Architecture

```
┌─────────────────────────────────────────────────┐
│  Vercel (Hosting + Edge Middleware)              │
│  ┌───────────────────────────────────────────┐   │
│  │  Next.js App Router                       │   │
│  │  ├── Middleware (subdomain routing)        │   │
│  │  ├── /app/(auth) — login, signup          │   │
│  │  ├── /app/(dashboard) — main app shell    │   │
│  │  ├── /app/public/[slug] — public shares   │   │
│  │  └── /app/api — webhooks, server actions  │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐  ┌───────────┐  ┌──────────┐
   │ Supabase │  │  Supabase │  │  Stripe  │
   │   Auth   │  │  Postgres │  │ Billing  │
   │  + JWT   │  │  + RLS    │  │          │
   └──────────┘  │  + Storage│  └──────────┘
                 └───────────┘
```

### 7.2 Key Technical Decisions

| Decision | Choice | Notes |
|---|---|---|
| **Framework** | Next.js (App Router) | Server Components, Server Actions, Edge Middleware |
| **Database** | Supabase (Postgres) | RLS for multi-tenancy, full-text search |
| **Auth** | Supabase Auth | Email/password + Google + GitHub OAuth providers |
| **Storage** | Supabase Storage | Image uploads, scoped per org via storage policies |
| **Editor** | Tiptap (MIT core) | Headless; UI via ShadCN components |
| **Billing** | Stripe | Checkout Sessions + Customer Portal + Webhooks |
| **Hosting** | Vercel | Wildcard subdomains, Edge Middleware, automatic SSL |
| **UI** | ShadCN + Tailwind | Copied components, full control |

### 7.3 Database Schema (Core Tables)

```
organizations
  id (uuid, PK)
  name (text)
  slug (text, unique) — subdomain
  owner_id (uuid, FK → users)
  stripe_customer_id (text)
  created_at (timestamptz)

org_members
  id (uuid, PK)
  org_id (uuid, FK → organizations)
  user_id (uuid, FK → auth.users)
  default_role (enum: owner, admin, editor, viewer)
  joined_at (timestamptz)

spaces
  id (uuid, PK)
  org_id (uuid, FK → organizations)
  name (text)
  description (text, nullable)
  icon (text, nullable)
  default_role (enum: none, viewer, editor)
  sort_order (integer)
  is_archived (boolean)
  created_by (uuid, FK → auth.users)
  created_at (timestamptz)

space_members
  id (uuid, PK)
  space_id (uuid, FK → spaces)
  user_id (uuid, FK → auth.users)
  role (enum: admin, editor, viewer)

pages
  id (uuid, PK)
  org_id (uuid, FK → organizations)
  space_id (uuid, FK → spaces)
  parent_page_id (uuid, FK → pages, nullable)
  title (text)
  content_json (jsonb) — Tiptap document
  content_markdown (text) — rendered Markdown for export/search
  content_tsvector (tsvector) — full-text search index
  created_by (uuid, FK → auth.users)
  updated_by (uuid, FK → auth.users)
  sort_order (integer)
  is_archived (boolean)
  is_externally_shared (boolean, default false)
  external_share_slug (text, unique, nullable)
  created_at (timestamptz)
  updated_at (timestamptz)

comments
  id (uuid, PK)
  page_id (uuid, FK → pages)
  org_id (uuid, FK → organizations)
  parent_comment_id (uuid, FK → comments, nullable)
  author_id (uuid, FK → auth.users)
  content (text) — supports basic markdown
  is_deleted (boolean, default false)
  created_at (timestamptz)
  updated_at (timestamptz)

notifications
  id (uuid, PK)
  user_id (uuid, FK → auth.users)
  org_id (uuid, FK → organizations)
  type (enum: mention, invitation, reply)
  reference_id (uuid) — comment or invitation ID
  page_id (uuid, FK → pages, nullable)
  message (text)
  is_read (boolean, default false)
  created_at (timestamptz)

subscriptions
  id (uuid, PK)
  org_id (uuid, FK → organizations)
  stripe_subscription_id (text)
  stripe_price_id (text)
  plan (enum: free, starter, pro, enterprise)
  status (enum: active, past_due, canceled, trialing)
  current_period_start (timestamptz)
  current_period_end (timestamptz)
  seat_count (integer)
  created_at (timestamptz)
  updated_at (timestamptz)

invitations
  id (uuid, PK)
  org_id (uuid, FK → organizations)
  email (text)
  invited_by (uuid, FK → auth.users)
  default_role (enum: admin, editor, viewer)
  token (text, unique)
  accepted_at (timestamptz, nullable)
  expires_at (timestamptz)
  created_at (timestamptz)
```

### 7.4 Key RLS Patterns

- **All tables with `org_id`**: policy checks `auth.jwt() -> 'org_id' = org_id`
- **Space access**: join through `space_members` or fall back to `spaces.default_role`
- **Pages**: access derived from parent space permissions
- **Public pages**: `is_externally_shared = true` allows anonymous `SELECT` via `external_share_slug`
- **Comments**: access follows page access

### 7.5 Dependencies

| Package | Purpose |
|---|---|
| `next` | Framework |
| `@supabase/supabase-js` | Supabase client |
| `@supabase/ssr` | Server-side Supabase auth helpers |
| `@tiptap/react` + extensions | Editor |
| `stripe` | Stripe Node.js SDK |
| `tailwindcss` | Styling |
| ShadCN components (copied) | UI components |

---

## 8. Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| **Time to first document** | < 5 minutes from sign-up | Track timestamp from account creation to first page save |
| **Editor performance** | < 500ms load, no typing lag | Lighthouse, real user monitoring |
| **Page load speed** | < 2s initial, < 500ms navigation | Vercel Analytics |
| **Data isolation** | Zero cross-tenant leaks | Automated RLS tests, security audit |
| **Uptime** | 99.9% | Vercel + Supabase status monitoring |
| **Conversion (Free → Paid)** | > 5% within 30 days | Stripe + analytics |
| **Churn rate** | < 5% monthly | Stripe subscription data |
| **Support tickets (permissions/invites)** | < 2% of active orgs | Support ticket tracking |

---

## 9. Open Questions

| # | Question | Impact |
|---|---|---|
| OQ-1 | Should archived pages count toward the storage limit on Free/Starter plans? | Affects plan enforcement logic |
| OQ-2 | What happens to an org's data if their subscription lapses? Grace period? Read-only mode? | Affects subscription lifecycle handling |
| OQ-3 | Should the Free plan have a document count limit in addition to user/space/storage limits? | Affects plan tier differentiation |
| OQ-4 | How should org slug changes be handled (if allowed)? Redirect from old subdomain? | Affects DNS/routing complexity |
| OQ-5 | Should email notifications for comment mentions be included in MVP or deferred? | Affects scope — email infrastructure needed |
| OQ-6 | What is the maximum document size (content length) allowed? | Affects editor performance and storage costs |
| OQ-7 | Should there be a "Getting Started" or sample space pre-populated for new orgs? | Affects onboarding experience |
