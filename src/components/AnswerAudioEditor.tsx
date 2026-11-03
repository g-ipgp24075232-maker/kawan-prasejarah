import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Trash2, Upload } from 'lucide-react';
import { MAX_AUDIO_BYTES, validAnswerAudio } from '../lib/audio';

interface Props {
  audio?: string;
  onChange: (value?: string) => void;
}

const contentTypes: Record<string, string> = {
  mp3: 'audio/mpeg', m4a: 'audio/mp4', mp4: 'audio/mp4',
  wav: 'audio/wav', ogg: 'audio/ogg', webm: 'audio/webm', aac: 'audio/aac',
};

export default function AnswerAudioEditor({audio,onChange}: Props) {
  const [recording,setRecording]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const recorderRef=useRef<MediaRecorder|null>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const chunksRef=useRef<Blob[]>([]);
  const mounted=useRef(true);

  useEffect(()=>{
    mounted.current=true;
    return ()=>{
      mounted.current=false;
      if(recorderRef.current){recorderRef.current.onstop=null;recorderRef.current.ondataavailable=null;
        if(recorderRef.current.state!=='inactive')recorderRef.current.stop();}
      streamRef.current?.getTracks().forEach(track=>track.stop());
    };
  },[]);

  async function readAudio(file:File|Blob, filename='rakaman.webm') {
    const ext=filename.split('.').pop()?.toLowerCase()||'';
    const type=file.type.split(';')[0]||contentTypes[ext];
    if(!Object.values(contentTypes).includes(type))throw new Error('Sila pilih MP3, M4A, WAV, OGG, AAC atau WebM.');
    if(file.size>MAX_AUDIO_BYTES)throw new Error(`Rakaman terlalu besar (had ${Math.round(MAX_AUDIO_BYTES/1000)} KB). Gunakan MP3 yang lebih ringkas.`);
    if(!file.size)throw new Error('Tiada bunyi direkodkan. Sila cuba semula.');
    const blob=new Blob([file],{type});
    const dataURL=await new Promise<string>((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Fail audio tidak sah.'));
      reader.onerror=()=>reject(new Error('Audio gagal dibaca.'));
      reader.readAsDataURL(blob);
    });
    if(!validAnswerAudio(dataURL))throw new Error('Format atau saiz audio tidak disokong.');
    if(mounted.current){onChange(dataURL);setMessage('Rakaman manusia sedia. Tekan “Simpan Soalan” untuk menyimpannya.');}
  }

  async function upload(file?:File) {
    if(!file)return;
    setBusy(true);setMessage('');
    try{await readAudio(file,file.name);}
    catch(e){setMessage(e instanceof Error?e.message:'Rakaman gagal dimuatkan.');}
    finally{if(mounted.current)setBusy(false);}
  }

  async function startRecording(){
    setMessage('');
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){
      setMessage('Rakaman mikrofon tidak tersedia. Gunakan butang muat naik audio.');return;
    }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(!mounted.current){stream.getTracks().forEach(t=>t.stop());return;}
      streamRef.current=stream;chunksRef.current=[];
      const types=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'];
      const preferred=types.find(type=>MediaRecorder.isTypeSupported(type));
      const recorder=new MediaRecorder(stream,preferred?{mimeType:preferred}:undefined);
      recorderRef.current=recorder;
      recorder.ondataavailable=event=>{if(event.data.size)chunksRef.current.push(event.data);};
      recorder.onerror=()=>{if(mounted.current)setMessage('Rakaman terganggu. Sila cuba lagi.');};
      recorder.onstop=()=>{
        stream.getTracks().forEach(track=>track.stop());
        streamRef.current=null;recorderRef.current=null;
        if(mounted.current){setRecording(false);setBusy(true);}
        const blob=new Blob(chunksRef.current,{type:recorder.mimeType});
        void readAudio(blob,recorder.mimeType.includes('mp4')?'rakaman.mp4':'rakaman.webm')
          .catch(e=>{if(mounted.current)setMessage(e instanceof Error?e.message:'Rakaman gagal.');})
          .finally(()=>{if(mounted.current)setBusy(false);});
      };
      recorder.start(250);
      setRecording(true);
    }catch{setMessage('Mikrofon tidak dibenarkan atau tidak tersedia. Benarkan akses mikrofon atau muat naik MP3.');}
  }
  function stopRecording(){if(recorderRef.current?.state==='recording')recorderRef.current.stop();}

  return <section className="answer-audio-editor" aria-label="Rakaman jawapan manusia">
    <h4>🎙️ Suara Jawapan Manusia (pilihan)</h4>
    <p>Jika cikgu rakam atau muat naik suara sendiri, Aki akan menggunakan <strong>suara manusia sebenar</strong> apabila menjawab soalan ini. Jika tiada rakaman, suara automatik Bahasa Melayu akan digunakan jika tersedia.</p>
    <div className="answer-audio-buttons">
      <label className="btn btn-soft audio-upload-button"><Upload size={16}/> Muat Naik Audio
        <input type="file" accept="audio/mpeg,audio/mp3,audio/mp4,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/aac,.mp3,.m4a,.wav,.ogg,.webm,.aac" disabled={recording||busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';void upload(file);}}/>
      </label>
      {recording?<button className="btn btn-secondary" onClick={stopRecording}><MicOff size={16}/> Henti Rakaman</button>:
      <button className="btn btn-soft" disabled={busy} onClick={()=>void startRecording()}><Mic size={16}/> Rakam Dengan Mikrofon</button>}
      {audio&&<button className="btn btn-soft" disabled={recording||busy} onClick={()=>{onChange(undefined);setMessage('Rakaman dipadam daripada soalan ini. Simpan untuk mengesahkan.');}}><Trash2 size={16}/> Padam Audio</button>}
    </div>
    {recording&&<p className="recording-live" role="status">● Sedang merakam… Sebut jawapan dalam Bahasa Melayu, kemudian tekan Henti Rakaman.</p>}
    {audio&&<audio className="answer-audio-preview" src={audio} controls preload="none" aria-label="Dengar rakaman jawapan"/>}
    {message&&<p className="answer-audio-note" role="status">{message}</p>}
    <small>Had 700 KB bagi setiap rakaman. Sebaiknya MP3 mono yang ringkas. Fail disimpan dalam draf JSON; banyak rakaman boleh memenuhi storan pelayar. Gunakan Eksport JSON untuk sandaran.</small>
  </section>;
}
