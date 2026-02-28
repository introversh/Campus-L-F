import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { register, clearError } from '../../store/slices/authSlice'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { loading } = useAppSelector((s) => s.auth)
    const [form, setForm] = useState({
        name: '', email: '', password: '', studentId: '', department: '', phone: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        dispatch(clearError())
        const res = await dispatch(register(form))
        if (register.fulfilled.match(res)) {
            toast.success('Account created! Welcome aboard 🎉')
            navigate('/dashboard')
        } else {
            toast.error(res.payload as string)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0B0B0F 0%, #0D0D12 50%, #0B0B0F 100%)',
            padding: '24px',
        }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #2D5CD4, #3A6FF7)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '26px', marginBottom: '14px',
                        boxShadow: '0 0 30px rgba(58, 111, 247, 0.25)',
                    }}>🎒</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '6px' }}>Create Account</h1>
                    <p style={{ color: '#5A5A5A', fontSize: '0.875rem' }}>Join the Campus Lost &amp; Found system</p>
                </div>

                <div className="glass-card" style={{ padding: '26px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Full Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required className="form-input" />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Email Address *</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@university.edu" required className="form-input" />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Password * (min 8 chars)</label>
                            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={8} className="form-input" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Student ID</label>
                                <input name="studentId" value={form.studentId} onChange={handleChange} placeholder="STU-2024-001" className="form-input" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Phone</label>
                                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1234567890" className="form-input" />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Department</label>
                            <input name="department" value={form.department} onChange={handleChange} placeholder="Computer Science" className="form-input" />
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px' }}>
                            {loading ? <><Loader2 size={17} className="animate-spin" /> Creating...</> : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#5A5A5A' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#3A6FF7', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    )
}

