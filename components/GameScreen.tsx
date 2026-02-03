
import React, { useState, useEffect, useRef } from 'react';
import { Word } from '../types';
import { speakWordPromise, stopAudio, triggerHaptic, generateVictoryGift } from '../geminiService';
import { getMeaning, getSynonyms, THEMES, loadLists, saveLists, PRACTICE_THEME } from '../store';

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
  const [isWorldComplete, setIsWorldComplete] = useState(false);
  const [victoryImage, setVictoryImage] = useState<string | null>(null);
  const [loadingGift, setLoadingGift] = useState(false);

  const isMounted = useRef(true);
  const currentWord = words[currentIndex];
  const theme = mode === 'repaso' ? PRACTICE_THEME : (THEMES[themeIndex] || THEMES[0]);
  const wordLength = currentWord?.original.length || 1;

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
    if (list && list.words.every(w => w.completed && w.errors === 0)) {
      setIsWorldComplete(true);
      setLoadingGift(true);
      const gift = await generateVictoryGift(list.name);
      if (isMounted.current) {
        setVictoryImage(gift);
        setLoadingGift(false);
        triggerHaptic('success');
      }
    } else {
      onExit();
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
        checkWorldCompletion();
      }
    }, 500);
  };

  if (isWorldComplete) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000" style={{ backgroundImage: victoryImage ? `url(${victoryImage})` : 'none', opacity: victoryImage ? 0.4 : 0 }}></div>
        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 mx-auto flex items-center justify-center text-5xl shadow-2xl animate-levitate">🏆</div>
          <div className="space-y-2">
            <h1 className="text-4xl font-elegant font-bold text-white tracking-widest uppercase">¡MAESTRÍA TOTAL!</h1>
            <p className="text-indigo-200 font-semibold tracking-wide">Has completado este mundo sin errores.</p>
          </div>
          
          {loadingGift && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Generando tu Postal de Victoria...</p>
            </div>
          )}

          {victoryImage && (
            <div className="animate-in zoom-in-95 duration-700 bg-white/10 backdrop-blur-md p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <img src={victoryImage} alt="Victory Gift" className="w-full h-auto rounded-[2rem] shadow-inner" />
            </div>
          )}

          <button onClick={onExit} className="w-full bg-white text-slate-900 py-5 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all">
            Volver al Mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-all duration-500 overflow-hidden ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} ${mode === 'repaso' ? 'opacity-100' : 'opacity-20'}`}></div>
      {mode !== 'repaso' && <div className={`absolute inset-0 ${theme.bg}`}></div>}
      {mode === 'repaso' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>}
      
      <button onClick={onExit} className={`fixed top-4 right-4 z-[100] w-10 h-10 ${mode === 'repaso' ? 'bg-white/10 text-white' : 'bg-white/40 text-slate-600'} backdrop-blur-md rounded-full shadow-sm active:scale-90 flex items-center justify-center font-bold`}>✕</button>

      <div className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-4 z-[100] flex gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 ${mode === 'repaso' ? 'bg-white/10' : 'bg-emerald-50/80'} backdrop-blur-md rounded-full border border-emerald-100 shadow-sm`}>
          <span className="text-emerald-500 font-bold">✓</span>
          <span className={`${mode === 'repaso' ? 'text-white' : 'text-emerald-700'} font-bold text-sm min-w-[12px] text-center`}>{sessionSuccesses}</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 ${mode === 'repaso' ? 'bg-white/10' : 'bg-amber-50/80'} backdrop-blur-md rounded-full border border-amber-100 shadow-sm`}>
          <span className="text-amber-500 font-bold">!</span>
          <span className={`${mode === 'repaso' ? 'text-white' : 'text-amber-700'} font-bold text-sm min-w-[12px] text-center`}>{sessionChallenges}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between h-full w-full py-4 relative z-10 safe-padding-top safe-padding-bottom">
        <div className="flex flex-col items-center w-full px-6 flex-1 justify-center relative">
          <button disabled={isAudioLocked} onClick={() => !isAudioLocked && (triggerHaptic('click'), speakWordPromise(currentWord.original, 'en-US', true))}
            className={`transition-all duration-500 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 
              ${showRevelation ? 'w-16 h-16 sm:w-20 sm:h-20 mb-4' : 'w-28 h-28 sm:w-36 sm:h-36 mb-6'}
              ${isAudioLocked ? 'opacity-40 scale-95' : 'active:scale-90 shadow-indigo-200/60 animate-glow-signal'}`}>
            <span className={`${showRevelation ? 'text-3xl' : 'text-6xl sm:text-7xl'}`}>🔊</span>
          </button>

          <div className={`${showRevelation ? 'min-h-[180px]' : 'min-h-[100px]'} flex items-center justify-center w-full transition-all duration-500`}>
            {showRevelation ? (
              <div className="animate-in fade-in zoom-in-95 duration-700 w-full px-4 text-center">
                <h2 className={`${mode === 'repaso' ? 'text-white' : 'text-slate-800'} font-elegant font-bold uppercase tracking-[0.15em] mb-2 drop-shadow-sm ${wordLength > 10 ? 'text-2xl' : 'text-4xl sm:text-6xl'}`}>
                  {currentWord.original}
                </h2>
                <div className={`${mode === 'repaso' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/70 border-white/80 text-slate-700'} backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-6 border shadow-xl max-w-sm mx-auto animate-levitate`}>
                  <p className="text-xl sm:text-2xl font-bold leading-tight mb-2">{getMeaning(currentWord.original)}</p>
                  {getSynonyms(currentWord.original) && (
                    <p className={`text-sm ${mode === 'repaso' ? 'text-indigo-200' : 'text-slate-400'} font-semibold flex items-center justify-center gap-2`}>
                      <span className="opacity-40">🔗</span> {getSynonyms(currentWord.original)}
                    </p>
                  )}
                </div>
              </div>
            ) : validationStatus === 'incorrect' && feedbackSymbol === 'none' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 px-8 py-3 bg-rose-100/90 backdrop-blur-sm rounded-full border border-rose-200 text-rose-600 font-bold text-lg shadow-md">
                ¡Escucha con atención!
              </div>
            )}
          </div>
        </div>

        <div className="w-full px-6 mb-6 flex justify-center pt-6">
          <div className="flex flex-nowrap justify-center w-full max-w-full items-center relative" style={{ gap: metrics.gap }}>
            {slots.map((char, i) => (
              <div key={i} onClick={() => handleSlotClick(i)}
                style={{ width: metrics.width, height: metrics.height, fontSize: metrics.fontSize }}
                className={`flex-shrink-0 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center font-bold transition-all duration-300 relative
                  ${char ? (validationStatus === 'incorrect' ? 'bg-rose-50 border-rose-200 text-rose-500' : validationStatus === 'correct' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : mode === 'repaso' ? 'bg-white/20 border-white/20 text-white shadow-lg' : 'bg-white border-slate-100 shadow-xl text-slate-800') : (mode === 'repaso' ? 'bg-white/5 border-dashed border-white/20' : 'bg-slate-900/5 border-dashed border-slate-300/40')}`}>
                {char?.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className={`w-full px-6 pb-12 flex flex-wrap gap-2.5 sm:gap-4 justify-center content-center min-h-[160px] transition-opacity duration-300 ${isAudioLocked && !showNextButton ? 'opacity-40' : 'opacity-100'}`}>
          {!showRevelation && availableLetters.map((letterObj, i) => (
            <button key={letterObj.id} onClick={() => handleLetterClick(letterObj, i)}
                className={`w-14 h-14 sm:w-20 sm:h-20 ${mode === 'repaso' ? 'bg-indigo-800 text-white border-indigo-950' : 'bg-white text-slate-800 border-slate-200'} rounded-2xl shadow-lg flex items-center justify-center text-3xl sm:text-4xl font-bold border-b-[6px] sm:border-b-[10px] active:border-b-0 active:translate-y-1 animate-in zoom-in-95`}>
              {letterObj.char.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {showNextButton && (
        <button onClick={nextWord} className={`fixed bottom-8 right-8 z-[110] w-20 h-20 ${mode === 'repaso' ? 'bg-indigo-500' : 'bg-emerald-500'} text-white rounded-full shadow-2xl flex items-center justify-center animate-in slide-in-from-right-20 active:scale-90 border-4 border-white/20`}>
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
