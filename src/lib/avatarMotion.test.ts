import {expect,it} from 'vitest';
import { chooseAvatarPose } from './avatarMotion';

const images={idle:'smile.webp',talk:'mouth-open.webp',wave:'wave.webp'};
it('shows smiling when idle, thinking or listening',()=>{
  expect(chooseAvatarPose(false,'idle',images)).toBe('idle');
  expect(chooseAvatarPose(false,'thinking',images)).toBe('idle');
  expect(chooseAvatarPose(false,'listening',images)).toBe('idle');
});
it('shows the open mouth for the full duration of audio',()=>{
  expect(chooseAvatarPose(true,'talking',images)).toBe('talk');
  expect(chooseAvatarPose(true,'waving',images)).toBe('talk');
  expect(chooseAvatarPose(true,'confused',images)).toBe('talk');
});
it('displays waving only when not speaking',()=>{
  expect(chooseAvatarPose(false,'waving',images)).toBe('wave');
});
it('falls back to smile if optional images are not uploaded',()=>{
  expect(chooseAvatarPose(true,'talking',{idle:'smile.webp'})).toBe('idle');
});
