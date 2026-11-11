import type { AppData, AvatarSettings, KnowledgeItem, QuizItem } from '../types';
import { ERAS,KNOWLEDGE_ERAS } from '../types';
import { initialData } from '../data/seed';
import {KNOWLEDGE_BANK_VERSION,mergeImportedBank} from './knowledgeBank';
import { migrateAkiNarration } from './akiNarration';
import { validAnswerAudio } from './audio';
import { safeImage,clamp } from './site';
import { sanitizeSite } from './site';

const STORAGE_KEY = 'kawan-prasejarah-draft-v1';
const PIN_KEY = 'kawan-prasejarah-pin-v1';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (v: unknown): v is string => typeof v === 'string';
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(text);

export function parseBackup(source: string): AppData {
  const input: unknown = JSON.parse(source);
  if (!isRecord(input) || !Array.isArray(input.questions) || !Array.isArray(input.quizzes) || !isRecord(input.settings)) {
    throw new Error('Fail JSON tidak mempunyai struktur data Kawan Prasejarah yang sah.');
  }
  if (input.questions.length > 3000 || input.quizzes.length > 3000) throw new Error('Terlalu banyak rekod dalam fail.');
  const questions: KnowledgeItem[] = input.questions.map((raw: unknown, index) => {
    if (!isRecord(raw) || !text(raw.id) || !text(raw.question) || !text(raw.answerMS) || !strings(raw.alternatives) || !strings(raw.keywords) ||
      !KNOWLEDGE_ERAS.includes(raw.era as never) || typeof raw.enabled !== 'boolean') throw new Error(`Soalan ${index + 1} tidak sah.`);
    return { id: raw.id.slice(0, 80), era: raw.era as KnowledgeItem['era'], question: raw.question.slice(0, 500),
      answerMS: raw.answerMS.slice(0, 2000), audioMS: validAnswerAudio(raw.audioMS) ? raw.audioMS : undefined, answerZH: text(raw.answerZH) ? raw.answerZH.slice(0, 2000) : '',
      topic:text(raw.topic)?raw.topic.slice(0,120):undefined,
      evidence:text(raw.evidence)?raw.evidence.slice(0,80):undefined,
      source:text(raw.source)?raw.source.slice(0,400):undefined,
      alternatives: raw.alternatives.slice(0, 20).map(v => v.slice(0, 500)),
      keywords: raw.keywords.slice(0, 30).map(v => v.slice(0, 100)), enabled: raw.enabled };
  });
  const quizzes: QuizItem[] = input.quizzes.map((raw: unknown, index) => {
    if (!isRecord(raw) || !text(raw.id) || !text(raw.question) || !Array.isArray(raw.options) || raw.options.length !== 4 ||
      !strings(raw.options) || !Number.isInteger(raw.correctIndex) || Number(raw.correctIndex) < 0 || Number(raw.correctIndex) > 3 ||
      !text(raw.explanation) || !ERAS.includes(raw.era as never)) throw new Error(`Kuiz ${index + 1} tidak sah.`);
    return {id:raw.id.slice(0,80), era:raw.era as QuizItem['era'],question:raw.question.slice(0,500),
      options:raw.options.map(v=>v.slice(0,400)) as QuizItem['options'], correctIndex:Number(raw.correctIndex),explanation:raw.explanation.slice(0,1000)};
  });
  const s = input.settings;
  const defaults = initialData.settings;
  const str = (key: keyof AvatarSettings, fallback: string): string => text(s[key]) ? String(s[key]) : fallback;
  const r = isRecord(s.reactions) ? s.reactions : {};
  const e = isRecord(s.eraDescriptions) ? s.eraDescriptions : {};
  const layers = isRecord(s.layers) ? s.layers : {};
  const poseInput=isRecord(s.poses)?s.poses:{};
  const blinkInput=isRecord(s.blink)?s.blink:{};
  const mouthInput=isRecord(s.mouth)?s.mouth:{};
  const defaultBlink=defaults.blink;
  const settings: AvatarSettings = {
    name: str('name', defaults.name).slice(0,60),
    greeting: str('greeting',defaults.greeting).slice(0,1000),
    unknownAnswer: str('unknownAnswer',defaults.unknownAnswer).slice(0,1000),
    speechRate: typeof s.speechRate === 'number' && Number.isFinite(s.speechRate) ? Math.max(.6,Math.min(1.5,s.speechRate)) : defaults.speechRate,
    preferredVoice: str('preferredVoice',''),
    size: typeof s.size === 'number' && Number.isFinite(s.size) ? Math.max(270,Math.min(580,s.size)) : defaults.size,
    horizontalOffset: typeof s.horizontalOffset === 'number' && Number.isFinite(s.horizontalOffset) ? Math.max(-160,Math.min(160,s.horizontalOffset)) : 0,
    backgroundImage: str('backgroundImage',''), skinColor: str('skinColor',defaults.skinColor), hairColor: str('hairColor',defaults.hairColor),
    clothingColor: str('clothingColor',defaults.clothingColor), fullArtwork:str('fullArtwork',''),
    poses:Object.fromEntries(['idle','talk','wave','blink'].map(key=>[key,safeImage(poseInput[key])])) as AvatarSettings['poses'],
    mouth:{
      x:clamp(mouthInput.x,15,85,defaults.mouth.x),
      y:clamp(mouthInput.y,10,85,defaults.mouth.y),
      width:clamp(mouthInput.width,4,28,defaults.mouth.width),
      height:clamp(mouthInput.height,2,18,defaults.mouth.height)
    },
    blink:{
      leftX:clamp(blinkInput.leftX,5,90,defaultBlink.leftX),
      rightX:clamp(blinkInput.rightX,5,95,defaultBlink.rightX),
      eyeY:clamp(blinkInput.eyeY,5,85,defaultBlink.eyeY),
      eyeWidth:clamp(blinkInput.eyeWidth,3,25,defaultBlink.eyeWidth),
      eyeHeight:clamp(blinkInput.eyeHeight,2,18,defaultBlink.eyeHeight),
      color:typeof blinkInput.color==='string'&&/^#[a-f0-9]{6}$/i.test(blinkInput.color)
        ?(blinkInput.color.toLowerCase()==='#f4b18b'?defaultBlink.color:blinkInput.color):defaultBlink.color
    },
    layers: Object.fromEntries(Object.entries(layers).filter(([k,v])=>['head','torso','leftArm','rightArm','legs','mouth'].includes(k) && text(v) && v.startsWith('data:image/'))) as AvatarSettings['layers'],
    reactions: {
      head:text(r.head)?r.head:defaults.reactions.head, belly:text(r.belly)?r.belly:defaults.reactions.belly,
      leftHand:text(r.leftHand)?r.leftHand:defaults.reactions.leftHand, rightHand:text(r.rightHand)?r.rightHand:defaults.reactions.rightHand,
      feet:text(r.feet)?r.feet:defaults.reactions.feet,face:text(r.face)?r.face:defaults.reactions.face
    },
    eraDescriptions:Object.fromEntries(ERAS.map(era=>[era,text(e[era])?e[era]:defaults.eraDescriptions[era]])) as AvatarSettings['eraDescriptions']
  };
  // Naik taraf ungkapan lama sahaja, tanpa menimpa sebarang suntingan guru.
  const oldGreeting='Hai, kawan! Saya Aki. Jom kita teroka Zaman Prasejarah bersama-sama!';
  if(settings.greeting===oldGreeting)settings.greeting=defaults.greeting;
  if(settings.unknownAnswer==='Maaf, saya belum tahu jawapan itu. Boleh kamu cuba soalan lain?')settings.unknownAnswer=defaults.unknownAnswer;
  const oldReactions:Record<keyof AvatarSettings['reactions'],string>={
    head:'Hehe! Jangan usik rambut saya!',
    belly:'Hahaha! Geli, geli!',
    leftHand:'Hai! Saya gembira berjumpa dengan kamu!',
    rightHand:'Hebat! Tepuk tangan untuk kamu!',
    feet:'Wah! Saya boleh melompat!',
    face:'Lihatlah wajah lucu saya!'
  };
  for(const key of Object.keys(oldReactions) as (keyof AvatarSettings['reactions'])[]){
    if(settings.reactions[key]===oldReactions[key])settings.reactions[key]=defaults.reactions[key];
  }
  const ids = questions.map(item=>item.id);
  if (new Set(ids).size !== ids.length) throw new Error('ID soalan berulang.');
  return {version:1,questions,quizzes,settings,site:sanitizeSite(input.site,settings.backgroundImage)};
}

