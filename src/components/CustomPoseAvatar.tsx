import { useEffect,useState } from 'react';
import type { Animation,AvatarSettings } from '../types';

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
  const [blink,setBlink]=useState(false);
  const [talkFrame,setTalkFrame]=useState(false);
  useEffect(()=>{
    let blinkTimeout:ReturnType<typeof setTimeout>|undefined;
    let endTimeout:ReturnType<typeof setTimeout>|undefined;
    let active=true;
    const next=()=>{
      const delay=2900+Math.random()*2000;
      blinkTimeout=setTimeout(()=>{
        if(!active)return;
        setBlink(true);
        endTimeout=setTimeout(()=>{if(active){setBlink(false);next();}},145);
      },delay);
    };
    next();
    return ()=>{active=false;clearTimeout(blinkTimeout);clearTimeout(endTimeout);};
  },[]);
  const talking=animation==='talking'&&speaking;
  useEffect(()=>{
    if(!talking){setTalkFrame(false);return;}
    // Switch between matching closed/open-mouth photographs while audio plays.
    const interval=setInterval(()=>setTalkFrame(s=>!s),185);
    return ()=>clearInterval(interval);
  },[talking]);
  const waving=animation==='waving';
  const portrait=blink&&settings.poses.blink
    ?settings.poses.blink
    :waving&&settings.poses.wave
      ?settings.poses.wave
      :talking&&talkFrame&&settings.poses.talk
        ?settings.poses.talk
        :settings.poses.idle;
  const b=settings.blink;
  return <div className={'custom-pose-avatar pose-state-'+animation+(talking?' pose-speaking':'')} role="img"
      aria-label="Aki, watak kartun prasejarah yang boleh bercakap, berkelip mata dan melambai">
    <div className={'custom-pose-character'+(waving?' pose-waving':'')+(animation==='jumping'?' pose-jumping':'')}>
      <img className="custom-pose-image" src={portrait} alt="Aki" draggable={false}/>
      {blink&&!settings.poses.blink&&<div className="pose-eyelids" aria-hidden="true">
        {[b.leftX,b.rightX].map((x,i)=><span key={i} className="pose-eyelid"
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
