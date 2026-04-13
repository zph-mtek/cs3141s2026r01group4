import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './About.css'

const TEAM = [
  { name: 'Zack Horsch',   role: 'Developer', initials: 'ZH' },
  { name: 'Toya Chester',  role: 'Developer', initials: 'TC' },
  { name: 'Soleil Ector',  role: 'Developer', initials: 'SE' },
]

const About = () => {
  document.title = 'About | HuskyRentLens'

  const pageRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    const els = pageRef.current?.querySelectorAll('.fade-up')
    els?.forEach((el) => observer.observe(el))
    return () => els?.forEach((el) => observer.unobserve(el))
  }, [])

  return (
    <div ref={pageRef} className="overflow-hidden text-gray-900">

      {/* ── HERO — dark, editorial ── */}
      <section className="bg-gray-950 text-white px-6 py-20 md:py-32 text-center relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }}
        />

        <div className="relative max-w-3xl mx-auto fade-up">
          <span className="float-anim inline-block text-4xl md:text-5xl mb-6">🐾</span>
          <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold uppercase tracking-[0.18em] px-4 py-2 rounded-full mb-8">
            CS 3141 · Spring 2026 · Michigan Tech
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight">
            <span className="gradient-text">HuskyRentLens</span>
          </h1>
          <p className="mt-6 text-gray-400 text-base md:text-xl leading-relaxed max-w-xl mx-auto">
            A student-built platform that puts real reviews and honest property details in one place — so Huskies can find off-campus housing without the guesswork.
          </p>
        </div>
      </section>

      {/* ── MISSION — white, airy ── */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="fade-up grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600 mb-3">Why we built it</p>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Housing info for Huskies shouldn't be scattered
              </h2>
            </div>
            <div className="space-y-4 text-gray-500 text-base md:text-lg leading-relaxed">
              <p>
                Finding off-campus housing at MTU means bouncing between Facebook groups, old Craigslist posts, and word-of-mouth from friends. Most of it is outdated or unreliable.
              </p>
              <p>
                HuskyRentLens centralises listings with photos, pricing, amenities, and student reviews — so you know what a place is really like before you sign anything.
              </p>
            </div>
          </div>

          {/* Pillars */}
          <div className="fade-up mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: '🔍', title: 'Browse & Compare', desc: 'Filter by price, distance, and amenities across every listing on the platform.' },
              { icon: '⭐', title: 'Real Student Reviews', desc: 'Ratings and written feedback from Huskies who actually lived there.' },
              { icon: '🗺️', title: 'Map Exploration', desc: 'See where each property sits relative to campus before reading the details.' },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <span className="text-3xl">{p.icon}</span>
                <h3 className="mt-3 font-bold text-base text-gray-900">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM — the focal point ── */}
      <section className="bg-gray-950 text-white px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-up">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500 mb-3">The people</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-4">Meet the team</h2>
            <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto">
              Three CS students who designed, built, and shipped this from scratch in one semester.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-group">
            {TEAM.map((m) => (
              <div key={m.name} className="fade-up card-lift rounded-2xl bg-gray-900 border border-gray-800 p-8 flex flex-col items-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-400 flex items-center justify-center text-2xl md:text-3xl font-black text-black shadow-lg">
                  {m.initials}
                </div>
                <h3 className="mt-5 text-lg md:text-xl font-bold">{m.name}</h3>
                <p className="mt-1 text-sm text-gray-400 font-medium">{m.role}</p>
                <p className="mt-1 text-xs text-gray-600">CS 3141 · Spring 2026</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-yellow-400 py-14 md:py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto fade-up">
          <h2 className="text-2xl md:text-4xl font-black">Ready to start browsing?</h2>
          <p className="mt-3 text-gray-800 text-base md:text-lg">Find your next place near Michigan Tech.</p>
          <Link
            to="/properties"
            className="mt-7 inline-block bg-black hover:bg-gray-800 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
          >
            Browse Properties →
          </Link>
        </div>
      </section>

      {/* ── FOOTER DISCLAIMER ── */}
      <footer className="bg-gray-950 text-gray-600 py-8 px-6 text-center text-xs border-t border-gray-800">
        <p className="max-w-2xl mx-auto leading-relaxed">
          An independent student project for CS3141 — not affiliated with or endorsed by Michigan Technological University.
        </p>
        <div className="mt-3 space-x-4 font-medium">
          <Link to="/privacy-policy" className="hover:text-yellow-500 transition-colors">Privacy Policy</Link>
          <span className="text-gray-700">|</span>
          <Link to="/guidelines" className="hover:text-yellow-500 transition-colors">Community Guidelines</Link>
        </div>
      </footer>
    </div>
  )
}

export default About