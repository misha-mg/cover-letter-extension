// Cover Letter Generator Extension (migrated to src/scripts)
document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generateBtn');
  const defaultCoverLetter = document.getElementById('defaultCoverLetter');
  const currentOffer = document.getElementById('currentOffer');
  const resultDiv = document.getElementById('result');
  const saveDefaultBtn = document.getElementById('saveDefaultBtn');
  const saveStatus = document.getElementById('saveStatus');

  // Load saved data from Chrome storage
  chrome.storage.local.get(['defaultCoverLetter', 'currentOffer', 'autoGenerate'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error loading from storage:', chrome.runtime.lastError);
      showSaveStatus('Error loading saved data', 'error');
      return;
    }
    if (result.defaultCoverLetter) {
      defaultCoverLetter.value = result.defaultCoverLetter;
    }
    if (result.currentOffer) {
      currentOffer.value = result.currentOffer;
    }
    if (result.defaultCoverLetter || result.currentOffer) {
      setTimeout(() => {
        showSaveStatus('Previous text restored', 'success');
      }, 100);
    }

    // If background requested auto-generation, trigger it once and clear the flag
    const urlHasAuto = new URLSearchParams(location.search).has('auto');
    if ((result.autoGenerate || urlHasAuto) && generateBtn) {
      setTimeout(() => {
        const defaultText = defaultCoverLetter.value.trim();
        const offerText = currentOffer.value.trim();
        if (defaultText && offerText) {
          generateBtn.click();
        }
        chrome.storage.local.remove('autoGenerate');
      }, 150);
    }
  });

  // Listen for messages (fill from selection)
  chrome.runtime.onMessage.addListener(function(request) {
    if (request && request.action === 'setCurrentOffer' && typeof request.text === 'string') {
      const existingText = currentOffer.value.trim();
      if (existingText.endsWith(request.text.trim())) {
        showSaveStatus('Offer text already added', 'success');
        return;
      }
      const newText = existingText ? existingText + '\n\n' + request.text : request.text;
      currentOffer.value = newText;
      chrome.storage.local.set({ currentOffer: newText });
      showSaveStatus('Offer text filled from selection', 'success');
    }
  });

  // Auto-save both text areas as user types
  defaultCoverLetter.addEventListener('input', function() {
    chrome.storage.local.set({defaultCoverLetter: this.value}, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving default cover letter:', chrome.runtime.lastError);
      }
    });
  });

  currentOffer.addEventListener('input', function() {
    chrome.storage.local.set({currentOffer: this.value}, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving current offer:', chrome.runtime.lastError);
      }
    });
  });

  // Handle Save Default Letter button click (explicit save confirmation)
  saveDefaultBtn.addEventListener('click', function() {
    const defaultText = defaultCoverLetter.value.trim();
    if (!defaultText) {
      showSaveStatus('Please enter a default cover letter to save', 'error');
      return;
    }
    saveDefaultBtn.textContent = 'Saving...';
    saveDefaultBtn.disabled = true;
    chrome.storage.local.set({defaultCoverLetter: defaultText}, function() {
      saveDefaultBtn.textContent = 'Save as Template';
      saveDefaultBtn.disabled = false;
      if (chrome.runtime.lastError) {
        console.error('Error saving template:', chrome.runtime.lastError);
        showSaveStatus('Failed to save: ' + chrome.runtime.lastError.message, 'error');
      } else {
        showSaveStatus('Template saved successfully!', 'success');
      }
    });
  });

  // Handle Generate button click
  generateBtn.addEventListener('click', function() {
    const defaultText = defaultCoverLetter.value.trim();
    const offerText = currentOffer.value.trim();
    if (!defaultText || !offerText) {
      showResult('Please fill in both fields before generating.', 'error');
      return;
    }
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    (async () => {
      try {
        if (window.CoverAPI && window.ENV && window.ENV.OPENAI_API_KEY) {
          const generated = await window.CoverAPI.callOpenAI(defaultText, offerText);
          showResult(generated || 'No content returned', 'success');
          try { await navigator.clipboard.writeText(generated || ''); showSaveStatus('Copied to clipboard', 'success'); } catch (_) {}
        } else {
          showResult('No OpenAI API key configured. Please set OPENAI_API_KEY in env.js or configure a proxy server.', 'error');
        }
      } catch (e) {
        showResult(`Generation failed: ${e.message || e}`, 'error');
      } finally {
        generateBtn.textContent = 'Generate';
        generateBtn.disabled = false;
      }
    })();
  });

  // Local generation helpers removed — generation now requires OpenAI API

  function showResult(message, type) {
    resultDiv.textContent = message;
    resultDiv.style.display = 'block';
    if (type === 'error') {
      resultDiv.style.borderLeft = '4px solid #ea4335';
      resultDiv.style.background = '#fce8e6';
    } else {
      resultDiv.style.borderLeft = '4px solid #34a853';
      resultDiv.style.background = '#f8f9fa';
    }
    if (type === 'success') {
      // Remove any existing copy button
      const existing = document.querySelector('.copy-btn');
      if (existing) existing.remove();

      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.className = 'copy-btn';

      copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(message).then(function() {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        });
      });

      // Place button after the result block
      resultDiv.insertAdjacentElement('afterend', copyBtn);
    }
  }

  function showSaveStatus(message, type) {
    if (saveStatus) {
      saveStatus.textContent = message;
      saveStatus.className = 'save-status ' + type;
      setTimeout(() => {
        saveStatus.textContent = '';
        saveStatus.className = 'save-status';
      }, 3000);
    }
  }
});
