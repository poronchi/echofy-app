
import React, { useState, useEffect, useRef } from 'react';
import { Word } from '../types';
import { speakWordPromise, stopAudio, triggerHaptic } from '../geminiService';
import { getMeaning, getSynonyms, THEMES, loadLists, saveLists, PRACTICE_THEME, isListFullyCompleted, addStar, loadStars } from '../store';

interface Props {
  listId: string;
  words: Word[];
  themeIndex: number;
  mode: 'normal' | 'repaso';
  onExit: () => void;
}

const GameScreen: React.FC<Props> = ({ listId, words, themeIndex, mode, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{char: string, id: string}[]>([]);
  const [showRevelation, setShowRevelation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAudioLocked, setIsAudioLocked] = useState(true);
  const [validationStatus, setValidationStatus] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [feedbackSymbol, setFeedbackSymbol] = useState<'check' | 'alert' | 'none'>('none');
  const [showNextButton, setShowNextButton] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [sessionSuccesses, setSessionSuccesses] = useState(0);
  const [sessionChallenges, setSessionChallenges] = useState(0);
  
  // Estado para la Victoria Final del Mundo
  const [showConquestStar, setShowConquestStar] = useState(false);
  // Estado para completar una sesión normal
  const [showSessionComplete, setShowSessionComplete] = useState(false);

  // Estado visual de guardado
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [isAlreadyConquered, setIsAlreadyConquered] = useState(false);

  const isMounted = useRef(true);
  const currentWord = words[currentIndex];
  // Unificamos la lógica del tema: siempre se usa el gradiente completo.
  const theme = mode === 'repaso' ? PRACTICE_THEME : (THEMES[themeIndex] || THEMES[0]);
  const wordLength = currentWord?.original.length || 1;

  useEffect(() => {
    const stars = loadStars();
    // Solo marcamos como "ya conquistado" si NO estamos en modo repaso.
    // Si es repaso, queremos jugar aunque ya tenga estrella.
    if (stars.includes(listId) && mode !== 'repaso') {
      setIsAlreadyConquered(true);
    }
  }, [listId, mode]);

  const showConquestState = isAlreadyConquered || showConquestStar || showSessionComplete;

  const calculateSlotMetrics = () => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
    const padding = 48;
    const availableWidth = screenWidth - padding;
    const gap = wordLength > 8 ? 4 : 8;
    const maxSlotWidth = (availableWidth - (gap * (wordLength - 1))) / wordLength;
    const finalWidth = Math.min(80, Math.max(28, maxSlotWidth));
    const finalHeight = finalWidth * 1.3;
    const fontSize = finalWidth * 0.65;
    return { width: `${finalWidth}px`, height: `${finalHeight}px`, fontSize: `${fontSize}px`, gap: `${gap}px` };
  };

  const metrics = calculateSlotMetrics();

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; stopAudio(); };
  }, []);

  const initWord = async () => {
    if (!currentWord) return;
    setIsAudioLocked(true); setShowRevelation(false);
    setValidationStatus('none'); setFeedbackSymbol('none'); setShowNextButton(false); setIsTransitioning(false); setAttempts(0);

    const chars = currentWord.original.split('').map(c => ({ char: c, id: Math.random().toString() }));
    let shuffled = [...chars].sort(() => Math.random() - 0.5);
    while(shuffled.map(s => s.char).join('') === currentWord.original && chars.length > 1) {
      shuffled = [...chars].sort(() => Math.random() - 0.5);
    }
    
    setSlots(new Array(currentWord.original.length).fill(null));
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!isMounted.current) return;
    setAvailableLetters(shuffled);
    try { await speakWordPromise(currentWord.original, 'en-US', true); } catch (e) {}
    if (isMounted.current) { setIsAudioLocked(false); }
  };

  useEffect(() => { initWord(); }, [currentIndex, listId]);

  const handleLetterClick = async (letterObj: {char: string, id: string}, index: number) => {
    if (isAudioLocked || validationStatus === 'correct') return;
    const nextEmpty = slots.indexOf(null);
    if (nextEmpty !== -1) {
      triggerHaptic('click');
      setIsAudioLocked(true);
      const newSlots = [...slots]; newSlots[nextEmpty] = letterObj.char; setSlots(newSlots);
      const newAvailable = [...availableLetters]; newAvailable.splice(index, 1); setAvailableLetters(newAvailable);
      try { await speakWordPromise(letterObj.char, 'en-US', true); } catch(e) {}
      if (newSlots.indexOf(null) === -1) handleCompletion(newSlots); else setIsAudioLocked(false);
    }
  };

  const handleSlotClick = (index: number) => {
    if (isAudioLocked || validationStatus === 'correct' || slots[index] === null) return;
    triggerHaptic('click');
    const char = slots[index]!;
    const newSlots = [...slots]; newSlots[index] = null; setSlots(newSlots);
    setValidationStatus('none'); setFeedbackSymbol('none'); setAvailableLetters([...availableLetters, { char, id: Math.random().toString() }]);
  };

  const handleCompletion = async (currentSlots: (string | null)[]) => {
    const constructed = currentSlots.join('').toLowerCase();
    const isActuallyCorrect = constructed === currentWord.original.toLowerCase();
    setIsAudioLocked(true); 

    if (isActuallyCorrect) {
      triggerHaptic('success');
      setValidationStatus('correct');
      setFeedbackSymbol('check');
      setSessionSuccesses(prev => prev + 1);
      updatePersistentStats(attempts === 0 ? 0 : 1);
      await playSuccessSequence();
    } else {
      triggerHaptic('error');
      setFeedbackSymbol('alert');
      const newAttemptCount = attempts + 1;
      setAttempts(newAttemptCount);
      setValidationStatus('incorrect');
      setSessionChallenges(prev => prev + 1);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (!isMounted.current) return;
      
      if (newAttemptCount === 1) {
        setSlots(new Array(currentWord.original.length).fill(null));
        setAvailableLetters(currentSlots.map(s => ({ char: s!, id: Math.random().toString() })));
        setValidationStatus('none'); setFeedbackSymbol('none'); setIsAudioLocked(false);
      } else {
        updatePersistentStats(2);
        await playSuccessSequence();
      }
    }
  };

  const updatePersistentStats = (finalErrorLevel: number) => {
    const lists = loadLists();
    const list = lists.find(l => l.id === listId);
    if (list) {
      const word = list.words.find(w => w.original === currentWord.original);
      if (word) {
        word.errors = finalErrorLevel;
        if (finalErrorLevel === 0) word.successes = (word.successes || 0) + 1;
        word.completed = true;
        saveLists(lists);
        
        // Trigger Saved Indicator
        setShowSavedIndicator(true);
        setTimeout(() => setShowSavedIndicator(false), 2000);
      }
    }
  };

  const playSuccessSequence = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (!isMounted.current) return;
    setFeedbackSymbol('none');
    setShowRevelation(true);
    try {
      await speakWordPromise(currentWord.original, 'en-US', true);
      await new Promise(resolve => setTimeout(resolve, 400));
      for (const char of currentWord.original.split('')) {
        if (!isMounted.current) return;
        await speakWordPromise(char, 'en-US', false);
      }
      await new Promise(resolve => setTimeout(resolve, 400));
      await speakWordPromise(currentWord.original, 'en-US', false);
    } catch(e) {}
    if (isMounted.current) { setShowNextButton(true); setIsAudioLocked(false); }
  };

  const checkWorldCompletion = async () => {
    const lists = loadLists();
    const list = lists.find(l => l.id === listId);
    
    // Aseguramos que la pantalla sea visible para la celebración
    setIsTransitioning(false);

    if (list && list.words.every(w => w.completed && w.errors === 0)) {
      addStar(listId);
      setShowConquestStar(true);
      triggerHaptic('success');
      setTimeout(() => {
        if (isMounted.current) onExit();
      }, 4000);
    } else {
      // En lugar de salir inmediatamente (pantalla blanca), mostramos celebración de sesión
      setShowSessionComplete(true);
      triggerHaptic('success');
      setTimeout(() => {
        if (isMounted.current) onExit();
      }, 3000);
    }
  };

  const nextWord = () => {
    triggerHaptic('click');
    setIsTransitioning(true);
    setTimeout(() => {
      if (!isMounted.current) return;
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Al terminar la sesión, comprobamos si la lista completa está terminada
        if (isListFullyCompleted(listId)) {
          // Aseguramos que la pantalla sea visible para la celebración
          setIsTransitioning(false);
          addStar(listId);
          setShowConquestStar(true);
          triggerHaptic('success');
          // Esperamos a que el niño vea la estrella antes de salir
          setTimeout(() => {
            if (isMounted.current) onExit();
          }, 4000);
        } else {
          checkWorldCompletion();
        }
      }
    }, 500);
  };



  return (
    <div className={`fixed inset-0 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-all duration-500 overflow-hidden ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      
      {/* FONDO: Gradiente completo siempre, para coincidir con la lista seleccionada */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`}></div>
      {/* Capa de textura y oscurecimiento para garantizar que el texto blanco se lea */}
      <div className={`absolute inset-0 bg-black/10 mix-blend-overlay ${mode === 'repaso' ? "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" : ""}`}></div>
      
      <button onClick={onExit} className={`fixed top-4 right-4 z-[100] w-10 h-10 backdrop-blur-md rounded-full active:scale-90 flex items-center justify-center font-bold border transition-all ${themeIndex === 8 ? 'bg-black/10 text-slate-800 border-black/10 shadow-md' : 'bg-white/10 text-white border-white/10 shadow-sm'}`}>
        <span className="drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.3)]">✕</span>
      </button>

      {/* INDICADOR DE GUARDADO AUTOMÁTICO */}
      {showSavedIndicator && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[150] px-4 py-1.5 bg-emerald-500/90 backdrop-blur-md rounded-full border border-emerald-400/50 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Progreso Guardado</span>
            </div>
        </div>
      )}

      <div className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-4 z-[100] flex gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-md rounded-full border shadow-sm ${themeIndex === 8 ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20'}`}>
          <span className="text-emerald-400 font-bold drop-shadow-sm">✓</span>
          <span className={`${themeIndex === 8 ? 'text-slate-800' : 'text-white'} font-bold text-sm min-w-[12px] text-center drop-shadow-sm`}>{sessionSuccesses}</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-md rounded-full border shadow-sm ${themeIndex === 8 ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20'}`}>
          <span className="text-amber-400 font-bold drop-shadow-sm">!</span>
          <span className={`${themeIndex === 8 ? 'text-slate-800' : 'text-white'} font-bold text-sm min-w-[12px] text-center drop-shadow-sm`}>{sessionChallenges}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between h-full w-full py-4 relative z-10 safe-padding-top safe-padding-bottom">
        {showConquestState && (
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[...Array(25)].map((_, i) => (
               <div key={i} className="absolute top-[-10%] animate-confetti opacity-60" 
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDuration: `${3 + Math.random() * 3}s`,
                      animationDelay: `${Math.random() * 2}s`,
                      backgroundColor: Math.random() > 0.6 ? '#FDE68A' : '#FFFFFF',
                      width: `${6 + Math.random() * 6}px`,
                      height: `${6 + Math.random() * 6}px`,
                      borderRadius: Math.random() > 0.5 ? '50%' : '2px'
                    }} 
               />
             ))}
             <style>{`
               @keyframes confetti {
                 0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
               }
               .animate-confetti { animation: confetti linear infinite; }
               .ease-out-back { transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275); }
             `}</style>
           </div>
        )}

        <div className="flex flex-col items-center w-full px-6 flex-1 justify-center relative">
          <button disabled={isAudioLocked && !showConquestState} onClick={() => (!isAudioLocked || showConquestState) && (triggerHaptic('click'), speakWordPromise(currentWord.original, 'en-US', true))}
            className={`transition-all duration-500 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl border-4 border-white/30 
              ${showRevelation ? 'w-16 h-16 sm:w-20 sm:h-20 mb-4' : 'w-28 h-28 sm:w-36 sm:h-36 mb-6'}
              ${(isAudioLocked && !showConquestState) ? 'opacity-40 scale-95' : 'active:scale-90 shadow-white/20 animate-glow-signal'}
              ${themeIndex === 8 ? 'text-slate-400' : 'text-white'}`}>
            <span className={`${showRevelation ? 'text-3xl' : 'text-6xl sm:text-7xl'} filter drop-shadow-md`}>🔊</span>
          </button>

          {showConquestState ? (
            <div className="flex flex-col items-center justify-center w-full animate-in zoom-in-90 duration-700 ease-out-back relative mt-4">
              <div className="relative">
                <svg viewBox="0 0 24 24" className="w-48 h-48 sm:w-64 sm:h-64 drop-shadow-[0_0_40px_rgba(251,191,36,0.5)] text-amber-300" fill="currentColor">
                   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="mt-6 text-center space-y-3 animate-in slide-in-from-bottom-5 delay-200 relative z-10">
                <h2 className="text-4xl sm:text-5xl font-elegant font-bold text-white tracking-widest uppercase drop-shadow-md">
                  {showConquestStar || isAlreadyConquered ? '¡COMPLETADO!' : '¡BIEN HECHO!'}
                </h2>
              </div>
            </div>
          ) : (
            <>
              <div className={`${showRevelation ? 'min-h-[180px]' : 'min-h-[100px]'} flex items-center justify-center w-full transition-all duration-500`}>
                {showRevelation ? (
                  <div className="animate-in fade-in zoom-in-95 duration-700 w-full px-4 text-center">
                    <h2 className={`${themeIndex === 8 ? 'text-slate-800' : 'text-white'} font-elegant font-bold uppercase tracking-[0.15em] mb-2 drop-shadow-lg ${wordLength > 10 ? 'text-2xl' : 'text-4xl sm:text-6xl'}`}>
                      {currentWord.original}
                    </h2>
                    <div className={`bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-6 border border-white/20 shadow-2xl max-w-sm mx-auto animate-levitate ${themeIndex === 8 ? 'text-slate-700' : 'text-white'}`}>
                      <p className="text-[15px] sm:text-[17px] font-bold leading-tight mb-2 drop-shadow-sm">{getMeaning(currentWord.original)}</p>
                      {getSynonyms(currentWord.original) && (
                        <p className={`text-sm ${themeIndex === 8 ? 'text-slate-500' : 'text-white/70'} font-semibold flex items-center justify-center gap-2`}>
                          <span className="opacity-40">🔗</span> {getSynonyms(currentWord.original)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : validationStatus === 'incorrect' && feedbackSymbol === 'none' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 px-8 py-3 bg-rose-500/80 backdrop-blur-md rounded-full border border-rose-400/50 text-white font-bold text-[15px] sm:text-[17px] shadow-lg">
                    ¡Escucha con atención!
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!showConquestState && (
          <>
            <div className="w-full px-6 mb-6 flex justify-center pt-6">
              <div className="flex flex-nowrap justify-center w-full max-w-full items-center relative" style={{ gap: metrics.gap }}>
                {slots.map((char, i) => (
                  <div key={i} onClick={() => handleSlotClick(i)}
                    style={{ width: metrics.width, height: metrics.height, fontSize: metrics.fontSize }}
                    className={`flex-shrink-0 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center font-bold transition-all duration-300 relative shadow-lg backdrop-blur-md
                      ${char ? (validationStatus === 'incorrect' ? 'bg-rose-500 text-white border-rose-400' : validationStatus === 'correct' ? 'bg-emerald-500 text-white border-emerald-400' : (themeIndex === 8 ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/20 border-white/40 text-white')) : (themeIndex === 8 ? 'bg-slate-100 border-dashed border-slate-300' : 'bg-black/10 border-dashed border-white/20')}`}>
                    <span className="drop-shadow-sm">{char?.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`w-full px-6 pb-12 flex flex-wrap gap-2.5 sm:gap-4 justify-center content-center min-h-[160px] transition-opacity duration-300 ${isAudioLocked && !showNextButton ? 'opacity-40' : 'opacity-100'}`}>
              {!showRevelation && availableLetters.map((letterObj, i) => (
                <button key={letterObj.id} onClick={() => handleLetterClick(letterObj, i)}
                    className={`w-14 h-14 sm:w-20 sm:h-20 bg-white/95 text-slate-800 border-b-[6px] border-slate-200 rounded-2xl shadow-xl flex items-center justify-center text-3xl sm:text-4xl font-bold active:border-b-0 active:translate-y-1 animate-in zoom-in-95`}>
                  {letterObj.char.toUpperCase()}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {showNextButton && (
        <button onClick={nextWord} className="fixed bottom-8 right-8 z-[110] w-20 h-20 bg-white text-indigo-600 rounded-full shadow-2xl flex items-center justify-center animate-in slide-in-from-right-20 active:scale-90 border-4 border-indigo-100">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      )}


    </div>
  );
};

export default GameScreen;
