import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Loader from './components/common/Loader'

// Route-level code splitting (Phase 6: performance)
const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const SpotDetails = lazy(() => import('./pages/SpotDetails'))
const Booking = lazy(() => import('./pages/Booking'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Profile = lazy(() => import('./pages/Profile'))
const MyBookings = lazy(() => import('./pages/MyBookings'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Help = lazy(() => import('./pages/Help'))
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'))
const MyListings = lazy(() => import('./pages/owner/MyListings'))
const AddSpot = lazy(() => import('./pages/owner/AddSpot'))
const IncomingBookings = lazy(() => import('./pages/owner/IncomingBookings'))
const Guard = lazy(() => import('./pages/Guard'))
const Showcase = lazy(() => import('./pages/showcase/Showcase'))

function App() {
  const loadUser = useAuthStore((s) => s.loadUser)

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <Suspense fallback={<Loader label="Loading ParkEase…" className="min-h-screen" />}>
      <Routes>
        {/* Standalone full-screen monitoring dashboard (own top bar) */}
        <Route path="/guard" element={<Guard />} />
        <Route path="/showcase" element={<Showcase />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/spots/:id" element={<SpotDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/help" element={<Help />} />

          <Route
            path="/booking/:spotId"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Owner portal */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute ownerOnly>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/listings"
            element={
              <ProtectedRoute ownerOnly>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/listings/new"
            element={
              <ProtectedRoute ownerOnly>
                <AddSpot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute ownerOnly>
                <IncomingBookings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
