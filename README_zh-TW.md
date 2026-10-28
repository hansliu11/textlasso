# TextLasso

[English](README.md) | 繁體中文

在網頁上框選影片畫面或圖片，用 OCR 辨識裡面的文字並自動複製到剪貼簿的 Chrome 擴充功能。

- **完全離線**：OCR 使用打包在擴充功能內的 [Tesseract.js](https://github.com/naptha/tesseract.js)，畫面不會傳到任何伺服器
- **支援語言**：繁體中文、英文
- **影片也能用**：包含 YouTube 全螢幕播放中的字幕
- **可修正結果**：辨識完會顯示可編輯的結果框，修改後按「再複製」即可

## 使用方式

1. 觸發框選模式，任選一種：
   - 快捷鍵 `Alt+Shift+O`（可在 `chrome://extensions/shortcuts` 修改）
   - 在網頁上按右鍵 →「OCR 擷取文字」
2. 拖曳滑鼠框出要辨識的文字範圍（按 `Esc` 取消）
3. 文字會自動複製到剪貼簿，右下角的結果框可以修改後再複製

第一次辨識需要載入語言模型，會稍微久一點；之後每次約 1 秒。

## 安裝（從原始碼建置）

需求：Node.js、[pnpm](https://pnpm.io/)、Chrome 150 以上。

```sh
pnpm install
pnpm build
```

接著在 Chrome 開啟 `chrome://extensions`，打開右上角「開發人員模式」，點「載入未封裝項目」並選擇 `dist/` 資料夾。

## 已知限制

- 有 DRM 保護的影片（Netflix、Disney+ 等）截圖會是黑畫面，無法辨識
- 無法在 `chrome://` 頁面、Chrome 線上應用程式商店等受保護的頁面使用；觸發時擴充功能圖示會顯示紅色 `!`
- 只能框選目前可見的畫面範圍
- 不支援簡體中文：同時載入簡體模型會讓繁體字被辨識成簡體字

## 開發

| 指令 | 用途 |
|---|---|
| `pnpm dev` | 開發模式（Vite） |
| `pnpm build` | 型別檢查並建置到 `dist/` |
| `pnpm test` | 執行單元測試（Vitest） |
| `pnpm typecheck` | 只做型別檢查 |
| `pnpm lint` | ESLint 檢查 |

### 運作流程

```
快捷鍵 / 右鍵選單
  → background：注入 content script
  → content script：顯示框選遮罩，送出框選範圍與 devicePixelRatio
  → background：captureVisibleTab 截圖，通知 content script 顯示「辨識中…」
  → offscreen document：裁切、放大、灰階 → Tesseract 辨識 → 整理文字 → 寫入剪貼簿
  → content script：顯示結果框
```

OCR 放在 offscreen document 執行，是因為 content script 無法從網頁載入擴充功能的 Web Worker 與 wasm，而 service worker 沒有 DOM、也無法寫入剪貼簿。

### 專案結構

```
src/
├─ background.ts          # 觸發、注入、截圖、訊息轉送
├─ messages.ts            # 各端之間的訊息型別
├─ content/
│  ├─ index.ts            # 框選遮罩
│  └─ resultPanel.ts      # 結果框（Shadow DOM）
├─ offscreen/
│  ├─ offscreen.html
│  └─ offscreen.ts        # 裁切、OCR、寫入剪貼簿
└─ lib/
   ├─ geometry.ts         # 框選座標換算（CSS 像素 → 截圖像素）
   └─ textCleanup.ts      # 整理 OCR 輸出的空白與換行
```
