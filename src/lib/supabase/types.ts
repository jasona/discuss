// ═══════════════════════════════════════════════════════════
// Database types for Supabase
//
// Regenerate from live schema with:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
//
// This file is a hand-written placeholder matching 001_initial_schema.sql.
// ═══════════════════════════════════════════════════════════

export type OrgRole = "owner" | "admin" | "editor" | "viewer";
export type SpaceRole = "admin" | "editor" | "viewer";
export type SpaceDefaultRole = "none" | "viewer" | "editor";
export type PlanType = "free" | "starter" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";
export type NotificationType = "mention" | "invitation" | "reply";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          default_role: OrgRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          default_role?: OrgRole;
          joined_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          default_role?: OrgRole;
          joined_at?: string;
        };
      };
      spaces: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          default_role: SpaceDefaultRole;
          sort_order: number;
          is_archived: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          default_role?: SpaceDefaultRole;
          sort_order?: number;
          is_archived?: boolean;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          default_role?: SpaceDefaultRole;
          sort_order?: number;
          is_archived?: boolean;
          created_by?: string;
          created_at?: string;
        };
      };
      space_members: {
        Row: {
          id: string;
          space_id: string;
          user_id: string;
          role: SpaceRole;
        };
        Insert: {
          id?: string;
          space_id: string;
          user_id: string;
          role?: SpaceRole;
        };
        Update: {
          id?: string;
          space_id?: string;
          user_id?: string;
          role?: SpaceRole;
        };
      };
      pages: {
        Row: {
          id: string;
          org_id: string;
          space_id: string;
          parent_page_id: string | null;
          title: string;
          content_json: Record<string, unknown>;
          content_markdown: string;
          content_tsvector: unknown | null;
          created_by: string;
          updated_by: string;
          sort_order: number;
          is_archived: boolean;
          is_externally_shared: boolean;
          external_share_slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          space_id: string;
          parent_page_id?: string | null;
          title?: string;
          content_json?: Record<string, unknown>;
          content_markdown?: string;
          created_by: string;
          updated_by: string;
          sort_order?: number;
          is_archived?: boolean;
          is_externally_shared?: boolean;
          external_share_slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          space_id?: string;
          parent_page_id?: string | null;
          title?: string;
          content_json?: Record<string, unknown>;
          content_markdown?: string;
          created_by?: string;
          updated_by?: string;
          sort_order?: number;
          is_archived?: boolean;
          is_externally_shared?: boolean;
          external_share_slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          page_id: string;
          org_id: string;
          parent_comment_id: string | null;
          author_id: string;
          content: string;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          org_id: string;
          parent_comment_id?: string | null;
          author_id: string;
          content: string;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          org_id?: string;
          parent_comment_id?: string | null;
          author_id?: string;
          content?: string;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          type: NotificationType;
          reference_id: string | null;
          page_id: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id: string;
          type: NotificationType;
          reference_id?: string | null;
          page_id?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          org_id?: string;
          type?: NotificationType;
          reference_id?: string | null;
          page_id?: string | null;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          org_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          plan: PlanType;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          seat_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          plan?: PlanType;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          seat_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          plan?: PlanType;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          seat_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          invited_by: string;
          default_role: OrgRole;
          token: string;
          accepted_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          invited_by: string;
          default_role?: OrgRole;
          token: string;
          accepted_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string;
          invited_by?: string;
          default_role?: OrgRole;
          token?: string;
          accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
      };
    };
    Functions: {
      is_org_member: {
        Args: { check_org_id: string };
        Returns: boolean;
      };
      get_org_role: {
        Args: { check_org_id: string };
        Returns: OrgRole;
      };
      get_space_role: {
        Args: { check_space_id: string };
        Returns: string;
      };
    };
    Enums: {
      org_role: OrgRole;
      space_role: SpaceRole;
      space_default_role: SpaceDefaultRole;
      plan_type: PlanType;
      subscription_status: SubscriptionStatus;
      notification_type: NotificationType;
    };
  };
}
