import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { FileCheck, Check, X, Clock } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminClaims() {
    const [claims, setClaims] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        api.get('/claims/admin/all').then(r => { setClaims(r.data); setLoading(false) }).catch(() => setLoading(false))
    }, [])

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/claims/${id}/approve`, {})
            toast.success('Claim approved and item marked as CLAIMED')
            setClaims(c => c.map(cl => cl.id === id ? { ...cl, status: 'APPROVED' } : cl))
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    }

    const handleReject = async (id: string) => {
        try {
            await api.patch(`/claims/${id}/reject`, {})
            toast.success('Claim rejected')
            setClaims(c => c.map(cl => cl.id === id ? { ...cl, status: 'REJECTED' } : cl))
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    }

    const filtered = filter === 'ALL' ? claims : claims.filter((c: any) => c.status === filter)

    const tabs = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']
    const counts: Record<string, number> = { ALL: claims.length, PENDING: claims.filter((c: any) => c.status === 'PENDING').length, APPROVED: claims.filter((c: any) => c.status === 'APPROVED').length, REJECTED: claims.filter((c: any) => c.status === 'REJECTED').length }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Claim Review</h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>{counts.PENDING} pending review</p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'rgba(30,41,59,0.5)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setFilter(tab)} style={{
                        padding: '7px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                        background: filter === tab ? 'rgba(58, 111, 247, 0.14)' : 'transparent',
                        color: filter === tab ? '#3A6FF7' : '#5A5A5A', fontWeight: 700, fontSize: '0.8rem',
                    }}>
                        {tab} {counts[tab] > 0 && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.7 }}>({counts[tab]})</span>}
                    </button>
                ))}
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '50px', color: '#5A5A5A' }}>Loading...</div>
                : filtered.length === 0 ? (
                    <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
                        <FileCheck size={40} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: '#5A5A5A', fontSize: '0.9rem' }}>No claims in this category.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filtered.map((claim: any) => (
                            <div key={claim.id} className="glass-card" style={{ padding: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '3px' }}>
                                            {claim.item?.title}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#A0A0A0' }}>
                                            Claimed by: <strong style={{ color: '#EAEAEA' }}>{claim.claimant?.name}</strong> ({claim.claimant?.email}) · {claim.claimant?.role}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#2A2A2A', marginTop: '3px' }}>
                                            <Clock size={11} /> {format(new Date(claim.createdAt), 'MMM dd, yyyy · h:mm a')}
                                        </div>
                                    </div>
                                    <span className={`badge badge-${claim.status.toLowerCase()}`}>{claim.status}</span>
                                </div>
                                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(15,23,42,0.5)', marginBottom: '12px', borderLeft: '3px solid #1C1C1C' }}>
                                    <p style={{ fontSize: '0.82rem', color: '#A0A0A0', fontStyle: 'italic', lineHeight: 1.6 }}>"{claim.description}"</p>
                                </div>
                                {claim.status === 'PENDING' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleApprove(claim.id)} className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.82rem', background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                                            <Check size={14} /> Approve Claim
                                        </button>
                                        <button onClick={() => handleReject(claim.id)} className="btn btn-danger" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
        </div>
    )
}
