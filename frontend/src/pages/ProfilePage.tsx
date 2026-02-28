import { useEffect, useState } from 'react'
import api from '../api/axios'
import { User, Package, FileCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [form, setForm] = useState({ name: '', phone: '', department: '', avatarUrl: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        api.get('/users/me').then(r => {
            setProfile(r.data)
            setForm({ name: r.data.name || '', phone: r.data.phone || '', department: r.data.department || '', avatarUrl: r.data.avatarUrl || '' })
        }).catch(() => setError(true))
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.patch('/users/me', form)
            toast.success('Profile updated!')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update')
        } finally { setSaving(false) }
    }

    if (error) return <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>Failed to load profile. Please refresh.</div>
    if (!profile) return <div style={{ textAlign: 'center', padding: '60px', color: '#5A5A5A' }}>Loading...</div>


    return (
        <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Profile header card */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#2D5CD4,#7FA3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                    {profile.name?.[0]?.toUpperCase()}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>{profile.name}</h2>
                    <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>{profile.email}</p>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-matched">{profile.role}</span>
                        {profile.department && <span style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(51,65,85,0.7)', color: '#A0A0A0', fontSize: '0.72rem', fontWeight: 600 }}>{profile.department}</span>}
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
                    {[
                        { icon: Package, label: 'Items', value: profile._count?.items || 0 },
                        { icon: FileCheck, label: 'Claims', value: profile._count?.claims || 0 },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3A6FF7' }}>{value}</div>
                            <div style={{ fontSize: '0.72rem', color: '#5A5A5A', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                                <Icon size={11} /> {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit form */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EAEAEA', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={17} color="#3A6FF7" /> Edit Profile
                </h3>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Full Name</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Phone</label>
                            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1234567890" className="form-input" />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Department</label>
                        <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Computer Science" className="form-input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Avatar URL</label>
                        <input value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." className="form-input" />
                    </div>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Account info (readonly) */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Account Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        ['Student ID', profile.studentId || '—'],
                        ['Email', profile.email],
                        ['Member Since', new Date(profile.createdAt).toLocaleDateString()],
                    ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.82rem', color: '#5A5A5A' }}>{label}</span>
                            <span style={{ fontSize: '0.82rem', color: '#A0A0A0', fontWeight: 500 }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
