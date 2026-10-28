# TextLasso

English | [繁體中文](README_zh-TW.md)

A Chrome extension that lets you drag-select an area of a video or image on any web page, recognizes the text in it with OCR, and copies it to your clipboard.

- **Fully offline**: OCR runs on [Tesseract.js](https://github.com/naptha/tesseract.js) bundled inside the extension, so your screen never leaves your machine
- **Languages**: Traditional Chinese and English
- **Works on videos**: including subtitles in fullscreen YouTube playback
- **Editable results**: an editable result panel lets you fix mistakes and copy again

## Usage

1. Start selection mode in either way:
   - Press `Alt+Shift+O` (change it at `chrome://extensions/shortcuts`)
   - Right-click the page → "OCR 擷取文字"
2. Drag to select the text you want to recognize (press `Esc` to cancel)
3. The text is copied to your clipboard automatically. Edit it in the result panel at the bottom right and click "再複製" (Copy again) if needed

The first recognition takes a bit longer while the language models load; after that it takes about 1 second.

## Installation (build from source)

Requirements: Node.js, [pnpm](https://pnpm.io/), Chrome 150 or later.

```sh
pnpm install
pnpm build
```

Then open `chrome://extensions`, turn on "Developer mode" in the top right, click "Load unpacked", and select the `dist/` folder.

## Known limitations

- Videos protected by DRM (Netflix, Disney+, etc.) capture as a black frame and can't be recognized
- Doesn't work on protected pages such as `chrome://` pages or the Chrome Web Store; the extension icon shows a red `!` when triggered there
- Only the currently visible part of the page can be selected
- Simplified Chinese isn't supported: loading the Simplified model alongside causes Traditional characters to be recognized as Simplified

## Development

| Command | Purpose |
|---|---|
| `pnpm dev` | Development mode (Vite) |
| `pnpm build` | Type-check and build to `dist/` |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm typecheck` | Type-check only |
| `pnpm lint` | Run ESLint |

### How it works

```
Shortcut / context menu
  → background: inject the content script
  → content script: show the selection overlay, send the selected rect and devicePixelRatio
  → background: captureVisibleTab, tell the content script to show "辨識中…" (Recognizing…)
  → offscreen document: crop, upscale, grayscale → Tesseract → clean up text → write to clipboard
  → content script: show the result panel
```

OCR runs in an offscreen document because a content script can't load the extension's Web Worker and wasm from inside a web page, and the service worker has no DOM and can't write to the clipboard.

### Project structure

```
src/
├─ background.ts          # Triggers, injection, screenshot, message routing
├─ messages.ts            # Message types shared between contexts
├─ content/
│  ├─ index.ts            # Selection overlay
│  └─ resultPanel.ts      # Result panel (Shadow DOM)
├─ offscreen/
│  ├─ offscreen.html
│  └─ offscreen.ts        # Crop, OCR, clipboard write
└─ lib/
   ├─ geometry.ts         # Selection coordinate mapping (CSS pixels → screenshot pixels)
   └─ textCleanup.ts      # Whitespace and line-break cleanup of OCR output
```
