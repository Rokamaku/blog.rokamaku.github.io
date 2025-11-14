import { describe, expect, it } from "vitest";
import {
  buildNextLangPath,
  getLocalizedPath,
  getNextGlobalLangPath,
  getNextSupportedLangPath,
  getTagPath,
} from "./path";

// Note: Based on config.ts, defaultLocale is "vi" and moreLocales is ["en"]

describe("getTagPath", () => {
  it("should return path without language prefix for default locale", () => {
    const result = getTagPath("javascript", "vi");
    expect(result).toBe("/tags/javascript/");
  });

  it("should return path with language prefix for non-default locale", () => {
    const result = getTagPath("javascript", "en");
    expect(result).toBe("/en/tags/javascript/");
  });

  it("should handle special characters in tag names", () => {
    const result = getTagPath("c++", "en");
    expect(result).toBe("/en/tags/c++/");
  });
});

describe("getLocalizedPath", () => {
  it("should return root path for default locale with empty path", () => {
    const result = getLocalizedPath("", "vi");
    expect(result).toBe("/");
  });

  it("should return language-prefixed root for non-default locale with empty path", () => {
    const result = getLocalizedPath("", "en");
    expect(result).toBe("/en/");
  });

  it("should return path without language prefix for default locale", () => {
    const result = getLocalizedPath("about", "vi");
    expect(result).toBe("/about/");
  });

  it("should return path with language prefix for non-default locale", () => {
    const result = getLocalizedPath("about", "en");
    expect(result).toBe("/en/about/");
  });

  it("should handle paths with trailing slashes", () => {
    const result = getLocalizedPath("posts/hello-world/", "en");
    expect(result).toBe("/en/posts/hello-world/");
  });

  it("should handle paths without trailing slashes", () => {
    const result = getLocalizedPath("posts/hello-world", "en");
    expect(result).toBe("/en/posts/hello-world/");
  });
});

describe("buildNextLangPath", () => {
  it("should handle root path switching from default to non-default locale", () => {
    const result = buildNextLangPath("/", "vi", "en");
    expect(result).toBe("/en/");
  });

  it("should handle root path switching from non-default to default locale", () => {
    const result = buildNextLangPath("/", "en", "vi");
    expect(result).toBe("/");
  });

  it("should switch from default locale to non-default locale", () => {
    const result = buildNextLangPath("/posts/hello/", "vi", "en");
    expect(result).toBe("/en/posts/hello/");
  });

  it("should switch from non-default locale to default locale", () => {
    const result = buildNextLangPath("/en/posts/hello/", "en", "vi");
    expect(result).toBe("/posts/hello/");
  });

  it("should switch between two non-default locales", () => {
    const result = buildNextLangPath("/en/posts/hello/", "en", "zh");
    expect(result).toBe("/zh/posts/hello/");
  });

  it("should ensure trailing slash is present", () => {
    const result = buildNextLangPath("/en/posts/hello", "en", "vi");
    expect(result).toBe("/posts/hello/");
  });

  it("should handle complex nested paths", () => {
    const result = buildNextLangPath(
      "/en/posts/category/subcategory/article/",
      "en",
      "vi",
    );
    expect(result).toBe("/posts/category/subcategory/article/");
  });
});

describe("getNextGlobalLangPath", () => {
  it("should cycle through available languages for default locale", () => {
    // With defaultLocale = "vi" and moreLocales = ["en"]
    // From vi, next should be en
    const result = getNextGlobalLangPath("/posts/hello/");
    expect(result).toBe("/en/posts/hello/");
  });

  it("should cycle back to default locale from last language", () => {
    // From en, next should be vi (back to default)
    const result = getNextGlobalLangPath("/en/posts/hello/");
    expect(result).toBe("/posts/hello/");
  });

  it("should handle root path", () => {
    const result = getNextGlobalLangPath("/");
    expect(result).toBe("/en/");
  });

  it("should handle non-default locale root path", () => {
    const result = getNextGlobalLangPath("/en/");
    expect(result).toBe("/");
  });
});

describe("getNextSupportedLangPath", () => {
  it("should cycle through supported languages in order", () => {
    const supportedLangs = ["vi", "en"];
    const result = getNextSupportedLangPath("/posts/hello/", supportedLangs);
    expect(result).toBe("/en/posts/hello/");
  });

  it("should cycle back to first language from last", () => {
    const supportedLangs = ["vi", "en"];
    const result = getNextSupportedLangPath("/en/posts/hello/", supportedLangs);
    expect(result).toBe("/posts/hello/");
  });

  it("should handle single language in supported list", () => {
    const supportedLangs = ["vi"];
    const result = getNextSupportedLangPath("/posts/hello/", supportedLangs);
    // Should cycle back to the same language
    expect(result).toBe("/posts/hello/");
  });

  it("should fallback to global language path when no supported langs provided", () => {
    const supportedLangs: string[] = [];
    const result = getNextSupportedLangPath("/posts/hello/", supportedLangs);
    // Should use getNextGlobalLangPath behavior
    expect(result).toBe("/en/posts/hello/");
  });

  it("should respect global language priority order", () => {
    // Languages should be sorted by global priority (defaultLocale, ...moreLocales)
    const supportedLangs = ["en", "vi"]; // Unsorted
    const result = getNextSupportedLangPath("/posts/hello/", supportedLangs);
    // Should be sorted as vi, en (vi is default)
    expect(result).toBe("/en/posts/hello/");
  });

  it("should cycle through multiple supported languages", () => {
    // Note: Only vi and en are in the global locale list (defaultLocale + moreLocales)
    // The function sorts by global priority before cycling
    const supportedLangs = ["vi", "en"];

    const fromVi = getNextSupportedLangPath("/posts/hello/", supportedLangs);
    expect(fromVi).toBe("/en/posts/hello/");

    const fromEn = getNextSupportedLangPath("/en/posts/hello/", supportedLangs);
    expect(fromEn).toBe("/posts/hello/");
  });
});
