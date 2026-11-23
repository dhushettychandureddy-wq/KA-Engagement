import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { invitation } from './event.js'
import DateReveal from './DateReveal.jsx'
import ganesh from './assets/ganesh-blessing.webp'
import couple from './assets/couple-704.webp'
import joinedHands from './assets/joined-hands.webp'
import exchangeHands from './assets/ring-exchange-hands.webp'
import pavilion from './assets/pavilion.webp'
import ringExchange from './assets/ring-exchange.webp'

const monogram = invitation.names.map(name => name[0]).join('&')

function PaintedScene({ src, className, alt = '' }) {
  const reduced = useReducedMotion()
  return (
    <m.img className={className} src={src} alt={alt} loading="lazy"
      initial={reduced ? false : { opacity: .3, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .15 }}
      transition={{ duration: reduced ? 0 : .75, ease: 'easeOut' }} />
  )
}

function FlowerShower() {
  return (
    <div className="flower-shower" aria-hidden="true">
      {['left', 'right'].map(side => (
        <div className={`flower-lane flower-lane-${side}`} key={side}>
          {[-0.3, -1.8, -3.4, -5.1, -6.6].map(delay => (
            <span className="falling-flower" key={delay} style={{ '--delay': `${delay}s` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function ScrollingInvitation({ playing, onMusic }) {
  const heading = useRef(null)
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])
  return (
    <div className="scroll-invitation">
      <header className="invite-nav">
        <a href="#couple">{monogram}</a>
        <nav aria-label="Invitation sections">
          <a href="#ceremony">Ceremony</a><a href="#venue">Venue</a>
          <button aria-label={playing ? 'Pause music' : 'Play music'} onClick={onMusic}>{playing ? '♫ Ⅱ' : '♫ ▷'}</button>
        </nav>
      </header>
      <div className="scroll-sheet stationery">
        <section id="couple" className="story-page">
          <FlowerShower />
          <h1 className="names" tabIndex={-1} ref={heading}>
            {invitation.families.map((family, index) => (
              <span className="family-entry" key={family.child}>
                {index > 0 && <em>&amp;</em>}
                {family.child}
                <span className="family-parents">{family.relationship} of {family.parents}</span>
              </span>
            ))}
          </h1>
          <img className="couple-art" src={couple} width="704" height="1056" alt="Illustrated portrait of the couple" />
          <p>Both families invite you to join us and bless the couple on their engagement.</p>
        </section>
        <section id="ceremony" className="story-page">
          <h2>The ceremony</h2>
          <DateReveal />
          <PaintedScene src={ringExchange} className="scene-art ceremony-art" alt="A gold ring exchanged between two hands" />
        </section>
        <section id="venue" className="story-page">
          <p className="script-label">The venue</p>
          <h2>{invitation.location}</h2>
          <address>{invitation.district}</address>
          <a className="button" href={invitation.directions} target="_blank" rel="noreferrer">Get directions</a>
          <PaintedScene src={pavilion} className="scene-art pavilion-art" />
          <details className="venue-map">
            <summary>View venue map</summary>
            <iframe title="Engagement venue in Guggilla" src={invitation.map} loading="lazy" />
          </details>
        </section>
        <footer className="story-page">
          <img className="closing-ganesh" src={ganesh} alt="Lord Ganesh" loading="lazy" />
          <h2>With love from both families</h2>
          <p>Your presence would be the greatest gift we could receive.</p>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  const [scene, setScene] = useState('blessing')
  const [playing, setPlaying] = useState(false)
  const [handsReady, setHandsReady] = useState(false)
  const reduced = useReducedMotion()
  const audio = useRef(null)

  useEffect(() => {
    if (scene !== 'blessing') return
    const timer = window.setTimeout(() => setScene('cover'), reduced ? 600 : 1450)
    return () => window.clearTimeout(timer)
  }, [scene, reduced])

  useEffect(() => {
    if (scene !== 'rings') return
    // A slow image request or interrupted animation must still let guests enter.
    const timer = window.setTimeout(() => setScene('invitation'), handsReady ? 4000 : 5500)
    return () => window.clearTimeout(timer)
  }, [scene, handsReady])

  function playMusic() {
    audio.current.volume = 0.42
    audio.current.play().catch(() => setPlaying(false))
  }

  function openInvitation() {
    playMusic()
    setScene(reduced ? 'invitation' : 'rings')
  }

  const duration = reduced ? 0 : 0.45
  return (
    <main>
      <audio ref={audio} src={invitation.music} preload="none" loop
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <AnimatePresence mode="wait">
        {scene === 'blessing' && (
          <m.section key="blessing" className="blessing entry-screen" exit={{ opacity: 0 }} transition={{ duration }}>
            <div className="blessing-leaf">
              <FlowerShower />
              <m.img src={ganesh} alt="Lord Ganesh" width="320" height="304"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration }} />
              <p>With the blessings of Lord Ganesh</p>
            </div>
          </m.section>
        )}
        {scene === 'cover' && (
          <m.section key="cover" className="cover entry-screen" aria-label="Engagement invitation cover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration }}>
            <link rel="preload" as="image" href={exchangeHands} />
            <m.div className="paper" initial={{ y: 18 }} animate={{ y: 0 }}
              exit={{ y: -24 }} transition={{ duration }}>
              <div className="monogram" aria-hidden="true">{monogram}</div>
              <h1>Engagement<br /><em>Invitation</em></h1>
              <img className="cover-rings" src={joinedHands} width="640" height="800" alt="Painted hands clasped together, with a gold engagement ring and jasmine bangles" />
              <button className="button" onClick={openInvitation}>Open invitation</button>
            </m.div>
          </m.section>
        )}
        {scene === 'rings' && (
          <m.section key="rings" className="entry-screen ring-reveal"
            aria-label={`${invitation.names[0]} receives an engagement ring from ${invitation.names[1]}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .25 }}>
            <div className="exchange-window" aria-hidden="true">
              <div className={`exchange-art${handsReady ? ' ready' : ''}`}>
                <div className="exchange-ring"><i /></div>
                <img className="bride-hand" src={exchangeHands} alt="" onLoad={() => setHandsReady(true)}
                  onError={() => setScene('invitation')} />
                <div className="exchange-ring ring-front"><i /></div>
                <img className="groom-hand" src={exchangeHands} alt=""
                  onAnimationEnd={() => setScene('invitation')} />
              </div>
            </div>
          </m.section>
        )}
        {scene === 'invitation' && (
          <ScrollingInvitation key="invitation" playing={playing}
            onMusic={() => audio.current.paused ? playMusic() : audio.current.pause()} />
        )}
      </AnimatePresence>
    </main>
  )
}
