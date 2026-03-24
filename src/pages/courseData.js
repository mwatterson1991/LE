export const ENROLL_URLS = {
  1: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C69af7ea5b3a78d3ad6852270)',
  2: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69b1ed8141a6783685016ed0)',
  3: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69b1ee1b8bd54088517f2b3b)',
  4: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69bd6f92ca371b83aa557c0c)',
  5: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69bd70a2ca371b83aa558f1c)',
}

// MDT = UTC-6
export const SESSION_SCHEDULES = {
  1: [
    { label: 'Apr 21, 2026', time: '3:00 PM MDT', iso: '2026-04-21T21:00:00Z' },
    { label: 'Apr 24, 2026', time: '9:00 AM MDT', iso: '2026-04-24T15:00:00Z' },
    { label: 'Apr 28, 2026', time: '3:00 PM MDT', iso: '2026-04-28T21:00:00Z' },
    { label: 'May 1, 2026',  time: '9:00 AM MDT', iso: '2026-05-01T15:00:00Z' },
    { label: 'May 5, 2026',  time: '3:00 PM MDT', iso: '2026-05-05T21:00:00Z' },
    { label: 'May 8, 2026',  time: '9:00 AM MDT', iso: '2026-05-08T15:00:00Z' },
  ],
  2: [
    { label: 'Apr 21, 2026', time: '5:00 PM MDT', iso: '2026-04-21T23:00:00Z' },
    { label: 'Apr 24, 2026', time: '11:00 AM MDT', iso: '2026-04-24T17:00:00Z' },
    { label: 'Apr 28, 2026', time: '5:00 PM MDT', iso: '2026-04-28T23:00:00Z' },
    { label: 'May 1, 2026',  time: '11:00 AM MDT', iso: '2026-05-01T17:00:00Z' },
    { label: 'May 5, 2026',  time: '5:00 PM MDT', iso: '2026-05-05T23:00:00Z' },
    { label: 'May 8, 2026',  time: '11:00 AM MDT', iso: '2026-05-08T17:00:00Z' },
  ],
  3: [
    { label: 'May 19, 2026', time: '3:00 PM MDT', iso: '2026-05-19T21:00:00Z' },
    { label: 'May 22, 2026', time: '9:00 AM MDT', iso: '2026-05-22T15:00:00Z' },
    { label: 'May 26, 2026', time: '3:00 PM MDT', iso: '2026-05-26T21:00:00Z' },
    { label: 'May 29, 2026', time: '9:00 AM MDT', iso: '2026-05-29T15:00:00Z' },
    { label: 'Jun 2, 2026',  time: '3:00 PM MDT', iso: '2026-06-02T21:00:00Z' },
    { label: 'Jun 5, 2026',  time: '9:00 AM MDT', iso: '2026-06-05T15:00:00Z' },
  ],
  4: [
    { label: 'Jun 16, 2026', time: '3:00 PM MDT', iso: '2026-06-16T21:00:00Z' },
    { label: 'Jun 19, 2026', time: '9:00 AM MDT', iso: '2026-06-19T15:00:00Z' },
    { label: 'Jun 23, 2026', time: '9:00 AM MDT', iso: '2026-06-23T15:00:00Z' },
    { label: 'Jun 26, 2026', time: '3:00 PM MDT', iso: '2026-06-26T21:00:00Z' },
    { label: 'Jun 30, 2026', time: '9:00 AM MDT', iso: '2026-06-30T15:00:00Z' },
    { label: 'Jul 3, 2026',  time: '3:00 PM MDT', iso: '2026-07-03T21:00:00Z' },
  ],
  5: [
    { label: 'Jul 14, 2026', time: '9:00 AM MDT', iso: '2026-07-14T15:00:00Z' },
    { label: 'Jul 17, 2026', time: '3:00 PM MDT', iso: '2026-07-17T21:00:00Z' },
    { label: 'Jul 21, 2026', time: '9:00 AM MDT', iso: '2026-07-21T15:00:00Z' },
    { label: 'Jul 24, 2026', time: '3:00 PM MDT', iso: '2026-07-24T21:00:00Z' },
    { label: 'Jul 28, 2026', time: '9:00 AM MDT', iso: '2026-07-28T15:00:00Z' },
    { label: 'Jul 31, 2026', time: '3:00 PM MDT', iso: '2026-07-31T21:00:00Z' },
  ],
}

