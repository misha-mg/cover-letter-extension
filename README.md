# Cover Letter Generator Extension

Browser extension that uses AI to generate personalized cover letters. Paste your template and job description, get a tailored cover letter instantly. Features keyboard shortcuts, auto-save, and clipboard integration. Powered by OpenAI.

## 🎯 Features

- **AI-Powered Generation**: Uses OpenAI GPT models to create personalized cover letters
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
├── env.js                  # Environment configuration (API keys, model settings)
├── api.js                  # OpenAI API wrapper with GPT-4 and GPT-5 support
├── icon.png                # Extension icon
├── src/
│   ├── pages/
│   │   └── popup.html      # Extension popup interface
│   ├── scripts/
│   │   ├── popup.js        # Popup logic and UI interactions
│   │   └── background.js   # Background service worker (context menu, shortcuts)
│   └── styles/
│       └── popup.css       # Popup styling
└── README.md               # This file
```

## 🚀 Setup

### Prerequisites

- Google Chrome or Chromium-based browser (Edge, Brave, etc.)
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

### Installation Steps

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd cover-extension
   ```

2. **Configure your OpenAI API key**
   
   Open `env.js` and update the configuration:
   ```javascript
   window.ENV = {
     OPENAI_API_KEY: 'your-api-key-here',
     OPENAI_MODEL: 'gpt-4o-mini',  // or 'gpt-5-nano' for GPT-5
     // ... other settings
   };
   ```

   > ⚠️ **Security Warning**: Never commit real API keys to version control. Consider using a local proxy server for production use.

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

### Environment Variables (`env.js`)

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_BASE` | `https://api.openai.com/v1` | OpenAI API endpoint |
| `OPENAI_API_KEY` | - | Your OpenAI API key (required) |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use (`gpt-4o-mini`, `gpt-5-nano`, etc.) |
| `TIMEOUT_MS` | `30000` | Request timeout in milliseconds |
| `INPUT_CHAR_LIMIT` | `8000` | Maximum input characters (~2000 tokens) |
| `INPUT_JOB_RATIO` | `0.6` | Portion of budget for job description (60%) |
| `MAX_TOKENS` | `5000` | Maximum output tokens |
| `TEMPERATURE` | `0.5` | Model temperature (0-2, higher = more creative) |
| `TOP_P` | `1` | Nucleus sampling parameter |
| `PRESENCE_PENALTY` | `0` | Presence penalty (-2 to 2) |
| `FREQUENCY_PENALTY` | `0` | Frequency penalty (-2 to 2) |
| `REASONING_EFFORT` | `none` | GPT-5 reasoning effort (`none`, `low`, `medium`, `high`) |

### Model Support

The extension supports both GPT-4 and GPT-5 models:

- **GPT-4 models** (e.g., `gpt-4o-mini`): Use Chat Completions API
- **GPT-5 models** (e.g., `gpt-5-nano`): Use Responses API with optional reasoning

### Customizing the Prompt

The AI prompt can be customized in `api.js` (lines 20-28). The default prompt:
- Uses your template's tone and structure
- Mentions specific technologies from the job description
- Keeps the letter clear and professional
- Limits output to ~180 words

## 🔒 Security Considerations

1. **API Key Protection**
   - Never commit real API keys to public repositories
   - Consider using environment variables or a secure vault
   - For production, use a backend proxy server instead of client-side keys

2. **Local Storage**
   - All data (templates, job descriptions) is stored locally using Chrome Storage API
   - No data is sent to external servers except OpenAI API calls

3. **Permissions**
   - `storage`: Store templates and settings locally
   - `contextMenus`: Add right-click menu option
   - `activeTab`: Read selected text from current tab
   - `notifications`: Show generation status
   - `scripting`: Inject clipboard scripts
   - `clipboardWrite`: Copy results to clipboard
   - `host_permissions`: Access any URL for text selection

## 🛠️ Development

### Making Changes

1. Edit the source files in the `src/` directory
2. Update `manifest.json` if adding new permissions or features
3. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension card

### Testing

1. Test the popup interface manually
2. Test context menu on various websites
3. Test keyboard shortcuts
4. Verify auto-save functionality
5. Check clipboard integration

### Building for Production

Before distributing:

1. Remove or replace real API keys in `env.js`
2. Update version number in `manifest.json`
3. Test thoroughly in different scenarios
4. Consider adding a backend proxy for API calls

## 📝 How It Works

1. **User Input**: You provide a base cover letter template and job description
2. **Input Processing**: The extension intelligently truncates inputs to fit token limits
3. **API Call**: Sends a formatted prompt to OpenAI's API
4. **AI Generation**: GPT model generates a personalized cover letter
5. **Output Handling**: Result is displayed, copied to clipboard, and stored locally

### Token Budget Management

The extension manages token limits intelligently:
- Default limit: 8000 characters (~2000 tokens)
- Job description gets 60% of budget (4800 chars)
- Template gets 40% of budget (3200 chars)
- Output is capped at configurable max tokens

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is for personal use. Please ensure you comply with OpenAI's terms of service when using their API.

## 🙏 Acknowledgments

- Built with Chrome Extension Manifest V3
- Powered by OpenAI GPT models
- UI inspired by modern design principles

---

**Note**: This extension requires an active OpenAI API subscription. API usage costs apply based on your model choice and usage volume.
