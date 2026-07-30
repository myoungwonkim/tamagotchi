/** Hangul syllable has a final consonant (받침). */
export function hasBatchim(text) {
  if (!text) return false;
  const last = text.charAt(text.length - 1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

/** Subject particle: 가 (no batchim) or 이 (has batchim). */
export function subjectParticle(text) {
  return hasBatchim(text) ? "이" : "가";
}

/** Name + correct subject particle, e.g. "귀요미가", "민석이". */
export function withSubjectParticle(text) {
  return `${text}${subjectParticle(text)}`;
}
