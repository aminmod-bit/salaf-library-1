import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { getLocalOnlineCount, heartbeatOnline, sendStatsEvent } from '../utils/siteStats';

export default function LiveStatsBadge() {
  const [online, setOnline] = useState(getLocalOnlineCount());

  useEffect(() => {
    const tick = () => {
      const count = heartbeatOnline();
      setOnline(count);
      sendStatsEvent('heartbeat', { path: location.hash || '/' }).then(data => {
        if (data?.online) setOnline(Number(data.online));
      });
    };
    tick();
    const interval = window.setInterval(tick, 15000);
    const listener = () => setOnline(getLocalOnlineCount());
    window.addEventListener('salaf-library-online-update', listener);
    window.addEventListener('storage', listener);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('salaf-library-online-update', listener);
      window.removeEventListener('storage', listener);
    };
  }, []);

  return (
    <div title="Онлайн-счётчик. Без backend показывает активные вкладки текущего браузера; с Cloudflare Worker станет глобальным." style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '7px 10px', borderRadius: 10,
      border: '1px solid var(--color-border)',
      background: 'var(--color-bg-hover)', color: 'var(--color-green-light)',
      fontSize: 12, fontWeight: 800,
    }}>
      <Activity size={14} />
      <span>{online}</span>
      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>online</span>
    </div>
  );
}
