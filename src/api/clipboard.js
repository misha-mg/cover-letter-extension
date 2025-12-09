const __COVER_CLIPBOARD_GLOBAL__ = typeof window !== 'undefined' ? window : globalThis;
const CoverClipboard = {
  copyToTab: async function(tabId, text) {
    if (!tabId) return false;
    const results = await chrome.scripting.executeScript({
      target: { tabId },
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
      args: [text]
    });

    try {
      return Array.isArray(results) && results[0] && results[0].result && results[0].result.success === true;
    } catch (e) {
      console.error('Clipboard copy failed', e);
      return false;
    }
  },

  openPopupAndNotify: async function(copySuccess) {
    try { await chrome.action.openPopup(); } catch (e) {}

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Cover Letter Generator',
      message: copySuccess ? 'Generated text copied to clipboard.' : 'Tried to copy to clipboard.'
    });
  }
};

__COVER_CLIPBOARD_GLOBAL__.CoverClipboard = CoverClipboard;



