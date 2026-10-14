const PROGRAM_PICK_LATER_CHECKOUT_URL =
  'https://www.joinleland.com/checkout?offering=fda10884-e355-4751-95fe-78a921804e76&cohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a7cebc6e425705fa14adbb7)'

export const ENROLL_URLS = {
  1: PROGRAM_PICK_LATER_CHECKOUT_URL,
  2: PROGRAM_PICK_LATER_CHECKOUT_URL,
  3: PROGRAM_PICK_LATER_CHECKOUT_URL,
  4: PROGRAM_PICK_LATER_CHECKOUT_URL,
  5: PROGRAM_PICK_LATER_CHECKOUT_URL,
}

export const COURSE_COHORTS = {
  1: [
    { label: 'July 14 (Utah In-Person)', iso: '2026-07-14-utah', scheduleDays: 'Tuesdays & Fridays · In person in Utah', sessionTimes: { tuesday: '12pm PT / 1pm MT', friday: '12pm PT / 1pm MT' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a4e7860642598c0e564e73e)', soldOut: true },
    { label: 'July 21',  iso: '2026-07-21', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '3pm PT / 6pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231ba2455a49d4abda3c39)', soldOut: true },
    { label: 'August 4', iso: '2026-08-04', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '2pm PT / 5pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231e65e0ed35ab57e2820e)', soldOut: true },
    { label: 'August 17', iso: '2026-08-17', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '4pm PT / 7pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a231fa5e0ed35ab57e28232)', soldOut: true },
    { label: 'September 1',  iso: '2026-09-01', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '12pm PT / 3pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a4fd3ad5c417da5103a1abd)', soldOut: true },
    { label: 'September 14', iso: '2026-09-14', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '2pm PT / 5pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a51144504bd393e57d03958)', soldOut: true },
    { label: 'October 5', iso: '2026-10-05', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '12pm PT / 3pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a511527100f60fd68b8fb51)', soldOut: true },
    { label: 'October 19', iso: '2026-10-19', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '2pm PT / 5pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a51165104bd393e57d0397c)' },
    { label: 'November 2', iso: '2026-11-02', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '12pm PT / 3pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6a69077397de3ed8feceec1f)' },
    { label: 'November 16', iso: '2026-11-16', scheduleDays: 'Mondays & Thursdays · No sessions Thanksgiving week', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '12pm PT / 3pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6ac92aa8513db10108cda5f2)' },
    { label: 'December 7', iso: '2026-12-07', scheduleDays: 'Mondays & Thursdays', sessionTimes: { morning: '8am PT / 11am ET', afternoon: '12pm PT / 3pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69af7e391104a7bb1cbf5715%2C6ac92b02ecff5dc86fa80b90)' },
  ],
  2: [
    { label: 'June 8',   iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '5pm PT / 8pm ET', thursday: '5pm PT / 8pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C69f52df1cf3c823ab47ecd16)', soldOut: true },
    { label: 'July 21',  iso: '2026-07-21', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '10am PT / 1pm ET', friday: '10am PT / 1pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a232210455a49d4abda3c91)', soldOut: true },
    { label: 'August 4', iso: '2026-08-04', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '12pm PT / 3pm ET', friday: '12pm PT / 3pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a23232e455a49d4abda3c9d)', soldOut: true },
    { label: 'August 17', iso: '2026-08-17', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '2pm PT / 5pm ET', thursday: '2pm PT / 5pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b075e725e910e72d636723%2C6a2324f5e0ed35ab57e28294)', soldOut: true },
  ],
  3: [
    { label: 'June 8',   iso: '2026-06-08', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '4pm PT / 7pm ET', thursday: '4pm PT / 7pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C69b199d0f61c38f9e9bbf7f5)', soldOut: true },
    { label: 'August 3', iso: '2026-08-03', scheduleDays: 'Mondays & Thursdays', sessionTimes: { monday: '12pm PT / 3pm ET', thursday: '12pm PT / 3pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a2326fd455a49d4abda3d0c)', soldOut: true },
    { label: 'September 15', iso: '2026-09-15', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '8am PT / 11am ET', friday: '8am PT / 11am ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a0e389d129db847ae4d17f9)', soldOut: true },
    { label: 'October 6', iso: '2026-10-06', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '8am PT / 11am ET', friday: '8am PT / 11am ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b1962de91acb3ef5f65986%2C6a511c7f04bd393e57d039f7)', soldOut: true },
  ],
  4: [
    { label: 'October 20', iso: '2026-10-20', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '8am PT / 11am ET', friday: '8am PT / 11am ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196b9f61c38f9e9bb316e%2C69e5259f1ac8f0ca2eba2107)' },
  ],
  5: [
    { label: 'September 1',  iso: '2026-09-01', scheduleDays: 'Tuesdays & Fridays', sessionTimes: { tuesday: '12pm PT / 3pm ET', friday: '12pm PT / 3pm ET' }, enrollUrl: 'https://www.joinleland.com/checkout?bootcampCohort=urn%3AbootcampCohort%3A(urn%3Abootcamp%3A69b196abf61c38f9e9bb2b9a%2C69e525cefe0055e715a6a025)', soldOut: true },
  ],
}

// MDT = UTC-6
export const SESSION_SCHEDULES = {
  1: [
    { label: 'Jul 21, 2026', time: '9:00 AM or 4:00 PM MDT', iso: '2026-07-21T15:00:00Z' },
    { label: 'Jul 24, 2026', time: '9:00 AM or 4:00 PM MDT', iso: '2026-07-24T15:00:00Z' },
    { label: 'Jul 28, 2026', time: '9:00 AM or 4:00 PM MDT', iso: '2026-07-28T15:00:00Z' },
    { label: 'Jul 31, 2026', time: '9:00 AM or 4:00 PM MDT', iso: '2026-07-31T15:00:00Z' },
  ],
  2: [
    { label: 'Jul 21, 2026', time: '11:00 AM MDT', iso: '2026-07-21T17:00:00Z' },
    { label: 'Jul 24, 2026', time: '11:00 AM MDT', iso: '2026-07-24T17:00:00Z' },
    { label: 'Jul 28, 2026', time: '11:00 AM MDT', iso: '2026-07-28T17:00:00Z' },
    { label: 'Jul 31, 2026', time: '11:00 AM MDT', iso: '2026-07-31T17:00:00Z' },
  ],
  3: [
    { label: 'Aug 3, 2026',  time: '1:00 PM MDT', iso: '2026-08-03T19:00:00Z' },
    { label: 'Aug 6, 2026',  time: '1:00 PM MDT', iso: '2026-08-06T19:00:00Z' },
    { label: 'Aug 10, 2026', time: '1:00 PM MDT', iso: '2026-08-10T19:00:00Z' },
    { label: 'Aug 13, 2026', time: '1:00 PM MDT', iso: '2026-08-13T19:00:00Z' },
  ],
  4: [
    { label: 'Oct 20, 2026', time: '9:00 AM MDT', iso: '2026-10-20T15:00:00Z' },
    { label: 'Oct 23, 2026', time: '9:00 AM MDT', iso: '2026-10-23T15:00:00Z' },
    { label: 'Oct 27, 2026', time: '9:00 AM MDT', iso: '2026-10-27T15:00:00Z' },
    { label: 'Oct 30, 2026', time: '9:00 AM MDT', iso: '2026-10-30T15:00:00Z' },
  ],
  5: [
    { label: 'Sep 1, 2026',  time: '1:00 PM MDT', iso: '2026-09-01T19:00:00Z' },
    { label: 'Sep 4, 2026',  time: '1:00 PM MDT', iso: '2026-09-04T19:00:00Z' },
    { label: 'Sep 8, 2026',  time: '1:00 PM MDT', iso: '2026-09-08T19:00:00Z' },
    { label: 'Sep 11, 2026', time: '1:00 PM MDT', iso: '2026-09-11T19:00:00Z' },
  ],
}

export const courseData = {
  1: {
    id: 1,
    name: 'Use AI to 10x Your Impact',
    badge: 'Level 1 of 5',
    nextCohort: 'Jul 21 – Jul 31, 2026',
    cohortDates: ['July 14 (Utah in-person)', 'July 21', 'August 4', 'August 17', 'September 1'],
    heroHeadline: 'Go beyond chatbots and build AI that works like you.',
    heroSubheadline:
      "In 4 core sessions over 2 weeks, you'll go from AI user to AI builder: a research workflow, a data model, a daily automation, and a writing system that sounds like you.",
    ableToBlurb: 'build AI skills and workflows that automate research, communication, and analysis.',
    whoItsFor:
      "You use ChatGPT or Claude every day to draft, summarize, and ask questions, but you haven't connected AI to your other tools or built anything that runs on its own yet.",
    whyHeadline: 'Build an AI foundation for your work in 2 weeks',
    skillPills: ['Data analysis', 'Email and communication', 'Slide design', 'Vibe coding', 'Research and synthesis', 'Workflow automation', 'Report generation', 'Client communication', 'Project management', 'Content creation', 'Financial modeling', 'Strategic planning'],
    saveTimeCopy: 'Automate your work and multiply your impact',
    toolsSectionHeadline: 'Build an AI foundation for your work in 2 weeks',
    tools: ['OpenAI', 'Claude', 'Gemini', 'Perplexity', 'Cursor', 'n8n'],
    topics: ['Data analysis', 'Planning', 'Organization', 'Email and communication', 'Slide design', 'Vibe coding'],
    whatYoullBuild: [
      'An AI context file that makes every AI output feel like you wrote it',
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
          'AI context files: giving your AI persistent memory of how you work',
          'AI skills: what they are and how to create one',
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
        title: 'Build a Real Product with World-Class Design',
        description: 'Create a new product in 90 minutes, without writing a line of code, using a design system that you love.',
        concepts: 'AI ecosystems and surfaces (Chat vs. Cowork vs. Code), choosing the right model for a job, vibe coding, extracting design DNA from an inspiration site, turning design DNA into a reusable skill.',
        build: 'A custom-designed portfolio website you vibe-code from scratch using your own design system.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Automate Communication in Your Voice',
        description: 'Connect your tools, teach AI how you write, build an email manager that runs on a schedule, and start building a custom automation for your own work.',
        concepts: 'Connecting tools to AI (MCPs / tool connectors), prompt engineering vs. context engineering, building a personal voice guide, scheduled automations, scoping a first custom workflow.',
        build: 'Connected tools plus a scheduled email manager that drafts replies in your voice every morning.',
      },
      {
        title: 'Analyze Data and Design Presentations That Build Themselves',
        description: 'Go from a raw spreadsheet to clean insights and a polished, animated slide deck, no formulas or design tools required.',
        concepts: 'Prompt chaining for analysis, cleaning and synthesizing data with AI, structuring a narrative before you design, AI-built data visualizations, slide design with Claude Design.',
        build: 'A spreadsheet-to-insights workflow and a polished, on-brand slide deck built from raw data.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Launch Your Custom AI System + Demo Day',
        description: 'Continue personalizing your AI system and show the cohort what you built.',
        concepts: 'Crafting a personal AI context file, creating reusable AI skills, folder organization in the age of AI, using AI to document and summarize your own work.',
        build: 'A deployed personal AI system (context file + skill library + organized working folder + updated portfolio) demoed live to your cohort.',
      },
    ],
    faqs: [
      { q: 'Do I need to know how to code?', a: 'No. Everything in this course uses natural language and no-code tools.' },
      { q: 'What AI tools will I use?', a: "Claude, Claude Desktop, and basic MCP connectors. We'll also introduce n8n in the final session." },
      { q: 'What if I already use ChatGPT every day?', a: 'Good starting point. This course will take you well beyond what most daily ChatGPT users know how to do.' },
      { q: 'How long is each session?', a: '90 minutes, live. All sessions are recorded if you can\'t attend.' },
      { q: 'How is the course structured?', a: '4 core sessions over 2 weeks, plus 2 optional Build Workshops with functional experts and weekly office hours. As an enrollee, you also get access to every Build Workshop we run for the next year.' },
      { q: "Can I take this course if I'm not technical?", a: 'Yes. This course is specifically designed for non-technical knowledge workers.' },
      { q: 'What if I fall behind?', a: "You can retake for a full year. Catch up at your own pace." },
      { q: 'What do I walk away with?', a: 'A working AI system you built yourself: a custom-designed product, an analysis and presentation workflow, an inbox automation, and a daily-use AI workflow tailored to your job.' },
    ],
    nextCourse: 2,
    nextCourseName: 'Build Complex Agentic Workflows',
  },

  2: {
    id: 2,
    name: 'Build Complex Agentic Workflows',
    badge: 'Level 2 of 5',
    nextCohort: 'Jul 21 – Jul 31, 2026',
    cohortDates: ['July 21', 'August 4', 'August 17'],
    heroHeadline: 'Eliminate manual work with a team of specialized agents.',
    heroSubheadline:
      "In 4 core sessions over 2 weeks, you'll build a toolkit of specialized agents and finish with a full pipeline that goes from first message to sale with no manual steps.",
    ableToBlurb: 'build agents and agent teams that complete multi-step processes across tools.',
    whoItsFor:
      "You've tried AI coding tools in the terminal, MCP connectors, or automated workflow builders, but you haven't built specialized agents or workflows for most of your work yet.",
    whyHeadline: 'Build AI agents that do your work for you',
    skillPills: ['Agent design', 'Workflow automation', 'CRM automation', 'Customer outreach', 'Data pipelines', 'Research pipelines', 'System integration', 'Conditional triggers', 'Batch processing', 'Multi-step workflows', 'Monitoring and alerts', 'Agent specialization'],
    saveTimeCopy: 'Replace manual workflows with agents that never stop',
    toolsSectionHeadline: 'Build specialized AI agents for your work in 2 weeks',
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
        title: 'Build and Ship Your Automation Roadmap',
        description: 'Map where your time goes, build an AI automation roadmap, and deploy it as an interactive dashboard.',
        concepts: 'AI context files and your project config folder, time audits, tool connectors, the AI Builder Loop, vibe coding as a development approach, auto-loading design skills.',
        build: 'An AI automation roadmap and an interactive AI automation dashboard you deploy to builders.leland.ai.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Build a Cloud-Based Agentic Workflow and QA System',
        description: 'Use n8n to design an agentic communication manager workflow that auto-responds to messages for you.',
        concepts: 'Workflow nodes (triggers, fetches, AI categorizers), wiring agent nodes with JSON, agents vs. prompts, MCPs and API keys, classification evals, LLM-as-judge, evals vs. rubrics, the improvement loop.',
        build: 'An n8n email manager workflow running in the cloud plus an eval system that scores its drafts before they reach you.',
      },
      {
        title: 'Build Your Second Brain with AI',
        description: 'Give your AI the domain knowledge it needs to run your automations well.',
        concepts: 'Picking what your AI needs to know (in-context vs. wiki vs. connected tools vs. RAG), domain-specific knowledge wikis, using PRDs and specs to brief AI on automations.',
        build: 'A 5+ article knowledge wiki integrated into your email workflow.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Build Custom Agentic Automations + Demo Day',
        description: 'Collaborate with AI to create custom automations that pull from real data, then show the cohort what you built.',
        concepts: 'Claude Code routines vs. n8n, context engineering for specialized agents, the agentic workflow architecture (Trigger → Triage → Branch → Output), defining and scoping an automation MVP.',
        build: 'A calendar-triggered meeting follow-up bot built in two harnesses (Claude Code routine + n8n), a custom automation MVP scoped to your own work, plus a Demo Day presentation across all four builds.',
      },
    ],
    faqs: [
      { q: "What's the difference between this and Course 1?", a: "Course 1 teaches you to use AI tools and build basic workflows. Course 2 teaches you to build agents: AI that decides what to do next, not just follows instructions." },
      { q: 'Do I need to complete Course 1 first?', a: "Only if you haven't built anything with AI tools yet. If you've used Claude Desktop, tried n8n, or built a basic workflow, you're ready." },
      { q: 'How is the course structured?', a: '4 core sessions over 2 weeks, plus 2 optional Build Workshops with functional experts and weekly office hours. As an enrollee, you also get access to every Build Workshop we run for the next year.' },
      { q: 'Will I need to write code?', a: "Minimal. Some sessions use Claude Code for simple tasks but no programming background is required." },
      { q: 'What tools will I use?', a: 'Claude, Claude Desktop, MCP connectors, and n8n for the pipeline capstone.' },
      { q: "What's an agent team?", a: "Two or more agents with specialized roles that pass work between them. You'll build your first one and ship a full pipeline by Demo Day." },
      { q: 'How is this different from just using ChatGPT with plugins?', a: "Plugins respond to your prompts. Agents decide their own next steps toward a goal. That's the core difference." },
      { q: 'What do I walk away with?', a: 'A live automation roadmap, an automation advisor with your context, a cloud-based agentic workflow running in production, and an eval system that scores its outputs.' },
      { q: 'Can I take Courses 1 and 2 back-to-back?', a: 'Yes. Many students do Course 1 in one cohort and Course 2 in the next.' },
    ],
    nextCourse: 3,
    nextCourseName: 'Create Autonomous Agents',
  },

  3: {
    id: 3,
    name: 'Create Autonomous Agents',
    badge: 'Level 3 of 5',
    nextCohort: 'Aug 3 – Aug 13, 2026',
    cohortDates: ['August 3', 'September 15', 'October 6'],
    heroHeadline: 'You\'ve built great agents. Now make them run autonomously.',
    heroSubheadline:
      "In 4 core sessions over 2 weeks, you'll build systems that trigger automatically, run in the background, and operate 24/7, with no manual step between you and the output.",
    ableToBlurb: 'compose agents and automations into systems that trigger and run without human initiation.',
    whoItsFor:
      "You have at least one agent or workflow running on its own, but your automations don't yet operate as a unified system, and you're still the one deciding when most things run.",
    whyHeadline: 'Build AI systems that run autonomously, around the clock',
    skillPills: ['Autonomous systems', 'Background automation', 'Scheduling and cron', 'Error handling', 'Multi-tool orchestration', 'Headless agents', 'Phone-triggered automations', 'Always-on agents', 'Monitoring and alerting', 'System recovery', 'Team-shared agents', 'Overnight prep'],
    saveTimeCopy: 'Run your work 24/7 while you focus on what matters',
    toolsSectionHeadline: 'Build AI systems that run without you in 2 weeks',
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
        title: 'Build Your Agentic Operating System',
        description: 'Set up your agent tool and create the foundational context files of your agentic operating system.',
        concepts: 'The 2026 agent ecosystem (Hermes, OpenClaw, Claude Code, Managed Agents, Codex, Gemini CLI, n8n) and when each fits, the agentic loop (Perceive → Plan → Act → Reflect), the 4-layer agent OS (identity, context, skills, memory), API key security, principle of least privilege, blast radius.',
        build: 'Your agent installed and booted, a messaging gateway live (Telegram or Slack), identity and context shaped, and the agent connected to its own Gmail and Calendar.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Build Your First Subagents',
        description: 'Get better, broader output by training your agent to spin up specialist subagents for research and other specific tasks.',
        concepts: 'Reading agent traces end-to-end (like reading stack traces), when to add a subagent vs. a skill, per-subagent permissions, failure modes, prompt injection across agent boundaries.',
        build: 'A research subagent and a role-specific subagent handing work back to your Chief of Staff.',
      },
      {
        title: 'Strengthen Your Agents with Skills, Tools, and Context',
        description: 'Scope what your agent owns, expand context to cover your real work, and connect the tools it needs to do that work.',
        concepts: 'Thin harness, fat skills; agent scope as a job description (3–5 jobs, not a task list); file-based memory; the resolver pattern; three ways to connect tools (native OAuth, MCP, Composio).',
        build: 'A scoped Chief of Staff agent with a CHARTER.md, 6–8 context files, 2–3 connected work tools, and a RESOLVER.md with routing rules.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Evaluate Your Agent + Demo Day',
        description: "Create a rubric and evals, wire an action logging system, and run tests to improve your agent until you're ready to deploy, then demo what you built.",
        concepts: 'The trust gradient (read-only → write-with-approval → autonomous), trigger types (scheduled / webhook / event-driven), approval gates, three ways to grade agent outputs (deterministic, LLM-as-judge, human), token cost monitoring.',
        build: 'Your agent deployed to the cloud, a 3–5 dimension eval rubric scoring real outputs, one tool flipped to write-with-approval, plus a 3-minute Demo Day walkthrough of one end-to-end moment.',
      },
    ],
    faqs: [
      { q: "What's an agent operating system?", a: "The foundation your autonomous agents run on: execution environment, persistent context, tool connections, and the patterns that let agents act without supervision." },
      { q: 'How is the course structured?', a: '4 core sessions over 2 weeks, plus 2 optional Build Workshops with functional experts and weekly office hours. As an enrollee, you also get access to every Build Workshop we run for the next year.' },
      { q: 'Will I need to use Python?', a: 'Some sessions introduce Python as an option for more control. n8n and other no-code tools cover the same concepts without code.' },
      { q: "What's the difference between Course 2 and Course 3?", a: "Course 2 teaches you to build great agents you run manually. Course 3 makes those agents run automatically: on schedules, on triggers, without you initiating them." },
      { q: 'What tools will I use?', a: 'n8n, Claude, MCP connectors, and optionally Python for the agent operating system session.' },
      { q: "What does 'auto-approve' mean?", a: "It's the graduation moment: your agents have proven safe enough that you let them act without per-step approval. The course ends with you earning that status with your own system." },
      { q: 'What do I walk away with?', a: 'A live autonomous agent system: a custom agent OS, a set of autonomous agents with defined goals, deployed and tool-connected, running on full auto-approve.' },
    ],
    nextCourse: 4,
    nextCourseName: 'Build Your Agent Workforce',
  },

  4: {
    id: 4,
    name: 'Build Your Agent Workforce',
    badge: 'Level 4 of 5',
    nextCohort: 'Oct 20 – Oct 30, 2026',
    cohortDates: ['October 20'],
    heroHeadline: 'Build AI that manages AI.',
    heroSubheadline:
      "In 4 core sessions over 2 weeks, you'll design systems where agents coordinate, delegate, evaluate each other's work, and run full business processes from trigger to done.",
    ableToBlurb: 'design orchestrated multi-agent pipelines with delegation, evals, and quality gates.',
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
        title: 'Scope Your AI Employee',
        description: "Map your workflows, decide what belongs in each agent's domain, and architect a multi-agent system.",
        concepts: 'When multi-agent wins vs. a single agent, the 6 orchestration patterns, domain mapping, interface specs between agents.',
        build: 'An agent team architecture document (domain map + orchestration pattern + interface spec) and an orchestrator scaffolded in Claude Code.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Build Your Orchestrated Pipeline',
        description: 'Wire your first real multi-agent system, connecting multiple specialized agents, coordinated by an orchestrator that decomposes tasks and routes work.',
        concepts: 'Orchestrator + subagent patterns, fan-out / fan-in execution, shared context across agents, assembled results, first-pass multi-agent observability.',
        build: 'An orchestrated pipeline (orchestrator + 2–3 specialized subagents) with parallel execution and a first observability view of the multi-agent system.',
      },
      {
        title: 'Host and Deploy Your Agent',
        description: 'Set up your messaging gateway and host your agent system in the cloud so it runs without your laptop open.',
        concepts: 'Hosting options for agent systems, messaging gateways, cloud deployment, least-privilege access, secrets management, audit trails.',
        build: 'Your orchestrated pipeline deployed to the cloud with a live messaging gateway and an access control layer (least-privilege + secrets + audit trails).',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Configure Recursive Improvement Loops + Demo Day',
        description: 'Use persistence and memory to get your system to improve itself over time, then demo what you built.',
        concepts: 'Persistence and memory across runs, self-improvement loops, goal drift, context loss, unbounded spawning, fallback design, runbook authoring for a multi-agent system.',
        build: 'An agent team with memory and a recursive improvement loop, documented with failure fallbacks and a complete runbook, demoed live running autonomously.',
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
    nextCourseName: 'Design Your AI Orchestration Layer',
  },

  5: {
    id: 5,
    name: 'Design Your AI Orchestration Layer',
    badge: 'Level 5 of 5',
    nextCohort: 'Sep 1 – Sep 11, 2026',
    cohortDates: ['September 1'],
    heroHeadline: 'Build a system that runs a business function and improves itself.',
    heroSubheadline:
      "In 4 core sessions over 2 weeks, you'll build a fully autonomous AI team that sources, acts, self-corrects, and improves over time, with you setting direction and reviewing exceptions.",
    ableToBlurb: 'build goal-directed systems with memory, self-correction, and autonomous improvement loops.',
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
        title: 'Build Your Manager Agent',
        description: "Design and build one agent that coordinates your entire agent team, routes work to the right agent, monitors what's running, and escalates edge cases.",
        concepts: 'Orchestration topology, manager agent responsibilities, routing logic, escalation design.',
        build: 'A manager agent with routing logic and escalation rules that coordinates your entire agent team.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Make Your Agents Proactive',
        description: 'Your agents identify their own sub-goals, take initiative, and adapt their approach based on feedback.',
        concepts: 'Reactive vs. proactive agent design, goal decomposition, long-horizon planning, checkpointing for resumability, goal drift detection.',
        build: 'Agent specs rebuilt around goal decomposition, a long-horizon task running with daily checkpoints, and goal drift detection wired in.',
      },
      {
        title: 'Build a Self-Improving System',
        description: 'Your manager agent watches performance, identifies weak agents, and triggers improvements.',
        concepts: 'LLM-as-judge layers, sycophancy cascades, calibration of AI judges, detect → diagnose → fix → re-evaluate loops, automated improvement logging.',
        build: 'An LLM-as-judge evaluation layer and an automated improvement loop where the manager agent updates other agents’ prompts based on performance.',
      },
      {
        title: 'Build Workshop (Optional)',
        description: 'Optional workshop with a functional expert across marketing, sales, finance, ops, or another role to go deeper on a specific tool, skill, or build.',
        optional: true,
      },
      {
        title: 'Graduate to Full Abstraction + Demo Day',
        description: "Document your complete agentic OS, define what you're still responsible for, and demo the whole system from manager agent down to individual workers.",
        concepts: 'Autonomy boundary mapping, governance docs (audit trails, rollback, escalation, team scaling), full-system documentation.',
        build: 'Full agentic OS documentation plus a system governance doc, and a Demo Day where your manager agent orchestrates the team live.',
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
  { id: 1, name: 'Use AI to 10x Your Impact', nextCohort: 'Jul 21 – Jul 31', whoShort: "You use AI chatbots to draft and summarize, but haven't built anything that runs on its own." },
  { id: 2, name: 'Build Complex Agentic Workflows', nextCohort: 'Jul 21 – Jul 31', whoShort: "You've tried AI coding tools or workflow builders, but haven't built specialized agents for most tasks." },
  { id: 3, name: 'Create Autonomous Agents', nextCohort: 'Aug 3 – Aug 13', whoShort: "You've built multiple AI agents, but they don't run autonomously." },
  { id: 4, name: 'Build Your Agent Workforce', nextCohort: 'Oct 20 – Oct 30', whoShort: "You have multiple autonomous agents running, but they don't operate as a unified system." },
  { id: 5, name: 'Design Your AI Orchestration Layer', nextCohort: 'Sep 1 – Sep 11', whoShort: "You've built and shipped AI systems, but they don't proactively iterate toward a goal." },
]
