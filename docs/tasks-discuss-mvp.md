## Relevant Files

- `package.json` - Project dependencies and scripts
- `next.config.ts` - Next.js configuration (standalone output for Docker)
- `tailwind.config.ts` - Tailwind CSS configuration with ShadCN theme tokens
- `Dockerfile` - Docker build for Coolify deployment
- `.env.local` / `.env.example` - Environment variables (Supabase, Stripe, app URL)
- `middleware.ts` - Multi-tenant subdomain routing middleware
- `middleware.test.ts` - Unit tests for subdomain middleware
- `lib/supabase/client.ts` - Supabase browser client factory
- `lib/supabase/server.ts` - Supabase server client factory (cookies-based)
- `lib/supabase/admin.ts` - Supabase admin/service-role client
- `lib/supabase/types.ts` - Generated Supabase database types
- `lib/stripe/client.ts` - Stripe client initialization
- `lib/stripe/webhooks.ts` - Stripe webhook handler logic
- `lib/constants.ts` - App-wide constants (plan limits, roles, etc.)
- `lib/permissions.ts` - Permission checking utilities
- `lib/permissions.test.ts` - Unit tests for permission utilities
- `supabase/migrations/*.sql` - Database migration files (schema, RLS, functions)
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup page
- `app/(auth)/layout.tsx` - Auth layout (no sidebar)
- `app/(auth)/invite/[token]/page.tsx` - Invitation acceptance page
- `app/(dashboard)/layout.tsx` - Main app shell (sidebar + content)
- `app/(dashboard)/onboarding/page.tsx` - Org creation / onboarding flow
- `app/(dashboard)/[spaceId]/page.tsx` - Space landing page
- `app/(dashboard)/[spaceId]/[pageId]/page.tsx` - Page editor/viewer
- `app/(dashboard)/settings/members/page.tsx` - Members management page
- `app/(dashboard)/settings/billing/page.tsx` - Billing settings page
- `app/(dashboard)/settings/general/page.tsx` - Org general settings
- `app/public/[slug]/page.tsx` - Public shared document view
- `app/api/health/route.ts` - Health check endpoint for Coolify
- `app/api/webhooks/stripe/route.ts` - Stripe webhook endpoint
- `components/sidebar/app-sidebar.tsx` - Main sidebar component
- `components/sidebar/space-tree.tsx` - Collapsible space/page tree
- `components/sidebar/org-switcher.tsx` - Organization switcher dropdown
- `components/editor/tiptap-editor.tsx` - Tiptap editor wrapper component
- `components/editor/editor-toolbar.tsx` - ShadCN-based editor toolbar
- `components/editor/source-mode.tsx` - Markdown source mode editor
- `components/editor/image-upload.ts` - Image upload handler (Supabase Storage)
- `components/comments/comment-thread.tsx` - Threaded comment display
- `components/comments/comment-form.tsx` - Comment input with @mention autocomplete
- `components/search/command-palette.tsx` - Cmd+K search/navigation palette
- `components/notifications/notification-bell.tsx` - Bell icon with badge + popover list
- `components/sharing/share-dialog.tsx` - External sharing toggle dialog
- `components/ui/*.tsx` - ShadCN UI components (Button, Dialog, Command, etc.)
- `components/theme-provider.tsx` - Dark/light mode theme provider

### Notes

- Unit tests should be placed alongside the code files they test (e.g., `middleware.ts` and `middleware.test.ts`).
- Use `npm test` or the project's configured test runner to execute tests.
- This is a greenfield project — file paths above are proposed based on Next.js App Router conventions and may shift during implementation.
- Supabase migrations are numbered sequentially (e.g., `001_initial_schema.sql`, `002_rls_policies.sql`).
- ShadCN components are copied into `components/ui/` via the `npx shadcn@latest add` CLI.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Initialize a Git repository (`git init`) and create the initial branch (e.g., `git checkout -b feature/discuss-mvp`)

