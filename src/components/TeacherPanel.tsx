import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Check, CheckCircle2, CloudUpload, Download, FileUp, KeyRound, LockKeyhole, LogOut, Mic2, Pencil, Play, Plus, RotateCcw, Save, Search, Settings2, ShieldCheck, SlidersHorizontal, Trash2, Volume2, X } from 'lucide-react';
import type { AppData, ArtPart, AvatarSettings, Era, KnowledgeItem } from '../types';
import { ERAS } from '../types';
import { cloudAvailable, getTeacherSession, publishData, teacherLogin, teacherLogout } from '../lib/cloud';
import { downloadJson, isPinSet, parseBackup, setPin, verifyPin } from '../lib/storage';
import { matchQuestion } from '../lib/matcher';
import AnswerAudioEditor from './AnswerAudioEditor';
import SiteDesigner from './SiteDesigner';
import { prepareImage } from '../lib/imageTools';

type Tab='questions'|'settings'|'design'|'backups'|'publish';
interface Props {
  data:AppData;
  onChange:(next:AppData)=>void;
  onClose:()=>void;
  onSay:(value:string,audio?:string)=>void;
  onAnimate:()=>void;
  onPreview:()=>void;
  voiceNames:{value:string,label:string}[];
}
const newQuestion=():KnowledgeItem=>({id:crypto.randomUUID(),era:'Paleolitik',question:'',alternatives:[],keywords:[],answerMS:'',answerZH:'',enabled:true});

function UploadImage({label,image,onLoaded}: {label:string;image:string;onLoaded:(image:string)=>void}) {
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  return <div className="upload-card upload-preview-card">
    <strong>{label}</strong>
    {image?<img className="designer-image-preview" src={image} alt={'Pratonton '+label}/>:<small>Tiada gambar lagi</small>}
    <label className="upload-click"><FileUp size={16}/><span>{loading?'Memproses gambar…':'Muat Naik Gambar'}</span>
      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" onChange={async event=>{
        const file=event.target.files?.[0];event.target.value='';if(!file)return;
        setError('');setMessage('');setLoading(true);
        try{
          const prepared=await prepareImage(file,{maxDimension:1200,maxDataChars:350_000});
          onLoaded(prepared.data);
          setMessage(prepared.message+' Perubahan dapat dilihat pada halaman utama.');
        }catch(error){setError(error instanceof Error?error.message:'Gambar tidak boleh digunakan.');}
        finally{setLoading(false);}
      }}/>
    </label>
    {message&&<small className="designer-success" role="status">{message}</small>}
    {error&&<small className="small-error" role="alert">{error}</small>}
  </div>;
}

