import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CircleHelp, HelpCircle, Mic, MicOff, Pause, Send, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import Avatar from './components/Avatar';
import CameraWave from './components/CameraWave';
import TeacherPanel from './components/TeacherPanel';
import { initialData } from './data/seed';
import { fetchPublished, cloudAvailable, subscribePublished } from './lib/cloud';
import { matchQuestion } from './lib/matcher';
import { getStoredData, persistData } from './lib/storage';
import { useVoice } from './lib/speech';
import type { Animation, AppData } from './types';

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
    setInput('');setCurrentQuestion(clean);setAnimation('thinking');setReply('Hmm... biar saya fikir!');setFeedback('');
    later(()=>{
      if(busyToken.current!==token)return;
      const match=matchQuestion(clean,data.questions);
      if(match.ambiguous.length){
        setFeedback('Cuba sebut nama zaman atau tanya soalan yang lebih khusus.');
        say('Saya jumpa beberapa soalan yang hampir sama. Boleh kamu tanya dengan lebih khusus?','confused');
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
  return <div className="app-shell simple-app" style={dataSettings.backgroundImage?{backgroundImage:'linear-gradient(180deg,rgba(250,253,242,.91),rgba(247,250,238,.91)),url("' + dataSettings.backgroundImage + '")',backgroundSize:'cover',backgroundPosition:'center'}:{}}>
    <header className="site-header simple-header">
      <div className="brand" aria-label="Kawan Prasejarah"><span className="brand-badge"><span>🪨</span></span><span className="brand-text"><strong>KAWAN <em>PRASEJARAH</em></strong><small>JOM BERBUAL DENGAN AKI!</small></span></div>
      <button className="teacher-button" onClick={()=>setTeacherOpen(true)}><ShieldCheck size={18}/> Mod Guru</button>
    </header>
    <main className="simple-main">
      <section className="simple-hero" aria-labelledby="hero-title">
        <div className="simple-intro"><span className="simple-eyebrow">SAHABAT SEJARAH TAHUN 4</span><h1 id="hero-title">Hai, saya <span>{dataSettings.name}!</span></h1><p>Tanya saya tentang Zaman Prasejarah. Saya sedia mendengar!</p></div>
        <div className="simple-avatar-area">
          <div className="speech-bubble simple-bubble" role="status" aria-live="polite"><span className="bubble-label"><span className="little-dot"/> {dataSettings.name.toUpperCase()} BERKATA</span><p>{reply}</p><span className="bubble-tail"/></div>
          <div className="avatar-frame simple-avatar" style={{width:'min(' + dataSettings.size + 'px, 100%)',transform:'translateX(' + dataSettings.horizontalOffset + 'px)'}}><Avatar settings={dataSettings} animation={animation} onInteract={handleTouch}/></div>
        </div>
        <p className="simple-tap-note">Sentuh Aki untuk melihat reaksinya!</p>
      </section>
      <section className="conversation-card simple-chat" aria-label="Ruang perbualan">
        <div className="conversation-heading simple-chat-heading"><div><h2>Jom Tanya {dataSettings.name}!</h2><p>Bercakap melalui mikrofon atau taip soalan.</p></div><span className="live-status"><span className={voice.isListening?'pulse-status':''}/>{voice.isListening?'Sedang mendengar...':voice.isSpeaking?'Sedang bercakap...':animation==='thinking'?'Sedang berfikir...':'Sedia untuk berbual'}</span></div>
        {currentQuestion&&<div className="student-question"><span>KAMU TANYA</span><p>“{currentQuestion}”</p></div>}
        <form className="ask-controls" onSubmit={e=>{e.preventDefault();ask(input);}}>
          <button type="button" className={'microphone-button ' + (voice.isListening?'recording':'')} onClick={beginMic} title={voice.isListening?'Hentikan mendengar':'Tanya menggunakan suara'} aria-label="Tanya menggunakan suara">{voice.isListening?<MicOff size={27}/>:<Mic size={27}/>}</button>
          <label className="question-input"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Contoh: Di manakah manusia Paleolitik tinggal?" aria-label="Soalan kepada Aki"/></label>
          <button className="send-button" type="submit" disabled={!input.trim()}><span>Hantar</span><Send size={19}/></button>
        </form>
        <div className="speech-actions simple-speech-actions">
          <button onClick={()=>say(reply,'talking',replyRecording)}><Volume2 size={16}/> Ulang Jawapan</button>
          <button onClick={stopAudio}><Pause size={16}/> Henti Bercakap</button>
          <button onClick={()=>voice.setMuted(v=>!v)}>{voice.muted?<VolumeX size={16}/>:<Volume2 size={16}/>} {voice.muted?'Buka Audio':'Senyapkan'}</button>
          {voice.isListening&&<button onClick={()=>{voice.stopListening();setAnimation('idle');}}><MicOff size={16}/> Henti Mendengar</button>}
        </div>
        <CameraWave onWave={()=>say('Hai, kawan! Saya nampak kamu melambai! Hai!','waving')}/>
        {(voice.error||feedback||saveError||cloudNote)&&<div className="notice-lines" aria-live="polite">{voice.error&&<p><HelpCircle size={15}/> {voice.error}</p>}{feedback&&<p><CircleHelp size={15}/> {feedback}</p>}{saveError&&<p><HelpCircle size={15}/> {saveError}</p>}{cloudNote&&<p><Check size={15}/> {cloudNote}</p>}</div>}
        {!voice.speechRecognitionSupported&&<p className="compatibility-note">Mikrofon tidak disokong pada pelayar ini. Kamu masih boleh menaip soalan.</p>}
      </section>
    </main>
    <footer className="simple-footer">KAWAN PRASEJARAH · Sejarah Tahun 4</footer>
    {teacherOpen&&<TeacherPanel data={data} onChange={handleUpdate} onClose={()=>setTeacherOpen(false)} onSay={(message,audio)=>{setTeacherOpen(false);say(message,'talking',audio);}} onAnimate={()=>{setTeacherOpen(false);busyToken.current++;setAnimation('happy');later(()=>setAnimation('idle'),1700);}} voiceNames={voice.voices.filter(v=>/^(ms|id)(?:-|_)/i.test(v.lang)).map(v=>({value:v.voiceURI,label:v.name+' ('+v.lang+')'}))}/>}
  </div>;
}
