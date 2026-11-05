import { useEffect,useState } from 'react';
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
export default function CustomPoseAvatar({settings,animation,speaking=false,onInteract}:Props){
  const [blinkTick,setBlinkTick]=useState(0);
  const [isBlinking,setBlinking]=useState(false);
  useEffect(()=>{
    // Irregular human-style blinking: a quick close/hold/open with occasional
    // double blink. Avoid a repeating CSS animation with robotic timing.
    let active=true;
    const timers:ReturnType<typeof setTimeout>[]=[];
    const schedule=(fn:()=>void,delay:number)=>{
      const id=setTimeout(()=>{if(active)fn();},delay);
      timers.push(id);
    };
    const blinkOnce=()=>{
      setBlinkTick(value=>value+1);
      setBlinking(true);
      schedule(()=>setBlinking(false),245);
    };
    const next=()=>{
      schedule(()=>{
        blinkOnce();
        if(Math.random()<.20)schedule(blinkOnce,345);
        schedule(next,650);
      },3500+Math.random()*3500);
    };
    next();
    return ()=>{active=false;timers.forEach(clearTimeout);};
  },[]);
  const pose=chooseAvatarPose(speaking,animation,settings.poses);
  const portrait=settings.poses[pose]??settings.poses.idle;
  const waving=animation==='waving'&&!speaking;
  const b=settings.blink;

  return <div className={'custom-pose-avatar pose-state-'+animation+(talking?' pose-speaking':'')} role="img"
      aria-label="Aki, watak kartun prasejarah yang boleh bercakap, berkelip mata dan melambai">
    <div className={'custom-pose-character'+(waving?' pose-waving':'')+(animation==='jumping'?' pose-jumping':'')}>
      <img className="custom-pose-image" src={portrait} alt="Aki" draggable={false}/>
      {isBlinking&& (settings.poses.blink
        ? <img key={'blink-'+blinkTick} className="custom-pose-image pose-blink-image"
            src={settings.poses.blink} alt="" aria-hidden="true" draggable={false}/>
        : <div key={'blink-'+blinkTick} className="pose-eyelids" aria-hidden="true">
            {[b.leftX,b.rightX].map((x,i)=><span key={i} className="pose-eyelid"
              style={{left:x+'%',top:b.eyeY+'%',width:b.eyeWidth+'%',height:b.eyeHeight+'%',
                backgroundColor:b.color}}/>)}
          </div>)}
    </div>
    {hitTargets.map(h=><button key={h.part} type="button" className="pose-hit"
      title={h.title} aria-label={h.title}
      style={{left:h.left+'%',top:h.top+'%',width:h.width+'%',height:h.height+'%'}}
      onClick={()=>onInteract(h.part)}/>)}
  </div>;
}
