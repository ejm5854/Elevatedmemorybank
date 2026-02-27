export default function Hero() {
  return (
    <section className="relative bg-navy text-cream overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-warmtan via-transparent to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <p className="text-warmtan uppercase tracking-[0.3em] text-sm mb-3 font-light">Est. June 2021</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-4">
            The Life of <br />
            <span className="text-blush italic">Erik &amp; Marisa</span>
          </h1>
          <p className="text-warmtan text-lg italic mb-2">&quot;Till death do us part&quot;</p>
          <p className="text-cream/70 text-base max-w-md mt-4 leading-relaxed">
            Collecting adventures, building memories, and falling more in love with every mile traveled together.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="/trips" className="bg-blush text-navy font-semibold px-6 py-3 rounded-full hover:bg-warmtan transition-colors duration-200 text-sm tracking-wide">View Our Trips</a>
            <a href="/bucket-list" className="border border-cream/40 text-cream px-6 py-3 rounded-full hover:border-warmtan hover:text-warmtan transition-colors duration-200 text-sm tracking-wide">Bucket List</a>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="polaroid rotate-2 max-w-xs w-full">
            <div className="w-full h-72 bg-warmtan/30 flex items-center justify-center rounded-sm">
              <div className="text-center text-cream/50">
                <div className="text-5xl mb-2">&#10084;</div>
                <p className="text-sm font-serif italic">Add your favorite photo here</p>
              </div>
            </div>
            <p className="text-center text-earth font-serif italic text-sm mt-3">Erik &amp; Marisa</p>
          </div>
        </div>
      </div>
    </section>
  )
}
