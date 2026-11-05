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
      if(!ttsSupported){setError('Peranti ini tidak menyokong suara automatik. Cikgu boleh memuat naik rakaman suara Bahasa Melayu Malaysia untuk jawapan ini.');onEnd?.();return false;}
      const allVoices=window.speechSynthesis.getVoices();
      const malaysian=allVoices.filter(v=>/^ms[-_]MY$/i.test(v.lang));
      const likelyFemale=(name:string)=>/female|woman|perempuan|yasmin|siti|nurul|nora|amira|farah|sofia|aira|ayu|zara/i.test(name);
      const preferred=malaysian.find(v=>v.voiceURI===selectedVoice)||
        malaysian.find(v=>likelyFemale(v.name)&&/natural|neural|premium|enhanced/i.test(v.name))||
        malaysian.find(v=>likelyFemale(v.name))||
        malaysian.find(v=>/natural|neural|premium|enhanced/i.test(v.name))||
        malaysian[0];

      // Crucial: never silently return without speaking when ms-MY is not installed.
      // The answer text always remains Bahasa Melayu Malaysia; the fallback voice
      // may have a different accent, which must be clearly disclosed.
      const fallback=allVoices.find(v=>v.default)||allVoices[0];
      let triedFallback=false;
      const makeUtterance=(voiceChoice:SpeechSynthesisVoice|undefined):SpeechSynthesisUtterance=>{
        const utterance=new SpeechSynthesisUtterance(text);
        if(voiceChoice){utterance.voice=voiceChoice;utterance.lang=voiceChoice.lang;}
        else utterance.lang='ms-MY'; // Let browser resolve a default voice even when getVoices() is empty.
        utterance.rate=rate;utterance.pitch=1.06;
        utterance.onstart=()=>{if(utteranceRef.current===utterance)setSpeaking(true);};
        utterance.onend=()=>{if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);onEnd?.();}};
        utterance.onerror=(event)=>{
          if(utteranceRef.current!==utterance)return;
          utteranceRef.current=null;setSpeaking(false);
          if(!triedFallback && preferred && fallback && fallback.voiceURI!==preferred.voiceURI){
            triedFallback=true;
            setError('Suara Malaysia gagal dimainkan. Suara lalai peranti digunakan; sebutannya mungkin berbeza.');
            run(fallback);
          } else if(!triedFallback && !preferred && !voiceChoice && fallback){
            triedFallback=true;
            setError('Suara Malaysia tidak tersedia. Mencuba suara lalai peranti.');
            run(fallback);
          } else {
            const description=event.error||'tidak diketahui';
            setError('Audio tidak dapat dimainkan ('+description+'). Pastikan peranti tidak disenyapkan, atau gunakan rakaman suara dalam Mod Guru.');
            onEnd?.();
          }
        };
        return utterance;
      };
      const run=(voiceChoice:SpeechSynthesisVoice|undefined)=>{
        const utterance=makeUtterance(voiceChoice);
        utteranceRef.current=utterance;
        try{window.speechSynthesis.speak(utterance);}
        catch{
          if(utteranceRef.current===utterance){utteranceRef.current=null;setSpeaking(false);
            setError('Pelayar tidak dapat memainkan suara. Semak audio peranti atau gunakan rakaman guru.');onEnd?.();}
        }
      };
      if(preferred){
        setError('');
        run(preferred);
      } else {
        setError(fallback
          ?'Suara wanita Bahasa Melayu Malaysia tidak tersedia. Suara lalai peranti digunakan; sebutan mungkin tidak tepat. Cikgu boleh memuat naik rakaman ms-MY dalam Mod Guru.'
          :'Suara ms-MY belum disenaraikan oleh pelayar. Mencuba suara lalai; jika tiada bunyi, muat naik rakaman ms-MY dalam Mod Guru.');
        run(fallback);
      }
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
  return {isListening,isSpeaking,muted,setMuted,voices,error,setError,speak,listen,stopSpeaking,stopListening,stopAll,ttsSupported,speechRecognitionSupported,hasMalayVoice:voices.some(v=>/^ms[-_]MY$/i.test(v.lang)),hasIndonesianVoice:false};
}
