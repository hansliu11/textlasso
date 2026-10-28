import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import manifest from './manifest.config.ts'

const languageCodes: readonly string[] = ['chi_tra', 'eng']

export default defineConfig({
  plugins: [
    crx({ manifest }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/tesseract.js/dist/worker.min.js',
          dest: 'tesseract',
          rename: { stripBase: true },
        },
        {
          src: 'node_modules/tesseract.js-core/tesseract-core*',
          dest: 'tesseract/core',
          rename: { stripBase: true },
        },
        ...languageCodes.map((languageCode) => ({
          src: `node_modules/@tesseract.js-data/${languageCode}/4.0.0_best_int/${languageCode}.traineddata.gz`,
          dest: 'tessdata',
          rename: { stripBase: true } as const,
        })),
      ],
    }),
  ],
  build: {
    rolldownOptions: {
      input: {
        offscreen: 'src/offscreen/offscreen.html',
      },
    },
  },
})
