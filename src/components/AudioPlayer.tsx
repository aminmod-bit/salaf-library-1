import { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, SkipBack, SkipForward, Volume2, Gauge, Moon, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function AudioPlayer() {
  const { currentAudio, isPlaying, audioVolume, audioSpeed, setIsPlaying, setAudioVolume, setAudioSpeed, setCurrentAudio, saveAudioProgress, getAudioProgress } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const sleepTimer = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sleepMinutes, setSleepMinutes] = useState(0);

  useEffect(() => {
    if (!audioRef.current || !currentAudio) return;
    const progress = getAudioProgress(currentAudio.id);
    if (progress?.position) {
      audioRef.current.currentTime = progress.position;
      setCurrentTime(progress.position);
    }
  }, [currentAudio?.id]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
        toast('Аудиофайл пока не добавлен', { icon: '🎧' });
      });
    } else audioRef.current.pause();
  }, [isPlaying, setIsPlaying]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = audioVolume; }, [audioVolume]);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = audioSpeed; }, [audioSpeed]);

  useEffect(() => {
    if (sleepTimer.current) window.clearTimeout(sleepTimer.current);
    if (sleepMinutes > 0) {
      sleepTimer.current = window.setTimeout(() => {
        setIsPlaying(false);
        setSleepMinutes(0);
        toast('Таймер сна остановил аудио', { icon: '🌙' });
      }, sleepMinutes * 60 * 1000);
    }
    return () => { if (sleepTimer.current) window.clearTimeout(sleepTimer.current); };
  }, [sleepMinutes, setIsPlaying]);

  const persist = (position: number, d = duration) => {
    if (!currentAudio) return;
    saveAudioProgress({
      audioId: currentAudio.id,
      position,
      duration: d || 0,
      lastPlayed: new Date().toISOString(),
      title: currentAudio.title,
      author: currentAudio.author,
      coverColor: currentAudio.coverColor,
      coverEmoji: currentAudio.coverEmoji,
      coverImage: currentAudio.coverImage,
    });
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);
    if (Math.floor(t) % 8 === 0) persist(t, audioRef.current.duration || duration);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    if (currentAudio) {
      const progress = getAudioProgress(currentAudio.id);
      if (progress?.position && progress.position < audioRef.current.duration - 3) {
        audioRef.current.currentTime = progress.position;
        setCurrentTime(progress.position);
      }
    }
  };

  const seekTo = (t: number) => {
    const next = Math.min(Math.max(t, 0), duration || 0);
    setCurrentTime(next);
    if (audioRef.current) audioRef.current.currentTime = next;
    persist(next);
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => seekTo(Number(e.target.value));
  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
  };
  const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
  const nextSpeed = () => setAudioSpeed(speeds[(speeds.indexOf(audioSpeed) + 1) % speeds.length]);
  const nextSleep = () => setSleepMinutes(prev => prev === 0 ? 15 : prev === 15 ? 30 : prev === 30 ? 60 : 0);

  if (!currentAudio) return null;
  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player-bar">
      <style>{css}</style>
      <audio ref={audioRef} src={currentAudio.fileUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => { persist(duration, duration); setIsPlaying(false); }} />
      <div className={`audio-cover ${isPlaying ? 'playing' : ''}`} style={{ background: currentAudio.coverColor || '#1a3a2a' }}>{currentAudio.coverEmoji || '🎧'}</div>
      <div className="audio-info"><b>{currentAudio.title}</b><span>{currentAudio.author}</span></div>
      <div className="audio-controls">
        <button onClick={() => seekTo(currentTime - 15)} title="Назад 15 секунд"><SkipBack size={18} /></button>
        <button className="play" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause size={18}/> : <Play size={18}/>}</button>
        <button onClick={() => seekTo(currentTime + 30)} title="Вперёд 30 секунд"><SkipForward size={18} /></button>
      </div>
      <div className="audio-progress-wrap">
        <span>{formatTime(currentTime)}</span>
        <div className="bar"><div style={{ width: `${pct}%` }} /><input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek}/></div>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="audio-tools">
        <button onClick={nextSpeed}><Gauge size={12}/>{audioSpeed}x</button>
        <button onClick={nextSleep} className={sleepMinutes ? 'active' : ''}><Moon size={12}/>{sleepMinutes ? `${sleepMinutes}м` : 'Сон'}</button>
        <button onClick={() => seekTo(0)} title="Сначала"><RotateCcw size={14}/></button>
        <div className="volume"><Volume2 size={15}/><input type="range" min={0} max={1} step={0.05} value={audioVolume} onChange={(e)=>setAudioVolume(Number(e.target.value))}/></div>
        <button onClick={() => { persist(currentTime); setCurrentAudio(null); setIsPlaying(false); }}><X size={16}/></button>
      </div>
    </div>
  );
}

const css = `
.audio-player-bar{position:fixed;bottom:0;left:260px;right:0;min-height:86px;background:var(--color-bg-glass);border-top:1px solid var(--color-border);backdrop-filter:blur(20px);z-index:100;display:flex;align-items:center;padding:12px 22px;gap:18px;box-shadow:0 -4px 20px rgba(0,0,0,.15)}.audio-cover{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:0 6px 18px rgba(0,0,0,.45);position:relative}.audio-cover.playing::after{content:'';position:absolute;inset:-5px;border-radius:18px;border:1px solid var(--color-gold);animation:pulseAudio 1.6s ease-in-out infinite}@keyframes pulseAudio{0%,100%{opacity:.35;transform:scale(.96)}50%{opacity:1;transform:scale(1.05)}}.audio-info{flex:0 0 230px;min-width:0}.audio-info b{display:block;font-size:13px;color:var(--color-text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.audio-info span{font-size:11px;color:var(--color-text-secondary)}.audio-controls,.audio-tools{display:flex;align-items:center;gap:9px}.audio-controls button,.audio-tools button{border:0;background:transparent;color:var(--color-text-secondary);cursor:pointer;border-radius:10px;padding:7px;display:flex;align-items:center;gap:4px}.audio-tools button{border:1px solid var(--color-border);background:var(--color-bg-hover);font-size:11px;color:var(--color-gold)}.audio-tools button.active{background:rgba(212,175,55,.18)}.audio-controls .play{width:42px;height:42px;border-radius:50%;justify-content:center;background:linear-gradient(135deg,var(--color-gold),var(--color-gold-light));color:#07130b;box-shadow:0 6px 18px rgba(212,175,55,.35)}.audio-progress-wrap{flex:1;display:flex;align-items:center;gap:10px;min-width:180px}.audio-progress-wrap span{font-size:11px;color:var(--color-text-muted);width:44px;text-align:center}.bar{height:6px;flex:1;position:relative;background:var(--color-bg-hover);border-radius:999px}.bar>div{height:100%;background:linear-gradient(90deg,var(--color-gold),var(--color-gold-light));border-radius:999px}.bar input{position:absolute;inset:-6px 0 0 0;width:100%;opacity:.02;cursor:pointer}.volume{display:flex;align-items:center;gap:5px;color:var(--color-text-muted)}.volume input{width:72px}@media(max-width:1024px){.audio-player-bar{left:0}}@media(max-width:780px){.audio-player-bar{display:grid;grid-template-columns:44px 1fr auto;gap:10px;padding:10px 12px}.audio-cover{width:44px;height:44px}.audio-info{flex:auto}.audio-progress-wrap{grid-column:1/-1;order:5}.audio-tools{grid-column:1/-1;justify-content:space-between;overflow-x:auto}.volume{display:none}.audio-controls{gap:4px}.audio-tools button{white-space:nowrap}}
`;
