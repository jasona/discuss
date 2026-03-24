-- ═══════════════════════════════════════════════════════════
-- Custom JWT claims hook
--
-- This function is called by Supabase Auth during token generation.
-- It injects the user's active org_id and org_role into the JWT
-- so that RLS policies can use them without extra queries.
--
-- To activate: In Supabase Dashboard → Authentication → Hooks,
-- set the "Custom Access Token" hook to this function.
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_org_id UUID;
  user_org_role TEXT;
BEGIN
  -- Extract current claims
  claims := event->'claims';

  -- Look up the user's first org membership (default org).
  -- If the user has a preferred org set via app_metadata, use that.
  -- Otherwise, fall back to the most recently joined org.
  SELECT om.org_id, om.default_role::text
  INTO user_org_id, user_org_role
  FROM org_members om
  WHERE om.user_id = (event->>'user_id')::uuid
  ORDER BY
    -- Prefer the org stored in app_metadata if available
    CASE WHEN om.org_id::text = (claims->'app_metadata'->>'active_org_id')
      THEN 0 ELSE 1 END,
    om.joined_at ASC
  LIMIT 1;

  -- Set custom claims
  IF user_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}', to_jsonb(user_org_id));
    claims := jsonb_set(claims, '{org_role}', to_jsonb(user_org_role));
  ELSE
    -- No org membership — set nulls so the app knows to redirect to onboarding
    claims := jsonb_set(claims, '{org_id}', 'null'::jsonb);
    claims := jsonb_set(claims, '{org_role}', 'null'::jsonb);
  END IF;

  -- Return the modified event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to supabase_auth_admin (required for auth hooks)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM public;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;
