import { describe, it, expect } from "vitest";
import { generateSlug } from "../../utils/slug.js";

describe("generateSlug", () => {
  it("creates slug from title with nanoid suffix", () => {
    const slug = generateSlug("Birthday Party");
    expect(slug).toMatch(/^birthday-party-[a-zA-Z0-9_-]{8}$/);
  });

  it("strips special characters", () => {
    const slug = generateSlug("Gift list!!! @#$%");
    expect(slug).toMatch(/^gift-list-[a-zA-Z0-9_-]{8}$/);
  });

  it("handles cyrillic characters", () => {
    const slug = generateSlug("День рождения");
    expect(slug).toMatch(/^день-рождения-[a-zA-Z0-9_-]{8}$/);
  });

  it("truncates long titles to 40 chars base", () => {
    const longTitle = "A".repeat(100);
    const slug = generateSlug(longTitle);
    const base = slug.slice(0, slug.lastIndexOf("-"));
    expect(base.length).toBeLessThanOrEqual(40);
  });

  it("returns only nanoid if title is empty after sanitization", () => {
    const slug = generateSlug("!@#$%^&*()");
    expect(slug).toMatch(/^[a-zA-Z0-9_-]{8}$/);
  });

  it("generates unique slugs for same title", () => {
    const slug1 = generateSlug("Same title");
    const slug2 = generateSlug("Same title");
    expect(slug1).not.toBe(slug2);
  });
});
