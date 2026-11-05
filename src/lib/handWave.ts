/** Split the pupil's raised-hand pose into a stable body and a moving hand.
 * Uses the teacher-uploaded wave picture entirely in the browser: no API,
 * no AI call and no extra image upload. The polygon is calibrated to Aki's
 * current three-pose 364x521 portrait.
 */
export interface WaveSprite {body:string;hand:string;}
export const HAND_PIVOT={x:66/364*100,y:276/521*100};
export const HAND_POLYGON:[number,number][]=[
  [18,216],[35,211],[55,207],[63,207],[70,219],[90,225],
  [94,248],[87,260],[78,269],[72,282],[61,282],[50,277],
  [37,268],[22,256],[17,239]
];
export function armMaskPath(ctx:CanvasRenderingContext2D,width:number,height:number):void{
  const sx=width/364,sy=height/521;
  ctx.beginPath();
  HAND_POLYGON.forEach(([x,y],index)=>{
    if(index===0)ctx.moveTo(x*sx,y*sy);
    else ctx.lineTo(x*sx,y*sy);
  });
  ctx.closePath();
}
function load(src:string):Promise<HTMLImageElement>{
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('Gambar melambai tidak dapat diproses.'));
    img.src=src;
  });
}
function newCanvas(w:number,h:number):[HTMLCanvasElement,CanvasRenderingContext2D]{
  const canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Pelayar tidak menyokong animasi gambar ini.');
  return [canvas,ctx];
}
export async function splitWaveImage(src:string):Promise<WaveSprite>{
  const image=await load(src);
  if(!image.naturalWidth||!image.naturalHeight)throw new Error('Saiz imej tidak sah.');
  const [bodyCanvas,bodyCtx]=newCanvas(image.naturalWidth,image.naturalHeight);
  bodyCtx.drawImage(image,0,0);
  bodyCtx.globalCompositeOperation='destination-out';
  armMaskPath(bodyCtx,bodyCanvas.width,bodyCanvas.height);
  bodyCtx.fillStyle='#000';
  bodyCtx.fill();
  bodyCtx.globalCompositeOperation='source-over';

  const [handCanvas,handCtx]=newCanvas(image.naturalWidth,image.naturalHeight);
  handCtx.drawImage(image,0,0);
  handCtx.globalCompositeOperation='destination-in';
  armMaskPath(handCtx,handCanvas.width,handCanvas.height);
  handCtx.fillStyle='#000';
  handCtx.fill();
  handCtx.globalCompositeOperation='source-over';
  return {body:bodyCanvas.toDataURL('image/png'),hand:handCanvas.toDataURL('image/png')};
}
