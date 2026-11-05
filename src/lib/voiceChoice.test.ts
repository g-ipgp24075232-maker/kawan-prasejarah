import {expect,it} from 'vitest';
import {voiceGender,orderedFemaleVoices,voiceAvailabilityMessage} from './voiceChoice';
const v=(name:string,lang:string,voiceURI=name)=>({name,lang,voiceURI});
it('recognises labelled female and male voices conservatively',()=>{
  expect(voiceGender('Microsoft Yasmin Online (Natural)')).toBe('female');
  expect(voiceGender('Microsoft Osman Online (Natural)')).toBe('male');
  expect(voiceGender('Google Bahasa Melayu')).toBe('unknown');
});
it('prefers Malaysian female voice over other languages and excludes male',()=>{
  const candidates=[v('Microsoft Osman','ms-MY'),v('Microsoft Zira','en-US'),v('Microsoft Yasmin','ms-MY')];
  expect(orderedFemaleVoices(candidates,'').map(x=>x.name)).toEqual(['Microsoft Yasmin','Microsoft Zira']);
});
it('only allows unlabelled voices when teacher explicitly chooses one',()=>{
  const voices=[v('Google Bahasa Melayu','ms-MY'),v('Osman','ms-MY')];
  expect(orderedFemaleVoices(voices,'')).toEqual([]);
  expect(orderedFemaleVoices(voices,'Google Bahasa Melayu')).toEqual([voices[0]]);
  expect(orderedFemaleVoices(voices,'Osman')).toEqual([]);
});
it('warns when fallback voice may mispronounce Malay',()=>{
  expect(voiceAvailabilityMessage(v('Zira','en-US'))).toMatch(/sebutan mungkin/);
  expect(voiceAvailabilityMessage(v('Yasmin','ms-MY'))).toBe('');
});
