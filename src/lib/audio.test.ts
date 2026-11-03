import { describe, expect, it } from 'vitest';
import { MAX_AUDIO_BYTES, validAnswerAudio } from './audio';

describe('human recording validation', () => {
  it('accepts short MP3 or browser WebM recordings', () => {
    expect(validAnswerAudio('data:audio/mpeg;base64,AQID')).toBe(true);
    expect(validAnswerAudio('data:audio/webm;codecs=opus;base64,AQID')).toBe(true);
  });
  it('blocks active, unsupported and oversized content', () => {
    expect(validAnswerAudio('javascript:alert(1)')).toBe(false);
    expect(validAnswerAudio('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
    expect(validAnswerAudio('data:audio/mpeg;base64,'+'A'.repeat(MAX_AUDIO_BYTES * 2))).toBe(false);
    expect(validAnswerAudio('data:audio/wav;base64,not valid')).toBe(false);
  });
});
