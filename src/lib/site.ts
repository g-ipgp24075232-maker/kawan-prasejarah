import { DEFAULT_SITE } from '../data/site';
import type { SiteArt, SiteDesign } from '../types';

const textFields=[
  'brandBefore','brandAccent','brandSubtitle','heroEyebrow','heroBefore','heroAfter','heroDescription',
  'bubbleCaption','touchHint','chatTitle','chatDescription','questionCaption','placeholder','sendLabel',
  'voiceTestLabel','repeatLabel','stopLabel','muteLabel','unmuteLabel','footerLabel','teacherLabel',
  'cameraTitle','cameraDescription','cameraStart','cameraStop','cameraPrivacy','cameraReady',
  'cameraDetected','cameraMissing','cameraWaveVoice'
] as const;
const colorFields=['backgroundColor','headerColor','chatColor','bubbleColor','accentColor','textColor','buttonColor'] as const;
const imageFields=['backgroundImage','brandLogoImage','bubbleArtImage'] as const;
export const clamp=(value:unknown,min:number,max:number,fallback:number):number=>
  typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
export function safeImage(value:unknown):string{
  return typeof value==='string'&&value.length<1_350_000&&/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(value)?value:'';
}
function sanitizeArt(input:unknown,fallback:SiteArt):SiteArt{
  const value=input&&typeof input==='object'&&!Array.isArray(input)?input as Record<string,unknown>:{};
  return {image:safeImage(value.image),left:clamp(value.left,0,100,fallback.left),
    top:clamp(value.top,0,100,fallback.top),width:clamp(value.width,50,600,fallback.width),
    opacity:clamp(value.opacity,0,100,fallback.opacity)};
}
export function sanitizeSite(input:unknown,legacyBackground=''):SiteDesign{
  const v=input&&typeof input==='object'&&!Array.isArray(input)?input as Record<string,unknown>:{};
  const site:SiteDesign={...DEFAULT_SITE,artLeft:{...DEFAULT_SITE.artLeft},
    artRight:{...DEFAULT_SITE.artRight},artChat:{...DEFAULT_SITE.artChat}};
  const output=site as unknown as Record<string,unknown>;
  for(const key of textFields)if(typeof v[key]==='string')output[key]=(v[key] as string).slice(0,280);
  for(const key of colorFields)if(typeof v[key]==='string'&&/^#[0-9a-f]{6}$/i.test(v[key] as string))output[key]=v[key];
  for(const key of imageFields)output[key]=safeImage(v[key]);
  if(!('backgroundImage' in v))site.backgroundImage=safeImage(legacyBackground);
  const font=v.fontFamily;
  if(font==='Nunito'||font==='Baloo 2'||font==='Arial'||font==='Trebuchet MS')site.fontFamily=font;
  if(typeof v.backgroundPosition==='string'&&['center','top','bottom','left','right'].includes(v.backgroundPosition))
    site.backgroundPosition=v.backgroundPosition;
  site.backgroundOverlay=clamp(v.backgroundOverlay,0,100,site.backgroundOverlay);
  site.fontScale=clamp(v.fontScale,80,140,site.fontScale);
  site.maxWidth=clamp(v.maxWidth,640,1200,site.maxWidth);
  site.cornerRadius=clamp(v.cornerRadius,4,42,site.cornerRadius);
  site.heroSpacing=clamp(v.heroSpacing,0,100,site.heroSpacing);
  for(const key of ['showCamera','showTouchHint','showVoiceControls','chatFirst'] as const)
    if(typeof v[key]==='boolean')site[key]=v[key] as boolean;
  site.artLeft=sanitizeArt(v.artLeft,site.artLeft);
  site.artRight=sanitizeArt(v.artRight,site.artRight);
  site.artChat=sanitizeArt(v.artChat,site.artChat);
  return site;
}
