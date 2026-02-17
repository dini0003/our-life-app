import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const CATEGORIES = {
  spesa: { emoji: '🛒', label: 'Spesa' },
  lola: { emoji: '🐕', label: 'Lola' },
  casa: { emoji: '🏠', label: 'Casa' },
  eventi: { emoji: '🎫', label: 'Eventi' },
  salute: { emoji: '💊', label: 'Salute' },
  auto: { emoji: '🚗', label: 'Auto' },
  bollette: { emoji: '💰', label: 'Bollette' },
  altro: { emoji: '📦', label: 'Altro' }
}

export default function AddTask() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('spesa')
  const [dueDate, setDueDate] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringInterval, setRecurringInterval] = useState('monthly')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) router.push('/')
    })
  }, [router])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)

    const { error } = await supabase
      .from('tasks')
      .insert([
        {
          title: title.trim(),
          category: category,
          due_date: dueDate || null,
          is_recurring: isRecurring,
          recurring_interval: isRecurring ? recurringInterval : null,
          created_by: session.user.id
        }
      ])

    if (error) {
      console.error('Error creating task:', error)
      alert('Errore nella creazione del task')
    } else {
      router.push('/tasks')
    }

    setLoading(false)
  }

  if (!session) return null

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0 }}>✅ Nuovo Task</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Titolo */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Cosa devi fare?
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="es. Comprare pane, Dare pasticca Lola..."
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
            required
          />
        </div>

        {/* Categoria */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Categoria
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                style={{
                  padding: '12px',
                  border: category === key ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: category === key ? '#e7f3ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'left'
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scadenza */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Scadenza (opzionale)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Ricorrente */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{ width: '20px', height: '20px', marginRight: '10px' }}
            />
            <span style={{ fontWeight: '500' }}>Task ricorrente (si ripete automaticamente)</span>
          </label>
        </div>

        {/* Se ricorrente, mostra intervallo */}
        {isRecurring && (
          <div style={{ marginBottom: '20px', marginLeft: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Ogni quanto?
            </label>
            <select
              value={recurringInterval}
              onChange={(e) => setRecurringInterval(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            >
              <option value="daily">Ogni giorno</option>
              <option value="weekly">Ogni settimana</option>
              <option value="monthly">Ogni mese</option>
            </select>
          </div>
        )}

        {/* Pulsante salva */}
        <button
          type="submit"
          disabled={loading || !title.trim()}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            background: loading || !title.trim() ? '#ccc' : '#007bff',
            color: 'white',
            cursor: loading || !title.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Salvataggio...' : 'Crea Task'}
        </button>
      </form>
    </div>
  )
}
