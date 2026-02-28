import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAppSelector } from '../../store/hooks'
import { format } from 'date-fns'
import { MapPin, Calendar, User, Zap, FileCheck, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ItemDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAppSelector((s) => s.auth)
    const [item, setItem] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [claimDesc, setClaimDesc] = useState('')
    const [claiming, setClaiming] = useState(false)
    const [showClaimForm, setShowClaimForm] = useState(false)

    useEffect(() => {
        api.get(`/items/${id}`).then(r => { setItem(r.data); setLoading(false) }).catch(() => setLoading(false))
    }, [id])

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault()
        setClaiming(true)
        try {
            await api.post('/claims', { itemId: id, description: claimDesc })
            toast.success('Claim submitted! An admin will review shortly.')
            setShowClaimForm(false)
            setClaimDesc('')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit claim')
        } finally { setClaiming(false) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#5A5A5A' }}>Loading...</div>
    if (!item) return <div style={{ textAlign: 'center', padding: '60px', color: '#5A5A5A' }}>Item not found.</div>

    const isOwner = user?.id === item.reporterId
    const allMatches = [...(item.lostMatches || []), ...(item.foundMatches || [])]

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '16px' }}>
                <ArrowLeft size={17} /> Back
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
                {/* Main */}
                <div>
                    <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
                            <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                        </div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '10px' }}>{item.title}</h2>
                        <p style={{ color: '#A0A0A0', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '18px' }}>{item.description}</p>

                        {/* Tags */}
                        {item.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {item.tags.map((tag: string) => (
                                    <span key={tag} style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(20,184,166,0.1)', color: '#3A6FF7', fontSize: '0.75rem' }}>#{tag}</span>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A0A0A0', fontSize: '0.85rem' }}>
                                <MapPin size={16} color="#3A6FF7" /> {item.location}{item.building ? ` · ${item.building}` : ''}{item.floor ? ` · ${item.floor}` : ''}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A0A0A0', fontSize: '0.85rem' }}>
                                <Calendar size={16} color="#3A6FF7" /> {format(new Date(item.dateLostFound), 'MMMM dd, yyyy · h:mm a')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A0A0A0', fontSize: '0.85rem' }}>
                                <User size={16} color="#3A6FF7" /> Reported by {item.reporter?.name} ({item.reporter?.role})
                            </div>
                        </div>
                    </div>

                    {/* Matches section */}
                    {allMatches.length > 0 && (
                        <div className="glass-card" style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Zap size={16} color="#3A6FF7" /> Potential Matches
                            </h3>
                            {allMatches.map((m: any) => (
                                <div key={m.id} onClick={() => navigate(`/matches/${m.id}`)}
                                    style={{ padding: '12px', borderRadius: '10px', background: 'rgba(30,41,59,0.6)', cursor: 'pointer', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#EAEAEA', fontWeight: 600 }}>
                                            {m.lostItem?.title || m.foundItem?.title}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#5A5A5A' }}>Score: {Math.round(m.confidenceScore)}%</div>
                                    </div>
                                    <span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Claim */}
                    {!isOwner && item.status === 'ACTIVE' && (
                        <div className="glass-card" style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileCheck size={16} color="#3A6FF7" /> Submit a Claim
                            </h3>
                            {!showClaimForm ? (
                                <button onClick={() => setShowClaimForm(true)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                    {item.type === 'FOUND' ? 'This is mine!' : 'I found this!'}
                                </button>
                            ) : (
                                <form onSubmit={handleClaim} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <textarea
                                        value={claimDesc} onChange={e => setClaimDesc(e.target.value)}
                                        placeholder="Describe why this item belongs to you or provide proof of ownership..."
                                        required rows={4}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(15,23,42,0.6)', border: '1px solid #1C1C1C', borderRadius: '10px', color: '#EAEAEA', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                    <button type="submit" disabled={claiming} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                                        {claiming ? 'Submitting...' : 'Submit Claim'}
                                    </button>
                                    <button type="button" onClick={() => setShowClaimForm(false)} className="btn btn-ghost" style={{ justifyContent: 'center', fontSize: '0.8rem' }}>Cancel</button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Category chip */}
                    <div className="glass-card" style={{ padding: '16px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#5A5A5A', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</div>
                        <div style={{ fontSize: '0.95rem', color: '#3A6FF7', fontWeight: 700 }}>{item.category}</div>
                    </div>

                    {item.imageUrl && (
                        <div className="glass-card" style={{ padding: '12px' }}>
                            <img src={item.imageUrl} alt={item.title} style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', maxHeight: '200px' }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
