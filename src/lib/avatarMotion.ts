import type { Animation, AvatarPose } from '../types';

/** Base photo stays fixed: smile normally, wave only when not talking.
 * The talking photo is composited over ONLY the mouth, never swapped full-frame. */
export function chooseAvatarPose(
  speaking:boolean,
  animation:Animation,
  available:Partial<Record<AvatarPose,string>>
):AvatarPose {
  if(!speaking && animation==='waving' && available.wave)return 'wave';
  return 'idle';
}
