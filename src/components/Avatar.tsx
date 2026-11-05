import type { CSSProperties, KeyboardEvent } from 'react';
import type { Animation, AvatarSettings } from '../types';

type TouchArea='head'|'belly'|'leftHand'|'rightHand'|'feet'|'face';
interface AvatarProps {
  animation:Animation;
  settings:AvatarSettings;
  onInteract:(area:TouchArea)=>void;
}

export default function Avatar({animation,settings,onInteract}:AvatarProps) {
  const style={
    '--skin':settings.skinColor,
    '--hair':settings.hairColor,
    '--clothing':settings.clothingColor
  } as CSSProperties;
  const part=(name:keyof AvatarSettings['layers'],x:number,y:number,w:number,h:number)=>(settings.layers[name]?<image href={settings.layers[name]} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" pointerEvents="none"/>:null);
  const activate=(event:KeyboardEvent<SVGGElement>,area:TouchArea)=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();onInteract(area);}
  };
  const hit=(area:TouchArea,x:number,y:number,width:number,height:number,rx=30)=><rect
    role="button" tabIndex={0} aria-label={`Sentuh ${area}`} onKeyDown={e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();onInteract(area);}
    }} onClick={e=>{e.stopPropagation();onInteract(area);}}
    className="avatar-hit" x={x} y={y} width={width} height={height} rx={rx} fill="transparent"/>;
  return <svg
    className={`prehistoric-avatar state-${animation}`}
    style={style}
    viewBox="0 0 420 545" role="img"
    aria-label="Aki, watak perempuan prasejarah bergaya kartun dengan rambut panjang beranyam dan bahagian badan yang boleh disentuh">
    <defs>
      <linearGradient id="skinGradient" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ffe3ad"/><stop offset="1" stopColor={settings.skinColor}/></linearGradient>
      <linearGradient id="tunicGradient" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#cc9a61"/><stop offset="1" stopColor={settings.clothingColor}/></linearGradient>
      <linearGradient id="hairGradient" x1="0" x2=".8" y1="0" y2="1"><stop offset="0" stopColor="#8c5b3a"/><stop offset="1" stopColor={settings.hairColor}/></linearGradient>
      <filter id="characterShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#4a5734" floodOpacity=".16"/></filter>
    </defs>
    <ellipse cx="210" cy="519" rx="93" ry="14" fill="#416c40" opacity=".18" className="avatar-ground-shadow"/>
    <g className="avatar-rig" filter="url(#characterShadow)">
      {settings.fullArtwork ? <g className="whole-artwork">
        <image href={settings.fullArtwork} x="47" y="20" width="326" height="492" preserveAspectRatio="xMidYMid meet"/>
        {hit('feet',120,433,180,85)}{hit('leftHand',40,245,90,170)}{hit('rightHand',292,245,90,170)}
        {hit('belly',128,290,170,144)}{hit('head',120,50,180,82)}{hit('face',130,128,163,154)}
      </g> : <>
        <g className="avatar-legs">
          <g className="avatar-left-leg"><path d="M166 384 Q153 422 157 464 L155 483 Q167 501 192 485 L198 410Z" fill="url(#skinGradient)" stroke="#985e43" strokeWidth="2.3"/>
            <path d="M157 466 Q144 474 133 492 Q124 503 140 510 Q167 516 193 497 L192 478" fill="url(#skinGradient)" stroke="#985e43" strokeWidth="2.5"/></g>
          <g className="avatar-right-leg"><path d="M228 391 L228 478 Q237 492 255 483 L263 459 Q265 420 255 382Z" fill="url(#skinGradient)" stroke="#985e43" strokeWidth="2.3"/>
            <path d="M230 478 Q255 473 268 487 Q293 500 277 508 Q255 516 230 497" fill="url(#skinGradient)" stroke="#985e43" strokeWidth="2.5"/></g>
          {part('legs',110,368,198,145)}
        </g>
        <g className="avatar-long-hair" aria-hidden="true">
          <path d="M125 111 Q98 147 99 211 Q83 274 98 346 Q99 377 115 394 Q147 378 151 337 L157 197Z"
            fill="url(#hairGradient)" stroke="#543727" strokeWidth="3"/>
          <path d="M283 103 Q325 151 313 215 Q337 295 311 390 Q283 384 271 339 L262 179Z"
            fill="url(#hairGradient)" stroke="#543727" strokeWidth="3"/>
          <path d="M113 158 Q94 244 111 351 M299 157 Q324 259 300 352"
            fill="none" stroke="#bd8257" strokeWidth="6" strokeLinecap="round" opacity=".38"/>
        </g>
        <g className="avatar-left-arm" onClick={e=>{e.stopPropagation();onInteract('leftHand');}} onKeyDown={e=>activate(e,'leftHand')} tabIndex={0} role="button" aria-label="Sentuh tangan kiri">
          <path d="M149 275 Q113 268 97 309 Q79 349 70 365" fill="none" stroke="url(#skinGradient)" strokeWidth="37" strokeLinecap="round"/>
          <path d="M70 360 Q43 357 48 380 Q55 394 70 393 Q82 405 89 388 Q96 374 84 360" fill="url(#skinGradient)" stroke="#986143" strokeWidth="2.5"/>
          {part('leftArm',39,251,120,166)}
        </g>
        <g className="avatar-right-arm" onClick={e=>{e.stopPropagation();onInteract('rightHand');}} onKeyDown={e=>activate(e,'rightHand')} tabIndex={0} role="button" aria-label="Sentuh tangan kanan">
          <path d="M275 276 Q315 282 330 322 Q343 343 348 363" fill="none" stroke="url(#skinGradient)" strokeWidth="37" strokeLinecap="round"/>
          <path d="M345 358 Q365 351 374 367 Q384 386 367 390 Q357 404 344 389 Q327 384 331 369" fill="url(#skinGradient)" stroke="#986143" strokeWidth="2.5"/>
          {part('rightArm',267,258,124,161)}
        </g>
        <g className="avatar-torso" onClick={e=>{e.stopPropagation();onInteract('belly');}} onKeyDown={e=>activate(e,'belly')} tabIndex={0} role="button" aria-label="Sentuh perut">
          <path d="M154 252 Q208 224 271 254 Q303 315 284 394 Q216 427 145 394 Q124 331 154 252Z" fill="url(#tunicGradient)" stroke="#8e5835" strokeWidth="3"/>
          <path d="M150 349 Q212 369 274 351 L295 422 L277 437 L264 430 L247 444 L228 434 L207 447 L188 434 L168 444 L150 430 L133 438Z"
            fill="url(#tunicGradient)" stroke="#88583e" strokeWidth="3"/>
          <path d="M154 359 Q210 378 273 357" fill="none" stroke="#f5d1a2" strokeWidth="7" strokeLinecap="round"/>
          <path d="M160 383 L170 410 M197 389 L196 419 M232 384 L238 420 M265 381 L270 412"
            stroke="#f8d8a6" strokeWidth="3" strokeLinecap="round" opacity=".65"/>
          <path d="M151 263 L208 302 266 257" fill="none" stroke="#efc48d" strokeWidth="5" opacity=".8"/>
          <path d="M155 358 Q201 378 270 359" fill="none" stroke="#85512f" strokeWidth="3" strokeDasharray="7 10"/>
          <path d="M145 384 Q160 376 174 389 Q199 379 215 395 Q243 378 262 392 L281 383 285 400 Q212 436 145 404Z" fill="#8d603e"/>
          <g fill="#f3d79f"><circle cx="176" cy="317" r="4"/><circle cx="241" cy="347" r="3"/><path d="M235 282L247 289 239 298 229 289Z"/></g>
          <path d="M188 249 L195 277 Q210 296 226 276 L237 248" fill="none" stroke="#f3e8cd" strokeWidth="4"/>
          <path d="M209 276 L219 290 210 300 200 290Z" fill="#f9f3dc" stroke="#98785d" strokeWidth="1.5"/>
          {part('torso',126,240,174,191)}
        </g>
        <g className="avatar-head">
          <path d="M192 237 L192 264 Q207 275 229 260 L230 232" fill="url(#skinGradient)" stroke="#aa704d" strokeWidth="2"/>
          <path d="M118 134 Q95 64 167 54 Q234 6 293 67 Q321 106 302 177 Q303 236 270 255 Q209 277 151 247 Q109 228 118 134Z" fill="url(#hairGradient)" stroke="#503125" strokeWidth="3"/>
          <path d="M125 141 Q128 80 203 75 Q281 72 289 153 L286 206 Q281 248 224 256 Q162 252 136 212Z" fill="url(#skinGradient)" stroke="#a36c4a" strokeWidth="3"/>
          <ellipse cx="129" cy="177" rx="15" ry="22" fill="url(#skinGradient)" stroke="#a36c4a" strokeWidth="3"/>
          <ellipse cx="291" cy="178" rx="15" ry="22" fill="url(#skinGradient)" stroke="#a36c4a" strokeWidth="3"/>
          <path d="M119 146 Q101 103 138 84 Q131 47 181 53 Q205 28 246 54 Q291 41 303 100 Q309 122 295 147 Q279 109 256 99 Q242 120 226 105 Q198 130 178 106 Q161 135 119 146Z" fill="url(#hairGradient)" stroke="#503125" strokeWidth="3"/>
          <path d="M141 82 Q163 36 202 63 M229 57 Q266 45 283 83" fill="none" stroke="#ac744b" strokeWidth="8" strokeLinecap="round" opacity=".6"/>
          <g className="avatar-face" onClick={e=>{e.stopPropagation();onInteract('face');}} onKeyDown={e=>activate(e,'face')} role="button" tabIndex={0} aria-label="Sentuh muka">
            <g className="avatar-eyebrows" stroke="#4b3125" strokeWidth="6" strokeLinecap="round" fill="none">
              <path d="M158 146 Q176 135 190 144"/><path d="M231 143 Q249 134 263 146"/>
            </g>
            <g className="avatar-eyes"><ellipse cx="176" cy="165" rx="14" ry="17" fill="#fffdf2"/><ellipse cx="247" cy="164" rx="14" ry="17" fill="#fffdf2"/>
              <ellipse cx="178" cy="167" rx="7.6" ry="11" fill="#432f2b"/><ellipse cx="246" cy="166" rx="7.6" ry="11" fill="#432f2b"/>
              <circle cx="180" cy="162" r="2.6" fill="#fff"/><circle cx="248" cy="161" r="2.6" fill="#fff"/></g>
            <g className="avatar-eyelids" fill="url(#skinGradient)"><rect x="158" y="149" width="37" height="1" rx="1"/><rect x="228" y="149" width="37" height="1" rx="1"/></g>
            <path d="M211 168 Q197 191 211 193 Q220 198 226 189" fill="none" stroke="#bd7c58" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="154" cy="199" rx="17" ry="9" fill="#ed8f82" opacity=".47"/><ellipse cx="267" cy="199" rx="17" ry="9" fill="#ed8f82" opacity=".47"/>
            <g className="avatar-mouth" style={{transformOrigin:'210px 217px'}}>
              <path d="M188 213 Q210 237 234 213 Q229 235 210 237 Q194 237 188 213Z" fill="#823b3a" stroke="#91483b" strokeWidth="2.2"/>
              <path d="M192 215 Q212 228 230 215" fill="none" stroke="#fff8ea" strokeWidth="6" strokeLinecap="round"/>
              <ellipse cx="213" cy="231" rx="11" ry="4" fill="#e8898c"/>
            </g>
            <rect x="152" y="146" width="117" height="98" rx="32" fill="transparent" pointerEvents="all"/>
          </g>
          <g className="avatar-braids" aria-hidden="true">
            <path d="M123 159 Q110 217 125 264 Q111 293 125 321" fill="none" stroke="#633d2e" strokeWidth="21" strokeLinecap="round"/>
            <path d="M294 157 Q312 212 295 261 Q313 291 298 320" fill="none" stroke="#633d2e" strokeWidth="21" strokeLinecap="round"/>
            <path d="M119 194 L129 212 L115 228 L131 249 L116 272 L133 296 L123 316"
              fill="none" stroke="#a86c48" strokeWidth="6" opacity=".65" strokeLinecap="round"/>
            <path d="M299 192 L289 210 L304 228 L289 247 L305 271 L288 293 L299 316"
              fill="none" stroke="#a86c48" strokeWidth="6" opacity=".65" strokeLinecap="round"/>
            <rect x="113" y="316" width="24" height="11" rx="5" fill="#ecb27b" stroke="#845b42" strokeWidth="2"/>
            <rect x="287" y="315" width="24" height="11" rx="5" fill="#ecb27b" stroke="#845b42" strokeWidth="2"/>
          </g>
          <g fill="none" stroke="#593a2c" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
            <path d="M162 162 L154 156 M257 161 L266 156"/>
          </g>
          <g transform="translate(274 91)" aria-hidden="true">
            <circle r="8" fill="#f1c88b" stroke="#ae7652" strokeWidth="2"/>
            <circle r="3" fill="#fff3dc"/>
            <circle cx="10" cy="-4" r="4" fill="#e9b379"/>
          </g>
          <path d="M131 113 Q148 129 165 112 Q188 123 198 100 Q216 127 242 103 Q270 123 290 110" fill="none" stroke="#4c2d21" strokeWidth="11" strokeLinecap="round"/>
          {part('head',111,38,200,231)}
          <path onClick={e=>{e.stopPropagation();onInteract('head');}} d="M122 121 Q109 61 168 61 Q213 31 269 61 Q300 80 294 119" fill="transparent" stroke="transparent" strokeWidth="38" className="hair-hit"/>
          {part('mouth',183,208,55,40)}
        </g>
        {hit('feet',128,485,160,35,10)}
      </>}
    </g>
  </svg>;
}
