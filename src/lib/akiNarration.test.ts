import {expect,it} from 'vitest';
import {initialData} from '../data/seed';
import {migrateAkiNarration} from './akiNarration';
import old from '../data/previousAnswers.json';
it('all 553 published default answers have Aki dialogue voice',()=>{
 expect(initialData.questions).toHaveLength(553);
 for(const item of initialData.questions){
  expect(item.answerMS).toMatch(/\\b(saya|kita|jom|mari|kawan|awak|kamu)\\b/i);
  expect(item.answerMS.toLowerCase()).not.toContain('buku teks');
 }
});
it('upgrades old default text but protects teacher edits',()=>{
 const oldAnswers=old as Record<string,string>;
 const sample=initialData.questions[0];
 const legacy={...initialData,questions:[{...sample,answerMS:oldAnswers[sample.id],audioMS:'data:audio/mp3;base64,AABB'}]};
 const current=migrateAkiNarration(legacy);
 expect(current.questions[0].answerMS).toBe(sample.answerMS);
 expect(current.questions[0].audioMS).toBeUndefined();
 const edited={...legacy,questions:[{...sample,answerMS:'Versi peribadi guru'}]};
 expect(migrateAkiNarration(edited).questions[0].answerMS).toBe('Versi peribadi guru');
});
