import { useEffect, useRef } from 'react';

// Master switch — set to false to disable Vanta globally
const ENABLE_VANTA_AZKAR = true;

// Check if user prefers reduced motion
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Check if mobile device
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

// Load script dynamically
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

interface VantaCloudsBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function VantaCloudsBackground({ className, style }: VantaCloudsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<any>(null);

  useEffect(() => {
    if (!ENABLE_VANTA_AZKAR) return;
    if (prefersReducedMotion()) return;
    if (isMobile()) return; // Skip on mobile for performance

    let cancelled = false;

    async function initVanta() {
      try {
        // Load three.js
        const THREE = await import('three');
        (window as any).THREE = THREE;

        // Load Vanta script
        await loadScript('./vendor/vanta.clouds.min.js');

        if (cancelled || !containerRef.current) return;
        if (!(window as any).VANTA?.CLOUDS) return;

        vantaRef.current = (window as any).VANTA.CLOUDS({
          el: containerRef.current,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          skyColor: 0x0d2218,
          cloudColor: 0x1a3a24,
          cloudShadowColor: 0x0a1a0f,
          sunColor: 0xd4af37,
          sunBrightness: 0.3,
          speed: 0.3,
          opacity: 0.7,
        });
      } catch (e) {
        // Silently fail — don't break the site
        console.warn('Vanta Clouds failed to initialize:', e);
      }
    }

    initVanta();

    return () => {
      cancelled = true;
      if (vantaRef.current) {
        try {
          vantaRef.current.destroy();
        } catch {}
        vantaRef.current = null;
      }
    };
  }, []);

  // Don't render anything if disabled
  if (!ENABLE_VANTA_AZKAR) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}
