import type {AppData,KnowledgeItem} from '../types';
import {importedQuestions} from '../data/seed';
export const KNOWLEDGE_BANK_VERSION='sosial-ekonomi-513-v1';
/** Merge by stable ID, retaining all teacher edits, art, audio, and settings. */
export function mergeImportedBank(data:AppData):AppData{
 const saved=new Map(data.questions.map(item=>[item.id,item]));
 const ids=new Set(importedQuestions.map(item=>item.id));
 const updated:KnowledgeItem[]=importedQuestions.map(item=>saved.get(item.id)??item);
 return {...data,questions:[...updated,...data.questions.filter(item=>!ids.has(item.id))]};
}