import type { SiteArt, SiteDesign } from '../types';

export const EMPTY_ART: SiteArt={image:'',left:14,top:52,width:165,opacity:85};
export const DEFAULT_SITE: SiteDesign={
  brandBefore:'KAWAN',brandAccent:'PRASEJARAH',brandSubtitle:'MARI BERBUAL DENGAN AKI!',
  heroEyebrow:'SAHABAT SEJARAH TAHUN 4',heroBefore:'Salam sejahtera, saya',
  heroAfter:'!',heroDescription:'Kemukakan soalan tentang Zaman Prasejarah. Saya sedia membantu.',
  bubbleCaption:'{name} BERKATA',touchHint:'Sentuh Aki untuk melihat tindak balasnya.',
  chatTitle:'Mari Tanya {name}!',chatDescription:'Gunakan mikrofon atau taip soalan kamu.',
  questionCaption:'KAMU TANYA',placeholder:'Contoh: Di manakah manusia Paleolitik tinggal?',
  sendLabel:'Hantar Soalan',voiceTestLabel:'Uji Suara Aki',repeatLabel:'Ulang Jawapan',
  stopLabel:'Henti Bercakap',muteLabel:'Senyapkan',unmuteLabel:'Buka Audio',
  footerLabel:'KAWAN PRASEJARAH · Sejarah Tahun 4',teacherLabel:'Mod Guru',
  cameraTitle:'Lambai kepada Aki!',cameraDescription:'Buka kamera, lambai tangan, Aki akan lambai balik.',
  cameraStart:'Buka Kamera',cameraStop:'Tutup Kamera',
  cameraPrivacy:'Kamera diaktifkan selepas mendapat izin. Video diproses pada peranti dan tidak dihantar ke pelayan.',
  cameraReady:'Kamera aktif. Angkat tapak tangan dan lambai ke kiri dan kanan!',
  cameraDetected:'Tangan dikesan',cameraMissing:'Tunjukkan tapak tangan',
  cameraWaveVoice:'Salam sejahtera! Saya melihat kamu sedang melambai. Saya melambai kembali!',
  backgroundImage:'',brandLogoImage:'',bubbleArtImage:'',
  artLeft:{...EMPTY_ART},artRight:{...EMPTY_ART,left:86,top:49,width:160},
  artChat:{...EMPTY_ART,left:93,top:25,width:116,opacity:35},
  backgroundColor:'#f5f9ee',headerColor:'#f5f9ee',chatColor:'#ffffff',
  bubbleColor:'#ffffff',accentColor:'#d18444',textColor:'#354b35',buttonColor:'#346c48',
  backgroundOverlay:15,backgroundPosition:'center',
  fontFamily:'Nunito',fontScale:100,maxWidth:880,cornerRadius:24,heroSpacing:13,
  showCamera:true,showTouchHint:true,showVoiceControls:true,chatFirst:false
};
