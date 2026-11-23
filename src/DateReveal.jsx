import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { invitation } from './event.js'

const date = new Date(invitation.start)
const dateLabel = date.toLocaleDateString('en-IN', {
  timeZone: invitation.timeZone, day: 'numeric', month: 'long', year: 'numeric',
})
const timeLabel = date.toLocaleTimeString('en-IN', {
  timeZone: invitation.timeZone, hour: 'numeric', minute: '2-digit', hour12: true,
}).toLowerCase()

function Countdown() {
  const remaining = () => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000))
  const [seconds, setSeconds] = useState(remaining)
  useEffect(() => {
    const id = window.setInterval(() => setSeconds(remaining()), 1000)
    return () => window.clearInterval(id)
  }, [])
  if (!seconds) return <p>Thank you for celebrating with us.</p>
  const units = [
    ['Days', Math.floor(seconds / 86400)], ['Hours', Math.floor(seconds / 3600) % 24],
    ['Minutes', Math.floor(seconds / 60) % 60], ['Seconds', seconds % 60],
  ]
  return (
    <dl className="countdown" role="timer" aria-label="Time until the engagement">
      {units.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{String(value).padStart(2, '0')}</dd></div>
      ))}
    </dl>
  )
}

const burstFlowers = Array.from({ length: 16 }, (_, index) => {
  const angle = index * Math.PI / 8
  const radius = index % 2 ? 1 : .72
  return {
    '--x': `${Math.cos(angle) * radius * 6.4}em`,
    '--y': `${Math.sin(angle) * radius * 4.8}em`,
    '--turn': `${index % 2 ? -100 : 145}deg`,
  }
})

export default function DateReveal() {
  const [phase, setPhase] = useState('sealed')
  const reduced = useReducedMotion()
  const pointer = useRef(null)
  const seal = useRef(null)
  const revealedDate = useRef(null)
  const restoreFocus = useRef(false)

  useEffect(() => {
    if (phase !== 'opening') return
    const timer = window.setTimeout(() => {
      restoreFocus.current = document.activeElement === seal.current
      setPhase('revealed')
    }, reduced ? 0 : 900)
    return () => window.clearTimeout(timer)
  }, [phase, reduced])

  useEffect(() => {
    if (phase === 'revealed' && restoreFocus.current) {
      revealedDate.current?.focus({ preventScroll: true })
    }
  }, [phase])

  function reveal() {
    if (phase === 'sealed') setPhase('opening')
  }

  function startPull(event) {
    if (!event.isPrimary || event.button !== 0 || phase !== 'sealed') return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointer.current = { id: event.pointerId, y: event.clientY }
  }

  function pull(event) {
    if (pointer.current?.id !== event.pointerId || phase !== 'sealed') return
    const distance = Math.max(0, event.clientY - pointer.current.y)
    event.currentTarget.style.setProperty('--pull', `${Math.min(distance, 32)}px`)
    if (distance >= 32) reveal()
  }

  function resetPull(event) {
    if (pointer.current?.id !== event.pointerId) return
    pointer.current = null
    event.currentTarget.style.removeProperty('--pull')
  }

  return (
    <div className="date-stage" data-phase={phase}>
      <span className="date-drape drape-left" aria-hidden="true" />
      <span className="date-drape drape-right" aria-hidden="true" />
      {phase !== 'revealed' && (
        <button ref={seal} className="date-seal" type="button" aria-controls="ceremony-date"
          aria-disabled={phase === 'opening'} onClick={reveal} onPointerDown={startPull}
          onPointerMove={pull} onLostPointerCapture={resetPull}>
          <span className="seal-medallion" aria-hidden="true" />
          <span>Pull or tap to reveal the date</span>
        </button>
      )}
      {phase === 'opening' && !reduced && (
        <div className="flower-burst" aria-hidden="true">
          {burstFlowers.map((style, index) => <i className="burst-flower" key={index} style={style} />)}
        </div>
      )}
      <div id="ceremony-date" aria-live="polite">
        {phase === 'revealed' && (
          <time ref={revealedDate} tabIndex={-1} dateTime={invitation.start}>
            <strong>{dateLabel}</strong><span>{timeLabel}</span>
          </time>
        )}
      </div>
      {phase === 'revealed' && <Countdown />}
    </div>
  )
}
