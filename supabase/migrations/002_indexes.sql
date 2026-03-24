-- ─── Org-scoped table indexes (RLS performance) ─────────

CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

CREATE INDEX idx_spaces_org_id ON spaces(org_id);

CREATE INDEX idx_space_members_space_id ON space_members(space_id);
CREATE INDEX idx_space_members_user_id ON space_members(user_id);

CREATE INDEX idx_pages_org_id ON pages(org_id);
CREATE INDEX idx_pages_space_id ON pages(space_id);
CREATE INDEX idx_pages_parent_page_id ON pages(parent_page_id);

CREATE INDEX idx_comments_page_id ON comments(page_id);
CREATE INDEX idx_comments_org_id ON comments(org_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_org_id ON notifications(org_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE NOT is_read;

CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);

CREATE INDEX idx_invitations_org_id ON invitations(org_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);

-- ─── Full-text search index ─────────────────────────────

CREATE INDEX idx_pages_content_tsvector ON pages USING GIN (content_tsvector);

-- ─── Unique / lookup indexes ─────────────────────────────
-- organizations.slug and pages.external_share_slug already have unique constraints
-- which create implicit unique indexes.
