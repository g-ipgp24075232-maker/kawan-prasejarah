/** Validate teacher-controlled inline audio, including imports from JSON/cloud. */
export const MAX_AUDIO_BYTES = 700_000;

export function validAnswerAudio(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!value || value.length > Math.ceil(MAX_AUDIO_BYTES * 4 / 3) + 256) return false;
  const match = /^data:audio\/(?:mpeg|mp3|wav|x-wav|ogg|webm|mp4|x-m4a|aac)(?:;codecs=[\w.+-]+)?;base64,([A-Za-z0-9+/]+={0,2})$/i.exec(value);
  if (!match) return false;
  // Base64 length is a safe upper bound on decoded binary size.
  return Math.floor(match[1].length * 3 / 4) <= MAX_AUDIO_BYTES;
}
