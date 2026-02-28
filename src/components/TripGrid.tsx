import { AnimatePresence } from 'framer-motion'
import TripCard from './TripCard'
import type { Trip } from '@/types'

interface TripGridProps { trips: Trip[] }

export default function TripGrid({ trips }: TripGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
      <AnimatePresence>
        {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </AnimatePresence>
    </div>
  )
}
