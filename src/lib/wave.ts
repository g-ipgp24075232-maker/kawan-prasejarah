/** Only recent, genuine side-to-side motion with an open palm counts as a wave. */
export type Point = {x:number;y:number};
const fingers:[number,number][]=[[8,6],[12,10],[16,14],[20,18]];
export function isOpenPalm(points:Point[]):boolean {
  if(points.length<21)return false;
  // Compare fingertip-to-wrist distance with PIP-to-wrist distance.
  const wrist=points[0];
  let extended=0;
  for(const [tip,pip] of fingers){
    const d1=Math.hypot(points[tip].x-wrist.x,points[tip].y-wrist.y);
    const d2=Math.hypot(points[pip].x-wrist.x,points[pip].y-wrist.y);
    if(d1>d2*1.12)extended++;
  }
  return extended>=3;
}
export class WaveDetector {
  private samples:{x:number;t:number}[]=[];
  private cooldownUntil=0;
  update(points:Point[]|undefined,now:number):boolean {
    if(!points||!isOpenPalm(points)){
      this.samples=[];
      return false;
    }
    const x=points[9].x;
    this.samples.push({x,t:now});
    this.samples=this.samples.filter(p=>now-p.t<=1750);
    if(now<this.cooldownUntil||this.samples.length<7)return false;
    const turns:{x:number;t:number}[]=[];
    let lastDirection=0;
    let anchor=this.samples[0];
    let peak=this.samples[0];
    for(const sample of this.samples.slice(1)){
      const dx=sample.x-peak.x;
      const direction=Math.abs(dx)>0.025?Math.sign(dx):0;
      if(!direction)continue;
      if(lastDirection&&direction!==lastDirection&&Math.abs(peak.x-anchor.x)>=0.10){
        turns.push(peak);
        anchor=peak;
      }
      lastDirection=direction;
      peak=sample;
    }
    const travel=Math.abs(peak.x-anchor.x);
    const duration=now-this.samples[0].t;
    // One back-and-forth and enough amplitude, not a stationary raised hand.
    if(turns.length>=1&&travel>=0.10&&duration>=350){
      this.cooldownUntil=now+3800;
      this.samples=[];
      return true;
    }
    return false;
  }
  reset(){this.samples=[];this.cooldownUntil=0;}
}
