import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Check, CircleHelp, HelpCircle, Mic, MicOff, Pause, Send, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import Avatar from './components/Avatar';
import CameraWave from './components/CameraWave';
import TeacherPanel from './components/TeacherPanel';
import { initialData } from './data/seed';
import { fetchPublished, cloudAvailable, subscribePublished } from './lib/cloud';
import { matchQuestion } from './lib/matcher';
import { getStoredData, persistData } from './lib/storage';
import { useVoice } from './lib/speech';
import { voiceGender,isIndonesianVoice } from './lib/voiceChoice';
import type { Animation, AppData, SiteArt } from './types';

type TouchArea='head'|'belly'|'leftHand'|'rightHand'|'feet'|'face';
export default function App(){
  const [data,setData]=useState<AppData>(()=>getStoredData()??initialData);
  const [saveError,setSaveError]=useState('');
  const [input,setInput]=useState('');
  const [currentQuestion,setCurrentQuestion]=useState('');
  const [reply,setReply]=useState(initialData.settings.greeting);
  const [replyRecording,setReplyRecording]=useState<string|undefined>();
  const [animation,setAnimation]=useState<Animation>('waving');
  const [feedback,setFeedback]=useState('');
  const [teacherOpen,setTeacherOpen]=useState(false);
  const [cloudNote,setCloudNote]=useState('');
  const voice=useVoice();
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  const busyToken=useRef(0);
  const dataSettings=data.settings;
  const site=data.site;
  useEffect(()=>{
    if(!cloudAvailable || getStoredData())return;
    let ignore=false;
    const unsubscribe=subscribePublished(published=>{if(!ignore){setData(published);setCloudNote('Guru telah menerbitkan kandungan baharu secara langsung.');}});
    fetchPublished().then(published=>{
      if(!ignore&&published){setData(published);setReply(published.settings.greeting);setCloudNote('Kandungan terbitan guru berjaya dimuatkan.');}
    }).catch(()=>{if(!ignore)setCloudNote('Kandungan setempat digunakan. Sambungan dalam talian belum tersedia.');});
    return ()=>{ignore=true;unsubscribe();};
  },[]);
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);voice.stopAll();},[]); // teardown when leaving page
  const later=useCallback((fn:()=>void,ms:number)=>{const t=setTimeout(fn,ms);timers.current.push(t);},[]);
  const safeIdle=useCallback((token:number)=>{if(busyToken.current===token)setAnimation('idle');},[]);
  const say=useCallback((text:string,emotion:Animation='talking',recording?:string)=>{
    busyToken.current++;const token=busyToken.current;
    voice.stopSpeaking();setAnimation(emotion);setReply(text);setReplyRecording(recording);setFeedback('');
    // Speech synthesis may not exist: still provide reading and a visible reaction.
    const started=voice.speak(text,dataSettings.speechRate,dataSettings.preferredVoice,()=>safeIdle(token),recording);
    if(!started)later(()=>safeIdle(token),emotion==='talking'?1800:1300);
  },[voice,dataSettings,safeIdle,later]);
  const ask=useCallback((value:string)=>{
    const clean=value.trim();if(!clean)return;
    voice.stopAll();busyToken.current++;const token=busyToken.current;
    setInput('');setCurrentQuestion(clean);setAnimation('thinking');setReply('Sebentar, saya sedang memikirkan jawapannya.');setFeedback('');
    later(()=>{
      if(busyToken.current!==token)return;
      const match=matchQuestion(clean,data.questions);
      if(match.ambiguous.length){
        setFeedback('Sila nyatakan nama zaman atau kemukakan soalan yang lebih khusus.');
        say('Saya menemui beberapa soalan yang hampir sama. Sila kemukakan soalan yang lebih khusus.','confused');
      }else if(match.item){say(match.item.answerMS,'talking',match.item.audioMS);}
      else {say(dataSettings.unknownAnswer,'confused');}
    },550);
  },[data.questions,dataSettings.unknownAnswer,later,say,voice]);
  const handleTouch=useCallback((area:TouchArea)=>{
    const reacts:Record<TouchArea,Animation>={head:'happy',belly:'laughing',leftHand:'waving',rightHand:'happy',feet:'jumping',face:'surprised'};
    say(dataSettings.reactions[area],reacts[area]);
  },[dataSettings.reactions,say]);
  const handleUpdate=useCallback((next:AppData)=>{
    if(data.settings.greeting!==next.settings.greeting){setReply(current=>current===data.settings.greeting?next.settings.greeting:current);}
    setData(next);
    try{persistData(next);setSaveError('');}
    catch{setSaveError('Storan pelayar telah penuh. Eksport JSON dan kurangkan saiz imej; perubahan terbaru belum disimpan secara kekal.');}
  },[data.settings.greeting]);
  useEffect(()=>{if(animation==='listening' && !voice.isListening)setAnimation('idle');},[voice.isListening,animation]);
  const beginMic=()=>{
    if(voice.isListening){voice.stopListening();setAnimation('idle');return;}
    voice.stopSpeaking();busyToken.current++;setAnimation('listening');
    voice.listen(value=>{ask(value);});
  };
  const stopAudio=()=>{voice.stopSpeaking();busyToken.current++;setAnimation('idle');};
  const formatCopy=(value:string)=>value.replaceAll('{name}',dataSettings.name);
  const art=(item:SiteArt,kind:string)=>item.image?<img key={kind} className={'site-artwork site-artwork-'+kind} src={item.image}
    alt="" aria-hidden="true" draggable={false}
    style={{left:item.left+'%',top:item.top+'%',width:item.width+'px',opacity:item.opacity/100}}/>:null;
  const overlay=site.backgroundOverlay/100;
  const themeVars={
    '--site-bg':site.backgroundColor,'--site-header':site.headerColor,
    '--site-chat':site.chatColor,'--site-bubble':site.bubbleColor,
    '--site-accent':site.accentColor,'--site-text':site.textColor,'--site-button':site.buttonColor,
    '--site-font-size':site.fontScale/100,
    '--site-width':site.maxWidth+'px','--site-radius':site.cornerRadius+'px',
    '--site-hero-pad':site.heroSpacing+'px',
    fontFamily:site.fontFamily+', Arial, sans-serif',
    backgroundColor:site.backgroundColor,
    ...(site.backgroundImage?{backgroundImage:'linear-gradient(rgba(255,255,255,'+overlay+'),rgba(255,255,255,'+overlay+')),url("'+site.backgroundImage+'")',
      backgroundSize:'cover',backgroundPosition:site.backgroundPosition,backgroundAttachment:'fixed'}:{})
  } as CSSProperties;
  const hero=<section className="simple-hero" aria-labelledby="hero-title">
    {art(site.artLeft,'left')}{art(site.artRight,'right')}
    <div className="simple-intro"><span className="simple-eyebrow">{site.heroEyebrow}</span>
      <h1 id="hero-title">{site.heroBefore} <span>{dataSettings.name}</span>{site.heroAfter}</h1>
      <p>{site.heroDescription}</p></div>
    <div className="simple-avatar-area">
      <div className="speech-bubble simple-bubble" role="status" aria-live="polite"
        style={site.bubbleArtImage?{backgroundImage:'linear-gradient(#ffffffd9,#ffffffd9),url("'+site.bubbleArtImage+'")',backgroundSize:'cover',backgroundPosition:'center'}:{}}>
        <span className="bubble-label"><span className="little-dot"/> {formatCopy(site.bubbleCaption)}</span><p>{reply}</p><span className="bubble-tail"/></div>
      <div className="avatar-frame simple-avatar"
        style={{width:'min('+dataSettings.size+'px, 100%)',transform:'translateX('+dataSettings.horizontalOffset+'px)'}}>
        <Avatar settings={dataSettings} animation={animation} onInteract={handleTouch}/>
      </div>
    </div>
    {site.showTouchHint&&<p className="simple-tap-note">{site.touchHint}</p>}
  </section>;
  const chat=<section className="conversation-card simple-chat" aria-label="Ruang perbualan">
    {art(site.artChat,'chat')}
    <div className="conversation-heading simple-chat-heading"><div><h2>{formatCopy(site.chatTitle)}</h2><p>{site.chatDescription}</p></div>
      <span className="live-status"><span className={voice.isListening?'pulse-status':''}/>{voice.isListening?'Sedang mendengar...':voice.isSpeaking?'Sedang bercakap...':animation==='thinking'?'Sedang berfikir...':'Sedia untuk menjawab'}</span>
    </div>
    {currentQuestion&&<div className="student-question"><span>{site.questionCaption}</span><p>“{currentQuestion}”</p></div>}
    <form className="ask-controls" onSubmit={e=>{e.preventDefault();ask(input);}}>
      <button type="button" className={'microphone-button '+(voice.isListening?'recording':'')} onClick={beginMic}
        title={voice.isListening?'Hentikan mendengar':'Tanya menggunakan suara'} aria-label="Tanya menggunakan suara">
        {voice.isListening?<MicOff size={27}/>:<Mic size={27}/>}</button>
      <label className="question-input"><input value={input} onChange={e=>setInput(e.target.value)}
        placeholder={site.placeholder} aria-label="Soalan kepada Aki"/></label>
      <button className="send-button" type="submit" disabled={!input.trim()}><span>{site.sendLabel}</span><Send size={19}/></button>
    </form>
    {site.showVoiceControls&&<div className="speech-actions simple-speech-actions">
      <button onClick={()=>say(dataSettings.greeting,'talking')}><Volume2 size={16}/> {site.voiceTestLabel}</button>
      <button onClick={()=>say(reply,'talking',replyRecording)}><Volume2 size={16}/> {site.repeatLabel}</button>
      <button onClick={stopAudio}><Pause size={16}/> {site.stopLabel}</button>
      <button onClick={()=>voice.setMuted(v=>!v)}>{voice.muted?<VolumeX size={16}/>:<Volume2 size={16}/>} {voice.muted?site.unmuteLabel:site.muteLabel}</button>
      {voice.isListening&&<button onClick={()=>{voice.stopListening();setAnimation('idle');}}><MicOff size={16}/> Henti Mendengar</button>}
    </div>}
    {site.showCamera&&<CameraWave onWave={()=>say(site.cameraWaveVoice,'waving')}
      content={{title:site.cameraTitle,description:site.cameraDescription,start:site.cameraStart,stop:site.cameraStop,
        privacy:site.cameraPrivacy,ready:site.cameraReady,detected:site.cameraDetected,missing:site.cameraMissing}}/>}
    {(voice.error||feedback||saveError||cloudNote)&&<div className="notice-lines" aria-live="polite">
      {voice.error&&<p><HelpCircle size={15}/> {voice.error}</p>}{feedback&&<p><CircleHelp size={15}/> {feedback}</p>}
      {saveError&&<p><HelpCircle size={15}/> {saveError}</p>}{cloudNote&&<p><Check size={15}/> {cloudNote}</p>}</div>}
    {!voice.speechRecognitionSupported&&<p className="compatibility-note">Mikrofon tidak disokong pada pelayar ini. Kamu masih boleh menaip soalan.</p>}
  </section>;
  return <div className="app-shell simple-app custom-site" style={themeVars}>
    <header className="site-header simple-header">
      <div className="brand" aria-label="Kawan Prasejarah">
        <span className="brand-badge">{site.brandLogoImage?<img className="site-brand-art" alt="" src={site.brandLogoImage}/>:<span>🪨</span>}</span>
        <span className="brand-text"><strong>{site.brandBefore} <em>{site.brandAccent}</em></strong><small>{site.brandSubtitle}</small></span></div>
      <button className="teacher-button" onClick={()=>setTeacherOpen(true)}><ShieldCheck size={18}/> {site.teacherLabel}</button>
    </header>
    <main className="simple-main">{site.chatFirst?<>{chat}{hero}</>:<>{hero}{chat}</>}</main>
    <footer className="simple-footer">{site.footerLabel}</footer>
    {teacherOpen&&<TeacherPanel data={data} onChange={handleUpdate} onClose={()=>setTeacherOpen(false)}
      onSay={(message,audio)=>{setTeacherOpen(false);say(message,'talking',audio);}}
      onAnimate={()=>{setTeacherOpen(false);busyToken.current++;setAnimation('happy');later(()=>setAnimation('idle'),1700);}}
      onPreview={()=>setTeacherOpen(false)}
      voiceNames={voice.voices.filter(v=>isIndonesianVoice(v.lang)).map(v=>({value:v.voiceURI,
        label:(voiceGender(v.name)==='female'?'Suara wanita • ':'Suara • ')+v.name+' ('+v.lang+')'}))}/>}
  </div>;
}
