import React, { useEffect } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Faq from '../components/Faq'
import './home-rebrand.css'
import './leland-ai.css'
import './recruit.css'

const TYPEFORM_BASE = 'https://joinleland.typeform.com/to/e8vrfV80'

const FAQ_DATA = [
  { q: 'How does it work?', a: 'Set up a call with our team. We learn who you need and what success looks like, figure out who would be the right fit from our network, and introduce you to candidates who match. You only pay if you hire one.' },
  { q: 'When do I actually pay?', a: 'You pay the placement fee when a candidate we introduced accepts your offer and signs an employment agreement. Net 30 from start date. Nothing is due upfront, and nothing is due if you don\u2019t hire anyone.' },
  { q: 'What counts as a \u201chire\u201d?', a: 'Any candidate we introduced to you who accepts a full-time, part-time, or intern role at your company within 12 months of the introduction. If they end up in a different role than the one you came to us for, it still counts.' },
  { q: 'What roles work best?', a: 'Roles where AI fluency is a real lever: ops, growth, marketing, finance, product, design, and engineering. Anywhere \u201cdoing more with less\u201d is the goal. We work across senior IC and manager levels.' },
  { q: 'Do you handle visas or international hires?', a: 'Yes, but we flag visa or location constraints upfront so you don\u2019t waste time. Most candidates are US-based and remote-friendly. We can source globally for fully remote roles.' },
]

const BREADTH = [
  {
    label: 'Industries',
    items: ['SaaS & tech', 'Financial services', 'Healthcare', 'Manufacturing', 'Professional services', 'E-commerce & retail', 'Media & marketing', 'Nonprofits'],
  },
  {
    label: 'Experience levels',
    items: ['Interns', 'Early career', 'Senior ICs', 'Managers', 'Directors', 'Fractional & advisory'],
  },
  {
    label: 'Roles',
    items: ['Operations', 'Growth & marketing', 'Sales & RevOps', 'Finance & accounting', 'Product', 'Design', 'Engineering', 'Data & analytics', 'Customer success'],
  },
]

