import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './About.css'

/* ─── data arrays (easy to edit) ─── */

const FEATURES = [
  {
    icon: '🔍',
    title: 'Search & Compare',
    desc: 'Browse Houghton-area rentals by price, distance, and amenities — all in one place.',
  },
  {
    icon: '⭐',
    title: 'Real Student Reviews',
    desc: 'Read honest reviews from fellow Huskies who actually lived there.',
  },
  {
    icon: '🏠',
    title: 'Landlord Listings',
    desc: 'Landlords can list properties directly and keep details up to date.',
  },
  {
    icon: '📱',
    title: 'Mobile-Friendly',
    desc: 'Designed to look and work great on any device, from phone to desktop.',
  },
]

const TEAM = [
  { name: 'Zack Horsch',    role: 'Developer' },
  { name: 'Toya Chester',  role: 'Developer' },
  { name: 'Soleil Ector',      role: 'Developer' },
]

const TIMELINE = [
  { label: 'Idea & Research',  text: 'Identified pain points in off-campus housing search.' },
  { label: 'Design & Prototype', text: 'Built wireframes and settled on the tech stack.' },
  { label: 'Development',      text: 'Implemented features sprint by sprint as a team.' },
  { label: 'Launch',           text: 'Deployed and iterated based on real feedback.' },
]

const STATS = [
  { value: '3',     label: 'Team Members' },
  { value: '1',     label: 'Semester' },
  { value: '100%',  label: 'Student Built' },
  { value: '∞',     label: 'Cups of Coffee' },
]

/* ─── reusable section wrapper ─── */
const Section = ({ children, className = '', dark = false }) => (
  <section className={`px-5 md:px-10 py-16 md:py-24 ${dark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'} ${className}`}>
    <div className="max-w-6xl mx-auto">{children}</div>
  </section>
)

/* ─── reusable heading ─── */
const Heading = ({ tag, title, subtitle }) => (
  <div className="text-center mb-12 md:mb-16 fade-up">
    {tag && <span className="inline-block px-3 py-1 mb-4 text-sm font-bold tracking-wide uppercase rounded-full bg-yellow-100 text-yellow-700">{tag}</span>}
    <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">{title}</h2>
    {subtitle && <p className="mt-4 max-w-2xl mx-auto text-gray-500 text-base md:text-lg leading-relaxed">{subtitle}</p>}
  </div>
)

