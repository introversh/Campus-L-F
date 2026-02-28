import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Loader2, MapPin, Calendar, Tag } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Documents', 'Keys', 'Bags', 'Accessories', 'Sports', 'Other']
const LOCATIONS = ['Library', 'Cafeteria', 'Parking Lot', 'Science Block', 'Admin Block', 'Sports Complex', 'Hostel', 'Lab', 'Classroom', 'Other']

export default function ReportItemPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        title: '', description: '', category: '', type: 'LOST',
        location: '', building: '', floor: '', dateLostFound: '',
        imageUrl: '', tags: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (new Date(form.dateLostFound) > new Date()) {
                toast.error(`Date cannot be in the future`);
                setLoading(false);
                return;
            }

            if (form.imageUrl && !/^https?:\/\/.+/.test(form.imageUrl)) {
                toast.error("Please enter a valid image URL (starting with http or https)");
                setLoading(false);
                return;
            }

            const payload: Record<string, any> = {
                title: form.title,
                description: form.description,
                category: form.category,
                type: form.type,
                location: form.location,
                dateLostFound: new Date(form.dateLostFound).toISOString(),
                tags: form.tags ? form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
            }
            // Only include optional fields if they have a value
            if (form.building) payload.building = form.building
            if (form.floor) payload.floor = form.floor
            if (form.imageUrl) payload.imageUrl = form.imageUrl

            await api.post('/items', payload)
            toast.success('Item reported! The system will scan for matches automatically.')
            navigate('/items')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to report item')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EAEAEA', marginBottom: '4px' }}>Report an Item</h2>
                <p style={{ color: '#5A5A5A', fontSize: '0.85rem' }}>Fill in the details and our system will auto-detect potential matches</p>
            </div>

            {/* Type Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['LOST', 'FOUND'].map(t => (
                    <button key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid',
                            borderColor: form.type === t ? (t === 'LOST' ? '#ef4444' : '#22c55e') : '#1C1C1C',
                            background: form.type === t ? (t === 'LOST' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)') : 'rgba(30,41,59,0.5)',
                            color: form.type === t ? (t === 'LOST' ? '#ef4444' : '#22c55e') : '#5A5A5A',
                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                        {t === 'LOST' ? '😞 I Lost Something' : '🎉 I Found Something'}
                    </button>
                ))}
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Title *</label>
                            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Blue Jansport Backpack" required className="form-input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Category *</label>
                            <select name="category" value={form.category} onChange={handleChange} required className="form-input">
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Description *</label>
                        <textarea name="description" value={form.description} onChange={handleChange as any}
                            placeholder="Describe the item in detail — color, brand, contents, distinctive features..."
                            required rows={4}
                            style={{ width: '100%', padding: '10px 14px', background: 'rgba(15,23,42,0.6)', border: '1px solid #1C1C1C', borderRadius: '10px', color: '#EAEAEA', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}><MapPin size={12} style={{ display: 'inline' }} /> Location *</label>
                            <select name="location" value={form.location} onChange={handleChange} required className="form-input">
                                <option value="">Select location</option>
                                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}><Calendar size={12} style={{ display: 'inline' }} /> Date {form.type === 'LOST' ? 'Lost' : 'Found'} *</label>
                            <input
                                name="dateLostFound"
                                type="datetime-local"
                                value={form.dateLostFound}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().slice(0, 16)}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Building (optional)</label>
                            <input name="building" value={form.building} onChange={handleChange} placeholder="Main Building" className="form-input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Floor (optional)</label>
                            <input name="floor" value={form.floor} onChange={handleChange} placeholder="2nd Floor, Room 201" className="form-input" />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}><Tag size={12} style={{ display: 'inline' }} /> Tags (comma-separated)</label>
                        <input name="tags" value={form.tags} onChange={handleChange} placeholder="blue, laptop, jansport, backpack" className="form-input" />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#A0A0A0', marginBottom: '5px' }}>Image URL (optional)</label>
                        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." className="form-input" />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                            {loading ? <><Loader2 size={17} className="animate-spin" /> Submitting...</> : `Submit ${form.type === 'LOST' ? 'Lost' : 'Found'} Report`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
