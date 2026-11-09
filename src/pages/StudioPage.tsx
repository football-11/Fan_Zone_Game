import React from 'react';
import { GameSyncProvider, useGameSync } from '../context/GameSyncContext';
import { StudioStageView } from '../components/StudioStageView';

const StudioScreenContent: React.FC = () => {
  const { state } = useGameSync();

  if (!state) {
    return (
      <div className="w-screen h-screen bg-[#030914] text-white flex items-center justify-center cursor-none select-none font-['Outfit']">
        <div className="text-3xl font-extrabold tracking-wide text-amber-400">
          FANZONE LIVE · CONNECTING STUDIO FEED...
        </div>
      </div>
    );
  }

  return <StudioStageView state={state} isPreview={false} />;
};

export const StudioPage: React.FC = () => {
  return (
    <GameSyncProvider role="studio">
      <StudioScreenContent />
    </GameSyncProvider>
  );
};
