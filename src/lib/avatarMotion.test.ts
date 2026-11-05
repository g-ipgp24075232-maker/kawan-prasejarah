import {expect,it} from 'vitest';
import { chooseAvatarPose } from './avatarMotion';

const images={idle:'smile.webp',talk:'mouth-open.webp',wave:'wave.webp'};
it('keeps smiling image behind moving mouth when speaking',()=>{
  for(const action of ['talking','waving','confused','thinking'] as const)
    expect(chooseAvatarPose(true,action,images)).toBe('idle');
});
it('shows waving picture when not speaking',()=>{
  expect(chooseAvatarPose(false,'waving',images)).toBe('wave');
});
it('keeps smiling without audio or wave even if talk pose exists',()=>{
  expect(chooseAvatarPose(false,'idle',images)).toBe('idle');
  expect(chooseAvatarPose(false,'listening',images)).toBe('idle');
});
it('returns idle when wave pose has not been uploaded',()=>{
  expect(chooseAvatarPose(false,'waving',{idle:'smile.webp'})).toBe('idle');
});
