import { safeImage,clamp } from './site';
import type { AvatarBlinkOptions,AvatarPoses } from '../types';
export interface AvatarPosePack {version:1;type:'kawan-prasejarah-aki-pose-pack';poses:AvatarPoses;blink?:AvatarBlinkOptions;}
const allowed=(value:unknown,min:number,max:number,defaultValue:number)=>clamp(value,min,max,defaultValue);
export function parseAvatarPosePack(text:string):AvatarPosePack{
  if(text.length>2_000_000)throw new Error('Pek avatar terlalu besar. Had 2 MB.');
  let raw:unknown;try{raw=JSON.parse(text);}catch{throw new Error('Pek avatar bukan fail JSON yang sah.');}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Format pek avatar tidak sah.');
  const pack=raw as Record<string,unknown>;
  if(pack.type!=='kawan-prasejarah-aki-pose-pack'||pack.version!==1)
    throw new Error('Sila gunakan fail Pek Avatar Aki yang betul.');
  const images=pack.poses;
  if(!images||typeof images!=='object'||Array.isArray(images))throw new Error('Gambar avatar tidak lengkap.');
  const obj=images as Record<string,unknown>;
  const poses:AvatarPoses={};
  for(const key of ['idle','wave','talk','blink'] as const){
    const image=safeImage(obj[key]);
    if(key!=='blink'&&!image)throw new Error('Gambar '+key+' tidak sah atau tiada.');
    if(image)poses[key]=image;
  }
  let blink:AvatarBlinkOptions|undefined;
  if(pack.blink&&typeof pack.blink==='object'&&!Array.isArray(pack.blink)){
    const b=pack.blink as Record<string,unknown>;
    blink={
      leftX:allowed(b.leftX,5,90,38.7),rightX:allowed(b.rightX,5,95,58.9),
      eyeY:allowed(b.eyeY,5,85,31.6),eyeWidth:allowed(b.eyeWidth,3,25,9),
      eyeHeight:allowed(b.eyeHeight,2,18,6.8),
      color:typeof b.color==='string'&&/^#[a-f0-9]{6}$/i.test(b.color)?b.color:'#f4b18b'
    };
  }
  return {type:'kawan-prasejarah-aki-pose-pack',version:1,poses,blink};
}
