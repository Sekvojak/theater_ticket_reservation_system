import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TEAM = [
  { name: 'Dominik Kontrik', role: 'Backend Developer', description: 'Stará sa o serverovú logiku, databázu a API, ktoré poháňajú celý rezervačný systém.', initials: 'DK', photo: '' },
  { name: '-', role: '-', description: '-', initials: '-', photo: '' },
  { name: '-', role: '-', description: '-', initials: '-', photo: '' },
  { name: '-', role: '-', description: '-', initials: '-', photo: '' },
  { name: '-', role: '-', description: '-', initials: '-', photo: '' },
]

function TeamCard({ member }: { member: typeof TEAM[0] }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="team-card">
      <div className="team-avatar-wrap">
        <div className="team-avatar">
          {member.photo && !imgError ? (
            <img src={member.photo} alt={member.name} onError={() => setImgError(true)} />
          ) : (
            <span className="team-avatar-initials">{member.initials}</span>
          )}
        </div>
      </div>
      <div className="team-name">{member.name}</div>
      <div className="team-role">{member.role}</div>
      <p className="team-desc">{member.description}</p>
    </div>
  )
}

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <section className="about-section">
      <div className="about-intro">
        <span className="section-label">Tím</span>
        <h2 className="section-title">O nás</h2>
        <p>
          Za každým predstavením stojí tím ľudí, ktorí milujú divadlo rovnako ako vy.
          Spoznajte tváre, ktoré každý večer ožívajú zákulisím divadla Klára.
        </p>
      </div>

      <div className="team-grid">
        {TEAM.map(member => (
          <TeamCard key={member.name} member={member} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '72px' }}>
        <button className="btn-primary" onClick={() => navigate('/shows')}>
          Pozrieť predstavenia
        </button>
      </div>
    </section>
  )
}
