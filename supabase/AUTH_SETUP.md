# Supabase Auth Provider Setup

## 1. Email/Password
- Enabled by default in Supabase.
- In Dashboard → Authentication → Providers → Email, ensure:
  - "Enable Email Signup" is ON
  - "Confirm email" is ON (recommended for production)

## 2. Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Web Application)
3. Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google
   - Paste Client ID and Client Secret

## 3. GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub
   - Paste Client ID and Client Secret

## 4. Custom Access Token Hook
1. In Supabase Dashboard → Authentication → Hooks
2. Set "Custom Access Token" hook to: `public.custom_access_token_hook`
3. This injects `org_id` and `org_role` into every JWT

## Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
