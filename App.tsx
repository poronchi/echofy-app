
import React, { useState, useEffect } from 'react';
import ParentDashboard from './components/ParentDashboard';
import GameScreen from './components/GameScreen';
import { loadLists, prepareSession } from './store';
import { Word, GameSession } from './types';
import { triggerHaptic } from './geminiService';

const App: React.FC = () => {
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);

  useEffect(() => {
    // Configuración para que se sienta como App Nativa
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Bloquear pinch-zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => { 
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const handleStartGame = (listId: string, mode: 'normal' | 'repaso') => {
    const list = loadLists().find(l => l.id === listId);
    if (list) {
      triggerHaptic('success');
      setActiveSession({
        listId,
        words: prepareSession(list, mode),
        mode
      });
      setRole('child');
    }
  };

  const toggleRole = () => {
    triggerHaptic('click');
    setRole(role === 'parent' ? 'child' : 'parent');
  };

  const activeList = activeSession ? loadLists().find(l => l.id === activeSession.listId) : null;

  if (role === 'child' && activeSession && activeList) {
    return (
      <GameScreen 
        listId={activeSession.listId}
        words={activeSession.words}
        themeIndex={activeList.themeIndex}
        mode={activeSession.mode}
        onExit={() => { setActiveSession(null); setRole('child'); }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfe] text-slate-900 font-sans overflow-y-auto pb-40 safe-padding-top">
      <ParentDashboard role={role} onStartGame={handleStartGame} />
      
      <div className="fixed bottom-[calc(2.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[100] flex items-center gap-5 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-slate-100">
        <span className={`text-[10px] font-bold tracking-[0.2em] transition-colors ${role === 'parent' ? 'text-slate-900' : 'text-slate-300'}`}>PADRE</span>
        <button onClick={toggleRole}
          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${role === 'child' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${role === 'child' ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
        <span className={`text-[10px] font-bold tracking-[0.2em] transition-colors ${role === 'child' ? 'text-emerald-600' : 'text-slate-300'}`}>NIÑO</span>
      </div>
    </div>
  );
};

export default App;
