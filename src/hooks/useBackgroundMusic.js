import { useEffect, useRef } from 'react';
import bgmUrl from '../assets/Candy_Coated_Carnage.mp3';

/**
 * Custom hook for background music (BGM) management in React.
 *
 * @param {string} gameState - Current game state ('PLAYING', 'PAUSED', 'MENU', 'GAME_OVER', 'VICTORY')
 * @param {number} [volume=0.5] - Audio volume between 0 and 1
 * @param {boolean} [isMuted=false] - Whether the audio is muted
 */
export function useBackgroundMusic(gameState, volume = 0.5, isMuted = false) {
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Initialize and cleanup Audio instance safely
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof Audio !== 'undefined' && bgmUrl) {
        const audio = new Audio();
        audio.src = bgmUrl;
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.muted = isMuted;

        audio.addEventListener('error', () => {
          // Fallback to relative public assets path if bundled URL is unreachable
          try {
            audio.src = './assets/Candy_Coated_Carnage.mp3';
          } catch (_) {}
        });

        audioRef.current = audio;
      }
    } catch (err) {
      console.warn('[useBackgroundMusic] Failed to initialize Audio object:', err);
    }

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
        } catch (_) {}
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume and muted state dynamically
  useEffect(() => {
    if (!audioRef.current) return;
    try {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      audioRef.current.muted = isMuted;
    } catch (err) {
      console.warn('[useBackgroundMusic] Failed to update volume/mute:', err);
    }
  }, [volume, isMuted]);

  // Handle play / pause based on gameState
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const normalizedState = (gameState || '').toLowerCase();

    try {
      if (normalizedState === 'playing') {
        if (!isPlayingRef.current) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                isPlayingRef.current = true;
              })
              .catch((err) => {
                isPlayingRef.current = false;
                console.warn('[useBackgroundMusic] Audio playback awaiting user interaction:', err);
              });
          }
        }
      } else {
        if (isPlayingRef.current) {
          audio.pause();
          isPlayingRef.current = false;
        }
        if (normalizedState === 'menu') {
          audio.currentTime = 0;
        }
      }
    } catch (err) {
      console.warn('[useBackgroundMusic] Play/pause error:', err);
    }
  }, [gameState]);

  return audioRef;
}

export default useBackgroundMusic;
