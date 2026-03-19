// Copy this file to src/config/env.js and fill in your OpenRouter credentials.
// env.js is gitignored; keep your real key local only.
const __COVER_ENV_GLOBAL__ =
  typeof window !== 'undefined' ? window : globalThis;
__COVER_ENV_GLOBAL__.ENV = {
  OPENROUTER_API_BASE: 'https://openrouter.ai/api/v1',
  OPENROUTER_API_KEY: '<your-openrouter-api-key>',
  OPENROUTER_MODEL: 'openai/gpt-4o-mini',
  TIMEOUT_MS: 30000,
  MAX_TOKENS: 15000,
  TEMPERATURE: 0.5,
  OPENROUTER_REFERER: 'https://cover-letter-extension.local',
  OPENROUTER_TITLE: 'Cover Letter Generator',
};
