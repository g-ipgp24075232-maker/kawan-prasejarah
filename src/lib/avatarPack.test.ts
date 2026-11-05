import {expect,it} from 'vitest';
import {parseAvatarPosePack} from './avatarPack';
const image='data:image/webp;base64,SGVsbG8=';
const pack={type:'kawan-prasejarah-aki-pose-pack',version:1,poses:{idle:image,talk:image,wave:image}};
it('imports three character poses without touching the questions bank',()=>{
  const output=parseAvatarPosePack(JSON.stringify(pack));
  expect(output.poses.wave).toBe(image);
  expect(output.poses.talk).toBe(image);
});
it('rejects invalid and remote images',()=>{
  expect(()=>parseAvatarPosePack(JSON.stringify({...pack,poses:{idle:'https://somewhere.com',talk:image,wave:image}}))).toThrow();
});
it('supports optional blink settings',()=>{
  const result=parseAvatarPosePack(JSON.stringify({...pack,blink:{eyeY:31,color:'#ffffff'}}));
  expect(result.blink?.eyeY).toBe(31);
});
