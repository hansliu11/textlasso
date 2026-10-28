import type { Point, Rect } from '../lib/geometry';
import { type SelectionDoneMessage, type OcrResult, isExtensionMessage } from '../messages';
import { normalizeRect, isSelectionTooSmall } from '../lib/geometry';
import { closeResultPanel, showResultPanel, toPanelState } from './resultPanel'

const OVERLAY_ID = "textlasso-overlay"
const SELECTION_BOX_ID = "textlasso-selection-box"

function createOverlay(): { readonly overlay: HTMLDivElement; readonly box: HTMLDivElement } {
	const overlay = document.createElement("div");
	overlay.id = OVERLAY_ID;
	Object.assign(overlay.style, {
		position: "fixed",
		inset: "0",
		width: "100vw",
		height: "100vh",
		margin: "0",
		padding: "0",
		border: "0",
		cursor: "crosshair",
		backgroundColor: "transparent",
	});
	overlay.popover = 'manual'; // manual: 不會因為點擊外面或按 Esc 自動關閉
	document.documentElement.append(overlay);
	overlay.showPopover();

	const box = document.createElement("div");
	box.id = SELECTION_BOX_ID;
	Object.assign(box.style, {
		position: "absolute",
		border: "2px solid #D40D06",
		boxShadow: '0 0 0 100vmax rgba(0, 0, 0, 0.5)',
	})
	overlay.append(box);

	return {overlay, box};
}

function waitForNextPaint(): Promise<void> {
	return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

function handleMessage(message: unknown): boolean {
	if (!isExtensionMessage(message)) {
        return false;
    }
	switch (message.type) {
        case 'selection-done':
            return false;
        case 'ocr-request':
            return false;
        case 'capture-done':
			showResultPanel({ kind: 'loading' });
            return false;
        default: {
            const unhandledMessage: never = message;
            return unhandledMessage
        }
    }
}

async function submitSelection(rect: Rect): Promise<void> {
	await waitForNextPaint();
	chrome.runtime.onMessage.addListener(handleMessage);
	try {
		const result = await chrome.runtime.sendMessage<SelectionDoneMessage, OcrResult>({
			type: "selection-done",
			rect: rect,
			devicePixelRatio: window.devicePixelRatio
		});
		showResultPanel(toPanelState(result));
	} finally {
		chrome.runtime.onMessage.removeListener(handleMessage);
	}
}

function startSelectionMode(): void {
	if (document.getElementById(OVERLAY_ID)) {
		return;
	}
	closeResultPanel();
	const {overlay, box}= createOverlay();
	let startPoint: Point | null = null;

	const cleanup = (): void => {
		overlay.remove();
		window.removeEventListener('keydown', handleKeydown, true);
		document.removeEventListener('fullscreenchange', handleFullscreenChange, true);
	};

	const handleKeydown = (event: KeyboardEvent): void => {
		if (event.key === "Escape") {
			event.stopPropagation();
			event.preventDefault();
			cleanup();
		}
	};

	const handleFullscreenChange = (): void => {
		if (document.fullscreenElement === null) {
			cleanup();
		}
	}

	overlay.addEventListener('pointerdown', (event: PointerEvent): void => {
		event.preventDefault();
		overlay.setPointerCapture(event.pointerId);
		startPoint = {x: event.clientX, y: event.clientY};
	});

	overlay.addEventListener('pointermove', (event: PointerEvent): void => {
		if (!startPoint) { return; }
		const currPoint: Point = {x: event.clientX, y: event.clientY};
		const currRect: Rect = normalizeRect(startPoint, currPoint);
		box.style.left = currRect.x + "px";
		box.style.top = currRect.y + "px";
		box.style.height = currRect.height + "px";
		box.style.width = currRect.width + "px";
	});

	overlay.addEventListener('pointerup', (event: PointerEvent): void => {
		if (!startPoint) { return; }
		const endPoint: Point = {x: event.clientX, y: event.clientY};
		const finalRect: Rect = normalizeRect(startPoint, endPoint);
		cleanup();
		if (isSelectionTooSmall(finalRect)) {
			return;
		}
		void submitSelection(finalRect);
	});

	window.addEventListener('keydown', handleKeydown, true);
	document.addEventListener('fullscreenchange', handleFullscreenChange, true);
}

startSelectionMode();