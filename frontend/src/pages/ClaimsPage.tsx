import { useEffect, useState } from 'react'
import api from '../api/axios'
import { FileCheck, Clock, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { useAppSelector } from '../store/hooks'
import toast from 'react-hot-toast'

export default function ClaimsPage() {
    const { user } = useAppSelector((s) => s.auth)
    const [claims, setClaims] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SECURITY'

    useEffect(() => {
        const url = isAdmin ? '/claims/admin/all' : '/claims'
        api.get(url).then(r => { setClaims(r.data); setLoading(false) }).catch(() => setLoading(false))
    }, [isAdmin])

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/claims/${id}/approve`, {})
            toast.success('Claim approved')
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

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>
                    {isAdmin ? 'Claim Management' : 'My Claims'}
                </h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>{claims.length} {isAdmin ? 'total' : 'submitted'} claims</p>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '50px', color: '#5A5A5A' }}>Loading...</div>
                : claims.length === 0 ? (
                    <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <FileCheck size={44} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: '#5A5A5A', fontSize: '0.9rem' }}>No claims yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {claims.map((claim: any) => (
                            <div key={claim.id} className="glass-card" style={{ padding: '18px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '3px' }}>
                                            {claim.item?.title}
                                        </div>
                                        {isAdmin && <div style={{ fontSize: '0.78rem', color: '#A0A0A0' }}>By: {claim.claimant?.name} ({claim.claimant?.email})</div>}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#5A5A5A', marginTop: '3px' }}>
                                            <Clock size={11} /> {format(new Date(claim.createdAt), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                    <span className={`badge badge-${claim.status.toLowerCase()}`}>{claim.status}</span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#A0A0A0', marginBottom: '10px', fontStyle: 'italic', borderLeft: '2px solid #1C1C1C', paddingLeft: '10px' }}>
                                    "{claim.description}"
                                </p>
                                {claim.adminNote && (
                                    <p style={{ fontSize: '0.78rem', color: '#f59e0b', marginBottom: '10px' }}>Admin Note: {claim.adminNote}</p>
                                )}
                                {isAdmin && claim.status === 'PENDING' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleApprove(claim.id)} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                                            <Check size={14} /> Approve
                                        </button>
                                        <button onClick={() => handleReject(claim.id)} className="btn btn-danger" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
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
