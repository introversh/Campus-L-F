import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import api from '../../api/axios'
import { useAppSelector } from '../../store/hooks'
import { Send, ArrowLeft, Circle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ChatRoomPage() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user } = useAppSelector((s) => s.auth)
    const [messages, setMessages] = useState<any[]>([])
    const [room, setRoom] = useState<any>(null)
    const [input, setInput] = useState('')
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const [connected, setConnected] = useState(false)
    const socketRef = useRef<Socket | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const typingTimeout = useRef<any>(null)

    useEffect(() => {
        if (!roomId) {
            toast.error('Invalid chat room')
            navigate('/chat', { replace: true })
            return
        }

        const token = localStorage.getItem('accessToken')
        if (!token) {
            navigate('/login', { replace: true })
            return
        }

        // Use full URL to be safe, or relative with explicit transports
        const socket = io('http://localhost:3000/chat', {
            auth: { token },
            path: '/socket.io',
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        })
        socketRef.current = socket

        socket.on('connect', () => {
            setConnected(true)
            socket.emit('joinRoom', { roomId }, (res: any) => {
                if (res?.error) {
                    toast.error(res.error || 'Could not join chat')
                } else if (res?.messages) {
                    setMessages(res.messages)
                }
            })
            socket.emit('markRead', { roomId })
        })

        socket.on('connect_error', (err) => {
            setConnected(false);
            if (err?.message === 'Unauthorized') {
                toast.error('Session expired. Please log in again.')
                localStorage.clear()
                navigate('/login', { replace: true })
            }
        })

        socket.on('newMessage', (msg: any) => {
            // Check if message belongs to this room (safety)
            if (msg.chatRoomId === roomId) {
                setMessages(prev => [...prev, msg])
                socket.emit('markRead', { roomId })
            }
        })

        socket.on('userTyping', ({ name, isTyping }: any) => {
            setTypingUsers(prev =>
                isTyping ? (prev.includes(name) ? prev : [...prev, name]) : prev.filter(n => n !== name)
            )
        })

        socket.on('disconnect', () => {
            setConnected(false)
        })

        // Load room info
        api.get(`/chat/rooms/${roomId}`)
            .then(r => setRoom(r.data))
            .catch(() => {
                toast.error('Failed to load chat room details');
            })

        return () => {
            clearTimeout(typingTimeout.current)
            socket.disconnect()
        }
    }, [roomId, navigate])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !socketRef.current) return
        socketRef.current.emit('sendMessage', { roomId, content: input.trim() }, (res: any) => {
            if (res?.error) toast.error(res.error)
        })
        setInput('')
        socketRef.current.emit('typing', { roomId, isTyping: false })
    }

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
        socketRef.current?.emit('typing', { roomId, isTyping: true })
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => {
            socketRef.current?.emit('typing', { roomId, isTyping: false })
        }, 1500)
    }

    const otherParticipant = room?.participants?.find((p: any) => p.userId !== user?.id)

    return (
        <div style={{ height: 'calc(100vh - 84px)', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div className="glass-card" style={{ padding: '14px 18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '14px' }}>
                <button onClick={() => navigate('/chat')} className="btn btn-ghost" style={{ padding: '8px' }}>
                    <ArrowLeft size={18} />
                </button>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#2D5CD4,#7FA3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                    {otherParticipant?.user?.name?.[0] || '?'}
                </div>
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EAEAEA' }}>{otherParticipant?.user?.name || 'Chat Room'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: connected ? '#22c55e' : '#5A5A5A' }}>
                        <Circle size={6} fill={connected ? '#22c55e' : '#5A5A5A'} /> {connected ? 'Connected' : 'Connecting...'}
                    </div>
                </div>
                {room?.match && (
                    <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#5A5A5A' }}>
                        Re: <span style={{ color: '#3A6FF7' }}>{room.match.lostItem?.title}</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 2px', marginBottom: '12px' }}>
                {messages.map((msg: any) => {
                    const isMe = msg.senderId === user?.id
                    return (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '65%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: isMe ? 'linear-gradient(135deg, #2D5CD4, #3A6FF7)' : 'rgba(30,41,59,0.8)',
                                border: isMe ? 'none' : '1px solid #1C1C1C',
                            }}>
                                {!isMe && (
                                    <div style={{ fontSize: '0.7rem', color: '#7FA3FF', fontWeight: 700, marginBottom: '4px' }}>
                                        {msg.sender?.name}
                                    </div>
                                )}
                                <div style={{ color: isMe ? 'white' : '#EAEAEA', fontSize: '0.875rem', lineHeight: 1.5 }}>{msg.content}</div>
                                <div style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.6)' : '#2A2A2A', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                    {format(new Date(msg.createdAt), 'h:mm a')} {msg.isRead && isMe && '✓✓'}
                                </div>
                            </div>
                        </div>
                    )
                })}
                {typingUsers.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '8px 14px', borderRadius: '18px', background: 'rgba(30,41,59,0.8)', border: '1px solid #1C1C1C', fontSize: '0.8rem', color: '#5A5A5A' }}>
                            {typingUsers.join(', ')} is typing<span className="animate-pulse-soft">...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            {room && !room.isActive ? (
                <div style={{
                    padding: '14px 16px', borderRadius: '12px', textAlign: 'center',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444', fontSize: '0.85rem', fontWeight: 500,
                }}>
                    🔒 This chat room has been closed and is read-only.
                </div>
            ) : (
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        value={input} onChange={handleTyping}
                        placeholder="Type a message..."
                        className="form-input" style={{ flex: 1 }}
                        disabled={!connected}
                    />
                    <button type="submit" disabled={!input.trim() || !connected} className="btn btn-primary" style={{ padding: '10px 18px' }}>
                        <Send size={17} />
                    </button>
                </form>
            )}
        </div>
    )
}
