import React, { useState, useEffect } from 'react';
import { RACES, CLASSES, ALIGNMENTS, BACKGROUNDS, calculateStats } from '../constants';
import { generateCharacterDetails, generateCharacterPortrait } from '../services/geminiService';
import { Character, Stats } from '../types';
// We use material symbols from the HTML, so lucide icons are removed to match design exactly
// or we could mix them, but the design asked for implementation of the HTML provided.

interface Props {
  onCharacterCreated: (char: Character) => void;
}

const CharacterCreator: React.FC<Props> = ({ onCharacterCreated }) => {
  const [name, setName] = useState('');
  const [race, setRace] = useState(RACES[0]);
  const [classType, setClassType] = useState(CLASSES[0]);
  const [alignment, setAlignment] = useState(ALIGNMENTS[4]); // True Neutral default
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [stats, setStats] = useState<Stats>(calculateStats(RACES[0], CLASSES[0]));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for Appearance section (to match design)
  const [hairStyle, setHairStyle] = useState('Crew Cut');
  const [hairColor, setHairColor] = useState('#06d6e5');
  const [eyeColor, setEyeColor] = useState('#ff00ff');
  const [cybernetics, setCybernetics] = useState('None');

  useEffect(() => {
    setStats(calculateStats(race, classType));
  }, [race, classType]);

  const handleSubmit = async () => {
    if (!name) return setError("Character Name is required");
    setIsGenerating(true);
    setError(null);

    try {
      const details = await generateCharacterDetails(name, race, classType, background, alignment);
      
      const appearanceDescription = `
        Hair: ${hairStyle} (${hairColor}).
        Eyes: ${eyeColor}.
        Cybernetics: ${cybernetics}.
        A ${alignment} ${background} character.
      `;
      
      const portraitUrl = await generateCharacterPortrait(
        race, 
        classType, 
        `${appearanceDescription} ${details.backstory.substring(0, 100)}`
      );

      const newCharacter: Character = {
        name,
        race,
        classType,
        background,
        alignment,
        stats,
        skills: details.skills,
        backstory: details.backstory,
        portraitUrl,
        hp: stats.VIT * 10,
        maxHp: stats.VIT * 10,
        energy: stats.INT * 10,
        maxEnergy: stats.INT * 10
      };

      onCharacterCreated(newCharacter);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Initialization Failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const randomize = () => {
    const randomRace = RACES[Math.floor(Math.random() * RACES.length)];
    const randomClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    const randomAlign = ALIGNMENTS[Math.floor(Math.random() * ALIGNMENTS.length)];
    
    setRace(randomRace);
    setClassType(randomClass);
    setBackground(randomBg);
    setAlignment(randomAlign);
  };

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col bg-[#111818] group/design-root overflow-hidden">
      {/* Main Content Grid */}
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#27383a] px-8 py-3 w-full z-10 bg-[#0f2123]">
          <div className="flex items-center gap-4">
            <div className="size-6 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
                <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Scholomance: Void Academy</h2>
          </div>
          <div className="flex items-center gap-9"><span className="text-white/70 text-sm font-medium leading-normal">Character Creator</span></div>
        </header>

        {/* Main Content Area */}
        <main className="grid grid-cols-1 md:grid-cols-2 flex-1 gap-0 overflow-hidden">
          {/* Left Column: Character Preview & Stats */}
          <div className="flex flex-col gap-4 p-4 border-r border-solid border-[#27383a] bg-[#0f2123]/95 overflow-y-auto">
            {/* Portrait Placeholder */}
            <div 
              className="w-full bg-center bg-no-repeat bg-cover aspect-square rounded-sm border border-[#27383a] shadow-lg relative overflow-hidden group"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLAKx5KilVQ6C2HBWpxyj2eFD3ag0DuoidnW4L2zf3ROVbYTqHvzG8DLdpqHkBYJVOaTqrSGGkFFVE8am3QXa4y0AlJGYhB2Sr0GTEl1YdCm2DA2Qd1YKhVcV6OqDaZAL214j2NCx288CF95gNA12R42C8OQ7yXIIW3EXAyFs41m8F3ivDpJ-XQT2I83_ykyf5Y98aKbz3phuzVJLjrVerfQT73xizbR8FWlmuOMBK2GRuI7X_M093P4zgps1a353nwGEbl0zGr5Km")' }}
            >
               <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded p-4 border border-[#3a5355] bg-[#1b2727]/50">
                <p className="text-primary text-sm font-medium leading-normal">Strength</p>
                <p className="text-white tracking-light text-xl font-bold leading-tight">{stats.STR}</p>
              </div>
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded p-4 border border-[#3a5355] bg-[#1b2727]/50">
                <p className="text-primary text-sm font-medium leading-normal">Intellect</p>
                <p className="text-white tracking-light text-xl font-bold leading-tight">{stats.INT}</p>
              </div>
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded p-4 border border-[#3a5355] bg-[#1b2727]/50">
                <p className="text-primary text-sm font-medium leading-normal">Agility</p>
                <p className="text-white tracking-light text-xl font-bold leading-tight">{stats.DEX}</p>
              </div>
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded p-4 border border-[#3a5355] bg-[#1b2727]/50">
                <p className="text-primary text-sm font-medium leading-normal">Constitution</p>
                <p className="text-white tracking-light text-xl font-bold leading-tight">{stats.VIT}</p>
              </div>
              {/* Derived or Placeholder Stats for UI Symmetry */}
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded p-4 border border-[#3a5355] bg-[#1b2727]/50">
                <p className="text-primary text-sm font-medium leading-normal">Wisdom</p>
                <p className="text-white tracking-light text-xl font-bold leading-tight">{Math.floor((stats.INT + stats.VIT) / 2)}</p>
              </div>
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded p-4 border border-[#3a5355] bg-[#1b2727]/50">
                <p className="text-primary text-sm font-medium leading-normal">Charisma</p>
                <p className="text-white tracking-light text-xl font-bold leading-tight">{stats.CHA}</p>
              </div>
            </div>

            {/* Vitals Summary */}
            <div className="border-t border-solid border-[#27383a] pt-2">
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-[#9bb9bb] text-sm font-normal leading-normal">Health Points</p>
                <p className="text-white text-sm font-normal leading-normal text-right">{stats.VIT * 10}/{stats.VIT * 10}</p>
              </div>
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-[#9bb9bb] text-sm font-normal leading-normal">Mana Points</p>
                <p className="text-white text-sm font-normal leading-normal text-right">{stats.INT * 10}/{stats.INT * 10}</p>
              </div>
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-[#9bb9bb] text-sm font-normal leading-normal">Defense Rating</p>
                <p className="text-white text-sm font-normal leading-normal text-right">{stats.DEX + stats.STR}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Customization & Input */}
          <div className="flex flex-col gap-4 p-4 overflow-y-auto bg-[#0f2123]">
            {error && (
               <div className="bg-red-500/10 border border-red-500 text-red-200 p-3 rounded text-sm flex items-center gap-2">
                   <span className="material-symbols-outlined text-lg">error</span>
                   {error}
               </div>
            )}
            
            <label className="flex flex-col w-full">
              <p className="text-white text-base font-medium leading-normal pb-2">Character Name</p>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-white focus:outline-0 focus:ring-0 border border-[#3a5355] bg-[#1b2727] focus:border-primary h-12 placeholder:text-[#9bb9bb] px-4 text-base font-normal leading-normal" 
                placeholder="Enter your character's name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col w-full">
                <p className="text-white text-base font-medium leading-normal pb-2">Race</p>
                <select 
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-white focus:outline-0 focus:ring-0 border border-[#3a5355] bg-[#1b2727] focus:border-primary h-12 px-4 text-base font-normal leading-normal"
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                >
                  {RACES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label className="flex flex-col w-full">
                <p className="text-white text-base font-medium leading-normal pb-2">Class</p>
                <select 
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-white focus:outline-0 focus:ring-0 border border-[#3a5355] bg-[#1b2727] focus:border-primary h-12 px-4 text-base font-normal leading-normal"
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>

            <div>
              <p className="text-white text-base font-medium leading-normal pb-2">Background</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {BACKGROUNDS.map((bg) => (
                    <div 
                        key={bg}
                        onClick={() => setBackground(bg)}
                        className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all
                            ${background === bg 
                                ? 'border-primary/50 bg-primary/20' 
                                : 'border-[#3a5355] bg-transparent hover:border-primary/50 hover:bg-primary/10'}`
                        }
                    >
                        <div className="mt-1">
                            <input 
                                checked={background === bg} 
                                readOnly
                                className="form-radio bg-[#1b2727] border-[#3a5355] text-primary focus:ring-primary focus:ring-offset-background-dark" 
                                type="radio"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">{bg}</h3>
                            <p className="text-xs text-white/70">Origin story from the void sector.</p>
                        </div>
                    </div>
                ))}
              </div>
            </div>

            <label className="flex flex-col w-full">
              <p className="text-white text-base font-medium leading-normal pb-2">Alignment</p>
              <select 
                className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-white focus:outline-0 focus:ring-0 border border-[#3a5355] bg-[#1b2727] focus:border-primary h-12 px-4 text-base font-normal leading-normal"
                value={alignment}
                onChange={(e) => setAlignment(e.target.value)}
              >
                {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>

            <div>
              <p className="text-white text-base font-medium leading-normal pb-2">Appearance</p>
              <div className="border border-[#3a5355] rounded bg-[#1b2727]/30">
                <div className="flex border-b border-[#3a5355]">
                  <button className="px-4 py-2 text-sm text-primary border-b-2 border-primary">Visuals</button>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <label className="flex flex-col w-full">
                    <p className="text-white/70 text-sm font-medium leading-normal pb-1">Hair Style</p>
                    <select 
                        className="form-select w-full rounded text-white border border-[#3a5355] bg-[#1b2727] focus:border-primary h-10 px-3 text-sm"
                        value={hairStyle}
                        onChange={(e) => setHairStyle(e.target.value)}
                    >
                      <option>Crew Cut</option>
                      <option>Long & Flowing</option>
                      <option>Cyber-Dreads</option>
                      <option>Bald</option>
                      <option>Mohawk</option>
                      <option>Bob Cut</option>
                    </select>
                  </label>
                  <label className="flex flex-col w-full">
                    <p className="text-white/70 text-sm font-medium leading-normal pb-1">Hair Color</p>
                    <input 
                        className="form-input w-full rounded border border-[#3a5355] bg-[#1b2727] focus:border-primary h-10 p-1 cursor-pointer" 
                        type="color" 
                        value={hairColor}
                        onChange={(e) => setHairColor(e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col w-full">
                    <p className="text-white/70 text-sm font-medium leading-normal pb-1">Eye Color</p>
                    <input 
                        className="form-input w-full rounded border border-[#3a5355] bg-[#1b2727] focus:border-primary h-10 p-1 cursor-pointer" 
                        type="color" 
                        value={eyeColor}
                        onChange={(e) => setEyeColor(e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col w-full">
                    <p className="text-white/70 text-sm font-medium leading-normal pb-1">Cybernetics</p>
                    <select 
                        className="form-select w-full rounded text-white border border-[#3a5355] bg-[#1b2727] focus:border-primary h-10 px-3 text-sm"
                        value={cybernetics}
                        onChange={(e) => setCybernetics(e.target.value)}
                    >
                      <option>None</option>
                      <option>Ocular Implants</option>
                      <option>Neural Interface</option>
                      <option>Cyber-Arm</option>
                      <option>Synth-Skin</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-solid border-[#27383a] px-4 py-2 w-full bg-[#0f2123]">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back
          </button>
          <div className="flex items-center gap-2">
            <button 
                onClick={randomize}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-base">casino</span>
              Randomize
            </button>
            <button 
                onClick={handleSubmit}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-bold text-black bg-primary hover:bg-primary/90 rounded shadow-[0_0_15px_rgba(6,214,229,0.5)] transition-all
                    ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}
                `}
            >
                {isGenerating ? (
                    <>Processing...</>
                ) : (
                    <>
                        Finalize Character
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </>
                )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CharacterCreator;