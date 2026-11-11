import type {AppData} from '../types';
import {parseBackup} from './storage';

/** Every student reads this deployed file, never an unrelated browser draft. */
export const PUBLICATION_FILE='published-site.json';
export const GITHUB_PUBLIC_DIRECTORY='https://github.com/g-ipgp24075232-maker/kawan-prasejarah/upload/main/public';

export async function fetchGitHubPublished():Promise<AppData|null>{
  const base=import.meta.env.BASE_URL||'/';
  const path=base.replace(/\/?$/,'/')+PUBLICATION_FILE+'?rev='+Date.now();
  const response=await fetch(path,{cache:'no-store'});
  if(response.status===404)return null;
  if(!response.ok)throw new Error('Versi umum tidak dapat dimuatkan ('+response.status+').');
  const source:unknown=await response.json();
  return parseBackup(JSON.stringify(source));
}

/** Explicit publication artifact. Committing this under public/ on main
 * publishes the exact approved teacher content through GitHub Pages. */
export function downloadForGitHub(data:AppData):void{
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=PUBLICATION_FILE;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

export function publicationStatus(cloud:boolean,preview:boolean):'online'|'draft'|'public'{
  if(preview)return 'draft';
  return cloud?'online':'public';
}
