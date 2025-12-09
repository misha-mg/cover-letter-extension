// OpenRouter wrapper using Vercel AI SDK (ai@5) and @openrouter/ai-sdk-provider.
// Loads provider lazily to avoid blocking popup/background startup.
(function(global) {
  const getPrompt = () => {
    const prompt = global.CoverPrompt && global.CoverPrompt.DEFAULT_SYSTEM_PROMPT;
    if (!prompt) {
      throw new Error('DEFAULT_SYSTEM_PROMPT is missing. Ensure src/api/prompt.js is loaded.');
    }
    return prompt;
  };

  let clientPromise;

  async function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = (async () => {
      const [{ createOpenRouter }, { generateText }] = await Promise.all([
        import('@openrouter/ai-sdk-provider'),
        import('ai')
      ]);

      const apiKey = global.ENV?.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error('OPENROUTER_API_KEY is required');

      const baseURL = (global.ENV?.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
      const headers = { 'X-Title': 'Cover Letter Generator' };
      try {
        const origin = global?.location?.origin;
        if (origin) headers['HTTP-Referer'] = origin;
      } catch (_) {}

      const openrouter = createOpenRouter({
        apiKey,
        baseURL,
        headers
      });

      return { openrouter, generateText };
    })();
    return clientPromise;
  }

  async function generateCoverLetter(template = '', job = '') {
    const { openrouter, generateText } = await getClient();
    const modelId = global.ENV?.OPENROUTER_MODEL || 'openai/gpt-5-mini';
    const temperature = global.ENV?.TEMPERATURE ?? 0.5;
    const maxTokens = global.ENV?.MAX_TOKENS ?? 1000;

    const prompt = `${getPrompt()}\n\nDefault template:\n${template || ''}\n\nJob description:\n${job || ''}`;

    const result = await generateText({
      model: openrouter(modelId, { usage: { include: true } }),
      prompt,
      temperature,
      maxTokens
    });

    const text = result?.text || (Array.isArray(result?.content) && result.content[0]?.text) || '';
    if (!text) throw new Error('Empty response from model');
    return text;
  }

  const callOpenAI = (defaultCoverLetter, currentOffer) => generateCoverLetter(defaultCoverLetter || '', currentOffer || '');

  global.CoverAPI = { generateCoverLetter, callOpenAI };
})(typeof window !== 'undefined' ? window : globalThis);

