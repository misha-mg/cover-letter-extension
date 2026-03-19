const __COVER_CLIPBOARD_GLOBAL__ =
  typeof window !== 'undefined' ? window : globalThis;

function getInsertScript() {
  return (text) => {
    function isSupportedInput(element) {
      if (!element || element.tagName !== 'INPUT') return false;
      const type = (element.getAttribute('type') || 'text').toLowerCase();
      return ['text', 'search', 'url', 'email', 'tel'].includes(type);
    }

    function getEditableTarget() {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'TEXTAREA' ||
          isSupportedInput(activeElement) ||
          activeElement.isContentEditable)
      ) {
        return activeElement;
      }
      return null;
    }

    function dispatchEvents(element) {
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function insertIntoInput(element, value) {
      const selectionStart =
        typeof element.selectionStart === 'number'
          ? element.selectionStart
          : element.value.length;
      const selectionEnd =
        typeof element.selectionEnd === 'number'
          ? element.selectionEnd
          : element.value.length;

      element.focus();
      element.value =
        element.value.slice(0, selectionStart) +
        value +
        element.value.slice(selectionEnd);
      const nextCaretPosition = selectionStart + value.length;
      if (typeof element.setSelectionRange === 'function') {
        element.setSelectionRange(nextCaretPosition, nextCaretPosition);
      }
      dispatchEvents(element);
    }

    function insertIntoContentEditable(element, value) {
      element.focus();
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(value);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        element.textContent = `${element.textContent || ''}${value}`;
      }

      dispatchEvents(element);
    }

    try {
      const target = getEditableTarget();
      if (!target) {
        return {
          success: false,
          error: 'No editable field found on the page.',
        };
      }

      if (target.tagName === 'TEXTAREA' || isSupportedInput(target)) {
        insertIntoInput(target, text);
        return {
          success: true,
          delivery: 'inserted',
          target: target.tagName.toLowerCase(),
        };
      }

      if (target.isContentEditable) {
        insertIntoContentEditable(target, text);
        return {
          success: true,
          delivery: 'inserted',
          target: 'contenteditable',
        };
      }

      return {
        success: false,
        error: 'Focused element is not editable.',
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Insert failed.',
      };
    }
  };
}

