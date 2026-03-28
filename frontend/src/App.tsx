import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import ShowsPage from './pages/ShowsPage'
import HowPage from './pages/HowPage'
import AboutPage from './pages/AboutPage'
import ShowDetailPage from './pages/ShowDetailPage'
import SeatMapPage from './pages/SeatMapPage'
import MyReservationsPage from './pages/MyReservationsPage'
import AccountPage from './pages/AccountPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminShowsPage from './pages/admin/AdminShowsPage'
import AdminPerformancesPage from './pages/admin/AdminPerformancesPage'
import AdminHallsPage from './pages/admin/AdminHallsPage'
import AdminReservationsPage from './pages/admin/AdminReservationsPage'
import AdminStatsPage from './pages/admin/AdminStatsPage'
import VerifyPage from './pages/VerifyPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentCancelPage from './pages/PaymentCancelPage'
import PayRedirectPage from './pages/PayRedirectPage'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp()
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shows" element={<ShowsPage />} />
        <Route path="/shows/:showId" element={<ShowDetailPage />} />
        <Route path="/performances/:performanceId/seats" element={<SeatMapPage />} />
        <Route path="/how" element={<HowPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/my-reservations" element={<MyReservationsPage />} />
        <Route path="/account" element={<AccountPage />} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/shows" element={<AdminRoute><AdminShowsPage /></AdminRoute>} />
        <Route path="/admin/performances" element={<AdminRoute><AdminPerformancesPage /></AdminRoute>} />
        <Route path="/admin/halls" element={<AdminRoute><AdminHallsPage /></AdminRoute>} />
        <Route path="/admin/reservations" element={<AdminRoute><AdminReservationsPage /></AdminRoute>} />
        <Route path="/admin/stats" element={<AdminRoute><AdminStatsPage /></AdminRoute>} />

        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        <Route path="/pay/:reservationId" element={<PayRedirectPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}

export default App
