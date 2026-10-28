import contentScriptPath from './content/index.ts?script&iife'
import type { SelectionDoneMessage, OcrResult, OcrRequestMessage, CaptureDoneMessage } from './messages';
import { isExtensionMessage } from './messages';

const START_OCR_ID = "start-ocr"

function showErrorBadge(tabId: number): void {
    chrome.action.setBadgeText({ text: "!", tabId});
    chrome.action.setBadgeBackgroundColor({color: "#FF0000", tabId});
    setTimeout(() => {
        chrome.action.setBadgeText({ text: "", tabId});
    }, 3000);
}

async function startSelection(tab: chrome.tabs.Tab | undefined): Promise<void> {
    if (tab?.id === undefined) {
        return;
    }
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [contentScriptPath],
        })
    } catch {
        showErrorBadge(tab.id);
    }
}

async function ensureOffscreenDocument(): Promise<void> {
    if (await chrome.offscreen.hasDocument()) {
        return;
    }
    await chrome.offscreen.createDocument({
        url: 'src/offscreen/offscreen.html',
        reasons: ['WORKERS', 'CLIPBOARD'],
        justification: 'TextLasso needs an offscreen document to copy text to the clipboard and do OCR.',
    });
}

async function handleSelectionDone(message: SelectionDoneMessage, sender: chrome.runtime.MessageSender): Promise<OcrResult> {
    if (sender.tab?.windowId === undefined || sender.tab?.id === undefined) {
        return { ok: false, error: 'No window ID or tab ID' };
    }
    const windowId = sender.tab.windowId;
    try {
        const screenshotUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
        chrome.tabs.sendMessage<CaptureDoneMessage>(sender.tab.id, {type: 'capture-done'}).catch(() => undefined);
        await ensureOffscreenDocument();
        return await chrome.runtime.sendMessage<OcrRequestMessage, OcrResult>({type: 'ocr-request', screenshotDataUrl: screenshotUrl, rect: message.rect, devicePixelRatio: message.devicePixelRatio});
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
}

chrome.runtime.onInstalled.addListener(()=>{
     chrome.contextMenus.create({
        id: START_OCR_ID,
        title: "OCR 擷取文字",
        contexts: ['all'],
     });
});

chrome.commands.onCommand.addListener((command, tab) => {
    if (command === START_OCR_ID) {
        startSelection(tab);
    }
})

chrome.contextMenus.onClicked.addListener( (info, tab)=>{
     if(info.menuItemId === START_OCR_ID){
        startSelection(tab);
    }
});

chrome.runtime.onMessage.addListener((message: unknown, sender: chrome.runtime.MessageSender, sendResponse): boolean => {
    if (!isExtensionMessage(message)) {
        return false;
    }
    switch (message.type) {
        case 'selection-done':
            handleSelectionDone(message, sender).then((result) => {
                sendResponse(result);
            });
            return true; // Indicates that the response will be sent asynchronously
        case 'ocr-request':
            return false;
        case 'capture-done':
            return false;
        default: {
            const unhandledMessage: never = message;
            return unhandledMessage
        }
    }
});
