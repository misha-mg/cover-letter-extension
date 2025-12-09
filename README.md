# Cover Letter Generator Extension

Browser extension that uses AI to generate personalized cover letters. Paste your template and job description, get a tailored cover letter instantly. Features keyboard shortcuts, auto-save, and clipboard integration. Powered via OpenRouter (OpenAI models through OpenRouter).

## 🎯 Features

- **AI-Powered Generation**: Uses OpenRouter (OpenAI models via OpenRouter) to create personalized cover letters
- **Template-Based**: Save your base cover letter and reuse it for multiple applications
- **Context Menu Integration**: Right-click selected text to generate a cover letter
- **Keyboard Shortcuts**: Use `Alt+Shift+L` to quickly generate from selected text
- **Auto-Save**: Automatically saves your template and job descriptions as you type
- **Clipboard Integration**: Generated letters are automatically copied to clipboard
- **Smart Input Handling**: Intelligently allocates token budget between template and job description
- **Persistent Storage**: Your data is saved locally and persists across browser sessions

## 📁 Project Structure

```
cover-extension/
├── manifest.json           # Chrome extension manifest (v3)
├── env.example.js          # Example environment configuration (copy to src/config/env.js)
├── icon.png                # Extension icon
├── src/
│   ├── config/
│   │   └── env.js          # Local environment configuration (gitignored)
│   ├── api/
│   │   ├── prompt.js       # Shared system prompt
│   │   ├── openrouter.js   # OpenRouter API wrapper
│   │   └── clipboard.js    # Clipboard/notification helpers
│   ├── background/
│   │   └── background.js   # Background service worker (context menu, shortcuts)
│   ├── pages/
│   │   └── popup.html      # Extension popup interface
│   ├── scripts/
│   │   └── popup.js        # Popup logic and UI interactions
│   └── styles/
│       └── popup.css       # Popup styling
└── README.md               # This file
```

## 🚀 Setup

### Prerequisites

- Google Chrome or Chromium-based browser (Edge, Brave, etc.)
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

### Installation Steps

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd cover-extension
   ```

2. **Configure your OpenRouter API key**
   
   Copy `env.example.js` to `src/config/env.js` and update the configuration:
   ```javascript
   window.ENV = {
     OPENROUTER_API_BASE: 'https://openrouter.ai/api/v1',
     OPENROUTER_API_KEY: '<your-openrouter-api-key>',
     OPENROUTER_MODEL: 'openai/gpt-5-mini',
     TIMEOUT_MS: 30000,
     MAX_TOKENS: 15000,
     TEMPERATURE: 0.5
   };
   ```

   > ⚠️ **Security Warning**: `src/config/env.js` is gitignored. Keep your real API key only in local copies and never commit it. Consider using a backend proxy for production use.

3. **Load the extension in Chrome**
   
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `cover-extension` directory
   - The extension should now appear in your extensions list

4. **Verify installation**
   
   - Click the extension icon in your browser toolbar
   - You should see the "Letter Creator" popup
   - Test by entering a template and job description, then click "Generate"

## 📖 Usage

### Method 1: Using the Popup Interface

1. Click the extension icon in your browser toolbar
2. Enter your default cover letter template in the "Default Cover Letter" section
3. Click "Save" to save your template
4. Paste a job description in the "Current Offer Text" field
5. Click "Generate" to create a personalized cover letter
6. The generated letter is automatically copied to your clipboard

### Method 2: Context Menu (Right-Click)

1. Select job description text on any webpage
2. Right-click and choose "Generate Cover Letter"
3. The extension popup will open and auto-generate
4. Generated letter is copied to clipboard

### Method 3: Keyboard Shortcut

1. Select job description text on any webpage
2. Press `Alt+Shift+L` (or `Option+Shift+L` on Mac)
3. The extension popup will open and auto-generate
4. Generated letter is copied to clipboard

## ⚙️ Configuration

### Environment Variables (`src/config/env.js`)

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_BASE` | `https://openrouter.ai/api/v1` | OpenRouter API endpoint |
| `OPENROUTER_API_KEY` | - | Your OpenRouter API key (required) |
| `OPENROUTER_MODEL` | `openai/gpt-5-mini` | Model to use (any OpenRouter-supported model) |
| `TIMEOUT_MS` | `30000` | Request timeout in milliseconds |
| `MAX_TOKENS` | `15000` | Maximum output tokens |
| `TEMPERATURE` | `0.5` | Model temperature (0-2, higher = more creative) |

### Model Support

The extension calls OpenRouter, which can route to multiple providers (e.g., OpenAI models such as `openai/gpt-5-mini`, `openai/gpt-4o-mini`, or any other OpenRouter-supported model you configure in `env.js`).

### Customizing the Prompt

The AI prompt can be customized in `src/api/prompt.js`. The default prompt:
- Uses your template's tone and structure
- Mentions specific technologies from the job description
- Keeps the letter clear and professional
- Limits output to ~180 words

## 🔒 Security Considerations

1. **API Key Protection**
   - Never commit real API keys to public repositories
   - Keep `src/config/env.js` local (it is gitignored) and share only `env.example.js`
   - For production, use a backend proxy server instead of client-side keys

2. **Local Storage**
   - All data (templates, job descriptions) is stored locally using Chrome Storage API
   - No data is sent to external servers except OpenRouter API calls

3. **Permissions**
   - `storage`: Store templates and settings locally
   - `contextMenus`: Add right-click menu option
   - `activeTab`: Read selected text from current tab
   - `notifications`: Show generation status
   - `scripting`: Inject clipboard scripts
   - `clipboardWrite`: Copy results to clipboard
    - `tabs`: Query active tab for generation/copy targets
   - `host_permissions`: Access any URL for text selection

## 🛠️ Development

### Making Changes

1. Edit the source files in the `src/` directory
2. Update `manifest.json` if adding new permissions or features
3. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension card

### Tooling

- Install dev dependencies: `npm install`
- Lint source: `npm run lint`
- Format source: `npm run format`
- Full check (lint + prettier check): `npm run check`

### Testing

1. Test the popup interface manually
2. Test context menu on various websites
3. Test keyboard shortcuts
4. Verify auto-save functionality
5. Check clipboard integration

### Building for Production

Before distributing:

1. Remove or replace real API keys in `src/config/env.js`
2. Update version number in `manifest.json`
3. Test thoroughly in different scenarios
4. Consider adding a backend proxy for API calls

## 📝 How It Works

1. **User Input**: You provide a base cover letter template and a job description in the popup (both are auto-saved to `chrome.storage.local`).
2. **Context Menu / Shortcut**: Background service worker captures selected text, stores `currentOffer`, calls OpenRouter via `CoverAPI.generateCoverLetter`, copies the result to the active tab with `CoverClipboard.copyToTab`, and shows a notification (also opens the popup for visibility).
3. **Popup Generation**: Clicking Generate in the popup uses the same OpenRouter flow and copies the result to the clipboard.
4. **Result Handling**: The generated letter is shown in the popup, stored locally (`lastGenerated`), and copied to the clipboard when possible.

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is for personal use. Please ensure you comply with OpenRouter and model-provider terms of service when using their APIs.

## 🙏 Acknowledgments

- Built with Chrome Extension Manifest V3
- Powered by OpenRouter (accessing OpenAI models)
- UI inspired by modern design principles

---

**Note**: This extension requires an active OpenRouter API key. Usage costs apply based on your chosen model and provider settings in OpenRouter.