- [ ] 1.0 Project scaffolding & configuration
  - [ ] 1.1 Create a new Next.js project with App Router, TypeScript, Tailwind CSS, and ESLint (`npx create-next-app@latest`)
  - [ ] 1.2 Initialize ShadCN UI (`npx shadcn@latest init`) and install foundational components: Button, Input, Label, Dialog, DropdownMenu, Popover, Command, Card, Avatar, Badge, Breadcrumb, Separator, Toast/Sonner, Toggle, Sidebar, Sheet
  - [ ] 1.3 Install Supabase client packages (`@supabase/supabase-js`, `@supabase/ssr`)
  - [ ] 1.4 Install Stripe SDK (`stripe` for server, `@stripe/stripe-js` for client)
  - [ ] 1.5 Install Tiptap core and extensions (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-link`, `@tiptap/extension-code-block-lowlight`, `@tiptap/extension-placeholder`, `@tiptap/extension-mention`, `@tiptap/extension-horizontal-rule`)
  - [ ] 1.6 Create `.env.example` with all required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_DOMAIN` (discusslabs.com), `NEXT_PUBLIC_APP_URL`
  - [ ] 1.7 Create Supabase client utilities: `lib/supabase/client.ts` (browser client), `lib/supabase/server.ts` (server client with cookies), `lib/supabase/admin.ts` (service-role client)
  - [ ] 1.8 Create Stripe client utility: `lib/stripe/client.ts`
  - [ ] 1.9 Create `lib/constants.ts` with plan limits (Free: 5 users/3 spaces/100MB, Starter: 50 users/unlimited/5GB, Pro: unlimited/unlimited/50GB), role enums, and app-wide constants
  - [ ] 1.10 Configure `next.config.ts` for standalone output (required for Docker/Coolify deployment)
  - [ ] 1.11 Create `Dockerfile` for production build: multi-stage build using Node.js, copy standalone output, expose port 3000, run `next start`
  - [ ] 1.12 Create `.dockerignore` to exclude `node_modules`, `.next`, `.git`, `.env.local`
  - [ ] 1.13 Create `ThemeProvider` component wrapping `next-themes` for dark/light mode support
  - [ ] 1.14 Create root layout (`app/layout.tsx`) with ThemeProvider, Toaster (Sonner), and base HTML structure with font setup
  - [ ] 1.15 Commit initial scaffolding

- [ ] 2.0 Database schema, RLS policies & Supabase Auth setup
  - [ ] 2.1 Create migration `001_initial_schema.sql`: define enums (`org_role`, `space_role`, `space_default_role`, `plan_type`, `subscription_status`, `notification_type`), and all tables (`organizations`, `org_members`, `spaces`, `space_members`, `pages`, `comments`, `notifications`, `subscriptions`, `invitations`) with columns, constraints, and indexes as defined in PRD Section 7.4
  - [ ] 2.2 Add indexes for RLS performance: index on `org_id` for all tenant tables, index on `space_id` for `space_members` and `pages`, index on `page_id` for `comments`, GIN index on `content_tsvector` for full-text search, unique index on `organizations.slug`, unique index on `pages.external_share_slug`
  - [ ] 2.3 Create migration `002_rls_policies.sql`: enable RLS on all tables and create policies — `organizations` (members can SELECT their orgs), `org_members` (members can see co-members, owners/admins can INSERT/UPDATE/DELETE), `spaces` (accessible based on `space_members` or `default_role`), `space_members` (admins can manage), `pages` (access derived from space access, public pages allow anonymous SELECT), `comments` (access follows page access), `notifications` (users see only their own), `subscriptions` (org owners/admins can view), `invitations` (admins can manage, token-based SELECT for acceptance)
  - [ ] 2.4 Create migration `003_auth_hooks.sql`: create a Postgres function to set custom JWT claims (`org_id`, `org_role`) during token generation using Supabase Auth hooks. The function should look up the user's active org from `org_members` and inject claims into the JWT
  - [ ] 2.5 Create migration `004_tsvector_trigger.sql`: create a trigger on the `pages` table that automatically updates `content_tsvector` whenever `title` or `content_markdown` is inserted or updated
  - [ ] 2.6 Configure Supabase Auth providers: enable Email/Password, Google OAuth, and GitHub OAuth in the Supabase dashboard (document the required OAuth app credentials in `.env.example`)
  - [ ] 2.7 Create Supabase Storage bucket `documents` with storage policies: authenticated users can upload to `{org_id}/` path, read access scoped to org members, public read for externally shared image URLs
  - [ ] 2.8 Generate TypeScript types from Supabase schema (`npx supabase gen types typescript`) and save to `lib/supabase/types.ts`
  - [ ] 2.9 Run migrations against local Supabase instance and verify all tables, RLS policies, and triggers work correctly
  - [ ] 2.10 Commit database schema and migrations

- [ ] 3.0 Multi-tenant middleware & subdomain routing
  - [ ] 3.1 Create `middleware.ts` at the project root: extract the `Host` header, parse the subdomain by removing the base domain (`discusslabs.com`), and store the resolved subdomain in a request header or cookie for downstream use
  - [ ] 3.2 Handle routing cases in middleware: (a) root domain (`discusslabs.com`) — allow through to auth/marketing routes, (b) valid org subdomain (`acme.discusslabs.com`) — set tenant context and continue, (c) reserved subdomains (`www`, `api`, `app`, `admin`) — redirect to root domain, (d) `localhost` — support local dev with query param or cookie-based tenant override
  - [ ] 3.3 Create `lib/tenant.ts` utility: `getTenantFromHeaders()` function that reads the tenant context set by middleware, to be used in server components and server actions
  - [ ] 3.4 Configure middleware matcher in `middleware.ts` to exclude static files, `_next`, and API health check (`/api/health`) from middleware processing
  - [ ] 3.5 Create `app/api/health/route.ts` returning `{ status: "ok" }` for Coolify Docker health checks
  - [ ] 3.6 Write unit tests for subdomain parsing logic: test root domain, valid subdomains, reserved subdomains, localhost, and subdomains with invalid characters
  - [ ] 3.7 Commit middleware and routing

- [ ] 4.0 Authentication & onboarding flow
  - [ ] 4.1 Create `app/(auth)/layout.tsx` — a centered, minimal layout for auth pages (no sidebar, no org context)
  - [ ] 4.2 Create `app/(auth)/login/page.tsx` — login form with email/password fields and Google/GitHub OAuth buttons. Use Supabase Auth `signInWithPassword` and `signInWithOAuth`. On success, look up user's orgs and redirect to their default org subdomain
  - [ ] 4.3 Create `app/(auth)/signup/page.tsx` — signup form with name, email, password fields and Google/GitHub OAuth buttons. Use Supabase Auth `signUp`. On success, redirect to onboarding
  - [ ] 4.4 Create `app/(dashboard)/onboarding/page.tsx` — step 1: create org (name + slug input with real-time slug availability check via server action). Validate slug (3–40 chars, lowercase alphanumeric + hyphens, unique). On submit, insert into `organizations` and `org_members` (as Owner), update JWT claims, redirect to the new org's subdomain
  - [ ] 4.5 Add onboarding step 2 (on org subdomain): optional "invite teammates" form (email inputs) — can be skipped. Sends invitations (see Task 5.0)
  - [ ] 4.6 Add onboarding step 3: prompt to create first space and page, or skip to dashboard
  - [ ] 4.7 Create `app/(auth)/invite/[token]/page.tsx` — invitation acceptance page: validate token, show org name and role being offered. If user is logged in, accept and join org. If not, redirect to signup with invitation token preserved, then auto-accept after signup
  - [ ] 4.8 Create `lib/auth.ts` utility: `getSession()` helper for server components, `requireAuth()` that redirects to login if no session, `requireOrg()` that validates user belongs to the current tenant org
  - [ ] 4.9 Implement org switching: create `components/sidebar/org-switcher.tsx` — dropdown listing all orgs the user belongs to (query `org_members`), clicking an org redirects to `{slug}.discusslabs.com`
  - [ ] 4.10 Add sign-out functionality: clear Supabase session and redirect to root domain login page
  - [ ] 4.11 Commit auth and onboarding flow

- [ ] 5.0 Organization & member management
  - [ ] 5.1 Create server actions in `app/(dashboard)/settings/members/actions.ts`: `inviteMember(email, role)` — validate plan limits (max users), create invitation record with unique token and 7-day expiry, send invitation email via Supabase Auth or a transactional email service
  - [ ] 5.2 Create `app/(dashboard)/settings/members/page.tsx` — members list table showing: avatar, name, email, org-level default role, join date. Owners/Admins see action buttons (change role, remove member)
  - [ ] 5.3 Add "Invite member" dialog on the members page: email input + role selector dropdown (Admin, Editor, Viewer). Submit calls `inviteMember` server action
  - [ ] 5.4 Create server action `updateMemberRole(userId, newRole)` — only Owners/Admins can execute. Prevent changing the Owner's role (must use transfer). Update `org_members.default_role`
  - [ ] 5.5 Create server action `removeMember(userId)` — only Owners can remove Admins, Owners/Admins can remove Editors/Viewers. Delete from `org_members` and all `space_members` entries for that user in the org
  - [ ] 5.6 Create server action `transferOwnership(newOwnerId)` — only current Owner can execute. Must target an Admin. Swap roles: current Owner becomes Admin, target becomes Owner. Update `organizations.owner_id`
  - [ ] 5.7 Create `app/(dashboard)/settings/general/page.tsx` — org settings: edit org name, view subdomain (read-only for MVP), set default space permission for new spaces
  - [ ] 5.8 Create pending invitations section on members page: list pending invites with email, role, expiry date, and option to revoke
  - [ ] 5.9 Create `lib/permissions.ts` with helper functions: `canManageMembers(role)`, `canEditSpace(userRole, spaceRole)`, `canEditPage(userRole, spaceRole)`, `canManageBilling(role)`, `isAtLeast(role, minimumRole)`. Write unit tests in `lib/permissions.test.ts`
  - [ ] 5.10 Commit org and member management

- [ ] 6.0 Spaces & page hierarchy
  - [ ] 6.1 Create server actions for spaces in `lib/actions/spaces.ts`: `createSpace(name, description, icon, defaultRole)`, `updateSpace(spaceId, updates)`, `archiveSpace(spaceId)`, `restoreSpace(spaceId)`, `deleteSpace(spaceId)` (permanent, only if archived). Enforce plan limits (Free: max 3 spaces)
  - [ ] 6.2 Create server actions for pages in `lib/actions/pages.ts`: `createPage(spaceId, parentPageId, title)`, `updatePage(pageId, updates)`, `archivePage(pageId)` (recursively archives sub-pages), `restorePage(pageId)`, `deletePage(pageId)` (permanent), `movePage(pageId, newSpaceId, newParentPageId)`, `reorderPages(spaceId, parentPageId, orderedPageIds)`
  - [ ] 6.3 Create `components/sidebar/space-tree.tsx` — collapsible tree component: top level shows spaces (with icons), expanding a space shows its nested page tree. Only show spaces the user has access to (query via RLS). Each item shows title and has a right-click context menu (rename, archive, delete, move)
  - [ ] 6.4 Implement drag-and-drop reordering in the sidebar tree using a library like `@dnd-kit/core` or `dnd-kit/sortable`. Support reordering pages within a space and moving pages between spaces. On drop, call `reorderPages` or `movePage` server action
  - [ ] 6.5 Create "New Space" dialog accessible from sidebar: name, optional description, icon picker (emoji), default permission selector. Calls `createSpace` on submit
  - [ ] 6.6 Create "New Page" action: button in sidebar under each space, or a "+" icon next to a parent page. Creates a new page with a default "Untitled" title and opens the editor
  - [ ] 6.7 Create `app/(dashboard)/[spaceId]/page.tsx` — space landing page showing: space name, description, flat list of top-level pages in that space, and quick "New Page" button
  - [ ] 6.8 Create `app/(dashboard)/[spaceId]/[pageId]/page.tsx` — page view/edit route. Fetch the page data, check permissions (viewer sees read-only, editor sees editor). Pass data to the editor or viewer component
  - [ ] 6.9 Create breadcrumb component at the top of the page view: Org > Space > Parent Page > Current Page. Use ShadCN Breadcrumb. Build breadcrumb trail by walking `parent_page_id` chain
  - [ ] 6.10 Create space settings panel (accessible to Admins): configure space name, description, icon, default role for new org members, manage space-level member overrides (`space_members` table)
  - [ ] 6.11 Create archived items view: accessible from settings, shows all archived spaces/pages with restore and permanent delete options. Auto-purge note: items archived > 30 days should display a warning
  - [ ] 6.12 Commit spaces and page hierarchy

- [ ] 7.0 Document editor
  - [ ] 7.1 Create `components/editor/tiptap-editor.tsx` — initialize Tiptap editor with extensions: StarterKit (headings H1–H4, bold, italic, strike, code, blockquote, lists, horizontal rule), Image, Table + TableRow + TableHeader + TableCell, TaskList + TaskItem, Link, CodeBlockLowlight (with common language support), Placeholder, Mention (for future comment @mentions)
  - [ ] 7.2 Create `components/editor/editor-toolbar.tsx` — ShadCN-based toolbar with: text style dropdown (paragraph, H1–H4), bold/italic/strike toggles, link button, code/code-block, list buttons (bullet, ordered, task), blockquote, table insert, image upload, horizontal rule. Less-used items in a "more" dropdown menu. Toolbar is sticky at the top of the editor area
  - [ ] 7.3 Create `components/editor/source-mode.tsx` — raw Markdown textarea editor with monospace font. Create `lib/editor/markdown.ts` with `tiptapJsonToMarkdown()` and `markdownToTiptapJson()` conversion functions using Tiptap's built-in Markdown serialization or a library like `turndown`/`marked`
  - [ ] 7.4 Implement source mode toggle: a button in the toolbar that switches between the Tiptap WYSIWYG editor and the Markdown source textarea. On toggle, convert content between formats. Preserve cursor position approximately
  - [ ] 7.5 Create `components/editor/image-upload.ts` — handle image uploads to Supabase Storage: support file picker, drag-and-drop onto editor, and clipboard paste. Upload to `documents/{org_id}/{random_id}.{ext}`, return public URL, insert as Tiptap Image node
  - [ ] 7.6 Implement auto-save: create a debounced save function (5 seconds after last keystroke). Call `updatePage` server action with the current Tiptap JSON content and generated Markdown string. Show save status indicator in the toolbar area ("Saved" / "Saving..." / "Unsaved changes") using a small text label or icon
  - [ ] 7.7 Create page title input: an inline editable title field above the editor (large font, no border, placeholder "Untitled"). Title changes are included in auto-save
  - [ ] 7.8 Create "last edited by" display: show `updated_by` user name/avatar and `updated_at` timestamp below the title. Fetch user profile for display
  - [ ] 7.9 Implement Markdown export: toolbar action or page menu item that downloads the current `content_markdown` as `{page-title}.md`
  - [ ] 7.10 Implement Markdown import: toolbar action or page menu item that accepts a `.md` file upload, parses it with `markdownToTiptapJson()`, and either creates a new page or replaces current page content (with confirmation)
  - [ ] 7.11 Create read-only viewer component: renders Tiptap content without the editor chrome (no toolbar, no cursor, no editing). Used for Viewer-role users and public share pages
  - [ ] 7.12 Commit document editor

- [ ] 8.0 Commenting system
  - [ ] 8.1 Create server actions in `lib/actions/comments.ts`: `createComment(pageId, content, parentCommentId?)`, `updateComment(commentId, content)`, `deleteComment(commentId)`. Enforce permissions: any user with page access can comment, only author or Admin can edit/delete. Handle soft-delete logic (show "[deleted]" if comment has replies)
  - [ ] 8.2 Create `components/comments/comment-thread.tsx` — displays all comments for a page as a threaded list. Top-level comments with their replies nested below (one level). Each comment shows: author avatar + name, timestamp, content (rendered with basic markdown), edit/delete actions (if permitted), and a "Reply" button
  - [ ] 8.3 Create `components/comments/comment-form.tsx` — textarea input for writing comments. Support basic formatting (bold, italic, inline code, links) via Markdown or keyboard shortcuts. Include a "Submit" button. Reused for both new comments and replies
  - [ ] 8.4 Implement @mention autocomplete in comment form: typing `@` triggers a dropdown/popover listing org members (fetched from `org_members`), filtered as the user types. Selecting a member inserts `@Username` into the comment text and stores the user ID for notification
  - [ ] 8.5 Create comments panel/section on the page view: a toggleable sidebar panel or below-content section. Include a "Comments" button/tab in the page header showing comment count. Panel displays `comment-thread` and `comment-form`
  - [ ] 8.6 Wire up notification creation: when a comment contains @mentions, after saving the comment, create notification records for each mentioned user (type: `mention`, with `page_id` and `reference_id` pointing to the comment). Also create `reply` notifications when replying to another user's comment
  - [ ] 8.7 Commit commenting system

- [ ] 9.0 Search
  - [ ] 9.1 Create server action `searchDocuments(query, spaceId?)` in `lib/actions/search.ts`: use Supabase's `textSearch` or raw SQL with `to_tsquery` on the `content_tsvector` column. Filter by `org_id` (from JWT), optionally by `space_id`. Return page ID, title, space name, `ts_headline` snippet with highlighted matches, and `updated_at`. Rank by `ts_rank`. Limit to 20 results
  - [ ] 9.2 Create `components/search/command-palette.tsx` using ShadCN Command component: bind to Cmd+K / Ctrl+K keyboard shortcut globally. Input field at top, results below. Debounce search input (300ms). Display results grouped by space
  - [ ] 9.3 Add quick navigation mode to command palette: when the query matches space or page names (simple ILIKE query), show those as navigation results above full-text search results. Clicking navigates to that space/page
  - [ ] 9.4 Add space filter to command palette: optional dropdown or chip to scope search to a specific space
  - [ ] 9.5 Ensure search respects permissions: the RLS policies on `pages` should automatically filter results to only pages the user can access. Verify with a test: a user without space access should not see results from that space
  - [ ] 9.6 Commit search

- [ ] 10.0 Sharing
  - [ ] 10.1 Internal sharing is handled by space-level permissions (Task 6.0). Verify that page access correctly inherits from `space_members` role or `spaces.default_role`. No additional UI needed — users access pages they have space access to
  - [ ] 10.2 Create server action `toggleExternalSharing(pageId, enabled)` in `lib/actions/sharing.ts`: if enabling, generate a random unguessable slug (e.g., `nanoid(21)`), set `is_externally_shared = true` and `external_share_slug` on the page. If disabling, set `is_externally_shared = false` and clear the slug. Enforce plan limits (Free: not available, Starter: max 5 externally shared docs, Pro: unlimited)
  - [ ] 10.3 Create `components/sharing/share-dialog.tsx` — ShadCN Dialog with: a toggle switch for "Share publicly", the generated public URL displayed with a copy-to-clipboard button when enabled, a note about plan limits if applicable. Open from a "Share" button in the page header. Only visible to Admins
  - [ ] 10.4 Create `app/public/[slug]/page.tsx` — public route that fetches the page by `external_share_slug` where `is_externally_shared = true`. Render the page content using the read-only viewer component. No sidebar, no auth required. Include a "Powered by Discuss" footer with a link to `discusslabs.com`. Return 404 if slug is invalid or sharing is disabled
  - [ ] 10.5 Add RLS policy for public pages: allow anonymous SELECT on `pages` where `is_externally_shared = true` and the request matches by `external_share_slug`. Ensure no other columns (comments, etc.) leak
  - [ ] 10.6 Commit sharing

- [ ] 11.0 Billing & subscriptions
  - [ ] 11.1 Set up Stripe products and prices: create products for Starter and Pro plans in Stripe Dashboard (or via seed script). Each product has a price of $4/user/mo and $8/user/mo respectively. Store price IDs in environment variables or `lib/constants.ts`
  - [ ] 11.2 Create server action `createCheckoutSession(planPriceId)` in `lib/actions/billing.ts`: create a Stripe Checkout Session in subscription mode with `per_seat` quantity (current org member count). Set `success_url` and `cancel_url` pointing back to the billing settings page. Set `client_reference_id` to `org_id`. Only org Owners can execute
  - [ ] 11.3 Create server action `createBillingPortalSession()`: create a Stripe Customer Portal session for the org's `stripe_customer_id`. Returns the portal URL for redirect. Only org Owners can execute
  - [ ] 11.4 Create `app/api/webhooks/stripe/route.ts`: verify Stripe webhook signature, handle events: `checkout.session.completed` (create/update subscription record in Supabase, set org's `stripe_customer_id`), `customer.subscription.updated` (sync plan/status/seats/period), `customer.subscription.deleted` (mark subscription canceled), `invoice.payment_failed` (mark subscription `past_due`)
  - [ ] 11.5 Create `app/(dashboard)/settings/billing/page.tsx` — billing dashboard showing: current plan name + badge, seats used vs. allowed, storage used vs. limit, next billing date, payment method (last 4 digits from Stripe). Buttons: "Upgrade" (for Free/Starter), "Manage Subscription" (opens Stripe Portal), "View Invoices" (link to Stripe Portal)
  - [ ] 11.6 Create plan limit enforcement middleware: `lib/plan-limits.ts` with functions `checkUserLimit(orgId)`, `checkSpaceLimit(orgId)`, `checkStorageLimit(orgId)`, `checkExternalShareLimit(orgId)`. These query the subscription and current usage, returning whether the action is allowed. Call these in relevant server actions (invite member, create space, upload image, toggle sharing)
  - [ ] 11.7 Create upgrade prompt banner component: displayed at the top of the dashboard when an org hits 80% of any plan limit. Shows which limit is approaching and a link to the billing page. Dismissible per session
  - [ ] 11.8 Handle Free plan default: new orgs start on the Free plan with no Stripe subscription. Create a `subscriptions` record with `plan: 'free'` and `status: 'active'` on org creation
  - [ ] 11.9 Commit billing and subscriptions

- [ ] 12.0 Notifications
  - [ ] 12.1 Create server actions in `lib/actions/notifications.ts`: `getNotifications(limit, offset)` — fetch user's notifications ordered by `created_at` desc, `markAsRead(notificationId)`, `markAllAsRead()`. All queries filtered by `user_id` from session
  - [ ] 12.2 Create `components/notifications/notification-bell.tsx` — bell icon in the top navigation bar. Shows unread count badge (red circle with number). Clicking opens a ShadCN Popover with the notification list
  - [ ] 12.3 Create notification list inside the popover: each notification shows an icon (based on type), a message (e.g., "@Alice mentioned you in Engineering > API Docs"), relative timestamp, and read/unread state (bold for unread). Clicking navigates to the relevant page and comment. Include "Mark all as read" button at the top
  - [ ] 12.4 Wire up notification creation points: (a) comment @mentions — handled in Task 8.6, (b) comment replies — create notification for parent comment author, (c) org invitations — create notification for the invited user (if they have an account) when invitation is created
  - [ ] 12.5 Implement invitation email: when `inviteMember` is called, send an email to the invitee with the org name, inviter name, role, and a link to `discusslabs.com/invite/{token}`. Use Supabase's built-in email (via Auth hooks) or integrate a transactional email provider (e.g., Resend)
  - [ ] 12.6 Create a polling or Supabase Realtime subscription for notification count: periodically refresh the unread count badge so users see new notifications without a full page reload. Supabase Realtime `postgres_changes` on the `notifications` table filtered by `user_id` is the preferred approach
  - [ ] 12.7 Commit notifications

- [ ] 13.0 App shell & UI polish
  - [ ] 13.1 Create `app/(dashboard)/layout.tsx` — the main app shell: ShadCN Sidebar on the left (containing org switcher, space tree, search trigger, user menu), main content area on the right. Include the notification bell and theme toggle in the top bar
  - [ ] 13.2 Implement collapsible sidebar: toggle button to collapse to icon-only mode. On mobile (< 768px), sidebar is hidden by default and opens as a Sheet (ShadCN) overlay. Persist sidebar collapsed state in localStorage
  - [ ] 13.3 Implement dark mode / light mode: theme toggle in the user dropdown menu (Light / Dark / System). Use `next-themes` ThemeProvider. Persist preference. Ensure all ShadCN components and custom components respect the theme
  - [ ] 13.4 Create user dropdown menu in the sidebar footer: shows user avatar + name, with items: Theme toggle, Settings link, Sign out. Use ShadCN DropdownMenu
  - [ ] 13.5 Implement responsive design: ensure dashboard layout works at desktop (>1024px: sidebar + content), tablet (768–1024px: collapsible sidebar + content), and mobile (<768px: hidden sidebar, view-only for pages). Editor toolbar collapses gracefully on smaller viewports
  - [ ] 13.6 Add loading states and skeleton screens: sidebar tree skeleton, page editor skeleton, comments loading state. Use ShadCN Skeleton component
  - [ ] 13.7 Add error boundaries and user-friendly error pages: generic error boundary wrapping the dashboard, 404 page for invalid org slugs or pages, toast notifications for action failures
  - [ ] 13.8 Accessibility pass: verify all interactive elements have proper focus management, keyboard navigation works for sidebar tree and command palette, color contrast meets WCAG 2.1 AA, screen reader labels on icons
  - [ ] 13.9 Performance optimization: verify Next.js Server Components are used for data-fetching pages (no unnecessary client components), images are optimized via `next/image`, Tiptap editor is lazy-loaded (dynamic import), bundle size is reasonable
  - [ ] 13.10 Create `app/api/health/route.ts` health check endpoint (if not already created in 3.5): return `{ status: "ok", timestamp: Date.now() }`. Used by Coolify for Docker container health monitoring
  - [ ] 13.11 Final integration test: manually walk through the full user journey — sign up, create org, get subdomain, create space, create nested pages, edit with Markdown, leave comments, invite a member, toggle external sharing, search, check billing page
  - [ ] 13.12 Commit app shell and UI polish
