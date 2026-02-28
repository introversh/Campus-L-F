import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Search, AlertCircle, CheckCircle, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminItems() {
    const navigate = useNavigate()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({ type: '', status: '', search: '' })

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams({ limit: '50', ...Object.fromEntries(Object.entries(filter).filter(([, v]) => v)) })
            api.get(`/items?${params}`).then(r => { setItems(r.data.data || r.data); setLoading(false) }).catch(() => setLoading(false))
        }, filter.search ? 400 : 0)
        return () => clearTimeout(timer)
    }, [filter])

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Item Moderation</h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>{items.length} items shown</p>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '14px', marginBottom: '16px', display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#5A5A5A' }} />
                    <input placeholder="Search..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} className="form-input" style={{ paddingLeft: '32px' }} />
                </div>
                <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="form-input" style={{ width: '120px' }}>
                    <option value="">All Types</option>
                    <option value="LOST">Lost</option>
                    <option value="FOUND">Found</option>
                </select>
                <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="form-input" style={{ width: '130px' }}>
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="MATCHED">Matched</option>
                    <option value="CLAIMED">Claimed</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '50px', color: '#5A5A5A' }}>Loading...</div> : items.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <Search size={44} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#5A5A5A', fontSize: '0.9rem' }}>No items found moderation queue.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Item', 'Type', 'Category', 'Location', 'Reporter', 'Date', 'Status'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.72rem', color: '#5A5A5A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111111' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #111111', cursor: 'pointer' }}
                                    onClick={() => navigate(`/items/${item.id}`)}
                                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.4)'}
                                    onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EAEAEA' }}>{item.title}</div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span className={`badge badge-${item.type.toLowerCase()}`}>
                                            {item.type === 'LOST' ? <AlertCircle size={11} /> : <CheckCircle size={11} />} {item.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.82rem', color: '#A0A0A0' }}>{item.category}</td>
                                    <td style={{ padding: '12px', fontSize: '0.82rem', color: '#A0A0A0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} color="#3A6FF7" />{item.location}</div>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.82rem', color: '#A0A0A0' }}>{item.reporter?.name}</td>
                                    <td style={{ padding: '12px', fontSize: '0.78rem', color: '#5A5A5A' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} />{format(new Date(item.dateLostFound), 'MMM dd')}</div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
