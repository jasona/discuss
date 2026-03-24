// ─── Roles ───────────────────────────────────────────────

export const ORG_ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const SPACE_ROLES = ["admin", "editor", "viewer"] as const;
export type SpaceRole = (typeof SPACE_ROLES)[number];

export const SPACE_DEFAULT_ROLES = ["none", "viewer", "editor"] as const;
export type SpaceDefaultRole = (typeof SPACE_DEFAULT_ROLES)[number];

// ─── Plans ───────────────────────────────────────────────

export const PLAN_TYPES = ["free", "starter", "pro", "enterprise"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

export interface PlanLimits {
  maxUsers: number;
  maxSpaces: number;
  storageBytes: number;
  maxExternalShares: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxUsers: 5,
    maxSpaces: 3,
    storageBytes: 100 * 1024 * 1024, // 100 MB
    maxExternalShares: 0,
  },
  starter: {
    maxUsers: 50,
    maxSpaces: Infinity,
    storageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    maxExternalShares: 5,
  },
  pro: {
    maxUsers: Infinity,
    maxSpaces: Infinity,
    storageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
    maxExternalShares: Infinity,
  },
  enterprise: {
    maxUsers: Infinity,
    maxSpaces: Infinity,
    storageBytes: Infinity,
    maxExternalShares: Infinity,
  },
};

// ─── Subscription statuses ───────────────────────────────

export const SUBSCRIPTION_STATUSES = [
  "active",
  "past_due",
  "canceled",
  "trialing",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// ─── Notification types ──────────────────────────────────

export const NOTIFICATION_TYPES = ["mention", "invitation", "reply"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ─── Misc ────────────────────────────────────────────────

export const APP_DOMAIN =
  process.env.NEXT_PUBLIC_APP_DOMAIN || "discusslabs.com";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://discusslabs.com";

export const RESERVED_SUBDOMAINS = [
  "www",
  "api",
  "app",
  "admin",
  "mail",
  "smtp",
  "ftp",
  "blog",
  "status",
  "help",
  "support",
];

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 40;
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