export default function RecruitPage() {
  useEffect(() => {
    document.title = 'Hire AI-Native Talent | Leland'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  return (
    <>
      <Nav variant="light" />

      <main>
        {/* ===== HERO ===== */}
        <section className="rcr-hero">
          <div className="rcr-hero-inner">
            <h1>Hire AI-native builders and <span className="rcr-accent">watch your company transform.</span></h1>
            <p className="rcr-lead">There&rsquo;s a network of thousands of AI-native operators we&rsquo;ve trained and vetted. Tell us who you need and we&rsquo;ll introduce you to the ones who fit.</p>
            <div className="rcr-hero-cta">
              <a className="rcr-btn rcr-btn-primary" href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=hero`} target="_blank" rel="noopener noreferrer">Get started</a>
              <a className="rcr-btn rcr-btn-secondary" href="#how">How it works</a>
            </div>
          </div>
        </section>

        {/* ===== STAT BAND (image) ===== */}
        <section className="rcr-statband-section">
          <div
            className="rcr-statband"
            style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.2) 100%), url(${import.meta.env.BASE_URL}assets/images/HireTalent.png)` }}
          >
            <div className="rcr-statband-inner">
              <h2><span className="rcr-statband-num">91%</span> of organizations say hiring people with AI skills is a priority in 2026.</h2>
              <span className="rcr-statband-source">Infragistics 2026 IT Talent Survey</span>
              <p className="rcr-statband-sub">Leland has built a network of thousands of AI-powered operators, from interns to experienced leaders. Let us help you build your AI-native team.</p>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="rcr-section rcr-howitworks" id="how">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">How it works</span>
            <h2 className="rcr-section-title">Three steps. No risk until they&rsquo;re hired.</h2>
            <p className="rcr-section-sub">Set up a call, get a shortlist, only pay if someone accepts.</p>
            <div className="rcr-steps">
              <div className="rcr-step">
                <div className="rcr-step-num">Step 01</div>
                <h3>Tell us who you need</h3>
                <p>Set up a quick call so we can learn more about the role, experience level, and background you are looking for.</p>
                <span className="rcr-pill">Quick intro call</span>
              </div>
              <div className="rcr-step">
                <div className="rcr-step-num">Step 02</div>
                <h3>We bring you candidates</h3>
                <p>We match you with high-quality AI-native candidates that fit what you are looking for.</p>
                <span className="rcr-pill">3 business days</span>
              </div>
              <div className="rcr-step">
                <div className="rcr-step-num">Step 03</div>
                <h3>Pay only when you hire</h3>
                <p>Interview, decide, and extend an offer on your timeline. Pay 10% of first-year salary per full-time hire, or $5,000 per intern. Nothing if you don&rsquo;t hire.</p>
                <span className="rcr-pill">$0 due upfront</span>
              </div>
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
                  <li><span className="rcr-vicon">{'✓'}</span><span>Ships agents and automations that handle real work end-to-end</span></li>
                  <li><span className="rcr-vicon">{'✓'}</span><span>Lives in Cursor, Claude Code, n8n, and a custom stack</span></li>
                  <li><span className="rcr-vicon">{'✓'}</span><span>Treats AI as a force multiplier on what one person can do</span></li>
                  <li><span className="rcr-vicon">{'✓'}</span><span>One AI-native hire can do the work of a small team</span></li>
                </ul>
              </div>
            </div>
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

        {/* ===== WHY LELAND / BREADTH ===== */}
        <section className="rcr-section rcr-breadth">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">Why Leland</span>
            <h2 className="rcr-section-title">Hire from a community of 8 million people learning AI.</h2>
            <p className="rcr-section-sub">Leland is where people come to get AI-native. We&rsquo;ve trained and vetted thousands of operators and engineers from that community, across every industry, experience level, and role.</p>
            <div className="rcr-breadth-stats">
              <div className="rcr-bstat"><div className="rcr-bstat-num">8M+</div><div className="rcr-bstat-label">people learning AI on Leland</div></div>
              <div className="rcr-bstat"><div className="rcr-bstat-num">Vetted</div><div className="rcr-bstat-label">on real builds, not resumes</div></div>
              <div className="rcr-bstat"><div className="rcr-bstat-num">Every function</div><div className="rcr-bstat-label">ops, GTM, finance, product, design, engineering</div></div>
            </div>
            <div className="rcr-breadth-grid">
              {BREADTH.map((col) => (
                <div className="rcr-breadth-col" key={col.label}>
                  <div className="rcr-breadth-label">{col.label}</div>
                  <div className="rcr-breadth-chips">
                    {col.items.map((item) => (
                      <span className="rcr-breadth-chip" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className="rcr-section rcr-pricing-section" id="pricing">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">Pricing</span>
            <h2 className="rcr-section-title">Simple, success-based pricing.</h2>
            <p className="rcr-section-sub">No retainers. No sourcing fees. No monthly minimums. You pay one fee when a candidate accepts your offer.</p>
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
                <a className="rcr-btn rcr-btn-secondary" href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=pricing&role=intern`} target="_blank" rel="noopener noreferrer">Get started</a>
              </div>
              <div className="rcr-pcard rcr-featured">
                <span className="rcr-ptag">Most common</span>
                <div className="rcr-pname">Full-time</div>
                <div className="rcr-pamount">10%</div>
                <div className="rcr-pper">of first-year salary, per hire</div>
                <div className="rcr-pwhen">Due only on hire</div>
                <ul>
                  <li>3 to 5 vetted AI-native operators or engineers</li>
                  <li>Each candidate ships builds, not just prompts</li>
                  <li>Full portfolios, bios, and references</li>
                  <li>Engineering, ops, GTM, design, product, finance</li>
                  <li>Dedicated talent partner from first call to hire</li>
                </ul>
                <a className="rcr-btn rcr-btn-primary" href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=pricing&role=ft`} target="_blank" rel="noopener noreferrer">Get started</a>
              </div>
            </div>
            <div className="rcr-pnote"><b>$0 due upfront.</b> Pay only when a candidate accepts your offer.</div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="rcr-section rcr-faq" id="faq">
          <div className="rcr-section-container">
            <span className="rcr-eyebrow">FAQ</span>
            <h2 className="rcr-section-title">Common questions from hiring managers.</h2>
            <Faq items={FAQ_DATA} />
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="rcr-section rcr-final">
          <div className="rcr-final-inner">
            <h2>Start your hiring process. <span className="rcr-accent">Pay nothing until you hire.</span></h2>
            <p>One quick call to start. Three business days to a shortlist. Zero dollars due unless a candidate accepts your offer.</p>
            <div className="rcr-final-cta-row">
              <a className="rcr-btn rcr-btn-primary" href={`${TYPEFORM_BASE}?utm_source=hire_lp&utm_medium=final_cta`} target="_blank" rel="noopener noreferrer">Get started</a>
              <a className="rcr-btn rcr-btn-secondary" href="#how">How it works</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
