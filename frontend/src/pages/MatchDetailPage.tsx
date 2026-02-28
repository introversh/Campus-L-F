import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAppSelector } from '../store/hooks'
import { ArrowLeft, MessageSquare, Check, X, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MatchDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAppSelector((s) => s.auth)
    const [match, setMatch] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [chatLoading, setChatLoading] = useState(false)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SECURITY'

    useEffect(() => {
        api.get(`/matches/${id}`).then(r => { setMatch(r.data); setLoading(false) }).catch(() => setLoading(false))
    }, [id])

    const handleConfirm = async () => {
        try {
            await api.patch(`/matches/${id}/confirm`)
            toast.success('Match confirmed! Chat room created.')
            setMatch((m: any) => ({ ...m, status: 'CONFIRMED' }))
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    }

    const handleReject = async () => {
        try {
            await api.patch(`/matches/${id}/reject`)
            toast.success('Match rejected')
            setMatch((m: any) => ({ ...m, status: 'REJECTED' }))
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    }

    const handleOpenChat = async () => {
        setChatLoading(true)
        try {
            const { data: room } = await api.post(`/matches/${id}/open-chat`)
            navigate(`/chat/${room.id}`)
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Could not open chat')
            setChatLoading(false)
        }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#5A5A5A' }}>Loading...</div>
    if (!match) return <div style={{ textAlign: 'center', padding: '60px', color: '#5A5A5A' }}>Match not found.</div>

    // Determine if current user is a participant in this match
    const isParticipant =
        user?.id === match.lostItem?.reporter?.id ||
        user?.id === match.foundItem?.reporter?.id
    const isRejected = match.status === 'REJECTED'

    return (
        <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '16px' }}>
                <ArrowLeft size={17} /> Back
            </button>

            <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(20,184,166,0.1)' }}>
                            <Zap size={20} color="#3A6FF7" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#EAEAEA' }}>Match Analysis</div>
                            <div style={{ fontSize: '0.8rem', color: '#3A6FF7', fontWeight: 700 }}>Confidence: {Math.round(match.confidenceScore)}%</div>
                        </div>
                    </div>
                    <span className={`badge badge-${match.status.toLowerCase()}`}>{match.status}</span>
                </div>

                {/* Confidence bar */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ height: '8px', background: '#111111', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: '4px',
                            background: 'linear-gradient(90deg, #2D5CD4, #3A6FF7)',
                            width: `${match.confidenceScore}%`,
                        }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[{ label: 'Lost Item', item: match.lostItem, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                    { label: 'Found Item', item: match.foundItem, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' }
                    ].map(({ label, item, color, bg }) => (
                        <div key={label} style={{ padding: '16px', borderRadius: '12px', background: bg, border: `1px solid ${color}25` }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>{label}</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '4px' }}>{item?.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#5A5A5A' }}>{item?.description?.slice(0, 80)}...</div>
                            <div style={{ fontSize: '0.75rem', color: '#A0A0A0', marginTop: '8px' }}>📍 {item?.location}</div>
                            <div style={{ fontSize: '0.75rem', color: '#A0A0A0' }}>👤 {item?.reporter?.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
                {/* Any participant can open/start chat (unless match is rejected) */}
                {(isParticipant || isAdmin) && !isRejected && (
                    <button
                        onClick={handleOpenChat}
                        disabled={chatLoading}
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        <MessageSquare size={16} />
                        {chatLoading ? 'Opening...' : match.chatRoom ? 'Open Chat' : 'Start Chat'}
                    </button>
                )}

                {/* Admin-only: confirm / reject on pending matches */}
                {isAdmin && match.status === 'PENDING' && (
                    <>
                        <button onClick={handleConfirm} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                            <Check size={16} /> Confirm Match
                        </button>
                        <button onClick={handleReject} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
                            <X size={16} /> Reject
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

