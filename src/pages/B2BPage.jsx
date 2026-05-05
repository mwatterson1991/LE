import '../b2b.css'
import React, { useState } from 'react'

const CALENDLY_URL = 'https://calendly.com/d/cyhb-yjg-33f/leland-ai-transformation'
const BASE = import.meta.env.BASE_URL

const LOGOS = {
  linkedin:  'https://pub-5ef36b3d06e14b75a428ccf72331240d.r2.dev/organization-logos/square%20logos/LinkedIn.png',
  mckinsey:  'https://pub-5ef36b3d06e14b75a428ccf72331240d.r2.dev/organization-logos/square%20logos/McKinsey_%26_Company.png',
  bcg:       'https://pub-5ef36b3d06e14b75a428ccf72331240d.r2.dev/organization-logos/square%20logos/Boston_Consulting_Group.png',
  deloitte:  'https://pub-5ef36b3d06e14b75a428ccf72331240d.r2.dev/organization-logos/square%20logos/Deloitte.png',
}

const WAVING_IMG = `${BASE}assets/images/woman-video-call-waving.jpg`

const courseCards = [
  { num: '01', name: 'Use AI to 10x Your Impact',         tagline: 'Create AI tools and automations that amplify your impact at work.',        thumb: 'thumbnail-level1.png', url: '/level-1', cohort: 'April 21, 2026' },
  { num: '02', name: 'Build Agents That Work for You',    tagline: 'Ship autonomous agents that handle real work tasks end-to-end.',            thumb: 'thumbnail-level2.png', url: '/level-2', cohort: 'April 21, 2026' },
  { num: '03', name: 'Create Autonomous Systems', tagline: 'Build automations that operate as a unified, autonomous system.',           thumb: 'thumbnail-level3.png', url: '/level-3', cohort: 'May 19, 2026'   },
  { num: '04', name: 'Design Multi-Agent Systems',        tagline: 'Orchestrate multiple agents that communicate and collaborate.',             thumb: 'thumbnail-level4.png', url: '/level-4', cohort: 'June 16, 2026'  },
  { num: '05', name: 'Ship AI Systems That Scale',        tagline: 'Build production AI systems that proactively iterate toward goals.',        thumb: 'thumbnail-level5.png', url: '/level-5', cohort: 'July 14, 2026'  },
]

