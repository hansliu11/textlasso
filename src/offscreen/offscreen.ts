import type { Rect } from '../lib/geometry';
import type { OcrRequestMessage, OcrResult } from '../messages';
import type { Worker } from 'tesseract.js'
import { toImageRect } from '../lib/geometry';
import { createWorker, OEM, PSM } from 'tesseract.js'
import { isExtensionMessage } from '../messages'
import { cleanOcrText } from '../lib/textCleanup'

let workerPromise: Promise<Worker> | null = null
function getWorker(): Promise<Worker> {
    // `??=`: assign only if null/undefined
    const setWorker = async (): Promise<Worker> => {
        const worker = await createWorker('chi_tra+eng', OEM.LSTM_ONLY, { 
            workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
            corePath: chrome.runtime.getURL('tesseract/core'),   // directory: picks the best wasm build automatically (SIMD, etc.)
            langPath: chrome.runtime.getURL('tessdata'),
            workerBlobURL: false,   // MV3 CSP blocks blob: workers
            gzip: true,             // our files are .traineddata.gz
            cacheMethod: 'none',    // already local, no need to cache in IndexedDB
        });
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
        return worker;
    }
    workerPromise ??= setWorker();
    
    return workerPromise;
}

async function cropForOcr(dataUrl: string, rect: Rect, devicePixelRatio: number): Promise<OffscreenCanvas> {
    const blob = await (await fetch(dataUrl)).blob();
    const bitmap = await createImageBitmap(blob);   // bitmap.width / bitmap.height = physical pixels
    const imageRect = toImageRect(rect, devicePixelRatio, { width: bitmap.width, height: bitmap.height});

    if (imageRect.height === 0 || imageRect.width === 0) {
        throw new Error("Selection out of range!"); 
    }

    const canvas = new OffscreenCanvas(imageRect.width * 2, imageRect.height * 2);
    const context = canvas.getContext("2d");
    if (context === null) {
        throw new Error("Offscreen canvas has already been set to a different context mode.")
    }
    context.filter = 'grayscale(1)';
    context.drawImage(bitmap, imageRect.x, imageRect.y, imageRect.width, imageRect.height, 0, 0, imageRect.width * 2, imageRect.height * 2);

    return canvas;
}

function copyToClipboard(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

async function handleOcrRequest(message: OcrRequestMessage): Promise<OcrResult> {
    try {
        const canvas = await cropForOcr(message.screenshotDataUrl, message.rect, message.devicePixelRatio);
        
        const worker = await getWorker();
        const result = await worker.recognize(canvas);
        const ocrText = cleanOcrText(result.data.text);
        if (ocrText === "") {
            return {ok: true, text: ""};
        }
        copyToClipboard(ocrText);

        return {ok: true, text: ocrText};
    } catch(e) {
        return {ok: false, error: e instanceof Error ? e.message : String(e)};
    }
}

chrome.runtime.onMessage.addListener((message: unknown, _sender: chrome.runtime.MessageSender, sendResponse): boolean => {
    if (!isExtensionMessage(message)) {
        return false;
    }
    switch (message.type) {
        case 'selection-done':
            return false;
        case 'ocr-request':
            handleOcrRequest(message).then((result) => {
                sendResponse(result);
            });
            return true;
        case 'capture-done':
            return false;
        default: {
            const unhandledMessage: never = message;
            return unhandledMessage
        }
    }
});