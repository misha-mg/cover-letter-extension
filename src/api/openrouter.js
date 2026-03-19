// OpenRouter wrapper using Vercel AI SDK (ai@5) and @openrouter/ai-sdk-provider.
// Loads provider lazily to avoid blocking popup/background startup.
(function (global) {
  const getPromptBuilder = () => {
    const promptBuilder = global.CoverPrompt;
    if (
      !promptBuilder ||
      typeof promptBuilder.buildGenerationRequest !== 'function'
    ) {
      throw new Error(
        'Prompt builder is missing. Ensure src/api/prompt.js is loaded.'
      );
    }
    return promptBuilder;
  };

  let clientPromise;

  async function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = (async () => {
      const [{ createOpenRouter }, { generateText }] = await Promise.all([
        import('@openrouter/ai-sdk-provider'),
        import('ai'),
      ]);

      const apiKey = global.ENV?.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error('OPENROUTER_API_KEY is required');

      const baseURL = (
        global.ENV?.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1'
      ).replace(/\/$/, '');
      const headers = {
        'X-Title': global.ENV?.OPENROUTER_TITLE || 'Cover Letter Generator',
        'HTTP-Referer':
          global.ENV?.OPENROUTER_REFERER ||
          'https://cover-letter-extension.local',
      };
      try {
        const origin = global?.location?.origin;
        if (!headers['HTTP-Referer'] && origin)
          headers['HTTP-Referer'] = origin;
      } catch (_) {}

      const openrouter = createOpenRouter({
        apiKey,
        baseURL,
        headers,
      });

      return { openrouter, generateText };
    })();
    return clientPromise;
  }

  async function generateCoverLetterDetailed(
    template = '',
    job = '',
    options = {}
  ) {
    const { openrouter, generateText } = await getClient();
    const modelId = global.ENV?.OPENROUTER_MODEL || 'openai/gpt-5-mini';
    const temperature = global.ENV?.TEMPERATURE ?? 0.5;
    const maxTokens = global.ENV?.MAX_TOKENS ?? 1000;
    const promptBuilder = getPromptBuilder();
    const request = promptBuilder.buildGenerationRequest({
      template,
      job,
      pageContext: options.pageContext || {},
    });

    const result = await generateText({
      model: openrouter(modelId, { usage: { include: true } }),
      system: request.system,
      prompt: request.prompt,
      temperature,
      maxTokens,
    });

    const text =
      result?.text ||
      (Array.isArray(result?.content) && result.content[0]?.text) ||
      '';
    if (!text) throw new Error('Empty response from model');

    return {
      text,
    };
  }

  async function generateCoverLetter(template = '', job = '', options = {}) {
    const result = await generateCoverLetterDetailed(template, job, options);
    return result.text;
  }

  const callOpenAI = (defaultCoverLetter, currentOffer, options = {}) =>
    generateCoverLetter(defaultCoverLetter || '', currentOffer || '', options);

  global.CoverAPI = {
    generateCoverLetter,
    generateCoverLetterDetailed,
    callOpenAI,
  };
})(typeof window !== 'undefined' ? window : globalThis);