const ChevronIcon = () => (
  <svg className="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

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
      a: 'Our offerings are tool-agnostic. We cover the major platforms — Claude, ChatGPT, Copilot, and others — so employees apply what they learn regardless of what your organization has approved. The focus is on transferable skills, not one vendor\'s ecosystem.',
    },
    {
      q: 'Can\'t we just train employees internally?',
      a: 'In most organizations, the people who know AI best don\'t have time to train others, and informal training typically doesn\'t scale beyond more than a few people. Leland\'s offerings can help you deploy training that works for everyone across your entire organization.',
    },
    {
      q: 'How is this different from async courses or one-off workshops?',
      a: 'Async courses have low completion and no accountability. One-off workshops are surface-level with no follow-through. AI Builder is a live cohort: two 90-minute sessions per week for three weeks, with office hours and hands-on assignments applied to employees\' actual workflows. Participants build something real, not just take notes.',
    },
    {
      q: 'What\'s the time commitment per employee?',
      a: 'It depends on the offering. For live courses, employees attend sessions and apply what they learn to their own workflows — typically 5 to 25 hours of engagement per level depending on how deeply they engage. If they can\'t attend a session live, recordings are available. We recommend employees invest meaningfully in the experience to see real results.',
    },
    {
      q: 'How quickly can we get started?',
      a: 'Quickly. We have live training courses starting every month, and our coaches have wide availability in the near term. Most teams can get started with training within days of a conversation with our team.',
    },
    {
      q: 'What does implementation support look like?',
      a: 'Every team gets a dedicated customer success manager who handles scheduling, participant onboarding, and progress tracking. We provide engagement reporting so you can see completion rates and output quality across your cohort.',
    },
    {
      q: 'What will employees walk away with?',
      a: 'Working tools and automations — not just notes. Whether employees engage through coaching, live courses, or a combination, each participant walks away having built multiple things they can use at work right away: prompt systems, research workflows, content automations, or autonomous agents depending on their focus.',
    },
    {
      q: 'Which AI tools does my team need to have?',
      a: 'Our offerings are tool-agnostic. Whether your team is using ChatGPT, Claude, Gemini, or something else, they can apply what they learn right away. For live courses, we use the terminal and workflow builders, with multiple tool options available so employees aren\'t locked into one platform. The focus is on building transferable skills that work regardless of what your org has approved.',
    },
    {
      q: 'What if we can\'t connect all our tools before starting?',
      a: 'That\'s not a blocker. A core part of what we teach is how to build effective AI workflows even within your current constraints — including how to work with data safely without live system connections. We also provide a demo environment anyone can use to practice concepts that may not be available in their real work setup yet. Your team can start building and getting value immediately while the rest of the org\'s approvals catch up.',
    },
  ]

  return (
    <>
      {/* ====== NAV ====== */}
      <nav>
        <div className="container">
          <a href="https://www.joinleland.com" className="logo">
            <img src={`${BASE}assets/logo-white.svg`} alt="Leland" style={{ height: 22, width: 'auto' }} />
          </a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ textTransform: 'uppercase', borderRadius: '4px', fontSize: '12px' }}>
            Talk with Our Team &rarr;
          </a>
        </div>
      </nav>

      {/* ====== HERO — dark, bg image ====== */}
      <section className="b2b-hero b2b-hero-bg">
        <div className="b2b-hero-overlay" />
        <div className="container b2b-hero-content-wrap">
          <span className="b2b-eyebrow b2b-label-on-dark">AI SOLUTIONS FOR TEAMS</span>
          <h1 className="b2b-hero-headline b2b-hero-headline-light">Accelerate your<br />business with AI</h1>
          <p className="b2b-hero-sub b2b-hero-sub-light">
            Leland helps organizations move faster on AI. From strategy to execution, we co-create tailored solutions to upskill teams, build agents, and transform workflows.
          </p>
          <div className="b2b-hero-ctas">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
              className="btn btn-primary btn-lg" style={{ textTransform: 'uppercase' }}>
              Learn More <span className="arrow">&rarr;</span>
            </a>
            <a href="/" className="b2b-hero-secondary-link b2b-hero-secondary-link-light">
              For individuals &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ====== WHAT WE OFFER — dark ====== */}
      <section className="b2b-offerings b2b-offerings-dark">
        <div className="container">
          <span className="b2b-section-label b2b-label-on-dark">What we offer</span>
          <h2 className="b2b-section-headline b2b-headline-on-dark">Everything your organization needs to lead with AI</h2>
          <div className="b2b-solution-cards">
            <div className="b2b-solution-card">
              <div className="b2b-solution-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3 className="b2b-solution-title">AI Strategy &amp; Transformation</h3>
              <p className="b2b-solution-body">Identify where and how you want your company to be enabled with AI.</p>
            </div>
            <div className="b2b-solution-card">
              <div className="b2b-solution-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h3 className="b2b-solution-title">AI Upskilling &amp; Workforce Enablement</h3>
              <p className="b2b-solution-body">Don't just teach AI. Get your employees building automations, agents, and more with it.</p>
            </div>
            <div className="b2b-solution-card">
              <div className="b2b-solution-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <h3 className="b2b-solution-title">AI Agent &amp; Workflow Automation Services</h3>
              <p className="b2b-solution-body">Work with world-class AI experts to build custom solutions for your team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CREDIBILITY — light ====== */}
      <section className="b2b-value-props">
        <div className="container">
          <div className="b2b-vp-grid">
            <div className="b2b-vp-left">
              <span className="b2b-section-label b2b-label-on-light">Your AI transformation partner</span>
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
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary btn-lg" style={{ textTransform: 'uppercase' }}>
                  Learn More <span className="arrow">&rarr;</span>
                </a>
              </div>
            </div>
            <div className="b2b-vp-right">
              <img src={WAVING_IMG} alt="AI training session" className="b2b-vp-photo" />
            </div>
          </div>
        </div>
      </section>

      {/* ====== HOW WE'LL SUPPORT YOU — dark ====== */}
      <section className="b2b-process b2b-process-dark">
        <div className="container">
          <span className="b2b-section-label b2b-label-on-dark">How we'll support you</span>
          <h2 className="b2b-section-headline b2b-headline-on-dark">A results-driven approach to AI training</h2>
          <p className="b2b-section-sub b2b-sub-on-dark">Invest in AI training that delivers results at scale.</p>
          <div className="b2b-steps b2b-steps-4">
            <div className="b2b-step b2b-step-block">
              <h3 className="b2b-step-title-lg">Identify your organization's needs</h3>
            </div>
            <div className="b2b-step-arrow-icon b2b-step-arrow-accent">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="b2b-step b2b-step-block">
              <h3 className="b2b-step-title-lg">Align on a transformation plan</h3>
            </div>
            <div className="b2b-step-arrow-icon b2b-step-arrow-accent">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="b2b-step b2b-step-block">
              <h3 className="b2b-step-title-lg">Implement tailored AI solutions</h3>
            </div>
            <div className="b2b-step-arrow-icon b2b-step-arrow-accent">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="b2b-step b2b-step-block">
              <h3 className="b2b-step-title-lg">Measure and assess<br/>impact</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ====== LIVE COURSES — light ====== */}
      <section className="b2b-courses">
        <div className="container">
          <span className="b2b-section-label b2b-label-on-light">Live courses</span>
          <h2 className="b2b-section-headline">Teach at scale with Leland's AI Builder Program</h2>
          <div className="b2b-track-cards">
            {courseCards.map((c) => (
              <a key={c.num} href={c.url} className="b2b-track-card">
                <img src={`${BASE}assets/thumbnails/${c.thumb}`} alt={c.name} className="b2b-track-thumb" />
                <div className="b2b-track-body">
                  <div className="b2b-track-meta-row">
                    <span className="b2b-track-level">LEVEL {c.num}</span>
                    <span className="b2b-track-badge">LIVE · 6 SESSIONS</span>
                  </div>
                  <h3 className="b2b-track-name">{c.name}</h3>
                  <p className="b2b-track-tagline">{c.tagline}</p>
                  <div className="b2b-track-footer">
                    <div>
                      <span className="b2b-track-cohort-label">NEXT COHORT</span>
                      <span className="b2b-track-cohort-date">{c.cohort}</span>
                    </div>
                    <span className="b2b-track-arrow">&rarr;</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="b2b-courses-cta">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
              className="btn btn-primary btn-lg" style={{ textTransform: 'uppercase' }}>
              Learn More <span className="arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ====== SOCIAL PROOF — black ====== */}
      <section className="testimonials-new" style={{ background: '#000' }}>
        <div className="container">
          <div className="testimonials-stars-lg">
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" style={{ width: 28, height: 28, color: 'var(--accent)' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <div className="testimonials-review-count">
            <span className="testimonials-review-number">26,132 reviews</span>
            <span className="testimonials-review-community">in the Leland community</span>
          </div>
          <h2 className="testimonials-headline">Proven to transform how your team works</h2>
          <div className="testimonials-grid testimonials-grid-6">
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;This course changed my workflow completely. I went from spending hours on repetitive tasks to having AI handle them in minutes. My team keeps asking how I'm getting so much done.&rdquo;</p>
              <span className="testimonial-author">Angela S.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;I was skeptical that a 3-week course could actually change how I work. By session two, I had already built an automation that saved me 3 hours a week. By the end, I had five.&rdquo;</p>
              <span className="testimonial-author">Hannah P.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;The hands-on approach is what sets this apart. Every session ended with something I could use at work the next day. Not theory, not slides, actual tools I still use months later.&rdquo;</p>
              <span className="testimonial-author">Tyler G.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;AI used to feel overwhelming and too complicated. This course broke it down in a way that finally made sense. I walked away with real tools I use every day.&rdquo;</p>
              <span className="testimonial-author">Chimerika A.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;You couldn't make this box long enough for me to describe what I got out of this program. The live instruction, the hands-on projects, the community. It completely changed how I work.&rdquo;</p>
              <span className="testimonial-author">Christina G.</span>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">&ldquo;From learning how to prompt, vibe coding an app, to building AI agents, this series took me from curious to competent in weeks. Best investment in my career this year.&rdquo;</p>
              <span className="testimonial-author">Caroline D.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FAQ — light ====== */}
      <section className="b2b-faq">
        <div className="container">
          <h2 className="b2b-faq-headline">Frequently asked questions</h2>
          <div className="faq-grid b2b-faq-single-col">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} index={i}
                open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOOTER CTA — dark ====== */}
      <section className="b2b-footer-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="b2b-footer-cta-headline">Get started today.</h2>
          <p className="b2b-footer-cta-sub">Tell us where your team is at, and we'll guide you on what to do next.</p>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
            className="btn btn-primary btn-lg" style={{ textTransform: 'uppercase' }}>
            Talk with Our Team <span className="arrow">&rarr;</span>
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