export default function TeacherPanel({data,onChange,onClose,onSay,onAnimate,onPreview,voiceNames}:Props) {
  const [unlocked,setUnlocked]=useState(false);
  const [onlineAuth,setOnlineAuth]=useState(false);
  const [localChoice,setLocalChoice]=useState(!cloudAvailable);
  const [pin,setPinValue]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [pinAlreadySet,setPinAlreadySet]=useState(isPinSet());
  const [loginError,setLoginError]=useState('');
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const [tab,setTab]=useState<Tab>('questions');
  const [term,setTerm]=useState('');
  const [filter,setFilter]=useState<Era|'Semua'>('Semua');
  const [editingQuestion,setEditingQuestion]=useState<KnowledgeItem|null>(null);
  const [altText,setAltText]=useState('');
  const [keywordText,setKeywordText]=useState('');
  const [testQuestion,setTestQuestion]=useState('');
  const [testResult,setTestResult]=useState<ReturnType<typeof matchQuestion>|null>(null);
  const fileInput=useRef<HTMLInputElement>(null);
  const settings=data.settings;

  useEffect(()=>{if(cloudAvailable)getTeacherSession().then(valid=>{if(valid){setUnlocked(true);setOnlineAuth(true);}}).catch(()=>{});},[]);
  const updateSettings=useCallback((update:Partial<AvatarSettings>)=>onChange({...data,settings:{...data.settings,...update}}),[onChange,data]);
  const updateReaction=(key:keyof AvatarSettings['reactions'],value:string)=>updateSettings({reactions:{...settings.reactions,[key]:value}});
  const startEditingQuestion=(item:KnowledgeItem)=>{setEditingQuestion({...item,alternatives:[...item.alternatives],keywords:[...item.keywords]});setAltText(item.alternatives.join('\n'));setKeywordText(item.keywords.join(', '));};
  const saveQuestion=()=>{
    if(!editingQuestion)return;
    const entry={...editingQuestion,question:editingQuestion.question.trim(),answerMS:editingQuestion.answerMS.trim(),
      alternatives:altText.split('\n').map(v=>v.trim()).filter(Boolean),keywords:keywordText.split(',').map(v=>v.trim()).filter(Boolean)};
    if(!entry.question||!entry.answerMS){setStatus('Sila isi soalan utama dan jawapan Bahasa Melayu.');return;}
    const exists=data.questions.some(item=>item.id===entry.id);
    onChange({...data,questions:exists?data.questions.map(v=>v.id===entry.id?entry:v):[...data.questions,entry]});
    setEditingQuestion(null);setStatus('Soalan berjaya disimpan. Aki akan membaca jawapan baharu atau memainkan rakaman suara manusianya.');
  };
  const visibleQuestions=useMemo(()=>data.questions.filter(v=>(filter==='Semua'||v.era===filter) && [v.question,v.answerMS,...v.keywords].join(' ').toLowerCase().includes(term.toLowerCase())),[data.questions,filter,term]);
  const importJson=async(file:File)=>{
    try{const next=parseBackup(await file.text());
      if(!window.confirm(`Pulihkan ${next.questions.length} soalan? Ini menggantikan draf semasa.`))return;
      onChange(next);setStatus('Sandaran JSON telah dipulihkan.');setEditingQuestion(null);
    }catch(error){setStatus(error instanceof Error?error.message:'Fail tidak sah.');}
  };
  const logout=async()=>{if(onlineAuth){try{await teacherLogout();}catch{/* local UI still locks */}}setUnlocked(false);setOnlineAuth(false);setPinValue('');setPassword('');};

  if(!unlocked) return <div className="teacher-backdrop" role="presentation"><section className="teacher-gate" role="dialog" aria-modal="true" aria-label="Kunci mod guru">
    <button className="icon-button close-gate" onClick={onClose} aria-label="Tutup"><X/></button>
    <span className="teacher-gate-icon"><LockKeyhole size={38}/></span><h2>Mod Guru</h2><p>Ruang khas untuk cikgu mengurus ilmu Aki.</p>
    {cloudAvailable && <div className="segmented-row"><button className={!localChoice?'selected':''} onClick={()=>{setLocalChoice(false);setLoginError('');}}>Guru Dalam Talian</button><button className={localChoice?'selected':''} onClick={()=>{setLocalChoice(true);setLoginError('');}}>Guru Setempat</button></div>}
    {localChoice ? <form className="gate-fields" onSubmit={async e=>{e.preventDefault();setLoginError('');
      if(pin.length<4){setLoginError('PIN mestilah sekurang-kurangnya empat aksara.');return;}
      if(!pinAlreadySet){await setPin(pin);setPinAlreadySet(true);setUnlocked(true);}else if(await verifyPin(pin)){setUnlocked(true);}else setLoginError('PIN tidak betul.');
      setPinValue('');}}>
      <label>{pinAlreadySet?'Masukkan PIN Guru':'Tetapkan PIN Guru buat kali pertama'}<input type="password" value={pin} onChange={e=>setPinValue(e.target.value)} minLength={4} maxLength={40} placeholder="PIN rahsia" autoComplete="off" required/></label>
      <button className="btn btn-primary" type="submit"><KeyRound size={17}/>{pinAlreadySet?'Masuk Mod Guru':'Tetapkan PIN & Masuk'}</button>
      <small>PIN setempat melindungi daripada suntingan tidak sengaja, bukan keselamatan pelayan. Simpanan hanya pada pelayar ini.</small>
    </form> : <form className="gate-fields" onSubmit={async e=>{e.preventDefault();setBusy(true);setLoginError('');try{await teacherLogin(email,password);setUnlocked(true);setOnlineAuth(true);}catch(err){setLoginError(err instanceof Error?err.message:'Log masuk gagal.');}finally{setBusy(false);}}}>
      <label>E-mel Guru<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label>
      <label>Kata Laluan<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>
      <button className="btn btn-primary" type="submit" disabled={busy}><ShieldCheck size={17}/> {busy?'Menyemak...':'Log Masuk Selamat'}</button>
      <small>Kebenaran guru disahkan oleh polisi pangkalan data Supabase.</small>
    </form>}
    {loginError && <p className="alert error" role="alert">{loginError}</p>}
  </section></div>;

  return <div className="teacher-backdrop"><section className="teacher-panel" role="dialog" aria-modal="true" aria-label="Papan pemuka guru">
    <header className="teacher-header"><div><span className="teacher-eyebrow"><ShieldCheck size={15}/> RUANG PENDIDIK</span><h2>Studio Guru <span>✦</span></h2><p>Urus kandungan, reka bentuk, gambar dan suara Aki pada bila-bila masa.</p></div><div className="teacher-header-actions"><span className="mode-pill">{onlineAuth?'● Guru Dalam Talian':'● Simpanan Setempat'}</span><button className="icon-button" onClick={logout} title="Log keluar"><LogOut size={19}/></button><button className="icon-button" onClick={onClose} title="Tutup"><X size={23}/></button></div></header>
    <nav className="teacher-tabs" aria-label="Bahagian Mod Guru">
      <button className={tab==='questions'?'active':''} onClick={()=>{setTab('questions');setEditingQuestion(null);}}><BookOpen size={17}/> Bank Soalan</button>
      <button className={tab==='design'?'active':''} onClick={()=>setTab('design')}><Settings2 size={17}/> Reka Bentuk Laman</button>
      <button className={tab==='settings'?'active':''} onClick={()=>setTab('settings')}><Settings2 size={17}/> Avatar</button>
      <button className={tab==='backups'?'active':''} onClick={()=>setTab('backups')}><Download size={17}/> Data & Sandaran</button>
      <button className={tab==='publish'?'active':''} onClick={()=>setTab('publish')}><CloudUpload size={17}/> Terbitkan</button>
    </nav>
    <div className="teacher-body">
      {status&&<div role="status" className="alert feedback"><CheckCircle2 size={17}/><span>{status}</span><button onClick={()=>setStatus('')} aria-label="Tutup mesej"><X size={16}/></button></div>}
      {tab==='questions'&&(editingQuestion ? <div className="editor-content"><button className="text-back" onClick={()=>setEditingQuestion(null)}><ArrowLeft size={16}/> Kembali ke bank soalan</button><h3>{data.questions.some(v=>v.id===editingQuestion.id)?'Edit Soalan':'Tambah Soalan Baharu'}</h3>
        <div className="edit-grid"><label>Kategori Zaman<select value={editingQuestion.era} onChange={e=>setEditingQuestion({...editingQuestion,era:e.target.value as Era})}>{ERAS.map(v=><option key={v}>{v}</option>)}</select></label><label>Soalan Utama<input value={editingQuestion.question} onChange={e=>setEditingQuestion({...editingQuestion,question:e.target.value})} placeholder="Contoh: Di manakah manusia Paleolitik tinggal?"/></label>
        <label>Soalan Alternatif (satu setiap baris)<textarea rows={4} value={altText} onChange={e=>setAltText(e.target.value)} placeholder="Manusia Paleolitik tinggal di mana?"/></label>
        <label>Kata Kunci (pisahkan dengan koma)<textarea rows={4} value={keywordText} onChange={e=>setKeywordText(e.target.value)} placeholder="Paleolitik, gua, tempat tinggal"/></label>
        <label>Jawapan Bahasa Melayu<textarea rows={4} value={editingQuestion.answerMS} onChange={e=>setEditingQuestion({...editingQuestion,answerMS:e.target.value})} placeholder="Jawapan yang akan disebut oleh Aki..."/></label>
        <label>Jawapan Bahasa Cina (pilihan)<textarea rows={4} value={editingQuestion.answerZH||''} onChange={e=>setEditingQuestion({...editingQuestion,answerZH:e.target.value})}/></label></div>
        <AnswerAudioEditor key={editingQuestion.id} audio={editingQuestion.audioMS} onChange={audioMS=>setEditingQuestion(current=>current?{...current,audioMS}:current)}/>
        <label className="checkline"><input type="checkbox" checked={editingQuestion.enabled} onChange={e=>setEditingQuestion({...editingQuestion,enabled:e.target.checked})}/> Soalan aktif dan boleh dijawab</label>
        <div className="form-actions"><button className="btn btn-primary" onClick={saveQuestion}><Save size={17}/> Simpan Perubahan</button><button className="btn btn-soft" onClick={()=>setEditingQuestion(null)}>Batal</button></div>
      </div> : <><div className="section-heading"><div><h3>Bank Soalan Prasejarah</h3><p>{data.questions.length} soalan boleh diubah suai • {data.questions.filter(v=>v.enabled).length} aktif</p></div><button className="btn btn-primary" onClick={()=>startEditingQuestion(newQuestion())}><Plus size={17}/> Tambah Soalan</button></div>
        <div className="search-toolbar"><label className="search-input"><Search size={18}/><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Cari soalan, jawapan atau kata kunci..."/></label><label className="filter-select"><SlidersHorizontal size={16}/><select value={filter} onChange={e=>setFilter(e.target.value as Era|'Semua')}><option>Semua</option>{ERAS.map(v=><option key={v}>{v}</option>)}</select></label></div>
        <div className="question-list">{visibleQuestions.map(item=><article className="question-row" key={item.id}><div className="question-row-main"><div className="row-meta"><span className="era-label">{item.era}</span><span className={item.enabled?'active-small':'inactive-small'}>{item.enabled?'Aktif':'Tidak Aktif'}</span></div><h4>{item.question}</h4><p>{item.answerMS}</p>{item.audioMS&&<span className="voice-recording-label">🎙️ Rakaman suara manusia tersedia</span>}</div><div className="row-actions"><button title="Uji soalan" onClick={()=>{setTestQuestion(item.question);setTestResult(matchQuestion(item.question,data.questions));document.getElementById('teacher-test')?.scrollIntoView({behavior:'smooth',block:'center'});}}><Play size={17}/></button><button title="Salin soalan" onClick={()=>{const cloned={...item,id:crypto.randomUUID(),question:item.question+' (salinan)'};startEditingQuestion(cloned);}}><Plus size={17}/></button><button title="Edit soalan" onClick={()=>startEditingQuestion(item)}><Pencil size={17}/></button><button title="Padam soalan" onClick={()=>{if(window.confirm(`Padam soalan “${item.question}”?`)){onChange({...data,questions:data.questions.filter(v=>v.id!==item.id)});setStatus('Soalan dipadam.');}}}><Trash2 size={17}/></button></div></article>)}{visibleQuestions.length===0&&<p className="empty-state">Tiada soalan ditemui.</p>}</div>
        <section id="teacher-test" className="test-card"><div><h3><Mic2 size={20}/> Makmal Uji Soalan</h3><p>Masukkan soalan seperti seorang murid. Semak padanan sebelum digunakan.</p></div><form onSubmit={e=>{e.preventDefault();setTestResult(matchQuestion(testQuestion,data.questions));}} className="test-form"><input value={testQuestion} onChange={e=>setTestQuestion(e.target.value)} placeholder="Taip soalan untuk diuji..."/><button className="btn btn-primary" type="submit"><Play size={16}/> Uji</button></form>
          {testResult&&<div className="test-result"><p><strong>Padanan:</strong> {testResult.item?.question|| (testResult.ambiguous.length?'Beberapa soalan hampir sama':'Tiada padanan yang yakin')}</p><p><strong>Keyakinan:</strong> {Math.round(testResult.confidence*100)}% (anggaran skor padanan, bukan kebarangkalian)</p>{testResult.item&&<><p><strong>Jawapan:</strong> {testResult.item.answerMS}</p><div className="form-actions"><button className="btn btn-soft" onClick={()=>onSay(testResult.item!.answerMS,testResult.item!.audioMS)}><Volume2 size={16}/> Uji Suara</button><button className="btn btn-soft" onClick={onAnimate}><Play size={16}/> Uji Animasi</button></div></>}{testResult.ambiguous.length>0&&<p>Sila gunakan soalan yang lebih khusus: {testResult.ambiguous.map(v=>v.question).join(' / ')}</p>}</div>}
        </section>
      </>)}
      {tab==='design'&&<SiteDesigner value={data.site} onChange={site=>onChange({...data,site,settings:{...data.settings,backgroundImage:site.backgroundImage}})} onPreview={onPreview}/>}
      {tab==='settings'&&<><div className="section-heading"><div><h3>Personaliti & Rupa Aki</h3><p>Laraskan rupa dan suara Aki. Rakaman guru dimainkan terlebih dahulu.</p></div></div><div className="edit-grid"><label>Nama Avatar<input value={settings.name} onChange={e=>updateSettings({name:e.target.value})}/></label><label>Pilihan Suara Aki<select value={settings.preferredVoice} onChange={e=>updateSettings({preferredVoice:e.target.value})}><option value="">Suara Automatik</option>{voiceNames.map(v=><option key={v.value} value={v.value}>{v.label}</option>)}</select></label><p className="voice-setting-note">Pilih dan uji suara yang tersedia pada peranti. Guru juga boleh menggunakan rakaman suara sendiri.</p><label>Ucapan Selamat Datang<textarea rows={3} value={settings.greeting} onChange={e=>updateSettings({greeting:e.target.value})}/></label><label>Jawapan Jika Tidak Tahu<textarea rows={3} value={settings.unknownAnswer} onChange={e=>updateSettings({unknownAnswer:e.target.value})}/></label>
        <label>Kelajuan Suara: {settings.speechRate.toFixed(2)}×<input type="range" min="0.6" max="1.5" step="0.05" value={settings.speechRate} onChange={e=>updateSettings({speechRate:Number(e.target.value)})}/></label><label>Saiz Avatar: {settings.size} px<input type="range" min="270" max="580" value={settings.size} onChange={e=>updateSettings({size:Number(e.target.value)})}/></label>
        <label>Kedudukan Melintang: {settings.horizontalOffset} px<input type="range" min="-160" max="160" value={settings.horizontalOffset} onChange={e=>updateSettings({horizontalOffset:Number(e.target.value)})}/></label><label>Warna Kulit<input type="color" value={settings.skinColor} onChange={e=>updateSettings({skinColor:e.target.value})}/></label><label>Warna Rambut<input type="color" value={settings.hairColor} onChange={e=>updateSettings({hairColor:e.target.value})}/></label><label>Warna Pakaian<input type="color" value={settings.clothingColor} onChange={e=>updateSettings({clothingColor:e.target.value})}/></label></div>
        <h4 className="teacher-subtitle">Kata-kata Reaksi</h4><div className="edit-grid">{(Object.keys(settings.reactions) as (keyof AvatarSettings['reactions'])[]).map(key=><label key={key}>Reaksi {key}<input value={settings.reactions[key]} onChange={e=>updateReaction(key,e.target.value)}/></label>)}</div>
        <h4 className="teacher-subtitle">Gambar & Lapisan Animasi</h4><p className="muted-copy">Imej penuh avatar bergerak sebagai satu gambar tanpa animasi mulut berasingan. Untuk animasi kepala, mulut dan tangan, muat naik setiap bahagian secara berlapis. Gambar hiasan dan latar halaman boleh disunting pada Reka Bentuk Laman.</p>
        <div className="upload-grid"><UploadImage label="Gambar latar halaman" image={data.site.backgroundImage} onLoaded={image=>onChange({...data,settings:{...settings,backgroundImage:image},site:{...data.site,backgroundImage:image,backgroundOverlay:15}})}/><UploadImage label="Imej penuh avatar (statik)" image={settings.fullArtwork} onLoaded={image=>updateSettings({fullArtwork:image,layers:{}})}/>{(['head','torso','leftArm','rightArm','legs','mouth'] as ArtPart[]).map(v=><UploadImage key={v} label={`Lapisan ${v}`} image={settings.layers[v]||''} onLoaded={image=>updateSettings({layers:{...settings.layers,[v]:image},fullArtwork:''})}/>)}</div><div className="form-actions"><button className="btn btn-soft" onClick={()=>onChange({...data,settings:{...settings,backgroundImage:'',fullArtwork:'',layers:{}},site:{...data.site,backgroundImage:''}})}><RotateCcw size={16}/> Padam Semua Imej Muat Naik</button><button className="btn btn-soft" onClick={()=>onSay(settings.greeting)}><Volume2 size={16}/> Uji Ucapan</button></div>
      </>}
      {tab==='backups'&&<><div className="section-heading"><div><h3>Data & Sandaran</h3><p>Jaga kandungan pembelajaran anda dengan salinan fail JSON.</p></div></div><div className="backup-grid"><div className="backup-card"><Download size={28}/><h4>Eksport JSON</h4><p>Muat turun semua soalan, rakaman dan tetapan ke komputer anda.</p><button className="btn btn-primary" onClick={()=>downloadJson(data)}><Download size={17}/> Eksport JSON</button></div><div className="backup-card"><FileUp size={28}/><h4>Import / Pulihkan JSON</h4><p>Pilih sandaran lama untuk menggantikan draf sedia ada.</p><button className="btn btn-soft" onClick={()=>fileInput.current?.click()}><FileUp size={17}/> Import JSON</button><input hidden type="file" ref={fileInput} accept="application/json,.json" onChange={async e=>{const f=e.target.files?.[0];e.target.value='';if(f)await importJson(f);}}/></div></div><div className="info-note"><ShieldCheck size={18}/><p><strong>Perhatian:</strong> perubahan setempat disimpan dalam pelayar/peranti ini sahaja. Eksport JSON untuk sandaran. Pada peranti lain, import fail yang sama atau gunakan Supabase dan terbitkan.</p></div></>}
      {tab==='publish'&&<><div className="section-heading"><div><h3>Terbitkan Ilmu Aki</h3><p>Tentukan apa yang dilihat oleh murid pada peranti lain.</p></div></div>
        <div className="publish-card"><div className="publish-art"><CloudUpload size={46}/></div><h4>{cloudAvailable?'Mod Penerbitan Dalam Talian Tersedia':'Mod Setempat Sedang Digunakan'}</h4><p>{cloudAvailable?'Terbitkan semua soalan dan tetapan semasa ke Supabase. Perubahan akan kelihatan pada peranti lain yang memuatkan laman ini.':'Suntingan anda kini hanya disimpan di peranti ini. Untuk terbitan merentas peranti, sediakan projek Supabase mengikut README, kemudian masukkan pembolehubah persekitaran.'}</p>
          <div className="form-actions"><button className="btn btn-primary" onClick={()=>{try{downloadJson(data);setStatus('Salinan draf telah dimuat turun.');}catch{setStatus('Gagal mengeksport JSON.');}}}><Save size={17}/> Simpan Draf / Eksport</button>
          <button className="btn btn-secondary" disabled={!cloudAvailable||!onlineAuth||busy} onClick={async()=>{setBusy(true);try{await publishData(data);setStatus('Berjaya diterbitkan! Buka semula laman pada peranti murid untuk menyemak kandungan.');}catch(e){setStatus(e instanceof Error?e.message:'Penerbitan gagal.');}finally{setBusy(false);}}}><CloudUpload size={17}/> {busy?'Menerbitkan...':'Terbitkan'}</button></div>
          {cloudAvailable&&!onlineAuth&&<p className="hint">Untuk menerbitkan, log keluar dan log masuk menggunakan akaun Guru Dalam Talian.</p>}
        </div></>}
    </div>
    <footer className="teacher-footer"><span><Check size={15}/> Perubahan disimpan secara automatik pada peranti</span><button className="btn btn-soft" onClick={onClose}>Selesai & Kembali <ArrowLeft size={16}/></button></footer>
  </section></div>;
}
