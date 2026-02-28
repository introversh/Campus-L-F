import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { BarChart3, TrendingUp, Package, Zap, CheckCircle, Clock } from 'lucide-react'

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        api.get('/admin/analytics').then(r => {
            const { summary, categoryStats, locationStats, monthlyTrends } = r.data
            setAnalytics({
                ...summary,
                topCategories: categoryStats,
                topLocations: locationStats,
                itemTrends: monthlyTrends,
                recoveryRate: summary.recoveryRate,
                avgResolutionDays: summary.avgResolutionHours
                    ? summary.avgResolutionHours / 24
                    : null,
            })
            setLoading(false)
        }).catch((e) => { setError(e.response?.status === 403 ? 'Access denied — ADMIN role required.' : 'Failed to load analytics.'); setLoading(false) })
    }, [])

    if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#5A5A5A' }}>Loading analytics...</div>
    if (!analytics) return <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>{error || 'Failed to load analytics.'}</div>

    const statCards = [
        { label: 'Total Items', value: analytics.totalItems, icon: Package, color: '#3A6FF7', bg: 'rgba(20,184,166,0.1)' },
        { label: 'Active Items', value: analytics.activeItems, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Total Matches', value: analytics.totalMatches, icon: Zap, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { label: 'Recovered', value: analytics.claimedItems, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
        { label: 'Recovery Rate', value: `${analytics.recoveryRate?.toFixed(1)}%`, icon: TrendingUp, color: '#3A6FF7', bg: 'rgba(20,184,166,0.1)' },
        { label: 'Avg Resolution', value: analytics.avgResolutionDays ? `${analytics.avgResolutionDays.toFixed(1)}d` : '—', icon: BarChart3, color: '#5A5A5A', bg: 'rgba(100,116,139,0.1)' },
    ]

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Analytics Dashboard</h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>Platform performance overview</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} color={color} />
                            </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color, marginBottom: '3px' }}>{value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#5A5A5A', fontWeight: 500 }}>{label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Top Categories */}
                {analytics.topCategories?.length > 0 && (
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '16px' }}>Top Categories</h3>
                        {analytics.topCategories.map((cat: any) => (
                            <div key={cat.category} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#A0A0A0' }}>{cat.category}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#3A6FF7', fontWeight: 700 }}>{cat._count?.category || cat.count}</span>
                                </div>
                                <div style={{ height: '4px', background: '#111111', borderRadius: '2px' }}>
                                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#2D5CD4,#3A6FF7)', borderRadius: '2px', width: `${Math.min(100, (cat._count?.category || cat.count) * 10)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Top Locations */}
                {analytics.topLocations?.length > 0 && (
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '16px' }}>Top Loss Locations</h3>
                        {analytics.topLocations.map((loc: any, i: number) => (
                            <div key={loc.location} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #111111' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(58, 111, 247, 0.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#3A6FF7', fontWeight: 700 }}>{i + 1}</span>
                                    <span style={{ fontSize: '0.85rem', color: '#A0A0A0' }}>{loc.location}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#3A6FF7', fontWeight: 700 }}>{loc._count?.location || loc.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trends */}
            {analytics.itemTrends?.length > 0 && (
                <div className="glass-card" style={{ padding: '20px', marginTop: '16px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '16px' }}>Monthly Trends</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                        {analytics.itemTrends.map((t: any, i: number) => {
                            const max = Math.max(...analytics.itemTrends.map((x: any) => x._count?.createdAt || x.count || 1))
                            const h = ((t._count?.createdAt || t.count || 0) / max) * 70
                            return (
                                <div key={i} title={`${t.month}: ${t._count?.createdAt || t.count}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                    <div style={{ height: `${h}px`, background: 'linear-gradient(0deg,#2D5CD4,#3A6FF7)', borderRadius: '4px 4px 0 0', minHeight: '4px', width: '100%', transition: 'height 0.5s' }} />
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {analytics.itemTrends.map((t: any, i: number) => (
                            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#2A2A2A' }}>{t.month?.slice(5) || i + 1}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
