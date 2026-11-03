import { useCallback, useEffect, useRef, useState } from 'react';

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
    utteranceRef.current=null;setSpeaking(false);
  },[ttsSupported]);
  const stopListening=useCallback(()=>{
    try{recognitionRef.current?.abort();}catch{ /* already stopped */ }
    recognitionRef.current=null;setListening(false);
  },[]);
  const stopAll=useCallback(()=>{stopSpeaking();stopListening();},[stopSpeaking,stopListening]);

  const speak=useCallback((text:string,rate:number,selectedVoice:string,onEnd?:()=>void):boolean=>{
    stopSpeaking();
    if(muted||!ttsSupported){onEnd?.();return false;}
    const allVoices=window.speechSynthesis.getVoices();
    const chosen=allVoices.find(v=>v.voiceURI===selectedVoice && /^ms(?:-|_)/i.test(v.lang))||allVoices.find(v=>/^ms(?:-|_)/i.test(v.lang));
    if(!chosen){setError('Tiada suara Bahasa Melayu yang disokong pada peranti ini. Sila baca jawapan dalam gelembung teks.');onEnd?.();return false;}
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang='ms-MY';utterance.voice=chosen;utterance.rate=rate;
    utterance.pitch=1.12;
    utterance.onstart=()=>setSpeaking(true);
    utterance.onend=()=>{if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);onEnd?.();}};
    utterance.onerror=()=>{if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);setError('Suara tidak dapat dimainkan. Baca jawapan yang tertera.');onEnd?.();}};
    utteranceRef.current=utterance;setError('');
    window.speechSynthesis.speak(utterance);
    return true;
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
  return {isListening,isSpeaking,muted,setMuted,voices,error,setError,speak,listen,stopSpeaking,stopListening,stopAll,ttsSupported,speechRecognitionSupported,hasMalayVoice:voices.some(v=>/^ms(?:-|_)/i.test(v.lang))};
}
