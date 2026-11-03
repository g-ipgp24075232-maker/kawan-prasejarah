import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { parseBackup } from './storage';
import type { AppData } from '../types';

const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const cloudAvailable=Boolean(url && key);
let client:SupabaseClient|null=null;
function db():SupabaseClient {
  if(!cloudAvailable) throw new Error('Mod dalam talian belum disediakan.');
  if(!client)client=createClient(url!,key!,{auth:{persistSession:true,autoRefreshToken:true}});
  return client;
}
export async function fetchPublished():Promise<AppData|null> {
  if(!cloudAvailable)return null;
  const {data,error}=await db().from('published_knowledge').select('content').eq('id','main').maybeSingle();
  if(error)throw new Error(error.message);
  return data?.content ? parseBackup(JSON.stringify(data.content)) : null;
}
export async function teacherLogin(email:string,password:string):Promise<void> {
  const {error}=await db().auth.signInWithPassword({email,password});
  if(error)throw new Error('Log masuk gagal: '+error.message);
  // An authenticated user is not necessarily an authorized teacher. RLS enforces writes.
  const {data, error:authErr}=await db().from('teacher_permissions').select('user_id').limit(1);
  if(authErr || !data?.length){await db().auth.signOut();throw new Error('Akaun ini tidak mempunyai kebenaran Guru. Sila tambah ID akaun dalam teacher_permissions.');}
}
export async function teacherLogout():Promise<void> {
  await db().auth.signOut();
}
export async function getTeacherSession():Promise<boolean> {
  if(!cloudAvailable)return false;
  const {data:{session}}=await db().auth.getSession();
  if(!session)return false;
  const {data,error}=await db().from('teacher_permissions').select('user_id').limit(1);
  return !error && !!data?.length;
}
export async function publishData(content:AppData):Promise<void> {
  const {data:{user}}=await db().auth.getUser();
  if(!user)throw new Error('Sila log masuk sebagai guru sebelum menerbitkan.');
  const {error}=await db().from('published_knowledge').upsert({id:'main',content,updated_by:user.id,updated_at:new Date().toISOString()});
  if(error)throw new Error('Gagal menerbitkan: '+error.message);
}

export function subscribePublished(onData:(data:AppData)=>void):()=>void {
  if(!cloudAvailable)return ()=>{};
  const channel=db().channel('kawan-prasejarah-live-updates')
    .on('postgres_changes',{event:'*',schema:'public',table:'published_knowledge',filter:'id=eq.main'},payload=>{
      const row=payload.new as {content?:unknown}|undefined;
      if(row?.content){try{onData(parseBackup(JSON.stringify(row.content)));}catch(error){console.warn('Abaikan data terbitan yang tidak sah:',error);}}
    }).subscribe();
  return ()=>{void db().removeChannel(channel);};
}
