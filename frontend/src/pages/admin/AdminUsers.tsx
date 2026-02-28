import { useEffect, useState } from 'react'
import api from '../../api/axios'

import toast from 'react-hot-toast'

const ROLES = ['STUDENT', 'FACULTY', 'SECURITY', 'ADMIN']

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        api.get('/admin/users').then(r => {
            setUsers(r.data.data)
            setTotal(r.data.meta.total)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole })
            setUsers(u => u.map(user => user.id === userId ? { ...user, role: newRole } : user))
            toast.success('Role updated')
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    }

    const roleColors: Record<string, string> = { ADMIN: '#ef4444', SECURITY: '#f59e0b', FACULTY: '#3A6FF7', STUDENT: '#22c55e' }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>User Management</h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>{total} registered users</p>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '50px', color: '#5A5A5A' }}>Loading...</div> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['User', 'Email', 'Student ID', 'Department', 'Items', 'Role', 'Joined'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.72rem', color: '#5A5A5A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #111111' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u: any) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #111111' }}
                                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.4)'}
                                    onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${roleColors[u.role] || '#5A5A5A'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: roleColors[u.role] || '#5A5A5A', fontSize: '0.85rem' }}>
                                                {u.name?.[0]}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EAEAEA' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.82rem', color: '#A0A0A0' }}>{u.email}</td>
                                    <td style={{ padding: '12px', fontSize: '0.82rem', color: '#5A5A5A' }}>{u.studentId || '—'}</td>
                                    <td style={{ padding: '12px', fontSize: '0.82rem', color: '#5A5A5A' }}>{u.department || '—'}</td>
                                    <td style={{ padding: '12px', fontSize: '0.82rem', color: '#3A6FF7', textAlign: 'center', fontWeight: 700 }}>{u._count?.items || 0}</td>
                                    <td style={{ padding: '12px' }}>
                                        <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                                            style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid #1C1C1C', borderRadius: '8px', padding: '4px 8px', color: roleColors[u.role] || '#A0A0A0', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.78rem', color: '#2A2A2A' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
