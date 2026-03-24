import { describe, it, expect } from "vitest";
import { extractSubdomain } from "./middleware";

describe("extractSubdomain", () => {
  it("returns null for root domain", () => {
    expect(extractSubdomain("discusslabs.com")).toBeNull();
  });

  it("returns null for www subdomain", () => {
    expect(extractSubdomain("www.discusslabs.com")).toBeNull();
  });

  it("extracts a valid subdomain", () => {
    expect(extractSubdomain("acme.discusslabs.com")).toBe("acme");
  });

  it("extracts subdomain with hyphens", () => {
    expect(extractSubdomain("my-team.discusslabs.com")).toBe("my-team");
  });

  it("strips port from hostname", () => {
    expect(extractSubdomain("acme.discusslabs.com:3000")).toBe("acme");
  });

  it("returns null for reserved subdomains", () => {
    expect(extractSubdomain("api.discusslabs.com")).toBeNull();
    expect(extractSubdomain("admin.discusslabs.com")).toBeNull();
    expect(extractSubdomain("app.discusslabs.com")).toBeNull();
    expect(extractSubdomain("mail.discusslabs.com")).toBeNull();
    expect(extractSubdomain("support.discusslabs.com")).toBeNull();
  });

  it("returns null for multi-level subdomains", () => {
    expect(extractSubdomain("a.b.discusslabs.com")).toBeNull();
  });

  it("returns null for localhost", () => {
    expect(extractSubdomain("localhost")).toBeNull();
    expect(extractSubdomain("localhost:3000")).toBeNull();
    expect(extractSubdomain("127.0.0.1")).toBeNull();
  });

  it("returns null for unrelated domains", () => {
    expect(extractSubdomain("example.com")).toBeNull();
    expect(extractSubdomain("acme.example.com")).toBeNull();
  });

  it("handles numeric subdomains", () => {
    expect(extractSubdomain("team123.discusslabs.com")).toBe("team123");
  });
});
