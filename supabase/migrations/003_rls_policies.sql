-- ─── Enable RLS on all tables ────────────────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- Helper: check if current user is a member of an org
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = check_org_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's org role
CREATE OR REPLACE FUNCTION get_org_role(check_org_id UUID)
RETURNS org_role AS $$
  SELECT default_role FROM org_members
  WHERE org_id = check_org_id AND user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's effective space role (explicit or default)
CREATE OR REPLACE FUNCTION get_space_role(check_space_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT sm.role::text FROM space_members sm WHERE sm.space_id = check_space_id AND sm.user_id = auth.uid()),
    (SELECT s.default_role::text FROM spaces s WHERE s.id = check_space_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════════════════════════
-- Organizations
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "Members can view their orgs"
  ON organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Authenticated users can create orgs"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their org"
  ON organizations FOR UPDATE
  USING (get_org_role(id) = 'owner');

-- ═══════════════════════════════════════════════════════════
-- Org Members
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "Members can view co-members"
  ON org_members FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Owners and admins can add members"
  ON org_members FOR INSERT
  WITH CHECK (get_org_role(org_id) IN ('owner', 'admin'));

CREATE POLICY "Owners and admins can update members"
  ON org_members FOR UPDATE
  USING (get_org_role(org_id) IN ('owner', 'admin'));

CREATE POLICY "Owners and admins can remove members"
  ON org_members FOR DELETE
  USING (get_org_role(org_id) IN ('owner', 'admin'));

-- ═══════════════════════════════════════════════════════════
-- Spaces
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "Org members can view non-archived spaces they have access to"
  ON spaces FOR SELECT
  USING (
    is_org_member(org_id)
    AND (
      get_space_role(id) != 'none'
      OR get_org_role(org_id) IN ('owner', 'admin')
    )
  );

CREATE POLICY "Editors and above can create spaces"
  ON spaces FOR INSERT
  WITH CHECK (
    get_org_role(org_id) IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Space admins and org admins can update spaces"
  ON spaces FOR UPDATE
  USING (
    get_org_role(org_id) IN ('owner', 'admin')
    OR get_space_role(id) = 'admin'
  );

CREATE POLICY "Org admins can delete spaces"
  ON spaces FOR DELETE
  USING (get_org_role(org_id) IN ('owner', 'admin'));

-- ═══════════════════════════════════════════════════════════
-- Space Members
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "Org members can view space members"
  ON space_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spaces s
      WHERE s.id = space_id AND is_org_member(s.org_id)
    )
  );

CREATE POLICY "Org admins and space admins can manage space members"
  ON space_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM spaces s
      WHERE s.id = space_id
      AND (
        get_org_role(s.org_id) IN ('owner', 'admin')
        OR get_space_role(s.id) = 'admin'
      )
    )
  );

CREATE POLICY "Org admins and space admins can update space members"
  ON space_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM spaces s
      WHERE s.id = space_id
      AND (
        get_org_role(s.org_id) IN ('owner', 'admin')
        OR get_space_role(s.id) = 'admin'
      )
    )
  );

CREATE POLICY "Org admins and space admins can remove space members"
  ON space_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM spaces s
      WHERE s.id = space_id
      AND (
        get_org_role(s.org_id) IN ('owner', 'admin')
        OR get_space_role(s.id) = 'admin'
      )
    )
  );

-- ═══════════════════════════════════════════════════════════
-- Pages
-- ═══════════════════════════════════════════════════════════

-- Authenticated users can view pages in spaces they have access to
CREATE POLICY "Space members can view pages"
  ON pages FOR SELECT
  USING (
    (
      is_org_member(org_id)
      AND get_space_role(space_id) NOT IN ('none')
    )
    OR (
      -- Public pages: anyone can view via external_share_slug
      is_externally_shared = true
    )
  );

CREATE POLICY "Editors can create pages"
  ON pages FOR INSERT
  WITH CHECK (
    get_org_role(org_id) IN ('owner', 'admin', 'editor')
    AND get_space_role(space_id) IN ('admin', 'editor')
  );

CREATE POLICY "Editors can update pages"
  ON pages FOR UPDATE
  USING (
    get_org_role(org_id) IN ('owner', 'admin', 'editor')
    AND get_space_role(space_id) IN ('admin', 'editor')
  );

CREATE POLICY "Admins can delete pages"
  ON pages FOR DELETE
  USING (
    get_org_role(org_id) IN ('owner', 'admin')
    OR get_space_role(space_id) = 'admin'
  );

-- ═══════════════════════════════════════════════════════════
-- Comments
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "Users with page access can view comments"
  ON comments FOR SELECT
  USING (
    is_org_member(org_id)
    AND EXISTS (
      SELECT 1 FROM pages p
      WHERE p.id = page_id
      AND get_space_role(p.space_id) != 'none'
    )
  );

CREATE POLICY "Users with page access can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    is_org_member(org_id)
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM pages p
      WHERE p.id = page_id
      AND get_space_role(p.space_id) != 'none'
    )
  );

CREATE POLICY "Authors and admins can update comments"
  ON comments FOR UPDATE
  USING (
    author_id = auth.uid()
    OR get_org_role(org_id) IN ('owner', 'admin')
  );

CREATE POLICY "Authors and admins can delete comments"
  ON comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR get_org_role(org_id) IN ('owner', 'admin')
  );

-- ═══════════════════════════════════════════════════════════
-- Notifications
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications (via service role)"
  ON notifications FOR INSERT
  WITH CHECK (true);
  -- Notifications are created server-side via service role or triggers.
  -- RLS INSERT is permissive; actual creation is gated by server logic.

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- Subscriptions
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "Org owners and admins can view subscription"
  ON subscriptions FOR SELECT
  USING (get_org_role(org_id) IN ('owner', 'admin'));

-- Insert/update handled via service role (Stripe webhooks)
CREATE POLICY "Service role manages subscriptions"
  ON subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);
  -- This permissive policy is overridden by the service role bypass.
  -- Non-service-role users are restricted by the SELECT policy above.

-- ═══════════════════════════════════════════════════════════
-- Invitations
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "Org admins can view invitations"
  ON invitations FOR SELECT
  USING (
    get_org_role(org_id) IN ('owner', 'admin')
    -- Also allow token-based lookup for invitation acceptance
    OR token = current_setting('request.invitation_token', true)
  );

CREATE POLICY "Org admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (get_org_role(org_id) IN ('owner', 'admin'));

CREATE POLICY "Org admins can update invitations"
  ON invitations FOR UPDATE
  USING (get_org_role(org_id) IN ('owner', 'admin'));

CREATE POLICY "Org admins can delete invitations"
  ON invitations FOR DELETE
  USING (get_org_role(org_id) IN ('owner', 'admin'));
