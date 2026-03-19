export default function TopBar() {
  const xp = parseInt(localStorage.getItem('mozhisense_xp') || '0', 10)

  return (
    <div className="app-topbar-inner">
      <div style={{
        fontFamily: '"Baloo 2", sans-serif',
        fontWeight: 800,
        fontSize: '22px',
        color: 'var(--text)',
        lineHeight: 1,
      }}>
        Mozhi<span style={{ color: 'var(--teal)' }}>Sense</span>
      </div>

      <div style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border2)',
        borderRadius: '100px',
        padding: '7px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <span style={{ fontSize: '13px' }}>⭐</span>
        <span style={{
          fontFamily: '"Baloo 2", sans-serif',
          fontWeight: 800,
          fontSize: '13px',
          color: 'var(--gold)',
        }}>
          {xp} XP
        </span>
      </div>
    </div>
  )
}
