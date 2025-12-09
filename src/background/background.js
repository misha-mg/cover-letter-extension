// Load shared scripts (config, prompt, API, clipboard) in order.
const __COVER_SCRIPTS__ = [
  'src/config/env.js',
  'src/api/prompt.js',
  'dist/openrouter.bundle.js',
  'src/api/clipboard.js'
];
__COVER_SCRIPTS__.forEach((path) => {
  try { importScripts(chrome.runtime.getURL(path)); } catch (e) { console.error('Failed to import script', path, e); }
});

const notify = (message) => chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icon.png',
  title: 'Cover Letter Generator',
  message
});

async function generateAndCopy(tabId) {
  const { defaultCoverLetter = '', currentOffer = '' } = await chrome.storage.local.get(['defaultCoverLetter', 'currentOffer']);

  if (!defaultCoverLetter.trim() || !currentOffer.trim()) {
    notify('Missing template or job text. Open the popup to add them.');
    return;
  }

  let generated = '';
  try {
    if (!globalThis.CoverAPI || !globalThis.CoverAPI.generateCoverLetter) {
      throw new Error('CoverAPI is unavailable. Ensure scripts are loaded.');
    }
    generated = await globalThis.CoverAPI.generateCoverLetter(defaultCoverLetter, currentOffer);
  } catch (e) {
    notify('Generation failed: ' + (e?.message || 'Unknown error'));
    return;
  }

  let copySuccess = false;
  if (tabId && globalThis.CoverClipboard && typeof globalThis.CoverClipboard.copyToTab === 'function') {
    try {
      copySuccess = await globalThis.CoverClipboard.copyToTab(tabId, generated);
    } catch (e) {
      copySuccess = false;
      console.error('Copy to tab failed', e);
    }
  }

  try { await chrome.storage.local.set({ lastGenerated: generated }); } catch (_) {}

  if (globalThis.CoverClipboard && typeof globalThis.CoverClipboard.openPopupAndNotify === 'function') {
    await globalThis.CoverClipboard.openPopupAndNotify(copySuccess);
  } else {
    notify(copySuccess ? 'Generated text copied to clipboard.' : 'Generated text ready, but clipboard copy may have failed.');
  }
}

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-job-text',
    title: 'Generate Cover Letter',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'add-job-text') return;

  if (info.selectionText) {
    const selected = info.selectionText;
    chrome.storage.local.set({ currentOffer: selected });
    chrome.runtime.sendMessage({ action: 'setCurrentOffer', text: selected });
  }

  setTimeout(() => generateAndCopy(tab?.id), 200);
});

// Keyboard shortcut command handler (Alt+Shift+L)
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'generate_cover_letter') return;

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || !activeTab.id) return;

  const selectionResults = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => window.getSelection ? (window.getSelection().toString() || '') : ''
  });
  const selected = (Array.isArray(selectionResults) && selectionResults[0] && typeof selectionResults[0].result === 'string') ? selectionResults[0].result : '';
  if (selected) {
    await chrome.storage.local.set({ currentOffer: selected });
    chrome.runtime.sendMessage({ action: 'setCurrentOffer', text: selected });
  }

  setTimeout(() => generateAndCopy(activeTab.id), 200);
});

