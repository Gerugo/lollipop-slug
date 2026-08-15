import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './game/engine/GameEngine.js';
import { GameCanvas } from './components/GameCanvas.jsx';
import { HUD } from './components/HUD.jsx';
import { TouchGamepad } from './components/TouchGamepad.jsx';
import { OrientationOverlay } from './components/OrientationOverlay.jsx';
import { MainMenu } from './components/MainMenu.jsx';
import { PauseModal } from './components/PauseModal.jsx';
import { GameOverModal } from './components/GameOverModal.jsx';
import { VictoryModal } from './components/VictoryModal.jsx';
import { LevelCompleteModal } from './components/LevelCompleteModal.jsx';
import { HowToPlayModal } from './components/HowToPlayModal.jsx';
import { useBackgroundMusic } from './hooks/useBackgroundMusic.js';

export function App() {
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState('MENU');
  const [difficulty, setDifficulty] = useState('NORMAL');
  const [gameVolume, setGameVolume] = useState(0.5);
  const [isGameMuted, setIsGameMuted] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [hudData, setHudData] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Background Music (BGM) Hook Integration: Switches to distinct Boss Theme during boss fights
  const isBossActive = Boolean(hudData?.boss && !hudData.boss.isDefeated);
  useBackgroundMusic(gameState, gameVolume, isGameMuted, isBossActive);

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch || window.innerWidth <= 1024);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    window.addEventListener('touchstart', () => setIsTouchDevice(true), { once: true });

    return () => {
      window.removeEventListener('resize', checkTouch);
    };
  }, []);

  const handleEngineReady = useCallback((canvas) => {
    // Strict guard: never create more than one engine instance
    if (engineRef.current) {
      console.warn('[App] handleEngineReady called but engine already exists — skipping.');
      return;
    }

    const engine = new GameEngine(canvas, {
      onHUDUpdate: (data) => {
        setHudData(data);
      },
      onStateChange: (state) => {
        setGameState(state);
      }
    });

    engineRef.current = engine;
    engine.start();
  }, []);

  const handleToggleFullscreen = () => {
    const doc = document;
    const docEl = document.documentElement;

    const isFullscreen =
      doc.fullscreenElement ||
      doc.mozFullScreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement;

    if (!isFullscreen) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }

      try {
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      } catch (_) {}
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.setDifficulty(difficulty);
      engineRef.current.startNewGame();
    }
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleToggleMute = () => {
    setIsGameMuted((prevMuted) => {
      const nextMuted = !prevMuted;
      if (engineRef.current && engineRef.current.sound) {
        if (typeof engineRef.current.sound.setMuted === 'function') {
          engineRef.current.sound.setMuted(nextMuted);
        } else if (typeof engineRef.current.sound.toggleMute === 'function') {
          engineRef.current.sound.toggleMute();
        }
      }
      return nextMuted;
    });
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  };

  const handleRestartLevel = () => {
    if (engineRef.current) {
      engineRef.current.restartCurrentLevel();
    }
  };

  const handleNextLevel = () => {
    if (engineRef.current) {
      engineRef.current.advanceToNextLevel();
    }
  };

  const handleExitToMenu = () => {
    if (engineRef.current) {
      engineRef.current.setState('MENU');
      engineRef.current.sound.stopBGM();
    }
  };

  const handleTouchInput = (action, active) => {
    if (engineRef.current) {
      engineRef.current.input.setTouchInput(action, active);
    }
  };

  return (
    <>
      {/* Root canvas layer — overflow-hidden only clips game graphics, not UI overlays */}
      <div className="fixed inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
        <GameCanvas onEngineReady={handleEngineReady} />
      </div>

      {/* All UI overlays sit OUTSIDE the clipped canvas wrapper, as fixed siblings */}

      {/* 1. Orientation warning */}
      <OrientationOverlay onForceFullscreen={handleToggleFullscreen} />

      {/* 2. In-Game HUD (playing / paused) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <HUD
          hudData={hudData}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
          isMuted={isGameMuted}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* 3. Touch Virtual Gamepad */}
      {gameState === 'PLAYING' && isTouchDevice && (
        <TouchGamepad onTouchInput={handleTouchInput} />
      )}

      {/* 4. Main Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          highScore={hudData ? hudData.highScore : parseInt(localStorage.getItem('lollipop_slug_highscore') || '0', 10)}
          isMuted={isGameMuted}
          onToggleMute={handleToggleMute}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* 5. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleTogglePause}
          onRestart={handleRestart}
          onExitToMenu={handleExitToMenu}
          isMuted={isGameMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 6. Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          score={hudData?.score}
          highScore={hudData?.highScore}
          currentLevel={hudData?.currentLevel || 1}
          onRetryLevel={handleRestartLevel}
          onStartOver={handleRestart}
          onExitToMenu={handleExitToMenu}
        />
      )}

      {/* 7. Level Complete Modal */}
      {gameState === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          score={hudData?.score}
          rescuedHostages={hudData?.rescuedHostages}
          totalHostages={5}
          gameTime={hudData?.gameTime}
          onNextLevel={handleNextLevel}
        />
      )}

      {/* 8. Victory Modal */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          score={hudData?.score}
          highScore={hudData?.highScore}
          rescuedHostages={hudData?.rescuedHostages}
          totalHostages={5}
          gameTime={hudData?.gameTime}
          onPlayAgain={handleRestart}
          onExitToMenu={handleExitToMenu}
        />
      )}

      {/* 9. How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </>
  );
}

export default App;
