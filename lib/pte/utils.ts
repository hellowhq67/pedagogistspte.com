export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function mediaKindFromUrl(url: string): 'audio' | 'video' | 'image' | 'unknown' {
  if (!url) return 'unknown';
  if (url.match(/\.(m4a|mp3|wav|ogg)$/)) return 'audio';
  if (url.match(/\.(mp4|webm|mov)$/)) return 'video';
  if (url.match(/\.(jp(e?)g|png|gif|svg|webp)$/)) return 'image';
  return 'unknown';
}

/**
 * Format score for display based on module
 * Client-safe utility function (no database imports)
 */
export function formatScoreByModule(
  score: number | null,
  module: 'speaking' | 'reading' | 'writing' | 'listening'
): string {
  if (score === null || score === undefined) {
    return 'N/A'
  }

  // Speaking and listening use ranges (e.g., 75-80)
  if (module === 'speaking' || module === 'listening') {
    const lower = Math.floor(score / 5) * 5
    const upper = lower + 5
    return `${lower}-${upper}`
  }

  // Reading and writing use exact scores
  return score.toString()
}