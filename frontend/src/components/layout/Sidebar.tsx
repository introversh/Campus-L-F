import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
    LayoutDashboard, Search, MapPin, Zap, MessageSquare,
    FileCheck, Bell, Users, LogOut,
    List, MessagesSquare, X, Menu
} from 'lucide-react'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    onToggle: () => void
    isMobile: boolean
}

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/items', icon: List, label: 'Browse Items' },
    { to: '/items/report', icon: MapPin, label: 'Report Item' },
    { to: '/matches', icon: Zap, label: 'Matches' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/claims', icon: FileCheck, label: 'Claims' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
]

const adminItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Analytics' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/items', icon: Search, label: 'Items' },
    { to: '/admin/claims', icon: FileCheck, label: 'Claims' },
    { to: '/admin/chats', icon: MessagesSquare, label: 'Chat Logs' },
]

export default function Sidebar({ isOpen, onClose, onToggle, isMobile }: SidebarProps) {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user } = useAppSelector((s) => s.auth)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SECURITY'
    const [unreadCount, setUnreadCount] = useState(0)

    // Poll for unread messages every 30 seconds
    useEffect(() => {
        if (!user?.id) return   // wait until user is loaded before polling
        const fetchUnread = () => {
            api.get('/chat/rooms').then((r) => {
                const rooms: any[] = r.data || []
                const count = rooms.filter((room) => {
                    const lastMsg = room.messages?.[0]
                    return lastMsg && !lastMsg.isRead && lastMsg.senderId !== user?.id
                }).length
                setUnreadCount(count)
            }).catch(() => { })
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 30000)
        return () => clearInterval(interval)
    }, [user?.id])

    const handleLogout = async () => {
        await dispatch(logout())
        navigate('/login')
        if (isMobile) onClose()
    }

    const handleNavClick = () => {
        if (isMobile) onClose()
    }

    return (
        <>
            {/* Mobile menu button */}
            {isMobile && (
                <button
                    onClick={isOpen ? onClose : onToggle}
                    style={{
                        position: 'fixed', top: '12px', left: '12px', zIndex: 60,
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(11, 11, 15, 0.95)',
                        border: '1px solid #111111',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#EAEAEA', cursor: 'pointer',
                    }}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            )}
            
            <div style={{
                width: isMobile ? (isOpen ? '280px' : '0') : '240px',
                height: '100vh', 
                position: isMobile ? 'fixed' : 'fixed',
                left: 0, top: 0,
                background: 'rgba(11, 11, 15, 0.95)',
                borderRight: isMobile ? 'none' : '1px solid #111111',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column',
                zIndex: isMobile ? 55 : 50,
                transition: isMobile ? 'width 0.3s ease' : 'none',
                overflow: isMobile ? 'hidden' : 'visible',
            }}>
                {/* Logo */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #111111' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2D5CD4, #3A6FF7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px',
                        }}>🎒</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#EAEAEA' }}>Campus L&F</div>
                            <div style={{ fontSize: '0.7rem', color: '#5A5A5A' }}>Lost & Found System</div>
                        </div>
                    </div>
                </div>

                {/* User chip */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #111111' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 10px', borderRadius: '10px',
                        background: 'rgba(17, 17, 17, 0.60)',
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2D5CD4, #7FA3FF)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 700, color: 'white',
                            flexShrink: 0,
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#EAEAEA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                                color: '#3A6FF7',
                            }}>{user?.role}</span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} end={to === '/dashboard'} onClick={handleNavClick}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '9px 12px', borderRadius: '10px',
                                textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
                                transition: 'all 0.15s',
                                color: isActive ? '#3A6FF7' : '#A0A0A0',
                                background: isActive ? 'rgba(58, 111, 247, 0.10)' : 'transparent',
                            })}
                        >
                            <Icon size={17} />
                            {label}
                            {to === '/chat' && unreadCount > 0 && (
                                <span style={{
                                    marginLeft: 'auto', minWidth: '18px', height: '18px',
                                    borderRadius: '999px', background: '#ef4444',
                                    color: 'white', fontSize: '0.65rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '0 4px',
                                }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <>
                            <div style={{ padding: '12px 12px 4px', fontSize: '0.68rem', fontWeight: 700, color: '#2A2A2A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Admin
                            </div>
                            {adminItems.map(({ to, icon: Icon, label }) => (
                                <NavLink key={to} to={to} end={to === '/admin'} onClick={handleNavClick}
                                    style={({ isActive }) => ({
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '9px 12px', borderRadius: '10px',
                                        textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
                                        transition: 'all 0.15s',
                                        color: isActive ? '#3A6FF7' : '#A0A0A0',
                                        background: isActive ? 'rgba(58, 111, 247, 0.10)' : 'transparent',
                                    })}
                                >
                                    <Icon size={17} />
                                    {label}
                                </NavLink>
                            ))}
                        </>
                    )}
                </nav>

                {/* Logout */}
                <div style={{ padding: '12px 10px', borderTop: '1px solid #111111' }}>
                    <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        width: '100%', padding: '9px 12px', borderRadius: '10px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#5A5A5A', fontSize: '0.85rem', fontWeight: 500,
                        transition: 'all 0.15s',
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#5A5A5A'; }}
                    >
                        <LogOut size={17} /> Sign Out
                    </button>
                </div>
            </div>
        </>
    )
}
