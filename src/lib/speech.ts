import { useCallback, useEffect, useRef, useState } from 'react';
import { validAnswerAudio } from './audio';
import { orderedIndonesianVoices } from './voiceChoice';

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

  /** Prefer teacher recordings; otherwise use Indonesian browser speech. */
  const speak=useCallback((text:string,rate:number,selectedVoice:string,onEnd?:()=>void,recordedAudio?:string):boolean=>{
    stopSpeaking();
    if(muted){onEnd?.();return false;}
    const speakSynthetic=():boolean=>{
      if(!ttsSupported){setError('Peranti ini tidak menyokong suara automatik. Cikgu boleh memuat naik rakaman suara dalam Mod Guru.');onEnd?.();return false;}
      const allVoices=window.speechSynthesis.getVoices();
      const candidates=orderedIndonesianVoices(allVoices,selectedVoice);
      // Browsers may initially expose no voices. Try their Indonesian default.
      if(!candidates.length){
        const utterance=new SpeechSynthesisUtterance(text);
        utterance.lang='id-ID';utterance.rate=rate;utterance.pitch=1.06;
        utterance.onstart=()=>{if(utteranceRef.current===utterance)setSpeaking(true);};
        utterance.onend=()=>{if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);onEnd?.();}};
        utterance.onerror=()=>{if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);setError('Suara automatik tidak dapat dimainkan. Cuba pelayar Chrome atau gunakan rakaman suara guru.');onEnd?.();}};
        utteranceRef.current=utterance;setError('');
        try{window.speechSynthesis.speak(utterance);return true;}
        catch{utteranceRef.current=null;setError('Pelayar tidak dapat memainkan suara.');onEnd?.();return false;}
      }
      let index=0;
      const runNext=()=>{
        const chosen=candidates[index++];
        if(!chosen){
          setSpeaking(false);
          setError('Suara tidak dapat dimainkan. Cuba pilihan lain dalam Mod Guru atau gunakan rakaman guru.');
          onEnd?.();return;
        }
        const utterance=new SpeechSynthesisUtterance(text);
        utterance.voice=chosen;
        utterance.lang=chosen.lang;
        utterance.rate=rate;
        utterance.pitch=1.06;
        utterance.onstart=()=>{if(utteranceRef.current===utterance)setSpeaking(true);};
        utterance.onend=()=>{if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);onEnd?.();}};
        utterance.onerror=()=>{
          if(utteranceRef.current!==utterance)return;
          utteranceRef.current=null;setSpeaking(false);
          runNext();
        };
        utteranceRef.current=utterance;
        setError(/^id(?:[-_]|$)/i.test(chosen.lang)?'':'Suara pilihan tidak tersedia; suara '+chosen.lang+' digunakan sebagai gantian. Sebutan mungkin berbeza.');
        try{window.speechSynthesis.speak(utterance);}
        catch{if(utteranceRef.current===utterance){utteranceRef.current=null;runNext();}}
      };
      runNext();
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
  return {isListening,isSpeaking,muted,setMuted,voices,error,setError,speak,listen,stopSpeaking,stopListening,stopAll,ttsSupported,speechRecognitionSupported,hasMalayVoice:voices.some(v=>/^ms[-_]MY$/i.test(v.lang)),hasIndonesianVoice:voices.some(v=>/^id(?:[-_]|$)/i.test(v.lang))};
}
