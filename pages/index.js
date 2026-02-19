import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [session, setSession] = useState(null)
  const [balance, setBalance] = useState(0)
  const [balanceLoading, setBalanceLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        calculateBalance(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        calculateBalance(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function calculateBalance(userId) {
    setBalanceLoading(true)

    const { data, error } = await supabase
      .from('expenses')
      .select('*')

    if (error || !data) {
      console.error(error)
      setBalanceLoading(false)
      return
    }

    let total = 0

    data.forEach(expense => {
      if (expense.split_type === '50/50') {
        const half = expense.amount / 2

        if (expense.paid_by === userId) {
          total += half
        } else {
          total -= half
        }
      }
    })

    setBalance(total)
    setBalanceLoading(false)
  }

  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Our Life App ❤️</h1>
        <Auth 
          supabaseClient={supabase} 
          appearance={{ theme: ThemeSupa }} 
          providers={['google']}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      
      {/* SALDO */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        borderRadius: '16px',
        background: balance > 0 ? '#e6f7ee' : balance < 0 ? '#ffeaea' : '#f5f5f5',
        textAlign: 'center'
      }}>
        {balanceLoading ? (
          <div>Calcolo saldo...</div>
        ) : (
          <>
            <div style={{ fontSize: '14px', marginBottom: '6px', color: '#666' }}>
              Saldo attuale
            </div>

            <div style={{
              fontSize: '22px',
              fontWeight: '700',
              color: balance > 0 ? '#1b8f4d' : balance < 0 ? '#c0392b' : '#555'
            }}>
              {balance > 0 && `🟢 Sei in credito di ${balance.toFixed(2)}€`}
              {balance < 0 && `🔴 Devi ${Math.abs(balance).toFixed(2)}€`}
              {balance === 0 && '⚖️ Siete in pari'}
            </div>
          </>
        )}
      </div>

      <h1>Benvenuta! 🎉</h1>
      <p>Sei loggata come: {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
      
      <div style={{ marginTop: '40px' }}>
        <h2>🛒 Lista della Spesa</h2>
        <p>Presto qui vedrai la lista della spesa!</p>
        
        <h2>✅ Todo List</h2>
        <p>Presto qui vedrai i todo!</p>
        
        <h2>📝 Note</h2>
        <p>Presto qui vedrai le note!</p>
      </div>
    </div>
  )
}
