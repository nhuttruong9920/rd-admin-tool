interface JsonLine {
  content: string;
  type: 'normal' | 'added' | 'removed';
  lineNumber: number;
}

export function generateFullJsonComparison(
  original: any,
  preview: any,
): JsonLine[] {
  if (
    !original ||
    !preview ||
    typeof original === 'string' ||
    typeof preview === 'string'
  ) {
    return [];
  }

  return getComparision(original, preview);
}

function getComparision(
  original: Record<string, unknown>,
  preview: Record<string, unknown>,
): JsonLine[] {
  // Simple but effective approach: create line-by-line diff
  const originalJson = JSON.stringify(original, null, 2);
  const previewJson = JSON.stringify(preview, null, 2);

  const originalLines = originalJson.split('\n');
  const previewLines = previewJson.split('\n');

  // Use a simple LCS-based diff algorithm
  return createLineDiff(originalLines, previewLines);
}

function createLineDiff(
  originalLines: string[],
  previewLines: string[],
): JsonLine[] {
  const result: JsonLine[] = [];

  // Create a simple line-by-line comparison using LCS algorithm
  const lcs = computeLCS(originalLines, previewLines);

  let originalIndex = 0;
  let previewIndex = 0;
  let lineNumber = 1;

  while (
    originalIndex < originalLines.length ||
    previewIndex < previewLines.length
  ) {
    const originalLine = originalLines[originalIndex];
    const previewLine = previewLines[previewIndex];

    if (
      originalIndex < originalLines.length &&
      previewIndex < previewLines.length &&
      originalLine === previewLine
    ) {
      // Lines are the same
      result.push({
        content: originalLine,
        type: 'normal',
        lineNumber: lineNumber++,
      });
      originalIndex++;
      previewIndex++;
    } else if (
      originalIndex < originalLines.length &&
      (previewIndex >= previewLines.length ||
        !lcs.has(`${previewIndex}-${originalLine}`))
    ) {
      // Line exists in original but not in preview (removed)
      result.push({
        content: originalLine,
        type: 'removed',
        lineNumber: lineNumber++,
      });
      originalIndex++;
    } else if (previewIndex < previewLines.length) {
      // Line exists in preview but not in original (added)
      result.push({
        content: previewLine,
        type: 'added',
        lineNumber: lineNumber++,
      });
      previewIndex++;
    }
  }

  return result;
}

function computeLCS(
  originalLines: string[],
  previewLines: string[],
): Set<string> {
  const lcsSet = new Set<string>();

  // Simple LCS implementation
  const dp: number[][] = Array(originalLines.length + 1)
    .fill(null)
    .map(() => Array(previewLines.length + 1).fill(0));

  // Build LCS table
  for (let i = 1; i <= originalLines.length; i++) {
    for (let j = 1; j <= previewLines.length; j++) {
      if (originalLines[i - 1] === previewLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  let i = originalLines.length;
  let j = previewLines.length;

  while (i > 0 && j > 0) {
    if (originalLines[i - 1] === previewLines[j - 1]) {
      lcsSet.add(`${j - 1}-${originalLines[i - 1]}`);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcsSet;
}
