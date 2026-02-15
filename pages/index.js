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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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
