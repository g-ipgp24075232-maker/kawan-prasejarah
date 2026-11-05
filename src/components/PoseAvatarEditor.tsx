import { useRef,useState } from 'react';
import { FileUp,Image,RotateCcw,Upload } from 'lucide-react';
import type { AvatarSettings,AvatarPose } from '../types';
import { prepareAvatarPose } from '../lib/imageTools';
import { parseAvatarPosePack } from '../lib/avatarPack';

interface Props{settings:AvatarSettings;onChange:(update:Partial<AvatarSettings>)=>void;onPreview:()=>void;}
const items:{key:AvatarPose;label:string;description:string}[]=[
  {key:'idle',label:'Aki Biasa',description:'Pose biasa: mata terbuka, mulut tertutup'},
  {key:'talk',label:'Aki Bercakap',description:'Hanya kawasan mulut digunakan untuk animasi suara'},
  {key:'wave',label:'Aki Melambai',description:'Gambar Aki mengangkat tangan'}
];
export default function PoseAvatarEditor({settings,onChange,onPreview}:Props){
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const packFile=useRef<HTMLInputElement>(null);
  const update=(key:AvatarPose,image:string)=>{
    onChange({poses:{...settings.poses,[key]:image},fullArtwork:''});
    setMessage(image?'Gambar '+key+' dimuat naik. Pratonton Aki telah dikemas kini.':'Gambar '+key+' telah dipadam.');
  };
  async function uploadPose(key:AvatarPose,file:File){
    setBusy(true);setMessage('');
    try{
      const prepared=await prepareAvatarPose(file);
      update(key,prepared.data);
      setMessage(prepared.message+' Aki kini menggunakan gambar ini untuk aksi '+key+'.');
    }catch(error){setMessage(error instanceof Error?error.message:'Muat naik gagal.');}
    finally{setBusy(false);}
  }
  async function importPack(file:File){
    setBusy(true);setMessage('');
    try{
      const pack=parseAvatarPosePack(await file.text());
      onChange({poses:pack.poses,fullArtwork:''});
      setMessage('Pek tiga gambar Aki berjaya dimuat naik! Semua gambar dipasang dan gambar avatar lama dinyahaktifkan.');
    }catch(error){setMessage(error instanceof Error?error.message:'Pek avatar tidak sah.');}
    finally{setBusy(false);}
  }
  return <section className="pose-editor">
    <h4 className="teacher-subtitle">Studio Animasi Aki – Gambar Sendiri</h4>
    <p className="muted-copy">Muat naik tiga gambar Aki yang sepadan. Aki tidak berkelip mata. Semasa bercakap, gambar biasa kekal dan hanya mulut terbuka sedikit serta bergerak dengan lembut. Gambar melambai digunakan apabila Aki melambai.</p>
    <div className="pose-import">
      <div><strong>Import Pek Aki (3 Gambar Sekali Gus)</strong><p>Jika cikgu mempunyai fail <code>aki-avatar-pack.json</code>, import untuk memasang ketiga-tiga gambar terus.</p></div>
      <button type="button" className="btn btn-primary" disabled={busy} onClick={()=>packFile.current?.click()}><FileUp size={17}/> Import Pek Aki</button>
      <input hidden ref={packFile} type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(file)await importPack(file);}}/>
    </div>
    <div className="pose-upload-grid">{items.map(item=><div className="pose-upload-card" key={item.key}>
      <strong>{item.label}</strong>
      <p>{item.description}</p>
      {settings.poses[item.key]
        ?<img className="pose-upload-preview" src={settings.poses[item.key]} alt={'Pratonton '+item.label}/>
        :<div className="pose-upload-placeholder"><Image size={28}/> Tiada gambar</div>}
      <label className="btn btn-soft pose-upload-action"><Upload size={15}/> Pilih Gambar
        <input type="file" accept=".png,.jpeg,.jpg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif" disabled={busy}
          onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(file)await uploadPose(item.key,file);}}/>
      </label>
      {settings.poses[item.key]&&<button type="button" className="btn btn-soft" onClick={()=>update(item.key,'')}><RotateCcw size={15}/> Padam</button>}
    </div>)}</div>
    <div className="pose-blink-controls">
      <strong>Lokasi Mulut – Pergerakan Semasa Bercakap</strong>
      <p className="muted-copy">Aki akan mengekalkan wajah asal dan hanya menggerakkan bahagian mulut sedikit semasa audio dimainkan. Laraskan kedudukan dan saiz kawasan mulut jika tidak tepat.</p>
      <div className="pose-blink-grid">
      {([
        ['x','Kedudukan mulut (X)',15,85],['y','Kedudukan mulut (Y)',10,85],
        ['width','Lebar kawasan mulut',4,28],['height','Tinggi kawasan mulut',2,18]
      ] as const).map(([key,label,min,max])=><label key={key}>{label}: {settings.mouth[key]}%
        <input type="range" min={min} max={max} step=".2" value={settings.mouth[key]}
          onChange={e=>onChange({mouth:{...settings.mouth,[key]:Number(e.target.value)}})}/></label>)}
      </div>
    </div>
    {message&&<p className="pose-editor-message" role="status">{message}</p>}
    <div className="form-actions">
      <button className="btn btn-primary" type="button" onClick={onPreview}>Pratonton Aki di Laman Utama</button>
      {settings.poses.idle&&<button className="btn btn-soft" type="button" onClick={()=>{
        if(window.confirm('Kembali kepada avatar asal? Gambar tiga pose akan dikosongkan, tetapi bank soalan dan rakaman kekal.'))
          onChange({poses:{},blink:settings.blink});
      }}>Guna Avatar Asal</button>}
    </div>
  </section>;
}
