import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (!mobile) setSidebarOpen(false)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0B0F' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen(true)} isMobile={isMobile} />
            
            {/* Mobile overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 45,
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minWidth: 0, 
                marginLeft: isMobile ? '0' : '240px',
                transition: 'margin-left 0.3s ease'
            }}>
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} />
                <main style={{ 
                    flex: 1, 
                    padding: isMobile ? '16px' : '24px', 
                    overflowY: 'auto',
                    maxWidth: isMobile ? '100%' : '1100px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
