import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { MessageSquare, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export default function AdminChats() {
    const navigate = useNavigate()
    const [rooms, setRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/chats').then(r => { setRooms(r.data); setLoading(false) }).catch(() => setLoading(false))
    }, [])

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Chat Audit Log</h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>{rooms.length} chat rooms</p>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '50px', color: '#5A5A5A' }}>Loading...</div>
                : rooms.length === 0 ? (
                    <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <MessageSquare size={44} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: '#5A5A5A' }}>No chat rooms yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {rooms.map((room: any) => (
                            <div key={room.id} className="glass-card" style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => navigate(`/chat/${room.id}`)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '3px' }}>
                                            {room.match?.lostItem?.title} ↔ {room.match?.foundItem?.title}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#5A5A5A' }}>
                                            Participants: {room.participants?.map((p: any) => p.user?.name).join(', ')}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: room.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: room.isActive ? '#22c55e' : '#5A5A5A' }}>
                                            {room.isActive ? 'Active' : 'Closed'}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: '#2A2A2A', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Clock size={10} /> {format(new Date(room.createdAt), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#2A2A2A' }}>
                                    {room._count?.messages || 0} messages
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    )
}
