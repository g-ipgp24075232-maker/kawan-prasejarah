import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import type { Era, QuizItem } from '../types';
import { ERAS } from '../types';

interface Props { quizzes:QuizItem[]; onClose:()=>void; onRead:(message:string)=>void; onFeedback:(correct:boolean,message:string)=>void; }
export default function QuizPanel({quizzes,onClose,onRead,onFeedback}:Props){
  const [era,setEra]=useState<Era|'Semua'>('Semua');
  const [index,setIndex]=useState(0);
  const [answer,setAnswer]=useState<number|null>(null);
  const [score,setScore]=useState(0);
  const filtered=useMemo(()=>quizzes.filter(q=>era==='Semua'||q.era===era),[quizzes,era]);
  const question=filtered[index];
  const done=index>=filtered.length && filtered.length>0;
  useEffect(()=>{setIndex(0);setAnswer(null);setScore(0);},[era]);
  const pick=(option:number)=>{
    if(answer!==null||!question)return;
    setAnswer(option);const isCorrect=option===question.correctIndex;
    if(isCorrect)setScore(v=>v+1);
    onFeedback(isCorrect,(isCorrect?'Hebat! Jawapan kamu betul! ':'Cubaan yang bagus! ')+question.explanation);
  };
  return <div className="feature-backdrop"><section className="feature-modal quiz-modal" role="dialog" aria-modal="true" aria-label="Kuiz Ringkas">
    <button className="icon-button feature-close" onClick={onClose} aria-label="Tutup kuiz"><X/></button>
    <div className="feature-head"><span className="feature-icon">🏆</span><div><div className="eyebrow">CABARAN MINI</div><h2>Kuiz Rimba Purba</h2><p>Jawab soalan dan kumpul bintang bersama Aki!</p></div></div>
    <div className="quiz-topline"><select value={era} onChange={e=>setEra(e.target.value as Era|'Semua')}><option value="Semua">Semua Zaman</option>{ERAS.map(v=><option key={v}>{v}</option>)}</select><span><Trophy size={18}/> {score} bintang</span></div>
    {!question&&!done?<p className="empty-state">Tiada kuiz untuk kategori ini.</p>:done?<div className="quiz-finished"><div className="finish-sparkles"><Sparkles size={56}/></div><h3>Tahniah, penjelajah!</h3><p>Kamu berjaya menjawab <strong>{score} daripada {filtered.length}</strong> soalan.</p><button className="btn btn-primary" onClick={()=>{setIndex(0);setAnswer(null);setScore(0);}}><RotateCcw size={18}/> Cuba Lagi</button></div>:<>
      <div className="quiz-progress"><div style={{width:`${Math.round(index/Math.max(1,filtered.length)*100)}%`}}/></div>
      <div className="quiz-number">SOALAN {index+1} / {filtered.length} · ZAMAN {question.era.toUpperCase()}</div>
      <h3 className="quiz-question">{question.question}</h3>
      <button className="read-question" onClick={()=>onRead(question.question)}>🔊 Dengar Soalan</button>
      <div className="quiz-options">{question.options.map((option,i)=>{const isCorrect=i===question.correctIndex;const selected=answer===i;const reveal=answer!==null;
        return <button key={i} disabled={reveal} className={`quiz-option ${reveal&&isCorrect?'correct':''} ${reveal&&selected&&!isCorrect?'wrong':''}`} onClick={()=>pick(i)}>
          <span>{String.fromCharCode(65+i)}</span><strong>{option}</strong>{reveal&&isCorrect&&<Check size={20}/>}</button>;
      })}</div>
      {answer!==null&&<div className="quiz-explanation"><strong>{answer===question.correctIndex?'Betul! ⭐':'Teruskan mencuba! 🌱'}</strong><p>{question.explanation}</p><button className="btn btn-primary" onClick={()=>{setIndex(i=>i+1);setAnswer(null);}}>{index+1===filtered.length?'Lihat Keputusan':'Soalan Seterusnya'}<ArrowRight size={17}/></button></div>}
    </>}
    <button className="back-bottom" onClick={onClose}><ArrowLeft size={17}/> Kembali ke Aki</button>
  </section></div>;
}
