import {expect,it} from 'vitest';
import {isOpenPalm,WaveDetector,type Point} from './wave';
function hand(x:number,open=true):Point[]{
  const p=Array.from({length:21},()=>({x,y:0.6}));
  p[0]={x,y:.9};p[9]={x,y:.48};
  for(const [tip,pip] of [[8,6],[12,10],[16,14],[20,18]]){
    p[pip]={x,y:.53};p[tip]={x,y:open?.23:.77};
  }
  return p;
}
it('accepts open palm but rejects closed fist',()=>{
  expect(isOpenPalm(hand(.5))).toBe(true);
  expect(isOpenPalm(hand(.5,false))).toBe(false);
});
it('rejects stationary hands',()=>{
  const d=new WaveDetector();let triggered=false;
  for(let i=0;i<20;i++)triggered ||=d.update(hand(.5),i*100);
  expect(triggered).toBe(false);
});
it('recognizes side-to-side wave and applies cooldown',()=>{
  const d=new WaveDetector();let count=0;
  const xs=[.42,.46,.51,.56,.61,.66,.61,.56,.51,.46,.41,.36,.4,.44];
  xs.forEach((x,i)=>{if(d.update(hand(x),i*110))count++;});
  expect(count).toBe(1);
  xs.forEach((x,i)=>{if(d.update(hand(x),2000+i*110))count++;});
  expect(count).toBe(1);
});
it('ignores a closed fist moving',()=>{
  const d=new WaveDetector();
  const xs=[.32,.42,.54,.64,.55,.45,.35];
  expect(xs.some((x,i)=>d.update(hand(x,false),i*120))).toBe(false);
});