function getFeedbackScript() {
  return ({ message, tone = 'success' } = {}) => {
    const TOAST_ID = 'cover-letter-generator-toast';
    const STYLE_ID = 'cover-letter-generator-toast-style';

    function ensureStyles() {
      if (document.getElementById(STYLE_ID)) return;

      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        #${TOAST_ID} {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 2147483647;
          max-width: min(360px, calc(100vw - 32px));
          padding: 14px 18px;
          border-radius: 14px;
          color: #fff;
          font: 600 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          box-shadow: 0 18px 40px rgba(16, 24, 40, 0.28);
          background: linear-gradient(135deg, #1d9b5f, #157347);
          opacity: 0;
          transform: translateY(-10px) scale(0.98);
          transition:
            opacity 180ms ease,
            transform 180ms ease;
          pointer-events: none;
        }

        #${TOAST_ID}[data-state='visible'] {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        #${TOAST_ID}[data-tone='error'] {
          background: linear-gradient(135deg, #d9485f, #b42318);
        }

        @media (max-width: 640px) {
          #${TOAST_ID} {
            top: auto;
            right: 16px;
            bottom: 16px;
            left: 16px;
            max-width: none;
          }
        }
      `;
      document.documentElement.appendChild(style);
    }

    async function playSuccessSound() {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return { supported: false, reason: 'AudioContext unavailable' };
      }

      const context =
        window.__coverFeedbackAudioContext || new AudioContextClass();
      window.__coverFeedbackAudioContext = context;

      const diagnostics = {
        supported: true,
        initialState: context.state,
      };

      if (context.state !== 'running') {
        try {
          await context.resume();
        } catch (error) {
          diagnostics.resumeError = error?.message || String(error);
        }
      }

      diagnostics.finalState = context.state;
      if (context.state !== 'running') {
        return diagnostics;
      }

      const now = context.currentTime;
      const masterGain = context.createGain();
      masterGain.connect(context.destination);
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.26, now + 0.03);
      masterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.22);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);

      const notes = [
        {
          frequency: 740,
          start: 0,
          duration: 0.16,
          type: 'triangle',
        },
        {
          frequency: 988,
          start: 0.12,
          duration: 0.18,
          type: 'triangle',
        },
        {
          frequency: 1318.51,
          start: 0.28,
          duration: 0.26,
          type: 'sine',
        },
      ];

      notes.forEach(({ frequency, start, duration, type }) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now + start);
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.9, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

        oscillator.connect(gain);
        gain.connect(masterGain);
        oscillator.start(now + start);
        oscillator.stop(now + start + duration);
      });

      diagnostics.played = true;
      return diagnostics;
    }

    ensureStyles();

    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = TOAST_ID;
      document.documentElement.appendChild(toast);
    }

    if (toast.__coverToastTimer) {
      window.clearTimeout(toast.__coverToastTimer);
    }

    toast.textContent = message || 'Cover letter copied to clipboard';
    toast.dataset.tone = tone;
    toast.dataset.state = 'hidden';

    window.requestAnimationFrame(() => {
      toast.dataset.state = 'visible';
    });

    toast.__coverToastTimer = window.setTimeout(() => {
      toast.dataset.state = 'hidden';
    }, 3200);

    playSuccessSound().then((diagnostics) => {
      if (diagnostics && diagnostics.finalState !== 'running') {
        console.warn('Cover feedback sound did not start', diagnostics);
      }
    });

    return { success: true };
  };
}

const CoverClipboard = {
  copyToTab: async function (tabId, text) {
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
            return {
              success: false,
              error: e2?.message || 'Clipboard write failed',
            };
          }
        }
      },
      args: [text],
    });

    try {
      return (
        Array.isArray(results) &&
        results[0] &&
        results[0].result &&
        results[0].result.success === true
      );
    } catch (e) {
      console.error('Clipboard copy failed', e);
      return false;
    }
  },

  insertIntoTab: async function (tabId, text) {
    if (!tabId) {
      return {
        success: false,
        error: 'Missing tab id.',
      };
    }

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: getInsertScript(),
        args: [text],
      });
      return (
        results?.[0]?.result || {
          success: false,
          error: 'Insert failed.',
        }
      );
    } catch (error) {
      console.error('Insert into tab failed', error);
      return {
        success: false,
        error: error?.message || 'Insert failed.',
      };
    }
  },

  showFeedbackInTab: async function (
    tabId,
    { message = 'Cover letter copied to clipboard', tone = 'success' } = {}
  ) {
    if (!tabId) return false;

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: getFeedbackScript(),
        args: [{ message, tone }],
      });
      return results?.[0]?.result?.success === true;
    } catch (error) {
      console.error('Feedback toast failed', error);
      return false;
    }
  },

  buildDeliveryMessage: function ({
    insertSuccess = false,
    copySuccess = false,
  } = {}) {
    if (insertSuccess && copySuccess) {
      return 'Generated text inserted into the page and copied to clipboard.';
    }
    if (insertSuccess) {
      return 'Generated text inserted into the page.';
    }
    if (copySuccess) {
      return 'Generated text copied to clipboard.';
    }
    return 'Generated text is ready, but insert/copy may have failed.';
  },

  openPopupAndNotify: async function (delivery = {}) {
    try {
      await chrome.action.openPopup();
    } catch (e) {}

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Cover Letter Generator',
      message: CoverClipboard.buildDeliveryMessage(delivery),
    });
  },
};

__COVER_CLIPBOARD_GLOBAL__.CoverClipboard = CoverClipboard;
