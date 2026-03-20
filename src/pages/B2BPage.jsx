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

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
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

  const offerings = [
    {
      label: 'BASIC',
      title: 'Level 1',
      subtitle: 'Use AI to 10x Your Impact',
      details: ['6 live sessions across 3 weeks', 'Prompt systems, research workflows, content automations'],
      bestFor: 'Teams who are AI-aware but haven\'t built anything yet',
      popular: false,
    },
    {
      label: 'FOUNDATION',
      title: 'Levels 1-3',
      subtitle: '3-Course Progression',
      details: ['18 sessions across 9 weeks', 'From foundational use to agents to autonomous systems', 'Ends with team members running agents autonomously'],
      bestFor: 'Most teams, covering the full "chatbot user to AI builder" progression',
      popular: true,
    },
    {
      label: 'FULL PROGRAM',
      title: 'All 5 Levels',
      subtitle: 'Complete AI Builder Certification',
      details: ['30 sessions across 15 weeks', 'Ends with team members designing multi-agent systems', 'Verified AI Builder certification for each participant'],
      bestFor: 'Technical-adjacent teams who want the complete skill set and credential',
      popular: false,
    },
  ]

  const levels = [
    { num: 'LEVEL 01', title: 'Use AI to 10x Your Impact', desc: 'Build AI tools and automations that amplify your impact at work.' },
    { num: 'LEVEL 02', title: 'Build Agents That Work for You', desc: 'Ship autonomous agents that handle real work tasks end-to-end.' },
    { num: 'LEVEL 03', title: 'Create Systems to Run Without You', desc: 'Build automations that operate as a unified, autonomous system.' },
    { num: 'LEVEL 04', title: 'Design Multi-Agent Systems', desc: 'Orchestrate multiple agents that communicate and collaborate.' },
    { num: 'LEVEL 05', title: 'Ship AI Systems That Scale', desc: 'Build production AI systems that proactively iterate toward goals.' },
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
            <span className="b2b-eyebrow">FOR TEAMS</span>
            <h1 className="b2b-hero-headline">Help your team accelerate with AI</h1>
            <p className="b2b-hero-sub">
              Most companies have the tools. Few have the training. AI Builder gives your team a structured path from chatbot users to AI builders in weeks.
            </p>
            <div className="b2b-hero-ctas">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ textTransform: 'uppercase' }}
              >
                Talk to Our Team <span className="arrow">&rarr;</span>
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

      {/* ====== DON'T GET LEFT BEHIND ====== */}
      <section className="b2b-value-props">
        <div className="container">
          <div className="b2b-vp-grid">
            <div className="b2b-vp-left">
              <h2 className="b2b-vp-headline">Don't get left behind. Lead with AI.</h2>
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
              </div>
            </div>
            <div className="b2b-vp-right">
              <img src={WAVING_IMG} alt="Person on a video call" className="b2b-vp-photo" />
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

      {/* ====== 5-LEVEL OVERVIEW ====== */}
      <section className="b2b-levels">
        <div className="container">
          <h2 className="b2b-levels-headline">A 5-bootcamp program to help employees build with AI</h2>
          <div className="b2b-level-list">
            {levels.map((l) => (
              <div key={l.num} className="b2b-level-item">
                <span className="b2b-level-num">{l.num}</span>
                <div className="b2b-level-text">
                  <strong className="b2b-level-title">{l.title}</strong>
                  <span className="b2b-level-desc">{l.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== OFFERINGS ====== */}
      <section className="b2b-offerings">
        <div className="container">
          <span className="b2b-section-label">Program options</span>
          <h2 className="b2b-section-headline">Match the program to where your team is</h2>
          <p className="b2b-section-sub">In our 5-course program, each course builds on the last. We recommend most people start with Level 1 to build a strong foundation.</p>
          <div className="b2b-offering-cards">
            {offerings.map((o, i) => (
              <div key={i} className={`b2b-offering-card${o.popular ? ' b2b-offering-card-featured' : ''}`}>
                {o.popular && <div className="b2b-offering-badge">Most Popular</div>}
                <span className="b2b-offering-tier">{o.label}</span>
                <h3 className="b2b-offering-title">{o.title}</h3>
                <p className="b2b-offering-subtitle">{o.subtitle}</p>
                <ul className="b2b-offering-details">
                  {o.details.map((d, j) => (
                    <li key={j}>
                      <span className="b2b-check"><CheckIcon /></span>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="b2b-offering-best-for">
                  <span className="b2b-best-for-label">Best for:</span> {o.bestFor}
                </div>
              </div>
            ))}
          </div>

          {/* Add-on card */}
          <div className="b2b-addon-card">
            <div className="b2b-addon-label">ADD-ON</div>
            <div className="b2b-addon-content">
              <div className="b2b-addon-left">
                <h3>1:1 AI Coaching</h3>
                <p>Function-specific sessions with expert coaches from ex-OpenAI, Meta, Microsoft, and Google. Matched to each employee's role: marketing, finance, ops, product, strategy, HR.</p>
              </div>
              <div className="b2b-addon-right">
                <div className="b2b-addon-topics">
                  <span>Skills</span>
                  <span>Agents</span>
                  <span>Custom connections</span>
                  <span>Automation</span>
                  <span>Tool-specific workflows</span>
                  <span>Role-specific AI use cases</span>
                </div>
                <p className="b2b-addon-note">Designed to pair with the live course so employees apply skills to their own workflows immediately.</p>
              </div>
            </div>
          </div>

          <div className="b2b-offerings-cta">
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
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="b2b-process">
        <div className="container">
          <span className="b2b-section-label">Our process</span>
          <h2 className="b2b-section-headline">From kickoff to ROI in three weeks</h2>
          <div className="b2b-steps">
            <div className="b2b-step">
              <div className="b2b-step-num">01</div>
              <h3 className="b2b-step-title">Talk to our team</h3>
              <p className="b2b-step-desc">We learn your team's tools, workflows, and security requirements. A 30-minute call is all it takes.</p>
            </div>
            <div className="b2b-step">
              <div className="b2b-step-num">02</div>
              <h3 className="b2b-step-title">We customize the program</h3>
              <p className="b2b-step-desc">Cohort schedule, curriculum focus, custom use cases tailored to your team's actual work.</p>
            </div>
            <div className="b2b-step">
              <div className="b2b-step-num">03</div>
              <h3 className="b2b-step-title">Your team builds and ships</h3>
              <p className="b2b-step-desc">Working workflows by session 6. Participants show up with something they built.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== BUILT FOR YOUR WORK ====== */}
      <section className="b2b-roles">
        <div className="container">
          <span className="b2b-section-label b2b-section-label-light">What your team will build</span>
          <h2 className="b2b-section-headline b2b-section-headline-light">Built for every function, not just tech</h2>
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
          <h2 className="b2b-footer-cta-headline">Ready to build an AI-fluent team?</h2>
          <p className="b2b-footer-cta-sub">Most programs take months to show results. Ours delivers in weeks.</p>
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
