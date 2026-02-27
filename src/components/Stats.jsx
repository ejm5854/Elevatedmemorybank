const stats = [
  { value: '850+', label: 'Days Together' },
  { value: '12', label: 'Trips Taken' },
  { value: '5', label: 'States Visited' },
  { value: '3', label: 'Countries Explored' },
]

export default function Stats() {
  return (
    <section className="bg-navy text-cream py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="font-serif text-4xl md:text-5xl font-bold text-blush mb-2">{stat.value}</span>
              <span className="text-warmtan text-sm uppercase tracking-widest font-light">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
