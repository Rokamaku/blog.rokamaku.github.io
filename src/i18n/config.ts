// Global Language Map
export const langMap: Record<string, string[]> = {
  zh: ["zh-CN"],
  "zh-tw": ["zh-TW"],
  ja: ["ja-JP"],
  en: ["en-US"],
  es: ["es-ES"],
  ru: ["ru-RU"],
  vi: ["vi-VN"],
};

// Waline Language Map
// https://waline.js.org/guide/i18n.html
export const walineLocaleMap: Record<string, string> = {
  zh: "zh-CN",
  "zh-tw": "zh-TW",
  ja: "jp-JP", // Waline uses jp-JP instead of ja-JP
  en: "en-US",
  es: "es-ES",
  ru: "ru-RU",
  vi: "vi-VN",
};

// Supported Languages
export const supportedLangs = Object.keys(langMap).flat();
