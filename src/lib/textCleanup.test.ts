import { describe, it, expect } from 'vitest'
import { cleanOcrText } from './textCleanup'

describe('cleanOcrText', () => {
    it('Should remove extra spaces between chinese characters', () => {
        const input = "這 是 一 個 測 試 文 本";
        const expectedOutput = "這是一個測試文本";
        expect(cleanOcrText(input)).toBe(expectedOutput);
    });
    it('Should remove extra spaces between chinese character and chinese punctuation ', () => {
        const input = "你 好 ， 這 是 一 個 測 試 文 本 。";
        const expectedOutput = "你好，這是一個測試文本。";
        expect(cleanOcrText(input)).toBe(expectedOutput);
    });
    it('Should preserve spaces between any english words', () => {
        const input = "Hello World";
        const expectedOutput = "Hello World";
        expect(cleanOcrText(input)).toBe(expectedOutput);
    });
    it('Should preserve spaces between chinese character and english word or numbers', () => {
        const input = "使用 Chrome 11 擴充";
        const expectedOutput = "使用 Chrome 11 擴充";
        expect(cleanOcrText(input)).toBe(expectedOutput);
    });
    it('Should handle multiple lines of texts', () => {
        const input = "\n 這 是 一 個 測 試 文 本\n\n Hello World\n 使用 Chrome 11 擴充";
        const expectedOutput = "這是一個測試文本\n\nHello World\n使用 Chrome 11 擴充";
        expect(cleanOcrText(input)).toBe(expectedOutput);
    });
    it('Should return empty string (\'\') if input is empty str', () => {
        const input = "";
        const expectedOutput = "";
        expect(cleanOcrText(input)).toBe(expectedOutput);
    });
    it('Should combine multiple empty lines to 1 empty line', () => {
        const input = "ABC\n\n\n\n\n\nDEF";
        const expectedOutput = "ABC\n\nDEF";
        expect(cleanOcrText(input)).toBe(expectedOutput);
    });
    it('Should return empty string (\'\') if input is empty', () => {
        const input = " \n \n ";
        const expectedOutput = "";
        expect(cleanOcrText(input)).toBe(expectedOutput);
    });
});