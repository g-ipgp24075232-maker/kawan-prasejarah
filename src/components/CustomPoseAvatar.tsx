import { useEffect,useState } from 'react';
import type { CSSProperties } from 'react';
import { splitWaveImage,HAND_PIVOT,type WaveSprite } from '../lib/handWave';
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
// Aki remains in one image. Only the photo's mouth patch is animated.
export default function CustomPoseAvatar({settings,animation,speaking=false,onInteract}:Props){
  const [waveLayers,setWaveLayers]=useState<WaveSprite|null>(null);
  useEffect(()=>{
    let active=true;
    setWaveLayers(null);
    if(settings.poses.wave){
      splitWaveImage(settings.poses.wave)
        .then(images=>{if(active)setWaveLayers(images);})
        .catch(()=>{if(active)setWaveLayers(null);});
    }
    return ()=>{active=false;};
  },[settings.poses.wave]);
  const pose=chooseAvatarPose(speaking,animation,settings.poses);
  const waving=animation==='waving'&&!speaking;
  const animatedWave=waving&&waveLayers!==null;
  const portrait=animatedWave?waveLayers.body:settings.poses[pose]??settings.poses.idle;
  const mouth=settings.mouth;
  const mouthMask=`radial-gradient(ellipse ${mouth.width}% ${mouth.height}% at ${mouth.x}% ${mouth.y}%, #000 44%, rgba(0,0,0,.92) 62%, transparent 100%)`;
  const mouthStyle:CSSProperties={
    maskImage:mouthMask,
    WebkitMaskImage:mouthMask,
    transformOrigin:mouth.x+'% '+mouth.y+'%'
  };
  return <div className={'custom-pose-avatar pose-state-'+animation+(speaking?' pose-speaking':'')}
      role="img" aria-label="Aki, watak kartun prasejarah yang melambai dengan tangan bergerak dan menggerakkan mulut ketika bercakap">
    <div className={'custom-pose-character'+(animation==='jumping'?' pose-jumping':'')}>
      <img className="custom-pose-image" src={portrait} alt="Aki" draggable={false}/>
      {animatedWave&&<img className="custom-pose-image pose-animated-hand"
        src={waveLayers.hand} style={{transformOrigin:HAND_PIVOT.x+'% '+HAND_PIVOT.y+'%'}}
        alt="" aria-hidden="true" draggable={false}/>}

      {settings.poses.talk&&<img
        className={'custom-pose-image pose-mouth-overlay'+(speaking?' is-speaking':'')}
        src={settings.poses.talk}
        style={mouthStyle}
        alt="" aria-hidden="true" draggable={false}/>}

    </div>
    {hitTargets.map(h=><button key={h.part} type="button" className="pose-hit"
      title={h.title} aria-label={h.title}
      style={{left:h.left+'%',top:h.top+'%',width:h.width+'%',height:h.height+'%'}}
      onClick={()=>onInteract(h.part)}/>)}
  </div>;
}
