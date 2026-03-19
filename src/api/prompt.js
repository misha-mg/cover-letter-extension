// Shared prompt builder for cover letter generation.
// Exposed globally so popup/background can reuse a single generation pipeline.
const __COVER_PROMPT_GLOBAL__ =
  typeof window !== 'undefined' ? window : globalThis;

function getCandidateProfile() {
  const profile = __COVER_PROMPT_GLOBAL__.CoverCandidateProfile?.PROFILE;
  if (!profile) {
    throw new Error(
      'Candidate profile is missing. Ensure src/api/candidate-profile.js is loaded.'
    );
  }
  return profile;
}

const DEFAULT_SYSTEM_PROMPT = `
You write highly tailored cover letters for front-end developer roles.

Rules:
- Use only facts provided in the candidate profile and the supplied job description.
- Never invent companies, achievements, years, titles, or technologies.
- Follow the tone and structure of the base letter, but improve clarity and specificity.
- Mention only technologies supported by the candidate profile.
- Keep the letter concise, natural, and specific. Avoid generic enthusiasm and empty clichés.
- Prefer 2 short body paragraphs plus a brief closing.
- Target 130-180 words.
- Output plain text only. No bullet points, no markdown, no headings.
`;

function buildGenerationRequest({ template = '', job = '', pageContext = {} }) {
  const profile = getCandidateProfile();
  const profileSnapshot =
    __COVER_PROMPT_GLOBAL__.CoverCandidateProfile.buildProfileSnapshot(profile);
  const achievementsSnapshot = (profile.achievements || [])
    .map(
      (achievement) =>
        `- ${achievement.title} (${achievement.metric}). ${achievement.evidence}`
    )
    .join('\n');

  const prompt = `
Candidate profile:
${profileSnapshot}

Available achievements and evidence:
${achievementsSnapshot}

Things the candidate must not claim:
${profile.guardrails.doNotClaim.map((item) => `- ${item}`).join('\n')}

Page context:
- Title: ${pageContext.title || 'Unknown'}
- URL: ${pageContext.url || 'Unknown'}

Writing task:
- Write a personalized cover letter for this vacancy.
- Target length: 130-180 words.
- Highlight 2-4 of the strongest matching proof points.
- Explain why the candidate is useful for this team in concrete terms.
- Do not mention every skill from the profile. Curate only the most relevant details.
- If the vacancy asks for a technology the candidate does not have, avoid claiming it and pivot to adjacent strengths.
- Balance personality, relevance, and technical credibility.
- Use 2-4 proof points with a natural flow.

Cover letter example:
${template || 'No base template provided.'}

Vacancy text:
${job || 'No vacancy text provided.'}
`;

  return {
    system: DEFAULT_SYSTEM_PROMPT,
    prompt,
  };
}

__COVER_PROMPT_GLOBAL__.CoverPrompt = {
  DEFAULT_SYSTEM_PROMPT,
  buildGenerationRequest,
};
