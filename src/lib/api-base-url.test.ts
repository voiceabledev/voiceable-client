import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { getApiBaseUrl, normalizeApiBaseUrl } from "@/lib/api";

describe("normalizeApiBaseUrl", () => {
  it("appends /voiceable-api to a bare origin", () => {
    expect(normalizeApiBaseUrl("https://api.voiceable.dev")).toBe(
      "https://api.voiceable.dev/voiceable-api",
    );
  });

  it("keeps an existing /voiceable-api suffix", () => {
    expect(normalizeApiBaseUrl("https://api.voiceable.dev/voiceable-api/")).toBe(
      "https://api.voiceable.dev/voiceable-api",
    );
  });
});

describe("getApiBaseUrl", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  const originalVite = process.env.VITE_API_BASE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.VITE_API_BASE_URL;
  });

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    if (originalVite === undefined) delete process.env.VITE_API_BASE_URL;
    else process.env.VITE_API_BASE_URL = originalVite;
    vi.unstubAllGlobals();
  });

  it("uses NEXT_PUBLIC_API_BASE_URL when set", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    expect(getApiBaseUrl()).toBe("https://api.example.com/voiceable-api");
  });

  it("points Netlify hosts at api.voiceable.dev instead of same-origin /voiceable-api", () => {
    vi.stubGlobal("window", {
      location: {
        hostname: "voiceable.netlify.app",
        protocol: "https:",
      },
    });
    expect(getApiBaseUrl()).toBe("https://api.voiceable.dev/voiceable-api");
  });
});
