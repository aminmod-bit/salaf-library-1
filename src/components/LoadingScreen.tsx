export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)',
    }}>
      <img
        src="./logo-mark.svg"
        alt="Salaf Library"
        style={{
          width: '72px',
          height: '72px',
          marginBottom: '20px',
          filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.3))',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      <h1 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: '4px',
      }}>
        Salaf Library
      </h1>
      <p style={{
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '24px',
      }}>
        Загрузка...
      </p>
      <div style={{
        width: '120px',
        height: '2px',
        background: 'var(--color-bg-card)',
        borderRadius: '999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-light))',
          borderRadius: '999px',
          animation: 'loading 1.5s ease-in-out infinite',
        }} />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes loading {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
