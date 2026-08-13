import React, { useState } from 'react'

const EXPENSE_TEMPLATES = {
  'Marketing': {
    subject: 'Could we expense this? AI training that speeds up our campaigns',
    body: `Hey [Manager],

I'd like to expense the Leland AI Builder Program, a 2-week live cohort program that teaches professionals to build real AI workflows. Here's how it directly applies to our work:

- I'll build a content brief automation that cuts campaign prep from hours to minutes
- I'll create a research workflow that pulls competitive intel on demand, without any manual searching
- I'll set up a reusable AI system tuned to our brand voice so every output sounds like us, not a generic chatbot

The program costs $1,499. Full details: leland.ai/program

Every session ends with a working deliverable. By week three, I'll have tools that directly reduce the time I spend on repetitive tasks, and I can redirect that time toward higher-leverage work.

[Your Name]

P.S. A few people from the same team going through this together is one of the most efficient ways to build shared AI practices. Leland offers team pricing. Happy to discuss if there's interest.`,
  },
  'Finance & Accounting': {
    subject: 'Could we expense this? AI training to cut our reporting time',
    body: `Hey [Manager],

I'd like to expense the Leland AI Builder Program, a 2-week live program for professionals building real AI workflows. Here's what I'll get out of it that applies directly to our team:

- Automate our recurring reporting so it runs without manual input each cycle
- Build an AI-assisted analysis workflow that cuts time from data to insight
- Set up a system that turns unstructured data into clean summaries without reformatting everything by hand

Cost is $1,499. Details: leland.ai/program

I do a lot of this work manually right now. This program builds the tools to do it automatically, not just once, but on a recurring basis. The time savings should pay for the program within the first month.

[Your Name]

P.S. If anyone else on the team would benefit, sending a few people together is the most efficient way to build shared AI workflows. Leland offers team pricing.`,
  },
  'Operations & Supply Chain': {
    subject: 'Could we expense this? AI training to automate manual ops work',
    body: `Hey [Manager],

I'd like to expense the Leland AI Builder Program, a 2-week live program that builds real AI automations for the work you do every day.

A significant part of my week is repetitive, manual, and ripe for automation. Here's what I'll build:

- A workflow that handles recurring status updates and reporting without manual entry
- An AI system to process unstructured inputs (emails, notes, vendor comms) into structured outputs
- Automated documentation that keeps our processes current without extra overhead

Cost is $1,499. Full details: leland.ai/program

Every session ends with a working deliverable. By week three, I'll have tools running in the background that free up hours each week for higher-priority work.

[Your Name]

P.S. This training is most effective when a small team goes through it together. You end up building shared workflows. Happy to talk through whether it makes sense to send a few people.`,
  },
  'HR & People': {
    subject: 'Could we expense this? AI training to speed up hiring and people workflows',
    body: `Hey [Manager],

I'd like to expense the Leland AI Builder Program, a 2-week live cohort that teaches professionals to build real AI workflows. Here's the direct application to my work:

- Build a screening workflow that reduces time-to-shortlist for open roles
- Create an onboarding automation that sends the right resources to the right people at the right time
- Set up a template system for documentation, policies, and comms that cuts drafting time dramatically

Cost is $1,499. Full details: leland.ai/program

Right now I do most of these tasks manually. This program builds tools that handle the recurring parts automatically, so I can focus on the work that requires a human.

[Your Name]

P.S. If we're going to build shared AI practices across the team, it helps to have People leading that conversation. Happy to debrief with the group after.`,
  },
  'Strategy & Corporate Development': {
    subject: 'Could we expense this? AI training to accelerate research and analysis',
    body: `Hey [Manager],

I'd like to expense the Leland AI Builder Program, a 2-week live program that builds real AI skills for knowledge workers. I think the ROI here is direct and fast.

What I'll build that applies to our work:

- A research synthesis workflow that turns large volumes of unstructured information into structured memos, replicable, not one-off
- A competitive intelligence system that monitors and summarizes relevant signals on demand
- An AI-assisted drafting workflow for presentations and analysis that cuts production time significantly

Cost is $1,499. Full details: leland.ai/program

The analysts and operators who move fastest in the next two years will be the ones who build these tools early. This gets me there in three weeks, with working deliverables by session six.

[Your Name]

P.S. If anyone else on the team does research-heavy work, sending two or three people together is the most effective way to build shared workflows. Leland offers team pricing.`,
  },
  'Product & Project Management': {
    subject: 'Could we expense this? AI training to accelerate product work',
    body: `Hey [Manager],

I'd like to expense the Leland AI Builder Program, a 2-week live program that builds real AI skills for knowledge workers.

Here's what I'll build that applies directly to my role:

- A user research synthesis workflow that turns interview notes and feedback into structured themes automatically
- A spec-writing system that gets first drafts out faster and in a consistent format
- An AI assistant tuned to how I write, so status updates, stakeholder comms, and documentation take a fraction of the time

Cost is $1,499. Full details: leland.ai/program

Most of my repetitive writing and synthesis work is something AI can handle. This program builds those workflows so they run reliably, not just when I experiment with prompts.

[Your Name]

P.S. Going through this with others on the team is a good way to build shared AI practices. Happy to discuss team pricing.`,
  },
  'Other': {
    subject: 'Could we expense this? A 2-week AI program with clear ROI',
    body: `Hey [Manager],

I'd like to expense the Leland AI Builder Program, a 2-week live cohort program that teaches professionals to build real AI workflows for their day-to-day work.

Here's why the investment makes sense:

- I'll automate my most repetitive weekly tasks, the ones that currently take hours
- I'll build workflows that reduce manual work across research, drafting, and data handling
- I'll have a working toolkit of AI systems by week three that I use immediately at work

Cost is $1,499. Full details: leland.ai/program

Professionals using AI effectively save an average of 7.5 hours per week. This program gets me there in three weeks with live sessions, a small cohort, and real deliverables each session.

[Your Name]

P.S. If others on the team would benefit, Leland offers team pricing and there's a case for building shared AI practices together.`,
  },
}

