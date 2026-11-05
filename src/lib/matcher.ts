import type { KnowledgeItem, Era } from '../types';
import { ERAS } from '../types';

const stopwords = new Set(['apa','apakah','yang','di','ke','dari','daripada','pada','adakah','atau','dan','dengan','ialah','adalah','saya','kamu','mereka','orang','manusia','zaman','itu','ini','satu','semasa','dalam','oleh','untuk','boleh','telah','bagaimana','bagaimanakah','mengapa','kenapa','siapa','namakan','sebutkan','lagi']);
const equivalent: Record<string,string> = {
  'dimanakah':'tempat','dimana':'tempat','mana':'tempat','lokasi':'tempat','berada':'tempat',
  'berlindung':'tinggal','kediaman':'tinggal','rumah':'tinggal','menetap':'tinggal',
  'makan':'makanan','dimakan':'makanan','memakan':'makanan','santapan':'makanan',
  'kerja':'kegiatan','pekerjaan':'kegiatan','aktiviti':'kegiatan',
  'alatan':'peralatan','alat':'peralatan','digunakan':'guna','menggunakan':'guna',
  'nomad':'berpindah','berpindah-randah':'berpindah','berpindah':'berpindah',
  'bertani':'pertanian','bercucuk':'pertanian','tanam':'pertanian','berladang':'pertanian',
  'menternak':'penternakan','ternakan':'penternakan',
  'berjual':'perdagangan','berdagang':'perdagangan',
  'paleolitik':'paleolitik','mesolitik':'mesolitik','neolitik':'neolitik','logam':'logam',
};
export function normalize(sentence: string): string {
  return sentence.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[^a-z0-9\s-]/g,' ').replace(/-/g,' ').replace(/\s+/g,' ').trim();
}
export function tokenize(sentence: string): string[] {
  return normalize(sentence).split(' ').filter(Boolean).map(word=>equivalent[word]||word).filter(word=>!stopwords.has(word));
}
function levenshtein(a:string,b:string): number {
  const previous=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++) {
    let diag=previous[0]; previous[0]=i;
    for(let j=1;j<=b.length;j++) {
      const tmp=previous[j];previous[j]=Math.min(previous[j]+1,previous[j-1]+1,diag+(a[i-1]===b[j-1]?0:1));diag=tmp;
    }
  }
  return previous[b.length];
}
function fuzzyToken(a:string,b:string):number {
  if(a===b)return 1;
  if(Math.min(a.length,b.length)<4)return 0;
  const distance=levenshtein(a,b);
  return distance<=2?Math.max(0,1-distance/Math.max(a.length,b.length)):0;
}
function tokenScore(a:string[],b:string[]):number {
  if(!a.length||!b.length)return 0;
  let matched=0;
  for(const word of a){ const best=Math.max(0,...b.map(v=>fuzzyToken(word,v))); matched+=best; }
  const precision=matched/a.length;
  const recall=matched/b.length;
  return precision+recall ? 2*precision*recall/(precision+recall) : 0;
}
function similarity(a:string,b:string):number {
  const x=normalize(a),y=normalize(b);
  if(x===y)return 1;
  const tokens=tokenScore(tokenize(x),tokenize(y));
  const edit=x.length && y.length?1-levenshtein(x,y)/Math.max(x.length,y.length):0;
  return Math.max(tokens, .65*tokens+.35*edit);
}
function hasEra(sentence:string,era:Era):boolean {return new RegExp(`\\b${era.toLowerCase()}\\b`,'i').test(normalize(sentence));}

export interface MatchResult { item: KnowledgeItem | null; confidence: number; ambiguous: KnowledgeItem[]; }
const exactIndexes=new WeakMap<KnowledgeItem[],Map<string,KnowledgeItem>>();
export function matchQuestion(input:string,items:KnowledgeItem[]):MatchResult {
  const clean=normalize(input);
  if(!clean)return {item:null,confidence:0,ambiguous:[]};
  const mentioned=ERAS.filter(era=>hasEra(clean,era));
  const active=items.filter(v=>v.enabled);
  const withoutName=clean.replace(/^aki\s+/,'');
  let index=exactIndexes.get(items);
  if(!index){
    index=new Map<string,KnowledgeItem>();
    for(const item of active){
      for(const phrase of [item.question,...item.alternatives]){
        const key=normalize(phrase);
        if(!index.has(key))index.set(key,item);
        const simpler=key.replace(/^aki\s+/,'');
        if(!index.has(simpler))index.set(simpler,item);
      }
    }
    exactIndexes.set(items,index);
  }
  const direct=index.get(clean)??index.get(withoutName);
  if(direct)return {item:direct,confidence:1,ambiguous:[]};
  const result=active.map(item=>{
    const variants=[item.question,...item.alternatives.filter(Boolean)];
    const best=Math.max(...variants.map(s=>similarity(input,s)));
    const terms=tokenize(input);
    const keyTerms=item.keywords.flatMap(tokenize).filter(word=>!ERAS.map(v=>v.toLowerCase()).includes(word));
    const keyword=keyTerms.length?terms.filter(t=>keyTerms.some(k=>fuzzyToken(t,k)>.8)).length / Math.max(1,Math.min(keyTerms.length,terms.length)):0;
    // The era is a strict condition if the pupil has mentioned one era explicitly.
    const eraConflicts=mentioned.length===1 && item.era!=='Perbandingan' && item.era!=='Umum' && item.era!==mentioned[0] && variants.every(v=>!hasEra(v,mentioned[0]));
    const score=eraConflicts?0:Math.min(1,best*.9+keyword*.1+(mentioned.some(era=>era===item.era)? .02:0));
    return {item,score};
  }).sort((a,b)=>b.score-a.score);
  const first=result[0];
  if(!first||first.score<.56) return {item:null,confidence:first?.score??0,ambiguous:[]};
  const close=result.slice(1).filter(v=>v.score>=.56 && first.score-v.score<.055);
  if(close.length && first.score<.91) return {item:null,confidence:first.score,ambiguous:[first.item,...close.slice(0,2).map(v=>v.item)]};
  return {item:first.item,confidence:first.score,ambiguous:[]};
}
