
export function cleanText(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();
}
