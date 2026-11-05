import {expect,it} from 'vitest';
import {importedQuestions,initialData,seedQuestions} from '../data/seed';
import {mergeImportedBank} from './knowledgeBank';
it('loads all 513 entries and 1499 question forms',()=>{
 expect(importedQuestions).toHaveLength(513);
 expect(importedQuestions.reduce((n,q)=>n+1+q.alternatives.length,0)).toBe(1499);
 expect(new Set(importedQuestions.map(q=>q.id)).size).toBe(513);
 expect(initialData.questions).toHaveLength(513+seedQuestions.length);
});
it('keeps old teachers edits and merges every imported question',()=>{
 const local={...initialData,questions:[{...seedQuestions[0],answerMS:'Jawapan suntingan guru'}],settings:{...initialData.settings,greeting:'Selamat kembali'}};
 const result=mergeImportedBank(local);
 expect(result.questions).toHaveLength(514);
 expect(result.questions[0].id).toBe('PRAS-0001');
 expect(result.questions.find(q=>q.id===seedQuestions[0].id)?.answerMS).toBe('Jawapan suntingan guru');
 expect(result.settings).toBe(local.settings);
});
it('does not overwrite already edited new bank entries',()=>{
 const changed={...importedQuestions[0],answerMS:'Disunting',enabled:false};
 expect(mergeImportedBank({...initialData,questions:[changed]}).questions[0]).toEqual(changed);
});
