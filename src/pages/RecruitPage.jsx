import React, { useState, useEffect, useRef } from 'react'
import './home-rebrand.css'
import './leland-ai.css'
import './recruit.css'

const LELAND_ICON_WHITE = (
  <svg width="828" height="837" viewBox="0 0 828 837" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M416.453 623C525.88 623 624.257 667.51 692.244 738.336L602.778 827.49C590.719 839.506 571.181 838.906 557.874 828.289C520.213 798.241 470.696 780 416.453 780C362.171 780 312.622 798.266 274.95 828.351C261.624 838.995 242.04 839.587 229.98 827.528L140.724 738.271C208.709 667.484 307.059 623 416.453 623Z" fill="white"/>
    <path d="M221.116 448.049C282.094 427.309 347.87 416 416.453 416C572.955 416 714.84 474.876 818.452 570.369C830.536 581.506 830.363 600.376 818.736 611.99L729.44 701.183C651.686 621.758 540.243 572 416.453 572C292.889 572 181.628 621.575 103.893 700.746C90.5937 687.385 35.5412 631.9 8.71961 604.874C-0.163122 595.923 -2.50178 582.393 2.82555 570.964L258.185 23.1016C264.753 9.00953 278.892 0.000102792 294.44 0H429.953L221.116 448.049Z" fill="white"/>
    <path d="M600.871 0C622.813 0 637.332 22.7856 628.062 42.6738L472.944 375.472C454.013 373.838 434.837 373 415.453 373C379.199 373 343.671 375.922 309.122 381.527L486.953 0H600.871Z" fill="white"/>
  </svg>
)

const TYPEFORM_BASE = 'https://joinleland.typeform.com/to/e8vrfV80'

const START_COUNT = 1324
const START_TIME = Date.UTC(2026, 4, 13, 16, 0, 0) // May 13, 2026 4pm UTC
const MS_PER_HOUR = 3600000

function getNetworkCount() {
  const hoursElapsed = Math.floor((Date.now() - START_TIME) / MS_PER_HOUR)
  if (hoursElapsed <= 0) return START_COUNT
  let total = START_COUNT
  for (let i = 0; i < hoursElapsed; i++) {
    const seed = ((i + 1) * 2654435761) >>> 0
    total += (seed % 3) + 1
  }
  return total
}

const FAQ_DATA = [
  { q: 'When do I actually pay?', a: 'You pay the placement fee when a candidate from our shortlist accepts your offer and signs an employment agreement. Net 30 from start date. Nothing is due upfront, and nothing is due if you don\u2019t hire anyone.' },
  { q: 'What counts as a \u201chire\u201d?', a: 'Any candidate we introduced to you who accepts a full-time, part-time, or intern role at your company within 12 months of the introduction. If they end up in a different role than the one you posted, it still counts.' },
  { q: 'How fast will I see candidates?', a: 'Most roles get a shortlist of 3 to 5 candidates within 3 business days. Niche or very senior roles may take a week or two. We\u2019ll set expectations within 24 hours of you posting the role.' },
  { q: 'What if I hire two people from the same shortlist?', a: 'You pay the placement fee per hire. Two hires from one shortlist means two placement fees. We\u2019ll send as many qualified candidates as we have for the role at no extra cost.' },
  { q: 'What roles work best?', a: 'Roles where AI fluency is a real lever: ops, growth, marketing, finance, product, design, and engineering. Anywhere \u201cdoing more with less\u201d is the goal. We work across senior IC and manager levels.' },
  { q: 'Are these candidates exclusive to Leland?', a: 'No. Candidates can apply elsewhere on their own. But the introduction, vetting, and references through us are exclusive. You only pay the placement fee if you hire someone we introduced you to.' },
  { q: 'Do you handle visas or international hires?', a: 'Yes, but we flag visa or location constraints upfront so you don\u2019t waste time. Most candidates are US-based and remote-friendly. We can source globally for fully remote roles.' },
  { q: 'What if the hire doesn\u2019t work out?', a: 'We\u2019ll work with you to find a replacement candidate from our network. Talk to us if it happens. We\u2019re invested in long-term relationships, not one-off placements.' },
  { q: 'Do you support equity-only or no-base-salary roles?', a: 'We focus on roles with market-rate base compensation. If you have an unusual structure, post the role and we\u2019ll let you know whether we can find a fit.' },
  { q: 'Can I see candidate profiles before paying anything?', a: 'Yes. You see full bios, build portfolios, and references before you ever interview, and nothing is due unless you hire someone.' },
]

