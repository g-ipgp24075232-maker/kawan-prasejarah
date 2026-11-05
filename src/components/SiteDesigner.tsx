import { useState } from 'react';
import { Eye, ImagePlus, RotateCcw, Trash2, Upload } from 'lucide-react';
import { DEFAULT_SITE } from '../data/site';
import type { SiteArt, SiteDesign } from '../types';

interface Props {value:SiteDesign;onChange:(design:SiteDesign)=>void;onPreview:()=>void;}
type Section='words'|'background'|'artwork'|'layout';
const sections:{id:Section;label:string}[]=[
  {id:'words',label:'Teks & Butang'}, {id:'background',label:'Warna & Latar'},
  {id:'artwork',label:'Gambar & Hiasan'}, {id:'layout',label:'Susun Atur'}];
const texts: {key:keyof SiteDesign;name:string;wide?:boolean}[]=[
  {key:'brandBefore',name:'Nama jenama (pertama)'},{key:'brandAccent',name:'Nama jenama (kedua)'},
  {key:'brandSubtitle',name:'Slogan di bahagian atas',wide:true},
  {key:'heroEyebrow',name:'Teks kecil di atas avatar'},
  {key:'heroBefore',name:'Ayat pengenalan sebelum nama'},
  {key:'heroAfter',name:'Ayat selepas nama'},
  {key:'heroDescription',name:'Penerangan di bawah tajuk',wide:true},
  {key:'bubbleCaption',name:'Label gelembung suara, gunakan {name}'},
  {key:'touchHint',name:'Arahan menyentuh avatar',wide:true},
  {key:'chatTitle',name:'Tajuk ruang sembang, gunakan {name}'},
  {key:'chatDescription',name:'Arahan ruang sembang',wide:true},
  {key:'questionCaption',name:'Label soalan murid'},
  {key:'placeholder',name:'Contoh dalam kotak soalan',wide:true},
  {key:'sendLabel',name:'Butang menghantar soalan'},
  {key:'voiceTestLabel',name:'Butang uji suara'},
  {key:'repeatLabel',name:'Butang ulang jawapan'},
  {key:'stopLabel',name:'Butang berhenti bercakap'},
  {key:'muteLabel',name:'Butang senyapkan'},
  {key:'unmuteLabel',name:'Butang aktifkan audio'},
  {key:'teacherLabel',name:'Butang Mod Guru'},
  {key:'footerLabel',name:'Teks bahagian bawah',wide:true},
  {key:'cameraTitle',name:'Tajuk interaksi kamera'},
  {key:'cameraDescription',name:'Arahan kamera',wide:true},
  {key:'cameraStart',name:'Butang buka kamera'},
  {key:'cameraStop',name:'Butang tutup kamera'},
  {key:'cameraReady',name:'Arahan selepas kamera dibuka',wide:true},
  {key:'cameraDetected',name:'Label tangan dikesan'},
  {key:'cameraMissing',name:'Label tunjukkan tangan'},
  {key:'cameraPrivacy',name:'Keterangan privasi kamera',wide:true},
  {key:'cameraWaveVoice',name:'Dialog selepas murid melambai',wide:true}
];
const colors:{key:keyof SiteDesign;label:string}[]=[
  {key:'backgroundColor',label:'Warna halaman'},
  {key:'headerColor',label:'Warna kepala halaman'},
  {key:'chatColor',label:'Warna kotak sembang'},
  {key:'bubbleColor',label:'Warna gelembung dialog'},
  {key:'accentColor',label:'Warna hiasan'},
  {key:'textColor',label:'Warna teks'},
  {key:'buttonColor',label:'Warna butang'}
];
const artwork:{key:'backgroundImage'|'brandLogoImage'|'bubbleArtImage';label:string}[]=[
  {key:'backgroundImage',label:'Latar belakang seluruh laman'},
  {key:'brandLogoImage',label:'Logo utama di bahagian atas'},
  {key:'bubbleArtImage',label:'Gambar gelembung dialog'}
];
const decor:{key:'artLeft'|'artRight'|'artChat';label:string}[]=[
  {key:'artLeft',label:'Hiasan kiri avatar'},
  {key:'artRight',label:'Hiasan kanan avatar'},
  {key:'artChat',label:'Hiasan ruang sembang'}
];

