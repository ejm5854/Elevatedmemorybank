import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import Navbar from '@/components/Navbar'
import LockScreen from '@/components/LockScreen'

const Home       = lazy(() => import('@/pages/Home'))
const MemoryBank = lazy(() => import('@/pages/MemoryBank'))
const TripDetail = lazy(() => import('@/pages/TripDetail'))
const NewTrip    = lazy(() => import('@/pages/NewTrip'))
const EditTrip   = lazy(() => import('@/pages/EditTrip'))
const WorldMap   = lazy(() => import('@/pages/WorldMap'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
           style={{ borderColor: 'rgba(201,168,76,0.6)', borderTopColor: 'transparent' }} />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const activeTheme = useAppStore((s) => s.activeTheme)
  if (!activeTheme) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const activeTheme = useAppStore((s) => s.activeTheme)
  const location = useLocation()

  if (!activeTheme) {
    return <LockScreen />
  }

  return (
    <div className="min-h-dvh" data-theme={activeTheme}>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route
              path="/memories/new"
              element={
                <ProtectedRoute>
                  <NewTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/memories/:id/edit"
              element={
                <ProtectedRoute>
                  <EditTrip />
                </ProtectedRoute>
              }
            />
            <Route path="/memories/:id" element={<TripDetail />} />
            <Route path="/memories"     element={<MemoryBank />} />
            <Route path="/map"          element={<WorldMap />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  )
}
