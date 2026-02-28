import type { Trip } from '@/types'
import { tripDays } from './dates'

export interface TripStats {
  totalTrips: number
  totalCountries: number
  totalContinents: number
  totalDays: number
  averageRating: number
}

export function computeStats(trips: Trip[]): TripStats {
  if (trips.length === 0) {
    return { totalTrips: 0, totalCountries: 0, totalContinents: 0, totalDays: 0, averageRating: 0 }
  }
  const countries  = new Set(trips.map((t) => t.destination.countryCode))
  const continents = new Set(trips.map((t) => t.destination.continent))
  const totalDays  = trips.reduce((sum, t) => sum + tripDays(t.startDate, t.endDate), 0)
  const avgRating  = trips.reduce((sum, t) => sum + t.rating, 0) / trips.length
  return {
    totalTrips:      trips.length,
    totalCountries:  countries.size,
    totalContinents: continents.size,
    totalDays,
    averageRating:   Math.round(avgRating * 10) / 10,
  }
}

export function allTags(trips: Trip[]): string[] {
  const tagSet = new Set(trips.flatMap((t) => t.tags))
  return Array.from(tagSet).sort()
}
