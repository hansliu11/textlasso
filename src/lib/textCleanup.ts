function cleanOcrText(rawText: string): string {
    return rawText
            .split(/\r?\n/)
            .map(line => {
            line = line.trim();
            line = line.replace(/(?<=[\p{Script=Han}\u3000-\u303F\uFF00-\uFFEF])\s+(?=[\p{Script=Han}\u3000-\u303F\uFF00-\uFFEF])/gu, ''); // Remove extra spaces between Chinese characters and Chinese punctuation
            return line;
            })
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')  // Replace multiple empty lines to 1 empty line
            .trim(); // Remove leading and trailing empty lines;
}

export { cleanOcrText }