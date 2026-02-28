import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAppSelector } from '../store/hooks'
import { Package, Zap, MessageSquare, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'

interface Stats {
    myItems: number
    myMatches: number
    myChats: number
    myClaims: number
}

export default function DashboardPage() {
    const { user } = useAppSelector((s) => s.auth)
    const navigate = useNavigate()
    const [items, setItems] = useState<any[]>([])
    const [stats, setStats] = useState<Stats>({ myItems: 0, myMatches: 0, myChats: 0, myClaims: 0 })
    const [loading, setLoading] = useState(true)
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

    useEffect(() => {
        Promise.all([
            api.get('/items/my'),
            api.get('/matches'),
            api.get('/claims'),
            api.get('/chat/rooms'),
        ]).then(([itemsRes, matchesRes, claimsRes, chatsRes]) => {
            const fetchedItems = itemsRes.data
            setItems(fetchedItems)
            setStats({
                myItems: fetchedItems.length,
                myMatches: Array.isArray(matchesRes.data) ? matchesRes.data.length : 0,
                myClaims: Array.isArray(claimsRes.data) ? claimsRes.data.length : 0,
                myChats: Array.isArray(chatsRes.data) ? chatsRes.data.length : 0,
            })
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const lostCount = items.filter((i: any) => i.type === 'LOST').length
    const foundCount = items.filter((i: any) => i.type === 'FOUND').length

    const statCards = [
        { label: 'My Lost Reports', value: lostCount, icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', route: '/items' },
        { label: 'My Found Reports', value: foundCount, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', route: '/items' },
        { label: 'Potential Matches', value: stats.myMatches, icon: Zap, color: '#3A6FF7', bg: 'rgba(58,111,247,0.1)', route: '/matches' },
        { label: 'My Chats', value: stats.myChats, icon: MessageSquare, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', route: '/chat' },
    ]

    const quickActions = [
        { label: 'Report Lost Item', icon: AlertCircle, color: '#ef4444', route: '/items/report', desc: 'I lost something' },
        { label: 'Report Found Item', icon: CheckCircle, color: '#22c55e', route: '/items/report', desc: 'I found something' },
        { label: 'Browse Matches', icon: Zap, color: '#3A6FF7', route: '/matches', desc: 'See potential matches' },
        { label: 'Open Chat', icon: MessageSquare, color: '#8b5cf6', route: '/chat', desc: 'Talk to finders/owners' },
    ]

    const getGridCols = () => {
        if (isMobile) return '1fr'
        if (isTablet) return 'repeat(2, 1fr)'
        return 'repeat(4, 1fr)'
    }

    const getQuickActionGridCols = () => {
        if (isMobile) return '1fr'
        if (isTablet) return 'repeat(2, 1fr)'
        return 'repeat(4, 1fr)'
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
            {/* Welcome */}
            <div style={{
                padding: isMobile ? '16px' : '24px', 
                borderRadius: '16px', 
                marginBottom: isMobile ? '16px' : '24px',
                background: 'linear-gradient(135deg, rgba(13,148,136,0.12), rgba(20,184,166,0.05))',
                border: '1px solid rgba(58, 111, 247, 0.14)',
            }}>
                <h2 style={{ 
                    fontSize: isMobile ? '1.1rem' : '1.3rem', 
                    fontWeight: 800, 
                    color: '#EAEAEA', 
                    marginBottom: '6px' 
                }}>
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                </h2>
                <p style={{ 
                    color: '#5A5A5A', 
                    fontSize: isMobile ? '0.85rem' : '0.9rem' 
                }}>
                    {user?.role} · {user?.department || 'Campus'} — Your campus lost & found dashboard
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: getGridCols(), 
                gap: isMobile ? '12px' : '16px', 
                marginBottom: isMobile ? '16px' : '24px' 
            }}>
                {loading ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="glass-card" style={{ 
                        padding: isMobile ? '16px' : '20px', 
                        height: isMobile ? '80px' : '100px', 
                        background: 'rgba(30,41,59,0.5)' 
                    }} />
                )) : statCards.map(({ label, value, icon: Icon, color, bg, route }) => (
                    <div key={label} className="glass-card" style={{ 
                        padding: isMobile ? '16px' : '20px', 
                        cursor: 'pointer' 
                    }} onClick={() => navigate(route)}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            marginBottom: isMobile ? '8px' : '12px' 
                        }}>
                            <div style={{ 
                                width: isMobile ? '32px' : '38px', 
                                height: isMobile ? '32px' : '38px', 
                                borderRadius: '10px', 
                                background: bg, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <Icon size={isMobile ? 16 : 20} color={color} />
                            </div>
                            {!isMobile && <TrendingUp size={14} color="#2A2A2A" />}
                        </div>
                        <div style={{ 
                            fontSize: isMobile ? '1.5rem' : '1.8rem', 
                            fontWeight: 800, 
                            color, 
                            marginBottom: '2px' 
                        }}>{value}</div>
                        <div style={{ 
                            fontSize: isMobile ? '0.7rem' : '0.78rem', 
                            color: '#5A5A5A', 
                            fontWeight: 500 
                        }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <h3 style={{ 
                fontSize: '0.875rem', 
                fontWeight: 700, 
                color: '#A0A0A0', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                marginBottom: isMobile ? '8px' : '12px' 
            }}>Quick Actions</h3>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: getQuickActionGridCols(), 
                gap: isMobile ? '8px' : '12px', 
                marginBottom: isMobile ? '20px' : '28px' 
            }}>
                {quickActions.map(({ label, icon: Icon, color, route, desc }) => (
                    <button key={label} onClick={() => navigate(route)} style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        padding: isMobile ? '14px' : '18px', 
                        borderRadius: '14px', 
                        cursor: 'pointer',
                        background: 'rgba(17, 17, 17, 0.60)', 
                        border: '1px solid #1C1C1C',
                        transition: 'all 0.2s', 
                        textAlign: 'left',
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.9)'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1C1C1C'; (e.currentTarget as HTMLElement).style.background = 'rgba(17, 17, 17, 0.60)'; }}
                    >
                        <div style={{ 
                            padding: '8px', 
                            borderRadius: '10px', 
                            background: `${color}18`, 
                            marginBottom: '10px' 
                        }}>
                            <Icon size={isMobile ? 18 : 20} color={color} />
                        </div>
                        <div style={{ 
                            fontSize: isMobile ? '0.8rem' : '0.85rem', 
                            fontWeight: 700, 
                            color: '#EAEAEA', 
                            marginBottom: '3px' 
                        }}>{label}</div>
                        <div style={{ 
                            fontSize: isMobile ? '0.7rem' : '0.75rem', 
                            color: '#5A5A5A' 
                        }}>{desc}</div>
                    </button>
                ))}
            </div>

            {/* Recent Items */}
            <h3 style={{ 
                fontSize: '0.875rem', 
                fontWeight: 700, 
                color: '#A0A0A0', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                marginBottom: isMobile ? '8px' : '12px' 
            }}>My Recent Reports</h3>
            {items.length === 0 ? (
                <div className="glass-card" style={{ 
                    padding: isMobile ? '24px' : '40px', 
                    textAlign: 'center' 
                }}>
                    <Package size={isMobile ? 32 : 40} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#5A5A5A', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                        No items reported yet.
                    </p>
                    <button onClick={() => navigate('/items/report')} className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Report an Item
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.slice(0, 5).map((item: any) => (
                        <div key={item.id} className="glass-card"
                            style={{ 
                                padding: isMobile ? '12px 14px' : '14px 18px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                cursor: 'pointer',
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? '8px' : '0'
                            }}
                            onClick={() => navigate(`/items/${item.id}`)}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px',
                                width: isMobile ? '100%' : 'auto'
                            }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '8px', 
                                    background: item.type === 'LOST' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {item.type === 'LOST' ? <AlertCircle size={16} color="#ef4444" /> : <CheckCircle size={16} color="#22c55e" />}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '0.875rem', 
                                        fontWeight: 600, 
                                        color: '#EAEAEA',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: isMobile ? 'nowrap' : 'normal'
                                    }}>{item.title}</div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#5A5A5A',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>{item.category} · {item.location}</div>
                                </div>
                            </div>
                            <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
