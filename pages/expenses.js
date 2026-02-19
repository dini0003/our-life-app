import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import Navigation from '../components/Navigation'

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

export default function Expenses() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [users, setUsers] = useState({})
  const [balance, setBalance] = useState({ who: '', amount: 0 })
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
      fetchExpenses()
      fetchUsers()
    }
  }, [session, filter])

  async function fetchUsers() {
    const { data } = await supabase.auth.admin.listUsers()
    if (data?.users) {
      const usersMap = {}
      data.users.forEach(user => {
        usersMap[user.id] = user.email.split('@')[0]
      })
      setUsers(usersMap)
    }
  }

  async function fetchExpenses() {
    setLoading(true)

    let query = supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('category', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching expenses:', error)
    } else {
      setExpenses(data || [])
      calculateBalance(data || [])
    }
    setLoading(false)
  }

  function calculateBalance(expensesList) {
    const totals = {}
    
    expensesList.forEach(expense => {
      const paidBy = expense.paid_by
      const amount = parseFloat(expense.amount)
      
      if (!totals[paidBy]) totals[paidBy] = 0
      
      if (expense.split_type === '50/50') {
        totals[paidBy] += amount / 2
      } else {
        totals[paidBy] += amount
      }
    })

    const userIds = Object.keys(totals)
    if (userIds.length === 2) {
      const diff = totals[userIds[0]] - totals[userIds[1]]
      if (diff > 0) {
        setBalance({ 
          who: users[userIds[1]] || 'Altra persona', 
          owes: users[userIds[0]] || 'Tu',
          amount: Math.abs(diff).toFixed(2) 
        })
      } else if (diff < 0) {
        setBalance({ 
          who: users[userIds[0]] || 'Tu', 
          owes: users[userIds[1]] || 'Altra persona',
          amount: Math.abs(diff).toFixed(2) 
        })
      } else {
        setBalance({ who: '', amount: 0 })
      }
    }
  }

  if (!session) return null

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
      
      <h1>💰 Spese</h1>

      {/* Saldo */}
      {balance.amount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Saldo attuale</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>
            {balance.who} deve {balance.amount}€
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
            a {balance.owes}
          </div>
        </div>
      )}

      {balance.amount === 0 && expenses.length > 0 && (
        <div style={{
          background: '#4CAF50',
          color: 'white',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          ✅ Siete in pari!
        </div>
      )}

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
          📋 Tutte
        </button>
        {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
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

      {/* Lista spese */}
      {loading ? (
        <p>Caricamento...</p>
      ) : expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
          <p>Nessuna spesa ancora!</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Clicca sul pulsante ➕ per aggiungerne una
          </p>
        </div>
      ) : (
        <div>
          {expenses.map(expense => (
            <div
              key={expense.id}
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                    {expense.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {EXPENSE_CATEGORIES[expense.category]?.emoji} {EXPENSE_CATEGORIES[expense.category]?.label}
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#007bff' }}>
                  {parseFloat(expense.amount).toFixed(2)}€
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
                <span>Pagato da: {users[expense.paid_by] || 'Utente'}</span>
                <span>{new Date(expense.created_at).toLocaleDateString('it-IT')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Navigation />
    </div>
  )
}
