import { describe, expect, it } from 'vitest';
import { seedQuestions } from '../data/seed';
import { matchQuestion } from './matcher';

describe('editable preset question matching',()=>{
  it('finds exactly phrased Malay questions',()=>{
    expect(matchQuestion('Di manakah manusia Zaman Paleolitik tinggal?',seedQuestions).item?.id).toBe('P001');
  });
  it('matches alternative wording',()=>{
    expect(matchQuestion('Manusia Paleolitik tinggal di mana?',seedQuestions).item?.id).toBe('P001');
  });
  it('matches minor typos',()=>{
    expect(matchQuestion('Di manakah manusia zaman paleoltiik tinggal?',seedQuestions).item?.id).toBe('P001');
  });
  it('respects active status',()=>{
    expect(matchQuestion('Di manakah manusia Zaman Paleolitik tinggal?',seedQuestions.map(x=>({...x,enabled:false}))).item).toBe(null);
  });
  it('rejects questions outside the knowledge set',()=>{
    expect(matchQuestion('Berapakah harga telefon pintar pada tahun ini?',seedQuestions).item).toBe(null);
  });
  it('reads new teacher edits immediately',()=>{
    const updated=seedQuestions.map(v=>v.id==='P001'?{...v,answerMS:'Jawapan baharu daripada cikgu.'}:v);
    expect(matchQuestion('Di manakah manusia Zaman Paleolitik tinggal?',updated).item?.answerMS).toBe('Jawapan baharu daripada cikgu.');
  });
});

import {importedQuestions} from '../data/seed';
it('matches each of the 1499 supplied question forms',()=>{
 for(const item of importedQuestions){
  for(const phrase of [item.question,...item.alternatives]){
   const found=matchQuestion(phrase,importedQuestions);
   expect(found.item?.id,`Wrong match: ${phrase}`).toBe(item.id);
  }
 }
});
