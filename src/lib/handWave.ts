/** Seamless hand movement from the original full waving photograph.
 *
 * Previous version removed the palm from a still image and rotated it as a
 * separate layer. That exposed a wrist gap at large angles. This version
 * warps a small, gradually blended region of the SAME image each frame.
 * No pixels are cut away; displacement approaches zero across the forearm.
 *
 * Coordinates are normalized against the teacher's standard 364x521 Aki
 * sprite. For a replacement pose with substantially different anatomy,
 * wave movement may need separate calibration.
 */
export const WRIST={x:87,y:266};
const BASE_W=364,BASE_H=521;

export const smooth=(v:number):number=>{
  const t=Math.max(0,Math.min(1,v));
  return t*t*(3-2*t);
};

/** Fall off toward hair/face, the arm's elbow and the fixed shoulder. */
export function handInfluence(x:number,y:number):number{
  const maxX=84+33*smooth((y-234)/36);
  const rightEdge=1-smooth((x-maxX)/20);
  const belowWrist=1-smooth((y-266)/38);
  const aboveHand=smooth((y-183)/26);
  return rightEdge*belowWrist*aboveHand;
}

/** Inverse transform with gradual falloff: nearby pixels always stay joined. */
export function sourcePoint(x:number,y:number,angleDegrees:number):{x:number;y:number}{
  const theta=-angleDegrees*Math.PI/180*handInfluence(x,y);
  const dx=x-WRIST.x,dy=y-WRIST.y;
  const sin=Math.sin(theta),cos=Math.cos(theta);
  return {x:WRIST.x+dx*cos-dy*sin,y:WRIST.y+dx*sin+dy*cos};
}

function sampleBilinear(source:Uint8ClampedArray,width:number,height:number,
  sx:number,sy:number,dest:Uint8ClampedArray,destIndex:number):void{
  const x=Math.floor(sx),y=Math.floor(sy);
  const fx=sx-x,fy=sy-y;
  const points=[
    [x,y,(1-fx)*(1-fy)],[x+1,y,fx*(1-fy)],
    [x,y+1,(1-fx)*fy],[x+1,y+1,fx*fy]
  ];
  let alpha=0,r=0,g=0,b=0;
  for(const [px,py,weight] of points){
    if(px<0||px>=width||py<0||py>=height||weight<=0)continue;
    const offset=(py*width+px)*4;
    const a=source[offset+3]*weight;
    alpha+=a;r+=source[offset]*a;g+=source[offset+1]*a;b+=source[offset+2]*a;
  }
  if(alpha<=0){dest[destIndex]=0;dest[destIndex+1]=0;
    dest[destIndex+2]=0;dest[destIndex+3]=0;return;}
  dest[destIndex]=r/alpha;dest[destIndex+1]=g/alpha;
  dest[destIndex+2]=b/alpha;dest[destIndex+3]=alpha;
}

/** Reuses allocated image buffers. Only ~a quarter of the image is sampled;
 * everything outside the hand region is copied pixel-for-pixel unchanged. */
export function renderSeamlessWave(source:ImageData,target:ImageData,angleDegrees:number):void{
  if(source.width!==target.width||source.height!==target.height)
    throw new Error('Saiz bingkai animasi tidak sepadan.');
  const {width,height}=source;
  const sx=width/BASE_W,sy=height/BASE_H;
  const input=source.data,output=target.data;
  output.set(input);
  const top=Math.max(0,Math.floor(183*sy));
  const bottom=Math.min(height,Math.ceil(305*sy));
  const right=Math.min(width,Math.ceil(140*sx));
  for(let row=top;row<bottom;row++){
    const y=row/sy;
    for(let col=0;col<right;col++){
      const x=col/sx;
      if(handInfluence(x,y)<0.0005)continue;
      const point=sourcePoint(x,y,angleDegrees);
      const index=(row*width+col)*4;
      sampleBilinear(input,width,height,point.x*sx,point.y*sy,output,index);
    }
  }
}