function ImagePicker({label,image,onChange}: {label:string;image:string;onChange:(value:string)=>void}){
  const [error,setError]=useState('');
  return <div className="designer-image-card">
    <strong>{label}</strong>
    {image?<img className="designer-image-preview" src={image} alt={'Pratonton '+label}/>:<div className="designer-image-empty"><ImagePlus size={28}/><span>Belum ada imej</span></div>}
    <div className="designer-image-actions">
      <label className="btn btn-soft designer-upload"><Upload size={16}/> Muat Naik Gambar
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
          onChange={event=>{
            const file=event.target.files?.[0];event.target.value='';
            if(!file)return;
            if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)){
              setError('Gunakan fail PNG, JPG, WEBP atau GIF.');return;
            }
            if(file.size>850_000){setError('Fail terlalu besar. Had 850 KB bagi setiap gambar.');return;}
            const reader=new FileReader();
            reader.onload=()=>{
              const imageData=reader.result;
              if(typeof imageData==='string'&&/^data:image\/(png|jpeg|webp|gif);base64,/i.test(imageData)){
                onChange(imageData);setError('');
              } else setError('Gagal membaca gambar.');
            };
            reader.onerror=()=>setError('Gagal membaca gambar.');
            reader.readAsDataURL(file);
          }}/></label>
      {image&&<button className="btn btn-soft" type="button" onClick={()=>onChange('')}><Trash2 size={15}/> Padam</button>}
    </div>
    {error&&<small className="designer-error">{error}</small>}
  </div>;
}
function Slider({label,value,min,max,step=1,unit='',onChange}:{label:string;value:number;min:number;max:number;step?:number;unit?:string;onChange:(v:number)=>void}){
  return <label className="designer-slider"><span><strong>{label}</strong><b>{value}{unit}</b></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
export default function SiteDesigner({value,onChange,onPreview}:Props){
  const [section,setSection]=useState<Section>('words');
  const [showMore,setShowMore]=useState(false);
  const set=<K extends keyof SiteDesign>(key:K,next:SiteDesign[K])=>onChange({...value,[key]:next});
  const changeArt=(key:'artLeft'|'artRight'|'artChat',update:Partial<SiteArt>)=>
    set(key,{...value[key],...update});
  const restore=()=>{if(window.confirm('Tetapkan semula reka bentuk laman? Bank soalan, rakaman dan tetapan Aki tidak akan dipadam.'))onChange(structuredClone(DEFAULT_SITE));};
  return <div className="site-designer">
    <div className="section-heading"><div><h3>Studio Reka Bentuk Laman</h3>
      <p>Ubah tulisan, warna, latar, grafik dan susun atur. Semua perubahan terus kelihatan pada laman utama.</p></div></div>
    <div className="designer-header-actions">
      <button type="button" className="btn btn-primary" onClick={onPreview}><Eye size={17}/> Lihat Laman Sebenar</button>
      <button type="button" className="btn btn-soft" onClick={restore}><RotateCcw size={17}/> Pulihkan Reka Bentuk Asal</button>
    </div>
    <div className="designer-nav">{sections.map(x=><button key={x.id} type="button"
      className={section===x.id?'active':''} onClick={()=>setSection(x.id)}>{x.label}</button>)}</div>

    {section==='words'&&<><p className="muted-copy">Semua teks utama laman boleh disunting. Gunakan <code>{'{name}'}</code> untuk menggantikan nama Aki secara automatik.</p>
      <div className="designer-form-grid">{texts.map(item=><label key={item.key} className={item.wide?'designer-wide':''}>
        <span>{item.name}</span><input maxLength={280} value={String(value[item.key])}
          onChange={e=>set(item.key as 'brandBefore',e.target.value)}/></label>)}</div>
    </>}

    {section==='background'&&<><h4>Warna Laman</h4>
      <div className="designer-color-grid">{colors.map(item=><label key={item.key} className="designer-color">
        <span>{item.label}</span><input type="color" value={String(value[item.key])}
          onChange={e=>set(item.key as 'backgroundColor',e.target.value)}/></label>)}</div>
      <h4>Gambar Latar</h4><ImagePicker label="Latar belakang halaman"
        image={value.backgroundImage} onChange={image=>set('backgroundImage',image)}/>
      <div className="designer-form-grid"><label>Posisi gambar latar
        <select value={value.backgroundPosition} onChange={e=>set('backgroundPosition',e.target.value)}>
          <option value="center">Tengah</option><option value="top">Atas</option><option value="bottom">Bawah</option>
          <option value="left">Kiri</option><option value="right">Kanan</option></select></label></div>
      <Slider label="Lapisan cerah pada gambar latar" value={value.backgroundOverlay} min={0} max={100} unit="%"
        onChange={v=>set('backgroundOverlay',v)}/>
    </>}

    {section==='artwork'&&<><p className="muted-copy">Muat naik gambar PNG lutsinar untuk hiasan di sekeliling Aki, atau GIF untuk hiasan bergerak. Gambar penuh avatar dan lapisan badannya pula boleh disunting pada tab Avatar.</p>
      <div className="designer-art-grid">{artwork.slice(1).map(item=><ImagePicker key={item.key} label={item.label}
        image={value[item.key]} onChange={image=>set(item.key,image)}/>)}</div>
      <h4>Gambar Hiasan yang Boleh Dialih</h4>
      {decor.map(item=><div className="designer-decoration" key={item.key}>
        <ImagePicker label={item.label} image={value[item.key].image}
          onChange={image=>changeArt(item.key,{image})}/>
        <div className="designer-position-grid">
          <Slider label="Kedudukan kiri / kanan" value={value[item.key].left} min={0} max={100} unit="%"
            onChange={v=>changeArt(item.key,{left:v})}/>
          <Slider label="Kedudukan atas / bawah" value={value[item.key].top} min={0} max={100} unit="%"
            onChange={v=>changeArt(item.key,{top:v})}/>
          <Slider label="Saiz" value={value[item.key].width} min={50} max={600} unit="px"
            onChange={v=>changeArt(item.key,{width:v})}/>
          <Slider label="Kelegapan" value={value[item.key].opacity} min={0} max={100} unit="%"
            onChange={v=>changeArt(item.key,{opacity:v})}/>
        </div>
      </div>)}
    </>}

    {section==='layout'&&<><h4>Tipografi & Saiz</h4>
      <div className="designer-form-grid"><label>Jenis tulisan
        <select value={value.fontFamily} onChange={e=>set('fontFamily',e.target.value)}>
          <option>Nunito</option><option>Baloo 2</option><option>Arial</option><option>Trebuchet MS</option>
        </select></label></div>
      <Slider label="Saiz semua tulisan" value={value.fontScale} min={80} max={140} unit="%" onChange={v=>set('fontScale',v)}/>
      <Slider label="Lebar kandungan" value={value.maxWidth} min={640} max={1200} unit="px" onChange={v=>set('maxWidth',v)}/>
      <Slider label="Sudut kotak sembang" value={value.cornerRadius} min={4} max={42} unit="px" onChange={v=>set('cornerRadius',v)}/>
      <Slider label="Ruang di atas Aki" value={value.heroSpacing} min={0} max={100} unit="px" onChange={v=>set('heroSpacing',v)}/>
      <h4>Paparan & Kedudukan</h4>
      {([
        ['chatFirst','Letakkan ruang sembang di atas Aki'],
        ['showCamera','Paparkan interaksi kamera dan lambaian'],
        ['showTouchHint','Paparkan arahan sentuh Aki'],
        ['showVoiceControls','Paparkan butang uji, ulang dan kawalan suara']
      ] as [keyof SiteDesign,string][]).map(([key,label])=><label className="designer-toggle" key={key}>
        <input type="checkbox" checked={Boolean(value[key])} onChange={e=>set(key as 'showCamera',e.target.checked)}/>
        <span>{label}</span></label>)}
    </>}
    {showMore&&<p className="muted-copy">Semua perubahan reka bentuk disimpan bersama data laman dalam pelayar. Jika mahu murid melihat perubahan pada peranti lain, eksport JSON atau aktifkan penerbitan Supabase. Gambar besar boleh memenuhi storan pelayar; gunakan fail termampat.</p>}
    <div className="designer-bottom"><button className="btn btn-soft" type="button" onClick={()=>setShowMore(v=>!v)}>{showMore?'Tutup Maklumat':'Maklumat Penyimpanan'}</button>
      <button className="btn btn-primary" type="button" onClick={onPreview}><Eye size={17}/> Pratonton Laman</button></div>
  </div>;
}
