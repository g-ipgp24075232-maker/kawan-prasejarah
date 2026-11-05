import { useEffect,useState } from 'react';
import type { CSSProperties } from 'react';
import type { Animation,AvatarSettings } from '../types';
import { chooseAvatarPose } from '../lib/avatarMotion';

type TouchArea='head'|'belly'|'leftHand'|'rightHand'|'feet'|'face';
interface Props{
  settings:AvatarSettings;
  animation:Animation;
  speaking?:boolean;
  onInteract:(part:TouchArea)=>void;
}
const hitTargets:{part:TouchArea;left:number;top:number;width:number;height:number;title:string}[]=[
  {part:'head',left:17,top:3,width:66,height:19,title:'Sentuh rambut'},
  {part:'face',left:28,top:21,width:45,height:26,title:'Sentuh muka'},
  {part:'leftHand',left:8,top:48,width:28,height:33,title:'Sentuh tangan kiri'},
  {part:'rightHand',left:70,top:49,width:25,height:32,title:'Sentuh tangan kanan'},
  {part:'belly',left:32,top:50,width:38,height:28,title:'Sentuh perut'},
  {part:'feet',left:27,top:84,width:53,height:16,title:'Sentuh kaki'}
];
function eyeMask(x:number,y:number,w:number,h:number):CSSProperties{
  const mask=`radial-gradient(ellipse ${w*.78}% ${h*.85}% at ${x}% ${y}%, #000 50%, transparent 100%)`;
  return {maskImage:mask,WebkitMaskImage:mask};
}
export default function CustomPoseAvatar({settings,animation,speaking=false,onInteract}:Props){
  const [blinkKey,setBlinkKey]=useState(0);
  const [blink,setBlink]=useState(false);
  const [mouthOpen,setMouthOpen]=useState(false);

  useEffect(()=>{
    let active=true;
    const timers=new Set<ReturnType<typeof setTimeout>>();
    const schedule=(fn:()=>void,ms:number)=>{
      const id=setTimeout(()=>{timers.delete(id);if(active)fn();},ms);
      timers.add(id);
    };
    const blinkOnce=()=>{
      setBlinkKey(x=>x+1);setBlink(true);
      schedule(()=>setBlink(false),235);
    };
    const plan=()=>{
      schedule(()=>{
        blinkOnce();
        if(Math.random()<.18)schedule(blinkOnce,340);
        schedule(plan,670);
      },3500+Math.random()*3500);
    };
    plan();
    return ()=>{active=false;timers.forEach(clearTimeout);};
  },[]);

  useEffect(()=>{
    if(!speaking||!settings.poses.talk){setMouthOpen(false);return;}
    let timer:ReturnType<typeof setTimeout>;
    let active=true;
    setMouthOpen(true);
    const next=(showOpen:boolean)=>{
      timer=setTimeout(()=>{
        if(!active)return;
        setMouthOpen(showOpen);
        // Vary the rhythm a little so that the mouth does not strobe.
        next(!showOpen);
      },showOpen?110+Math.random()*90:170+Math.random()*135);
    };
    next(false);
    return ()=>{active=false;clearTimeout(timer);};
  },[speaking,settings.poses.talk]);

  const pose=chooseAvatarPose(speaking,animation,settings.poses);
  const portrait=settings.poses[pose]??settings.poses.idle;
  const waving=animation==='waving'&&!speaking;
  const b=settings.blink;
  const mouth=settings.mouth;
  const mouthMask=`radial-gradient(ellipse ${mouth.width}% ${mouth.height}% at ${mouth.x}% ${mouth.y}%, #000 44%, rgba(0,0,0,.92) 62%, transparent 100%)`;
  const mouthStyle:CSSProperties={maskImage:mouthMask,WebkitMaskImage:mouthMask};
  return <div className={'custom-pose-avatar pose-state-'+animation+(speaking?' pose-speaking':'')}
      role="img" aria-label="Aki, watak kartun prasejarah yang berkelip mata dan menggerakkan mulut semasa bercakap">
    <div className={'custom-pose-character'+(waving?' pose-waving':'')+(animation==='jumping'?' pose-jumping':'')}>
      <img className="custom-pose-image" src={portrait} alt="Aki" draggable={false}/>
      {settings.poses.talk&&<img className={'custom-pose-image pose-mouth-overlay'+(speaking&&mouthOpen?' is-open':'')}
        src={settings.poses.talk} style={mouthStyle} alt="" aria-hidden="true" draggable={false}/>}
      {settings.poses.blink
        ? <div className="pose-eye-patches" aria-hidden="true">
            {[b.leftX,b.rightX].map((x,i)=><img key={i}
              className={'custom-pose-image pose-eye-picture'+(blink?' is-blinking':'')}
              src={settings.poses.blink} style={eyeMask(x,b.eyeY,b.eyeWidth*1.55,b.eyeHeight*1.55)}
              alt="" draggable={false}/>)}
          </div>
        : blink&&<div key={blinkKey} className="pose-eye-patches" aria-hidden="true">
            {[b.leftX,b.rightX].map((x,i)=><span key={i} className="pose-skin-eyelid"
              style={{left:x+'%',top:b.eyeY+'%',width:b.eyeWidth+'%',height:b.eyeHeight+'%',
                backgroundColor:b.color}}/>)}
          </div>}
    </div>
    {hitTargets.map(h=><button key={h.part} type="button" className="pose-hit"
      title={h.title} aria-label={h.title}
      style={{left:h.left+'%',top:h.top+'%',width:h.width+'%',height:h.height+'%'}}
      onClick={()=>onInteract(h.part)}/>)}
  </div>;
}
