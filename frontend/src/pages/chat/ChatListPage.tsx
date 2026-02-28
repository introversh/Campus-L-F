import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAppSelector } from '../../store/hooks'
import { MessageSquare, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function ChatListPage() {
    const navigate = useNavigate()
    const { user } = useAppSelector((s) => s.auth)
    const [rooms, setRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/chat/rooms').then(r => { setRooms(r.data); setLoading(false) }).catch(() => setLoading(false))
    }, [])

    return (
        <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Messages</h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>Private chats from confirmed matches</p>
            </div>

            {loading ? (
                <div style={{ color: '#5A5A5A', textAlign: 'center', padding: '50px' }}>Loading chats...</div>
            ) : rooms.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <MessageSquare size={44} color="#1C1C1C" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#5A5A5A', fontSize: '0.9rem' }}>No chats yet. Chats open when a match is confirmed.</p>
                </div>
            ) : rooms.map((room: any) => {
                const lastMsg = room.messages?.[0]
                const otherParticipant = room.participants?.find((p: any) => p.userId !== user?.id)
                return (
                    <div key={room.id} className="glass-card" style={{ padding: '16px 18px', marginBottom: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
                        onClick={() => navigate(`/chat/${room.id}`)}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#2D5CD4,#7FA3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1.1rem', flexShrink: 0 }}>
                            {(otherParticipant?.user?.name || room.match?.lostItem?.title || 'C')?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {otherParticipant?.user?.name || room.match?.lostItem?.title || 'Chat Room'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#5A5A5A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {lastMsg ? lastMsg.content : 'No messages yet'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            {lastMsg && <div style={{ fontSize: '0.7rem', color: '#2A2A2A', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={11} /> {format(new Date(lastMsg.createdAt), 'MMM dd')}</div>}
                            <div style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '999px', background: room.isActive ? 'rgba(58, 111, 247, 0.14)' : 'rgba(100,116,139,0.15)', color: room.isActive ? '#3A6FF7' : '#5A5A5A', fontWeight: 600 }}>
                                {room.isActive ? 'Active' : 'Closed'}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
