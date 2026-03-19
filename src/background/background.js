// Load shared scripts (config, prompt, API, clipboard) in order.
const __COVER_SCRIPTS__ = [
  'src/config/env.js',
  'src/api/candidate-profile.js',
  'src/api/prompt.js',
  'dist/openrouter.bundle.js',
  'src/api/clipboard.js',
];
__COVER_SCRIPTS__.forEach((path) => {
  try {
    importScripts(chrome.runtime.getURL(path));
  } catch (e) {
    console.error('Failed to import script', path, e);
  }
});

const notify = (message) =>
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Cover Letter Generator',
    message,
  });

async function getTabContext(tabId) {
  if (!tabId) return {};
  try {
    const tab = await chrome.tabs.get(tabId);
    return {
      title: tab?.title || '',
      url: tab?.url || '',
    };
  } catch (e) {
    return {};
  }
}

async function pushHistory(entry) {
  const { generationHistory = [] } = await chrome.storage.local.get([
    'generationHistory',
  ]);
  const nextHistory = [entry, ...generationHistory].slice(0, 10);
  await chrome.storage.local.set({ generationHistory: nextHistory });
}

function buildGenerationMeta(source, pageContext) {
  return {
    source,
    generatedAt: new Date().toISOString(),
    pageTitle: pageContext.title || '',
    pageUrl: pageContext.url || '',
  };
}

async function generateAndCopy(tabId, source = 'selection') {
  const { defaultCoverLetter = '', currentOffer = '' } =
    await chrome.storage.local.get(['defaultCoverLetter', 'currentOffer']);

  if (!defaultCoverLetter.trim() || !currentOffer.trim()) {
    notify('Missing template or job text. Open the popup to add them.');
    return;
  }

  const pageContext = await getTabContext(tabId);
  await chrome.storage.local.set({
    generationState: {
      status: 'loading',
      source,
      startedAt: new Date().toISOString(),
      pageTitle: pageContext.title || '',
      pageUrl: pageContext.url || '',
    },
  });

  let generationResult;
  try {
    if (
      !globalThis.CoverAPI ||
      !globalThis.CoverAPI.generateCoverLetterDetailed
    ) {
      throw new Error('CoverAPI is unavailable. Ensure scripts are loaded.');
    }
    generationResult = await globalThis.CoverAPI.generateCoverLetterDetailed(
      defaultCoverLetter,
      currentOffer,
      {
        pageContext,
      }
    );
  } catch (e) {
    await chrome.storage.local.set({
      generationState: {
        status: 'error',
        source,
        finishedAt: new Date().toISOString(),
        errorMessage: e?.message || 'Unknown error',
      },
    });
    notify('Generation failed: ' + (e?.message || 'Unknown error'));
    return;
  }

  const generated = generationResult.text;
  let insertResult = { success: false };
  if (
    tabId &&
    globalThis.CoverClipboard &&
    typeof globalThis.CoverClipboard.insertIntoTab === 'function'
  ) {
    try {
      insertResult = await globalThis.CoverClipboard.insertIntoTab(
        tabId,
        generated
      );
    } catch (e) {
      insertResult = { success: false, error: e?.message };
      console.error('Insert into tab failed', e);
    }
  }

  let copySuccess = false;
  if (
    tabId &&
    globalThis.CoverClipboard &&
    typeof globalThis.CoverClipboard.copyToTab === 'function'
  ) {
    try {
      copySuccess = await globalThis.CoverClipboard.copyToTab(tabId, generated);
    } catch (e) {
      copySuccess = false;
      console.error('Copy to tab failed', e);
    }
  }

  const generationMeta = buildGenerationMeta(source, pageContext);

  try {
    await chrome.storage.local.set({
      lastGenerated: generated,
      generationMeta: {
        ...generationMeta,
        delivery: {
          inserted: insertResult.success === true,
          copied: copySuccess,
        },
      },
      generationState: {
        status: 'success',
        source,
        finishedAt: generationMeta.generatedAt,
      },
    });
    await pushHistory({
      generatedText: generated,
      ...generationMeta,
    });
  } catch (_) {}

  if (
    globalThis.CoverClipboard &&
    typeof globalThis.CoverClipboard.openPopupAndNotify === 'function'
  ) {
    if (
      copySuccess &&
      tabId &&
      typeof globalThis.CoverClipboard.showFeedbackInTab === 'function'
    ) {
      await globalThis.CoverClipboard.showFeedbackInTab(tabId, {
        message: 'Cover letter generated and copied to clipboard',
      });
    }
    await globalThis.CoverClipboard.openPopupAndNotify({
      insertSuccess: insertResult.success === true,
      copySuccess,
    });
  } else {
    notify(
      globalThis.CoverClipboard
        ? globalThis.CoverClipboard.buildDeliveryMessage({
            insertSuccess: insertResult.success === true,
            copySuccess,
          })
        : copySuccess
          ? 'Generated text copied to clipboard.'
          : 'Generated text ready, but clipboard copy may have failed.'
    );
  }
}

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-job-text',
    title: 'Generate Cover Letter',
    contexts: ['selection'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'add-job-text') return;

  if (info.selectionText) {
    const selected = info.selectionText;
    chrome.storage.local.set({ currentOffer: selected });
    chrome.runtime.sendMessage({
      action: 'setCurrentOffer',
      text: selected,
      mode: 'replace',
    });
  }

  setTimeout(() => generateAndCopy(tab?.id, 'selection'), 200);
});

// Keyboard shortcut command handler (Alt+Shift+L)
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'generate_cover_letter') return;

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab || !activeTab.id) return;

  const selectionResults = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () =>
      window.getSelection ? window.getSelection().toString() || '' : '',
  });
  const selected =
    Array.isArray(selectionResults) &&
    selectionResults[0] &&
    typeof selectionResults[0].result === 'string'
      ? selectionResults[0].result
      : '';
  if (selected) {
    await chrome.storage.local.set({ currentOffer: selected });
    chrome.runtime.sendMessage({
      action: 'setCurrentOffer',
      text: selected,
      mode: 'replace',
    });
  }

  setTimeout(() => generateAndCopy(activeTab.id, 'shortcut'), 200);
});