export default function RecruitPage() {
  const [networkCount, setNetworkCount] = useState(getNetworkCount)
  const [openFaq, setOpenFaq] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    document.title = 'Hire AI-Native Talent | Leland'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const wrapper = nav.closest('.rb-nav-wrapper')
    if (!wrapper) return
    const measure = () => { wrapper.style.setProperty('--nav-height', `${nav.offsetHeight}px`) }
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Re-render network counter every 60s
  useEffect(() => {
    const interval = setInterval(() => setNetworkCount(getNetworkCount()), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* ===== NAV ===== */}
      <div className={`rb-nav-wrapper rb-nav-light${scrolled ? ' rb-nav-scrolled' : ''}`}>
        <nav className="rb-nav lai-nav" ref={navRef} role="navigation">
          <div className="rb-nav-lockup">
            <a href="https://www.joinleland.com" className="rb-nav-logo">
              <img className="rb-logo-dark" src={`${import.meta.env.BASE_URL}assets/logo-dark.svg`} alt="Leland" />
            </a>
            <div className="lai-nav-links">
              <a href="/program" className="lai-nav-link">Builder Program</a>
              <a href="https://joinleland.typeform.com/to/nXD9kytE" target="_blank" rel="noopener noreferrer" className="lai-nav-link">Services</a>
              <a href="/recruit" className="lai-nav-link">Recruit</a>
              <a href="/pledge" className="lai-nav-link">Our Pledge</a>
            </div>
          </div>
          <div className="rb-nav-actions">
            <a href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=nav`} target="_blank" rel="noopener noreferrer" className="rb-nav-getstarted">Post a Role</a>
          </div>
        </nav>
      </div>

      <main>
        {/* ===== HERO ===== */}
        <section className="rcr-hero">
          <div className="rcr-hero-inner">
            <span className="rcr-hero-eyebrow">Hire AI-Native Talent</span>
            <h1>Hire AI-native builders <span className="rcr-accent">and watch your company transform.</span></h1>
            <p className="rcr-lead">There&rsquo;s a network of thousands of AI-native operators we&rsquo;ve trained and vetted. The only way to hire one is to post a role.</p>
            <div className="rcr-hero-cta">
              <a className="rcr-btn rcr-btn-primary" href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=hero`} target="_blank" rel="noopener noreferrer">Just get started</a>
              <a className="rcr-btn rcr-btn-secondary" href="#how">How it works</a>
            </div>
            <div className="rcr-counter" aria-label="Live network counter">
              <span className="rcr-dot" aria-hidden="true" />
              <span className="rcr-num">{networkCount.toLocaleString('en-US')}</span>
              <span className="rcr-label"><b>AI-native operators</b> in Leland&rsquo;s network</span>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="rcr-section rcr-howitworks" id="how">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">How it works</span>
            <h2 className="rcr-section-title">Three steps. No risk until they&rsquo;re hired.</h2>
            <p className="rcr-section-sub">Post a role, get a shortlist, only pay if someone accepts.</p>
            <div className="rcr-steps">
              <div className="rcr-step">
                <div className="rcr-step-num">Step 01</div>
                <h3>Post your role</h3>
                <p>Tell us what you&rsquo;re hiring for, what success looks like, and what AI workflows you want the hire to bring. Takes about 3 minutes.</p>
                <span className="rcr-pill">3 min form</span>
              </div>
              <div className="rcr-step">
                <div className="rcr-step-num">Step 02</div>
                <h3>We shortlist</h3>
                <p>We match you with 3 to 5 AI-native candidates from the Leland network. Full bios, portfolios of real builds, and intros within days.</p>
                <span className="rcr-pill">3 business days</span>
              </div>
              <div className="rcr-step">
                <div className="rcr-step-num">Step 03</div>
                <h3>Pay only when you hire</h3>
                <p>Interview, decide, and extend an offer on your timeline. Pay $10,000 per full-time hire or $5,000 per intern. Nothing if you don&rsquo;t hire.</p>
                <span className="rcr-pill">$0 due upfront</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="rcr-section rcr-stats-section">
          <div className="rcr-section-container">
            <div className="rcr-stats">
              <div className="rcr-stat"><div className="rcr-stat-num">1,500+</div><div className="rcr-stat-label">AI-native operators &amp; engineers</div></div>
              <div className="rcr-stat"><div className="rcr-stat-num">12+</div><div className="rcr-stat-label">Avg agents &amp; automations per candidate</div></div>
              <div className="rcr-stat"><div className="rcr-stat-num">3 days</div><div className="rcr-stat-label">From posted role to first intros</div></div>
              <div className="rcr-stat"><div className="rcr-stat-num">$0</div><div className="rcr-stat-label">Due unless you actually hire</div></div>
            </div>
          </div>
        </section>

        {/* ===== AI-FLUENT VS AI-NATIVE ===== */}
        <section className="rcr-section rcr-versus">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">AI-fluent vs. AI-native</span>
            <h2 className="rcr-section-title">AI-fluent uses AI. AI-native ships with it.</h2>
            <p className="rcr-section-sub">AI-fluent talent is great and getting more common every month. AI-native operators are something else. They&rsquo;ve rebuilt how they work around AI from the ground up.</p>
            <div className="rcr-versus-grid">
              <div className="rcr-vcard">
                <div className="rcr-vlabel">AI-Fluent</div>
                <h3>The new baseline</h3>
                <p className="rcr-vsub">Comfortable with AI &middot; Getting better fast</p>
                <ul>
                  <li><span className="rcr-vicon">&rsaquo;</span><span>Uses ChatGPT, Claude, and Copilot daily for tasks</span></li>
                  <li><span className="rcr-vicon">&rsaquo;</span><span>Drafts faster, writes better, summarizes meetings</span></li>
                  <li><span className="rcr-vicon">&rsaquo;</span><span>Treats AI as a productivity layer on existing work</span></li>
                  <li><span className="rcr-vicon">&rsaquo;</span><span>A solid hire and improving every month</span></li>
                </ul>
              </div>
              <div className="rcr-vcard rcr-highlight">
                <div className="rcr-vlabel">AI-Native</div>
                <h3>The new edge</h3>
                <p className="rcr-vsub">Has rebuilt their work around AI from the ground up</p>
                <ul>
                  <li><span className="rcr-vicon">&check;</span><span>Ships agents and automations that handle real work end-to-end</span></li>
                  <li><span className="rcr-vicon">&check;</span><span>Lives in Cursor, Claude Code, n8n, and a custom stack</span></li>
                  <li><span className="rcr-vicon">&check;</span><span>Treats AI as a force multiplier on what one person can do</span></li>
                  <li><span className="rcr-vicon">&check;</span><span>One AI-native hire can do the work of a small team</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===== WHO YOU'LL MEET ===== */}
        <section className="rcr-section rcr-talent">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">Who you&rsquo;ll meet</span>
            <h2 className="rcr-section-title">A sample of who&rsquo;s in the pool right now.</h2>
            <p className="rcr-section-sub">Anonymized profiles. We send full bios, portfolios, and references once we understand the role.</p>
            <div className="rcr-candidates">
              <div className="rcr-cc">
                <div className="rcr-cc-id">Candidate #142 <span className="rcr-cc-tag">Full-time</span></div>
                <h3 className="rcr-cc-role">Operations Builder</h3>
                <div className="rcr-cc-loc">SF &middot; Remote-friendly &middot; Open now</div>
                <div className="rcr-cc-builds"><b>14 shipped builds.</b> Saved last team ~12 hrs/week with a 6-step automation. Ran AI ops at a Series A SaaS company.</div>
                <div className="rcr-cc-tools"><span>Claude</span><span>n8n</span><span>Cursor</span><span>Airtable</span><span>Notion</span></div>
              </div>
              <div className="rcr-cc">
                <div className="rcr-cc-id">Candidate #098 <span className="rcr-cc-tag">Full-time</span></div>
                <h3 className="rcr-cc-role">GTM Engineer</h3>
                <div className="rcr-cc-loc">NYC &middot; Hybrid &middot; Available in 4 weeks</div>
                <div className="rcr-cc-builds">Shipped a <b>lead-scoring agent</b> that 3x&rsquo;d reply rate. Built outbound automations for 3 startups. Background in SDR + growth eng.</div>
                <div className="rcr-cc-tools"><span>Claude</span><span>Cursor</span><span>Apollo</span><span>Clay</span><span>HubSpot</span></div>
              </div>
              <div className="rcr-cc">
                <div className="rcr-cc-id">Candidate #211 <span className="rcr-cc-tag">Full-time</span></div>
                <h3 className="rcr-cc-role">AI-Native Engineer</h3>
                <div className="rcr-cc-loc">Austin &middot; Remote &middot; Open now</div>
                <div className="rcr-cc-builds">Shipped <b>2 production agents</b> at last role. Codes 80% in Cursor + Claude Code. 5 years full-stack, last 18 months AI-focused.</div>
                <div className="rcr-cc-tools"><span>Claude Code</span><span>Cursor</span><span>TypeScript</span><span>Python</span><span>LangGraph</span></div>
              </div>
              <div className="rcr-cc">
                <div className="rcr-cc-id">Candidate #176 <span className="rcr-cc-tag">Full-time</span></div>
                <h3 className="rcr-cc-role">Marketing Builder</h3>
                <div className="rcr-cc-loc">Remote &middot; Open now</div>
                <div className="rcr-cc-builds">Automated <b>full content pipeline</b> (research, draft, publish). Built a brand-voice agent used across 4 channels. Last role: B2B SaaS senior marketer.</div>
                <div className="rcr-cc-tools"><span>Claude</span><span>Perplexity</span><span>n8n</span><span>Notion</span><span>Figma</span></div>
              </div>
              <div className="rcr-cc">
                <div className="rcr-cc-id">Candidate #233 <span className="rcr-cc-tag rcr-intern">Intern</span></div>
                <h3 className="rcr-cc-role">Operations Intern</h3>
                <div className="rcr-cc-loc">Remote &middot; Summer + Fall</div>
                <div className="rcr-cc-builds">Completed <b>AIBP Levels 1 to 3</b> in 12 weeks. Shipped 8 builds during the program. Strong portfolio of automations.</div>
                <div className="rcr-cc-tools"><span>Claude</span><span>n8n</span><span>ChatGPT</span><span>Airtable</span></div>
              </div>
              <div className="rcr-cc">
                <div className="rcr-cc-id">Candidate #189 <span className="rcr-cc-tag rcr-intern">Intern</span></div>
                <h3 className="rcr-cc-role">Engineering Intern</h3>
                <div className="rcr-cc-loc">Boston &middot; Hybrid &middot; Summer</div>
                <div className="rcr-cc-builds">CS junior. <b>AIBP Level 1 to 4 graduate.</b> Built a multi-agent research system as capstone. Ships daily in Claude Code + Cursor.</div>
                <div className="rcr-cc-tools"><span>Claude Code</span><span>Cursor</span><span>Python</span><span>TypeScript</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className="rcr-section rcr-pricing-section" id="pricing">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">Pricing</span>
            <h2 className="rcr-section-title">Simple, success-based pricing.</h2>
            <p className="rcr-section-sub">No retainers. No sourcing fees. No monthly minimums. You pay one flat fee when a candidate accepts your offer.</p>
            <div className="rcr-pricing">
              <div className="rcr-pcard">
                <div className="rcr-pname">Intern</div>
                <div className="rcr-pamount">$5,000</div>
                <div className="rcr-pper">per intern hired</div>
                <div className="rcr-pwhen">Due only on hire</div>
                <ul>
                  <li>3 to 5 vetted intern candidates per role</li>
                  <li>AI Builder Program graduates with shipped builds</li>
                  <li>Portfolio of real automations on day one</li>
                  <li>Summer, fall, and part-time availability</li>
                  <li>We handle scheduling and intros</li>
                </ul>
                <a className="rcr-btn rcr-btn-secondary" href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=pricing&role=intern`} target="_blank" rel="noopener noreferrer">Post an intern role</a>
              </div>
              <div className="rcr-pcard rcr-featured">
                <span className="rcr-ptag">Most common</span>
                <div className="rcr-pname">Full-time</div>
                <div className="rcr-pamount">$10,000</div>
                <div className="rcr-pper">per full-time hire</div>
                <div className="rcr-pwhen">Due only on hire</div>
                <ul>
                  <li>3 to 5 vetted AI-native operators or engineers</li>
                  <li>Each candidate ships builds, not just prompts</li>
                  <li>Full portfolios, bios, and references</li>
                  <li>Engineering, ops, GTM, design, product, finance</li>
                  <li>Dedicated talent partner from post to hire</li>
                </ul>
                <a className="rcr-btn rcr-btn-primary" href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=pricing&role=ft`} target="_blank" rel="noopener noreferrer">Post a full-time role</a>
              </div>
            </div>
            <div className="rcr-pnote"><b>$0 due upfront.</b> Pay only when a candidate accepts your offer.</div>
          </div>
        </section>

        {/* ===== WHY AI-NATIVE WINS ===== */}
        <section className="rcr-section rcr-why">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">Why AI-native talent</span>
            <h2 className="rcr-section-title">One AI-native hire is worth two of everyone else.</h2>
            <p className="rcr-section-sub">It&rsquo;s not a productivity bump. It&rsquo;s a category shift. The best teams are smaller, leaner, and built around people who treat AI as a force multiplier.</p>
            <div className="rcr-why-grid">
              <div className="rcr-wcard">
                <div className="rcr-wnum">01</div>
                <h3>Smaller teams, more output</h3>
                <p>One AI-native operator can do the work that took a three-person team last year. Headcount goes down. Throughput goes up.</p>
              </div>
              <div className="rcr-wcard">
                <div className="rcr-wnum">02</div>
                <h3>Ship faster from day one</h3>
                <p>No 90-day ramp. AI-native hires bring their own automations on day one and start cutting cycle times in week one.</p>
              </div>
              <div className="rcr-wcard">
                <div className="rcr-wnum">03</div>
                <h3>Force-multiplier on the team</h3>
                <p>They pull the rest of the team up. Other folks start using their workflows. Your AI maturity rises across the org.</p>
              </div>
              <div className="rcr-wcard">
                <div className="rcr-wnum">04</div>
                <h3>Compounding leverage</h3>
                <p>Every workflow they build keeps working after they&rsquo;re done. You&rsquo;re not just hiring a person, you&rsquo;re hiring a library of systems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== QUALIFICATION BAR ===== */}
        <section className="rcr-section rcr-qual">
          <div className="rcr-section-container">
            <div className="rcr-qual-grid">
              <div className="rcr-qual-left">
                <span className="rcr-qual-eyebrow">What &ldquo;AI-native&rdquo; means at Leland</span>
                <h2>Every candidate is vetted on what they&rsquo;ve shipped, not what they claim.</h2>
                <p>&ldquo;AI-native&rdquo; is overused. Here&rsquo;s our bar: real builds, real tools, real references. If a candidate hasn&rsquo;t shipped, they don&rsquo;t make our shortlist.</p>
              </div>
              <div className="rcr-qual-list">
                <div className="rcr-qrow"><b>01</b><span>Completed Leland&rsquo;s AI Builder Program or an equivalent track of shipped builds</span></div>
                <div className="rcr-qrow"><b>02</b><span>Has a portfolio of at least 5 working agents, automations, or AI tools used in real work</span></div>
                <div className="rcr-qrow"><b>03</b><span>Uses Cursor, Claude, n8n, or similar daily as their primary work environment</span></div>
                <div className="rcr-qrow"><b>04</b><span>Vetted by Leland instructors who reviewed their builds and methodology</span></div>
                <div className="rcr-qrow"><b>05</b><span>References from real automation work, not just AI-curious side projects</span></div>
                <div className="rcr-qrow"><b>06</b><span>Ready to ship in your stack, even when your IT policy is still catching up</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="rcr-section rcr-testi">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">What hiring managers say</span>
            <h2 className="rcr-section-title">The hire pays for itself in weeks.</h2>
            <div className="rcr-testi-grid">
              <div className="rcr-tcard">
                <p className="rcr-tquote">&ldquo;We hired an ops builder from the Leland network. By week three, she had automated three of our highest-volume processes. We&rsquo;re hiring a second one next quarter.&rdquo;</p>
                <div className="rcr-twho">
                  <div className="rcr-tavatar">JM</div>
                  <div><div className="rcr-tname">Jenna M.</div><div className="rcr-trole">COO, Series B SaaS</div></div>
                </div>
              </div>
              <div className="rcr-tcard">
                <p className="rcr-tquote">&ldquo;Our last two engineering hires from the regular pipeline took 6 months to onboard. The AI-native engineer Leland sent us shipped a production agent in week one.&rdquo;</p>
                <div className="rcr-twho">
                  <div className="rcr-tavatar">DR</div>
                  <div><div className="rcr-tname">David R.</div><div className="rcr-trole">CTO, Series A Fintech</div></div>
                </div>
              </div>
              <div className="rcr-tcard">
                <p className="rcr-tquote">&ldquo;Pay-on-hire was the only way I&rsquo;d take a chance on a new sourcing channel. Got a great GTM engineer for less than half what we usually pay recruiters.&rdquo;</p>
                <div className="rcr-twho">
                  <div className="rcr-tavatar">SK</div>
                  <div><div className="rcr-tname">Sarah K.</div><div className="rcr-trole">Head of Growth, Bootstrapped</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="rcr-section rcr-faq" id="faq">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">FAQ</span>
            <h2 className="rcr-section-title">Common questions from hiring managers.</h2>
            <div className="rcr-faq-list">
              {FAQ_DATA.map((item, i) => (
                <div key={i} className={`rcr-faq-item${openFaq === i ? ' rcr-faq-open' : ''}`}>
                  <div className="rcr-faq-summary" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {item.q}
                    <span className="rcr-faq-plus">+</span>
                  </div>
                  <div className="rcr-faq-body">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="rcr-section rcr-final">
          <div className="rcr-final-inner">
            <h2>Post your role. <span className="rcr-accent">Pay nothing until you hire.</span></h2>
            <p>Three minutes to post. Three business days to a shortlist. Zero dollars due unless a candidate accepts your offer.</p>
            <div className="rcr-final-cta-row">
              <a className="rcr-btn rcr-btn-primary" href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=final_cta`} target="_blank" rel="noopener noreferrer">Just get started</a>
              <a className="rcr-btn rcr-btn-secondary" href="#how">How it works</a>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="rcr-footer">
        <div className="rcr-footer-inner">
          <div className="rcr-footer-mark" aria-label="Leland">
            {LELAND_ICON_WHITE}
          </div>
          <div className="rcr-footer-links">
            <a href="https://intercom.help/leland-help-center/en/" target="_blank" rel="noopener noreferrer">Contact Us</a>
            <a href="https://www.joinleland.com/legal/terms" target="_blank" rel="noopener noreferrer">Terms</a>
            <a href="https://www.joinleland.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
          </div>
          <div className="rcr-footer-copy">&copy; 2026 Leland</div>
        </div>
      </footer>
    </>
  )
}
