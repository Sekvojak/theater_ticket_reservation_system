import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { paymentsApi } from '../api/api'

export default function PayRedirectPage() {
  const { reservationId } = useParams<{ reservationId: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const id = Number(reservationId)
    if (!id) { navigate('/my-reservations'); return }

    paymentsApi.createCheckout(id)
      .then(({ url }) => { window.location.href = url })
      .catch(() => setError('Nepodarilo sa otvoriť platobnú bránu. Rezervácia mohla byť už zaplatená alebo vypršala.'))
  }, [reservationId, navigate])

  return (
    <section className="how-section" style={{ textAlign: 'center' }}>
      {error ? (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 24 }}>⚠️</div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Platbu sa nepodarilo otvoriť</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32, lineHeight: 1.7 }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/my-reservations')}>
            Moje rezervácie
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="spinner" style={{ margin: '0 auto 24px' }} />
          <p style={{ color: 'var(--muted)', letterSpacing: 1 }}>Presmerovávam na platobnú bránu...</p>
        </div>
      )}
    </section>
  )
}
