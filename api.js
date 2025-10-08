// Simple API wrapper for OpenAI requests (personal use)

async function callOpenAI(defaultCoverLetter, currentOffer) {
  if (!window.ENV || !window.ENV.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY in env.js');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), window.ENV.TIMEOUT_MS || 30000);

  // Clamp input to ~2000 tokens total (≈8000 chars), split by ratio
  const limit = window.ENV.INPUT_CHAR_LIMIT || 8000;
  const jobRatio = Math.min(Math.max(window.ENV.INPUT_JOB_RATIO ?? 0.6, 0), 1);
  const jobMax = Math.floor(limit * jobRatio);
  const tplMax = limit - jobMax;

  const tpl = (defaultCoverLetter || '').slice(0, tplMax);
  const job = (currentOffer || '').slice(0, jobMax);

  const prompt = `You are a helpful assistant who writes personalised cover letters. 
Write a personalised, concise cover letter using the tone of the template, but adapted to the specific vacancy.
Mention specific technologies that you encounter in the vacancy.
Make the letter clear and professional, but not overly long.
Use the company name and briefly mention the advantages of working with me.
Stick to the structure of the original letter.
The letter should not exceed 180 words.
Default template: ${tpl}
Job description: ${job}`;

  try {
    const isGpt5 = String(window.ENV.OPENAI_MODEL || '').includes('gpt-5');
    const tokenParamName = isGpt5 ? 'max_output_tokens' : 'max_tokens';

    let res;
    if (isGpt5) {
      // Responses API path for GPT-5 (no top-level 'system')
      const systemInstruction = 'You write professional, concise cover letters.';
      const payload = {
        model: window.ENV.OPENAI_MODEL,
        input: `${systemInstruction}\n\n${prompt}`,
        [tokenParamName]: window.ENV.MAX_TOKENS ?? 400
      };

      if (window.ENV.REASONING_EFFORT && window.ENV.REASONING_EFFORT !== 'none') {
        payload.reasoning = { effort: window.ENV.REASONING_EFFORT };
      }
      const endpoint = `${String(window.ENV.OPENAI_API_BASE).replace(/\/$/, '')}/responses`;
      try {
        console.log('OpenAI request (Responses API)', {
          endpoint,
          model: payload.model,
          tokenParamName,
          headers: { Authorization: 'Bearer ****', 'Content-Type': 'application/json' },
          body: payload
        });
      } catch(_) {}
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.ENV.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } else {
      // Chat Completions path for other models
      const payload = {
        model: window.ENV.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You write professional, concise cover letters.' },
          { role: 'user', content: prompt }
        ],
        [tokenParamName]: window.ENV.MAX_TOKENS ?? 400,
        temperature: window.ENV.TEMPERATURE ?? 0.5,
        top_p: window.ENV.TOP_P ?? 1,
        presence_penalty: window.ENV.PRESENCE_PENALTY ?? 0,
        frequency_penalty: window.ENV.FREQUENCY_PENALTY ?? 0
      };
      const endpoint = `${String(window.ENV.OPENAI_API_BASE).replace(/\/$/, '')}/chat/completions`;
      try {
        console.log('OpenAI request (Chat Completions)', {
          endpoint,
          model: payload.model,
          tokenParamName,
          headers: { Authorization: 'Bearer ****', 'Content-Type': 'application/json' },
          body: payload
        });
      } catch(_) {}
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.ENV.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Request failed');
    }

    const data = await res.json();
    let text = '';
    // 1) Convenience field (Responses API)
    if (typeof data.output_text === 'string' && data.output_text.trim()) {
      text = data.output_text.trim();
    }
    // 2) Responses API structured output → aggregate all text fragments
    if (!text && Array.isArray(data.output)) {
      const parts = [];
      for (const item of data.output) {
        const content = item && item.content;
        if (Array.isArray(content)) {
          for (const c of content) {
            if (typeof c?.text === 'string') {
              parts.push(c.text);
            } else if (typeof c?.text?.value === 'string') {
              parts.push(c.text.value);
            } else if (typeof c?.value === 'string') {
              parts.push(c.value);
            }
          }
        }
      }
      if (parts.length) text = parts.join('\n').trim();
    }
    // 3) Chat Completions fallback
    if (!text && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
      text = String(data.choices[0].message.content).trim();
    }

    if (!text) {
      throw new Error('Empty response from model');
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

window.CoverAPI = { callOpenAI };


