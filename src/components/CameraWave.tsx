import { useEffect,useRef,useState } from 'react';
import { Camera,CameraOff,Hand,LoaderCircle } from 'lucide-react';
import { WaveDetector } from '../lib/wave';
import type { HandLandmarker } from '@mediapipe/tasks-vision';

type Status='off'|'starting'|'ready'|'error';
interface Props {onWave:()=>void;content:{title:string;description:string;start:string;stop:string;privacy:string;ready:string;detected:string;missing:string};}
const MODEL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm';

export default function CameraWave({onWave,content}:Props){
  const video=useRef<HTMLVideoElement>(null);
  const stream=useRef<MediaStream|null>(null);
  const detector=useRef<HandLandmarker|null>(null);
  const wave=useRef(new WaveDetector());
  const timeout=useRef<number|undefined>(undefined);
  const session=useRef(0);
  const onWaveRef=useRef(onWave);
  const [status,setStatus]=useState<Status>('off');
  const [message,setMessage]=useState('');
  const [handFound,setHandFound]=useState(false);
  onWaveRef.current=onWave;

  function cleanup(){
    session.current++;
    if(timeout.current!==undefined){window.clearTimeout(timeout.current);timeout.current=undefined;}
    detector.current?.close();detector.current=null;
    stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;
    if(video.current){video.current.pause();video.current.srcObject=null;}
    wave.current.reset();setHandFound(false);
  }
  useEffect(()=>()=>{cleanup();},[]);

  async function start(){
    cleanup();const id=session.current;
    setStatus('starting');setMessage('Menghidupkan kamera dan pengesan tangan…');
    if(!navigator.mediaDevices?.getUserMedia){
      setStatus('error');setMessage('Pelayar ini tidak menyokong kamera. Cuba Chrome melalui HTTPS.');return;
    }
    try{
      // Camera permission is requested only when the student explicitly presses Start.
      const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:480},height:{ideal:360}},audio:false});
      if(id!==session.current){media.getTracks().forEach(track=>track.stop());return;}
      stream.current=media;
      if(!video.current)throw new Error('Paparan kamera tidak tersedia.');
      video.current.srcObject=media;
      await video.current.play();
      const {FilesetResolver,HandLandmarker}=await import('@mediapipe/tasks-vision');
      const vision=await FilesetResolver.forVisionTasks(WASM);
      if(id!==session.current)return;
      const handDetector=await HandLandmarker.createFromOptions(vision,{
        baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numHands:1,
        minHandDetectionConfidence:.65,minHandPresenceConfidence:.65,minTrackingConfidence:.6
      });
      if(id!==session.current){handDetector.close();return;}
      detector.current=handDetector;
      setStatus('ready');setMessage(content.ready);
      const tick=()=>{
        if(id!==session.current)return;
        const element=video.current;
        if(element&&element.readyState>=2&&detector.current){
          try{
            const result=detector.current.detectForVideo(element,performance.now());
            const hand=result.landmarks[0];
            setHandFound(Boolean(hand));
            if(wave.current.update(hand,performance.now())){
              setMessage('Aki nampak kamu melambai! 👋');
              onWaveRef.current();
            }
          }catch{setMessage('Pengesanan tangan terganggu. Cuba tutup dan buka kamera.');}
        }
        timeout.current=window.setTimeout(tick,120);
      };
      tick();
    }catch(error){
      if(id!==session.current)return;
      cleanup();setStatus('error');
      const name=error instanceof DOMException?error.name:'';
      setMessage(name==='NotAllowedError'?'Kebenaran kamera ditolak. Benarkan akses kamera dalam pelayar.':
        name==='NotFoundError'?'Kamera tidak dijumpai pada peranti ini.':
        'Kamera atau pengesan tangan gagal dimulakan. Semak sambungan Internet, kemudian cuba lagi.');
    }
  }
  function stop(){cleanup();setStatus('off');setMessage('Kamera dimatikan.');}

  return <section className="camera-wave-card" aria-label="Interaksi lambaian kamera">
    <div className="camera-wave-heading"><Hand size={20}/><div><strong>{content.title}</strong><span>{content.description}</span></div></div>
    {status==='off'||status==='error'
      ?<button type="button" className="camera-start" onClick={()=>void start()}><Camera size={18}/> {content.start}</button>
      :<button type="button" className="camera-stop" onClick={stop}><CameraOff size={18}/> {content.stop}</button>}
    {status==='starting'&&<span className="camera-loading"><LoaderCircle size={16}/> Memuatkan pengesan tangan…</span>}
    <div className={'camera-preview '+(status==='off'||status==='error'?'camera-hidden':'')}>
      <video ref={video} autoPlay playsInline muted aria-label="Pratonton kamera sendiri"/>
      {status==='ready'&&<span className={'camera-indicator '+(handFound?'detected':'')}>{handFound?content.detected:content.missing}</span>}
    </div>
    {message&&<p className="camera-message" role="status">{message}</p>}
    <small>{content.privacy}</small>
  </section>;
}
