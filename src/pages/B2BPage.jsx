import React, { useState } from 'react'

const CALENDLY_URL = 'https://calendly.com/d/cyhb-yjg-33f/leland-ai-transformation'
const HERO_IMG = `${import.meta.env.BASE_URL}assets/images/team-conference.jpg`
const WAVING_IMG = `${import.meta.env.BASE_URL}assets/images/woman-video-call-waving.jpg`

/* ─── Icons ─── */
const ChevronIcon = () => (
  <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

/* ─── FAQ accordion ─── */
function FaqItem({ question, answer, index, open, onToggle }) {
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={onToggle}>
      <span className="faq-index">{String(index + 1).padStart(2, '0')}</span>
      <div className="faq-body">
        <div className="faq-q">
          <h3>{question}</h3>
          <ChevronIcon />
        </div>
        <div className="faq-a">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function B2BPage() {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      q: 'Will our company\'s data be safe?',
      a: 'Yes. The program is designed with enterprise security in mind. Instructors teach your team how to sanitize data and set up real workflows without requiring IT-approved plug-ins or direct system connections. Employees learn to work productively with AI even while your organization\'s formal approval processes are still underway.',
    },
    {
      q: 'What tools does the program cover?',
      a: 'AI Builder is tool-agnostic. We cover the major platforms: Claude, ChatGPT, Copilot, and others, so employees apply what they learn regardless of what your organization has approved. The focus is on transferable skills, not one vendor\'s ecosystem.',
    },
    {
      q: 'Can\'t we just train employees internally?',
      a: 'Some organizations can, particularly if you have technical leadership with time to teach everyone else. But in most companies, the people who know AI best are too busy to train others, and informal knowledge-sharing doesn\'t scale past 20-30 people. AI Builder gives your team a structured path so internal experts can stay focused on their own work.',
    },
    {
      q: 'How is this different from async courses or one-off workshops?',
      a: 'Async courses have low completion and no accountability. One-off workshops are surface-level with no follow-through. AI Builder is a live cohort: two 90-minute sessions per week for three weeks, with office hours and hands-on assignments applied to employees\' actual workflows. Participants build something real, not just take notes.',
    },
    {
      q: 'What results do teams typically see?',
      a: 'Level 1 graduates typically save 5-10 hours per week on tasks they previously did manually. Teams with AI-fluent employees report faster output cycles, reduced reliance on external agencies for content and research, and faster decision-making. We track completion rates and deliverable quality across every cohort.',
    },
    {
      q: 'What\'s the time commitment per employee?',
      a: 'Three hours per week of live sessions, plus time applying what they learn to their own workflows. Each level runs for three weeks. It\'s designed to fit alongside a full-time role.',
    },
    {
      q: 'What if different team members are at different skill levels?',
      a: 'Each level is independent. Someone just getting started goes into Level 1; a colleague already automating workflows might start at Level 2 or 3. Everyone progresses at the pace that makes sense for them, and teams can run multiple levels in parallel.',
    },
    {
      q: 'How quickly can we get started?',
      a: 'Most teams are up and running within two to three weeks of initial conversation. We scope the program, align on a cohort schedule, and handle onboarding. Talk to our team to get a timeline specific to your organization.',
    },
    {
      q: 'What does implementation support look like?',
      a: 'Every team gets a dedicated customer success manager who handles scheduling, participant onboarding, and progress tracking. We provide engagement reporting so you can see completion rates and output quality across your cohort.',
    },
    {
      q: 'What will employees actually walk away with?',
      a: 'Working automations, not just knowledge. By the end of each level, every participant has built something they use at work every day: prompt systems, research workflows, content automations, or autonomous agents depending on the level.',
    },
  ]

  const roles = [
    {
      role: 'Marketing',
      outcomes: ['Content brief automation', 'Brand voice system', 'Competitive intelligence workflow'],
    },
    {
      role: 'Finance',
      outcomes: ['Reporting automation', 'Data-to-insight workflow'],
    },
    {
      role: 'Operations',
      outcomes: ['Recurring status update workflow', 'Vendor comms processing'],
    },
    {
      role: 'HR',
      outcomes: ['Screening workflow', 'Onboarding automation', 'Template system'],
    },
    {
      role: 'Strategy',
      outcomes: ['Research synthesis workflow', 'Competitive intelligence monitoring'],
    },
    {
      role: 'Product',
      outcomes: ['User research synthesis', 'Spec-writing system'],
    },
  ]

  return (
    <>
      {/* ====== NAV ====== */}
      <nav>
        <div className="container">
          <a href="https://www.joinleland.com" className="logo">
            <img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" style={{ height: 22, width: 'auto' }} />
          </a>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ textTransform: 'uppercase', borderRadius: '4px', fontSize: '12px' }}
          >
            Talk to Our Team &rarr;
          </a>
        </div>
      </nav>

      {/* ====== HERO ====== */}
      <section className="b2b-hero">
        <div className="container">
          <div className="b2b-hero-content">
            <span className="b2b-eyebrow">AI SOLUTIONS FOR TEAMS</span>
            <h1 className="b2b-hero-headline">Accelerate your business with AI</h1>
            <p className="b2b-hero-sub">
              Leland helps organizations move faster on AI. From strategy to execution, we'll co-create tailored solutions to upskill teams, build agents, and transform workflows.
            </p>
            <div className="b2b-hero-ctas">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ textTransform: 'uppercase' }}
              >
                Learn More <span className="arrow">&rarr;</span>
              </a>
              <a href="/" className="b2b-hero-secondary-link">
                For individuals &rarr;
              </a>
            </div>
          </div>
          <div className="b2b-hero-image">
            <img src={HERO_IMG} alt="Team in conference meeting" className="b2b-hero-stock-img" />
          </div>
        </div>
      </section>

      {/* ====== TRUST BAR ====== */}
      <div className="b2b-trust-bar">
        <div className="container">
          <span className="b2b-trust-label">Trusted by teams at:</span>
          <div className="b2b-trust-logos">
            <span className="b2b-trust-logo-text">LinkedIn Premium</span>
            <span className="b2b-trust-divider">/</span>
            <span className="b2b-trust-logo-text">McKinsey &amp; Company</span>
            <span className="b2b-trust-divider">/</span>
            <span className="b2b-trust-logo-text">BCG</span>
            <span className="b2b-trust-divider">/</span>
            <span className="b2b-trust-logo-text">Deloitte</span>
          </div>
        </div>
      </div>

      {/* ====== WHAT WE OFFER ====== */}
      <section className="b2b-offerings">
        <div className="container">
          <span className="b2b-section-label">What we offer</span>
          <h2 className="b2b-section-headline">Everything your organization needs to lead with AI</h2>
          <div className="b2b-solution-cards">
            <div className="b2b-solution-card">
              <h3 className="b2b-solution-title">AI Strategy &amp; Transformation</h3>
              <p className="b2b-solution-body">Identify where and how you want your company to be enabled with AI.</p>
            </div>
            <div className="b2b-solution-card">
              <h3 className="b2b-solution-title">AI Upskilling &amp; Workforce Enablement</h3>
              <p className="b2b-solution-body">Don't just teach AI. Get your employees building automations, agents, and more with it.</p>
            </div>
            <div className="b2b-solution-card">
              <h3 className="b2b-solution-title">AI Agent &amp; Workflow Automation Services</h3>
              <p className="b2b-solution-body">Work with world-class AI experts to build custom solutions for your team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CREDIBILITY ====== */}
      <section className="b2b-value-props">
        <div className="container">
          <div className="b2b-vp-grid">
            <div className="b2b-vp-left">
              <span className="b2b-section-label">Your AI transformation partner</span>
              <h2 className="b2b-vp-headline">Built by AI Experts, Designed for Every Team</h2>
              <div className="b2b-vp-items">
                <div className="b2b-vp-item">
                  <div className="b2b-vp-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  </div>
                  <div>
                    <h3>The largest network of AI experts</h3>
                    <p>Access thousands of vetted AI practitioners, from engineers at top AI labs to operators who've deployed AI across sales, marketing, finance, and beyond.</p>
                  </div>
                </div>
                <div className="b2b-vp-item">
                  <div className="b2b-vp-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  </div>
                  <div>
                    <h3>Training that scales to every team</h3>
                    <p>Live bootcamps, daily events, 5,000+ self-study resources, and role-specific AI courses ensure every employee levels up, regardless of technical background.</p>
                  </div>
                </div>
                <div className="b2b-vp-item">
                  <div className="b2b-vp-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  </div>
                  <div>
                    <h3>End-to-end program management</h3>
                    <p>Dedicated customer success manager, full implementation support, and engagement reporting so you can measure real business impact.</p>
                  </div>
                </div>
                <div className="b2b-vp-item">
                  <div className="b2b-vp-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <h3>Custom support for your tool and security needs</h3>
                    <p>Get help navigating your specific tools and data security requirements so you can build impactful AI solutions.</p>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 32 }}>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                  style={{ textTransform: 'uppercase' }}
                >
                  Learn More <span className="arrow">&rarr;</span>
                </a>
              </div>
            </div>
            <div className="b2b-vp-right">
              <img src={WAVING_IMG} alt="Person on a video call" className="b2b-vp-photo" />
            </div>
          </div>
        </div>
      </section>

      {/* ====== HOW WE'LL SUPPORT YOU ====== */}
      <section className="b2b-process">
        <div className="container">
          <span className="b2b-section-label">How we'll support you</span>
          <h2 className="b2b-section-headline">A results-driven approach to AI training</h2>
          <p className="b2b-section-sub">Invest in AI training that delivers results at scale.</p>
          <div className="b2b-steps b2b-steps-4">
            <div className="b2b-step">
              <div className="b2b-step-num">01</div>
              <h3 className="b2b-step-title">Identify your organization's needs</h3>
            </div>
            <div className="b2b-step-arrow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="b2b-step">
              <div className="b2b-step-num">02</div>
              <h3 className="b2b-step-title">Align on a transformation plan</h3>
            </div>
            <div className="b2b-step-arrow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="b2b-step">
              <div className="b2b-step-num">03</div>
              <h3 className="b2b-step-title">Implement tailored AI solutions</h3>
            </div>
            <div className="b2b-step-arrow-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="b2b-step">
              <div className="b2b-step-num">04</div>
              <h3 className="b2b-step-title">Measure and assess impact</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIAL ====== */}
      <section className="b2b-testimonial">
        <div className="container">
          <div className="b2b-testimonial-grid">
            <div className="b2b-testimonial-stat">
              <span className="b2b-testimonial-stat-num">1,000+</span>
              <span className="b2b-testimonial-stat-label">AI experts across every function</span>
            </div>
            <div className="b2b-testimonial-quote-block">
              <p className="b2b-testimonial-quote">
                "AI used to feel overwhelming and too complicated. I didn't know much about AI beyond ChatGPT! Now I have an arsenal of tools to use in my day to day. This Bootcamp has helped me become more confident as I further my knowledge and skills in AI."
              </p>
              <span className="b2b-testimonial-name">Christian O.</span>
            </div>
            <div className="b2b-testimonial-description">
              <p>Leland combines expert coaching with hands-on AI training and a comprehensive resource library to help organizations implement AI across every function, from leadership to the front lines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== BUILT FOR YOUR WORK ====== */}
      <section className="b2b-roles">
        <div className="container">
          <span className="b2b-section-label b2b-section-label-light">What your team will build</span>
          <h2 className="b2b-section-headline b2b-section-headline-light">Built for every function across your organization</h2>
          <div className="b2b-role-cards">
            {roles.map((r, i) => (
              <div key={i} className="b2b-role-card">
                <h3 className="b2b-role-title">{r.role}</h3>
                <ul className="b2b-role-outcomes">
                  {r.outcomes.map((o, j) => (
                    <li key={j}>
                      <span className="b2b-role-check">&rarr;</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="b2b-faq">
        <div className="container">
          <h2 className="b2b-faq-headline">Frequently asked questions</h2>
          <div className="faq-grid b2b-faq-single-col">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                question={faq.q}
                answer={faq.a}
                index={i}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOOTER CTA ====== */}
      <section className="b2b-footer-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="b2b-footer-cta-headline">Get started today.</h2>
          <p className="b2b-footer-cta-sub">Tell us where your team is today. We'll tell you what to do next.</p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
            style={{ textTransform: 'uppercase' }}
          >
            Talk to Our Team <span className="arrow">&rarr;</span>
          </a>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer>
        <div className="container">
          <p>&copy; 2026 <a href="https://www.joinleland.com">Leland</a>. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
