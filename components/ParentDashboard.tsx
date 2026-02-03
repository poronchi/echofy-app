
import React, { useState, useEffect } from 'react';
import { WordList, VoiceSettings, Word } from '../types';
import { loadLists, saveLists, extractWords, loadVoiceSettings, saveVoiceSettings, getMeaning, THEMES, resetListProgress, PRACTICE_THEME } from '../store';
import { getCategorizedVoices, isPremiumVoice, speakWordPromise } from '../geminiService';

interface Props {
  onStartGame: (listId: string, mode: 'normal' | 'repaso') => void;
  role: 'parent' | 'child';
}

const ParentDashboard: React.FC<Props> = ({ onStartGame, role }) => {
  const [lists, setLists] = useState<WordList[]>([]);
  const [newListName, setNewListName] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);

  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadVoiceSettings());
  const [categorizedVoices, setCategorizedVoices] = useState<{elite: SpeechSynthesisVoice[], backup: SpeechSynthesisVoice[]}>({elite: [], backup: []});

  useEffect(() => {
    setLists(loadLists());
    const loadVoices = () => setCategorizedVoices(getCategorizedVoices());
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleSaveList = () => {
    if (!newListName || !inputText) return;
    const updatedLists = editingListId 
      ? lists.map(l => l.id === editingListId ? { ...l, name: newListName, themeIndex: selectedTheme, words: mergeWords(l.words, extractWords(inputText)) } : l)
      : [...lists, { id: Math.random().toString(36).substr(2, 9), name: newListName, themeIndex: selectedTheme, words: extractWords(inputText), settings: { rainEnabled: true }, lastPlayed: Date.now() }];
    
    setLists(updatedLists);
    saveLists(updatedLists);
    resetForm();
  };

  const handleResetProgress = (id: string) => {
    if (window.confirm("¿Seguro que quieres reiniciar todo el progreso de este mundo?")) {
      const updated = resetListProgress(id);
      setLists(updated);
    }
  };

  const mergeWords = (oldWords: Word[], newWords: Word[]): Word[] => {
    return newWords.map(nw => {
      const match = oldWords.find(ow => ow.original === nw.original);
      return match ? match : nw;
    });
  };

  const resetForm = () => {
    setNewListName(''); setInputText(''); setEditingListId(null); setIsAdding(false); setSelectedTheme(0);
  };

  const currentVoice = [...categorizedVoices.elite, ...categorizedVoices.backup].find(v => v.voiceURI === voiceSettings.voiceURI);
  
  const getVoiceDisplayName = () => {
    if (!currentVoice) return "Automática";
    return currentVoice.name.replace(/Microsoft|Google|English|United States|Android|Speech|Engine|en-US|\(.*\)/gi, '').trim();
  };

  const handleVoiceSelect = (voice: SpeechSynthesisVoice) => {
      const s = {...voiceSettings, voiceURI: voice.voiceURI}; 
      setVoiceSettings(s); 
      saveVoiceSettings(s); 
      speakWordPromise("Voice updated", 'en-US', true);
  };

  const triggerVoiceFeedback = (type: 'rate' | 'pitch') => {
    const text = type === 'rate' ? "Testing speed" : "Testing tone";
    speakWordPromise(text, 'en-US', true);
  };

  const renderParentView = () => (
    <div className="animate-in fade-in duration-700 space-y-4">
      {isAdding ? (
        <div className="space-y-6 pb-20">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-50 space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-elegant font-semibold text-slate-700">{editingListId ? 'Editar Mundo' : 'Nuevo Mundo'}</h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">×</button>
            </div>
            <input className="w-full p-4 rounded-2xl bg-slate-50 text-lg font-bold placeholder:font-normal" placeholder="Nombre de la aventura..." value={newListName} onChange={e => setNewListName(e.target.value)} />
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Elige un Mundo</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(theme => (
                  <button key={theme.id} onClick={() => setSelectedTheme(theme.id)} 
                          className={`h-12 rounded-xl bg-gradient-to-br ${theme.gradient} border-4 transition-all ${selectedTheme === theme.id ? 'border-slate-800 scale-105' : 'border-transparent opacity-60'}`}>
                  </button>
                ))}
              </div>
            </div>
            <textarea className="w-full p-4 h-32 rounded-2xl bg-slate-50 text-lg leading-relaxed placeholder:font-normal" placeholder="Palabras separadas por espacios..." value={inputText} onChange={e => setInputText(e.target.value)} />
            <div className="flex gap-2">
               <button onClick={handleSaveList} className="flex-1 bg-slate-900 text-white p-5 rounded-2xl font-bold text-lg active:scale-95 transition-transform">Guardar Cambios</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => setIsAdding(true)} className="w-full p-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 mb-8 active:scale-98 transition-all font-bold">+ Nueva Aventura</button>
          {lists.map(list => (
            <div key={list.id} className="relative group mb-4">
              <div onClick={() => { setEditingListId(list.id); setIsAdding(true); setNewListName(list.name); setSelectedTheme(list.themeIndex); setInputText(list.words.map(w => w.original).join(' ')); }} 
                   className="bg-white p-5 pr-20 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${THEMES[list.themeIndex]?.gradient || THEMES[0].gradient} flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform`}>📝</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{list.name}</h3>
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{list.words.length} PALABRAS</span>
                  </div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setViewingReportId(list.id); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all hover:bg-indigo-100">
                📈
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderChildView = () => {
    // Buscar si hay alguna palabra en alguna lista que tenga errores (Modo Práctica disponible)
    const listsWithErrors = lists.filter(l => l.words.some(w => (w.errors || 0) > 0));
    const totalErrors = listsWithErrors.reduce((acc, l) => acc + l.words.filter(w => (w.errors || 0) > 0).length, 0);

    return (
      <div className="animate-in fade-in duration-700 space-y-6">
        {/* ISLA DE PRÁCTICA - Solo visible si hay deudas de aprendizaje */}
        {totalErrors > 0 && (
          <div onClick={() => onStartGame(listsWithErrors[0].id, 'repaso')}
            className="w-full p-6 rounded-[3rem] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 shadow-2xl relative overflow-hidden group active:scale-95 transition-all mb-8 cursor-pointer">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-3xl shadow-lg border border-white/10 animate-levitate">✨</div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Isla de Práctica</h2>
                  <p className="text-indigo-200 text-sm font-semibold">{totalErrors} palabras por rescatar</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-white font-bold animate-pulse">
                ➜
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {lists.map((list) => {
            const progress = (list.words.filter(w => w.completed && (w.errors || 0) === 0).length / list.words.length) * 100;
            const theme = THEMES[list.themeIndex] || THEMES[0];
            return (
              <div key={list.id} onClick={() => onStartGame(list.id, 'normal')}
                   className="relative aspect-[4/5] p-5 rounded-[2.5rem] shadow-xl transition-all active:scale-[0.93] group overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} transition-transform group-hover:scale-110`}></div>
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative h-full flex flex-col justify-between z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl animate-levitate shadow-lg">🌎</div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight mb-2 drop-shadow-md">{list.name}</h3>
                    <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.max(5, progress)}%` }}></div>
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
                <span className="font-bold text-slate-700 capitalize">{word.original}</span>
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
             className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all">
             Reiniciar Todo el Progreso
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-6 pb-48">
      <header className="flex flex-col items-center mb-10 mt-6">
        <h1 className="text-3xl sm:text-4xl font-elegant tracking-[0.3em] font-light text-slate-800 mb-1 text-center">ECHOFY</h1>
        <div className="h-1 w-12 bg-slate-200 rounded-full mb-8"></div>
        {role === 'parent' && (
          <button onClick={() => setIsVoiceStudioOpen(true)} className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-500 active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔊</span>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 text-left">Voz actual</span>
                <span className="text-sm font-semibold font-elegant truncate max-w-[180px]">{getVoiceDisplayName()}</span>
              </div>
            </div>
          </button>
        )}
      </header>

      {role === 'child' ? renderChildView() : renderParentView()}
      
      {isVoiceStudioOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsVoiceStudioOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative z-20 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <h2 className="text-2xl font-elegant font-bold mb-6">Estudio de Voz</h2>
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-600">Ritmo</label>
                <input type="range" min="0.5" max="1.5" step="0.1" value={voiceSettings.rate} 
                       onChange={e => { const s={...voiceSettings, rate:parseFloat(e.target.value)}; setVoiceSettings(s); saveVoiceSettings(s); }}
                       onMouseUp={() => triggerVoiceFeedback('rate')} onTouchEnd={() => triggerVoiceFeedback('rate')}
                       className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600" />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-600">Tono</label>
                <input type="range" min="0.5" max="1.5" step="0.1" value={voiceSettings.pitch} 
                       onChange={e => { const s={...voiceSettings, pitch:parseFloat(e.target.value)}; setVoiceSettings(s); saveVoiceSettings(s); }}
                       onMouseUp={() => triggerVoiceFeedback('pitch')} onTouchEnd={() => triggerVoiceFeedback('pitch')}
                       className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-fuchsia-600" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Voces en el dispositivo</p>
                {categorizedVoices.elite.concat(categorizedVoices.backup).map(v => (
                  <button key={v.voiceURI} onClick={() => handleVoiceSelect(v)} 
                          className={`w-full p-4 rounded-xl text-left border-2 transition-all ${voiceSettings.voiceURI === v.voiceURI ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                    <span className="font-bold text-sm">{v.name.replace(/Google|Microsoft|English|en-US/gi, '').trim()}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsVoiceStudioOpen(false)} className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Cerrar</button>
          </div>
        </div>
      )}

      {viewingReportId && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingReportId(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl relative z-20 animate-in slide-in-from-bottom-20 max-h-[85vh] flex flex-col">
            <h2 className="text-2xl font-elegant font-bold text-slate-800 mb-1">Estado de Aprendizaje</h2>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-4">Progreso de la aventura</p>
            {renderReportList()}
            <button onClick={() => setViewingReportId(null)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold active:scale-95 transition-transform">Volver</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
