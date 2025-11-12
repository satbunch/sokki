/**
 * Generate a tooltip preview from note content.
 * Extracts first 3 non-empty lines, takes first 10 chars of each line.
 * Lines are separated by newline character for multi-line tooltip display.
 * If truncated, appends "…" (ellipsis).
 */
export function previewTooltip(content: string): string {
  if (!content.trim()) {
    return 'Empty note';
  }

  const lines = content.split('\n');
  const previewLines: string[] = [];

  // Extract first 3 non-empty lines, each max 10 chars
  for (const line of lines) {
    if (previewLines.length >= 3) break;
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      previewLines.push(trimmed.slice(0, 10));
    }
  }

  if (previewLines.length === 0) {
    return 'Empty note';
  }

  // Join with newline for multi-line tooltip
  const preview = previewLines.join('\n');

  // Add ellipsis if there are more lines after the first 3
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  if (nonEmptyLines.length > previewLines.length) {
    return preview + '\n…';
  }

  // Add ellipsis if any line was truncated
  const isTruncated = nonEmptyLines.some((line, idx) => {
    if (idx >= previewLines.length) return false;
    const trimmed = line.trim();
    return trimmed.length > 10;
  });

  if (isTruncated) {
    return preview + '…';
  }

  return preview;
}
