import type { Animation, AvatarPose } from '../types';

/** One picture at a time: talking > waving > smiling. */
export function chooseAvatarPose(
  speaking:boolean,
  animation:Animation,
  available:Partial<Record<AvatarPose,string>>
):AvatarPose {
  if(speaking && available.talk)return 'talk';
  if(animation==='waving' && available.wave)return 'wave';
  return 'idle';
}