export function getStoredData(): AppData | null {
 try{
  const value=localStorage.getItem(STORAGE_KEY);
  if(!value)return null;
  const stored=parseBackup(value);
  const marker=STORAGE_KEY+'-'+KNOWLEDGE_BANK_VERSION;
  const enriched=localStorage.getItem(marker)==='yes'?stored:mergeImportedBank(stored);
  const upgraded=migrateAkiNarration(enriched);
  try{if(upgraded!==stored)persistData(upgraded);localStorage.setItem(marker,'yes');}
  catch(e){console.warn('Ruang simpanan penuh; bank soalan dikemas kini dalam sesi ini:',e);}
  return upgraded;
 }catch(e){console.warn('Data simpanan tidak boleh dibaca:',e);return null;}
}
export function persistData(data: AppData): void { localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); }
export function hasStoredData(): boolean { return !!localStorage.getItem(STORAGE_KEY); }
export function downloadJson(data: AppData): void {
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=`kawan-prasejarah-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export async function hashPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`kawan-prasejarah|${pin}`));
  return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
}
export function isPinSet(): boolean { return !!localStorage.getItem(PIN_KEY); }
export async function setPin(pin: string): Promise<void> { localStorage.setItem(PIN_KEY,await hashPin(pin)); }
export async function verifyPin(pin: string): Promise<boolean> { return localStorage.getItem(PIN_KEY) === await hashPin(pin); }
