import { expect,it } from 'vitest';
import { initialData } from '../data/seed';
import { resolveDialogue,reconcileEditedAnswer } from './dialogue';

it('shows the teacher-edited greeting after loading the site',()=>{
  const data={...initialData,settings:{...initialData.settings,greeting:'Salam baharu!'}};
  expect(resolveDialogue({kind:'greeting'},data)?.text).toBe('Salam baharu!');
});
it('updates the currently displayed question, without changing the welcome greeting',()=>{
  const question={...initialData.questions[0],answerMS:'Jawapan yang telah dikemas kini.'};
  const data={...initialData,questions:[question,...initialData.questions.slice(1)]};
  expect(resolveDialogue({kind:'answer',id:question.id},data)?.text).toBe(question.answerMS);
  expect(resolveDialogue({kind:'greeting'},data)?.text).toBe(initialData.settings.greeting);
});
it('updates touched avatar reactions and unknown answers',()=>{
  const data={...initialData,settings:{...initialData.settings,
    unknownAnswer:'Sila cuba lagi.',reactions:{...initialData.settings.reactions,face:'Apa khabar?'}}};
  expect(resolveDialogue({kind:'reaction',area:'face'},data)?.text).toBe('Apa khabar?');
  expect(resolveDialogue({kind:'unknown'},data)?.text).toBe('Sila cuba lagi.');
});
it('does not overwrite temporary thinking dialogue',()=>{
  expect(resolveDialogue({kind:'other'},initialData)).toBeNull();
});
it('removes stale MP3 when its answer has changed',()=>{
  const old={answerMS:'Lama',audioMS:'data:audio/mp3;base64,AAA'};
  const changed={...old,answerMS:'Baharu'};
  expect(reconcileEditedAnswer(old,changed)).toEqual({value:{answerMS:'Baharu',audioMS:undefined},removedOutdatedRecording:true});
});
it('keeps new recordings and unchanged-answer audio',()=>{
  const old={answerMS:'Lama',audioMS:'old.mp3'};
  const next={answerMS:'Baharu',audioMS:'new.mp3'};
  expect(reconcileEditedAnswer(old,next).value.audioMS).toBe('new.mp3');
  expect(reconcileEditedAnswer(old,old).value.audioMS).toBe('old.mp3');
});
