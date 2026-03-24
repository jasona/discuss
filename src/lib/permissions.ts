import type { OrgRole, SpaceRole } from "@/lib/constants";

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
  none: 0,
};

/**
 * Check if a role meets or exceeds a minimum role level.
 */
export function isAtLeast(
  role: OrgRole | SpaceRole | "none",
  minimum: OrgRole | SpaceRole | "none"
): boolean {
  return (ROLE_HIERARCHY[role] ?? 0) >= (ROLE_HIERARCHY[minimum] ?? 0);
}

/**
 * Can this org role manage members (invite, change roles, remove)?
 */
export function canManageMembers(role: OrgRole): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Can this user edit content in a space?
 * Requires at least "editor" in either org role or space role.
 */
export function canEditSpace(
  orgRole: OrgRole,
  spaceRole: SpaceRole | "none"
): boolean {
  if (orgRole === "owner" || orgRole === "admin") return true;
  return spaceRole === "admin" || spaceRole === "editor";
}

/**
 * Can this user edit a page?
 * Same logic as space editing — page permissions derive from space.
 */
export function canEditPage(
  orgRole: OrgRole,
  spaceRole: SpaceRole | "none"
): boolean {
  return canEditSpace(orgRole, spaceRole);
}

/**
 * Can this user view content in a space?
 */
export function canViewSpace(
  orgRole: OrgRole,
  spaceRole: SpaceRole | "none"
): boolean {
  if (orgRole === "owner" || orgRole === "admin") return true;
  return spaceRole !== "none";
}

/**
 * Can this user manage billing?
 */
export function canManageBilling(role: OrgRole): boolean {
  return role === "owner";
}

/**
 * Can this user manage space settings (permissions, name, etc.)?
 */
export function canManageSpace(
  orgRole: OrgRole,
  spaceRole: SpaceRole | "none"
): boolean {
  if (orgRole === "owner" || orgRole === "admin") return true;
  return spaceRole === "admin";
}
