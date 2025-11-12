/**
 * Generate a tooltip preview from note content.
 * Extracts first 3 lines, takes first 10 chars of each line, joins with " / ".
 * If result is too long, appends "…" (ellipsis).
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

  const preview = previewLines.join(' / ');
  // Add ellipsis if preview is truncated or there are more lines
  const hasMoreLines = lines.length > 3;
  const isTruncated = previewLines.some((_line, idx) => {
    const originalLine = lines[idx];
    return originalLine.trim().length > 10;
  });

  if (preview.length > 50 || hasMoreLines || isTruncated) {
    return preview.slice(0, 50) + '…';
  }

  return preview;
}
