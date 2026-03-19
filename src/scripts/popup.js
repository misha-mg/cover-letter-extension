// Cover Letter Generator Extension (popup logic)
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const templateInput = document.getElementById('defaultCoverLetter');
  const jobInput = document.getElementById('currentOffer');
  const resultDiv = document.getElementById('result');
  const resultActions = document.getElementById('resultActions');
  const copyResultBtn = document.getElementById('copyResultBtn');
  const insertResultBtn = document.getElementById('insertResultBtn');
  const saveDefaultBtn = document.getElementById('saveDefaultBtn');
  const saveStatus = document.getElementById('saveStatus');
  const clearJobBtn = document.getElementById('clearJobBtn');

  initStorageSync({
    templateInput,
    jobInput,
    generateBtn,
    saveStatus,
    resultDiv,
    resultActions,
  });
  initStorageWatchers({
    jobInput,
    resultDiv,
    resultActions,
    saveStatus,
  });
  initMessageListeners({ jobInput, saveStatus });
  initAutoSave({ templateInput, jobInput });
  initSaveTemplate({ templateInput, saveDefaultBtn, saveStatus });
  initResultActions({
    resultDiv,
    resultActions,
    copyResultBtn,
    insertResultBtn,
    saveStatus,
  });
  initClearJob({
    clearJobBtn,
    jobInput,
    resultDiv,
    resultActions,
  });
  initGenerate({
    templateInput,
    jobInput,
    generateBtn,
    resultDiv,
    resultActions,
    saveStatus,
  });
});

function initStorageSync({
  templateInput,
  jobInput,
  generateBtn,
  saveStatus,
  resultDiv,
  resultActions,
}) {
  chrome.storage.local.get(
    ['defaultCoverLetter', 'currentOffer', 'autoGenerate', 'lastGenerated'],
    (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading from storage:', chrome.runtime.lastError);
        showSaveStatus(saveStatus, 'Error loading saved data', 'error');
        return;
      }

      if (result.defaultCoverLetter) {
        templateInput.value = result.defaultCoverLetter;
      }
      if (result.currentOffer) {
        jobInput.value = result.currentOffer;
      }

      if (result.defaultCoverLetter || result.currentOffer) {
        setTimeout(
          () => showSaveStatus(saveStatus, 'Previous text restored', 'success'),
          100
        );
      }

      if (result.lastGenerated) {
        showResult(resultDiv, resultActions, result.lastGenerated, 'success');
      }
      maybeAutoGenerate({ result, templateInput, jobInput, generateBtn });
    }
  );
}

function maybeAutoGenerate({ result, templateInput, jobInput, generateBtn }) {
  const urlHasAuto = new URLSearchParams(location.search).has('auto');
  if (!generateBtn || (!result.autoGenerate && !urlHasAuto)) return;

  setTimeout(() => {
    const template = templateInput.value.trim();
    const job = jobInput.value.trim();
    if (template && job) generateBtn.click();
    chrome.storage.local.remove('autoGenerate');
  }, 150);
}

function initStorageWatchers({
  jobInput,
  resultDiv,
  resultActions,
  saveStatus,
}) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;

    if (changes.currentOffer) {
      jobInput.value = changes.currentOffer.newValue || '';
    }

    if (changes.lastGenerated && changes.lastGenerated.newValue) {
      showResult(
        resultDiv,
        resultActions,
        changes.lastGenerated.newValue,
        'success'
      );
      showSaveStatus(saveStatus, 'Latest result restored', 'success');
    }
  });
}

function initMessageListeners({ jobInput, saveStatus }) {
  chrome.runtime.onMessage.addListener((request) => {
    if (
      request &&
      request.action === 'setCurrentOffer' &&
      typeof request.text === 'string'
    ) {
      const incoming = request.text.trim();
      if (!incoming) return;

      if (jobInput.value.trim() === incoming) {
        showSaveStatus(saveStatus, 'Job description already added', 'success');
        return;
      }

      const newText =
        request.mode === 'append' && jobInput.value.trim()
          ? `${jobInput.value.trim()}\n\n${incoming}`
          : incoming;
      jobInput.value = newText;
      chrome.storage.local.set({ currentOffer: newText });
      showSaveStatus(
        saveStatus,
        'Job description filled from selection',
        'success'
      );
    }
  });
}

function initAutoSave({ templateInput, jobInput }) {
  templateInput.addEventListener('input', function () {
    chrome.storage.local.set({ defaultCoverLetter: this.value }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving default cover letter:',
          chrome.runtime.lastError
        );
      }
    });
  });

  jobInput.addEventListener('input', function () {
    chrome.storage.local.set({ currentOffer: this.value }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving job description:',
          chrome.runtime.lastError
        );
      }
    });
  });
}

