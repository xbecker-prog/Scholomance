import React, { useState, useEffect, useRef } from 'react';
import { Character, GameState } from '../types';
import { generateNextScene, generateSceneImage } from '../services/geminiService';

interface Props {
  character: Character;
}

const GameInterface: React.FC<Props> = ({ character }) => {
  const [gameState, setGameState] = useState<GameState>({
    sceneDescription: "You step off the transport shuttle onto the obsidian landing platform of Scholomance. The massive academy floats in the void, tethered to a dying star. Other cadets surround you, a mix of anxiety and arrogance on their faces.",
    sceneImageUrl: "",
    choices: ["Look for the registration desk", "Inspect the other cadets", "Commune with the void"],
    history: [],
    turnCount: 1,
    isLoading: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialImage = async () => {
        try {
            const img = await generateSceneImage("Scholomance academy landing platform, space opera, floating in void near dying star, anime style");
            if (img) setGameState(prev => ({ ...prev, sceneImageUrl: img }));
        } catch (e) {
            console.error("Failed initial image load");
        }
    };
    loadInitialImage();
  }, []);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [gameState.history, gameState.sceneDescription]);

  const handleAction = async (action: string) => {
    setGameState(prev => ({ ...prev, isLoading: true }));

    try {
        const historyUpdate = [
            ...gameState.history,
            { role: 'model' as const, text: gameState.sceneDescription },
            { role: 'user' as const, text: action }
        ];

        const nextScene = await generateNextScene(historyUpdate, action, character);
        
        generateSceneImage(nextScene.description).then(img => {
            if(img) setGameState(prev => ({ ...prev, sceneImageUrl: img }));
        });

        setGameState(prev => ({
            ...prev,
            sceneDescription: nextScene.description,
            choices: nextScene.choices,
            history: historyUpdate,
            turnCount: prev.turnCount + 1,
            isLoading: false
        }));

    } catch (e) {
        console.error(e);
        setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Derived values for UI bars
  const hpPercentage = Math.min(100, Math.max(0, (character.hp / character.maxHp) * 100));
  const energyPercentage = Math.min(100, Math.max(0, (character.energy / character.maxEnergy) * 100));

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-[#111118] text-white overflow-hidden">
      {/* Header Section */}
      <header className="flex w-full items-center justify-between border-b border-primary/20 bg-[#0f2123]/80 px-4 py-2 backdrop-blur-sm z-20">
        <div className="flex flex-1 items-center gap-4">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-16 w-16 border-2 border-primary/50" 
            style={{ backgroundImage: `url("${character.portraitUrl || 'https://placehold.co/600x600/1e293b/05d9e8?text=User'}")` }}
          ></div>
          <div className="flex flex-col justify-center">
            <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">{character.name}</p>
            <p className="text-primary/80 text-base font-normal leading-normal">{character.race} {character.classType}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 max-w-md">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex gap-4 justify-between items-center">
              <p className="text-white text-sm font-medium leading-normal">Health</p>
              <p className="text-white text-xs font-normal leading-normal">{Math.round(hpPercentage)}%</p>
            </div>
            <div className="rounded-full bg-[#3a5355]/50 h-2">
                <div className="h-2 rounded-full bg-[#d6063b] transition-all duration-500" style={{ width: `${hpPercentage}%` }}></div>
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex gap-4 justify-between items-center">
              <p className="text-white text-sm font-medium leading-normal">Void Energy</p>
              <p className="text-white text-xs font-normal leading-normal">{Math.round(energyPercentage)}%</p>
            </div>
            <div className="rounded-full bg-[#3a5355]/50 h-2">
                <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${energyPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="flex gap-2 p-2 border border-primary/20 rounded-lg bg-background-dark/30">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary/20 text-primary tooltip" title="Hasted">
              <span className="material-symbols-outlined text-lg">bolt</span>
            </div>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-500/20 text-green-400 tooltip" title="Enhanced">
              <span className="material-symbols-outlined text-lg">science</span>
            </div>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-500/20 text-blue-400 tooltip" title="Shielded">
              <span className="material-symbols-outlined text-lg">shield</span>
            </div>
          </div>
          <button className="p-3 rounded-lg text-white/80 hover:bg-primary/20 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Main Content (Visual Viewport) */}
      <main className="flex-grow relative bg-black/50">
        {gameState.sceneImageUrl ? (
             <div 
                className="w-full h-full bg-center bg-no-repeat bg-cover transition-all duration-1000 ease-in-out" 
                style={{ backgroundImage: `url("${gameState.sceneImageUrl}")` }}
            >
            </div>
        ) : (
             <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-primary/50">
                 <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                 <p className="text-sm tracking-widest uppercase">Rendering Scene...</p>
             </div>
        )}
        
        {/* Loading Overlay */}
        {gameState.isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-4xl animate-spin">data_usage</span>
                    <span className="text-primary font-bold tracking-widest uppercase text-sm">Processing Simulation</span>
                </div>
            </div>
        )}
      </main>

      {/* Footer / Interaction Panel */}
      <footer className="w-full border-t border-primary/20 bg-[#0f2123]/90 p-4 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-4 h-[35vh] max-h-[300px] z-20">
        {/* Tactical Log */}
        <div className="col-span-1 bg-black/30 rounded-lg p-3 flex flex-col border border-white/5">
          <h3 className="text-primary font-semibold mb-2 flex-shrink-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">history_edu</span>
              Tactical Log
          </h3>
          <div className="flex-grow overflow-y-auto text-sm text-white/80 pr-2 space-y-2 custom-scrollbar" ref={scrollRef}>
             {/* History */}
             {gameState.history.map((entry, idx) => (
                 <p key={idx} className="leading-snug">
                     <span className="text-primary/70 text-xs font-mono mr-2">[{10 + idx}:00]</span>
                     <span className={entry.role === 'user' ? 'text-white font-medium' : 'text-slate-300'}>
                         {entry.text}
                     </span>
                 </p>
             ))}
             {/* Current Scene */}
             <p className="leading-snug bg-primary/10 p-2 rounded border-l-2 border-primary">
                 <span className="text-primary font-bold block mb-1 text-xs uppercase tracking-wider">Current Situation</span>
                 {gameState.sceneDescription}
             </p>
          </div>
        </div>

        {/* Action Choices */}
        <div className="col-span-1 md:col-span-2 bg-black/30 rounded-lg p-3 flex flex-col border border-white/5">
          <h3 className="text-primary font-semibold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">ads_click</span>
              Available Protocols
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto pr-1">
            {gameState.choices.map((choice, idx) => (
                <button 
                    key={idx}
                    onClick={() => handleAction(choice)}
                    disabled={gameState.isLoading}
                    className="group flex flex-col items-center justify-center gap-1 p-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:text-white transition-colors">
                        {idx === 0 ? 'swords' : idx === 1 ? 'spark' : idx === 2 ? 'shield' : 'psychology'}
                    </span>
                    <span className="text-xs text-center font-medium line-clamp-2">{choice}</span>
                </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GameInterface;
