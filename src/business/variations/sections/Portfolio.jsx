import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Head, Window, Avatar, useInView, CountUp, EASE_OUT } from '../kit'
import { BUILDS, PEOPLE, INSTRUCTORS, LOGOS, LEVELS, buildImg, logoSrc, asset, BOOK_DEMO_URL } from '../data'
import './portfolio.css'

const build = (author) => BUILDS.find((b) => b.author === author)

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])
  return reduced
}

function VerifiedTick({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 1.5l2.2 1.6 2.7-.1.9 2.6 2.2 1.6-.8 2.6.8 2.6-2.2 1.6-.9 2.6-2.7-.1L10 18.5l-2.2-1.6-2.7.1-.9-2.6-2.2-1.6.8-2.6-.8-2.6 2.2-1.6.9-2.6 2.7.1z" fill="#3f6fb8" />
      <path d="M6.5 10.2l2.3 2.3 4.7-4.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* A: the profile ------------------------------------------------------- */
const A_POOL = ['Thomas N.', 'Chris A.', 'Nina P.', 'Faisal K.', 'Kira F.', 'Alex W.', 'Sam R.', 'Johanna D.'].map(build)

function useDropIn(active, reduced) {
  const [state, setState] = useState({ list: A_POOL.slice(2, 8).map((b) => b.id), next: 0, fresh: null, count: 6 })
  useEffect(() => {
    if (!active || reduced) return
    const t = setInterval(() => {
      setState((s) => {
        let k = s.next
        while (s.list.includes(A_POOL[k % A_POOL.length].id)) k += 1
        const pick = A_POOL[k % A_POOL.length]
        return { list: [pick.id, ...s.list].slice(0, 6), next: k + 1, fresh: pick.id, count: s.count + 1 }
      })
    }, 4200)
    return () => clearInterval(t)
  }, [active, reduced])
  return state
}

function VariantA() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const { list, fresh, count } = useDropIn(inView, reduced)
  const lvl = LEVELS[3]

  return (
    <section className="vk-sec vk-bg-white vpf-a" ref={ref}>
      <div className="vk-wrap vpf-a-grid">
        <div className="vpf-a-copy">
          <Head
            eyebrow="Portfolio"
            title="A credential your people keep"
            sub="Every verified build lands on a public Leland portfolio. Proof of skill that follows them from role to role."
          />
          <ul className="vpf-a-list">
            <li><VerifiedTick /> Each build is reviewed before it counts</li>
            <li><VerifiedTick /> Shareable link, one click to LinkedIn</li>
            <li><VerifiedTick /> Level badge updates as they grow</li>
          </ul>
        </div>

        <Window url="leland.ai/ava-brooks" className="vpf-a-win">
          <div className="vpf-a-profile">
            <div className="vpf-a-cover" aria-hidden="true" />
            <div className="vpf-a-id">
              <Avatar img="pic-04" size={92} className="vpf-a-face" />
              <div className="vpf-a-name">
                <h3>Ava Brooks</h3>
                <span>Finance Manager · [Acme Inc.]</span>
              </div>
              <span className="vpf-a-badge" style={{ '--lvl': lvl.color }}>
                <b>3</b> Level 3 · {lvl.name}
              </span>
            </div>
            <div className="vpf-a-stats">
              <div><b key={count} className="vpf-tick">{count}</b><span>verified builds</span></div>
              <div><b>22</b><span>hrs saved / week</span></div>
              <div><b>14</b><span>skills</span></div>
            </div>
            <div className="vpf-a-builds">
              <AnimatePresence initial={false} mode="popLayout">
                {list.map((id) => {
                  const b = BUILDS.find((x) => x.id === id)
                  const isFresh = id === fresh
                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, y: -18, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                      transition={{ duration: 0.5, ease: EASE_OUT }}
                      className={`vpf-a-card${isFresh ? ' vpf-a-fresh' : ''}`}
                    >
                      <div className="vpf-a-thumb">
                        <img src={buildImg(b.id)} alt="" loading="lazy" />
                        {isFresh ? <span className="vpf-stamp">Verified</span> : null}
                      </div>
                      <b>{b.title}</b>
                      <span><VerifiedTick size={13} /> {b.tool} · {b.hours} hrs/wk</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </Window>
      </div>
    </section>
  )
}

/* B: passport ---------------------------------------------------------- */
const B_STAMPS = [
  { label: 'SDR agent', date: 'MAR 2026', shape: 'round', color: '#2f5aa0', x: 6, y: 8, r: -12 },
  { label: 'Cash-flow forecast', date: 'APR 2026', shape: 'rect', color: '#a2412b', x: 50, y: 4, r: 7 },
  { label: 'Survey analysis', date: 'MAY 2026', shape: 'oval', color: '#2e7a4f', x: 8, y: 38, r: 4 },
  { label: 'Proposal compare', date: 'JUN 2026', shape: 'rect', color: '#5b3f9a', x: 56, y: 38, r: -9 },
  { label: 'Ops digest', date: 'JUL 2026', shape: 'round', color: '#a2412b', x: 4, y: 64, r: 10 },
  { label: 'Pitch-deck generator', date: 'AUG 2026', shape: 'oval', color: '#2f5aa0', x: 44, y: 70, r: -5 },
]

function useStampCount(active, reduced, pageRef) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    if (reduced) { setN(B_STAMPS.length); return }
    let i = 0
    let t
    const tick = () => {
      i += 1
      if (i > B_STAMPS.length + 4) i = 0
      if (i <= B_STAMPS.length) {
        setN(i)
        if (i > 0 && pageRef.current) {
          // The thunk: the page dips as if the stamp landed on it.
          setTimeout(() => pageRef.current?.animate(
            [{ transform: 'translateY(0)' }, { transform: 'translateY(2px) scale(0.997)' }, { transform: 'translateY(0)' }],
            { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
          ), 170)
        }
      }
      t = setTimeout(tick, i === 0 ? 700 : 950)
    }
    t = setTimeout(tick, 500)
    return () => clearTimeout(t)
  }, [active, reduced, pageRef])
  return n
}

function VariantB() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const pageRef = useRef(null)
  const n = useStampCount(inView, reduced, pageRef)

  return (
    <section className="vk-sec vk-bg-orange vpf-b" ref={ref}>
      <div className="vk-wrap">
        <Head
          dark
          align="center"
          eyebrow="A passport for AI skills"
          title="Every build is a stamp they keep"
          sub="A course certificate says someone showed up. A page full of verified builds shows where they’ve been and what they can do."
        />
        <div className="vpf-pass" ref={pageRef}>
          <div className="vpf-pass-page vpf-pass-left">
            <div className="vpf-pass-top"><span>Leland</span><span>AI skills passport</span></div>
            <div className="vpf-pass-id">
              <Avatar img="pic-04" size={96} className="vpf-pass-photo" />
              <dl>
                <div><dt>Name</dt><dd>Ava Brooks</dd></div>
                <div><dt>Role</dt><dd>Finance Manager</dd></div>
                <div><dt>Level</dt><dd>3 · Builder</dd></div>
                <div><dt>Issued</dt><dd>Mar 2026</dd></div>
              </dl>
            </div>
            <div className="vpf-pass-mrz" aria-hidden="true">
              <span>P&lt;LELAND&lt;&lt;BROOKS&lt;&lt;AVA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</span>
              <span>L3BUILDER&lt;&lt;06VERIFIED&lt;&lt;2026&lt;&lt;&lt;&lt;</span>
            </div>
          </div>
          <div className="vpf-pass-spine" aria-hidden="true" />
          <div className="vpf-pass-page vpf-pass-right">
            <div className="vpf-pass-top"><span>Verified builds</span><span>{n} / {B_STAMPS.length}</span></div>
            <div className="vpf-pass-stamps">
              {B_STAMPS.map((s, i) => (i < n ? (
                <div key={s.label} className={`vpf-stampx vpf-stampx-${s.shape}`} style={{ left: `${s.x}%`, top: `${s.y}%`, '--r': `${s.r}deg`, '--c': s.color }}>
                  <small>Verified</small>
                  <b>{s.label}</b>
                  <small>{s.date}</small>
                </div>
              ) : null))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* C: resume / code / builds -------------------------------------------- */
const C_GRID = Array.from({ length: 7 * 18 }, (_, i) => {
  const v = (((i * 7919 + 104729) % 997) * 31) % 10
  return v > 7 ? 3 : v > 5 ? 2 : v > 3 ? 1 : 0
})
const C_BUILDS = ['Priya S.', 'Thomas N.', 'Leah M.', 'Faisal K.'].map(build)
const linkedin = LOGOS.find((l) => l.name === 'LinkedIn')

function VariantC() {
  return (
    <section className="vk-sec vk-bg-tint vpf-c">
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="Proof, not claims"
          title="LinkedIn has the resume. GitHub has the code. Leland has the builds."
          sub="Most people who use AI well will never write code. Their portfolio is the work they shipped with it."
        />
        <div className="vpf-c-grid">
          <article className="vpf-c-card">
            <div className="vpf-c-brand"><img src={logoSrc(linkedin)} alt="LinkedIn" style={{ height: 22 }} /></div>
            <div className="vpf-c-mock">
              <div className="vpf-c-who"><Avatar img="pic-04" size={40} /><div><b>Ava Brooks</b><span>Finance Manager</span></div></div>
              <div className="vpf-c-line"><b>Experience</b><span>Finance Manager · 2021 to now</span><span>Senior Analyst · 2017 to 2021</span></div>
              <div className="vpf-c-line"><b>Skills</b><span className="vpf-c-tags"><i>Excel</i><i>Forecasting</i><i>AI tools</i></span></div>
              <span className="vpf-c-flag">Self-reported</span>
            </div>
            <p className="vpf-c-foot"><b>The resume.</b> Says what you did.</p>
          </article>

          <article className="vpf-c-card">
            <div className="vpf-c-brand vpf-c-gh"><span className="vpf-c-ghmark">{'</>'}</span>GitHub</div>
            <div className="vpf-c-mock">
              <div className="vpf-c-contrib" aria-hidden="true">
                {C_GRID.map((v, i) => <i key={i} className={`vpf-c-l${v}`} />)}
              </div>
              <pre className="vpf-c-code"><span>def</span> forecast(cash, burn):{'\n'}  return cash / burn{'\n'}<em># 412 commits this year</em></pre>
              <span className="vpf-c-flag">Engineers only</span>
            </div>
            <p className="vpf-c-foot"><b>The code.</b> If you write code.</p>
          </article>

          <article className="vpf-c-card vpf-c-hero">
            <div className="vpf-c-brand"><img src={asset('logo-dark.svg')} alt="Leland" style={{ height: 22 }} /><span className="vpf-c-new">For everyone else</span></div>
            <div className="vpf-c-builds">
              {C_BUILDS.map((b) => (
                <div key={b.id} className="vpf-c-build">
                  <img src={buildImg(b.id)} alt="" loading="lazy" />
                  <span><VerifiedTick size={12} /> {b.hours} hrs/wk</span>
                </div>
              ))}
            </div>
            <div className="vpf-c-sum"><b>4 verified builds</b><span>23 hours saved every week</span></div>
            <p className="vpf-c-foot"><b>The builds.</b> Proves what you can do with AI.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

/* D: the certificate --------------------------------------------------- */
function useTilt() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const spring = { stiffness: 160, damping: 18, mass: 0.6 }
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), spring)
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), spring)
  const gx = useSpring(useTransform(mx, [-0.5, 0.5], [-35, 35]), spring)
  const gy = useSpring(useTransform(my, [-0.5, 0.5], [-35, 35]), spring)
  const glareX = useTransform(gx, (v) => `${v}%`)
  const glareY = useTransform(gy, (v) => `${v}%`)
  const [fine, setFine] = useState(false)
  useEffect(() => {
    setFine(window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])
  const handleMove = (e) => {
    if (!fine) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const handleLeave = () => { mx.set(0); my.set(0) }
  return { rotateX, rotateY, glareX, glareY, fine, handleMove, handleLeave }
}

function VariantD() {
  const [ref, inView] = useInView()
  const { rotateX, rotateY, glareX, glareY, fine, handleMove, handleLeave } = useTilt()

  return (
    <section className="vk-sec vpf-d" ref={ref}>
      <div className="vpf-d-glow" aria-hidden="true" />
      <div className="vk-wrap vpf-d-grid">
        <div className="vpf-d-copy">
          <Head
            dark
            eyebrow="The certificate"
            title="A certificate with work behind it"
            sub="Each Leland certificate links to the verified builds that earned it. Anyone who clicks it sees the proof."
          />
          <ul className="vpf-d-list">
            <li><span>01</span><div><b>Earned with builds, not quiz scores</b><p>Real workflows shipped in their own job.</p></div></li>
            <li>
              <span>02</span>
              <div>
                <b>Reviewed by Leland instructors</b>
                <p className="vpf-d-faces">{INSTRUCTORS.map((p) => <Avatar key={p.img} img={p.img} size={28} ring />)}<em>{INSTRUCTORS.map((p) => p.name).join(', ')}</em></p>
              </div>
            </li>
            <li><span>03</span><div><b>One click to LinkedIn</b><p>A credential that follows them, not the company.</p></div></li>
          </ul>
        </div>

        <div className={`vpf-d-stage${inView ? ' vpf-d-on' : ''}${fine ? '' : ' vpf-d-idle'}`} onPointerMove={handleMove} onPointerLeave={handleLeave}>
          <motion.div className="vpf-d-card" style={{ rotateX, rotateY }}>
            <img src={asset('certificate-level-1-arntz.webp')} alt="Leland AI Builder Program certificate, Level 1" className="vpf-d-cert" width="1000" height="708" />
            <div className="vpf-d-glare-wrap" aria-hidden="true"><motion.div className="vpf-d-glare" style={{ x: glareX, y: glareY }} /></div>
            <img src={asset('seal.png')} alt="" className="vpf-d-seal" width="320" height="320" />
          </motion.div>
          <p className="vpf-d-cap"><VerifiedTick size={14} /> Level 1 · AI Builder Program · backed by 3 verified builds</p>
        </div>
      </div>
    </section>
  )
}

/* E: earning "verified" ------------------------------------------------ */
const E_BUILDS = ['Priya S.', 'Leah M.', 'Thomas N.'].map(build)
const E_STAGES = [
  { n: '01', name: 'Submitted', note: 'Shipped in their real job' },
  { n: '02', name: 'Community-validated', note: 'Peers try it and vote' },
  { n: '03', name: 'Leland-verified', note: 'An instructor signs off' },
]
const E_LIKERS = ['pic-02', 'pic-05', 'pic-09', 'pic-11', 'pic-14']

function usePipeline(active, reduced) {
  const [s, setS] = useState({ step: 0, idx: 0 })
  useEffect(() => {
    if (!active) return
    if (reduced) { setS({ step: 2, idx: 0 }); return }
    const durs = [1700, 2800, 3200]
    let t
    const run = (cur) => {
      t = setTimeout(() => {
        const next = cur.step === 2 ? { step: 0, idx: (cur.idx + 1) % E_BUILDS.length } : { step: cur.step + 1, idx: cur.idx }
        setS(next)
        run(next)
      }, durs[cur.step])
    }
    run({ step: 0, idx: 0 })
    return () => clearTimeout(t)
  }, [active, reduced])
  return s
}

function PipeCard({ b, step, layoutId }) {
  return (
    <motion.div
      layoutId={layoutId}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className={`vpf-e-card vpf-e-card-${step}`}
    >
      <div className="vpf-e-thumb">
        <img src={buildImg(b.id)} alt="" />
        {step === 2 ? <span className="vpf-stamp vpf-stamp-sm">Verified</span> : null}
      </div>
      <b>{b.title}</b>
      <span className="vpf-e-by">{b.author} · {b.role} · {b.tool}</span>
      <div className="vpf-e-foot">
        {step === 0 ? <span className="vpf-e-pill">Submitted · just now</span> : null}
        {step === 1 ? (
          <span className="vpf-e-likes">
            <span className="vpf-e-faces">{E_LIKERS.map((f, i) => <span key={f} style={{ animationDelay: `${300 + i * 260}ms` }}><Avatar img={f} size={24} ring /></span>)}</span>
            <span className="vpf-e-heart">♥ <CountUp to={24} duration={2000} /></span>
          </span>
        ) : null}
        {step === 2 ? <span className="vpf-e-ok"><VerifiedTick size={16} /> Verified · added to portfolio</span> : null}
      </div>
    </motion.div>
  )
}

function VariantE() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const { step, idx } = usePipeline(inView, reduced)
  const b = E_BUILDS[idx]

  return (
    <section className="vk-sec vk-bg-wash vpf-e" ref={ref}>
      <div className="vk-wrap">
        <div className="vpf-e-top">
          <Head
            eyebrow="How a build earns “verified”"
            title="Verified means someone checked"
            sub="Every build goes through two reviews before it counts. That’s why the portfolio means something."
          />
          <a className="vk-btn vk-btn-dark" href={BOOK_DEMO_URL}>Book a demo</a>
        </div>
        <div className="vpf-e-lanes">
          {E_STAGES.map((st, i) => (
            <motion.div layout transition={{ duration: 0.7, ease: EASE_OUT }} key={st.n} className={`vpf-e-lane${step === i ? ' vpf-e-lane-on' : ''}${step > i ? ' vpf-e-lane-done' : ''}`}>
              <motion.div layout="position" transition={{ duration: 0.7, ease: EASE_OUT }} className="vpf-e-lane-h">
                <span className="vpf-e-n">{step > i ? '✓' : st.n}</span>
                <div><b>{st.name}</b><small>{st.note}</small></div>
              </motion.div>
              <div className="vpf-e-slot">
                {step === i ? <PipeCard b={b} step={step} layoutId={`vpf-e-${idx}`} /> : <div className="vpf-e-empty" />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default { A: VariantA, B: VariantB, C: VariantC, D: VariantD, E: VariantE }