function initResultActions({
  resultDiv,
  resultActions,
  copyResultBtn,
  insertResultBtn,
  saveStatus,
}) {
  resultActions.style.display = 'none';

  copyResultBtn.addEventListener('click', async () => {
    const message = resultDiv.textContent.trim();
    if (!message) return;

    await navigator.clipboard.writeText(message);
    showSaveStatus(saveStatus, 'Copied to clipboard', 'success');
  });

  insertResultBtn.addEventListener('click', async () => {
    const message = resultDiv.textContent.trim();
    if (!message) return;

    const activeTab = await getActiveTab();
    if (!activeTab?.id || !globalThis.CoverClipboard) {
      showSaveStatus(saveStatus, 'No active tab found for insertion', 'error');
      return;
    }

    const insertResult = await globalThis.CoverClipboard.insertIntoTab(
      activeTab.id,
      message
    );
    if (insertResult.success) {
      showSaveStatus(saveStatus, 'Inserted into the page', 'success');
      return;
    }

    showSaveStatus(
      saveStatus,
      insertResult.error || 'Could not insert into the page',
      'error'
    );
  });
}

function initSaveTemplate({ templateInput, saveDefaultBtn, saveStatus }) {
  saveDefaultBtn.addEventListener('click', () => {
    const template = templateInput.value.trim();
    if (!template) {
      showSaveStatus(
        saveStatus,
        'Please enter a default cover letter to save',
        'error'
      );
      return;
    }
    saveDefaultBtn.textContent = 'Saving...';
    saveDefaultBtn.disabled = true;
    chrome.storage.local.set({ defaultCoverLetter: template }, () => {
      saveDefaultBtn.textContent = 'Save as template';
      saveDefaultBtn.disabled = false;
      if (chrome.runtime.lastError) {
        console.error('Error saving template:', chrome.runtime.lastError);
        showSaveStatus(
          saveStatus,
          'Failed to save: ' + chrome.runtime.lastError.message,
          'error'
        );
      } else {
        showSaveStatus(saveStatus, 'Template saved successfully!', 'success');
      }
    });
  });
}

function initClearJob({ clearJobBtn, jobInput, resultDiv, resultActions }) {
  clearJobBtn.addEventListener('click', () => {
    jobInput.value = '';
    chrome.storage.local.set({ currentOffer: '' });
    resultDiv.style.display = 'none';
    resultActions.style.display = 'none';
  });
}

async function getActiveTab() {
  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return activeTab || null;
  } catch (_) {
    return null;
  }
}

async function getActiveTabContext() {
  const activeTab = await getActiveTab();
  return {
    title: activeTab?.title || '',
    url: activeTab?.url || '',
    tabId: activeTab?.id || null,
  };
}

function initGenerate({
  templateInput,
  jobInput,
  generateBtn,
  resultDiv,
  resultActions,
  saveStatus,
}) {
  generateBtn.addEventListener('click', () => {
    const template = templateInput.value.trim();
    const job = jobInput.value.trim();
    if (!template || !job) {
      showResult(
        resultDiv,
        resultActions,
        'Please fill in both fields before generating.',
        'error'
      );
      return;
    }

    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    (async () => {
      try {
        if (
          globalThis.CoverAPI &&
          globalThis.ENV &&
          globalThis.ENV.OPENROUTER_API_KEY
        ) {
          const pageContext = await getActiveTabContext();
          const generatedResult =
            await globalThis.CoverAPI.generateCoverLetterDetailed(
              template,
              job,
              {
                pageContext,
              }
            );
          const generated = generatedResult?.text || 'No content returned';
          showResult(resultDiv, resultActions, generated, 'success');
          chrome.storage.local.set({
            lastGenerated: generated,
            generationState: {
              status: 'success',
              source: 'popup',
              finishedAt: new Date().toISOString(),
            },
          });

          try {
            await navigator.clipboard.writeText(generated || '');
            showSaveStatus(saveStatus, 'Copied to clipboard', 'success');
            if (
              pageContext.tabId &&
              globalThis.CoverClipboard &&
              typeof globalThis.CoverClipboard.showFeedbackInTab === 'function'
            ) {
              await globalThis.CoverClipboard.showFeedbackInTab(
                pageContext.tabId,
                {
                  message: 'Cover letter generated and copied to clipboard',
                }
              );
            }
          } catch (_) {
            // Clipboard writes can fail in some popup contexts.
          }
        } else {
          showResult(
            resultDiv,
            resultActions,
            'No OpenRouter API key configured. Please set OPENROUTER_API_KEY in src/config/env.js.',
            'error'
          );
        }
      } catch (e) {
        showResult(
          resultDiv,
          resultActions,
          `Generation failed: ${e?.message || e}`,
          'error'
        );
      } finally {
        generateBtn.textContent = 'Generate';
        generateBtn.disabled = false;
      }
    })();
  });
}

function showResult(resultDiv, resultActions, message, type) {
  resultDiv.textContent = message;
  resultDiv.style.display = 'block';
  if (type === 'error') {
    resultDiv.style.borderLeft = '4px solid #ea4335';
    resultDiv.style.background = '#fce8e6';
  } else {
    resultDiv.style.borderLeft = '4px solid #34a853';
    resultDiv.style.background = '#f8f9fa';
  }

  resultActions.style.display = type === 'success' ? 'flex' : 'none';
}

function showSaveStatus(saveStatus, message, type) {
  if (!saveStatus) return;
  saveStatus.textContent = message;
  saveStatus.className = 'save-status ' + type;
  setTimeout(() => {
    saveStatus.textContent = '';
    saveStatus.className = 'save-status';
  }, 3000);
}
