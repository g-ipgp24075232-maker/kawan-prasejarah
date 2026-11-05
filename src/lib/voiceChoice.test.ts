import {expect,it} from 'vitest';
import {voiceGender,orderedFemaleVoices,orderedIndonesianVoices,voiceAvailabilityMessage} from './voiceChoice';
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

it('prefers Indonesian voices even when their gender is not named',()=>{
  const voices=[v('Yasmin','ms-MY'),v('Google Bahasa Indonesia','id-ID')];
  expect(orderedIndonesianVoices(voices,'Yasmin')[0].lang).toBe('id-ID');
  expect(orderedIndonesianVoices([v('Google Bahasa Indonesia','id-ID')],'')).toHaveLength(1);
});
