import { useEffect, useRef, useState } from 'react'
import { getGraphData } from '../api'

export default function SemanticGraphPage({ word, onNavigate }) {
  const containerRef = useRef(null)
  const networkRef = useRef(null)
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSense, setSelectedSense] = useState(null)

  useEffect(() => {
    if (!word?.tamil) return
    setLoading(true)
    setError('')
    getGraphData(word.tamil)
      .then(res => setGraphData(res))
      .catch(err => {
        setError('Failed to load graph data.')
      })
      .finally(() => setLoading(false))
  }, [word?.tamil])

  useEffect(() => {
    if (!graphData || !containerRef.current) return
    let destroyed = false

    import('vis-network').then(({ Network }) => {
      if (destroyed) return

      const options = {
        physics: {
          enabled: true,
          stabilization: { iterations: 100 },
          forceAtlas2Based: { gravitationalConstant: -60, springLength: 100 },
        },
        interaction: { zoomView: true, dragView: true, hover: true },
        nodes: { borderWidth: 2 },
        edges: { smooth: { type: 'curvedCW', roundness: 0.2 } },
      }

      networkRef.current = new Network(
        containerRef.current,
        { nodes: graphData.nodes, edges: graphData.edges },
        options
      )

      networkRef.current.on('stabilizationIterationsDone', () => {
        networkRef.current?.setOptions({ physics: { enabled: false } })
      })

      networkRef.current.on('click', (params) => {
        if (params.nodes.length > 0) {
          const node = graphData.nodes.find(n => n.id === params.nodes[0])
          if (node?.type === 'sense') {
            setSelectedSense(node)
          }
        }
      })
    }).catch(() => setError('Failed to render graph network.'))

    return () => {
      destroyed = true
      networkRef.current?.destroy()
      networkRef.current = null
    }
  }, [graphData])

  if (!word?.tamil) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 16px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕸️</div>
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '16px', textAlign: 'center', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '14px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)' }}>
            Select a word to explore its semantic relationships
          </p>
        </div>
        <button
          onClick={() => onNavigate?.('home')}
          style={{
            background: 'linear-gradient(135deg, #00897B, #00D4B8)', border: 'none',
            borderRadius: '12px', padding: '12px 24px', color: '#fff',
            fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer',
          }}
        >
          ← Go to Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Section A — Word header */}
      <div style={{ padding: '0 20px 8px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'Nunito', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '4px' }}>
          Semantic web for
        </div>
        <div style={{ fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '28px' }}>
          <span style={{ color: 'var(--teal)' }}>{word.tamil}</span>
          <span style={{ color: 'var(--text)', marginLeft: '8px', fontSize: '18px', fontFamily: 'Nunito', fontWeight: 700 }}>({word.roman})</span>
        </div>
      </div>

      {/* Section B — Legend pills */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 20px 12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Noun sense', color: 'var(--purple)' },
          { label: 'Verb sense', color: 'var(--teal)' },
          { label: 'Morph form', color: 'var(--gold)' },
          { label: 'Example', color: 'rgba(255,255,255,0.2)' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Nunito', fontWeight: 700, color: 'var(--text3)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Section C — Graph canvas */}
      {loading && (
        <div style={{
          margin: '0 16px 14px', background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: '22px', height: '320px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }} className="animate-pip-pulse">✨</div>
            <div style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text3)' }}>Building semantic web...</div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '0 16px', marginBottom: '14px' }}>
          <div style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '16px', textAlign: 'center', marginBottom: '10px',
          }}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>⚠️</span>
            <span style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text2)' }}>{error}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setError(''); setLoading(true); getGraphData(word.tamil).then(r => setGraphData(r)).catch(() => setError('Failed.')).finally(() => setLoading(false)) }}
              style={{ flex: 1, background: 'linear-gradient(135deg, #00897B, #00D4B8)', border: 'none', borderRadius: '12px', padding: '10px', color: '#fff', fontFamily: 'Nunito', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              ↻ Retry
            </button>
            <button onClick={() => onNavigate?.('home')}
              style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '10px', color: 'var(--text2)', fontFamily: 'Nunito', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              ← Home
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div style={{
          margin: '0 16px 14px', background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: '22px', overflow: 'hidden', height: '320px',
        }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Section D — Selected sense info card */}
      {selectedSense ? (
        <div style={{
          margin: '0 16px 14px', background: 'var(--teal-dim)',
          border: '1px solid var(--teal-border)', borderRadius: '18px', padding: '16px 18px',
        }}>
          <div style={{ fontSize: '10px', fontFamily: 'Nunito', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(0,212,184,0.55)', marginBottom: '6px' }}>
            Selected · {selectedSense.sense_label || selectedSense.label}
          </div>
          {selectedSense.title && (
            <div style={{ fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '18px', color: 'var(--text)', lineHeight: 1.4 }}>
              {selectedSense.title}
            </div>
          )}
        </div>
      ) : (!loading && !error && (
        <div style={{
          margin: '0 16px 14px', background: 'var(--surface2)',
          border: '1px solid var(--border)', borderRadius: '18px', padding: '14px 18px',
        }}>
          <div style={{ fontSize: '13px', fontFamily: 'Nunito', fontWeight: 600, color: 'var(--text3)', textAlign: 'center' }}>
            Tap any sense node to explore it
          </div>
        </div>
      ))}

      {/* Section E — Challenge button */}
      <div style={{ padding: '0 16px' }}>
        <button
          onClick={() => onNavigate?.('play', {
            word,
            senseId: selectedSense?.sense_id || null,
          })}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #00897B, #00D4B8)',
            border: 'none', borderRadius: '16px', padding: '16px',
            fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '16px', color: '#fff',
            boxShadow: '0 6px 20px rgba(0,212,184,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'pointer',
          }}
        >
          ⚡ {selectedSense ? `Challenge: ${selectedSense.sense_label || selectedSense.label}` : 'Challenge this word'}
        </button>
      </div>
    </div>
  )
}
