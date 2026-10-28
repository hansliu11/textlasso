import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json' with { type: 'json' }

export default defineManifest({
  manifest_version: 3,
  name: 'TextLasso',
  version: packageJson.version,
  description: 'Select an area of a video or image and copy its text via OCR.',
  minimum_chrome_version: '150',
  permissions: ['activeTab', 'scripting', 'contextMenus', 'offscreen', 'clipboardWrite'] satisfies chrome.runtime.ManifestPermission[],
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  commands: {
    'start-ocr': {
      suggested_key: { default: 'Alt+Shift+O' },
      description: 'Start OCR area selection',
    },
  },
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
  action: {
    default_title: 'TextLasso'
  },
})
