import React, { useState, useEffect } from 'react';
import { GameState, GameStats, GeminiAnalysis } from '../types';
import { generateRunAnalysis } from '../services/geminiService';

interface UIOverlayProps {
  gameState: GameState;
  startGame: () => void;
  gameStats: GameStats;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, startGame, gameStats }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
      setLoadingAnalysis(true);
      generateRunAnalysis(gameStats.distance, gameStats.coins)
        .then(data => {
          setAnalysis(data);
          setLoadingAnalysis(false);
        })
        .catch(() => {
          setLoadingAnalysis(false);
          setAnalysis({ title: "Network Error", comment: "Could not fetch AI analysis." });
        });
    } else {
      setAnalysis(null);
    }
  }, [gameState, gameStats]);

  if (gameState === GameState.PLAYING) {
    return (
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start font-pixel text-white z-20">
        <div className="flex flex-col gap-2">
          <div className="text-xl bg-black/30 p-2 rounded border border-white/20">
            SCORE: {gameStats.score.toString().padStart(6, '0')}
          </div>
          <div className="text-sm bg-black/30 p-2 rounded border border-white/20 w-fit">
            DIST: {gameStats.distance}m
          </div>
        </div>
        <div className="text-xl bg-yellow-500/80 p-2 rounded text-black border border-white/40">
           COINS: {gameStats.coins}
        </div>
      </div>
    );
  }

  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-30 p-6 text-center animate-fade-in">
        <h1 className="text-4xl md:text-3xl font-pixel mb- text-red-500 animate-bounce">GAME OVER</h1>
        
        <div className="bg-slate-800 p-6 rounded-lg border-2 border-slate-600 shadow-xl max-w-md w-full mb-6">
           <div className="grid grid-cols-2 gap-4 text-center mb-6 font-pixel">
             <div className="bg-slate-900 p-3 rounded">
               <div className="text-gray-400 text-xs mb-1">DISTANCE</div>
               <div className="text-xl text-blue-400">{gameStats.distance}m</div>
             </div>
             <div className="bg-slate-900 p-3 rounded">
               <div className="text-gray-400 text-xs mb-1">COINS</div>
               <div className="text-xl text-yellow-400">{gameStats.coins}</div>
             </div>
             <div className="col-span-2 bg-slate-900 p-3 rounded">
               <div className="text-gray-400 text-xs mb-1">TOTAL SCORE</div>
               <div className="text-xl text-green-400">{gameStats.score}</div>
             </div>
           </div>

           {/* Gemini Section */}
           <div className="border-t border-slate-700 pt-4 mt-2">
              {/* <h3 className="text-xs uppercase tracking-widest text-purple-400 mb-2">AI Runner Analysis</h3> */}
              {loadingAnalysis ? (
                 <div className="flex items-center justify-center gap-2 text-sm text-gray-400 italic">
                   <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                   Consulting the Arcade Oracle...
                 </div>
              ) : analysis ? (
                <div className="animate-slide-up">
                  <div className="text-sm font-bold text-yellow-300 font-pixel mb-1 text-center">"{analysis.title}"</div>
                  <p className="text-sm text-gray-300 italic font-serif">"{analysis.comment}"</p>
                </div>
              ) : null}
           </div>
        </div>

        <button 
          onClick={startGame}
          className="font-pixel bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded shadow-[0_4px_0_rgb(21,128,61)] active:shadow-[0_0px_0_rgb(21,128,61)] active:translate-y-1 transition-all text-lg"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  // MENU
  return (
    <div className="absolute inset-0 bg-sky-900/40 flex flex-col items-center justify-center text-white z-30 backdrop-blur-sm">
      <div className="text-center mb-10 animate-float">
        <h1 className="text-5xl md:text-7xl font-pixel text-yellow-400 drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] leading-tight">
          GO GO GO
        </h1>
        <p className="mt-4 text-xl font-bold font-pixel text-white drop-shadow-md uppercase tracking-widest">
          Don’t let the dog catch you!
        </p>
        <p className="mt-4 text-md font-bold font-pixel text-white drop-shadow-md">
           Made in Vietnam 🇻🇳
        </p>
      </div>

      {/* <div className="bg-white/10 p-6 rounded-lg backdrop-blur-md mb-8 max-w-sm text-center text-sm leading-relaxed border border-white/20">
        <p className="mb-2">🏃 <strong>SPACE / TAP</strong> to Jump</p>
        <p className="mb-2">🆙 <strong>Double Jump</strong> in mid-air</p>
        <p>⚠️ Dodge Spikes, Birds & Walls!</p>
      </div> */}

      <button 
        onClick={startGame}
        className="font-pixel bg-blue-500 hover:bg-blue-600 text-white py-4 px-12 rounded-lg shadow-[0_6px_0_rgb(29,78,216)] active:shadow-[0_0px_0_rgb(29,78,216)] active:translate-y-1.5 transition-all text-2xl"
      >
        START RUN
      </button>
    </div>
  );
};

export default UIOverlay;