import { useEffect, useRef } from 'react';
import bgmUrl from '../assets/sugar_strike_fury.mp3';

/**
 * Custom hook for background music (BGM) management in React.
 *
 * @param {string} gameState - Current game state ('PLAYING', 'PAUSED', 'MENU', 'GAME_OVER', 'VICTORY')
 * @param {number} [volume=0.5] - Audio volume between 0 and 1
 * @param {boolean} [isMuted=false] - Whether the audio is muted
 */
export function useBackgroundMusic(gameState, volume = 0.5, isMuted = false) {
  const audioRef = useRef(null);

  // Initialize and cleanup Audio instance safely
  useEffect(() => {
    try {
      const audio = new Audio(bgmUrl);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.muted = isMuted;

      audioRef.current = audio;
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
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[useBackgroundMusic] Audio playback awaiting user interaction:', err);
          });
        }
      } else {
        audio.pause();
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
