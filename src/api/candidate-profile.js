// Reads candidate facts from src/config/candidate-profile.local.js (gitignored).
// Copy candidate-profile.example.js → candidate-profile.local.js, or run npm install.
const __COVER_CANDIDATE_GLOBAL__ =
  typeof window !== 'undefined' ? window : globalThis;

const CANDIDATE_PROFILE =
  __COVER_CANDIDATE_GLOBAL__.__COVER_CANDIDATE_PROFILE__;

function formatProfileSection(title, values) {
  if (!Array.isArray(values) || values.length === 0) return '';
  return `${title}: ${values.join(', ')}`;
}

function snapshotLine(label, value) {
  if (value == null) return '';
  const s = String(value).trim();
  if (!s) return '';
  return `${label}: ${s}`;
}

function formatEducationList(education) {
  if (!Array.isArray(education) || education.length === 0) return '';
  const lines = education.map(
    (e) => `- ${e.degree}, ${e.school} (${e.period})`
  );
  return `Education:\n${lines.join('\n')}`;
}

function formatRolesBlock(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return '';
  const blocks = roles.map((r) => {
    const hl = (r.highlights || []).map((h) => `  - ${h}`).join('\n');
    return `${r.title} — ${r.company} (${r.period})\n${hl}`;
  });
  return `Work history:\n${blocks.join('\n\n')}`;
}

function formatPreferencesBlock(preferences) {
  if (!preferences || typeof preferences !== 'object') return '';
  const parts = [
    formatProfileSection('Target roles', preferences.targetRoles),
    formatProfileSection('Primary stack', preferences.primaryStack),
    formatProfileSection('Secondary stack', preferences.secondaryStack),
  ].filter(Boolean);
  if (!parts.length) return '';
  return `Preferences:\n${parts.join('\n')}`;
}

function formatSourceMetaBlock(sourceMeta) {
  if (!sourceMeta || typeof sourceMeta !== 'object') return '';
  const bits = [];
  if (sourceMeta.sourceFile) bits.push(`source file: ${sourceMeta.sourceFile}`);
  if (typeof sourceMeta.parsedFromCv === 'boolean')
    bits.push(`parsed from CV: ${sourceMeta.parsedFromCv}`);
  if (!bits.length) return '';
  return `Profile source: ${bits.join('; ')}`;
}

function buildProfileSnapshot(profile = CANDIDATE_PROFILE) {
  if (!profile || !profile.identity) {
    throw new Error(
      'Candidate profile is missing. Copy src/config/candidate-profile.example.js to src/config/candidate-profile.local.js (or run npm install), then reload the extension.'
    );
  }

  const id = profile.identity;
  const exp = profile.experience || {};

  const sections = [
    `Candidate: ${id.fullName}`,
    snapshotLine('Headline', id.headline),
    `Title: ${id.title}`,
    snapshotLine('Location', id.location),
    snapshotLine('Email', id.email),
    snapshotLine('LinkedIn', id.linkedin),
    snapshotLine('GitHub', id.github),
    snapshotLine('Telegram', id.telegram),
    `Summary: ${id.summary}`,
    snapshotLine('Commercial experience', exp.commercialYears),
    snapshotLine('Current level', exp.currentLevel),
    formatProfileSection('Focus areas', exp.focus),
    formatProfileSection('Core skills', profile.coreSkills),
    formatProfileSection('Secondary skills', profile.secondarySkills),
    formatProfileSection('AI skills', profile.aiSkills),
    formatProfileSection('AI tools', profile.aiTools),
    formatProfileSection(
      'Languages',
      (profile.languages || []).map(
        (language) => `${language.name} (${language.level})`
      )
    ),
    formatProfileSection('Soft skills', profile.softSkills),
    formatEducationList(profile.education),
    formatRolesBlock(profile.roles),
    formatProfileSection('Notable projects / clients', profile.projects),
    formatPreferencesBlock(profile.preferences),
    formatSourceMetaBlock(profile.sourceMeta),
  ].filter(Boolean);

  return sections.join('\n');
}

__COVER_CANDIDATE_GLOBAL__.CoverCandidateProfile = {
  PROFILE: CANDIDATE_PROFILE,
  buildProfileSnapshot,
};
