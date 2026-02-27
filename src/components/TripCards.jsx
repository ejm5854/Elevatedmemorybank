const trips = [
  { id: 1, destination: 'Hawaii', season: 'Summer 2023', emoji: '🌺', description: 'Sun, waves, and endless aloha vibes.', color: 'from-amber-200 to-orange-300' },
  { id: 2, destination: 'California', season: 'Fall 2022', emoji: '🌉', description: 'Pacific Coast Highway and golden sunsets.', color: 'from-sky-200 to-blue-300' },
  { id: 3, destination: 'Cambodia', season: 'Spring 2024', emoji: '🛕', description: 'Ancient temples and unforgettable culture.', color: 'from-emerald-200 to-teal-300' },
  { id: 4, destination: 'Colorado', season: 'Winter 2021', emoji: '⛷️', description: 'Snow-capped peaks and cozy mountain nights.', color: 'from-indigo-200 to-purple-300' },
]

export default function TripCards() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-earth uppercase tracking-[0.2em] text-xs mb-2">Our Adventures</p>
        <h2 className="font-serif text-4xl text-navy font-bold">Featured Trips</h2>
        <div className="w-16 h-0.5 bg-warmtan mx-auto mt-4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
            <div className={`h-40 bg-gradient-to-br ${trip.color} flex items-center justify-center text-5xl`}>{trip.emoji}</div>
            <div className="p-5">
              <p className="text-earth text-xs uppercase tracking-widest mb-1">{trip.season}</p>
              <h3 className="font-serif text-xl text-navy font-semibold mb-2">{trip.destination}</h3>
              <p className="text-navy/60 text-sm leading-relaxed">{trip.description}</p>
            </div>
            <div className="px-5 pb-5">
              <button className="text-earth text-xs font-medium tracking-wide hover:text-navy transition-colors duration-200">View Trip &rarr;</button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <a href="/trips" className="inline-block border border-earth text-earth px-8 py-3 rounded-full text-sm tracking-wide hover:bg-earth hover:text-cream transition-colors duration-200">View All Trips</a>
      </div>
    </section>
  )
}
