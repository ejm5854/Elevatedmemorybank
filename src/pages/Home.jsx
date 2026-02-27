import Hero from '../components/Hero'
import TripCards from '../components/TripCards'
import Stats from '../components/Stats'
import Polaroids from '../components/Polaroids'

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <TripCards />
      <Polaroids />
    </main>
  )
}
