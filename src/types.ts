export type Era = 'Paleolitik' | 'Mesolitik' | 'Neolitik' | 'Logam';
export const ERAS: Era[] = ['Paleolitik', 'Mesolitik', 'Neolitik', 'Logam'];

export interface KnowledgeItem {
  id: string;
  era: Era;
  question: string;
  alternatives: string[];
  keywords: string[];
  answerMS: string;
  /** Optional teacher-recorded human voice. Base64 audio, saved with the answer. */
  audioMS?: string;
  answerZH?: string;
  enabled: boolean;
}

export interface QuizItem {
  id: string;
  era: Era;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export type ArtPart = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'legs' | 'mouth';
export interface AvatarSettings {
  name: string;
  greeting: string;
  unknownAnswer: string;
  reactions: {
    head: string; belly: string; leftHand: string;
    rightHand: string; feet: string; face: string;
  };
  speechRate: number;
  preferredVoice: string;
  size: number;
  horizontalOffset: number;
  backgroundImage: string;
  skinColor: string;
  hairColor: string;
  clothingColor: string;
  fullArtwork: string;
  layers: Partial<Record<ArtPart, string>>;
  eraDescriptions: Record<Era, string>;
}

export interface AppData {
  version: 1;
  questions: KnowledgeItem[];
  quizzes: QuizItem[];
  settings: AvatarSettings;
}

export type Animation = 'idle' | 'listening' | 'thinking' | 'talking' | 'happy' |
  'laughing' | 'surprised' | 'confused' | 'jumping' | 'waving' | 'sleeping';
