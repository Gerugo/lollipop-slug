import { useEffect, useRef } from 'react';
import stageBgmUrl from '../assets/Candy_Coated_Carnage.mp3';
import bossBgmUrl from '../assets/boss_battle.wav';

/**
 * Custom hook for dual dynamic background music (Stage & Boss BGM) management in React.
 *
 * @param {string} gameState - Current game state ('PLAYING', 'PAUSED', 'MENU', 'GAME_OVER', 'VICTORY')
 * @param {number} [volume=0.5] - Audio volume between 0 and 1
 * @param {boolean} [isMuted=false] - Whether the audio is muted
 * @param {boolean} [isBossActive=false] - Whether a boss fight is currently active
 */
export function useBackgroundMusic(gameState, volume = 0.5, isMuted = false, isBossActive = false) {
  const stageAudioRef = useRef(null);
  const bossAudioRef = useRef(null);
  const isPlayingStageRef = useRef(false);
  const isPlayingBossRef = useRef(false);

  // Initialize and cleanup Audio instances safely
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
        // 1. Stage Music
        if (stageBgmUrl) {
          const stageAudio = new Audio();
          stageAudio.src = stageBgmUrl;
          stageAudio.loop = true;
          stageAudio.preload = 'auto';
          stageAudio.volume = Math.max(0, Math.min(1, volume));
          stageAudio.muted = isMuted;

          stageAudio.addEventListener('error', () => {
            try { stageAudio.src = './assets/Candy_Coated_Carnage.mp3'; } catch (_) {}
          });

          stageAudioRef.current = stageAudio;
        }

        // 2. Boss Battle Music
        if (bossBgmUrl) {
          const bossAudio = new Audio();
          bossAudio.src = bossBgmUrl;
          bossAudio.loop = true;
          bossAudio.preload = 'auto';
          bossAudio.volume = Math.max(0, Math.min(1, volume));
          bossAudio.muted = isMuted;

          bossAudio.addEventListener('error', () => {
            try { bossAudio.src = './assets/boss_battle.wav'; } catch (_) {}
          });

          bossAudioRef.current = bossAudio;
        }
      }
    } catch (err) {
      console.warn('[useBackgroundMusic] Failed to initialize Audio objects:', err);
    }

    return () => {
      if (stageAudioRef.current) {
        try {
          stageAudioRef.current.pause();
          stageAudioRef.current.src = '';
        } catch (_) {}
        stageAudioRef.current = null;
      }
      if (bossAudioRef.current) {
        try {
          bossAudioRef.current.pause();
          bossAudioRef.current.src = '';
        } catch (_) {}
        bossAudioRef.current = null;
      }
    };
  }, []);

  // Update volume and muted state dynamically across all tracks
  useEffect(() => {
    const safeVol = Math.max(0, Math.min(1, volume));
    if (stageAudioRef.current) {
      stageAudioRef.current.volume = safeVol;
      stageAudioRef.current.muted = isMuted;
    }
    if (bossAudioRef.current) {
      bossAudioRef.current.volume = safeVol;
      bossAudioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Handle play / pause / track switching based on gameState & isBossActive
  useEffect(() => {
    const stageAudio = stageAudioRef.current;
    const bossAudio = bossAudioRef.current;
    const normalizedState = (gameState || '').toLowerCase();

    try {
      if (normalizedState === 'playing') {
        if (isBossActive && bossAudio) {
          // Pause stage music and start boss music
          if (stageAudio && isPlayingStageRef.current) {
            stageAudio.pause();
            isPlayingStageRef.current = false;
          }

          if (!isPlayingBossRef.current) {
            const playPromise = bossAudio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => { isPlayingBossRef.current = true; })
                .catch((err) => {
                  isPlayingBossRef.current = false;
                  console.warn('[useBackgroundMusic] Boss audio playback awaiting interaction:', err);
                });
            }
          }
        } else if (stageAudio) {
          // Pause boss music and resume/start stage music
          if (bossAudio && isPlayingBossRef.current) {
            bossAudio.pause();
            bossAudio.currentTime = 0;
            isPlayingBossRef.current = false;
          }

          if (!isPlayingStageRef.current) {
            const playPromise = stageAudio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => { isPlayingStageRef.current = true; })
                .catch((err) => {
                  isPlayingStageRef.current = false;
                  console.warn('[useBackgroundMusic] Stage audio playback awaiting interaction:', err);
                });
            }
          }
        }
      } else {
        // Paused, Menu, Game Over, Victory
        if (stageAudio && isPlayingStageRef.current) {
          stageAudio.pause();
          isPlayingStageRef.current = false;
        }
        if (bossAudio && isPlayingBossRef.current) {
          bossAudio.pause();
          isPlayingBossRef.current = false;
        }

        if (normalizedState === 'menu') {
          if (stageAudio) stageAudio.currentTime = 0;
          if (bossAudio) bossAudio.currentTime = 0;
        }
      }
    } catch (err) {
      console.warn('[useBackgroundMusic] Play/pause error:', err);
    }
  }, [gameState, isBossActive]);

  return { stageAudioRef, bossAudioRef };
}

export default useBackgroundMusic;
