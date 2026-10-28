import type { OcrResult } from '../messages'

const HOST_ID = "textlasso-result-panel";
const PANEL_STYLES = `.panel { position: fixed; right: 16px; bottom: 16px; width: 360px; padding: 12px;
  background: #1f1f1f; color: #eee; font: 14px/1.5 system-ui, sans-serif;
  border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,.4); }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
textarea { width: 100%; height: 120px; box-sizing: border-box; resize: vertical;
  background: #2b2b2b; color: #eee; border: 1px solid #555; border-radius: 4px; font: inherit; }
button { cursor: pointer; background: #3a7bd5; color: #fff; border: 0; border-radius: 4px; padding: 4px 12px; }
.close { background: transparent; color: #aaa; font-size: 16px; }
button:disabled { opacity: .6; cursor: default; }
`

type PanelState =
  | { readonly kind: 'success'; readonly text: string }
  | { readonly kind: 'empty' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'loading'};

function toPanelState(result: OcrResult): PanelState {
    switch (result.ok) {
        case false:
            return {kind: 'error', message: result.error};
        case true:
            if (result.text === "") {
                return {kind: 'empty'};
            }
            return {kind: 'success', text: result.text};
        default: {
            const unhandledResult: never = result;
            return unhandledResult
        }
    }
}

function closeResultPanel(): void {
    const host = document.getElementById(HOST_ID);
    if (host) {
		host.remove();
	}
}

function showResultPanel(state: PanelState): void {
    closeResultPanel();
    const host = document.createElement('div');
    host.id = HOST_ID;
    Object.assign(host.style, {
		position: "fixed",
		inset: "auto",
		margin: "0",
		padding: "0",
		border: "0",
		backgroundColor: "transparent",
	});
    host.popover = 'manual'; 
	document.documentElement.append(host);
	host.showPopover();
    
    const shadowRoot = host.attachShadow({ mode: 'closed' });   // closed: page scripts can't access host.shadowRoot
    const panelElement = document.createElement('div');
    panelElement.className = 'panel';
    
    const panelHeader = document.createElement('div');
    panelHeader.className = 'header';
    const span = document.createElement('span');
    const closeButton = document.createElement('button');
    closeButton.className = 'close';
    closeButton.textContent = '✕';
    closeButton.ariaLabel = '關閉';        // screen readers can't read "✕" meaningfully
    closeButton.addEventListener('click', closeResultPanel);
    
    const textarea = document.createElement('textarea');
    const copyButton = document.createElement('button');

    panelElement.appendChild(panelHeader);
    panelHeader.appendChild(span);
    panelHeader.appendChild(closeButton);
    
    
    switch (state.kind) {
        case 'empty':
            span.textContent = "未辨識到文字";
        break;
        case 'error':
            span.textContent = state.message;
        break;
        case 'success':
            span.textContent = "已複製到剪貼簿";
            textarea.value = state.text;
            copyButton.textContent = "再複製";
            copyButton.addEventListener('click', async (): Promise<void> => {
                try {
                    copyButton.disabled = true;
                    await navigator.clipboard.writeText(textarea.value);
                    copyButton.textContent = "已複製";
                } catch {
                    copyButton.textContent = "複製失敗";
                } finally {
                    setTimeout(() => {
                        copyButton.disabled = false;
                        copyButton.textContent = "再複製";
                    }, 1500);
                }
            })
            panelElement.appendChild(textarea);
            panelElement.appendChild(copyButton);
        break;
        case 'loading':
            span.textContent = "辨識中...";
        break;
        default: {
            const unhandledState: never = state;
            return unhandledState
        }
    }
    const styleElement = document.createElement('style');
    styleElement.textContent = PANEL_STYLES;
    shadowRoot.append(styleElement, panelElement);
}

export type { PanelState }
export { toPanelState, closeResultPanel, showResultPanel }