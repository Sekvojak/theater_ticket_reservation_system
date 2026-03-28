import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { showsApi, performancesApi, reservationsApi, seatsApi } from '../../api/api'
import type { Show, Performance, AdminReservation, Seat } from '../../api/types'

interface Stats {
  totalRevenue: number
  soldTickets: number
  avgOccupancy: number
  activeReservations: number
  pendingReservations: number
  canceledReservations: number
  revenuePerTicket: number
  topShows: { show: Show; reservations: number; tickets: number; revenue: number }[]
  genreBreakdown: { genre: string; count: number; pct: number }[]
  perfStatus: { scheduled: number; finished: number; canceled: number; total: number }
}

function formatEur(n: number) {
  return n.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function exportCSV(reservations: AdminReservation[], _performances: Performance[]) {
  const rows = [
    ['ID', 'Inscenácia', 'Dátum hrania', 'Zákazník', 'Email', 'Stav', 'Vytvorená'],
    ...reservations.map(r => [
      r.id,
      r.showTitle ?? '—',
      r.performanceStartTime ? new Date(r.performanceStartTime).toLocaleString('sk-SK') : '—',
      r.customerName ?? '—',
      r.customerEmail ?? '—',
      r.status === 'PAID' ? 'Zaplatená' : r.status === 'ACTIVE' ? 'Aktívna' : r.status === 'PENDING' ? 'Čaká na platbu' : r.status === 'EXPIRED' ? 'Vypršaná' : 'Zrušená',
      new Date(r.createdAt).toLocaleString('sk-SK'),
    ]),
  ]
  const csv = rows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rezervacie-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminStatsPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [rawReservations, setRawReservations] = useState<AdminReservation[]>([])
  const [rawPerformances, setRawPerformances] = useState<Performance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      showsApi.getAll(),
      performancesApi.getAll(),
      reservationsApi.getAll(),
      seatsApi.getAll(),
    ]).then(([shows, performances, reservations, seats]) => {
      setRawReservations(reservations)
      setRawPerformances(performances)
      setStats(computeStats(shows, performances, reservations, seats))
    }).catch(() => setError('Nepodarilo sa načítať dáta.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="admin-section">
      <button className="detail-back" onClick={() => navigate('/admin')}>← Dashboard</button>
      <div className="admin-page-header">
        <div>
          <div className="section-label">Admin konzola</div>
          <h2 className="section-title">Štatistiky</h2>
        </div>
        {stats && (
          <button className="btn-ghost" onClick={() => exportCSV(rawReservations, rawPerformances)}>
            ↓ Export CSV
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : stats ? (
        <div className="stats-layout">

          {/* ── KPI row ── */}
          <div className="stats-kpi-row">
            <KpiCard
              label="Celkové tržby"
              value={formatEur(stats.totalRevenue)}
              sub={stats.soldTickets > 0 ? `∅ ${formatEur(stats.revenuePerTicket)} / lístok` : 'z aktívnych rezervácií'}
              accent
            />
            <KpiCard
              label="Predané lístky"
              value={String(stats.soldTickets)}
              sub={`${stats.activeReservations} aktívnych rezervácií`}
            />
            <KpiCard
              label="Priemerná obsadenosť"
              value={`${stats.avgOccupancy} %`}
              sub="priemer cez všetky hrania"
            />
            <KpiCard
              label="Čakajúce na platbu"
              value={String(stats.pendingReservations)}
              sub={`${stats.canceledReservations} zrušených / vypršaných`}
              warn={stats.pendingReservations > 0}
            />
          </div>

          {/* ── Main grid ── */}
          <div className="stats-main-grid">

            {/* Top inscenácie */}
            <div className="stats-card">
              <div className="stats-card-header">
                <div>
                  <div className="stats-card-title">Top inscenácie</div>
                  <div className="stats-card-sub">podľa počtu aktívnych rezervácií</div>
                </div>
              </div>
              {stats.topShows.length === 0 ? (
                <div className="stats-empty">Žiadne aktívne rezervácie</div>
              ) : (
                <div className="stats-bar-list">
                  {stats.topShows.map((item, i) => {
                    const max = stats.topShows[0].reservations
                    const pct = max > 0 ? Math.round((item.reservations / max) * 100) : 0
                    return (
                      <div key={item.show.id} className="stats-bar-item">
                        <div className="stats-bar-meta">
                          <span className="stats-bar-rank">#{i + 1}</span>
                          <span className="stats-bar-name">{item.show.title}</span>
                          <span className="stats-bar-badges">
                            <span className="stats-badge">{item.reservations} rez.</span>
                            <span className="stats-badge">{item.tickets} lístkov</span>
                          </span>
                        </div>
                        <div className="stats-bar-track">
                          <div className="stats-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="stats-bar-detail">
                          <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                            ∅ {item.reservations > 0 ? (item.tickets / item.reservations).toFixed(1) : '0'} lístkov/rez.
                          </span>
                          <span className="stats-revenue">{formatEur(item.revenue)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Pravý stĺpec */}
            <div className="stats-side-col">

              {/* Stav hraní */}
              <div className="stats-card">
                <div className="stats-card-title">Stav hraní</div>
                <div className="stats-card-sub">{stats.perfStatus.total} celkovo</div>
                <div className="stats-perf-list">
                  <PerfStatusRow
                    label="Plánované"
                    value={stats.perfStatus.scheduled}
                    total={stats.perfStatus.total}
                    color="var(--gold)"
                  />
                  <PerfStatusRow
                    label="Ukončené"
                    value={stats.perfStatus.finished}
                    total={stats.perfStatus.total}
                    color="var(--muted)"
                  />
                  <PerfStatusRow
                    label="Zrušené"
                    value={stats.perfStatus.canceled}
                    total={stats.perfStatus.total}
                    color="#e05252"
                  />
                </div>
              </div>

              {/* Žánrové rozloženie */}
              <div className="stats-card">
                <div className="stats-card-title">Žánre</div>
                <div className="stats-card-sub">rozloženie inscenácií</div>
                <div className="stats-genre-list">
                  {stats.genreBreakdown.length === 0 ? (
                    <div className="stats-empty">Žiadne žánre</div>
                  ) : stats.genreBreakdown.map(g => (
                    <div key={g.genre} className="stats-genre-item">
                      <div className="stats-genre-header">
                        <span className="stats-genre-name">{g.genre}</span>
                        <span className="stats-genre-pct">{g.count} {g.count === 1 ? 'inscenácia' : 'inscenácie'}</span>
                      </div>
                      <div className="stats-bar-track stats-bar-track--sm">
                        <div className="stats-bar-fill stats-bar-fill--gold" style={{ width: `${g.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : null}
    </section>
  )
}

function KpiCard({ label, value, sub, accent, warn }: { label: string; value: string; sub: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className={`stats-kpi-card${accent ? ' stats-kpi-card--accent' : ''}${warn ? ' stats-kpi-card--warn' : ''}`}>
      <div className="stats-kpi-label">{label}</div>
      <div className="stats-kpi-value">{value}</div>
      <div className="stats-kpi-sub">{sub}</div>
    </div>
  )
}

function PerfStatusRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="stats-perf-row">
      <div className="stats-perf-row-top">
        <span className="stats-perf-dot" style={{ background: color }} />
        <span className="stats-perf-label">{label}</span>
        <span className="stats-perf-val" style={{ color }}>{value}</span>
        <span className="stats-perf-pct">{pct} %</span>
      </div>
      <div className="stats-bar-track stats-bar-track--sm" style={{ marginTop: 5 }}>
        <div className="stats-bar-fill" style={{ width: `${pct}%`, background: color, opacity: 0.7 }} />
      </div>
    </div>
  )
}

function computeStats(
  shows: Show[],
  performances: Performance[],
  reservations: AdminReservation[],
  seats: Seat[],
): Stats {
  const activeRes = reservations.filter(r => r.status === 'ACTIVE' || r.status === 'PAID')
  const pendingRes = reservations.filter(r => r.status === 'PENDING')
  const canceledRes = reservations.filter(r => r.status === 'CANCELED' || r.status === 'EXPIRED')

  // Revenue & tickets
  let totalRevenue = 0
  let soldTickets = 0
  const seatMap: Record<number, Seat> = {}
  seats.forEach(s => { seatMap[s.id] = s })

  activeRes.forEach(r => {
    if (r.seatIds && r.seatIds.length > 0) {
      r.seatIds.forEach(sid => {
        const seat = seatMap[sid]
        if (seat) { totalRevenue += seat.price; soldTickets++ }
      })
    }
  })

  const revenuePerTicket = soldTickets > 0 ? totalRevenue / soldTickets : 0

  // Avg occupancy per performance
  const perfSeats: Record<number, number> = {}
  seats.forEach(s => {
    perfSeats[s.hall.id] = (perfSeats[s.hall.id] ?? 0) + 1
  })
  const occupancies: number[] = []
  performances.forEach(p => {
    const total = perfSeats[p.hall.id] ?? 0
    if (total === 0) return
    const occupiedTickets = activeRes
      .filter(r => r.performanceId === p.id)
      .reduce((sum, r) => sum + (r.seatIds?.length ?? 0), 0)
    occupancies.push(Math.min(100, Math.round((occupiedTickets / total) * 100)))
  })
  const avgOccupancy = occupancies.length > 0
    ? Math.round(occupancies.reduce((a, b) => a + b, 0) / occupancies.length)
    : 0

  // Top shows
  const perfToShow: Record<number, Show> = {}
  performances.forEach(p => { if (p.id && p.show) perfToShow[p.id] = p.show })

  const showStats: Record<number, { show: Show; reservations: number; tickets: number; revenue: number }> = {}
  activeRes.forEach(r => {
    if (!r.performanceId) return
    const show = perfToShow[r.performanceId]
    if (!show) return
    if (!showStats[show.id]) showStats[show.id] = { show, reservations: 0, tickets: 0, revenue: 0 }
    showStats[show.id].reservations++
    if (r.seatIds) {
      r.seatIds.forEach(sid => {
        showStats[show.id].tickets++
        showStats[show.id].revenue += seatMap[sid]?.price ?? 0
      })
    }
  })
  const topShows = Object.values(showStats)
    .sort((a, b) => b.reservations - a.reservations)
    .slice(0, 5)

  // Genre breakdown
  const genreCounts: Record<string, number> = {}
  shows.forEach(s => s.genres.forEach(g => { genreCounts[g] = (genreCounts[g] ?? 0) + 1 }))
  const maxGenreCount = Math.max(...Object.values(genreCounts), 1)
  const genreBreakdown = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count, pct: Math.round((count / maxGenreCount) * 100) }))
    .sort((a, b) => b.count - a.count)

  // Perf status
  const perfStatus = {
    scheduled: performances.filter(p => p.status === 'SCHEDULED').length,
    finished: performances.filter(p => p.status === 'FINISHED').length,
    canceled: performances.filter(p => p.status === 'CANCELED').length,
    total: performances.length,
  }

  return {
    totalRevenue,
    soldTickets,
    avgOccupancy,
    activeReservations: activeRes.length,
    pendingReservations: pendingRes.length,
    canceledReservations: canceledRes.length,
    revenuePerTicket,
    topShows,
    genreBreakdown,
    perfStatus,
  }
}
