// Cover Letter Generator Extension (popup logic)
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const templateInput = document.getElementById('defaultCoverLetter');
  const jobInput = document.getElementById('currentOffer');
  const resultDiv = document.getElementById('result');
  const saveDefaultBtn = document.getElementById('saveDefaultBtn');
  const saveStatus = document.getElementById('saveStatus');

  initStorageSync({ templateInput, jobInput, generateBtn, saveStatus });
  initMessageListeners({ jobInput, saveStatus });
  initAutoSave({ templateInput, jobInput });
  initSaveTemplate({ templateInput, saveDefaultBtn, saveStatus });
  initGenerate({ templateInput, jobInput, generateBtn, resultDiv, saveStatus });
});

function initStorageSync({ templateInput, jobInput, generateBtn, saveStatus }) {
  chrome.storage.local.get(['defaultCoverLetter', 'currentOffer', 'autoGenerate'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading from storage:', chrome.runtime.lastError);
      showSaveStatus(saveStatus, 'Error loading saved data', 'error');
      return;
    }

    if (result.defaultCoverLetter) templateInput.value = result.defaultCoverLetter;
    if (result.currentOffer) jobInput.value = result.currentOffer;

    if (result.defaultCoverLetter || result.currentOffer) {
      setTimeout(() => showSaveStatus(saveStatus, 'Previous text restored', 'success'), 100);
    }

    maybeAutoGenerate({ result, templateInput, jobInput, generateBtn });
  });
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

function initMessageListeners({ jobInput, saveStatus }) {
  chrome.runtime.onMessage.addListener((request) => {
    if (request && request.action === 'setCurrentOffer' && typeof request.text === 'string') {
      const existingText = jobInput.value.trim();
      const incoming = request.text.trim();
      if (incoming && existingText.endsWith(incoming)) {
        showSaveStatus(saveStatus, 'Job description already added', 'success');
        return;
      }
      const newText = existingText ? `${existingText}\n\n${incoming}` : incoming;
      jobInput.value = newText;
      chrome.storage.local.set({ currentOffer: newText });
      showSaveStatus(saveStatus, 'Job description filled from selection', 'success');
    }
  });
}

function initAutoSave({ templateInput, jobInput }) {
  templateInput.addEventListener('input', function() {
    chrome.storage.local.set({ defaultCoverLetter: this.value }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving default cover letter:', chrome.runtime.lastError);
      }
    });
  });

  jobInput.addEventListener('input', function() {
    chrome.storage.local.set({ currentOffer: this.value }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving job description:', chrome.runtime.lastError);
      }
    });
  });
}

function initSaveTemplate({ templateInput, saveDefaultBtn, saveStatus }) {
  saveDefaultBtn.addEventListener('click', () => {
    const template = templateInput.value.trim();
    if (!template) {
      showSaveStatus(saveStatus, 'Please enter a default cover letter to save', 'error');
      return;
    }
    saveDefaultBtn.textContent = 'Saving...';
    saveDefaultBtn.disabled = true;
    chrome.storage.local.set({ defaultCoverLetter: template }, () => {
      saveDefaultBtn.textContent = 'Save as Template';
      saveDefaultBtn.disabled = false;
      if (chrome.runtime.lastError) {
        console.error('Error saving template:', chrome.runtime.lastError);
        showSaveStatus(saveStatus, 'Failed to save: ' + chrome.runtime.lastError.message, 'error');
      } else {
        showSaveStatus(saveStatus, 'Template saved successfully!', 'success');
      }
    });
  });
}

function initGenerate({ templateInput, jobInput, generateBtn, resultDiv, saveStatus }) {
  generateBtn.addEventListener('click', () => {
    const template = templateInput.value.trim();
    const job = jobInput.value.trim();
    if (!template || !job) {
      showResult(resultDiv, 'Please fill in both fields before generating.', 'error');
      return;
    }

    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    (async () => {
      try {
        if (globalThis.CoverAPI && globalThis.ENV && globalThis.ENV.OPENROUTER_API_KEY) {
          const generated = await globalThis.CoverAPI.callOpenAI(template, job);
          showResult(resultDiv, generated || 'No content returned', 'success');
          try {
            await navigator.clipboard.writeText(generated || '');
            showSaveStatus(saveStatus, 'Copied to clipboard', 'success');
          } catch (_) {}
        } else {
          showResult(resultDiv, 'No OpenRouter API key configured. Please set OPENROUTER_API_KEY in src/config/env.js.', 'error');
        }
      } catch (e) {
        showResult(resultDiv, `Generation failed: ${e?.message || e}`, 'error');
      } finally {
        generateBtn.textContent = 'Generate';
        generateBtn.disabled = false;
      }
    })();
  });
}

function showResult(resultDiv, message, type) {
  resultDiv.textContent = message;
  resultDiv.style.display = 'block';
  if (type === 'error') {
    resultDiv.style.borderLeft = '4px solid #ea4335';
    resultDiv.style.background = '#fce8e6';
  } else {
    resultDiv.style.borderLeft = '4px solid #34a853';
    resultDiv.style.background = '#f8f9fa';
  }

  const existing = document.querySelector('.copy-btn');
  if (existing) existing.remove();

  if (type === 'success') {
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.className = 'copy-btn';

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(message).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    });

    resultDiv.insertAdjacentElement('afterend', copyBtn);
  }
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
