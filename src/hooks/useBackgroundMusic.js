import { useEffect, useRef } from 'react';
import stage1BgmUrl from '../assets/Candy_Coated_Carnage.mp3';
import boss1BgmUrl from '../assets/boss_battle.wav';
import stage2BgmUrl from '../assets/level2_bgm.wav';
import boss2BgmUrl from '../assets/level2_boss.wav';

/**
 * Custom hook for dynamic multi-level background music (Stage & Boss BGM) management in React.
 *
 * @param {string} gameState - Current game state ('PLAYING', 'PAUSED', 'MENU', 'GAME_OVER', 'VICTORY')
 * @param {number} [volume=0.5] - Audio volume between 0 and 1
 * @param {boolean} [isMuted=false] - Whether the audio is muted
 * @param {boolean} [isBossActive=false] - Whether a boss fight is currently active
 * @param {number} [currentLevel=1] - Current active level index (1, 2, etc.)
 */
export function useBackgroundMusic(
  gameState,
  volume = 0.5,
  isMuted = false,
  isBossActive = false,
  currentLevel = 1
) {
  const currentLevelRef = useRef(currentLevel);
  const audioTracksRef = useRef({});
  const activeTrackRef = useRef(null);

  // Initialize and preload all audio tracks
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
        const createAudio = (src, fallbackSrc) => {
          const a = new Audio();
          a.src = src;
          a.loop = true;
          a.preload = 'auto';
          a.volume = Math.max(0, Math.min(1, volume));
          a.muted = isMuted;
          a.addEventListener('error', () => {
            if (fallbackSrc) {
              try { a.src = fallbackSrc; } catch (_) {}
            }
          });
          return a;
        };

        audioTracksRef.current = {
          stage_1: createAudio(stage1BgmUrl, './assets/Candy_Coated_Carnage.mp3'),
          boss_1: createAudio(boss1BgmUrl, './assets/boss_battle.wav'),
          stage_2: createAudio(stage2BgmUrl, './assets/level2_bgm.wav'),
          boss_2: createAudio(boss2BgmUrl, './assets/level2_boss.wav'),
        };
      }
    } catch (err) {
      console.warn('[useBackgroundMusic] Failed to initialize Audio objects:', err);
    }

    return () => {
      Object.values(audioTracksRef.current).forEach((audio) => {
        if (audio) {
          try {
            audio.pause();
            audio.src = '';
          } catch (_) {}
        }
      });
      audioTracksRef.current = {};
      activeTrackRef.current = null;
    };
  }, []);

  // Update currentLevelRef
  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  // Update volume and muted state dynamically across all tracks
  useEffect(() => {
    const safeVol = Math.max(0, Math.min(1, volume));
    Object.values(audioTracksRef.current).forEach((audio) => {
      if (audio) {
        audio.volume = safeVol;
        audio.muted = isMuted;
      }
    });
  }, [volume, isMuted]);

  // Handle play / pause / track switching based on gameState, isBossActive & currentLevel
  useEffect(() => {
    const tracks = audioTracksRef.current;
    if (!tracks || Object.keys(tracks).length === 0) return;

    const normalizedState = (gameState || '').toLowerCase();
    const lvlKey = currentLevel === 2 ? '2' : '1';
    const targetTrackKey = isBossActive ? `boss_${lvlKey}` : `stage_${lvlKey}`;
    const targetAudio = tracks[targetTrackKey];

    try {
      if (normalizedState === 'playing') {
        // Pause any active track that is not the target
        Object.entries(tracks).forEach(([key, audio]) => {
          if (key !== targetTrackKey && audio && !audio.paused) {
            audio.pause();
            if (key.startsWith('boss_') && !isBossActive) {
              audio.currentTime = 0;
            }
          }
        });

        // Play the target track
        if (targetAudio && targetAudio.paused) {
          const playPromise = targetAudio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                activeTrackRef.current = targetTrackKey;
              })
              .catch((err) => {
                console.warn(`[useBackgroundMusic] Track ${targetTrackKey} playback awaiting user interaction:`, err);
              });
          }
        }
      } else {
        // Paused, Menu, Game Over, Victory
        Object.values(tracks).forEach((audio) => {
          if (audio && !audio.paused) {
            audio.pause();
          }
        });

        if (normalizedState === 'menu') {
          Object.values(tracks).forEach((audio) => {
            if (audio) audio.currentTime = 0;
          });
        }
        activeTrackRef.current = null;
      }
    } catch (err) {
      console.warn('[useBackgroundMusic] Play/pause error:', err);
    }
  }, [gameState, isBossActive, currentLevel]);

  return { audioTracksRef };
}

export default useBackgroundMusic;
