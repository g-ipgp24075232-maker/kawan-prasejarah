import { useCallback, useEffect, useRef, useState } from 'react';
import { validAnswerAudio } from './audio';

interface RecognitionResult { isFinal:boolean; 0:{transcript:string}; }
interface RecognitionEvent { results:ArrayLike<RecognitionResult>; resultIndex:number; }
interface RecognitionErrorEvent { error:string; }
interface RecognitionEngine {
  lang:string;continuous:boolean;interimResults:boolean;
  onresult:((event:RecognitionEvent)=>void)|null;
  onerror:((event:RecognitionErrorEvent)=>void)|null;
  onend:(()=>void)|null;
  start:()=>void;stop:()=>void;abort:()=>void;
}
type RecognitionCtor=new()=>RecognitionEngine;

export function useVoice() {
  const recognitionRef=useRef<RecognitionEngine|null>(null);
  const utteranceRef=useRef<SpeechSynthesisUtterance|null>(null);
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const [isListening,setListening]=useState(false);
  const [isSpeaking,setSpeaking]=useState(false);
  const [muted,setMuted]=useState(false);
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
  const [error,setError]=useState('');
  const ttsSupported=typeof window!=='undefined' && 'speechSynthesis' in window;
  const speechRecognitionSupported=typeof window!=='undefined' && Boolean((window as Window & {SpeechRecognition?:RecognitionCtor;webkitSpeechRecognition?:RecognitionCtor}).SpeechRecognition || (window as Window & {webkitSpeechRecognition?:RecognitionCtor}).webkitSpeechRecognition);

  useEffect(()=>{
    if(!ttsSupported)return;
    const update=()=>setVoices(window.speechSynthesis.getVoices());
    update();window.speechSynthesis.addEventListener('voiceschanged',update);
    return ()=>{window.speechSynthesis.removeEventListener('voiceschanged',update);window.speechSynthesis.cancel();};
  },[ttsSupported]);
  const stopSpeaking=useCallback(()=>{
    if(ttsSupported)window.speechSynthesis.cancel();
    if(audioRef.current){audioRef.current.pause();audioRef.current.onended=null;audioRef.current.onerror=null;audioRef.current.onplaying=null;audioRef.current=null;}
    utteranceRef.current=null;setSpeaking(false);
  },[ttsSupported]);
  useEffect(()=>{if(muted)stopSpeaking();},[muted,stopSpeaking]);
  const stopListening=useCallback(()=>{
    try{recognitionRef.current?.abort();}catch{ /* already stopped */ }
    recognitionRef.current=null;setListening(false);
  },[]);
  const stopAll=useCallback(()=>{stopSpeaking();stopListening();},[stopSpeaking,stopListening]);

  /** Prefer a genuine teacher recording; otherwise use an installed Malay TTS voice. */
  const speak=useCallback((text:string,rate:number,selectedVoice:string,onEnd?:()=>void,recordedAudio?:string):boolean=>{
    stopSpeaking();
    if(muted){onEnd?.();return false;}
    const speakSynthetic=():boolean=>{
      if(!ttsSupported){setError('Peranti ini tidak menyokong suara automatik. Cikgu boleh muat naik rakaman suara untuk jawapan ini.');onEnd?.();return false;}
      const allVoices=window.speechSynthesis.getVoices();
      const malay=allVoices.filter(v=>/^ms(?:-|_)/i.test(v.lang));
      // Indonesian is a clearly labelled last resort when Malay is unavailable.
      const indonesian=allVoices.filter(v=>/^id(?:-|_)/i.test(v.lang));
      const candidates=malay.length?malay:indonesian;
      const chosen=candidates.find(v=>v.voiceURI===selectedVoice)||
        candidates.find(v=>/natural|neural|premium|enhanced/i.test(v.name))||candidates[0];
      if(!chosen){setError('Tiada suara Melayu atau Indonesia pada peranti ini. Cikgu boleh tambah rakaman suara manusia di Mod Guru.');onEnd?.();return false;}
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.lang=chosen.lang;utterance.voice=chosen;utterance.rate=rate;
      utterance.pitch=1;
      utterance.onstart=()=>{if(utteranceRef.current===utterance)setSpeaking(true);};
      utterance.onend=()=>{if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);onEnd?.();}};
      utterance.onerror=()=>{if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);setError('Suara tidak dapat dimainkan. Sila cuba rakaman suara guru.');onEnd?.();}};
      utteranceRef.current=utterance;setError(malay.length?'':'Suara Bahasa Melayu tidak tersedia; suara Indonesia digunakan sebagai gantian. Sebutan mungkin berbeza.');
      window.speechSynthesis.speak(utterance);
      return true;
    };
    if(validAnswerAudio(recordedAudio)){
      const audio=new Audio(recordedAudio);
      audio.playbackRate=rate;audioRef.current=audio;
      audio.onplaying=()=>{if(audioRef.current===audio)setSpeaking(true);};
      audio.onended=()=>{if(audioRef.current===audio){audioRef.current=null;setSpeaking(false);onEnd?.();}};
      let failed=false;
      const fallback=()=>{
        if(audioRef.current!==audio||failed)return;
        failed=true;audioRef.current=null;audio.pause();setSpeaking(false);
        setError('Rakaman tidak dapat dimainkan. Mencuba suara automatik.');
        speakSynthetic();
      };
      audio.onerror=fallback;
      setError('');
      void audio.play().catch(fallback);
      return true;
    }
    return speakSynthetic();
  },[muted,stopSpeaking,ttsSupported]);

  const listen=useCallback((onText:(text:string)=>void):void=>{
    stopListening();setError('');
    const ctor=(window as Window & {SpeechRecognition?:RecognitionCtor;webkitSpeechRecognition?:RecognitionCtor}).SpeechRecognition ||
      (window as Window & {webkitSpeechRecognition?:RecognitionCtor}).webkitSpeechRecognition;
    if(!ctor){setError('Pengecaman suara tidak tersedia di pelayar ini. Sila taip soalan.');return;}
    const recognizer=new ctor();recognizer.lang='ms-MY';recognizer.continuous=false;recognizer.interimResults=false;
    recognizer.onresult=(event)=>{
      let transcript='';for(let i=event.resultIndex;i<event.results.length;i++){
        if(event.results[i].isFinal)transcript+=event.results[i][0].transcript;
      }
      if(transcript.trim())onText(transcript.trim());
    };
    recognizer.onerror=(event)=>{setError(event.error==='not-allowed'?'Akses mikrofon ditolak. Sila benarkan mikrofon atau taip soalan.':`Tidak dapat mendengar (${event.error}). Sila taip soalan.`);setListening(false);};
    recognizer.onend=()=>{setListening(false);recognitionRef.current=null;};
    try{recognizer.start();recognitionRef.current=recognizer;setListening(true);}catch{setListening(false);setError('Mikrofon tidak dapat diaktifkan.');}
  },[stopListening]);
  return {isListening,isSpeaking,muted,setMuted,voices,error,setError,speak,listen,stopSpeaking,stopListening,stopAll,ttsSupported,speechRecognitionSupported,hasMalayVoice:voices.some(v=>/^ms(?:-|_)/i.test(v.lang)),hasIndonesianVoice:voices.some(v=>/^id(?:-|_)/i.test(v.lang))};
}
