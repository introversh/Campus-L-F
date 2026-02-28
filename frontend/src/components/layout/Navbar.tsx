import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Plus } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'

interface NavbarProps {
    onMenuClick: () => void
    isMobile: boolean
}

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/items': 'Browse Items',
    '/items/report': 'Report an Item',
    '/matches': 'Match Center',
    '/chat': 'Messages',
    '/claims': 'My Claims',
    '/notifications': 'Notifications',
    '/profile': 'Profile',
    '/admin': 'Admin Analytics',
    '/admin/users': 'User Management',
    '/admin/items': 'Item Moderation',
    '/admin/claims': 'Claim Review',
    '/admin/chats': 'Chat Audit',
}

export default function Navbar({ onMenuClick, isMobile }: NavbarProps) {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { user } = useAppSelector((s) => s.auth)
    const title = pageTitles[pathname] || 'Campus Lost & Found'

    return (
        <div style={{
            height: isMobile ? '56px' : '60px', 
            display: 'flex', 
            alignItems: 'center',
            padding: isMobile ? '0 16px 0 60px' : '0 24px', 
            justifyContent: 'space-between',
            background: 'rgba(11, 11, 15, 0.80)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #111111',
            position: 'sticky', top: 0, zIndex: 40,
        }}>
            <h1 style={{ 
                fontSize: isMobile ? '1rem' : '1.1rem', 
                fontWeight: 700, 
                color: '#EAEAEA',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>{title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
                {!isMobile && (
                    <button
                        onClick={() => navigate('/items/report')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2D5CD4, #3A6FF7)',
                            border: 'none', cursor: 'pointer',
                            color: 'white', fontSize: '0.8rem', fontWeight: 600,
                        }}
                    >
                        <Plus size={15} /> Report
                    </button>
                )}
                
                <button
                    onClick={() => navigate('/notifications')}
                    style={{
                        width: isMobile ? '32px' : '36px', 
                        height: isMobile ? '32px' : '36px', 
                        borderRadius: '10px',
                        background: 'rgba(17, 17, 17, 0.70)',
                        border: '1px solid #1C1C1C',
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#A0A0A0',
                    }}
                >
                    <Bell size={isMobile ? 15 : 17} />
                </button>
                
                <button
                    onClick={() => navigate('/profile')}
                    style={{
                        width: isMobile ? '32px' : '36px', 
                        height: isMobile ? '32px' : '36px', 
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #2D5CD4, #7FA3FF)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, 
                        fontSize: isMobile ? '0.75rem' : '0.85rem',
                    }}
                >
                    {user?.name?.trim()?.[0]?.toUpperCase() || 'U'}
                </button>
            </div>
        </div>
    )
}