export default function GetThisExpensed() {
  const [selected, setSelected] = useState('')
  const [copied, setCopied] = useState(false)

  const template = selected ? EXPENSE_TEMPLATES[selected] : null
  const fullText = template
    ? `Subject: ${template.subject}\n\n${template.body}`
    : ''

  const handleCopy = () => {
    if (!fullText) return
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="expense-section">
      <div className="container">
        <div className="expense-card">
          <span className="expense-rail" aria-hidden="true"></span>
          <p className="expense-eyebrow">
            <svg className="expense-gem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5z" />
              <path d="M10 12l-2 -2.7l.7 -1.3" />
            </svg>
            Pro tip
          </p>
          <h2 className="expense-heading">Ask your company to expense this.</h2>
          <p className="expense-subhead">Most companies cover professional development — even without a formal training budget. Pick your function and we'll help you craft the message.</p>
          <div className="expense-divider" aria-hidden="true"></div>

          <select
            className="expense-select"
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setCopied(false) }}
          >
            <option value="">I work in...</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance & Accounting">Finance &amp; Accounting</option>
            <option value="Operations & Supply Chain">Operations &amp; Supply Chain</option>
            <option value="HR & People">HR &amp; People</option>
            <option value="Strategy & Corporate Development">Strategy &amp; Corporate Development</option>
            <option value="Product & Project Management">Product &amp; Project Management</option>
            <option value="Other">Other</option>
          </select>

          {template ? (
            <div className="expense-template-wrap">
              <div className="expense-template-box">
                <p className="expense-template-subject"><strong>Subject:</strong> {template.subject}</p>
                <pre className="expense-template-body">{template.body}</pre>
              </div>
              <div className="expense-copy-row">
                <button
                  className={`expense-copy-btn${copied ? ' copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <svg className="expense-copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="expense-copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="expense-placeholder">
              Select a job function to see your template.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