export const courseData = {
  1: {
    id: 1,
    name: 'Use AI to Work 10x Faster',
    badge: 'Level 1 of 5',
    nextCohort: 'Apr 21 – May 8, 2026',
    cohortDates: ['April 21', 'May 19', 'June 16', 'July 14', 'August 11'],
    heroHeadline: 'Go beyond chatbots and build AI that works like you.',
    heroSubheadline:
      "In 6 sessions, you'll go from AI user to AI builder: a research workflow, a data model, a daily automation, and a writing system that sounds like you.",
    whoItsFor:
      "You use ChatGPT or Claude every day to draft, summarize, and ask questions, but you haven't connected AI to your other tools or built anything that runs on its own yet.",
    whyHeadline: 'Build an AI foundation for your work in 3 weeks',
    skillPills: ['Data analysis', 'Email and communication', 'Slide design', 'Vibe coding', 'Research and synthesis', 'Workflow automation', 'Report generation', 'Client communication', 'Project management', 'Content creation', 'Financial modeling', 'Strategic planning'],
    saveTimeCopy: 'Automate your work and multiply your impact',
    toolsSectionHeadline: 'Build an AI foundation for your work in 3 weeks',
    tools: ['OpenAI', 'Claude', 'Gemini', 'Perplexity', 'Cursor', 'n8n'],
    topics: ['Data analysis', 'Planning', 'Organization', 'Email and communication', 'Slide design', 'Vibe coding'],
    whatYoullBuild: [
      'A CLAUDE.md context file that makes every AI output feel like you wrote it',
      'A slide deck built from raw notes in under a minute',
      'A market research workflow you run on any topic',
      'A data workflow that turns a spreadsheet into a shareable report',
      'A lead or news finder that runs every morning without you',
      'A daily digest of anything you care about, delivered automatically',
      'A writing system trained on your voice and style',
      'An agent that researches, writes, and delivers personalized outreach',
      'A prompt library organized for the tasks you do most',
      'A time audit that tells you exactly where AI can save you hours',
    ],
    whatYoullLearn: [
      {
        col: [
          'Iterative and chain prompting',
          'Context windows and how to manage them',
          'claude.md: your persistent AI context file',
          'Claude Skills: what they are and how to create one',
        ],
      },
      {
        col: [
          'Tool selection framework',
          'AI for documents, data, and research',
          'MCP connectors: your first connection',
          'Data sanitization: working with real data safely without needing IT approval',
        ],
      },
      {
        col: [
          'Building your first repeatable AI workflow',
          'Prompt chaining and triggers',
        ],
      },
    ],
    sessions: [
      {
        title: 'Transform How You Work Forever',
        concepts: 'Context files, iterative prompting, claude.md, tool overview',
        build: 'AI context file + notes-to-slides system',
        example: "Build Fawnly's brand context file and turn product brief notes into a pitch deck",
      },
      {
        title: 'Let AI Research and Synthesize for You',
        concepts: 'Chain prompting, research workflows, source synthesis',
        build: 'Market research workflow on any topic',
        example: 'Run a competitive analysis on DTC skincare brands',
      },
      {
        title: 'Analyze Data in Minutes, Not Hours',
        concepts: 'Data sanitization, AI for spreadsheets, structured output',
        build: 'Workflow that turns raw data into a shareable report',
        example: "Turn Fawnly's monthly sales data into an executive summary with charts",
      },
      {
        title: 'Build a Workflow That Runs Daily',
        concepts: 'MCP connectors, triggers, automated sourcing',
        build: 'Lead or news finder that runs every morning',
        example: 'Build a morning brief that surfaces new DTC brand launches and investor activity',
      },
      {
        title: 'Make Every Output Sound Like You',
        concepts: 'Voice training, prompt personalization, time audits',
        build: 'Time audit + writing system trained on your voice',
        example: "Build Fawnly's brand voice guide and a writing agent that drafts in that tone",
      },
      {
        title: 'Build an End-to-End Process Workflow',
        concepts: 'Agent design, research + write + send loops, tool chaining',
        build: 'Agent that researches, writes, and delivers outreach',
        example: "Build an agent that finds influencers, researches their content, and drafts a partnership pitch",
      },
    ],
    faqs: [
      { q: 'Do I need to know how to code?', a: 'No. Everything in this course uses natural language and no-code tools.' },
      { q: 'What AI tools will I use?', a: "Claude, Claude Desktop, and basic MCP connectors. We'll also introduce n8n in the final session." },
      { q: 'What if I already use ChatGPT every day?', a: 'Good starting point. This course will take you well beyond what most daily ChatGPT users know how to do.' },
      { q: 'How long is each session?', a: '90 minutes, live. All sessions are recorded if you can\'t attend.' },
      { q: "What's the Fawnly example?", a: "All sessions include a parallel example using Fawnly, a fictional DTC skincare brand, so you can follow along even without your own work context ready." },
      { q: "Can I take this course if I'm not technical?", a: 'Yes. This course is specifically designed for non-technical knowledge workers.' },
      { q: 'What if I fall behind?', a: "You can retake for a full year. Catch up at your own pace." },
      { q: 'What do I walk away with?', a: '6 working deliverables: a slide deck system, a research workflow, a data model, a lead finder, a voice guide, and an end-to-end outreach agent.' },
    ],
    nextCourse: 2,
    nextCourseName: 'Build Agents That Work for You',
  },

  2: {
    id: 2,
    name: 'Build Agents That Work for You',
    badge: 'Level 2 of 5',
    nextCohort: 'Apr 21 – May 8, 2026',
    cohortDates: ['April 21', 'May 19', 'June 16', 'July 14'],
    heroHeadline: 'Eliminate manual work with a team of specialized agents.',
    heroSubheadline:
      "In 6 sessions, you'll build a toolkit of specialized agents and finish with a full pipeline that goes from first message to sale with no manual steps.",
    whoItsFor:
      "You've tried AI coding tools in the terminal, MCP connectors, or automated workflow builders, but you haven't built specialized agents or workflows for most of your work yet.",
    whyHeadline: 'Build AI agents that do your work for you',
    skillPills: ['Agent design', 'Workflow automation', 'CRM automation', 'Customer outreach', 'Data pipelines', 'Research pipelines', 'System integration', 'Conditional triggers', 'Batch processing', 'Multi-step workflows', 'Monitoring and alerts', 'Agent specialization'],
    saveTimeCopy: 'Replace manual workflows with agents that never stop',
    toolsSectionHeadline: 'Build specialized AI agents for your work in 3 weeks',
    tools: ['Claude', 'n8n', 'Cursor', 'Make', 'Zapier', 'Python'],
    topics: ['Automation', 'Customer outreach', 'Research pipelines', 'Data sync', 'Agent design', 'Workflow building'],
    whatYoullBuild: [
      'A team of research agents that analyze a problem from multiple angles',
      'A writing agent that gathers context, writes, and sends messages for you',
      'An agent that reads and updates your systems on its own',
      'An agent that watches for conditions and reacts when they\'re met',
      'A team of agents that execute a full process with no manual input',
      'A full pipeline that autonomously goes from first message to sale',
      'A CRM-connected agent that logs every interaction without you touching it',
      'A multi-step workflow that spans 3+ tools without breaking',
      'An agent specialization map for your most repeated job tasks',
    ],
    whatYoullLearn: [
      {
        col: [
          'What makes something an agent vs. a prompt vs. an automation',
          'Goal-directed behavior and reasoning loops',
          "How to read an agent's reasoning trace",
          'The Trust Gradient',
        ],
      },
      {
        col: [
          'Agent memory and persistent context',
          'Voice consistency at scale',
          'MCP tool connections: read and write side effects',
          'Condition-based monitoring and approval flows',
        ],
      },
      {
        col: [
          'Batch processing and structured output design',
          'Agent specialization',
          'Agent-to-agent handoffs',
        ],
      },
    ],
    sessions: [
      {
        title: 'Ship Your First Agent Team',
        concepts: 'Agent vs. prompt, goal-directed behavior, reasoning traces',
        build: 'Research agent team analyzing a problem from multiple angles',
        example: "Three agents analyze Fawnly's market from investor, competitor, and customer angles",
      },
      {
        title: 'Build a Writing Agent That Acts for You',
        concepts: 'Context gathering, voice consistency, send side effects',
        build: 'Writing agent that gathers context, drafts, and sends',
        example: "Agent drafts and sends influencer outreach emails using Fawnly's voice guide",
      },
      {
        title: 'Give Your Agent Real Tools',
        concepts: 'MCP read/write, system updates, Trust Gradient',
        build: 'Agent that reads and updates your systems autonomously',
        example: "Agent reads Fawnly's CRM, updates deal stages, and logs next steps",
      },
      {
        title: 'Build an Agent That Watches and Decides',
        concepts: 'Condition monitoring, approval flows, reactive agents',
        build: 'Agent that monitors for a trigger and acts when conditions are met',
        example: 'Agent watches for new competitor product launches and alerts with a recommended response',
      },
      {
        title: 'Build an Agent Team That Executes at Scale',
        concepts: 'Batch processing, structured output, agent specialization',
        build: 'Agent team that runs a repetitive process with no manual input',
        example: 'Agent team processes 50 influencer profiles and outputs a ranked shortlist',
      },
      {
        title: 'Ship a Full Agent Pipeline',
        concepts: 'Agent-to-agent handoffs, end-to-end automation',
        build: 'Full pipeline from first message to sale with no manual steps',
        example: 'Pipeline that turns an inbound inquiry into a proposal, follow-up, and closed deal',
      },
    ],
    faqs: [
      { q: "What's the difference between this and Course 1?", a: "Course 1 teaches you to use AI tools and build basic workflows. Course 2 teaches you to build agents: AI that decides what to do next, not just follows instructions." },
      { q: 'Do I need to complete Course 1 first?', a: "Only if you haven't built anything with AI tools yet. If you've used Claude Desktop, tried n8n, or built a basic workflow, you're ready." },
      { q: 'Will I need to write code?', a: "Minimal. Some sessions use Claude Code for simple tasks but no programming background is required." },
      { q: 'What tools will I use?', a: 'Claude, Claude Desktop, MCP connectors, and n8n for the pipeline capstone.' },
      { q: "What's an agent team?", a: "Two or more agents with specialized roles that pass work between them. You'll build your first one in Session 1 and a full pipeline by Session 6." },
      { q: 'How is this different from just using ChatGPT with plugins?', a: "Plugins respond to your prompts. Agents decide their own next steps toward a goal. That's the core difference." },
      { q: 'What do I walk away with?', a: '6 working agents: a research team, a writing agent, a tool-connected agent, a monitoring agent, a batch agent, and a full end-to-end pipeline.' },
      { q: 'Can I take Courses 1 and 2 back-to-back?', a: 'Yes. Many students do Course 1 in one cohort and Course 2 in the next.' },
    ],
    nextCourse: 3,
    nextCourseName: 'Create Autonomous Systems',
  },

  3: {
    id: 3,
    name: 'Create Autonomous Systems',
    badge: 'Level 3 of 5',
    nextCohort: 'May 19 – Jun 5, 2026',
    cohortDates: ['May 19', 'June 16', 'July 14'],
    heroHeadline: 'You\'ve built great agents. Now make them run autonomously.',
    heroSubheadline:
      "In 6 sessions, you'll build systems that trigger automatically, run in the background, and operate 24/7, with no manual step between you and the output.",
    whoItsFor:
      "You have at least one agent or workflow running on its own, but your automations don't yet operate as a unified system, and you're still the one deciding when most things run.",
    whyHeadline: 'Build AI systems that run autonomously, around the clock',
    skillPills: ['Autonomous systems', 'Background automation', 'Scheduling and cron', 'Error handling', 'Multi-tool orchestration', 'Headless agents', 'Phone-triggered automations', 'Always-on agents', 'Monitoring and alerting', 'System recovery', 'Team-shared agents', 'Overnight prep'],
    saveTimeCopy: 'Run your work 24/7 while you focus on what matters',
    toolsSectionHeadline: 'Build AI systems that run without you in 3 weeks',
    tools: ['Claude', 'n8n', 'Python', 'Cron', 'Webhooks', 'APIs'],
    topics: ['Autonomous systems', 'Scheduling', 'Error handling', 'Monitoring', 'Orchestration', 'Background agents'],
    whatYoullBuild: [
      'A headless agent you can trigger from your phone to act on your computer',
      'A multi-step workflow that connects 5+ tools and fixes its own errors',
      'An always-on agent that manages a repetitive task 24/7',
      'An agent team that monitors a signal and acts the moment a problem arises',
      'A scheduled agent team that runs backlog, research, and prep work overnight',
      "A shared live agent running in the background across your team's workflows",
      'A phone-triggered automation that runs complex tasks without opening a laptop',
      'A self-healing pipeline that retries, fixes, and only escalates when stuck',
      'An overnight prep agent that has your priorities ready when you wake up',
    ],
    whatYoullLearn: [
      {
        col: [
          'Headless agents and phone-triggered automations',
          'n8n, Python, and persistent agent architectures',
          'Multi-tool orchestration across 5+ tools',
          'Data transformation between systems',
        ],
      },
      {
        col: [
          'Idempotency and self-healing error handling',
          'Always-on agent design',
          'Proactive vs. reactive agent teams',
        ],
      },
      {
        col: [
          'Scheduled overnight agent runs',
          'Shared multi-user agent design',
          'OpenClaw and similar persistent agent tools',
        ],
      },
    ],
    sessions: [
      {
        title: 'Build a Headless Agent You Control From Your Phone',
        concepts: 'Headless agents, phone triggers, remote execution',
        build: 'Agent triggered from phone that acts on your computer',
        example: "Text a command and Fawnly's social agent drafts and queues posts without opening a laptop",
      },
      {
        title: 'Build a Multi-Step Workflow That Fixes Its Own Errors',
        concepts: 'Multi-tool orchestration, error handling, idempotency',
        build: 'Workflow connecting 5+ tools that retries and fixes its own errors',
        example: 'Order fulfillment workflow that spans Shopify, email, CRM, Slack, and inventory, with auto-retry on failure',
      },
      {
        title: 'Build an Always-On Agent That Never Stops Working',
        concepts: 'Persistent agents, 24/7 design, task management',
        build: 'Agent managing a repetitive task around the clock',
        example: 'Agent that processes customer returns, logs them, and triggers refunds, day and night',
      },
      {
        title: 'Build an Agent Team That Acts Before You Notice a Problem',
        concepts: 'Signal monitoring, proactive action, alerting',
        build: 'Agent team that watches for a condition and acts immediately',
        example: "Agent team that spots a negative review spike and drafts a response before anyone notices",
      },
      {
        title: 'Build an Agent Team That Runs Overnight',
        concepts: 'Scheduled runs, overnight batch work, background prep',
        build: 'Scheduled agent team that runs backlog and research overnight',
        example: "Overnight agent that processes the day's orders, runs next-day research, and has reports ready by 9am",
      },
      {
        title: 'Build a Shared Agent Your Whole Team Uses',
        concepts: 'Multi-user agent design, shared state, team access',
        build: 'Live agent shared across multiple team members',
        example: "Fawnly's entire team uses one Slack-connected agent to pull data, run reports, and execute tasks on demand",
      },
    ],
    faqs: [
      { q: "What's a headless agent?", a: "An agent that runs on your machine or a remote server with no visible interface. You control it by texting it from your phone." },
      { q: 'Will I need to use Python?', a: 'One session introduces Python as an option for more control. n8n covers the same concepts without code.' },
      { q: "What's the difference between Course 2 and Course 3?", a: "Course 2 teaches you to build great agents you run manually. Course 3 makes those agents run automatically: on schedules, on triggers, without you initiating them." },
      { q: 'What tools will I use?', a: 'n8n, Claude, MCP connectors, and optionally Python or OpenClaw for the headless agent session.' },
      { q: "What does 'proactive' mean for an agent team?", a: "The team monitors signals and acts before you notice a problem, rather than waiting for you to trigger it." },
      { q: 'How complex does the multi-tool workflow get?', a: 'Up to 5+ tools in a single workflow, with automatic retry on failure and alerting if the retry also fails.' },
      { q: "What's the shared agent session?", a: "You'll build an agent that lives in a team Slack channel and handles requests from multiple team members using the same live data." },
      { q: 'What do I walk away with?', a: '6 live systems: a phone-triggered headless agent, a self-healing multi-tool workflow, an always-on monitoring agent, a proactive agent team, an overnight scheduled run, and a shared team agent.' },
    ],
    nextCourse: 4,
    nextCourseName: 'Design Multi-Agent Systems',
  },

  4: {
    id: 4,
    name: 'Design Multi-Agent Systems',
    badge: 'Level 4 of 5',
    nextCohort: 'Jun 16 – Jul 3, 2026',
    cohortDates: ['June 16', 'July 14', 'August 11'],
    heroHeadline: 'Build AI that manages AI.',
    heroSubheadline:
      "In 6 sessions, you'll design systems where agents coordinate, delegate, evaluate each other's work, and run full business processes from trigger to done.",
    whoItsFor:
      "You have multiple automations or agents running, but they don't talk to each other and don't operate as a unified system.",
    whyHeadline: 'Design AI systems where agents coordinate and self-improve',
    skillPills: ['Multi-agent design', 'Orchestration', 'Goal-directed agents', 'Automated evaluation', 'Quality scoring', 'Observability', 'Self-correction', 'Task delegation', 'Rubric design', 'QA layers', 'Human checkpoints', 'End-to-end testing'],
    saveTimeCopy: 'Coordinate AI systems that get smarter over time',
    toolsSectionHeadline: 'Design multi-agent systems that coordinate and self-improve',
    tools: ['Claude', 'n8n', 'Python', 'Claude Code', 'Vector DB', 'Evals'],
    topics: ['Multi-agent design', 'Automated evaluation', 'Orchestration', 'Quality scoring', 'Observability', 'Self-correction'],
    whatYoullBuild: [
      "A goal-directed 'AI employee' that collaborates with your team to hit its weekly target",
      'An automated scoring system that grades every agent output before it reaches you',
      'An agent that finds what\'s broken in a tool you built, fixes it, and proves the fix worked',
      'An orchestrator that assigns tasks in a complex job to best-fit specialist agents',
      'A monitoring layer that intercepts bad outputs before they reach your users',
      'A coordinated multi-agent system that runs a full business process from trigger to done',
      'A rubric-based eval system that scores outputs against your own quality standards',
      'A QA agent that runs end-to-end tests on your pipeline before you ship',
      'A shared-state multi-agent system where agents delegate and hand off tasks',
    ],
    whatYoullLearn: [
      {
        col: [
          'Goal-directed agents vs. scripted agents',
          'Planning loops and autonomous decision-making',
          'Rubric design and automated evaluation (evals)',
          'Agents as builders: improving software toward a goal',
        ],
      },
      {
        col: [
          'Orchestrator and subagent patterns',
          'Shared state and task delegation',
          'QA layers and output quality scoring',
          'Observability and alerting',
        ],
      },
      {
        col: [
          'Human checkpoints by design',
          'End-to-end testing of a multi-agent pipeline',
        ],
      },
    ],
    sessions: [
      {
        title: 'Build Your First AI Employee',
        concepts: 'Goal-directed agents, planning loops, autonomous decision-making',
        build: 'Agent with a weekly quota and daily reporting cadence',
        example: "Agent given a weekly sales target: plans its own outreach, executes, and checks in daily",
      },
      {
        title: 'Build an Eval System',
        concepts: 'Rubric design, automated scoring, quality thresholds',
        build: 'Scoring system that grades every agent output before it reaches you',
        example: 'Every piece of Fawnly copy gets auto-scored on tone, clarity, and brand fit before anyone reviews it',
      },
      {
        title: 'Build an Agent That Improves Software',
        concepts: 'Agents as builders, self-testing, iterative improvement',
        build: 'Agent that finds bugs, fixes them, and verifies the fix',
        example: "Agent audits Fawnly's onboarding flow, identifies broken steps, patches them, and runs a test to confirm",
      },
      {
        title: 'Build an Orchestration Layer',
        concepts: 'Orchestrator patterns, subagent delegation, task routing',
        build: 'Orchestrator that routes tasks to specialist agents',
        example: 'Marketing orchestrator that routes campaigns to copy, design, targeting, and scheduling specialists',
      },
      {
        title: 'Build a QA Layer for Your System',
        concepts: 'Output interception, quality gates, alerting',
        build: 'Monitoring layer that catches bad outputs before they reach users',
        example: 'QA agent intercepts all outbound emails, checks for brand violations, and holds anything that fails',
      },
      {
        title: 'Ship a Goal-Directed Delivery System',
        concepts: 'End-to-end testing, human checkpoints, pipeline observability',
        build: 'Coordinated multi-agent system running a complete business process',
        example: 'Full campaign pipeline: brief in, strategy, copy, review, schedule, send, with a human approval gate at step 3',
      },
    ],
    faqs: [
      { q: "What's an eval system?", a: "A set of criteria and an automated scorer that grades every agent output, so you know if an agent is doing a good job without reading every output yourself." },
      { q: "What's an orchestrator?", a: "An agent that manages other agents: it receives a high-level goal, breaks it into subtasks, delegates to specialized subagents, and assembles the final result." },
      { q: 'How is this different from Course 3?', a: "Course 3 makes your agents run automatically. Course 4 makes them coordinate: working together as a system, checking each other's work, and pursuing goals without step-by-step instructions." },
      { q: 'Do I need to complete Course 3 first?', a: 'You should have at least one or two working agents or automations before starting. Course 3 is the recommended path in, but prior agent experience from other tools also qualifies.' },
      { q: 'Will I write code?', a: 'Some sessions use Python or Claude Code for agent-to-agent communication. No deep engineering background required.' },
      { q: "What's the 'AI employee' session?", a: "You'll give an agent a weekly quota, a set of tools, and a reporting cadence, and let it plan its own approach, execute autonomously, and check in with your team daily." },
      { q: 'What do I walk away with?', a: 'A goal-directed agent, an eval system, an agent that improves your own tools, an orchestrator, a QA layer, and a full coordinated multi-agent system.' },
      { q: "Is this course right for me if I'm not building software?", a: "Yes. The eval, orchestration, and QA sessions apply directly to marketing pipelines, research systems, and content operations, not just software." },
    ],
    nextCourse: 5,
    nextCourseName: 'Ship AI Systems That Scale',
  },

  5: {
    id: 5,
    name: 'Ship AI Systems That Scale',
    badge: 'Level 5 of 5',
    nextCohort: 'Jul 14 – Jul 31, 2026',
    cohortDates: ['July 14', 'August 11'],
    heroHeadline: 'Build a system that runs a business function and improves itself.',
    heroSubheadline:
      "In 6 sessions, you'll build a fully autonomous AI team that sources, acts, self-corrects, and improves over time, with you setting direction and reviewing exceptions.",
    whoItsFor:
      "You've built and shipped AI systems that run in production, but they don't proactively iterate, pursue long-horizon goals, or improve themselves from corrections.",
    whyHeadline: 'Ship production AI systems that proactively pursue your goals',
    skillPills: ['Production deployment', 'RAG architecture', 'Long-horizon goals', 'Checkpointing', 'Self-correction', 'Feedback loops', 'Autonomous operations', 'Live ops dashboards', 'Anomaly detection', 'Self-improving systems', 'System observability', 'Continuous improvement'],
    saveTimeCopy: 'Ship systems that compound and improve themselves',
    toolsSectionHeadline: 'Ship AI systems that run in production and improve themselves',
    tools: ['Claude Code', 'Python', 'n8n', 'RAG', 'Vector DB', 'Monitoring'],
    topics: ['Production deployment', 'Long-horizon goals', 'Self-correction', 'Autonomous ops', 'Observability', 'Continuous improvement'],
    whatYoullBuild: [
      'A knowledge base your agents search in real time, built from your actual docs',
      'An autonomous agent running a multi-day campaign with daily checkpoints',
      'An agent that writes and ships code improvements toward a target, testing its own work',
      'A system wired to catch its own failures, retry, and only page you when stuck',
      'A live ops dashboard showing agent health, output quality, and when to step in',
      'A fully autonomous AI team that runs a business function and improves itself',
      'A RAG pipeline grounded in your company\'s real documents and history',
      'A long-horizon agent that resumes mid-goal after interruption',
      'A self-improving system that logs every override and learns from corrections',
    ],
    whatYoullLearn: [
      {
        col: [
          'RAG: embeddings, chunking, semantic search, knowledge base design',
          'Long-horizon planning and goal persistence',
          'Checkpointing: saving state so an agent can resume',
          'Managing drift in long-running agents',
        ],
      },
      {
        col: [
          'Agents that build and test software autonomously',
          'Self-testing loops and review gates',
          'Feedback loops: using human overrides as training signal',
          'Correction logging and self-correction design',
        ],
      },
      {
        col: [
          'System-level KPIs and anomaly detection',
          'Escalation logic',
          'Full autonomous operations design',
        ],
      },
    ],
    sessions: [
      {
        title: 'Give Your Agents Institutional Memory',
        concepts: 'RAG, embeddings, chunking, semantic search',
        build: 'Knowledge base your agents query in real time',
        example: "All of Fawnly's product docs, customer history, and brand guidelines, searchable by any agent in the system",
      },
      {
        title: 'Build an Agent That Works Toward a Long-Horizon Goal',
        concepts: 'Multi-day planning, checkpointing, goal persistence',
        build: 'Autonomous agent running a multi-day campaign with daily checkpoints',
        example: 'Agent runs a 5-day influencer campaign: plans day 1, executes, checkpoints progress, adapts on day 3',
      },
      {
        title: 'Build an Agent That Builds and Tests Software',
        concepts: 'Agents building software, self-testing, iterative shipping',
        build: 'Agent that writes and ships code improvements toward a target',
        example: "Agent that improves Fawnly's checkout flow conversion rate: writes the change, tests it, ships it",
      },
      {
        title: 'Build a System That Self-Corrects',
        concepts: 'Failure detection, retry logic, escalation, feedback loops',
        build: 'System that catches its own failures, retries, and escalates only when stuck',
        example: "Fawnly's fulfillment system catches failed orders, retries automatically, and only pages a human after 3 attempts",
      },
      {
        title: 'Evaluate a System You\'re Not Watching',
        concepts: 'System KPIs, anomaly detection, observability, alerting',
        build: 'Live dashboard showing agent health, quality scores, and when to intervene',
        example: "Fawnly's ops team sees every agent's status, last output quality score, and open exceptions in one view",
      },
      {
        title: 'Ship a Fully Autonomous AI Team',
        concepts: 'Full autonomous operations design, self-improvement, correction logging',
        build: 'Fully autonomous AI team that runs a business function and improves itself',
        example: "Fawnly's entire marketing function, sourcing, writing, testing, shipping, and learning, runs autonomously with one human reviewing exceptions daily",
      },
    ],
    faqs: [
      { q: "What's RAG?", a: "Retrieval-Augmented Generation: a way to give agents access to your real documents and history so their outputs are grounded in your actual context, not just general knowledge." },
      { q: "What makes an agent 'long-horizon'?", a: "It works toward a goal that takes multiple days, checkpoints its progress so it can resume, and surfaces blockers rather than failing silently." },
      { q: "What's self-correction?", a: "A system that detects when its own output fails an eval threshold, retries with a revised approach, and escalates to a human only if the retry also fails." },
      { q: 'Do I need to be an engineer to take this course?', a: 'No, but you should have completed Course 4 or have equivalent experience building multi-agent systems. This is the most technical course in the program.' },
      { q: "What's the live ops dashboard?", a: "A real-time view of your entire autonomous system: agent health, output quality scores, self-correction events, goal progress, and anomalies, with alerts that tell you when to look, not just what happened." },
      { q: "What does 'improves itself' mean?", a: "Every time a human overrides an agent decision, that correction is logged and used to improve future outputs. The system learns from you without retraining." },
      { q: 'What tools will I use?', a: 'Claude, n8n, Python, Claude Code, and a vector database for the RAG session.' },
      { q: 'What do I walk away with?', a: 'A full autonomous AI team: a knowledge base, a long-horizon agent, a self-building software agent, a self-correcting feedback system, a live dashboard, and an integrated autonomous system running a business function.' },
    ],
    nextCourse: null,
    nextCourseName: null,
  },
}

export const allCourses = [
  { id: 1, name: 'Use AI to Work 10x Faster', nextCohort: 'Apr 21 – May 8', whoShort: "You use AI chatbots to draft and summarize, but haven't built anything that runs on its own." },
  { id: 2, name: 'Build Agents That Work for You', nextCohort: 'Apr 21 – May 8', whoShort: "You've tried AI coding tools or workflow builders, but haven't built specialized agents for most tasks." },
  { id: 3, name: 'Create Autonomous Systems', nextCohort: 'May 19 – Jun 5', whoShort: "You've built multiple AI agents, but they don't run autonomously." },
  { id: 4, name: 'Design Multi-Agent Systems', nextCohort: 'Jun 16 – Jul 3', whoShort: "You have multiple autonomous agents running, but they don't operate as a unified system." },
  { id: 5, name: 'Ship AI Systems That Scale', nextCohort: 'Jul 14 – Jul 31', whoShort: "You've built and shipped AI systems, but they don't proactively iterate toward a goal." },
]
