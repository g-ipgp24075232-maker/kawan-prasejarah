import type { AppData, AvatarSettings } from '../types';

export type DialogueSource =
  | { kind:'greeting' }
  | { kind:'unknown' }
  | { kind:'camera' }
  | { kind:'answer'; id:string }
  | { kind:'reaction'; area:keyof AvatarSettings['reactions'] }
  | { kind:'other' };

/** Updates only the currently displayed dialogue, never replaces a pupil's answer
 * with the welcome message unless the welcome message was already displayed. */
export function resolveDialogue(source:DialogueSource,data:AppData):
  {text:string;recording?:string}|null {
  switch(source.kind){
    case 'greeting': return {text:data.settings.greeting};
    case 'unknown': return {text:data.settings.unknownAnswer};
    case 'camera': return {text:data.site.cameraWaveVoice};
    case 'reaction': return {text:data.settings.reactions[source.area]};
    case 'answer': {
      const item=data.questions.find(q=>q.id===source.id);
      return item?{text:item.answerMS,recording:item.audioMS}:null;
    }
    case 'other':return null;
  }
}

/** A previously uploaded recording belongs to its original answer text.
 * Never silently read an edited answer using an obsolete recording. */
export function reconcileEditedAnswer<T extends {answerMS:string;audioMS?:string}>(
  previous:T|undefined,next:T
):{value:T;removedOutdatedRecording:boolean}{
  const outdated=Boolean(previous?.audioMS&&previous.answerMS!==next.answerMS&&previous.audioMS===next.audioMS);
  return {value:outdated?{...next,audioMS:undefined}:next,removedOutdatedRecording:outdated};
}
