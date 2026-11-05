import {expect,it} from 'vitest';
import {WRIST,handInfluence,sourcePoint,smooth} from './handWave';

it('has a continuous, bounded blending mask',()=>{
  expect(smooth(-1)).toBe(0);
  expect(smooth(2)).toBe(1);
  expect(handInfluence(47,230)).toBeGreaterThan(.95);
  expect(handInfluence(140,230)).toBe(0);
  expect(handInfluence(78,310)).toBe(0);
  expect(handInfluence(88,176)).toBe(0);
});
it('keeps the wrist anchored at any wave angle',()=>{
  for(const angle of [-12,-10,0,10,12]){
    const p=sourcePoint(WRIST.x,WRIST.y,angle);
    expect(p.x).toBeCloseTo(WRIST.x,4);
    expect(p.y).toBeCloseTo(WRIST.y,4);
  }
});
it('keeps the forearm, head and body unchanged',()=>{
  for(const [x,y] of [[145,245],[87,320],[220,290],[160,190],[80,170]]){
    expect(sourcePoint(x,y,12)).toEqual({x,y});
  }
});
it('moves the palm, but only modestly',()=>{
  const original={x:38,y:224};
  const moved=sourcePoint(original.x,original.y,11);
  expect(Math.hypot(moved.x-original.x,moved.y-original.y)).toBeGreaterThan(5);
  expect(Math.hypot(moved.x-original.x,moved.y-original.y)).toBeLessThan(20);
});