/* ─── main component ─── */
const About = () => {
  /* scroll-triggered fade-up */
  const pageRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    const els = pageRef.current?.querySelectorAll('.fade-up')
    els?.forEach((el) => observer.observe(el))
    return () => els?.forEach((el) => observer.unobserve(el))
  }, [])

  return (
    <div ref={pageRef} className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center text-center px-6 bg-white">
        <div className="max-w-3xl fade-up">
          <span className="float-anim inline-block text-6xl mb-6">🐾</span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            About <span className="gradient-text">HuskyRentLens</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl mx-auto">
            A student-built platform helping Michigan Tech Huskies find, compare, and review off-campus housing — transparently.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties" className="px-7 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-colors">
              Browse Properties
            </Link>
            <a href="#mission" className="px-7 py-3 rounded-xl border-2 border-gray-200 hover:border-yellow-400 font-semibold transition-colors">
              Our Mission ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-gray-950 py-10 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center stagger-group">
          {STATS.map((s) => (
            <div key={s.label} className="fade-up">
              <p className="text-3xl md:text-5xl font-black text-yellow-400">{s.value}</p>
              <p className="mt-1 text-sm md:text-base text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MISSION ── */}
      <Section>
        <div id="mission" className="scroll-mt-24" />
        <Heading
          tag="Why we exist"
          title="Our Mission"
          subtitle="Finding off-campus housing near MTU shouldn't be stressful. We built HuskyRentLens so students can make informed decisions backed by real reviews from real Huskies."
        />
        <div className="grid md:grid-cols-2 gap-8 fade-up">
          <div className="rounded-2xl bg-gray-50 p-8 md:p-10">
            <h3 className="text-xl font-bold mb-3">🎯 The Problem</h3>
            <p className="text-gray-600 leading-relaxed">
              Housing info is scattered across Facebook groups, word-of-mouth, and outdated websites. Students sign leases without enough information and sometimes regret it.
            </p>
          </div>
          <div className="rounded-2xl bg-yellow-50 p-8 md:p-10">
            <h3 className="text-xl font-bold mb-3">💡 Our Solution</h3>
            <p className="text-gray-600 leading-relaxed">
              One central hub where students review apartments, landlords post listings, and everyone benefits from honest, organized information.
            </p>
          </div>
        </div>
      </Section>

      {/* ── FEATURES ── */}
      <Section dark>
        <Heading
          tag="What we offer"
          title="Features"
          subtitle="Everything a Husky needs to find the right place."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-group">
          {FEATURES.map((f) => (
            <div key={f.title} className="fade-up card-lift rounded-2xl bg-gray-900 border border-gray-800 p-6">
              <span className="text-4xl">{f.icon}</span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TIMELINE ── */}
      <Section>
        <Heading
          tag="How it happened"
          title="Project Timeline"
        />
        <div className="max-w-2xl mx-auto space-y-8 stagger-group">
          {TIMELINE.map((t, i) => (
            <div key={i} className="fade-up flex items-start gap-5">
              <div className="flex flex-col items-center">
                <div className="timeline-dot" />
                {i < TIMELINE.length - 1 && <div className="w-[2px] flex-1 bg-yellow-200 mt-1" />}
              </div>
              <div className="pb-4">
                <h3 className="text-lg font-bold">{t.label}</h3>
                <p className="text-gray-500 mt-1 leading-relaxed">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TEAM ── */}
      <Section dark>
        <Heading
          tag="The people"
          title="Meet the Team"
          subtitle="Built by Michigan Tech students for the CS 3141 Team Software Project during the Spring 2026 semester."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 stagger-group justify-center max-w-2xl mx-auto">
          {TEAM.map((m) => (
            <div key={m.name} className="fade-up card-lift text-center rounded-2xl bg-gray-900 border border-gray-800 p-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-black text-black">
                {m.name.split(' ').map((w) => w[0]).join('')}
              </div>
              <h3 className="mt-4 font-bold text-sm md:text-base">{m.name}</h3>
              <p className="text-gray-400 text-xs md:text-sm mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <section className="bg-yellow-400 py-16 md:py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto fade-up">
          <h2 className="text-3xl md:text-4xl font-black">Ready to find your next place?</h2>
          <p className="mt-4 text-gray-800 text-base md:text-lg">Browse listings, read reviews, and make a confident choice.</p>
          <Link to="/properties" className="mt-8 inline-block px-8 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors">
            Explore Properties →
          </Link>
        </div>
      </section>

      {/* ── FOOTER DISCLAIMER ── */}
      <footer className="bg-gray-50 text-gray-500 py-10 px-6 text-center text-sm md:text-base border-t border-gray-200">
        <p className="max-w-3xl mx-auto leading-relaxed">
          🐾 <strong>HuskyRentLens</strong> is an independent student project built with love for the CS 3141 Team Software Project course.
          <br className="hidden md:block" />
          We are not affiliated with, officially maintained by, or endorsed by Michigan Technological University (MTU).
          Reviews and opinions expressed here belong solely to the students, not the school! 🎓
        </p>
        <div className="mt-5 space-x-6 font-medium">
          <Link to="/privacy-policy" className="hover:text-yellow-500 transition-colors duration-200">Privacy Policy</Link>
          <span className="text-gray-300">|</span>
          <Link to="/guidelines" className="hover:text-yellow-500 transition-colors duration-200">Community Guidelines</Link>
        </div>
      </footer>
    </div>
  )
}

export default About