import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Zap, AlertCircle, CheckCircle } from 'lucide-react'

export default function MatchesPage() {
    const navigate = useNavigate()
    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/matches').then(r => { setMatches(r.data); setLoading(false) }).catch(() => setLoading(false))
    }, [])

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Match Center</h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>Potential matches detected by our intelligent matching engine</p>
            </div>

            {loading ? (
                <div style={{ color: '#5A5A5A', textAlign: 'center', padding: '50px' }}>Loading matches...</div>
            ) : matches.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <Zap size={44} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#5A5A5A', fontSize: '0.9rem' }}>No matches yet. Report an item to get started!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {matches.map((m: any) => (
                        <div key={m.id} className="glass-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => navigate(`/matches/${m.id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(20,184,166,0.1)' }}>
                                        <Zap size={18} color="#3A6FF7" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EAEAEA' }}>
                                            Match Found
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#5A5A5A' }}>
                                            Confidence: <span style={{ color: m.confidenceScore >= 70 ? '#22c55e' : m.confidenceScore >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>{Math.round(m.confidenceScore)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
                                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                        <AlertCircle size={13} color="#ef4444" />
                                        <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>Lost</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EAEAEA' }}>{m.lostItem?.title}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#5A5A5A' }}>{m.lostItem?.reporter?.name}</div>
                                </div>
                                <div style={{ fontSize: '1.2rem', color: '#3A6FF7' }}>↔</div>
                                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                        <CheckCircle size={13} color="#22c55e" />
                                        <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase' }}>Found</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EAEAEA' }}>{m.foundItem?.title}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#5A5A5A' }}>{m.foundItem?.reporter?.name}</div>
                                </div>
                            </div>

                            {/* Confidence bar */}
                            <div style={{ marginTop: '14px' }}>
                                <div style={{ height: '4px', background: '#111111', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: '2px',
                                        background: m.confidenceScore >= 70 ? '#22c55e' : m.confidenceScore >= 50 ? '#f59e0b' : '#ef4444',
                                        width: `${m.confidenceScore}%`, transition: 'width 0.8s ease',
                                    }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
