import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { login, clearError } from '../../store/slices/authSlice'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { loading, error, accessToken } = useAppSelector((s) => s.auth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)

    useEffect(() => { if (accessToken) navigate('/dashboard') }, [accessToken])
    useEffect(() => { if (error) toast.error(error) }, [error])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        dispatch(clearError())
        const res = await dispatch(login({ email, password }))
        if (login.fulfilled.match(res)) {
            toast.success('Welcome back!')
            navigate('/dashboard')
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0B0B0F 0%, #0D0D12 50%, #0B0B0F 100%)',
            padding: '24px',
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #2D5CD4, #3A6FF7)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', marginBottom: '16px',
                        boxShadow: '0 0 30px rgba(58, 111, 247, 0.25)',
                    }}>🎒</div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '8px' }}>
                        Campus <span style={{ color: '#3A6FF7' }}>Lost & Found</span>
                    </h1>
                    <p style={{ color: '#5A5A5A', fontSize: '0.875rem' }}>Sign in to your account</p>
                </div>

                {/* Card */}
                <div className="glass-card" style={{ padding: '28px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '6px' }}>
                                Email Address
                            </label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="your@university.edu"
                                required className="form-input"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '6px' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required className="form-input"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A5A',
                                }}>
                                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '11px' }}>
                            {loading ? <><Loader2 size={17} className="animate-spin" /> Signing in...</> : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo hint */}
                    
                </div>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#5A5A5A' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#3A6FF7', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
                </p>
            </div>
        </div>
    )
}
