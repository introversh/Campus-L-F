import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Bell, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/notifications').then(r => { setNotifications(r.data.data || r.data); setLoading(false) }).catch(() => setLoading(false))
    }, [])

    const markRead = async (id: string) => {
        // optimistic update
        setNotifications(n => n.map(notif => notif.id === id ? { ...notif, isRead: true } : notif))
        try {
            await api.patch(`/notifications/${id}/read`)
        } catch {
            // rollback on failure
            setNotifications(n => n.map(notif => notif.id === id ? { ...notif, isRead: false } : notif))
            toast.error('Failed to mark notification as read')
        }
    }

    const markAllRead = async () => {
        const prev = notifications
        setNotifications(n => n.map(notif => ({ ...notif, isRead: true })))
        try {
            await api.patch('/notifications/read-all')
            toast.success('All notifications marked as read')
        } catch {
            setNotifications(prev)
            toast.error('Failed to mark all as read')
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    const iconFor = (type: string, title: string) => {
        if (type === 'MATCH_FOUND') {
            return title.includes('Confirmed')
                ? { emoji: '🎉', color: '#8b5cf6' }
                : { emoji: '⚡', color: '#3A6FF7' }
        }
        if (type === 'CLAIM_SUBMITTED') return { emoji: '📋', color: '#f59e0b' }
        if (type === 'CLAIM_APPROVED') return { emoji: '✅', color: '#22c55e' }
        if (type === 'CLAIM_REJECTED') return { emoji: '❌', color: '#ef4444' }
        return { emoji: '🔔', color: '#A0A0A0' }
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Notifications</h2>
                    <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                        <CheckCheck size={15} /> Mark all read
                    </button>
                )}
            </div>

            {loading ? <div style={{ textAlign: 'center', color: '#5A5A5A', padding: '50px' }}>Loading...</div>
                : notifications.length === 0 ? (
                    <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <Bell size={44} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: '#5A5A5A', fontSize: '0.9rem' }}>No notifications yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.map((notif: any) => {
                            const { emoji, color } = iconFor(notif.type, notif.title)
                            return (
                                <div key={notif.id} style={{
                                    padding: '14px 18px', borderRadius: '14px', cursor: 'pointer',
                                    background: notif.isRead ? 'rgba(30,41,59,0.4)' : 'rgba(30,41,59,0.8)',
                                    border: `1px solid ${notif.isRead ? '#111111' : '#1C1C1C'}`,
                                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                                    transition: 'all 0.2s',
                                }} onClick={() => !notif.isRead && markRead(notif.id)}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                                        {emoji}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: notif.isRead ? 400 : 700, color: notif.isRead ? '#A0A0A0' : '#EAEAEA', marginBottom: '3px' }}>
                                            {notif.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.5 }}>{notif.body}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#2A2A2A', marginTop: '6px' }}>
                                            {format(new Date(notif.createdAt), 'MMM dd, yyyy · h:mm a')}
                                        </div>
                                    </div>
                                    {!notif.isRead && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '6px' }} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
        </div>
    )
}
