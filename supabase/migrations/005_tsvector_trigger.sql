-- ═══════════════════════════════════════════════════════════
-- Auto-update content_tsvector on pages INSERT/UPDATE
--
-- Combines title (weight A — highest priority) with
-- content_markdown (weight B) for ranked full-text search.
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION pages_tsvector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.content_tsvector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content_markdown, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pages_tsvector
  BEFORE INSERT OR UPDATE OF title, content_markdown
  ON pages
  FOR EACH ROW
  EXECUTE FUNCTION pages_tsvector_trigger();
