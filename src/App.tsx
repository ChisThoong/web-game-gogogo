import React, { useState, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState, GameStats } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameStats, setGameStats] = useState<GameStats>({ score: 0, coins: 0, distance: 0 });
  const [shake, setShake] = useState(false);
  
  // Audio refs
  const jumpAudio = useRef<HTMLAudioElement | null>(null); // Ideally use actual audio files

  const updateStats = useCallback((stats: GameStats) => {
    setGameStats(stats);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const startGame = () => {
    setGameStats({ score: 0, coins: 0, distance: 0 });
    setGameState(GameState.PLAYING);
  };
  
  const handleGameOver = useCallback(() => {
    // Score saving logic removed as requested.
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <div 
        className={`relative w-full max-w-[800px] aspect-video bg-sky-300 shadow-2xl overflow-hidden rounded-xl border-4 border-slate-800 ${shake ? 'animate-shake' : ''}`}
      >
        <GameCanvas 
          gameState={gameState} 
          setGameState={setGameState} 
          updateStats={updateStats}
          triggerShake={triggerShake}
          onGameOver={handleGameOver}
        />
        <UIOverlay 
          gameState={gameState} 
          startGame={startGame} 
          gameStats={gameStats}
        />
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;