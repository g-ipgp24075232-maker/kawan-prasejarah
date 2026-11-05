import {useEffect,useRef,useState} from 'react';
import {renderSeamlessWave} from '../lib/handWave';

/** A single complete image, gently deformed at the palm while retaining
 * the complete original forearm. No detachable overlay, no wrist seam. */
export default function WavingPhoto({image}:{image:string}){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    let frame=0;
    let lastPaint=0;
    setReady(false);
    const avatar=new Image();
    avatar.onload=()=>{
      if(cancelled)return;
      const canvas=canvasRef.current;
      if(!canvas)return;
      canvas.width=avatar.naturalWidth;
      canvas.height=avatar.naturalHeight;
      const context=canvas.getContext('2d',{willReadFrequently:true});
      if(!context)return;
      const imageCanvas=document.createElement('canvas');
      imageCanvas.width=avatar.naturalWidth;
      imageCanvas.height=avatar.naturalHeight;
      const imageContext=imageCanvas.getContext('2d',{willReadFrequently:true});
      if(!imageContext)return;
      imageContext.drawImage(avatar,0,0);
      const source=imageContext.getImageData(0,0,avatar.naturalWidth,avatar.naturalHeight);
      const next=context.createImageData(source.width,source.height);
      const started=performance.now();
      renderSeamlessWave(source,next,0);
      context.putImageData(next,0,0);
      setReady(true);
      const animate=(now:number)=>{
        if(cancelled)return;
        frame=requestAnimationFrame(animate);
        // 25 fps is ample for a friendly waving gesture on school devices.
        if(now-lastPaint<40)return;
        lastPaint=now;
        // Moderate angles; keep the upper arm connected to the fixed body.
        const angle=11*Math.sin((now-started)*Math.PI*2/950);
        renderSeamlessWave(source,next,angle);
        context.putImageData(next,0,0);
      };
      frame=requestAnimationFrame(animate);
    };
    avatar.onerror=()=>{if(!cancelled)setReady(false);};
    avatar.src=image;
    return ()=>{cancelled=true;cancelAnimationFrame(frame);avatar.onload=null;avatar.onerror=null;};
  },[image]);
  return <>
    <img className="custom-pose-image" src={image} alt="Aki sedang melambai" draggable={false}/>
    <canvas ref={canvasRef} className={'pose-wave-canvas'+(ready?' is-ready':'')} aria-hidden="true"/>
  </>;
}
