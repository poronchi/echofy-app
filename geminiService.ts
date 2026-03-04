
import { GoogleGenAI } from "@google/genai";
import { loadVoiceSettings } from "./store";

// --- GESTIÓN DE AUDIO NATIVO ---

export const stopAudio = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Emite una vibración física sutil si el dispositivo lo permite.
 */
export const triggerHaptic = (type: 'success' | 'error' | 'click') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    switch (type) {
      case 'success': navigator.vibrate(50); break;
      case 'error': navigator.vibrate([100, 50, 100]); break;
      case 'click': navigator.vibrate(10); break;
    }
  }
};

/**
 * Detecta si una voz es de alta calidad.
 */
export const isPremiumVoice = (voice: SpeechSynthesisVoice): boolean => {
  const name = voice.name.toLowerCase();
  const uri = voice.voiceURI.toLowerCase();
  return (
    name.includes('premium') || 
    name.includes('enhanced') || 
    name.includes('natural') || 
    name.includes('neural') ||
    name.includes('siri') || 
    name.includes('google') ||
    name.includes('ava') || 
    name.includes('samantha') ||
    uri.includes('premium') ||
    uri.includes('enhanced')
  );
};

export const getCategorizedVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return { elite: [], backup: [], isLoading: true };
  
  const allVoices = window.speechSynthesis.getVoices();
  if (allVoices.length === 0) return { elite: [], backup: [], isLoading: true };

  // Filter for English voices (primarily US/GB)
  const englishVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('en'));
  
  // Deduplicate by voiceURI
  const uniqueVoices = Array.from(new Map(englishVoices.map(v => [v.voiceURI, v])).values());
  
  const elite: SpeechSynthesisVoice[] = [];
  const backup: SpeechSynthesisVoice[] = [];

  uniqueVoices.forEach(v => {
    if (isPremiumVoice(v)) elite.push(v);
    else backup.push(v);
  });

  // Sort elite by quality keywords
  elite.sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) => {
      const n = v.name.toLowerCase();
      if (n.includes('enhanced')) return 10;
      if (n.includes('premium')) return 9;
      if (n.includes('neural')) return 8;
      if (n.includes('natural')) return 7;
      if (n.includes('siri')) return 6;
      return 5;
    };
    return score(b) - score(a);
  });

  // Only keep the top 2 backup voices as requested
  return { 
    elite, 
    backup: backup.slice(0, 2),
    isLoading: false
  };
};

const getBestVoice = (settings: ReturnType<typeof loadVoiceSettings>): { voice: SpeechSynthesisVoice | null } => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return { voice: null };
  const voices = window.speechSynthesis.getVoices();
  if (settings.voiceURI) {
    const userVoice = voices.find(v => v.voiceURI === settings.voiceURI);
    if (userVoice) return { voice: userVoice };
  }
  const { elite, backup } = getCategorizedVoices();
  if (elite.length > 0) return { voice: elite[0] };
  if (backup.length > 0) return { voice: backup[0] };
  return { voice: voices.find(v => v.lang.startsWith('en')) || null };
};

export const speakWordPromise = (word: string, lang: string = 'en-US', interrupt: boolean = true): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { resolve(); return; }
    if (interrupt) window.speechSynthesis.cancel();

    const settings = loadVoiceSettings();
    const { voice } = getBestVoice(settings);
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US'; 

    if (voice) {
      utterance.voice = voice;
      const isRobot = !isPremiumVoice(voice) || voice.name.toLowerCase().includes('compact');
      const isSingleLetter = word.length === 1;

      if (isRobot) {
        utterance.rate = isSingleLetter ? 0.65 : 0.85; 
        utterance.pitch = 0.95; 
      } else {
        utterance.rate = isSingleLetter ? 0.6 : settings.rate; 
        utterance.pitch = settings.pitch;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};


