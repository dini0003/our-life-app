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

export default function Tasks() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) router.push('/')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) router.push('/')
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session, filter])

  async function fetchTasks() {
    setLoading(true)
    let query = supabase
      .from('tasks')
      .select('*')
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('category', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  async function toggleTask(taskId, currentStatus) {
    const { error } = await supabase
      .from('tasks')
      .update({
        completed: !currentStatus,
        completed_by: !currentStatus ? session.user.id : null,
        completed_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
    } else {
      fetchTasks()
    }
  }

  if (!session) return null

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>✅ Tasks</h1>
      
      {/* Filtri categoria */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            background: filter === 'all' ? '#007bff' : '#e0e0e0',
            color: filter === 'all' ? 'white' : '#333',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          📋 Tutti
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: filter === key ? '#007bff' : '#e0e0e0',
              color: filter === key ? 'white' : '#333',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          {/* Task da fare */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Da fare</h2>
            {activeTasks.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic' }}>Nessun task da fare! 🎉</p>
            ) : (
              activeTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {CATEGORIES[task.category]?.emoji} {CATEGORIES[task.category]?.label}
                      {task.due_date && (
                        <span style={{ marginLeft: '8px' }}>
                          📅 {new Date(task.due_date).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Task completati */}
          {completedTasks.length > 0 && (
            <div>
              <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#666' }}>
                Completati ({completedTasks.length})
              </h2>
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    background: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: 0.7
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ textDecoration: 'line-through', marginBottom: '4px' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#999' }}>
                      {CATEGORIES[task.category]?.emoji} {CATEGORIES[task.category]?.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
