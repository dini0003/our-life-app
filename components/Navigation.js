import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const [showAddMenu, setShowAddMenu] = useState(false)

  return (
    <>
      {/* Menu popup quando clicchi ➕ */}
      {showAddMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAddMenu(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '90%',
              width: '400px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Cosa vuoi aggiungere?</h2>
            
            <button
              onClick={() => {
                setShowAddMenu(false)
                router.push('/add-task')
              }}
              style={{
                width: '100%',
                padding: '16px',
                marginBottom: '12px',
                border: 'none',
                borderRadius: '8px',
                background: '#f0f0f0',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '16px'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>✅ Nuovo Task</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Comprare, fare, prenotare...</div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false)
                alert('Funzione spese in arrivo!')
              }}
              style={{
                width: '100%',
                padding: '16px',
                marginBottom: '12px',
                border: 'none',
                borderRadius: '8px',
                background: '#f0f0f0',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '16px'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>💰 Nuova Spesa</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Ho pagato qualcosa da dividere</div>
            </button>

            <button
              onClick={() => {
                setShowAddMenu(false)
                alert('Funzione documenti in arrivo!')
              }}
              style={{
                width: '100%',
                padding: '16px',
                marginBottom: '12px',
                border: 'none',
                borderRadius: '8px',
                background: '#f0f0f0',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '16px'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📄 Nuovo Documento</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Carica file/foto</div>
            </button>

            <button
              onClick={() => setShowAddMenu(false)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Barra navigazione in basso */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 0',
          zIndex: 100
        }}
      >
        <button
          onClick={() => router.push('/home')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: router.pathname === '/home' ? '#007bff' : '#666'
          }}
        >
          <span style={{ fontSize: '24px' }}>🏠</span>
          <span style={{ fontSize: '12px', marginTop: '4px' }}>Home</span>
        </button>

        <button
          onClick={() => router.push('/tasks')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: router.pathname === '/tasks' ? '#007bff' : '#666'
          }}
        >
          <span style={{ fontSize: '24px' }}>✅</span>
          <span style={{ fontSize: '12px', marginTop: '4px' }}>Tasks</span>
        </button>

        {/* Pulsante + centrale */}
        <button
          onClick={() => setShowAddMenu(true)}
          style={{
            background: '#007bff',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            cursor: 'pointer',
            fontSize: '32px',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transform: 'translateY(-8px)'
          }}
        >
          ➕
        </button>

        <button
          onClick={() => alert('Funzione spese in arrivo!')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#666'
          }}
        >
          <span style={{ fontSize: '24px' }}>💰</span>
          <span style={{ fontSize: '12px', marginTop: '4px' }}>Spese</span>
        </button>

              <button
          onClick={() => alert('Funzione profilo in arrivo!')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#666'
          }}
        >
          <span style={{ fontSize: '24px' }}>👤</span>
          <span style={{ fontSize: '12px', marginTop: '4px' }}>Profilo</span>
        </button>
      </div>
    </>
  )
}
