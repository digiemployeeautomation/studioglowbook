import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { LayoutDashboard, Calendar, Clock, Users, Scissors, User, Star, DollarSign, Home, Menu, X, Search, Check, Plus, Pencil, Trash2, Eye, UserPlus, XCircle, Bell, ArrowLeft, ChevronRight, ChevronDown, LogOut, Upload, Phone, MapPin, Mail, Sparkles, Gift, TrendingUp, RefreshCw, Camera, Filter, Wallet, AlertCircle } from 'lucide-react'

function useBreakpoint() {
  const [bp, setBp] = useState('desktop')
  useEffect(() => {
    const check = () => { const w = window.innerWidth; setBp(w >= 1024 ? 'desktop' : w >= 640 ? 'tablet' : 'mobile') }
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check)
  }, [])
  return bp
}

const C = {
  bg: '#faf7f5', sidebar: '#1a1215', sidebarHover: '#2a1f23',
  accent: '#c47d5a', accentLight: '#f0d9cc', accentDark: '#a35e3c',
  gold: '#c9a84c', goldLight: '#f5ecd0',
  rose: '#d4728c', roseLight: '#fce8ee',
  text: '#2c1810', textMuted: '#8a7068', textLight: '#b8a89e',
  white: '#ffffff', card: '#ffffff', border: '#ede5df',
  success: '#4a9d6e', successBg: '#e8f5ec',
  warning: '#c9a84c', warningBg: '#fdf6e3',
  danger: '#c94c4c', dangerBg: '#fce8e8',
  pending: '#6b8ec4', pendingBg: '#e8eef5',
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'bookings', label: 'Bookings', icon: 'calendar' },
  { id: 'schedule', label: 'Schedule', icon: 'clock' },
  { id: 'staff', label: 'Staff', icon: 'users' },
  { id: 'services', label: 'Services', icon: 'scissors' },
  { id: 'clients', label: 'Clients', icon: 'clients' },
  { id: 'reviews', label: 'Reviews', icon: 'star' },
  { id: 'financials', label: 'Financials', icon: 'dollar' },
  { id: 'wallet', label: 'Wallet', icon: 'dollar' },
  { id: 'profile', label: 'Branch Profile', icon: 'store' },
]

const LUCIDE_MAP = { dashboard:LayoutDashboard, calendar:Calendar, clock:Clock, users:Users, scissors:Scissors, clients:User, star:Star, dollar:DollarSign, store:Home, menu:Menu, close:X, search:Search, check:Check, plus:Plus, edit:Pencil, trash:Trash2, eye:Eye, walkin:UserPlus, noshow:XCircle, bell:Bell, back:ArrowLeft, chevR:ChevronRight, chevD:ChevronDown, logout:LogOut, upload:Upload, phone:Phone, map:MapPin, mail:Mail, sparkle:Sparkles, gift:Gift, trendUp:TrendingUp, refresh:RefreshCw, camera:Camera, filter:Filter, wallet:Wallet, alert:AlertCircle }
const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const L = LUCIDE_MAP[name]
  if (L) return <L size={size} color={color} strokeWidth={2} />
  return <Sparkles size={size} color={color} />
}

const SC = {
  confirmed: { bg: '#e8f5ec', text: '#4a9d6e', label: 'Confirmed' },
  pending: { bg: '#fdf6e3', text: '#c9a84c', label: 'Pending' },
  arrived: { bg: '#e0f7fa', text: '#00695c', label: 'Arrived' },
  in_progress: { bg: '#f3e5f5', text: '#7b1fa2', label: 'In Progress' },
  completed: { bg: '#e8eef5', text: '#6b8ec4', label: 'Completed' },
  cancelled: { bg: '#fce8e8', text: '#c94c4c', label: 'Cancelled' },
  no_show: { bg: '#fce4ec', text: '#880e4f', label: 'No Show' },
  noshow: { bg: '#fce4ec', text: '#880e4f', label: 'No Show' },
}

const fmt = (n) => `K ${Number(n || 0).toLocaleString()}`
const fmtDate = (d) => new Date(d+'T12:00:00').toLocaleDateString('en-ZM', { weekday: 'short', day: 'numeric', month: 'short' })
const fmtTime = (t) => { const [h, m] = (t || '00:00').split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}` }
const todayStr = () => new Date().toISOString().split('T')[0]
const friendlyError = (msg) => {
  if (!msg) return 'Something went wrong. Please try again.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) return 'Incorrect email or password.';
  if (m.includes('email not confirmed')) return 'Check your email to confirm your account.';
  if (m.includes('user already registered') || m.includes('already been registered')) return 'An account with this email already exists.';
  if (m.includes('password') && m.includes('too short')) return 'Password must be at least 6 characters.';
  if (m.includes('rate limit') || m.includes('too many requests')) return 'Too many attempts. Wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'Connection error. Check your internet.';
  if (m.includes('duplicate') || m.includes('unique constraint') || m.includes('already exists')) return 'This record already exists.';
  if (m.includes('foreign key') || m.includes('violates')) return 'Couldn\'t save — a linked record is missing.';
  if (m.includes('database error') || m.includes('schema')) return 'Service temporarily unavailable. Try again.';
  if (m.includes('jwt') || m.includes('token') || m.includes('unauthorized')) return 'Session expired. Please sign in again.';
  if (msg.length > 80) return 'Something went wrong. Please try again.';
  return msg;
};
const isValidZambianPhone = (phone) => { if (!phone) return false; const clean = phone.replace(/[\s\-()]/g, ''); return /^(?:\+?260|0)[79]\d{8}$/.test(clean); };
const stars = (n) => <span style={{display:'inline-flex',gap:1}}>{[1,2,3,4,5].map(i=><Star key={i} size={14} fill={i<=Math.round(n)?'#c9a84c':'none'} stroke={i<=Math.round(n)?'#c9a84c':'#ccc'} strokeWidth={1.5}/>)}</span>

function Badge({ status }) {
  const s = SC[status] || SC.pending
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.text, whiteSpace: 'nowrap' }}>{s.label}</span>
}

function Btn({ children, variant = 'primary', small, onClick, disabled, style = {} }) {
  const v = { primary: { background: C.accent, color: '#fff', border: 'none' }, secondary: { background: 'transparent', color: C.accent, border: `1.5px solid ${C.accent}` }, danger: { background: C.danger, color: '#fff', border: 'none' }, ghost: { background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}` }, success: { background: C.success, color: '#fff', border: 'none' } }
  return <button onClick={onClick} disabled={disabled} className="btn-hover" style={{ ...v[variant], padding: small ? '5px 12px' : '8px 18px', borderRadius: 8, fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', opacity: disabled ? 0.5 : 1, transition: 'all 0.15s cubic-bezier(.16,1,.3,1)', whiteSpace: 'nowrap', ...style }}>{children}</button>
}

function Card({ children, title, action, style = {} }) {
  return (
    <div className="card-hover" style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, ...style }}>
      {(title || action) && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>{title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text, fontFamily: 'Fraunces' }}>{title}</h3>}{action}</div>}
      {children}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, textarea, options, style = {} }) {
  const s = { width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'DM Sans', color: C.text, background: C.bg, outline: 'none', boxSizing: 'border-box', ...style }
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>}
      {options ? <select value={value} onChange={e => onChange(e.target.value)} style={s}>{options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select> : textarea ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...s, resize: 'vertical' }} /> : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />}
    </div>
  )
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,18,21,0.5)', backdropFilter: 'blur(4px)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: C.white, borderRadius: 16, padding: 28, width: wide ? 600 : 440, maxWidth: '92vw', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontFamily: 'Fraunces', color: C.text }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="close" size={22} color={C.textMuted} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Empty({ icon, msg }) {
  return <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textMuted }}><div style={{ marginBottom: 12, opacity: 0.4, display: 'flex', justifyContent: 'center' }}><Icon name={icon} size={40} color={C.textMuted} /></div><p style={{ margin: 0, fontSize: 14 }}>{msg}</p></div>
}

