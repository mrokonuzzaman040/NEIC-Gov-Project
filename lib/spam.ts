// Simple heuristic spam detection.
// Returns score (0..1) and reasons array. Threshold chosen in API.

export interface SpamResult { score: number; reasons: string[]; }

const URL_REGEX = /https?:\/\//gi;

export function assessSpam(message: string): SpamResult {
  const reasons: string[] = [];
  let score = 0;

  const length = message.length;
  if (length < 10) { score += 0.15; reasons.push('too_short'); }
  if (length > 480) { score += 0.05; reasons.push('near_limit'); }

  const urlMatches = message.match(URL_REGEX)?.length || 0;
  if (urlMatches > 0) { score += 0.2 + Math.min(0.2, (urlMatches - 1) * 0.1); reasons.push('contains_url'); }

  // Repeated characters patterns (e.g., !!!!!, aaaaa) naive check
  const repeated = /(.)\1{5,}/.test(message);
  if (repeated) { score += 0.2; reasons.push('repetition'); }

  // High symbol ratio (#, $, @, ! etc.)
  const symbolRatio = (message.match(/[^\w\s\u0980-\u09FF]/g)?.length || 0) / length; // allow Bangla range
  if (symbolRatio > 0.3) { score += 0.15; reasons.push('symbol_noise'); }

  // Uppercase shouting (for Latin script segments)
  const latinSegment = message.replace(/[^A-Za-z]/g, '');
  if (latinSegment.length > 12) {
    const upperRatio = latinSegment.replace(/[^A-Z]/g, '').length / latinSegment.length;
    if (upperRatio > 0.7) { score += 0.1; reasons.push('uppercase_shouting'); }
  }

  if (score > 1) score = 1;
  return { score, reasons };
}
