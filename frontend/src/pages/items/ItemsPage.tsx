import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { AlertCircle, CheckCircle, Search, Plus, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Documents', 'Keys', 'Bags', 'Accessories', 'Sports', 'Other']

export default function ItemsPage() {
    const navigate = useNavigate()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ type: '', category: '', status: '', search: '' })
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 640)
            setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
        }
        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        const params = new URLSearchParams({ page: page.toString(), limit: '12', ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) })
        const { data } = await api.get(`/items?${params}`)
        setItems(data.data)
        setMeta(data.meta)
        setLoading(false)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchItems()
        }, filters.search ? 400 : 0) // Debounce search, but not dropdowns
        return () => clearTimeout(timer)
    }, [filters, page])

    const getGridCols = () => {
        if (isMobile) return '1fr'
        if (isTablet) return 'repeat(2, 1fr)'
        return 'repeat(3, 1fr)'
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                justifyContent: 'space-between', 
                marginBottom: '20px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
            }}>
                <div>
                    <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Browse Items</h2>
                    <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>{meta.total} items in the system</p>
                </div>
                <button onClick={() => navigate('/items/report')} className="btn btn-primary">
                    <Plus size={16} /> {isMobile ? 'Report' : 'Report Item'}
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ 
                padding: isMobile ? '12px' : '16px', 
                marginBottom: '20px', 
                display: 'flex', 
                gap: isMobile ? '8px' : '10px', 
                flexWrap: 'wrap',
                flexDirection: isMobile ? 'column' : 'row'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5A5A5A' }} />
                    <input
                        placeholder="Search items..."
                        value={filters.search}
                        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                        className="form-input" style={{ paddingLeft: '36px' }}
                    />
                </div>
                <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className="form-input" style={{ width: isMobile ? '100%' : '130px' }}>
                    <option value="">All Types</option>
                    <option value="LOST">Lost</option>
                    <option value="FOUND">Found</option>
                </select>
                <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="form-input" style={{ width: isMobile ? '100%' : '150px' }}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="form-input" style={{ width: isMobile ? '100%' : '140px' }}>
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="MATCHED">Matched</option>
                    <option value="CLAIMED">Claimed</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: getGridCols(), gap: isMobile ? '10px' : '14px' }}>
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="glass-card" style={{ 
                            height: isMobile ? '140px' : '180px', 
                            background: 'rgba(30,41,59,0.4)', 
                            animation: 'pulse-soft 2s infinite' 
                        }} />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="glass-card" style={{ padding: isMobile ? '40px 20px' : '60px', textAlign: 'center' }}>
                    <Search size={isMobile ? 32 : 44} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#5A5A5A', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>No items found. Try adjusting your filters.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: getGridCols(), gap: isMobile ? '10px' : '14px' }}>
                    {items.map((item: any) => (
                        <div key={item.id} className="glass-card" style={{ 
                            padding: isMobile ? '14px' : '18px', 
                            cursor: 'pointer' 
                        }}
                            onClick={() => navigate(`/items/${item.id}`)}>
                            {/* Type badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span className={`badge badge-${item.type.toLowerCase()}`}>
                                    {item.type === 'LOST' ? <AlertCircle size={11} /> : <CheckCircle size={11} />} {item.type}
                                </span>
                                <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                            </div>

                            <h3 style={{ 
                                fontSize: '0.95rem', 
                                fontWeight: 700, 
                                color: '#EAEAEA', 
                                marginBottom: '6px', 
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>{item.title}</h3>
                            <p style={{ 
                                fontSize: '0.78rem', 
                                color: '#5A5A5A', 
                                marginBottom: '12px', 
                                display: '-webkit-box', 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden' 
                            }}>
                                {item.description}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    fontSize: '0.75rem', 
                                    color: '#A0A0A0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <MapPin size={12} /> {item.location}
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    fontSize: '0.75rem', 
                                    color: '#A0A0A0' 
                                }}>
                                    <Calendar size={12} /> {format(new Date(item.dateLostFound), 'MMM dd, yyyy')}
                                </div>
                            </div>

                            <div style={{ 
                                marginTop: '10px', 
                                padding: '6px 10px', 
                                borderRadius: '7px', 
                                background: 'rgba(30,41,59,0.8)', 
                                display: 'inline-block', 
                                fontSize: '0.72rem', 
                                color: '#5A5A5A',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {item.category}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: isMobile ? '6px' : '8px', 
                    marginTop: '24px',
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary">Prev</button>
                    <span style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>Page {page} of {meta.totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn btn-secondary">Next</button>
                </div>
            )}
        </div>
    )
}
