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

export interface SiteArt {
  image: string;
  left: number;
  top: number;
  width: number;
  opacity: number;
}
export interface SiteDesign {
  brandBefore: string; brandAccent: string; brandSubtitle: string;
  heroEyebrow: string; heroBefore: string; heroAfter: string; heroDescription: string;
  bubbleCaption: string; touchHint: string; chatTitle: string; chatDescription: string;
  questionCaption: string; placeholder: string; sendLabel: string;
  voiceTestLabel: string; repeatLabel: string; stopLabel: string; muteLabel: string; unmuteLabel: string;
  footerLabel: string; teacherLabel: string;
  cameraTitle: string; cameraDescription: string; cameraStart: string; cameraStop: string;
  cameraPrivacy: string; cameraReady: string; cameraDetected: string; cameraMissing: string; cameraWaveVoice: string;
  backgroundImage: string; brandLogoImage: string; bubbleArtImage: string;
  artLeft: SiteArt; artRight: SiteArt; artChat: SiteArt;
  backgroundColor: string; headerColor: string; chatColor: string; bubbleColor: string;
  accentColor: string; textColor: string; buttonColor: string;
  backgroundOverlay: number; backgroundPosition: string; fontFamily: string;
  fontScale: number; maxWidth: number; cornerRadius: number; heroSpacing: number;
  showCamera: boolean; showTouchHint: boolean; showVoiceControls: boolean; chatFirst: boolean;
}

export interface AppData {
  site: SiteDesign;
  version: 1;
  questions: KnowledgeItem[];
  quizzes: QuizItem[];
  settings: AvatarSettings;
}

export type Animation = 'idle' | 'listening' | 'thinking' | 'talking' | 'happy' |
  'laughing' | 'surprised' | 'confused' | 'jumping' | 'waving' | 'sleeping';
