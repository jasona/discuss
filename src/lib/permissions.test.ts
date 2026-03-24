import { describe, it, expect } from "vitest";
import {
  isAtLeast,
  canManageMembers,
  canEditSpace,
  canEditPage,
  canViewSpace,
  canManageBilling,
  canManageSpace,
} from "./permissions";

describe("isAtLeast", () => {
  it("owner meets all roles", () => {
    expect(isAtLeast("owner", "owner")).toBe(true);
    expect(isAtLeast("owner", "admin")).toBe(true);
    expect(isAtLeast("owner", "editor")).toBe(true);
    expect(isAtLeast("owner", "viewer")).toBe(true);
  });

  it("viewer only meets viewer and none", () => {
    expect(isAtLeast("viewer", "viewer")).toBe(true);
    expect(isAtLeast("viewer", "none")).toBe(true);
    expect(isAtLeast("viewer", "editor")).toBe(false);
    expect(isAtLeast("viewer", "admin")).toBe(false);
  });

  it("none meets nothing except none", () => {
    expect(isAtLeast("none", "none")).toBe(true);
    expect(isAtLeast("none", "viewer")).toBe(false);
  });
});

describe("canManageMembers", () => {
  it("owner and admin can manage", () => {
    expect(canManageMembers("owner")).toBe(true);
    expect(canManageMembers("admin")).toBe(true);
  });
  it("editor and viewer cannot", () => {
    expect(canManageMembers("editor")).toBe(false);
    expect(canManageMembers("viewer")).toBe(false);
  });
});

describe("canEditSpace", () => {
  it("org owner/admin can always edit", () => {
    expect(canEditSpace("owner", "none")).toBe(true);
    expect(canEditSpace("admin", "viewer")).toBe(true);
  });
  it("org editor with space editor role can edit", () => {
    expect(canEditSpace("editor", "editor")).toBe(true);
    expect(canEditSpace("editor", "admin")).toBe(true);
  });
  it("org editor with space viewer cannot edit", () => {
    expect(canEditSpace("editor", "viewer")).toBe(false);
  });
  it("org viewer with space editor can edit", () => {
    expect(canEditSpace("viewer", "editor")).toBe(true);
  });
  it("org viewer with no space access cannot edit", () => {
    expect(canEditSpace("viewer", "none")).toBe(false);
  });
});

describe("canEditPage", () => {
  it("delegates to canEditSpace", () => {
    expect(canEditPage("owner", "none")).toBe(true);
    expect(canEditPage("viewer", "none")).toBe(false);
    expect(canEditPage("viewer", "editor")).toBe(true);
  });
});

describe("canViewSpace", () => {
  it("owner/admin can always view", () => {
    expect(canViewSpace("owner", "none")).toBe(true);
    expect(canViewSpace("admin", "none")).toBe(true);
  });
  it("any space role grants view access", () => {
    expect(canViewSpace("viewer", "viewer")).toBe(true);
    expect(canViewSpace("editor", "editor")).toBe(true);
  });
  it("no space role means no access for non-admin org roles", () => {
    expect(canViewSpace("viewer", "none")).toBe(false);
    expect(canViewSpace("editor", "none")).toBe(false);
  });
});

describe("canManageBilling", () => {
  it("only owner", () => {
    expect(canManageBilling("owner")).toBe(true);
    expect(canManageBilling("admin")).toBe(false);
    expect(canManageBilling("editor")).toBe(false);
  });
});

describe("canManageSpace", () => {
  it("org owner/admin can always manage", () => {
    expect(canManageSpace("owner", "none")).toBe(true);
    expect(canManageSpace("admin", "viewer")).toBe(true);
  });
  it("space admin can manage", () => {
    expect(canManageSpace("editor", "admin")).toBe(true);
  });
  it("space editor cannot manage", () => {
    expect(canManageSpace("editor", "editor")).toBe(false);
  });
});
