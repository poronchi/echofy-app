
import React, { useState, useEffect, useRef } from 'react';
import { VoiceSettings } from '../types';
import { loadVoiceSettings, saveVoiceSettings } from '../store';
import { isPremiumVoice, triggerHaptic, getCategorizedVoices } from '../geminiService';

const MOTIVATIONAL_PHRASES = [
  "You are a spelling superstar!",
  "Every word is a new discovery!",
  "Believe in yourself, you've got this!",
  "Learning is your superpower!",
  "Keep shining, one letter at a time!"
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSelected?: () => void;
}

const VoiceSelector: React.FC<Props> = ({ isOpen, onClose, onVoiceSelected }) => {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadVoiceSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const refreshVoices = () => {
    const { elite, backup, isLoading: loading } = getCategorizedVoices();
    const combined = [...elite, ...backup];
    setAvailableVoices(combined);
    setIsLoading(loading);
  };

  useEffect(() => {
    refreshVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Some browsers need a small delay or multiple checks
      const interval = setInterval(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          refreshVoices();
          clearInterval(interval);
        }
      }, 100);

      window.speechSynthesis.onvoiceschanged = () => {
        refreshVoices();
        clearInterval(interval);
      };

      return () => {
        clearInterval(interval);
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  useEffect(() => {
    if (showHelp && helpRef.current) {
      setTimeout(() => {
        helpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showHelp]);

  if (!isOpen) return null;

  const speakWithSettings = (text: string, voice?: SpeechSynthesisVoice) => {
    const targetVoice = voice || availableVoices.find(v => v.voiceURI === voiceSettings.voiceURI);
    if (!targetVoice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = targetVoice;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceChange = (voiceURI: string) => {
    triggerHaptic('click');
    const s = { ...voiceSettings, voiceURI };
    setVoiceSettings(s);
    saveVoiceSettings(s);
    
    const voice = availableVoices.find(v => v.voiceURI === voiceURI);
    if (voice) {
      speakWithSettings(MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)], voice);
    }
    if (onVoiceSelected) onVoiceSelected();
  };

  const handleSliderChange = (type: 'rate' | 'pitch', value: number) => {
    const s = { ...voiceSettings, [type]: value };
    setVoiceSettings(s);
    saveVoiceSettings(s);
  };

  const triggerSliderFeedback = (type: 'rate' | 'pitch') => {
    const text = type === 'rate' ? "Testing speed" : "Testing tone";
    speakWithSettings(text);
  };

  const currentVoice = availableVoices.find(v => v.voiceURI === voiceSettings.voiceURI);
  const cleanName = (name: string) => name.replace(/Microsoft|Google|English|United States|Android|Speech|Engine|en-US|\(.*\)/gi, '').trim();

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-elegant font-bold text-slate-800">Voz de Tutor</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configuración rápida</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center active:scale-90 transition-all">✕</button>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 pt-2 space-y-8 custom-scrollbar">
          {/* Custom Dropdown for Instant Feedback */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Seleccionar Voz</label>
            <div className="relative">
              <button 
                onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoading}
                className={`w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[15px] font-bold text-slate-700 flex items-center justify-between transition-all hover:border-slate-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="truncate">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      Cargando voces...
                    </span>
                  ) : (
                    <>
                      {currentVoice ? cleanName(currentVoice.name) : 'Elige una voz...'}
                      {currentVoice && isPremiumVoice(currentVoice) ? ' 🌟' : ''}
                    </>
                  )}
                </span>
                {!isLoading && (
                  <span className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 custom-scrollbar">
                  {availableVoices.map(v => (
                    <button
                      key={v.voiceURI}
                      onClick={() => {
                        handleVoiceChange(v.voiceURI);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full p-4 text-left text-sm font-bold border-b border-slate-50 last:border-0 transition-all flex items-center justify-between ${
                        voiceSettings.voiceURI === v.voiceURI ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cleanName(v.name)}</span>
                      {isPremiumVoice(v) && <span className="text-xs">🌟</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sliders - Horizontal Layout */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 space-y-3">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Vel. 🏃</label>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  {voiceSettings.rate < 0.5 ? 'Súper Lenta' : voiceSettings.rate.toFixed(1) + 'x'}
                </span>
              </div>
              <input 
                type="range" min="0.2" max="1.2" step="0.1" 
                value={voiceSettings.rate} 
                onChange={e => handleSliderChange('rate', parseFloat(e.target.value))}
                onMouseUp={() => triggerSliderFeedback('rate')}
                onTouchEnd={() => triggerSliderFeedback('rate')}
                className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 space-y-3">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Tono 🎵</label>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                  {voiceSettings.pitch.toFixed(1)}
                </span>
              </div>
              <input 
                type="range" min="0.5" max="1.5" step="0.1" 
                value={voiceSettings.pitch} 
                onChange={e => handleSliderChange('pitch', parseFloat(e.target.value))}
                onMouseUp={() => triggerSliderFeedback('pitch')}
                onTouchEnd={() => triggerSliderFeedback('pitch')}
                className="w-full accent-indigo-500 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Integrated Help Accordion */}
          <div className="pt-4" ref={helpRef}>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-slate-500 hover:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">💡</span>
                <span className="text-xs font-bold uppercase tracking-tight">¿No ves voces de alta calidad?</span>
              </div>
              <span className={`transition-transform duration-300 ${showHelp ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showHelp && (
              <div className="mt-4 p-4 bg-white border border-slate-100 rounded-2xl space-y-6 animate-in slide-in-from-top-2">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button onClick={() => setActiveTab('ios')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'ios' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}> iOS</button>
                  <button onClick={() => setActiveTab('android')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'android' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>🤖 Android</button>
                </div>

                <div className="space-y-4 text-[13px] text-slate-600 leading-relaxed">
                  {activeTab === 'ios' ? (
                    <>
                      <p>1. Ve a <b>Ajustes</b> &gt; <b>Accesibilidad</b>.</p>
                      <p>2. Toca <b>Contenido Leído</b> &gt; <b>Voces</b>.</p>
                      <p>3. Selecciona <b>Inglés (EE. UU.)</b>.</p>
                      <p>4. Descarga una voz <b>"Mejorada"</b> (ej: Samantha o Alex).</p>
                    </>
                  ) : (
                    <>
                      <p>1. Ve a <b>Ajustes</b> &gt; <b>Administración General</b>.</p>
                      <p>2. <b>Idioma y entrada</b> &gt; <b>Texto a voz</b>.</p>
                      <p>3. Asegura que el <b>Motor de Google</b> esté activo.</p>
                      <p>4. Descarga los <b>Datos de voz</b> para Inglés.</p>
                    </>
                  )}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-3">
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                      ⚠️ Importante: Tras descargar, intenta actualizar la lista o reinicia la App para ver los cambios.
                    </p>
                    <button 
                      onClick={() => {
                        setIsRefreshing(true);
                        triggerHaptic('success');
                        refreshVoices();
                        setTimeout(() => setIsRefreshing(false), 2000);
                      }}
                      disabled={isRefreshing}
                      className={`w-full py-2.5 bg-white border border-amber-200 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${isRefreshing ? 'opacity-75' : ''}`}
                    >
                      {isRefreshing ? (
                        <>
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                          Buscando nuevas voces...
                        </>
                      ) : (
                        <>🔄 Actualizar lista de voces</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-50">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
