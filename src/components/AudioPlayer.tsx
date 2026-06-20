import { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, SkipBack, SkipForward, Volume2, Gauge } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function AudioPlayer() {
  const { currentAudio, isPlaying, audioVolume, audioSpeed, setIsPlaying, setAudioVolume, setAudioSpeed, setCurrentAudio, saveAudioProgress } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
        toast('Аудио недоступно в демо-режиме', { icon: '🎧' });
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioSpeed;
    }
  }, [audioSpeed]);

  const handleTimeUpdate = () => {
    if (!audioRef.current || !currentAudio) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);
    if (t % 10 < 0.5) {
      saveAudioProgress({
        audioId: currentAudio.id,
        position: t,
        duration: audioRef.current.duration || 0,
        lastPlayed: new Date().toISOString(),
        title: currentAudio.title,
        author: currentAudio.author,
        coverColor: currentAudio.coverColor,
        coverEmoji: currentAudio.coverEmoji,
      });
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const nextSpeed = () => {
    const i = speeds.indexOf(audioSpeed);
    setAudioSpeed(speeds[(i + 1) % speeds.length]);
  };

  if (!currentAudio) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '260px',
      right: 0,
      height: '80px',
      background: 'linear-gradient(135deg, #091810 0%, #0a1f12 100%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.2)',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '20px',
    }}
    className="audio-player-bar"
    >
      <style>{`
        @media (max-width: 1024px) {
          .audio-player-bar { left: 0 !important; }
        }
      `}</style>

      <audio
        ref={audioRef}
        src={currentAudio.fileUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Cover */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        background: currentAudio.coverColor || '#1a3a2a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}>
        {currentAudio.coverEmoji || '🎧'}
      </div>

      {/* Info */}
      <div style={{ flex: '0 0 200px', minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#f0f4f1',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {currentAudio.title}
        </div>
        <div style={{ fontSize: '11px', color: '#9db8a3' }}>{currentAudio.author}</div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button style={{ background: 'none', border: 'none', color: '#9db8a3', cursor: 'pointer', padding: '4px' }}>
          <SkipBack size={18} />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4af37, #f0c84a)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(212,175,55,0.4)',
          }}
        >
          {isPlaying ? <Pause size={18} color="#0a1a0f" /> : <Play size={18} color="#0a1a0f" />}
        </button>

        <button style={{ background: 'none', border: 'none', color: '#9db8a3', cursor: 'pointer', padding: '4px' }}>
          <SkipForward size={18} />
        </button>
      </div>

      {/* Progress */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '11px', color: '#5a7a63', width: '35px', textAlign: 'right' }}>
          {formatTime(currentTime)}
        </span>
        <div style={{ flex: 1, position: 'relative', height: '4px' }}>
          <div style={{
            position: 'absolute',
            top: 0, left: 0,
            height: '4px',
            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            background: 'linear-gradient(to right, #d4af37, #f0c84a)',
            borderRadius: '2px',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="audio-progress"
            style={{ position: 'absolute', top: '-4px', left: 0, right: 0, width: '100%', opacity: 0.01, height: '12px', cursor: 'pointer', zIndex: 2 }}
          />
          <div style={{
            height: '4px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
          }} />
        </div>
        <span style={{ fontSize: '11px', color: '#5a7a63', width: '35px' }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* Speed & Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={nextSpeed}
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '6px',
            padding: '4px 8px',
            color: '#d4af37',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Gauge size={12} />
          {audioSpeed}x
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Volume2 size={16} color="#5a7a63" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={audioVolume}
            onChange={(e) => setAudioVolume(Number(e.target.value))}
            className="audio-progress"
            style={{ width: '70px' }}
          />
        </div>

        <button
          onClick={() => { setCurrentAudio(null); setIsPlaying(false); }}
          style={{ background: 'none', border: 'none', color: '#5a7a63', cursor: 'pointer', padding: '4px' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