// ─── IMAGE UPLOAD UTILITY ─────────────────────────────────────────
async function uploadImage(bucket, folder, file) {
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be under 5MB')
  const allowed = ['image/jpeg','image/png','image/webp','image/gif']
  if (!allowed.includes(file.type)) throw new Error('Only JPG, PNG, WebP and GIF images are allowed')
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

function ImageUpload({ currentUrl, onUpload, bucket, folder, size = 80, round = false, label, onRemove, uploading: extUploading }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || null)
  const ref = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('File too large (max 5MB)'); return }
    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
    // Upload
    setUploading(true)
    try {
      const url = await uploadImage(bucket, folder, file)
      setPreview(url)
      onUpload(url)
    } catch (err) {
      console.error('Upload error:', err)
      setPreview(currentUrl || null)
      showToast('Upload failed. Please try again.', 'error')
    }
    setUploading(false)
  }

  const isLoading = uploading || extUploading
  const sz = typeof size === 'number' ? size : parseInt(size)

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: sz, height: sz, borderRadius: round ? '50%' : 12, overflow: 'hidden', background: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', border: `2px dashed ${preview ? 'transparent' : C.textLight}`, cursor: 'pointer' }}
          onClick={() => document.getElementById(`img-up-${bucket}-${folder}`).click()}>
          {preview ? (
            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: sz > 60 ? 24 : 16, color: C.textLight }}>+</span>
          )}
          {isLoading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
        </div>
        <div>
          <button onClick={() => document.getElementById(`img-up-${bucket}-${folder}`).click()}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', marginBottom: 4, display: 'block' }}>
            {preview ? 'Change Photo' : 'Upload Photo'}
          </button>
          {preview && onRemove && (
            <button onClick={() => { setPreview(null); onRemove(); }}
              style={{ padding: '4px 14px', borderRadius: 8, border: 'none', background: 'transparent', color: C.danger, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>
              Remove
            </button>
          )}
        </div>
        <input id={`img-up-${bucket}-${folder}`} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </div>
  )
}

function GalleryUpload({ images = [], onUpdate, bucket, folder }) {
  const [uploading, setUploading] = useState(false)
  const [list, setList] = useState(images)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const newUrls = []
    for (const file of files) {
      try {
        const url = await uploadImage(bucket, folder, file)
        newUrls.push(url)
      } catch (err) {
        console.error('Gallery upload error:', err)
        alert('Upload failed for ' + file.name + '. Make sure storage bucket "' + bucket + '" exists.')
      }
    }
    if (newUrls.length) {
      const updated = [...list, ...newUrls]
      setList(updated)
      onUpdate(updated)
    }
    setUploading(false)
  }

  const removeImage = (idx) => {
    const updated = list.filter((_, i) => i !== idx)
    setList(updated)
    onUpdate(updated)
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Gallery Photos</label>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {list.map((img, i) => (
          <div key={i} style={{ width: 100, height: 72, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
        <div onClick={() => document.getElementById(`gallery-up-${folder}`).click()}
          style={{ width: 100, height: 72, borderRadius: 10, border: `2px dashed ${C.textLight}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          {uploading ? (
            <div style={{ width: 20, height: 20, border: '2px solid ' + C.accent, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <><span style={{ fontSize: 18, color: C.textLight }}>+</span><span style={{ fontSize: 10, color: C.textLight }}>Add</span></>
          )}
        </div>
      </div>
      <input id={`gallery-up-${folder}`} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
    </div>
  )
}

// Cancel Modal component
function CancelModal({ booking, onCancel, onClose }) {
  const [reason, setReason] = useState('')
  return (
    <Modal title="Cancel Booking" onClose={onClose}>
      <p style={{ fontSize: 14, color: C.textMuted }}>Are you sure you want to cancel this booking?</p>
      <Input label="Cancellation Reason" value={reason} onChange={setReason} textarea placeholder="Optional reason…" />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
        <Btn variant="ghost" onClick={onClose}>Keep Booking</Btn>
        <Btn variant="danger" onClick={() => onCancel(booking.id, reason)}>Confirm Cancel</Btn>
      </div>
    </Modal>
  )
}

// Reply Review Modal
function ReplyModal({ review, clients, onReply, onClose }) {
  const [reply, setReply] = useState('')
  const client = clients.find(c => c.id === review.client_id)
  return (
    <Modal title="Reply to Review" onClose={onClose}>
      <div style={{ padding: 14, borderRadius: 10, background: C.bg, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: C.text }}>{client?.name || 'Client'}</span>
          <span style={{ color: C.gold }}>{stars(review.rating_overall)}</span>
        </div>
        {review.review_text && <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>{review.review_text}</p>}
      </div>
      <Input label="Your Reply" value={reply} onChange={setReply} textarea placeholder="Write a professional reply…" />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!reply.trim()} onClick={() => onReply(review.id, reply.trim())}>Post Reply</Btn>
      </div>
    </Modal>
  )
}

// Staff Modal
function StaffModal({ staffMember, onSave, onClose }) {
  const isEdit = !!staffMember
  const s = staffMember || {}
  const [form, setForm] = useState({
    name: s.name || '', role: s.role || '', phone: s.phone || '', email: s.email || '',
    bio: s.bio || '', years_experience: s.years_experience || 0,
    start_time: s.start_time || '08:00:00', end_time: s.end_time || '17:00:00',
    specialties: (s.specialties || []).join(', '),
    working_days: s.working_days || [1, 2, 3, 4, 5],
    profile_photo: s.profile_photo || null,
  })
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const days = [{ v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' }, { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' }, { v: 7, l: 'Sun' }]
  const toggleDay = (d) => up('working_days', form.working_days.includes(d) ? form.working_days.filter(x => x !== d) : [...form.working_days, d])
  const save = () => {
    const data = { name: form.name, role: form.role, phone: form.phone, email: form.email, bio: form.bio, years_experience: parseInt(form.years_experience) || 0, start_time: form.start_time, end_time: form.end_time, specialties: form.specialties.split(',').map(x => x.trim()).filter(Boolean), working_days: form.working_days, profile_photo: form.profile_photo }
    onSave(isEdit ? s.id : null, data)
  }
  return (
    <Modal title={isEdit ? 'Edit Staff' : 'Add Staff Member'} onClose={onClose} wide>
      <ImageUpload currentUrl={form.profile_photo} bucket="avatars" folder="staff" label="Profile Photo" round
        onUpload={url => up('profile_photo', url)} onRemove={() => up('profile_photo', null)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Input label="Full Name" value={form.name} onChange={v => up('name', v)} placeholder="e.g. Mary Mwansa" />
        <Input label="Role" value={form.role} onChange={v => up('role', v)} placeholder="e.g. Senior Stylist" />
        <Input label="Phone" value={form.phone} onChange={v => up('phone', v)} placeholder="+260 97..." />
        <Input label="Email" value={form.email} onChange={v => up('email', v)} placeholder="staff@email.com" />
        <Input label="Years Experience" value={form.years_experience} onChange={v => up('years_experience', v)} type="number" />
        <Input label="Specialties" value={form.specialties} onChange={v => up('specialties', v)} placeholder="Braids, Natural Hair" />
        <Input label="Start Time" value={form.start_time} onChange={v => up('start_time', v)} type="time" />
        <Input label="End Time" value={form.end_time} onChange={v => up('end_time', v)} type="time" />
      </div>
      <Input label="Bio" value={form.bio} onChange={v => up('bio', v)} textarea placeholder="Brief description…" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Working Days</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map(d => <button key={d.v} onClick={() => toggleDay(d.v)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', border: `1.5px solid ${form.working_days.includes(d.v) ? C.accent : C.border}`, background: form.working_days.includes(d.v) ? C.accentLight : 'transparent', color: form.working_days.includes(d.v) ? C.accent : C.textMuted }}>{d.l}</button>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!form.name.trim()} onClick={save}>{isEdit ? 'Save Changes' : 'Add Staff'}</Btn>
      </div>
    </Modal>
  )
}

// Profile Modal
function ProfileModal({ branch, onSave, onClose }) {
  const [form, setForm] = useState({
    name: branch?.name || '', location: branch?.location || '', phone: branch?.phone || '', email: branch?.email || '',
    description: branch?.description || '', open_time: branch?.open_time || '08:00:00', close_time: branch?.close_time || '17:00:00',
    images: branch?.images || [],
    cancellation_hours: branch?.cancellation_hours ?? 2, cancellation_fee_percent: branch?.cancellation_fee_percent ?? 0, no_show_fee_percent: branch?.no_show_fee_percent ?? 50, slot_interval: branch?.slot_interval ?? 30,
    default_deposit: branch?.default_deposit ?? 100,
  })
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))
  return (
    <Modal title="Edit Branch Profile" onClose={onClose} wide>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Input label="Branch Name" value={form.name} onChange={v => up('name', v)} />
        <Input label="Location" value={form.location} onChange={v => up('location', v)} />
        <Input label="Phone" value={form.phone} onChange={v => up('phone', v)} />
        <Input label="Email" value={form.email} onChange={v => up('email', v)} />
        <Input label="Opens At" value={form.open_time} onChange={v => up('open_time', v)} type="time" />
        <Input label="Closes At" value={form.close_time} onChange={v => up('close_time', v)} type="time" />
      </div>
      <Input label="Description" value={form.description} onChange={v => up('description', v)} textarea />
      <GalleryUpload images={form.images} bucket="branches" folder={branch?.id || 'new'} onUpdate={urls => up('images', urls)} />
      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Cancellation Policy</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
          <Input label="Free cancel window (hours)" value={form.cancellation_hours} onChange={v => up('cancellation_hours', parseInt(v) || 0)} type="number" />
          <Input label="Late cancel fee (%)" value={form.cancellation_fee_percent} onChange={v => up('cancellation_fee_percent', parseInt(v) || 0)} type="number" />
          <Input label="No-show fee (%)" value={form.no_show_fee_percent} onChange={v => up('no_show_fee_percent', parseInt(v) || 0)} type="number" />
          <Input label="Booking slot interval (minutes)" value={form.slot_interval} onChange={v => up('slot_interval', parseInt(v) || 30)} options={[{value:15,label:'15 min'},{value:20,label:'20 min'},{value:30,label:'30 min'},{value:45,label:'45 min'},{value:60,label:'60 min'}]} />
          <Input label="Default Deposit (K)" value={form.default_deposit} onChange={v => up('default_deposit', parseFloat(v) || 0)} type="number" />
        </div>
        <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Clients can cancel for free up to {form.cancellation_hours}h before. Late: {form.cancellation_fee_percent}% fee. No-show: {form.no_show_fee_percent}% fee. Default deposit: K{form.default_deposit} (can be overridden per service).</p>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => onSave(form)}>Save Changes</Btn>
      </div>
    </Modal>
  )
}

function BlockTimeModal({ staffMember, blockedTimes, onAdd, onRemove, onClose }) {
  const [bDate, setBDate] = useState(todayStr())
  const [bStart, setBStart] = useState('')
  const [bEnd, setBEnd] = useState('')
  const [bReason, setBReason] = useState('day_off')
  const iSt = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: 'DM Sans', background: '#fff', marginBottom: 10 }
  const myBlocks = (blockedTimes || []).filter(bt => bt.staff_id === staffMember.id)
  return (
    <Modal title={`Time Off — ${staffMember.name}`} onClose={onClose}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Date</label>
      <input type="date" value={bDate} onChange={e => setBDate(e.target.value)} min={todayStr()} style={iSt} />
      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Time Range (leave empty for full day off)</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input type="time" value={bStart} onChange={e => setBStart(e.target.value)} style={{ ...iSt, flex: 1 }} />
        <input type="time" value={bEnd} onChange={e => setBEnd(e.target.value)} style={{ ...iSt, flex: 1 }} />
      </div>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Reason</label>
      <select value={bReason} onChange={e => setBReason(e.target.value)} style={iSt}>
        {[['day_off','Day Off'],['leave','Leave'],['personal','Personal'],['training','Training'],['break','Break']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => onAdd(staffMember.id, bDate, bStart || null, bEnd || null, bReason)}>Add Time Off</Btn>
      </div>
      {myBlocks.length > 0 && (
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>Upcoming Time Off</h4>
          {myBlocks.map(bt => (
            <div key={bt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13 }}>{fmtDate(bt.block_date)} {bt.start_time ? `${fmtTime(bt.start_time)}–${fmtTime(bt.end_time)}` : '(all day)'} — {bt.reason?.replace('_', ' ')}</span>
              <button onClick={() => onRemove(bt.id)} style={{ background: C.dangerBg, border: 'none', color: C.danger, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

const SERVICE_SUGGESTIONS = {
  Hair: ['Silk Press', 'Blow Dry', 'Hair Cut', 'Trim', 'Relaxer', 'Hair Coloring', 'Natural Hair Treatment', 'Wash & Set', 'Loc Maintenance', 'Twist Out', 'Deep Conditioning'],
  Braids: ['Box Braids', 'Cornrows', 'Knotless Braids', 'Lemonade Braids', 'Crochet Braids', 'Fulani Braids', 'Passion Twists', 'Faux Locs', 'Senegalese Twists', 'Ghana Braids', 'Feed-in Braids'],
  Nails: ['Gel Manicure', 'Acrylic Full Set', 'Pedicure Deluxe', 'Nail Art', 'Gel Pedicure', 'Acrylic Fill', 'Nail Removal', 'French Tips', 'Press-On Nails'],
  Skincare: ['Facial Classic', 'Deep Cleansing Facial', 'Chemical Peel', 'Microdermabrasion', 'LED Therapy', 'Acne Treatment', 'Anti-Aging Facial'],
  Spa: ['Full Body Massage', 'Back & Shoulder Massage', 'Hot Stone Massage', 'Aromatherapy Massage', 'Body Scrub', 'Body Wrap', 'Foot Massage'],
  Makeup: ['Makeup Application', 'Bridal Makeup', 'Photo Shoot Makeup', 'Makeup Lesson', 'Evening Glam', 'Natural/Everyday Look'],
  Lashes: ['Classic Lash Extensions', 'Volume Lash Extensions', 'Lash Lift & Tint', 'Lash Fill', 'Lash Removal', 'Mega Volume'],
  Barber: ['Haircut', 'Fade', 'Lineup', 'Beard Trim', 'Hot Towel Shave', 'Hair & Beard Combo', 'Kid\'s Cut'],
  Wigs: ['Wig Install', 'Wig Customization', 'Frontal Wig Install', 'Closure Install', 'Wig Wash & Style', 'Wig Revamp'],
  Other: [],
}
const SERVICE_CATEGORIES = Object.keys(SERVICE_SUGGESTIONS)

function ServiceModal({ service, branchId, onSave, onClose, existingAddons }) {
  const [form, setForm] = useState({
    name: service?.name || '',
    category: service?.category || 'Hair',
    price: service?.price || '',
    duration: service?.duration || 60,
    duration_max: service?.duration_max || '',
    description: service?.description || '',
    is_active: service?.is_active ?? true,
    deposit_amount: service?.deposit_amount ?? '',
  })
  const [images, setImages] = useState(service?.images || [])
  const [addons, setAddons] = useState(existingAddons || [])
  const [newAddon, setNewAddon] = useState({ name: '', price: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(!service)
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const suggestions = SERVICE_SUGGESTIONS[form.category] || []

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB per image'); return }
    if (images.length >= 3) { alert('Maximum 3 images per service'); return }
    setUploading(true)
    try {
      const url = await uploadImage('service-images', branchId, file)
      setImages(prev => [...prev, url])
    } catch (err) { showToast('Upload failed: ' + friendlyError(err.message), 'error') }
    setUploading(false)
  }

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx))

  const addAddon = () => {
    if (!newAddon.name || !newAddon.price) return
    setAddons(prev => [...prev, { name: newAddon.name, price: parseFloat(newAddon.price), is_active: true }])
    setNewAddon({ name: '', price: '' })
  }

  const removeAddon = (idx) => setAddons(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    const data = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      duration: parseInt(form.duration) || 60,
      duration_max: form.duration_max ? parseInt(form.duration_max) : null,
      description: form.description,
      deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : null,
      images,
      is_active: form.is_active,
      branch_id: branchId,
    }
    if (service?.id) {
      await onSave({ ...data, id: service.id, addons }, 'update')
    } else {
      await onSave({ ...data, addons }, 'create')
    }
    setSaving(false)
  }

  const iSt = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: 'DM Sans', background: '#fff', marginBottom: 12, color: C.text }

  return (
    <Modal title={service ? 'Edit Service' : 'Add New Service'} onClose={onClose}>
      {/* Category Selection */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 6 }}>Category *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SERVICE_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { up('category', cat); if (!service) { up('name', ''); setShowSuggestions(true) } }}
              style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${form.category === cat ? C.accent : C.border}`, background: form.category === cat ? C.accentLight : 'transparent', color: form.category === cat ? C.accent : C.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all .15s' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Service Name — suggestions or custom */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 6 }}>Service Name *</label>
        {showSuggestions && suggestions.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.textLight, marginBottom: 6 }}>Quick pick or type your own:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => { up('name', s); setShowSuggestions(false) }}
                  style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${form.name === s ? C.accent : C.border}`, background: form.name === s ? C.accentLight : '#fff', color: form.name === s ? C.accent : C.text, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all .15s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <input value={form.name} onChange={e => { up('name', e.target.value); setShowSuggestions(false) }} placeholder="Type service name..." style={iSt}
          onFocus={() => { if (!form.name && suggestions.length) setShowSuggestions(true) }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Price */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Price (K) *</label>
          <input type="number" value={form.price} onChange={e => up('price', e.target.value)} placeholder="e.g. 350" style={iSt} />
        </div>
        {/* Status */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Status</label>
          <select value={form.is_active ? 'active' : 'inactive'} onChange={e => up('is_active', e.target.value === 'active')} style={iSt}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {/* Duration min */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Duration (mins) *</label>
          <input type="number" value={form.duration} onChange={e => up('duration', e.target.value)} placeholder="60" style={iSt} />
        </div>
        {/* Duration max */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Max Duration (mins)</label>
          <input type="number" value={form.duration_max} onChange={e => up('duration_max', e.target.value)} placeholder="Optional" style={iSt} />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Description</label>
        <textarea value={form.description} onChange={e => up('description', e.target.value)} placeholder="Describe what's included in this service..." rows={3} style={{ ...iSt, resize: 'vertical' }} />
      </div>

      {/* Images (up to 3) */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 6 }}>Photos (up to 3)</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative', width: 90, height: 90, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
            </div>
          ))}
          {images.length < 3 && (
            <div onClick={() => document.getElementById('svc-img-upload').click()}
              style={{ width: 90, height: 90, borderRadius: 10, border: `2px dashed ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.textLight, transition: 'border-color .2s' }}>
              {uploading ? (
                <div style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <><span style={{ fontSize: 24, lineHeight: 1 }}>+</span><span style={{ fontSize: 10, marginTop: 2 }}>Add Photo</span></>
              )}
            </div>
          )}
        </div>
        <input id="svc-img-upload" type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageUpload} />
      </div>

      {/* Add-ons */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 6 }}>Add-ons (extras clients can add)</label>
        {addons.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {addons.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: C.bg, borderRadius: 8, marginBottom: 4, border: `1px solid ${C.border}` }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.text }}>{a.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>+K{a.price}</span>
                <button onClick={() => removeAddon(i)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newAddon.name} onChange={e => setNewAddon(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Extra Length" style={{ ...iSt, flex: 2, marginBottom: 0 }} />
          <input type="number" value={newAddon.price} onChange={e => setNewAddon(p => ({ ...p, price: e.target.value }))} placeholder="Price" style={{ ...iSt, flex: 1, marginBottom: 0 }} />
          <button onClick={addAddon} disabled={!newAddon.name || !newAddon.price}
            style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: newAddon.name && newAddon.price ? C.accent : C.border, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans', whiteSpace: 'nowrap' }}>+ Add</button>
        </div>
      </div>

      {/* Deposit Amount (per-service override) */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Deposit Amount (K)</label>
        <input type="number" value={form.deposit_amount} onChange={e => up('deposit_amount', e.target.value)} placeholder="Leave empty to use branch default" style={iSt} />
        <span style={{ fontSize: 11, color: C.textMuted }}>Override deposit for this service. Leave blank to use your branch's default deposit.</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Btn onClick={handleSubmit} disabled={saving || !form.name || !form.price}>{saving ? 'Saving...' : service ? 'Update Service' : 'Add Service'}</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  )
}

function WalkinModal({ services, staff, branch, clients, onSave, onClose }) {
  const [form, setForm] = useState({ service_id: '', staff_id: '', client_id: '', walk_in_name: '', client_notes: '' })
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const iSt = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: 'DM Sans', background: '#fff', marginBottom: 10, color: C.text }
  const sv = services.find(s => s.id === form.service_id)
  const [clientSearch, setClientSearch] = useState('')
  const matchedClients = clientSearch.length >= 2 ? clients.filter(c => c.name?.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone?.includes(clientSearch)).slice(0, 5) : []

  return (
    <Modal title="Walk-in Booking" onClose={onClose}>
      <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Create a booking for a client who walked in without an appointment.</p>

      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Service *</label>
      <select value={form.service_id} onChange={e => { const s = services.find(x => x.id === e.target.value); up('service_id', e.target.value); if (s) up('total_amount', s.price || 0) }} style={iSt}>
        <option value="">Select a service…</option>
        {services.filter(s => s.is_active !== false).map(s => <option key={s.id} value={s.id}>{s.name} — {fmt(s.price)}</option>)}
      </select>

      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Stylist</label>
      <select value={form.staff_id} onChange={e => up('staff_id', e.target.value)} style={iSt}>
        <option value="">Any available</option>
        {staff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role || 'Stylist'}</option>)}
      </select>

      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Existing Client (search by name/phone)</label>
      <input value={clientSearch} onChange={e => { setClientSearch(e.target.value); up('client_id', ''); up('walk_in_name', '') }} placeholder="Type to search…" style={iSt} />
      {matchedClients.length > 0 && (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 10, maxHeight: 120, overflowY: 'auto' }}>
          {matchedClients.map(c => (
            <div key={c.id} onClick={() => { up('client_id', c.id); up('walk_in_name', c.name); setClientSearch(c.name) }}
              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${C.border}`, fontSize: 13, background: form.client_id === c.id ? C.accentLight : 'transparent' }}>
              {c.name} — {c.phone || c.email}
            </div>
          ))}
        </div>
      )}

      {!form.client_id && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Or enter walk-in name</label>
          <input value={form.walk_in_name} onChange={e => up('walk_in_name', e.target.value)} placeholder="Client name" style={iSt} />
        </>
      )}

      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Notes</label>
      <textarea value={form.client_notes} onChange={e => up('client_notes', e.target.value)} placeholder="Any special requests…" rows={2} style={{ ...iSt, resize: 'vertical' }} />

      {sv && <div style={{ padding: 12, borderRadius: 8, background: C.accentLight, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>{sv.name}</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>{sv.duration || 60} min — {fmt(sv.price)}</div>
      </div>}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { if (!form.service_id) return; onSave({ ...form, duration: sv?.duration || 60, total_amount: sv?.price || 0 }) }} disabled={!form.service_id}>Create Walk-in</Btn>
      </div>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
// ═════ AUTH LOGIN SCREEN ═════
function StudioLogin({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState('login')
  const bp = useBreakpoint()

  const handleLogin = async () => {
    if (!email || !password) return setError('Please fill in all fields')
    setSubmitting(true); setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (err) return setError(friendlyError(err.message))
    onAuth(data.user)
  }

  const handleSignup = async () => {
    if (!email || !password || !name.trim()) return setError('Name, email & password required')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setSubmitting(true); setError('')
    const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { name, role: 'studio_owner' } } })
    setSubmitting(false)
    if (err) return setError(friendlyError(err.message))
    setMode('confirm')
  }

  const handleForgot = async () => {
    if (!email) return setError('Enter your email address')
    setSubmitting(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
    setSubmitting(false)
    if (err) return setError(friendlyError(err.message))
    setMode('reset_sent')
  }

  const iStyle = { width: '100%', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 15, background: C.white, color: C.text, fontFamily: 'DM Sans', marginBottom: 12, outline: 'none', boxSizing: 'border-box', minHeight: 48 }
  const isWide = bp !== 'mobile'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: isWide ? 'row' : 'column', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } body { background: ${C.bg}; } input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px rgba(196,125,90,0.15); } @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } .fade-up { animation: fadeUp .5s ease; }`}</style>
      <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.rose})`, padding: isWide ? '60px 48px' : '52px 24px 36px', borderRadius: isWide ? 0 : '0 0 32px 32px', textAlign: isWide ? 'left' : 'center', flex: isWide ? '0 0 45%' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: isWide ? '100vh' : 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: isWide ? 'flex-start' : 'center', marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="store" size={24} color="#fff" /></div>
        </div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: isWide ? 40 : 32, fontWeight: 700, color: '#fff', marginBottom: 8 }}>LuminBook Studio</h1>
        <p style={{ color: 'rgba(255,255,255,.85)', fontSize: isWide ? 18 : 15, maxWidth: 360, lineHeight: 1.5 }}>Manage your salon bookings, staff & clients from one dashboard</p>
      </div>
      <div className="fade-up" style={{ padding: isWide ? '48px 56px' : '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: isWide ? 480 : '100%' }}>
        {mode === 'confirm' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Icon name="mail" size={56} color={C.accent} /></div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
            <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Confirmation link sent to <strong>{email}</strong>. Click it to activate, then come back and sign in.</p>
            <Btn full variant="primary" onClick={() => { setMode('login'); setError('') }}>Go to Login</Btn>
          </div>
        ) : mode === 'reset_sent' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Icon name="check" size={56} color={C.success} /></div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Reset link sent</h2>
            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>Check <strong>{email}</strong> for a password reset link.</p>
            <Btn full variant="primary" onClick={() => { setMode('login'); setError('') }}>Back to Login</Btn>
          </div>
        ) : mode === 'forgot' ? (
          <>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Reset password</h2>
            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>Enter your email for a reset link</p>
            {error && <div style={{ background: '#fce4ec', color: '#c62828', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{error}</div>}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={iStyle} onKeyDown={e => e.key === 'Enter' && handleForgot()} />
            <Btn full variant="primary" disabled={submitting} onClick={handleForgot} style={{ marginBottom: 12 }}>{submitting ? 'Sending…' : 'Send Reset Link'}</Btn>
            <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 8, textAlign: 'center', width: '100%' }}>Back to login</button>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{mode === 'login' ? 'Welcome back' : 'Register your salon'}</h2>
            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>{mode === 'login' ? 'Sign in to your salon dashboard' : 'Create a studio owner account'}</p>
            {error && <div style={{ background: '#fce4ec', color: '#c62828', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{error}</div>}
            {mode === 'signup' && <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={iStyle} />}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={iStyle} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={iStyle} onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())} />
            <Btn full variant="primary" disabled={submitting} onClick={mode === 'login' ? handleLogin : handleSignup} style={{ marginBottom: 12 }}>{submitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</Btn>
            {mode === 'login' && <button onClick={() => { setMode('forgot'); setError('') }} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer', padding: 4, marginBottom: 8, textAlign: 'center', width: '100%' }}>Forgot password?</button>}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 8, textAlign: 'center', width: '100%' }}>{mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}</button>
          </>
        )}
      </div>
    </div>
  )
}

function StudioOnboarding({ authUser, onComplete, onLogout }) {
  const [form, setForm] = useState({ name: '', location: '', phone: '', open_time: '08:00', close_time: '18:00', slot_interval: 30 })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!form.name.trim()) return setError('Salon name is required')
    setSubmitting(true); setError('')
    const { data, error: err } = await supabase.from('branches').insert({
      name: form.name.trim(),
      location: form.location.trim() || null,
      phone: form.phone.trim() || null,
      open_time: form.open_time,
      close_time: form.close_time,
      slot_interval: form.slot_interval,
      owner_email: authUser.email,
      is_active: false,
      approval_status: 'pending',
      cancellation_hours: 2,
      cancellation_fee_percent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).select().single()
    setSubmitting(false)
    if (err) return setError(friendlyError(err.message))
    onComplete(data)
  }

  const is = { width: '100%', padding: '13px 16px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, background: '#fff', color: C.text, fontFamily: 'DM Sans', marginBottom: 12, outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } body { background: ${C.bg}; } input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px rgba(196,125,90,0.15); }`}</style>
      <div style={{ width: '100%', maxWidth: 440, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.accent}, ${C.rose})`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="sparkle" size={28} color="#fff" /></div>
          <h1 style={{ fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Set Up Your Salon</h1>
          <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.6 }}>Welcome! Let's create your salon profile to get started with LuminBook Studio.</p>
        </div>

        {error && <div style={{ background: '#fce8e8', color: C.danger, padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{error}</div>}

        <div style={{ marginBottom: 4 }}><label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Salon Name *</label></div>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Glow Beauty Lounge" style={is} />

        <div style={{ marginBottom: 4 }}><label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Location</label></div>
        <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Kabulonga, Lusaka" style={is} />

        <div style={{ marginBottom: 4 }}><label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Phone</label></div>
        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+260 97X XXX XXX" style={is} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ marginBottom: 4 }}><label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Opens</label></div>
            <input type="time" value={form.open_time} onChange={e => setForm(f => ({ ...f, open_time: e.target.value }))} style={is} />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}><label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Closes</label></div>
            <input type="time" value={form.close_time} onChange={e => setForm(f => ({ ...f, close_time: e.target.value }))} style={is} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 4 }}><label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Booking Slot Interval</label></div>
          <select value={form.slot_interval} onChange={e => setForm(f => ({ ...f, slot_interval: parseInt(e.target.value) }))} style={is}>
            <option value={15}>15 minutes</option><option value={20}>20 minutes</option><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option>
          </select>
        </div>

        <button onClick={handleCreate} disabled={submitting} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: C.accent, color: '#fff', fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', marginBottom: 12, opacity: submitting ? 0.6 : 1, minHeight: 48 }}>
          {submitting ? 'Creating…' : 'Create Salon'}
        </button>

        <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans' }}>Sign out</button>
      </div>
    </div>
  )
}

export default function App() {
  // ── AUTH STATE ──
  const bp = useBreakpoint()
  const [authUser, setAuthUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [branchId, setBranchId] = useState(null)
  const [branches, setBranches] = useState([])
  const [ownedBranches, setOwnedBranches] = useState([])
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [branch, setBranch] = useState(null)
  const [bookings, setBookings] = useState([])
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [serviceAddons, setServiceAddons] = useState([])
  const [clients, setClients] = useState([])
  const [reviews, setReviews] = useState([])
  const [blockedTimes, setBlockedTimes] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)

  // Offline detection
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  useEffect(() => {
    const goOff = () => setIsOffline(true)
    const goOn = () => setIsOffline(false)
    window.addEventListener('offline', goOff)
    window.addEventListener('online', goOn)
    return () => { window.removeEventListener('offline', goOff); window.removeEventListener('online', goOn) }
  }, [])

  const showToast = useCallback((msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }, [])

  // ── AUTH CHECK ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user || null)
      setAuthChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── FIND OWNED BRANCHES ──
  useEffect(() => {
    if (!authChecked) return
    if (authUser) {
      supabase.from('branches').select('id, name, owner_email, is_active, approval_status').then(({ data }) => {
        const owned = (data || []).filter(b => b.owner_email === authUser.email)
        setOwnedBranches(owned)
        if (owned.length > 0) {
          setBranchId(owned[0].id)
          setNeedsOnboarding(false)
        } else {
          setNeedsOnboarding(true)
        }
      })
    }
  }, [authChecked, authUser])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
    setBranchId(null)
    setOwnedBranches([])
    setNeedsOnboarding(false)
    setPage('dashboard')
  }

  const fetchAll = useCallback(async () => {
    if (!branchId) return
    setLoading(true)
    try {
      // Calculate date 6 months ago for booking limit
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10)

      const [branchRes, bookingRes, staffRes, serviceRes, reviewRes, branchesRes, blockedRes, waitlistRes, addonsRes] = await Promise.all([
        supabase.from('branches').select('*').eq('id', branchId).single(),
        supabase.from('bookings').select('*').eq('branch_id', branchId).gte('booking_date', sixMonthsAgoStr).order('booking_date', { ascending: false }).limit(500),
        supabase.from('staff').select('*').eq('branch_id', branchId).order('name'),
        supabase.from('services').select('*').eq('branch_id', branchId).order('category, name'),
        supabase.from('reviews').select('*').eq('branch_id', branchId).order('created_at', { ascending: false }),
        supabase.from('branches').select('id, name'),
        supabase.from('staff_blocked_times').select('*').eq('branch_id', branchId).gte('block_date', todayStr()).order('block_date'),
        supabase.from('waitlist').select('*').eq('branch_id', branchId).eq('status', 'waiting').order('preferred_date'),
        supabase.from('service_addons').select('*').eq('branch_id', branchId),
      ])
      const bkData = bookingRes.data || []
      setBranch(branchRes.data); setBookings(bkData); setStaff(staffRes.data || [])
      setServices(serviceRes.data || []); setReviews(reviewRes.data || [])
      setBranches(branchesRes.data || [])
      setBlockedTimes(blockedRes.data || []); setWaitlist(waitlistRes.data || [])
      setServiceAddons(addonsRes.data || [])

      // Fix #1: Only fetch clients who have booked at THIS branch (not all platform clients)
      const clientIds = [...new Set(bkData.map(b => b.client_id).filter(Boolean))]
      if (clientIds.length > 0) {
        // Supabase .in() has a limit, so batch if needed
        const batchSize = 200
        let allClients = []
        for (let i = 0; i < clientIds.length; i += batchSize) {
          const batch = clientIds.slice(i, i + batchSize)
          const { data } = await supabase.from('clients').select('*').in('id', batch)
          if (data) allClients = allClients.concat(data)
        }
        setClients(allClients)
      } else {
        setClients([])
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [branchId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Realtime subscription for new bookings
  useEffect(() => {
    if (!branchId) return
    const channel = supabase.channel('studio-bookings-' + branchId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `branch_id=eq.${branchId}` }, (payload) => {
        if (payload.eventType === 'INSERT') showToast('New booking received!');
        fetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `branch_id=eq.${branchId}` }, () => { showToast('New review received!'); fetchAll(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waitlist', filter: `branch_id=eq.${branchId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_blocked_times', filter: `branch_id=eq.${branchId}` }, () => fetchAll())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [branchId, fetchAll])

  const getClient = (id) => clients.find(c => c.id === id)
  const getStaffMember = (id) => staff.find(s => s.id === id)
  const getService = (id) => services.find(s => s.id === id)
  const todayBk = bookings.filter(b => b.booking_date === todayStr())
  const upcomingBk = bookings.filter(b => b.booking_date >= todayStr() && b.status !== 'cancelled')
  const completedBk = bookings.filter(b => b.status === 'completed')
  const todayRev = todayBk.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total_amount || 0), 0)
  const monthRev = completedBk.filter(b => { const d = new Date(b.booking_date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }).reduce((s, b) => s + (b.total_amount || 0), 0)
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating_overall, 0) / reviews.length).toFixed(1) : '—'
  const unreplied = reviews.filter(r => !r.response_text)

  // CRUD
  const updateBooking = async (id, data) => {
    const { error } = await supabase.from('bookings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { showToast(friendlyError(error.message), 'error'); return }
    showToast('Booking updated'); fetchAll(); setModal(null)
  }
  const cancelBooking = async (id, reason) => {
    await updateBooking(id, { status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason || null, cancelled_by: 'business' })
  }
  const updateBranch = async (data) => {
    const { error } = await supabase.from('branches').update({ ...data, updated_at: new Date().toISOString() }).eq('id', branchId)
    if (error) { showToast(friendlyError(error.message), 'error'); return }
    showToast('Profile updated'); fetchAll(); setModal(null)
  }
  const saveStaff = async (id, data) => {
    if (id) {
      const { error } = await supabase.from('staff').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) { showToast(friendlyError(error.message), 'error'); return }
    } else {
      const { error } = await supabase.from('staff').insert({ ...data, branch_id: branchId })
      if (error) { showToast(friendlyError(error.message), 'error'); return }
    }
    showToast(id ? 'Staff updated' : 'Staff added'); fetchAll(); setModal(null)
  }
  const saveService = async (data, action) => {
    const { addons, ...serviceData } = data
    let serviceId = data.id
    if (action === 'update') {
      const { error } = await supabase.from('services').update({ ...serviceData, updated_at: new Date().toISOString() }).eq('id', data.id)
      if (error) { showToast(friendlyError(error.message), 'error'); return }
    } else {
      const { data: newSvc, error } = await supabase.from('services').insert(serviceData).select('id').single()
      if (error) { showToast(friendlyError(error.message), 'error'); return }
      serviceId = newSvc.id
    }
    // Sync addons: delete existing, re-insert
    if (serviceId && addons) {
      await supabase.from('service_addons').delete().eq('service_id', serviceId)
      if (addons.length > 0) {
        const addonRows = addons.map(a => ({ service_id: serviceId, name: a.name, price: a.price, is_active: a.is_active ?? true }))
        await supabase.from('service_addons').insert(addonRows)
      }
    }
    showToast(action === 'update' ? 'Service updated' : 'Service added'); fetchAll(); setModal(null)
  }
  const toggleServiceActive = async (id, active) => {
    const { error } = await supabase.from('services').update({ is_active: !active, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { showToast(friendlyError(error.message), 'error'); return }
    showToast('Service status updated'); fetchAll()
  }
  const toggleStaffActive = async (id, active) => {
    const { error } = await supabase.from('staff').update({ is_active: !active, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { showToast(friendlyError(error.message), 'error'); return }
    showToast('Staff status updated'); fetchAll()
  }
  const replyReview = async (id, text) => {
    const { error } = await supabase.from('reviews').update({ response_text: text, response_date: todayStr(), updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { showToast(friendlyError(error.message), 'error'); return }
    showToast('Reply posted'); fetchAll(); setModal(null)
  }
  // Blocked times
  const addBlockedTime = async (staffId, date, startTime, endTime, reason) => {
    const { error } = await supabase.from('staff_blocked_times').insert({ staff_id: staffId, branch_id: branchId, block_date: date, start_time: startTime || null, end_time: endTime || null, reason: reason || 'day_off' })
    if (error) { showToast(friendlyError(error.message), 'error'); return }
    showToast('Time off added'); fetchAll(); setModal(null)
  }
  const removeBlockedTime = async (id) => {
    await supabase.from('staff_blocked_times').delete().eq('id', id)
    showToast('Time off removed'); fetchAll()
  }
  // Service image
  const updateServiceImages = async (id, images) => {
    const { error } = await supabase.from('services').update({ images, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) showToast(friendlyError(error.message), 'error')
    else { showToast('Images updated'); fetchAll() }
  }
  // Waitlist
  const dismissWaitlist = async (id) => {
    await supabase.from('waitlist').update({ status: 'notified', notified_at: new Date().toISOString() }).eq('id', id)
    showToast('Client notified'); fetchAll()
  }
  // SMS helpers
  const sendSMSAction = async (type, data = {}) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('sms-notify', { body: { type, ...data } })
      if (error) { showToast('SMS error: ' + error.message, 'error'); return }
      if (result?.sent) showToast('SMS sent successfully')
      else if (result?.skipped) showToast('SMS skipped: ' + (result.reason || 'see logs'), 'info')
      else showToast('SMS failed: ' + (result?.error || 'unknown'), 'error')
    } catch (e) { showToast('SMS error: ' + e.message, 'error') }
  }
  const sendReviewRequest = (bookingId) => sendSMSAction('send_review_request', { booking_id: bookingId })

  // ═════ DASHBOARD ═════
  const isPendingApproval = branch && (branch.approval_status === 'pending' || (!branch.is_active && branch.approval_status !== 'approved'))

  function DashboardView() {
    const todayNoShows = bookings.filter(b => b.booking_date === todayStr() && b.status === 'no_show').length
    const todayWalkins = bookings.filter(b => b.booking_date === todayStr() && b.is_walk_in).length
    const pendingCount = todayBk.filter(b => b.status === 'pending').length
    const stats = [
      { label: "Today's Bookings", value: todayBk.length, icon: 'calendar', color: C.accent, sub: pendingCount > 0 ? `${pendingCount} pending` : '' },
      { label: "Today's Revenue", value: fmt(todayRev), icon: 'dollar', color: C.gold, sub: `Month: ${fmt(monthRev)}` },
      { label: 'Walk-ins Today', value: todayWalkins, icon: 'walkin', color: C.accent, sub: '' },
      { label: 'No-shows', value: todayNoShows, icon: 'noshow', color: todayNoShows > 0 ? C.danger : C.textMuted, sub: unreplied.length > 0 ? `${unreplied.length} unreplied reviews` : '' },
    ]
    return (
      <div>
        {isPendingApproval && (
          <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Icon name="alert" size={22} color="#f9a825" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e65100' }}>Salon Pending Approval</div>
              <div style={{ fontSize: 13, color: '#795548', lineHeight: 1.5 }}>Your salon is being reviewed by the LuminBook team. You can set up your services, staff, and profile while you wait. Clients will be able to find and book you once approved.</div>
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -8, right: -4, opacity: 0.08 }}><Icon name={s.icon} size={52} color={s.color} /></div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: 'Fraunces' }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{s.sub}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card title="Today's Schedule" action={<Btn small variant="ghost" onClick={() => setPage('bookings')}>View All <ChevronRight size={14}/></Btn>}>
            {todayBk.length === 0 ? <Empty icon="calendar" msg="No bookings today" /> : todayBk.slice(0, 5).map(b => {
              const cl = getClient(b.client_id), sv = getService(b.service_id), st = getStaffMember(b.staff_id)
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: C.accent, fontSize: 13, flexShrink: 0, textAlign: 'center', lineHeight: 1.2 }}>{fmtTime(b.booking_time)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{cl?.name || 'Client'}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{sv?.name} • {st?.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <Badge status={b.status} />
                    {b.status === 'pending' && <button onClick={() => updateBooking(b.id, { status: 'confirmed' })} style={{ padding: '2px 8px', borderRadius: 6, border: `1px solid ${C.success}30`, background: '#e8f5ec', color: C.success, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 2 }}><Check size={12}/></button>}
                    {b.status === 'confirmed' && <button onClick={() => updateBooking(b.id, { status: 'arrived' })} style={{ padding: '2px 8px', borderRadius: 6, border: `1px solid #00695c30`, background: '#e0f7fa', color: '#00695c', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>In</button>}
                    {(b.status === 'arrived' || b.status === 'in_progress') && <button onClick={() => updateBooking(b.id, { status: 'completed', completed_at: new Date().toISOString() })} style={{ padding: '2px 8px', borderRadius: 6, border: `1px solid ${C.success}30`, background: '#e8f5ec', color: C.success, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>Done</button>}
                  </div>
                </div>
              )
            })}
          </Card>
          <Card title="Recent Reviews" action={<Btn small variant="ghost" onClick={() => setPage('reviews')}>View All <ChevronRight size={14}/></Btn>}>
            {reviews.length === 0 ? <Empty icon="star" msg="No reviews yet" /> : reviews.slice(0, 4).map(r => {
              const cl = getClient(r.client_id)
              return (
                <div key={r.id} style={{ padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{cl?.name || 'Client'}</span>
                    <span style={{ color: C.gold, fontSize: 13 }}>{stars(r.rating_overall)}</span>
                  </div>
                  {r.review_text && <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.4 }}>{r.review_text.slice(0, 80)}{r.review_text.length > 80 ? '…' : ''}</p>}
                  {!r.response_text && <Btn small variant="secondary" style={{ marginTop: 6 }} onClick={() => setModal({ type: 'replyReview', review: r })}>Reply</Btn>}
                </div>
              )
            })}
          </Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
          <Card title="Staff on Duty">
            {staff.filter(s => s.is_active).map(s => {
              const dow = new Date().getDay() || 7
              const on = (s.working_days || []).includes(dow)
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.profile_photo ? <img src={s.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 700, color: C.accent }}>{s.name[0]}</span>}
                  </div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div><div style={{ fontSize: 12, color: C.textMuted }}>{s.role}</div></div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: on ? C.successBg : C.dangerBg, color: on ? C.success : C.danger }}>{on ? 'On Duty' : 'Off'}</span>
                </div>
              )
            })}
          </Card>
          <Card title="Quick Stats">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[{ l: 'Month Revenue', v: fmt(monthRev), c: C.gold }, { l: 'Total Bookings', v: bookings.length, c: C.accent }, { l: 'Active Staff', v: staff.filter(s => s.is_active).length, c: C.success }, { l: 'Total Reviews', v: reviews.length, c: C.rose }].map((s, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 10, background: C.bg, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.c, fontFamily: 'Fraunces' }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {/* Waitlist */}
        {waitlist.length > 0 && (
          <Card title={`Waitlist (${waitlist.length})`} style={{ marginTop: 20 }}>
            {waitlist.slice(0, 5).map(w => {
              const cl = getClient(w.client_id), sv = getService(w.service_id), st = getStaffMember(w.staff_id)
              return (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.roseLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: C.rose, fontSize: 16 }}>{cl?.name?.[0] || '?'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{cl?.name || 'Client'}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{sv?.name || 'Any'} • {fmtDate(w.preferred_date)} {w.preferred_time ? fmtTime(w.preferred_time) : ''} {st ? `• ${st.name}` : ''}</div>
                  </div>
                  <Btn small variant="success" onClick={() => dismissWaitlist(w.id)}>Notify</Btn>
                </div>
              )
            })}
          </Card>
        )}
      </div>
    )
  }

  // ═════ BOOKINGS ═════
  function BookingsView() {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const filtered = bookings.filter(b => {
      if (filter !== 'all' && b.status !== filter) return false
      if (search) { const cl = getClient(b.client_id); const sv = getService(b.service_id); const q = search.toLowerCase(); return (cl?.name || '').toLowerCase().includes(q) || (sv?.name || '').toLowerCase().includes(q) }
      return true
    })
    return (
      <div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {['all', 'pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'no_show', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${filter === f ? C.accent : C.border}`, background: filter === f ? C.accentLight : 'transparent', color: filter === f ? C.accent : C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>{f === 'all' ? 'All' : (SC[f]?.label || f)}</button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client or service…" style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', width: 200, outline: 'none', color: C.text }} />
          <Btn small onClick={() => setModal({ type: 'walkinBooking' })} style={{ background: C.accent, color: '#fff' }}>+ Walk-in</Btn>
        </div>
        <Card>
          {filtered.length === 0 ? <Empty icon="calendar" msg="No bookings match" /> : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 1000 }}>
              <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>{['Date', 'Time', 'Client', 'Service', 'Staff', 'Amount', 'Deposit', 'Notes', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>)}</tr></thead>
              <tbody>{filtered.map(b => {
                const cl = getClient(b.client_id), sv = getService(b.service_id), st = getStaffMember(b.staff_id)
                return (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{fmtDate(b.booking_date)}</td>
                    <td style={{ padding: '12px 8px' }}>{fmtTime(b.booking_time)}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 600, color: C.text }}>{cl?.name || (b.walk_in_name || '—')}{b.is_walk_in && <span style={{ fontSize: 10, color: C.gold, marginLeft: 4 }}>WALK-IN</span>}</td>
                    <td style={{ padding: '12px 8px' }}>{sv?.name || '—'}</td>
                    <td style={{ padding: '12px 8px' }}>{st?.name || '—'}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{fmt(b.total_amount)}{b.discount_amount > 0 && <div style={{ fontSize: 10, color: C.gold }}>-{fmt(b.discount_amount)} pts</div>}</td>
                    <td style={{ padding: '12px 8px' }}>{b.deposit_paid ? <span style={{ color: C.success, fontWeight: 600, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 2 }}><Check size={12}/> K{b.deposit_amount || branch?.default_deposit || 100}</span> : <button onClick={() => updateBooking(b.id, { deposit_paid: true, deposit_paid_at: new Date().toISOString(), deposit_amount: b.deposit_amount || branch?.default_deposit || 100 })} style={{ padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 11, color: C.accent, fontFamily: 'DM Sans' }}>Mark Paid</button>}</td>
                    <td style={{ padding: '12px 8px', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, color: C.textMuted }} title={b.client_notes || ''}>{b.client_notes || '—'}</td>
                    <td style={{ padding: '12px 8px' }}><Badge status={b.status} /></td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {b.status === 'pending' && <Btn small variant="success" onClick={() => updateBooking(b.id, { status: 'confirmed' })}>Confirm</Btn>}
                        {b.status === 'confirmed' && <Btn small onClick={() => updateBooking(b.id, { status: 'arrived' })} style={{ background: '#e0f7fa', color: '#00695c', border: '1px solid #00695c40' }}>Arrived</Btn>}
                        {b.status === 'arrived' && <Btn small onClick={() => updateBooking(b.id, { status: 'in_progress' })} style={{ background: '#f3e5f5', color: '#7b1fa2', border: '1px solid #7b1fa240' }}>Start</Btn>}
                        {(b.status === 'arrived' || b.status === 'in_progress') && <Btn small variant="success" onClick={() => updateBooking(b.id, { status: 'completed', completed_at: new Date().toISOString() })}>Done</Btn>}
                        {(b.status === 'confirmed' || b.status === 'pending') && <>
                          <Btn small variant="danger" onClick={() => setModal({ type: 'cancelBooking', booking: b })}>Cancel</Btn>
                          <Btn small onClick={() => { updateBooking(b.id, { status: 'no_show' }); const fee = Math.round((b.total_amount || 0) * (branch?.no_show_fee_percent || 50) / 100); showToast(`No-show marked. Fee: ${fmt(fee)}`) }} style={{ background: '#fce4ec', color: '#880e4f', border: '1px solid #880e4f40', fontSize: 11 }}>No-show</Btn>
                        </>}
                        <Btn small variant="ghost" onClick={() => setModal({ type: 'viewBooking', booking: b })}>View</Btn>
                      </div>
                    </td>
                  </tr>
                )
              })}</tbody>
            </table>
            </div>
          )}
        </Card>
      </div>
    )
  }

  // ═════ SCHEDULE ═════
  function ScheduleView() {
    const [selDate, setSelDate] = useState(todayStr())
    const [tab, setTab] = useState('calendar')
    const [editStaff, setEditStaff] = useState(null)
    const [blockForm, setBlockForm] = useState({ staff_id: '', block_date: todayStr(), start_time: '', end_time: '', reason: 'day_off' })
    const dayBk = bookings.filter(b => b.booking_date === selDate && b.status !== 'cancelled')
    const openH = parseInt((branch?.open_time || '08:00').slice(0, 2))
    const closeH = parseInt((branch?.close_time || '17:00').slice(0, 2))
    const hours = Array.from({ length: closeH - openH + 1 }, (_, i) => i + openH)
    const getWeek = () => {
      const d = new Date(selDate + 'T12:00:00'); const day = d.getDay() || 7
      const mon = new Date(d); mon.setDate(d.getDate() - day + 1)
      return Array.from({ length: 7 }, (_, i) => { const dt = new Date(mon); dt.setDate(mon.getDate() + i); return dt.toISOString().split('T')[0] })
    }
    const week = getWeek()
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const allDays = [{ v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' }, { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' }, { v: 7, l: 'Sun' }]

    const saveStaffHours = async (s) => {
      const { error } = await supabase.from('staff').update({ working_days: editStaff.working_days, start_time: editStaff.start_time, end_time: editStaff.end_time, updated_at: new Date().toISOString() }).eq('id', s.id)
      if (!error) { showToast('Schedule updated'); setEditStaff(null); fetchAll() } else showToast(friendlyError(error.message), 'error')
    }

    const addBlock = async () => {
      if (!blockForm.staff_id || !blockForm.block_date) return showToast('Select staff & date', 'error')
      await addBlockedTime(blockForm.staff_id, blockForm.block_date, blockForm.start_time || null, blockForm.end_time || null, blockForm.reason)
      setBlockForm(f => ({ ...f, start_time: '', end_time: '', reason: 'day_off' }))
    }

    const tabs = [{ id: 'calendar', l: 'Calendar', icon: 'calendar' }, { id: 'hours', l: 'Staff Hours', icon: 'clock' }, { id: 'blocked', l: 'Time Off', icon: 'noshow' }]

    return (
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, border: tab === t.id ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: tab === t.id ? C.accentLight : C.white, color: tab === t.id ? C.accent : C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', minHeight: 44 }}>
              <Icon name={t.icon} size={16} color={tab === t.id ? C.accent : C.textMuted} />{t.l}
            </button>
          ))}
        </div>

        {tab === 'calendar' && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              {week.map((d, i) => {
                const isTdy = d === todayStr(), isSel = d === selDate
                const cnt = bookings.filter(b => b.booking_date === d && b.status !== 'cancelled').length
                return (
                  <button key={d} onClick={() => setSelDate(d)} style={{ padding: bp === 'mobile' ? '8px 10px' : '10px 16px', borderRadius: 12, border: isSel ? `2px solid ${C.accent}` : `1px solid ${C.border}`, background: isSel ? C.accentLight : isTdy ? C.bg : C.white, cursor: 'pointer', fontFamily: 'DM Sans', textAlign: 'center', minWidth: bp === 'mobile' ? 44 : 72, transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>{dayNames[i]}</div>
                    <div style={{ fontSize: bp === 'mobile' ? 16 : 20, fontWeight: 700, color: isSel ? C.accent : C.text, fontFamily: 'Fraunces' }}>{new Date(d + 'T12:00:00').getDate()}</div>
                    {cnt > 0 && <div style={{ fontSize: 10, color: C.accent, fontWeight: 700 }}>{cnt}</div>}
                  </button>
                )
              })}
            </div>
            <Card title={`Schedule \u2014 ${fmtDate(selDate)}`}>
              {hours.map(h => {
                const hBk = dayBk.filter(b => parseInt((b.booking_time || '').split(':')[0]) === h)
                return (
                  <div key={h} style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, minHeight: 56 }}>
                    <div style={{ width: 70, padding: '10px 0', fontSize: 12, fontWeight: 600, color: C.textMuted, flexShrink: 0 }}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</div>
                    <div style={{ flex: 1, display: 'flex', gap: 8, padding: '6px 0', flexWrap: 'wrap' }}>
                      {hBk.map(b => {
                        const cl = getClient(b.client_id), sv = getService(b.service_id), st = getStaffMember(b.staff_id)
                        const sc = SC[b.status] || SC.pending
                        return (
                          <div key={b.id} onClick={() => setModal({ type: 'viewBooking', booking: b })} style={{ padding: '8px 12px', borderRadius: 8, background: sc.bg, borderLeft: `3px solid ${sc.text}`, cursor: 'pointer', flex: '1 1 200px', maxWidth: 300 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{cl?.name || b.walk_in_name || 'Client'}</div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>{sv?.name || 'Service'} \u2022 {st?.name || 'Any'} \u2022 {b.duration}min</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {dayBk.length === 0 && <Empty icon="calendar" msg="No appointments this day" />}
            </Card>
          </>
        )}

        {tab === 'hours' && (
          <Card title="Staff Working Hours">
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Set each staff member\u2019s regular working days and hours. Clients can only book during these times.</p>
            {staff.length === 0 ? <Empty icon="users" msg="Add staff first in the Staff tab" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {staff.map(s => {
                  const isEditing = editStaff?.id === s.id
                  const data = isEditing ? editStaff : s
                  return (
                    <div key={s.id} style={{ border: `1px solid ${isEditing ? C.accent : C.border}`, borderRadius: 12, padding: 16, background: isEditing ? `${C.accent}05` : C.white }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEditing ? 16 : 0, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: C.accent, fontSize: 14 }}>{s.name?.[0]}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{s.name}</div>
                            <div style={{ fontSize: 12, color: C.textMuted }}>{s.role || 'Stylist'} \u2022 {(data.working_days || []).length} days/week \u2022 {(data.start_time || '09:00').slice(0, 5)}\u2013{(data.end_time || '17:00').slice(0, 5)}</div>
                          </div>
                        </div>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn small onClick={() => saveStaffHours(s)}>Save</Btn>
                            <Btn small variant="ghost" onClick={() => setEditStaff(null)}>Cancel</Btn>
                          </div>
                        ) : (
                          <Btn small variant="secondary" onClick={() => setEditStaff({ ...s })}>Edit</Btn>
                        )}
                      </div>
                      {isEditing && (
                        <div>
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Working Days</label>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {allDays.map(d => {
                                const on = (editStaff.working_days || []).includes(d.v)
                                return <button key={d.v} onClick={() => setEditStaff(p => ({ ...p, working_days: on ? p.working_days.filter(x => x !== d.v) : [...(p.working_days || []), d.v] }))} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${on ? C.accent : C.border}`, background: on ? C.accentLight : C.white, color: on ? C.accent : C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', minHeight: 40 }}>{d.l}</button>
                              })}
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Start Time</label>
                              <input type="time" value={(editStaff.start_time || '09:00').slice(0, 5)} onChange={e => setEditStaff(p => ({ ...p, start_time: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'DM Sans', color: C.text }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>End Time</label>
                              <input type="time" value={(editStaff.end_time || '17:00').slice(0, 5)} onChange={e => setEditStaff(p => ({ ...p, end_time: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: 'DM Sans', color: C.text }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )}

        {tab === 'blocked' && (
          <>
            <Card title="Block Time Off">
              <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Block off times when staff are unavailable. Clients won\u2019t be able to book these slots.</p>
              <div style={{ display: 'grid', gridTemplateColumns: bp === 'mobile' ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16, padding: 16, background: C.bg, borderRadius: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Staff</label>
                  <select value={blockForm.staff_id} onChange={e => setBlockForm(f => ({ ...f, staff_id: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', color: C.text }}>
                    <option value="">Select staff\u2026</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Date</label>
                  <input type="date" value={blockForm.block_date} onChange={e => setBlockForm(f => ({ ...f, block_date: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', color: C.text }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>From (blank = all day)</label>
                  <input type="time" value={blockForm.start_time} onChange={e => setBlockForm(f => ({ ...f, start_time: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', color: C.text }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>To</label>
                  <input type="time" value={blockForm.end_time} onChange={e => setBlockForm(f => ({ ...f, end_time: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', color: C.text }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Reason</label>
                  <select value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', color: C.text }}>
                    <option value="day_off">Day Off</option><option value="leave">Leave</option><option value="lunch">Lunch Break</option><option value="personal">Personal</option><option value="training">Training</option><option value="other">Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Btn onClick={addBlock} style={{ width: '100%' }}>Block Time</Btn>
                </div>
              </div>
            </Card>
            <Card title="Upcoming Blocked Times" style={{ marginTop: 16 }}>
              {blockedTimes.length === 0 ? <Empty icon="clock" msg="No blocked times set" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {blockedTimes.sort((a, b) => a.block_date.localeCompare(b.block_date)).map(bt => {
                    const st = getStaffMember(bt.staff_id)
                    return (
                      <div key={bt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{st?.name || 'Staff'}</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>{fmtDate(bt.block_date)} \u2022 {bt.start_time ? `${bt.start_time.slice(0, 5)}\u2013${(bt.end_time || '').slice(0, 5)}` : 'All day'} \u2022 {(bt.reason || 'day_off').replace(/_/g, ' ')}</div>
                        </div>
                        <button onClick={() => removeBlockedTime(bt.id)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.danger}30`, background: '#fce4ec', color: C.danger, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', minHeight: 36 }}>Remove</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    )
  }

  // ═════ STAFF ═════
  function StaffView() {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><Btn onClick={() => setModal({ type: 'addStaff' })}>+ Add Staff</Btn></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {staff.map(s => {
            const dow = new Date().getDay() || 7, on = (s.working_days || []).includes(dow)
            return (
              <Card key={s.id}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.profile_photo ? <img src={s.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 700, color: C.accent, fontSize: 20 }}>{s.name[0]}</span>}
                  </div>
                  <div><div style={{ fontWeight: 700, fontSize: 16, color: C.text, fontFamily: 'Fraunces' }}>{s.name}</div><div style={{ fontSize: 13, color: C.textMuted }}>{s.role}</div><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: on ? C.successBg : C.dangerBg, color: on ? C.success : C.danger }}>{on ? 'On Duty' : 'Off'}</span></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[{ l: 'Rating', v: s.rating ? <span style={{display:'flex',alignItems:'center',gap:2}}>{s.rating}<Star size={12} fill="#c9a84c" stroke="#c9a84c" strokeWidth={0}/></span> : '—' }, { l: 'Done', v: s.bookings_completed || 0 }, { l: 'Exp', v: `${s.years_experience || 0}yr` }].map((x, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: 8, borderRadius: 8, background: C.bg }}><div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{x.v}</div><div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase' }}>{x.l}</div></div>
                  ))}
                </div>
                {s.specialties?.length > 0 && <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>{s.specialties.map(sp => <span key={sp} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: C.goldLight, color: C.gold, fontWeight: 500 }}>{sp}</span>)}</div>}
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn small variant="secondary" onClick={() => setModal({ type: 'editStaff', staffMember: s })}>Edit</Btn>
                  <Btn small variant="ghost" onClick={() => setModal({ type: 'blockTime', staffMember: s })}>Time Off</Btn>
                  <Btn small variant={s.is_active ? 'danger' : 'success'} onClick={() => toggleStaffActive(s.id, s.is_active)}>{s.is_active ? 'Deactivate' : 'Activate'}</Btn>
                </div>
                {blockedTimes.filter(bt => bt.staff_id === s.id).length > 0 && (
                  <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>Upcoming Time Off</div>
                    {blockedTimes.filter(bt => bt.staff_id === s.id).slice(0, 3).map(bt => (
                      <div key={bt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '4px 0' }}>
                        <span style={{ color: C.textMuted }}>{bt.block_date} {bt.start_time ? `${fmtTime(bt.start_time)}–${fmtTime(bt.end_time)}` : '(all day)'}</span>
                        <button onClick={() => removeBlockedTime(bt.id)} style={{ background: 'none', border: 'none', color: C.danger, fontSize: 14, cursor: 'pointer', padding: '0 4px' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ═════ SERVICES ═════
  function ServicesView() {
    const cats = [...new Set(services.map(s => s.category))]
    const getAddons = (svcId) => serviceAddons.filter(a => a.service_id === svcId)
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: C.textMuted }}>{services.length} services across {cats.length} categories</div>
          <Btn onClick={() => setModal({ type: 'addService' })}>+ Add Service</Btn>
        </div>
        {cats.length === 0 ? (
          <Card><Empty icon="scissors" msg="No services yet. Add your first service to get started." /></Card>
        ) : cats.map(cat => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 18, fontFamily: 'Fraunces', color: C.text, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${C.accentLight}` }}>{cat}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {services.filter(s => s.category === cat).map(s => {
                const sAddons = getAddons(s.id)
                const thumb = s.images?.[0]
                return (
                  <Card key={s.id} style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }} onClick={() => setModal({ type: 'editService', service: s })}>
                    {thumb && <img src={thumb} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />}
                    {s.images?.length > 1 && <div style={{ position: 'absolute', top: thumb ? 102 : 8, right: 12, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>+{s.images.length - 1} more</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div><div style={{ fontWeight: 700, fontSize: 15, color: C.text, fontFamily: 'Fraunces' }}>{s.name}</div><div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{s.duration}min{s.duration_max ? ` – ${s.duration_max}min` : ''}</div></div>
                      <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700, fontSize: 17, color: C.accent }}>{fmt(s.price)}</div></div>
                    </div>
                    {s.description && <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4, margin: '6px 0' }}>{s.description}</p>}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.gold, padding: '3px 8px', borderRadius: 8, background: C.goldLight }}>Deposit: K{s.deposit_amount || branch?.default_deposit || 100}</div>
                      {sAddons.length > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, padding: '3px 8px', borderRadius: 8, background: C.accentLight }}>{sAddons.length} add-on{sAddons.length > 1 ? 's' : ''}</div>}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => toggleServiceActive(s.id, s.is_active)} style={{ background: s.is_active ? C.successBg : C.dangerBg, border: 'none', color: s.is_active ? C.success : C.danger, borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{s.is_active ? 'Active' : 'Inactive'}</button>
                      </div>
                    </div>
                    <span style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: s.is_active ? C.success : C.danger }} />
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ═════ CLIENTS ═════
  function ClientsView() {
    const [search, setSearch] = useState('')
    const filtered = clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search) || (c.email || '').includes(search))
    return (
      <div>
        <div style={{ marginBottom: 16 }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', width: 320, outline: 'none', color: C.text, background: C.white }} /></div>
        <Card>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
            <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>{['Client', 'Phone', 'Bookings', 'Spent', 'LuminPoints', 'Status'].map(h => <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }} onClick={() => setModal({ type: 'viewClient', client: c })}>
                <td style={{ padding: '12px 8px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: '50%', background: C.roseLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: C.rose, fontSize: 13 }}>{c.name[0]}</div><div><div style={{ fontWeight: 600, color: C.text }}>{c.name}</div><div style={{ fontSize: 11, color: C.textMuted }}>{c.email}</div></div></div></td>
                <td style={{ padding: '12px 8px' }}>{c.phone}</td>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>{c.total_bookings || 0}</td>
                <td style={{ padding: '12px 8px', fontWeight: 600, color: C.accent }}>{fmt(c.total_spent || 0)}</td>
                <td style={{ padding: '12px 8px' }}><span style={{ fontWeight: 700, color: C.gold }}>{c.lumin_points || 0}</span> pts</td>
                <td style={{ padding: '12px 8px' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: c.is_active ? C.successBg : C.dangerBg, color: c.is_active ? C.success : C.danger }}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}</tbody>
          </table>
          </div>
        </Card>
      </div>
    )
  }

  // ═════ REVIEWS ═════
  function ReviewsView() {
    const [filter, setFilter] = useState('all')
    const filtered = reviews.filter(r => filter === 'unreplied' ? !r.response_text : filter === 'replied' ? !!r.response_text : true)
    return (
      <div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          {['all', 'unreplied', 'replied'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${filter === f ? C.rose : C.border}`, background: filter === f ? C.roseLight : 'transparent', color: filter === f ? C.rose : C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', textTransform: 'capitalize' }}>{f}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontSize: 28, fontWeight: 700, color: C.gold, fontFamily: 'Fraunces' }}>{avgRating}</span><div><div style={{ color: C.gold, fontSize: 14 }}>{stars(parseFloat(avgRating) || 0)}</div><div style={{ fontSize: 11, color: C.textMuted }}>{reviews.length} reviews</div></div></div>
        </div>
        {filtered.length === 0 ? <Card><Empty icon="star" msg="No reviews match" /></Card> : filtered.map(r => {
          const cl = getClient(r.client_id), sv = getService(r.service_id), st = getStaffMember(r.staff_id)
          return (
            <Card key={r.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.roseLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: C.rose }}>{(cl?.name || 'C')[0]}</div>
                  <div><div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{cl?.name || 'Client'}</div><div style={{ fontSize: 12, color: C.textMuted }}>{sv?.name}{st ? ` • ${st.name}` : ''} • {new Date(r.created_at).toLocaleDateString()}</div></div>
                </div>
                <div style={{ color: C.gold, fontSize: 16 }}>{stars(r.rating_overall)}</div>
              </div>
              {r.review_text && <p style={{ margin: '12px 0', fontSize: 14, color: C.text, lineHeight: 1.5, paddingLeft: 54 }}>{r.review_text}</p>}
              {r.response_text ? (
                <div style={{ marginLeft: 54, padding: '12px 16px', borderRadius: 10, background: C.bg, borderLeft: `3px solid ${C.accent}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 4 }}>YOUR REPLY • {r.response_date}</div>
                  <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.4 }}>{r.response_text}</p>
                </div>
              ) : <div style={{ marginLeft: 54, marginTop: 8 }}><Btn small variant="secondary" onClick={() => setModal({ type: 'replyReview', review: r })}>Reply to Review</Btn></div>}
            </Card>
          )
        })}
      </div>
    )
  }

  // ═════ FINANCIALS ═════
  function FinancialsView() {
    const now = new Date()
    const thisM = completedBk.filter(b => { const d = new Date(b.booking_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    const lastM = completedBk.filter(b => { const d = new Date(b.booking_date); const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear() })
    const tmRev = thisM.reduce((s, b) => s + (b.total_amount || 0), 0)
    const lmRev = lastM.reduce((s, b) => s + (b.total_amount || 0), 0)
    const fees = thisM.reduce((s, b) => s + (b.platform_fee || 0), 0)
    const net = tmRev - fees
    const noShows = bookings.filter(b => b.status === 'no_show')
    const noShowsThisM = noShows.filter(b => { const d = new Date(b.booking_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    const noShowFees = noShowsThisM.reduce((s, b) => s + Math.round((b.total_amount || 0) * (branch?.no_show_fee_percent || 50) / 100), 0)
    const depositsThisM = thisM.filter(b => b.deposit_paid).reduce((s, b) => s + (b.deposit_amount || 0), 0)
    const growth = lmRev > 0 ? Math.round(((tmRev - lmRev) / lmRev) * 100) : (tmRev > 0 ? 100 : 0)

    // Revenue trend — last 6 months
    const trendData = Array.from({ length: 6 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const mBk = completedBk.filter(b => { const d = new Date(b.booking_date); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() })
      return { month: m.toLocaleDateString('en-ZM', { month: 'short' }), revenue: mBk.reduce((s, b) => s + (b.total_amount || 0), 0), count: mBk.length }
    })
    const maxRev = Math.max(...trendData.map(t => t.revenue), 1)

    const bySvc = {}, byStf = {}
    completedBk.forEach(b => { const n = getService(b.service_id)?.name || 'Other'; bySvc[n] = (bySvc[n] || 0) + (b.total_amount || 0) })
    completedBk.forEach(b => { const n = getStaffMember(b.staff_id)?.name || 'Unassigned'; byStf[n] = (byStf[n] || 0) + (b.total_amount || 0) })
    const bar = (data, color1, color2) => Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, amt]) => {
      const mx = Math.max(...Object.values(data))
      return (
        <div key={name} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{name}</span><span style={{ fontSize: 13, fontWeight: 700, color: color1 }}>{fmt(amt)}</span></div>
          <div style={{ height: 6, borderRadius: 3, background: C.bg, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color1}, ${color2})`, width: `${(amt / mx) * 100}%` }} /></div>
        </div>
      )
    })
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { l: 'This Month', v: fmt(tmRev), c: C.gold, s: `${thisM.length} bookings • ${growth >= 0 ? '↑' : '↓'}${Math.abs(growth)}% vs last month` },
            { l: 'Last Month', v: fmt(lmRev), c: C.textMuted, s: `${lastM.length} bookings` },
            { l: 'Net Earnings', v: fmt(net), c: C.success, s: `After ${fmt(fees)} in fees` },
          ].map((s, i) => (
            <Card key={i}><div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{s.l}</div><div style={{ fontSize: 26, fontWeight: 700, color: s.c, fontFamily: 'Fraunces' }}>{s.v}</div><div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{s.s}</div></Card>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            { l: 'Deposits Collected', v: fmt(depositsThisM), c: C.accent, s: 'This month' },
            { l: 'No-shows', v: `${noShowsThisM.length}`, c: C.danger, s: `${fmt(noShowFees)} in fees` },
            { l: 'Avg per Booking', v: fmt(thisM.length ? Math.round(tmRev / thisM.length) : 0), c: C.accent, s: 'This month' },
          ].map((s, i) => (
            <Card key={i}><div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{s.l}</div><div style={{ fontSize: 22, fontWeight: 700, color: s.c, fontFamily: 'Fraunces' }}>{s.v}</div><div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{s.s}</div></Card>
          ))}
        </div>

        {/* Revenue Trend Chart */}
        <Card title="Revenue Trend (6 Months)" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, padding: '10px 0' }}>
            {trendData.map((t, i) => {
              const h = maxRev > 0 ? (t.revenue / maxRev) * 140 : 0
              const isCurrentMonth = i === trendData.length - 1
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isCurrentMonth ? C.accent : C.textMuted }}>{fmt(t.revenue)}</span>
                  <div style={{ width: '100%', maxWidth: 60, height: Math.max(h, 4), borderRadius: 6, background: isCurrentMonth ? `linear-gradient(180deg, ${C.accent}, ${C.rose})` : `linear-gradient(180deg, ${C.border}, ${C.bg})`, transition: 'height 0.3s' }} />
                  <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{t.month}</span>
                  <span style={{ fontSize: 10, color: C.textLight }}>{t.count} bk</span>
                </div>
              )
            })}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <Card title="Revenue by Service">{Object.keys(bySvc).length ? bar(bySvc, C.accent, C.rose) : <Empty icon="dollar" msg="No data yet" />}</Card>
          <Card title="Revenue by Staff">{Object.keys(byStf).length ? bar(byStf, C.gold, C.accent) : <Empty icon="dollar" msg="No data yet" />}</Card>
        </div>
        <Card title="Recent Transactions" style={{ marginTop: 0 }}>
          {completedBk.length === 0 ? <Empty icon="dollar" msg="No transactions yet" /> : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
              <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>{['Date', 'Client', 'Service', 'Amount', 'Fee', 'Net'].map(h => <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>{completedBk.slice(0, 10).map(b => {
                const cl = getClient(b.client_id), sv = getService(b.service_id)
                return (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 8px' }}>{fmtDate(b.booking_date)}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{cl?.name || '—'}</td>
                    <td style={{ padding: '10px 8px' }}>{sv?.name || '—'}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: C.success }}>{fmt(b.total_amount)}</td>
                    <td style={{ padding: '10px 8px', color: C.danger }}>-{fmt(b.platform_fee || 0)}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>{fmt((b.total_amount || 0) - (b.platform_fee || 0))}</td>
                  </tr>
                )
              })}</tbody>
            </table>
            </div>
          )}
        </Card>
      </div>
    )
  }

  // ═════ PROFILE ═════
  function ProfileView() {
    if (!branch) return null
    return (
      <div style={{ maxWidth: 700 }}>
        <Card>
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {branch.images?.[0] ? <img src={branch.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="store" size={36} color={C.accent} />}
            </div>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 24, fontFamily: 'Fraunces', color: C.text }}>{branch.name}</h2>
              <p style={{ margin: '0 0 4px', fontSize: 14, color: C.textMuted }}>{branch.location}</p>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: C.textMuted }}>{branch.phone} • {branch.email}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}><span style={{ color: C.gold }}>{stars(branch.rating || 0)}</span><span style={{ fontSize: 13, color: C.textMuted }}>{branch.rating} ({branch.review_count} reviews)</span></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ padding: 16, borderRadius: 10, background: C.bg }}><div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>Hours</div><div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{fmtTime(branch.open_time)} – {fmtTime(branch.close_time)}</div></div>
            <div style={{ padding: 16, borderRadius: 10, background: C.bg }}><div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>Default Deposit</div><div style={{ fontSize: 15, fontWeight: 600, color: C.gold }}>K{branch.default_deposit ?? 100}</div></div>
            <div style={{ padding: 16, borderRadius: 10, background: C.bg }}><div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>Status</div><div style={{ display: 'flex', gap: 8 }}><span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: branch.is_active ? C.successBg : C.dangerBg, color: branch.is_active ? C.success : C.danger }}>{branch.is_active ? 'Active' : 'Inactive'}</span><span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: C.pendingBg, color: C.pending }}>{branch.approval_status}</span></div></div>
            <div style={{ padding: 16, borderRadius: 10, background: C.bg }}><div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>Cancellation</div><div style={{ fontSize: 13, color: C.text }}>Free within {branch.cancellation_hours ?? 2}h • Late: {branch.cancellation_fee_percent ?? 0}% • No-show: {branch.no_show_fee_percent ?? 50}%</div></div>
          </div>
          {branch.description && <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>About</div><p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.5 }}>{branch.description}</p></div>}
          {branch.images?.length > 0 && <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>Gallery</div><div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>{branch.images.map((img, i) => <img key={i} src={img} alt="" style={{ width: 160, height: 110, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />)}</div></div>}
          <Btn onClick={() => setModal({ type: 'editProfile' })}>Edit Branch Profile</Btn>
        </Card>

        {/* SMS Settings */}
        <Card title="SMS Notifications" style={{ marginTop: 20 }}>
          <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Send automatic SMS to clients when bookings are confirmed, cancelled, or as reminders.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div onClick={() => updateBranch({ sms_enabled: !branch.sms_enabled })} style={{ width: 44, height: 24, borderRadius: 12, background: branch.sms_enabled ? C.accent : C.border, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: branch.sms_enabled ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px #00000020' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{branch.sms_enabled ? 'SMS Enabled' : 'SMS Disabled'}</span>
            </label>
          </div>
          {branch.sms_enabled && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Sender Name</label>
                <input value={branch.sms_sender_name || 'LuminBook'} onChange={e => updateBranch({ sms_sender_name: e.target.value })} placeholder="LuminBook" maxLength={11} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', color: C.text }} />
                <span style={{ fontSize: 10, color: C.textLight }}>Max 11 chars, alphanumeric</span>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Reminder Hours Before</label>
                <input type="number" value={branch.sms_reminder_hours || 24} onChange={e => updateBranch({ sms_reminder_hours: parseInt(e.target.value) || 24 })} min={1} max={72} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans', color: C.text }} />
              </div>
            </div>
          )}
          {branch.sms_enabled && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: C.bg }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>SMS will be sent for:</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 2.2 }}>
                <span style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}><Check size={13} color={C.success}/> Booking confirmed</span>
                <span style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}><Check size={13} color={C.success}/> Booking cancelled</span>
                <span style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}><Check size={13} color={C.success}/> 24h appointment reminder</span>
                <span style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}><Check size={13} color={C.success}/> No-show notification</span>
                <span style={{ color: C.textMuted }}>Cost: ~K0.17 per SMS (billed via Africa's Talking)</span>
              </div>
            </div>
          )}
        </Card>

        {/* Suggestion Box */}
        <StudioSuggestionBox branch={branch} showToast={showToast} />
      </div>
    )
  }

  function StudioSuggestionBox({ branch, showToast: toast }) {
    const [open, setOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [cat, setCat] = useState('general')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const cats = ['general', 'feature request', 'bug report', 'complaint', 'compliment']
    const iSt = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: 'DM Sans', background: '#fff', color: C.text }

    const submit = async () => {
      if (!msg.trim()) return
      setSending(true)
      const { error } = await supabase.from('suggestions').insert({ source: 'salon', author_name: branch?.name || null, author_email: branch?.owner_email || null, branch_id: branch?.id || null, category: cat, message: msg.trim() })
      setSending(false)
      if (error) { toast(error.message, 'error'); return }
      setSent(true); setMsg('')
      setTimeout(() => { setSent(false); setOpen(false) }, 2500)
      toast('Thanks for your feedback!')
    }

    if (sent) return (
      <Card style={{ marginTop: 20, textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ marginBottom: 8 }}><Icon name="check" size={28} color="#2e7d32" /></div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Thank you!</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Your suggestion has been submitted to LuminBook</div>
      </Card>
    )

    return (
      <Card title="Suggestion Box" style={{ marginTop: 20 }}>
        {!open ? (
          <div>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>Have ideas on how to improve LuminBook? We'd love to hear from you.</p>
            <Btn variant="ghost" onClick={() => setOpen(true)}>Share a Suggestion →</Btn>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 6 }}>Category</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${cat === c ? C.accent : C.border}`, background: cat === c ? C.accentLight : 'transparent', color: cat === c ? C.accent : C.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', textTransform: 'capitalize' }}>{c}</button>)}
              </div>
            </div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Tell us what you'd like to see improved, added, or fixed..." rows={4} style={{ ...iSt, marginBottom: 12, resize: 'vertical', minHeight: 100 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
              <Btn onClick={submit} disabled={sending || !msg.trim()}>{sending ? 'Sending...' : 'Submit'}</Btn>
            </div>
          </div>
        )}
      </Card>
    )
  }

  // ═════ MODAL ROUTER ═════
  function ModalRouter() {
    if (!modal) return null
    const { type } = modal
    if (type === 'cancelBooking') return <CancelModal booking={modal.booking} onCancel={cancelBooking} onClose={() => setModal(null)} />
    if (type === 'replyReview') return <ReplyModal review={modal.review} clients={clients} onReply={replyReview} onClose={() => setModal(null)} />
    if (type === 'addStaff') return <StaffModal onSave={saveStaff} onClose={() => setModal(null)} />
    if (type === 'editStaff') return <StaffModal staffMember={modal.staffMember} onSave={saveStaff} onClose={() => setModal(null)} />
    if (type === 'editProfile') return <ProfileModal branch={branch} onSave={updateBranch} onClose={() => setModal(null)} />
    if (type === 'addService') return <ServiceModal branchId={branchId} onSave={saveService} onClose={() => setModal(null)} existingAddons={[]} />
    if (type === 'editService') return <ServiceModal service={modal.service} branchId={branchId} onSave={saveService} onClose={() => setModal(null)} existingAddons={serviceAddons.filter(a => a.service_id === modal.service?.id)} />
    if (type === 'blockTime') return <BlockTimeModal staffMember={modal.staffMember} blockedTimes={blockedTimes} onAdd={addBlockedTime} onRemove={removeBlockedTime} onClose={() => setModal(null)} />
    if (type === 'walkinBooking') {
      return <WalkinModal services={services} staff={staff} branch={branch} onSave={async (data) => {
        const { error } = await supabase.from('bookings').insert({
          branch_id: branch.id, service_id: data.service_id, staff_id: data.staff_id || null,
          client_id: data.client_id || null, booking_date: todayStr(), booking_time: new Date().toTimeString().slice(0, 5),
          duration: data.duration || 60, total_amount: data.total_amount || 0,
          status: 'arrived', is_walk_in: true, walk_in_name: data.walk_in_name || null,
          client_notes: data.client_notes || null,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        })
        if (!error) { showToast('Walk-in booking created! 🚶'); fetchAll(); setModal(null) }
        else showToast('Error: ' + error.message, 'error')
      }} clients={clients} onClose={() => setModal(null)} />
    }
    if (type === 'viewBooking') {
      const b = modal.booking, cl = getClient(b.client_id), sv = getService(b.service_id), st = getStaffMember(b.staff_id)
      return (
        <Modal title="Booking Details" onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Date', fmtDate(b.booking_date)], ['Time', fmtTime(b.booking_time)], ['Client', cl?.name || (b.walk_in_name || '—')], ['Service', sv?.name || '—'], ['Staff', st?.name || '—'], ['Duration', `${b.duration} min`], ['Amount', fmt(b.total_amount)], ['Fee', fmt(b.platform_fee)], ['Status', (SC[b.status]?.label || b.status)], ['Deposit', b.deposit_paid ? `Yes — ${fmt(b.deposit_amount || branch?.default_deposit || 100)}` : `Required: K${sv?.deposit_amount || branch?.default_deposit || 100}`], ['Points Used', b.points_used > 0 ? `${b.points_used} pts (-${fmt(b.discount_amount)})` : '—'], ['Type', b.is_walk_in ? 'Walk-in' : 'Online']].map(([l, v]) => <div key={l}><div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 2 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{v}</div></div>)}
          </div>
          {b.client_notes && <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: C.bg }}><strong style={{ fontSize: 11, color: C.textMuted }}>CLIENT NOTES:</strong><p style={{ margin: '4px 0 0', fontSize: 13 }}>{b.client_notes}</p></div>}
          {b.cancellation_reason && <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: '#fce4ec' }}><strong style={{ fontSize: 11, color: '#c62828' }}>CANCELLATION REASON:</strong><p style={{ margin: '4px 0 0', fontSize: 13, color: '#c62828' }}>{b.cancellation_reason}</p></div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {b.status === 'pending' && <Btn variant="success" onClick={() => { updateBooking(b.id, { status: 'confirmed' }); setModal(null) }}>Confirm</Btn>}
            {b.status === 'confirmed' && <Btn onClick={() => { updateBooking(b.id, { status: 'arrived' }); setModal(null) }} style={{ background: '#e0f7fa', color: '#00695c', border: '1px solid #00695c' }}>Mark Arrived</Btn>}
            {b.status === 'arrived' && <Btn onClick={() => { updateBooking(b.id, { status: 'in_progress' }); setModal(null) }} style={{ background: '#f3e5f5', color: '#7b1fa2', border: '1px solid #7b1fa2' }}>Start Service</Btn>}
            {(b.status === 'arrived' || b.status === 'in_progress') && <Btn variant="success" onClick={() => { updateBooking(b.id, { status: 'completed', completed_at: new Date().toISOString() }); setModal(null) }}>Complete</Btn>}
            {(b.status === 'confirmed' || b.status === 'pending') && <>
              <Btn onClick={() => { updateBooking(b.id, { status: 'no_show' }); setModal(null); showToast('Marked as no-show') }} style={{ background: '#fce4ec', color: '#880e4f', border: '1px solid #880e4f' }}>No-show</Btn>
              <Btn variant="danger" onClick={() => { setModal({ type: 'cancelBooking', booking: b }) }}>Cancel</Btn>
            </>}
            {!b.deposit_paid && !['cancelled','no_show'].includes(b.status) && <Btn onClick={() => { updateBooking(b.id, { deposit_paid: true, deposit_paid_at: new Date().toISOString(), deposit_amount: b.deposit_amount || branch?.default_deposit || 100 }); setModal(null); showToast('Deposit marked as paid') }} style={{ background: C.bg, color: C.gold, border: `1px solid ${C.gold}` }}>Mark Deposit Paid</Btn>}
            {b.status === 'completed' && branch?.sms_enabled && <Btn onClick={() => { sendReviewRequest(b.id); setModal(null) }} style={{ background: C.bg, color: C.accent, border: `1px solid ${C.accent}` }}><Phone size={14} color={C.accent}/> Request Review SMS</Btn>}
          </div>
        </Modal>
      )
    }
    if (type === 'viewClient') {
      const c = modal.client, cb = bookings.filter(b => b.client_id === c.id)
      return (
        <Modal title="Client Details" onClose={() => setModal(null)} wide>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.roseLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: C.rose, fontSize: 22 }}>{c.name[0]}</div>
            <div><h3 style={{ margin: '0 0 4px', fontSize: 18, fontFamily: 'Fraunces', color: C.text }}>{c.name}</h3><div style={{ fontSize: 13, color: C.textMuted }}>{c.phone} • {c.email}</div><div style={{ display: 'flex', gap: 12, marginTop: 8 }}><span style={{ fontSize: 12, fontWeight: 600, color: C.gold }}>✦ {c.lumin_points || 0} LuminPoints</span><span style={{ fontSize: 12, color: C.textMuted }}>Spent: {fmt(c.total_spent || 0)}</span></div></div>
          </div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>Booking History</h4>
          {cb.length === 0 ? <p style={{ fontSize: 13, color: C.textMuted }}>No bookings at your branch.</p> : cb.slice(0, 8).map(b => {
            const sv = getService(b.service_id)
            return <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}><div><span style={{ fontWeight: 600, fontSize: 13 }}>{sv?.name || 'Service'}</span><span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{fmtDate(b.booking_date)}</span></div><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontWeight: 600, fontSize: 13 }}>{fmt(b.total_amount)}</span><Badge status={b.status} /></div></div>
          })}
        </Modal>
      )
    }
    return null
  }

  // ═════ WALLET ═════
  function WalletView() {
    const [walletData, setWalletData] = useState(null)
    const [walletLoading, setWalletLoading] = useState(true)
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', phone: '', name: '', network: 'mtn' })
    const [withdrawing, setWithdrawing] = useState(false)
    const [showWithdraw, setShowWithdraw] = useState(false)

    const SUPABASE_URL = supabase.supabaseUrl

    const loadWallet = useCallback(async () => {
      if (!branch?.id) return
      setWalletLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const apiKey = supabase.supabaseKey || ''
        const res = await fetch(SUPABASE_URL + '/functions/v1/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (session?.access_token || ''), 'apikey': apiKey },
          body: JSON.stringify({ action: 'get_wallet', branch_id: branch.id })
        })
        const data = await res.json()
        if (data.success) setWalletData(data)
      } catch (e) { console.error('Wallet load error:', e) }
      setWalletLoading(false)
    }, [branch?.id])

    useEffect(() => { loadWallet() }, [loadWallet])

    const requestWithdraw = async () => {
      if (!withdrawForm.amount || !withdrawForm.phone) return
      setWithdrawing(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const apiKey = supabase.supabaseKey || ''
        const res = await fetch(SUPABASE_URL + '/functions/v1/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (session?.access_token || ''), 'apikey': apiKey },
          body: JSON.stringify({ action: 'request', branch_id: branch.id, amount: parseFloat(withdrawForm.amount), withdraw_to_phone: withdrawForm.phone, withdraw_to_name: withdrawForm.name, network: withdrawForm.network })
        })
        const data = await res.json()
        if (data.error) { showToast(data.error, 'error') }
        else { showToast('Withdrawal request submitted! You will be paid manually within 24h.'); setShowWithdraw(false); setWithdrawForm({ amount: '', phone: '', name: '', network: 'mtn' }); loadWallet() }
      } catch (e) { showToast('Failed: ' + e.message, 'error') }
      setWithdrawing(false)
    }

    if (walletLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: C.textMuted }}><div style={{ textAlign: 'center' }}><Icon name="refresh" size={32} color={C.textMuted} /><div style={{ fontSize: 14, marginTop: 8 }}>Loading wallet...</div></div></div>

    const w = walletData?.wallet
    const txns = walletData?.transactions || []
    const wds = walletData?.withdrawals || []
    const bal = parseFloat(w?.balance || 0)
    const earned = parseFloat(w?.total_earned || 0)
    const withdrawn = parseFloat(w?.total_withdrawn || 0)
    const feesPaid = parseFloat(w?.total_fees_paid || 0)

    return (
      <div>
        {/* Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { l: 'Available Balance', v: fmt(bal), c: C.success, icon: 'dollar' },
            { l: 'Total Earned', v: fmt(earned), c: C.accent, icon: 'trendUp' },
            { l: 'Total Withdrawn', v: fmt(withdrawn), c: C.gold, icon: '💸' },
            { l: 'Platform Fees Paid', v: fmt(feesPaid), c: C.textMuted, icon: '🏷️' },
          ].map((s, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.l}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.c, fontFamily: 'Fraunces' }}>{s.v}</div>
            </Card>
          ))}
        </div>

        {/* Request Withdrawal */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Withdraw Funds</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>Request a manual payout to your mobile money account</p>
            </div>
            <Btn small variant="primary" disabled={bal < 1} onClick={() => setShowWithdraw(!showWithdraw)}>{showWithdraw ? 'Cancel' : 'Request Withdrawal'}</Btn>
          </div>
          {showWithdraw && (
            <div style={{ marginTop: 20, padding: 20, background: C.bg, borderRadius: 12 }}>
              <div style={{ padding: '10px 14px', background: '#fff8e1', borderRadius: 8, marginBottom: 14, border: '1px solid #ffe082', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
                <span style={{ fontSize: 12, color: '#6d5600', lineHeight: 1.5 }}>Payouts are processed manually. After submitting, you will receive the funds to your mobile money within 24 hours. You'll see the status update once payment is confirmed.</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Amount (K)</label>
                  <input value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))} type="number" max={bal} placeholder={`Max: ${bal.toFixed(2)}`} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, background: C.white, fontFamily: 'DM Sans' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Phone Number</label>
                  <input value={withdrawForm.phone} onChange={e => setWithdrawForm(f => ({ ...f, phone: e.target.value }))} placeholder="0971234567" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, background: C.white, fontFamily: 'DM Sans' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Recipient Name</label>
                  <input value={withdrawForm.name} onChange={e => setWithdrawForm(f => ({ ...f, name: e.target.value }))} placeholder="Name on account" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, background: C.white, fontFamily: 'DM Sans' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: 'block', marginBottom: 4 }}>Network</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['mtn', 'airtel', 'zamtel'].map(n => (
                      <button key={n} onClick={() => setWithdrawForm(f => ({ ...f, network: n }))} style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: withdrawForm.network === n ? `2px solid ${C.accent}` : `1.5px solid ${C.border}`, background: withdrawForm.network === n ? C.accentLight : C.white, color: withdrawForm.network === n ? C.accent : C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', textTransform: 'uppercase' }}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn small variant="primary" disabled={!withdrawForm.amount || !withdrawForm.phone || withdrawing || parseFloat(withdrawForm.amount) > bal} onClick={requestWithdraw}>{withdrawing ? 'Submitting...' : `Request K${withdrawForm.amount || '0'} Payout`}</Btn>
                <Btn small variant="ghost" onClick={() => setShowWithdraw(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </Card>

        {/* Pending Payouts — Status View (read-only for salon owners) */}
        {wds.filter(w => w.status === 'pending' || w.status === 'processing').length > 0 && (
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>⏳</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Pending Payouts</h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
              Your withdrawal is being processed by the LuminBook team. You'll receive the funds to your mobile money within 24 hours.
            </p>
            {wds.filter(w => w.status === 'pending' || w.status === 'processing').map(wd => (
              <div key={wd.id} style={{ padding: 16, background: C.bg, borderRadius: 12, marginBottom: 10, border: `1.5px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'Fraunces', marginBottom: 4 }}>{fmt(wd.amount)}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} color={C.textMuted}/> <strong>{wd.withdraw_to_phone}</strong> ({(wd.network || 'mobile').toUpperCase()})</div>
                    {wd.withdraw_to_name && <div style={{ fontSize: 12, color: C.textMuted }}>{wd.withdraw_to_name}</div>}
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Requested {new Date(wd.created_at).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 20, background: '#fff3e0', color: '#e65100', textTransform: 'uppercase' }}>⏳ Awaiting Payment</span>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Wallet Transactions */}
        <Card title="Wallet Transactions">
          {txns.length === 0 ? <Empty icon="dollar" msg="No transactions yet" /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
                <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>{['Date', 'Type', 'Amount', 'Balance', 'Description'].map(h => <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>{txns.map(t => (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 8px', fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ padding: '10px 8px' }}><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: t.type === 'credit' ? C.successBg : t.type === 'withdrawal' ? '#fff3e0' : C.dangerBg, color: t.type === 'credit' ? C.success : t.type === 'withdrawal' ? '#e65100' : C.danger, textTransform: 'uppercase' }}>{t.type}</span></td>
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: t.type === 'credit' ? C.success : C.danger }}>{t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{fmt(t.balance_after)}</td>
                    <td style={{ padding: '10px 8px', fontSize: 12, color: C.textMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Payout History */}
        {wds.length > 0 && (
          <Card title="Payout History" style={{ marginTop: 20 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
                <thead><tr style={{ borderBottom: `2px solid ${C.border}` }}>{['Date', 'Amount', 'To', 'Network', 'Status'].map(h => <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>{wds.map(wd => (
                  <tr key={wd.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 8px', fontSize: 12 }}>{new Date(wd.created_at).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>{fmt(wd.amount)}</td>
                    <td style={{ padding: '10px 8px' }}>{wd.withdraw_to_phone}</td>
                    <td style={{ padding: '10px 8px', textTransform: 'uppercase', fontSize: 12, fontWeight: 600 }}>{wd.network || '—'}</td>
                    <td style={{ padding: '10px 8px' }}><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: wd.status === 'completed' ? C.successBg : wd.status === 'failed' || wd.status === 'rejected' ? C.dangerBg : C.pendingBg, color: wd.status === 'completed' ? C.success : wd.status === 'failed' || wd.status === 'rejected' ? C.danger : C.pending, textTransform: 'uppercase' }}>{wd.status === 'completed' ? 'Paid ✓' : wd.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // ═════ LAYOUT ═════
  const VIEWS = { dashboard: DashboardView, bookings: BookingsView, schedule: ScheduleView, staff: StaffView, services: ServicesView, clients: ClientsView, reviews: ReviewsView, financials: FinancialsView, wallet: WalletView, profile: ProfileView }
  const View = VIEWS[page] || DashboardView
  const title = NAV.find(n => n.id === page)?.label || 'Dashboard'

  // ═══ AUTH GATE ═══
  if (!authChecked) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: C.textMuted }}><div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Icon name="refresh" size={32} color={C.textMuted} /></div><div style={{ fontSize: 14 }}>Loading…</div></div>
    </div>
  )

  if (!authUser) return (
    <StudioLogin onAuth={user => setAuthUser(user)} />
  )

  if (needsOnboarding) return (
    <StudioOnboarding
      authUser={authUser}
      onComplete={(branch) => {
        setOwnedBranches([branch])
        setBranchId(branch.id)
        setNeedsOnboarding(false)
      }}
      onLogout={handleLogout}
    />
  )

  if (!branchId) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', color: C.textMuted }}><div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Icon name="refresh" size={32} color={C.textMuted} /></div><div style={{ fontSize: 14 }}>Loading branch…</div></div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.bg }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; } body { background: ${C.bg}; font-family: 'DM Sans', system-ui, sans-serif; }
::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
input:focus,textarea:focus,select:focus { outline: none; border-color: ${C.accent} !important; box-shadow: 0 0 0 3px rgba(196,125,90,0.15); transition: border-color .15s, box-shadow .15s; }
@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes drawerIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
@keyframes toastIn { 0% { opacity: 0; transform: translateY(16px) scale(.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes badgePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
@keyframes successPop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes tabSlide { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: translateX(0); } }
.page-in { animation: pageIn .3s cubic-bezier(.16,1,.3,1) both; }
.page-content { animation: slideIn .35s cubic-bezier(.16,1,.3,1) both; }
.scale-in { animation: scaleIn .25s cubic-bezier(.16,1,.3,1) both; }
.toast-anim { animation: toastIn .3s cubic-bezier(.16,1,.3,1) both; }
.badge-pulse { animation: badgePulse 2s ease-in-out infinite; }
.success-pop { animation: successPop .4s cubic-bezier(.34,1.56,.64,1) both; }
.tab-content { animation: tabSlide .25s cubic-bezier(.16,1,.3,1) both; }
.skeleton { background: linear-gradient(90deg, ${C.border} 25%, #f5f0ed 50%, ${C.border} 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; border-radius: 8px; }
.card-hover { transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease; }
.card-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,18,21,.06); }
.btn-hover { transition: all .15s cubic-bezier(.16,1,.3,1); }
.btn-hover:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); }
.btn-hover:active:not(:disabled) { transform: scale(.97) translateY(0); }
.star-btn { transition: transform .12s cubic-bezier(.34,1.56,.64,1); cursor: pointer; display: inline-flex; }
.star-btn:hover { transform: scale(1.2); }
.star-btn:active { transform: scale(.9); }
.icon-btn { transition: all .15s ease; display: flex; align-items: center; justify-content: center; }
.icon-btn:hover { background: rgba(196,125,90,.08); transform: scale(1.05); }
tr { transition: background .15s ease; } tr:hover { background: ${C.bg}; }
.touch-target { min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: center; }
.stagger-1{animation-delay:.05s}.stagger-2{animation-delay:.1s}.stagger-3{animation-delay:.15s}.stagger-4{animation-delay:.2s}.stagger-5{animation-delay:.25s}
`}</style>

      {/* Offline Banner */}
      {isOffline && <div role="alert" style={{position:'fixed',top:0,left:0,right:0,zIndex:2100,background:'#c62828',color:'#fff',textAlign:'center',padding:'8px 16px',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Icon name="alert" size={14} color="#fff"/>You're offline — check your connection</div>}

      {/* Mobile/Tablet Drawer Overlay */}
      {bp !== 'desktop' && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050 }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'relative', width: 280, maxWidth: '80vw', background: C.sidebar, height: '100%', display: 'flex', flexDirection: 'column', animation: 'drawerIn .25s ease', boxShadow: '4px 0 24px rgba(0,0,0,.2)' }}>
            <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.rose})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>G</div>
                <div><div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Fraunces' }}>LuminBook</div><div style={{ fontSize: 10, color: C.textLight, textTransform: 'uppercase', letterSpacing: 1 }}>Studio</div></div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="touch-target" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="close" size={20} color="rgba(255,255,255,.5)" /></button>
            </div>
            <div style={{ padding: '0 12px', marginBottom: 12 }}>
              <select value={branchId} onChange={e => setBranchId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: C.sidebarHover, color: '#fff', fontSize: 13, fontFamily: 'DM Sans', cursor: 'pointer', outline: 'none', minHeight: 44 }}>
                {(ownedBranches.length ? ownedBranches : branches).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
              {NAV.map(item => <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: page === item.id ? 'rgba(196,125,90,0.15)' : 'transparent', border: 'none', borderLeft: page === item.id ? `3px solid ${C.accent}` : '3px solid transparent', color: page === item.id ? C.accent : 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: page === item.id ? 600 : 400, cursor: 'pointer', fontFamily: 'DM Sans', textAlign: 'left', minHeight: 48, borderRadius: 0 }}><Icon name={item.icon} size={20} color={page === item.id ? C.accent : 'rgba(255,255,255,0.55)'} />{item.label}</button>)}
            </nav>
            <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {authUser && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authUser.email}</div>}
              <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans', textAlign: 'center', minHeight: 44 }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {bp === 'desktop' && (
        <div style={{ width: 240, background: C.sidebar, padding: '24px 0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
          <div style={{ padding: '0 20px', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => { setPage('profile'); setSidebarOpen(false) }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.rose})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>G</div>
              <div><div style={{ fontSize: 17, fontWeight: 700, color: '#fff', fontFamily: 'Fraunces' }}>LuminBook</div><div style={{ fontSize: 10, color: C.textLight, textTransform: 'uppercase', letterSpacing: 1 }}>Studio</div></div>
            </div>
          </div>
          <div style={{ padding: '0 12px', marginBottom: 20 }}>
            <select value={branchId} onChange={e => setBranchId(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: C.sidebarHover, color: '#fff', fontSize: 12, fontFamily: 'DM Sans', cursor: 'pointer', outline: 'none' }}>
              {(ownedBranches.length ? ownedBranches : branches).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <nav style={{ flex: 1 }}>
            {NAV.map(item => {
              const active = page === item.id
              return <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', background: active ? 'rgba(196,125,90,0.15)' : 'transparent', border: 'none', borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent', color: active ? C.accent : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'DM Sans', textAlign: 'left', transition: 'all 0.15s' }}><Icon name={item.icon} size={18} color={active ? C.accent : 'rgba(255,255,255,0.55)'} />{item.label}</button>
            })}
          </nav>
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {authUser && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authUser.email}</div>}
            <button onClick={handleLogout} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans', textAlign: 'left' }}>Sign Out</button>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>LuminBook Studio v1.0</div>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: bp === 'desktop' ? 240 : 0 }}>
        <header style={{ padding: bp === 'desktop' ? '16px 32px' : '12px 16px', background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: bp === 'desktop' ? 16 : 10 }}>
            {bp !== 'desktop' && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="touch-target" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Icon name="menu" size={24} color={C.text} />
              </button>
            )}
            <div><h1 style={{ margin: 0, fontSize: bp === 'desktop' ? 22 : 18, fontFamily: 'Fraunces', fontWeight: 600, color: C.text }}>{title}</h1><p style={{ margin: 0, fontSize: 12, color: C.textMuted, display: bp === 'mobile' ? 'none' : 'block' }}>{branch?.name || 'Loading…'} • {new Date().toLocaleDateString('en-ZM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {unreplied.length > 0 && <button onClick={() => setPage('reviews')} style={{ padding: '6px 14px', borderRadius: 20, background: C.roseLight, border: 'none', color: C.rose, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans', minHeight: 36, display: bp === 'mobile' ? 'none' : 'inline-flex', alignItems: 'center' }}>{unreplied.length} unreplied</button>}
            <div onClick={() => setPage('profile')} style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, ${C.rose})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{branch?.name?.[0] || 'G'}</div>
          </div>
        </header>
        <main style={{ padding: bp === 'desktop' ? 32 : bp === 'tablet' ? 24 : 16, animation: 'fadeIn 0.3s ease' }}>
          {loading ? <div style={{ padding: 32 }}>
            <div className="skeleton" style={{ width: '40%', height: 24, marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[0,1,2].map(i => <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}><div className="skeleton" style={{ width: '50%', height: 14, marginBottom: 10 }} /><div className="skeleton" style={{ width: '35%', height: 24 }} /></div>)}
            </div>
            {[0,1,2,3].map(i => <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', marginBottom: 8, display: 'flex', gap: 14, alignItems: 'center', border: `1px solid ${C.border}` }}><div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} /><div style={{ flex: 1 }}><div className="skeleton" style={{ width: '50%', height: 14, marginBottom: 6 }} /><div className="skeleton" style={{ width: '30%', height: 12 }} /></div><div className="skeleton" style={{ width: 70, height: 24, borderRadius: 20 }} /></div>)}
          </div> : <div key={page} className="page-in"><View /></div>}
        </main>
      </div>

      <ModalRouter />
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, padding: '12px 20px', borderRadius: 10, background: toast.type === 'error' ? C.danger : C.success, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease', maxWidth: '90vw' }}>{toast.type === 'error' ? '✕ ' : '✓ '}{toast.msg}</div>}
    </div>
  )
}
