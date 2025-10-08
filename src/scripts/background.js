// Background logic migrated from root background.js
// (duplicated here to remove wrapper indirection)

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
  if (info.menuItemId === 'add-job-text') {
    if (info.selectionText) {
      const selected = info.selectionText;
      chrome.storage.local.set({ currentOffer: selected });
      chrome.runtime.sendMessage({ action: 'setCurrentOffer', text: selected });
    }

    setTimeout(async () => {
      const mockResult = 'result';
      try {
        let copySuccess = false;
        if (tab && tab.id) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async (text) => {
              async function writeWithClipboardApi(t) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(t);
                  return true;
                }
                return false;
              }
              function writeWithExecCommand(t) {
                const textarea = document.createElement('textarea');
                textarea.value = t;
                textarea.style.position = 'fixed';
                textarea.style.top = '-1000px';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(textarea);
                return ok;
              }
              try {
                const apiWorked = await writeWithClipboardApi(text);
                if (apiWorked) return { success: true };
                const fallbackWorked = writeWithExecCommand(text);
                return { success: fallbackWorked };
              } catch (e) {
                try {
                  const fallbackWorked = writeWithExecCommand(text);
                  return { success: fallbackWorked, error: e?.message };
                } catch (e2) {
                  return { success: false, error: e2?.message || 'Clipboard write failed' };
                }
              }
            },
            args: [mockResult]
          });
          try {
            copySuccess = Array.isArray(results) && results[0] && results[0].result && results[0].result.success === true;
          } catch (e) {
            copySuccess = false;
          }
        }

        await chrome.storage.local.set({ autoGenerate: true });
        try { await chrome.action.openPopup(); } catch (e) {}

        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Cover Letter Generator',
          message: copySuccess ? 'Generated text copied to clipboard.' : 'Tried to copy to clipboard.'
        });
      } catch (e) {
        chrome.notifications.create({
          type: 'basic', iconUrl: 'icon.png', title: 'Cover Letter Generator',
          message: 'Failed to copy to clipboard: ' + (e?.message || 'Unknown error')
        });
      }
    }, 3000);
  }
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

  setTimeout(async () => {
    const mockResult = 'result';
    try {
      let copySuccess = false;
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: async (text) => {
          async function writeWithClipboardApi(t) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(t);
              return true;
            }
            return false;
          }
          function writeWithExecCommand(t) {
            const textarea = document.createElement('textarea');
            textarea.value = t;
            textarea.style.position = 'fixed';
            textarea.style.top = '-1000px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            return ok;
          }
          try {
            const apiWorked = await writeWithClipboardApi(text);
            if (apiWorked) return { success: true };
            const fallbackWorked = writeWithExecCommand(text);
            return { success: fallbackWorked };
          } catch (e) {
            try {
              const fallbackWorked = writeWithExecCommand(text);
              return { success: fallbackWorked, error: e?.message };
            } catch (e2) {
              return { success: false, error: e2?.message || 'Clipboard write failed' };
            }
          }
        },
        args: [mockResult]
      });
      try {
        copySuccess = Array.isArray(results) && results[0] && results[0].result && results[0].result.success === true;
      } catch (e) {
        copySuccess = false;
      }

      await chrome.storage.local.set({ autoGenerate: true });
      try { await chrome.action.openPopup(); } catch (e) {}

      chrome.notifications.create({
        type: 'basic', iconUrl: 'icon.png', title: 'Cover Letter Generator',
        message: copySuccess ? 'Generated text copied to clipboard.' : 'Tried to copy to clipboard.'
      });
    } catch (e) {
      chrome.notifications.create({
        type: 'basic', iconUrl: 'icon.png', title: 'Cover Letter Generator',
        message: 'Failed to copy to clipboard: ' + (e?.message || 'Unknown error')
      });
    }
  }, 3000);
});



