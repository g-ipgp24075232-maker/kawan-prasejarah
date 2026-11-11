import type {AppData} from '../types';
import {initialData} from '../data/seed';
import originals from '../data/previousAnswers.json';
const originalById=originals as Record<string,string>;
const updated=new Map(initialData.questions.map(q=>[q.id,q.answerMS]));
/** Respect teacher-authored answers; upgrade only unchanged old source answers.
 * Old MP3 files must not be replayed against a newly worded answer. */
export function migrateAkiNarration(data:AppData):AppData{
 let changed=false;
 const questions=data.questions.map(item=>{
  const old=originalById[item.id];
  const fresh=updated.get(item.id);
  if(old!==undefined&&fresh!==undefined&&item.answerMS===old&&fresh!==old){
   changed=true;
   return {...item,answerMS:fresh,audioMS:undefined};
  }
  return item;
 });
 return changed?{...data,questions}:data;
}
