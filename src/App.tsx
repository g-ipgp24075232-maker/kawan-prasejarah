import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, AudioLines, BookOpenText, Check, ChevronDown, CircleHelp, Compass, Headphones, HelpCircle, Mic, MicOff, Pause, Play, Send, Settings2, ShieldCheck, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import Avatar from './components/Avatar';
import TeacherPanel from './components/TeacherPanel';
import QuizPanel from './components/QuizPanel';
import { initialData } from './data/seed';
import { fetchPublished, cloudAvailable, subscribePublished } from './lib/cloud';
import { matchQuestion } from './lib/matcher';
import { getStoredData, persistData } from './lib/storage';
import { useVoice } from './lib/speech';
import { ERAS } from './types';
import type { Animation, AppData, Era } from './types';

const graphicLabels:Record<Era,{icon:string;sub:string;className:string}> = {
  Paleolitik:{icon:'🪨',sub:'Hidup berpindah-randah',className:'paleo'},
  Mesolitik:{icon:'🐟',sub:'Memburu & menangkap ikan',className:'meso'},
  Neolitik:{icon:'🏺',sub:'Pertanian & petempatan',className:'neo'},
  Logam:{icon:'⚒️',sub:'Peralatan & perdagangan',className:'metal'},
};

type TouchArea='head'|'belly'|'leftHand'|'rightHand'|'feet'|'face';
export default function App(){
  const [data,setData]=useState<AppData>(()=>getStoredData()??initialData);
  const [saveError,setSaveError]=useState('');
  const [input,setInput]=useState('');
  const [currentQuestion,setCurrentQuestion]=useState('');
  const [reply,setReply]=useState(initialData.settings.greeting);
  const [animation,setAnimation]=useState<Animation>('waving');
  const [feedback,setFeedback]=useState('');
  const [teacherOpen,setTeacherOpen]=useState(false);
  const [quizOpen,setQuizOpen]=useState(false);
  const [eraOpen,setEraOpen]=useState(false);
  const [audioOpen,setAudioOpen]=useState(false);
  const [selectedEra,setSelectedEra]=useState<Era>('Paleolitik');
  const [cloudNote,setCloudNote]=useState('');
  const voice=useVoice();
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  const busyToken=useRef(0);
  const questionInputRef=useRef<HTMLInputElement>(null);
  const dataSettings=data.settings;
  const suggested=useMemo(()=>{
    const starts=['P001','M003','N004','L005'];
    return starts.map(id=>data.questions.find(v=>v.id===id&&v.enabled)).filter((v):v is NonNullable<typeof v>=>Boolean(v));
  },[data.questions]);

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
  const say=useCallback((text:string,emotion:Animation='talking')=>{
    busyToken.current++;const token=busyToken.current;
    voice.stopSpeaking();setAnimation(emotion);setReply(text);setFeedback('');
    // Speech synthesis may not exist: still provide reading and a visible reaction.
    const started=voice.speak(text,dataSettings.speechRate,dataSettings.preferredVoice,()=>safeIdle(token));
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
      }else if(match.item){say(match.item.answerMS);}
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
  const showEra=(era:Era)=>{setSelectedEra(era);setEraOpen(true);};
  const sayEra=(era:Era)=>say(dataSettings.eraDescriptions[era]);
  const onQuizFeedback=(correct:boolean,message:string)=>{
    busyToken.current++;setAnimation(correct?'happy':'confused');
    later(()=>say(message,correct?'happy':'talking'),700);
  };
  const voiceNames=voice.voices.filter(v=>/^ms(?:-|_)/i.test(v.lang)).map(v=>({value:v.voiceURI,label:`${v.name} (${v.lang})`}));
  return <div className="app-shell" style={dataSettings.backgroundImage?{backgroundImage:`linear-gradient(180deg,rgba(246,252,234,.87),rgba(248,249,235,.86)),url(${dataSettings.backgroundImage})`,backgroundSize:'cover',backgroundAttachment:'fixed'}:{}}>
    <div className="sunshine sunshine-a"/><div className="sunshine sunshine-b"/>
    <header className="site-header">
      <button className="brand" onClick={()=>{setEraOpen(false);setQuizOpen(false);window.scrollTo({top:0,behavior:'smooth'});}}>
        <span className="brand-badge"><span>🪨</span></span><span className="brand-text"><strong>KAWAN <em>PRASEJARAH</em></strong><small>SAHABAT BELAJAR SEJARAH TAHUN 4</small></span>
      </button>
      <nav className="desktop-nav"><button onClick={()=>document.getElementById('learn-features')?.scrollIntoView({behavior:'smooth'})}>Aktiviti</button><button onClick={()=>setEraOpen(true)}>Kenali 4 Zaman</button><button onClick={()=>setQuizOpen(true)}>Kuiz</button></nav>
      <div className="nav-tools"><button className="top-audio" onClick={()=>setAudioOpen(v=>!v)} aria-label="Tetapan audio"><Headphones size={19}/></button><button className="teacher-button" onClick={()=>setTeacherOpen(true)}><ShieldCheck size={17}/> <span>Mod Guru</span></button></div>
    </header>
    {audioOpen&&<section className="audio-popover"><h3><AudioLines size={19}/> Tetapan Audio <button onClick={()=>setAudioOpen(false)} aria-label="Tutup"><X size={16}/></button></h3><label>Kelajuan suara: {dataSettings.speechRate.toFixed(2)}×<input type="range" min="0.6" max="1.5" step="0.05" value={dataSettings.speechRate} onChange={e=>handleUpdate({...data,settings:{...dataSettings,speechRate:Number(e.target.value)}})}/></label><button className="audio-toggle" onClick={()=>{voice.stopAll();busyToken.current++;setAnimation(animation==='sleeping'?'idle':'sleeping');setReply(animation==='sleeping'?'Hai! Saya sudah bangun!':'Zzz... Saya sedang berehat. Sentuh saya untuk bangun!');}}><Pause size={18}/> {animation==='sleeping'?'Kejutkan Aki':'Rehatkan Aki'}</button><button className="audio-toggle" onClick={()=>voice.setMuted(v=>!v)}>{voice.muted?<VolumeX size={18}/>:<Volume2 size={18}/>} {voice.muted?'Aktifkan suara':'Senyapkan suara'}</button><p>Suara Bahasa Melayu: {voice.hasMalayVoice?'Tersedia':'Tidak dikesan pada pelayar ini'}</p><p>Mikrofon: {voice.speechRecognitionSupported?'Disokong oleh pelayar':'Tidak tersedia — gunakan teks'}</p></section>}
    <main className="site-main">
      <section className="hero" aria-labelledby="hero-title"><div className="hero-sky"><span className="cloud-shape cloud-one"/><span className="cloud-shape cloud-two"/><span className="cloud-shape cloud-three"/><span className="hero-sun"/><span className="birds">⌣ &nbsp; ⌣</span></div>
        <div className="hero-landscape"><div className="far-hill h1"/><div className="far-hill h2"/><div className="cave"><span/></div><div className="tree tree-left"><i/><b/><b/><b/></div><div className="tree tree-right"><i/><b/><b/><b/></div><span className="fern fern-one">🌿</span><span className="fern fern-two">🌱</span><span className="fern fern-three">🌾</span><div className="ground-grass"/></div>
        <div className="hero-copy"><span className="eyebrow-pill"><Sparkles size={15}/> PENGEMBARAAN SEJARAH TAHUN 4</span><h1 id="hero-title">Hai, saya <span>{dataSettings.name}!</span><br/>Jom jadi kawan? <span className="heart">♥</span></h1><p>Saya manusia purba yang suka bercerita! Tanya saya apa-apa tentang empat zaman prasejarah.</p><div className="guide-note"><span>👆</span><span><strong>Cuba sentuh saya!</strong><br/>Usik kepala, perut, tangan atau kaki.</span></div></div>
        <div className="avatar-zone"><div className="sparkle sparkle-one">✦</div><div className="sparkle sparkle-two">✧</div><div className="sparkle sparkle-three">✦</div><div className="speech-bubble" role="status"><span className="bubble-label"><span className="little-dot"/> {dataSettings.name.toUpperCase()} BERKATA</span><p>{reply}</p><span className="bubble-tail"/></div>
          <div className="avatar-frame" style={{width:`min(${dataSettings.size}px, 100%)`,transform:`translateX(${dataSettings.horizontalOffset}px)`}}><Avatar settings={dataSettings} animation={animation} onInteract={handleTouch}/></div><div className="avatar-name-tag">🌟 {dataSettings.name} si Manusia Purba</div>
        </div>
      </section>
      <section className="conversation-card"><div className="conversation-heading"><span className="conversation-icon"><Mic size={19}/></span><div><h2>Jom Tanya {dataSettings.name}!</h2><p>Tekan mikrofon atau taip soalan kamu di bawah.</p></div><span className="live-status"><span className={voice.isListening?'pulse-status':''}/> {voice.isListening?'Sedang mendengar...':animation==='thinking'?'Sedang berfikir...':'Sedia untuk berbual'}</span></div>
        {currentQuestion&&<div className="student-question"><span>KAMU TANYA</span><p>“{currentQuestion}”</p></div>}
        <form className="ask-controls" onSubmit={e=>{e.preventDefault();ask(input);}}><button type="button" className={`microphone-button ${voice.isListening?'recording':''}`} onClick={beginMic} title={voice.isListening?'Hentikan mendengar':'Tanya menggunakan suara'} aria-label="Tanya menggunakan suara">{voice.isListening?<MicOff size={28}/>:<Mic size={27}/>}</button><label className="question-input"><input ref={questionInputRef} value={input} onChange={e=>setInput(e.target.value)} placeholder="Contoh: Di manakah manusia Paleolitik tinggal?" aria-label="Taip soalan kepada Aki"/></label><button className="send-button" type="submit" disabled={!input.trim()}><span>Hantar</span><Send size={19}/></button></form>
        <div className="speech-actions"><button onClick={()=>say(reply)}><Volume2 size={16}/> Ulang Jawapan</button><button onClick={stopAudio}><Pause size={16}/> Henti Bercakap</button><button onClick={()=>voice.setMuted(v=>!v)}>{voice.muted?<VolumeX size={16}/>:<Volume2 size={16}/>} {voice.muted?'Buka Audio':'Senyapkan'}</button>{voice.isListening&&<button onClick={()=>{voice.stopListening();setAnimation('idle');}}><MicOff size={16}/> Henti Mendengar</button>}</div>
        {(voice.error||feedback||saveError||cloudNote)&&<div className="notice-lines" aria-live="polite">{voice.error&&<p><HelpCircle size={15}/> {voice.error}</p>}{feedback&&<p><CircleHelp size={15}/> {feedback}</p>}{saveError&&<p><HelpCircle size={15}/> {saveError}</p>}{cloudNote&&<p><Check size={15}/> {cloudNote}</p>}</div>}
        {!voice.speechRecognitionSupported&&<p className="compatibility-note">Mikrofon tidak disokong di sini. Kamu masih boleh bertanya melalui ruang teks.</p>}
      </section>
      <section className="suggestions"><div className="micro-heading"><span><Sparkles size={17}/> TAK TAHU NAK TANYA APA?</span><p>Cuba klik soalan menarik ini!</p></div><div className="suggestion-pills">{suggested.map(v=><button key={v.id} onClick={()=>ask(v.question)}><CircleHelp size={16}/>{v.question}<ArrowRight size={15}/></button>)}</div></section>
      <section id="learn-features" className="learning-features"><div className="features-heading"><div><span className="eyebrow">JOM TEROKA BERSAMA!</span><h2>Macam-macam boleh buat di sini <span>✦</span></h2></div><p>Pilih aktiviti kegemaran kamu dan mulakan pengembaraan zaman dahulu kala.</p></div>
        <div className="feature-cards"><button className="feature-card card-ask" onClick={()=>{questionInputRef.current?.focus();document.querySelector('.conversation-card')?.scrollIntoView({behavior:'smooth',block:'center'});}}><span className="feature-art"><Mic size={37}/></span><span className="feature-card-title">Tanya Saya!</span><span className="feature-desc">Ada soalan? Berbual terus dengan Aki!</span><span className="feature-link">Mula berbual <ArrowRight size={17}/></span></button>
          <button className="feature-card card-era" onClick={()=>setEraOpen(true)}><span className="feature-art"><Compass size={39}/></span><span className="feature-card-title">Kenali 4 Zaman</span><span className="feature-desc">Paleolitik, Mesolitik, Neolitik & Logam!</span><span className="feature-link">Jom teroka <ArrowRight size={17}/></span></button>
          <button className="feature-card card-quiz" onClick={()=>setQuizOpen(true)}><span className="feature-art"><BookOpenText size={39}/></span><span className="feature-card-title">Kuiz Ringkas</span><span className="feature-desc">Uji pengetahuan dan kumpul bintang!</span><span className="feature-link">Cuba kuiz <ArrowRight size={17}/></span></button></div>
      </section>
      <section className="four-eras"><div className="four-eras-heading"><h2>Empat Zaman, Satu Pengembaraan!</h2><p>Klik pada mana-mana zaman untuk dengar cerita Aki.</p></div><div className="era-cards">{ERAS.map((era,index)=><button key={era} className={`era-card ${graphicLabels[era].className}`} onClick={()=>showEra(era)}><span className="era-index">0{index+1}</span><span className="era-big-icon">{graphicLabels[era].icon}</span><strong>Zaman {era}</strong><small>{graphicLabels[era].sub}</small><span className="era-go"><ArrowRight size={17}/></span></button>)}</div></section>
    </main>
    <footer className="site-footer"><span>🪨 KAWAN PRASEJARAH</span><span>Dibina untuk pembelajaran Sejarah Tahun 4 • Belajar sambil bermain!</span><button onClick={()=>setTeacherOpen(true)}>Mod Guru <Settings2 size={16}/></button></footer>
    {teacherOpen&&<TeacherPanel data={data} onChange={handleUpdate} onClose={()=>setTeacherOpen(false)} onSay={message=>{setTeacherOpen(false);say(message);}} onAnimate={()=>{setTeacherOpen(false);busyToken.current++;setAnimation('happy');later(()=>setAnimation('idle'),1700);}} voiceNames={voiceNames}/>}
    {quizOpen&&<QuizPanel quizzes={data.quizzes} onClose={()=>setQuizOpen(false)} onRead={text=>say(text)} onFeedback={onQuizFeedback}/>}
    {eraOpen&&<div className="feature-backdrop"><section className="feature-modal era-modal" role="dialog" aria-modal="true" aria-label="Kenali Empat Zaman"><button className="icon-button feature-close" onClick={()=>setEraOpen(false)} aria-label="Tutup"><X/></button><div className="feature-head"><span className="feature-icon">🌿</span><div><div className="eyebrow">MISI MERENTAS ZAMAN</div><h2>Kenali 4 Zaman</h2><p>Pilih satu zaman untuk dengar kisah kehidupan manusia dahulu.</p></div></div><div className="era-tabs">{ERAS.map(era=><button key={era} className={selectedEra===era?'selected':''} onClick={()=>setSelectedEra(era)}>{era}</button>)}</div><div className="era-story"><div className={`era-story-art ${graphicLabels[selectedEra].className}`}>{graphicLabels[selectedEra].icon}<span>✦</span></div><span className="story-eyebrow">PENGEMBARAAN SEJARAH</span><h3>Zaman {selectedEra}</h3><p>{dataSettings.eraDescriptions[selectedEra]}</p><button className="btn btn-primary" onClick={()=>{setEraOpen(false);sayEra(selectedEra);}}><Volume2 size={18}/> Dengar Cerita Aki</button></div><button className="back-bottom" onClick={()=>setEraOpen(false)}>Tutup <ChevronDown size={17}/></button></section></div>}
    <button className="floating-help" onClick={()=>{setEraOpen(false);setQuizOpen(false);setTeacherOpen(false);say(dataSettings.greeting,'waving');}} aria-label="Dengar sapaan Aki"><Play size={19}/><span>Dengar sapaan!</span></button>
  </div>;
}
