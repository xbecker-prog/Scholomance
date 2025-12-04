import React, { useState } from 'react';
import CharacterCreator from './components/CharacterCreator';
import GameInterface from './components/GameInterface';
import { Character } from './types';

const App: React.FC = () => {
  const [character, setCharacter] = useState<Character | null>(null);

  return (
    <div className="w-full h-screen bg-space-950 font-sans text-slate-200 overflow-hidden">
      {!character ? (
        <CharacterCreator onCharacterCreated={setCharacter} />
      ) : (
        <GameInterface character={character} />
      )}
    </div>
  );
};

export default App;