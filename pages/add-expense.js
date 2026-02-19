import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const EXPENSE_CATEGORIES = {
  spesa: { emoji: '🛒', label: 'Spesa' },
  casa: { emoji: '🏠', label: 'Casa' },
  ristorante: { emoji: '🍽️', label: 'Ristorante' },
  svago: { emoji: '🎉', label: 'Svago' },
  trasporti: { emoji: '🚗', label: 'Trasporti' },
  salute: { emoji: '💊', label: 'Salute' },
  altro: { emoji: '📦', label: 'Altro' }
}

export default function AddExpense() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'spesa',
    paid_by: '',
    split_type: '50/50',
    notes: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) {
        router.push('/')
      } else {
        setForm(f => ({ ...f, paid_by: session.user.id }))
      }
    })
  }, [router])

  // Pre-compila se arriva da un task
  useEffect(() => {
    if (router.query.title) {
      setForm(f => ({ ...f, title: router.query.title }))
    }
  }, [router.query])

  async function handleSubmit() {
    if (!form.title.trim() || !form.amount) {
      alert('Inserisci titolo e importo!')
      return
    }

    if (parseFloat(form.amount) <= 0) {
      alert('Importo deve essere maggiore di 0!')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('expenses')
      .insert({
        title: form.title.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        paid_by: form.paid_by,
        split_type: form.split_type,
        notes: form.notes,
        created_by: session.user.id
      })

    if (error) {
      console.error('Error creating expense:', error)
      alert('Errore nel salvare la spesa. Riprova!')
    } else {
      router.push('/expenses')
    }

    setLoading(false)
  }

  if (!session) return null

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '12px' }}
        >
          ←
        </button>
        <h1 style={{ margin: 0 }}>💰 Nuova Spesa</h1>
      </div>

      {/* Titolo */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Descrizione *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Es. Spesa Esselunga, Benzina..."
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
          autoFocus
        />
      </div>

      {/* Importo */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Importo * (€)
        </label>
        <input
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
          placeholder="0.00"
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '24px',
            fontWeight: '600',
            boxSizing: 'border-box',
            textAlign: 'center'
          }}
        />
      </div>

      {/* Categoria */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Categoria
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setForm(f => ({ ...f, category: key }))}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '2px solid',
                borderColor: form.category === key ? '#007bff' : '#e0e0e0',
                background: form.category === key ? '#e8f0ff' : 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: form.category === key ? '600' : '400'
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chi ha pagato */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
          Chi ha pagato?
        </label>
        <div style={{
          background: '#f8f9fa',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid #007bff'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            Pagato da:
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>
            {session.user.email.split('@')[0]} (Tu)
          </div>
        </div>
      </div>

      {/* Divisione */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
          Come dividiamo?
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setForm(f => ({ ...f, split_type: '50/50' }))}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: form.split_type === '50/50' ? '#007bff' : '#e0e0e0',
              background: form.split_type === '50/50' ? '#e8f0ff' : 'white',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>➗</div>
            <div style={{ fontWeight: '600' }}>50/50</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              Metà ciascuno
            </div>
          </button>

          <button
            onClick={() => setForm(f => ({ ...f, split_type: 'full' }))}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: form.split_type === 'full' ? '#007bff' : '#e0e0e0',
              background: form.split_type === 'full' ? '#e8f0ff' : 'white',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>💯</div>
            <div style={{ fontWeight: '600' }}>Tutto mio</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              Non dividere
            </div>
          </button>
        </div>

        {form.split_type === '50/50' && form.amount && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#e8f0ff',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Tu paghi: {parseFloat(form.amount).toFixed(2)}€ → Ognuno: {(parseFloat(form.amount) / 2).toFixed(2)}€
          </div>
        )}
      </div>

      {/* Note */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Note (opzionale)
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Aggiungi dettagli..."
          rows={2}
          style={{
            width: '100%',
            paddi
