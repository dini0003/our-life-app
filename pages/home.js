import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import Navigation from '../components/Navigation'

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

export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [dueSoonTasks, setDueSoonTasks] = useState([])
  const [shoppingTasks, setShoppingTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) {
        router.push('/')
      } else {
        const email = session.user.email
        const name = email.split('@')[0]
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) router.push('/')
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  async function fetchDashboardData() {
    setLoading(true)

    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    // Task in scadenza entro 7 giorni
    const { data: dueTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('completed', false)
      .not('due_date', 'is', null)
      .lte('due_date', sevenDaysFromNow.toISOString())
      .order('due_date', { ascending: true })
      .limit(5)

    setDueSoonTasks(dueTasks || [])

    // Task da comprare
    const { data: shopping } = await supabase
      .from('tasks')
      .select('*')
      .eq('completed', false)
      .contains('tags', ['da_comprare'])
      .order('created_at', { ascending: false })
      .limit(5)

    setShoppingTasks(shopping || [])
    setLoading(false)
  }

  function getDueLabel(dueDate) {
    const now = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: 'Scaduto!', color: '#ff0000' }
    if (diffDays === 0) return { label: 'Oggi!', color: '#ff4444' }
    if (diffDays === 1) return { label: 'Domani', color: '#ff8800' }
    if (diffDays <= 3) return { label: `Tra ${diffDays} giorni`, color: '#ff8800' }
    return { label: `${due.toLocaleDateString('it-IT')}`, color: '#666' }
  }

  if (!session) return null

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Our Life App ❤️</h1>
        <p style={{ margin: '4px 0 0 0', color: '#666' }}>Ciao {userName}! 👋</p>
      </div>

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          {/* Box In Scadenza */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #ff4444'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ In scadenza
            </h2>

            {dueSoonTasks.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                Nessuna scadenza questa settimana! 🎉
              </p>
            ) : (
              <>
                {dueSoonTasks.map(task => {
                  const { label, color } = getDueLabel(task.due_date)
                  return (
                    <div
                      key={task.id}
                      onClick={() => router.push('/tasks')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <span style={{ marginRight: '8px' }}>
                          {CATEGORIES[task.category]?.emoji}
                        </span>
                        {task.title}
                      </div>
                      <span style={{ color, fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {label}
                      </span>
                    </div>
                  )
                })}
                <button
                  onClick={() => router.push('/tasks')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    padding: '8px 0 0 0',
                    fontSize: '14px'
                  }}
                >
                  Vedi tutti →
                </button>
              </>
            )}
          </div>

          {/* Box Da Comprare */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #4CAF50'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛒 Da comprare
            </h2>

            {shoppingTasks.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                Niente da comprare! ✅
              </p>
            ) : (
              <>
                {shoppingTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>
                      {CATEGORIES[task.category]?.emoji}
                    </span>
                    {task.title}
                  </div>
                ))}
                <button
                  onClick={() => router.push('/tasks')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    padding: '8px 0 0 0',
                    fontSize: '14px'
                  }}
                >
                  Modalità spesa →
                </button>
              </>
            )}
          </div>
        </>
      )}

      <Navigation />
    </div>
  )
}
