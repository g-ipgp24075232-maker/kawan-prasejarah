/** Browser SpeechSynthesisVoice does not expose gender; classify only recognisable labels. */
export interface NamedVoice {name:string;lang:string;voiceURI:string;}
const female=/(?:^|[^a-z])(female|woman|perempuan|yasmin|siti|nurul|nora|amira|farah|sofia|aira|ayu|zara|zira|samantha|victoria|karen|jenny|hazel|moira|susan|linda|aria|sara|emma|alia|alina|natalie|nicole|joanna|elsa|anna|lily|siri|nisa|intan|hanis|salmah)(?:$|[^a-z])/i;
const male=/(?:^|[^a-z])(male|man|lelaki|osman|adam|david|daniel|mark|guy|arif|rizwan|faris|haziq|idris|rafiq|omar|faiz|john|george|thomas|alex|fred|matthew|aaron|ravi|raju)(?:$|[^a-z])/i;

export function voiceGender(name:string):'female'|'male'|'unknown' {
  if(male.test(name))return 'male';
  if(female.test(name))return 'female';
  return 'unknown';
}
export function isMalaysianVoice(lang:string):boolean{return /^ms[-_]MY$/i.test(lang);}
export function orderedFemaleVoices<T extends NamedVoice>(voices:T[],selection:string):T[] {
  const selected=voices.find(v=>v.voiceURI===selection&&voiceGender(v.name)!=='male');
  const available=voices.filter(v=>voiceGender(v.name)==='female');
  const rank=(v:T)=>{
    if(isMalaysianVoice(v.lang))return 0;
    if(/^ms(?:[-_]|$)/i.test(v.lang))return 1;
    if(/^id(?:[-_]|$)/i.test(v.lang))return 2;
    return 3;
  };
  available.sort((a,b)=>rank(a)-rank(b));
  // A teacher can explicitly audition and select an unlabelled voice. Never
  // auto-select an unlabelled or explicitly male voice.
  return [...(selected?[selected]:[]),...available.filter(v=>v.voiceURI!==selected?.voiceURI)];
}
export function voiceAvailabilityMessage(voice:NamedVoice):string {
  if(isMalaysianVoice(voice.lang))return '';
  return 'Suara wanita pada peranti ini menggunakan bahasa '+voice.lang+'. Teks masih dalam Bahasa Melayu Malaysia, tetapi sebutan mungkin tidak tepat. Gunakan rakaman guru untuk pertuturan Malaysia yang asli.';
}

/** Indonesian voice first; prefer female labels but do not silence unlabelled voices. */
export function orderedIndonesianVoices<T extends NamedVoice>(voices:T[],selection:string):T[]{
  const isID=(v:T)=>/^id(?:[-_]|$)/i.test(v.lang);
  const group=(v:T)=>isID(v)?0:/^ms(?:[-_]|$)/i.test(v.lang)?1:2;
  const gender=(v:T)=>voiceGender(v.name)==='female'?0:voiceGender(v.name)==='unknown'?1:2;
  const selected=voices.find(v=>isID(v)&&v.voiceURI===selection);
  return voices.slice().sort((a,b)=>{
    if(selected){if(a.voiceURI===selected.voiceURI)return -1;if(b.voiceURI===selected.voiceURI)return 1;}
    return group(a)-group(b)||gender(a)-gender(b);
  });
}
