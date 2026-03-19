export default function BottomNav({ active = 'home', onChange }) {
  const tabs = [
    { id: 'home', label: 'HOME', icon: '🏠' },
    { id: 'play', label: 'PLAY', icon: '⚡' },
    { id: 'explore', label: 'EXPLORE', icon: '🕸️' },
    { id: 'profile', label: 'PROFILE', icon: '👤' },
  ]

  return (
    <div className="app-bottomnav-inner">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '8px 16px',
              borderRadius: '14px',
              background: isActive ? 'rgba(0,212,184,0.12)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: '10px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: isActive ? 'var(--teal)' : 'var(--text3)',
              textTransform: 'uppercase',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
