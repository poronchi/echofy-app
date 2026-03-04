
import React, { useState, useEffect, useRef } from 'react';
import { WordList, VoiceSettings, Word } from '../types';
import { loadLists, saveLists, extractWords, loadVoiceSettings, saveVoiceSettings, getMeaning, THEMES, resetListProgress, PRACTICE_THEME, getBackupData, restoreBackupData, initPersistence, isSystemClean, loadStars } from '../store';
import { getCategorizedVoices, isPremiumVoice, speakWordPromise, triggerHaptic } from '../geminiService';
import VoiceSelector from './VoiceSelector';

interface Props {
  onStartGame: (listId: string, mode: 'normal' | 'repaso') => void;
  role: 'parent' | 'child';
  onModalStateChange: (isOpen: boolean) => void;
}

const ParentDashboard: React.FC<Props> = ({ onStartGame, role, onModalStateChange }) => {
  const [lists, setLists] = useState<WordList[]>([]);
  const [stars, setStars] = useState<string[]>([]);
  const [newListName, setNewListName] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);

  // Estado para Borrado en 2 Pasos
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Estado para Guardado en 2 Pasos (Edición)
  const [saveConfirm, setSaveConfirm] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Estado para Reinicio en 2 Pasos (Edición)
  const [resetConfirm, setResetConfirm] = useState(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState(false);
  const [isTallerOpen, setIsTallerOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadVoiceSettings());
  const [categorizedVoices, setCategorizedVoices] = useState<{elite: SpeechSynthesisVoice[], backup: SpeechSynthesisVoice[]}>({elite: [], backup: []});

  // Estado para Configuración / Backup
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRecoveryAlert, setShowRecoveryAlert] = useState(false);

  // Estado para Modo Desarrollador (Easter Egg)
  const [isDevMode, setIsDevMode] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Estado para Toasts (Notificaciones)
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info'} | null>(null);

  // Estado para el tema dinámico de la cabecera
  const [headerThemeIndex, setHeaderThemeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeaderThemeIndex(prev => (prev + 1) % THEMES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 1. Pedir al navegador que no borre datos
    initPersistence();

    // 2. Cargar datos iniciales
    setLists(loadLists());
    setStars(loadStars());

    // 3. Detectar si estamos en "Amensia" (fábrica) para mostrar alerta
    if (isSystemClean()) {
        setShowRecoveryAlert(true);
    }

    const loadVoices = () => setCategorizedVoices(getCategorizedVoices());
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Notificar a App.tsx si algún modal está abierto
  useEffect(() => {
    const isAnyModalOpen = isAdding || !!viewingReportId || isVoiceStudioOpen || isSettingsOpen || isAchievementsOpen;
    onModalStateChange(isAnyModalOpen);
  }, [isAdding, viewingReportId, isVoiceStudioOpen, isSettingsOpen, isAchievementsOpen, onModalStateChange]);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveList = () => {
    if (!newListName || !inputText) return;

    // Si es edición, pedimos confirmación en 2 pasos
    if (editingListId && !saveConfirm) {
      setSaveConfirm(true);
      triggerHaptic('click');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveConfirm(false), 3000);
      return;
    }

    const updatedLists = editingListId 
      ? lists.map(l => l.id === editingListId ? { ...l, name: newListName, themeIndex: selectedTheme, words: mergeWords(l.words, extractWords(inputText)) } : l)
      : [...lists, { id: Math.random().toString(36).substr(2, 9), name: newListName, themeIndex: selectedTheme, words: extractWords(inputText), settings: { rainEnabled: true }, lastPlayed: Date.now() }];
    
    setLists(updatedLists);
    saveLists(updatedLists);
    resetForm();
    setShowRecoveryAlert(false); // Si crea una lista nueva, ya no mostramos alerta
    showToast(editingListId ? "Mundo actualizado" : "Aventura creada");
  };

  const handleDeleteList = (id: string) => {
    if (deleteConfirmId === id) {
      // Segundo toque: Confirmado
      const updated = lists.filter(l => l.id !== id);
      setLists(updated);
      saveLists(updated);
      resetForm();
      showToast("Aventura eliminada", "info");
      setDeleteConfirmId(null);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    } else {
      // Primer toque: Armar confirmación
      setDeleteConfirmId(id);
      triggerHaptic('click');
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = setTimeout(() => {
        setDeleteConfirmId(null);
      }, 3000); // 3 segundos para confirmar
    }
  };

  const handleResetProgress = (id: string) => {
    if (resetConfirm) {
      const updated = resetListProgress(id);
      setLists(updated);
      setStars(loadStars()); // Recargar estrellas tras el reset
      showToast("Progreso reiniciado");
      setResetConfirm(false);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    } else {
      setResetConfirm(true);
      triggerHaptic('click');
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  // --- LOGICA DE BACKUP ---
  const handleExportBackup = () => {
    const data = getBackupData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `echofy_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Copia descargada", "info");
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (restoreBackupData(content)) {
        setLists(loadLists());
        setVoiceSettings(loadVoiceSettings());
        showToast("Datos restaurados correctamente");
        setIsSettingsOpen(false);
        setShowRecoveryAlert(false); // Ocultar alerta si se restauró con éxito
      } else {
        alert("El archivo no es válido o está dañado.");
      }
    };
    reader.readAsText(file);
    // Limpiar input para permitir seleccionar el mismo archivo de nuevo si falla
    e.target.value = ''; 
  };
  // -------------------------

  const mergeWords = (oldWords: Word[], newWords: Word[]): Word[] => {
    return newWords.map(nw => {
      const match = oldWords.find(ow => ow.original === nw.original);
      return match ? match : nw;
    });
  };

  const resetForm = () => {
    setNewListName(''); setInputText(''); setEditingListId(null); setIsAdding(false); setSelectedTheme(0);
    setSaveConfirm(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setDeleteConfirmId(null);
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    setResetConfirm(false);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  };

  const openNewListModal = () => {
    setNewListName(''); 
    setInputText(''); 
    setEditingListId(null); 
    setSelectedTheme(0);
    setIsAdding(true);
  };

  const currentVoice = [...categorizedVoices.elite, ...categorizedVoices.backup].find(v => v.voiceURI === voiceSettings.voiceURI);
  
  const getVoiceDisplayName = () => {
    if (!currentVoice) return "Voz Narrador";
    return currentVoice.name.replace(/Microsoft|Google|English|United States|Android|Speech|Engine|en-US|\(.*\)/gi, '').trim();
  };

  const handleTouchStart = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setIsDevMode(prev => !prev);
      triggerHaptic('success');
      showToast(isDevMode ? "Modo Editor Oculto" : "Modo Editor Activo", "info");
    }, 6000); // 6 segundos
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const renderParentView = () => (
    <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-700 min-h-0">
      {/* 1. CABECERA HEROICA REFINADA */}
      <div className="text-center px-6 pt-2 space-y-4 flex-shrink-0">
        <p className="text-slate-400 text-[13px] sm:text-[15px] leading-relaxed max-w-xs mx-auto font-medium">
          ¡Aprender a deletrear es una gran aventura! Tu hijo juega y conquista palabras a su propio ritmo, mientras tú celebras cada victoria y monitoreas su camino hacia la maestría.
        </p>
        <p className="text-indigo-400/80 text-[12px] sm:text-[14px] font-bold italic tracking-wide">
          ¡Aquí el error es solo el primer paso para ganar! 🚀🏆
        </p>
      </div>

      {/* 2. ESPACIO CENTRAL - LLAMADO A LA AVENTURA (ESTÁTICO) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 overflow-hidden select-none pointer-events-none">
        <div className="flex flex-col items-center justify-center py-8 flex-shrink-0">
           <div className="text-7xl mb-6 animate-levitate drop-shadow-2xl">✨</div>
           <div className="space-y-2 text-center">
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 opacity-40">
               El viaje del héroe
             </p>
             <p className="text-[10px] font-medium italic text-slate-300 opacity-30 tracking-widest">
               Tu hazaña comienza con una palabra...
             </p>
           </div>
        </div>
      </div>

      {/* 3. PANEL DE CONTROL FLOTANTE (VOZ, TALLER, HISTORIAL) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40 animate-in slide-in-from-bottom-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-3">
          {/* BOTÓN VOZ */}
          <button onClick={() => setIsVoiceStudioOpen(true)} 
                  className="bg-white/50 py-3 rounded-2xl border border-slate-100/50 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-white">
            <span className="text-xl">🔊</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">VOZ</span>
          </button>

          {/* BOTÓN TALLER */}
          <button onClick={() => setIsTallerOpen(true)} 
                  className={`py-3 rounded-2xl border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-white ${isTallerOpen ? 'bg-indigo-50/50 border-indigo-100 text-indigo-600' : 'bg-white/50 border-slate-100/50 text-slate-400'}`}>
            <span className="text-xl">📦</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">TALLER</span>
          </button>

          {/* BOTÓN HISTORIAL */}
          <button onClick={() => setIsAchievementsOpen(true)} 
                  className="bg-white/50 py-3 rounded-2xl border border-slate-100/50 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:bg-white">
            <span className="text-xl">🏆</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500">HISTORIAL</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderChildView = () => {
    // Buscar si hay alguna palabra en alguna lista que tenga errores (Modo Práctica disponible)
    const listsWithErrors = lists.filter(l => l.words.some(w => (w.errors || 0) > 0));
    const totalErrors = listsWithErrors.reduce((acc, l) => acc + l.words.filter(w => (w.errors || 0) > 0).length, 0);

    return (
      <div className="flex-1 overflow-y-auto scrollbar-hide px-1 pb-48 animate-in fade-in duration-700 space-y-6">
        {/* ISLA DE PRÁCTICA - Solo visible si hay deudas de aprendizaje */}
        {totalErrors > 0 && (
          <div onClick={() => onStartGame(listsWithErrors[0].id, 'repaso')}
            className="w-full p-6 rounded-[3rem] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 shadow-2xl relative overflow-hidden group active:scale-95 transition-all mb-4 cursor-pointer border border-white/10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-3xl shadow-lg border border-white/10 animate-levitate">✨</div>
                <div>
                  <h2 className="text-[15px] sm:text-[17px] font-bold text-white tracking-tight">Misión de Maestro</h2>
                  <p className="text-indigo-200 text-sm font-semibold">{totalErrors} retos por vencer</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-white font-bold animate-pulse border border-white/10">
                ➜
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {lists.map((list, i) => {
            const logros = list.words.filter(w => w.completed && (w.errors || 0) === 0).length;
            const retos = list.words.filter(w => (w.errors || 0) > 0).length;
            const progress = (logros / list.words.length) * 100;
            const theme = THEMES[list.themeIndex] || THEMES[0];
            const hasStar = stars.includes(list.id);
            
            return (
              <div key={list.id} onClick={() => onStartGame(list.id, 'normal')}
                   className="relative aspect-square p-4 rounded-[2rem] shadow-xl transition-all active:scale-[0.95] group overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} transition-transform group-hover:scale-110`}></div>
                <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
                
                {/* ESTRELLA HOLOGRÁFICA CENTRAL - "Sello de Conquista" - VERSIÓN ZEN */}
                {hasStar && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none overflow-hidden">
                    {/* Estrella estática, sutil y elegante */}
                    <svg viewBox="0 0 24 24" className="w-40 h-40 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] opacity-90" style={{ mixBlendMode: 'overlay' }}>
                      <defs>
                        <linearGradient id={`starZen-${list.id}`} x1="50%" y1="0%" x2="50%" y2="100%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.4" />
                        </linearGradient>
                      </defs>
                      <path fill={`url(#starZen-${list.id})`} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}

                {/* Indicadores de Logros/Retos en esquina superior derecha */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-20">
                  {logros > 0 && (
                    <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 flex items-center gap-1 shadow-sm">
                      <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Logros</span>
                      <span className="text-[10px] font-black text-white">{logros}</span>
                    </div>
                  )}
                  {retos > 0 && (
                    <div className="bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5 flex items-center gap-1 shadow-sm">
                      <span className="text-[9px] font-bold text-white/80 uppercase tracking-tighter">Retos</span>
                      <span className="text-[10px] font-black text-white">{retos}</span>
                    </div>
                  )}
                </div>

                {/* Estructura Bento / App Card */}
                <div className="relative h-full flex flex-col items-center justify-center z-10 p-2">
                  {/* Icono en esquina superior izquierda (estilo app) - ABEJA LIBRE */}
                  {!hasStar && (
                    <div className="absolute top-2 left-2 w-12 h-12 flex items-center justify-center z-20">
                      {/* Sombra que respira (Paralaje) */}
                      <div className="absolute bottom-1 w-5 h-1 bg-black/20 rounded-full blur-[1px] animate-shadow-breath"
                           style={{ animationDelay: `${(i * 0.4).toFixed(2)}s` }}></div>
                      {/* Abeja Levitando */}
                      <div className={`text-3xl animate-levitate filter drop-shadow-sm ${list.themeIndex === 8 ? 'text-slate-400' : ''}`}
                           style={{ animationDelay: `${(i * 0.4).toFixed(2)}s` }}>
                        🐝
                      </div>
                    </div>
                  )}
                  
                  {/* Info Centrada */}
                  <div className="space-y-4 text-center w-full flex flex-col items-center">
                    <h3 className={`${list.themeIndex === 8 ? 'text-slate-800' : 'text-white'} font-bold text-[15px] sm:text-[17px] leading-tight drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.2)] line-clamp-2 w-full px-1`}>{list.name}</h3>
                    
                    <div className="relative w-full flex flex-col items-center">
                      <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm max-w-[80%]">
                        <div className="h-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${Math.max(5, progress)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReportList = () => {
    const list = lists.find(l => l.id === viewingReportId);
    if (!list) return null;

    const criticas = list.words.filter(w => w.completed && (w.errors || 0) >= 2);
    const enProceso = list.words.filter(w => w.completed && (w.errors || 0) === 1);
    const dominadas = list.words.filter(w => w.completed && (w.errors || 0) === 0);
    const noVistas = list.words.filter(w => !w.completed);

    const WordItem: React.FC<{ 
        word: Word, 
        type: 'critical' | 'process' | 'mastered' 
    }> = ({ word, type }) => {
        let config = {
            symbol: '✓',
            colorClass: 'text-emerald-500',
            bgClass: 'bg-emerald-50/50',
            borderClass: 'border-emerald-100/50'
        };

        if (type === 'critical') {
            config = {
                symbol: '!',
                colorClass: 'text-rose-500',
                bgClass: 'bg-rose-50/50',
                borderClass: 'border-rose-100/50'
            };
        } else if (type === 'process') {
            config = {
                symbol: '?',
                colorClass: 'text-amber-500',
                bgClass: 'bg-amber-50/50',
                borderClass: 'border-amber-100/50'
            };
        }

        return (
            <div className={`p-4 rounded-2xl flex justify-between items-center border ${config.bgClass} ${config.borderClass}`}>
                <span className="font-bold text-slate-700 capitalize text-[15px] sm:text-[17px]">{word.original}</span>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Intentos</span>
                        <span className="text-xs font-bold text-slate-500">{(word.successes || 0) + (word.errors || 0)}</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg bg-white shadow-sm ${config.colorClass}`}>
                        {config.symbol}
                    </div>
                </div>
            </div>
        );
    };

    const SectionHeader: React.FC<{ title: string, count: number, subtitle?: string }> = ({ title, count, subtitle }) => (
      <div className="mt-8 mb-3 px-1">
        <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
            <span className="bg-slate-100 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {subtitle && <p className="text-[9px] text-slate-300 italic mt-0.5">{subtitle}</p>}
      </div>
    );

    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
        {criticas.length > 0 && (
          <div className="animate-in fade-in">
            <SectionHeader title="Retos Críticos" count={criticas.length} subtitle="Alerta, situación por resolver" />
            <div className="space-y-2">
              {criticas.map(w => <WordItem key={w.id} word={w} type="critical" />)}
            </div>
          </div>
        )}

        {enProceso.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <SectionHeader title="En Proceso" count={enProceso.length} subtitle="Qué paso ahí? Después lo hiciste bien" />
            <div className="space-y-2">
              {enProceso.map(w => <WordItem key={w.id} word={w} type="process" />)}
            </div>
          </div>
        )}

        {dominadas.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-3">
            <SectionHeader title="Dominadas" count={dominadas.length} subtitle="Confianza total" />
            <div className="space-y-2">
              {dominadas.map(w => <WordItem key={w.id} word={w} type="mastered" />)}
            </div>
          </div>
        )}

        {noVistas.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="Por Descubrir" count={noVistas.length} />
            <div className="space-y-2">
              {noVistas.map(w => (
                <div key={w.id} className="p-4 bg-white rounded-2xl border border-dashed border-slate-100 flex justify-between items-center opacity-40">
                  <span className="font-semibold text-slate-400 capitalize">{w.original}</span>
                  <span className="text-[10px] font-bold text-slate-200">NUEVA</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 mb-6 px-1">
           <button onClick={() => handleResetProgress(viewingReportId!)} 
             className={`w-full py-4 rounded-2xl border-2 border-dashed font-bold text-xs uppercase tracking-widest active:scale-95 transition-all ${resetConfirm ? 'bg-amber-500 border-amber-400 text-white scale-105 shadow-lg' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
             {resetConfirm ? '¿Seguro? Toca para confirmar' : 'Reiniciar Todo el Progreso'}
           </button>
        </div>
      </div>
    );
  };

  const renderAchievementsModal = () => {
    const allWords = lists.flatMap(l => l.words).filter(w => w.completed);
    const goldWords = allWords.filter(w => w.medal === 'gold');
    const silverWords = allWords.filter(w => w.medal === 'silver');
    const bronzeWords = allWords.filter(w => w.medal === 'bronze');

    const AchievementSection = ({ title, words, icon, color, description }: { title: string, words: Word[], icon: string, color: string, description: string }) => (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-2xl shadow-sm`}>{icon}</div>
            <div>
              <h3 className="text-lg font-elegant font-bold text-slate-800">{title}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{words.length} PALABRAS</p>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic px-2 leading-relaxed">{description}</p>
        
        {words.length > 0 ? (
          <div className="flex flex-wrap gap-2 px-1">
            {words.map((w, i) => (
              <div key={w.id + i} className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-sm font-bold text-slate-600 capitalize animate-in zoom-in-95" style={{ animationDelay: `${i * 0.05}s` }}>
                {w.original}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
            <span className="text-2xl grayscale opacity-20 mb-2">{icon}</span>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Aún sin conquistas</p>
          </div>
        )}
      </div>
    );

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsAchievementsOpen(false)}></div>
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
          <div className="p-6 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-elegant font-bold text-slate-800">Salón de la Fama</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">El Libro de los Héroes</p>
            </div>
            <button onClick={() => setIsAchievementsOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center active:scale-90 transition-all">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-12 custom-scrollbar pb-12">
            <AchievementSection 
              title="🥇 Imbatibles" 
              words={goldWords} 
              icon="🥇" 
              color="bg-amber-50" 
              description="Palabras logradas al primer intento. ¡Maestría total y enfoque absoluto!"
            />
            <AchievementSection 
              title="🥈 Persistentes" 
              words={silverWords} 
              icon="🥈" 
              color="bg-slate-50" 
              description="Palabras conquistadas tras corregir el primer error. ¡Gran capacidad de aprendizaje!"
            />
            <AchievementSection 
              title="🥉 Grandes Victorias" 
              words={bronzeWords} 
              icon="🥉" 
              color="bg-orange-50" 
              description="Palabras que fueron un gran reto pero no te rendiste. ¡Este es el rincón del orgullo!"
            />
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-50">
            <button onClick={() => setIsAchievementsOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all">Listo</button>
          </div>
        </div>
      </div>
    );
  };

  const renderTallerModal = () => {
    if (!isTallerOpen) return null;

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsTallerOpen(false)}></div>
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
          <div className="p-6 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-elegant font-bold text-slate-800">Taller de Mundos</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestiona tus aventuras</p>
            </div>
            <button onClick={() => setIsTallerOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center active:scale-90 transition-all">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4 custom-scrollbar pb-12">
            {/* BANNER DE RECUPERACIÓN */}
            {showRecoveryAlert && (
                <div className="bg-amber-50/50 border-l-4 border-amber-400 p-4 rounded-r-2xl flex justify-between items-center shadow-sm mb-4">
                    <div className="pr-4">
                        <p className="font-bold text-amber-800 text-[14px] mb-0.5">¿No ves tus listas?</p>
                        <button onClick={handleImportClick} className="text-[10px] text-amber-600 font-black uppercase tracking-widest underline">Restaurar ahora</button>
                    </div>
                </div>
            )}

            {isDevMode && (
              <button onClick={openNewListModal} className="w-full p-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 active:scale-98 transition-all font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-50/30 mb-4">
                + Nueva Aventura
              </button>
            )}

            <div className="space-y-3">
              {lists.map(list => (
                <div key={list.id} className="relative group">
                  <div onClick={() => { 
                        setEditingListId(list.id); 
                        setIsAdding(true); 
                        setNewListName(list.name); 
                        setSelectedTheme(list.themeIndex); 
                        setInputText(list.words.map(w => w.original).join(' '));
                        setIsTallerOpen(false); // Cerrar taller al editar
                      }} 
                        className="bg-white p-4 pr-16 rounded-[2rem] shadow-sm border border-slate-50/50 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`w-12 h-12 min-w-[3rem] rounded-2xl bg-gradient-to-br ${THEMES[list.themeIndex]?.gradient || THEMES[0].gradient} flex items-center justify-center text-xl shadow-inner ${list.themeIndex === 8 ? 'text-slate-400' : 'text-white'} flex-shrink-0`}>📝</div>
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-bold text-slate-700 truncate mb-0.5">{list.name}</h3>
                        <span className="text-[8px] text-slate-300 font-black uppercase tracking-[0.2em]">{list.words.length} PALABRAS</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setViewingReportId(list.id); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-50/50 text-indigo-400 rounded-xl flex items-center justify-center shadow-sm active:scale-90 transition-all">
                    <span className="text-sm">📈</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-50">
            <button onClick={() => setIsTallerOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all">Listo</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-6 h-[100dvh] flex flex-col overflow-hidden">
      {/* HEADER CON BOTÓN DE AJUSTES */}
      <header className="flex items-center justify-between mb-4 mt-2 relative flex-shrink-0">
        <div className="w-10"></div> {/* Spacer */}
        <div 
            className="flex flex-col items-center select-none cursor-pointer p-4 -m-4 rounded-2xl active:scale-95 transition-transform" 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
        >
            <h1 className="text-3xl sm:text-4xl font-elegant tracking-[0.3em] font-light text-slate-800 mb-1 text-center">ECHOFY</h1>
            {/* Franja decorativa dinámica */}
            <div className={`h-1.5 w-12 rounded-full transition-all duration-1000 bg-gradient-to-r ${THEMES[headerThemeIndex].gradient}`}></div>
        </div>
        {role === 'parent' ? (
             <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center active:bg-slate-200 transition-colors">
                ⚙️
             </button>
        ) : <div className="w-10"></div>}
      </header>
      
      {/* INPUT FILE GLOBAL Y OCULTO - Accesible por Settings y por Banner de Recuperación */}
      <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
      />


      {role === 'child' ? renderChildView() : renderParentView()}
      
      {isAchievementsOpen && renderAchievementsModal()}
      {isTallerOpen && renderTallerModal()}

      <VoiceSelector 
        isOpen={isVoiceStudioOpen} 
        onClose={() => {
          setIsVoiceStudioOpen(false);
          setVoiceSettings(loadVoiceSettings()); // Refrescar nombre de voz actual
        }} 
      />

      {/* MODAL CONFIGURACIÓN / RESPALDO */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-20 animate-in zoom-in-95 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-3xl mb-4">🛡️</div>
            <h2 className="text-2xl font-elegant font-bold text-slate-800 mb-2">Seguridad de Datos</h2>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
               Guarda una copia de seguridad para no perder el progreso de tu hija si cambias de dispositivo.
            </p>
            
            <div className="w-full space-y-4">
                <button onClick={handleExportBackup} className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all border border-indigo-100">
                    <span>💾</span> Guardar Copia de Seguridad
                </button>
                
                <div className="relative">
                    {/* El input file está ahora fuera de este modal, pero el botón lo llama igual */}
                    <button onClick={handleImportClick} className="w-full py-4 bg-white text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all border-2 border-dashed border-slate-200 hover:border-slate-300">
                        <span>📂</span> Restaurar Datos
                    </button>
                </div>
            </div>
            
            <button onClick={() => setIsSettingsOpen(false)} className="mt-8 text-slate-400 font-bold text-sm uppercase tracking-widest p-2">
                Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL REPORTE */}
      {viewingReportId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setViewingReportId(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
            <div className="p-6 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-elegant font-bold text-slate-800">Estado</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Progreso de la aventura</p>
              </div>
              <button onClick={() => setViewingReportId(null)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center active:scale-90 transition-all">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar pb-12">
              {renderReportList()}
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-50">
              <button onClick={() => setViewingReportId(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[15px] active:scale-95 transition-all">Listo</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA AVENTURA */}
      {isAdding && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center">
          <div className="w-full h-[95vh] sm:h-auto sm:max-h-[85vh] bg-[#fdfdfe] rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-bottom-20 duration-500">
            <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] sticky top-0 bg-[#fdfdfe]/90 backdrop-blur-md z-10 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-elegant font-bold text-slate-800">{editingListId ? 'Editar Mundo' : 'Nuevo Mundo'}</h2>
              <button onClick={resetForm} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center active:scale-90 hover:bg-slate-200 transition-colors">✕</button>
            </div>
            
            <div className="p-6 space-y-8 pb-32">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Nombre de la Aventura</label>
                <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-[15px] sm:text-[17px] font-bold placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all" 
                       placeholder="Ej: Animales del Bosque" value={newListName} onChange={e => setNewListName(e.target.value)} />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Elige el Ambiente</label>
                <div className="grid grid-cols-5 gap-2">
                  {THEMES.map(theme => (
                    <button key={theme.id} onClick={() => setSelectedTheme(theme.id)} 
                            className={`h-14 rounded-xl bg-gradient-to-br ${theme.gradient} border-4 transition-all ${theme.id === 8 ? 'shadow-[0_4px_15px_rgba(0,0,0,0.12)]' : 'shadow-sm'} ${selectedTheme === theme.id ? 'border-slate-800 scale-105 shadow-xl ring-2 ring-offset-2 ring-slate-200' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Palabras (Separadas por espacio)</label>
                <textarea className="w-full p-5 h-48 rounded-2xl bg-slate-50 border border-slate-100 text-[15px] sm:text-[17px] leading-relaxed placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-slate-600" 
                          placeholder="gato perro sol luna..." value={inputText} onChange={e => setInputText(e.target.value)} />
              </div>

              <button onClick={handleSaveList} 
                      className={`w-full p-5 rounded-2xl font-bold text-[15px] sm:text-[17px] active:scale-95 transition-all shadow-xl hover:shadow-2xl ${saveConfirm ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 text-white shadow-slate-200'}`}>
                {editingListId 
                  ? (saveConfirm ? '¿Confirmar cambios?' : 'Guardar Cambios') 
                  : 'Crear Aventura'}
              </button>

              {editingListId && (
                <button onClick={() => handleDeleteList(editingListId)} 
                        className={`w-full p-5 rounded-2xl font-bold text-[15px] sm:text-[17px] transition-all duration-300 border-2 border-dashed ${deleteConfirmId === editingListId ? 'bg-rose-500 border-rose-400 text-white scale-105 shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-400'}`}>
                  {deleteConfirmId === editingListId ? '¿Seguro? Toca para borrar' : 'Eliminar Aventura'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
          <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
              <span className="font-bold text-lg">{toast.type === 'success' ? '✓' : 'ℹ︎'}</span>
              <span className="font-bold text-sm">{toast.msg}</span>
          </div>
      )}
    </div>
  );
};

export default ParentDashboard;
